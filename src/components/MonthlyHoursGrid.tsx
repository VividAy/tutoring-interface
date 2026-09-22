import type { MonthBucket } from "@/lib/fiscal";
import { formatHours } from "@/lib/format";

export function MonthlyHoursGrid({
  exportBase,
  buckets,
  emphasized = false,
}: {
  /** e.g. `/api/reports/student/${studentId}` or `/api/reports/tutor/${tutorId}` */
  exportBase: string;
  buckets: MonthBucket[];
  emphasized?: boolean;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.hours));

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {buckets.map((b) => (
        <div
          key={b.label}
          className={`flex flex-col items-center gap-1.5 rounded-lg border px-1.5 py-2 ${
            emphasized
              ? "border-navy-light/30 bg-black/25"
              : "border-border-soft bg-bg-elevated"
          }`}
        >
          <div className="flex h-14 w-full items-end justify-center">
            <div
              className="w-3 rounded-sm bg-gradient-to-t from-navy to-gold"
              style={{
                height: b.hours > 0 ? `${Math.max(8, (b.hours / max) * 100)}%` : "3px",
                opacity: b.hours > 0 ? 1 : 0.25,
              }}
              title={`${formatHours(b.hours)} hrs`}
            />
          </div>
          <span className="text-[10px] font-medium uppercase text-muted-2">
            {b.label}
          </span>
          <span className="text-xs font-semibold text-ink">
            {formatHours(b.hours)}
          </span>
          {(b.ta > 0 || b.sa > 0 || b.h > 0) && (
            <span className="text-[9px] leading-tight text-muted-2">
              {b.ta > 0 && `TA${b.ta} `}
              {b.sa > 0 && `SA${b.sa} `}
              {b.h > 0 && `H${b.h}`}
            </span>
          )}
          {b.hasData ? (
            <div className="mt-0.5 flex gap-1">
              <a
                href={`${exportBase}/${b.year}/${b.month}/csv`}
                title={`Export ${b.label} ${b.year} as CSV`}
                className="rounded border border-border-soft px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted-2 transition-colors hover:border-gold/50 hover:text-gold"
              >
                CSV
              </a>
              <a
                href={`${exportBase}/${b.year}/${b.month}/pdf`}
                title={`Export ${b.label} ${b.year} as PDF`}
                className="rounded border border-border-soft px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted-2 transition-colors hover:border-navy-light hover:text-white"
              >
                PDF
              </a>
            </div>
          ) : (
            <div className="mt-0.5 h-[19px]" />
          )}
        </div>
      ))}
    </div>
  );
}
