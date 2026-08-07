'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ============ TYPES ============

interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'paper' | 'author' | 'dataset' | 'gene' | 'compound' | 'domain';
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  strength?: number;
}

// ============ KNOWLEDGE GRAPH DATA ============

const graphNodes: GraphNode[] = [
  // Core Concepts
  { id: 'crispr', label: 'CRISPR-Cas9', type: 'concept', size: 40, color: '#22C55E' },
  { id: 'ml', label: 'Machine Learning', type: 'concept', size: 45, color: '#3B82F6' },
  { id: 'quantum', label: 'Quantum Computing', type: 'concept', size: 35, color: '#8B5CF6' },
  { id: 'genomics', label: 'Genomics', type: 'domain', size: 42, color: '#22C55E' },
  { id: 'cheminfo', label: 'Cheminformatics', type: 'domain', size: 38, color: '#F59E0B' },
  
  // Papers
  { id: 'paper1', label: 'AlphaFold Protein Structure Prediction (2021)', type: 'paper', size: 30, color: '#EF4444' },
  { id: 'paper2', label: 'CRISPR Gene Editing Review (2023)', type: 'paper', size: 28, color: '#EF4444' },
  { id: 'paper3', label: 'GPT-4 for Scientific Discovery (2024)', type: 'paper', size: 32, color: '#EF4444' },
  { id: 'paper4', label: 'Drug Discovery with Deep Learning (2023)', type: 'paper', size: 26, color: '#EF4444' },
  
  // Authors
  { id: 'author1', label: 'Demis Hassabis', type: 'author', size: 22, color: '#06B6D4' },
  { id: 'author2', label: 'Jennifer Doudna', type: 'author', size: 24, color: '#06B6D4' },
  { id: 'author3', label: 'Yann LeCun', type: 'author', size: 20, color: '#06B6D4' },
  
  // Genes/Compounds
  { id: 'brca1', label: 'BRCA1 Gene', type: 'gene', size: 18, color: '#EC4899' },
  { id: 'tp53', label: 'TP53 Gene', type: 'gene', size: 18, color: '#EC4899' },
  { id: 'aspirin', label: 'Aspirin', type: 'compound', size: 16, color: '#F97316' },
];

const graphLinks: GraphLink[] = [
  // Concept relationships
  { source: 'genomics', target: 'crispr', type: 'uses', strength: 3 },
  { source: 'genomics', target: 'ml', type: 'analyzed-by', strength: 2 },
  { source: 'cheminfo', target: 'ml', type: 'uses', strength: 3 },
  { source: 'quantum', target: 'ml', type: 'enhances', strength: 1 },
  
  // Paper connections
  { source: 'paper1', target: 'ml', type: 'about', strength: 3 },
  { source: 'paper1', target: 'author1', type: 'authored-by', strength: 2 },
  { source: 'paper2', target: 'crispr', type: 'about', strength: 3 },
  { source: 'paper2', target: 'author2', type: 'authored-by', strength: 2 },
  { source: 'paper3', target: 'ml', type: 'about', strength: 3 },
  { source: 'paper3', target: 'author3', type: 'authored-by', strength: 2 },
  { source: 'paper4', target: 'cheminfo', type: 'about', strength: 3 },
  { source: 'paper4', target: 'ml', type: 'uses', strength: 2 },
  
  // Gene connections
  { source: 'brca1', target: 'genomics', type: 'belongs-to', strength: 2 },
  { source: 'brca1', target: 'crispr', type: 'targeted-by', strength: 2 },
  { source: 'tp53', target: 'genomics', type: 'belongs-to', strength: 2 },
  { source: 'aspirin', target: 'cheminfo', type: 'studied-in', strength: 1 },
];

// ============ KNOWLEDGE GRAPH PAGE ============

export default function KnowledgeGraphPage() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Initialize node positions
  useEffect(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const centerX = 400;
    const centerY = 300;

    graphNodes.forEach((node, i) => {
      const angle = (i / graphNodes.length) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      positions.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    });

    setNodePositions(positions);
  }, []);

  // Draw graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background') || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw links
    const filteredNodes = getFilteredNodes();
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    graphLinks
      .filter(link => filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target))
      .forEach(link => {
        const sourcePos = nodePositions.get(link.source);
        const targetPos = nodePositions.get(link.target);
        
        if (sourcePos && targetPos) {
          ctx.beginPath();
          ctx.moveTo(sourcePos.x, sourcePos.y);
          ctx.lineTo(targetPos.x, targetPos.y);
          ctx.globalAlpha = (link.strength || 1) * 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

    // Draw nodes
    filteredNodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const isSelected = selectedNode?.id === node.id;
      const radius = (node.size || 20) * (isSelected ? 1.2 : 1);

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color || '#6b7280';
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.min(12, radius / 2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Truncate long labels
      const label = node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label;
      ctx.fillText(label, pos.x, pos.y);
    });

    ctx.restore();
  }, [nodePositions, selectedNode, filterType, zoom]);

  const getFilteredNodes = () => {
    if (filterType === 'all') return graphNodes;
    
    let typeMap: Record<string, GraphNode['type']> = {};
    if (filterType === 'concepts') typeMap = { concept: 'concept', domain: 'domain' };
    else if (filterType === 'papers') typeMap = { paper: 'paper' };
    else if (filterType === 'authors') typeMap = { author: 'author' };
    else if (filterType === 'biological') typeMap = { gene: 'gene' };
    else if (filterType === 'chemical') typeMap = { compound: 'compound' };

    return graphNodes.filter(node => Object.values(typeMap).includes(node.type));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2) / zoom + canvas.width / 2;
    const y = (e.clientY - rect.top - canvas.height / 2) / zoom + canvas.height / 2;

    // Find clicked node
    const clickedNode = graphNodes.find(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return false;
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      return distance <= (node.size || 20);
    });

    setSelectedNode(clickedNode || null);
  };

  const typeColors: Record<string, string> = {
    concept: '#22C55E',
    domain: '#8B5CF6',
    paper: '#EF4444',
    author: '#06B6D4',
    gene: '#EC4899',
    compound: '#F97316',
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('knowledge.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('knowledge.subtitle')}</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Graph Canvas */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full relative">
            {/* Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
              >
                {t('knowledge.zoom_in')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
              >
                {t('knowledge.zoom_out')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setZoom(1)}
              >
                {t('knowledge.reset_view')}
              </Button>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={handleCanvasClick}
              className="w-full h-full cursor-crosshair"
            />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-background/90 rounded-lg p-3 border">
              <p className="text-xs font-medium mb-2">Legend</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {Object.entries(typeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="w-80 space-y-4">
          {/* Search & Filter */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Input
                placeholder={t('knowledge.search_graph')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {t('knowledge.filter_by_type')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {[
                    { value: 'all', label: t('knowledge.all_types') || 'All' },
                    { value: 'concepts', label: t('knowledge.concepts') || 'Concepts' },
                    { value: 'papers', label: t('knowledge.papers') || 'Papers' },
                    { value: 'authors', label: t('knowledge.authors') || 'Authors' },
                    { value: 'biological', label: t('knowledge.genes') || 'Genes' },
                    { value: 'chemical', label: t('knowledge.compounds') || 'Compounds' },
                  ].map(filter => (
                    <Badge
                      key={filter.value}
                      variant={filterType === filter.value ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilterType(filter.value)}
                    >
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Info */}
          {selectedNode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{selectedNode.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <Badge variant="outline" className="capitalize">
                    {selectedNode.type}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-medium">
                      {graphLinks.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length}
                    </span>
                  </div>
                  
                  {selectedNode.type === 'paper' && (
                    <>
                      <p className="text-muted-foreground pt-2 border-t">
                        This paper represents significant research in its field.
                        Click to view full details and citation network.
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        View Paper Details
                      </Button>
                    </>
                  )}
                  
                  {selectedNode.type === 'gene' && (
                    <>
                      <p className="text-muted-foreground pt-2 border-t">
                        Gene information available in NCBI GenBank.
                        Explore sequences, variants, and functional annotations.
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Explore in GenBank
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('knowledge.nodes')}</span>
                <span className="font-medium">{getFilteredNodes().length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Edges</span>
                <span className="font-medium">{graphLinks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Zoom</span>
                <span className="font-medium">{Math.round(zoom * 100)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
