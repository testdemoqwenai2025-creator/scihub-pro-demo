'use client';

/**
 * SciHub Pro - Keyboard Shortcuts Provider
 * 
 * Global keyboard shortcuts system that works across all pages.
 * Dispatches custom events for other components to listen to.
 * 
 * Shortcuts:
 * - Cmd/Ctrl + K: Open global search modal
 * - Cmd/Ctrl + /: Open command palette
 * - Cmd/Ctrl + B: Toggle sidebar (if exists)
 * - Cmd/Ctrl + D: Go to Dashboard
 * - Cmd/Ctrl + N: New item (context-aware)
 * - Cmd/Ctrl + S: Save current form/editor
 * - Escape: Close all modals/dropdowns
 * ?: Show shortcuts help modal (when not in input)
 */

import { useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
  scope: 'global' | 'navigation' | 'editor' | 'contextual';
}

// Context for showing toast notifications from shortcuts
interface KeyboardContextType {
  showToast: (message: string) => void;
}

const KeyboardContext = createContext<KeyboardContextType>({
  showToast: () => {},
});

export const useKeyboardToast = () => useContext(KeyboardContext);

// All available shortcuts for the help modal
export const ALL_SHORTCUTS: {
  key: string;
  shortcut: string;
  description: string;
  scope: 'global' | 'navigation' | 'editor' | 'contextual';
  category: string;
}[] = [
  // Global shortcuts
  { key: 'k', shortcut: '⌘K', description: 'Open global search', scope: 'global', category: 'Global' },
  { key: '/', shortcut: '⌘/', description: 'Open command palette', scope: 'global', category: 'Global' },
  { key: 'b', shortcut: '⌘B', description: 'Toggle sidebar', scope: 'global', category: 'Global' },
  { key: 'Escape', shortcut: 'Esc', description: 'Close modals/dropdowns', scope: 'global', category: 'Global' },
  { key: '?', shortcut: '?', description: 'Show this help', scope: 'global', category: 'Global' },
  
  // Navigation shortcuts
  { key: 'd', shortcut: '⌘D', description: 'Go to Dashboard', scope: 'navigation', category: 'Navigation' },
  
  // Editor/Contextual shortcuts
  { key: 'n', shortcut: '⌘N', description: 'New item (context-aware)', scope: 'contextual', category: 'Actions' },
  { key: 's', shortcut: '⌘S', description: 'Save current form/editor', scope: 'editor', category: 'Actions' },
];

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const router = useRouter();

  // Toast notification function
  const showToast = useCallback((message: string) => {
    toast.success(message, {
      duration: 1500,
      position: 'bottom-right',
      className: 'font-medium',
    });
  }, []);

  const shortcuts: ShortcutConfig[] = [
    // Global Search - Cmd/Ctrl + K
    {
      key: 'k',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('open-global-search'));
      },
      description: 'Opened global search',
      scope: 'global',
    },
    
    // Command Palette - Cmd/Ctrl + /
    {
      key: '/',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('open-command-palette'));
      },
      description: 'Opened command palette',
      scope: 'global',
    },
    
    // Toggle Sidebar - Cmd/Ctrl + B
    {
      key: 'b',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('toggle-sidebar'));
      },
      description: 'Toggled sidebar',
      scope: 'global',
    },
    
    // Go to Dashboard - Cmd/Ctrl + D
    {
      key: 'd',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        router.push('/dashboard');
      },
      description: 'Navigated to Dashboard',
      scope: 'navigation',
    },
    
    // New Item - Cmd/Ctrl + N
    {
      key: 'n',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('new-item'));
      },
      description: 'New item action triggered',
      scope: 'contextual',
    },
    
    // Save - Cmd/Ctrl + S
    {
      key: 's',
      ctrlKey: true,
      metaKey: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('save-current-form'));
      },
      description: 'Saved current form',
      scope: 'editor',
    },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isModKey = e.ctrlKey || e.metaKey;
    const activeElement = document.activeElement;
    const isInputFocused = activeElement?.tagName === 'INPUT' || 
                           activeElement?.tagName === 'TEXTAREA' || 
                           activeElement?.isContentEditable;

    // Don't trigger shortcuts when typing in inputs (except for Escape and specific cases)
    if (isInputFocused && e.key !== 'Escape') {
      return;
    }

    // Check each shortcut
    for (const shortcut of shortcuts) {
      const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
      
      // For mod key shortcuts (Ctrl or Cmd)
      if (shortcut.ctrlKey || shortcut.metaKey) {
        const matchesModKey = isModKey;
        
        if (matchesKey && matchesModKey) {
          e.preventDefault();
          shortcut.action();
          showToast(shortcut.description);
          return;
        }
      }
    }

    // Handle Escape key - close all modals
    if (e.key === 'Escape') {
      window.dispatchEvent(new CustomEvent('close-all-modals'));
    }

    // Handle ? key - show help (only when not in input)
    if (e.key === '?' && !isModKey && !isInputFocused) {
      window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
    }
  }, [showToast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <KeyboardContext.Provider value={{ showToast }}>
      {children}
    </KeyboardContext.Provider>
  );
}

// Hook for components to register custom shortcut handlers
export function useShortcut(key: string, options: {
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (options.enabled === false) return;

    const handler = (e: KeyboardEvent) => {
      const isModKey = e.ctrlKey || e.metaKey;
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = !!options.ctrlKey === isModKey;
      const matchesMeta = !!options.metaKey === (e.metaKey && !e.ctrlKey);
      const matchesShift = !!options.shiftKey === e.shiftKey;

      if (matchesKey && (matchesCtrl || matchesMeta) && matchesShift) {
        e.preventDefault();
        options.action();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, options]);
}
