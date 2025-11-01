"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'features',
      title: 'View Features',
      description: 'See all Aurora Engine features',
      icon: '✨',
      action: () => {
        window.location.href = '#features';
        setIsOpen(false);
      }
    },
    {
      id: 'pricing',
      title: 'View Pricing',
      description: 'Check pricing plans',
      icon: '💰',
      action: () => {
        window.location.href = '#pricing';
        setIsOpen(false);
      }
    },
    {
      id: 'create',
      title: 'Start Creating',
      description: 'Begin creating with Aurora Engine',
      icon: '🚀',
      action: () => {
        // Action to start creating
        setIsOpen(false);
      }
    },
    {
      id: 'generator',
      title: 'AI Generator',
      description: 'Generate ads with AI',
      icon: '🎨',
      action: () => {
        setIsOpen(false);
      }
    },
    {
      id: 'reels',
      title: 'Reels Studio',
      description: 'Create engaging video content',
      icon: '🎬',
      action: () => {
        setIsOpen(false);
      }
    },
    {
      id: 'broadcast',
      title: 'Broadcast',
      description: 'Publish to all platforms',
      icon: '📡',
      action: () => {
        setIsOpen(false);
      }
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      return;
    }
    
    // Only handle these keys when palette is open
    if (!isOpen) return;
    
    // Escape to close
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    
    // Arrow navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    }
    
    // Enter to execute
    if (e.key === 'Enter' && filteredCommands.length > 0) {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    }
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Command Palette Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[101] w-[90%] max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            {/* Glass Container */}
            <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">🔍</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search commands..."
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-lg"
                    aria-label="Search commands"
                  />
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-white/60 bg-white/10 rounded border border-white/20">
                    ESC
                  </kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredCommands.length > 0 ? (
                  <div className="p-2">
                    {filteredCommands.map((cmd, index) => (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
                          index === selectedIndex ? 'bg-white/10' : 'hover:bg-white/10'
                        }`}
                        aria-label={`${cmd.title}: ${cmd.description}`}
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium mb-1 group-hover:text-cyan-300 transition-colors">
                              {cmd.title}
                            </div>
                            <div className="text-white/60 text-sm">
                              {cmd.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-white/60">
                    No commands found for "{search}"
                  </div>
                )}
              </div>

              {/* Footer Hint */}
              <div className="p-3 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20">↵</kbd>
                    to select
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
