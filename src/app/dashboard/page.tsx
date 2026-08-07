'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

// ============ TYPES ============

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: string;
}

interface ActivityItem {
  id: string;
  type: 'search' | 'save' | 'export' | 'job' | 'collaboration';
  message: string;
  timestamp: Date;
}

// ============ DASHBOARD PAGE ============

export default function DashboardPage() {
  const { t, locale } = useTranslation();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [systemHealth, setSystemHealth] = useState(98);

  useEffect(() => {
    // Initialize dashboard data
    setStats([
      {
        title: t('dashboard.active_jobs'),
        value: 12,
        change: 3,
        icon: '⚡',
        color: 'text-blue-500',
      },
      {
        title: t('dashboard.storage_used'),
        value: '2.4 GB',
        change: -5,
        icon: '💾',
        color: 'text-green-500',
      },
      {
        title: t('dashboard.api_calls_today'),
        value: 1247,
        change: 18,
        icon: '🔌',
        color: 'text-purple-500',
      },
      {
        title: t('dashboard.collaborators'),
        value: 8,
        change: 2,
        icon: '👥',
        color: 'text-orange-500',
      },
    ]);

    setActivities([
      {
        id: '1',
        type: 'search',
        message: `Searched for "CRISPR gene editing" in PubMed`,
        timestamp: new Date(Date.now() - 5 * 60000),
      },
      {
        id: '2',
        type: 'save',
        message: `Saved paper "Advances in Protein Folding" to favorites`,
        timestamp: new Date(Date.now() - 15 * 60000),
      },
      {
        id: '3',
        type: 'job',
        message: `Variant calling pipeline completed successfully`,
        timestamp: new Date(Date.now() - 30 * 60000),
      },
      {
        id: '4',
        type: 'collaboration',
        message: `Dr. Smith joined project "Cancer Genomics Study"`,
        timestamp: new Date(Date.now() - 45 * 60000),
      },
      {
        id: '5',
        type: 'export',
        message: `Exported dataset "TCGA Expression Matrix" as CSV`,
        timestamp: new Date(Date.now() - 60 * 60000),
      },
    ]);
  }, [t]);

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'search': return '🔍';
      case 'save': return '⭐';
      case 'export': return '📤';
      case 'job': return '⚙️';
      case 'collaboration': return '👥';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard.welcome_back', { name: 'Researcher' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{stat.icon}</span>
                <Badge variant={stat.change && stat.change > 0 ? 'default' : 'secondary'}>
                  {stat.change ? `${stat.change > 0 ? '+' : ''}${stat.change}%` : ''}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
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
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xl mt-0.5">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.system_status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Gateway</span>
                  <span className="text-green-500">Operational</span>
                </div>
                <Progress value={99} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Data Lake</span>
                  <span className="text-green-500">Operational</span>
                </div>
                <Progress value={97} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AETHEL AI</span>
                  <span className="text-yellow-500">Degraded</span>
                </div>
                <Progress value={85} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Compute Cluster</span>
                  <span className="text-green-500">Operational</span>
                </div>
                <Progress value={systemHealth} />
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall System Health</span>
                <Badge variant="default" className="bg-green-500">
                  {systemHealth}% Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
