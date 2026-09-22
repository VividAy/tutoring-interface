// Default password scheme: first name, lowercase, + "123" (e.g. "Maria
// Santos" -> "maria123"). Simple and per-person, per the program's request —
// not meant to be secure, just no longer a single shared password.
export function defaultTutorPassword(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const clean = first.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean || "tutor"}123`;
}
