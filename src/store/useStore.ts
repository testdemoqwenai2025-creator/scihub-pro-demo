/**
 * SciHub Pro - Global State Management (Zustand)
 * 
 * Persistence layer with:
 * - Zustand for React state
 * - localStorage for session persistence
 * - IndexedDB for large data caching
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============ TYPES ============

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'medium' | 'large';
  resultsPerPage: number;
  defaultDataSource: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  source: string;
}

export interface SavedItem {
  id: string;
  type: 'paper' | 'dataset' | 'sequence' | 'compound' | 'workflow';
  title: string;
  data: Record<string, any>;
  savedAt: Date;
  tags: string[];
}

export interface RecentQuery {
  query: string;
  timestamp: number;
  filters?: Record<string, string>;
}

// ============ STORE INTERFACE ============

interface SciHubStore {
  // User Preferences
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;

  // Search History
  searchHistory: SearchHistory[];
  addToSearchHistory: (entry: Omit<SearchHistory, 'id' | 'timestamp'>) => void;
  clearSearchHistory: () => void;

  // Saved Items
  savedItems: SavedItem[];
  saveItem: (item: Omit<SavedItem, 'savedAt'>) => void;
  unsaveItem: (id: string) => void;
  isSaved: (id: string) => boolean;

  // Recent Queries
  recentQueries: RecentQuery[];
  addRecentQuery: (query: string, filters?: Record<string, string>) => void;
  clearRecentQueries: () => void;

  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  viewMode: 'landing' | 'dashboard';
  setViewMode: (mode: 'landing' | 'dashboard') => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // Data Cache
  cachedData: Map<string, { data: any; timestamp: number }>;
  setCachedData: (key: string, data: any, ttl?: number) => any | null;
  getCachedData: (key: string) => any | null;
  clearCache: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// ============ DEFAULT STATE ============

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  sidebarCollapsed: false,
  fontSize: 'medium',
  resultsPerPage: 20,
  defaultDataSource: 'crossref',
};

// ============ CREATE STORE ============

export const useSciHubStore = create<SciHubStore>()(
  persist(
    (set, get) => ({
      // ============ PREFERENCES ============
      preferences: defaultPreferences,
      setPreferences: (newPrefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPrefs },
        })),

      // ============ SEARCH HISTORY ============
      searchHistory: [],
      addToSearchHistory: (entry) =>
        set((state) => ({
          searchHistory: [
            {
              ...entry,
              id: `search-${Date.now()}`,
              timestamp: new Date(),
            },
            ...state.searchHistory.slice(0, 49), // Keep last 50
          ],
        })),
      clearSearchHistory: () => set({ searchHistory: [] }),

      // ============ SAVED ITEMS ============
      savedItems: [],
      saveItem: (item) =>
        set((state) => ({
          savedItems: [
            { ...item, savedAt: new Date() },
            ...state.savedItems.filter((i) => i.id !== item.id),
          ],
        })),
      unsaveItem: (id) =>
        set((state) => ({
          savedItems: state.savedItems.filter((i) => i.id !== id),
        })),
      isSaved: (id) => get().savedItems.some((item) => item.id === id),

      // ============ RECENT QUERIES ============
      recentQueries: [],
      addRecentQuery: (query, filters) =>
        set((state) => {
          const existingIndex = state.recentQueries.findIndex(
            (q) => q.query === query
          );
          const newQuery = { query, timestamp: Date.now(), filters };
          
          let updated;
          if (existingIndex >= 0) {
            updated = [...state.recentQueries];
            updated.splice(existingIndex, 1);
          } else {
            updated = state.recentQueries;
          }
          
          return { recentQueries: [newQuery, ...updated].slice(0, 20) };
        }),
      clearRecentQueries: () => set({ recentQueries: [] }),

      // ============ UI STATE ============
      activeTab: 'overview',
      setActiveTab: (tab) => set({ activeTab: tab }),

      viewMode: 'landing',
      setViewMode: (mode) => set({ viewMode: mode }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // ============ NOTIFICATIONS ============
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif-${Date.now()}`,
              timestamp: new Date(),
              read: false,
            },
            ...state.notifications,
          ],
        })),
      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // ============ DATA CACHE ============
      cachedData: new Map(),
      setCachedData: (key, data, ttl = 300000) => {
        const state = get();
        const newCache = new Map(state.cachedData);
        newCache.set(key, { data, timestamp: Date.now(), ttl });
        set({ cachedData: newCache });
        return data;
      },
      getCachedData: (key) => {
        const { cachedData } = get();
        const entry = cachedData.get(key);
        if (!entry) return null;
        
        const isExpired = Date.now() - entry.timestamp > entry.ttl;
        if (isExpired) {
          const newCache = new Map(cachedData);
          newCache.delete(key);
          set({ cachedData: newCache });
          return null;
        }
        
        return entry.data;
      },
      clearCache: () => set({ cachedData: new Map() }),
    }),
    {
      name: 'scihub-pro-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        searchHistory: state.searchHistory,
        savedItems: state.savedItems,
        recentQueries: state.recentQueries,
        viewMode: state.viewMode,
        activeTab: state.activeTab,
        // Don't persist: notifications, cachedData, UI transient state
      }),
    }
  )
);

// ============ SELECTORS ============

export const selectPreferences = (state: SciHubStore) => state.preferences;
export const selectSearchHistory = (state: SciHubStore) => state.searchHistory;
export const selectSavedItems = (state: SciHubStore) => state.savedItems;
export const selectRecentQueries = (state: SciHubStore) => state.recentQueries;
export const selectIsSaved = (id: string) => (state: SciHubStore) =>
  state.savedItems.some((item) => item.id === id);

// ============ INDEXEDDB HELPER (for large datasets) ============

class IndexedDBHelper {
  private dbName = 'scihub-pro-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Object stores for different data types
        if (!db.objectStoreNames.contains('datasets')) {
          db.createObjectStore('datasets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('query-results')) {
          db.createObjectStore('query-results', { keyPath: 'query' });
        }
        if (!db.objectStoreNames.contains('cached-files')) {
          db.createObjectStore('cached-files', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('user-workspace')) {
          db.createObjectStore('user-workspace', { keyPath: 'id' });
        }
      };
    });
  }

  async put(storeName: string, data: any): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName: string, key: string): Promise<any> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const idbHelper = new IndexedDBHelper();

// Initialize IndexedDB on import (non-blocking)
if (typeof window !== 'undefined') {
  idbHelper.init().catch(console.warn);
}
