import {
  CACHE_TTL_MS,
  GITHUB_ACCOUNTS,
  GITHUB_GRAPHQL_ENDPOINT,
} from "./github.config";
import { GET_USER_CONTRIBUTIONS_QUERY } from "./github.graphql";
import {
  AccountContributionData,
  ContributionDay,
  ContributionsApiResponse,
  GraphQLUserResponse,
} from "./github.types";
import {
  calculateContributionLevel,
  calculateStats,
  generateEmptyYearDays,
  isDateInYear,
} from "./github.utils";

// In-memory cache for serverless invocation reuse
interface CacheEntry {
  timestamp: number;
  data: ContributionsApiResponse;
}

const memoryCache = new Map<number, CacheEntry>();

/**
 * Fetches contribution data for a single account from GitHub GraphQL API.
 */
async function fetchAccountContributions(
  username: string,
  token: string,
  year: number
): Promise<{
  days: ContributionDay[];
  availableYears: number[];
  total: number;
}> {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "Kush-Portfolio-GitHub-Universe",
    },
    body: JSON.stringify({
      query: GET_USER_CONTRIBUTIONS_QUERY,
      variables: {
        username,
        from,
        to,
      },
    }),
    // Route handlers in Next.js 16 should fetch dynamically
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(`Authentication failed for ${username} (HTTP 401: Invalid or expired token)`);
    }
    if (response.status === 403) {
      throw new Error(`Access forbidden or rate limit exceeded for ${username} (HTTP 403)`);
    }
    throw new Error(`GitHub API returned HTTP ${response.status} for ${username}`);
  }

  const result: GraphQLUserResponse = await response.json();

  if (result.errors && result.errors.length > 0) {
    const errorMsg = result.errors.map((e) => e.message).join(", ");
    throw new Error(`GraphQL error for ${username}: ${errorMsg}`);
  }

  const user = result.data?.user;
  if (!user || !user.contributionsCollection) {
    throw new Error(`No contribution data returned for user "${username}"`);
  }

  const collection = user.contributionsCollection;
  const availableYears = collection.contributionYears || [];
  const calendar = collection.contributionCalendar;

  const days: ContributionDay[] = [];
  if (calendar && calendar.weeks) {
    for (const week of calendar.weeks) {
      if (week.contributionDays) {
        for (const day of week.contributionDays) {
          days.push({
            date: day.date,
            contributionCount: day.contributionCount,
            contributionLevel: day.contributionLevel,
            weekday: day.weekday,
          });
        }
      }
    }
  }

  // Calculate annual total specifically for dates within the requested year
  const stats = calculateStats(days, year);

  return {
    days,
    availableYears,
    total: stats.totalContributions,
  };
}

/**
 * Main service to fetch, normalize, and aggregate contributions across all configured accounts.
 */
export async function getContributionsData(
  year: number
): Promise<ContributionsApiResponse> {
  // Check memory cache first
  const cached = memoryCache.get(year);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    // Only return cached data if it was a complete, successful fetch
    if (cached.data.complete) {
      return cached.data;
    }
  }

  const accountResults: AccountContributionData[] = [];
  const errors: string[] = [];
  const allYearsSet = new Set<number>();
  allYearsSet.add(year);

  // Fetch accounts in parallel
  const fetchPromises = GITHUB_ACCOUNTS.map(async (account) => {
    const token = process.env[account.tokenEnv];

    if (!token) {
      return {
        username: account.username,
        total: 0,
        days: [],
        availableYears: [],
        error: `Token not configured (${account.tokenEnv})`,
      };
    }

    try {
      const data = await fetchAccountContributions(account.username, token, year);
      return {
        username: account.username,
        total: data.total,
        days: data.days,
        availableYears: data.availableYears,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        username: account.username,
        total: 0,
        days: [],
        availableYears: [],
        error: message,
      };
    }
  });

  const settledResults = await Promise.all(fetchPromises);

  for (const res of settledResults) {
    accountResults.push({
      ...res,
      days: res.days.length > 0 ? res.days : generateEmptyYearDays(year),
    });
    if (res.error) {
      errors.push(`Account @${res.username}: ${res.error}`);
    } else {
      res.availableYears.forEach((y) => allYearsSet.add(y));
    }
  }

  // Build combined daily contributions
  // Find a template account with days returned to preserve the week calendar structure
  const templateAccount = accountResults.find((a) => a.days.length > 0);
  const combinedDaysMap = new Map<
    string,
    {
      date: string;
      contributionCount: number;
      weekday?: number;
      contributingAccounts: Array<{ username: string; count: number }>;
    }
  >();

  // Use template account days or generate standard empty year days if accounts failed
  const baseDays =
    templateAccount && templateAccount.days.length > 0
      ? templateAccount.days
      : generateEmptyYearDays(year);

  for (const d of baseDays) {
    combinedDaysMap.set(d.date, {
      date: d.date,
      contributionCount: 0,
      weekday: d.weekday,
      contributingAccounts: [],
    });
  }

  // Sum counts across all accounts and track contributing accounts
  for (const account of accountResults) {
    for (const d of account.days) {
      const existing = combinedDaysMap.get(d.date);
      if (existing) {
        existing.contributionCount += d.contributionCount;
        if (d.contributionCount > 0) {
          existing.contributingAccounts.push({
            username: account.username,
            count: d.contributionCount,
          });
        }
      } else {
        combinedDaysMap.set(d.date, {
          date: d.date,
          contributionCount: d.contributionCount,
          weekday: d.weekday,
          contributingAccounts:
            d.contributionCount > 0
              ? [{ username: account.username, count: d.contributionCount }]
              : [],
        });
      }
    }
  }

  // Sort combined days by date
  const combinedSorted = Array.from(combinedDaysMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Find max count for combined days within the target year to scale quartiles
  let maxCount = 0;
  for (const d of combinedSorted) {
    if (isDateInYear(d.date, year) && d.contributionCount > maxCount) {
      maxCount = d.contributionCount;
    }
  }

  // Map to final ContributionDay with computed intensity level and account attribution
  const combined: ContributionDay[] = combinedSorted.map((d) => ({
    date: d.date,
    contributionCount: d.contributionCount,
    contributionLevel: calculateContributionLevel(d.contributionCount, maxCount),
    weekday: d.weekday,
    contributingAccounts: d.contributingAccounts,
  }));

  // Calculate combined statistics for the target year
  const combinedStats = calculateStats(combined, year);

  // Sorted unique available years (descending: 2026, 2025, 2024...)
  const sortedYears = Array.from(allYearsSet).sort((a, b) => b - a);

  // Completeness indicator: complete only if 0 errors and all configured accounts succeeded
  const complete =
    errors.length === 0 &&
    accountResults.length === GITHUB_ACCOUNTS.length &&
    accountResults.every((a) => !a.error);

  const responseData: ContributionsApiResponse = {
    year,
    complete,
    accounts: accountResults,
    combined,
    years: sortedYears,
    errors,
    stats: combinedStats,
  };

  // Only cache if complete is true (no missing tokens or API errors)
  if (complete) {
    memoryCache.set(year, {
      timestamp: Date.now(),
      data: responseData,
    });
  }

  return responseData;
}
