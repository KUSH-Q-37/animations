import { ContributionDay, ContributionLevel, ContributionStatsData } from "./github.types";

/**
 * Calculates contribution intensity quartile based on count and max count.
 */
export function calculateContributionLevel(
  count: number,
  maxCount: number
): ContributionLevel {
  if (count <= 0) return "NONE";
  if (maxCount <= 4) {
    if (count === 1) return "FIRST_QUARTILE";
    if (count === 2) return "SECOND_QUARTILE";
    if (count === 3) return "THIRD_QUARTILE";
    return "FOURTH_QUARTILE";
  }

  const q1 = Math.max(1, Math.ceil(maxCount * 0.25));
  const q2 = Math.max(q1 + 1, Math.ceil(maxCount * 0.5));
  const q3 = Math.max(q2 + 1, Math.ceil(maxCount * 0.75));

  if (count <= q1) return "FIRST_QUARTILE";
  if (count <= q2) return "SECOND_QUARTILE";
  if (count <= q3) return "THIRD_QUARTILE";
  return "FOURTH_QUARTILE";
}

/**
 * Checks if a date string (YYYY-MM-DD) belongs to the given year.
 */
export function isDateInYear(dateStr: string, year: number): boolean {
  return dateStr.startsWith(`${year}-`);
}

/**
 * Calculates statistics (total contributions, active days, longest streak)
 * specifically for days within the specified year.
 */
export function calculateStats(
  days: ContributionDay[],
  year: number
): ContributionStatsData {
  // Filter only days within the target year and sort ascending by date
  const yearDays = days
    .filter((d) => isDateInYear(d.date, year))
    .sort((a, b) => a.date.localeCompare(b.date));

  let totalContributions = 0;
  let activeDays = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < yearDays.length; i++) {
    const day = yearDays[i];
    const count = day.contributionCount;

    if (count > 0) {
      totalContributions += count;
      activeDays++;
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return {
    totalContributions,
    activeDays,
    longestStreak,
  };
}

/**
 * Normalizes and formats a date string to a human-readable format.
 * Uses UTC date parts to prevent timezone shifts.
 */
export function formatContributionDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Generates an empty full-year calendar grid (starting from the Sunday
 * before Jan 1 through the Saturday after Dec 31) with contributionCount: 0.
 * Ensures the calendar grid is always visually rendered even if an account has no data.
 */
export function generateEmptyYearDays(year: number): ContributionDay[] {
  const days: ContributionDay[] = [];

  // Start from Jan 1 of the given year
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Weekday = jan1.getUTCDay();

  // Preceding Sunday (0)
  const startDate = new Date(Date.UTC(year, 0, 1 - jan1Weekday));

  // Dec 31 of the given year
  const dec31 = new Date(Date.UTC(year, 11, 31));
  const dec31Weekday = dec31.getUTCDay();

  // Following Saturday (6)
  const endDate = new Date(Date.UTC(year, 11, 31 + (6 - dec31Weekday)));

  const current = new Date(startDate);
  while (current <= endDate) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, "0");
    const d = String(current.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const weekday = current.getUTCDay();

    days.push({
      date: dateStr,
      contributionCount: 0,
      contributionLevel: "NONE",
      weekday,
    });

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
}
