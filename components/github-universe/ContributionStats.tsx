"use client";

import React from "react";
import { motion } from "framer-motion";
import { ContributionStatsData } from "@/lib/github/github.types";

interface ContributionStatsProps {
  stats: ContributionStatsData;
  accountFilter: string;
  year: number;
}

export default function ContributionStats({
  stats,
  accountFilter,
  year,
}: ContributionStatsProps) {
  const isCombined = accountFilter === "all";

  const statItems = [
    {
      id: "total",
      label: "Total Contributions",
      value: stats.totalContributions.toLocaleString(),
      subtitle: isCombined
        ? `Combined activity for ${year}`
        : `@${accountFilter} contributions in ${year}`,
    },
    {
      id: "active-days",
      label: "Active Days",
      value: stats.activeDays.toLocaleString(),
      subtitle: isCombined
        ? "Days with qualifying activity"
        : `Days active on @${accountFilter}`,
    },
    {
      id: "streak",
      label: "Longest Active Streak",
      value: `${stats.longestStreak} ${
        stats.longestStreak === 1 ? "Day" : "Days"
      }`,
      subtitle: isCombined
        ? "Consecutive days across all accounts"
        : `Consecutive active days on @${accountFilter}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full">
      {statItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-[#0a0a0a] border border-zinc-800 px-5 py-3.5 hover:border-[#00ff33]/50 transition-colors duration-500 shadow-lg overflow-hidden group"
        >
          {/* Portfolio Signature Corner Accents */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-[#00ff33]" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-[#00ff33]" />

          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase block mb-0.5">
                {item.label}
              </span>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white group-hover:text-[#00ff33] transition-colors duration-300">
                {item.value}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-zinc-900/80 flex items-center justify-between">
              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
                {item.subtitle}
              </span>
              <span className="text-[#00ff33] font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
