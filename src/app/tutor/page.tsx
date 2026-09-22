import { Header } from "@/components/Header";
import { TutorCard } from "@/components/TutorCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TutorPickerPage() {
  const tutors = await prisma.tutor.findMany({
    orderBy: { name: "asc" },
    include: {
      students: {
        include: { sessions: true },
      },
    },
  });

  return (
    <>
      <Header crumbs={[{ label: "Tutor" }]} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink">Who&apos;s logging in?</h1>
          <p className="mt-1 text-sm text-muted">
            Select your name to view your students and log sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => {
            const totalHours = t.students.reduce(
              (sum, s) => sum + s.sessions.reduce((h, sess) => h + sess.hours, 0),
              0
            );
            const activeCount = t.students.filter((s) => !s.stopped).length;
            return (
              <TutorCard
                key={t.id}
                href={`/tutor/${t.id}`}
                name={t.name}
                email={t.email}
                studentCount={t.students.length}
                activeCount={activeCount}
                totalHours={totalHours}
              />
            );
          })}
        </div>

        {tutors.length === 0 && (
          <p className="rounded-xl border border-border-soft bg-surface/50 px-4 py-6 text-center text-sm text-muted">
            No tutors set up yet — an administrator can add one from the
            admin dashboard.
          </p>
        )}
      </main>
    </>
  );
}
