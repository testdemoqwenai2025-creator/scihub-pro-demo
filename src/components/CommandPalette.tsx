'use client';

/**
 * SciHub Pro - Command Palette Component
 * 
 * A searchable command palette triggered by Cmd/Ctrl + /
 * Provides quick navigation to all sections of the app.
 * 
 * Features:
 * - Fuzzy search through all commands
 * - Keyboard navigation (arrow keys + enter)
 * - Categorized commands
 * - Recent commands tracking
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CommandItem {
  id: string;
  icon: string;
  label: string;
  shortcut?: string;
  action: () => void;
  category: 'navigation' | 'action' | 'search' | 'settings' | 'tools';
  keywords?: string[];
}

// All available commands
const COMMANDS: CommandItem[] = [
  // Navigation
  { id: 'dash', icon: '📊', label: 'Go to Dashboard', shortcut: '⌘D', action: () => {}, category: 'navigation', keywords: ['home', 'main', 'overview'] },
  { id: 'landing', icon: '🏠', label: 'Go to Landing Page', action: () => {}, category: 'navigation', keywords: ['home', 'welcome'] },
  { id: 'data', icon: '💾', label: 'Go to Data Lake', action: () => {}, category: 'navigation', keywords: ['datasets', 'files', 'storage'] },
  { id: 'conn', icon: '🔗', label: 'Go to Connectors', action: () => {}, category: 'navigation', keywords: ['api', 'integrations', 'sources'] },
  { id: 'query', icon: '🔍', label: 'Go to Search/Literature', action: () => {}, category: 'search', keywords: ['papers', 'articles', 'find'] },
  { id: 'knowledge', icon: '🕸️', label: 'Go to Knowledge Graph', action: () => {}, category: 'navigation', keywords: ['graph', 'network', 'visual'] },
  
  // Tools
  { id: 'work', icon: '💻', label: 'Go to Workspace', action: () => {}, category: 'tools', keywords: ['code', 'editor', 'python', 'sql'] },
  { id: 'compute', icon: '⚙️', label: 'Go to Compute', action: () => {}, category: 'tools', keywords: ['gpu', 'jobs', 'cluster', 'run'] },
  { id: 'aethel', icon: '🤖', label: 'Open AETHEL AI Assistant', action: () => {}, category: 'action', keywords: ['ai', 'assistant', 'chat', 'help'] },
  { id: 'collab', icon: '👥', label: 'Go to Collaboration', action: () => {}, category: 'tools', keywords: ['team', 'share', 'users'] },
  
  // Settings
  { id: 'subs', icon: '⭐', label: 'View Subscription Plans', action: () => {}, category: 'settings', keywords: ['premium', 'pro', 'pricing', 'upgrade'] },
  { id: 'sett', icon: '⚙️', label: 'Open Settings', action: () => {}, category: 'settings', keywords: ['preferences', 'config', 'options'] },
];

const CATEGORY_LABELS: Record<string, string> = {
  navigation: 'Navigation',
  action: 'Actions',
  search: 'Search',
  settings: 'Settings',
  tools: 'Tools',
};

const CATEGORY_ICONS: Record<string, string> = {
  navigation: '🧭',
  action: '⚡',
  search: '🔎',
  settings: '🔧',
  tools: '🛠️',
};

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Get commands with proper actions (using router)
  const getCommands = useCallback((): CommandItem[] => {
    return COMMANDS.map(cmd => ({
      ...cmd,
      action: () => {
        const routes: Record<string, string> = {
          dash: '/dashboard',
          landing: '/',
          data: '/data',
          conn: '/connectors',
          query: '/query',
          knowledge: '/knowledge',
          work: '/workspace',
          compute: '/compute',
          aethel: '/aethel',
          collab: '/collaboration',
          subs: '/subscription',
          sett: '/settings',
        };
        const route = routes[cmd.id];
        if (route) {
          router.push(route);
        }
      },
    }));
  }, [router]);

  // Open/close handlers
  useEffect(() => {
    const openPalette = () => {
      setIsOpen(true);
      setQuery('');
      setSelectedIndex(0);
    };
    
    const closePalette = () => setIsOpen(false);

    window.addEventListener('open-command-palette', openPalette);
    window.addEventListener('close-all-modals', closePalette);

    return () => {
      window.removeEventListener('open-command-palette', openPalette);
      window.removeEventListener('close-all-modals', closePalette);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure dialog is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter commands based on query
  const filteredCommands = (() => {
    const commands = getCommands();
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    
    return commands.filter(cmd => {
      const matchesLabel = cmd.label.toLowerCase().includes(lowerQuery);
      const matchesKeywords = cmd.keywords?.some(kw => kw.includes(lowerQuery));
      const matchesCategory = cmd.category.toLowerCase().includes(lowerQuery);
      
      return matchesLabel || matchesKeywords || matchesCategory;
    });
  })();

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation within palette
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
        break;
    }
  }, [filteredCommands, selectedIndex]);

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((groups, cmd) => {
    if (!groups[cmd.category]) {
      groups[cmd.category] = [];
    }
    groups[cmd.category].push(cmd);
    return groups;
  }, {} as Record<string, CommandItem[]>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-xl gap-0">
        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <svg 
            className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="border-0 focus-visible:ring-0 h-13 text-base shadow-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Commands List */}
        <div className="max-h-[340px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium">No commands found</p>
              <p className="text-sm mt-1">for &quot;{query}&quot;</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                {/* Category Header */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category]}</span>
                  <span>{CATEGORY_LABELS[category] || category}</span>
                </div>
                
                {/* Commands in this category */}
                {cmds.map((cmd, idx) => {
                  // Calculate global index for selection
                  const globalIdx = Object.keys(groupedCommands)
                    .slice(0, Object.keys(groupedCommands).indexOf(category))
                    .reduce((sum, key) => sum + groupedCommands[key].length, 0) + cmds.indexOf(cmd);
                  
                  const isSelected = globalIdx === selectedIndex;
                  
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{cmd.icon}</span>
                      <span className="flex-1 text-left">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded-md font-mono text-muted-foreground flex-shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-between items-center text-xs text-muted-foreground bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-background border rounded px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-background border rounded px-1 py-0.5 font-mono text-[10px]">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-background border rounded px-1 py-0.5 font-mono text-[10px]">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="bg-background border rounded px-1 py-0.5 font-mono text-[10px]">⌘/</kbd>
            <span>to open</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
