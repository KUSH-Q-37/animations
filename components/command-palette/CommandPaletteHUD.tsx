'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';

interface CommandItem {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'DEVELOPER';
  shortcut?: string;
  action: () => void;
  icon?: React.ReactNode;
}

const RESUME_URL =
  'https://drive.google.com/file/d/1PknSb507bcUSj_iyCeuMCJZNmvIw_pl4/view?usp=drive_link';

export default function CommandPaletteHUD() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedNotice(null);
      setIsOpen(false);
    }, 1200);
  };

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-projects',
      title: 'Jump to Featured Work (PriceTrail, MindWell)',
      category: 'NAVIGATION',
      shortcut: 'P',
      action: () => scrollTo('featured-work'),
    },
    {
      id: 'nav-github',
      title: 'Jump to GitHub Universe (4 Linked Accounts)',
      category: 'NAVIGATION',
      shortcut: 'G',
      action: () => scrollTo('github-universe'),
    },
    {
      id: 'nav-journey',
      title: 'Jump to My Journey (Timeline at VMHUB LLP)',
      category: 'NAVIGATION',
      shortcut: 'T',
      action: () => scrollTo('my-journey'),
    },
    {
      id: 'nav-credentials',
      title: 'Jump to Credentials & Resume',
      category: 'NAVIGATION',
      shortcut: 'R',
      action: () => scrollTo('credentials'),
    },
    {
      id: 'nav-arsenal',
      title: 'Jump to Arsenal (Tech Stack Cloud)',
      category: 'NAVIGATION',
      shortcut: 'A',
      action: () => scrollTo('arsenal'),
    },
    {
      id: 'nav-contact',
      title: "Jump to Contact Form (+ Let's Work Together)",
      category: 'NAVIGATION',
      shortcut: 'C',
      action: () => scrollTo('contact'),
    },

    // Actions
    {
      id: 'act-resume',
      title: 'Download Curriculum Vitae (PDF)',
      category: 'ACTIONS',
      shortcut: '↵',
      action: () => {
        window.open(RESUME_URL, '_blank');
        setIsOpen(false);
      },
    },
    {
      id: 'act-github',
      title: 'Open GitHub Profile (@KUSH-Q-37)',
      category: 'ACTIONS',
      icon: <FaGithub className="w-3.5 h-3.5" />,
      action: () => {
        window.open('https://github.com/KUSH-Q-37', '_blank');
        setIsOpen(false);
      },
    },
    {
      id: 'act-linkedin',
      title: 'Open LinkedIn Profile (Kush Bhardwaj)',
      category: 'ACTIONS',
      icon: <FaLinkedin className="w-3.5 h-3.5" />,
      action: () => {
        window.open('https://www.linkedin.com/in/kush-bhardwaj-73a65628b/', '_blank');
        setIsOpen(false);
      },
    },
    {
      id: 'act-leetcode',
      title: 'Open LeetCode Profile (@kush968)',
      category: 'ACTIONS',
      icon: <SiLeetcode className="w-3.5 h-3.5" />,
      action: () => {
        window.open('https://leetcode.com/u/kush968/', '_blank');
        setIsOpen(false);
      },
    },

    // Quick Copy
    {
      id: 'copy-link',
      title: 'Copy Portfolio URL',
      category: 'ACTIONS',
      shortcut: 'URL',
      action: () => copyToClipboard(window.location.origin, 'Portfolio URL'),
    },
    {
      id: 'copy-github',
      title: 'Copy GitHub Profile URL',
      category: 'ACTIONS',
      action: () => copyToClipboard('https://github.com/KUSH-Q-37', 'GitHub URL'),
    },

    // Developer / Specs
    {
      id: 'dev-status',
      title: 'Current Role: Full-Stack Developer at VMHUB LLP, Noida',
      category: 'DEVELOPER',
      action: () => scrollTo('my-journey'),
    },
    {
      id: 'dev-arch',
      title: 'Inspect PriceTrail Distributed Architecture Specs',
      category: 'DEVELOPER',
      action: () => scrollTo('featured-work'),
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K / Escape / Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Freeze background scrolling and interactions when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      const preventTouchScroll = (e: TouchEvent) => {
        if (!listRef.current?.contains(e.target as Node)) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventTouchScroll, { passive: false });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.removeEventListener('touchmove', preventTouchScroll);
      };
    }
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle arrow keys inside palette
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    }
  };

  return (
    <>
      {/* Discreet Floating Trigger Pill at Top Right */}
      <div className="fixed top-5 right-5 md:top-8 md:right-8 z-40 pointer-events-auto">
        <button
          type="button"
          data-no-cursor-scale="true"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-bold border border-zinc-800 bg-black/80 text-zinc-400 hover:text-[#00ff33] hover:border-[#00ff33]/50 backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer"
          title="Open Command Palette (Cmd + K / Ctrl + K)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff33]" />
          <span>COMMANDS</span>
          <kbd className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded text-[8px] font-sans">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-28 px-4 pointer-events-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Command Palette Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-[#0a0a0a] border border-[#00ff33]/60 shadow-[0_0_40px_rgba(0,255,51,0.25)] overflow-hidden font-mono z-10"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-900 bg-black/40">
                <span className="text-[#00ff33] text-sm select-none font-bold">›</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleListKeyDown}
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none tracking-wide"
                />
                <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] uppercase tracking-wider select-none">
                  ESC
                </kbd>
              </div>

              {/* Copied Feedback Toast */}
              {copiedNotice && (
                <div className="bg-[#00ff33] text-black px-4 py-1.5 text-center text-[10px] font-bold tracking-widest uppercase">
                  ✓ {copiedNotice}
                </div>
              )}

              {/* Commands List */}
              <div
                ref={listRef}
                className="max-h-[340px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-0.5"
              >
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    No commands matching &quot;{search}&quot;
                  </div>
                ) : (
                  filteredCommands.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#00ff33] text-black font-bold'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {item.icon && (
                            <span className={isSelected ? 'text-black' : 'text-[#00ff33]'}>
                              {item.icon}
                            </span>
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[8px] tracking-widest uppercase ${
                              isSelected ? 'text-black/70' : 'text-zinc-600'
                            }`}
                          >
                            {item.category}
                          </span>
                          {item.shortcut && (
                            <kbd
                              className={`px-1 py-0.2 text-[8px] border font-sans ${
                                isSelected
                                  ? 'border-black text-black'
                                  : 'border-zinc-800 text-zinc-500'
                              }`}
                            >
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Helper */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-900 bg-black/60 text-[9px] text-zinc-500 select-none">
                <div className="flex items-center gap-3">
                  <span>[↑↓] Navigate</span>
                  <span>[↵] Select</span>
                  <span>[ESC] Close</span>
                </div>
                <span className="text-[#00ff33]/80">Kush Bhardwaj // VMHUB LLP</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
