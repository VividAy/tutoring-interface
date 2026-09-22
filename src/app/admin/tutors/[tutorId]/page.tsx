import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Avatar } from "@/components/Avatar";
import { SignOutForm } from "@/components/SignOutForm";
import { MonthlyHoursGrid } from "@/components/MonthlyHoursGrid";
import { lockAdmin } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatDate, formatHours } from "@/lib/format";
import { bucketSessionsByFiscalMonth, fiscalYearLabel } from "@/lib/fiscal";
import { ACHIEVEMENT_CATALOG, findCatalogItem } from "@/lib/achievements";

type SessionLike = { date: Date; hours: number; code: string | null };

export default async function TutorReportPage({
  params,
}: PageProps<"/admin/tutors/[tutorId]">) {
  const { tutorId } = await params;

  const tutor = await prisma.tutor.findUnique({
    where: { id: tutorId },
    include: {
      students: {
        orderBy: { name: "asc" },
        include: { sessions: true, achievements: true },
      },
    },
  });

  if (!tutor) notFound();

  const active = tutor.students.filter((s) => !s.stopped);
  const stopped = tutor.students.filter((s) => s.stopped);
  const totalHours = tutor.students.reduce(
    (h, s) => h + s.sessions.reduce((x, sess) => x + sess.hours, 0),
    0
  );
  const totalAchievements = tutor.students.reduce(
    (n, s) => n + s.achievements.length,
    0
  );

  const allSessions: SessionLike[] = tutor.students.flatMap((s) => s.sessions);
  const tutorBuckets = bucketSessionsByFiscalMonth(allSessions);

  return (
    <>
      <Header
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: tutor.name },
        ]}
        right={<SignOutForm action={lockAdmin} />}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-border-soft pb-6">
          <div className="flex items-center gap-4">
            <Avatar name={tutor.name} size="xl" ring />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-2">
                Tutor Report · {fiscalYearLabel()}
              </p>
              <h1 className="text-2xl font-semibold text-ink">{tutor.name}</h1>
              {tutor.email && (
                <p className="text-sm text-muted">{tutor.email}</p>
              )}
            </div>
          </div>
          <div className="flex gap-6 rounded-xl border border-border-soft bg-surface px-5 py-3.5">
            <Stat label="Students" value={String(tutor.students.length)} />
            <Stat label="Active" value={String(active.length)} />
            <Stat label="Hours" value={formatHours(totalHours)} />
            <Stat label="Achievements" value={String(totalAchievements)} />
          </div>
        </div>

        {tutor.students.length === 0 && (
          <p className="rounded-xl border border-border-soft bg-surface/50 px-4 py-6 text-center text-sm text-muted">
            This tutor has no students on record yet.
          </p>
        )}

        {tutor.students.length > 0 && (
          <section className="mb-8 rounded-2xl border border-gold/25 bg-gradient-to-br from-navy-soft/70 via-bg-elevated to-bg-elevated p-6 shadow-[0_20px_45px_-30px_rgba(245,197,24,0.35)]">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                Primary Report
              </span>
              <span className="text-[10px] text-muted-2">
                Combines every student below into one monthly total
              </span>
            </div>
            <h2 className="text-lg font-semibold text-ink">
              {tutor.name} — Monthly Totals
            </h2>
            <p className="mb-4 text-sm text-muted">
              All students combined. Export one CSV or PDF per month covering
              this tutor&apos;s entire caseload.
            </p>
            <MonthlyHoursGrid
              exportBase={`/api/reports/tutor/${tutor.id}`}
              buckets={tutorBuckets}
              emphasized
            />
          </section>
        )}

        <div className="space-y-8">
          {[...active, ...stopped].map((student) => {
            const buckets = bucketSessionsByFiscalMonth(student.sessions);
            const studentHours = student.sessions.reduce((h, s) => h + s.hours, 0);
            const catalogAttained = student.achievements.filter(
              (a) => a.category !== "other" && a.attainedAt
            );
            const otherAttained = student.achievements.filter(
              (a) => a.category === "other"
            );

            return (
              <section
                key={student.id}
                className="break-inside-avoid rounded-2xl border border-border bg-surface p-6"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={student.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-ink">
                          {student.name}
                        </h2>
                        {student.stopped && (
                          <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-danger">
                            Stopped
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted">
                        {[student.site, student.days, student.times]
                          .filter(Boolean)
                          .join(" · ") || "No site/schedule on file"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-ink">
                      {formatHours(studentHours)} hrs
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-2">
                      total logged
                    </div>
                  </div>
                </div>

                {student.stopped && student.stoppedReason && (
                  <p className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-ink/80">
                    Stopped{student.stoppedAt ? ` ${formatDate(student.stoppedAt)}` : ""}
                    : {student.stoppedReason}
                  </p>
                )}

                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Attendance — hours by month
                  </h3>
                  <p className="text-[10px] text-muted-2">
                    CSV / PDF export below each month with sessions
                  </p>
                </div>
                <MonthlyHoursGrid
                  exportBase={`/api/reports/student/${student.id}`}
                  buckets={buckets}
                />

                <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
                  Achievements
                </h3>
                {catalogAttained.length === 0 && otherAttained.length === 0 ? (
                  <p className="text-sm text-muted-2">None recorded yet.</p>
                ) : (
                  <AchievementSummary
                    catalogAttained={catalogAttained}
                    otherAttained={otherAttained}
                  />
                )}
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}

function AchievementSummary({
  catalogAttained,
  otherAttained,
}: {
  catalogAttained: { key: string; category: string; attainedAt: Date | null }[];
  otherAttained: { id: string; label: string; attainedAt: Date | null }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {ACHIEVEMENT_CATALOG.map((cat) => {
        const items = catalogAttained.filter((a) => a.category === cat.id);
        if (items.length === 0) return null;
        return (
          <div key={cat.id} className="min-w-[180px]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">
              {cat.letter}. {cat.title}
            </p>
            <ul className="mt-1 space-y-0.5">
              {items.map((a) => {
                const found = findCatalogItem(a.key);
                return (
                  <li key={a.key} className="text-sm text-ink">
                    <span className="text-gold">✓</span> {found?.item.label ?? a.key}
                    {a.attainedAt && (
                      <span className="ml-1.5 text-xs text-muted-2">
                        {formatDate(a.attainedAt)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {otherAttained.length > 0 && (
        <div className="min-w-[180px]">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-2">
            E. Other
          </p>
          <ul className="mt-1 space-y-0.5">
            {otherAttained.map((a) => (
              <li key={a.id} className="text-sm text-ink">
                <span className="text-gold">✓</span> {a.label}
                {a.attainedAt && (
                  <span className="ml-1.5 text-xs text-muted-2">
                    {formatDate(a.attainedAt)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-2">
        {label}
      </div>
    </div>
  );
}
