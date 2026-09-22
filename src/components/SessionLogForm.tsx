"use client";

import { useRef, useState } from "react";
import { createSession } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClass, labelClass } from "@/components/ui";
import { SESSION_CODES, type SessionCode } from "@/lib/achievements";

function todayLocal(): string {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function SessionLogForm({
  studentId,
  tutorId,
}: {
  studentId: string;
  tutorId: string;
}) {
  const [code, setCode] = useState<SessionCode | "">("");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createSession(formData);
        formRef.current?.reset();
        setCode("");
      }}
      className="space-y-4"
    >
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="tutorId" value={tutorId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date</label>
          <input
            className={inputClass}
            type="date"
            name="date"
            defaultValue={todayLocal()}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Hours tutored</label>
          <input
            className={inputClass}
            type="number"
            name="hours"
            min="0"
            max="12"
            step="0.25"
            placeholder="1.5"
            disabled={code !== ""}
            required={code === ""}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Or mark this date as</label>
        <div className="flex flex-wrap gap-2">
          <input type="hidden" name="code" value={code} />
          {(
            [
              { value: "", label: "Regular session" },
              ...(
                Object.entries(SESSION_CODES) as [SessionCode, string][]
              ).map(([value, label]) => ({ value, label: `${value} — ${label}` })),
            ] as { value: SessionCode | ""; label: string }[]
          ).map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setCode(opt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                code === opt.value
                  ? "border-gold bg-gold-soft text-gold"
                  : "border-border text-muted hover:border-navy-light hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Note (optional)</label>
        <input
          className={inputClass}
          name="note"
          placeholder="What did you work on?"
        />
      </div>

      <SubmitButton pendingLabel="Logging…">Log session</SubmitButton>
    </form>
  );
}
