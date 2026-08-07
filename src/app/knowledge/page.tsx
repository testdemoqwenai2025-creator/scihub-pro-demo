'use client';

/**
 * SciHub Pro - Enhanced Knowledge Graph Page
 * 
 * Interactive knowledge visualization featuring:
 * - Pure SVG-based graph rendering (no external libraries)
 * - Multiple entity types (papers, genes, compounds, authors, concepts, domains)
 * - Rich relationship types with visual differentiation
 * - Force-directed, circular, hierarchical, and grid layouts
 * - Interactive zoom/pan controls
 * - Node detail panel with connected nodes
 * - Real-time statistics
 * - Export to PNG functionality
 * - Smooth CSS transitions and animations
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useSciHubStore } from '@/store/useSciHubStore';
import { createDynamicField } from '@/store/useDynamicStore';
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

type NodeType = 'paper' | 'gene' | 'compound' | 'author' | 'concept' | 'domain';
type EdgeType = 'cites' | 'studies' | 'interacts-with' | 'authored-by' | 'similar-to' | 'mentions';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  connections: number;
  importance: number; // 0-1 for sizing
  description?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number; // For line thickness
}

interface GraphViewSettings {
  showLabels: boolean;
  showEdges: boolean;
  nodeSizeBy: 'connections' | 'importance' | 'uniform';
  layout: 'force' | 'circular' | 'hierarchical' | 'grid';
  filterType: string;
  showIcons: boolean;
}

interface TransformState {
  scale: number;
  translateX: number;
  translateY: number;
}

// ============ CONSTANTS & CONFIGURATION ============

// Node type configuration
const NODE_TYPE_CONFIG: Record<NodeType, { color: string; icon: string; label: string }> = {
  paper: { color: '#3B82F6', icon: '📄', label: 'Paper' },
  gene: { color: '#10B981', icon: '🧬', label: 'Gene' },
  compound: { color: '#8B5CF6', icon: '⚗️', label: 'Compound' },
  author: { color: '#F59E0B', icon: '👤', label: 'Author' },
  concept: { color: '#06B6D4', icon: '💡', label: 'Concept' },
  domain: { color: '#EC4899', icon: '🏛️', label: 'Institution' },
};

// Edge type configuration
const EDGE_TYPE_CONFIG: Record<EdgeType, { color: string; dashArray?: string; label: string }> = {
  cites: { color: '#6B7280', label: 'Cites' },
  studies: { color: '#3B82F6', dashArray: '8,4', label: 'Studies' },
  'interacts-with': { color: '#8B5CF6', dashArray: '3,3', label: 'Interacts' },
  'authored-by': { color: '#10B981', label: 'Authored by' },
  'similar-to': { color: '#D1D5DB', dashArray: '5,5', label: 'Similar' },
  mentions: { color: '#F59E0B', dashArray: '10,3', label: 'Mentions' },
};

// SVG dimensions
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 700;

// ============ SAMPLE GRAPH DATA (CRISPR Gene Editing Theme) ============

const SAMPLE_NODES: Omit<GraphNode, 'x' | 'y'>[] = [
  // Papers
  { id: 'p1', label: 'CRISPR-Cas9 Review 2024', type: 'paper', connections: 8, importance: 0.95, description: 'Comprehensive review of CRISPR-Cas9 gene editing technology advances in 2024.' },
  { id: 'p2', label: 'Base Editing Advances', type: 'paper', connections: 6, importance: 0.85, description: 'Recent developments in base editing technology for precise genetic modifications.' },
  { id: 'p3', label: 'Therapeutic Applications', type: 'paper', connections: 5, importance: 0.80, description: 'Clinical applications of gene editing in treating genetic disorders.' },
  { id: 'p4', label: 'Off-Target Analysis Methods', type: 'paper', connections: 4, importance: 0.72, description: 'Computational and experimental methods for detecting off-target effects.' },
  
  // Genes
  { id: 'g1', label: 'BRCA1', type: 'gene', connections: 5, importance: 0.90, description: 'Breast cancer type 1 susceptibility protein, a key target for gene therapy research.' },
  { id: 'g2', label: 'TP53', type: 'gene', connections: 7, importance: 0.92, description: 'Tumor protein p53, the most frequently mutated gene in human cancers.' },
  { id: 'g3', label: 'CFTR', type: 'gene', connections: 4, importance: 0.75, description: 'Cystic fibrosis transmembrane conductance regulator, target for CF treatment.' },
  { id: 'g4', label: 'HBB', type: 'gene', connections: 3, importance: 0.70, description: 'Hemoglobin beta, target for sickle cell disease therapy.' },
  
  // Compounds
  { id: 'c1', label: 'Cas9 Protein', type: 'compound', connections: 8, importance: 0.95, description: 'The endonuclease enzyme that enables CRISPR-Cas9 gene editing.' },
  { id: 'c2', label: 'sgRNA', type: 'compound', connections: 6, importance: 0.88, description: 'Single guide RNA that directs Cas9 to specific DNA sequences.' },
  { id: 'c3', label: 'Prime Editor', type: 'compound', connections: 4, importance: 0.82, description: 'Next-generation editing system for precise DNA modifications.' },
  
  // Authors
  { id: 'a1', label: 'Doudna, J.', type: 'domain', connections: 5, importance: 0.95, description: 'Jennifer Doudna - Nobel laureate, co-inventor of CRISPR-Cas9 technology.' },
  { id: 'a2', label: 'Charpentier, E.', type: 'domain', connections: 5, importance: 0.93, description: 'Emmanuelle Charpentier - Nobel laureate, co-inventor of CRISPR-Cas9 technology.' },
  { id: 'a3', label: 'Zhang, F.', type: 'domain', connections: 4, importance: 0.87, description: 'Feng Zhang - Pioneer in CRISPR applications for mammalian cells.' },
  
  // Concepts
  { id: 'k1', label: 'Gene Therapy', type: 'concept', connections: 7, importance: 0.88, description: 'Therapeutic approach using genes to treat or prevent disease.' },
  { id: 'k2', label: 'Precision Medicine', type: 'concept', connections: 5, importance: 0.82, description: 'Medical care tailored to individual genetic profiles.' },
  { id: 'k3', label: 'Genome Engineering', type: 'concept', connections: 6, importance: 0.85, description: 'Direct manipulation of an organism\'s genetic material.' },
  
  // Institutions
  { id: 'i1', label: 'UC Berkeley', type: 'domain', connections: 4, importance: 0.78, description: 'University of California, Berkeley - Leading research domain in gene editing.' },
  { id: 'i2', label: 'MIT', type: 'domain', connections: 3, importance: 0.75, description: 'Massachusetts Institute of Technology - Hub for biotechnology innovation.' },
  { id: 'i3', label: 'Max Planck', type: 'domain', connections: 3, importance: 0.73, description: 'Max Planck Institute - European leader in molecular biology research.' },
];

const SAMPLE_EDGES: GraphEdge[] = [
  // Paper relationships
  { id: 'e1', source: 'p1', target: 'p2', type: 'cites', weight: 2 },
  { id: 'e2', source: 'p1', target: 'p3', type: 'cites', weight: 2 },
  { id: 'e3', source: 'p2', target: 'p4', type: 'cites', weight: 1 },
  { id: 'e4', source: 'p3', target: 'p4', type: 'similar-to', weight: 1 },
  
  // Paper-Gene relationships (studies)
  { id: 'e5', source: 'p1', target: 'g1', type: 'studies', weight: 3 },
  { id: 'e6', source: 'p1', target: 'g2', type: 'studies', weight: 3 },
  { id: 'e7', source: 'p2', target: 'g3', type: 'studies', weight: 2 },
  { id: 'e8', source: 'p3', target: 'g4', type: 'studies', weight: 2 },
  { id: 'e9', source: 'p4', target: 'g1', type: 'studies', weight: 2 },
  { id: 'e10', source: 'p4', target: 'g2', type: 'studies', weight: 2 },
  
  // Paper-Compound relationships (mentions)
  { id: 'e11', source: 'p1', target: 'c1', type: 'mentions', weight: 3 },
  { id: 'e12', source: 'p1', target: 'c2', type: 'mentions', weight: 3 },
  { id: 'e13', source: 'p2', target: 'c3', type: 'mentions', weight: 2 },
  { id: 'e14', source: 'p3', target: 'c1', type: 'mentions', weight: 2 },
  
  // Author-Paper relationships (authored-by)
  { id: 'e15', source: 'a1', target: 'p1', type: 'authored-by', weight: 2 },
  { id: 'e16', source: 'a2', target: 'p1', type: 'authored-by', weight: 2 },
  { id: 'e17', source: 'a3', target: 'p2', type: 'authored-by', weight: 2 },
  { id: 'e18', source: 'a3', target: 'p4', type: 'authored-by', weight: 2 },
  
  // Gene-Gene interactions
  { id: 'e19', source: 'g1', target: 'g2', type: 'interacts-with', weight: 3 },
  { id: 'e20', source: 'g2', target: 'g3', type: 'interacts-with', weight: 2 },
  { id: 'e21', source: 'g3', target: 'g4', type: 'similar-to', weight: 1 },
  
  // Compound-Compound interactions
  { id: 'e22', source: 'c1', target: 'c2', type: 'interacts-with', weight: 4 },
  { id: 'e23', source: 'c2', target: 'c3', type: 'similar-to', weight: 2 },
  
  // Concept relationships
  { id: 'e24', source: 'k1', target: 'k2', type: 'similar-to', weight: 2 },
  { id: 'e25', source: 'k1', target: 'k3', type: 'similar-to', weight: 3 },
  { id: 'e26', source: 'k2', target: 'k3', type: 'similar-to', weight: 2 },
  
  // Paper-Concept relationships
  { id: 'e27', source: 'p1', target: 'k3', type: 'mentions', weight: 2 },
  { id: 'e28', source: 'p3', target: 'k1', type: 'mentions', weight: 3 },
  { id: 'e29', source: 'p2', target: 'k2', type: 'mentions', weight: 2 },
  
  // Author-Institution relationships
  { id: 'e30', source: 'a1', target: 'i1', type: 'authored-by', weight: 2 },
  { id: 'e31', source: 'a3', target: 'i2', type: 'authored-by', weight: 2 },
  { id: 'e32', source: 'a2', target: 'i3', type: 'authored-by', weight: 2 },
  
  // Institution-Concept relationships
  { id: 'e33', source: 'i1', target: 'k3', type: 'mentions', weight: 2 },
  { id: 'e34', source: 'i2', target: 'k1', type: 'mentions', weight: 2 },
];

// ============ LAYOUT ALGORITHMS ============

function applyForceLayout(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const iterations = 100;
  
  // Initialize positions if not set
  const positionedNodes = nodes.map(node => ({
    ...node,
    x: node.x || centerX + (Math.random() - 0.5) * 200,
    y: node.y || centerY + (Math.random() - 0.5) * 200,
  }));
  
  // Create adjacency map for faster lookup
  const adjacencyMap = new Map<string, { node: GraphNode; edge: GraphEdge}[]>();
  edges.forEach(edge => {
    if (!adjacencyMap.has(edge.source)) adjacencyMap.set(edge.source, []);
    if (!adjacencyMap.has(edge.target)) adjacencyMap.set(edge.target, []);
    const sourceNode = positionedNodes.find(n => n.id === edge.source);
    const targetNode = positionedNodes.find(n => n.id === edge.target);
    if (sourceNode) adjacencyMap.get(edge.source)!.push({ node: targetNode!, edge });
    if (targetNode) adjacencyMap.get(edge.target)!.push({ node: sourceNode!, edge });
  });
  
  // Simulate force-directed layout
  for (let iter = 0; iter < iterations; iter++) {
    const temperature = 1 - iter / iterations;
    
    positionedNodes.forEach((node, i) => {
      let fx = 0, fy = 0;
      
      // Repulsion between all nodes
      positionedNodes.forEach((other, j) => {
        if (i === j) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 1500 / (dist * dist);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      });
      
      // Attraction along edges
      const neighbors = adjacencyMap.get(node.id) || [];
      neighbors.forEach(({ node: other, edge }) => {
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * 0.01 * edge.weight;
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      });
      
      // Gravity toward center
      fx += (centerX - node.x) * 0.01;
      fy += (centerY - node.y) * 0.01;
      
      // Apply forces with temperature damping
      node.x += fx * temperature * 0.1;
      node.y += fy * temperature * 0.1;
      
      // Keep within bounds
      node.x = Math.max(50, Math.min(SVG_WIDTH - 50, node.x));
      node.y = Math.max(50, Math.min(SVG_HEIGHT - 50, node.y));
    });
  }
  
  return positionedNodes;
}

function applyCircularLayout(nodes: GraphNode[]): GraphNode[] {
  const centerX = SVG_WIDTH / 2;
  const centerY = SVG_HEIGHT / 2;
  const radius = Math.min(centerX, centerY) - 80;
  
  return nodes.map((node, i) => ({
    ...node,
    x: centerX + radius * Math.cos((i / nodes.length) * Math.PI * 2 - Math.PI / 2),
    y: centerY + radius * Math.sin((i / nodes.length) * Math.PI * 2 - Math.PI / 2),
  }));
}

function applyHierarchicalLayout(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  // Group nodes by type for hierarchical arrangement
  const typeOrder: NodeType[] = ['concept', 'paper', 'gene', 'compound', 'author', 'domain'];
  const groups: Record<string, GraphNode[]> = {};
  
  typeOrder.forEach(type => {
    groups[type] = nodes.filter(n => n.type === type);
  });
  
  const levelHeight = (SVG_HEIGHT - 100) / typeOrder.length;
  const positionedNodes: GraphNode[] = [];
  
  typeOrder.forEach((type, levelIndex) => {
    const groupNodes = groups[type];
    const y = 80 + levelIndex * levelHeight + levelHeight / 2;
    const groupWidth = (SVG_WIDTH - 100) / (groupNodes.length + 1);
    
    groupNodes.forEach((node, i) => {
      positionedNodes.push({
        ...node,
        x: 50 + groupWidth * (i + 1),
        y,
      });
    });
  });
  
  return positionedNodes;
}

function applyGridLayout(nodes: GraphNode[]): GraphNode[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const rows = Math.ceil(nodes.length / cols);
  const cellWidth = (SVG_WIDTH - 100) / cols;
  const cellHeight = (SVG_HEIGHT - 100) / rows;
  
  return nodes.map((node, i) => ({
    ...node,
    x: 50 + cellWidth * (i % cols) + cellWidth / 2,
    y: 50 + cellHeight * Math.floor(i / cols) + cellHeight / 2,
  }));
}

// ============ HELPER FUNCTIONS ============

function getNodeColor(type: NodeType): string {
  return NODE_TYPE_CONFIG[type]?.color || '#6B7280';
}

function getNodeIcon(type: NodeType): string {
  return NODE_TYPE_CONFIG[type]?.icon || '📍';
}

function getEdgeColor(type: EdgeType): string {
  return EDGE_TYPE_CONFIG[type]?.color || '#6B7280';
}

function getEdgeDashArray(type: EdgeType): string | undefined {
  return EDGE_TYPE_CONFIG[type]?.dashArray;
}

function getNodeRadius(node: GraphNode, sizeBy: GraphViewSettings['nodeSizeBy']): number {
  switch (sizeBy) {
    case 'connections':
      return 15 + Math.min(node.connections, 10) * 2.5;
    case 'importance':
      return 15 + node.importance * 20;
    case 'uniform':
    default:
      return 25;
  }
}

// ============ MAIN COMPONENT ============

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
    nodeSizeBy: 'importance',
    layout: 'force',
    filterType: 'all',
    showIcons: true,
  });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState<TransformState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Initialize with sample data on first load
  useEffect(() => {
    if (!isInitialized && graphNodes.length === 0) {
      // Initialize nodes with positions
      const initializedNodes: GraphNode[] = SAMPLE_NODES.map(node => ({
        ...node,
        x: SVG_WIDTH / 2 + (Math.random() - 0.5) * 300,
        y: SVG_HEIGHT / 2 + (Math.random() - 0.5) * 200,
      }));
      
      initializedNodes.forEach(node => addGraphNode({
        ...node,
        label: typeof node.label === 'string' ? createDynamicField(node.label) : node.label,
      } as any));
      SAMPLE_EDGES.forEach(edge => addGraphEdge({
        ...edge,
        strength: edge.weight || 1,
      } as any));
      setIsInitialized(true);
      
      addActivity({
        type: 'query',
        message: createDynamicField('Loaded CRISPR Gene Editing knowledge graph (22 nodes, 34 edges)'),
        icon: '🕸️',
      });
    }
  }, []);

  // Apply layout algorithm when layout setting changes
  const positionedNodes = useMemo(() => {
    if (graphNodes.length === 0) return [];
    
    let result: GraphNode[];
    
    switch (settings.layout) {
      case 'force':
        result = applyForceLayout(graphNodes as unknown as GraphNode[], graphEdges as unknown as GraphEdge[]);
        break;
      case 'circular':
        result = applyCircularLayout(graphNodes as unknown as GraphNode[]);
        break;
      case 'hierarchical':
        result = applyHierarchicalLayout(graphNodes as unknown as GraphNode[], graphEdges as unknown as GraphEdge[]);
        break;
      case 'grid':
        result = applyGridLayout(graphNodes as unknown as GraphNode[]);
        break;
      default:
        result = graphNodes as unknown as GraphNode[];
    }
    
    return result;
  }, [graphNodes, graphEdges, settings.layout]);

  // Filter nodes based on settings
  const filteredNodes = useMemo(() => {
    if (settings.filterType === 'all') return positionedNodes;
    return positionedNodes.filter(node => node.type === settings.filterType);
  }, [positionedNodes, settings.filterType]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return (graphEdges as unknown as GraphEdge[]).filter(
      edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
  }, [graphEdges, filteredNodes]);

  // Get selected node details
  const selectedNodeData = filteredNodes.find(n => n.id === selectedNode);
  const connectedEdges = filteredEdges.filter(
    e => e.source === selectedNode || e.target === selectedNode
  );
  const connectedNodeIds = connectedEdges.flatMap(e => [e.source, e.target]);
  const connectedNodes = filteredNodes.filter(n => connectedNodeIds.includes(n.id) && n.id !== selectedNode);

  // Statistics
  const stats = useMemo(() => {
    const totalNodes = filteredNodes.length;
    const totalEdges = filteredEdges.length;
    const avgConnections = totalNodes > 0 
      ? (filteredNodes.reduce((sum, n) => sum + n.connections, 0) / totalNodes).toFixed(1)
      : '0';
    const nodeTypes = [...new Set(filteredNodes.map(n => n.type))];
    const maxConnections = Math.max(...filteredNodes.map(n => n.connections), 0);
    
    return { totalNodes, totalEdges, avgConnections, nodeTypes, maxConnections };
  }, [filteredNodes, filteredEdges]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.3) }));
  }, []);

  const handleResetView = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  const handleFitToScreen = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.translateX, y: e.clientY - transform.translateY });
    }
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        translateX: e.clientX - dragStart.x,
        translateY: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Export to PNG
  const handleExportPNG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = SVG_WIDTH * 2;
    canvas.height = SVG_HEIGHT * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = 'knowledge-graph.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      addActivity({
        type: 'save',
        message: createDynamicField('Exported knowledge graph as PNG'),
        icon: '📷',
      });
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [addActivity]);

  // Save current graph state
  const handleSaveGraph = () => {
    saveItem({
      type: 'query',
      title: `Knowledge Graph (${stats.totalNodes} nodes)`,
      source: 'knowledge-graph',
      metadata: {
        nodeCount: stats.totalNodes,
        edgeCount: stats.totalEdges,
        nodeTypes: stats.nodeTypes,
      },
      tags: ['knowledge-graph', 'visualization'],
    });

    addActivity({
      type: 'save',
      message: createDynamicField(`Saved graph snapshot: ${stats.totalNodes} nodes, ${stats.totalEdges} edges`),
      icon: '🕸️',
    });
  };

  // Search handler
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const found = filteredNodes.find(n => 
        n.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found) {
        setSelectedNode(found.id);
        addActivity({
          type: 'query',
          message: createDynamicField(`Found node: ${found.label}`),
          icon: getNodeIcon(found.type as NodeType),
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="text-3xl">🕸️</span>
              {t('knowledge.title') || 'Knowledge Graph'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Explore relationships between papers, genes, compounds, authors, and domains
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-3">
            <StatBadge label="Nodes" value={stats.totalNodes.toString()} color="blue" />
            <StatBadge label="Edges" value={stats.totalEdges.toString()} color="green" />
            <StatBadge label="Types" value={stats.nodeTypes.length.toString()} color="purple" />
            <StatBadge label="Avg Conn." value={stats.avgConnections} color="orange" />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Main Graph Area */}
        <div className="flex-1 relative overflow-hidden">
          <Card className="h-full rounded-none border-0 shadow-none">
            <CardContent className="p-0 h-full relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              
              {/* SVG Visualization */}
              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{
                  transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
                  transformOrigin: 'center',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  handleMouseUp();
                  setHoveredNode(null);
                }}
              >
                <defs>
                  {/* Arrow markers for different edge types */}
                  <marker id="arrowhead-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                  </marker>
                  <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                  </marker>
                  <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
                  </marker>
                  <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
                  </marker>
                  
                  {/* Glow filters */}
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Shadow filter for nodes */}
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </filter>
                </defs>
                
                {/* Edges Layer */}
                {settings.showEdges && filteredEdges.map(edge => {
                  const source = filteredNodes.find(n => n.id === edge.source);
                  const target = filteredNodes.find(n => n.id === edge.target);
                  if (!source || !target) return null;
                  
                  const isHighlighted = selectedNode && 
                    (edge.source === selectedNode || edge.target === selectedNode);
                  const isConnectedToHovered = hoveredNode && 
                    (edge.source === hoveredNode || edge.target === hoveredNode);
                  
                  return (
                    <g key={edge.id}>
                      {/* Edge line */}
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={getEdgeColor(edge.type)}
                        strokeWidth={edge.weight * (isHighlighted || isConnectedToHovered ? 1.5 : 1)}
                        strokeDasharray={getEdgeDashArray(edge.type)}
                        opacity={isHighlighted ? 1 : isConnectedToHovered ? 0.8 : 0.5}
                        markerEnd={`url(#arrowhead-${edge.type === 'cites' ? 'gray' : edge.type === 'studies' ? 'blue' : edge.type === 'interacts-with' ? 'purple' : 'green'})`}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}
                
                {/* Nodes Layer */}
                {filteredNodes.map(node => {
                  const isSelected = node.id === selectedNode;
                  const isHovered = node.id === hoveredNode;
                  const isConnected = selectedNode && connectedNodeIds.includes(node.id);
                  const radius = getNodeRadius(node, settings.nodeSizeBy);
                  const config = NODE_TYPE_CONFIG[node.type];
                  
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node.id);
                        addActivity({
                          type: 'query',
                          message: createDynamicField(`Selected: ${node.label}`),
                          icon: config.icon,
                        });
                      }}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                      style={{ transition: 'transform 0.2s ease-out' }}
                    >
                      {/* Outer ring for selection/hover */}
                      {(isSelected || isHovered) && (
                        <circle
                          r={radius + 8}
                          fill="none"
                          stroke={config.color}
                          strokeWidth={2}
                          opacity={0.3}
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Main node circle */}
                      <circle
                        r={radius}
                        fill={config.color}
                        stroke={isSelected ? '#000' : '#fff'}
                        strokeWidth={isSelected ? 3 : 2}
                        opacity={isSelected || isHovered || isConnected ? 1 : 0.85}
                        filter="url(#shadow)"
                        className="transition-all duration-200 ease-out"
                        style={{
                          transform: isSelected || isHovered ? 'scale(1.1)' : 'scale(1)',
                          transformOrigin: 'center',
                        }}
                      />
                      
                      {/* Inner gradient overlay */}
                      <circle
                        r={radius - 4}
                        fill="url(#gradient-overlay)"
                        opacity={0.2}
                      />
                      
                      {/* Node icon or initial */}
                      {settings.showIcons && (
                        <text
                          textAnchor="middle"
                          dy={radius > 25 ? 8 : 5}
                          fontSize={radius > 25 ? 16 : 12}
                          className="pointer-events-none select-none"
                        >
                          {config.icon}
                        </text>
                      )}
                      
                      {/* Label */}
                      {(settings.showLabels || isSelected || isHovered) && (
                        <text
                          y={radius + 18}
                          textAnchor="middle"
                          fontSize={isSelected ? 12 : 11}
                          fontWeight={isSelected ? 600 : 400}
                          fill="#1f2937"
                          className="pointer-events-none select-none"
                          style={{
                            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                          }}
                        >
                          {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                        </text>
                      )}
                      
                      {/* Connection count badge */}
                      {!settings.showLabels && !isSelected && !isHovered && (
                        <>
                        <circle
                          cy={-radius + 2}
                          r={10}
                          fill="#374151"
                          opacity={0.9}
                        />
                        <text
                          y={-radius + 6}
                          textAnchor="middle"
                          fontSize={9}
                          fill="#fff"
                          fontWeight={600}
                          className="pointer-events-none select-none"
                        >
                          {node.connections}
                        </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Controls Panel - Top Left */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {/* Filter Dropdown */}
                <Select 
                  value={settings.filterType} 
                  onValueChange={(v) => setSettings({ ...settings, filterType: v })}
                >
                  <SelectTrigger className="w-[150px] h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border shadow-sm">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌐 All Types</SelectItem>
                    {(Object.entries(NODE_TYPE_CONFIG) as [NodeType, typeof NODE_TYPE_CONFIG[NodeType]][]).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        {config.icon} {config.label}s
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Layout Dropdown */}
                <Select 
                  value={settings.layout} 
                  onValueChange={(v) => setSettings({ ...settings, layout: v as GraphViewSettings['layout'] })}
                >
                  <SelectTrigger className="w-[150px] h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border shadow-sm">
                    <SelectValue placeholder="Layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="force">⚡ Force-Directed</SelectItem>
                    <SelectItem value="circular">⭕ Circular</SelectItem>
                    <SelectItem value="hierarchical">📊 Hierarchical</SelectItem>
                    <SelectItem value="grid">🔲 Grid</SelectItem>
                  </SelectContent>
                </Select>

                {/* Size By Dropdown */}
                <Select 
                  value={settings.nodeSizeBy} 
                  onValueChange={(v) => setSettings({ ...settings, nodeSizeBy: v as GraphViewSettings['nodeSizeBy'] })}
                >
                  <SelectTrigger className="w-[150px] h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border shadow-sm">
                    <SelectValue placeholder="Node size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="importance">⭐ Importance</SelectItem>
                    <SelectItem value="connections">🔗 Connections</SelectItem>
                    <SelectItem value="uniform">⬜ Uniform</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons - Top Right */}
              <div className="absolute top-4 right-4 flex flex-wrap gap-2 z-10">
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 px-2"
                    onClick={() => setSettings({ ...settings, showLabels: !settings.showLabels })}
                    title={settings.showLabels ? 'Hide labels' : 'Show labels'}
                  >
                    🏷️ {settings.showLabels ? 'Hide Labels' : 'Show Labels'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 px-2"
                    onClick={() => setSettings({ ...settings, showEdges: !settings.showEdges })}
                    title={settings.showEdges ? 'Hide edges' : 'Show edges'}
                  >
                    🔗 {settings.showEdges ? 'Hide Edges' : 'Show Edges'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 px-2"
                    onClick={() => setSettings({ ...settings, showIcons: !settings.showIcons })}
                    title={settings.showIcons ? 'Hide icons' : 'Show icons'}
                  >
                    😊 {settings.showIcons ? 'Hide Icons' : 'Show Icons'}
                  </Button>
                </ButtonGroup>

                <ButtonGroup>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 w-8 p-0"
                    onClick={handleZoomOut}
                    title="Zoom out"
                  >
                    ➖
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 w-8 p-0"
                    onClick={handleZoomIn}
                    title="Zoom in"
                  >
                    ➕
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 w-8 p-0"
                    onClick={handleResetView}
                    title="Reset view"
                  >
                    ↺
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 w-8 p-0"
                    onClick={handleFitToScreen}
                    title="Fit to screen"
                  >
                    ⛶
                  </Button>
                </ButtonGroup>

                <ButtonGroup>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 px-2"
                    onClick={handleExportPNG}
                    title="Export as PNG"
                  >
                    📷 Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm h-8 px-2"
                    onClick={handleSaveGraph}
                    title="Save graph"
                  >
                    💾 Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 backdrop-blur-sm h-8 px-2"
                    onClick={() => {
                      clearGraph();
                      setIsInitialized(false);
                      setSelectedNode(null);
                    }}
                    title="Reset graph"
                  >
                    🔄 Reset
                  </Button>
                </ButtonGroup>
              </div>

              {/* Legend - Bottom Left */}
              <div className="absolute bottom-4 left-4 p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl border shadow-lg z-10">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Legend
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {(Object.entries(NODE_TYPE_CONFIG) as [NodeType, typeof NODE_TYPE_CONFIG[NodeType]][]).map(([type, config]) => (
                    <button
                      key={type}
                      className="flex items-center gap-2 text-xs hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
                      onClick={() => setSettings({ ...settings, filterType: type })}
                    >
                      <span 
                        className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" 
                        style={{ backgroundColor: config.color }}
                      />
                      <span>{config.icon} {config.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="border-t mt-2 pt-2">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    Relationships
                  </h4>
                  <div className="space-y-1">
                    {(Object.entries(EDGE_TYPE_CONFIG) as [EdgeType, typeof EDGE_TYPE_CONFIG[EdgeType]][]).slice(0, 4).map(([type, config]) => (
                      <div key={type} className="flex items-center gap-2 text-xs">
                        <svg width="24" height="2" className="flex-shrink-0">
                          <line 
                            x1="0" y1="1" x2="24" y2="1" 
                            stroke={config.color} 
                            strokeWidth="2"
                            strokeDasharray={config.dashArray}
                          />
                        </svg>
                        <span className="text-muted-foreground">{config.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Zoom Indicator - Bottom Right */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border shadow-sm text-xs font-mono z-10">
                🔍 {Math.round(transform.scale * 100)}%
              </div>

              {/* Hover Tooltip */}
              {hoveredNode && selectedNode !== hoveredNode && (() => {
                const node = filteredNodes.find(n => n.id === hoveredNode);
                if (!node) return null;
                const config = NODE_TYPE_CONFIG[node.type];
                return (
                  <div 
                    className="absolute pointer-events-none px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg shadow-xl text-sm z-20 animate-in fade-in duration-150"
                    style={{
                      left: Math.min(Math.max(node.x * transform.scale + transform.translateX, 100), window.innerWidth - 200),
                      top: Math.max(node.y * transform.scale + transform.translateY - 60, 10),
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="font-semibold">{node.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                        {config.label}
                      </span>
                      <span>🔗 {node.connections} connections</span>
                    </div>
                    {node.description && (
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                        {node.description}
                      </p>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Details Panel - Right Sidebar */}
        {showDetailsPanel && selectedNodeData && (
          <div className="w-80 border-l bg-card overflow-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-lg">Node Details</h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setShowDetailsPanel(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="p-4 space-y-5">
              {/* Node Header */}
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border">
                <span className="text-4xl block mb-2 drop-shadow-sm">
                  {getNodeIcon(selectedNodeData.type as NodeType)}
                </span>
                <h3 className="font-bold text-lg leading-tight">{selectedNodeData.label}</h3>
                <Badge 
                  className="mt-2 text-white border-0 shadow-sm"
                  style={{ backgroundColor: getNodeColor(selectedNodeData.type as NodeType) }}
                >
                  {NODE_TYPE_CONFIG[selectedNodeData.type as NodeType]?.label || selectedNodeData.type}
                </Badge>
              </div>

              {/* Description */}
              {selectedNodeData.description && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedNodeData.description}
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard 
                  icon="🔗" 
                  label="Connections" 
                  value={selectedNodeData.connections.toString()} 
                />
                <StatCard 
                  icon="⭐" 
                  label="Importance" 
                  value={`${(selectedNodeData.importance * 100).toFixed(0)}%`} 
                />
                <StatCard 
                  icon="📍" 
                  label="Position" 
                  value={`(${Math.round(selectedNodeData.x)}, ${Math.round(selectedNodeData.y)})`}
                  small
                />
                <StatCard 
                  icon="📐" 
                  label="Radius" 
                  value={getNodeRadius(selectedNodeData, settings.nodeSizeBy).toFixed(0)}
                  suffix="px"
                  small
                />
              </div>

              {/* Connected Nodes */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span>🔗</span> Connected Nodes ({connectedNodes.length})
                </h4>
                <div className="space-y-1 max-h-52 overflow-auto pr-1 custom-scrollbar">
                  {connectedNodes.length > 0 ? connectedNodes.map(node => {
                    const edge = connectedEdges.find(e => 
                      (e.source === selectedNode && e.target === node.id) ||
                      (e.target === selectedNode && e.source === node.id)
                    );
                    return (
                      <button
                        key={node.id}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-muted transition-all duration-150 text-sm flex items-center gap-3 group border border-transparent hover:border-border"
                        onClick={() => setSelectedNode(node.id)}
                      >
                        <span 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: `${getNodeColor(node.type as NodeType)}20` }}
                        >
                          {getNodeIcon(node.type as NodeType)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate group-hover:text-primary transition-colors">
                            {node.label}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: getNodeColor(node.type as NodeType) }} 
                            />
                            {NODE_TYPE_CONFIG[node.type as NodeType]?.label}
                            {edge && (
                              <>
                                <span className="mx-1">·</span>
                                <span style={{ color: getEdgeColor(edge.type as EdgeType) }}>
                                  {EDGE_TYPE_CONFIG[edge.type as EdgeType]?.label}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  }) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No connected nodes
                    </p>
                  )}
                </div>
              </div>

              {/* Relationships */}
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <span>↔️</span> Relationships ({connectedEdges.length})
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-auto pr-1 custom-scrollbar">
                  {connectedEdges.map((edge, i) => {
                    const otherNodeId = edge.source === selectedNode ? edge.target : edge.source;
                    const otherNode = filteredNodes.find(n => n.id === otherNodeId);
                    const edgeConfig = EDGE_TYPE_CONFIG[edge.type as EdgeType];
                    return (
                      <div 
                        key={i} 
                        className="p-2 bg-muted/30 rounded-lg flex items-center justify-between text-xs group hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <svg width="20" height="2">
                            <line 
                              x1="0" y1="1" x2="20" y2="1" 
                              stroke={edgeConfig?.color || '#6B7280'} 
                              strokeWidth="2"
                              strokeDasharray={edgeConfig?.dashArray}
                            />
                          </svg>
                          <span className="font-medium" style={{ color: edgeConfig?.color }}>
                            {edgeConfig?.label || edge.type}
                          </span>
                        </div>
                        <span className="text-muted-foreground truncate max-w-[100px]">
                          → {otherNode?.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t">
                <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                  🔍 Find Related Papers
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                  📊 View Analysis
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                  ⭐ Save to Library
                </Button>
                <Button size="sm" variant="default" className="w-full justify-start gap-2">
                  🚀 Explore Further
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Show panel button when hidden */}
        {!showDetailsPanel && selectedNode && (
          <Button
            className="fixed right-4 top-1/2 -translate-y-1/2 z-20 rounded-l-none rounded-r-lg shadow-lg"
            size="sm"
            onClick={() => setShowDetailsPanel(true)}
          >
            ◀ Details
          </Button>
        )}
      </div>

      {/* Search Bar - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-30">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search nodes by name... (e.g., BRCA1, Doudna, Cas9)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </span>
          </div>
          <Button onClick={handleSearch} className="h-10">
            Search
          </Button>
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground pl-2 border-l">
            <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">Click</kbd>
            <span>Select node</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono ml-2">Drag</kbd>
            <span>Pan view</span>
          </div>
        </div>
      </div>

      {/* Empty State when no data */}
      {graphNodes.length === 0 && !isInitialized && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-40">
          <Card className="max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <span className="text-5xl block mb-4">🕸️</span>
              <h3 className="text-xl font-bold mb-2">Loading Knowledge Graph...</h3>
              <p className="text-muted-foreground mb-4">
                Preparing your interactive visualization
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call-to-action for advanced features */}
      <Card className="m-4 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
                🔮 Unlock Advanced Graph Features
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Get real-time collaboration, larger graphs (10K+ nodes), custom layouts, AI-powered insights, and more with Pro tier.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 whitespace-nowrap"
              onClick={() => store.triggerUpgradePrompt('collaboration')}
            >
              Upgrade to Pro →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: hsl(var(--muted-foreground) / 0.5);
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${colorClasses[color] || ''}`}>
      <span className="text-muted-foreground mr-1">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value, suffix = '', small = false }: { 
  icon: string; 
  label: string; 
  value: string; 
  suffix?: string;
  small?: boolean;
}) {
  return (
    <div className={`p-3 bg-muted/50 rounded-lg text-center ${small ? 'p-2' : ''}`}>
      <div className={`font-bold text-foreground ${small ? 'text-sm' : 'text-lg'}`}>
        {value}{suffix}
      </div>
      <div className={`text-muted-foreground ${small ? 'text-[10px]' : 'text-xs'} flex items-center justify-center gap-1`}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

function ButtonGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg border shadow-sm overflow-hidden">
      {children}
    </div>
  );
}
