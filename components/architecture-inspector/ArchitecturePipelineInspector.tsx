'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type StageId = 'SCRAPE' | 'EMBED' | 'MATCH' | 'STORE';

interface StageSpec {
  id: StageId;
  name: string;
  badge: string;
  summary: string;
  specs: { label: string; value: string }[];
}

const STAGE_SPECS: Record<StageId, StageSpec> = {
  SCRAPE: {
    id: 'SCRAPE',
    name: 'DATA EXTRACTION & RESILIENCE',
    badge: 'STAGE 01 // INGESTION',
    summary:
      'High-throughput web scraping engine running across proxy clusters to reliably aggregate pricing without triggering bot detection.',
    specs: [
      { label: 'ENGINE', value: 'Cheerio + Headless Playwright Pool' },
      { label: 'CONCURRENCY', value: '45 workers/sec per cluster node' },
      { label: 'RESILIENCE', value: 'TLS fingerprint rotation & auto-retries' },
      { label: 'OUTPUT', value: 'Normalized JSON SKU pricing & stock feeds' },
    ],
  },
  EMBED: {
    id: 'EMBED',
    name: 'SEMANTIC VECTOR EMBEDDING',
    badge: 'STAGE 02 // VECTORIZATION',
    summary:
      'Transforms unstructured, multi-vendor product titles and specs into high-dimensional vector representations for semantic discovery.',
    specs: [
      { label: 'MODEL', value: 'OpenAI text-embedding-3-small' },
      { label: 'VECTOR SPACE', value: '1536 float32 dimensions' },
      { label: 'BATCHING', value: 'BullMQ batch worker (64 items / chunk)' },
      { label: 'LATENCY', value: '38ms p95 embedding generation' },
    ],
  },
  MATCH: {
    id: 'MATCH',
    name: 'NEAREST-NEIGHBOR SKU UNIFICATION',
    badge: 'STAGE 03 // RESOLUTION',
    summary:
      'High-speed cosine distance calculations inside PostgreSQL to unify identical products listed with differing titles across stores.',
    specs: [
      { label: 'DATABASE', value: 'PostgreSQL 16 + pgvector extension' },
      { label: 'INDEX TYPE', value: 'HNSW (m=16, ef_construction=64)' },
      { label: 'THRESHOLD', value: 'Cosine similarity >= 0.85' },
      { label: 'DEDUP', value: 'Cross-retailer SKU resolution in <4ms' },
    ],
  },
  STORE: {
    id: 'STORE',
    name: 'NESTJS CLUSTER & CACHE LAYER',
    badge: 'STAGE 04 // PERSISTENCE & API',
    summary:
      'Production-grade NestJS service layer maintaining historical price time-series with low-latency cache-aside Redis access.',
    specs: [
      { label: 'FRAMEWORK', value: 'NestJS Modular Architecture' },
      { label: 'CACHE LAYER', value: 'Redis 7 Cache-Aside (TTL 4h)' },
      { label: 'BROKER', value: 'BullMQ with Dead-Letter Queues' },
      { label: 'QUERY API', value: 'Sub-30ms p99 REST response time' },
    ],
  },
};

export default function ArchitecturePipelineInspector() {
  const [activeStage, setActiveStage] = useState<StageId>('SCRAPE');
  const [isOpen, setIsOpen] = useState(false);

  const currentSpec = STAGE_SPECS[activeStage];

  return (
    <div className="mt-6 border border-zinc-800 bg-[#0d0d0d] p-3 sm:p-4 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff33] animate-pulse" />
          <h4 className="text-zinc-300 text-xs font-circuit tracking-[0.15em] uppercase font-bold">
            SYSTEM ARCHITECTURE // SPEC INSPECTOR
          </h4>
        </div>

        <button
          type="button"
          data-no-cursor-scale="true"
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-[#00ff33] font-circuit text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          {isOpen ? '[ HIDE SPECS ]' : '[ VIEW SPECS ]'}
        </button>
      </div>

      {/* Interactive Pipeline Stages */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
        {(['SCRAPE', 'EMBED', 'MATCH', 'STORE'] as StageId[]).map((stage, idx, arr) => {
          const isSelected = activeStage === stage;
          return (
            <React.Fragment key={stage}>
              <button
                type="button"
                data-no-cursor-scale="true"
                onClick={() => {
                  setActiveStage(stage);
                  setIsOpen(true);
                }}
                className={`px-3 py-1 font-circuit text-xs uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#00ff33] text-black border-[#00ff33] shadow-[0_0_10px_rgba(0,255,51,0.5)]'
                    : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {isSelected && <span className="w-1 h-1 rounded-full bg-black animate-ping" />}
                <span>{stage}</span>
              </button>

              {idx < arr.length - 1 && (
                <span className="text-[#00ff33] font-circuit text-xs select-none">
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Collapsible Architecture Spec Drawer */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="pt-2 border-t border-zinc-900 font-circuit text-xs"
          >
            {/* Spec Title & Badge */}
            <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
              <span className="text-white font-bold tracking-wide">
                {currentSpec.name}
              </span>
              <span className="text-[#00ff33] text-[9px] px-1.5 py-0.5 border border-[#00ff33]/30 bg-[#00ff33]/10 tracking-widest">
                {currentSpec.badge}
              </span>
            </div>

            {/* Architecture Summary */}
            <p className="text-zinc-400 text-[10px] leading-relaxed mb-3">
              {currentSpec.summary}
            </p>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black/60 p-2.5 border border-zinc-900">
              {currentSpec.specs.map((item, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-zinc-500 text-[8px] tracking-wider uppercase">
                    {item.label}
                  </span>
                  <span className="text-zinc-200 text-[9px] font-semibold">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
