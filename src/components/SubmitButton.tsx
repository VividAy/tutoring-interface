"use client";

import { useFormStatus } from "react-dom";
import { buttonPrimaryClass } from "@/components/ui";

export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className ?? buttonPrimaryClass}
    >
      {pending ? pendingLabel ?? "Saving…" : children}
    </button>
  );
}
