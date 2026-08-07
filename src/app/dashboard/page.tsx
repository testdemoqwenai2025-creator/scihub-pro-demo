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
}

// ============ REALISTIC ACTIVITY DATA ============

const generateRealisticActivities = (): ActivityItem[] => {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'connect',
      message: 'Connected to CrossRef API successfully',
      icon: '📚',
      timestamp: new Date(now.getTime() - 2 * 60000),
      details: 'Latency: 45ms • 12 queries available'
    },
    {
      id: '2',
      type: 'search',
      message: 'Searched "machine learning drug discovery"',
      icon: '🔍',
      timestamp: new Date(now.getTime() - 8 * 60000),
      details: 'Found 234 results across 5 databases'
    },
    {
      id: '3',
      type: 'export',
      message: 'Exported dataset to Parquet format',
      icon: '📤',
      timestamp: new Date(now.getTime() - 15 * 60000),
      details: '2.4GB • 15,000 rows • Compression: 8x'
    },
    {
      id: '4',
      type: 'job',
      message: 'Completed analysis pipeline: RNA-seq',
      icon: '⚙️',
      timestamp: new Date(now.getTime() - 32 * 60000),
      details: 'Duration: 4m 23s • GPU: RTX 4090'
    },
    {
      id: '5',
      type: 'collaboration',
      message: 'Dr. Sarah Chen joined workspace',
      icon: '👥',
      timestamp: new Date(now.getTime() - 45 * 60000),
      details: 'MIT • Computational Biology'
    },
    {
      id: '6',
      type: 'download',
      message: 'Downloaded PDB structure 7A94',
      icon: '⬇️',
      timestamp: new Date(now.getTime() - 1 * 3600000),
      details: '3.2MB • Cryo-EM • 2.8Å resolution'
    },
    {
      id: '7',
      type: 'query',
      message: 'Ran SPARQL query on Wikidata',
      icon: '🔎',
      timestamp: new Date(now.getTime() - 1.5 * 3600000),
      details: '1,247 results in 234ms'
    },
    {
      id: '8',
      type: 'save',
      message: 'Saved workflow: ML Training Pipeline v2',
      icon: '⭐',
      timestamp: new Date(now.getTime() - 2 * 3600000),
      details: '12 nodes • Auto-versioned'
    },
    {
      id: '9',
      type: 'compute',
      message: 'Provisioned compute cluster (4 GPUs)',
      icon: '🤖',
      timestamp: new now.getTime() - 3 * 3600000 > 0 ? new Date(now.getTime() - 3 * 3600000) : now,
      details: 'AWS us-east-1 • $0.84/hr'
    },
    {
      id: '10',
      type: 'upload',
      message: 'Uploaded dataset: clinical_trial_data.csv',
      icon: '⬆️',
      timestamp: new Date(now.getTime() - 4 * 3600000),
      details: '156MB • Validated ✓'
    }
  ];
};

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
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
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

  const statCards: StatCardConfig[] = [
    { key: 'activeJobs', icon: '⚡', color: 'text-blue-500', route: '/compute' },
    { key: 'storageUsed', icon: '💾', color: 'text-green-500', route: '/data' },
    { key: 'apiCallsToday', icon: '🔌', color: 'text-purple-500', route: '/connectors' },
    { key: 'collaborators', icon: '👥', color: 'text-orange-500', route: '/collaboration' },
  ];

  // Use realistic activities if no real activities exist
  const displayActivities = activities.length > 0 ? activities : generateRealisticActivities();

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      search: '🔍', save: '⭐', export: '📤', job: '⚙️',
      collaboration: '👥', login: '🔑', download: '⬇️', upload: '⬆️',
      query: '🔎', compute: '🤖', connect: '✅', disconnect: '❌',
      create: '📄', delete: '🗑️'
    };
    return icons[type] || '📋';
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
        alert('File too large. Maximum size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        addActivity({
          type: 'update',
          message: createDynamicField('Updated profile avatar'),
          icon: '🖼️',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save avatar
  const saveAvatar = () => {
    setShowAvatarModal(false);
    // In production, this would upload to server
    localStorage.setItem('scihub_avatar', avatarPreview || '');
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
      
      setProfileSaved(true);
      setTimeout(() => {
        setProfileSaved(false);
        setShowFullProfileModal(false);
      }, 2000);
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
    } catch (error) {
      console.error('Push failed:', error);
    } finally {
      setIsPushing(false);
    }
  };

  const dirtyCount = getDirtyFieldsCount();

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
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar with Upload */}
            <button 
              onClick={() => setShowAvatarModal(true)}
              className="relative group"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all group-hover:ring-4 group-hover:ring-cyan-500/30 ${
                avatarPreview 
                  ? 'bg-cover bg-center' 
                  : 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white'
              }`}
              style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {}}
              >
                {!avatarPreview && userProfile.displayName.value.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>

            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {userProfile.displayName.value || 'Researcher'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your research today.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ● Pro Plan Active
                </Badge>
                <Badge variant="outline">
                  Since {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Quick Profile Edit */}
          <Card className="w-80">
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
      </div>

      {/* Stats Grid - Dynamic & Editable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((config) => {
          const stat = dashboardStats[config.key as keyof typeof dashboardStats];
          const numericValue = typeof stat.value === 'number' ? stat.value : parseFloat(String(stat.value));
          const change = Math.floor((Math.random() - 0.5) * 20);

          return (
            <Link key={config.key} href={config.route}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{config.icon}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={change > 0 ? 'default' : 'secondary'}
                        className={`${change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} ${stat.isDirty ? 'bg-orange-500 text-white' : ''}`}
                      >
                        {stat.isDirty ? '✏️ Edited' : `${change > 0 ? '+' : ''}${change}%`}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{t(`dashboard.${config.key === 'activeJobs' ? 'active_jobs' : config.key === 'storageUsed' ? 'storage_used' : config.key === 'apiCallsToday' ? 'api_calls_today' : 'collaborators'}`)}</p>
                  
                  {editingStat === config.key ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveStat(config.key)}
                        onKeyDown={(e) => e.key === 'Enter' && saveStat(config.key)}
                        className={`font-bold text-xl h-8 ${config.color}`}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <p 
                      className={`text-2xl font-bold ${config.color} cursor-pointer hover:underline`}
                      onClick={(e) => {
                        e.preventDefault();
                        startEditing(config.key, stat.value);
                      }}
                      title="Click to edit"
                    >
                      {stat.value}
                      {stat.isDirty && <span className="ml-1 text-xs">✏️</span>}
                    </p>
                  )}
                  
                  {/* Progress bar for visual effect */}
                  <Progress value={Math.min(100, numericValue % 100)} className="mt-3 h-1" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
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

        {/* Recent Activity Feed - Enhanced */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>📋 Recent Activity</CardTitle>
              <Badge variant="secondary">{displayActivities.length} events</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => {
                // Simulate refresh
                addActivity({
                  type: 'sync',
                  message: createDynamicField('Activity feed refreshed'),
                  icon: '🔄',
                });
              }}>
                🔄 Refresh
              </Button>
              <Button size="sm" variant="ghost" onClick={clearActivities}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-auto pr-2 custom-scrollbar">
              {displayActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm mt-1">Start exploring to see activity here!</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/connectors'}>
                    Explore Connectors
                  </Button>
                </div>
              ) : (
                displayActivities.map((activity, index) => {
                  const act = 'message' in activity ? activity : { 
                    ...activity, 
                    message: { value: activity.message, isDirty: false } 
                  };
                  const msg = typeof act.message === 'string' ? act.message : act.message.value;
                  
                  return (
                    <div
                      key={act.id || index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all group cursor-pointer border border-transparent hover:border-border"
                    >
                      <div className="relative">
                        <span className="text-xl mt-0.5">{act.icon}</span>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors font-medium">
                          {msg}
                          {'isDirty' in act.message && act.message.isDirty && (
                            <Badge variant="secondary" className="ml-2 text-xs">Modified</Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
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
                        </div>
                      </div>
                      
                      {/* Activity Action Buttons */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View details">
                          →
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {displayActivities.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  View All Activity →
                </Button>
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

      {/* Avatar Upload Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🖼️ Update Profile Picture</DialogTitle>
            <DialogDescription>
              Choose a photo for your profile. JPG, PNG, or GIF (max 2MB).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex justify-center">
              <label className="cursor-pointer group">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 border-dashed border-muted-foreground/25 group-hover:border-cyan-500 transition-colors ${
                  avatarPreview ? 'border-solid border-cyan-500' : ''
                }`}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-muted-foreground mt-1 block">Upload</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            {avatarPreview && (
              <div className="text-center">
                <p className="text-sm text-green-600 dark:text-green-400">✓ Image selected</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAvatarModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveAvatar}
                disabled={!avatarPreview}
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
                <label className="block text-sm font-medium mb-1">Institution/Organization</label>
                <Input
                  value={fullProfile.institution}
                  onChange={(e) => setFullProfile({...fullProfile, institution: e.target.value})}
                  placeholder="MIT, Stanford, NASA..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ORCID ID</label>
                <Input
                  value={fullProfile.orcid}
                  onChange={(e) => setFullProfile({...fullProfile, orcid: e.target.value})}
                  placeholder="0000-0000-0000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Research Interests</label>
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
              <label className="block text-sm font-medium mb-1">Bio</label>
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
