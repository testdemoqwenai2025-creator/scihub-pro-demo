'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============ SETTINGS PAGE ============

export default function SettingsPage() {
  const { t, locale, setLocale, availableLocales } = useTranslation();
  
  // Profile state
  const [profile, setProfile] = useState({
    displayName: 'Dr. Researcher',
    email: 'researcher@university.edu',
    institution: 'University of Science',
    orcid: '0000-0000-0000-0000',
    bio: 'Bioinformatics researcher focused on genomics and machine learning.',
  });

  // Appearance state
  const [theme, setTheme] = useState('system');
  const [fontSize, setFontSize] = useState('medium');
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailJobComplete: true,
    emailNewCollaborator: true,
    pushUpdates: false,
    weeklyDigest: true,
  });

  // API Keys (masked)
  const [apiKeys] = useState([
    { name: 'NCBI E-utilities', key: 'a1b2c3d4e5f6...', status: 'active' },
    { name: 'CrossRef', key: 'Not required (free)', status: 'active' },
    { name: 'OpenAlex', key: 'Not required (free)', status: 'active' },
  ]);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
            <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
            <TabsTrigger value="language">{t('settings.language')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
            <TabsTrigger value="api-keys">{t('settings.api_keys')}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and professional details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">{t('settings.display_name')}</Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('settings.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution">{t('settings.institution')}</Label>
                    <Input
                      id="institution"
                      value={profile.institution}
                      onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orcid">{t('settings.orcid')}</Label>
                    <Input
                      id="orcid"
                      placeholder="0000-0000-0000-0000"
                      value={profile.orcid}
                      onChange={(e) => setProfile({ ...profile, orcid: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t('settings.bio')}</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button>{t('settings.save_changes')}</Button>
                  <Button variant="outline">{t('settings.discard_changes')}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.appearance')}</CardTitle>
                <CardDescription>
                  Customize how SciHub Pro looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-3">
                  <Label>{t('settings.theme')}</Label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: t('settings.light'), icon: '☀️' },
                      { value: 'dark', label: t('settings.dark'), icon: '🌙' },
                      { value: 'system', label: t('settings.system'), icon: '💻' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                          theme === option.value 
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                            : 'hover:border-primary/50'
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <Label>{t('settings.font_size')}</Label>
                  <div className="flex gap-3">
                    {[
                      { value: 'small', label: t('settings.small') },
                      { value: 'medium', label: t('settings.medium') },
                      { value: 'large', label: t('settings.large') },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFontSize(option.value)}
                        className={`px-4 py-2 rounded-md border text-sm transition-all ${
                          fontSize === option.value 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Per Page */}
                <div className="space-y-2">
                  <Label>Results Per Page</Label>
                  <select
                    value={resultsPerPage}
                    onChange={(e) => setResultsPerPage(Number(e.target.value))}
                    className="w-full max-w-xs px-3 py-2 rounded-md border bg-background"
                  >
                    {[10, 20, 50, 100].map(value => (
                      <option key={value} value={value}>{value} per page</option>
                    ))}
                  </select>
                </div>

                <Button>{t('settings.save_changes')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language')}</CardTitle>
                <CardDescription>
                  Select your preferred language for the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(availableLocales).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => setLocale(code as any)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                        locale === code 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">
                        {code === 'en' ? '🇺🇸' :
                         code === 'es' ? '🇪🇸' :
                         code === 'de' ? '🇩🇪' :
                         code === 'fr' ? '🇫🇷' :
                         code === 'zh' ? '🇨🇳' :
                         code === 'ja' ? '🇯🇵' :
                         code === 'pt' ? '🇧🇷' :
                         code === 'ar' ? '🇸🇦' :
                         code === 'hi' ? '🇮🇳' : '🇰🇷'}
                      </span>
                      <span className="font-medium">{name}</span>
                      {locale === code && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground pt-4 border-t">
                  Note: Scientific terms (gene names, chemical formulas, etc.) will remain in their original form regardless of language selection.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications')}</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: 'emailJobComplete',
                    label: 'Email when job completes',
                    description: 'Get notified when your compute jobs finish',
                  },
                  {
                    id: 'emailNewCollaborator',
                    label: 'Email on new collaborator',
                    description: 'When someone joins your project or team',
                  },
                  {
                    id: 'pushUpdates',
                    label: 'Push notifications',
                    description: 'Real-time updates in browser (requires permission)',
                  },
                  {
                    id: 'weeklyDigest',
                    label: 'Weekly digest',
                    description: 'Summary of activity every Monday morning',
                  },
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.id as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.id]: checked })
                      }
                    />
                  </div>
                ))}

                <Button className="mt-4">{t('settings.save_changes')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.api_keys')}</CardTitle>
                <CardDescription>
                  Manage API keys for external services. Many are free and don't require keys.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-sm">Service</th>
                        <th className="text-left px-4 py-3 font-medium text-sm">API Key</th>
                        <th className="text-left px-4 py-3 font-medium text-sm">Status</th>
                        <th className="text-right px-4 py-3 font-medium text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr key={key.name} className="border-t">
                          <td className="px-4 py-3 font-medium">{key.name}</td>
                          <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                            {key.key}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="default" className="bg-green-500">
                              {key.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="ghost">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Free API Tiers Available
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• <strong>CrossRef</strong>: No API key required (free)</li>
                    <li>• <strong>OpenAlex</strong>: No API key required (open)</li>
                    <li>• <strong>arXiv</strong>: No API key required (free)</li>
                    <li>• <strong>NCBI/E-utilities</strong>: Optional key for higher rate limits</li>
                    <li>• <strong>PubChem</strong>: No API key required (free)</li>
                  </ul>
                </div>

                <Button>Add New API Key</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
