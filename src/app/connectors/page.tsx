'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore } from '@/store/useDynamicStore';
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

// ============ CONNECTOR CATEGORIES ============

interface ConnectorCategory {
  value: string;
  label: string;
  icon: string;
}

// ============ CONNECTORS PAGE ============

export default function ConnectorsPage() {
  const { t } = useTranslation();
  const {
    connectors,
    toggleConnector,
    updateConnectorApiKey,
    syncConnector,
    addActivity,
    createDynamicField,
  } = useDynamicStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [configuringConnector, setConfiguringConnector] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Filter sources based on search and category
  const filteredConnectors = connectors.filter(connector => {
    const matchesSearch = connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           connector.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            getConnectorCategory(connector.id) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get category for a connector ID
  function getConnectorCategory(id: string): string {
    if (['ncbi-genbank', 'rcsb-pdb', 'uniprot', 'geo'].includes(id)) return 'biological';
    if (['pubchem', 'chembl'].includes(id)) return 'chemical';
    if (['crossref', 'arxiv', 'openalex'].includes(id)) return 'literature';
    return 'repositories';
  }

  const categories: ConnectorCategory[] = [
    { value: 'all', label: t('connectors.all_sources') || 'All Sources', icon: '🔗' },
    { value: 'biological', label: t('connectors.biological') || 'Biological Sciences', icon: '🧬' },
    { value: 'chemical', label: t('connectors.chemical') || 'Chemical Sciences', icon: '⚗️' },
    { value: 'literature', label: t('connectors.literature') || 'Academic Literature', icon: '📚' },
    { value: 'repositories', label: t('connectors.repositories') || 'Data Repositories', icon: '📦' },
  ];

  // Handle connection toggle
  const handleToggleConnection = async (id: string) => {
    await toggleConnector(id);
  };

  // Handle API key save
  const handleSaveApiKey = (id: string) => {
    updateConnectorApiKey(id, tempApiKey);
    setConfiguringConnector(null);
    setTempApiKey('');
    
    addActivity({
      type: 'update',
      message: createDynamicField(`Updated API key for ${connectors.find(c => c.id === id)?.name}`),
      icon: '🔑',
    });
  };

  // Handle sync all connected connectors
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    
    const connectedIds = connectors
      .filter(c => c.isConnected.value)
      .map(c => c.id);

    for (const id of connectedIds) {
      await syncConnector(id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Stagger requests
    }

    setIsSyncingAll(false);
    addActivity({
      type: 'sync',
      message: createDynamicField(`Synced ${connectedIds.length} connectors`),
      icon: '🔄',
    });
  };

  // Stats calculations
  const totalSources = connectors.length;
  const connectedCount = connectors.filter(c => c.isConnected.value).length;
  const freeTierCount = connectors.length; // All are free tier
  const apiAvailableCount = connectors.filter(c => c.freeTierLimit > 0).length;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('connectors.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('connectors.subtitle')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          🆓 All data sources shown are free-tier. No API keys required for basic access.
          Premium features may require authentication.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder={t('connectors.search_sources') || 'Search data sources...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={handleSyncAll}
          disabled={isSyncingAll || connectedCount === 0}
        >
          {isSyncingAll ? '🔄 Syncing...' : `🔄 Sync All (${connectedCount})`}
        </Button>
      </div>

      {/* Stats Bar - Dynamic */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🔗</span>
            <div>
              <p className="text-sm text-muted-foreground">Total Sources</p>
              <p className="text-xl font-bold">{totalSources}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-sm text-muted-foreground">Connected</p>
              <p className="text-xl font-bold text-green-500">{connectedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">🆓</span>
            <div>
              <p className="text-sm text-muted-foreground">Free Tier</p>
              <p className="text-xl font-bold text-blue-500">{freeTierCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm text-muted-foreground">API Available</p>
              <p className="text-xl font-bold text-purple-500">{apiAvailableCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Grid - Fully Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnectors.map((connector) => (
          <Card key={connector.id} className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
            configuringConnector === connector.id ? 'ring-2 ring-primary' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getConnectorIcon(connector.id)}</span>
                  <div>
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 capitalize">
                      {getConnectorCategory(connector.id)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(connector.syncStatus)}
                  {connector.isConnected.isDirty && (
                    <Badge variant="secondary" className="text-xs animate-pulse">New</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {getConnectorDescription(connector.id)}
              </p>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span>📊</span>
                  <span>{formatRecordCount(connector.recordCount.value)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{connector.freeTierLimit > 0 ? `${connector.freeTierLimit}/s limit` : 'No limit'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🆓</span>
                  <span className="text-green-600">100% Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔌</span>
                  <span>{connector.apiEndpoint.isDirty ? '✏️ Configured' : 'REST API'}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {connector.features.slice(0, 3).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {connector.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{connector.features.length - 3}
                  </Badge>
                )}
              </div>

              {/* API Key Configuration (when expanded) */}
              {configuringConnector === connector.id && (
                <div className="pt-3 border-t space-y-3 bg-muted/30 rounded-lg p-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      API Key ({connector.freeTierLimit > 0 ? 'Optional' : 'Required'})
                    </label>
                    <Input
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder={connector.apiKey.value || 'Enter API key...'}
                      className="mt-1 h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {connector.freeTierLimit > 0 
                        ? `Free tier allows ${connector.freeTierLimit} req/s without key`
                        : 'API key required for access'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">API Endpoint</label>
                    <Input
                      value={connector.apiEndpoint.value}
                      readOnly
                      className="mt-1 h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveApiKey(connector.id)}>
                      Save Configuration
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfiguringConnector(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant={connector.isConnected.value ? 'default' : 'outline'}
                  onClick={() => handleToggleConnection(connector.id)}
                  className="flex-1"
                  disabled={connector.syncStatus === 'syncing'}
                >
                  {connector.syncStatus === 'syncing' 
                    ? '⏳ Connecting...'
                    : connector.isConnected.value 
                      ? `${t('connectors.disconnect')} ✅` 
                      : t('connectors.connect')
                  }
                </Button>
                
                {connector.isConnected.value && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => syncConnector(connector.id)}
                    disabled={connector.syncStatus === 'syncing'}
                  >
                    {connector.syncStatus === 'syncing' ? '🔄' : '🔄'}
                  </Button>
                )}
                
                <Button size="sm" variant="outline" onClick={() => {
                  setConfiguringConnector(configuringConnector === connector.id ? null : connector.id);
                  setTempApiKey(connector.apiKey.value);
                }}>
                  ⚙️
                </Button>

                <Button size="sm" variant="outline" asChild>
                  <a href={getConnectorUrl(connector.id)} target="_blank" rel="noopener noreferrer">
                    {t('connectors.view_docs')}
                  </a>
                </Button>
              </div>

              {/* Last Sync Info */}
              {connector.lastSync && (
                <div className="text-xs text-muted-foreground pt-1 border-t">
                  Last synced: {connector.lastSync.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredConnectors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No data sources found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Free Tier Info Panel */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">🆓 Free Tier Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">CrossRef</h4>
              <p className="text-green-700 dark:text-green-300 text-xs">
                50 req/s • No key needed • Full metadata access
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">OpenAlex</h4>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                10 req/s • Optional key for higher limits • Complete catalog
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">NCBI E-utilities</h4>
              <p className="text-purple-700 dark:text-purple-300 text-xs">
                3 req/s without key • 10 req/s with API key • PubMed/GenBank
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-1">PubChem PUG REST</h4>
              <p className="text-orange-700 dark:text-orange-300 text-xs">
                5 req/s • Compound/bioassay data • Structure search
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">arXiv API</h4>
              <p className="text-red-700 dark:text-red-300 text-xs">
                Unknown limit • Be polite • Preprint access
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800">
              <h4 className="font-medium text-cyan-800 dark:text-cyan-200 mb-1">UniProt REST</h4>
              <p className="text-cyan-700 dark:text-cyan-300 text-xs">
                15 req/s • Protein sequences • Batch retrieval
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> All free tiers provide sufficient access for research purposes. 
            API keys unlock higher rate limits and premium features but are not required for basic functionality.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ HELPER FUNCTIONS ============

function getStatusBadge(status: string) {
  switch (status) {
    case 'success':
      return <Badge className="bg-green-500">Connected</Badge>;
    case 'syncing':
      return <Badge className="bg-yellow-500 animate-pulse">Connecting...</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">Available</Badge>;
  }
}

function getConnectorIcon(id: string): string {
  const icons: Record<string, string> = {
    'ncbi-genbank': '🧬',
    'rcsb-pdb': '🔷',
    'uniprot': '🔄',
    'geo': '📊',
    'pubchem': '⚗️',
    'chembl': '💊',
    'crossref': '📚',
    'arxiv': '📄',
    'openalex': '🌐',
    'zenodo': '🏛️',
    'figshare': '📦',
    'kaggle': '🎯',
  };
  return icons[id] || '🔗';
}

function getConnectorUrl(id: string): string {
  const urls: Record<string, string> = {
    'ncbi-genbank': 'https://www.ncbi.nlm.nih.gov/genbank/',
    'rcsb-pdb': 'https://www.rcsb.org/',
    'uniprot': 'https://www.uniprot.org/',
    'geo': 'https://www.ncbi.nlm.nih.gov/geo/',
    'pubchem': 'https://pubchem.ncbi.nlm.nih.gov/',
    'chembl': 'https://www.ebi.ac.uk/chembl/',
    'crossref': 'https://www.crossref.org/',
    'arxiv': 'https://arxiv.org/',
    'openalex': 'https://openalex.org/',
    'zenodo': 'https://zenodo.org/',
    'figshare': 'https://figshare.com/',
    'kaggle': 'https://www.kaggle.com/datasets',
  };
  return urls[id] || '#';
}

function getConnectorDescription(id: string): string {
  const descriptions: Record<string, string> = {
    'ncbi-genbank': 'Comprehensive public database of nucleotide sequences and supporting bibliographic and biological annotation',
    'rcsb-pdb': 'Protein Data Bank - archive for 3D structural data of large biological molecules',
    'uniprot': 'Comprehensive resource for protein sequence and functional information',
    'geo': 'Gene Expression Omnibus - public repository for high-throughput genomics data',
    'pubchem': "World's largest collection of freely accessible chemical information",
    'chembl': 'Database of bioactive drug-like molecules with drug-like properties',
    'crossref': 'Scholarly research metadata from thousands of publishers worldwide',
    'arxiv': 'Open access archive for scholarly articles in physics, mathematics, CS, and more',
    'openalex': 'Open catalog of the global research system - a free alternative to subscription services',
    'zenodo': 'Open-access repository for research artifacts across all disciplines',
    'figshare': 'Repository where researchers can make all of their research outputs available',
    'kaggle': 'Data science platform with public datasets and competitions',
  };
  return descriptions[id] || 'Scientific data source';
}

function formatRecordCount(count: number): string {
  if (count >= 1000000000) return `${(count / 1000000000).toFixed(1)}B+`;
  if (count >= 1000000) return `${(count / 1000000).toFixed(0)}M+`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K+`;
  return String(count);
}
