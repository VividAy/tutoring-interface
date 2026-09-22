"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { findCatalogItem, type SessionCode } from "@/lib/achievements";
import {
  ADMIN_COOKIE,
  ADMIN_PASSWORD,
  SESSION_COOKIE_OPTS,
  makeToken,
  tutorCookieName,
} from "@/lib/auth";
import { defaultTutorPassword } from "@/lib/password";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

// ---------- Access gate ----------

export type AuthState = { error?: string };

export async function unlockTutor(
  tutorId: string,
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = str(formData, "password");
  const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
  if (!tutor || password !== tutor.password) {
    return { error: "Incorrect password. Try again." };
  }
  const jar = await cookies();
  jar.set(tutorCookieName(tutorId), makeToken(`tutor:${tutorId}`), SESSION_COOKIE_OPTS);
  return {};
}

export async function unlockAdmin(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = str(formData, "password");
  if (password !== ADMIN_PASSWORD) {
    return { error: "Incorrect password. Try again." };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, makeToken("admin"), SESSION_COOKIE_OPTS);
  return {};
}

export async function lockTutor(tutorId: string) {
  const jar = await cookies();
  jar.delete(tutorCookieName(tutorId));
}

export async function lockAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

// ---------- Tutors ----------

export async function createTutor(formData: FormData) {
  const name = str(formData, "name");
  const email = str(formData, "email");
  if (!name) return;

  await prisma.tutor.create({
    data: { name, email: email || null, password: defaultTutorPassword(name) },
  });

  revalidatePath("/admin");
  revalidatePath("/tutor");
}

// ---------- Students ----------

export async function createStudent(formData: FormData) {
  const tutorId = str(formData, "tutorId");
  const name = str(formData, "name");
  const site = str(formData, "site");
  const days = str(formData, "days");
  const times = str(formData, "times");
  if (!tutorId || !name) return;

  await prisma.student.create({
    data: {
      tutorId,
      name,
      site: site || null,
      days: days || null,
      times: times || null,
    },
  });

  revalidatePath(`/tutor/${tutorId}`);
  revalidatePath(`/admin/tutors/${tutorId}`);
}

export async function updateStudentInfo(formData: FormData) {
  const studentId = str(formData, "studentId");
  const tutorId = str(formData, "tutorId");
  const site = str(formData, "site");
  const days = str(formData, "days");
  const times = str(formData, "times");
  if (!studentId) return;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      site: site || null,
      days: days || null,
      times: times || null,
    },
  });

  revalidatePath(`/tutor/${tutorId}/students/${studentId}`);
  revalidatePath(`/admin/tutors/${tutorId}`);
}

export async function setStudentStopped(formData: FormData) {
  const studentId = str(formData, "studentId");
  const tutorId = str(formData, "tutorId");
  const stopped = str(formData, "stopped") === "true";
  const reason = str(formData, "reason");
  if (!studentId) return;

  await prisma.student.update({
    where: { id: studentId },
    data: {
      stopped,
      stoppedReason: stopped ? reason || null : null,
      stoppedAt: stopped ? new Date() : null,
    },
  });

  revalidatePath(`/tutor/${tutorId}/students/${studentId}`);
  revalidatePath(`/tutor/${tutorId}`);
  revalidatePath(`/admin/tutors/${tutorId}`);
}

// ---------- Sessions ----------

export async function createSession(formData: FormData) {
  const studentId = str(formData, "studentId");
  const tutorId = str(formData, "tutorId");
  const dateStr = str(formData, "date");
  const hoursStr = str(formData, "hours");
  const code = str(formData, "code");
  const note = str(formData, "note");
  if (!studentId || !dateStr) return;

  const isCodeOnly = code === "TA" || code === "SA" || code === "H";
  const hours = isCodeOnly ? 0 : Math.max(0, parseFloat(hoursStr) || 0);

  await prisma.session.create({
    data: {
      studentId,
      date: new Date(`${dateStr}T12:00:00.000Z`),
      hours,
      code: isCodeOnly ? (code as SessionCode) : null,
      note: note || null,
    },
  });

  revalidatePath(`/tutor/${tutorId}/students/${studentId}`);
  revalidatePath(`/tutor/${tutorId}`);
  revalidatePath(`/admin/tutors/${tutorId}`);
}

export async function deleteSession(formData: FormData) {
  const sessionId = str(formData, "sessionId");
  const tutorId = str(formData, "tutorId");
  const studentId = str(formData, "studentId");
  if (!sessionId) return;

  await prisma.session.delete({ where: { id: sessionId } });

  revalidatePath(`/tutor/${tutorId}/students/${studentId}`);
  revalidatePath(`/tutor/${tutorId}`);
  revalidatePath(`/admin/tutors/${tutorId}`);
}

// ---------- Achievements ----------

export async function toggleCatalogAchievement(input: {
  studentId: string;
  tutorId: string;
  category: string;
  key: string;
  checked: boolean;
}) {
  const found = findCatalogItem(input.key);
  if (!found) return;

  if (input.checked) {
    await prisma.achievement.upsert({
      where: {
        studentId_category_key: {
          studentId: input.studentId,
          category: input.category,
          key: input.key,
        },
      },
      create: {
        studentId: input.studentId,
        category: input.category,
        key: input.key,
        label: found.item.label,
        attainedAt: new Date(),
      },
      update: {
        attainedAt: new Date(),
      },
    });
  } else {
    await prisma.achievement
      .delete({
        where: {
          studentId_category_key: {
            studentId: input.studentId,
            category: input.category,
            key: input.key,
          },
        },
      })
      .catch(() => {});
  }

  revalidatePath(`/tutor/${input.tutorId}/students/${input.studentId}`);
  revalidatePath(`/admin/tutors/${input.tutorId}`);
}

export async function addOtherAchievement(formData: FormData) {
  const studentId = str(formData, "studentId");
  const tutorId = str(formData, "tutorId");
  const label = str(formData, "label");
  if (!studentId || !label) return;

  await prisma.achievement.create({
    data: {
      studentId,
      category: "other",
      key: `other-${Date.now()}`,
      label,
      attainedAt: new Date(),
    },
  });

  revalidatePath(`/tutor/${tutorId}/students/${studentId}`);
  revalidatePath(`/admin/tutors/${tutorId}`);
}

export async function deleteAchievement(formData: FormData) {
  const achievementId = str(formData, "achievementId");
  const tutorId = str(formData, "tutorId");
  const studentId = str(formData, "studentId");
  if (!achievementId) return;

  await prisma.achievement.delete({ where: { id: achievementId } });

  revalidatePath(`/tutor/${tutorId}/students/${studentId}`);
  revalidatePath(`/admin/tutors/${tutorId}`);
}
