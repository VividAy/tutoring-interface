import PDFDocument from "pdfkit";
import type { MonthlyReport, TutorMonthlyReport } from "@/lib/report";
import { formatHours } from "@/lib/format";
import { SESSION_CODES, type SessionCode } from "@/lib/achievements";

const NAVY = "#1e3a8a";
const GOLD = "#c9a007";
const INK = "#1a1a1a";
const MUTED = "#5a5f68";
const RULE = "#d8dce3";

const MARGIN = 50;
const PAGE_BOTTOM = 742;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function codeLabel(code: string | null): string {
  if (!code) return "";
  const meaning = SESSION_CODES[code as SessionCode];
  return meaning ? `${code} — ${meaning}` : code;
}

type Column = { key: string; label: string; x: number; width: number };

function newDoc(): PDFKit.PDFDocument {
  return new PDFDocument({ size: "LETTER", margin: MARGIN });
}

function collect(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function contentWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - MARGIN * 2;
}

function letterhead(doc: PDFKit.PDFDocument, subtitle: string) {
  doc.rect(0, 0, doc.page.width, 8).fill(NAVY);
  doc.moveDown(1.2);
  doc
    .fillColor(INK)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("Literacy Volunteers of America, Essex/Passaic County", MARGIN, doc.y, {
      width: contentWidth(doc),
    });
  doc
    .fillColor(MUTED)
    .font("Helvetica")
    .fontSize(10.5)
    .text(subtitle, MARGIN, doc.y, { width: contentWidth(doc) });
  doc.moveDown(0.9);
}

function infoLine(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc
    .fillColor(INK)
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text(`${label}:  `, MARGIN, doc.y, { continued: true })
    .font("Helvetica")
    .fillColor(MUTED)
    .text(value);
}

function sectionHeading(doc: PDFKit.PDFDocument, text: string) {
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(NAVY)
    .text(text, MARGIN, doc.y, { width: contentWidth(doc) });
  const y = doc.y + 2;
  doc.moveTo(MARGIN, y).lineTo(doc.page.width - MARGIN, y).strokeColor(RULE).lineWidth(0.75).stroke();
  doc.moveDown(0.6);
}

function divider(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc.moveTo(MARGIN, y).lineTo(doc.page.width - MARGIN, y).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
}

function summaryLine(doc: PDFKit.PDFDocument, label: string, value: string) {
  doc
    .font("Helvetica-Bold")
    .fillColor(INK)
    .text(`${label}:  `, MARGIN, doc.y, { continued: true })
    .font("Helvetica")
    .fillColor(MUTED)
    .text(value);
}

function footer(doc: PDFKit.PDFDocument) {
  doc.moveDown(1.2);
  divider(doc);
  doc.moveDown(0.4);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text("Prepared via LVAEP Tutor Portal", MARGIN, doc.y);
}

function drawTableHeader(doc: PDFKit.PDFDocument, columns: Column[]) {
  const y = doc.y;
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(MUTED);
  for (const col of columns) {
    doc.text(col.label.toUpperCase(), col.x, y, { width: col.width });
  }
  doc.y = y + 14;
  const lineY = doc.y;
  doc.moveTo(MARGIN, lineY).lineTo(doc.page.width - MARGIN, lineY).strokeColor(RULE).lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

function ensureSpace(doc: PDFKit.PDFDocument, rowHeight: number, columns: Column[]) {
  if (doc.y + rowHeight > PAGE_BOTTOM) {
    doc.addPage();
    drawTableHeader(doc, columns);
  }
}

function drawTableRows(
  doc: PDFKit.PDFDocument,
  columns: Column[],
  wrapKey: string,
  rows: Record<string, string>[],
  emptyMessage: string
) {
  drawTableHeader(doc, columns);
  const wrapCol = columns.find((c) => c.key === wrapKey)!;

  if (rows.length === 0) {
    doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
    doc.text(emptyMessage, MARGIN, doc.y + 4);
    doc.moveDown(1);
    return;
  }

  doc.font("Helvetica").fontSize(9).fillColor(INK);
  for (const row of rows) {
    const wrapText = row[wrapKey] ?? "";
    const rowHeight = Math.max(16, doc.heightOfString(wrapText, { width: wrapCol.width }) + 4);
    ensureSpace(doc, rowHeight, columns);
    const y = doc.y;
    for (const col of columns) {
      doc.text(row[col.key] ?? "", col.x, y, { width: col.width });
    }
    doc.y = y + rowHeight;
  }
}

// ---------- Per-student monthly report ----------

export async function reportToPdf(report: MonthlyReport): Promise<Buffer> {
  const doc = newDoc();
  const promise = collect(doc);

  letterhead(doc, "Student Monthly Tutoring Report");

  infoLine(doc, "Tutor", report.tutorName);
  infoLine(doc, "Student", report.studentName);
  if (report.site) infoLine(doc, "Tutoring Site", report.site);
  if (report.days || report.times) {
    infoLine(doc, "Schedule", [report.days, report.times].filter(Boolean).join("  ·  "));
  }
  infoLine(doc, "Reporting Month", report.monthLabel);
  infoLine(
    doc,
    "Report Generated",
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  );
  if (report.stopped) {
    infoLine(
      doc,
      "Status",
      `Stopped${report.stoppedAt ? " " + isoDate(report.stoppedAt) : ""}${
        report.stoppedReason ? "  —  " + report.stoppedReason : ""
      }`
    );
  }

  doc.moveDown(1);
  sectionHeading(doc, "Session Detail");

  const noteWidth = doc.page.width - MARGIN - (MARGIN + 180);
  const cols: Column[] = [
    { key: "date", label: "Date", x: MARGIN, width: 68 },
    { key: "hours", label: "Hours", x: MARGIN + 75, width: 48 },
    { key: "code", label: "Attendance Code", x: MARGIN + 130, width: 130 },
    { key: "note", label: "Note", x: MARGIN + 260, width: noteWidth - 80 },
  ];
  drawTableRows(
    doc,
    cols,
    "note",
    report.sessions.map((s) => ({
      date: isoDate(s.date),
      hours: s.code ? "—" : formatHours(s.hours),
      code: codeLabel(s.code),
      note: s.note ?? "",
    })),
    "No sessions logged this month."
  );

  doc.moveDown(0.6);
  divider(doc);
  doc.moveDown(0.6);

  sectionHeading(doc, "Summary");
  doc.font("Helvetica").fontSize(9.5).fillColor(INK);
  summaryLine(doc, "Total Hours", formatHours(report.totalHours));
  summaryLine(doc, "Sessions Held", String(report.sessionsHeld));
  summaryLine(doc, "Tutor Absences (TA)", String(report.taCount));
  summaryLine(doc, "Student Absences (SA)", String(report.saCount));
  summaryLine(doc, "Holidays (H)", String(report.hCount));

  doc.moveDown(1);
  sectionHeading(doc, "Achievements Attained");
  if (report.achievements.length === 0) {
    doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
    doc.text("None this month.", MARGIN, doc.y + 4);
  } else {
    doc.font("Helvetica").fontSize(9.5).fillColor(INK);
    for (const a of report.achievements) {
      ensureSpace(doc, 16, cols);
      const y = doc.y;
      doc.fillColor(GOLD).text("•  ", MARGIN, y, { continued: true });
      doc
        .fillColor(INK)
        .text(`${a.label}  `, { continued: true })
        .fillColor(MUTED)
        .fontSize(8.5)
        .text(`(${a.categoryLabel} · ${isoDate(a.attainedAt)})`)
        .fontSize(9.5);
      doc.y = y + 16;
    }
  }

  footer(doc);
  doc.end();
  return promise;
}

// ---------- Tutor-wide monthly report ----------

export async function tutorReportToPdf(report: TutorMonthlyReport): Promise<Buffer> {
  const doc = newDoc();
  const promise = collect(doc);

  letterhead(doc, "Tutor Monthly Activity Report — All Students");

  infoLine(doc, "Tutor", report.tutorName);
  if (report.tutorEmail) infoLine(doc, "Email", report.tutorEmail);
  infoLine(doc, "Reporting Month", report.monthLabel);
  infoLine(
    doc,
    "Report Generated",
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  );
  infoLine(
    doc,
    "Students on Roster",
    `${report.activeStudentCount} active of ${report.studentCount} total`
  );

  doc.moveDown(1);
  sectionHeading(doc, "Summary — All Students Combined");
  doc.font("Helvetica").fontSize(9.5).fillColor(INK);
  summaryLine(doc, "Total Hours", formatHours(report.totalHours));
  summaryLine(doc, "Total Sessions Held", String(report.totalSessionsHeld));
  summaryLine(doc, "Tutor Absences (TA)", String(report.taCount));
  summaryLine(doc, "Student Absences (SA)", String(report.saCount));
  summaryLine(doc, "Holidays (H)", String(report.hCount));

  doc.moveDown(1);
  sectionHeading(doc, "Hours by Student");
  const studentCols: Column[] = [
    { key: "name", label: "Student", x: MARGIN, width: 260 },
    { key: "hours", label: "Hours", x: MARGIN + 280, width: 80 },
    { key: "sessions", label: "Sessions Held", x: MARGIN + 370, width: 100 },
  ];
  drawTableRows(
    doc,
    studentCols,
    "name",
    report.studentSummaries.map((s) => ({
      name: s.studentName,
      hours: formatHours(s.hours),
      sessions: String(s.sessionsHeld),
    })),
    "No student activity logged this month."
  );

  doc.moveDown(0.8);
  sectionHeading(doc, "Session Detail — All Students");
  const noteX = MARGIN + 336;
  const sessionCols: Column[] = [
    { key: "date", label: "Date", x: MARGIN, width: 62 },
    { key: "student", label: "Student", x: MARGIN + 68, width: 110 },
    { key: "hours", label: "Hours", x: MARGIN + 184, width: 42 },
    { key: "code", label: "Attendance Code", x: MARGIN + 232, width: 100 },
    { key: "note", label: "Note", x: noteX, width: doc.page.width - MARGIN - noteX },
  ];
  drawTableRows(
    doc,
    sessionCols,
    "note",
    report.sessions.map((s) => ({
      date: isoDate(s.date),
      student: s.studentName,
      hours: s.code ? "—" : formatHours(s.hours),
      code: codeLabel(s.code),
      note: s.note ?? "",
    })),
    "No sessions logged this month."
  );

  doc.moveDown(0.8);
  sectionHeading(doc, "Achievements Attained — All Students");
  if (report.achievements.length === 0) {
    doc.font("Helvetica").fontSize(9.5).fillColor(MUTED);
    doc.text("None this month.", MARGIN, doc.y + 4);
  } else {
    doc.font("Helvetica").fontSize(9.5).fillColor(INK);
    for (const a of report.achievements) {
      ensureSpace(doc, 16, sessionCols);
      const y = doc.y;
      doc.fillColor(GOLD).text("•  ", MARGIN, y, { continued: true });
      doc
        .fillColor(INK)
        .text(`${a.studentName} — ${a.label}  `, { continued: true })
        .fillColor(MUTED)
        .fontSize(8.5)
        .text(`(${a.categoryLabel} · ${isoDate(a.attainedAt)})`)
        .fontSize(9.5);
      doc.y = y + 16;
    }
  }

  footer(doc);
  doc.end();
  return promise;
}
