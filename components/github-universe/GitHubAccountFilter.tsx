"use client";

import React from "react";
import { GITHUB_ACCOUNTS } from "@/lib/github/github.config";
import { AccountContributionData } from "@/lib/github/github.types";

interface GitHubAccountFilterProps {
  selectedAccount: string;
  onSelectAccount: (accountId: string) => void;
  accountsData?: AccountContributionData[];
}

export default function GitHubAccountFilter({
  selectedAccount,
  onSelectAccount,
  accountsData,
}: GitHubAccountFilterProps) {
  const getAccountCount = (username: string): number | null => {
    if (!accountsData) return null;
    const account = accountsData.find(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    );
    return account ? account.total : null;
  };

  const allAccountsTotal = accountsData
    ? accountsData.reduce((acc, a) => acc + (a.total || 0), 0)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-circuit tracking-[0.2em] text-zinc-400 uppercase font-bold mr-1">
        Filter:
      </span>

      {/* "All Accounts" Option */}
      <button
        type="button"
        data-no-cursor-scale="true"
        onClick={() => onSelectAccount("all")}
        className={`px-3.5 py-1.5 text-xs font-circuit tracking-wider uppercase transition-all duration-200 border cursor-none pointer-events-auto font-bold ${
          selectedAccount === "all"
            ? "bg-[#00ff33] text-black border-[#00ff33] shadow-[0_0_10px_rgba(0,255,51,0.4)]"
            : "bg-black/60 text-zinc-400 border-zinc-800 hover:border-[#00ff33]/50 hover:text-white"
        }`}
      >
        All Accounts
        {allAccountsTotal !== null && (
          <span
            className={`ml-1.5 text-[10px] ${
              selectedAccount === "all" ? "text-black/80 font-bold" : "text-zinc-500"
            }`}
          >
            ({allAccountsTotal.toLocaleString()})
          </span>
        )}
      </button>

      {/* 4 Distinct GitHub Accounts */}
      {GITHUB_ACCOUNTS.map((account) => {
        const isSelected = selectedAccount === account.username;
        const total = getAccountCount(account.username);

        return (
          <button
            key={account.id}
            type="button"
            data-no-cursor-scale="true"
            onClick={() => onSelectAccount(account.username)}
            className={`px-3.5 py-1.5 text-xs font-circuit tracking-wider uppercase transition-all duration-200 border cursor-none pointer-events-auto flex items-center gap-1.5 font-bold ${
              isSelected
                ? "bg-[#00ff33] text-black border-[#00ff33] shadow-[0_0_10px_rgba(0,255,51,0.4)]"
                : "bg-black/60 text-zinc-400 border-zinc-800 hover:border-[#00ff33]/50 hover:text-white"
            }`}
          >
            <span>{account.username}</span>
            {total !== null && (
              <span
                className={`text-[9px] ${
                  isSelected ? "text-black/80 font-bold" : "text-zinc-500"
                }`}
              >
                ({total.toLocaleString()})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
