import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { formatHours } from "@/lib/format";

export function TutorCard({
  href,
  name,
  email,
  studentCount,
  activeCount,
  totalHours,
}: {
  href: string;
  name: string;
  email?: string | null;
  studentCount: number;
  activeCount: number;
  totalHours: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-navy-light/60 hover:shadow-[0_16px_36px_-24px_rgba(30,58,138,0.6)]"
    >
      <div className="flex items-center gap-3.5">
        <Avatar name={name} size="lg" />
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink group-hover:text-gold">
            {name}
          </h3>
          {email && <p className="truncate text-xs text-muted">{email}</p>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border-soft pt-4 text-center">
        <Stat label="Students" value={String(studentCount)} />
        <Stat label="Active" value={String(activeCount)} />
        <Stat label="Hours" value={formatHours(totalHours)} />
      </div>
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
