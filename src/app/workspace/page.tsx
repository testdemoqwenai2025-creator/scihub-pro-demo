'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useDynamicStore } from '@/store/useDynamicStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============ TYPES ============

interface ConsoleOutput {
  id: string;
  type: 'log' | 'error' | 'warning' | 'result' | 'info';
  content: string;
  timestamp: Date;
}

interface FileTemplate {
  id: string;
  name: string;
  language: string;
  icon: string;
  description: string;
  content: string;
}

// ============ LANGUAGE DEFINITIONS ============

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍', extension: '.py' },
  { id: 'r', name: 'R', icon: '📊', extension: '.R' },
  { id: 'julia', name: 'Julia', icon: '🔮', extension: '.jl' },
  { id: 'sql', name: 'SQL', icon: '🗃️', extension: '.sql' },
  { id: 'bash', name: 'Bash', icon: '⌨️', extension: '.sh' },
  { id: 'markdown', name: 'Markdown', icon: '📝', extension: '.md' },
  { id: 'javascript', name: 'JavaScript', icon: '⚡', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', icon: '💎', extension: '.ts' },
];

// ============ FILE TEMPLATES ============

const FILE_TEMPLATES: FileTemplate[] = [
  {
    id: 'template-python-bio',
    name: 'Bioinformatics Analysis',
    language: 'python',
    icon: '🧬',
    description: 'Python template for sequence analysis with Biopython',
    content: `# SciHub Pro - Bioinformatics Analysis Template
# Sequence Analysis with Biopython

from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
import pandas as pd
import matplotlib.pyplot as plt

def load_sequence(accession: str) -> dict:
    """Load sequence data by accession number"""
    # In production: fetch from NCBI/GenBank API
    print(f"Loading sequence: {accession}")
    
    # Simulated sequence data (replace with real fetch)
    sequence_data = {
        'accession': accession,
        'sequence': 'ATGCGATCGATCGTACGATCGATCGTAGCTAGCTAGC',
        'organism': 'Homo sapiens',
        'gene_name': 'BRCA1'
    }
    
    return sequence_data

def analyze_gc_content(sequence: str) -> dict:
    """Analyze GC content of DNA sequence"""
    seq_obj = Seq(sequence)
    
    return {
        'gc_content': round(gc_fraction(seq_obj) * 100, 2),
        'length': len(sequence),
        'at_content': round((1 - gc_fraction(seq_obj)) * 100, 2),
        'complement': str(seq_obj.complement()),
        'reverse_complement': str(seq_obj.reverse_complement())
    }

def find_orfs(sequence: str, min_length: int = 50) -> list:
    """Find open reading frames in sequence"""
    orfs = []
    start_codon = 'ATG'
    stop_codons = ['TAA', 'TAG', 'TGA']
    
    # Search all three reading frames
    for frame in range(3):
        for i in range(frame, len(sequence) - 2, 3):
            codon = sequence[i:i+3]
            if codon == start_codon:
                for j in range(i + 3, len(sequence) - 2, 3):
                    codon = sequence[j:j+3]
                    if codon in stop_codons:
                        orf_length = j - i + 3
                        if orf_length >= min_length:
                            orfs.append({
                                'start': i,
                                'end': j + 3,
                                'length': orf_length,
                                'frame': frame + 1,
                                'sequence': sequence[i:j+3]
                            })
                        break
    
    return orfs

# Main execution
if __name__ == "__main__":
    print("=" * 50)
    print("SciHub Pro - Bioinformatics Pipeline")
    print("=" * 50)
    
    # Load sample sequence
    data = load_sequence("NM_001301717.2")
    print(f"\\nLoaded: {data['gene_name']} ({data['accession']})")
    
    # Analyze GC content
    analysis = analyze_gc_content(data['sequence'])
    print(f"\\nGC Content: {analysis['gc_content']}%")
    print(f"Sequence Length: {analysis['length']} bp")
    
    # Find ORFs
    orfs = find_orfs(data['sequence'])
    print(f"\\nFound {len(orfs)} open reading frames")
    
    for i, orf in enumerate(orfs[:5], 1):
        print(f"  ORF{i}: pos {orf['start']}-{orf['end']} ({orf['length']}bp)")
`,
  },
  {
    id: 'template-sql-query',
    name: 'Scientific SQL Query',
    language: 'sql',
    icon: '🔍',
    description: 'SQL template for querying scientific databases',
    content: `-- SciHub Pro - Scientific Query Template
-- Querying Scientific Databases with DuckDB/PostgreSQL

-- ============================================
-- CONFIGURATION SECTION
-- ============================================
SET search_path TO public;

-- ============================================
-- QUERY 1: Highly Cited Publications
-- ============================================
SELECT 
    p.title,
    p.authors,
    p.year,
    p.citations,
    p.journal,
    p.doi,
    CASE 
        WHEN p.citations > 500 THEN 'High Impact'
        WHEN p.citations > 100 THEN 'Moderate Impact'
        ELSE 'Emerging'
    END AS impact_category
FROM publications p
WHERE p.field IN ('Bioinformatics', 'Genomics', 'Computational Biology')
    AND p.year >= 2020
ORDER BY p.citations DESC
LIMIT 20;

-- ============================================
-- QUERY 2: Genomic Sequences Analysis
-- ============================================
SELECT 
    organism,
    COUNT(*) AS total_sequences,
    AVG(sequence_length) AS avg_length,
    MAX(sequence_length) AS max_length,
    MIN(gc_content) AS min_gc,
    MAX(gc_content) AS max_gc,
    ROUND(AVG(gc_content), 2) AS avg_gc_content
FROM genomic_sequences
WHERE organism LIKE '%sapiens%'
GROUP BY organism
HAVING COUNT(*) > 100
ORDER BY total_sequences DESC;

-- ============================================
-- QUERY 3: Compound Bioactivity Join
-- ============================================
SELECT 
    c.name AS compound_name,
    c.smiles,
    c.molecular_weight,
    b.target_protein,
    b.activity_type,
    b.ic50_nm,
    CASE 
        WHEN b.ic50_nm < 100 THEN 'Potent'
        WHEN b.ic50_nm < 1000 THEN 'Moderate'
        ELSE 'Weak'
    END AS potency_class
FROM molecular_compounds c
JOIN bioactivity_data b ON c.id = b.compound_id
WHERE b.target_protein = 'EGFR Kinase'
    AND b.ic50_nm IS NOT NULL
ORDER BY b.ic50_nm ASC
LIMIT 30;

-- ============================================
-- QUERY 4: Time Series Analysis
-- ============================================
SELECT 
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS new_entries,
    COUNT(DISTINCT field) AS fields_covered
FROM publications
WHERE created_at >= DATE('now', '-1 year')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;`,
  },
  {
    id: 'template-r-stats',
    name: 'Statistical Analysis',
    language: 'r',
    icon: '📈',
    description: 'R template for statistical analysis and visualization',
    content: `# SciHub Pro - Statistical Analysis Template
# R Script for Research Data Analysis

library(tidyverse)
library(ggplot2)
library(broom)
library(corrplot)
library(car)

# ============================================
# DATA GENERATION / LOADING
# ============================================

set.seed(42)

generate_experiment_data <- function(n = 100) {
  tibble(
    sample_id = paste0("S", sprintf("%03d", 1:n)),
    treatment = rep(c("Control", "Drug_A", "Drug_B"), each = n/3),
    expression = case(
      treatment == "Control" ~ rnorm(n/3, mean = 10, sd = 2),
      treatment == "Drug_A" ~ rnorm(n/3, mean = 15, sd = 2.5),
      treatment == "Drug_B" ~ rnorm(n/3, mean = 12, sd = 2)
    ),
    batch = sample(LETTERS[1:3], n, replace = TRUE),
    gender = sample(c("M", "F"), n, replace = TRUE),
    age = round(rnorm(n, mean = 45, sd = 10))
  )
}

# Generate/load data
exp_data <- generate_experiment_data(150)
cat("Data loaded:", nrow(exp_data), "samples\\n")

# ============================================
# EXPLORATORY ANALYSIS
# ============================================

cat("\\n=== Summary Statistics ===\\n")
print(summary(exp_data))

cat("\\n=== Treatment Group Sizes ===\\n")
print(table(exp_data$treatment))

# ============================================
# STATISTICAL TESTING
# ============================================

# One-way ANOVA
anova_model <- aov(expression ~ treatment, data = exp_data)
cat("\\n=== ANOVA Results ===\\n")
print(summary(anova_model))

# Post-hoc Tukey HSD
tukey_result <- TukeyHSD(anova_model)
cat("\\n=== Post-Hoc Comparisons ===\\n")
print(tukey_result)

# Effect size (eta squared)
anova_summary <- summary(anova_model)
ss_values <- anova_summary[[1]]["Sum Sq"]
eta_squared <- ss_values[1] / sum(ss_values)
cat("\\nEffect Size (η²):", round(eta_squared, 4), "\\n")

# Check assumptions
cat("\\n=== Assumption Checks ===\\n")
cat("Shapiro-Wilk normality test:\\n")
print(shapiro.test(residuals(anova_model)))

cat("\\nLevene's test for homogeneity:\\n")
print(leveneTest(expression ~ treatment, data = exp_data))

# ============================================
# VISUALIZATION
# ============================================

# Box plot with individual points
p1 <- ggplot(exp_data, aes(x = treatment, y = expression, fill = treatment)) +
  geom_boxplot(alpha = 0.7, outlier.shape = NA) +
  geom_jitter(width = 0.2, alpha = 0.3, size = 1.5) +
  labs(
    title = "Gene Expression by Treatment Group",
    subtitle = "With individual data points",
    x = "Treatment",
    y = "Expression Level"
  ) +
  theme_minimal() +
  scale_fill_brewer(palette = "Set2") +
  theme(legend.position = "none")

print(p1)

# Save plot
ggsave("expression_boxplot.png", p1, width = 8, height = 6, dpi = 300)
cat("\\nPlot saved to: expression_boxplot.png\\n")`,
  },
  {
    id: 'template-md-notebook',
    name: 'Research Notebook',
    language: 'markdown',
    icon: '📓',
    description: 'Markdown template for research documentation',
    content: `# SciHub Pro - Research Notebook

## Project Information

- **Project Title**: [Enter project title here]
- **Principal Investigator**: [Your name]
- **Institution**: [Your institution]
- **Start Date**: ${new Date().toISOString().split('T')[0]}
- **Status**: 🟢 Active

---

## Table of Contents

1. [Objective](#objective)
2. [Background](#background)
3. [Methods](#methods)
4. [Results](#results)
5. [Discussion](#discussion)
6. [Next Steps](#next-steps)

---

## Objective

> Clearly state the research question or hypothesis being investigated.

**Primary Objective:**
- [ ]

**Secondary Objectives:**
- [ ]
- [ ]

---

## Background

### Literature Review

| Author | Year | Key Finding | Relevance |
|--------|------|-------------|-----------|
| Smith et al. | 2024 | | |
| Johnson A | 2023 | | |

### Rationale

[Explain why this research is important and what gap it fills]

---

## Methods

### Experimental Design

\`\`\`
| Condition | Replicates | Concentration | Notes |
|-----------|------------|---------------|-------|
| Control | 6 | N/A | Baseline |
| Treatment 1 | 6 | 10 µM | Low dose |
| Treatment 2 | 6 | 50 µM | High dose |
\`\`\`

### Data Sources

- [ ] NCBI GenBank
- [ ] GEO Datasets
- [ ] PubMed Literature
- [ ] ChEMBL Compounds

### Analysis Pipeline

\`\`\`mermaid
graph LR
    A[Raw Data] --> B[Quality Control]
    B --> C[Normalization]
    C --> D[Statistical Analysis]
    D --> E[Visualization]
    E --> F[Interpretation]
\`\`\`

---

## Results

### Data Summary

\`\`\`
Total samples: XX
Features measured: XX
Quality threshold: XX%
\`\`\`

### Key Findings

1. **Finding 1**: 
   - Supporting evidence: 
   - P-value: 

2. **Finding 2**: 
   - Supporting evidence: 
   - P-value:

---

## Discussion

### Interpretation

[Interpret your findings in context of existing literature]

### Limitations

- [List any limitations of the study]

### Future Directions

[Suggest follow-up experiments or analyses]

---

## Next Steps

- [ ] Complete additional replicates
- [ ] Validate findings with independent dataset
- [ ] Prepare manuscript draft
- [ ] Share data on Zenodo/Figshare

---

## Code & Data Files

| File | Description | Last Modified |
|------|-------------|---------------|
| analysis.py | Main analysis script | |
| results.csv | Processed results | |

---

*Notebook maintained using SciHub Pro Platform*
*Last updated: ${new Date().toLocaleString()}*`,
  },
];

// ============ WORKSPACE PAGE ============

export default function WorkspacePage() {
  const { t } = useTranslation();
  const {
    workspaceFiles,
    createFile,
    updateFileContent,
    deleteFile,
    addActivity,
    createDynamicField,
  } = useDynamicStore();

  const [activeFileId, setActiveFileId] = useState(workspaceFiles[0]?.id || '');
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save debounce
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync active file ID when files change
  useEffect(() => {
    if (workspaceFiles.length > 0 && !workspaceFiles.find(f => f.id === activeFileId)) {
      setActiveFileId(workspaceFiles[0].id);
    }
  }, [workspaceFiles, activeFileId]);

  const activeFile = workspaceFiles.find(f => f.id === activeFileId);

  // Add console output
  const addOutput = useCallback((type: ConsoleOutput['type'], content: string) => {
    setConsoleOutput(prev => [...prev.slice(-200), { // Keep last 200 entries
      id: `output-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
    }]);
  }, []);

  // Run code simulation
  const runCode = async () => {
    if (!activeFile) return;
    
    setIsRunning(true);
    setConsoleOutput([]);
    
    addOutput('log', `▶ Running ${activeFile.name.value}...`);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate execution based on language
    switch (activeFile.language.value) {
      case 'python':
        await simulatePythonExecution(activeFile.content.value, addOutput);
        break;
      case 'sql':
        await simulateSQLExecution(activeFile.content.value, addOutput);
        break;
      case 'r':
        await simulateRExecution(addOutput);
        break;
      default:
        addOutput('result', `✅ Executed ${activeFile.name.value} successfully`);
    }
    
    addOutput('log', `\n${t('workspace.execution_complete', { time: '1.2' })}`);
    setIsRunning(false);

    // Log activity
    addActivity({
      type: 'compute',
      message: createDynamicField(`Ran ${activeFile.name.value}`),
      icon: '▶️',
    });
  };

  // Create new file
  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const lang = LANGUAGES.find(l => l.id === 'python')!;
    createFile(
      newFileName.includes('.') ? newFileName : `${newFileName}${lang.extension}`,
      lang.id,
      `# ${newFileName}\n# Created on ${new Date().toLocaleDateString()}\n\n`
    );
    
    setNewFileName('');
    setShowTemplates(false);

    addActivity({
      type: 'create',
      message: createDynamicField(`Created file "${newFileName}"`),
      icon: '📄',
    });
  };

  // Create file from template
  const handleCreateFromTemplate = (template: FileTemplate) => {
    const lang = LANGUAGES.find(l => l.id === template.language)!;
    createFile(
      `${template.name.toLowerCase().replace(/\s+/g, '-')}${lang.extension}`,
      template.language,
      template.content
    );

    addActivity({
      type: 'create',
      message: createDynamicField(`Created file from template: ${template.name}`),
      icon: '📋',
    });
  };

  // Update file content with auto-save
  const handleContentChange = (content: string) => {
    updateFileContent(activeFileId, content);

    // Debounced activity log
    clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Could trigger auto-save to IndexedDB here
    }, 2000);
  };

  // Delete file with confirmation
  const handleDeleteFile = (fileId: string) => {
    const file = workspaceFiles.find(f => f.id === fileId);
    if (file && confirm(`Delete "${file.name.value}"? This cannot be undone.`)) {
      deleteFile(fileId);
      if (activeFileId === fileId) {
        setActiveFileId(workspaceFiles.find(f => f.id !== fileId)?.id || '');
      }
    }
  };

  // Change file language
  const changeLanguage = (language: string) => {
    if (!activeFile) return;
    
    const lang = LANGUAGES.find(l => l.id === language);
    if (!lang) return;

    // Update would go through store
    const currentName = activeFile.name.value;
    const newName = currentName.replace(/\.[^.]+$/, lang.extension);
    
    // For now, just log the change
    addOutput('info', `Language changed to ${lang.name}`);
  };

  // Export file
  const handleExportFile = () => {
    if (!activeFile) return;
    
    const blob = new Blob([activeFile.content.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name.value;
    a.click();
    URL.revokeObjectURL(url);

    addActivity({
      type: 'export',
      message: createDynamicField(`Exported ${activeFile.name.value}`),
      icon: '📥',
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('workspace.title')}</h1>
        
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <Select value={activeFile?.language.value || 'python'} onValueChange={changeLanguage}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <Button onClick={runCode} disabled={isRunning || !activeFile} size="sm">
            {isRunning ? '▶ Running...' : '▶ ' + t('workspace.run')}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExportFile} disabled={!activeFile}>
            📥 Export
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTemplates(!showTemplates)}
          >
            + {t('workspace.new_file')}
          </Button>
        </div>
      </div>

      {/* New File Dialog */}
      {showTemplates && (
        <div className="border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter filename (e.g., analysis.py)"
              className="max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <Button size="sm" onClick={handleCreateFile} disabled={!newFileName.trim()}>
              Create
            </Button>
            <span className="text-xs text-muted-foreground">or choose a template:</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FILE_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleCreateFromTemplate(template)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-background transition-colors whitespace-nowrap"
              >
                <span>{template.icon}</span>
                <span className="text-sm font-medium">{template.name}</span>
                <Badge variant="outline" className="text-xs">{template.language.toUpperCase()}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Sidebar */}
        <div className="w-56 border-r bg-muted/30 flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Files ({workspaceFiles.length})
              </span>
              <span className="text-xs text-muted-foreground">
                {workspaceFiles.filter(f => f.isModified).length} modified
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {workspaceFiles.map(file => (
              <div
                key={file.id}
                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted transition-colors ${
                  activeFileId === file.id ? 'bg-background border-r-2 border-primary' : ''
                }`}
                onClick={() => setActiveFileId(file.id)}
              >
                <span>{LANGUAGES.find(l => l.id === file.language.value)?.icon || '📄'}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.sizeBytes / 1024).toFixed(1)} KB
                  </p>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.isModified && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full" title="Modified" />
                  )}
                  {file.name.isDirty && (
                    <Badge variant="secondary" className="text-[10px] px-1">✏️</Badge>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id);
                    }}
                    className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                    title="Delete file"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            
            {workspaceFiles.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No files yet.<br />Click "+" to create one.
              </div>
            )}
          </div>
          
          {/* Storage Info */}
          <div className="p-3 border-t text-xs text-muted-foreground">
            <div className="flex justify-between mb-1">
              <span>Total Size:</span>
              <span>{(workspaceFiles.reduce((acc, f) => acc + f.sizeBytes, 0) / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between">
              <span>Storage:</span>
              <span className="text-green-600">Local + IndexedDB</span>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <>
              {/* Editor Tab Bar */}
              <div className="flex items-center gap-3 px-4 py-1 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{activeFile.name.value}</span>
                  {activeFile.isModified && (
                    <Badge variant="secondary" className="text-xs animate-pulse">
                      ● Modified
                    </Badge>
                  )}
                  {activeFile.name.isDirty && (
                    <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                      ✏️ Edited
                    </Badge>
                  )}
                </div>
                
                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{LANGUAGES.find(l => l.id === activeFile.language.value)?.name}</span>
                  <span>|</span>
                  <span>{activeFile.content.value.split('\n').length} lines</span>
                  <span>|</span>
                  <span>{activeFile.sizeBytes} bytes</span>
                </div>
              </div>
              
              {/* Code Editor */}
              <div className="flex-1 relative">
                <textarea
                  ref={editorRef}
                  value={activeFile.content.value}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-full p-4 pl-14 font-mono text-sm bg-background resize-none focus:outline-none leading-relaxed"
                  spellCheck={false}
                  style={{ tabSize: 4 }}
                  placeholder="Start typing your code here..."
                />
                
                {/* Line Numbers Overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 pointer-events-none flex flex-col items-end pr-3 pt-4 text-xs text-muted-foreground font-mono select-none overflow-hidden border-r">
                  {activeFile.content.value.split('\n').map((_, i) => (
                    <div key={i} className="leading-relaxed">{i + 1}</div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
              <span className="text-6xl">📝</span>
              <div className="text-center">
                <p className="text-lg font-medium">{t('workspace.no_file_open')}</p>
                <p className="text-sm mt-1">Create a new file or select a template to get started</p>
              </div>
              <Button variant="outline" onClick={() => setShowTemplates(true)}>
                + Create New File
              </Button>
            </div>
          )}
        </div>

        {/* Console Panel */}
        <div className="w-96 border-l flex flex-col">
          <Tabs defaultValue="console" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="console" className="flex-1 text-xs">
                {t('workspace.console')} ({consoleOutput.length})
              </TabsTrigger>
              <TabsTrigger value="problems" className="flex-1 text-xs">
                {t('workspace.problems')} (0)
              </TabsTrigger>
              <TabsTrigger value="output" className="flex-1 text-xs">
                Output
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="console" className="flex-1 overflow-auto p-3">
              <div className="font-mono text-xs space-y-1">
                {consoleOutput.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Console output will appear here...</p>
                    <p className="mt-2 text-xs">Run code to see output</p>
                  </div>
                ) : (
                  consoleOutput.map(output => (
                    <div
                      key={output.id}
                      className={`py-0.5 ${
                        output.type === 'error' ? 'text-red-500' :
                        output.type === 'warning' ? 'text-yellow-500' :
                        output.type === 'result' ? 'text-green-500' :
                        output.type === 'info' ? 'text-blue-400' :
                        'text-foreground'
                      }`}
                    >
                      <span className="text-muted-foreground mr-2 opacity-60">
                        [{output.timestamp.toLocaleTimeString()}]
                      </span>
                      {output.content}
                    </div>
                  ))
                )}
              </div>
              
              {/* Console Actions */}
              {consoleOutput.length > 0 && (
                <div className="mt-3 pt-3 border-t flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs flex-1"
                    onClick={() => setConsoleOutput([])}
                  >
                    Clear Console
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs flex-1"
                    onClick={() => {
                      const text = consoleOutput.map(o => o.content).join('\n');
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    Copy Output
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="problems" className="flex-1 p-3">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="text-green-600">✓ No problems detected</p>
                <p className="text-xs mt-4">
                  The linter will check your code for syntax errors and common issues.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="flex-1 p-3">
              <div className="text-sm text-muted-foreground">
                <p>Execution results and exports will appear here.</p>
                <p className="text-xs mt-2">
                  Run your code to generate output files.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ============ EXECUTION SIMULATORS ============

async function simulatePythonExecution(code: string, addOutput: (type: ConsoleOutput['type'], content: string) => void) {
  addOutput('log', '📦 Importing libraries...');
  await new Promise(resolve => setTimeout(resolve, 200));
  
  addOutput('log', '✓ Libraries loaded');
  
  if (code.includes('load_sequence') || code.includes('SeqIO')) {
    addOutput('log', '\n🧬 Loading sequence data...');
    await new Promise(resolve => setTimeout(resolve, 300));
    addOutput('log', 'Loading sequence: NM_001301717.2');
    addOutput('result', '{');
    addOutput('result', '  "accession": "NM_001301717.2",');
    addOutput('result', '  "organism": "Homo sapiens",');
    addOutput('result', '  "gene_name": "BRCA1",');
    addOutput('result', '  "sequence_length": 5592');
    addOutput('result', '}');
  }

  if (code.includes('analyze_gc') || code.includes('gc_fraction')) {
    addOutput('log', '\n📊 Analyzing GC content...');
    await new Promise(resolve => setTimeout(resolve, 250));
    addOutput('result', '\nGC Content Analysis:');
    addOutput('result', '  • GC Content: 54.17%');
    addOutput('result', '  • AT Content: 45.83%');
    addOutput('result', '  • Sequence Length: 5592 bp');
  }

  if (code.includes('find_orfs') || code.includes('ORF')) {
    addOutput('log', '\n🔍 Finding open reading frames...');
    await new Promise(resolve => setTimeout(resolve, 400));
    addOutput('result', '\nFound 12 open reading frames:');
    addOutput('result', '  ORF1: pos 145-892 (748bp) [frame 1]');
    addOutput('result', '  ORF2: pos 1234-2345 (1112bp) [frame 2]');
    addOutput('result', '  ORF3: pos 3456-4567 (1112bp) [frame 3]');
    addOutput('result', '  ... and 9 more');
  }

  addOutput('result', '\n✅ Python execution completed successfully');
}

async function simulateSQLExecution(sql: string, addOutput: (type: ConsoleOutput['type'], content: string) => void) {
  addOutput('log', '🔌 Connecting to database...');
  await new Promise(resolve => setTimeout(resolve, 300));
  addOutput('log', '✓ Connected to DuckDB (in-memory)');
  
  addOutput('log', '\n📋 Parsing query...');
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const queryCount = (sql.match(/SELECT/gi) || []).length;
  
  for (let i = 1; i <= queryCount; i++) {
    addOutput('log', `\nExecuting Query ${i}/${queryCount}...`);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const rows = Math.floor(Math.random() * 30) + 5;
    const time = (Math.random() * 200 + 50).toFixed(0);
    
    addOutput('result', `Query returned ${rows} rows (${time}ms)`);
    
    if (i <= 2) {
      addOutput('result', '| Title | Authors | Year | Citations |');
      addOutput('result', '|-------|---------|------|------------|');
      addOutput('result', '| Advances in ML... | Smith et al. | 2024 | 342 |');
      addOutput('result', '| Protein folding... | Johnson A | 2023 | 567 |');
      addOutput('result', '| ... | ... | ... | ... |');
    }
  }
  
  addOutput('result', '\n✅ All queries executed successfully');
}

async function simulateRExecution(addOutput: (type: ConsoleOutput['type'], content: string) => void) {
  addOutput('log', '📦 Loading R packages...');
  await new Promise(resolve => setTimeout(resolve, 400));
  
  addOutput('log', '✓ Packages loaded: tidyverse, ggplot2, broom, corrplot');
  
  addOutput('log', '\n📊 Generating/simulating data...');
  await new Promise(resolve => setTimeout(resolve, 250));
  
  addOutput('result', '> head(exp_data)');
  addOutput('result', '# A tibble: 6 × 5');
  addOutput('result', '  sample_id treatment expression batch  gender');
  addOutput('result', '  <chr>     <chr>         <dbl> <chr>  <chr> ');
  addOutput('result', '1 S001     Control        9.8 A     M');
  addOutput('result', '2 S002     Control       11.2 B     F');
  addOutput('result', '3 S003     Drug_A        14.5 A     M');
  addOutput('result', '4 S004     Drug_A        16.1 B     F');
  addOutput('result', '5 S005     Drug_B        11.8 C     M');
  addOutput('result', '6 S006     Drug_B        13.2 A     F');
  
  addOutput('log', '\n📈 Running ANOVA...');
  await new Promise(resolve => setTimeout(resolve, 350));
  
  addOutput('result', '\n> summary(anova_result)');
  addOutput('result', '            Df Sum Sq Mean Sq F value Pr(>F)');
  addOutput('result', 'treatment    2   1250     625    156  <2e-16 ***');
  addOutput('result', 'Residuals  147   589       4');
  addOutput('result', '---');
  addOutput('result', 'Signif. codes:  0 *** 0.001 ** 0.01 * 0.05 . 0.1 1');
  
  addOutput('result', '\n> tukey_result');
  addOutput('result', '  95% family-wise confidence level');
  addOutput('result', '');
  addOutput('result', 'Fit: aov(formula = expression ~ treatment, data = exp_data)');
  addOutput('result', '');
  addOutput('result', '$treatment');
  addOutput('result', '                     diff       lwr       upr     p adj');
  addOutput('result', 'Drug_A-Control  4.708333  3.661385  5.755281 0.0000000');
  addOutput('result', 'Drug_B-Control  2.208333  1.161385  3.255281 0.0000102');
  addOutput('result', 'Drug_B-Drug_A  -2.500000 -3.546948 -1.453052 0.0000028');
  
  addOutput('log', '\n🎨 Creating visualization...');
  await new Promise(resolve => setTimeout(resolve, 300));
  
  addOutput('result', '\n✅ Plot saved: expression_boxplot.png (8×6 inches, 300 DPI)');
  addOutput('result', '\n✅ R execution completed successfully');
}
