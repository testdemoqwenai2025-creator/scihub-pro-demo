'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ============ TYPES ============

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  institution: string;
  avatar?: string;
  online: boolean;
  publications: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  members: number;
  status: 'active' | 'archived' | 'completed';
  lastActivity: Date;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  replies: number;
  createdAt: Date;
  tags: string[];
}

// ============ MOCK DATA ============

const teamMembers: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@university.edu',
    role: 'Principal Investigator',
    institution: 'MIT',
    online: true,
    publications: 45,
  },
  {
    id: 'mem-2',
    name: 'Prof. James Wilson',
    email: 'j.wilson@oxford.ac.uk',
    role: 'Postdoc',
    institution: 'Oxford University',
    online: true,
    publications: 28,
  },
  {
    id: 'mem-3',
    name: 'Dr. Maria Garcia',
    email: 'm.garcia@stanford.edu',
    role: 'PhD Student',
    institution: 'Stanford',
    online: false,
    publications: 12,
  },
  {
    id: 'mem-4',
    name: 'Alex Kim',
    email: 'a.kim@harvard.edu',
    role: 'Research Scientist',
    institution: 'Harvard',
    online: true,
    publications: 35,
  },
  {
    id: 'mem-5',
    name: 'Dr. Emma Thompson',
    email: 'e.thompson@cambridge.ac.uk',
    role: 'Data Scientist',
    institution: 'Cambridge',
    online: false,
    publications: 18,
  },
];

const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Cancer Genomics Study',
    description: 'Multi-omics analysis of tumor samples using single-cell sequencing',
    members: 8,
    status: 'active',
    lastActivity: new Date(Date.now() - 3600000),
  },
  {
    id: 'proj-2',
    name: 'Drug Discovery Pipeline',
    description: 'AI-powered virtual screening for EGFR inhibitors',
    members: 5,
    status: 'active',
    lastActivity: new Date(Date.now() - 7200000),
  },
  {
    id: 'proj-3',
    name: 'Protein Structure Database',
    description: 'Curated database of protein structures with binding site annotations',
    members: 12,
    status: 'active',
    lastActivity: new Date(Date.now() - 18000000),
  },
  {
    id: 'proj-4',
    name: 'CRISPR Off-target Analysis',
    description: 'Comprehensive off-target prediction for CRISPR guide RNAs',
    members: 4,
    status: 'completed',
    lastActivity: new Date(Date.now() - 86400000 * 7),
  },
];

const discussions: Discussion[] = [
  {
    id: 'disc-1',
    title: 'Best practices for batch effect correction in scRNA-seq?',
    author: 'Maria Garcia',
    replies: 12,
    createdAt: new Date(Date.now() - 3600000 * 2),
    tags: ['scRNA-seq', 'bioinformatics'],
  },
  {
    id: 'disc-2',
    title: 'AlphaFold vs RoseTTAFold for membrane proteins',
    author: 'James Wilson',
    replies: 8,
    createdAt: new Date(Date.now() - 3600000 * 6),
    tags: ['protein-folding', 'structural-biology'],
  },
  {
    id: 'disc-3',
    title: 'GPU cluster optimization for large-scale docking',
    author: 'Alex Kim',
    replies: 15,
    createdAt: new Date(Date.now() - 3600000 * 12),
    tags: ['computing', 'cheminformatics'],
  },
];

// ============ COLLABORATION PAGE ============

export default function CollaborationPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('collaboration.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('collaboration.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-xl font-bold">{teamMembers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">📁</span>
            <div>
              <p className="text-sm text-muted-foreground">{t('collaboration.projects')}</p>
              <p className="text-xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm text-muted-foreground">{t('collaboration.discussions')}</p>
              <p className="text-xl font-bold">{discussions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🟢</span>
            <div>
              <p className="text-sm text-muted-foreground">{t('collaboration.online')}</p>
              <p className="text-xl font-bold text-green-500">
                {teamMembers.filter(m => m.online).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b pb-2">
            {[
              { id: 'team', label: t('collaboration.team') },
              { id: 'projects', label: t('collaboration.projects') },
              { id: 'discussions', label: t('collaboration.discussions') },
              { id: 'shared', label: t('collaboration.shared_resources') },
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button>{t('collaboration.invite_member')}</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers
                  .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(member => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            {member.online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{member.name}</h3>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {member.institution} • {member.publications} publications
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <Button size="sm" variant="outline" className="flex-1">
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <Button>{t('collaboration.create_project')}</Button>
              
              {projects.map(project => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>👥 {project.members} members</span>
                      <span>🕐 Last active {formatTimeAgo(project.lastActivity)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              <Button>{t('collaboration.start_discussion')}</Button>
              
              {discussions.map(discussion => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-2">{discussion.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Started by {discussion.author} • {formatTimeAgo(discussion.createdAt)}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {discussion.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="ml-auto text-sm text-muted-foreground">
                        💬 {discussion.replies} replies
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-72 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                📧 Send Announcement
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                📊 Share Results
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                📅 Schedule Meeting
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                📝 Create Document
              </Button>
            </CardContent>
          </Card>

          {/* Online Now */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Online Now ({teamMembers.filter(m => m.online).length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teamMembers.filter(m => m.online).map(member => (
                <div key={member.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm truncate">{member.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Sarah Chen</p>
                <p className="text-muted-foreground">Uploaded new dataset to Cancer Genomics project</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Alex Kim</p>
                <p className="text-muted-foreground">Commented on "GPU cluster optimization"</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
