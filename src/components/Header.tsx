import Link from "next/link";

export function Header({
  crumbs,
  right,
}: {
  crumbs: { label: string; href?: string }[];
  right?: React.ReactNode;
}) {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-border-soft bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-navy to-navy-light text-sm font-bold text-white ring-1 ring-gold/40">
              LV
            </span>
            <span className="hidden text-sm font-semibold tracking-wide text-ink sm:inline">
              LVAEP Tutor Portal
            </span>
          </Link>
          <nav className="ml-2 flex items-center gap-1.5 text-sm text-muted">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-2">/</span>}
                {c.href ? (
                  <Link
                    href={c.href}
                    className="rounded px-1.5 py-0.5 transition-colors hover:text-gold"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="px-1.5 py-0.5 text-ink">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
        {right}
      </div>
    </header>
  );
}
