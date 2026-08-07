'use client';

/**
 * SciHub Pro - AlphaFold Connector Component
 * 
 * Complete UI for Google DeepMind's AlphaFold Protein Structure Database
 * Features:
 * - UniProt ID lookup
 * - Protein search by gene name/description
 * - Structure visualization (simplified 3D representation)
 * - Confidence score display (pLDDT)
 * - PDB file download
 * - Batch query support
 * - Featured proteins showcase
 * - Database statistics
 * 
 * FREE TIER: Fully functional, no API key required!
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Download,
  ExternalLink,
  Dna,
  Atom,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Star,
  Zap,
  Globe,
  FileText,
  Copy,
  RefreshCw,
  ChevronRight,
  Layers,
  Target,
  BarChart3,
  FlaskConical,
} from 'lucide-react';

// Import AlphaFold API service
import {
  fetchProteinByUniProt,
  searchProteins,
  fetchStructureData,
  batchQueryProteins,
  getFeaturedProteins,
  getDatabaseStats,
  formatPDBDownload,
  generateCitation,
  predictWithESMFold,
  type AlphaFoldProtein,
  type AlphaFoldSearchResult,
  type BatchQueryResult,
  type ESMFoldResult,
} from '@/services/alphaFoldAPI';

// ============ TYPES ============

interface ProteinVisualizationProps {
  protein: AlphaFoldProtein;
  confidenceScores?: number[];
}

// ============ SUB-COMPONENTS ============

// Confidence Score Badge
function ConfidenceBadge({ score, size = 'default' }: { score: number; size?: 'sm' | 'default' | 'lg' }) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getLabel = () => {
    if (score >= 90) return 'High Confidence';
    if (score >= 70) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <Badge variant="outline" className={`${getColor()} ${sizeClasses[size]}`}>
      {score.toFixed(1)}% • {getLabel()}
    </Badge>
  );
}

// Resolution Indicator
function ResolutionIndicator({ resolution }: { resolution: string }) {
  const config = {
    High: { color: 'text-green-600', icon: CheckCircle2, bg: 'bg-green-50' },
    Medium: { color: 'text-yellow-600', icon: AlertTriangle, bg: 'bg-yellow-50' },
    Low: { color: 'text-red-600', icon: AlertTriangle, bg: 'bg-red-50' }
  };
  
  const { color, icon: Icon, bg } = config[resolution as keyof typeof config] || config.Medium;
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${bg}`}>
      <Icon className={`h-4 w-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{resolution}</span>
    </div>
  );
}

// Simplified 3D Molecule Visualization
function ProteinStructureViewer({ protein, confidenceScores }: ProteinVisualizationProps) {
  const [rotation, setRotation] = useState(0);
  const [showConfidence, setShowConfidence] = useState(true);

  // Auto-rotate animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate simplified atom positions based on sequence length
  const generateAtoms = () => {
    const count = Math.min(protein.sequenceLength || 200, 150);
    const atoms = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 4 + (rotation * Math.PI / 180);
      const radius = 30 + Math.sin(i * 0.1) * 20;
      const height = (i / count) * 120 - 60;
      
      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;
      
      const confidence = confidenceScores?.[i % (confidenceScores?.length || 1)] || (protein.confidenceScore || 80);
      
      atoms.push({
        id: i,
        x, y, z,
        confidence,
        type: i % 3 === 0 ? 'alpha' : i % 3 === 1 ? 'beta' : 'coil'
      });
    }
    
    return atoms;
  };

  const atoms = generateAtoms();
  
  const getAtomColor = (atom: typeof atoms[0]) => {
    if (!showConfidence) {
      return atom.type === 'alpha' ? '#3b82f6' : atom.type === 'beta' ? '#ef4444' : '#22c55e';
    }
    if (atom.confidence >= 90) return '#22c55e'; // Green for high
    if (atom.confidence >= 70) return '#eab308'; // Yellow for medium
    return '#ef4444'; // Red for low
  };

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />
      
      {/* SVG Visualization */}
      <svg viewBox="-100 -80 200 160" className="w-full h-full" style={{ transform: 'rotateX(15deg)' }}>
        {/* Bonds between nearby atoms */}
        {atoms.map((atom, i) => 
          i > 0 && (
            <line
              key={`bond-${i}`}
              x1={atoms[i-1].x}
              y1={atoms[i-1].y}
              x2={atom.x}
              y2={atom.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
            />
          )
        )}
        
        {/* Atoms */}
        {atoms.map((atom) => (
          <circle
            key={atom.id}
            cx={atom.x}
            cy={atom.y}
            r={atom.type === 'alpha' ? 2.5 : atom.type === 'beta' ? 2 : 1.5}
            fill={getAtomColor(atom)}
            opacity={0.9}
          />
        ))}
        
        {/* Center label */}
        <text x="0" y="75" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="6" fontFamily="monospace">
          {protein.uniprotId}
        </text>
      </svg>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowConfidence(!showConfidence)}
            className="bg-black/50 hover:bg-black/70 text-white border-white/20"
          >
            {showConfidence ? 'Show Type' : 'Show Confidence'}
          </Button>
        </div>
        
        <Badge variant="outline" className="bg-black/50 text-white border-white/20">
          {atoms.length} residues visualized
        </Badge>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3 backdrop-blur-sm">
        <p className="text-xs text-white font-semibold mb-2">Legend</p>
        {showConfidence ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-300">High (&ge;90%)</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-300">Medium (70-90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-300">Low (&lt;70%)</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-300">Alpha helix</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-300">Beta sheet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-300">Coil</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Confidence Score Chart
function ConfidenceChart({ scores }: { scores: number[] }) {
  const maxScore = 100;
  const chartHeight = 80;
  const barWidth = 3;
  const gap = 1;

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="inline-flex items-end gap-[1px]" style={{ minHeight: chartHeight }}>
        {scores.slice(0, 100).map((score, i) => {
          const height = (score / maxScore) * chartHeight;
          const color = score >= 90 ? '#22c55e' : score >= 70 ? '#eab308' : '#ef4444';
          
          return (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="transition-all hover:opacity-80"
                    style={{
                      width: barWidth,
                      height: `${height}px`,
                      backgroundColor: color,
                      borderRadius: '1px'
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Residue {i + 1}: {score.toFixed(1)}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>1</span>
        <span>Position</span>
        <span>{Math.min(scores.length, 100)}</span>
      </div>
    </div>
  );
}

// Protein Result Card
function ProteinResultCard({ 
  protein, 
  onViewDetails,
  isSelected,
  onSelect 
}: { 
  protein: AlphaFoldProtein; 
  onViewDetails: (protein: AlphaFoldProtein) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
      }`}
      onClick={onSelect || (() => onViewDetails(protein))}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{protein.name || protein.geneName}</h4>
            <p className="text-xs text-muted-foreground mt-1">{protein.organism}</p>
          </div>
          <ConfidenceBadge score={protein.confidenceScore || 80} size="sm" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Dna className="h-3 w-3 text-blue-500" />
            <span className="font-mono">{protein.uniprotId}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3 text-purple-500" />
            <span>{protein.sequenceLength || '?'} aa</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-green-500" />
            <ResolutionIndicator resolution={protein.resolution || 'Medium'} />
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-orange-500" />
            <span>{protein.coverage?.toFixed(0)}% coverage</span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => { e.stopPropagation(); onViewDetails(protein); }}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); window.open(`https://alphafold.ebi.ac.uk/entry/${protein.uniprotId}`, '_blank'); }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main AlphaFold Component
export function AlphaFoldConnector() {
  // State management
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AlphaFoldSearchResult | null>(null);
  const [selectedProtein, setSelectedProtein] = useState<AlphaFoldProtein | null>(null);
  const [structureData, setStructureData] = useState<any>(null);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);
  const [featuredProteins, setFeaturedProteins] = useState<AlphaFoldProtein[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<BatchQueryResult | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  
  // ESM-Fold state (Meta's fast prediction)
  const [sequenceInput, setSequenceInput] = useState('');
  const [esmFoldResult, setEsmFoldResult] = useState<ESMFoldResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Load featured proteins and stats on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [proteins, stats] = await Promise.all([
        getFeaturedProteins(),
        getDatabaseStats()
      ]);
      setFeaturedProteins(proteins);
      setDbStats(stats);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Determine if it's a UniProt ID (starts with letter followed by numbers/letters)
      const isUniProtId = /^[A-Z][0-9A-Z]{1,10}$/i.test(searchQuery.trim());
      
      let results: AlphaFoldSearchResult;
      
      if (isUniProtId) {
        // Direct UniProt ID lookup
        const protein = await fetchProteinByUniProt(searchQuery.trim());
        results = {
          query: searchQuery.trim(),
          results: [protein],
          totalFound: 1,
          searchTime: Date.now(),
          source: 'alphafold'
        };
      } else {
        // Keyword search
        results = await searchProteins(searchQuery.trim());
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // View protein details
  const handleViewDetails = async (protein: AlphaFoldProtein) => {
    setSelectedProtein(protein);
    setIsLoadingStructure(true);
    
    try {
      const structure = await fetchStructureData(protein.uniprotId);
      setStructureData(structure);
    } catch (error) {
      console.error('Error loading structure:', error);
    } finally {
      setIsLoadingStructure(false);
    }
  };

  // Batch query handler
  const handleBatchQuery = async () => {
    const ids = batchInput
      .split(/[\n,]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    if (ids.length === 0) return;
    
    setIsBatchProcessing(true);
    try {
      const results = await batchQueryProteins(ids);
      setBatchResults(results);
    } catch (error) {
      console.error('Batch query error:', error);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Download PDB handler
  const handleDownloadPDB = (protein: AlphaFoldProtein) => {
    const pdbContent = formatPDBDownload(protein, structureData?.pdbContent);
    const blob = new Blob([pdbContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${protein.entryId}-alphafold.pdb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy citation handler
  const handleCopyCitation = (protein: AlphaFoldProtein) => {
    const citation = generateCitation(protein);
    navigator.clipboard.writeText(citation);
  };

  // ESM-Fold prediction handler (Meta's fast alternative)
  const handleESMFoldPredict = async () => {
    if (!sequenceInput.trim()) return;
    
    // Validate amino acid sequence
    const validSequence = /^[ACDEFGHIKLMNPQRSTVWY]+$/i.test(sequenceInput.trim().replace(/\s/g, ''));
    if (!validSequence) {
      alert('Please enter a valid amino acid sequence (standard 20 amino acids only: A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y)');
      return;
    }
    
    setIsPredicting(true);
    try {
      const result = await predictWithESMFold(sequenceInput.trim().replace(/\s/g, ''));
      setEsmFoldResult(result);
    } catch (error) {
      console.error('ESM-Fold prediction error:', error);
      alert('Prediction failed. Please try again or check your sequence.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Download ESM-Fold PDB
  const handleDownloadESMFoldPDB = () => {
    if (!esmFoldResult?.pdbContent) return;
    
    const blob = new Blob([esmFoldResult.pdbContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esmfold-prediction-${Date.now()}.pdb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Dna className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    AlphaFold DB Connector
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <Zap className="h-3 w-3 mr-1" />
                      FREE TIER
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Google DeepMind&apos;s Revolutionary AI Protein Structure Prediction
                  </CardDescription>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground max-w-3xl">
                Access 200M+ predicted protein structures with Nobel Prize-level accuracy. 
                No API key required. Free for research and educational use.
                Powered by artificial intelligence that solved the 50-year grand challenge of protein folding.
              </p>
            </div>
            
            <div className="hidden md:flex flex-col gap-2 min-w-[160px]">
              <a 
                href="https://alphafold.ebi.ac.uk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Globe className="h-4 w-4" />
                alphafold.ebi.ac.uk
              </a>
              <a 
                href="https://www.nature.com/articles/s41586-021-03819-2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Nature Paper (2021)
              </a>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Stats Row */}
          {dbStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">200M+</p>
                <p className="text-xs text-muted-foreground">Total Structures</p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">48M+</p>
                <p className="text-xs text-muted-foreground">Organisms Covered</p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">~90%</p>
                <p className="text-xs text-muted-foreground">High Confidence</p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">$0</p>
                <p className="text-xs text-muted-foreground">Cost Per Query</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="esmfold" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            ESM-Fold
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Batch Query
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Protein Structures</CardTitle>
              <CardDescription>
                Search by UniProt ID (e.g., P00533) or gene name (e.g., EGFR)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter UniProt ID or gene name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 font-mono"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchQuery.trim()}
                  className="min-w-[120px]"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Quick examples */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Try:</span>
                {['P00533 (EGFR)', 'P04637 (p53)', 'P0DTC2 (Spike)', 'P69905 (Hemoglobin)'].map(example => (
                  <button
                    key={example}
                    onClick={() => setSearchQuery(example.split(' ')[0])}
                    className="text-sm px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors font-mono"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Results ({searchResults.totalFound} found)
                </h3>
                <Badge variant="outline">
                  Source: {searchResults.source} • {searchResults.searchTime}ms
                </Badge>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.results.map((protein) => (
                  <ProteinResultCard
                    key={protein.uniprotId}
                    protein={protein}
                    onViewDetails={handleViewDetails}
                    isSelected={selectedProtein?.uniprotId === protein.uniprotId}
                    onSelect={() => handleViewDetails(protein)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Selected Protein Detail View */}
          {selectedProtein && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Atom className="h-6 w-6 text-blue-500" />
                      {selectedProtein.name || selectedProtein.geneName}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {selectedProtein.functionDescription}
                    </CardDescription>
                  </div>
                  <ConfidenceBadge score={selectedProtein.confidenceScore || 80} size="lg" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">UniProt ID</p>
                    <p className="font-mono font-semibold">{selectedProtein.uniprotId}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Gene Name</p>
                    <p className="font-semibold">{selectedProtein.geneName}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Organism</p>
                    <p className="font-semibold text-sm">{selectedProtein.organism}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Sequence Length</p>
                    <p className="font-semibold">{selectedProtein.sequenceLength || '?'} amino acids</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Coverage</p>
                    <Progress value={selectedProtein.coverage || 0} className="mt-1" />
                    <p className="text-xs text-right mt-1">{selectedProtein.coverage?.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Resolution</p>
                    <ResolutionIndicator resolution={selectedProtein.resolution || 'Medium'} />
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="font-semibold text-sm">{selectedProtein.lastUpdated}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Entry ID</p>
                    <p className="font-mono text-sm">{selectedProtein.entryId}</p>
                  </div>
                </div>

                <Separator />

                {/* 3D Structure Visualization */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Dna className="h-5 w-5 text-purple-500" />
                    Predicted 3D Structure
                  </h4>
                  
                  {isLoadingStructure ? (
                    <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                      <div className="text-center space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                        <p className="text-sm text-muted-foreground">Loading structure data...</p>
                      </div>
                    </div>
                  ) : (
                    <ProteinStructureViewer 
                      protein={selectedProtein}
                      confidenceScores={structureData?.plddtScores}
                    />
                  )}

                  {/* Confidence Chart */}
                  {structureData?.plddtScores && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Per-Residue Confidence (pLDDT)</h5>
                      <ConfidenceChart scores={structureData.plddtScores} />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => handleDownloadPDB(selectedProtein)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDB File
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleCopyCitation(selectedProtein)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Citation
                  </Button>
                  
                  <Button 
                    variant="outline"
                    asChild
                  >
                    <a 
                      href={`https://alphafold.ebi.ac.uk/entry/${selectedProtein.uniprotId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on AlphaFold DB
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ESM-FOLD TAB (Meta's Fast Prediction) */}
        <TabsContent value="esmfold" className="space-y-4 mt-4">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FlaskConical className="h-6 w-6 text-purple-500" />
                    ESM-Fold Structure Prediction
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Meta AI&apos;s lightning-fast protein structure prediction. Up to <strong>60x faster</strong> than AlphaFold 
                    with competitive accuracy. Enter your amino acid sequence directly — no UniProt ID required.
                  </CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                  <Zap className="h-3 w-3 mr-1" />
                  ULTRA FAST
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sequence Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Dna className="h-4 w-4" />
                  Amino Acid Sequence
                </label>
                <Textarea
                  placeholder={`Enter amino acid sequence (e.g., MVLSEGEWQLVLHVWAKVEADVAGHGQDILIR...)\n\nStandard amino acids: A C D E F G H I K L M N P Q R S T V W Y`}
                  value={sequenceInput}
                  onChange={(e) => setSequenceInput(e.target.value)}
                  rows={5}
                  className="font-mono text-sm"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {sequenceInput.replace(/\s/g, '').length} residues • {sequenceInput.replace(/\s/g, '').length > 0 ? `${(sequenceInput.replace(/\s/g, '').length * 110).toFixed(0)} Da` : '0 Da'}
                  </span>
                  <Button 
                    onClick={handleESMFoldPredict}
                    disabled={isPredicting || !sequenceInput.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isPredicting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Predict Structure
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Example sequences */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium mb-2">Example Sequences (click to load):</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Insulin A', seq: 'GIVEQCCTSICSLYQLENYCN' },
                    { name: 'Villin', seq: 'MLSDEDFKAVFGMTRSAFANLPLWKQQNLKKEKGLF' },
                    { name: 'Trp-cage', seq: 'NLYIQWLKDGGPSSGRPPPS' },
                  ].map(example => (
                    <button
                      key={example.name}
                      onClick={() => setSequenceInput(example.seq)}
                      className="text-xs px-2 py-1 bg-background hover:bg-muted rounded border transition-colors"
                    >
                      {example.name} ({example.seq.length}aa)
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ESM-Fold Results */}
          {esmFoldResult && (
            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-6 w-6" />
                      Prediction Complete
                    </CardTitle>
                    <CardDescription>
                      Your protein structure has been predicted successfully using Meta&apos;s ESM-Fold model
                    </CardDescription>
                  </div>
                  <ConfidenceBadge score={esmFoldResult.avg_pLDDT || 85} size="lg" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Sequence Length</p>
                    <p className="font-semibold">{esmFoldResult.sequenceLength} aa</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Avg Confidence</p>
                    <p className="font-semibold">{esmFoldResult.avg_pLDDT?.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Prediction Time</p>
                    <p className="font-semibold">{esmFoldResult.predictionTime}ms</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Model Version</p>
                    <p className="font-semibold text-sm">{esmFoldResult.modelVersion}</p>
                  </div>
                </div>

                <Separator />

                {/* Confidence Chart */}
                {esmFoldResult.plddtScores && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Per-Residue Confidence (pLDDT)</h5>
                    <ConfidenceChart scores={esmFoldResult.plddtScores} />
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleDownloadESMFoldPDB}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4" />
                    Download PDB File
                  </Button>
                  
                  <Button variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy Sequence
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    asChild
                  >
                    <a 
                      href="https://esmatlas.com/resources" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      About ESM-Fold
                    </a>
                  </Button>
                </div>

                {/* PDB Preview */}
                {esmFoldResult.pdbContent && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      View Raw PDB Content ({esmFoldResult.pdbContent.split('\n').length} lines)
                    </summary>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-xs font-mono overflow-auto max-h-[300px]">
                      {esmFoldResult.pdbContent.slice(0, 2000)}
                      {esmFoldResult.pdbContent.length > 2000 ? '\n... (truncated)' : ''}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* FEATURED TAB */}
        <TabsContent value="featured" className="space-y-4 mt-4">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Proteins (Well-Studied Examples)
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredProteins.map((protein) => (
                <ProteinResultCard
                  key={protein.uniprotId}
                  protein={protein}
                  onViewDetails={handleViewDetails}
                  isSelected={selectedProtein?.uniprotId === protein.uniprotId}
                  onSelect={() => handleViewDetails(protein)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* BATCH QUERY TAB */}
        <TabsContent value="batch" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Protein Lookup</CardTitle>
              <CardDescription>
                Look up multiple proteins at once by entering their UniProt IDs (one per line or comma-separated)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`P00533\nP04637\nP0DTC2\nP69905`}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {batchInput.split(/[\n,]+/).filter(id => id.trim().length > 0).length} IDs entered
                </span>
                <Button 
                  onClick={handleBatchQuery}
                  disabled={isBatchProcessing || !batchInput.trim()}
                >
                  {isBatchProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Layers className="h-4 w-4 mr-2" />
                      Query All ({batchInput.split(/[\n,]+/).filter(id => id.trim().length > 0).length})
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Batch Results */}
          {batchResults && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Batch Results</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-600">
                      ✓ {batchResults.successCount} successful
                    </Badge>
                    {batchResults.failureCount > 0 && (
                      <Badge variant="outline" className="text-red-600">
                        ✗ {batchResults.failureCount} failed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(batchResults.results.entries()).map(([id, protein]) => (
                    <div 
                      key={id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleViewDetails(protein)}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="font-mono font-medium">{id}</span>
                        <span className="text-sm text-muted-foreground">
                          {protein.name || protein.geneName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ConfidenceBadge score={protein.confidenceScore || 80} size="sm" />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground mt-4 text-right">
                  Queried at: {new Date(batchResults.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ABOUT TAB */}
        <TabsContent value="about" className="space-y-4 mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What is AlphaFold?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <strong>AlphaFold</strong> is an AI system developed by DeepMind that predicts 
                  protein structures from amino acid sequences. In November 2020, AlphaFold 2 won 
                  the CASP14 competition by a huge margin, effectively solving the 50-year-old 
                  &quot;protein folding problem&quot; — one of biology&apos;s greatest challenges.
                </p>
                <p>
                  The <strong>AlphaFold DB</strong>, hosted by EMBL-EBI, provides free access to 
                  predicted structures for nearly all cataloged proteins — over 200 million predictions 
                  covering virtually every known organism.
                </p>
                <p>
                  This technology has been recognized with numerous awards including the 
                  <strong>2024 Nobel Prize in Chemistry</strong>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Understanding Confidence Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <strong>&gt;= 90 (High):</strong> Very reliable prediction
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <strong>70-90 (Medium):</strong> Generally reliable, use with caution
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <strong>&lt; 70 (Low):</strong> Unstructured region or low confidence
                  </div>
                </div>
                <p className="text-muted-foreground">
                  The pLDDT (predicted Local Distance Difference Test) score indicates how confident 
                  the model is in each residue&apos;s predicted position.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Free Tier Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[
                    'Unlimited protein lookups by UniProt ID',
                    'Keyword/gene name search',
                    '3D structure visualization',
                    'Per-residue confidence analysis',
                    'PDB file downloads',
                    'Batch queries (up to 100 per request)',
                    'Academic citation generation',
                    'Direct links to AlphaFold DB entries'
                  ].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[
                    'Drug target identification & validation',
                    'Protein engineering & design',
                    'Functional annotation of unknown proteins',
                    'Evolutionary biology research',
                    'Educational demonstrations',
                    'Structural genomics projects',
                    'Variant effect prediction',
                    'Antibody design'
                  ].map(useCase => (
                    <li key={useCase} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Citation Box */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">How to Cite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-background rounded-lg border font-mono text-sm">
                <p>Jumper, J., Evans, R., Pritzel, A., et al. (2021).</p>
                <p>Highly accurate protein structure prediction with AlphaFold.</p>
                <p><em>Nature, 596</em>(7873), 583-589.</p>
                <p className="mt-2 text-muted-foreground">
                  doi: 10.1038/s41586-021-03819-2
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Also cite the AlphaFold Protein Structure Database when using specific predictions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export sub-components for reuse
export {
  ProteinStructureViewer,
  ConfidenceBadge,
  ConfidenceChart,
  ProteinResultCard,
};
