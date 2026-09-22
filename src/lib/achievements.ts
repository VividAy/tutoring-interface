// Achievement catalog, transcribed from the LVAEP paper
// "Student Monthly Attendance & Achievement Form". Categories and item
// order match the original A–D sections exactly. Items marked `core: true`
// carried an asterisk on the paper form (core outcome measures).
// "Other" is not listed here — tutors add free-text entries for it.

export type AchievementCategoryId =
  | "economic"
  | "educational"
  | "family"
  | "societal";

export type AchievementItem = {
  key: string;
  label: string;
  core?: boolean;
};

export type AchievementCategory = {
  id: AchievementCategoryId;
  letter: string;
  title: string;
  items: AchievementItem[];
};

export const ACHIEVEMENT_CATALOG: AchievementCategory[] = [
  {
    id: "economic",
    letter: "A",
    title: "Economic",
    items: [
      { key: "enter-employment", label: "Enter Employment", core: true },
      { key: "retain-employment", label: "Retain Employment", core: true },
      { key: "leave-public-assistance", label: "Leave public assistance" },
    ],
  },
  {
    id: "educational",
    letter: "B",
    title: "Educational",
    items: [
      {
        key: "work-based-learner-goal",
        label: "Achieve work-based project learner goal",
      },
      {
        key: "enter-occupational-skills-training",
        label: "Enter Occupational Skills Training Program",
        core: true,
      },
      {
        key: "enter-postsecondary-education",
        label: "Enter Postsecondary Education",
        core: true,
      },
      {
        key: "obtain-high-school-diploma",
        label: "Obtain High School Diploma",
        core: true,
      },
    ],
  },
  {
    id: "family",
    letter: "C",
    title: "Family",
    items: [
      { key: "help-more-with-school", label: "Help more frequently with school" },
      {
        key: "increase-teacher-contact",
        label: "Increase contact with child(ren)'s teachers",
      },
      {
        key: "school-activities-involvement",
        label: "More involvement in child(ren)'s school activities",
      },
      { key: "purchase-books-magazines", label: "Purchase books or magazines" },
      { key: "read-to-children", label: "Read to child(ren)" },
      {
        key: "visit-library",
        label: "Visit the library (with/for child(ren))",
      },
    ],
  },
  {
    id: "societal",
    letter: "D",
    title: "Societal / Community",
    items: [
      { key: "obtain-citizenship", label: "Obtain citizenship", core: true },
      { key: "achieve-civics-skills", label: "Achieve civics skills" },
      {
        key: "community-involvement",
        label: "Increase involvement in community activities",
      },
      { key: "vote-or-register", label: "Vote or register to vote" },
    ],
  },
];

export const ALL_CATALOG_KEYS = new Set(
  ACHIEVEMENT_CATALOG.flatMap((c) => c.items.map((i) => i.key))
);

export function findCatalogItem(key: string) {
  for (const category of ACHIEVEMENT_CATALOG) {
    const item = category.items.find((i) => i.key === key);
    if (item) return { category, item };
  }
  return null;
}

// Internal attendance codes from the paper form's legend.
export const SESSION_CODES = {
  TA: "Tutor Absent",
  SA: "Student Absent",
  H: "Holiday",
} as const;

export type SessionCode = keyof typeof SESSION_CODES;

export const REPORT_MONTHS = [
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
] as const;

// Given a JS month index (0 = Jan), return its column index in the
// program's July–June fiscal-year layout used on the paper form.
export function fiscalMonthIndex(jsMonth: number): number {
  return (jsMonth + 6) % 12;
}
