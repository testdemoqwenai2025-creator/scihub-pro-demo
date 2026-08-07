'use client';

/**
 * SciHub Pro - Subscription Page
 * 
 * Always-accessible subscription management page.
 * Dynamic form with real-time validation.
 * Shows free vs premium comparison.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogDescription,
  DialogFooter,
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

// ============ TYPES ============

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  ctaText: string;
}

interface FormData {
  email: string;
  name: string;
  institution: string;
  role: string;
  tier: string;
  useCase: string;
  message: string;
  agreeToTerms: boolean;
  newsletterOptIn: boolean;
}

// ============ SUBSCRIPTION TIERS ============

const TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with scientific research',
    icon: '🆓',
    features: [
      '12 Free Scientific APIs (CrossRef, OpenAlex, arXiv, NCBI...)',
      '1,000 API requests per day',
      '20 results per search query',
      '10 datasets storage (100MB each)',
      'Basic search & export features',
      'Community forum support',
      'All core platform features'
    ],
    limitations: [
      'Limited to free data sources only',
      'Rate limits on some APIs',
      'No private datasets',
      'Standard support only'
    ],
    ctaText: 'Current Plan'
  },
  {
    id: 'pro',
    name: 'Pro Researcher',
    price: '$9.99',
    period: '/month',
    description: 'For serious researchers who need more power',
    icon: '⭐',
    popular: true,
    features: [
      'Everything in Free, plus:',
      'Unlimited API requests',
      '1,000+ results per search',
      'Premium connectors (Scopus, Web of Science, IEEE)',
      'Full-text PDF access via Sci-Hub integration',
      'Bulk export (10,000+ results at once)',
      'Citation network analysis tools',
      'AI-powered research recommendations',
      '100 datasets (1GB each), private allowed',
      'Priority email support (24h response)'
    ],
    ctaText: 'Upgrade to Pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise / Institutional',
    price: 'Custom',
    period: 'pricing',
    description: 'For universities, labs, and large teams',
    icon: '🏢',
    features: [
      'Everything in Pro, plus:',
      'Unlimited everything - no limits at all',
      'All premium connectors included',
      'Custom API integrations for your data sources',
      'Dedicated account manager',
      'SLA guarantees (99.9% uptime)',
      'On-premise deployment option available',
      'SSO/SAML authentication integration',
      'Custom training & team onboarding sessions',
      'Quarterly business reviews & usage analytics'
    ],
    ctaText: 'Contact Sales'
  }
];

const ROLES = [
  'Undergraduate Student',
  'Graduate Student (Masters)',
  'Graduate Student (PhD)',
  'Postdoctoral Researcher',
  'Faculty / Professor',
  'Research Scientist',
  'Industry R&D Professional',
  'Data Scientist / Analyst',
  'Librarian / Information Specialist',
  'Science Communicator / Journalist',
  'Other'
];

// ============ MAIN COMPONENT ============

export default function SubscriptionPage() {
  const [selectedTier, setSelectedTier] = useState('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    institution: '',
    role: '',
    tier: 'pro',
    useCase: '',
    message: '',
    agreeToTerms: false,
    newsletterOptIn: true
  });

  // Form validation
  const isFormValid = () => {
    return formData.email.includes('@') &&
           formData.institution.length >= 2 &&
           formData.role !== '' &&
           formData.useCase.length >= 10 &&
           formData.agreeToTerms;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tier: selectedTier,
          connectorId: new URLSearchParams(window.location.search).get('connector') || undefined
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowConfirmDialog(false);
          setSubmitSuccess(false);
          // Reset form
          setFormData({
            email: '', name: '', institution: '', role: '',
            useCase: '', message: '', agreeToTerms: false, newsletterOptIn: true
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTier = TIERS.find(t => t.id === selectedTier);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            ⭐ Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of scientific research with SciHub Pro.
            Start free, upgrade when you need more.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span>🆓 12 Free APIs Included</span>
          <span>•</span>
          <span>⚡ No Credit Card Required</span>
          <span>•</span>
          <span>🔄 Cancel Anytime</span>
        </div>
      </div>

      <Tabs defaultValue="plans" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="plans">📋 View Plans</TabsTrigger>
          <TabsTrigger value="form">📝 Request Access</TabsTrigger>
        </TabsList>

        {/* ====== PLANS TAB ====== */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <Card 
                key={tier.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  tier.popular ? 'border-primary border-2 shadow-lg scale-105' : ''
                } ${selectedTier === tier.id ? 'ring-2 ring-primary' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="text-5xl mb-2">{tier.icon}</div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    
                    {tier.limitations && tier.limitations.length > 0 && (
                      <>
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Limitations:</p>
                          {tier.limitations.map((limit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="text-orange-400 mt-0.5">•</span>
                              <span>{limit}</span>
                            </li>
                          ))}
                        </div>
                      </>
                    )}
                  </ul>
                  
                  <Button 
                    className={`w-full mt-4 ${
                      tier.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                        : tier.id === 'free'
                          ? ''
                          : ''
                    }`}
                    variant={tier.id === 'free' ? 'outline' : 'default'}
                    onClick={() => {
                      setSelectedTier(tier.id);
                      if (tier.id !== 'free') {
                        document.querySelector('[value="form"]')?.setAttribute('data-state', 'active');
                      }
                    }}
                  >
                    {tier.ctaText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>❓ Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { q: 'Can I cancel anytime?', a: 'Yes! Pro plans can be cancelled monthly with no penalties. Enterprise contracts have 30-day notice.' },
                  { q: 'Do you offer student discounts?', a: 'Absolutely! Students get 50% off Pro plans with verified .edu email addresses.' },
                  { q: 'What counts as an API request?', a: 'Each search query, data fetch, or export operation counts as one request against your daily limit.' },
                  { q: 'Is there a free trial?', a: 'Yes! Get 14 days of full Pro access free, no credit card required. Just submit the form!' },
                  { q: 'How do institutional licenses work?', a: 'Enterprise pricing is based on seat count and usage volume. Contact our sales team for a custom quote.' },
                  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and institutional purchase orders for Enterprise.' }
                ].map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="font-medium text-sm">{faq.q}</p>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== FORM TAB ====== */}
        <TabsContent value="form" className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                <div>
                  <CardTitle>Request {currentTier?.name} Access</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get you set up within 24-48 hours.
                  </CardDescription>
                </div>
              </div>
              
              {/* Tier Selector in Form */}
              <div className="flex gap-2 mt-4">
                {TIERS.map(tier => (
                  <Button
                    key={tier.id}
                    variant={selectedTier === tier.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier(tier.id)}
                    className="flex items-center gap-1"
                  >
                    {tier.icon} {tier.name}
                    {tier.popular && <Badge variant="secondary" className="ml-1 text-[10px]">Popular</Badge>}
                  </Button>
                ))}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!submitSuccess ? (
                <>
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="your@institution.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input
                        placeholder="Dr. Jane Smith"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Institution & Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Institution / Organization *</label>
                      <Input
                        placeholder="MIT, Stanford, NIH, Google..."
                        value={formData.institution}
                        onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Role *</label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Use Case */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Intended Use Case *</label>
                    <Textarea
                      placeholder="Describe how you plan to use SciHub Pro in your research... (minimum 10 characters)"
                      value={formData.useCase}
                      onChange={(e) => setFormData({...formData, useCase: e.target.value})}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.useCase.length}/10 minimum characters
                    </p>
                  </div>

                  {/* Additional Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Requirements</label>
                    <Textarea
                      placeholder="Any specific features, integrations, or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={3}
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.newsletterOptIn}
                        onChange={(e) => setFormData({...formData, newsletterOptIn: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Receive weekly research tips & platform updates</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                        className="rounded mt-0.5"
                      />
                      <span className="text-sm">
                        I agree to the{' '}
                        <a href="#" className="underline text-primary">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="underline text-primary">Privacy Policy</a> *
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6"
                    disabled={!isFormValid() || isSubmitting}
                    onClick={() => setShowConfirmDialog(true)}
                  >
                    {isSubmitting ? (
                      <>⏳ Submitting...</>
                    ) : (
                      <>Submit {currentTier?.name} Request →</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you agree to our{' '}
                    <a href="#" className="underline">Privacy Policy</a>. We'll never spam you.
                  </p>
                </>
              ) : (
                /* Success State */
                <div className="py-12 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-semibold text-green-600 mb-2">
                    Request Submitted Successfully!
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    We'll contact you at <strong>{formData.email}</strong> within 24-48 hours
                  </p>
                  <p className="text-sm text-muted-foreground">
                    In the meantime, enjoy full access to our 12 free scientific APIs!
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.href = '/'}
                  >
                    ← Back to Home
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      /* Confirmation Dialog */
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Request</DialogTitle>
            <DialogDescription>
              Please review your information before submitting
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Email:</strong></div><div>{formData.email || '-'}</div>
              <div><strong>Name:</strong></div><div>{formData.name || '-'}</div>
              <div><strong>Institution:</strong></div><div>{formData.institution || '-'}</div>
              <div><strong>Role:</strong></div><div>{formData.role || '-'}</div>
              <div><strong>Plan:</strong></div><div>{currentTier?.name} ({currentTier?.price})</div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <strong>Use Case:</strong>
              <p className="mt-1 text-muted-foreground">{formData.useCase}</p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Edit
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {isSubmitting ? '⏳ Submitting...' : '✓ Confirm & Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
