"use client";

import React from "react";

interface GitHubYearSelectorProps {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  isLoading?: boolean;
}

export default function GitHubYearSelector({
  years,
  selectedYear,
  onSelectYear,
  isLoading = false,
}: GitHubYearSelectorProps) {
  // If years array is empty or not yet loaded, show at least current selected year
  const displayYears = years && years.length > 0 ? years : [selectedYear];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
      <span className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase mr-1 whitespace-nowrap">
        Year:
      </span>

      <div className="flex items-center gap-1.5 flex-nowrap">
        {displayYears.map((year) => {
          const isSelected = year === selectedYear;

          return (
            <button
              key={year}
              type="button"
              data-no-cursor-scale="true"
              disabled={isLoading}
              onClick={() => onSelectYear(year)}
              className={`px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase transition-all duration-200 border cursor-none pointer-events-auto ${
                isSelected
                  ? "bg-[#00ff33] text-black border-[#00ff33] font-bold shadow-[0_0_8px_rgba(0,255,51,0.4)]"
                  : "bg-black/60 text-zinc-400 border-zinc-800 hover:border-[#00ff33]/50 hover:text-white"
              } ${isLoading ? "opacity-60 pointer-events-none" : ""}`}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}
