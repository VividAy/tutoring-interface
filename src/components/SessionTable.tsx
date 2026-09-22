import { deleteSession } from "@/lib/actions";
import { DeleteButton } from "@/components/DeleteButton";
import { formatDate, formatHours } from "@/lib/format";
import { SESSION_CODES, type SessionCode } from "@/lib/achievements";

type SessionRow = {
  id: string;
  date: Date;
  hours: number;
  code: string | null;
  note: string | null;
};

export function SessionTable({
  sessions,
  studentId,
  tutorId,
}: {
  sessions: SessionRow[];
  studentId: string;
  tutorId: string;
}) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-xl border border-border-soft bg-bg-elevated px-4 py-6 text-center text-sm text-muted">
        No sessions logged yet.
      </p>
    );
  }

  const sorted = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="overflow-hidden rounded-xl border border-border-soft">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-soft bg-bg-elevated text-left text-xs uppercase tracking-wide text-muted-2">
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="px-4 py-2.5 font-medium">Hours</th>
            <th className="px-4 py-2.5 font-medium">Note</th>
            <th className="w-10 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr
              key={s.id}
              className="border-b border-border-soft last:border-0 hover:bg-surface-2/50"
            >
              <td className="whitespace-nowrap px-4 py-2.5 text-ink">
                {formatDate(s.date)}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5">
                {s.code ? (
                  <span
                    title={SESSION_CODES[s.code as SessionCode]}
                    className="rounded-full border border-navy-light/40 bg-navy/20 px-2 py-0.5 text-xs font-medium text-navy-light"
                  >
                    {s.code}
                  </span>
                ) : (
                  <span className="font-medium text-ink">
                    {formatHours(s.hours)}
                  </span>
                )}
              </td>
              <td className="max-w-xs truncate px-4 py-2.5 text-muted">
                {s.note ?? "—"}
              </td>
              <td className="px-2 py-2.5">
                <form action={deleteSession}>
                  <input type="hidden" name="sessionId" value={s.id} />
                  <input type="hidden" name="studentId" value={studentId} />
                  <input type="hidden" name="tutorId" value={tutorId} />
                  <DeleteButton title="Delete session" />
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
