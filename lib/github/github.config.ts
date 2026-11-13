export interface GitHubAccountConfig {
  id: string;
  username: string;
  tokenEnv: string;
}

export const GITHUB_ACCOUNTS: readonly GitHubAccountConfig[] = [
  {
    id: "kushvmone1",
    username: "kushvmone1",
    tokenEnv: "GITHUB_TOKEN_1",
  },
  {
    id: "kush-q-37",
    username: "KUSH-Q-37",
    tokenEnv: "GITHUB_TOKEN_2",
  },
  {
    id: "kush514",
    username: "Kush514",
    tokenEnv: "GITHUB_TOKEN_3",
  },
  {
    id: "monikavmone",
    username: "monikavmone",
    tokenEnv: "GITHUB_TOKEN_4",
  },
] as const;

export const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

// Cache duration: 6 hours in milliseconds
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
