'use client';

/**
 * SciHub Pro - Settings Page
 * 
 * Complete settings management with:
 * - User preferences (theme, language, etc.)
 * - Profile management
 * - Data export/import
 * - Storage management
 * - Notification settings
 * - Upgrade/Plan management
 * - Call-for-action prompts
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useSciHubStore, VOLUME_TIERS } from '@/store/useSciHubStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SettingsSkeleton, FormSkeleton } from '@/components/SkeletonComponents';

// ============ SETTINGS PAGE COMPONENT ============

export default function SettingsPage() {
  const { t } = useTranslation();
  const store = useSciHubStore();
  
  const {
    preferences,
    updatePreferences,
    setTheme,
    setLanguage,
    setSkillLevel,
    userProfile,
    updateUserProfile,
    resetProfileChanges,
    datasets,
    totalStorageUsed,
    currentVolumeTier,
    databaseConfig,
    exportState,
    importState,
    addActivity,
    triggerUpgradePrompt,
    checkVolumeThreshold,
    getDirtyFieldsCount,
    resetAllFields,
    notifications,
    markAllNotificationsRead,
  } = store;

  // UI State
  const [activeTab, setActiveTab] = useState('profile');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate storage percentage for current tier
  const storagePercentage = Math.min(
    100,
    totalStorageUsed > 0 && currentVolumeTier?.maxSize > 0 
      ? (totalStorageUsed / currentVolumeTier.maxSize) * 100 
      : 0
  );

  // Format bytes to readable string
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ============ HANDLERS ============

  const handleExportData = () => {
    try {
      const stateJson = exportState();
      const blob = new Blob([stateJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scihub-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      addActivity({
        type: 'export',
        message: createDynamicField('Exported application backup'),
        icon: '📥',
      });
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportData = () => {
    try {
      const success = importState(importText);
      setImportResult({
        success,
        message: success 
          ? 'Data imported successfully! Your settings and workspace have been restored.'
          : 'Import failed. Please check that the file is a valid SciHub Pro backup.'
      });
      
      if (success) {
        addActivity({
          type: 'import',
          message: createDynamicField('Imported application backup'),
          icon: '📤',
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Import failed: Invalid file format.',
      });
    }
  };

  const handleResetAll = () => {
    resetAllFields();
    setShowResetConfirm(false);
    addActivity({
      type: 'reset',
      message: createDynamicField('Reset all fields to default values'),
      icon: '↩️',
    });
  };

  // ============ RENDER ============

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">⚙️ Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, preferences, data, and account settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">👤 Profile</TabsTrigger>
          <TabsTrigger value="preferences">🎨 Preferences</TabsTrigger>
          <TabsTrigger value="data">💾 Data & Storage</TabsTrigger>
          <TabsTrigger value="notifications">🔔 Notifications</TabsTrigger>
          <TabsTrigger value="account">👑 Account</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and research information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    value={userProfile.displayName.value}
                    onChange={(e) => updateUserProfile('displayName', e.target.value)}
                    className={`mt-1 ${userProfile.displayName.isDirty ? 'border-orange-400' : ''}`}
                  />
                  {userProfile.displayName.isDirty && (
                    <span className="text-xs text-orange-500 mt-1">Modified</span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={userProfile.email.value}
                    onChange={(e) => updateUserProfile('email', e.target.value)}
                    className={`mt-1 ${userProfile.email.isDirty ? 'border-orange-400' : ''}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Institution</label>
                  <Input
                    value={userProfile.institution.value}
                    onChange={(e) => updateUserProfile('institution', e.target.value)}
                    className={`mt-1 ${userProfile.institution.isDirty ? 'border-orange-400' : ''}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">ORCID</label>
                  <Input
                    placeholder="0000-0000-0000-0000"
                    value={userProfile.orcid.value}
                    onChange={(e) => updateUserProfile('orcid', e.target.value)}
                    className={`mt-1 ${userProfile.orcid.isDirty ? 'border-orange-400' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={userProfile.bio.value}
                  onChange={(e) => updateUserProfile('bio', e.target.value)}
                  className={`mt-1 ${userProfile.bio.isDirty ? 'border-orange-400' : ''}`}
                  rows={3}
                  placeholder="Tell us about your research interests..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Research Interests</label>
                <Input
                  placeholder="cancer-genomics, machine-learning, drug-discovery"
                  defaultValue={userProfile.researchInterests?.join(', ') || ''}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated keywords
                </p>
              </div>

              {/* Dirty Fields Indicator */}
              {getDirtyFieldsCount() > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <span className="text-sm text-orange-700 dark:text-orange-300">
                    You have {getDirtyFieldsCount()} unsaved change{getDirtyFieldsCount() > 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={resetProfileChanges}>
                      Reset Changes
                    </Button>
                    <Button size="sm" onClick={() => {
                      // In a real app, this would save to server
                      addActivity({
                        type: 'save',
                        message: createDynamicField('Saved profile changes'),
                        icon: '✅',
                      });
                    }}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Research Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Research Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold">{userProfile.publicationsCount}</div>
                  <div className="text-sm text-muted-foreground">Publications</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold">{userProfile.hIndex || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">H-Index</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold">{userProfile.role}</div>
                  <div className="text-sm text-muted-foreground">Role</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {Math.floor((Date.now() - new Date(userProfile.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        /* PREFERENCES TAB */
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <Select value={preferences.theme} onValueChange={(v) => setTheme(v as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Light</SelectItem>
                      <SelectItem value="dark">🌙 Dark</SelectItem>
                      <SelectItem value="system">💻 System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select value={preferences.language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Font Size</label>
                  <Select 
                    value={preferences.fontSize} 
                    onValueChange={(v) => updatePreferences({ fontSize: v as any })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Results Per Page</label>
                  <Select 
                    value={String(preferences.resultsPerPage)} 
                    onValueChange={(v) => updatePreferences({ resultsPerPage: Number(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Auto-save Interval</label>
                  <Select 
                    value={String(preferences.autoSaveInterval)} 
                    onValueChange={(v) => updatePreferences({ autoSaveInterval: Number(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Skill Level</label>
                  <Select value={preferences.skillLevel} onValueChange={(v) => setSkillLevel(v as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">🌱 Beginner</SelectItem>
                      <SelectItem value="intermediate">🌿 Intermediate</SelectItem>
                      <SelectItem value="expert">🌳 Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Affects guidance and feature suggestions
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Sidebar Collapsed by Default</p>
                  <p className="text-xs text-muted-foreground">Start with sidebar minimized</p>
                </div>
                <Switch
                  checked={preferences.sidebarCollapsed}
                  onCheckedChange={(checked) => updatePreferences({ sidebarCollapsed: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        /* DATA & STORAGE TAB */
        <TabsContent value="data" className="space-y-6">
          {/* Storage Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>
                    Current tier: {currentVolumeTier.name}
                  </CardDescription>
                </div>
                <Badge 
                  variant={storagePercentage > 80 ? 'destructive' : storagePercentage > 60 ? 'secondary' : 'default'}
                  className="bg-green-500"
                >
                  {formatBytes(totalStorageUsed)} used
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={storagePercentage} className="h-3" />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatBytes(totalStorageUsed)}</span>
                <span>{formatBytes(currentVolumeTier.maxSize)}</span>
                <span>{storagePercentage.toFixed(1)}%</span>
              </div>

              {/* Volume Tiers Comparison */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Available Plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {VOLUME_TIERS.map(tier => (
                    <div 
                      key={tier.tier}
                      className={`p-4 rounded-lg border ${
                        currentVolumeTier.tier === tier.tier 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">{tier.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Up to {formatBytes(tier.maxSize)}
                      </div>
                      <ul className="text-xs mt-2 space-y-1">
                        {tier.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {currentVolumeTier.tier !== tier.tier && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3"
                          onClick={() => triggerUpgradePrompt('storage')}
                        >
                          {tier.tier > currentVolumeTier.tier ? 'Upgrade' : 'Downgrade'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datasets Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Datasets ({datasets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-auto">
                {datasets.map(dataset => (
                  <div key={dataset.id} className="flex items-center justify-between p-2 rounded hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <span>{dataset.downloaded.value ? '✅' : '⬇️'}</span>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {dataset.name.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(dataset.sizeBytes.value)}
                      </span>
                      {dataset.isFavorite.value && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Export */}
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="justify-start gap-2">
                      📤 Export All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Application Data</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        This will download a JSON backup containing your:
                      </p>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground mb-4">
                        <li>User preferences and profile</li>
                        <li>Saved queries and workspace files</li>
                        <li>Search history and saved items</li>
                        <li>Guidance dismissals</li>
                      </ul>
                      <p className="text-sm text-muted-foreground">
                        Note: Large datasets are not included in this export.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleExportData}>
                        📥 Download Backup
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Import */}
                <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="justify-start gap-2">
                      📥 Import Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Application Data</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Paste your JSON backup below or upload a file:
                      </p>
                      <Textarea
                        placeholder="Paste JSON backup here..."
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        rows={8}
                        className="font-mono text-xs"
                      />
                      
                      {importResult && (
                        <div className={`p-3 rounded ${
                          importResult.success 
                            ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
                        }`}>
                          {importResult.message}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleImportData}
                        disabled={!importText.trim()}
                      >
                        Import Data
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Reset */}
                <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="justify-start gap-2 text-destructive hover:text-destructive">
                      ↩️ Reset to Defaults
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset All Settings?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        This will reset all modified fields back to their original default values. 
                        This action cannot be undone.
                      </p>
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ Your custom data (queries, files, etc.) will not be affected.
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleResetAll}>
                        Reset Everything
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Clear Cache */}
                <Button 
                  variant="outline" 
                  className="justify-start gap-2"
                  onClick={() => {
                    localStorage.clear();
                    addActivity({
                      type: 'delete',
                      message: createDynamicField('Cleared local cache'),
                      icon: '🗑️',
                    });
                  }}
                >
                  🗑️ Clear Local Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        /* NOTIFICATIONS TAB */
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about updates
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllNotificationsRead}
                >
                  Mark All Read
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailJobComplete', label: 'Job Completion Emails', desc: 'Get email when compute jobs finish' },
                { key: 'emailNewCollaborator', label: 'Team Activity Emails', desc: 'Email when team members join or post' },
                { key: 'pushUpdates', label: 'Push Notifications', desc: 'Browser push notifications for important events' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of activity every week' },
                { key: 'researchAlerts', label: 'Research Alerts', desc: 'Alerts for new papers matching your interests' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={preferences.notifications?.[item.key as string] ?? false}
                    onCheckedChange={(checked) => 
                      updatePreferences({
                        notifications: {
                          ...(preferences.notifications || {}),
                          [item.key]: checked,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-auto">
                {notifications.slice(0, 20).map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg transition-colors ${
                      !notif.read ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            notif.type === 'success' ? 'bg-green-100 text-green-700' :
                            notif.type === 'error' ? 'bg-red-100 text-red-700' :
                            notif.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            notif.type === 'job_complete' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {notif.type.replace('_', ' ')}
                          </span>
                          <span className="font-medium text-sm">{notif.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                      
                      {notif.actionUrl && (
                        <Button size="sm" variant="ghost" className="shrink-0 h-7 text-xs">
                          {notif.actionLabel || 'View'} →
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No notifications yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        /* ACCOUNT TAB */
        <TabsContent value="account" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You&apos;re currently on the Free tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🆓</span>
                      <span className="text-xl font-bold text-green-800 dark:text-green-200">Free Tier</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Perfect for getting started with scientific research tools
                    </p>
                  </div>
                  
                  <Button onClick={() => triggerUpgradePrompt('storage')}>
                    View Plans →
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">∞</div>
                    <div className="text-xs text-green-600 dark:text-green-400">Unlimited Searches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">5</div>
                    <div className="text-xs text-green-600 dark:text-green-400">Active Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">100MB</div>
                    <div className="text-xs text-green-600 dark:text-green-400">Storage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">12</div>
                    <div className="text-xs text-green-600 dark:text-green-400">API Sources</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Compare Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Free</th>
                      <th className="text-center py-3 px-4 bg-blue-50 dark:bg-blue-950">Pro ($9/mo)</th>
                      <th className="text-center py-3 px-4 bg-purple-50 dark:bg-purple-950">Enterprise ($49/mo)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Literature Search', free: '∞', pro: '∞', enterprise: '∞' },
                      { feature: 'Real API Access', free: '∞', pro: '∞', enterprise: '∞' },
                      { feature: 'Active Compute Jobs', free: '5', pro: '50', enterprise: '∞' },
                      { feature: 'Storage', free: '100MB', pro: '10GB', enterprise: 'Unlimited' },
                      { feature: 'AI Assistant Tokens', free: '10K/day', pro: '100K/day', enterprise: 'Unlimited' },
                      { feature: 'Team Members', free: '3', pro: '10', enterprise: 'Unlimited' },
                      { feature: 'SQL Query Engine', free: '-', pro: '✓', enterprise: '✓' },
                      { feature: 'DuckDB Analytics', free: '-', pro: '✓', enterprise: '✓' },
                      { feature: 'Real-time Collaboration', free: '-', pro: '-', enterprise: '✓' },
                      { feature: 'Custom Model Training', free: '-', pro: '-', enterprise: '✓' },
                      { feature: 'Priority Support', free: '-', pro: 'Community', enterprise: '24/7 Dedicated' },
                      { feature: 'SLA Guarantee', free: '-', pro: '-', enterprise: '99.99%' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 px-4">{row.feature}</td>
                        <td className="text-center py-3 px-4">{row.free}</td>
                        <td className="text-center py-3 px-4 bg-blue-50/50 dark:bg-blue-950/50">{row.pro}</td>
                        <td className="text-center py-3 px-4 bg-purple-50/50 dark:bg-purple-950/50">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-6 justify-center">
                <Button variant="outline" onClick={() => triggerUpgradePrompt('collaboration')}>
                  Compare Features
                </Button>
                <Button onClick={() => triggerUpgradePrompt('storage')}>
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Irreversible actions that affect your account
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all activity history?')) {
                      // Clear activities logic
                    }
                  }}
                >
                  🗑️ Clear Activity History
                </Button>
                
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all saved items?')) {
                      // Delete saved items logic
                    }
                  }}
                >
                  🗑️ Delete All Saved Items
                </Button>
                
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm('This will delete your account permanently. Continue?')) {
                      // Account deletion logic
                    }
                  }}
                >
                  ⚠️ Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
