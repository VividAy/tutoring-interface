import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-light text-xl font-bold text-white ring-1 ring-gold/40">
            LV
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            LVAEP Tutor Portal
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-balance text-muted">
            Attendance &amp; achievement tracking for Literacy Volunteers of
            America, Essex/Passaic County — replacing the paper monthly
            report.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Link
            href="/tutor"
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_0_0_1px_rgba(245,197,24,0.15),0_20px_40px_-20px_rgba(245,197,24,0.25)]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-navy/25 text-gold ring-1 ring-navy-light/40">
              <IconTutor />
            </div>
            <h2 className="text-lg font-semibold text-ink">I&apos;m a Tutor</h2>
            <p className="mt-1.5 text-sm text-muted">
              Log sessions and mark off achievements for the students you
              tutor.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
              Go to my students <ArrowRight />
            </span>
          </Link>

          <Link
            href="/admin"
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_0_0_1px_rgba(245,197,24,0.15),0_20px_40px_-20px_rgba(245,197,24,0.25)]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold-soft text-gold ring-1 ring-gold/30">
              <IconAdmin />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              I&apos;m an Administrator
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Review tutors and generate monthly attendance &amp; achievement
              reports.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
              Go to admin dashboard <ArrowRight />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function IconTutor() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12.5c2.5 0 4.5-2 4.5-4.5S14.5 3.5 12 3.5 7.5 5.5 7.5 8s2 4.5 4.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 20c0-3.6 3.6-6.5 8-6.5s8 2.9 8 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="13"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 20.5h8M9 17.5v3M15 17.5v3M7 9.5l2.5 2.5L14 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
