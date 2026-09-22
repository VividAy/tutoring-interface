export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function csvRow(cells: (string | number)[]): string {
  return cells.map((c) => csvEscape(String(c))).join(",") + "\r\n";
}

export const CSV_BLANK = "\r\n";

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function generatedOn(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function slugify(s: string): string {
  return s.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
}
