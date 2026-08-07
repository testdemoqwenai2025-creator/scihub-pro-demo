/**
 * SciHub Pro - Datasets API Route
 * 
 * Dataset management with free tier limits:
 * - Free: 10 datasets, 100MB each, public only
 * - Pro: 100 datasets, 1GB each, private allowed
 * - Enterprise: Unlimited
 */

import { NextRequest, NextResponse } from 'next/server';

// Force static generation for GitHub Pages compatibility
export const dynamic = 'force-static';

// ============================================================================
// TYPES
// ============================================================================

interface Dataset {
  id: string;
  name: string;
  description: string;
  type: 'tabular' | 'text' | 'image' | 'sequence' | 'structure';
  format: 'csv' | 'json' | 'fasta' | 'pdb' | 'xml' | 'excel';
  size: number; // bytes
  records: number;
  source: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  license: string;
  doi?: string;
  requiresUpgrade?: boolean;
}

// In-memory store (use database in production)
const datasets = new Map<string, Dataset>();

// Generate synthetic initial datasets
function initializeDatasets() {
  if (datasets.size > 0) return;

  const initialDatasets: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'COVID-19 Research Papers',
      description: 'Collection of peer-reviewed articles on SARS-CoV-2 from CrossRef and PubMed',
      type: 'tabular',
      format: 'json',
      size: 15728640, // 15MB
      records: 50000,
      source: 'crossref',
      tags: ['covid', 'virology', 'epidemiology'],
      isPublic: true,
      ownerId: 'demo-user',
      license: 'CC-BY-4.0'
    },
    {
      name: 'Protein Structures - Kinase Family',
      description: '3D structures of protein kinases from RCSB PDB for drug discovery research',
      type: 'structure',
      format: 'pdb',
      size: 52428800, // 50MB
      records: 1500,
      source: 'rcsb-pdb',
      tags: ['proteins', 'kinases', 'drug-discovery'],
      isPublic: true,
      ownerId: 'demo-user',
      license: 'CC0-1.0'
    },
    {
      name: 'Gene Expression - Tumor vs Normal',
      description: 'RNA-seq differential expression data from GEO dataset GSE123456',
      type: 'tabular',
      format: 'csv',
      size: 31457280, // 30MB
      records: 25000,
      source: 'geo',
      tags: ['gene-expression', 'cancer', 'transcriptomics'],
      isPublic: true,
      ownerId: 'demo-user',
      license: 'CC-BY'
    },
    {
      name: 'Chemical Compounds - DrugBank Subset',
      description: 'Approved drug molecules from PubChem with properties and bioactivity data',
      type: 'tabular',
      format: 'csv',
      size: 20971520, // 20MB
      records: 8500,
      source: 'pubchem',
      tags: ['drugs', 'compounds', 'pharmacology'],
      isPublic: true,
      ownerId: 'demo-user',
      license: 'Custom'
    }
  ];

  initialDatasets.forEach((ds, i) => {
    const now = new Date().toISOString();
    datasets.set(`ds-${i + 1}`, {
      ...ds,
      id: `ds-${i + 1}`,
      createdAt: now,
      updatedAt: now
    });
  });
}

// Initialize on import
initializeDatasets();

// ============================================================================
// TIER LIMITS
// ============================================================================

const LIMITS = {
  free: { maxDatasets: 10, maxSizePerDataset: 104857600, maxRecordsPerExport: 1000, privateAllowed: false },
  pro: { maxDatasets: 100, maxSizePerDataset: 1073741824, maxRecordsPerExport: 100000, privateAllowed: true },
  enterprise: { maxDatasets: Infinity, maxSizePerDataset: Infinity, maxRecordsPerExport: Infinity, privateAllowed: true }
};

// ============================================================================
// HELPERS
// ============================================================================

function getUserTier(request: NextRequest): 'free' | 'pro' | 'enterprise' {
  // In production, extract from JWT/session
  const tier = request.headers.get('x-user-tier');
  const validTiers: readonly ('free' | 'pro' | 'enterprise')[] = ['free', 'pro', 'enterprise'];
  return (tier && validTiers.includes(tier as 'free' | 'pro' | 'enterprise')) ? tier as 'free' | 'pro' | 'enterprise' : 'free';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================================
// HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userTier = getUserTier(request);
  const userLimits = LIMITS[userTier];

  // Get single dataset
  if (searchParams.has('id')) {
    const id = searchParams.get('id')!;
    const dataset = datasets.get(id);

    if (!dataset) {
      return NextResponse.json({ success: false, error: 'Dataset not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      dataset: {
        ...dataset,
        canEdit: true,
        canDelete: true,
        canExport: true,
        exportLimit: userLimits.maxRecordsPerExport
      }
    });
  }

  // List all datasets
  const search = searchParams.get('search')?.toLowerCase();
  const type = searchParams.get('type') as Dataset['type'] | null;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let allDatasets = Array.from(datasets.values());

  // Apply filters
  if (search) {
    allDatasets = allDatasets.filter(ds => 
      ds.name.toLowerCase().includes(search) ||
      ds.description.toLowerCase().includes(search) ||
      ds.tags.some(t => t.includes(search))
    );
  }

  if (type) {
    allDatasets = allDatasets.filter(ds => ds.type === type);
  }

  // Pagination
  const start = (page - 1) * limit;
  const paginatedDatasets = allDatasets.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    datasets: paginatedDatasets,
    pagination: {
      page,
      limit,
      total: allDatasets.length,
      totalPages: Math.ceil(allDatasets.length / limit)
    },
    usage: {
      currentCount: allDatasets.length,
      maxCount: userLimits.maxDatasets,
      canCreateMore: allDatasets.length < userLimits.maxDatasets
    },
    tier: userTier,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const userTier = getUserTier(request);
    const userLimits = LIMITS[userTier];
    
    const body = await request.json();
    const { name, description, type, format, source, tags, isPublic } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dataset name is required',
        upgradeRequired: false 
      }, { status: 400 });
    }

    // Check limits
    if (datasets.size >= userLimits.maxDatasets) {
      const needsUpgrade = userTier === 'free';
      
      return NextResponse.json({
        success: false,
        error: 'Dataset limit reached',
        currentCount: datasets.size,
        limit: userLimits.maxDatasets,
        needsUpgrade,
        ...(needsUpgrade ? {
          upgradePrompt: {
            message: 'You\'ve reached your free tier limit. Upgrade to create more datasets!',
            currentPlan: 'Free (10 datasets)',
            proPlan: 'Pro (100 datasets)',
            price: '$9.99/month',
            formUrl: '/api/subscription?action=form',
            benefits: [
              'Up to 100 datasets',
              'Private dataset support',
              '1GB per dataset limit',
              'Bulk export (100K+ rows)'
            ]
          }
        } : {})
      }, { status: needsUpgrade ? 402 : 400 }); // Payment Required if upgrade available
    }

    // Check private dataset permission
    if (isPublic === false && !userLimits.privateAllowed) {
      return NextResponse.json({
        success: false,
        error: 'Private datasets require Pro plan or higher',
        needsUpgrade: true,
        upgradePrompt: {
          message: 'Upgrade to create private datasets!',
          formUrl: '/api/subscription?action=form'
        }
      }, { status: 402 });
    }

    // Create dataset
    const id = `ds-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newDataset: Dataset = {
      id,
      name: name.trim(),
      description: description || '',
      type: type || 'tabular',
      format: format || 'csv',
      size: 0,
      records: 0,
      source: source || 'manual',
      tags: tags || [],
      isPublic: isPublic !== false,
      createdAt: now,
      updatedAt: now,
      ownerId: 'demo-user',
      license: 'CC-BY-4.0'
    };

    datasets.set(id, newDataset);

    console.log(`[Dataset] Created: ${id} by ${userTier} user`);

    return NextResponse.json({
      success: true,
      dataset: newDataset,
      message: 'Dataset created successfully',
      usage: {
        currentCount: datasets.size,
        maxCount: userLimits.maxDatasets
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Dataset creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create dataset'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Dataset ID required' }, { status: 400 });
    }

    const existing = datasets.get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Dataset not found' }, { status: 404 });
    }

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    datasets.set(id, updated);

    return NextResponse.json({
      success: true,
      dataset: updated,
      message: 'Dataset updated successfully'
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Dataset ID required' }, { status: 400 });
  }

  const deleted = datasets.delete(id);
  
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Dataset not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Dataset deleted successfully',
    remainingCount: datasets.size
  });
}
