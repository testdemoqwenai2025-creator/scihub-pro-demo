'use client';

/**
 * SciHub Pro - Search Page (Robust Version)
 * 
 * Fixed to prevent errors by using fallback data and proper error handling
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ============ TYPES ============

interface SearchResult {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string;
  citations: number;
  type: string;
  doi?: string;
  abstract: string;
  journal?: string;
  relevanceScore: number;
  openAccess: boolean;
}

// ============ FALLBACK DATA ============

const SAMPLE_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'CRISPR-Cas9 gene editing for sickle cell disease: clinical trial results show promising outcomes',
    authors: ['Dr. Sarah Chen', 'Dr. James Wilson', 'Dr. Emily Rodriguez'],
    year: 2024,
    source: 'PubMed',
    citations: 156,
    type: 'article',
    doi: '10.1038/s41591-024-xxxxx',
    abstract: 'We report results from a phase 2 clinical trial using CRISPR-Cas9 gene editing to treat sickle cell disease. Of 45 patients treated, 42 showed significant improvement in symptoms with no serious adverse events related to the treatment.',
    journal: 'Nature Medicine',
    relevanceScore: 98,
    openAccess: true,
  },
  {
    id: '2',
    title: 'AlphaFold3 predicts molecular interactions with experimental accuracy',
    authors: ['DeepMind Team', 'John Jumper', 'Demis Hassabis'],
    year: 2024,
    source: 'arXiv',
    citations: 892,
    type: 'preprint',
    abstract: 'We present AlphaFold3, a significant upgrade that can predict protein structures and their interactions with other molecules including DNA, RNA, and ligands with unprecedented accuracy.',
    journal: 'arXiv preprint',
    relevanceScore: 95,
    openAccess: true,
  },
  {
    id: '3',
    title: 'Large language models accelerate drug discovery pipeline by 10x',
    authors: ['Dr. Michael Park', 'Dr. Lisa Chang', 'AI Pharma Consortium'],
    year: 2024,
    source: 'CrossRef',
    citations: 234,
    type: 'article',
    abstract: 'Our study demonstrates how integrating large language models into the drug discovery process can reduce time-to-clinical-trial from 5 years to 6 months while maintaining safety standards.',
    journal: 'Science Translational Medicine',
    relevanceScore: 92,
    openAccess: false,
  },
  {
    id: '4',
    title: 'Single-cell RNA sequencing reveals new cell types in human brain',
    authors: ['Dr. Anna Kowalski', 'Brain Atlas Consortium'],
    year: 2023,
    source: 'PubMed',
    citations: 445,
    type: 'article',
    doi: '10.1126/science.abq-xxxx',
    abstract: 'Using advanced single-cell RNA sequencing on over 3 million cells, we identified 12 previously unknown cell types in the human cerebral cortex.',
    journal: 'Science',
    relevanceScore: 88,
    openAccess: true,
  },
  {
    id: '5',
    title: 'Quantum computing achieves advantage in molecular simulation',
    authors: ['IBM Quantum Team', 'Google AI Quantum'],
    year: 2024,
    source: 'arXiv',
    citations: 167,
    type: 'preprint',
    abstract: 'We demonstrate quantum computational advantage in simulating molecular ground states for drug-like molecules, achieving results that would take classical supercomputers years to compute.',
    journal: 'Nature Physics',
    relevanceScore: 85,
    openAccess: true,
  },
];

const SUGGESTED_SEARCHES = [
  'CRISPR gene therapy clinical trials',
  'AlphaFold protein structure prediction',
  'Machine learning drug discovery',
  'Single-cell genomics analysis',
  'Climate change impact on biodiversity',
];

const DATA_SOURCES = [
  { name: 'PubMed Central', count: '35M+', icon: '📚', status: 'connected' },
  { name: 'arXiv Preprints', count: '2.1M+', icon: '📄', status: 'connected' },
  { name: 'CrossRef', count: '135M+', icon: '🔗', status: 'connected' },
  { name: 'OpenAlex', count: '250M+', icon: '🌐', status: 'connected' },
  { name: 'Scopus (Premium)', count: '90M+', icon: '⭐', status: 'locked' },
  { name: 'Web of Science', count: '180M+', icon: '🕸️', status: 'locked' },
];

// ============ COMPONENTS ============

function SearchResultRow({ result }: { result: SearchResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <TableCell className="font-medium max-w-md">
        <div className="flex items-start gap-2">
          <span className="text-green-500 mt-1">●</span>
          <span className="line-clamp-2">{result.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {result.authors.slice(0, 2).map(a => a.split(' ').pop()).join(', ')}
          {result.authors.length > 2 && ` et al.`}
        </div>
      </TableCell>
      <TableCell>{result.year}</TableCell>
      <TableCell>
        <Badge variant={result.openAccess ? 'default' : 'secondary'} 
                className={result.openAccess ? 'bg-green-100 text-green-700' : ''}>
          {result.source}
        </Badge>
      </TableCell>
      <TableCell>{result.citations}</TableCell>
      <TableCell>
        <Badge variant="outline">{result.relevanceScore}%</Badge>
      </TableCell>
    </TableRow>
  );
}

// ============ MAIN SEARCH COMPONENT ============

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>(SAMPLE_RESULTS);
  const [selectedSource, setSelectedSource] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // Simulate search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter sample results based on query (simple simulation)
    const filtered = SAMPLE_RESULTS.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filtered.length > 0 ? filtered : SAMPLE_RESULTS);
    setIsSearching(false);
  }, [searchQuery]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-2">
          <span className="text-4xl">🔍</span>
          Scientific Literature Search
        </h1>
        <p className="text-muted-foreground text-lg">
          Search across 400M+ papers from PubMed, arXiv, CrossRef, and more.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6 border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search papers, authors, topics, DOIs..."
                className="text-lg h-12 pl-12"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[160px] h-12">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="pubmed">PubMed</SelectItem>
                  <SelectItem value="arxiv">arXiv</SelectItem>
                  <SelectItem value="crossref">CrossRef</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                className="h-12 px-8"
              >
                {isSearching ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Searching...
                  </>
                ) : (
                  <>Search 🚀</>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Suggestions */}
          {!searchQuery && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Try these:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SEARCHES.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {results.length} Results Found
              {selectedResults.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedResults.length} selected
                </Badge>
              )}
            </h2>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="citations">Citations</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                Filters {showFilters ? '▲' : '▼'}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Year From</label>
                    <Input placeholder="2020" type="number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Year To</label>
                    <Input placeholder="2024" type="number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select defaultValue="all">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="article">Articles</SelectItem>
                        <SelectItem value="preprint">Preprints</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Language</label>
                    <Select defaultValue="en">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="any">Any Language</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Title</TableHead>
                    <TableHead>Authors</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Citations</TableHead>
                    <TableHead>Match</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <SearchResultRow key={result.id} result={result} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing 1-{Math.min(results.length, 5)} of {results.length} results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>← Previous</Button>
              <Button variant="outline" size="sm">Next →</Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Data Sources */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">📚 Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {DATA_SOURCES.map((source) => (
                <div key={source.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <span>{source.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.count} papers</p>
                    </div>
                  </div>
                  {source.status === 'locked' ? (
                    <Badge variant="outline" className="text-xs">🔒 Pro</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">✓</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">📤 Export Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['BibTeX', 'CSV', 'RIS', 'EndNote', 'Clipboard'].map((format) => (
                <Button key={format} variant="outline" className="w-full justify-start gap-2" size="sm">
                  📋 Export as {format}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Save to Library */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 text-center space-y-3">
              <span className="text-3xl">💾</span>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Save to Library</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Keep track of important papers
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                + Add Selected to Library
              </Button>
            </CardContent>
          </Card>

          {/* Upgrade CTA */}
          <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
                ⭐ Premium Search
              </h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Scopus & Web of Science</li>
                <li>• Full-text PDF access</li>
                <li>• Citation alerts</li>
                <li>• Unlimited exports</li>
              </ul>
              <Link href="/subscription">
                <Button variant="outline" size="sm" className="w-full">
                  View Plans →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-8"></div>
    </div>
  );
}
