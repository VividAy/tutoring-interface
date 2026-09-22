import { REPORT_MONTHS, fiscalMonthIndex } from "@/lib/achievements";

// The program's fiscal year runs July 1 – June 30, matching the paper
// form's "Jul … Jun" column layout.
export function fiscalYearStart(reference = new Date()): Date {
  const year =
    reference.getUTCMonth() >= 6
      ? reference.getUTCFullYear()
      : reference.getUTCFullYear() - 1;
  return new Date(Date.UTC(year, 6, 1));
}

export function fiscalYearLabel(reference = new Date()): string {
  const start = fiscalYearStart(reference);
  const startYear = start.getUTCFullYear();
  return `FY ${startYear}–${startYear + 1}`;
}

export type MonthBucket = {
  label: (typeof REPORT_MONTHS)[number];
  year: number;
  month: number; // calendar month, 1-12
  hours: number;
  ta: number;
  sa: number;
  h: number;
  hasData: boolean;
};

export function bucketSessionsByFiscalMonth(
  sessions: { date: Date; hours: number; code: string | null }[],
  reference = new Date()
): MonthBucket[] {
  const start = fiscalYearStart(reference);
  const end = new Date(Date.UTC(start.getUTCFullYear() + 1, 6, 1));

  const buckets: MonthBucket[] = REPORT_MONTHS.map((label, i) => {
    const d = new Date(Date.UTC(start.getUTCFullYear(), 6 + i, 1));
    return {
      label,
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      hours: 0,
      ta: 0,
      sa: 0,
      h: 0,
      hasData: false,
    };
  });

  for (const s of sessions) {
    if (s.date < start || s.date >= end) continue;
    const col = fiscalMonthIndex(s.date.getUTCMonth());
    const bucket = buckets[col];
    if (s.code === "TA") bucket.ta += 1;
    else if (s.code === "SA") bucket.sa += 1;
    else if (s.code === "H") bucket.h += 1;
    else bucket.hours += s.hours;
    bucket.hasData = true;
  }

  return buckets;
}
