"use client";

import { useFormStatus } from "react-dom";

export function DeleteButton({ title = "Remove" }: { title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title={title}
      disabled={pending}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-2 transition-colors hover:bg-danger/15 hover:text-danger disabled:opacity-40"
    >
      {pending ? (
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
