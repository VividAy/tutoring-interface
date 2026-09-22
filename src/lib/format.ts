export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic accent color per person, drawn from the theme's palette
// (dark blue / yellow / a couple of supporting tones) so avatars stay
// on-brand instead of picking arbitrary hues.
const AVATAR_PALETTE = [
  "#1e3a8a", // deep blue
  "#f5c518", // yellow
  "#2f5aa8", // lighter blue
  "#c9a007", // deep gold
  "#374151", // slate
  "#b45309", // amber
];

export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatHours(hours: number): string {
  return hours % 1 === 0 ? String(hours) : hours.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function monthLabel(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
