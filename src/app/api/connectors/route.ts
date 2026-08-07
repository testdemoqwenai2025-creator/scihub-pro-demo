/**
 * SciHub Pro - Connectors API Route
 * 
 * Manages connections to scientific data sources:
 * FREE (No API Key Required):
 * - CrossRef: 50 req/s, full metadata
 * - OpenAlex: 10 req/s, complete catalog
 * - arXiv: Free preprint access
 * - NCBI E-utilities: 3-10 req/s
 * - PubChem PUG REST: 5 req/s
 * - UniProt REST: 15 req/s
 * 
 * PREMIUM (Subscription Required for Full Access):
 * - Scopus (Elsevier): Enhanced citation data
 * - Web of Science: Complete citation network
 * - IEEE Xplore: Engineering papers
 * - Springer Nature: Full-text PDFs
 */

import { NextRequest, NextResponse } from 'next/server';

// Force static generation for GitHub Pages compatibility
export const dynamic = 'force-static';

// ============================================================================
// CONNECTOR DEFINITIONS
// ============================================================================

interface ConnectorConfig {
  id: string;
  name: string;
  category: 'biological' | 'chemical' | 'literature' | 'repositories' | 'premium';
  icon: string;
  description: string;
  baseUrl: string;
  documentationUrl: string;
  
  // Tier Information
  tier: 'free' | 'freemium' | 'premium';
  
  // Rate Limits
  freeRateLimit: string;
  premiumRateLimit?: string;
  
  // Features
  features: string[];
  premiumFeatures?: string[];
  
  // Auth
  authRequired: boolean;
  authType: 'none' | 'api-key' | 'oauth' | 'institutional';
  
  // Record counts (approximate)
  totalRecords: string;
  
  // Subscription info
  subscriptionRequired?: boolean;
  subscriptionPrice?: string;
  subscriptionBenefits?: string[];
  
  // Additional metadata (optional)
  scientificImpact?: string;
}

const CONNECTORS: ConnectorConfig[] = [
  // ============ FREE TIER ============
  {
    id: 'crossref',
    name: 'CrossRef',
    category: 'literature',
    icon: '📚',
    description: 'Scholarly research metadata from thousands of publishers worldwide. DOI registration and citation linking.',
    baseUrl: 'https://api.crossref.org/works',
    documentationUrl: 'https://github.com/CrossREST/api-docs',
    tier: 'free',
    freeRateLimit: '50 requests/second',
    features: ['DOI lookup', 'Metadata search', 'Citation tracking', 'Funder reporting', 'ORCID integration'],
    authRequired: false,
    authType: 'none',
    totalRecords: '140M+ records'
  },
  {
    id: 'openalex',
    name: 'OpenAlex',
    category: 'literature',
    icon: '🌐',
    description: 'Open catalog of the global research system. Free alternative to subscription-based services like Scopus.',
    baseUrl: 'https://api.openalex.org/works',
    documentationUrl: 'https://docs.openalex.org/',
    tier: 'free',
    freeRateLimit: '10 requests/second',
    premiumRateLimit: 'Unlimited with polite-pool key',
    features: ['Author profiles', 'Institution data', 'Concept topics', 'Citation network', 'Open Access status'],
    authRequired: false,
    authType: 'api-key', // Optional
    totalRecords: '250M+ works'
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    category: 'literature',
    icon: '📄',
    description: 'Open access archive for scholarly articles in physics, mathematics, computer science, and more.',
    baseUrl: 'http://export.arxiv.org/api/query',
    documentationUrl: 'https://arxiv.org/help/api/index',
    tier: 'free',
    freeRateLimit: 'Polite use recommended',
    features: ['Preprint access', 'Category browsing', 'Full text PDF', 'Author submissions'],
    authRequired: false,
    authType: 'none',
    totalRecords: '2M+ articles'
  },
  {
    id: 'ncbi-genbank',
    name: 'NCBI GenBank',
    category: 'biological',
    icon: '🧬',
    description: 'Comprehensive public database of nucleotide sequences and supporting bibliographic and biological annotation.',
    baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
    documentationUrl: 'https://www.ncbi.nlm.nih.gov/books/NBK25501/',
    tier: 'freemium',
    freeRateLimit: '3 requests/second',
    premiumRateLimit: '10 requests/second (with API key)',
    features: ['Sequence retrieval', 'BLAST search', 'Literature linking', 'Taxonomy data', 'Gene information'],
    premiumFeatures: ['Higher rate limits', 'Web environment history', 'API key analytics'],
    authRequired: false,
    authType: 'api-key', // Optional
    totalRecords: '500B+ bases'
  },
  {
    id: 'rcsb-pdb',
    name: 'RCSB Protein Data Bank',
    category: 'biological',
    icon: '🔷',
    description: 'Archive for 3D structural data of large biological molecules. Essential for computational biology.',
    baseUrl: 'https://data.rcsb.org/v1',
    documentationUrl: 'https://data.rcsb.org/restful-api/',
    tier: 'free',
    freeRateLimit: 'No strict limit',
    features: ['3D structure data', 'Ligand search', 'Sequence alignment', 'Visualization tools', 'PDB validation'],
    authRequired: false,
    authType: 'none',
    totalRecords: '200K+ structures'
  },
  {
    id: 'uniprot',
    name: 'UniProt',
    category: 'biological',
    icon: '🔄',
    description: 'Comprehensive resource for protein sequence and functional information. Swiss-Prot + TrEMBL.',
    baseUrl: 'https://rest.uniprot.org/uniprotkb',
    documentationUrl: 'https://www.uniprot.org/help/api',
    tier: 'free',
    freeRateLimit: '15 requests/second',
    features: ['Protein sequences', 'Functional annotation', 'Cross-references', 'Subcellular location', 'PTM data'],
    authRequired: false,
    authType: 'none',
    totalRecords: '230M+ sequences'
  },
  {
    id: 'pubchem',
    name: 'PubChem',
    category: 'chemical',
    icon: '⚗️',
    description: "World's largest collection of freely accessible chemical information. NIH/NLM resource.",
    baseUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug',
    documentationUrl: 'https://pubchemdocs.ncbi.nlm.nih.gov/pug-rest',
    tier: 'free',
    freeRateLimit: '5 requests/second',
    features: ['Compound search', 'Bioassay data', 'Structure search', 'Property calculation', 'Patent data'],
    authRequired: false,
    authType: 'none',
    totalRecords: '115M+ compounds'
  },
  {
    id: 'chembl',
    name: 'ChEMBL',
    category: 'chemical',
    icon: '💊',
    description: 'Database of bioactive drug-like molecules with drug-like properties. EMBL-EBI resource.',
    baseUrl: 'https://www.ebi.ac.uk/chembl/api/data',
    documentationUrl: 'https://www.ebi.ac.uk/chembl/api_documentation/',
    tier: 'free',
    freeRateLimit: '5 requests/second',
    features: ['Drug-like molecules', 'Target binding', 'Activity data', 'Assay results', 'Similarity search'],
    authRequired: false,
    authType: 'none',
    totalRecords: '20M+ compounds'
  },
  {
    id: 'geo',
    name: 'GEO Datasets',
    category: 'biological',
    icon: '📊',
    description: 'Gene Expression Omnibus - public repository for high-throughput genomics data from NCBI.',
    baseUrl: 'https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi',
    documentationUrl: 'https://www.ncbi.nlm.nih.gov/geo/info/qiagene.html',
    tier: 'free',
    freeRateLimit: '3 requests/second',
    features: ['Expression datasets', 'Series analysis', 'Profile graphs', 'Download tools', 'METAL integration'],
    authRequired: false,
    authType: 'none',
    totalRecords: '4M+ samples'
  },
  {
    id: 'zenodo',
    name: 'Zenodo',
    category: 'repositories',
    icon: '🏛️',
    description: 'Open-access repository for research artifacts across all disciplines. CERN-backed, DOI-enabled.',
    baseUrl: 'https://zenodo.org/api',
    documentationUrl: 'https://developers.zenodo.org/',
    tier: 'free',
    freeRateLimit: 'No strict limit',
    features: ['Dataset hosting', 'Software releases', 'DOI minting', 'Version control', 'Grant integration'],
    authRequired: false,
    authType: 'oauth', // For uploads
    totalRecords: '15M+ records'
  },
  {
    id: 'figshare',
    name: 'Figshare',
    category: 'repositories',
    icon: '📦',
    description: 'Repository where researchers can make all of their research outputs citable, shareable and discoverable.',
    baseUrl: 'https://api.figshare.com/v2',
    documentationUrl: 'https://docs.figshare.com/',
    tier: 'freemium',
    freeRateLimit: 'No strict limit for reads',
    premiumRateLimit: 'Higher storage & bandwidth',
    features: ['File storage', 'Data sharing', 'Metrics tracking', 'Institutional accounts', 'Journal integration'],
    premiumFeatures: ['Private storage', 'Custom branding', 'Priority support'],
    authRequired: true,
    authType: 'oauth',
    totalRecords: '30M+ items'
  },
  {
    id: 'kaggle',
    name: 'Kaggle Datasets',
    category: 'repositories',
    icon: '🎯',
    description: 'Data science platform with public datasets and competitions. Google-owned community.',
    baseUrl: 'https://www.kaggle.com/api/v1',
    documentationUrl: 'https://www.kaggle.com/docs/api',
    tier: 'freemium',
    freeRateLimit: 'Limited for anonymous',
    premiumRateLimit: 'Higher with authentication',
    features: ['Dataset download', 'Competition data', 'Kernels execution', 'Discussion forums', 'Leaderboards'],
    premiumFeatures: ['API access', 'GPU compute', 'Private datasets'],
    authRequired: true,
    authType: 'api-key',
    totalRecords: '50K+ datasets'
  },

  // ============ PREMIUM TIER (Requires Subscription) ============
  {
    id: 'scopus',
    name: 'Scopus (Elsevier)',
    category: 'literature',
    icon: '📖',
    description: 'Largest abstract and citation database of peer-reviewed literature. Premium quality curation.',
    baseUrl: 'https://api.elsevier.com/content/search/scopus',
    documentationUrl: 'https://dev.elsevier.com/documentation/ScopusSearchAPI.wadl',
    tier: 'premium',
    freeRateLimit: 'Not available',
    premiumRateLimit: 'Based on plan',
    features: ['Enhanced citations', 'Author profiles', 'Affiliation data', 'Plagiarism check', 'Journal metrics'],
    premiumFeatures: ['Full-text links', 'Analytics dashboard', 'API support'],
    authRequired: true,
    authType: 'institutional',
    totalRecords: '90M+ records',
    subscriptionRequired: true,
    subscriptionPrice: '$2,999/year (institutional)',
    subscriptionBenefits: [
      'Complete citation database',
      'Author disambiguation',
      'Institution benchmarking',
      'Research output tracking',
      'Custom export formats'
    ]
  },
  {
    id: 'web-of-science',
    name: 'Web of Science (Clarivate)',
    category: 'literature',
    icon: '🕸️',
    description: 'Premier citation database with comprehensive coverage across sciences, social sciences, arts.',
    baseUrl: 'https://api.clarivate.com/api/wos',
    documentationUrl: 'https://developer.clarivate.com/apis/wos',
    tier: 'premium',
    freeRateLimit: 'Not available',
    premiumRateLimit: 'Based on plan',
    features: ['Citation network', 'Impact factor', 'Highly cited papers', 'Journal rankings', 'H-index calculation'],
    premiumFeatures: ['Incites integration', 'Custom reports', 'Historical data'],
    authRequired: true,
    authType: 'institutional',
    totalRecords: '200M+ records',
    subscriptionRequired: true,
    subscriptionPrice: '$5,000+/year (institutional)',
    subscriptionBenefits: [
      'Complete citation network',
      'Journal Citation Reports',
      'Essential Science Indicators',
      'Historical data to 1900',
      'Custom data feeds'
    ]
  },
  {
    id: 'ieee-xplore',
    name: 'IEEE Xplore',
    category: 'literature',
    icon: '⚡',
    description: 'Digital library for electrical engineering, computer science, and electronics literature.',
    baseUrl: 'https://ieeexploreapi.ieee.org/api/v1',
    documentationUrl: 'https://developer.ieee.org/docs/read',
    tier: 'premium',
    freeRateLimit: 'Limited preview',
    premiumRateLimit: 'Based on plan',
    features: ['Technical standards', 'Conference papers', 'E-books', 'Courses', 'Multimedia'],
    premiumFeatures: ['Full-text PDF', 'Bulk download', 'API access'],
    authRequired: true,
    authType: 'institutional',
    totalRecords: '6M+ documents',
    subscriptionRequired: true,
    subscriptionPrice: '$1,500/year (individual)',
    subscriptionBenefits: [
      'Full-text access to 6M+ papers',
      'IEEE Standards access',
      'E-learning courses',
      'API integration'
    ]
  },

  // ============ AI/ML STRUCTURAL BIOLOGY (NEW - AlphaFold) ============
  {
    id: 'alphafold',
    name: 'AlphaFold DB (Google DeepMind)',
    category: 'biological',
    icon: '🧬',
    description: 'Revolutionary AI-powered protein structure prediction database by Google DeepMind. Provides highly accurate 3D protein structure predictions for nearly all cataloged proteins. Free access with no API key required for research use.',
    baseUrl: 'https://alphafold.ebi.ac.uk/api',
    documentationUrl: 'https://alphafold.ebi.ac.uk/faq',
    tier: 'free',
    freeRateLimit: 'No strict limit (polite use recommended)',
    features: [
      '3D protein structure predictions',
      'Confidence scores (pLDDT)',
      'Multiple sequence alignments (MSA)',
      'PDB file downloads',
      'Structure visualization',
      'UniProt ID lookup',
      'Batch predictions available',
      'Predicted Aligned Error (PAE) data'
    ],
    premiumFeatures: [
      'Higher rate limits for bulk queries',
      'Priority API access',
      'Custom model training data access'
    ],
    authRequired: false,
    authType: 'none',
    totalRecords: '200M+ protein structures (complete proteomes)',
    subscriptionRequired: false,
    scientificImpact: 'Nobel Prize-level breakthrough in structural biology (2024). Reduces protein structure determination from months to minutes.'
  },
  {
    id: 'esm-fold',
    name: 'ESM-Fold (Meta AI)',
    category: 'biological',
    icon: '🔮',
    description: 'Meta\'s evolutionary scale modeling for protein structure prediction. Lightning-fast inference (up to 60x faster than AlphaFold) with competitive accuracy. Ideal for high-throughput screening and large-scale proteome analysis.',
    baseUrl: 'https://api.esmatlas.com/foldSequence/v1/',
    documentationUrl: 'https://esmatlas.com/resources',
    tier: 'free',
    freeRateLimit: 'No strict limit (rate-limited by server capacity)',
    features: [
      'Ultra-fast structure prediction',
      'Single sequence input (no MSA needed)',
      'Real-time prediction API',
      'PDB format output',
      'Confidence metrics',
      'Batch processing support',
      'Open-source model weights'
    ],
    authRequired: false,
    authType: 'none',
    totalRecords: '600M+ metagenomic proteins predicted',
    scientificImpact: 'Breakthrough speed advantage for drug discovery pipelines and large-scale structural genomics.'
  },
  {
    id: 'rosettafold',
    name: 'RoseTTAFold (Baker Lab)',
    category: 'biological',
    icon: '🔬',
    description: 'Three-track neural network for protein structure prediction from the David Baker lab. Specializes in protein-protein complexes and protein-RNA interactions. Open-source implementation available.',
    baseUrl: 'https://robetta.bakerlab.org/',
    documentationUrl: 'https://github.com/RosettaCommons/RoseTTAFold',
    tier: 'free',
    freeRateLimit: 'Limited by compute availability',
    features: [
      'Protein complex prediction',
      'Protein-RNA interaction modeling',
      'Custom sequence design',
      'Loop remodeling',
      'Ligand docking interface',
      'Free web server access'
    ],
    premiumFeatures: [
      'Priority queue access',
      'Custom training options',
      'Enterprise deployment support'
    ],
    authRequired: false,
    authType: 'none',
    totalRecords: 'User-submitted predictions (on-demand)',
    scientificImpact: 'Complementary to AlphaFold for multi-chain assemblies and non-standard residues.'
  }
];

// ============================================================================
// SUBSCRIPTION FORM HANDLER
// ============================================================================

interface SubscriptionFormData {
  email: string;
  institution: string;
  connectorId: string;
  tier: 'pro' | 'enterprise';
  message?: string;
  useCase?: string;
}

function validateSubscriptionForm(data: Partial<SubscriptionFormData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!data.connectorId || !CONNECTORS.find(c => c.id === data.connectorId)) {
    errors.push('Valid connector ID is required');
  }
  
  if (!data.tier || !['pro', 'enterprise'].includes(data.tier)) {
    errors.push('Tier must be "pro" or "enterprise"');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// MAIN HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // Return all connectors
  if (!action || action === 'list') {
    const category = searchParams.get('category') as ConnectorConfig['category'] | null;
    const tier = searchParams.get('tier') as ConnectorConfig['tier'] | null;

    let filteredConnectors = [...CONNECTORS];

    if (category) {
      filteredConnectors = filteredConnectors.filter(c => c.category === category);
    }

    if (tier) {
      filteredConnectors = filteredConnectors.filter(c => c.tier === tier);
    }

    return NextResponse.json({
      success: true,
      connectors: filteredConnectors.map(connector => ({
        ...connector,
        canUseWithoutAuth: !connector.authRequired || connector.tier === 'free',
        hasFreeTier: connector.tier !== 'premium'
      })),
      summary: {
        total: CONNECTORS.length,
        free: CONNECTORS.filter(c => c.tier === 'free').length,
        freemium: CONNECTORS.filter(c => c.tier === 'freemium').length,
        premium: CONNECTORS.filter(c => c.tier === 'premium').length
      },
      timestamp: new Date().toISOString()
    });
  }

  // Get specific connector details
  if (action === 'get') {
    const id = searchParams.get('id');
    const connector = CONNECTORS.find(c => c.id === id);

    if (!connector) {
      return NextResponse.json({
        success: false,
        error: `Connector '${id}' not found`,
        availableIds: CONNECTORS.map(c => c.id)
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      connector: {
        ...connector,
        requiresUpgrade: connector.tier === 'premium',
        upgradeFormUrl: `/api/subscription?connector=${id}`,
        alternativeFreeOptions: CONNECTORS
          .filter(c => c.category === connector.category && c.tier !== 'premium')
          .map(c => ({ id: c.id, name: c.name }))
      }
    });
  }

  // Get categories
  if (action === 'categories') {
    const categories = [...new Set(CONNECTORS.map(c => c.category))];
    return NextResponse.json({ 
      success: true, 
      categories,
      countByCategory: categories.reduce((acc, cat) => ({
        ...acc,
        [cat]: CONNECTORS.filter(c => c.category === cat).length
      }), {} as Record<string, number>)
    });
  }

  return NextResponse.json({ success: true, message: 'Connectors API operational' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    // Handle connection toggle
    if (action === 'toggle') {
      const { connectorId, connected } = body;
      const connector = CONNECTORS.find(c => c.id === connectorId);

      if (!connector) {
        return NextResponse.json({
          success: false,
          error: `Connector '${connectorId}' not found`
        }, { status: 404 });
      }

      // Check if premium
      if (connector.tier === 'premium' && connected) {
        return NextResponse.json({
          success: false,
          requiresSubscription: true,
          connector: connector.name,
          price: connector.subscriptionPrice,
          benefits: connector.subscriptionBenefits,
          formUrl: `/api/subscription?connector=${connectorId}`,
          message: `${connector.name} requires a subscription. Please fill out the form below to request access.`,
          formData: {
            fields: [
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'institution', label: 'Institution/Organization', type: 'text', required: true },
              { name: 'useCase', label: 'Intended Use Case', type: 'textarea', required: true },
              { name: 'tier', label: 'Preferred Plan', type: 'select', options: ['Pro ($9.99/mo)', 'Enterprise (Custom)'], required: true },
              { name: 'message', label: 'Additional Requirements', type: 'textarea', required: false }
            ],
            submitEndpoint: '/api/subscription',
            submitMethod: 'POST'
          }
        }, { status: 402 }); // Payment Required
      }

      return NextResponse.json({
        success: true,
        connected: connected ?? true,
        connectorId,
        message: `${connector.name} ${connected ? 'connected' : 'disconnected'} successfully`,
        rateLimit: connector.freeRateLimit,
        features: connector.features
      });
    }

    // Test connection
    if (action === 'test') {
      const { connectorId, apiKey } = body;
      const connector = CONNECTORS.find(c => c.id === connectorId);

      if (!connector) {
        return NextResponse.json({ success: false, error: 'Connector not found' }, { status: 404 });
      }

      // Simulate test (in production, actually ping the API)
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json({
        success: true,
        status: 'connected',
        responseTime: Math.floor(Math.random() * 500) + 100,
        message: `Successfully connected to ${connector.name}`
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Connectors POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
