'use client';

/**
 * SciHub Pro - Settings Page (v1.4 - Enhanced with Auth & History)
 * 
 * NEW FEATURES:
 * - ✅ User Authentication (localStorage-based, demo mode)
 * - ✅ User Profile Management
 * - ✅ Activity/Battle History
 * - ✅ Session Persistence
 * - ✅ Export Settings & Data
 * - ✅ Privacy Controls
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReportGenerator } from '@/components/features/ReportGenerator';

// ============ TYPES ============

interface UserProfile {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: 'student' | 'researcher' | 'professor' | 'industry' | 'other';
  bio: string;
  avatar?: string;
  createdAt: Date;
  lastLogin: Date;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  autoSave: boolean;
  showLineNumbers: boolean;
  fontSize: string;
}

interface ActivityEntry {
  id: string;
  type: 'search' | 'ai_chat' | 'export' | 'save_paper' | 'login' | 'settings_change';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface BattleHistoryEntry {
  id: string;
  topic: string;
  participants: string[];
  winner?: string;
  date: Date;
  rounds: number;
  duration: number; // seconds
}

// ============ CONSTANTS ============

const STORAGE_KEYS = {
  USER_PROFILE: 'scihub_user_profile',
  USER_SETTINGS: 'scihub_user_settings',
  ACTIVITY_HISTORY: 'scihub_activity_history',
  BATTLE_HISTORY: 'scihub_battle_history',
  IS_LOGGED_IN: 'scihub_is_logged_in',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  language: 'en',
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  autoSave: true,
  showLineNumbers: true,
  fontSize: '14',
};

const SAMPLE_ACTIVITIES: ActivityEntry[] = [
  {
    id: '1',
    type: 'search',
    title: 'Searched for CRISPR papers',
    description: 'Found 156 results across arXiv and Semantic Scholar',
    timestamp: new Date(Date.now() - 3600000),
    metadata: { query: 'CRISPR gene therapy', resultsCount: 156 },
  },
  {
    id: '2',
    type: 'ai_chat',
    title: 'AI conversation about AlphaFold',
    description: 'Discussed protein structure prediction with GPT-4o',
    timestamp: new Date(Date.now() - 7200000),
    metadata: { model: 'GPT-4o', messagesCount: 8 },
  },
  {
    id: '3',
    type: 'save_paper',
    title: 'Saved paper to library',
    description: '"Large language models accelerate drug discovery"',
    timestamp: new Date(Date.now() - 86400000),
    metadata: { paperId: 'demo-3', source: 'Semantic Scholar' },
  },
];

const SAMPLE_BATTLES: BattleHistoryEntry[] = [
  {
    id: '1',
    topic: 'AI will replace human researchers in 10 years',
    participants: ['Pro-AI', 'Skeptic'],
    winner: 'Tie',
    date: new Date(Date.now() - 172800000),
    rounds: 5,
    duration: 847,
  },
  {
    id: '2',
    topic: 'Open access publishing is better than traditional journals',
    participants: ['OA Advocate', 'Traditionalist'],
    winner: 'OA Advocate',
    date: new Date(Date.now() - 259200000),
    rounds: 4,
    duration: 623,
  },
];

// ============ LOCAL STORAGE HELPERS ============

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============ MAIN COMPONENT ============

export default function SettingsPage() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(loadFromStorage(STORAGE_KEYS.IS_LOGGED_IN, false));
  const [profile, setProfile] = useState<UserProfile>(
    loadFromStorage(STORAGE_KEYS.USER_PROFILE, null as unknown as UserProfile)
  );
  const [settings, setSettings] = useState<UserSettings>(
    loadFromStorage(STORAGE_KEYS.USER_SETTINGS, DEFAULT_SETTINGS)
  );

  // UI State
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  // Form State (Login/Register)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerOrg, setRegisterOrg] = useState('');
  const [registerRole, setRegisterRole] = useState<string>('researcher');

  // History State
  const [activities, setActivities] = useState<ActivityEntry[]>(
    loadFromStorage(STORAGE_KEYS.ACTIVITY_HISTORY, SAMPLE_ACTIVITIES)
  );
  const [battleHistory, setBattleHistory] = useState<BattleHistoryEntry[]>(
    loadFromStorage(STORAGE_KEYS.BATTLE_HISTORY, SAMPLE_BATTLES)
  );

  // Save settings whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER_SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    if (profile) {
      saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
    }
  }, [profile]);

  // Update setting helper
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    addActivity('settings_change', `Changed ${key}`, `Updated ${key} setting`);
  };

  // Add activity entry
  const addActivity = useCallback((type: ActivityEntry['type'], title: string, description: string, metadata?: Record<string, any>) => {
    const newActivity: ActivityEntry = {
      id: generateId(),
      type,
      title,
      description,
      timestamp: new Date(),
      metadata,
    };
    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, 100); // Keep last 100
      saveToStorage(STORAGE_KEYS.ACTIVITY_HISTORY, updated);
      return updated;
    });
  }, []);

  // Auth Handlers
  const handleLogin = () => {
    if (!loginEmail || !loginPassword) return;

    // Demo authentication (in real app, would call API)
    const userProfile: UserProfile = {
      id: generateId(),
      name: loginEmail.split('@')[0],
      email: loginEmail,
      organization: '',
      role: 'researcher',
      bio: '',
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setIsLoggedIn(true);
    setProfile(userProfile);
    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    saveToStorage(STORAGE_KEYS.USER_PROFILE, userProfile);
    
    setShowLoginDialog(false);
    setLoginEmail('');
    setLoginPassword('');
    
    addActivity('login', 'User logged in', `Logged in as ${userProfile.email}`);
  };

  const handleRegister = () => {
    if (!registerName || !registerEmail) return;

    const userProfile: UserProfile = {
      id: generateId(),
      name: registerName,
      email: registerEmail,
      organization: registerOrg,
      role: registerRole as UserProfile['role'],
      bio: '',
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setIsLoggedIn(true);
    setProfile(userProfile);
    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, true);
    saveToStorage(STORAGE_KEYS.USER_PROFILE, userProfile);
    
    setShowRegisterDialog(false);
    setRegisterName('');
    setRegisterEmail('');
    setRegisterOrg('');
    
    addActivity('login', 'New user registered', `Account created for ${userProfile.email}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setProfile(null as unknown as UserProfile);
    saveToStorage(STORAGE_KEYS.IS_LOGGED_IN, false);
    addActivity('login', 'User logged out', 'Session ended');
  };

  const handleUpdateProfile = () => {
    if (profile) {
      setProfile({ ...profile, lastLogin: new Date() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      addActivity('settings_change', 'Profile updated', 'Updated profile information');
    }
  };

  // Clear history handlers
  const clearActivityHistory = () => {
    setActivities([]);
    saveToStorage(STORAGE_KEYS.ACTIVITY_HISTORY, []);
  };

  const clearBattleHistory = () => {
    setBattleHistory([]);
    saveToStorage(STORAGE_KEYS.BATTLE_HISTORY, []);
  };

  // Export all data handler
  const handleExportAllData = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      profile,
      settings,
      activities: activities.length,
      battleHistory: battleHistory.length,
      version: '1.4',
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scihub-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addActivity('export', 'Exported all data', 'Full data export completed');
  };

  // Format time ago
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Get activity icon
  const getActivityIcon = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'search': return '🔍';
      case 'ai_chat': return '🤖';
      case 'export': return '📤';
      case 'save_paper': return '⭐';
      case 'login': return '👤';
      case 'settings_change': return '⚙️';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              ⚙️ Settings
              <Badge variant="outline" className="text-xs">v1.4 Auth & History</Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account, preferences, and view activity history
            </p>
          </div>

          {/* Auth Status */}
          {isLoggedIn && profile ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                <span className="text-lg">👤</span>
                <div>
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.role}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowLoginDialog(true)}>
                Login
              </Button>
              <Button onClick={() => setShowRegisterDialog(true)}>
                Sign Up Free
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">👤 Profile</TabsTrigger>
          <TabsTrigger value="preferences">🎨 Preferences</TabsTrigger>
          <TabsTrigger value="history">📜 History</TabsTrigger>
          <TabsTrigger value="battles">⚔️ Battles</TabsTrigger>
          <TabsTrigger value="data">💾 Data</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          {!isLoggedIn ? (
            /* Not Logged In */
            <Card className="border-dashed"><CardContent className="p-12 text-center">
              <span className="text-6xl block mb-4">🔒</span>
              <h2 className="text-xl font-semibold mb-2">Sign In to Access Your Profile</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create a free account to sync your settings, save papers, track history, and get personalized recommendations.
              </p>
              <div className="flex justify-center gap-3">
                <Button size="lg" onClick={() => setShowRegisterDialog(true)}>
                  Create Free Account →
                </Button>
                <Button size="lg" variant="outline" onClick={() => setShowLoginDialog(true)}>
                  Login
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium mb-3">What you get with an account:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <span className="text-xl block mb-1">☁️</span>
                    Sync Across Devices
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <span className="text-xl block mb-1">📊</span>
                    Activity Tracking
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <span className="text-xl block mb-1">⭐</span>
                    Saved Papers Library
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg text-center">
                    <span className="text-xl block mb-1">🎯</span>
                    Personalized Results
                  </div>
                </div>
              </div>
            </CardContent></Card>
          ) : (
            /* Logged In - Profile Form */
            <>
              <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    <Input 
                      value={profile?.name || ''} 
                      onChange={(e) => profile && setProfile({...profile, name: e.target.value})}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input 
                      value={profile?.email || ''} 
                      onChange={(e) => profile && setProfile({...profile, email: e.target.value})}
                      type="email"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Organization</label>
                    <Input 
                      value={profile?.organization || ''} 
                      onChange={(e) => profile && setProfile({...profile, organization: e.target.value})}
                      placeholder="University / Company"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <Select value={profile?.role || 'researcher'} onValueChange={(v) => profile && setProfile({...profile, role: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">🎓 Student</SelectItem>
                        <SelectItem value="researcher">🔬 Researcher</SelectItem>
                        <SelectItem value="professor">👨‍🏫 Professor</SelectItem>
                        <SelectItem value="industry">🏢 Industry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea 
                    value={profile?.bio || ''} 
                    onChange={(e) => profile && setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell us about your research interests..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateProfile} disabled={saved}>
                    {saved ? '✅ Saved!' : '💾 Save Changes'}
                  </Button>
                </div>
              </CardContent></Card>

              {/* Account Stats */}
              <Card><CardHeader><CardTitle>Account Statistics</CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
                    <div className="text-xs text-muted-foreground">Total Activities</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{battleHistory.length}</div>
                    <div className="text-xs text-muted-foreground">Battles</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.ceil((new Date().getTime() - new Date(profile?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Active</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {loadFromStorage('scihub_saved_papers', []).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Papers Saved</div>
                  </div>
                </div>
              </CardContent></Card>
            </>
          )}
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">☀️ Light</SelectItem>
                    <SelectItem value="dark">🌙 Dark</SelectItem>
                    <SelectItem value="system">💻 System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <Select value={settings.fontSize} onValueChange={(v) => updateSetting('fontSize', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">Small (12px)</SelectItem>
                    <SelectItem value="14">Medium (14px)</SelectItem>
                    <SelectItem value="16">Large (16px)</SelectItem>
                    <SelectItem value="18">Extra Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Notifications</CardTitle></CardHeader><CardContent className="space-y-4">
            {[
              { key: 'emailNotifications' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'pushNotifications' as const, label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Weekly summary of activity' },
              { key: 'autoSave' as const, label: 'Auto-Save', desc: 'Automatically save work progress' },
              { key: 'showLineNumbers' as const, label: 'Show Line Numbers', desc: 'Display line numbers in code editor' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch 
                  checked={settings[item.key]} 
                  onCheckedChange={(v) => updateSetting(item.key, v)}
                />
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6 space-y-6">
          <Card><CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm" onClick={clearActivityHistory}>Clear History</Button>
          </CardHeader><CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">📭</span>
                No activity yet
              </div>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 20).map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className="text-xl mt-0.5">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* Battles Tab */}
        <TabsContent value="battles" className="mt-6 space-y-6">
          <Card><CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Battle History</CardTitle>
            <div className="flex gap-2">
              <ReportGenerator trigger={<Button variant="outline" size="sm">📄 Export</Button>} />
              <Button variant="outline" size="sm" onClick={clearBattleHistory}>Clear</Button>
            </div>
          </CardHeader><CardContent>
            {battleHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">⚔️</span>
                No battles yet. Start a debate to see your history here!
              </div>
            ) : (
              <div className="space-y-4">
                {battleHistory.map(battle => (
                  <div key={battle.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{battle.topic}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {battle.participants.join(' vs ')} • {battle.rounds} rounds • {Math.floor(battle.duration / 60)}m {battle.duration % 60}s
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {battle.winner && <Badge variant="secondary" className="mb-1">Winner: {battle.winner}</Badge>}
                        <p className="text-xs text-muted-foreground">{timeAgo(battle.date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="mt-6 space-y-6">
          <Card><CardHeader><CardTitle>Data Management</CardTitle><CardDescription>Export, import, or delete your data</CardDescription></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportAllData}>
                <span className="text-2xl">📥</span>
                <span>Export All Data (JSON)</span>
              </Button>
              
              <ReportGenerator trigger={
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 w-full">
                  <span className="text-2xl">📊</span>
                  <span>Generate Activity Report</span>
                </Button>
              } />

              <Button variant="outline" className="h-auto py-4 flex-col gap-2 text-red-600 hover:text-red-700" onClick={() => {
                if (confirm('Are you sure? This will clear all local data.')) {
                  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
                  window.location.reload();
                }
              }}>
                <span className="text-2xl">🗑️</span>
                <span>Delete All Local Data</span>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <span className="text-2xl">🔄</span>
                <span>Reset to Defaults</span>
              </Button>
            </div>
          </CardContent></Card>

          {/* Storage Usage */}
          <Card><CardHeader><CardTitle>Local Storage Usage</CardTitle></CardHeader><CardContent className="space-y-4">
            {Object.entries({
              'User Profile': STORAGE_KEYS.USER_PROFILE,
              'Settings': STORAGE_KEYS.USER_SETTINGS,
              'Activity History': STORAGE_KEYS.ACTIVITY_HISTORY,
              'Battle History': STORAGE_KEYS.BATTLE_HISTORY,
              'Saved Papers': 'scihub_saved_papers',
              'LLM Config': 'aethel_llm_config',
            }).map(([name, key]) => {
              try {
                const data = localStorage.getItem(key);
                const size = data ? new Blob([data]).size : 0;
                const percentage = Math.min((size / 5000) * 100, 100); // Assuming 5KB max per item
                
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm w-32">{name}</span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {(size / 1024).toFixed(1)}KB
                    </span>
                  </div>
                );
              } catch {
                return null;
              }
            })}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome Back!</DialogTitle>
            <DialogDescription>Login to access your account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input 
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={!loginEmail || !loginPassword}>
              Login →
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo mode: Any email/password works!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>Join SciHub Pro for free</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input 
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Dr. Jane Smith"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input 
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="your@university.edu"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Organization</label>
              <Input 
                value={registerOrg}
                onChange={(e) => setRegisterOrg(e.target.value)}
                placeholder="University or Company"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">I am a...</label>
              <Select value={registerRole} onValueChange={setRegisterRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">🎓 Student</SelectItem>
                  <SelectItem value="researcher">🔬 Researcher</SelectItem>
                  <SelectItem value="professor">👨‍🏫 Professor</SelectItem>
                  <SelectItem value="industry">🏢 Industry Professional</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleRegister} disabled={!registerName || !registerEmail}>
              Create Free Account →
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our Terms of Service
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
