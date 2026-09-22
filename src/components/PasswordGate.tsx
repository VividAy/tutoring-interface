"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/lib/actions";
import { buttonPrimaryClass, inputClass, labelClass } from "@/components/ui";

export function PasswordGate({
  action,
  title,
  subtitle,
  backHref,
  backLabel = "← Back",
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-block text-sm text-muted transition-colors hover:text-ink"
          >
            {backLabel}
          </Link>
        )}
        <form
          action={formAction}
          className="rounded-2xl border border-border bg-surface p-7"
        >
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-navy/25 text-gold ring-1 ring-navy-light/40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="10.5"
                width="14"
                height="9.5"
                rx="1.6"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 10.5V7.5a4 4 0 0 1 8 0v3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="mt-3 text-lg font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}

          <div className="mt-5">
            <label className={labelClass}>Password</label>
            <input
              className={inputClass}
              type="password"
              name="password"
              autoFocus
              required
            />
          </div>

          {state.error && (
            <p className="mt-2.5 text-sm text-danger">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`${buttonPrimaryClass} mt-5 w-full`}
          >
            {pending ? "Checking…" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}
