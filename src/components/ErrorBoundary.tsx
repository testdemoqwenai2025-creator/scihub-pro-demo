/**
 * SciHub Pro - Error Boundary Component
 * 
 * Catches React rendering errors gracefully and provides:
 * - User-friendly error display
 * - Recovery options
 * - Error reporting (optional)
 * - Never shows a blank/broken screen
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, would send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state
    this.setState({ error, errorInfo });

    // Call optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReset = () => {
    // Clear local storage and reload
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="w-full max-w-lg border-destructive/20 bg-destructive/5">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-3">🚨</div>
              <CardTitle className="text-xl text-destructive">
                Something Went Wrong
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                We encountered an unexpected error. Don&apos;t worry — your work is safe!
                Choose an option below to continue.
              </p>

              {/* Error Details (for development) */}
              {(this.props.showErrorDetails ?? process.env.NODE_ENV === 'development') && (
                <div className="p-4 bg-muted rounded-lg text-left">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      Technical Details
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-background rounded border max-h-40">
                      <code>{this.state.error?.toString()}</code>
                      {this.state.errorInfo?.componentStack && (
                        <code className="block mt-2 text-gray-500 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </code>
                      )}
                    </pre>
                  </details>
                </div>
              )}

              {/* Recovery Options */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button onClick={this.handleRetry} variant="default" className="flex-1">
                  🔄 Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReset} 
                  variant="outline" 
                  className="flex-1"
                >
                  ↩️ Reset Page
                </Button>
              </div>

              {/* Help Text */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Still having issues? Here are some suggestions:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Contact support with the error details above</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>

              {/* Alternative Actions */}
              <div className="pt-4 grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="/">← Go Home</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard">→ Dashboard</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/help">Help Center</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/settings">Settings</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// HIGHER-ORDER COMPONENT FOR CLASSIC COMPONENTS
// ============================================================================

interface WithErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WithErrorBoundary({ children, fallback }: WithErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// ============================================================================
// LOADING BOUNDARY (shows loading state instead of errors)
// ============================================================================

interface LoadingFallbackProps {
  message?: string;
  showSpinner?: boolean;
}

export function LoadingFallback({ 
  message = 'Loading...', 
  showSpinner = true 
}: LoadingFallbackProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="py-8 text-center space-y-4">
          {showSpinner && (
            <div className="flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">{message}</p>
          
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>If this takes too long:</p>
            <ul className="list-disc list-inside">
              <li>Check your connection</li>
              <li>Refresh the page</li>
              <li>Try again later</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// EMPTY STATE COMPONENT (for when data is missing)
// ============================================================================

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  suggestions?: string[];
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  suggestions = [],
}: EmptyStateProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-4">
          <span className="text-5xl block">{icon}</span>
          
          <h3 className="text-lg font-semibold">{title}</h3>
          
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}

          {/* Action Buttons */}
          {(actionLabel || secondaryActionLabel) && (
            <div className="flex justify-center gap-3 pt-2">
              {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <Button variant="outline" onClick={onSecondaryAction}>
                  {secondaryActionLabel}
                </Button>
              )}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Suggestions:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="ghost"
                    className="text-xs h-auto py-1 px-2"
                    onClick={() => {
                      // In a real app, would navigate or trigger action
                      console.log('Suggestion clicked:', suggestion);
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// RATE LIMIT / QUOTA EXCEEDED COMPONENT
// ============================================================================

interface RateLimitExceededProps {
  type: 'api' | 'storage' | 'compute' | 'ai_tokens';
  resetTime?: Date;
  limit?: number;
  currentUsage?: number;
  onUpgrade?: () => void;
}

export function RateLimitExceeded({
  type,
  resetTime,
  limit = 100,
  currentUsage = 100,
  onUpgrade,
}: RateLimitExceededProps) {
  const typeConfig = {
    api: {
      icon: '⏱️',
      title: 'API Rate Limit Reached',
      description: 'You\'ve made too many requests. Please wait before trying again.',
      unit: 'requests',
    },
    storage: {
      icon: '💾',
      title: 'Storage Limit Reached',
      description: 'You\'ve used all available storage. Upgrade for more space.',
      unit: 'MB',
    },
    compute: {
      icon: '⚡',
      title: 'Compute Quota Exceeded',
      description: 'You\'ve used all your compute credits for this period.',
      unit: 'credits',
    },
    ai_tokens: {
      icon: '🤖',
      title: 'AI Token Limit Reached',
      description: 'You\'ve used all your AI assistant tokens for today.',
      unit: 'tokens',
    },
  };

  const config = typeConfig[type];

  return (
    <div className="min-h-[200px] flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/30">
        <CardContent className="py-8 text-center space-y-4">
          <span className="text-5xl block">{config.icon}</span>
          
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            {config.title}
          </h3>
          
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {config.description}
          </p>

          {/* Usage Bar */}
          <div className="px-4">
            <div className="flex justify-between text-xs text-yellow-600 dark:text-yellow-400 mb-1">
              <span>{currentUsage} / {limit} {config.unit}</span>
              <span>{Math.round((currentUsage / limit) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-yellow-200 dark:bg-yellow-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 dark:bg-yellow-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentUsage / limit) * 100)}%` }}
              />
            </div>
          </div>

          {/* Reset Time */}
          {resetTime && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Resets at: {resetTime.toLocaleTimeString()}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-4">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              🔄 Try Later
            </Button>
            {onUpgrade && (
              <Button size="sm" onClick={onUpgrade}>
                ⬆️ Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// OFFLINE DETECTION COMPONENT
// ============================================================================

export function OfflineDetector({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md border-orange-200 dark:border-orange-800">
          <CardContent className="py-12 text-center space-y-4">
            <span className="text-5xl block">📡</span>
            
            <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200">
              You&apos;re Offline
            </h3>
            
            <p className="text-orange-700 dark:text-orange-300">
              It looks like you&apos;ve lost your internet connection.
              Some features may not be available until you reconnect.
            </p>

            <div className="bg-orange-50 dark:bg-orange-950/50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-sm text-orange-800 dark:text-orange-200 mb-2">
                What you can do offline:
              </h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1 list-disc list-inside">
                <li>View cached data and previously loaded pages</li>
                <li>Edit documents in workspace (auto-saves when back online)</li>
                <li>Browse downloaded datasets</li>
                <li>Review saved queries and results</li>
              </ul>
            </div>

            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              🔄 Reconnect
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Export all components
export default ErrorBoundary;
