'use client';

/**
 * SciHub Pro - Main Navigation Bar
 * 
 * Appears on ALL pages with links to every section.
 * Features:
 * - Responsive design (desktop + mobile)
 * - Dropdown menus for organization
 * - Active page highlighting
 * - Quick access to premium features
 * - Subscription CTA always visible
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

// ============ NAVIGATION CONFIGURATION ============

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Landing Page', href: '/', icon: '🏠', description: 'Welcome & overview', badge: 'HOME', badgeVariant: 'outline' },
      { label: 'Dashboard', href: '/dashboard', icon: '📊', description: 'Your command center' },
      { label: 'Subscription', href: '/subscription', icon: '⭐', description: 'Plans & pricing', badge: 'NEW' },
    ]
  },
  {
    label: 'Data & Research',
    items: [
      { label: 'Data Lake', href: '/data', icon: '💾', description: 'Dataset management', badge: '4 datasets' },
      { label: 'Connectors', href: '/connectors', icon: '🔗', description: '12 Free APIs + Premium', badge: 'NEW', badgeVariant: 'default' },
      { label: 'Search', href: '/query', icon: '🔍', description: 'Literature search' },
      { label: 'Knowledge Graph', href: '/knowledge', icon: '🕸️', description: 'Visual exploration' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { label: 'Workspace', href: '/workspace', icon: '💻', description: 'Code editor (Python/SQL/R)' },
      { label: 'Compute', href: '/compute', icon: '⚙️', description: 'Job queue & GPU cluster' },
      { label: 'AETHEL AI', href: '/aethel', icon: '🤖', description: 'AI assistant', badge: 'AI', badgeVariant: 'secondary' },
    ]
  },
  {
    label: 'Team & Settings',
    items: [
      { label: 'Collaboration', href: '/collaboration', icon: '👥', description: 'Team sharing' },
      { label: 'Settings', href: '/settings', icon: '⚙️', description: 'Preferences' },
    ]
  }
];

const PREMIUM_FEATURES = [
  { label: 'Scopus Access', href: '/connectors?tab=premium', icon: '📖' },
  { label: 'Web of Science', href: '/connectors?tab=premium', icon: '🕸️' },
  { label: 'Full-text PDFs', href: '/api/subscription?action=form', icon: '📄' },
];

// ============ MAIN COMPONENT ============

export function MainNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Check if a link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Flatten all nav items for mobile view
  const allNavItems = NAV_SECTIONS.flatMap(section => section.items);

  return (
    <nav 
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${
        scrolled ? 'shadow-md border-border' : 'border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* ====== LOGO ====== */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl transition-transform group-hover:scale-110">🧬</span>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SciHub Pro
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:block -mt-1">
                  Scientific Research Platform
                </span>
              </div>
            </Link>
          </div>

          {/* ====== DESKTOP NAVIGATION ====== */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_SECTIONS.map((section) => (
              <div 
                key={section.label}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(section.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  section.items.some(item => isActive(item.href))
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                  {section.label}
                  <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {activeDropdown === section.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-background border rounded-xl shadow-xl p-2 animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.label}
                    </div>
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="text-lg mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge variant={item.badgeVariant || 'secondary'} className="text-[10px] px-1.5 py-0">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ====== RIGHT SIDE ACTIONS ====== */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-110 active:scale-95"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                <span className="relative w-5 h-5 flex items-center justify-center">
                  {/* Sun icon (shown in dark mode) */}
                  <svg 
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  {/* Moon icon (shown in light mode) */}
                  <svg 
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme !== 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                </span>
              </button>
            )}

            {/* Premium Features Dropdown */}
            <div className="hidden md:flex relative group">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:bg-purple-100 dark:from-purple-950 dark:to-indigo-950 dark:border-purple-800"
              >
                ⭐ Premium
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              {/* Premium Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-72 bg-background border rounded-xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                  ✨ Premium Features
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Unlock advanced capabilities with our Pro plan
                </p>
                
                {PREMIUM_FEATURES.map((feature) => (
                  <Link
                    key={feature.label}
                    href={feature.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <span>{feature.icon}</span>
                    <span>{feature.label}</span>
                  </Link>
                ))}
                
                <div className="border-t mt-3 pt-3">
                  <Link href="/api/subscription?action=form">
                    <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      Upgrade to Pro →
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    $9.99/month • Cancel anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Subscription Button */}
            <Link href="/api/subscription?action=form">
              <Button size="sm" className="hidden sm:flex bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-1.5">
                🚀 Get Started
              </Button>
            </Link>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetTitle className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">🧬</span>
                  <span className="text-xl font-bold">SciHub Pro</span>
                </SheetTitle>

                {/* Mobile Navigation */}
                <div className="space-y-6">
                  {NAV_SECTIONS.map((section) => (
                    <div key={section.label}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                        {section.label}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                              isActive(item.href)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <div className="flex-1">
                              <span className="text-sm">{item.label}</span>
                              {item.badge && (
                                <Badge variant={item.badgeVariant || 'secondary'} className="ml-2 text-[10px]">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {isActive(item.href) && (
                              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Premium Section */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-2">⭐ Upgrade to Pro</h3>
                    <ul className="text-xs space-y-1 text-muted-foreground mb-3">
                      <li>✓ All premium connectors</li>
                      <li>✓ Unlimited API requests</li>
                      <li>✓ Full-text PDF access</li>
                    </ul>
                    <Link href="/api/subscription?action=form" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                        View Plans →
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="bg-green-50 dark:green-950 rounded-lg p-3">
                    <p className="text-xs text-green-800 dark:text-green-200 font-medium">
                      🆓 Currently on FREE tier
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      12 APIs • 1,000 req/day
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ====== ACTIVE PAGE INDICATOR BAR ====== */}
      {pathname !== '/' && (
        <div className="border-t bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground overflow-x-auto">
              <span>📍</span>
              {allNavItems.find(item => isActive(item.href)) && (
                <>
                  <span>You are here:</span>
                  <span className="font-medium text-foreground">
                    {allNavItems.find(item => isActive(item.href))?.icon} {' '}
                    {allNavItems.find(item => isActive(item.href))?.label}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ============ FOOTER COMPONENT ============

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧬</span>
              <span className="text-lg font-bold">SciHub Pro</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Open-source unified scientific computing platform for modern research.
            </p>
            <div className="flex gap-2 mt-4">
              <Badge variant="outline">v2.0.0</Badge>
              <Badge variant="secondary">Free Tier</Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors font-medium text-foreground">🏠 Landing Page</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/data" className="hover:text-foreground transition-colors">Data Lake</Link></li>
              <li><Link href="/workspace" className="hover:text-foreground transition-colors">Workspace</Link></li>
              <li><Link href="/compute" className="hover:text-foreground transition-colors">Compute</Link></li>
            </ul>
          </div>

          {/* Research Tools */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Research</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/query" className="hover:text-foreground transition-colors">Search</Link></li>
              <li><Link href="/connectors" className="hover:text-foreground transition-colors">Connectors</Link></li>
              <li><Link href="/knowledge" className="hover:text-foreground transition-colors">Knowledge Graph</Link></li>
              <li><Link href="/aethel" className="hover:text-foreground transition-colors">AETHEL AI</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/collaboration" className="hover:text-foreground transition-colors">Collaboration</Link></li>
              <li><Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link></li>
              <li><Link href="/subscription" className="hover:text-foreground transition-colors font-medium text-foreground">⭐ Subscription Plans</Link></li>
              <li><a href="https://github.com/testdemoqwenai2025-creator/scihub-pro-demo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 SciHub Pro. Open-source scientific computing platform.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>🆓 12 Free APIs</span>
            <span>•</span>
            <span>⚡ Dynamic Pages</span>
            <span>•</span>
            <span>🔒 Your data, your control</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
