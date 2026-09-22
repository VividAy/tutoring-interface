"use client";

import { useState } from "react";

export function AddCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-[168px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted transition-colors hover:border-gold/50 hover:text-gold"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current text-lg leading-none">
          +
        </span>
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-gold/30 bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{label}</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-muted transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
      {children}
    </div>
  );
}
