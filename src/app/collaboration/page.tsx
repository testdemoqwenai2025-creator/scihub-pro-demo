'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField } from '@/store/useDynamicStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============ TYPES ============

interface MemberFormData {
  name: string;
  email: string;
  role: 'pi' | 'postdoc' | 'phd' | 'researcher' | 'data_scientist' | 'developer' | 'admin';
  institution: string;
  orcid: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
}

// ============ COLLABORATION PAGE ============

export default function CollaborationPage() {
  const { t } = useTranslation();
  const {
    members,
    projects,
    addMember,
    updateMember,
    removeMember,
    createProject,
    addDiscussion,
    addActivity,
  } = useDynamicStore();

  // UI State
  const [activeTab, setActiveTab] = useState<'team' | 'projects' | 'discussions'>('team');
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  
  // Form states
  const [memberForm, setMemberForm] = useState<MemberFormData>({
    name: '',
    email: '',
    role: 'researcher',
    institution: '',
    orcid: '',
  });
  
  const [projectForm, setProjectForm] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'active',
  });

  // Discussion form
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [selectedProjectForDiscussion, setSelectedProjectForDiscussion] = useState('');

  // Handle member creation
  const handleAddMember = () => {
    if (!memberForm.name.trim() || !memberForm.email.trim()) return;

    addMember({
      name: createDynamicField(memberForm.name),
      email: createDynamicField(memberForm.email),
      role: createDynamicField(memberForm.role),
      institution: createDynamicField(memberForm.institution || 'Not specified'),
      orcid: createDynamicField(memberForm.orcid || '0000-0000-0000-0000'),
      isOnline: createDynamicField(true),
      publications: createDynamicField(0),
    });

    addActivity({
      type: 'collaboration',
      message: createDynamicField(`${memberForm.name} joined the team`),
      icon: '👋',
    });

    // Reset form
    setMemberForm({ name: '', email: '', role: 'researcher', institution: '', orcid: '' });
    setShowAddMemberForm(false);
  };

  // Handle member update (inline edit)
  const handleUpdateMember = (memberId: string, field: string, value: any) => {
    updateMember(memberId, {
      [field]: {
        value,
        isDirty: true,
        lastModified: new Date(),
      }
    });
  };

  // Handle member removal
  const handleRemoveMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member && confirm(`Remove ${member.name.value} from the team?`)) {
      removeMember(memberId);
    }
  };

  // Handle project creation
  const handleCreateProject = () => {
    if (!projectForm.name.trim()) return;

    createProject({
      name: createDynamicField(projectForm.name),
      description: createDynamicField(projectForm.description || `Project: ${projectForm.name}`),
      status: createDynamicField(projectForm.status),
      members: [],
    });

    addActivity({
      type: 'create',
      message: createDynamicField(`Created project "${projectForm.name}"`),
      icon: '📁',
    });

    setProjectForm({ name: '', description: '', status: 'active' });
    setShowCreateProjectForm(false);
  };

  // Handle discussion creation
  const handleAddDiscussion = () => {
    if (!newDiscussionTitle.trim() || !selectedProjectForDiscussion) return;

    addDiscussion(selectedProjectForDiscussion, {
      title: createDynamicField(newDiscussionTitle),
      author: 'You',
      tags: createDynamicField(['discussion']),
      isPinned: createDynamicField(false),
    });

    addActivity({
      type: 'create',
      message: createDynamicField(`Started discussion in project`),
      icon: '💬',
    });

    setNewDiscussionTitle('');
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      pi: 'bg-purple-500',
      postdoc: 'bg-blue-500',
      phd: 'bg-green-500',
      researcher: 'bg-gray-500',
      data_scientist: 'bg-orange-500',
      developer: 'bg-cyan-500',
      admin: 'bg-red-500',
    };
    return colors[role] || 'bg-gray-400';
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Online count
  const onlineCount = members.filter(m => m.isOnline.value).length;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('collaboration.title') || 'Collaboration Hub'}</h1>
        <p className="text-muted-foreground mt-1">
          Manage your research team, projects, and discussions. All data persists locally.
        </p>
        
        <div className="mt-2 flex items-center gap-3">
          <Badge variant="secondary">
            👥 {members.length} Members • {onlineCount} Online
          </Badge>
          <Badge variant="secondary">
            📁 {projects.length} Projects
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'team' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Team ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'projects' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('discussions')}
          className={`pb-3 px-2 font-medium transition-colors ${
            activeTab === 'discussions' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Discussions
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Team Header with Add Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Team Members</h2>
                <Button onClick={() => setShowAddMemberForm(!showAddMemberForm)}>
                  + Invite Member
                </Button>
              </div>

              {/* Add Member Form */}
              {showAddMemberForm && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Invite New Member</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium">Full Name *</label>
                        <Input
                          value={memberForm.name}
                          onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                          placeholder="Dr. Jane Smith"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          value={memberForm.email}
                          onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                          placeholder="jane@institution.edu"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Role</label>
                        <Select value={memberForm.role} onValueChange={(v) => setMemberForm({...memberForm, role: v as MemberFormData['role']})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pi">Principal Investigator</SelectItem>
                            <SelectItem value="postdoc">Postdoctoral Researcher</SelectItem>
                            <SelectItem value="phd">PhD Student</SelectItem>
                            <SelectItem value="researcher">Research Scientist</SelectItem>
                            <SelectItem value="data_scientist">Data Scientist</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Institution</label>
                        <Input
                          value={memberForm.institution}
                          onChange={(e) => setMemberForm({...memberForm, institution: e.target.value})}
                          placeholder="University/Company"
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">ORCID (optional)</label>
                        <Input
                          value={memberForm.orcid}
                          onChange={(e) => setMemberForm({...memberForm, orcid: e.target.value})}
                          placeholder="0000-0000-0000-0000"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowAddMemberForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember} disabled={!memberForm.name.trim() || !memberForm.email.trim()}>
                        Send Invitation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                            {member.name.value.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium">{member.name.value}</h3>
                            {member.name.isDirty && (
                              <Badge variant="outline" className="text-xs mt-0.5">✏️ Edited</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <span className={`w-2 h-2 rounded-full ${member.isOnline.value ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <Badge className={`${getRoleBadgeColor(member.role.value)} text-xs`}>
                            {formatRole(member.role.value)}
                          </Badge>
                        </div>
                      </div>

                      {/* Editable Fields */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-16">Email:</span>
                          <input
                            type="email"
                            value={member.email.value}
                            onChange={(e) => handleUpdateMember(member.id, 'email', e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm bg-background"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-16">Inst.:</span>
                          <input
                            value={member.institution.value}
                            onChange={(e) => handleUpdateMember(member.id, 'institution', e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm bg-background"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-16">ORCID:</span>
                          <input
                            value={member.orcid.value}
                            onChange={(e) => handleUpdateMember(member.id, 'orcid', e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm bg-background font-mono"
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <span>📄 {member.publications.value} pubs</span>
                        <span>Joined {member.joinedAt.toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          ✕
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Projects</h2>
                <Button onClick={() => setShowCreateProjectForm(!showCreateProjectForm)}>
                  + Create Project
                </Button>
              </div>

              {/* Create Project Form */}
              {showCreateProjectForm && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Create New Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-4">
                      <div>
                        <label className="text-sm font-medium">Project Name *</label>
                        <Input
                          value={projectForm.name}
                          onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                          placeholder="e.g., Cancer Genomics Study"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                          placeholder="Brief description of the project goals..."
                          className="mt-1 w-full p-2 border rounded-md h-20 resize-none text-sm bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select value={projectForm.status} onValueChange={(v) => setProjectForm({...projectForm, status: v as ProjectFormData['status']})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowCreateProjectForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProject} disabled={!projectForm.name.trim()}>
                        Create Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(project => (
                  <Card 
                    key={project.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedProject === project.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{project.name.value}</CardTitle>
                        <Badge 
                          variant={
                            project.status.value === 'active' ? 'default' :
                            project.status.value === 'completed' ? 'secondary' :
                            'outline'
                          }
                          className={
                            project.status.value === 'paused' ? 'bg-yellow-100 text-yellow-800' : ''
                          }
                        >
                          {project.status.value.charAt(0).toUpperCase() + project.status.value.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>{project.description.value}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>👥 {project.members.length} members</span>
                        <span>💬 {project.discussions.length} discussions</span>
                        <span>📊 {project.datasets.length} datasets</span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        Last activity: {project.lastActivity.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Discussions</h2>

              {/* New Discussion Form */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Select value={selectedProjectForDiscussion} onValueChange={setSelectedProjectForDiscussion}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      placeholder="Discussion topic..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddDiscussion}
                      disabled={!newDiscussionTitle.trim() || !selectedProjectForDiscussion}
                    >
                      Start Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Discussions List */}
              <div className="space-y-4">
                {projects.flatMap(project => 
                  project.discussions.map(discussion => (
                    <Card key={discussion.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{discussion.title.value}</CardTitle>
                            <CardDescription className="mt-1">
                              In: {project.name.value} • Started by {discussion.author}
                            </CardDescription>
                          </div>
                          {discussion.isPinned?.value && (
                            <Badge variant="secondary">📌 Pinned</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>💬 {discussion.replies.length} replies</span>
                          <span>Created: {discussion.createdAt.toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {projects.every(p => p.discussions.length === 0) && (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <span className="text-5xl block mb-4">💬</span>
                      <p>No discussions yet. Start one above!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Online Now */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Online Now ({onlineCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.filter(m => m.isOnline.value).map(member => (
                  <div key={member.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm truncate">{member.name.value}</span>
                  </div>
                ))}
                
                {onlineCount === 0 && (
                  <p className="text-sm text-muted-foreground">No one is online</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                📧 Email Team
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📅 Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                📊 Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                🔔 Configure Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Team Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Publications</span>
                <span className="font-medium">
                  {members.reduce((acc, m) => acc + m.publications.value, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Projects</span>
                <span className="font-medium">
                  {projects.filter(p => p.status.value === 'active').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Discussions</span>
                <span className="font-medium">
                  {projects.reduce((acc, p) => acc + p.discussions.length, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
