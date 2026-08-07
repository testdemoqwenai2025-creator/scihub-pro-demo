/**
 * SciHub Pro - Subscription API Route
 * 
 * Handles subscription requests for premium features:
 * - Pro Tier: $9.99/month (individual researchers)
 * - Enterprise Tier: Custom pricing (institutions)
 * 
 * Premium features include:
 * - Full-text PDF access via Sci-Hub integration
 * - Bulk export (10,000+ results)
 * - Premium API connectors (Scopus, Web of Science, IEEE)
 * - Citation network analysis
 * - AI-powered recommendations
 */

import { NextRequest, NextResponse } from 'next/server';

// Force static generation for GitHub Pages compatibility
export const dynamic = 'force-static';

// ============================================================================
// TYPES
// ============================================================================

interface SubscriptionRequest {
  email: string;
  name?: string;
  institution: string;
  role: string;
  tier: 'free' | 'pro' | 'enterprise';
  connectorId?: string; // Which premium feature they want
  useCase: string;
  message?: string;
  agreeToTerms: boolean;
  newsletterOptIn?: boolean;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: 'monthly' | 'yearly' | 'custom';
  targetAudience: string[];
  features: string[];
  limits: {
    apiRequests: string;
    dataExport: string;
    storage: string;
    collaborators: string;
    support: string;
  };
  popular?: boolean;
  ctaText: string;
}

// ============================================================================
// SUBSCRIPTION TIERS
// ============================================================================

const TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '$0',
    period: 'monthly',
    targetAudience: ['Students', 'Hobbyists', 'Evaluation'],
    features: [
      'Access to 12 free scientific APIs',
      '1,000 API requests/day',
      '20 results per query',
      'Basic search & export',
      'Community support'
    ],
    limits: {
      apiRequests: '1,000/day',
      dataExport: '100 results/export',
      storage: '100 MB',
      collaborators: '1 user',
      support: 'Community forum'
    },
    ctaText: 'Current Plan'
  },
  {
    id: 'pro',
    name: 'Pro Researcher',
    price: '$9.99',
    period: 'monthly',
    targetAudience: ['Postgraduates', 'Researchers', 'Data Scientists'],
    popular: true,
    features: [
      'Everything in Free, plus:',
      'Unlimited API requests',
      '1,000 results per query',
      'Premium API connectors (Scopus, WoS)',
      'Full-text PDF access (Sci-Hub)',
      'Bulk export (10,000+ results)',
      'Citation network analysis',
      'AI-powered recommendations',
      'Priority email support',
      'Custom data pipelines'
    ],
    limits: {
      apiRequests: 'Unlimited',
      dataExport: '10,000+/export',
      storage: '10 GB',
      collaborators: '5 users',
      support: 'Priority email (24h)'
    },
    ctaText: 'Upgrade to Pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise/Institutional',
    price: 'Custom',
    period: 'custom',
    targetAudience: ['Universities', 'Research Labs', 'Companies'],
    features: [
      'Everything in Pro, plus:',
      'Unlimited everything',
      'All premium connectors included',
      'Custom API integrations',
      'Dedicated account manager',
      'SLA guarantees (99.9% uptime)',
      'On-premise deployment option',
      'SSO/SAML authentication',
      'Custom training & onboarding',
      'Quarterly business reviews'
    ],
    limits: {
      apiRequests: 'Unlimited + Priority',
      dataExport: 'Unlimited',
      storage: 'Unlimited',
      collaborators: 'Unlimited',
      support: 'Dedicated + Phone'
    },
    ctaText: 'Contact Sales'
  }
];

// ============================================================================
// FORM VALIDATION
// ============================================================================

function validateSubscription(data: Partial<SubscriptionRequest>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }

  if (!data.institution || data.institution.length < 2) {
    errors.push('Institution/Organization name is required');
  }

  if (!data.role) {
    errors.push('Please select your role');
  }

  if (!data.tier || !['pro', 'enterprise'].includes(data.tier)) {
    errors.push('Please select a valid plan (pro or enterprise)');
  }

  if (!data.useCase || data.useCase.length < 10) {
    errors.push('Please describe your use case (at least 10 characters)');
  }

  if (!data.agreeToTerms) {
    errors.push('You must agree to the Terms of Service');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// EMAIL TEMPLATES (for simulation)
// ============================================================================

function generateConfirmationEmail(data: SubscriptionRequest): string {
  const tier = TIERS.find(t => t.id === data.tier)!;
  
  return `
Subject: SciHub Pro ${tier.name} Request Received

Dear ${data.name || 'Researcher'},

Thank you for your interest in SciHub Pro's ${tier.name} plan!

REQUEST SUMMARY:
================
Name: ${data.name || 'Not provided'}
Email: ${data.email}
Institution: ${data.institution}
Role: ${data.role}
Requested Plan: ${tier.name} (${tier.price}/${tier.period})
Connector of Interest: ${data.connectorId || 'General access'}
Use Case: ${data.useCase}

WHAT HAPPENS NEXT:
=================
${data.tier === 'pro' ? `1. You'll receive a payment link within 24 hours
2. Upon payment, your account will be upgraded immediately
3. You'll get a welcome email with Pro feature guides` : `1. Our enterprise team will contact you within 48 hours
2. We'll schedule a demo tailored to your needs
3. Receive custom pricing based on your requirements
4. Dedicated onboarding once contract is signed`}

FREE TIER ACCESS:
================
While you wait, enjoy full access to our free tier:
- 12 scientific APIs (CrossRef, OpenAlex, arXiv, NCBI, etc.)
- 1,000 requests per day
- Basic search and export features

Get started: https://testdemoqwenai2025-creator.github.io/scihub-pro-demo/

If you have any questions, reply to this email or contact us at:
Email: pro@scihub.pro
Support: https://scihub.pro/support

Welcome to SciHub Pro!

Best regards,
The SciHub Pro Team
https://scihub.pro`.trim();
}

// ============================================================================
// MAIN HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Return available tiers
  if (!searchParams.has('action')) {
    return NextResponse.json({
      success: true,
      tiers: TIERS.map(tier => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        period: tier.period,
        targetAudience: tier.targetAudience,
        features: tier.features,
        limits: tier.limits,
        popular: tier.popular,
        ctaText: tier.ctaText
      })),
      currency: 'USD',
      faq: [
        { q: 'Can I cancel anytime?', a: 'Yes! Pro plans can be cancelled monthly. Enterprise contracts have 30-day notice.' },
        { q: 'Do you offer student discounts?', a: 'Yes! Students get 50% off Pro with .edu email verification.' },
        { q: 'What counts as an API request?', a: 'Each search query, data fetch, or export operation counts as one request.' },
        { q: 'Is there a free trial?', a: 'Yes! 14-day free trial of Pro features, no credit card required.' },
        { q: 'How do institutional licenses work?', a: 'Enterprise plans are priced by seat count and usage volume. Contact sales for quote.' }
      ],
      timestamp: new Date().toISOString()
    });
  }

  // Return form schema for specific connector
  if (searchParams.get('action') === 'form') {
    const connectorId = searchParams.get('connector');

    return NextResponse.json({
      success: true,
      formConfig: {
        title: `Request Access to Premium Features`,
        subtitle: connectorId 
          ? `Unlock advanced capabilities for ${connectorId.replace('-', ' ').toUpperCase()}`
          : 'Choose the plan that fits your research needs',
        fields: [
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            placeholder: 'your@institution.edu',
            required: true,
            helpText: 'We\'ll send confirmation here'
          },
          {
            name: 'name',
            label: 'Full Name',
            type: 'text',
            placeholder: 'Dr. Jane Smith',
            required: false
          },
          {
            name: 'institution',
            label: 'Institution/Organization',
            type: 'text',
            placeholder: 'MIT, Stanford, NIH...',
            required: true,
            helpText: 'For institutional licensing, we may contact your admin'
          },
          {
            name: 'role',
            label: 'Your Role',
            type: 'select',
            options: [
              'Undergraduate Student',
              'Graduate Student (Masters)',
              'Graduate Student (PhD)',
              'Postdoctoral Researcher',
              'Faculty/Professor',
              'Research Scientist',
              'Industry R&D',
              'Data Scientist',
              'Librarian',
              'Other'
            ],
            required: true
          },
          {
            name: 'tier',
            label: 'Plan Selection',
            type: 'radio',
            options: TIERS.filter(t => t.id !== 'free').map(t => ({
              value: t.id,
              label: `${t.name} - ${t.price}/${t.period}`,
              description: t.targetAudience.join(', ')
            })),
            required: true
          },
          {
            name: 'useCase',
            label: 'Intended Use Case',
            type: 'textarea',
            placeholder: 'Describe how you plan to use SciHub Pro in your research...',
            required: true,
            minLength: 10,
            helpText: 'This helps us tailor the experience to your needs'
          },
          {
            name: 'connectorId',
            label: 'Specific Connector Needed',
            type: 'hidden',
            value: connectorId || ''
          },
          {
            name: 'message',
            label: 'Additional Requirements (Optional)',
            type: 'textarea',
            placeholder: 'Any specific features, integrations, or questions...',
            required: false
          },
          {
            name: 'newsletterOptIn',
            label: 'Receive research tips & updates (weekly)',
            type: 'checkbox',
            default: true
          },
          {
            name: 'agreeToTerms',
            label: 'I agree to the Terms of Service and Privacy Policy',
            type: 'checkbox',
            required: true
          }
        ],
        submitEndpoint: '/api/subscription',
        submitMethod: 'POST',
        submitLabel: 'Submit Request',
        successMessage: 'Thank you! We\'ll be in touch within 24-48 hours.',
        connectorContext: connectorId ? {
          id: connectorId,
          requiresUpgrade: true,
          alternativeFreeOptions: getFreeAlternatives(connectorId)
        } : null
      }
    });
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  try {
    const data: SubscriptionRequest = await request.json();

    // Validate input
    const validation = validateSubscription(data);
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
        receivedData: {
          email: data.email ? '***@***' : undefined,
          institution: data.institution,
          role: data.role,
          tier: data.tier
        }
      }, 400);
    }

    // Simulate processing (in production: save to DB, send email, etc.)
    console.log(`[Subscription] New ${data.tier} request from ${data.email}`);
    
    // Generate confirmation (simulated)
    const confirmationEmail = generateConfirmationEmail(data);

    // In production, you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Create Stripe checkout session (for Pro)
    // 4. Notify sales team (for Enterprise)

    const tierInfo = TIERS.find(t => t.id === data.tier);

    return NextResponse.json({
      success: true,
      message: 'Subscription request received successfully!',
      requestId: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      nextSteps: data.tier === 'pro' 
        ? [
            'Check your email for payment link',
            'Complete payment to activate Pro features',
            'Start using premium APIs immediately'
          ]
        : [
            'Our enterprise team will contact you within 48 hours',
            'Schedule a personalized demo',
            'Receive custom pricing proposal'
          ],
      summary: {
        requestedPlan: tierInfo?.name,
        price: tierInfo?.price,
        email: data.email,
        institution: data.institution,
        connectorOfInterest: data.connectorId || 'All premium features'
      },
      freeTierAccess: {
        available: true,
        message: 'While you wait, enjoy immediate access to all free-tier features!',
        loginUrl: '/',
        freeFeatures: [
          '12 scientific databases (CrossRef, OpenAlex, arXiv...)',
          '1,000 API requests daily',
          'Basic search & export',
          'Dataset management'
        ]
      },
      timestamp: new Date().toISOString(),
      // For debugging - remove in production!
      _debug: {
        emailSent: confirmationEmail.split('\n')[0]
      }
    });

  } catch (error) {
    console.error('Subscription error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process subscription request',
      message: 'Please try again or contact support@scihub.pro',
      fallback: {
        email: 'support@scihub.pro',
        subject: 'Subscription Request Issue'
      }
    }, 500);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFreeAlternatives(premiumConnectorId: string): Array<{id: string, name: string}> {
  // Map premium connectors to free alternatives
  const alternatives: Record<string, string[]> = {
    'scopus': ['crossref', 'openalex'],
    'web-of-science': ['crossref', 'openalex'],
    'ieee-xplore': ['arxiv', 'openalex']
  };

  const altIds = alternatives[premiumConnectorId] || ['crossref', 'openalex'];
  
  return altIds.map(id => ({
    id,
    name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }));
}
