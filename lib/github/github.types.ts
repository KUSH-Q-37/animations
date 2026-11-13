export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export interface ContributingAccount {
  username: string;
  count: number;
}

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  contributionCount: number;
  contributionLevel: ContributionLevel;
  weekday?: number; // 0 (Sun) to 6 (Sat)
  contributingAccounts?: ContributingAccount[];
}

export interface AccountContributionData {
  username: string;
  total: number;
  days: ContributionDay[];
  availableYears: number[];
  error?: string;
}

export interface ContributionStatsData {
  totalContributions: number;
  activeDays: number;
  longestStreak: number;
}

export interface ContributionsApiResponse {
  year: number;
  complete: boolean;
  accounts: AccountContributionData[];
  combined: ContributionDay[];
  years: number[];
  errors: string[];
  stats: ContributionStatsData;
}

// GitHub GraphQL API Response Shapes
export interface GraphQLContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: ContributionLevel;
  weekday: number;
}

export interface GraphQLContributionWeek {
  contributionDays: GraphQLContributionDay[];
}

export interface GraphQLContributionCalendar {
  totalContributions: number;
  weeks: GraphQLContributionWeek[];
}

export interface GraphQLContributionsCollection {
  contributionYears: number[];
  contributionCalendar: GraphQLContributionCalendar;
}

export interface GraphQLUserResponse {
  data?: {
    user?: {
      contributionsCollection?: GraphQLContributionsCollection;
    } | null;
  };
  errors?: Array<{
    message: string;
    type?: string;
    path?: string[];
  }>;
}
