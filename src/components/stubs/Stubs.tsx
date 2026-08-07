/**
 * SciHub Pro - Stub/Placeholder Components
 * 
 * For features under development:
 * - Building in Progress stubs
 * - 404 / Not Available placeholders
 * - Coming Soon indicators
 * - Feature request prompts
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============ TYPES ============

interface StubProps {
  featureName: string;
  description?: string;
  icon?: string;
  status?: 'building' | 'planned' | 'deprecated' | 'coming-soon' | 'not-available';
  estimatedDate?: string;
  alternativeAction?: {
    label: string;
    onClick: () => void;
  };
  showFeedback?: boolean;
}

// ============ BUILDING IN PROGRESS STUB ============

export function BuildingInProgress({ 
  featureName,
  description = 'This feature is currently under development.',
  estimatedDate = 'Q2 2025',
  showFeedback = true,
}: StubProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
  };

  return (
    <Card className="border-dashed border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/10">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">🏗️</div>
        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Under Construction
        </h3>
        <p className="text-muted-foreground mb-1">{featureName}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mb-4">
          🚧 Building in Progress
        </Badge>
        
        <p className="text-xs text-muted-foreground mb-4">
          Estimated completion: {estimatedDate}
        </p>

        {showFeedback && (
          <div className="max-w-md mx-auto mt-4 p-4 bg-background rounded-lg border">
            {!feedbackSubmitted ? (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <p className="text-sm font-medium">Request early access or provide feedback:</p>
                <textarea
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  placeholder="Tell us how you'd use this feature..."
                  rows={3}
                  required
                />
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  placeholder="Your email (optional)"
                />
                <Button type="submit" size="sm" className="w-full">
                  Submit Feedback
                </Button>
              </form>
            ) : (
              <div className="text-green-600 text-sm">✓ Thank you for your feedback!</div>
            )}
          </div>
        )}

        {showFeedback && !showFeedbackForm && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFeedbackForm(true)}
            className="mt-2"
          >
            Request Early Access
          </Button>
        )}

        {/* Animated construction elements */}
        <div className="mt-6 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-8 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ COMING SOON STUB ============

export function ComingSoon({
  featureName,
  description = 'This exciting feature is coming soon!',
  estimatedDate,
  icon = '🔮',
  alternativeAction,
}: StubProps) {
  const [notifyMe, setNotifyMe] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    // In real app, would save to backend
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <Card className="border-dashed border-2 border-blue-400 bg-blue-50/50 dark:bg-blue-950/10">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Coming Soon
        </h3>
        <p className="text-muted-foreground font-medium mb-1">{featureName}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-4">
          ✨ Coming Soon{estimatedDate ? ` • ${estimatedDate}` : ''}
        </Badge>

        {alternativeAction ? (
          <Button 
            variant="outline" 
            onClick={alternativeAction.onClick}
            className="mt-4 mr-2"
          >
            {alternativeAction.label}
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => setNotifyMe(!notifyMe)}
              className="mt-4"
            >
              🔔 Notify Me When Available
            </Button>

            {notifyMe && (
              <form onSubmit={handleNotify} className="mt-4 max-w-sm mx-auto space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  required
                />
                <Button type="submit" size="sm" className="w-full" disabled={subscribed}>
                  {subscribed ? '✓ Subscribed!' : 'Subscribe'}
                </Button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============ NOT AVAILABLE STUB ============

export function NotAvailable({
  featureName,
  description = 'This feature is not available in your current plan or region.',
  alternativeAction,
}: StubProps) {
  return (
    <Card className="border-dashed border-2 border-gray-400 bg-gray-50/50 dark:bg-gray-900/10">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Not Available
        </h3>
        <p className="text-muted-foreground font-medium mb-1">{featureName}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <Badge variant="secondary" className="mb-4">
          ❌ Currently Unavailable
        </Badge>

        {alternativeAction && (
          <Button 
            variant="outline" 
            onClick={alternativeAction.onClick}
            className="mt-4"
          >
            {alternativeAction.label}
          </Button>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          Contact support for more information
        </p>
      </CardContent>
    </Card>
  );
}

// ============ 404 / NOT FOUND STUB ============

export function NotFound({ featureName }: { featureName?: string }) {
  return (
    <Card className="border-dashed border-2 border-red-400 bg-red-50/50 dark:bg-red-950/10">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
          Not Found
        </h3>
        <p className="text-muted-foreground mb-1">
          {featureName ? `"${featureName}" could not be found.` : 'The requested resource was not found.'}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          It may have been moved, deleted, or you may not have access.
        </p>
        
        <Badge variant="destructive" className="mb-4">
          404 - Resource Not Found
        </Badge>

        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ REQUIRES AUTHENTICATION STUB ============

export function RequiresAuth({ featureName }: { featureName?: string }) {
  return (
    <Card className="border-dashed border-2 border-orange-400 bg-orange-50/50 dark:bg-orange-950/10">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200 mb-2">
          Authentication Required
        </h3>
        <p className="text-muted-foreground mb-1">
          {featureName || 'This feature'} requires authentication to access.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Please log in or create an account to continue.
        </p>
        
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 mb-4">
          🔒 Authentication Required
        </Badge>

        <div className="flex gap-2 justify-center mt-4">
          <Button>Log In</Button>
          <Button variant="outline">Sign Up</Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Demo credentials: demo@scihub.pro / demo123
        </p>
      </CardContent>
    </Card>
  );
}

// ============ REQUIRES PREMIUM STUB ============

export function RequiresPremium({ 
  featureName,
  currentPlan = 'Free',
  requiredPlan = 'Pro',
  benefits = ['Unlimited API calls', 'Priority compute', 'Advanced AI models'],
}: { 
  featureName?: string; 
  currentPlan?: string; 
  requiredPlan?: string; 
  benefits?: string[];
}) {
  return (
    <Card className="border-dashed border-2 border-purple-400 bg-purple-50/50 dark:bg-purple-950/10">
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-4">💎</div>
        <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">
          Premium Feature
        </h3>
        <p className="text-muted-foreground font-medium mb-1">
          {featureName || 'This feature'} requires a {requiredPlan} subscription.
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Current plan: <strong>{currentPlan}</strong>
        </p>
        
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-4">
          ⭐ {requiredPlan} Only
        </Badge>

        <div className="text-left max-w-sm mx-auto mt-4 p-4 bg-background rounded-lg">
          <p className="font-medium text-sm mb-2">Upgrade to unlock:</p>
          <ul className="space-y-1">
            {benefits.map((benefit, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          Upgrade to {requiredPlan} - $29/mo
        </Button>

        <p className="text-xs text-muted-foreground mt-2">
          Free tier includes limited access. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}

// ============ EXTERNAL LINK STUB ============

export function ExternalLink({ 
  url,
  title,
  description,
  isFree = true,
  requiresAuth = false,
}: { 
  url: string; 
  title: string; 
  description?: string; 
  isFree?: boolean; 
  requiresAuth?: boolean;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium group-hover:text-primary transition-colors flex items-center gap-2">
              {title}
              <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </h4>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            
            <div className="flex gap-2 mt-2">
              {isFree && <Badge variant="secondary" className="text-xs">Free</Badge>}
              {requiresAuth && <Badge variant="outline" className="text-xs">Auth Required</Badge>}
            </div>
          </div>
          
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ LOADING SKELETON STUB ============

export function LoadingSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-muted rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// ============ EMPTY STATE STUB ============

export function EmptyState({
  icon = '📭',
  title = 'No data yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
}: { 
  icon?: string; 
  title?: string; 
  description?: string; 
  actionLabel?: string; 
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

// ============ FEATURE GRID (for showing multiple stubs) ============

export function FeatureGrid({ 
  features,
}: { 
  features: Omit<StubProps, 'className'>[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature, index) => {
        switch (feature.status) {
          case 'building':
            return <BuildingInProgress key={index} {...feature} />;
          case 'coming-soon':
            return <ComingSoon key={index} {...feature} />;
          case 'not-available':
            return <NotAvailable key={index} {...feature} />;
          default:
            return <ComingSoon key={index} {...feature} status="coming-soon" />;
        }
      })}
    </div>
  );
}
