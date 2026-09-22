"use client";

import { useState } from "react";
import { updateStudentInfo } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { buttonSecondaryClass, inputClass, labelClass } from "@/components/ui";

export function StudentInfoForm({
  studentId,
  tutorId,
  site,
  days,
  times,
}: {
  studentId: string;
  tutorId: string;
  site: string | null;
  days: string | null;
  times: string | null;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-2 py-1 -mx-2 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <InfoBit label="Site" value={site} />
        <InfoBit label="Days" value={days} />
        <InfoBit label="Times" value={times} />
        <span className="text-xs text-gold">Edit</span>
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updateStudentInfo(formData);
        setEditing(false);
      }}
      className="rounded-lg border border-border-soft bg-bg-elevated p-3"
    >
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="tutorId" value={tutorId} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Tutoring site</label>
          <input className={inputClass} name="site" defaultValue={site ?? ""} />
        </div>
        <div>
          <label className={labelClass}>Day(s)</label>
          <input className={inputClass} name="days" defaultValue={days ?? ""} />
        </div>
        <div>
          <label className={labelClass}>Time(s)</label>
          <input className={inputClass} name="times" defaultValue={times ?? ""} />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={buttonSecondaryClass}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function InfoBit({ label, value }: { label: string; value: string | null }) {
  return (
    <span>
      <span className="text-muted-2">{label}:</span>{" "}
      {value || <span className="italic text-muted-2">not set</span>}
    </span>
  );
}
