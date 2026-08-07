'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField, updateDynamicField } from '@/store/useDynamicStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

// ============ TYPES ============

interface StatCardConfig {
  key: string;
  icon: string;
  color: string;
  route: string;
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

  const [editingStat, setEditingStat] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  // Check volume threshold on mount and periodically
  useEffect(() => {
    const check = () => {
      const volume = checkVolumeThreshold();
      setShowVolumeWarning(volume.shouldPush);
    };
    
    check();
    const interval = setInterval(check, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [checkVolumeThreshold]);

  const statCards: StatCardConfig[] = [
    { key: 'activeJobs', icon: '⚡', color: 'text-blue-500', route: '/compute' },
    { key: 'storageUsed', icon: '💾', color: 'text-green-500', route: '/data' },
    { key: 'apiCallsToday', icon: '🔌', color: 'text-purple-500', route: '/connectors' },
    { key: 'collaborators', icon: '👥', color: 'text-orange-500', route: '/collaboration' },
  ];

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

  // Simulate database push
  const handlePushToDatabase = async () => {
    setIsPushing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate processing
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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header with Profile Summary */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('dashboard.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('dashboard.welcome_back', { name: userProfile.displayName.value })}
            </p>
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
                    <Badge variant="secondary" className="mt-1 text-xs">Modified</Badge>
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dirty Fields Indicator */}
        {dirtyCount > 0 && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">
              📝 You have {dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}
            </span>
            <Button size="sm" variant="outline" onClick={() => useDynamicStore.getState().resetAllFields()}>
              Reset All
            </Button>
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
          const change = Math.floor((Math.random() - 0.5) * 20); // Simulated change

          return (
            <Link key={config.key} href={config.route}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={change > 0 ? 'default' : 'secondary'}
                        className={stat.isDirty ? 'bg-orange-500' : ''}
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
            <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/query">
              <Button variant="outline" className="w-full justify-start gap-2">
                🔍 {t('dashboard.new_search')}
              </Button>
            </Link>
            <Link href="/connectors">
              <Button variant="outline" className="w-full justify-start gap-2">
                🔗 {t('dashboard.view_connectors')}
              </Button>
            </Link>
            <Link href="/workspace">
              <Button variant="outline" className="w-full justify-start gap-2">
                💻 {t('dashboard.open_workspace')}
              </Button>
            </Link>
            <Link href="/compute">
              <Button variant="outline" className="w-full justify-start gap-2">
                ⚙️ {t('dashboard.run_workflow')}
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
              className="w-full justify-start gap-2 mt-4"
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
              📥 Export State
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity Feed - From Store */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
            <Button size="sm" variant="ghost" onClick={clearActivities}>
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-auto">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity. Start exploring!
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-xl mt-0.5">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {activity.message.value}
                        {activity.message.isDirty && (
                          <Badge variant="secondary" className="ml-2 text-xs">Modified</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    
                    {/* Activity Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        +
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status - Dynamic Health */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.system_status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatusItem name="API Gateway" health={99} />
              <StatusItem name="Data Lake" health={97} />
              <StatusItem name="AETHEL AI" health={85} warning />
              <StatusItem name="Compute Cluster" health={dashboardStats.systemHealth.value} />
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Overall System Health</span>
                  <span className="text-xs text-muted-foreground ml-2 block sm:inline sm:ml-3">
                    Free Tier • DuckDB Ready
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-green-500">
                    {dashboardStats.systemHealth.value}% Healthy
                  </Badge>
                  {dbConfig.enabled && (
                    <Badge variant="outline">
                      DB: {dbConfig.provider}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Database Config Quick View */}
              {dbConfig.enabled && (
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  Auto-push threshold: {(dbConfig.autoPushThreshold.value / 1024 / 1024).toFixed(0)}MB
                  {dbConfig.lastPush && (
                    <span className="ml-3">
                      Last push: {formatTimeAgo(dbConfig.lastPush)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function StatusItem({ name, health, warning }: { name: string; health: number; warning?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{name}</span>
        <span className={warning ? 'text-yellow-500' : 'text-green-500'}>
          {health >= 95 ? 'Operational' : health >= 80 ? 'Degraded' : 'Critical'}
        </span>
      </div>
      <Progress value={health} className={warning ? '[&>div]:bg-yellow-500' : ''} />
    </div>
  );
}
