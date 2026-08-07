'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore, createDynamicField } from '@/store/useDynamicStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============ TYPES ============

interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'paper' | 'author' | 'gene' | 'compound' | 'domain' | 'dataset' | 'method';
  x: number;
  y: number;
  connections: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  strength: number;
}

// ============ INITIAL GRAPH DATA ============

const INITIAL_NODES: GraphNode[] = [
  { id: 'n1', label: 'CRISPR', type: 'concept', x: 400, y: 200, connections: 4 },
  { id: 'n2', label: 'Machine Learning', type: 'concept', x: 600, y: 150, connections: 5 },
  { id: 'n3', label: 'Quantum Computing', type: 'concept', x: 750, y: 300, connections: 3 },
  { id: 'n4', label: 'Gene Editing Review (2024)', type: 'paper', x: 250, y: 100, connections: 2 },
  { id: 'n5', label: 'Smith J.', type: 'author', x: 200, y: 280, connections: 3 },
  { id: 'n6', label: 'BRCA1', type: 'gene', x: 350, y: 350, connections: 3 },
  { id: 'n7', label: 'Aspirin', type: 'compound', x: 550, y: 380, connections: 2 },
  { id: 'n8', label: 'Bioinformatics', type: 'domain', x: 700, y: 150, connections: 4 },
  { id: 'n9', label: 'AlphaFold Paper', type: 'paper', x: 500, y: 50, connections: 2 },
  { id: 'n10', label: 'TP53', type: 'gene', x: 150, y: 180, connections: 2 },
  { id: 'n11', label: 'Deep Learning', type: 'method', x: 650, y: 80, connections: 3 },
  { id: 'n12', label: 'TCGA Dataset', type: 'dataset', x: 450, y: 280, connections: 2 },
  { id: 'n13', label: 'Drug Discovery', type: 'concept', x: 800, y: 200, connections: 3 },
];

const INITIAL_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'n1', target: 'n6', relationship: 'targets', strength: 0.9 },
  { id: 'e2', source: 'n1', target: 'n4', relationship: 'studied_in', strength: 0.8 },
  { id: 'e3', source: 'n5', target: 'n4', relationship: 'authored', strength: 0.95 },
  { id: 'e4', source: 'n2', target: 'n11', relationship: 'includes', strength: 0.85 },
  { id: 'e5', source: 'n2', target: 'n8', relationship: 'applied_in', strength: 0.9 },
  { id: 'e6', source: 'n8', target: 'n12', relationship: 'analyzes', strength: 0.75 },
  { id: 'e7', source: 'n6', target: 'n10', relationship: 'interacts_with', strength: 0.7 },
  { id: 'e8', source: 'n13', target: 'n7', relationship: 'includes', strength: 0.8 },
  { id: 'e9', source: 'n2', target: 'n9', relationship: 'used_in', strength: 0.85 },
  { id: 'e10', source: 'n11', target: 'n9', relationship: 'enabled', strength: 0.95 },
  { id: 'e11', source: 'n3', target: 'n13', relationship: 'accelerates', strength: 0.65 },
  { id: 'e12', source: 'n1', target: 'n12', relationship: 'analyzed_using', strength: 0.72 },
];

// ============ KNOWLEDGE GRAPH PAGE ============

export default function KnowledgeGraphPage() {
  const { t } = useTranslation();
  const {
    graphNodes,
    graphEdges,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    addActivity,
  } = useDynamicStore();

  // UI State
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<GraphNode['type']>('concept');

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with store data or defaults
  useEffect(() => {
    if (graphNodes.length > 0) {
      setNodes(graphNodes.map(n => ({
        id: n.id,
        label: n.label.value,
        type: n.type.value,
        x: n.x,
        y: n.y,
        connections: n.connections,
      })));
    }
    if (graphEdges.length > 0) {
      setEdges(graphEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        relationship: e.relationship.value,
        strength: e.strength.value,
      })));
    }
  }, [graphNodes, graphEdges]);

  // Draw graph on canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom transform
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Filter nodes
    const filteredNodes = nodes.filter(node => {
      const matchesType = filterType === 'all' || node.type === filterType;
      const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = filteredNodes.find(n => n.id === edge.source);
      const targetNode = filteredNodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;

      const isSelected = selectedEdge?.id === edge.id;

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      
      // Curved line for better visualization
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2 - 20;
      ctx.quadraticCurveTo(midX, midY, targetNode.x, targetNode.y);
      
      ctx.strokeStyle = isSelected ? '#3b82f6' : `rgba(148, 163, 184, ${0.3 + edge.strength * 0.5})`;
      ctx.lineWidth = isSelected ? 3 : 1 + edge.strength * 2;
      ctx.stroke();

      // Draw edge label
      if (zoomLevel > 0.7) {
        ctx.fillStyle = '#64748b';
        ctx.font = `${10 / zoomLevel}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(edge.relationship, midX, midY - 5);
      }
    });

    // Draw nodes
    filteredNodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const color = getNodeColor(node.type);
      const radius = 15 + Math.min(node.connections * 2, 15);

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#3b82f6' : color;
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node icon/letter
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${12 / zoomLevel}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getNodeIcon(node.type), node.x, node.y);

      // Node label
      if (zoomLevel > 0.5) {
        ctx.fillStyle = '#334155';
        ctx.font = `${11 / zoomLevel}px sans-serif`;
        ctx.fillText(node.label, node.x, node.y + radius + 14);
      }

      // Connection count badge
      if (node.connections > 0 && zoomLevel > 0.6) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(node.x + radius - 5, node.y - radius + 5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${8 / zoomLevel}px sans-serif`;
        ctx.fillText(String(node.connections), node.x + radius - 5, node.y - radius + 5);
      }
    });

    ctx.restore();
  }, [nodes, edges, selectedNode, selectedEdge, filterType, searchQuery, zoomLevel]);

  // Redraw on changes
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle canvas interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    // Check if clicked on a node
    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      setSelectedEdge(null);
    } else {
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (clickedNode) {
      setIsDragging(true);
      setDragNode(clickedNode.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragNode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    setNodes(prev => prev.map(n => 
      n.id === dragNode ? { ...n, x, y } : n
    ));
  };

  const handleMouseUp = () => {
    if (isDragging && dragNode) {
      // Save position to store
      addActivity({
        type: 'update',
        message: createDynamicField(`Moved node in knowledge graph`),
        icon: '📍',
      });
    }
    setIsDragging(false);
    setDragNode(null);
  };

  // Add new node
  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;

    const newNode: GraphNode = {
      id: `node-${Date.now()}`,
      label: newNodeLabel,
      type: newNodeType,
      x: 100 + Math.random() * 600,
      y: 100 + Math.random() * 300,
      connections: 0,
    };

    setNodes(prev => [...prev, newNode]);
    
    // Also add to store
    addNode({
      label: createDynamicField(newNodeLabel),
      type: createDynamicField(newNodeType),
      properties: {},
      x: newNode.x,
      y: newNode.y,
    });

    addActivity({
      type: 'create',
      message: createDynamicField(`Added node "${newNodeLabel}" to knowledge graph`),
      icon: '🔷',
    });

    setNewNodeLabel('');
    setShowAddForm(false);
  };

  // Delete selected node
  const handleDeleteNode = () => {
    if (!selectedNode) return;

    if (confirm(`Delete node "${selectedNode.label}" and its connections?`)) {
      setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
      setEdges(prev => prev.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      removeNode(selectedNode.id);
      setSelectedNode(null);

      addActivity({
        type: 'delete',
        message: createDynamicField(`Deleted node "${selectedNode.label}" from knowledge graph`),
        icon: '🗑️',
      });
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.3));
  const handleResetView = () => {
    setZoomLevel(1);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Type counts for filter badges
  const typeCounts = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('knowledge.title') || 'Knowledge Graph'}</h1>
        <p className="text-muted-foreground mt-1">
          Interactive scientific knowledge network. Click nodes to explore, drag to reorganize.
        </p>
        
        <div className="mt-2 flex items-center gap-3">
          <Badge variant="secondary">
            {nodes.length} Nodes • {edges.length} Edges
          </Badge>
          <span className="text-sm text-muted-foreground">
            All changes persist to local storage
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Canvas Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <Card>
            <CardContent className="p-3 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48"
                />
                
                {/* Type Filters */}
                <div className="flex flex-wrap gap-1">
                  <FilterBadge 
                    type="all" 
                    label="All" 
                    count={nodes.length}
                    active={filterType === 'all'}
                    onClick={() => setFilterType('all')}
                  />
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <FilterBadge
                      key={type}
                      type={type}
                      label={type}
                      count={count}
                      active={filterType === type}
                      onClick={() => setFilterType(type)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleZoomOut}>−</Button>
                <span className="text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                <Button size="sm" variant="outline" onClick={handleZoomIn}>+</Button>
                <Button size="sm" variant="outline" onClick={handleResetView}>Reset</Button>
                <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                  + Add Node
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Node Form */}
          {showAddForm && (
            <Card className="border-primary">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Add New Node</h3>
                <div className="flex gap-3">
                  <Input
                    value={newNodeLabel}
                    onChange={(e) => setNewNodeLabel(e.target.value)}
                    placeholder="Node label (e.g., New Concept)"
                    className="flex-1"
                  />
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as GraphNode['type'])}
                    className="px-3 py-2 border rounded-md bg-background text-sm"
                  >
                    <option value="concept">Concept</option>
                    <option value="paper">Paper</option>
                    <option value="author">Author</option>
                    <option value="gene">Gene</option>
                    <option value="compound">Compound</option>
                    <option value="domain">Domain</option>
                    <option value="dataset">Dataset</option>
                    <option value="method">Method</option>
                  </select>
                  <Button onClick={handleAddNode} disabled={!newNodeLabel.trim()}>
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Graph Canvas */}
          <Card className="overflow-hidden">
            <canvas
              ref={canvasRef}
              width={900}
              height={500}
              className="w-full border-0 cursor-crosshair bg-background"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {/* Legend */}
            <div className="px-4 py-3 border-t bg-muted/30 flex flex-wrap gap-4 text-xs">
              <span className="font-medium">Legend:</span>
              {[
                { type: 'concept' as const, label: 'Concepts', icon: '💡' },
                { type: 'paper' as const, label: 'Papers', icon: '📄' },
                { type: 'author' as const, label: 'Authors', icon: '👤' },
                { type: 'gene' as const, label: 'Genes', icon: '🧬' },
                { type: 'compound' as const, label: 'Compounds', icon: '⚗️' },
                { type: 'domain' as const, label: 'Domains', icon: '🌐' },
                { type: 'dataset' as const, label: 'Datasets', icon: '📊' },
                { type: 'method' as const, label: 'Methods', icon: '⚙️' },
              ].map(item => (
                <span key={item.type} className="flex items-center gap-1">
                  <span 
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: getNodeColor(item.type) }}
                  />
                  {item.icon} {item.label}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Side Panel - Node Details */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{selectedNode.label}</CardTitle>
                  <Badge style={{ backgroundColor: getNodeColor(selectedNode.type) }}>
                    {selectedNode.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-medium">{selectedNode.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-medium">({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})</span>
                  </div>
                </div>

                {/* Connected Edges */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Relationships</h4>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {edges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map(edge => {
                        const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const otherNode = nodes.find(n => n.id === otherNodeId);
                        return (
                          <button
                            key={edge.id}
                            onClick={() => setSelectedEdge(edge)}
                            className={`w-full text-left p-2 rounded text-xs hover:bg-muted transition-colors ${
                              selectedEdge?.id === edge.id ? 'bg-primary/10 border border-primary' : ''
                            }`}
                          >
                            <span className="font-medium">{edge.relationship}</span>
                            <span className="text-muted-foreground ml-1">
                              → {otherNode?.label || 'Unknown'}
                            </span>
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {(edge.strength * 100).toFixed(0)}%
                            </Badge>
                          </button>
                        );
                      })}
                    
                    {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                      <p className="text-xs text-muted-foreground">No relationships yet</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <Button size="sm" variant="outline" className="w-full" onClick={handleDeleteNode}>
                    🗑️ Delete Node
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    🔗 Add Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-sm">Select a node to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Graph Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Graph Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Nodes</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Edges</span>
                <span className="font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Connections</span>
                <span className="font-medium">
                  {(edges.length * 2 / nodes.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Graph Density</span>
                <span className="font-medium">
                  {(edges.length / (nodes.length * (nodes.length - 1) / 2) * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Drag nodes to rearrange. Double-click to edit labels.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============ HELPER COMPONENTS & FUNCTIONS ============

function FilterBadge({ 
  type, 
  label, 
  count, 
  active, 
  onClick 
}: { 
  type: string; 
  label: string; 
  count: number; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {label} ({count})
    </button>
  );
}

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    concept: '#8b5cf6',
    paper: '#3b82f6',
    author: '#10b981',
    gene: '#ef4444',
    compound: '#f59e0b',
    domain: '#06b6d4',
    dataset: '#84cc16',
    method: '#ec4899',
  };
  return colors[type] || '#6b7280';
}

function getNodeIcon(type: string): string {
  const icons: Record<string, string> = {
    concept: '💡',
    paper: '📄',
    author: '👤',
    gene: '🧬',
    compound: '⚗️',
    domain: '🌐',
    dataset: '📊',
    method: '⚙️',
  };
  return icons[type] || '●';
}
