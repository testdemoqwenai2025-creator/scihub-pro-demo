'use client';

/**
 * SciHub Pro - Knowledge Graph Page (Robust Version)
 * 
 * Fixed: Instant rendering with error handling for GitHub Pages static export
 */

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============ TYPES ============

type NodeType = 'paper' | 'gene' | 'compound' | 'author' | 'concept' | 'domain';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  connections: number;
  importance: number;
  description?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
}

// ============ CONSTANTS ============

const NODE_TYPE_CONFIG: Record<NodeType, { color: string; icon: string; label: string }> = {
  paper: { color: '#3B82F6', icon: '📄', label: 'Paper' },
  gene: { color: '#10B981', icon: '🧬', label: 'Gene' },
  compound: { color: '#8B5CF6', icon: '⚗️', label: 'Compound' },
  author: { color: '#F59E0B', icon: '👤', label: 'Author' },
  concept: { color: '#06B6D4', icon: '💡', label: 'Concept' },
  domain: { color: '#EC4899', icon: '🏛️', label: 'Institution' },
};

const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;

// ============ SAMPLE GRAPH DATA (CRISPR Theme) ============

const SAMPLE_NODES: GraphNode[] = [
  { id: '1', label: 'CRISPR-Cas9', type: 'concept', x: 400, y: 250, connections: 8, importance: 0.95, description: 'Revolutionary gene-editing technology' },
  { id: '2', label: 'Doudna & Charpentier (2020)', type: 'paper', x: 200, y: 150, connections: 6, importance: 0.90, description: 'Nobel Prize-winning CRISPR discovery' },
  { id: '3', label: 'Sickle Cell Disease Trial', type: 'paper', x: 600, y: 150, connections: 5, importance: 0.85, description: 'Clinical trial showing cure potential' },
  { id: '4', label: 'HBB Gene', type: 'gene', x: 250, y: 350, connections: 4, importance: 0.80, description: 'Target gene for sickle cell treatment' },
  { id: '5', label: 'Jennifer Doudna', type: 'author', x: 100, y: 250, connections: 5, importance: 0.75, description: 'UC Berkeley researcher' },
  { id: '6', label: 'Emmanuelle Charpentier', type: 'author', x: 700, y: 250, connections: 4, importance: 0.70, description: 'Max Planck Institute' },
  { id: '7', label: 'Cas9 Protein', type: 'compound', x: 400, y: 100, connections: 6, importance: 0.88, description: 'Molecular scissors for DNA cutting' },
  { id: '8', label: 'Gene Therapy', type: 'concept', x: 550, y: 380, connections: 4, importance: 0.78, description: 'Therapeutic application area' },
  { id: '9', label: 'UC Berkeley', type: 'domain', x: 50, y: 150, connections: 2, importance: 0.60, description: 'Research institution' },
  { id: '10', label: 'Nature Medicine', type: 'domain', x: 750, y: 100, connections: 2, importance: 0.55, description: 'Publication venue' },
];

const SAMPLE_EDGES: GraphEdge[] = [
  { id: 'e1', source: '1', target: '2', type: 'described-in', weight: 3 },
  { id: 'e2', source: '1', target: '3', type: 'applied-in', weight: 2 },
  { id: 'e3', source: '1', target: '4', type: 'targets', weight: 3 },
  { id: 'e4', source: '1', target: '7', type: 'uses', weight: 4 },
  { id: 'e5', source: '2', target: '5', type: 'authored-by', weight: 3 },
  { id: 'e6', source: '2', target: '9', type: 'affiliated-with', weight: 2 },
  { id: 'e7', source: '3', target: '8', type: 'part-of', weight: 2 },
  { id: 'e8', source: '3', target: '10', type: 'published-in', weight: 2 },
  { id: 'e9', source: '5', target: '2', type: 'authored', weight: 3 },
  { id: 'e10', source: '6', target: '2', type: 'authored', weight: 3 },
  { id: 'e11', source: '4', target: '8', type: 'relevant-to', weight: 2 },
  { id: 'e12', source: '7', target: '1', type: 'component-of', weight: 4 },
];

// ============ GRAPH VISUALIZATION COMPONENT ============

interface GraphVisualizationProps {
  selectedNode: GraphNode | null;
  onNodeSelect: (node: GraphNode | null) => void;
}

function GraphVisualization({ selectedNode, onNodeSelect }: GraphVisualizationProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="relative w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden" style={{ minHeight: '500px' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      >
        {/* Definitions */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
          </marker>
        </defs>

        {/* Edges */}
        {SAMPLE_EDGES.map((edge) => {
          const sourceNode = SAMPLE_NODES.find(n => n.id === edge.source);
          const targetNode = SAMPLE_NODES.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const isHighlighted = 
            selectedNode?.id === edge.source || 
            selectedNode?.id === edge.target ||
            hoveredNode === edge.source || 
            hoveredNode === edge.target;

          return (
            <line
              key={edge.id}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke={isHighlighted ? '#9CA3AF' : '#374151'}
              strokeWidth={isHighlighted ? edge.weight : Math.max(1, edge.weight - 1)}
              opacity={isHighlighted ? 0.8 : 0.4}
              markerEnd="url(#arrowhead)"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Nodes */}
        {SAMPLE_NODES.map((node) => {
          const config = NODE_TYPE_CONFIG[node.type];
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode === node.id;
          const radius = 15 + (node.importance * 20);

          return (
            <g key={node.id}>
              {/* Outer glow for selected/hovered */}
              {(isSelected || isHovered) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + 10}
                  fill={config.color}
                  opacity="0.2"
                  className="animate-pulse"
                />
              )}
              
              {/* Main circle - clickable */}
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={config.color}
                stroke={isSelected ? '#fff' : config.color}
                strokeWidth={isSelected ? 3 : 2}
                filter={isSelected ? 'url(#glow)' : undefined}
                className="cursor-pointer transition-all duration-300 hover:opacity-80"
                onClick={() => onNodeSelect(selectedNode?.id === node.id ? null : node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />

              {/* Icon inside node */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={radius > 25 ? 24 : 18}
                className="pointer-events-none select-none"
              >
                {config.icon}
              </text>

              {/* Label (shown on hover or selection) */}
              {(isSelected || isHovered) && (
                <text
                  x={node.x}
                  y={node.y + radius + 20}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <p className="font-semibold mb-2">Legend</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button size="sm" variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
          🔄 Reset View
        </Button>
        <Button size="sm" variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
          📥 Export PNG
        </Button>
      </div>
    </div>
  );
}

// ============ NODE DETAIL PANEL COMPONENT ============

function NodeDetailPanel({ node }: { node: GraphNode | null }) {
  if (!node) {
    return (
      <Card className="h-full flex items-center justify-center text-muted-foreground min-h-[300px]">
        <CardContent className="text-center py-8">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-lg font-medium">Click on a node</p>
          <p className="text-sm mt-1">to see details here</p>
        </CardContent>
      </Card>
    );
  }

  const config = NODE_TYPE_CONFIG[node.type];
  const connectedEdges = SAMPLE_EDGES.filter(e => e.source === node.id || e.target === node.id);
  const connectedNodes = connectedEdges.flatMap(e => 
    [SAMPLE_NODES.find(n => n.id === e.source), SAMPLE_NODES.find(n => n.id === e.target)]
  ).filter((n): n is GraphNode => n !== undefined).slice(0, 5);

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            Node Details
          </CardTitle>
          <Badge style={{ backgroundColor: config.color + '20', color: config.color }}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-lg">{node.label}</h3>
          {node.description && (
            <p className="text-muted-foreground mt-1">{node.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Connections</p>
            <p className="text-lg font-bold">{node.connections}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Importance</p>
            <p className="text-lg font-bold">{Math.round(node.importance * 100)}%</p>
          </div>
        </div>

        {connectedNodes.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Connected Nodes:</p>
            <div className="space-y-1 max-h-[150px] overflow-y-auto">
              {connectedNodes.map(n => (
                <div key={n.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-muted">
                  <span>{NODE_TYPE_CONFIG[n.type].icon}</span>
                  <span className="truncate">{n.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 space-y-2">
          <Button variant="outline" className="w-full" size="sm">
            🔗 View Related Papers
          </Button>
          <Button className="w-full" size="sm">
            ➕ Expand Graph
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ MAIN KNOWLEDGE GRAPH PAGE COMPONENT ============

export default function KnowledgeGraphPage() {
  // State - no artificial loading delay!
  const [selectedLayout, setSelectedLayout] = useState('force');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hasError, setHasError] = useState(false);

  // Stats calculation (always available)
  const stats = {
    nodes: SAMPLE_NODES.length,
    edges: SAMPLE_EDGES.length,
    types: new Set(SAMPLE_NODES.map(n => n.type)).size,
    maxConnections: Math.max(...SAMPLE_NODES.map(n => n.connections)),
  };

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <span className="text-6xl block mb-4">⚠️</span>
          <h1 className="text-2xl font-bold mb-2">Unable to Load Knowledge Graph</h1>
          <p className="text-muted-foreground mb-6">
            There was an error rendering the graph visualization.
          </p>
          <Button onClick={() => setHasError(false)} variant="outline">
            🔄 Try Again
          </Button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-2">
            <span className="text-4xl">🕸️</span>
            Knowledge Graph Explorer
          </h1>
          <p className="text-muted-foreground text-lg">
            Visualize relationships between papers, genes, authors, and concepts.
          </p>
        </div>

        {/* Controls Bar */}
        <Card className="mb-6 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[250px] relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search nodes..."
                  className="pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
              </div>

              {/* Layout selector buttons (simpler than Select for reliability) */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {['Force-Directed', 'Circular', 'Hierarchical', 'Grid'].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setSelectedLayout(layout.toLowerCase())}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedLayout === layout.toLowerCase()
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Badge variant="outline" className="py-1 px-3">
                  📊 {stats.nodes} Nodes
                </Badge>
                <Badge variant="outline" className="py-1 px-3">
                  🔗 {stats.edges} Edges
                </Badge>
                <Badge variant="outline" className="py-1 px-3">
                  🏷️ {stats.types} Types
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph Visualization - Takes 3 columns */}
          <div className="lg:col-span-3">
            <GraphVisualization 
              selectedNode={selectedNode} 
              onNodeSelect={setSelectedNode} 
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Node Detail Panel */}
            <NodeDetailPanel node={selectedNode} />

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">⚡ Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/query">
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    🔍 Search Related Papers
                  </Button>
                </Link>
                <Link href="/data">
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    💾 Export Graph Data
                  </Button>
                </Link>
                <Link href="/alphafold">
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    🧬 View Protein Structures
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">📈 Graph Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Nodes</span>
                  <span className="font-bold">{stats.nodes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Edges</span>
                  <span className="font-bold">{stats.edges}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Most Connected</span>
                  <span className="font-bold">{stats.maxConnections} links</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Current theme: <strong>CRISPR Gene Editing</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Type Legend */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">🎨 Node Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(NODE_TYPE_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: config.color }}
                      ></div>
                      <span className="text-sm font-medium">{config.icon} {config.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {SAMPLE_NODES.filter(n => n.type === key).length}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    );
  } catch (error) {
    console.error('Knowledge Graph render error:', error);
    setHasError(true);
    return null;
  }
}
