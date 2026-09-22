import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { formatDate, formatHours } from "@/lib/format";

export function StudentCard({
  href,
  name,
  site,
  stopped,
  totalHours,
  achievementCount,
  lastSessionDate,
}: {
  href: string;
  name: string;
  site?: string | null;
  stopped: boolean;
  totalHours: number;
  achievementCount: number;
  lastSessionDate: Date | null;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
        stopped
          ? "border-border-soft bg-surface/60"
          : "border-border bg-surface hover:border-gold/40 hover:shadow-[0_16px_36px_-24px_rgba(245,197,24,0.35)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3.5">
          <Avatar name={name} size="lg" />
          <div className="min-w-0">
            <h3
              className={`truncate text-base font-semibold ${
                stopped ? "text-muted" : "text-ink group-hover:text-gold"
              }`}
            >
              {name}
            </h3>
            {site && <p className="truncate text-xs text-muted">{site}</p>}
          </div>
        </div>
        {stopped && (
          <span className="shrink-0 rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-danger">
            Stopped
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border-soft pt-4 text-center">
        <Stat label="Hours logged" value={formatHours(totalHours)} />
        <Stat label="Achievements" value={String(achievementCount)} />
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-2">
        {lastSessionDate
          ? `Last session ${formatDate(lastSessionDate)}`
          : "No sessions logged yet"}
      </p>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-2">
        {label}
      </div>
    </div>
  );
}
