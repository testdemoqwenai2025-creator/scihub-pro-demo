'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============ TYPES ============

interface FileTab {
  id: string;
  name: string;
  language: string;
  content: string;
  modified: boolean;
}

interface ConsoleOutput {
  id: string;
  type: 'log' | 'error' | 'warning' | 'result';
  content: string;
  timestamp: Date;
}

const LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'r', name: 'R', icon: '📊' },
  { id: 'julia', name: 'Julia', icon: '🔮' },
  { id: 'sql', name: 'SQL', icon: '🗃️' },
  { id: 'bash', name: 'Bash', icon: '⌨️' },
  { id: 'markdown', name: 'Markdown', icon: '📝' },
];

const SAMPLE_CODE: Record<string, string> = {
  python: `# SciHub Pro - Python Analysis Example
# Bioinformatics: Sequence Analysis

from Bio import SeqIO
import pandas as pd
import matplotlib.pyplot as plt

# Load sequence data (simulated)
def load_genomic_data(accession: str):
    """Load sequence from NCBI GenBank"""
    # In production, this would call real API
    print(f"Loading sequence: {accession}")
    
    # Simulated sequence data
    sequence = "ATGCGATCGATCGTACGATCGATCGTAGCTAGCTAGC"
    return {
        'accession': accession,
        'sequence': sequence,
        'length': len(sequence),
        'gc_content': calculate_gc_content(sequence)
    }

def calculate_gc_content(sequence: str) -> float:
    """Calculate GC content of DNA sequence"""
    gc_count = sequence.upper().count('G') + sequence.upper().count('C')
    return (gc_count / len(sequence)) * 100 if sequence else 0

def analyze_variant(position: str, ref_allele: str, alt_allele: str):
    """Analyze genetic variant"""
    print(f"Variant at position {position}: {ref_allele} -> {alt_allele}")
    
    # Variant classification logic would go here
    impact = 'synonymous' if ref_allele == alt_allele else 'missense'
    
    return {
        'position': position,
        'reference': ref_allele,
        'alternate': alt_allele,
        'predicted_impact': impact
    }

# Main analysis pipeline
if __name__ == "__main__":
    # Load and analyze BRCA1 gene region
    brca1_data = load_genomic_data("NM_001301717.2")
    print(f"GC Content: {brca1_data['gc_content']:.2f}%")
    
    # Analyze variants
    variants = [
        analyze_variant("100", "A", "G"),
        analyze_variant("250", "C", "T"),
        analyze_variant("500", "G", "A"),
    ]
    
    print(f"\\nAnalyzed {len(variants)} variants")
`,

  sql: `-- SciHub Pro - SQL Query Example
-- Querying Scientific Databases

-- Find highly cited papers in bioinformatics
SELECT 
    p.title,
    p.authors,
    p.year,
    p.citations,
    p.journal,
    p.doi
FROM publications p
WHERE p.field = 'Bioinformatics'
    AND p.year >= 2020
    AND p.citations > 100
ORDER BY p.citations DESC
LIMIT 20;

-- Get genomic sequences with high GC content
SELECT 
    accession,
    organism,
    gene_name,
    sequence_length,
    gc_content,
    chromosome
FROM genomic_sequences
WHERE gc_content > 60
    AND organism = 'Homo sapiens'
ORDER BY sequence_length DESC;

-- Join compounds with bioactivity data
SELECT 
    c.name AS compound_name,
    c.smiles,
    c.molecular_weight,
    b.target_protein,
    b.activity_type,
    b.ic50_nm
FROM molecular_compounds c
JOIN bioactivity b ON c.id = b.compound_id
WHERE b.ic50_nm < 1000  -- Active compounds
ORDER BY b.ic50_nm ASC;`,

  r: `# SciHub Pro - R Analysis Example
# Statistical Analysis for Research

library(tidyverse)
library(ggplot2)
library(broom)

# Simulate experimental data
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
    batch = sample(LETTERS[1:3], n, replace = TRUE)
  )
}

# Generate and explore data
exp_data <- generate_experiment_data()
print(head(exp_data))
print(summary(exp_data))

# Statistical test: ANOVA
anova_result <- aov(expression ~ treatment, data = exp_data)
print(summary(anova_result))

# Post-hoc Tukey HSD
tukey_result <- TukeyHSD(anova_result)
print(tukey_result)

# Visualization
p <- ggplot(exp_data, aes(x = treatment, y = expression, fill = treatment)) +
  geom_boxplot(alpha = 0.7) +
  geom_jitter(width = 0.2, alpha = 0.3) +
  labs(
    title = "Gene Expression by Treatment Group",
    x = "Treatment",
    y = "Expression Level"
  ) +
  theme_minimal() +
  scale_fill_brewer(palette = "Set2")

print(p)`,

  markdown: `# SciHub Pro - Research Notebook

## Experiment: CRISPR Gene Editing Analysis

### Objective
Evaluate off-target effects of CRISPR-Cas9 system on human cell line HEK293.

### Methods

#### 1. Guide RNA Design
- Target gene: **BRCA1** (NM_001301717.2)
- PAM sequence: NGG
- Off-target tolerance: ≤ 3 mismatches

#### 2. Experimental Conditions
| Condition | Replicates | Concentration |
|-----------|------------|---------------|
| Control | 6 | N/A |
| Cas9 + gRNA | 6 | 50 nM |
| Cas9 only | 6 | 50 nM |

### Results

#### Sequencing Analysis
\`\`\`
Total reads: 12,456,789
Mapped reads: 11,823,450 (94.9%)
On-target editing: 78.5%
Off-target sites detected: 3
\`\`\`

#### Key Findings
1. High on-target efficiency (>75%)
2. Minimal off-target effects (<0.1% at predicted sites)
3. No detectable large deletions

### Conclusion
The CRISPR system shows excellent specificity for BRCA1 targeting.

---
*Analysis performed on SciHub Pro Platform*`,
};

// ============ WORKSPACE PAGE ============

export default function WorkspacePage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileTab[]>([
    {
      id: '1',
      name: 'analysis.py',
      language: 'python',
      content: SAMPLE_CODE.python,
      modified: false,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [consoleOutput, setConsoleOutput] = useState<ConsoleOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  // Add console output
  const addOutput = (type: ConsoleOutput['type'], content: string) => {
    setConsoleOutput(prev => [...prev, {
      id: `output-${Date.now()}`,
      type,
      content,
      timestamp: new Date(),
    }]);
  };

  // Run code simulation
  const runCode = async () => {
    if (!activeFile) return;
    
    setIsRunning(true);
    setConsoleOutput([]);
    
    addOutput('log', `Running ${activeFile.name}...`);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate execution based on language
    if (activeFile.language === 'python') {
      addOutput('log', 'Loading sequence: NM_001301717.2');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      addOutput('log', 'GC Content: 54.17%');
      addOutput('log', '');
      addOutput('log', 'Analyzing variants...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      addOutput('result', "Variant at position 100: A -> G (missense)");
      addOutput('result', "Variant at position 250: C -> T (missense)");
      addOutput('result', "Variant at position 500: G -> A (missense)");
      addOutput('log', '');
      addOutput('result', 'Analyzed 3 variants');
    } else if (activeFile.language === 'sql') {
      addOutput('log', 'Executing query...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      addOutput('result', 'Query returned 18 rows (284ms)');
      addOutput('result', '| Title | Authors | Year | Citations |');
      addOutput('result', '|-------|---------|------|------------|');
      addOutput('result', '| Advances in ML... | Smith et al. | 2024 | 342 |');
      addOutput('result', '| Protein folding... | Johnson A | 2023 | 567 |');
      addOutput('result', '| ... | ... | ... | ... |');
    } else if (activeFile.language === 'r') {
      addOutput('log', 'Loading libraries...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      addOutput('log', '> head(exp_data)');
      addOutput('result', '# A tibble: 6 × 4');
      addOutput('result', '  sample_id treatment expression batch');
      addOutput('result', '  <chr>     <chr>         <dbl> <chr> ');
      addOutput('result', '1 S001     Control        9.8 A');
      addOutput('result', '2 S002     Control       11.2 B');
      addOutput('result', '...');

      addOutput('log', '> summary(anova_result)');
      addOutput('result', '            Df Sum Sq Mean Sq F value Pr(>F)');
      addOutput('result', 'treatment    2   1250     625    156  <2e-16 ***');
    } else {
      addOutput('log', `Executed ${activeFile.name} successfully`);
    }
    
    addOutput('log', `\n${t('workspace.execution_complete', { time: '1.2' })}`);
    setIsRunning(false);
  };

  // Create new file
  const createNewFile = () => {
    const newFile: FileTab = {
      id: String(Date.now()),
      name: 'untitled.py',
      language: 'python',
      content: '# New file\n',
      modified: false,
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
  };

  // Update file content
  const updateContent = (content: string) => {
    if (!activeFile) return;
    setFiles(files.map(f => 
      f.id === activeFileId ? { ...f, content, modified: true } : f
    ));
  };

  // Change file language
  const changeLanguage = (language: string) => {
    if (!activeFile) return;
    setFiles(files.map(f => 
      f.id === activeFileId ? { 
        ...f, 
        language,
        name: f.name.replace(/\.[^.]+$/, '.' + (language === 'r' ? 'R' : language))
      } : f
    ));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('workspace.title')}</h1>
        <div className="flex items-center gap-2">
          <select
            value={activeFile?.language || 'python'}
            onChange={(e) => changeLanguage(e.target.value)}
            className="px-3 py-1 rounded border bg-background text-sm"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
          <Button onClick={runCode} disabled={isRunning} size="sm">
            {isRunning ? '▶ Running...' : '▶ ' + t('workspace.run')}
          </Button>
          <Button variant="outline" size="sm" onClick={createNewFile}>
            + {t('workspace.new_file')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tabs */}
        <div className="w-48 border-r bg-muted/30">
          <div className="p-2 border-b">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Files
            </span>
          </div>
          <div className="overflow-y-auto">
            {files.map(file => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
                  activeFileId === file.id ? 'bg-background border-r-2 border-primary' : ''
                }`}
              >
                <span>{LANGUAGES.find(l => l.id === file.language)?.icon || '📄'}</span>
                <span className="truncate">{file.name}</span>
                {file.modified && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
              </button>
            ))}
          </div>
          
          {/* Quick Templates */}
          <div className="p-2 border-t mt-auto">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Templates
            </span>
            <div className="mt-2 space-y-1">
              {['Python Analysis', 'SQL Query', 'R Statistics'].map(template => (
                <button
                  key={template}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-muted rounded transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <>
              {/* Editor Tab Bar */}
              <div className="flex items-center gap-2 px-4 py-1 border-b bg-muted/20">
                <span className="text-sm font-medium">{activeFile.name}</span>
                {activeFile.modified && (
                  <Badge variant="secondary" className="text-xs">Modified</Badge>
                )}
              </div>
              
              {/* Code Editor */}
              <div className="flex-1 relative">
                <textarea
                  ref={editorRef}
                  value={activeFile.content}
                  onChange={(e) => updateContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-background resize-none focus:outline-none"
                  spellCheck={false}
                  style={{ tabSize: 4 }}
                />
                
                {/* Line Numbers Overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/30 pointer-events-none flex flex-col items-end pr-2 pt-4 text-xs text-muted-foreground font-mono select-none overflow-hidden">
                  {activeFile.content.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {t('workspace.no_file_open')}
            </div>
          )}
        </div>

        {/* Console Panel */}
        <div className="w-96 border-l flex flex-col">
          <Tabs defaultValue="console" className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="console" className="flex-1 text-xs">
                {t('workspace.console')}
              </TabsTrigger>
              <TabsTrigger value="problems" className="flex-1 text-xs">
                {t('workspace.problems')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="console" className="flex-1 overflow-auto p-3">
              <div className="font-mono text-xs space-y-1">
                {consoleOutput.length === 0 ? (
                  <p className="text-muted-foreground">Console output will appear here...</p>
                ) : (
                  consoleOutput.map(output => (
                    <div
                      key={output.id}
                      className={`${
                        output.type === 'error' ? 'text-red-500' :
                        output.type === 'warning' ? 'text-yellow-500' :
                        output.type === 'result' ? 'text-green-500' :
                        'text-foreground'
                      }`}
                    >
                      <span className="text-muted-foreground mr-2">
                        [{output.timestamp.toLocaleTimeString()}]
                      </span>
                      {output.content}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="problems" className="flex-1 p-3">
              <p className="text-sm text-muted-foreground">No problems detected.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
