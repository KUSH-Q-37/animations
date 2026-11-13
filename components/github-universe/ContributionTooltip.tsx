"use client";

import React from "react";
import { formatContributionDate } from "@/lib/github/github.utils";
import { ContributingAccount } from "@/lib/github/github.types";

interface ContributionTooltipProps {
  date: string;
  count: number;
  accountLabel: string;
  contributingAccounts?: ContributingAccount[];
  x: number;
  y: number;
  visible: boolean;
}

export default function ContributionTooltip({
  date,
  count,
  accountLabel,
  contributingAccounts,
  x,
  y,
  visible,
}: ContributionTooltipProps) {
  if (!visible) return null;

  const countText =
    count === 0
      ? "No contributions"
      : count === 1
      ? "1 contribution"
      : `${count.toLocaleString()} contributions`;

  const hasSpecificAccounts =
    contributingAccounts && contributingAccounts.length > 0;

  return (
    <div
      className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3"
      style={{ left: `${x}px`, top: `${y - 8}px` }}
    >
      <div className="bg-[#0a0a0a] border border-[#00ff33]/60 px-3 py-2 rounded-sm shadow-[0_0_15px_rgba(0,255,51,0.25)] text-center min-w-[130px] whitespace-nowrap">
        <div className="text-xs font-bold text-white font-mono">{countText}</div>
        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
          {formatContributionDate(date)}
        </div>

        {hasSpecificAccounts ? (
          <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80 flex flex-col gap-0.5 text-left">
            <span className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
              By Account:
            </span>
            {contributingAccounts.map((acc) => (
              <div
                key={acc.username}
                className="flex items-center justify-between gap-3 text-[10px] font-mono"
              >
                <span className="text-[#00ff33] font-bold">@{acc.username}</span>
                <span className="text-zinc-400">+{acc.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[9px] text-[#00ff33] font-mono tracking-wider uppercase mt-1">
            {accountLabel}
          </div>
        )}
      </div>
      <div className="w-2 h-2 bg-[#0a0a0a] border-r border-b border-[#00ff33]/60 transform rotate-45 mx-auto -mt-1" />
    </div>
  );
}
