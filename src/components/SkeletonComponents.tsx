'use client';

import { cn } from '@/lib/utils';

// ============ BASE SKELETON ============
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded-md',
        className
      )}
    />
  );
}

// ============ CARD SKELETON ============
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      {/* Content lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-3',
            i === lines - 1 ? 'w-1/4' : 'w-full'
          )} 
        />
      ))}
    </div>
  );
}

// ============ STATS CARD SKELETON ============
export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ============ TABLE SKELETON ============
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Table header */}
      <div className="bg-muted/50 p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="p-4 border-t grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                'h-4',
                colIndex === 0 ? 'w-3/4' : 'w-1/2'
              )} 
          />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============ LIST SKELETON ============
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ============ FORM SKELETON ============
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 p-6 rounded-lg border">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-12 w-40" />
    </div>
  );
}

// ============ CHART SKELETON ============
export function ChartSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t" 
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

// ============ DASHBOARD SKELETON (Full Page) ============
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CardSkeleton lines={4} />
          <TableSkeleton rows={3} cols={4} />
        </div>
        <div className="space-y-4">
          <ListSkeleton items={4} />
        </div>
      </div>
    </div>
  );
}

// ============ CONNECTORS SKELETON ============
export function ConnectorSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Icon and title */}
        <div className="flex items-start gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
        
        {/* Feature tags */}
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

// ============ WORKSPACE SKELETON ============
export function WorkspaceSkeleton() {
  return (
    <div className="space-y-4 h-full">
      {/* Editor header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      
      {/* Editor area */}
      <div className="p-4">
        <div className="font-mono space-y-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton 
                className="h-4" 
                style={{ width: `${Math.random() * 60 + 30}%` }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ ACTIVITY FEED SKELETON ============
export function ActivityFeedSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ DATA LAKE SKELETON ============
export function DataLakeSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}

// ============ COMPUTE SKELETON ============
export function ComputeSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* GPU Cluster Status */}
      <CardSkeleton lines={2} />

      {/* Job Queue */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <TableSkeleton rows={5} cols={5} />
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}

// ============ COLLABORATION SKELETON ============
export function CollaborationSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} lines={3} />
        ))}
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <ListSkeleton items={5} />
      </div>
    </div>
  );
}

// ============ SETTINGS SKELETON ============
export function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28" />
        ))}
      </div>

      {/* Form Sections */}
      <FormSkeleton fields={5} />

      {/* Additional Form Section */}
      <FormSkeleton fields={4} />

      {/* Danger Zone */}
      <div className="border border-destructive/30 rounded-lg p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

// ============ AETHEL AI SKELETON ============
export function AethelSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col rounded-lg border overflow-hidden">
          {/* Model Selector Header */}
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-60" />
              <Skeleton className="h-9 w-32" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-4">
            {/* Welcome Message Skeleton */}
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Skeleton className="w-16 h-16 rounded-full mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72 mb-6" />
              
              {/* Quick Start Prompts */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t space-y-2">
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Models Card */}
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>

          {/* Usage Card */}
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-14 rounded" />
              <Skeleton className="h-14 rounded" />
            </div>
          </div>

          {/* Pro CTA Card */}
          <div className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ CHAT BUBBLE SKELETON (for AI thinking state) ============
export function ChatBubbleSkeleton({ isAI = false }: { isAI?: boolean }) {
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} space-y-3`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 ${isAI ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
        <div className="space-y-2">
          {isAI && (
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          )}
          <Skeleton className={`h-4 w-${isAI ? 'full' : '3/4'}`} />
          <Skeleton className={`h-4 w-${isAI ? '5/6' : '1/2'}`} />
          {isAI && <Skeleton className="h-4 w-2/3" />}
        </div>
      </div>
    </div>
  );
}
