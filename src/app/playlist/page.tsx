'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ============ ICONS ============
const Icons = {
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Filter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  ),
  ExternalLink: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
  ),
  Share: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
}

// ============ VIDEO PLAYLIST DATA ============
const VIDEO_PLAYLIST = [
  { 
    id: 1, 
    title: "Platform Overview Tour", 
    duration: "5:32", 
    thumbnail: "🎬", 
    description: "Complete walkthrough of SciHub Pro features and capabilities. Learn how to navigate the platform and make the most of all available tools.", 
    category: "Getting Started", 
    views: "12.5K",
    level: "Beginner",
    featured: true
  },
  { 
    id: 2, 
    title: "Literature Search Deep Dive", 
    duration: "8:15", 
    thumbnail: "📚", 
    description: "Master advanced search across arXiv, PubMed, Semantic Scholar. Learn boolean operators, filters, and how to save search queries.", 
    category: "Tutorials", 
    views: "8.3K",
    level: "Intermediate"
  },
  { 
    id: 3, 
    title: "AI Research Assistant Demo", 
    duration: "6:45", 
    thumbnail: "🤖", 
    description: "See AETHEL AI in action - summarizing papers and answering questions about complex scientific topics in plain language.", 
    category: "AI Features", 
    views: "15.2K",
    level: "Beginner",
    featured: true
  },
  { 
    id: 4, 
    title: "Paper Battle Mode Explained", 
    duration: "4:20", 
    thumbnail: "⚔️", 
    description: "Watch AI agents debate scientific papers from different perspectives. A unique way to understand research from multiple angles.", 
    category: "AI Features", 
    views: "9.8K",
    level: "Advanced"
  },
  { 
    id: 5, 
    title: "Citation Network Visualization", 
    duration: "7:10", 
    thumbnail: "🕸️", 
    description: "Interactive exploration of research citation networks. Discover how ideas connect and influence each other across disciplines.", 
    category: "Visualization", 
    views: "6.4K",
    level: "Intermediate"
  },
  { 
    id: 6, 
    title: "Collaboration Workspaces", 
    duration: "5:55", 
    thumbnail: "👥", 
    description: "Team workflows, sharing, and real-time collaboration features. Learn how to work together on research projects efficiently.", 
    category: "Teams", 
    views: "7.1K",
    level: "Beginner"
  },
  { 
    id: 7, 
    title: "Data Pipeline & Connectors", 
    duration: "9:30", 
    thumbnail: "🔗", 
    description: "Connect to DuckDB, BigQuery, Supabase and more. Set up your data pipeline for seamless scientific data analysis.", 
    category: "Technical", 
    views: "5.9K",
    level: "Advanced"
  },
  { 
    id: 8, 
    title: "Subscription Plans Comparison", 
    duration: "3:45", 
    thumbnail: "⭐", 
    description: "Free vs Pro vs Enterprise - which plan is right for you? Detailed breakdown of features and pricing.", 
    category: "Plans", 
    views: "11.2K",
    level: "Beginner"
  },
  { 
    id: 9, 
    title: "Python Workspace Tutorial", 
    duration: "12:20", 
    thumbnail: "🐍", 
    description: "Full tutorial on using the Python workspace for data analysis, visualization, and machine learning tasks.", 
    category: "Tutorials", 
    views: "14.7K",
    level: "Intermediate",
    featured: true
  },
  { 
    id: 10, 
    title: "AlphaFold Integration Guide", 
    duration: "6:15", 
    thumbnail: "🧬", 
    description: "How to use AlphaFold protein structure predictions within SciHub Pro. From sequence to 3D structure visualization.", 
    category: "Technical", 
    views: "4.2K",
    level: "Advanced"
  },
  { 
    id: 11, 
    title: "Export & Publishing Workflow", 
    duration: "5:40", 
    thumbnail: "📄", 
    description: "From analysis to publication. Learn how to export results, generate figures, and prepare manuscripts.", 
    category: "Tutorials", 
    views: "6.8K",
    level: "Intermediate"
  },
  { 
    id: 12, 
    title: "Security & Compliance Overview", 
    duration: "4:50", 
    thumbnail: "🛡️", 
    description: "Enterprise security features, SOC 2 compliance, data governance, and privacy controls explained.", 
    category: "Enterprise", 
    views: "3.1K",
    level: "Advanced"
  },
]

const CATEGORIES = ['All', 'Getting Started', 'Tutorials', 'AI Features', 'Visualization', 'Teams', 'Technical', 'Plans', 'Enterprise']
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

// ============ VIDEO CARD COMPONENT ============
function VideoCard({ video, onSelect }: { video: typeof VIDEO_PLAYLIST[0]; onSelect: (video: typeof VIDEO_PLAYLIST[0]) => void }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 bg-slate-900/50 border-slate-800 ${
        video.featured ? 'ring-1 ring-purple-500/30' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(video)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-lg flex items-center justify-center overflow-hidden">
        <span className={`text-5xl transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>{video.thumbnail}</span>
        
        {/* Play Overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Icons.Play />
          </div>
        </div>

        {/* Duration Badge */}
        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0 text-xs">
          {video.duration}
        </Badge>

        {/* Featured Badge */}
        {video.featured && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 text-xs">
            <Icons.Star /> Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2 mb-2">
          {video.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">
          {video.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Icons.Eye /> {video.views}
          </span>
          <span className="flex items-center gap-1">
            <Icons.Clock /> {video.duration}
          </span>
          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
            {video.level}
          </Badge>
        </div>

        {/* Category */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
            {video.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ VIDEO PLAYER DIALOG ============
function VideoPlayerDialog({ 
  video, 
  isOpen, 
  onClose 
}: { 
  video: typeof VIDEO_PLAYLIST[0] | null
  isOpen: boolean
  onClose: () => void 
}) {
  if (!video) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-800 p-0 overflow-hidden">
        {/* Video Player Area */}
        <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
          <span className="text-8xl">{video.thumbnail}</span>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Button size="lg" variant="secondary" className="w-20 h-20 rounded-full bg-white/90 hover:bg-white text-slate-900">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </Button>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-black/50"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>

          {/* Duration Badge */}
          <Badge className="absolute bottom-4 right-4 bg-black/80 text-white border-0 text-sm px-3 py-1">
            {video.duration}
          </Badge>
        </div>

        {/* Video Info */}
        <div className="p-6">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl text-white mb-2">{video.title}</DialogTitle>
                <DialogDescription className="text-slate-400 text-base">
                  {video.description}
                </DialogDescription>
              </div>
              {video.featured && (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shrink-0">
                  <Icons.Star /> Featured
                </Badge>
              )}
            </div>
          </DialogHeader>

          <Separator className="my-4 bg-slate-800" />

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Icons.Eye />
              <span>{video.views} views</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Icons.Clock />
              <span>{video.duration}</span>
            </div>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {video.level}
            </Badge>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
              {video.category}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
              <Icons.Share /> Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800">
              <Icons.ExternalLink /> Open in New Tab
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Icons.Check /> Mark as Watched
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============ MAIN PLAYLIST PAGE ============
export default function PlaylistPage() {
  const [selectedVideo, setSelectedVideo] = useState<typeof VIDEO_PLAYLIST[0] | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [sortBy, setSortBy] = useState<'featured' | 'views' | 'duration' | 'title'>('featured')

  // Filter videos based on search and filters
  const filteredVideos = VIDEO_PLAYLIST.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory
    const matchesLevel = selectedLevel === 'All' || video.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return parseFloat(b.views.replace('K', '')) - parseFloat(a.views.replace('K', ''))
      case 'duration':
        return a.duration.localeCompare(b.duration)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'featured':
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    }
  })

  // Handle video selection
  const handleSelectVideo = (video: typeof VIDEO_PLAYLIST[0]) => {
    setSelectedVideo(video)
    setIsPlayerOpen(true)
  }

  // Stats
  const totalDuration = VIDEO_PLAYLIST.reduce((acc, v) => {
    const [mins, secs] = v.duration.split(':').map(Number)
    return acc + mins + secs / 60
  }, 0)
  const totalViews = VIDEO_PLAYLIST.reduce((acc, v) => acc + parseFloat(v.views.replace('K', '')), 0)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Title */}
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Icons.ArrowLeft />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  🎥 Video Playlist
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Tutorials, demos, and feature deep-dives
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Icons.Play /> {VIDEO_PLAYLIST.length} videos
              </span>
              <span className="flex items-center gap-1">
                <Icons.Clock /> ~{Math.round(totalDuration)} min total
              </span>
              <span className="flex items-center gap-1">
                <Icons.Eye /> {totalViews.toFixed(1)}K views
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-pink-900/30 rounded-2xl p-6 md:p-8 border border-purple-500/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  SciHub Pro Learning Center
                </h2>
                <p className="text-slate-400 max-w-2xl">
                  Master SciHub Pro with our comprehensive video library. From getting started guides to advanced technical tutorials, 
                  everything you need to become a power user.
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shrink-0"
                onClick={() => handleSelectVideo(VIDEO_PLAYLIST.find(v => v.featured) || VIDEO_PLAYLIST[0])}
              >
                <Icons.Play /> Watch Featured
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-purple-500"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Icons.Search />
            </div>
          </div>

          {/* Category & Level Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                  }
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:border-purple-500 focus:outline-none"
              >
                {LEVELS.map(level => (
                  <option key={level} value={level}>{level} Level</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:border-purple-500 focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="views">Most Viewed</option>
                <option value="duration">Duration</option>
                <option value="title">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-slate-400">
          Showing {sortedVideos.length} of {VIDEO_PLAYLIST.length} videos
          {searchQuery && ` matching "${searchQuery}"`}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </div>

        {/* Video Grid */}
        {sortedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onSelect={handleSelectVideo}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedLevel('All')
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Separator className="bg-slate-800 mb-8" />
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Watch our Platform Overview Tour first, then dive into the specific features you need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Icons.ArrowLeft /> Back to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Try the Dashboard →
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Video Player Dialog */}
      <VideoPlayerDialog
        video={selectedVideo}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© 2024 SciHub Pro. Video content for demonstration purposes.</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
              <Link href="/subscription" className="hover:text-slate-300 transition-colors">Plans</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
