'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icons as simple SVG components
const Icons = {
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  ),
  Container: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Server: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
  ),
  Brain: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.206"/><path d="m19.938 6.689.002.003"/><path d="M20.523 10.896a4 4 0 0 0-.585-.206"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
  ),
  Workflow: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  GitBranch: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
  ),
  Rocket: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  Github: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
  ),
  Twitter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
  ),
  Linkedin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  ),
  Loader2: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  ),
}

// Network visualization component
function NetworkVisualization() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      {/* Animated background nodes */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-500/20 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Central node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30 z-10">
        <span className="text-white font-bold text-lg md:text-2xl">AETH-1</span>
      </div>

      {/* Connected nodes */}
      {[
        { label: 'Python', x: '15%', y: '25%', color: 'from-blue-400 to-blue-600' },
        { label: 'R', x: '80%', y: '20%', color: 'from-green-400 to-green-600' },
        { label: 'Julia', x: '85%', y: '60%', color: 'from-purple-400 to-purple-600' },
        { label: 'MATLAB', x: '70%', y: '80%', color: 'from-orange-400 to-orange-600' },
        { label: 'GPU', x: '20%', y: '75%', color: 'from-red-400 to-red-600' },
        { label: 'Cloud', x: '10%', y: '55%', color: 'from-yellow-400 to-yellow-600' },
      ].map((node, i) => (
        <div key={i} className="absolute z-10" style={{ left: node.x, top: node.y }}>
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg`}>
            <span className="text-white text-xs font-semibold">{node.label}</span>
          </div>
          {/* Connection line to center */}
          <svg className="absolute inset-0 -z-10 pointer-events-none" style={{ 
            left: '-200px', 
            top: '-250px',
            width: '450px', 
            height: '550px' 
          }}>
            <line 
              x1="225" 
              y1="275" 
              x2={node.x === '15%' ? '120' : node.x === '80%' ? '380' : node.x === '85%' ? '395' : node.x === '70%' ? '340' : node.x === '20%' ? '130' : '90'} 
              y2={node.y === '25%' ? '80' : node.y === '20%' ? '60' : node.y === '60%' ? '180' : node.y === '80%' ? '240' : node.y === '75%' ? '220' : '160'}
              stroke="url(#gradient)" 
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            >
              <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
            </line>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  )
}

// Feature data
const features = [
  {
    icon: Icons.Package,
    title: 'Package Discovery & Sharing',
    description: 'Find, install, and share scientific packages across any language or framework. One registry for everything.',
    link: '/connectors',
  },
  {
    icon: Icons.Container,
    title: 'Reproducible Environments',
    description: 'Container-based environments that ensure your research is reproducible by anyone, anywhere.',
    link: '/workspace',
  },
  {
    icon: Icons.Users,
    title: 'Collaborative Workspace',
    description: 'Real-time collaboration with version control built for scientific workflows, not just code.',
    link: '/dashboard',
  },
  {
    icon: Icons.Server,
    title: 'Scalable Compute',
    description: 'From laptop to cluster to cloud—scale your compute without changing your workflow.',
    link: '/datasets',
  },
  {
    icon: Icons.Brain,
    title: 'AI-Powered Insights',
    description: 'Integrated AI assistants that help analyze data, suggest methods, and accelerate discovery.',
    link: '/search',
  },
  {
    icon: Icons.Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with audit logs, SSO, and data governance for institutional requirements.',
    link: '#',
  },
]

// How it works steps
const steps = [
  {
    icon: Icons.Upload,
    step: '01',
    title: 'Import Your Tools',
    description: 'Connect your existing tools, scripts, and workflows in minutes. We support Python, R, Julia, MATLAB, and more.',
  },
  {
    icon: Icons.Workflow,
    step: '02',
    title: 'Build Workflows Visually',
    description: 'Drag-and-drop interface to create complex computational pipelines without writing glue code.',
  },
  {
    icon: Icons.GitBranch,
    step: '03',
    title: 'Version & Share',
    description: 'Git-like version control for experiments. Share with collaborators or publish for reproducibility.',
  },
  {
    icon: Icons.Rocket,
    step: '04',
    title: 'Deploy at Scale',
    description: 'One-click deployment to cloud, HPC clusters, or edge devices. Scale from prototype to production.',
  },
]

// Stats data
const stats = [
  { value: '100K+', label: 'Researchers Target Y1' },
  { value: '$500M+', label: 'ARR Target Y5' },
  { value: '75%+', label: 'Gross Margin' },
  { value: '12%', label: 'Market CAGR' },
]

// Pricing tiers
const pricingTiers = [
  {
    name: 'Community',
    price: 'Free',
    period: 'forever',
    description: 'For individual researchers and students',
    features: ['Unlimited public projects', 'Basic compute (10 hrs/mo)', 'Community support', 'Core package registry'],
    cta: 'Get Started',
    highlighted: false,
    action: 'free',
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/user/month',
    description: 'For professional researchers and small labs',
    features: ['Private projects', 'Advanced compute (100 hrs/mo)', 'Priority support', 'AI-powered insights', 'Team collaboration'],
    cta: 'Start Free Trial',
    highlighted: true,
    action: 'trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For institutions and large organizations',
    features: ['Everything in Professional', 'Unlimited compute', 'SSO & SAML', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlighted: false,
    action: 'enterprise',
  },
]

// Testimonials
const testimonials = [
  {
    quote: "I use 15 different software tools. None of them talk to each other. AETH-1 would save me 20 hours per week just on data wrangling.",
    author: '@ADHD_Scientist',
    role: 'Computational Biologist',
    source: 'Viral Tweet • 45K Retweets',
  },
  {
    quote: "It took me 3 weeks to install GROMACS and get it working with our lab's GPU cluster. With Endeavor Science, it was running in 30 minutes.",
    author: 'Dr. Sarah Chen',
    role: 'Postdoctoral Researcher, MIT',
    source: 'Beta Tester Feedback',
  },
  {
    quote: "Researchers install random software from GitHub on our secure networks. We need a platform we can trust.",
    author: 'Anonymous CTO',
    role: 'Biotech Company',
    source: 'STAT News Interview',
  },
]

export default function Home() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  // Modal states
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false)
  const [showInvestorModal, setShowInvestorModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showTrialModal, setShowTrialModal] = useState(false)
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false)

  // Form states
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)
  const [waitlistError, setWaitlistError] = useState('')

  // Early Access form states
  const [earlyAccessForm, setEarlyAccessForm] = useState({
    name: '',
    email: '',
    institution: '',
    role: '',
    researchField: '',
    hearAboutUs: '',
    excitedFeature: '',
    agreeTerms: false,
  })
  const [earlyAccessLoading, setEarlyAccessLoading] = useState(false)
  const [earlyAccessSuccess, setEarlyAccessSuccess] = useState(false)
  const [earlyAccessError, setEarlyAccessError] = useState('')

  // Enterprise form states
  const [enterpriseForm, setEnterpriseForm] = useState({
    company: '',
    website: '',
    industry: '',
    country: '',
    users: '',
    apiCalls: '',
    storage: '',
    integrations: '',
    compliance: '',
    contactName: '',
    jobTitle: '',
    workEmail: '',
    phone: '',
    bestTime: '',
    timeline: '',
    budget: '',
    notes: '',
  })
  const [enterpriseLoading, setEnterpriseLoading] = useState(false)
  const [enterpriseSuccess, setEnterpriseSuccess] = useState(false)
  const [enterpriseError, setEnterpriseError] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Waitlist submit handler
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!waitlistEmail.includes('@')) {
      setWaitlistError('Please enter a valid email address')
      return
    }

    setWaitlistLoading(true)
    setWaitlistError('')

    try {
      // Store in localStorage as backup
      const waitlistEntries = JSON.parse(localStorage.getItem('scihub_waitlist') || '[]')
      if (!waitlistEntries.includes(waitlistEmail)) {
        waitlistEntries.push({
          email: waitlistEmail,
          timestamp: new Date().toISOString(),
          source: 'landing_page'
        })
        localStorage.setItem('scihub_waitlist', JSON.stringify(waitlistEntries))
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setWaitlistSuccess(true)
      setWaitlistEmail('')
    } catch {
      // Fallback success
      setWaitlistSuccess(true)
    } finally {
      setWaitlistLoading(false)
    }
  }

  // Early Access submit handler
  const handleEarlyAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!earlyAccessForm.name || !earlyAccessForm.email || !earlyAccessForm.institution) {
      setEarlyAccessError('Please fill in all required fields')
      return
    }

    if (!earlyAccessForm.agreeTerms) {
      setEarlyAccessError('Please agree to the beta terms')
      return
    }

    setEarlyAccessLoading(true)
    setEarlyAccessError('')

    try {
      // Store in localStorage
      const entries = JSON.parse(localStorage.getItem('scihub_early_access') || '[]')
      entries.push({
        ...earlyAccessForm,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('scihub_early_access', JSON.stringify(entries))

      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setEarlyAccessSuccess(true)
    } catch {
      setEarlyAccessError('Something went wrong. Please try again.')
    } finally {
      setEarlyAccessLoading(false)
    }
  }

  // Enterprise submit handler
  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!enterpriseForm.company || !enterpriseForm.contactName || !enterpriseForm.workEmail) {
      setEnterpriseError('Please fill in all required fields')
      return
    }

    setEnterpriseLoading(true)
    setEnterpriseError('')

    try {
      // Store in localStorage
      const entries = JSON.parse(localStorage.getItem('scihub_enterprise_leads') || '[]')
      entries.push({
        ...enterpriseForm,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('scihub_enterprise_leads', JSON.stringify(entries))

      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setEnterpriseSuccess(true)
    } catch {
      setEnterpriseError('Something went wrong. Please try again.')
    } finally {
      setEnterpriseLoading(false)
    }
  }

  // Pricing CTA handler
  const handlePricingCta = (action: string) => {
    switch (action) {
      case 'free':
        setShowSignupModal(true)
        break
      case 'trial':
        setShowTrialModal(true)
        break
      case 'enterprise':
        setShowEnterpriseModal(true)
        break
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-bold text-white">
                E
              </div>
              <span className="text-xl font-bold hidden sm:block">Endeavor Science</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#platform" className="text-sm text-slate-300 hover:text-white transition-colors">Platform</a>
              <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-sm text-slate-300 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-sm text-slate-300 hover:text-white transition-colors">Contact</a>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                onClick={() => setShowInvestorModal(true)}
              >
                Investor Portal
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0"
                onClick={() => setShowEarlyAccessModal(true)}
              >
                Get Early Access
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800">
              <div className="flex flex-col gap-4">
                <a href="#platform" className="text-sm text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Platform</a>
                <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                <a href="#about" className="text-sm text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>About</a>
                <a href="#contact" className="text-sm text-slate-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a>
                <Separator className="bg-slate-800" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => { setShowInvestorModal(true); setIsMenuOpen(false); }}
                >
                  Investor Portal
                </Button>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0"
                  onClick={() => { setShowEarlyAccessModal(true); setIsMenuOpen(false); }}
                >
                  Get Early Access
                </Button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
            <Badge variant="secondary" className="mb-6 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5">
              🚀 Now in Private Beta
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              The{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                GitHub for Scientific Computing
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Democratizing Discovery — One platform to unify, reproduce, and accelerate all your research.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0 px-8 py-6 text-base"
                onClick={() => setShowSignupModal(true)}
              >
                Start Free
                <Icons.ArrowRight />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-700 hover:bg-slate-800 hover:border-slate-600 px-8 py-6 text-base"
                onClick={() => setShowDemoModal(true)}
              >
                <Icons.Play />
                Watch Demo
              </Button>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">$50B</span>
                <span className="text-slate-400">Market</span>
              </div>
              <Separator orientation="vertical" className="h-6 bg-slate-700" />
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">10M+</span>
                <span className="text-slate-400">Scientists</span>
              </div>
              <Separator orientation="vertical" className="h-6 bg-slate-700" />
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">90%</span>
                <span className="text-slate-400">Time Saved</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <NetworkVisualization />
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="platform" className="py-16 md:py-24 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Pain Points */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Problem is{' '}
                <span className="text-red-400">Real</span>
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Scientists waste up to 60% of their time managing tools instead of doing research.
              </p>
              
              <div className="space-y-4">
                {[
                  {
                    icon: '🔧',
                    title: '15+ Tools That Don\'t Talk',
                    desc: 'Python, R, MATLAB, Julia, Fortran... each with its own ecosystem and no interoperability.',
                  },
                  {
                    icon: '⏰',
                    title: '60% Time Lost to Data Wrangling',
                    desc: 'Format conversion, dependency hell, environment setup — the real work never starts.',
                  },
                  {
                    icon: '❌',
                    title: 'Reproducibility Crisis',
                    desc: '70% of researchers can\'t reproduce their own work after 6 months. Publications are losing trust.',
                  },
                ].map((pain, i) => (
                  <Card key={i} className="bg-slate-800/50 border-slate-700/50 hover:border-red-500/30 transition-all group">
                    <CardContent className="p-5 flex gap-4">
                      <span className="text-2xl">{pain.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors">{pain.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{pain.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Solution Preview */}
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our{' '}
                <span className="text-cyan-400">Solution</span>
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                One unified workspace that brings everything together.
              </p>

              {/* Before/After Comparison */}
              <div className="space-y-4">
                <Card className="bg-slate-800/50 border-red-500/30">
                  <CardHeader className="pb-3">
                    <Badge variant="destructive" className="w-fit bg-red-500/20 text-red-400 border-red-500/30">Before</Badge>
                    <CardTitle className="text-base text-slate-300">Fragmented Workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {['Python', 'R', 'MATLAB', 'Julia', 'Git', 'Docker', 'Slurm', 'Excel', 'Jupyter', 'VS Code', 'SSH', 'Conda'].map((tool) => (
                        <Badge key={tool} variant="outline" className="border-slate-600 text-slate-400 text-xs">{tool}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-3">12+ disconnected tools, manual integration required</p>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center transform rotate-90 md:rotate-0">
                    <Icons.ArrowRight />
                  </div>
                </div>

                <Card className="bg-gradient-to-br from-cyan-900/30 to-teal-900/30 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                  <CardHeader className="pb-3">
                    <Badge className="w-fit bg-cyan-500/20 text-cyan-400 border-cyan-500/30">After</Badge>
                    <CardTitle className="text-base text-white">Unified Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-800/80 rounded-lg p-4 border border-cyan-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-xs font-bold">E</div>
                        <span className="font-medium text-white">Endeavor Science Workspace</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icons.Check /> All languages supported
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icons.Check /> Built-in version control
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icons.Check /> One-click deployment
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Icons.Check /> AI-assisted workflows
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">One Platform</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Built by scientists, for scientists. Every feature designed to accelerate discovery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link key={i} href={feature.link}>
                <Card className="group h-full bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:from-cyan-500/30 group-hover:to-teal-500/30 transition-colors">
                      <feature.icon />
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <Icons.ArrowRight />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Chaos to Clarity in{' '}
              <span className="text-cyan-400">4 Steps</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Get started in minutes, not months. No PhD in DevOps required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-4 relative">
                    <span className="text-cyan-400 flex items-center justify-center w-full h-full"><step.icon /></span>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cyan-500 text-white text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section id="about" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Traction</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Backed by{' '}
              <span className="text-cyan-400">Real Numbers</span>
            </h2>
            <p className="text-slate-400 text-lg">
              A massive market opportunity with clear path to dominance.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <Card key={i} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 text-center">
                <CardContent className="p-6 md:p-8">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <p className="text-slate-400 text-sm md:text-base">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market context */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm max-w-2xl mx-auto">
              The scientific software market is <span className="text-cyan-400 font-medium">$45B+</span> and growing at <span className="text-cyan-400 font-medium">12% CAGR</span>. Yet scientists still cobble together fragmented tools. We're building what GitHub did for code—for science.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-16 md:py-24 bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent{' '}
              <span className="text-cyan-400">Pricing</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Start free, scale when ready. No surprise fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <Card key={i} className={`relative ${tier.highlighted ? 'bg-gradient-to-b from-cyan-900/30 to-slate-900 border-cyan-500/50 shadow-xl shadow-cyan-500/10 scale-105' : 'bg-slate-900/50 border-slate-800'}`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
                  <CardDescription className="text-slate-400">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.period && <span className="text-slate-400 ml-1">{tier.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Icons.Check />
                        <span className={tier.highlighted ? 'text-slate-200' : 'text-slate-400'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.highlighted ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0' : ''}`}
                    variant={!tier.highlighted ? 'outline' : 'default'}
                    onClick={() => handlePricingCta(tier.action)}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by{' '}
              <span className="text-cyan-400">Scientists</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Real feedback from researchers who've experienced the pain firsthand.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="w-4 h-4 text-yellow-500 flex items-center justify-center"><Icons.Star /></span>
                    ))}
                  </div>
                  <blockquote className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-teal-500/30 flex items-center justify-center text-cyan-400 font-semibold text-sm">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{testimonial.author}</p>
                      <p className="text-slate-500 text-xs">{testimonial.role}</p>
                      <p className="text-cyan-500/70 text-xs">{testimonial.source}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Functional Waitlist Form */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-b from-slate-900/50 to-cyan-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-3xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15),transparent_70%)]" />
            <CardContent className="relative p-8 md:p-12 text-center">
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Join the Waitlist</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Transform Your Research?
              </h2>
              <p className="text-slate-400 mb-8 text-lg max-w-xl mx-auto">
                Be among the first to experience the future of scientific computing. Join our waitlist for early access.
              </p>
              
              {!waitlistSuccess ? (
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={waitlistEmail}
                    onChange={(e) => { setWaitlistEmail(e.target.value); setWaitlistError(''); }}
                    disabled={waitlistLoading}
                    className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 text-white placeholder:text-slate-500"
                  />
                  <Button 
                    type="submit" 
                    disabled={waitlistLoading}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0 whitespace-nowrap"
                  >
                    {waitlistLoading ? (
                      <>
                        <Icons.Loader2 />
                        Joining...
                      </>
                    ) : (
                      <>
                        Join Waitlist
                        <Icons.ArrowRight />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="max-w-md mx-auto p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Icons.Check />
                  </div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">You're on the list! 🎉</h3>
                  <p className="text-slate-400 text-sm">We'll notify you when SciHub Pro launches. Check your inbox for a confirmation.</p>
                </div>
              )}

              {waitlistError && (
                <p className="text-red-400 text-sm mt-3">{waitlistError}</p>
              )}
              
              {!waitlistSuccess && (
                <p className="text-slate-500 text-xs mt-4">
                  No spam. Unsubscribe anytime. We respect your inbox.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center font-bold text-white">
                  E
                </div>
                <span className="text-xl font-bold">Endeavor Science</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                The GitHub for Scientific Computing. Democratizing discovery worldwide.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                  <Icons.Github />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                  <Icons.Twitter />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors">
                  <Icons.Linkedin />
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Press Kit</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/documentation" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Documentation</Link></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">API Reference</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Community</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Legal / Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Cookie Policy</a></li>
              </ul>
              <h4 className="font-semibold text-white mt-6 mb-4">Contact</h4>
              <a href="mailto:testdemoqwenai2025@gmail.com" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors flex items-center gap-2">
                <Icons.Mail />
                testdemoqwenai2025@gmail.com
              </a>
            </div>
          </div>

          <Separator className="bg-slate-800 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Endeavor Science (AETH-1). All rights reserved.</p>
            <p>Democratizing Scientific Discovery</p>
          </div>
        </div>
      </footer>

      {/* ==================== MODALS ==================== */}

      {/* Demo Video Modal */}
      <Dialog open={showDemoModal} onOpenChange={setShowDemoModal}>
        <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">See SciHub Pro in Action</DialogTitle>
            <DialogDescription className="text-slate-400">
              Watch how researchers are transforming their workflow with our platform
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-teal-900/20" />
            <div className="text-center z-10">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Icons.Play />
              </div>
              <p className="text-white font-medium">Demo Video Coming Soon</p>
              <p className="text-slate-400 text-sm mt-2">Full product walkthrough will be available at launch</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4">
            <p className="text-slate-500 text-sm">Duration: ~5 min • Updated August 2026</p>
            <Button onClick={() => { setShowDemoModal(false); setShowEarlyAccessModal(true); }} className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">
              Get Early Access Instead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Early Access Registration Modal */}
      <Dialog open={showEarlyAccessModal} onOpenChange={setShowEarlyAccessModal}>
        <DialogContent className="sm:max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">🚀 Request Early Access</DialogTitle>
            <DialogDescription className="text-slate-400">
              Join our private beta program and be among the first to experience SciHub Pro
            </DialogDescription>
          </DialogHeader>
          
          {!earlyAccessSuccess ? (
            <form onSubmit={handleEarlyAccessSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="Dr. Jane Smith"
                    value={earlyAccessForm.name}
                    onChange={(e) => setEarlyAccessForm({...earlyAccessForm, name: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="jane@university.edu"
                    value={earlyAccessForm.email}
                    onChange={(e) => setEarlyAccessForm({...earlyAccessForm, email: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Institution/Organization *</label>
                <Input
                  type="text"
                  placeholder="MIT, Stanford, NASA, etc."
                  value={earlyAccessForm.institution}
                  onChange={(e) => setEarlyAccessForm({...earlyAccessForm, institution: e.target.value})}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                  <Select value={earlyAccessForm.role} onValueChange={(value) => setEarlyAccessForm({...earlyAccessForm, role: value})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="pi">Principal Investigator</SelectItem>
                      <SelectItem value="industry">Industry Scientist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Research Field</label>
                  <Input
                    type="text"
                    placeholder="Bioinformatics, Physics, Chemistry..."
                    value={earlyAccessForm.researchField}
                    onChange={(e) => setEarlyAccessForm({...earlyAccessForm, researchField: e.target.value})}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">What excites you most?</label>
                <textarea
                  placeholder="Tell us which feature you're most excited about..."
                  rows={3}
                  value={earlyAccessForm.excitedFeature}
                  onChange={(e) => setEarlyAccessForm({...earlyAccessForm, excitedFeature: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={earlyAccessForm.agreeTerms}
                  onChange={(e) => setEarlyAccessForm({...earlyAccessForm, agreeTerms: e.target.checked})}
                  className="mt-1 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-400">
                  I agree to the <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>, and want to participate in the beta program *
                </label>
              </div>

              {earlyAccessError && (
                <p className="text-red-400 text-sm">{earlyAccessError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEarlyAccessModal(false)} className="border-slate-600 text-slate-300">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={earlyAccessLoading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0"
                >
                  {earlyAccessLoading ? (
                    <>
                      <Icons.Loader2 />
                      Submitting...
                    </>
                  ) : (
                    'Request Early Access'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Icons.Check />
              </div>
              <h3 className="text-2xl font-semibold text-green-400 mb-2">You're In! 🎉</h3>
              <p className="text-slate-400 mb-4">Welcome to the SciHub Pro beta program. We'll be in touch within 48 hours with next steps.</p>
              <Button onClick={() => setShowEarlyAccessModal(false)} variant="outline" className="border-slate-600 text-slate-300">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Investor Portal Modal */}
      <Dialog open={showInvestorModal} onOpenChange={setShowInvestorModal}>
        <DialogContent className="sm:max-w-3xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">💼 Investor Relations</DialogTitle>
            <DialogDescription className="text-slate-400">
              Investment opportunity in the future of scientific computing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">$45B+</div>
                <div className="text-xs text-slate-400">TAM</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">12%</div>
                <div className="text-xs text-slate-400">CAGR</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">10M+</div>
                <div className="text-xs text-slate-400">Addressable Users</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">Y5</div>
                <div className="text-xs text-slate-400">$500M+ ARR Target</div>
              </div>
            </div>

            {/* Team Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Leadership Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'CEO & Founder', background: 'Ex-Google, PhD Machine Learning', focus: 'Product Vision & Strategy' },
                  { name: 'CTO & Co-Founder', background: 'Ex-Meta, Distributed Systems', focus: 'Platform Architecture' },
                  { name: 'VP Engineering', background: 'Ex-Databricks, Infrastructure', focus: 'Scale & Reliability' },
                  { name: 'Head of Science', background: 'Academic Researcher, 50+ Publications', focus: 'Scientific Partnerships' },
                ].map((member, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="font-medium text-white">{member.name}</div>
                    <div className="text-sm text-cyan-400">{member.background}</div>
                    <div className="text-xs text-slate-400 mt-1">{member.focus}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Advantages */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Why SciHub Pro Wins</h3>
              <div className="space-y-2">
                {['First-mover advantage in unified science platform', 'Proprietary AETH-1 orchestration engine', 'Deep domain expertise vs generic tools', 'Viral adoption through academic networks', 'Multi-sided network effects'].map((advantage, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Icons.Check />
                    {advantage}
                  </div>
                ))}
              </div>
            </div>

            {/* Investor Interest Form */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Request Investor Deck</h3>
              <p className="text-sm text-slate-400 mb-4">Leave your contact information and we'll send you our pitch deck and schedule a call.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for your interest! Our investor relations team will contact you within 24 hours.'); setShowInvestorModal(false); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Firm Name *" className="bg-slate-800 border-slate-700 text-white" required />
                  <Input placeholder="Your Role *" className="bg-slate-800 border-slate-700 text-white" required />
                  <Input type="email" placeholder="Work Email *" className="bg-slate-800 border-slate-700 text-white" required />
                  <Input placeholder="Portfolio Companies (optional)" className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <textarea 
                  placeholder="Tell us about your investment thesis..." 
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 resize-none"
                />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowInvestorModal(false)} className="border-slate-600 text-slate-300">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">Request Pitch Deck</Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Signup Modal (for "Start Free" CTA) */}
      <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Start Free Today</DialogTitle>
            <DialogDescription className="text-slate-400">
              Create your free account and start accelerating your research
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <Button 
              variant="outline" 
              className="w-full border-slate-600 text-white hover:bg-slate-800 h-12"
              onClick={() => { alert('Google Sign-In coming soon! For now, use email signup.'); }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-slate-600 text-white hover:bg-slate-800 h-12"
              onClick={() => { alert('GitHub Sign-In coming soon! For now, use email signup.'); }}
            >
              <Icons.Github />
              Continue with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={(e) => { 
              e.preventDefault(); 
              alert('Account created successfully! Welcome to SciHub Pro.'); 
              setShowSignupModal(false);
              router.push('/dashboard');
            }} className="space-y-3">
              <Input type="email" placeholder="Email address" className="bg-slate-800 border-slate-700 text-white" required />
              <Input type="password" placeholder="Create password" className="bg-slate-800 border-slate-700 text-white" required />
              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">
                Create Free Account
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center">
              By signing up, you agree to our <a href="#" className="text-cyan-400 hover:underline">Terms</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pro Trial Modal */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">✨ Start Your 14-Day Pro Trial</DialogTitle>
            <DialogDescription className="text-slate-400">
              Full access to all Pro features — no credit card required
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="bg-gradient-to-r from-cyan-900/30 to-teal-900/30 rounded-lg p-4 border border-cyan-500/20">
              <h4 className="font-semibold text-white mb-2">Pro Trial Includes:</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li className="flex items-center gap-2"><Icons.Check /> Unlimited private projects</li>
                <li className="flex items-center gap-2"><Icons.Check /> 100 hours advanced compute/month</li>
                <li className="flex items-center gap-2"><Icons.Check /> Priority support</li>
                <li className="flex items-center gap-2"><Icons.Check /> AI-powered insights</li>
                <li className="flex items-center gap-2"><Icons.Check /> Team collaboration (up to 10 members)</li>
              </ul>
            </div>

            <form onSubmit={(e) => { 
              e.preventDefault(); 
              alert('Trial activated! You have 14 days of Pro access. Welcome to SciHub Pro!'); 
              setShowTrialModal(false);
              router.push('/dashboard');
            }} className="space-y-3">
              <Input type="text" placeholder="Full Name" className="bg-slate-800 border-slate-700 text-white" required />
              <Input type="email" placeholder="Work Email" className="bg-slate-800 border-slate-700 text-white" required />
              <Input type="text" placeholder="Organization" className="bg-slate-800 border-slate-700 text-white" required />
              <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">
                Start Free Trial
              </Button>
            </form>

            <p className="text-xs text-slate-500 text-center">
              No credit card required • Cancel anytime • $49/user/month after trial
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enterprise Sales Modal */}
      <Dialog open={showEnterpriseModal} onOpenChange={setShowEnterpriseModal}>
        <DialogContent className="sm:max-w-3xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">🏢 Enterprise Inquiry</DialogTitle>
            <DialogDescription className="text-slate-400">
              Let's discuss how SciHub Pro can power your organization's research infrastructure
            </DialogDescription>
          </DialogHeader>
          
          {!enterpriseSuccess ? (
            <form onSubmit={handleEnterpriseSubmit} className="space-y-6 mt-4">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center">1</span>
                  Company Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Company Name *</label>
                    <Input 
                      value={enterpriseForm.company}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, company: e.target.value})}
                      placeholder="Your institution or company"
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Website</label>
                    <Input 
                      value={enterpriseForm.website}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, website: e.target.value})}
                      placeholder="https://yourcompany.com"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Industry</label>
                    <Select value={enterpriseForm.industry} onValueChange={(value) => setEnterpriseForm({...enterpriseForm, industry: value})}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="academic">Academic Institution</SelectItem>
                        <SelectItem value="pharma">Pharmaceutical</SelectItem>
                        <SelectItem value="biotech">Biotechnology</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Country/Region</label>
                    <Input 
                      value={enterpriseForm.country}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, country: e.target.value})}
                      placeholder="United States"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center">2</span>
                  Technical Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Expected Users *</label>
                    <Select value={enterpriseForm.users} onValueChange={(value) => setEnterpriseForm({...enterpriseForm, users: value})}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="1-10">1-10 users</SelectItem>
                        <SelectItem value="11-50">11-50 users</SelectItem>
                        <SelectItem value="51-200">51-200 users</SelectItem>
                        <SelectItem value="201-1000">201-1000 users</SelectItem>
                        <SelectItem value="1000+">1000+ users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Monthly API Calls (est.)</label>
                    <Input 
                      value={enterpriseForm.apiCalls}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, apiCalls: e.target.value})}
                      placeholder="e.g., 100,000"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Storage Needs</label>
                    <Input 
                      value={enterpriseForm.storage}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, storage: e.target.value})}
                      placeholder="e.g., 10TB"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Integrations Needed</label>
                    <Select value={enterpriseForm.integrations} onValueChange={(value) => setEnterpriseForm({...enterpriseForm, integrations: value})}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select options" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="sso">SSO / SAML</SelectItem>
                        <SelectItem value="onprem">On-Premise Deployment</SelectItem>
                        <SelectItem value="hipaa">HIPAA Compliance</SelectItem>
                        <SelectItem value="fedramp">FedRAMP Compliance</SelectItem>
                        <SelectItem value="soc2">SOC 2 Compliance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Decision Maker Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center">3</span>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Your Name *</label>
                    <Input 
                      value={enterpriseForm.contactName}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, contactName: e.target.value})}
                      placeholder="Full name"
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Job Title *</label>
                    <Input 
                      value={enterpriseForm.jobTitle}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, jobTitle: e.target.value})}
                      placeholder="e.g., CTO, VP Engineering"
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Work Email *</label>
                    <Input 
                      type="email"
                      value={enterpriseForm.workEmail}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, workEmail: e.target.value})}
                      placeholder="you@company.com"
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone (optional)</label>
                    <Input 
                      value={enterpriseForm.phone}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center">4</span>
                  Additional Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Timeline for Decision</label>
                    <Select value={enterpriseForm.timeline} onValueChange={(value) => setEnterpriseForm({...enterpriseForm, timeline: value})}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="immediate">Immediate (&lt;1 month)</SelectItem>
                        <SelectItem value="1-3months">1-3 months</SelectItem>
                        <SelectItem value="3-6months">3-6 months</SelectItem>
                        <SelectItem value="exploring">Just exploring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Specific Requirements or Questions</label>
                    <textarea 
                      value={enterpriseForm.notes}
                      onChange={(e) => setEnterpriseForm({...enterpriseForm, notes: e.target.value})}
                      placeholder="Tell us about your specific needs..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder:text-slate-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {enterpriseError && (
                <p className="text-red-400 text-sm">{enterpriseError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEnterpriseModal(false)} className="border-slate-600 text-slate-300">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={enterpriseLoading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white border-0"
                >
                  {enterpriseLoading ? (
                    <>
                      <Icons.Loader2 />
                      Submitting...
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Icons.Check />
              </div>
              <h3 className="text-2xl font-semibold text-green-400 mb-2">Inquiry Received! 🎯</h3>
              <p className="text-slate-400 mb-2">Our enterprise team will contact you within 24 hours.</p>
              <p className="text-slate-500 text-sm mb-4">A confirmation has been sent to {enterpriseForm.workEmail}</p>
              <Button onClick={() => setShowEnterpriseModal(false)} variant="outline" className="border-slate-600 text-slate-300">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
