'use client';

/**
 * SciHub Pro - Settings Page (Robust Version)
 * 
 * Fixed: Self-contained settings without complex store dependencies
 * Works reliably with GitHub Pages static export
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// ============ TYPES ============

interface UserSettings {
  name: string;
  email: string;
  organization: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  autoSave: boolean;
  showLineNumbers: boolean;
  fontSize: string;
}

// ============ DEFAULT SETTINGS ============

const defaultSettings: UserSettings = {
  name: 'Researcher Name',
  email: 'researcher@institution.edu',
  organization: 'University / Institute',
  theme: 'system',
  language: 'en',
  emailNotifications: true,
  pushNotifications: false,
  weeklyDigest: true,
  autoSave: true,
  showLineNumbers: true,
  fontSize: '14',
};

// ============ SETTINGS PAGE COMPONENT ============

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasError, setHasError] = useState(false);
  const [saved, setSaved] = useState(false);

  // Update a single setting
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  // Save handler
  const handleSave = () => {
    try {
      // Simulate save (in real app would persist)
      localStorage.setItem('scihub-settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <span className="text-6xl block mb-4">⚙️</span>
          <h1 className="text-2xl font-bold mb-2">Unable to Load Settings</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading the settings page.
          </p>
          <Button onClick={() => setHasError(false)} variant="outline">
            🔄 Try Again
          </Button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-2">
            <span className="text-4xl">⚙️</span>
            Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your account preferences and application settings.
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
            <span>✅</span>
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile">👤 Profile</TabsTrigger>
            <TabsTrigger value="appearance">🎨 Appearance</TabsTrigger>
            <TabsTrigger value="notifications">🔔 Notifications</TabsTrigger>
            <TabsTrigger value="workspace">💻 Workspace</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and account information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={settings.name}
                      onChange={(e) => updateSetting('name', e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Organization</label>
                    <Input
                      value={settings.organization}
                      onChange={(e) => updateSetting('organization', e.target.value)}
                      placeholder="Your institution or company"
                    />
                  </div>
                </div>

                {/* Plan Info */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-muted-foreground">Free Tier • 12 APIs available</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      FREE
                    </Badge>
                  </div>
                  <Button className="mt-4 w-full md:w-auto" asChild>
                    <a href="/subscription">⭐ Upgrade to Pro →</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how the application looks and feels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Choose your preferred color scheme.</p>
                  </div>
                  <Select value={settings.theme} onValueChange={(v) => updateSetting('theme', v as 'light' | 'dark' | 'system')}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Light</SelectItem>
                      <SelectItem value="dark">🌙 Dark</SelectItem>
                      <SelectItem value="system">💻 System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                  </div>
                  <Select value={settings.language} onValueChange={(v) => updateSetting('language', v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Editor Font Size</p>
                    <p className="text-sm text-muted-foreground">Size of code in the workspace editor.</p>
                  </div>
                  <Select value={settings.fontSize} onValueChange={(v) => updateSetting('fontSize', v)}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email.</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(v) => updateSetting('emailNotifications', v)}
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Browser push notifications for important updates.</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(v) => updateSetting('pushNotifications', v)}
                  />
                </div>

                {/* Weekly Digest */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">Get a weekly summary of activity.</p>
                  </div>
                  <Switch
                    checked={settings.weeklyDigest}
                    onCheckedChange={(v) => updateSetting('weeklyDigest', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workspace Tab */}
          <TabsContent value="workspace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Preferences</CardTitle>
                <CardDescription>Configure your coding environment defaults.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto Save */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Save</p>
                    <p className="text-sm text-muted-foreground">Automatically save your work.</p>
                  </div>
                  <Switch
                    checked={settings.autoSave}
                    onCheckedChange={(v) => updateSetting('autoSave', v)}
                  />
                </div>

                {/* Line Numbers */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Line Numbers</p>
                    <p className="text-sm text-muted-foreground">Display line numbers in the editor.</p>
                  </div>
                  <Switch
                    checked={settings.showLineNumbers}
                    onCheckedChange={(v) => updateSetting('showLineNumbers', v)}
                  />
                </div>

                {/* Quick Links */}
                <div className="pt-4 border-t space-y-3">
                  <p className="font-medium">Quick Actions</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start" asChild>
                      <a href="/workspace">💻 Open Workspace</a>
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                      <a href="/data">📁 View Data Lake</a>
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                      <a href="/connectors">🔗 Manage Connectors</a>
                    </Button>
                    <Button variant="outline" className="justify-start" asChild>
                      <a href="/subscription">⭐ View Plans</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button - Fixed at bottom */}
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Changes are saved locally in your browser.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSettings(defaultSettings)}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSave}>
                💾 Save Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    );
  } catch (error) {
    console.error('Settings page error:', error);
    setHasError(true);
    return null;
  }
}
