'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============ TYPES ============

interface DataSource {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  dataTypes: string[];
  updateFrequency: string;
  isFree: boolean;
  apiAvailable: boolean;
  status: 'connected' | 'available' | 'configuring' | 'error';
  recordCount?: string;
  lastSync?: string;
  features: string[];
}

// ============ DATA SOURCES (with real URLs) ============

const dataSources: DataSource[] = [
  // Biological Sciences
  {
    id: 'ncbi-genbank',
    name: 'NCBI GenBank',
    category: 'biological',
    description: 'Comprehensive public database of nucleotide sequences and supporting bibliographic and biological annotation',
    url: 'https://www.ncbi.nlm.nih.gov/genbank/',
    icon: '🧬',
    color: '#22C55E',
    dataTypes: ['DNA Sequences', 'RNA Sequences', 'Genome Assemblies'],
    updateFrequency: 'Continuous',
    isFree: true,
    apiAvailable: true,
    status: 'available',
    recordCount: '250M+ sequences',
    features: ['BLAST Search', 'Sequence Download', 'Taxonomy Browser'],
  },
  {
    id: 'pdb',
    name: 'RCSB PDB',
    category: 'biological',
    description: 'Protein Data Bank - archive for 3D structural data of large biological molecules',
    url: 'https://www.rcsb.org/',
    icon: '🔷',
    color: '#3B82F6',
    dataTypes: ['Protein Structures', 'NMR Data', 'Cryo-EM Maps'],
    updateFrequency: 'Weekly',
    isFree: true,
    apiAvailable: true,
    status: 'connected',
    recordCount: '200K+ structures',
    features: ['3D Viewer', 'Structure Search', 'Ligand Analysis'],
  },
  {
    id: 'uniprot',
    name: 'UniProt',
    category: 'biological',
    description: 'Comprehensive resource for protein sequence and functional information',
    url: 'https://www.uniprot.org/',
    icon: '🔄',
    color: '#8B5CF6',
    dataTypes: ['Protein Sequences', 'Functional Annotation', 'Pathway Data'],
    updateFrequency: 'Monthly',
    isFree: true,
    apiAvailable: true,
    status: 'connected',
    recordCount: '230M+ proteins',
    features: ['ID Mapping', 'Batch Retrieval', 'BLAST'],
  },
  {
    id: 'geo',
    name: 'NCBI GEO',
    category: 'biological',
    description: 'Gene Expression Omnibus - public repository for high-throughput genomics data',
    url: 'https://www.ncbi.nlm.nih.gov/geo/',
    icon: '📊',
    color: '#F59E0B',
    dataTypes: ['Expression Profiles', 'Microarray Data', 'RNA-Seq'],
    updateFrequency: 'Daily',
    isFree: true,
    apiAvailable: true,
    status: 'available',
    recordCount: '4M+ samples',
    features: ['GEO2R Analysis', 'Dataset Browser', 'Series Matrix'],
  },

  // Chemical Sciences
  {
    id: 'pubchem',
    name: 'PubChem',
    category: 'chemical',
    description: 'World\'s largest collection of freely accessible chemical information',
    url: 'https://pubchem.ncbi.nlm.nih.gov/',
    icon: '⚗️',
    color: '#EF4444',
    dataTypes: ['Chemical Structures', 'Bioassays', 'Properties'],
    updateFrequency: 'Daily',
    isFree: true,
    apiAvailable: true,
    status: 'connected',
    recordCount: '111M+ compounds',
    features: ['PUG REST API', 'Structure Search', 'Biological Testing'],
  },
  {
    id: 'chembl',
    name: 'ChEMBL',
    category: 'chemical',
    description: 'Database of bioactive drug-like molecules with drug-like properties',
    url: 'https://www.ebi.ac.uk/chembl/',
    icon: '💊',
    color: '#06B6D4',
    dataTypes: ['Bioactivity Data', 'Target Binding', 'Drug Indicators'],
    updateFrequency: 'Quarterly',
    isFree: true,
    apiAvailable: true,
    status: 'available',
    recordCount: '2.4M+ compounds',
    features: ['Activity Search', 'Target Profile', 'Similarity'],
  },

  // Academic Literature
  {
    id: 'crossref',
    name: 'CrossRef',
    category: 'literature',
    description: 'Scholarly research metadata from thousands of publishers worldwide',
    url: 'https://www.crossref.org/',
    icon: '📚',
    color: '#6366F1',
    dataTypes: ['Journal Articles', 'Books', 'Conference Papers'],
    updateFrequency: 'Real-time',
    isFree: true,
    apiAvailable: true,
    status: 'connected',
    recordCount: '140M+ records',
    features: ['DOI Resolution', 'Citation Network', 'Metadata Query'],
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    category: 'literature',
    description: 'Open access archive for scholarly articles in physics, mathematics, CS, and more',
    url: 'https://arxiv.org/',
    icon: '📄',
    color: '#B91C1C',
    dataTypes: ['Preprints', 'Technical Reports', 'Reviews'],
    updateFrequency: 'Hourly',
    isFree: true,
    apiAvailable: true,
    status: 'connected',
    recordCount: '2.4M+ papers',
    features: ['Category Browse', 'API Access', 'Full Text PDF'],
  },
  {
    id: 'openalex',
    name: 'OpenAlex',
    category: 'literature',
    description: 'Open catalog of the global research system - a free alternative to subscription services',
    url: 'https://openalex.org/',
    icon: '🌐',
    color: '#059669',
    dataTypes: ['Works', 'Authors', 'Institutions', 'Concepts'],
    updateFrequency: 'Weekly',
    isFree: true,
    apiAvailable: true,
    status: 'available',
    recordCount: '250M+ works',
    features: ['Author Profiles', 'Institution Analytics', 'Topic Modeling'],
  },

  // Data Repositories
  {
    id: 'zenodo',
    name: 'Zenodo',
    category: 'repositories',
    description: 'Open-access repository for research artifacts across all disciplines',
    url: 'https://zenodo.org/',
    icon: '🏛️',
    color: '#0284C7',
    dataTypes: ['Datasets', 'Software', 'Publications'],
    updateFrequency: 'Continuous',
    isFree: true,
    apiAvailable: true,
    status: 'available',
    recordCount: '3M+ records',
    features: ['DOI Minting', 'GitHub Integration', 'Version Control'],
  },
  {
    id: 'figshare',
    name: 'Figshare',
    category: 'repositories',
    description: 'Repository where researchers can make all of their research outputs available',
    url: 'https://figshare.com/',
    icon: '📦',
    color: '#7C3AED',
    dataTypes: ['Datasets', 'Figures', 'Media'],
    updateFrequency: 'Continuous',
    isFree: true,
    apiAvailable: true,
    status: 'available',
    recordCount: '1.5M+ items',
    features: ['File Hosting', 'DOI Assignment', 'Embedding'],
  },
  {
    id: 'kaggle',
    name: 'Kaggle Datasets',
    category: 'repositories',
    description: 'Data science platform with public datasets and competitions',
    url: 'https://www.kaggle.com/datasets',
    icon: '🎯',
    color: '#20BEFF',
    dataTypes: ['Tabular Data', 'Images', 'Text'],
    updateFrequency: 'User-driven',
    isFree: true,
    apiAvailable: true,
    status: 'available',
    recordCount: '50K+ datasets',
    features: ['Kernels', 'Competitions', 'Discussion Forums'],
  },
];

// ============ CONNECTORS PAGE ============

export default function ConnectorsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sources, setSources] = useState<DataSource[]>(dataSources);
  const [isLoading, setIsLoading] = useState(false);

  // Filter sources based on search and category
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle connection status
  const toggleConnection = useCallback((sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, status: source.status === 'connected' ? 'available' : 'connected' as const }
        : source
    ));
  }, []);

  const categories = [
    { value: 'all', label: t('connectors.all_sources') },
    { value: 'biological', label: t('connectors.biological') },
    { value: 'chemical', label: t('connectors.chemical') },
    { value: 'literature', label: t('connectors.literature') },
    { value: 'repositories', label: t('connectors.repositories') },
  ];

  const getStatusBadge = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">{t('connectors.connected')}</Badge>;
      case 'available':
        return <Badge variant="secondary">{t('connectors.available')}</Badge>;
      case 'configuring':
        return <Badge className="bg-yellow-500">{t('connectors.configuring')}</Badge>;
      case 'error':
        return <Badge variant="destructive">{t('connectors.error')}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('connectors.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('connectors.subtitle')}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder={t('connectors.search_sources')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🔗</span>
            <div>
              <p className="text-sm text-muted-foreground">Total Sources</p>
              <p className="text-xl font-bold">{sources.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-xl font-bold text-green-500">
                {sources.filter(s => s.status === 'connected').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🆓</span>
            <div>
              <p className="text-sm text-muted-foreground">Free Tier</p>
              <p className="text-xl font-bold text-blue-500">
                {sources.filter(s => s.isFree).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm text-muted-foreground">API Available</p>
              <p className="text-xl font-bold text-purple-500">
                {sources.filter(s => s.apiAvailable).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map((source) => (
          <Card key={source.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{source.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {source.category.charAt(0).toUpperCase() + source.category.slice(1)}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(source.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {source.description}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>📊</span>
                  <span>{source.recordCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔄</span>
                  <span>{source.updateFrequency}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{source.isFree ? '🆓' : '💰'}</span>
                  <span>{source.isFree ? t('connectors.free_tier') : 'Paid'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔌</span>
                  <span>{source.apiAvailable ? t('connectors.api_available') : 'No API'}</span>
                </div>
              </div>

              {/* Data Types */}
              <div className="flex flex-wrap gap-1">
                {source.dataTypes.slice(0, 3).map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {source.dataTypes.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{source.dataTypes.length - 3}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant={source.status === 'connected' ? 'default' : 'outline'}
                  onClick={() => toggleConnection(source.id)}
                  className="flex-1"
                >
                  {source.status === 'connected' ? t('connectors.disconnect') : t('connectors.connect')}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {t('connectors.view_docs')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSources.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No data sources found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
