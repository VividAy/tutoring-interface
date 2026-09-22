import { PrismaClient } from "../src/generated/prisma/client";
import { ACHIEVEMENT_CATALOG } from "../src/lib/achievements";
import { defaultTutorPassword } from "../src/lib/password";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function catalogItem(categoryId: string, key: string) {
  const category = ACHIEVEMENT_CATALOG.find((c) => c.id === categoryId)!;
  const item = category.items.find((i) => i.key === key)!;
  return { category: category.id, key: item.key, label: item.label };
}

async function main() {
  await prisma.achievement.deleteMany();
  await prisma.session.deleteMany();
  await prisma.student.deleteMany();
  await prisma.tutor.deleteMany();

  const maria = await prisma.tutor.create({
    data: {
      name: "Maria Santos",
      email: "maria.santos@example.org",
      color: "#f5c518",
      password: defaultTutorPassword("Maria Santos"),
    },
  });
  const james = await prisma.tutor.create({
    data: {
      name: "James O'Connor",
      email: "james.oconnor@example.org",
      color: "#2f5aa8",
      password: defaultTutorPassword("James O'Connor"),
    },
  });
  const priya = await prisma.tutor.create({
    data: {
      name: "Priya Patel",
      email: "priya.patel@example.org",
      color: "#b45309",
      password: defaultTutorPassword("Priya Patel"),
    },
  });

  const luis = await prisma.student.create({
    data: {
      name: "Luis Fernandez",
      tutorId: maria.id,
      site: "Bloomfield Public Library",
      days: "Tue, Thu",
      times: "6:00–7:30 PM",
    },
  });
  const aisha = await prisma.student.create({
    data: {
      name: "Aisha Bello",
      tutorId: maria.id,
      site: "Bloomfield Public Library",
      days: "Mon, Wed",
      times: "5:00–6:00 PM",
    },
  });
  const wei = await prisma.student.create({
    data: {
      name: "Wei Chen",
      tutorId: james.id,
      site: "Passaic County Branch",
      days: "Sat",
      times: "10:00 AM–12:00 PM",
    },
  });
  const fatima = await prisma.student.create({
    data: {
      name: "Fatima Haidari",
      tutorId: james.id,
      site: "Passaic County Branch",
      days: "Wed",
      times: "4:00–5:30 PM",
    },
  });
  const carlos = await prisma.student.create({
    data: {
      name: "Carlos Mendez",
      tutorId: priya.id,
      site: "Bloomfield Public Library",
      days: "Fri",
      times: "1:00–2:30 PM",
    },
  });
  const nguyen = await prisma.student.create({
    data: {
      name: "Nguyen Tran",
      tutorId: priya.id,
      site: "Passaic County Branch",
      days: "Tue",
      times: "6:30–8:00 PM",
      stopped: true,
      stoppedReason: "Relocated out of county",
      stoppedAt: daysAgo(20),
    },
  });

  const sessionRows: { studentId: string; date: Date; hours: number; code: string | null; note: string | null }[] = [
    ...[62, 55, 48, 41, 34, 27, 20, 13, 6].map((d, i) => ({
      studentId: luis.id,
      date: daysAgo(d),
      hours: i === 2 ? 0 : 1.5,
      code: i === 2 ? "SA" : null,
      note: i === 2 ? "Called in sick" : i === 8 ? "Worked on GED practice reading section" : null,
    })),
    ...[58, 51, 44, 37, 30, 16, 9, 2].map((d, i) => ({
      studentId: aisha.id,
      date: daysAgo(d),
      hours: 1,
      code: null,
      note: i === 5 ? "Reviewed job application vocabulary" : null,
    })),
    ...[49, 42, 35, 28, 21, 7].map((d, i) => ({
      studentId: wei.id,
      date: daysAgo(d),
      hours: i === 4 ? 0 : 2,
      code: i === 4 ? "H" : null,
      note: null,
    })),
    ...[45, 38, 31, 24, 17, 10, 3].map((d) => ({
      studentId: fatima.id,
      date: daysAgo(d),
      hours: 1.5,
      code: null,
      note: null,
    })),
    ...[40, 33, 26, 19, 12, 5].map((d, i) => ({
      studentId: carlos.id,
      date: daysAgo(d),
      hours: i === 1 ? 0 : 1,
      code: i === 1 ? "TA" : null,
      note: null,
    })),
    ...[70, 63, 56].map((d) => ({
      studentId: nguyen.id,
      date: daysAgo(d),
      hours: 1,
      code: null,
      note: null,
    })),
  ];

  await prisma.session.createMany({ data: sessionRows });

  const achievementRows = [
    { studentId: luis.id, ...catalogItem("economic", "enter-employment"), attainedAt: daysAgo(20) },
    { studentId: luis.id, ...catalogItem("educational", "enter-postsecondary-education"), attainedAt: daysAgo(6) },
    { studentId: aisha.id, ...catalogItem("family", "read-to-children"), attainedAt: daysAgo(30) },
    { studentId: aisha.id, ...catalogItem("family", "visit-library"), attainedAt: daysAgo(9) },
    { studentId: wei.id, ...catalogItem("educational", "obtain-high-school-diploma"), attainedAt: daysAgo(21) },
    { studentId: fatima.id, ...catalogItem("societal", "achieve-civics-skills"), attainedAt: daysAgo(17) },
    { studentId: fatima.id, ...catalogItem("societal", "obtain-citizenship"), attainedAt: daysAgo(3) },
    { studentId: carlos.id, ...catalogItem("economic", "retain-employment"), attainedAt: daysAgo(12) },
    {
      studentId: carlos.id,
      category: "other",
      key: "other-1",
      label: "Passed practice driver's license exam",
      attainedAt: daysAgo(5),
    },
  ];

  await prisma.achievement.createMany({ data: achievementRows });

  console.log("Seeded 3 tutors, 6 students, sessions, and achievements.");
  console.log("Tutor passwords: maria123, james123, priya123. Admin password: admin123 (or $ADMIN_PASSWORD).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
