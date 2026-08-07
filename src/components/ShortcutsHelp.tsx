'use client';

/**
 * SciHub Pro - Shortcuts Help Modal
 * 
 * Displays all available keyboard shortcuts in a beautiful modal.
 * Triggered by pressing "?" or clicking help button.
 * 
 * Features:
 * - Grouped by category
 * - Visual key display with proper styling
 * - Search/filter functionality
 * - Responsive design
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ALL_SHORTCUTS } from './KeyboardShortcuts';

interface ShortcutItem {
  key: string;
  shortcut: string;
  description: string;
  scope: 'global' | 'navigation' | 'editor' | 'contextual';
  category: string;
}

// Category icons and colors
const CATEGORY_CONFIG = {
  Global: {
    icon: '🌐',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
  },
  Navigation: {
    icon: '🧭',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
  },
  Actions: {
    icon: '⚡',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
  },
};

// Component to display keyboard keys nicely
function KeyDisplay({ keys }: { keys: string }) {
  // Split combined shortcuts like "⌘K" into individual keys
  const keyParts = keys.split('').map((char, idx) => {
    // Handle special characters
    if (char === '⌘') return { key: '⌘', label: 'Cmd' };
    if (char === '⇧') return { key: '⇧', label: 'Shift' };
    if (char === '⌥') return { key: '⌥', label: 'Option' };
    if (char === 'Esc') return { key: 'Esc', label: 'Esc' };
    // Regular character
    return { key: char.toUpperCase(), label: char.toUpperCase() };
  });

  return (
    <div className="flex items-center gap-1">
      {keyParts.map((part, idx) => (
        <kbd
          key={idx}
          className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-semibold rounded-md bg-background border shadow-sm"
        >
          {part.key}
        </kbd>
      ))}
    </div>
  );
}

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const showHelp = () => setIsOpen(true);
    const closeAll = () => setIsOpen(false);

    window.addEventListener('show-shortcuts-help', showHelp);
    window.addEventListener('close-all-modals', closeAll);

    return () => {
      window.removeEventListener('show-shortcuts-help', showHelp);
      window.removeEventListener('close-all-modals', closeAll);
    };
  }, []);

  // Filter shortcuts based on search
  const filteredShortcuts = (() => {
    if (!searchQuery.trim()) return ALL_SHORTCUTS;
    
    const query = searchQuery.toLowerCase();
    return ALL_SHORTCUTS.filter(s => 
      s.description.toLowerCase().includes(query) ||
      s.shortcut.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
  })();

  // Group by category
  const groupedShortcuts = filteredShortcuts.reduce((groups, shortcut) => {
    if (!groups[shortcut.category]) {
      groups[shortcut.category] = [];
    }
    groups[shortcut.category].push(shortcut);
    return groups;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">⌨️</span>
            <div>
              <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                Quick commands for power users
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 py-4 border-b">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="max-h-[400px] overflow-y-auto p-6 space-y-6">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => {
            const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
            
            return (
              <div key={category}>
                {/* Category Header */}
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${config?.bg || 'bg-muted/50'} ${config?.border || 'border-transparent'} border`}>
                  <span className="text-lg">{config?.icon || '📋'}</span>
                  <span className={`font-semibold text-sm ${config?.color || ''}`}>
                    {category}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {shortcuts.length} shortcut{shortcuts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Shortcuts in this category */}
                <div className="space-y-2 ml-2">
                  {shortcuts.map((shortcut, idx) => (
                    <div
                      key={`${shortcut.key}-${idx}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${config?.color.replace('text-', 'bg-') || 'bg-muted-foreground'}`} />
                        <span className="text-sm font-medium">{shortcut.description}</span>
                      </div>
                      <KeyDisplay keys={shortcut.shortcut} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">No shortcuts found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Press</span>
            <kbd className="bg-background border rounded px-1.5 py-0.5 font-mono text-[10px]">?</kbd>
            <span>to toggle this help</span>
          </div>
          <div className="text-xs text-muted-foreground">
            SciHub Pro v2.0.0
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
