"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import { GITHUB_ACCOUNTS } from "@/lib/github/github.config";
import { ContributionDay, ContributionLevel, ContributingAccount } from "@/lib/github/github.types";
import { isDateInYear, generateEmptyYearDays } from "@/lib/github/github.utils";
import ContributionTooltip from "./ContributionTooltip";

interface ContributionHeatmapProps {
  days: ContributionDay[];
  year: number;
  accountFilter: string;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function ContributionHeatmap({
  days,
  year,
  accountFilter,
}: ContributionHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    date: string;
    count: number;
    contributingAccounts?: ContributingAccount[];
    x: number;
    y: number;
  }>({
    visible: false,
    date: "",
    count: 0,
    contributingAccounts: undefined,
    x: 0,
    y: 0,
  });

  // Close tooltip on outside click/tap
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Build grid of weeks (52-53 columns, 7 rows: Sunday=0 to Saturday=6)
  const { weeks, monthLabels } = useMemo(() => {
    const effectiveDays =
      days && days.length > 0 ? days : generateEmptyYearDays(year);

    // Sort days chronologically
    const sorted = [...effectiveDays].sort((a, b) => a.date.localeCompare(b.date));

    // Group into weeks
    const weeksList: (ContributionDay | null)[][] = [];
    let currentWeek: (ContributionDay | null)[] = new Array(7).fill(null);

    // Track first day of each month for labels
    const monthHeaders: { colIndex: number; name: string }[] = [];
    let lastSeenMonth = -1;

    sorted.forEach((day) => {
      const parts = day.date.split("-").map(Number);
      const dayDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      const weekday =
        day.weekday !== undefined ? day.weekday : dayDate.getUTCDay();
      const month = parts[1] - 1;

      // Start a new week on Sunday (weekday === 0) if currentWeek already has days
      if (weekday === 0 && currentWeek.some((d) => d !== null)) {
        weeksList.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }

      currentWeek[weekday] = day;

      // Record month label when a month is first encountered in the selected year
      if (
        isDateInYear(day.date, year) &&
        month !== lastSeenMonth &&
        parts[2] <= 14 // Appear near the start of the month
      ) {
        monthHeaders.push({
          colIndex: weeksList.length,
          name: MONTH_NAMES[month],
        });
        lastSeenMonth = month;
      }
    });

    if (currentWeek.some((d) => d !== null)) {
      weeksList.push(currentWeek);
    }

    return { weeks: weeksList, monthLabels: monthHeaders };
  }, [days, year]);

  const getCellColorClass = (level: ContributionLevel, inYear: boolean) => {
    if (!inYear) {
      return "bg-[#111111] border-zinc-900/40 opacity-30";
    }

    switch (level) {
      case "FOURTH_QUARTILE":
        return "bg-[#00ff33] border-[#77ff99] shadow-[0_0_8px_rgba(0,255,51,0.6)]";
      case "THIRD_QUARTILE":
        return "bg-[#00c732] border-[#00ff33]/50";
      case "SECOND_QUARTILE":
        return "bg-[#008722] border-[#00aa2e]/40";
      case "FIRST_QUARTILE":
        return "bg-[#004d12] border-[#006619]/40";
      case "NONE":
      default:
        return "bg-[#141414] border-zinc-900/80 hover:border-zinc-700";
    }
  };

  const handleCellInteraction = (
    day: ContributionDay | null,
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!day) return;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setTooltip({
      visible: true,
      date: day.date,
      count: day.contributionCount,
      contributingAccounts:
        accountFilter === "all" ? day.contributingAccounts : undefined,
      x: clientX,
      y: clientY,
    });
  };

  const accountDisplayName =
    accountFilter === "all" ? "All Accounts" : `@${accountFilter}`;

  return (
    <div
      ref={containerRef}
      className="relative bg-[#0a0a0a] border border-zinc-800 p-5 md:p-8 w-full overflow-hidden shadow-2xl"
    >
      <ContributionTooltip
        visible={tooltip.visible}
        date={tooltip.date}
        count={tooltip.count}
        contributingAccounts={tooltip.contributingAccounts}
        accountLabel={accountDisplayName}
        x={tooltip.x}
        y={tooltip.y}
      />

      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-900 gap-4">
        <div>
          <span className="text-xs font-circuit tracking-[0.2em] text-[#00ff33] uppercase font-bold">
            Contribution Calendar
          </span>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h3 className="font-aerodome text-base sm:text-lg md:text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <span>{accountDisplayName}</span>
              <span className="text-zinc-600">·</span>
              <span className="font-gear font-bold text-[#00ff33]">{year}</span>
            </h3>

            {accountFilter !== "all" ? (
              <a
                href={`https://github.com/${accountFilter}`}
                target="_blank"
                rel="noreferrer"
                data-no-cursor-scale="true"
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#00ff33]/50 text-[#00ff33] hover:bg-[#00ff33] hover:text-black active:bg-[#00ff33] active:text-black transition-all duration-300 font-mono text-[10px] uppercase tracking-widest font-bold cursor-none pointer-events-auto shadow-[0_0_8px_rgba(0,255,51,0.2)]"
              >
                <FaGithub className="w-3.5 h-3.5" />
                <span>Visit @{accountFilter}</span>
                <span className="text-xs">↗</span>
              </a>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5">
                {GITHUB_ACCOUNTS.map((acc) => (
                  <a
                    key={acc.id}
                    href={`https://github.com/${acc.username}`}
                    target="_blank"
                    rel="noreferrer"
                    data-no-cursor-scale="true"
                    className="inline-flex items-center gap-1 px-2 py-0.5 border border-zinc-800 bg-black/60 text-zinc-400 hover:text-[#00ff33] hover:border-[#00ff33]/50 transition-colors text-[10px] font-mono uppercase tracking-wider cursor-none pointer-events-auto"
                  >
                    <FaGithub className="w-2.5 h-2.5" />
                    <span>{acc.username}</span>
                    <span className="text-[#00ff33] text-[9px]">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Less
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#141414] border border-zinc-900" />
            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#004d12] border border-[#006619]/40" />
            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#008722] border border-[#00aa2e]/40" />
            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#00c732] border border-[#00ff33]/50" />
            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#00ff33] border-[#77ff99] shadow-[0_0_8px_rgba(0,255,51,0.6)]" />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            More
          </span>
        </div>
      </div>

      {/* Responsive Calendar Container */}
      <div className="overflow-x-auto custom-scrollbar pt-6 pb-2">
        <div className="min-w-[1060px] flex">
          {/* Weekday Row Labels (Mon, Wed, Fri) aligned to cells */}
          <div className="flex flex-col gap-[3.5px] pr-3 pt-6 select-none pointer-events-none">
            <span className="h-4 text-[10px] font-mono text-transparent flex items-center leading-none">
              Sun
            </span>
            <span className="h-4 text-[10px] font-mono text-zinc-400 flex items-center leading-none">
              Mon
            </span>
            <span className="h-4 text-[10px] font-mono text-transparent flex items-center leading-none">
              Tue
            </span>
            <span className="h-4 text-[10px] font-mono text-zinc-400 flex items-center leading-none">
              Wed
            </span>
            <span className="h-4 text-[10px] font-mono text-transparent flex items-center leading-none">
              Thu
            </span>
            <span className="h-4 text-[10px] font-mono text-zinc-400 flex items-center leading-none">
              Fri
            </span>
            <span className="h-4 text-[10px] font-mono text-transparent flex items-center leading-none">
              Sat
            </span>
          </div>

          {/* Grid columns */}
          <div className="flex-1">
            {/* Month Labels on top */}
            <div className="relative h-6 mb-2 select-none text-[11px] font-circuit font-medium text-zinc-300">
              {monthLabels.map((m, idx) => (
                <span
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${m.colIndex * 19.5}px`,
                  }}
                >
                  {m.name}
                </span>
              ))}
            </div>

            {/* Week Columns */}
            <div className="flex gap-[3.5px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={dIdx}
                          className="w-4 h-4 rounded-[2px] bg-transparent"
                        />
                      );
                    }

                    const inYear = isDateInYear(day.date, year);
                    const colorClass = getCellColorClass(
                      day.contributionLevel,
                      inYear
                    );

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => handleCellInteraction(day, e)}
                        onMouseMove={(e) => handleCellInteraction(day, e)}
                        onMouseLeave={() =>
                          setTooltip((prev) => ({ ...prev, visible: false }))
                        }
                        onTouchStart={(e) => handleCellInteraction(day, e)}
                        className={`w-4 h-4 rounded-[2px] border cursor-none pointer-events-auto transition-transform duration-100 hover:scale-125 hover:z-20 hover:border-white ${colorClass}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Footer Note */}
      <div className="mt-4 pt-3 border-t border-zinc-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-circuit text-zinc-500 uppercase tracking-widest gap-2">
        <span>Activity includes commits, PRs, issues & code reviews</span>
        <span className="text-[#00ff33]/80">
          Source: Official GitHub GraphQL API
        </span>
      </div>
    </div>
  );
}
