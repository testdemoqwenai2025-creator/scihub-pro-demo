'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore } from '@/store/useDynamicStore';
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

// ============ SETTINGS PAGE ============

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    userProfile,
    updateUserProfile,
    resetUserProfile,
    notificationPrefs,
    updateNotificationPref,
    dbConfig,
    updateDbConfig,
    getDirtyFieldsCount,
    exportState,
    importState,
    checkVolumeThreshold,
    addActivity,
    createDynamicField,
  } = useDynamicStore();

  // UI State
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'language' | 'notifications' | 'api-keys' | 'database' | 'advanced'>('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Handle profile field updates
  const handleProfileChange = (field: keyof typeof userProfile, value: string) => {
    updateUserProfile(field, value);
    setSaveStatus('idle');
  };

  // Handle save all settings
  const handleSaveAll = async () => {
    setSaveStatus('saving');
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSaveStatus('saved');
    
    addActivity({
      type: 'update',
      message: createDynamicField('Settings saved successfully'),
      icon: '💾',
    });

    // Reset status after showing success
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Handle reset profile
  const handleResetProfile = () => {
    resetUserProfile();
    setShowResetConfirm(false);
    
    addActivity({
      type: 'update',
      message: createDynamicField('Profile reset to defaults'),
      icon: '🔄',
    });
  };

  // Handle export state
  const handleExportState = () => {
    const stateJson = exportState();
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scihub-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addActivity({
      type: 'export',
      message: createDynamicField('Exported application settings'),
      icon: '📥',
    });
  };

  // Handle import state
  const handleImportState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        importState(content);
        
        addActivity({
          type: 'update',
          message: createDynamicField('Imported settings from file'),
          icon: '📤',
        });

        alert('Settings imported successfully!');
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Dirty fields count
  const dirtyCount = getDirtyFieldsCount();

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('settings.title') || 'Settings'}</h1>
        <p className="text-muted-foreground mt-1">
          Manage your preferences, profile, and system configuration.
        </p>

        {/* Save Status & Actions */}
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          {dirtyCount > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              📝 {dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}
            </Badge>
          )}
          
          <Button onClick={handleSaveAll} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? '⏳ Saving...' : 
             saveStatus === 'saved' ? '✅ Saved!' :
             '💾 Save All Changes'}
          </Button>
          
          <Button variant="outline" onClick={handleExportState}>
            📥 Export Settings
          </Button>
          
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>📤 Import Settings</span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportState}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-3">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
              { id: 'language', label: 'Language', icon: '🌐' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'api-keys', label: 'API Keys', icon: '🔑' },
              { id: 'database', label: 'Database', icon: '🗄️' },
              { id: 'advanced', label: 'Advanced', icon: '⚙️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information and research identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <Input
                      value={userProfile.displayName.value}
                      onChange={(e) => handleProfileChange('displayName', e.target.value)}
                      placeholder="Your name"
                      className={`mt-1 ${userProfile.displayName.isDirty ? 'border-orange-400' : ''}`}
                    />
                    {userProfile.displayName.isDirty && (
                      <p className="text-xs text-orange-600 mt-1">Modified from original</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      value={userProfile.email.value}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className={`mt-1 ${userProfile.email.isDirty ? 'border-orange-400' : ''}`}
                    />
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="text-sm font-medium">Institution</label>
                    <Input
                      value={userProfile.institution.value}
                      onChange={(e) => handleProfileChange('institution', e.target.value)}
                      placeholder="University or Company"
                      className={`mt-1 ${userProfile.institution.isDirty ? 'border-orange-400' : ''}`}
                    />
                  </div>

                  {/* ORCID */}
                  <div>
                    <label className="text-sm font-medium">ORCID iD</label>
                    <Input
                      value={userProfile.orcid.value}
                      onChange={(e) => handleProfileChange('orcid', e.target.value)}
                      placeholder="0000-0000-0000-0000"
                      className={`mt-1 font-mono ${userProfile.orcid.isDirty ? 'border-orange-400' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      <a href="https://orcid.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        Get your free ORCID →
                      </a>
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-sm font-medium">Primary Role</label>
                    <Select
                      value={userProfile.role.value}
                      onValueChange={(v) => handleProfileChange('role', v)}
                    >
                      <SelectTrigger className={`mt-1 ${userProfile.role.isDirty ? 'border-orange-400' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="community">Community Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm font-medium">Biography / Research Interests</label>
                  <Textarea
                    value={userProfile.bio.value}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell us about your research interests and background..."
                    rows={4}
                    className={`mt-1 resize-none ${userProfile.bio.isDirty ? 'border-orange-400' : ''}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {userProfile.bio.value.length}/500 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="destructive" onClick={() => setShowResetConfirm(true)}>
                    Reset to Defaults
                  </Button>
                  
                  {showResetConfirm && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                      <span className="text-sm">Are you sure? This cannot be undone.</span>
                      <Button size="sm" variant="destructive" onClick={handleResetProfile}>
                        Yes, Reset
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowResetConfirm(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Preferences</CardTitle>
                <CardDescription>
                  Customize how SciHub Pro looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <Select defaultValue="system">
                    <SelectTrigger className="w-[200px] mt-1">
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
                  <label className="text-sm font-medium">Font Size</label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-[200px] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (14px)</SelectItem>
                      <SelectItem value="medium">Medium (16px)</SelectItem>
                      <SelectItem value="large">Large (18px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Results Per Page</label>
                  <Select defaultValue="20">
                    <SelectTrigger className="w-[200px] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="20">20 items</SelectItem>
                      <SelectItem value="50">50 items</SelectItem>
                      <SelectItem value="100">100 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Reduce spacing for more content density</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Animations</p>
                    <p className="text-xs text-muted-foreground">Enable UI animations and transitions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>
                  Choose your preferred language for the interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'es', name: 'Español', flag: '🇪🇸' },
                    { code: 'fr', name: 'Français', flag: '🇫🇷' },
                    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                    { code: 'zh', name: '中文', flag: '🇨🇳' },
                    { code: 'ja', name: '日本語', flag: '🇯🇵' },
                    { code: 'ko', name: '한국어', flag: '🇰🇷' },
                    { code: 'pt', name: 'Português', flag: '🇧🇷' },
                    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                  ].map(lang => (
                    <button
                      key={lang.code}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        lang.code === 'en'
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <p className="font-medium">{lang.name}</p>
                        <p className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</p>
                      </div>
                      {lang.code === 'en' && (
                        <Badge variant="secondary" className="ml-auto">Current</Badge>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Note:</strong> Translation coverage varies by language. Core features are fully translated; some advanced options may display in English.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose when and how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailJobComplete' as const, label: 'Job Completion Emails', desc: 'Get notified when compute jobs finish' },
                  { key: 'emailCollaborator' as const, label: 'New Collaborator Alerts', desc: 'When someone joins your team' },
                  { key: 'pushUpdates' as const, label: 'Push Notifications', desc: 'Real-time browser notifications' },
                  { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Summary of activity every week' },
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <Switch
                      checked={notificationPrefs[pref.key].value}
                      onCheckedChange={(checked) => updateNotificationPref(pref.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <Card>
              <CardHeader>
                <CardTitle>API Keys & Integrations</CardTitle>
                <CardDescription>
                  Manage API keys for external services. All shown are optional for free tier access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { service: 'NCBI E-utilities', key: '', note: 'Required for >3 req/s rate limit', status: 'optional' },
                    { service: 'CrossRef', key: '', note: 'Not required - fully open access', status: 'free' },
                    { service: 'OpenAlex', key: '', note: 'Optional - higher limits with key', status: 'optional' },
                    { service: 'Supabase', key: '', note: 'For database persistence features', status: 'optional' },
                  ].map(api => (
                    <div key={api.service} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{api.service}</span>
                          <Badge 
                            variant={
                              api.status === 'free' ? 'default' :
                              api.status === 'optional' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {api.status === 'free' ? '🆓 Free' : api.status === 'optional' ? 'Optional' : 'Required'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{api.note}</p>
                      </div>
                      <Input
                        type="password"
                        placeholder="•••••••••"
                        className="w-48 ml-4"
                        defaultValue={api.key}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🆓 Free Tier API Access</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• CrossRef: Full access without key (50 req/s)</li>
                    <li>• OpenAlex: Full access without key (10 req/s)</li>
                    <li>• arXiv: Full access without key</li>
                    <li>• NCBI: Limited access (3 req/s) without key</li>
                    <li>• PubChem: Full REST API access</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>
                  Configure data storage and persistence settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium">Database Provider</label>
                  <Select
                    value={dbConfig.provider}
                    onValueChange={(v) => updateDbConfig('provider', v)}
                  >
                    <SelectTrigger className="w-[250px] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="duckdb">🦆 DuckDB (Analytical)</SelectItem>
                      <SelectItem value="sqlite">🗄️ SQLite (Local)</SelectItem>
                      <SelectItem value="postgresql_supabase">⚡ Supabase (PostgreSQL)</SelectItem>
                      <SelectItem value="postgresql_neon">🌩️ Neon Serverless</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Connection String</label>
                  <Input
                    value={dbConfig.connectionString.value}
                    onChange={(e) => updateDbConfig('connectionString', e.target.value)}
                    placeholder="Database connection string..."
                    className="mt-1 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Auto-Push Threshold: {(dbConfig.autoPushThreshold.value / 1024 / 1024).toFixed(0)} MB
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={dbConfig.autoPushThreshold.value / 1024 / 1024}
                    onChange={(e) => updateDbConfig('autoPushThreshold', parseFloat(e.target.value) * 1024 * 1024)}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5 MB</span>
                    <span>250 MB</span>
                    <span>500 MB</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Auto-Push Enabled</p>
                    <p className="text-xs text-muted-foreground">Automatically push large datasets to database</p>
                  </div>
                  <Switch
                    checked={dbConfig.enabled}
                    onCheckedChange={(checked) => updateDbConfig('enabled', checked)}
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Database Recommendations</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• <strong>DuckDB</strong>: Best for analytics queries, no server needed</li>
                    <li>• <strong>SQLite</strong>: Good for local development, embedded</li>
                    <li>• <strong>Supabase/Neon</strong>: Production PostgreSQL with free tier</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Advanced configuration options for power users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-medium text-sm text-destructive">Danger Zone</p>
                    <p className="text-xs text-muted-foreground">Irreversible actions that affect your data</p>
                  </div>
                </div>

                <div className="space-y-3 pl-4 border-l-2 border-destructive/30">
                  <Button variant="destructive" onClick={() => {
                    if (confirm('Clear ALL local data? This includes settings, history, and cached data.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}>
                    🗑️ Clear All Local Data
                  </Button>
                  
                  <Button variant="destructive" onClick={() => {
                    if (confirm('Reset application to factory defaults?')) {
                      localStorage.removeItem('scihub-dynamic-store');
                      window.location.reload();
                    }
                  }}>
                    🔄 Factory Reset
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Debug Information</h4>
                  <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs space-y-1">
                    <p>Version: SciHub Pro v1.0.0-demo</p>
                    <p>Build: 2024.01.15</p>
                    <p>Environment: Browser (Client-side)</p>
                    <p>Storage Used: {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</p>
                    <p>Dirty Fields: {dirtyCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profile Complete</span>
                <span className="font-medium">
                  {[userProfile.displayName, userProfile.email, userProfile.institution]
                    .filter(f => f.value.trim()).length * 25}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notifications</span>
                <span className="font-medium">
                  {Object.values(notificationPrefs).filter(p => p.value).length}/4 enabled
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Keys Configured</span>
                <span className="font-medium">Optional</span>
              </div>
              
              <Progress 
                value={[userProfile.displayName, userProfile.email, userProfile.institution]
                  .filter(f => f.value.trim()).length * 33} 
                className="mt-3 h-1.5"
              />
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Help & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                📖 User Guide
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                ❓ FAQ
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                💬 Community Forum
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                🐛 Report Issue
              </Button>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">About</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p><strong>SciHub Pro</strong></p>
              <p>The Scientific GitHub for the Modern Age</p>
              <p>Version: 1.0.0-demo</p>
              <p>License: MIT</p>
              <p className="pt-2 border-t">
                © 2024 SciHub Pro Contributors
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
