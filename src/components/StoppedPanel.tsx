"use client";

import { useState } from "react";
import { setStudentStopped } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { buttonSecondaryClass, inputClass, labelClass } from "@/components/ui";
import { formatDate } from "@/lib/format";

export function StoppedPanel({
  studentId,
  tutorId,
  stopped,
  stoppedReason,
  stoppedAt,
}: {
  studentId: string;
  tutorId: string;
  stopped: boolean;
  stoppedReason: string | null;
  stoppedAt: Date | null;
}) {
  const [confirming, setConfirming] = useState(false);

  if (stopped) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
        <p className="text-sm font-medium text-danger">
          Marked as stopped{stoppedAt ? ` · ${formatDate(stoppedAt)}` : ""}
        </p>
        {stoppedReason && (
          <p className="mt-1 text-sm text-ink/80">{stoppedReason}</p>
        )}
        <form action={setStudentStopped} className="mt-3">
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="tutorId" value={tutorId} />
          <input type="hidden" name="stopped" value="false" />
          <SubmitButton
            className={buttonSecondaryClass}
            pendingLabel="Resuming…"
          >
            Resume tutoring
          </SubmitButton>
        </form>
      </div>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-danger"
      >
        Student no longer being tutored?
      </button>
    );
  }

  return (
    <form
      action={setStudentStopped}
      className="space-y-3 rounded-xl border border-border-soft bg-bg-elevated p-4"
    >
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="stopped" value="true" />
      <div>
        <label className={labelClass}>Reason</label>
        <input
          className={inputClass}
          name="reason"
          placeholder="e.g. Relocated, completed goals…"
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <SubmitButton pendingLabel="Saving…">
          Confirm — mark as stopped
        </SubmitButton>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={buttonSecondaryClass}
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-muted-2">
        Please also notify the office as soon as possible.
      </p>
    </form>
  );
}
