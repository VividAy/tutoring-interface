"use client";

import { useState, useTransition } from "react";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements";
import { toggleCatalogAchievement, addOtherAchievement, deleteAchievement } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { DeleteButton } from "@/components/DeleteButton";
import { inputClass } from "@/components/ui";

type OtherAchievement = {
  id: string;
  label: string;
  attainedAt: Date | null;
};

export function AchievementChecklist({
  studentId,
  tutorId,
  attained,
  otherAchievements,
}: {
  studentId: string;
  tutorId: string;
  attained: Record<string, string>; // `${category}:${key}` -> ISO date
  otherAchievements: OtherAchievement[];
}) {
  const [state, setState] = useState(attained);
  const [, startTransition] = useTransition();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

  function toggle(category: string, key: string) {
    const id = `${category}:${key}`;
    const checked = !state[id];

    setState((prev) => {
      const next = { ...prev };
      if (checked) next[id] = new Date().toISOString();
      else delete next[id];
      return next;
    });
    setPendingKeys((prev) => new Set(prev).add(id));

    startTransition(async () => {
      await toggleCatalogAchievement({ studentId, tutorId, category, key, checked });
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }

  const attainedCount =
    Object.keys(state).length + otherAchievements.length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">
          Check off each goal as the student attains it.
        </p>
        <span className="rounded-full border border-gold/30 bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-gold">
          {attainedCount} attained
        </span>
      </div>

      <div className="space-y-6">
        {ACHIEVEMENT_CATALOG.map((cat) => (
          <div key={cat.id}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {cat.letter}. {cat.title}
            </h3>
            <ul className="space-y-1">
              {cat.items.map((item) => {
                const id = `${cat.id}:${item.key}`;
                const checked = Boolean(state[id]);
                const pending = pendingKeys.has(id);
                return (
                  <li key={item.key}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                        checked
                          ? "border-gold/30 bg-gold-soft/60"
                          : "border-transparent hover:bg-surface-2"
                      } ${pending ? "opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(cat.id, item.key)}
                        className="h-4 w-4 shrink-0 rounded border-border bg-bg-elevated accent-[#f5c518]"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          checked ? "text-ink" : "text-muted"
                        }`}
                      >
                        {item.label}
                        {item.core && (
                          <span
                            title="National Reporting System core outcome measure"
                            className="ml-1.5 text-gold"
                          >
                            *
                          </span>
                        )}
                      </span>
                      {checked && (
                        <span className="shrink-0 text-[11px] text-muted-2">
                          {formatDate(state[id])}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <OtherAchievements
          studentId={studentId}
          tutorId={tutorId}
          items={otherAchievements}
        />
      </div>
    </div>
  );
}

function OtherAchievements({
  studentId,
  tutorId,
  items,
}: {
  studentId: string;
  tutorId: string;
  items: OtherAchievement[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        E. Other
      </h3>
      <ul className="mb-2 space-y-1">
        {items.map((a) => (
          <li key={a.id}>
            <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold-soft/60 px-3 py-2">
              <span className="flex-1 text-sm text-ink">{a.label}</span>
              {a.attainedAt && (
                <span className="shrink-0 text-[11px] text-muted-2">
                  {formatDate(a.attainedAt)}
                </span>
              )}
              <form action={deleteAchievement}>
                <input type="hidden" name="achievementId" value={a.id} />
                <input type="hidden" name="studentId" value={studentId} />
                <input type="hidden" name="tutorId" value={tutorId} />
                <DeleteButton title="Remove achievement" />
              </form>
            </div>
          </li>
        ))}
      </ul>
      <form
        action={addOtherAchievement}
        className="flex gap-2"
      >
        <input type="hidden" name="studentId" value={studentId} />
        <input type="hidden" name="tutorId" value={tutorId} />
        <input
          className={inputClass}
          name="label"
          placeholder="Add a custom achievement…"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border bg-surface-2 px-3 text-sm text-ink transition-colors hover:border-gold/50 hover:text-gold"
        >
          Add
        </button>
      </form>
    </div>
  );
}
