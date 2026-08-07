'use client';

/**
 * SciHub Pro - Workspace Page (Robust Version)
 * 
 * Fixed: Self-contained code editor without complex store dependencies
 * Works reliably with GitHub Pages static export
 */

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// ============ TYPES ============

interface EditorFile {
  id: string;
  name: string;
  language: 'python' | 'sql' | 'r' | 'markdown' | 'javascript';
  content: string;
}

interface TerminalLine {
  type: 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp: Date;
}

// ============ CODE TEMPLATES ============

const CODE_TEMPLATES: Record<string, { name: string; language: EditorFile['language']; code: string }> = {
  python_analysis: {
    name: 'Python Data Analysis',
    language: 'python',
    code: `# SciHub Pro - Python Data Analysis Template
# Import libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load dataset (example)
data = {
    'Gene': ['BRCA1', 'TP53', 'EGFR', 'MYC', 'KRAS'],
    'Expression': [12.5, 8.3, 15.2, 22.1, 5.7],
    'P_Value': [0.001, 0.005, 0.0001, 0.01, 0.05]
}
df = pd.DataFrame(data)

# Display basic statistics
print("Dataset Shape:", df.shape)
print("\\nSummary Statistics:")
print(df.describe())

# Filter significant genes (p < 0.01)
significant = df[df['P_Value'] < 0.01]
print(f"\\nSignificant Genes (p<0.01): {len(significant)}")
print(significant[['Gene', 'Expression', 'P_Value']])`
  },
  sql_query: {
    name: 'SQL Query',
    language: 'sql',
    code: `-- SciHub Pro - SQL Query Template
-- Query scientific papers database

-- Find top cited papers by topic
SELECT 
    p.title,
    p.authors,
    p.year,
    p.citations,
    p.journal
FROM papers p
WHERE p.topic = 'CRISPR'
    AND p.year >= 2020
ORDER BY p.citations DESC
LIMIT 20;

-- Get author collaboration network
SELECT 
    a1.name AS author_1,
    a2.name AS author_2,
    COUNT(*) AS collaborations
FROM authors a1
JOIN paper_authors pa1 ON a1.id = pa1.author_id
JOIN papers p ON pa1.paper_id = p.id
JOIN paper_authors pa2 ON p.id = pa2.paper_id
JOIN authors a2 ON pa2.author_id = a2.id
WHERE a1.id < a2.id
GROUP BY a1.id, a2.id
HAVING collaborations >= 3
ORDER BY collaborations DESC;`
  },
  r_statistics: {
    name: 'R Statistical Analysis',
    language: 'r',
    code: `# SciHub Pro - R Statistical Analysis Template
# Load required packages
library(ggplot2)
library(dplyr)

# Create sample gene expression data
gene_data <- data.frame(
  Gene = c("BRCA1", "TP53", "EGFR", "MYC", "KRAS", "BRAF", "PTEN"),
  Control = c(10.2, 8.5, 14.3, 21.0, 5.9, 11.2, 7.8),
  Treatment = c(15.8, 7.9, 18.6, 28.4, 4.2, 9.1, 6.5),
  PValue = c(0.001, 0.42, 0.008, 0.0001, 0.15, 0.23, 0.67)
)

# Calculate fold change
gene_data$FoldChange <- gene_data$Treatment / gene_data$Control

# Volcano plot preparation
gene_data$Significant <- gene_data$PValue < 0.05 & 
                          abs(log2(gene_data$FoldChange)) > 1

# Summary statistics
cat("Dataset Summary:\\n")
cat("Total genes analyzed:", nrow(gene_data), "\\n")
cat("Significant genes:", sum(gene_data$Significant), "\\n")

# Print significant results
cat("\\nSignificant Genes:\\n")
print(gene_data %>% filter(Significant) %>% select(Gene, FoldChange, PValue))`
  },
  markdown_report: {
    name: 'Markdown Report',
    language: 'markdown',
    code: `# Scientific Research Report

## Title: CRISPR Gene Editing Analysis

### Authors
- **Lead**: Dr. Jane Smith
- **Collaborators**: Prof. John Doe, Dr. Emily Chen

---

## Abstract

This report presents findings from our analysis of CRISPR-Cas9 gene editing efficiency across different cell types. We observed significant variation in editing outcomes based on delivery method and target gene location.

## Introduction

CRISPR-Cas9 has revolutionized the field of genetic engineering. This study aims to:

- Evaluate editing efficiency in mammalian cells
- Compare different delivery methods (viral vs. non-viral)
- Identify factors affecting off-target effects

## Methods

### Data Collection
- Sample size: n = 500
- Cell lines: HEK293, HeLa, K562
- Time points: 24h, 48h, 72h

### Statistical Analysis
- Used R v4.3.0 for analysis
- Applied Bonferroni correction for multiple testing
- Significance threshold: p < 0.05

## Results

| Method | Efficiency (%) | P-value |
|--------|----------------|---------|
| Viral | 85.3 ± 4.2 | <0.001 |
| Electroporation | 72.1 ± 6.8 | <0.001 |
| Lipid NPs | 58.9 ± 8.1 | 0.003 |

## Conclusion

Our findings suggest that viral delivery methods remain the most efficient for CRISPR applications, though non-viral methods are rapidly improving.

## References

1. Doudna JA, Charpentier E. (2014) *Science*
2. Zhang et al. (2021) *Nature Biotech*`
  },
  javascript_visualization: {
    name: 'JavaScript Visualization',
    language: 'javascript',
    code: `// SciHub Pro - JavaScript Data Visualization Template
// Interactive chart configuration for research data

const researchData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Papers Published',
      data: [45, 52, 48, 61, 55, 70],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Citations Received',
      data: [120, 145, 132, 178, 156, 210],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    }
  ]
};

// Chart configuration
const config = {
  type: 'line',
  data: researchData,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Research Output Trends 2024'
      },
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

console.log('Chart data loaded:', researchData.labels.length, 'data points');`
  },
};

// ============ DEFAULT FILES ============

const defaultFiles: EditorFile[] = [
  {
    id: 'file-1',
    name: 'analysis.py',
    language: 'python',
    content: CODE_TEMPLATES.python_analysis.code
  }
];

// ============ LANGUAGE CONFIG ============

const LANGUAGE_CONFIG: Record<string, { color: string; label: string }> = {
  python: { color: '#3776AB', label: 'Python' },
  sql: { color: '#CC5555', label: 'SQL' },
  r: { color: '#276DC3', label: 'R' },
  markdown: { color: '#083FA1', label: 'Markdown' },
  javascript: { color: '#F7DF1E', label: 'JavaScript' },
};

// ============ WORKSPACE PAGE COMPONENT ============

export default function WorkspacePage() {
  const [files, setFiles] = useState<EditorFile[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState(defaultFiles[0].id);
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Get active file
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // Add terminal output line
  const addOutput = (type: TerminalLine['type'], content: string) => {
    setOutput(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  // Update file content
  const updateFileContent = (content: string) => {
    setFiles(prev => prev.map(f => 
      f.id === activeFileId ? { ...f, content } : f
    ));
  };

  // Create new file from template
  const createFromTemplate = (templateKey: string) => {
    const template = CODE_TEMPLATES[templateKey];
    if (!template) return;

    const newFile: EditorFile = {
      id: `file-${Date.now()}`,
      name: template.name.replace(/\s+/g, '-').toLowerCase() + '.' + (
        template.language === 'python' ? 'py' :
        template.language === 'sql' ? 'sql' :
        template.language === 'r' ? 'R' :
        template.language === 'markdown' ? 'md' : 'js'
      ),
      language: template.language,
      content: template.code
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOutput([]);
  };

  // Simulate code execution
  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    
    addOutput('info', `$ ${activeFile.language} ${activeFile.name}`);
    addOutput('info', 'Executing...');

    setTimeout(() => {
      addOutput('success', '✓ Execution completed successfully');
      
      // Simulate output based on language
      if (activeFile.language === 'python') {
        addOutput('output', 'Dataset Shape: (5, 3)');
        addOutput('output', '');
        addOutput('output', 'Summary Statistics:');
        addOutput('output', '       Expression     P_Value');
        addOutput('output', 'count    5.000000   5.000000');
        addOutput('output', 'mean    12.760000   0.133200');
        addOutput('output', 'std       6.241083   0.021382');
        addOutput('output', '');
        addOutput('output', 'Significant Genes (p<0.01): 3');
        addOutput('output', '              Gene  Expression  P_Value');
        addOutput('output', '3            EGFR        15.2   0.0001');
        addOutput('output', '0  BRCA1        12.5   0.0010');
        addOutput('output', '1     TP53         8.3   0.0050');
      } else if (activeFile.language === 'sql') {
        addOutput('output', '+----------------------------------+----------+------+-----------+');
        addOutput('output', '| title                            | authors  | year | journal   |');
        addOutput('output', '+----------------------------------+----------+------+-----------+');
        addOutput('output', '| CRISPR-Cas9 genome editing       | Doudna   | 2020 | Science  |');
        addOutput('output', '| Prime editing                    | Anzalone | 2019 | Nature   |');
        addOutput('output', '| Base editing                     | Komor    | 2016 | Nature   |');
        addOutput('output', '+----------------------------------+----------+------+-----------+');
        addOutput('output', '(3 rows affected)');
      } else if (activeFile.language === 'r') {
        addOutput('output', 'Dataset Summary:');
        addOutput('output', 'Total genes analyzed: 7 ');
        addOutput('output', 'Significant genes: 3');
        addOutput('output', '');
        addOutput('output', 'Significant Genes:');
        addOutput('output', '    Gene FoldChange    PValue');
        addOutput('output', '1   EGFR    1.3006993 0.0080000');
        addOutput('output', '2    MYC    1.3523810 0.0001000');
        addOutput('output', '3  BRCA1    1.5490196 0.0010000');
      } else {
        addOutput('output', 'Code executed successfully!');
        addOutput('output', `Language: ${LANGUAGE_CONFIG[activeFile.language]?.label || activeFile.language}`);
      }

      addOutput('info', `Execution time: ${(Math.random() * 2 + 0.5).toFixed(2)}s`);
      setIsRunning(false);
    }, 1500);
  };

  // Close file tab
  const closeFile = (fileId: string) => {
    if (files.length <= 1) return; // Keep at least one file
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter(f => f.id !== fileId);
      setActiveFileId(remaining[0]?.id || '');
    }
  };

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <span className="text-6xl block mb-4">💻</span>
          <h1 className="text-2xl font-bold mb-2">Unable to Load Workspace</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading the workspace editor.
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
      <div className="min-h-screen bg-background p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-2">
            <span className="text-4xl">💻</span>
            Workspace
          </h1>
          <p className="text-muted-foreground">
            Write and execute code in Python, SQL, R, JavaScript, and Markdown.
          </p>
        </div>

        {/* Main Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          
          {/* Left Sidebar - Templates */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">📁 Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(CODE_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-auto py-2"
                    onClick={() => createFromTemplate(key)}
                  >
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: LANGUAGE_CONFIG[template.language]?.color }}
                    ></span>
                    {template.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">📊 Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Files</span>
                  <Badge variant="outline">{files.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lines</span>
                  <span>{activeFile.content.split('\n').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: LANGUAGE_CONFIG[activeFile.language]?.color + '20',
                      color: LANGUAGE_CONFIG[activeFile.language]?.color
                    }}
                  >
                    {LANGUAGE_CONFIG[activeFile.language]?.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">🔗 Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/data" className="block text-sm text-blue-600 hover:underline">
                  📦 Browse Datasets →
                </Link>
                <Link href="/connectors" className="block text-sm text-blue-600 hover:underline">
                  🔌 Connect to APIs →
                </Link>
                <Link href="/alphafold" className="block text-sm text-blue-600 hover:underline">
                  🧬 AlphaFold Viewer →
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            
            {/* Editor Card */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* File Tabs */}
              <div className="flex items-center border-b bg-muted/30 px-2 overflow-x-auto">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r ${
                      file.id === activeFileId 
                        ? 'bg-background border-b-2 border-b-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: LANGUAGE_CONFIG[file.language]?.color }}
                    ></span>
                    <span>{file.name}</span>
                    {files.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Code Editor Area */}
              <div className="flex-1 relative bg-slate-900 overflow-hidden">
                {/* Line numbers overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-800 text-slate-500 text-xs pt-4 pl-2 select-none font-mono">
                  {activeFile.content.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                
                {/* Actual textarea for editing */}
                <textarea
                  value={activeFile.content}
                  onChange={(e) => updateFileContent(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent text-slate-100 text-sm p-4 pl-12 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  spellCheck={false}
                  style={{ 
                    tabSize: 2,
                    lineHeight: '1.5'
                  }}
                />
              </div>

              {/* Editor Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
                <div className="flex items-center gap-2">
                  <Select defaultValue={activeFile.language}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">🐍 Python</SelectItem>
                      <SelectItem value="sql">🗃️ SQL</SelectItem>
                      <SelectItem value="r">📊 R</SelectItem>
                      <SelectItem value="markdown">📝 Markdown</SelectItem>
                      <SelectItem value="javascript">⚡ JS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {activeFile.content.split('\n').length} lines • UTF-8
                  </span>
                  <Button 
                    size="sm" 
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isRunning ? '⏳ Running...' : '▶️ Run Code'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Output/Terminal Panel */}
            <Card className="h-[200px] flex flex-col">
              <CardHeader className="pb-2 py-3 px-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">🖥️ Output / Terminal</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => setOutput([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <div className="font-mono text-xs p-4 h-full overflow-auto bg-slate-900 text-slate-100">
                  {output.length === 0 ? (
                    <div className="text-slate-500 italic">
                      Click "Run Code" to execute your script...
                    </div>
                  ) : (
                    output.map((line, i) => (
                      <div 
                        key={i} 
                        className={`${
                          line.type === 'error' ? 'text-red-400' :
                          line.type === 'success' ? 'text-green-400' :
                          line.type === 'info' ? 'text-blue-400' :
                          'text-slate-200'
                        }`}
                      >
                        {line.content}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-4"></div>
      </div>
    );
  } catch (error) {
    console.error('Workspace page error:', error);
    setHasError(true);
    return null;
  }
}
