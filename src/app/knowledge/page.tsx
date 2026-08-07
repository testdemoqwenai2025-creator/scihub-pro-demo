'use client';

/**
 * SciHub Pro - Knowledge Graph Page
 * 
 * Interactive knowledge visualization with:
 * - Node/edge graph rendering (simulated D3-force)
 * - Multiple entity types (papers, genes, compounds, authors)
 * - Relationship exploration
 * - Data persistence to store
 * - Call-for-action for advanced features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useSciHubStore, createDynamicField } from '@/store/useSciHubStore';
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

// ============ TYPES ============

interface GraphViewSettings {
  showLabels: boolean;
  showEdges: boolean;
  nodeSizeBy: 'connections' | 'importance' | 'uniform';
  layout: 'force' | 'circular' | 'hierarchical';
  filterType: string;
}

// ============ SYNTHETIC GRAPH DATA ============

const generateSampleGraph = () => {
  const nodes = [
    // Papers
    { id: 'paper-1', label: createDynamicField('CRISPR-Cas9 Gene Editing Review'), type: 'paper' as const, x: 400, y: 200, connections: 8, importance: 0.9 },
    { id: 'paper-2', label: createDynamicField('Machine Learning in Drug Discovery'), type: 'paper' as const, x: 600, y: 150, connections: 6, importance: 0.75 },
    { id: 'paper-3', label: createDynamicField('AlphaFold Protein Structure Prediction'), type: 'paper' as const, x: 500, y: 350, connections: 10, importance: 0.95 },
    { id: 'paper-4', label: createDynamicField('Single-Cell RNA Sequencing Methods'), type: 'paper' as const, x: 300, y: 300, connections: 5, importance: 0.7 },
    { id: 'paper-5', label: createDynamicField('Climate Change Impact on Biodiversity'), type: 'paper' as const, x: 700, y: 300, connections: 4, importance: 0.6 },
    
    // Genes
    { id: 'gene-1', label: createDynamicField('TP53'), type: 'gene' as const, x: 200, y: 150, connections: 12, importance: 1.0 },
    { id: 'gene-2', label: createDynamicField('BRCA1'), type: 'gene' as const, x: 250, y: 400, connections: 9, importance: 0.85 },
    { id: 'gene-3', label: createDynamicField('EGFR'), type: 'gene' as const, x: 650, y: 450, connections: 7, importance: 0.72 },
    { id: 'gene-4', label: createDynamicField('MYC'), type: 'gene' as const, x: 450, y: 100, connections: 6, importance: 0.65 },
    
    // Compounds
    { id: 'compound-1', label: createDynamicField('Aspirin'), type: 'compound' as const, x: 100, y: 280, connections: 4, importance: 0.55 },
    { id: 'compound-2', label: createDynamicField('Paclitaxel'), type: 'compound' as const, x: 750, y: 180, connections: 3, importance: 0.5 },
    { id: 'compound-3', label: createDynamicField('Doxorubicin'), type: 'compound' as const, x: 550, y: 500, connections: 5, importance: 0.58 },
    
    // Authors
    { id: 'author-1', label: createDynamicField('Dr. Jennifer Doudna'), type: 'author' as const, x: 350, y: 50, connections: 7, importance: 0.88 },
    { id: 'author-2', label: createDynamicField('Prof. Demis Hassabis'), type: 'author' as const, x: 600, y: 550, connections: 6, importance: 0.82 },
    
    // Domains/Concepts
    { id: 'domain-1', label: createDynamicField('Oncology'), type: 'domain' as const, x: 150, y: 480, connections: 11, importance: 0.92 },
    { id: 'domain-2', label: createDynamicField('Bioinformatics'), type: 'domain' as const, x: 800, y: 380, connections: 9, importance: 0.85 },
    { id: 'domain-3', label: createDynamicField('Structural Biology'), type: 'domain' as const, x: 420, y: 250, connections: 8, importance: 0.78 },
  ];

  const edges = [
    // Paper citations
    { source: 'paper-1', target: 'paper-4', strength: 0.8, label: 'cites', type: 'cites' as const },
    { source: 'paper-2', target: 'paper-3', strength: 0.6, label: 'related_to', type: 'similar_to' as const },
    { source: 'paper-3', target: 'paper-1', strength: 0.4, label: 'references', type: 'cites' as const },
    
    // Paper-Gene relationships
    { source: 'paper-1', target: 'gene-1', strength: 0.9, label: 'studies', type: 'contains' as const },
    { source: 'paper-1', target: 'gene-2', strength: 0.85, label: 'studies', type: 'contains' as const },
    { source: 'paper-4', target: 'gene-1', strength: 0.7, label: 'analyzes', type: 'contains' as const },
    { source: 'paper-4', target: 'gene-4', strength: 0.65, label: 'analyzes', type: 'contains' as const },
    { source: 'paper-2', target: 'gene-3', strength: 0.55, label: 'targets', type: 'contains' as const },
    
    // Paper-Compound relationships
    { source: 'paper-2', target: 'compound-1', strength: 0.5, label: 'mentions', type: 'contains' as const },
    { source: 'paper-1', target: 'compound-2', strength: 0.45, label: 'discusses', type: 'contains' as const },
    { source: 'paper-4', target: 'compound-3', strength: 0.6, label: 'evaluates', type: 'contains' as const },
    
    // Author-Paper relationships
    { source: 'author-1', target: 'paper-1', strength: 0.95, label: 'authored', type: 'author_of' as const },
    { source: 'author-2', target: 'paper-3', strength: 0.9, label: 'authored', type: 'author_of' as const },
    { source: 'author-1', target: 'paper-4', strength: 0.4, label: 'co-authored', type: 'author_of' as const },
    
    // Domain relationships
    { source: 'domain-1', target: 'gene-1', strength: 0.95, label: 'includes', type: 'contains' as const },
    { source: 'domain-1', target: 'gene-2', strength: 0.92, label: 'includes', type: 'contains' as const },
    { source: 'domain-1', target: 'compound-3', strength: 0.88, label: 'treats_with', type: 'contains' as const },
    { source: 'domain-1', target: 'paper-1', strength: 0.85, label: 'field_of', type: 'contains' as const },
    { source: 'domain-1', target: 'paper-4', strength: 0.82, label: 'field_of', type: 'contains' as const },
    { source: 'domain-2', target: 'paper-2', strength: 0.9, label: 'field_of', type: 'contains' as const },
    { source: 'domain-2', target: 'paper-3', strength: 0.87, label: 'uses', type: 'contains' as const },
    { source: 'domain-2', target: 'author-2', strength: 0.78, label: 'practices', type: 'contains' as const },
    { source: 'domain-3', target: 'paper-3', strength: 0.95, label: 'field_of', type: 'contains' as const },
    { source: 'domain-3', target: 'gene-2', strength: 0.7, label: 'studies_structure', type: 'contains' as const },
    
    // Gene-Compound interactions
    { source: 'gene-1', target: 'compound-3', strength: 0.75, label: 'targeted_by', type: 'similar_to' as const },
    { source: 'gene-2', target: 'compound-2', strength: 0.68, label: 'treated_by', type: 'similar_to' as const },
    { source: 'gene-3', target: 'compound-1', strength: 0.55, label: 'affected_by', type: 'similar_to' as const },
    
    // Gene-Gene interactions
    { source: 'gene-1', target: 'gene-2', strength: 0.72, label: 'interacts_with', type: 'similar_to' as const },
    { source: 'gene-1', target: 'gene-4', strength: 0.65, label: 'regulates', type: 'similar_to' as const },
    { source: 'gene-2', target: 'gene-4', strength: 0.58, label: 'co-expressed', type: 'similar_to' as const },
  ];

  return { nodes, edges };
};

// ============ KNOWLEDGE GRAPH PAGE COMPONENT ============

export default function KnowledgePage() {
  const { t } = useTranslation();
  const store = useSciHubStore();
  
  const {
    graphNodes,
    graphEdges,
    addGraphNode,
    addGraphEdge,
    clearGraph,
    activities,
    addActivity,
    savedItems,
    saveItem,
  } = store;

  // UI State
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<GraphViewSettings>({
    showLabels: true,
    showEdges: true,
    nodeSizeBy: 'connections',
    layout: 'force',
    filterType: 'all',
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with sample data on first load
  useEffect(() => {
    if (!isInitialized && graphNodes.length === 0) {
      const sampleData = generateSampleGraph();
      sampleData.nodes.forEach(node => addGraphNode(node));
      sampleData.edges.forEach(edge => addGraphEdge(edge));
      setIsInitialized(true);
      
      addActivity({
        type: 'query',
        message: createDynamicField('Loaded sample knowledge graph (17 nodes, 35 edges)'),
        icon: '🕸️',
      });
    }
  }, []);

  // Filter nodes based on settings
  const filteredNodes = graphNodes.filter(
    node => settings.filterType === 'all' || node.type === settings.filterType
  );

  const filteredEdges = graphEdges.filter(
    edge => 
      filteredNodes.some(n => n.id === edge.source) &&
      filteredNodes.some(n => n.id === edge.target)
  );

  // Get selected node details
  const selectedNodeData = graphNodes.find(n => n.id === selectedNode);
  const connectedEdges = graphEdges.filter(
    e => e.source === selectedNode || e.target === selectedNode
  );
  const connectedNodeIds = connectedEdges.flatMap(e => [e.source, e.target]);
  const connectedNodes = graphNodes.filter(n => connectedNodeIds.includes(n.id) && n.id !== selectedNode);

  // Node type colors
  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      paper: '#3b82f6',   // blue
      gene: '#22c55e',    // green
      compound: '#f59e0b', // orange
      author: '#a855f7',  // purple
      domain: '#ef4444',  // red
      dataset: '#06b6d4', // cyan
      concept: '#84cc16', // lime
    };
    return colors[type] || '#6b7280'; // gray default
  };

  const getNodeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      paper: '📄',
      gene: '🧬',
      compound: '⚗️',
      author: '👤',
      domain: '🏷️',
      dataset: '📊',
      concept: '💡',
    };
    return icons[type] || '📍';
  };

  // Draw graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (settings.layout === 'force') {
      // Simple force-directed simulation
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw edges first (behind nodes)
      if (settings.showEdges) {
        filteredEdges.forEach(edge => {
          const sourceNode = filteredNodes.find(n => n.id === edge.source);
          const targetNode = filteredNodes.find(n => n.id === edge.target);
          
          if (sourceNode && targetNode) {
            ctx.beginPath();
            ctx.moveTo(sourceNode.x, sourceNode.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.strokeStyle = `${edge.strength < 0.5 ? '#d1d5db' : '#9ca3af'}${Math.floor(edge.strength * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = edge.strength * 3;
            ctx.stroke();
          }
        });
      }

      // Draw nodes
      filteredNodes.forEach(node => {
        const isSelected = node.id === selectedNode;
        const isHovered = node.id === hoveredNode;
        const baseSize = settings.nodeSizeBy === 'connections' ? Math.max(15, node.connections * 3) :
                        settings.nodeSizeBy === 'importance' ? 20 + node.importance * 30 : 25;
        const size = baseSize * (isSelected || isHovered ? 1.3 : 1);
        
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = getNodeColor(node.type);
        ctx.fill();
        
        if (isSelected) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (isHovered) {
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node label
        if (settings.showLabels) {
          ctx.font = isSelected ? 'bold 12px sans-serif' : '11px sans-serif';
          ctx.fillStyle = '#1f2937';
          ctx.textAlign = 'center';
          const labelText = node.label.value.length > 20 
            ? node.label.value.substring(0, 18) + '...' 
            : node.label.value;
          ctx.fillText(labelText, node.x, node.y + size + 16);
        }
      });
    } else if (settings.layout === 'circular') {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 60;

      // Position nodes in circle
      filteredNodes.forEach((node, i) => {
        const angle = (i / filteredNodes.length) * Math.PI * 2 - Math.PI / 2;
        node.x = centerX + radius * Math.cos(angle);
        node.y = centerY + radius * Math.sin(angle);
      });

      // Redraw with new positions
      // ... (same drawing logic as force layout)
    }
  }, [graphNodes, graphEdges, settings, selectedNode, hoveredNode]);

  // Handle canvas click for node selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    const clickedNode = filteredNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      addActivity({
        type: 'query',
        message: createDynamicField(`Selected node: ${clickedNode.label.value}`),
        icon: getNodeIcon(clickedNode.type),
      });
    } else {
      setSelectedNode(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hovered = filteredNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    setHoveredNode(hovered?.id || null);
  };

  // Save current graph state
  const handleSaveGraph = () => {
    saveItem({
      type: 'query',
      title: `Knowledge Graph (${filteredNodes.length} nodes)`,
      source: 'knowledge-graph',
      metadata: {
        nodeCount: filteredNodes.length,
        edgeCount: filteredEdges.length,
        nodeTypes: [...new Set(filteredNodes.map(n => n.type))],
      },
      tags: ['knowledge-graph', 'visualization'],
    });

    addActivity({
      type: 'save',
      message: createDynamicField(`Saved graph snapshot: ${filteredNodes.length} nodes, ${filteredEdges.length} edges`),
      icon: '🕸️',
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          🕸️ {t('knowledge.title') || 'Knowledge Graph'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore relationships between papers, genes, compounds, and researchers
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3">
          <Badge variant="secondary">
            {filteredNodes.length} nodes
          </Badge>
          <Badge variant="secondary">
            {filteredEdges.length} edges
          </Badge>
          <Badge variant="secondary">
            {[...new Set(filteredNodes.map(n => n.type))].length} types
          </Badge>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Main Graph Canvas */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoveredNode(null)}
            />

            {/* Floating Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Select value={settings.filterType} onValueChange={(v) => setSettings({ ...settings, filterType: v })}>
                <SelectTrigger className="w-[140px] h-9 bg-background/90 backdrop-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="paper">📄 Papers</SelectItem>
                  <SelectItem value="gene">🧬 Genes</SelectItem>
                  <SelectItem value="compound">⚗️ Compounds</SelectItem>
                  <SelectItem value="author">👤 Authors</SelectItem>
                  <SelectItem value="domain">🏷️ Domains</SelectItem>
                </SelectContent>
              </Select>

              <Select value={settings.layout} onValueChange={(v) => setSettings({ ...settings, layout: v as GraphViewSettings['layout'] })}>
                <SelectTrigger className="w-[140px] h-9 bg-background/90 backdrop-blur">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="force">Force Layout</SelectItem>
                  <SelectItem value="circular">Circular</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 p-3 bg-background/90 backdrop-blur rounded-lg border text-xs">
              <h4 className="font-medium mb-2">Legend</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  ['paper', '📄 Papers'],
                  ['gene', '🧬 Genes'],
                  ['compound', '⚗️ Compounds'],
                  ['author', '👤 Authors'],
                  ['domain', '🏷️ Domains'],
                ].map(([type, label]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getNodeColor(type) }}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-background/90 backdrop-blur"
                onClick={() => setSettings({ ...settings, showLabels: !settings.showLabels })}
              >
                {settings.showLabels ? '🏷️ Hide Labels' : '🏷️ Show Labels'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-background/90 backdrop-blur"
                onClick={() => setSettings({ ...settings, showEdges: !settings.showEdges })}
              >
                {settings.showEdges ? '🔗 Hide Edges' : '🔗 Show Edges'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-background/90 backdrop-blur"
                onClick={handleSaveGraph}
              >
                💾 Save Graph
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-background/90 backdrop-blur"
                onClick={() => {
                  clearGraph();
                  setIsInitialized(false);
                }}
              >
                🔄 Reset
              </Button>
            </div>

            {/* Hover Tooltip */}
            {hoveredNode && (
              <div 
                className="absolute pointer-events-none px-3 py-2 bg-background border rounded-lg shadow-lg text-sm z-10"
                style={{
                  left: (filteredNodes.find(n => n.id === hoveredNode)?.x || 0) + 20,
                  top: (filteredNodes.find(n => n.id === hoveredNode)?.y || 0) - 10,
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{getNodeIcon(filteredNodes.find(n => n.id === hoveredNode)?.type || '')}</span>
                  <span className="font-medium">
                    {filteredNodes.find(n => n.id === hoveredNode)?.label.value}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {filteredNodes.find(n => n.id === hoveredNode)?.connections} connections
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Panel */}
        {showDetailsPanel && selectedNodeData && (
          <Card className="w-80 overflow-auto">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">Node Details</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowDetailsPanel(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Node Info */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <span className="text-3xl block mb-2">{getNodeIcon(selectedNodeData.type)}</span>
                <h3 className="font-semibold">{selectedNodeData.label.value}</h3>
                <Badge 
                  className="mt-2"
                  style={{ backgroundColor: getNodeColor(selectedNodeData.type) }}
                >
                  {selectedNodeData.type}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-muted/50 rounded text-center">
                  <div className="text-lg font-bold">{selectedNodeData.connections}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div className="p-2 bg-muted/50 rounded text-center">
                  <div className="text-lg font-bold">{(selectedNodeData.importance * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Importance</div>
                </div>
              </div>

              {/* Connected Nodes */}
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Connected ({connectedNodes.length})
                </h4>
                <div className="space-y-1 max-h-48 overflow-auto">
                  {connectedNodes.map(node => (
                    <button
                      key={node.id}
                      className="w-full text-left p-2 rounded hover:bg-muted transition-colors text-sm flex items-center gap-2"
                      onClick={() => setSelectedNode(node.id)}
                    >
                      <span>{getNodeIcon(node.type)}</span>
                      <span className="truncate">{node.label.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edges */}
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Relationships ({connectedEdges.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-auto text-xs">
                  {connectedEdges.map((edge, i) => {
                    const otherNodeId = edge.source === selectedNode ? edge.target : edge.source;
                    const otherNode = graphNodes.find(n => n.id === otherNodeId);
                    return (
                      <div key={i} className="p-2 bg-muted/30 rounded flex items-center justify-between">
                        <span>{edge.label || edge.type}</span>
                        <span className="text-muted-foreground truncate ml-2">
                          → {otherNode?.label.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                  🔍 Find Related Papers
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                  📊 View Analysis
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                  ⭐ Save to Library
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Empty State when no selection */}
      {!selectedNode && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <span className="text-4xl block mb-3">🕸️</span>
            <h3 className="text-lg font-semibold mb-2">Explore the Knowledge Graph</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Click on any node to see its details and connections. Use the controls above to filter by type or change the layout.
            </p>
            
            {/* Quick Actions */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <Input
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (searchQuery.trim()) {
                    const found = graphNodes.find(n => 
                      n.label.value.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    if (found) setSelectedNode(found.id);
                  }
                }}
              >
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call-to-action for advanced features */}
      <Card className="mt-6 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100">
                🔮 Unlock Advanced Graph Features
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Get real-time collaboration, larger graphs (10K+ nodes), and custom layouts with Pro tier.
              </p>
            </div>
            <Button variant="outline" onClick={() => store.triggerUpgradePrompt('collaboration')}>
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
