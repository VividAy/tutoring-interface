import { prisma } from "@/lib/prisma";
import { ACHIEVEMENT_CATALOG, SESSION_CODES, type SessionCode } from "@/lib/achievements";
import { formatHours } from "@/lib/format";
import { CSV_BLANK, csvRow, generatedOn, isoDate, slugify } from "@/lib/csv";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    ACHIEVEMENT_CATALOG.map((c) => [c.id, `${c.letter}. ${c.title}`])
  ),
  other: "E. Other",
};

function codeLabel(code: string | null): string {
  if (!code) return "";
  const meaning = SESSION_CODES[code as SessionCode];
  return meaning ? `${code} — ${meaning}` : code;
}

function monthRange(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

// ---------- Per-student monthly report ----------

export type MonthlyReportSession = {
  date: Date;
  hours: number;
  code: string | null;
  note: string | null;
};

export type MonthlyReportAchievement = {
  categoryLabel: string;
  label: string;
  attainedAt: Date;
};

export type MonthlyReport = {
  tutorName: string;
  studentName: string;
  site: string | null;
  days: string | null;
  times: string | null;
  year: number;
  month: number; // 1-12
  monthLabel: string; // "September 2026"
  sessions: MonthlyReportSession[];
  totalHours: number;
  sessionsHeld: number;
  taCount: number;
  saCount: number;
  hCount: number;
  achievements: MonthlyReportAchievement[];
  stopped: boolean;
  stoppedReason: string | null;
  stoppedAt: Date | null;
};

export async function buildMonthlyReport(
  studentId: string,
  year: number,
  month: number
): Promise<MonthlyReport | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { tutor: true, sessions: true, achievements: true },
  });
  if (!student) return null;

  const { start, end } = monthRange(year, month);

  const sessions = student.sessions
    .filter((s) => s.date >= start && s.date < end)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((s) => ({ date: s.date, hours: s.hours, code: s.code, note: s.note }));

  const totalHours = sessions.reduce((h, s) => h + (s.code ? 0 : s.hours), 0);
  const sessionsHeld = sessions.filter((s) => !s.code).length;
  const taCount = sessions.filter((s) => s.code === "TA").length;
  const saCount = sessions.filter((s) => s.code === "SA").length;
  const hCount = sessions.filter((s) => s.code === "H").length;

  const achievements = student.achievements
    .filter(
      (a): a is typeof a & { attainedAt: Date } =>
        a.attainedAt !== null && a.attainedAt >= start && a.attainedAt < end
    )
    .sort((a, b) => a.attainedAt.getTime() - b.attainedAt.getTime())
    .map((a) => ({
      categoryLabel: CATEGORY_LABELS[a.category] ?? a.category,
      label: a.label,
      attainedAt: a.attainedAt,
    }));

  return {
    tutorName: student.tutor.name,
    studentName: student.name,
    site: student.site,
    days: student.days,
    times: student.times,
    year,
    month,
    monthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
    sessions,
    totalHours,
    sessionsHeld,
    taCount,
    saCount,
    hCount,
    achievements,
    stopped: student.stopped,
    stoppedReason: student.stoppedReason,
    stoppedAt: student.stoppedAt,
  };
}

export function reportToCsv(report: MonthlyReport): string {
  const lines: string[] = [];

  lines.push(csvRow(["Literacy Volunteers of America, Essex/Passaic County"]));
  lines.push(csvRow(["Student Monthly Tutoring Report"]));
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Tutor", report.tutorName]));
  lines.push(csvRow(["Student", report.studentName]));
  lines.push(csvRow(["Tutoring Site", report.site ?? "—"]));
  lines.push(csvRow(["Schedule", [report.days, report.times].filter(Boolean).join(" · ") || "—"]));
  lines.push(csvRow(["Reporting Month", report.monthLabel]));
  lines.push(csvRow(["Report Generated", generatedOn()]));
  if (report.stopped) {
    lines.push(
      csvRow([
        "Status",
        `Stopped${report.stoppedAt ? " " + isoDate(report.stoppedAt) : ""}${
          report.stoppedReason ? " — " + report.stoppedReason : ""
        }`,
      ])
    );
  }
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Session Detail"]));
  lines.push(csvRow(["Date", "Hours", "Attendance Code", "Note"]));
  if (report.sessions.length === 0) {
    lines.push(csvRow(["No sessions logged this month."]));
  } else {
    for (const s of report.sessions) {
      lines.push(
        csvRow([
          isoDate(s.date),
          s.code ? "" : formatHours(s.hours),
          codeLabel(s.code),
          s.note ?? "",
        ])
      );
    }
  }
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Summary"]));
  lines.push(csvRow(["Total Hours", formatHours(report.totalHours)]));
  lines.push(csvRow(["Sessions Held", report.sessionsHeld]));
  lines.push(csvRow(["Tutor Absences (TA)", report.taCount]));
  lines.push(csvRow(["Student Absences (SA)", report.saCount]));
  lines.push(csvRow(["Holidays (H)", report.hCount]));
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Achievements Attained"]));
  if (report.achievements.length === 0) {
    lines.push(csvRow(["None this month."]));
  } else {
    lines.push(csvRow(["Date", "Category", "Achievement"]));
    for (const a of report.achievements) {
      lines.push(csvRow([isoDate(a.attainedAt), a.categoryLabel, a.label]));
    }
  }
  lines.push(CSV_BLANK);
  lines.push(csvRow(["Prepared via LVAEP Tutor Portal"]));

  return lines.join("");
}

export function reportFilename(report: MonthlyReport, ext: string): string {
  return `${slugify(report.studentName)}-${report.year}-${String(report.month).padStart(2, "0")}.${ext}`;
}

// ---------- Tutor-wide monthly report (all students combined) ----------

export type TutorMonthlySession = {
  studentName: string;
  date: Date;
  hours: number;
  code: string | null;
  note: string | null;
};

export type TutorMonthlyStudentSummary = {
  studentName: string;
  hours: number;
  sessionsHeld: number;
};

export type TutorMonthlyAchievement = {
  studentName: string;
  categoryLabel: string;
  label: string;
  attainedAt: Date;
};

export type TutorMonthlyReport = {
  tutorName: string;
  tutorEmail: string | null;
  year: number;
  month: number;
  monthLabel: string;
  studentCount: number;
  activeStudentCount: number;
  sessions: TutorMonthlySession[];
  studentSummaries: TutorMonthlyStudentSummary[];
  totalHours: number;
  totalSessionsHeld: number;
  taCount: number;
  saCount: number;
  hCount: number;
  achievements: TutorMonthlyAchievement[];
};

export async function buildTutorMonthlyReport(
  tutorId: string,
  year: number,
  month: number
): Promise<TutorMonthlyReport | null> {
  const tutor = await prisma.tutor.findUnique({
    where: { id: tutorId },
    include: {
      students: {
        orderBy: { name: "asc" },
        include: { sessions: true, achievements: true },
      },
    },
  });
  if (!tutor) return null;

  const { start, end } = monthRange(year, month);

  const sessions: TutorMonthlySession[] = [];
  const studentSummaries: TutorMonthlyStudentSummary[] = [];
  const achievements: TutorMonthlyAchievement[] = [];

  for (const student of tutor.students) {
    const studentSessions = student.sessions.filter(
      (s) => s.date >= start && s.date < end
    );
    const studentHours = studentSessions.reduce(
      (h, s) => h + (s.code ? 0 : s.hours),
      0
    );
    const studentSessionsHeld = studentSessions.filter((s) => !s.code).length;

    if (studentSessions.length > 0) {
      studentSummaries.push({
        studentName: student.name,
        hours: studentHours,
        sessionsHeld: studentSessionsHeld,
      });
    }

    for (const s of studentSessions) {
      sessions.push({
        studentName: student.name,
        date: s.date,
        hours: s.hours,
        code: s.code,
        note: s.note,
      });
    }

    for (const a of student.achievements) {
      if (a.attainedAt && a.attainedAt >= start && a.attainedAt < end) {
        achievements.push({
          studentName: student.name,
          categoryLabel: CATEGORY_LABELS[a.category] ?? a.category,
          label: a.label,
          attainedAt: a.attainedAt,
        });
      }
    }
  }

  sessions.sort(
    (a, b) =>
      a.date.getTime() - b.date.getTime() ||
      a.studentName.localeCompare(b.studentName)
  );
  studentSummaries.sort((a, b) => b.hours - a.hours || a.studentName.localeCompare(b.studentName));
  achievements.sort(
    (a, b) =>
      a.attainedAt.getTime() - b.attainedAt.getTime() ||
      a.studentName.localeCompare(b.studentName)
  );

  const totalHours = sessions.reduce((h, s) => h + (s.code ? 0 : s.hours), 0);
  const totalSessionsHeld = sessions.filter((s) => !s.code).length;
  const taCount = sessions.filter((s) => s.code === "TA").length;
  const saCount = sessions.filter((s) => s.code === "SA").length;
  const hCount = sessions.filter((s) => s.code === "H").length;

  return {
    tutorName: tutor.name,
    tutorEmail: tutor.email,
    year,
    month,
    monthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
    studentCount: tutor.students.length,
    activeStudentCount: tutor.students.filter((s) => !s.stopped).length,
    sessions,
    studentSummaries,
    totalHours,
    totalSessionsHeld,
    taCount,
    saCount,
    hCount,
    achievements,
  };
}

export function tutorReportToCsv(report: TutorMonthlyReport): string {
  const lines: string[] = [];

  lines.push(csvRow(["Literacy Volunteers of America, Essex/Passaic County"]));
  lines.push(csvRow(["Tutor Monthly Activity Report"]));
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Tutor", report.tutorName]));
  if (report.tutorEmail) lines.push(csvRow(["Email", report.tutorEmail]));
  lines.push(csvRow(["Reporting Month", report.monthLabel]));
  lines.push(csvRow(["Report Generated", generatedOn()]));
  lines.push(
    csvRow([
      "Students on Roster",
      `${report.activeStudentCount} active of ${report.studentCount} total`,
    ])
  );
  lines.push(
    csvRow(["Students With Activity This Month", report.studentSummaries.length])
  );
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Summary — All Students Combined"]));
  lines.push(csvRow(["Total Hours", formatHours(report.totalHours)]));
  lines.push(csvRow(["Total Sessions Held", report.totalSessionsHeld]));
  lines.push(csvRow(["Tutor Absences (TA)", report.taCount]));
  lines.push(csvRow(["Student Absences (SA)", report.saCount]));
  lines.push(csvRow(["Holidays (H)", report.hCount]));
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Hours by Student"]));
  if (report.studentSummaries.length === 0) {
    lines.push(csvRow(["No student activity logged this month."]));
  } else {
    lines.push(csvRow(["Student", "Hours", "Sessions Held"]));
    for (const s of report.studentSummaries) {
      lines.push(csvRow([s.studentName, formatHours(s.hours), s.sessionsHeld]));
    }
  }
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Session Detail — All Students"]));
  if (report.sessions.length === 0) {
    lines.push(csvRow(["No sessions logged this month."]));
  } else {
    lines.push(csvRow(["Date", "Student", "Hours", "Attendance Code", "Note"]));
    for (const s of report.sessions) {
      lines.push(
        csvRow([
          isoDate(s.date),
          s.studentName,
          s.code ? "" : formatHours(s.hours),
          codeLabel(s.code),
          s.note ?? "",
        ])
      );
    }
  }
  lines.push(CSV_BLANK);

  lines.push(csvRow(["Achievements Attained — All Students"]));
  if (report.achievements.length === 0) {
    lines.push(csvRow(["None this month."]));
  } else {
    lines.push(csvRow(["Date", "Student", "Category", "Achievement"]));
    for (const a of report.achievements) {
      lines.push(
        csvRow([isoDate(a.attainedAt), a.studentName, a.categoryLabel, a.label])
      );
    }
  }
  lines.push(CSV_BLANK);
  lines.push(csvRow(["Prepared via LVAEP Tutor Portal"]));

  return lines.join("");
}

export function tutorReportFilename(report: TutorMonthlyReport, ext: string): string {
  return `${slugify(report.tutorName)}-all-students-${report.year}-${String(report.month).padStart(2, "0")}.${ext}`;
}
