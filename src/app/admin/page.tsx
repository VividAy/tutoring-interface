import { Header } from "@/components/Header";
import { TutorCard } from "@/components/TutorCard";
import { AddCard } from "@/components/AddCard";
import { SubmitButton } from "@/components/SubmitButton";
import { SignOutForm } from "@/components/SignOutForm";
import { inputClass, labelClass } from "@/components/ui";
import { createTutor, lockAdmin } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatHours } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const tutors = await prisma.tutor.findMany({
    orderBy: { name: "asc" },
    include: {
      students: {
        include: { sessions: true, achievements: true },
      },
    },
  });

  const totalStudents = tutors.reduce((n, t) => n + t.students.length, 0);
  const totalActive = tutors.reduce(
    (n, t) => n + t.students.filter((s) => !s.stopped).length,
    0
  );
  const totalHours = tutors.reduce(
    (n, t) =>
      n +
      t.students.reduce(
        (h, s) => h + s.sessions.reduce((x, sess) => x + sess.hours, 0),
        0
      ),
    0
  );
  const totalAchievements = tutors.reduce(
    (n, t) => n + t.students.reduce((a, s) => a + s.achievements.length, 0),
    0
  );

  return (
    <>
      <Header
        crumbs={[{ label: "Admin" }]}
        right={<SignOutForm action={lockAdmin} />}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Tutors</h1>
            <p className="mt-1 text-sm text-muted">
              Select a tutor to generate their monthly attendance &amp;
              achievement report.
            </p>
          </div>
          <div className="flex gap-5 rounded-xl border border-border-soft bg-surface px-5 py-3">
            <SummaryStat label="Tutors" value={String(tutors.length)} />
            <SummaryStat
              label="Students"
              value={`${totalActive}/${totalStudents}`}
            />
            <SummaryStat label="Hours" value={formatHours(totalHours)} />
            <SummaryStat label="Achievements" value={String(totalAchievements)} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => {
            const hours = t.students.reduce(
              (sum, s) => sum + s.sessions.reduce((h, sess) => h + sess.hours, 0),
              0
            );
            const activeCount = t.students.filter((s) => !s.stopped).length;
            return (
              <TutorCard
                key={t.id}
                href={`/admin/tutors/${t.id}`}
                name={t.name}
                email={t.email}
                studentCount={t.students.length}
                activeCount={activeCount}
                totalHours={hours}
              />
            );
          })}

          <AddCard label="Add tutor">
            <form action={createTutor} className="space-y-3">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  className={inputClass}
                  name="name"
                  required
                  placeholder="e.g. Dana Whitfield"
                />
              </div>
              <div>
                <label className={labelClass}>Email (optional)</label>
                <input
                  className={inputClass}
                  name="email"
                  type="email"
                  placeholder="dana@example.org"
                />
              </div>
              <p className="text-xs text-muted-2">
                Their password will default to first name + &quot;123&quot;
                (e.g. dana123).
              </p>
              <SubmitButton>Add tutor</SubmitButton>
            </form>
          </AddCard>
        </div>
      </main>
    </>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-2">
        {label}
      </div>
    </div>
  );
}
