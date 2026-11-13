"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  ContributionsApiResponse,
  ContributionStatsData,
  ContributionDay,
} from "@/lib/github/github.types";
import { calculateStats } from "@/lib/github/github.utils";
import GitHubAccountFilter from "./GitHubAccountFilter";
import GitHubYearSelector from "./GitHubYearSelector";
import ContributionStats from "./ContributionStats";
import ContributionHeatmap from "./ContributionHeatmap";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function GitHubUniverse() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  const [cacheByYear, setCacheByYear] = useState<
    Record<number, ContributionsApiResponse>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  useEffect(() => {
    // If cached and not a forced refresh, no need to fetch
    if (cacheByYear[selectedYear] && refreshIndex === 0) {
      return;
    }

    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(`/api/github/contributions?year=${selectedYear}`);
        const json = await res.json();

        if (!isSubscribed) return;

        if (!res.ok) {
          throw new Error(
            json.message ||
              json.error ||
              `HTTP ${res.status}: Failed to fetch contributions`
          );
        }

        setCacheByYear((prev) => ({
          ...prev,
          [selectedYear]: json,
        }));
        setApiError(null);
      } catch (err) {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : String(err);
        setApiError(msg);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [selectedYear, refreshIndex, cacheByYear]);

  const activeApiResponse = cacheByYear[selectedYear] || null;

  // Compute active dataset for selected filter
  const { activeDays, activeStats, isAccountError, accountErrorMessage } =
    useMemo(() => {
      if (!activeApiResponse) {
        return {
          activeDays: [] as ContributionDay[],
          activeStats: {
            totalContributions: 0,
            activeDays: 0,
            longestStreak: 0,
          } as ContributionStatsData,
          isAccountError: false,
          accountErrorMessage: null,
        };
      }

      if (selectedAccount === "all") {
        return {
          activeDays: activeApiResponse.combined,
          activeStats: activeApiResponse.stats,
          isAccountError: false,
          accountErrorMessage: null,
        };
      }

      const account = activeApiResponse.accounts.find(
        (a) => a.username.toLowerCase() === selectedAccount.toLowerCase()
      );

      if (!account) {
        return {
          activeDays: [] as ContributionDay[],
          activeStats: {
            totalContributions: 0,
            activeDays: 0,
            longestStreak: 0,
          } as ContributionStatsData,
          isAccountError: true,
          accountErrorMessage: `Account @${selectedAccount} not found.`,
        };
      }

      if (account.error) {
        return {
          activeDays: account.days || [],
          activeStats: {
            totalContributions: 0,
            activeDays: 0,
            longestStreak: 0,
          } as ContributionStatsData,
          isAccountError: true,
          accountErrorMessage: account.error,
        };
      }

      const calculated = calculateStats(account.days, selectedYear);

      return {
        activeDays: account.days,
        activeStats: calculated,
        isAccountError: false,
        accountErrorMessage: null,
      };
    }, [activeApiResponse, selectedAccount, selectedYear]);

  // Union of years across responses
  const availableYears = useMemo(() => {
    if (activeApiResponse && activeApiResponse.years?.length > 0) {
      return activeApiResponse.years;
    }
    return [currentYear];
  }, [activeApiResponse, currentYear]);

  return (
    <section
      id="github-universe"
      className="py-24 px-4 md:px-12 bg-[#0a0a0a] relative z-10 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-900 pb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#00ff33] uppercase">
                GitHub Universe
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff33] shadow-[0_0_8px_rgba(0,255,51,0.8)]" />
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                4 Linked Accounts
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase text-zinc-100">
              Contribution Activity
            </h2>
            <p className="mt-2 text-sm md:text-base text-zinc-400 font-light max-w-xl">
              One view of my development activity across all my GitHub accounts.
              Aggregating commits, pull requests, code reviews, and qualifying
              contributions.
            </p>
          </div>

          {/* Year Selector */}
          <div className="self-start md:self-end">
            <GitHubYearSelector
              years={availableYears}
              selectedYear={selectedYear}
              onSelectYear={(y) => setSelectedYear(y)}
              isLoading={isLoading}
            />
          </div>
        </motion.div>

        {/* Account Filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <GitHubAccountFilter
            selectedAccount={selectedAccount}
            onSelectAccount={(accId) => setSelectedAccount(accId)}
            accountsData={activeApiResponse?.accounts}
          />
        </motion.div>

        {/* Warning Banner: Partial Account Failures / Missing Environment Tokens */}
        {activeApiResponse && !activeApiResponse.complete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 border border-yellow-500/40 bg-yellow-950/10 rounded-sm text-zinc-300 font-mono text-xs flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              {activeApiResponse.accounts.every((a) => !!a.error)
                ? "Token Configuration Required"
                : "Notice: Partial Contribution Data"}
            </div>

            <p className="text-zinc-400 font-sans text-xs">
              {activeApiResponse.accounts.every((a) => !!a.error)
                ? "To display live contribution activity across your 4 GitHub accounts, create personal access tokens with `read:user` permission and add them to your `.env.local` file:"
                : "Some GitHub account tokens are not configured in your environment variables or failed to authenticate. The aggregate statistics and calendar currently reflect only the responding accounts:"}
            </p>

            {activeApiResponse.errors && activeApiResponse.errors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeApiResponse.errors.map((err, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-black/80 border border-yellow-500/30 text-[11px] text-yellow-300/90 rounded-sm"
                  >
                    {err}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-1 pt-3 border-t border-yellow-500/20 text-[11px] text-zinc-400 flex flex-col gap-1">
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                Quick Setup (.env.local):
              </span>
              <pre className="bg-black/70 p-2.5 rounded border border-zinc-800 text-[10px] text-zinc-300 overflow-x-auto">
{`GITHUB_TOKEN_1=ghp_... # Token for kushvmone1
GITHUB_TOKEN_2=ghp_... # Token for KUSH-Q-37
GITHUB_TOKEN_3=ghp_... # Token for Kush514
GITHUB_TOKEN_4=ghp_... # Token for monikavmone`}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Specific Account Failure Banner */}
        {isAccountError && accountErrorMessage && (
          <div className="p-6 border border-zinc-800 bg-[#0a0a0a] text-center font-mono">
            <span className="text-zinc-500 text-xs block mb-1 uppercase tracking-widest">
              Account Status
            </span>
            <p className="text-zinc-300 text-sm">{accountErrorMessage}</p>
            <p className="text-zinc-500 text-xs mt-2">
              Configure this account&apos;s token in{" "}
              <code className="text-[#00ff33]">.env.local</code> to view its
              contributions.
            </p>
          </div>
        )}

        {/* Top-Level API Error Banner */}
        {apiError && (
          <div className="p-6 border border-red-500/40 bg-red-950/10 text-center font-mono flex flex-col items-center gap-3">
            <span className="text-red-400 text-xs uppercase tracking-widest font-bold">
              Failed to Load Contributions
            </span>
            <p className="text-zinc-400 text-xs max-w-md">{apiError}</p>
            <button
              type="button"
              data-no-cursor-scale="true"
              onClick={() => {
                setIsLoading(true);
                setRefreshIndex((prev) => prev + 1);
              }}
              className="px-4 py-2 border border-[#00ff33] text-[#00ff33] hover:bg-[#00ff33] hover:text-black transition-colors text-xs uppercase tracking-widest font-bold cursor-none pointer-events-auto"
            >
              Retry Request
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !activeApiResponse && (
          <div className="flex flex-col gap-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-zinc-900/60 border border-zinc-800/80 rounded-sm"
                />
              ))}
            </div>
            <div className="h-64 bg-zinc-900/40 border border-zinc-800/80 rounded-sm" />
          </div>
        )}

        {/* Content Display: Stats + Heatmap */}
        {activeApiResponse && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUpVariant}
            className="flex flex-col gap-8"
          >
            {/* 3 Metric Cards */}
            <ContributionStats
              stats={activeStats}
              accountFilter={selectedAccount}
              year={selectedYear}
            />

            {/* Custom Interactive Heatmap */}
            <ContributionHeatmap
              days={activeDays}
              year={selectedYear}
              accountFilter={selectedAccount}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
}
