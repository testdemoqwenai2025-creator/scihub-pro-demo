'use client';

/**
 * SciHub Pro - Collaboration Page
 * 
 * Team collaboration features with:
 * - Project management
 * - Team member directory
 * - Discussion forums
 * - Real-time editing stubs
 * - Activity feeds
 * - Call-for-action for Pro features
 */

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useSciHubStore, createDynamicField } from '@/store/useSciHubStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CollaborationSkeleton, ListSkeleton, CardSkeleton } from '@/components/SkeletonComponents';
import { showSuccessToast, showInfoToast } from '@/lib/toast-utils';

// ============ COLLABORATION PAGE COMPONENT ============

export default function CollaborationPage() {
  const { t } = useTranslation();
  const store = useSciHubStore();
  
  const {
    projects,
    teamMembers,
    discussions,
    addProject,
    updateProject,
    addDiscussion,
    addReply,
    activities,
    addActivity,
    notifications,
    addNotification,
    userProfile,
    upgradePrompts,
    triggerUpgradePrompt,
  } = store;

  // UI State
  const [activeTab, setActiveTab] = useState('projects');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showNewDiscussionDialog, setShowNewDiscussionDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  
  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectVisibility, setNewProjectVisibility] = useState<'public' | 'private' | 'team'>('team');
  
  // New discussion form state
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [newDiscussionTags, setNewDiscussionTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Get selected project data
  const selectedProjectData = projects.find(p => p.id === selectedProject);

  // Get online members count
  const onlineCount = teamMembers.filter(m => m.online).length;

  // ============ HANDLERS ============

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    addProject({
      name: createDynamicField(newProjectName),
      description: createDynamicField(newProjectDesc || `Research project: ${newProjectName}`),
      memberIds: [teamMembers[0]?.id || 'member-001'], // Add current user as lead
      status: 'active',
      visibility: newProjectVisibility,
      leadId: teamMembers[0]?.id || 'member-001',
      datasetIds: [],
      queryIds: [],
    });

    addActivity({
      type: 'collaboration',
      message: createDynamicField(`Created project: ${newProjectName}`),
      icon: '📁',
    });

    addNotification({
      type: 'collaboration',
      title: 'New Project Created',
      message: `${userProfile.displayName.value} created "${newProjectName}"`,
      priority: 'medium',
      read: false,
    });

    showSuccessToast('Project Created!', `"${newProjectName}" is ready for collaboration`);

    // Reset form
    setNewProjectName('');
    setNewProjectDesc('');
    setShowNewProjectDialog(false);

    // Trigger upgrade prompt for team features
    if (teamMembers.length >= 5) {
      triggerUpgradePrompt('collaboration');
    }
  };

  const handleCreateDiscussion = () => {
    if (!newDiscussionTitle.trim() || !selectedProject) return;

    addDiscussion({
      title: createDynamicField(newDiscussionTitle),
      content: createDynamicField(newDiscussionContent),
      authorId: teamMembers[0]?.id || 'member-001',
      projectId: selectedProject,
      tags: newDiscussionTags.split(',').map(t => t.trim()).filter(Boolean),
      replies: [],
      replyCount: 0,
    });

    addActivity({
      type: 'collaboration',
      message: createDynamicField(`Started discussion: ${newDiscussionTitle}`),
      icon: '💬',
    });

    showInfoToast('Discussion Posted', `"${newDiscussionTitle}" has been created`);

    // Reset form
    setNewDiscussionTitle('');
    setNewDiscussionContent('');
    setNewDiscussionTags('');
    setShowNewDiscussionDialog(false);
  };

  const handleAddReply = (discussionId: string) => {
    const text = replyTexts[discussionId];
    if (!text?.trim()) return;

    addReply(discussionId, {
      authorId: teamMembers[0]?.id || 'member-001',
      content: text,
      reactions: {},
    });

    setReplyTexts({ ...replyTexts, [discussionId]: '' });
    
    addActivity({
      type: 'collaboration',
      message: createDynamicField('Replied to discussion'),
      icon: '💬',
    });
    
    showInfoToast('Comment Posted', 'Your reply has been added');
  };

  const getMemberById = (id: string) => teamMembers.find(m => m.id === id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CollaborationSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              👥 {t('collaboration.title') || 'Collaboration'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Work together on research projects, share insights, and discuss findings
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm">{onlineCount} online</span>
            </div>
            <Badge variant="secondary">
              {projects.length} projects
            </Badge>
          </div>
        </div>

        {/* Team Members Preview */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 5).map(member => (
              <div
                key={member.id}
                className={`w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-sm font-medium ${
                  member.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
                title={`${member.name}${member.online ? ' (Online)' : ''}`}
              >
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {teamMembers.length > 5 && (
              <div className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                +{teamMembers.length - 5}
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {teamMembers.length} team members
          </span>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="projects">📁 Projects</TabsTrigger>
          <TabsTrigger value="discussions">💬 Discussions</TabsTrigger>
          <TabsTrigger value="team">👥 Team</TabsTrigger>
          <TabsTrigger value="activity">📋 Activity</TabsTrigger>
        </TabsList>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-6">
          {/* Projects Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Projects</h2>
            
            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button>➕ New Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Project Name *</label>
                    <Input
                      placeholder="e.g., Oncology Drug Discovery"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="What is this project about?"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Visibility</label>
                    <Select value={newProjectVisibility} onValueChange={(v) => setNewProjectVisibility(v as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">🔒 Private (only you)</SelectItem>
                        <SelectItem value="team">👥 Team (invited members)</SelectItem>
                        <SelectItem value="public">🌐 Public (anyone can view)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Card 
                key={project.id} 
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  selectedProject === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-1">
                      {project.name.value}
                    </CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description.value}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Project Meta */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        👥 {project.memberIds.length} members
                      </span>
                      <span className="flex items-center gap-1">
                        📊 {project.datasetIds.length} datasets
                      </span>
                      <span className="flex items-center gap-1">
                        🔎 {project.queryIds.length} queries
                      </span>
                    </div>

                    {/* Lead */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Lead:</span>
                      <span className="text-xs font-medium">
                        {getMemberById(project.leadId)?.name || 'Unknown'}
                      </span>
                    </div>

                    {/* Last Activity */}
                    <div className="text-xs text-muted-foreground">
                      Last active: {formatTimeAgo(project.lastActivity)}
                    </div>

                    {/* Members Avatars */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="flex -space-x-1">
                        {project.memberIds.slice(0, 4).map(id => {
                          const member = getMemberById(id);
                          return (
                            <div
                              key={id}
                              className={`w-6 h-6 rounded-full border border-background flex items-center justify-center text-[10px] ${
                                member?.online ? 'bg-green-100' : 'bg-gray-100'
                              }`}
                              title={member?.name}
                            >
                              {member?.name.charAt(0)}
                            </div>
                          );
                        })}
                        {project.memberIds.length > 4 && (
                          <div className="w-6 h-6 rounded-full border border-background bg-muted flex items-center justify-center text-[10px]">
                            +{project.memberIds.length - 4}
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="outline" className="text-xs ml-auto">
                        {project.visibility}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State / Create Prompt */}
            {projects.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <span className="text-4xl block mb-3">📁</span>
                  <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Create a project to organize your research, collaborate with team members, and track progress.
                  </p>
                  <Button onClick={() => setShowNewProjectDialog(true)}>
                    ➕ Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected Project Details */}
          {selectedProjectData && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedProjectData.name.value}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedProjectData.description.value}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(null);
                    }}
                  >
                    ✕ Close
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="datasets">Datasets</TabsTrigger>
                    <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold">{selectedProjectData.memberIds.length}</div>
                        <div className="text-xs text-muted-foreground">Members</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold">{selectedProjectData.datasetIds.length}</div>
                        <div className="text-xs text-muted-foreground">Datasets</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold">{selectedProjectData.queryIds.length}</div>
                        <div className="text-xs text-muted-foreground">Queries</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <div className="text-2xl font-bold">
                          {discussions.filter(d => d.projectId === selectedProject).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Discussions</div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setActiveTab('discussions');
                        setShowNewDiscussionDialog(true);
                      }}
                    >
                      💬 Start a Discussion
                    </Button>
                  </TabsContent>

                  <TabsContent value="members">
                    <div className="space-y-2">
                      {selectedProjectData.memberIds.map(id => {
                        const member = getMemberById(id);
                        if (!member) return null;
                        
                        return (
                          <div key={id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                                member.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {member.online ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">Online</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Active {formatTimeAgo(member.lastActive)}
                                </span>
                              )}
                              <Badge variant="outline">{member.publicationsCount} pubs</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="datasets">
                    <p className="text-muted-foreground text-center py-8">
                      No datasets linked yet. Add datasets from the Data Lake.
                    </p>
                  </TabsContent>

                  <TabsContent value="discussions">
                    <div className="space-y-2">
                      {discussions
                        .filter(d => d.projectId === selectedProject)
                        .map(discussion => (
                          <div key={discussion.id} className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{discussion.title.value}</h4>
                              <Badge variant="secondary">{discussion.replyCount} replies</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {discussion.content.value}
                            </p>
                          </div>
                        ))
                      }
                      
                      {discussions.filter(d => d.projectId === selectedProject).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-3">No discussions in this project yet.</p>
                          <Button size="sm" onClick={() => setShowNewDiscussionDialog(true)}>
                            Start First Discussion
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        /* DISCUSSIONS TAB */
        <TabsContent value="discussions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Team Discussions</h2>
            
            <Dialog open={showNewDiscussionDialog} onOpenChange={setShowNewDiscussionDialog}>
              <DialogTrigger asChild>
                <Button disabled={!selectedProject}>
                  💬 New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Discussion</DialogTitle>
                </DialogHeader>
                {!selectedProject ? (
                  <p className="text-muted-foreground py-4 text-center">
                    Please select a project first to create a discussion.
                  </p>
                ) : (
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <Input
                        placeholder="What do you want to discuss?"
                        value={newDiscussionTitle}
                        onChange={(e) => setNewDiscussionTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Content *</label>
                      <Textarea
                        placeholder="Share your thoughts, questions, or findings..."
                        value={newDiscussionContent}
                        onChange={(e) => setNewDiscussionContent(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tags (comma-separated)</label>
                      <Input
                        placeholder="e.g., methodology, question, result"
                        value={newDiscussionTags}
                        onChange={(e) => setNewDiscussionTags(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" onClick={() => setShowNewDiscussionDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateDiscussion} 
                        disabled={!newDiscussionTitle.trim() || !newDiscussionContent.trim()}
                      >
                        Post Discussion
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {discussions.map(discussion => (
              <Card key={discussion.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{discussion.title.value}</CardTitle>
                        {discussion.projectId && (
                          <Badge variant="outline" className="text-xs">
                            {projects.find(p => p.id === discussion.projectId)?.name.value}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{getMemberById(discussion.authorId)?.name}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(discussion.createdAt)}</span>
                        <span>•</span>
                        <span>{discussion.replyCount} replies</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {discussion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {discussion.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  {/* Original Post */}
                  <p className="text-sm">{discussion.content.value}</p>

                  {/* Replies */}
                  {discussion.replies.length > 0 && (
                    <div className="space-y-3 pl-4 border-l-2 border-muted">
                      {discussion.replies.map(reply => (
                        <div key={reply.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {getMemberById(reply.authorId)?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm pl-4">{reply.content}</p>
                          
                          {/* Reactions */}
                          {Object.keys(reply.reactions).length > 0 && (
                            <div className="flex gap-1 pl-4">
                              {Object.entries(reply.reactions).map(([emoji, count]) => (
                                <button
                                  key={emoji}
                                  className="px-2 py-0.5 text-xs bg-muted rounded-full hover:bg-muted/80"
                                >
                                  {emoji} {count}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      placeholder="Write a reply..."
                      value={replyTexts[discussion.id] || ''}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [discussion.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddReply(discussion.id)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(discussion.id)}
                      disabled={!replyTexts[discussion.id]?.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {discussions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <span className="text-4xl block mb-3">💬</span>
                  <h3 className="text-lg font-semibold mb-2">No Discussions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a conversation with your team about your research.
                  </p>
                  <Button onClick={() => setShowNewDiscussionDialog(true)} disabled={!selectedProject}>
                    Start First Discussion
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        /* TEAM TAB */
        <TabsContent value="team" className="space-y-6">
          <h2 className="text-xl font-semibold">Team Members</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`relative`}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
                        member.online ? 'bg-green-100 text-green-700 ring-2 ring-green-300' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {member.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background"></span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.expertise.slice(0, 2).join(' • ')} • {member.publicationsCount} publications
                      </p>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {member.expertise.map(exp => (
                      <Badge key={exp} variant="secondary" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span>📄 {member.publicationsCount} publications</span>
                    <span className={member.online ? 'text-green-600' : ''}>
                      {member.online ? '🟢 Online' : `Last seen ${formatTimeAgo(member.lastActive)}`}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      👤 Profile
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      ✉️ Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Invite Member CTA */}
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-3">
                Want to grow your team? Invite collaborators to join your projects.
              </p>
              <Button variant="outline" onClick={() => triggerUpgradePrompt('collaboration')}>
                👥 Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        /* ACTIVITY TAB */
        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          
          <div className="space-y-3">
            {activities.slice(0, 20).map(activity => (
              <Card key={activity.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.message.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    {activity.actionUrl && (
                      <Button size="sm" variant="ghost" className="shrink-0">
                        View →
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {activities.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <span className="text-4xl block mb-3">📋</span>
                  <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                  <p className="text-muted-foreground">
                    Your team activity will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Real-time Collaboration Upgrade Prompt */}
      <Card className="mt-6 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                🔄 Enable Real-time Collaboration
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                Edit documents together, see cursors live, and chat in real-time.
              </p>
            </div>
            <Button variant="outline" onClick={() => triggerUpgradePrompt('realtime_collab')}>
              Enable Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
