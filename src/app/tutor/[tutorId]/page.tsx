import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Avatar } from "@/components/Avatar";
import { StudentCard } from "@/components/StudentCard";
import { AddCard } from "@/components/AddCard";
import { SubmitButton } from "@/components/SubmitButton";
import { SignOutForm } from "@/components/SignOutForm";
import { inputClass, labelClass } from "@/components/ui";
import { createStudent, lockTutor } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function TutorDashboardPage({
  params,
}: PageProps<"/tutor/[tutorId]">) {
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

  return (
    <>
      <Header
        crumbs={[
          { label: "Tutor", href: "/tutor" },
          { label: tutor.name },
        ]}
        right={<SignOutForm action={lockTutor.bind(null, tutor.id)} />}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Avatar name={tutor.name} size="xl" ring />
          <div>
            <h1 className="text-2xl font-semibold text-ink">{tutor.name}</h1>
            <p className="mt-0.5 text-sm text-muted">
              {active.length} active student{active.length === 1 ? "" : "s"}
              {stopped.length > 0 && ` · ${stopped.length} stopped`}
            </p>
          </div>
        </div>

        {active.length === 0 && stopped.length === 0 && (
          <p className="mb-6 rounded-xl border border-border-soft bg-surface/50 px-4 py-3 text-sm text-muted">
            No students yet — add your first one below.
          </p>
        )}

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((s) => (
              <StudentCard
                key={s.id}
                href={`/tutor/${tutor.id}/students/${s.id}`}
                name={s.name}
                site={s.site}
                stopped={s.stopped}
                totalHours={s.sessions.reduce((h, sess) => h + sess.hours, 0)}
                achievementCount={s.achievements.length}
                lastSessionDate={
                  s.sessions.length
                    ? s.sessions.reduce((a, b) => (a.date > b.date ? a : b)).date
                    : null
                }
              />
            ))}

            <AddCard label="Add student">
              <form action={createStudent} className="space-y-3">
                <input type="hidden" name="tutorId" value={tutor.id} />
                <div>
                  <label className={labelClass}>Student name</label>
                  <input
                    className={inputClass}
                    name="name"
                    required
                    placeholder="e.g. Jordan Reyes"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tutoring site</label>
                  <input
                    className={inputClass}
                    name="site"
                    placeholder="e.g. Bloomfield Public Library"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Day(s)</label>
                    <input
                      className={inputClass}
                      name="days"
                      placeholder="Tue, Thu"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Time(s)</label>
                    <input
                      className={inputClass}
                      name="times"
                      placeholder="6–7:30 PM"
                    />
                  </div>
                </div>
                <SubmitButton>Add student</SubmitButton>
              </form>
            </AddCard>
          </div>
        </section>

        {stopped.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Stopped
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stopped.map((s) => (
                <StudentCard
                  key={s.id}
                  href={`/tutor/${tutor.id}/students/${s.id}`}
                  name={s.name}
                  site={s.site}
                  stopped={s.stopped}
                  totalHours={s.sessions.reduce((h, sess) => h + sess.hours, 0)}
                  achievementCount={s.achievements.length}
                  lastSessionDate={
                    s.sessions.length
                      ? s.sessions.reduce((a, b) => (a.date > b.date ? a : b))
                          .date
                      : null
                  }
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
