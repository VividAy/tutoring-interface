import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Avatar } from "@/components/Avatar";
import { SessionLogForm } from "@/components/SessionLogForm";
import { SessionTable } from "@/components/SessionTable";
import { AchievementChecklist } from "@/components/AchievementChecklist";
import { StoppedPanel } from "@/components/StoppedPanel";
import { StudentInfoForm } from "@/components/StudentInfoForm";
import { SignOutForm } from "@/components/SignOutForm";
import { formatHours } from "@/lib/format";
import { lockTutor } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function StudentDetailPage({
  params,
}: PageProps<"/tutor/[tutorId]/students/[studentId]">) {
  const { tutorId, studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      tutor: true,
      sessions: true,
      achievements: true,
    },
  });

  if (!student || student.tutorId !== tutorId) notFound();

  const totalHours = student.sessions.reduce((h, s) => h + s.hours, 0);
  const attended = student.sessions.filter((s) => !s.code).length;

  const attained: Record<string, string> = {};
  const otherAchievements: { id: string; label: string; attainedAt: Date | null }[] = [];
  for (const a of student.achievements) {
    if (a.category === "other") {
      otherAchievements.push({ id: a.id, label: a.label, attainedAt: a.attainedAt });
    } else if (a.attainedAt) {
      attained[`${a.category}:${a.key}`] = a.attainedAt.toISOString();
    }
  }

  return (
    <>
      <Header
        crumbs={[
          { label: "Tutor", href: "/tutor" },
          { label: student.tutor.name, href: `/tutor/${tutorId}` },
          { label: student.name },
        ]}
        right={<SignOutForm action={lockTutor.bind(null, tutorId)} />}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={student.name} size="xl" ring />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-ink">
                  {student.name}
                </h1>
                {student.stopped && (
                  <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-danger">
                    Stopped
                  </span>
                )}
              </div>
              <div className="mt-1.5">
                <StudentInfoForm
                  studentId={student.id}
                  tutorId={tutorId}
                  site={student.site}
                  days={student.days}
                  times={student.times}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-6 rounded-xl border border-border-soft bg-surface px-5 py-3.5 sm:gap-8">
            <StatBlock label="Total hours" value={formatHours(totalHours)} />
            <StatBlock label="Sessions" value={String(attended)} />
            <StatBlock
              label="Achievements"
              value={String(Object.keys(attained).length + otherAchievements.length)}
            />
          </div>
        </div>

        <div className="mb-8">
          <StoppedPanel
            studentId={student.id}
            tutorId={tutorId}
            stopped={student.stopped}
            stoppedReason={student.stoppedReason}
            stoppedAt={student.stoppedAt}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-base font-semibold text-ink">
                Log a session
              </h2>
              <SessionLogForm studentId={student.id} tutorId={tutorId} />
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 text-base font-semibold text-ink">
                Session history
              </h2>
              <SessionTable
                sessions={student.sessions}
                studentId={student.id}
                tutorId={tutorId}
              />
            </section>
          </div>

          <div className="lg:col-span-2">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-1 text-base font-semibold text-ink">
                Achievements
              </h2>
              <AchievementChecklist
                studentId={student.id}
                tutorId={tutorId}
                attained={attained}
                otherAchievements={otherAchievements}
              />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-semibold text-ink">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-2">
        {label}
      </div>
    </div>
  );
}
