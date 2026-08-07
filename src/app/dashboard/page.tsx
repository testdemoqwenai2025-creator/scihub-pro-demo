'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField, updateDynamicField } from '@/store/useDynamicStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast-utils';

// ============ TYPES ============

interface StatCardConfig {
  key: string;
  icon: string;
  color: string;
  route: string;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  icon: string;
  timestamp: Date;
  details?: string;
  metadata?: Record<string, any>;
  expanded?: boolean;
}

interface SyntheticStats {
  datasets: { count: number; change: number; trend: string };
  queries: { count: number; change: number; trend: string };
  connectors: { count: number; total: number; percentage: number };
  storageUsed: { used: number; total: number; unit: string; percentage: number };
  apiCallsToday: { used: number; limit: number; percentage: number };
  computeHours: { used: number; total: number };
  activeProjects: number;
  teamMembers: number;
  sessionDuration: string;
  lastLogin: string;
}

// ============ CONSTANTS ============

const AVATAR_OPTIONS = ['👤', '🧬', '🔬', '🧪', '📊', '💻', '🎓', '🌍', '🚀', '⚡', '🎯', '💡'];

const AVATAR_COLORS = [
  'from-cyan-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-orange-400 to-red-500',
  'from-green-400 to-emerald-500',
  'from-blue-400 to-indigo-500',
  'from-yellow-400 to-orange-500',
];

// ============ SYNTHETIC USER STATS ============

const generateSyntheticStats = (): SyntheticStats => ({
  datasets: { count: 12, change: +2, trend: 'up' },
  queries: { count: 1247, change: +156, trend: 'up' },
  connectors: { count: 8, total: 41, percentage: 19 },
  storageUsed: { used: 2.4, total: 10, unit: 'GB', percentage: 24 },
  apiCallsToday: { used: 847, limit: 1000, percentage: 84 },
  computeHours: { used: 24.5, total: 100 },
  activeProjects: 3,
  teamMembers: 5,
  sessionDuration: '2h 34m',
  lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(),
});

// ============ RICH ACTIVITY DATA GENERATOR ============

const generateRichActivities = (): ActivityItem[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'query',
      message: 'Searched "CRISPR gene therapy clinical trials 2024"',
      icon: '🔍',
      timestamp: new Date(now.getTime() - 2 * 60000),
      details: 'Found 847 results • 1.2s execution',
      metadata: { resultCount: 847, duration: '1.2s' }
    },
    {
      id: '2',
      type: 'connect',
      message: 'Connected to CrossRef API successfully',
      icon: '📚',
      timestamp: new Date(now.getTime() - 15 * 60000),
      details: 'Latency: 45ms • 12 queries available',
      metadata: { latency: '45ms', api: 'CrossRef' }
    },
    {
      id: '3',
      type: 'execute',
      message: 'Executed Python analysis script',
      icon: '💻',
      timestamp: new Date(now.getTime() - 45 * 60000),
      details: 'pandas_analysis.py • 2.34s • Memory: 128MB',
      metadata: { language: 'python', duration: '2.34s', file: 'pandas_analysis.py' }
    },
    {
      id: '4',
      type: 'upload',
      message: 'Uploaded dataset: clinical_trial_data.csv',
      icon: '⬆️',
      timestamp: new Date(now.getTime() - 1 * 3600000),
      details: '156MB • 45,230 rows • Validated ✓',
      metadata: { filename: 'clinical_trial_data.csv', size: '156MB', rows: 45230 }
    },
    {
      id: '5',
      type: 'download',
      message: 'Exported results to Parquet format',
      icon: '📤',
      timestamp: new Date(now.getTime() - 1.5 * 3600000),
      details: '2.4GB • 15,000 rows • Compression: 8x',
      metadata: { format: 'Parquet', size: '2.4GB', rows: 15000 }
    },
    {
      id: '6',
      type: 'collaborate',
      message: 'Shared "ML Drug Discovery" project with Dr. Sarah Chen',
      icon: '👥',
      timestamp: new Date(now.getTime() - 2 * 3600000),
      details: 'MIT • Computational Biology • Edit access granted',
      metadata: { collaborator: 'Dr. Sarah Chen', institution: 'MIT', permission: 'edit' }
    },
    {
      id: '7',
      type: 'achievement',
      message: '🏆 Unlocked badge: "Data Explorer" - Queried 1000+ APIs',
      icon: '🏆',
      timestamp: new Date(now.getTime() - 3 * 3600000),
      details: 'Milestone reached! You\'re in the top 5% of researchers',
      metadata: { badge: 'Data Explorer', tier: 'Gold', rank: 'Top 5%' }
    },
    {
      id: '8',
      type: 'connect',
      message: 'Connected to PubMed Central API',
      icon: '📚',
      timestamp: new Date(now.getTime() - 4 * 3600000),
      details: 'Latency: 78ms • Full-text access enabled',
      metadata: { latency: '78ms', api: 'PubMed Central', features: ['full-text'] }
    },
    {
      id: '9',
      type: 'query',
      message: 'Ran SPARQL query on Wikidata knowledge graph',
      icon: '🔎',
      timestamp: new Date(now.getTime() - 5 * 3600000),
      details: '1,247 results in 234ms • Complex JOIN query',
      metadata: { resultCount: 1247, duration: '234ms', queryType: 'SPARQL' }
    },
    {
      id: '10',
      type: 'execute',
      message: 'Completed R statistical analysis pipeline',
      icon: '📊',
      timestamp: new Date(now.getTime() - 6 * 3600000),
      details: 'gene_expression.R • 12.8s • p-values computed',
      metadata: { language: 'R', duration: '12.8s', file: 'gene_expression.R' }
    },
    {
      id: '11',
      type: 'system',
      message: 'Scheduled backup completed successfully',
      icon: '🔄',
      timestamp: new Date(now.getTime() - 8 * 3600000),
      details: 'All projects backed up • Next: Tomorrow 02:00 UTC',
      metadata: { type: 'backup', status: 'success', nextRun: 'Tomorrow 02:00 UTC' }
    },
    {
      id: '12',
      type: 'collaborate',
      message: 'Dr. James Wilson commented on your analysis',
      icon: '💬',
      timestamp: new Date(now.getTime() - 10 * 3600000),
      details: '"Great methodology! Have you considered..."',
      metadata: { collaborator: 'Dr. James Wilson', action: 'commented' }
    },
    {
      id: '13',
      type: 'achievement',
      message: '🎯 Milestone: 50 days research streak!',
      icon: '🎯',
      timestamp: new Date(now.getTime() - 12 * 3600000),
      details: 'Keep it going! Longest streak: 87 days',
      metadata: { streak: 50, longestStreak: 87 }
    },
    {
      id: '14',
      type: 'system',
      message: 'New connector available: arXiv Physics',
      icon: '✨',
      timestamp: new Date(now.getTime() - 18 * 3600000),
      details: 'Access 1.2M+ physics preprints instantly',
      metadata: { feature: 'new-connector', name: 'arXiv Physics', count: '1.2M+' }
    },
    {
      id: '15',
      type: 'query',
      message: 'Batch search: 47 DOIs resolved via Crossref',
      icon: '🔍',
      timestamp: new Date(now.getTime() - 24 * 3600000),
      details: '46/47 found • 1 not found • 3.2s total',
      metadata: { total: 47, found: 46, duration: '3.2s' }
    },
    {
      id: '16',
      type: 'execute',
      message: 'Launched GPU-accelerated training job',
      icon: '🤖',
      timestamp: new Date(now.getTime() - 28 * 3600000),
      details: 'RTX A6000 • Est. completion: 4h 23m',
      metadata: { gpu: 'RTX A6000', estimatedTime: '4h 23m', status: 'running' }
    },
    {
      id: '17',
      type: 'download',
      message: 'Downloaded PDB structure 7A94 (Cryo-EM)',
      icon: '⬇️',
      timestamp: new Date(now.getTime() - 32 * 3600000),
      details: '3.2MB • 2.8Å resolution • 156 chains',
      metadata: { pdbId: '7A94', size: '3.2MB', resolution: '2.8Å', chains: 156 }
    },
    {
      id: '18',
      type: 'connect',
      message: 'OAuth token refreshed for GitHub integration',
      icon: '🔐',
      timestamp: new Date(now.getTime() - 36 * 3600000),
      details: 'Token valid for next 8 hours',
      metadata: { service: 'GitHub', action: 'token-refresh', validity: '8h' }
    },
    {
      id: '19',
      type: 'system',
      message: 'Storage optimization completed',
      icon: '🗜️',
      timestamp: new Date(now.getTime() - 48 * 3600000),
      details: 'Freed 340MB • 12 files compressed',
      metadata: { spaceFreed: '340MB', filesCompressed: 12 }
    },
    {
      id: '20',
      type: 'achievement',
      message: '🌟 New level: "Research Pro" - Level 12',
      icon: '⭐',
      timestamp: new Date(now.getTime() - 72 * 3600000),
      details: '2,450 XP to next level • Unlock premium themes!',
      metadata: { level: 12, title: 'Research Pro', xpToNext: 2450 }
    },
  ];
};

// ============ ANIMATED COUNTER HOOK ============

function useAnimatedCounter(target: number, duration: number = 1500, enabled: boolean = true) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }
    
    let startTime: number | null = null;
    let animationFrame: number;
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, enabled]);
  
  return count;
}

// ============ SESSION DURATION TRACKER ============

function useSessionDuration() {
  const [sessionStart] = useState(() => {
    // Check if we're in browser to avoid SSR issues
    if (typeof window === 'undefined') return new Date();
    try {
      const stored = localStorage.getItem('scihub_session_start');
      if (stored) return new Date(stored);
      const now = new Date();
      localStorage.setItem('scihub_session_start', now.toISOString());
      return now;
    } catch {
      return new Date();
    }
  });
  
  const [duration, setDuration] = useState('0m');
  
  useEffect(() => {
    const updateDuration = () => {
      const diff = Date.now() - sessionStart.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      if (hours > 0) {
        setDuration(`${hours}h ${minutes}m`);
      } else {
        setDuration(`${minutes}m`);
      }
    };
    
    updateDuration();
    const interval = setInterval(updateDuration, 60000);
    return () => clearInterval(interval);
  }, [sessionStart]);
  
  return duration;
}

// ============ DASHBOARD PAGE ============

export default function DashboardPage() {
  const { t } = useTranslation();
  const {
    dashboardStats,
    updateDashboardStat,
    activities,
    addActivity,
    clearActivities,
    userProfile,
    updateUserProfile,
    getDirtyFieldsCount,
    checkVolumeThreshold,
    dbConfig,
  } = useDynamicStore();

  // UI State
  const [editingStat, setEditingStat] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  
  // Enhanced Profile State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedEmojiAvatar, setSelectedEmojiAvatar] = useState<string>('');
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Avatar state with localStorage persistence
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  
  // Activity feed state
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [visibleActivities, setVisibleActivities] = useState(5);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  
  // Synthetic stats state
  const [syntheticStats, setSyntheticStats] = useState<SyntheticStats>(generateSyntheticStats());
  const [statsAnimated, setStatsAnimated] = useState(false);
  
  // Rich activities
  const [richActivities, setRichActivities] = useState<ActivityItem[]>([]);
  
  // Session tracking
  const sessionDuration = useSessionDuration();
  
  // Full profile form state
  const [fullProfile, setFullProfile] = useState({
    displayName: '',
    email: '',
    institution: '',
    orcid: '',
    researchInterests: '',
    website: '',
    timezone: '',
    bio: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Load avatar from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedAvatar = localStorage.getItem('user-avatar') || '';
      setCurrentAvatar(savedAvatar);
      if (savedAvatar && savedAvatar.length <= 2) {
        setSelectedEmojiAvatar(savedAvatar);
      } else if (savedAvatar && savedAvatar.startsWith('data:')) {
        setAvatarPreview(savedAvatar);
      }
    } catch (e) {
      console.warn('Failed to load avatar:', e);
    }
  }, []);

  // Initialize rich activities
  useEffect(() => {
    setRichActivities(generateRichActivities());
  }, []);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setStatsAnimated(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Initialize full profile from store
  useEffect(() => {
    setFullProfile({
      displayName: userProfile.displayName.value,
      email: userProfile.email.value,
      institution: '',
      orcid: '',
      researchInterests: '',
      website: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      bio: '',
    });
  }, [userProfile.displayName.value, userProfile.email.value]);

  // Check volume threshold on mount and periodically
  useEffect(() => {
    const check = () => {
      const volume = checkVolumeThreshold();
      setShowVolumeWarning(volume.shouldPush);
    };
    
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [checkVolumeThreshold]);

  // Simulate real-time stats updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSyntheticStats(prev => ({
        ...prev,
        queries: {
          ...prev.queries,
          count: prev.queries.count + Math.floor(Math.random() * 5) + 1,
          change: prev.queries.change + Math.floor(Math.random() * 3)
        },
        apiCallsToday: {
          ...prev.apiCallsToday,
          used: Math.min(prev.apiCallsToday.limit, prev.apiCallsToday.used + Math.floor(Math.random() * 10) + 1),
          percentage: Math.min(100, ((prev.apiCallsToday.used + Math.floor(Math.random() * 10) + 1) / prev.apiCallsToday.limit) * 100)
        },
        datasets: {
          ...prev.datasets,
          count: Math.max(0, prev.datasets.count + (Math.random() > 0.9 ? 1 : 0))
        }
      }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Add simulated activity periodically
  useEffect(() => {
    const possibleActivities = [
      { type: 'query', message: `Searched "${['protein folding', 'neural networks', 'climate data', 'genomics'][Math.floor(Math.random() * 4)]}"`, icon: '🔍', details: 'Auto-refreshed results' },
      { type: 'connect', message: 'API health check passed', icon: '✅', details: 'All endpoints responding' },
      { type: 'system', message: 'Cache cleared for optimal performance', icon: '🧹', details: 'Freed 12MB memory' },
    ];
    
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const activity = possibleActivities[Math.floor(Math.random() * possibleActivities.length)];
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          ...activity,
          timestamp: new Date(),
        };
        setRichActivities(prev => [newActivity, ...prev]);
      }
    }, 60000); // Every minute, 40% chance
    
    return () => clearInterval(interval);
  }, []);

  const statCards: StatCardConfig[] = [
    { key: 'activeJobs', icon: '⚡', color: 'text-blue-500', route: '/compute' },
    { key: 'storageUsed', icon: '💾', color: 'text-green-500', route: '/data' },
    { key: 'apiCallsToday', icon: '🔌', color: 'text-purple-500', route: '/connectors' },
    { key: 'collaborators', icon: '👥', color: 'text-orange-500', route: '/collaboration' },
  ];

  // Use realistic activities if no real activities exist, otherwise use rich activities
  const displayActivities = activities.length > 0 ? activities : richActivities;

  // Filter activities by type
  const filteredActivities = activityFilter === 'all' 
    ? displayActivities 
    : displayActivities.filter(a => a.type === activityFilter);

  // Animated counters for synthetic stats
  const animatedDatasets = useAnimatedCounter(syntheticStats.datasets.count, 1500, statsAnimated);
  const animatedQueries = useAnimatedCounter(syntheticStats.queries.count, 2000, statsAnimated);
  const animatedApiCalls = useAnimatedCounter(syntheticStats.apiCallsToday.used, 1800, statsAnimated);

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const getActivityIconColor = (type: string) => {
    const colors: Record<string, string> = {
      query: 'bg-blue-100 dark:bg-blue-900',
      connect: 'bg-green-100 dark:bg-green-900',
      execute: 'bg-purple-100 dark:bg-purple-900',
      upload: 'bg-orange-100 dark:bg-orange-900',
      download: 'bg-cyan-100 dark:bg-cyan-900',
      collaborate: 'bg-pink-100 dark:bg-pink-900',
      achievement: 'bg-yellow-100 dark:bg-yellow-900',
      system: 'bg-gray-100 dark:bg-gray-800',
    };
    return colors[type] || 'bg-muted';
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      search: '🔍', save: '⭐', export: '📤', job: '⚙️',
      collaboration: '👥', login: '🔑', download: '⬇️', upload: '⬆️',
      query: '🔎', compute: '🤖', connect: '✅', disconnect: '❌',
      create: '📄', delete: '🗑️', execute: '💻', achievement: '🏆',
      system: '🔄', collaborate: '👥'
    };
    return icons[type] || '📋';
  };

  // Get initials for default avatar
  const getInitials = () => {
    const name = userProfile.displayName.value || 'Researcher';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = () => {
    const name = userProfile.displayName.value || 'R';
    const index = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  // Handle emoji avatar selection
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmojiAvatar(emoji);
    setCurrentAvatar(emoji);
    setAvatarPreview(null);
    localStorage.setItem('user-avatar', emoji);
    addActivity({
      type: 'profile',
      message: createDynamicField(`Updated profile avatar to ${emoji}`),
      icon: emoji,
    });
    showSuccessToast('Avatar Updated!', `Your profile picture has been changed to ${emoji}`);
  };

  // Handle avatar removal
  const handleRemoveAvatar = () => {
    setSelectedEmojiAvatar('');
    setCurrentAvatar('');
    setAvatarPreview(null);
    localStorage.removeItem('user-avatar');
  };

  // Handle stat editing
  const startEditing = (key: string, currentValue: any) => {
    setEditingStat(key);
    setTempValue(String(currentValue));
  };

  const saveStat = (key: string) => {
    const numValue = parseFloat(tempValue);
    if (!isNaN(numValue)) {
      updateDashboardStat(key as any, isNaN(numValue) ? tempValue : numValue);
      addActivity({
        type: 'update',
        message: createDynamicField(`Updated dashboard statistic: ${key}`),
        icon: '📊',
      });
    }
    setEditingStat(null);
  };

  // Handle profile field updates
  const handleProfileChange = (field: keyof typeof userProfile, value: string) => {
    updateUserProfile(field, value);
  };

  // Avatar upload handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showErrorToast('File Too Large', 'Maximum file size is 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setCurrentAvatar(result);
        setSelectedEmojiAvatar('');
        localStorage.setItem('user-avatar', result);
        addActivity({
          type: 'update',
          message: createDynamicField('Updated profile picture'),
          icon: '🖼️',
        });
        showSuccessToast('Avatar Updated!', 'Your profile picture has been changed');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save avatar (close modal)
  const saveAvatar = () => {
    setShowAvatarModal(false);
  };

  // Save full profile
  const handleSaveFullProfile = async () => {
    setProfileSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update store values
      updateUserProfile('displayName', fullProfile.displayName);
      updateUserProfile('email', fullProfile.email);
      
      // Store extended profile in localStorage
      localStorage.setItem('scihub_full_profile', JSON.stringify(fullProfile));

      addActivity({
        type: 'save',
        message: createDynamicField('Updated complete profile'),
        icon: '👤',
      });
      
      showSuccessToast('Profile Saved!', 'Your profile has been updated successfully');
      
      setProfileSaved(true);
      setTimeout(() => {
        setProfileSaved(false);
        setShowFullProfileModal(false);
      }, 2000);
    } catch (error) {
      showErrorToast('Save Failed', 'Failed to save profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Simulate database push
  const handlePushToDatabase = async () => {
    setIsPushing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const result = useDynamicStore.getState().simulatePushToDatabase();
      setShowVolumeWarning(false);
      addActivity({
        type: 'export',
        message: createDynamicField(`Data pushed to ${dbConfig.provider} successfully`),
        icon: '💾',
      });
      showSuccessToast('Data Exported!', `Data pushed to ${dbConfig.provider} successfully`);
    } catch (error) {
      console.error('Push failed:', error);
      showErrorToast('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsPushing(false);
    }
  };

  const dirtyCount = getDirtyFieldsCount();

  // Profile completion calculation
  const profileCompletion = [
    { field: 'Avatar', complete: !!currentAvatar, points: 20 },
    { field: 'Name', complete: !!userProfile.displayName.value, points: 10 },
    { field: 'Institution', complete: !!fullProfile.institution, points: 15 },
    { field: 'Research Interests', complete: !!fullProfile.researchInterests, points: 15 },
    { field: 'ORCID', complete: !!fullProfile.orcid, points: 10 },
    { field: 'Bio', complete: (fullProfile.bio?.length || 0) > 20, points: 20 },
    { field: 'Preferences', complete: true, points: 10 },
  ];

  const completionPercentage = profileCompletion.reduce((acc, item) => acc + (item.complete ? item.points : 0), 0);

  // Contextual CTAs based on user state
  const getContextualCTAs = () => {
    const ctas: { icon: string; message: string; type: 'warning' | 'info' | 'success'; action: string }[] = [];
    
    if (syntheticStats.storageUsed.percentage > 80) {
      ctas.push({
        icon: '⚠️',
        message: `Running low on storage (${syntheticStats.storageUsed.percentage}% used) — Upgrade for more space`,
        type: 'warning',
        action: 'Upgrade Storage'
      });
    }
    
    if (syntheticStats.apiCallsToday.percentage > 90) {
      ctas.push({
        icon: '🔥',
        message: `Almost at daily API limit (${syntheticStats.apiCallsToday.used}/${syntheticStats.apiCallsToday.limit}) — Pro users get unlimited`,
        type: 'warning',
        action: 'View Plans'
      });
    }
    
    if (syntheticStats.connectors.count < 5) {
      ctas.push({
        icon: '🔗',
        message: `Connect more APIs to supercharge your research (${syntheticStats.connectors.count}/${syntheticStats.connectors.total} connected)`,
        type: 'info',
        action: 'Browse Connectors'
      });
    }
    
    if (completionPercentage < 70) {
      ctas.push({
        icon: '📝',
        message: `Your profile is ${completionPercentage}% complete — Add more info to connect with collaborators`,
        type: 'info',
        action: 'Complete Profile'
      });
    }

    if (ctas.length === 0) {
      ctas.push({
        icon: '💡',
        message: 'Ready to explore? Try searching for papers or connecting a new data source',
        type: 'success',
        action: 'Get Started'
      });
    }
    
    return ctas;
  };

  const contextualCTAs = getContextualCTAs();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-muted rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header with Profile Summary */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            {/* Enhanced Avatar with Upload */}
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="relative group"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all group-hover:ring-4 group-hover:ring-cyan-500/30 overflow-hidden ${
                currentAvatar?.startsWith('data:') 
                  ? '' 
                  : currentAvatar && currentAvatar.length <= 2
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white text-3xl'
                    : `bg-gradient-to-br ${getAvatarColor()} text-white`
              }`}
              style={currentAvatar?.startsWith('data:') ? { backgroundImage: `url(${currentAvatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {currentAvatar?.startsWith('data:') ? null : (currentAvatar && currentAvatar.length <= 2 ? currentAvatar : getInitials())}
              </div>
              {/* Upload indicator overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {/* Online status indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {userProfile.displayName.value || 'Researcher'}! 👋
                </h1>
                <Badge variant="secondary" className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                  ⭐ Pro Plan
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your research today.
              </p>
              
              {/* Session Info & Quick Stats */}
              <div className="flex flex-wrap gap-3 mt-3">
                <Badge variant="outline" className="gap-1">
                  🕐 Session: {sessionDuration}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  📅 Last login: {formatTimeAgo(new Date(syntheticStats.lastLogin))}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  👥 {syntheticStats.teamMembers} team members
                </Badge>
                <Badge variant="outline" className="gap-1">
                  📁 {syntheticStats.activeProjects} active projects
                </Badge>
              </div>

              {/* Profile Completion Progress */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2 mb-2" />
                <div className="flex flex-wrap gap-2">
                  {profileCompletion.map((item) => (
                    <span 
                      key={item.field}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.complete 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.complete ? '✓' : '○'} {item.field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Profile Edit */}
          <Card className="w-80 shrink-0">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Display Name</label>
                  <Input
                    value={userProfile.displayName.value}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    className={`text-sm h-8 ${userProfile.displayName.isDirty ? 'border-orange-400' : ''}`}
                    placeholder="Enter your name..."
                  />
                  {userProfile.displayName.isDirty && (
                    <Badge variant="secondary" className="mt-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Modified</Badge>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <Input
                    type="email"
                    value={userProfile.email.value}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className={`text-sm h-8 ${userProfile.email.isDirty ? 'border-orange-400' : ''}`}
                    placeholder="your@email.com"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowFullProfileModal(true)}
                >
                  ✏️ Edit Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dirty Fields Indicator */}
        {dirtyCount > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center justify-between animate-pulse">
            <span className="text-sm text-orange-700 dark:text-orange-300">
              📝 You have {dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => useDynamicStore.getState().resetAllFields()}>
                Reset All
              </Button>
              <Button size="sm" onClick={handlePushToDatabase} disabled={isPushing}>
                {isPushing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Volume Warning */}
        {showVolumeWarning && dbConfig.enabled && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Data Volume Approaching Threshold
              </span>
              <Badge variant="secondary">{dbConfig.provider.toUpperCase()}</Badge>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Your data is approaching the auto-push threshold. Consider pushing to your configured database.
            </p>
            <Button 
              size="sm" 
              onClick={handlePushToDatabase} 
              disabled={isPushing}
              className="w-full"
            >
              {isPushing ? '⏳ Pushing to Database...' : `🚀 Push to ${dbConfig.provider.toUpperCase()}`}
            </Button>
          </div>
        )}

        {/* Contextual CTAs */}
        <div className="mt-4 space-y-2">
          {contextualCTAs.map((cta, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                cta.type === 'warning' 
                  ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' 
                  : cta.type === 'info'
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                    : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{cta.icon}</span>
                <span className={`text-sm ${
                  cta.type === 'warning' 
                    ? 'text-yellow-700 dark:text-yellow-300' 
                    : cta.type === 'info'
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-green-700 dark:text-green-300'
                }`}>
                  {cta.message}
                </span>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                {cta.action}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Stats Grid with Live Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Datasets Card - Synthetic */}
        <Link href="/datasets">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                <div className="flex items-center gap-1">
                  <span className="text-green-500 text-sm">↑</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    +{syntheticStats.datasets.change} today
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Datasets</p>
              <p className="text-2xl font-bold text-blue-500">
                {animatedDatasets}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {syntheticStats.datasets.count + 88} total
                </span>
              </p>
              <Progress value={(animatedDatasets / (syntheticStats.datasets.count + 88)) * 100} className="mt-3 h-1.5" />
            </CardContent>
          </Card>
        </Link>

        {/* Queries Card - Synthetic with Animation */}
        <Link href="/query">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                <div className="flex items-center gap-1">
                  <span className="text-green-500 text-sm">↑</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    +{syntheticStats.queries.change} today
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Queries</p>
              <p className="text-2xl font-bold text-green-500">
                {animatedQueries.toLocaleString()}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live updating
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Storage Card - With Progress Bar */}
        <Link href="/data">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">💾</span>
                <Badge 
                  variant="secondary" 
                  className={
                    syntheticStats.storageUsed.percentage > 80 
                      ? 'bg-red-100 text-red-800' 
                      : syntheticStats.storageUsed.percentage > 60 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }
                >
                  {syntheticStats.storageUsed.percentage}% used
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold text-emerald-500">
                {syntheticStats.storageUsed.used} <span className="text-sm font-normal">/ {syntheticStats.storageUsed.total} {syntheticStats.storageUsed.unit}</span>
              </p>
              <Progress value={syntheticStats.storageUsed.percentage} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {syntheticStats.storageUsed.total - syntheticStats.storageUsed.used} {syntheticStats.storageUsed.unit} available
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* API Calls Card - With Quota Progress */}
        <Link href="/connectors">
          <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔌</span>
                <Badge 
                  variant="secondary"
                  className={
                    syntheticStats.apiCallsToday.percentage > 90 
                      ? 'bg-red-100 text-red-800 animate-pulse' 
                      : 'bg-purple-100 text-purple-800'
                  }
                >
                  {syntheticStats.apiCallsToday.percentage.toFixed(0)}% of limit
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">API Calls Today</p>
              <p className="text-2xl font-bold text-purple-500">
                {animatedApiCalls.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {syntheticStats.apiCallsToday.limit.toLocaleString()}
                </span>
              </p>
              <Progress value={syntheticStats.apiCallsToday.percentage} className="mt-3 h-2 [&>div]:bg-purple-500" />
              <p className="text-xs text-muted-foreground mt-1">
                {syntheticStats.apiCallsToday.limit - syntheticStats.apiCallsToday.used} calls remaining
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Connectors Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl">🔗</span>
              <span className="text-sm text-muted-foreground">Integrations</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {syntheticStats.connectors.count}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {syntheticStats.connectors.total} available
              </span>
            </p>
            <Progress value={syntheticStats.connectors.percentage} className="mt-3 h-2 [&>div]:bg-orange-500" />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Connect more APIs to unlock advanced features
            </p>
          </CardContent>
        </Card>

        {/* Compute Hours */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl">🤖</span>
              <span className="text-sm text-muted-foreground">This Month</span>
            </div>
            <p className="text-2xl font-bold text-cyan-500">
              {syntheticStats.computeHours.used}h
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {syntheticStats.computeHours.total}h included
              </span>
            </p>
            <Progress value={(syntheticStats.computeHours.used / syntheticStats.computeHours.total) * 100} className="mt-3 h-2 [&>div]:bg-cyan-500" />
            <p className="text-xs text-muted-foreground mt-2">
              ⚡ {syntheticStats.computeHours.total - syntheticStats.computeHours.used}h remaining
            </p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl">📁</span>
              <span className="text-sm text-muted-foreground">Currently Active</span>
            </div>
            <p className="text-2xl font-bold text-pink-500">
              {syntheticStats.activeProjects}
            </p>
            <div className="mt-3 flex gap-2">
              {[...Array(syntheticStats.activeProjects)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                  P{i + 1}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click to view project details →
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Dynamic Links */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/query">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-cyan-50 hover:border-cyan-300 dark:hover:bg-cyan-950">
                🔍 New Search Query
              </Button>
            </Link>
            <Link href="/connectors">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950">
                🔗 Browse Connectors
              </Button>
            </Link>
            <Link href="/workspace">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950">
                💻 Open Workspace IDE
              </Button>
            </Link>
            <Link href="/compute">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-950">
                ⚙️ Run Workflow
              </Button>
            </Link>
            <Link href="/datasets">
              <Button variant="outline" className="w-full justify-start gap-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950">
                📊 Explore Datasets
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start gap-2">
                ⚙️ Settings
              </Button>
            </Link>
            
            {/* Export State Button */}
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 mt-4 border-dashed"
              onClick={() => {
                const stateJson = useDynamicStore.getState().exportState();
                const blob = new Blob([stateJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scihub-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                addActivity({
                  type: 'export',
                  message: createDynamicField('Exported application state'),
                  icon: '📤',
                });
              }}
            >
              📥 Export State (JSON)
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Activity Feed with Filtering & Live Updates */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                📋 Recent Activity
                <span className="flex items-center gap-1 text-xs font-normal text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </CardTitle>
              <Badge variant="secondary">{filteredActivities.length} events</Badge>
            </div>
            <div className="flex gap-2">
              {/* Activity Type Filter */}
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="query">Queries</SelectItem>
                  <SelectItem value="connect">Connections</SelectItem>
                  <SelectItem value="execute">Executions</SelectItem>
                  <SelectItem value="upload">Uploads</SelectItem>
                  <SelectItem value="download">Downloads</SelectItem>
                  <SelectItem value="collaborate">Team</SelectItem>
                  <SelectItem value="achievement">Achievements</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="ghost" onClick={clearActivities}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-auto pr-2 custom-scrollbar">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-medium">No {activityFilter !== 'all' ? activityFilter : ''} activity</p>
                  <p className="text-sm mt-1">Try changing the filter or explore the platform!</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/connectors'}>
                    Explore Connectors
                  </Button>
                </div>
              ) : (
                filteredActivities.slice(0, visibleActivities).map((activity, index) => {
                  const act = 'message' in activity ? activity : { 
                    ...activity, 
                    message: { value: activity.message, isDirty: false } 
                  };
                  const msg = typeof act.message === 'string' ? act.message : act.message.value;
                  const isExpanded = expandedActivity === act.id;
                  
                  return (
                    <div
                      key={act.id || index}
                      className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all group cursor-pointer border border-transparent hover:border-border ${getActivityIconColor(act.type)}`}
                      onClick={() => setExpandedActivity(isExpanded ? null : act.id)}
                    >
                      <div className="relative shrink-0">
                        <span className="text-xl mt-0.5 block w-8 h-8 rounded-full bg-background flex items-center justify-center">
                          {act.icon}
                        </span>
                        {index < filteredActivities.slice(0, visibleActivities).length - 1 && (
                          <div className="absolute left-4 top-10 w-px h-full bg-border" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors font-medium">
                          {msg}
                          {'isDirty' in act.message && act.message.isDirty && (
                            <Badge variant="secondary" className="ml-2 text-xs">Modified</Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(act.timestamp)}
                          </p>
                          {'details' in act && act.details && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                                {act.details}
                              </p>
                            </>
                          )}
                          {/* Activity type badge */}
                          <Badge variant="outline" className="text-xs py-0 h-4">
                            {act.type}
                          </Badge>
                        </div>
                        
                        {/* Expandable Metadata */}
                        {isExpanded && act.metadata && (
                          <div className="mt-2 p-2 bg-background rounded-md text-xs">
                            <pre className="text-muted-foreground whitespace-pre-wrap">
                              {JSON.stringify(act.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                      
                      {/* Activity Action Buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View details">
                          →
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Load More Button */}
            {visibleActivities < filteredActivities.length && (
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setVisibleActivities(prev => prev + 5)}
                >
                  Load More Activities ({filteredActivities.length - visibleActivities} remaining)
                </Button>
              </div>
            )}
            
            {filteredActivities.length > 0 && visibleActivities >= filteredActivities.length && (
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  ✓ Showing all {filteredActivities.length} activities
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status - Dynamic Health */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>🖥️ System Status</CardTitle>
            <Badge className="bg-green-500 text-white animate-pulse">
              ● All Systems Operational
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatusItem name="API Gateway" health={99} latency="12ms" />
              <StatusItem name="Data Lake" health={97} latency="34ms" />
              <StatusItem name="AETHEL AI" health={85} warning latency="89ms" />
              <StatusItem name="Compute Cluster" health={dashboardStats.systemHealth.value} latency="23ms" />
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Overall System Health</span>
                  <span className="text-xs text-muted-foreground ml-2 block sm:inline sm:ml-3">
                    Pro Tier • DuckDB Primary • Auto-scaling Enabled
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-green-500 text-white">
                    {dashboardStats.systemHealth.value}% Healthy
                  </Badge>
                  {dbConfig.enabled && (
                    <Badge variant="outline" className="border-cyan-500 text-cyan-600 dark:text-cyan-400">
                      DB: {dbConfig.provider}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Database Config Quick View */}
              {dbConfig.enabled && (
                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800 text-xs text-muted-foreground">
                  <div className="flex flex-wrap gap-4">
                    <span>Auto-push threshold: {(dbConfig.autoPushThreshold.value / 1024 / 1024).toFixed(0)}MB</span>
                    {dbConfig.lastPush && (
                      <span>Last push: {formatTimeAgo(dbConfig.lastPush)}</span>
                    )}
                    <span>Uptime: 99.97%</span>
                    <span>Region: US-East-1</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Enhanced Avatar Upload Modal with Emoji Picker */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🖼️ Update Profile Picture</DialogTitle>
            <DialogDescription>
              Choose an emoji avatar or upload your own photo. JPG, PNG, or GIF (max 2MB).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Current Avatar Preview */}
            <div className="flex justify-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center overflow-hidden border-4 border-primary/20 ${
                currentAvatar?.startsWith('data:') ? '' : 'bg-gradient-to-br from-violet-500 to-purple-600'
              }`}
              style={currentAvatar?.startsWith('data:') ? { backgroundImage: `url(${currentAvatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {currentAvatar?.startsWith('data:') ? null : (currentAvatar && currentAvatar.length <= 2 ? <span className="text-4xl">{currentAvatar}</span> : <span className="text-2xl font-bold text-white">{getInitials()}</span>)}
              </div>
            </div>

            {/* Emoji Avatar Picker */}
            <div>
              <label className="text-sm font-medium mb-2 block">Choose an Emoji Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 ${
                      selectedEmojiAvatar === emoji 
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            {/* File Upload Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">OR</span>
              </div>
              <div className="border-t" />
            </div>
            
            <label className="cursor-pointer group block">
              <div className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                avatarPreview 
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950' 
                  : 'border-muted-foreground/25 hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/50'
              }`}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium">Upload Image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                    </div>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
            
            {/* Remove Avatar Option */}
            {currentAvatar && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-destructive hover:text-destructive"
                onClick={handleRemoveAvatar}
              >
                🗑️ Remove Avatar
              </Button>
            )}
            
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowAvatarModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveAvatar}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
              >
                Save Avatar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Profile Edit Modal */}
      <Dialog open={showFullProfileModal} onOpenChange={setShowFullProfileModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>👤 Edit Complete Profile</DialogTitle>
            <DialogDescription>
              Update your professional information and research interests.
            </DialogDescription>
          </DialogHeader>
          
          {/* Profile Completion Indicator in Modal */}
          <div className="mb-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Strength</span>
              <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSaveFullProfile(); }} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name *</label>
                <Input
                  value={fullProfile.displayName}
                  onChange={(e) => setFullProfile({...fullProfile, displayName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={fullProfile.email}
                  onChange={(e) => setFullProfile({...fullProfile, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Institution/Organization
                  {!fullProfile.institution && <span className="text-muted-foreground ml-1">(+15%)</span>}
                </label>
                <Input
                  value={fullProfile.institution}
                  onChange={(e) => setFullProfile({...fullProfile, institution: e.target.value})}
                  placeholder="MIT, Stanford, NASA..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ORCID ID
                  {!fullProfile.orcid && <span className="text-muted-foreground ml-1">(+10%)</span>}
                </label>
                <Input
                  value={fullProfile.orcid}
                  onChange={(e) => setFullProfile({...fullProfile, orcid: e.target.value})}
                  placeholder="0000-0000-0000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Research Interests
                {!fullProfile.researchInterests && <span className="text-muted-foreground ml-1">(+15%)</span>}
              </label>
              <Input
                value={fullProfile.researchInterests}
                onChange={(e) => setFullProfile({...fullProfile, researchInterests: e.target.value})}
                placeholder="Machine Learning, Genomics, Drug Discovery..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  type="url"
                  value={fullProfile.website}
                  onChange={(e) => setFullProfile({...fullProfile, website: e.target.value})}
                  placeholder="https://yourlab.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <Select value={fullProfile.timezone} onValueChange={(value) => setFullProfile({...fullProfile, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Berlin">Central European (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                    <SelectItem value="Asia/Shanghai">China (CST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Bio
                {(fullProfile.bio?.length || 0) <= 20 && <span className="text-muted-foreground ml-1">(+20%)</span>}
              </label>
              <textarea
                value={fullProfile.bio}
                onChange={(e) => setFullProfile({...fullProfile, bio: e.target.value})}
                placeholder="Tell us about your research..."
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none focus:ring-2 focus:ring-ring"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">{fullProfile.bio.length}/500 characters</p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowFullProfileModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={profileSaving || profileSaved}
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white min-w-[120px]"
              >
                {profileSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Saving...
                  </>
                ) : profileSaved ? (
                  '✓ Saved!'
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function StatusItem({ name, health, warning, latency }: { name: string; health: number; warning?: boolean; latency?: string }) {
  return (
    <div className="space-y-2 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between text-sm items-center">
        <span className="font-medium">{name}</span>
        <div className="flex items-center gap-2">
          {latency && (
            <span className="text-xs text-muted-foreground">{latency}</span>
          )}
          <span className={warning ? 'text-yellow-500' : 'text-green-500'}>
            {health >= 95 ? '● Operational' : health >= 80 ? '◐ Degraded': '○ Critical'}
          </span>
        </div>
      </div>
      <Progress value={health} className={`h-2 ${warning ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{health}% uptime</span>
        <span>{health >= 95 ? 'Excellent' : health >= 80 ? 'Good' : 'Needs Attention'}</span>
      </div>
    </div>
  );
}
