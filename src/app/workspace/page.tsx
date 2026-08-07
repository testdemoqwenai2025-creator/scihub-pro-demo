'use client';

/**
 * SciHub Pro - Workspace Page
 * 
 * Interactive code editor and execution environment with:
 * - Multi-file workspace (Python, SQL, R, Markdown)
 * - Code execution simulation with results
 * - File persistence to store
 * - Auto-save functionality
 * - Template library for quick start
 * - Never let user hit a wall - always show next steps
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useSciHubStore, createDynamicField } from '@/store/useSciHubStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ============ TYPES ============

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  language: 'python' | 'sql' | 'r' | 'markdown' | 'javascript';
  code: string;
  category: 'analysis' | 'visualization' | 'ml' | 'data-import' | 'template';
}

// ============ CODE TEMPLATES (Pre-seeded for Zero Friction) ============

const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'tpl-py-analysis',
    name: 'Data Analysis Pipeline',
    description: 'Complete data analysis workflow with loading, processing, and visualization',
    language: 'python',
    category: 'analysis',
    code: `# Data Analysis Pipeline Template
# SciHub Pro Workspace

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from sklearn.preprocessing import StandardScaler

# ============================================
# 1. LOAD DATA
# ============================================
# Replace with your dataset ID or file path
dataset_id = "ds-001"  # TCGA Pan-Cancer Atlas

print("Loading dataset:", dataset_id)

# Sample data structure (replace with real data loading)
data = pd.DataFrame({
    'gene_id': [f'GENE_{i}' for i in range(100)],
    'expression': np.random.normal(10, 2, 100),
    'p_value': np.random.uniform(0, 0.1, 100),
    'log2_fold_change': np.random.normal(0, 1.5, 100),
    'pathway': np.random.choice(['Cell Cycle', 'Apoptosis', 'DNA Repair', 'Signaling'], 100),
})

print(f"Loaded {len(data)} genes with columns: {list(data.columns)}")

# ============================================
# 2. DATA QUALITY CHECKS
# ============================================
print("\\n--- Data Quality Report ---")
print(f"Missing values:\\n{data.isnull().sum()}")
print(f"\\nData types:\\n{data.dtypes}")

# Check for outliers using IQR method
Q1 = data['expression'].quantile(0.25)
Q3 = data['expression'].quantile(0.75)
IQR = Q3 - Q1
outliers = data[(data['expression'] < Q1 - 1.5*IQR) | (data['expression'] > Q3 + 1.5*IQR)]
print(f"\\nOutliers detected: {len(outliers)} ({len(outliers)/len(data)*100:.1f}%)")

# ============================================
# 3. STATISTICAL ANALYSIS
# ============================================
print("\\n--- Statistical Summary ---")
print(data.describe())

# Identify significant genes (p < 0.05, |log2FC| > 1)
significant = data[
    (data['p_value'] < 0.05) & 
    (abs(data['log2_fold_change']) > 1)
].copy()

print(f"\\nSignificant genes found: {len(significant)} ({len(significant)/len(data)*100:.1f}%)")

# Pathway enrichment (simplified)
if len(significant) > 0:
    pathway_counts = significant['pathway'].value_counts()
    print(f"\\nPathway distribution of significant genes:")
    print(pathway_counts)

# ============================================
# 4. VISUALIZATION
# ============================================
fig, axes = plt.subplots(1, 3, figsize=(15, 5))

# Volcano plot
axes[0].scatter(
    data['log2_fold_change'], 
    -np.log10(data['p_value']),
    alpha=0.5,
    c=['red' if (p < 0.05 and abs(lfc) > 1) else 'gray' 
       for p, lfc in zip(data['p_value'], data['log2_fold_change'])]
)
axes[0].axhline(-np.log10(0.05), color='blue', linestyle='--', alpha=0.5)
axes[0].axvline(-1, color='green', linestyle='--', alpha=0.5)
axes[0].axvline(1, color='green', linestyle='--', alpha=0.5)
axes[0].set_xlabel('Log2 Fold Change')
axes[0].set_ylabel('-Log10 P-value')
axes[0].set_title('Volcano Plot')

# Expression distribution
axes[1].hist(data['expression'], bins=30, edgecolor='black', alpha=0.7)
axes[1].axvline(data['expression'].mean(), color='red', linestyle='--', label=f'Mean: {data["expression"].mean():.2f}')
axes[1].set_xlabel('Expression Level')
axes[1].set_ylabel('Count')
axes[1].set_title('Expression Distribution')
axes[1].legend()

# Pathway bar chart
if len(significant) > 0:
    pathway_counts.plot(kind='bar', ax=axes[2], color='steelblue')
    axes[2].set_xlabel('Pathway')
    axes[2].set_ylabel('Gene Count')
    axes[2].set_title('Significant Genes by Pathway')
    axes[2].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.savefig('analysis_results.png', dpi=150, bbox_inches='tight')
print("\\n✅ Visualization saved to 'analysis_results.png'")

# ============================================
# 5. EXPORT RESULTS
# ============================================
significant.to_csv('significant_genes.csv', index=False)
print("✅ Results exported to 'significant_genes.csv'")
print("\\n🎉 Analysis complete!")
`,
  },
  {
    id: 'tpl-sql-query',
    name: 'SQL Query Builder',
    description: 'SQL template for querying datasets with joins and aggregations',
    language: 'sql',
    category: 'analysis',
    code: `-- SciHub Pro SQL Query Template
-- Use this template to query your datasets

-- ============================================
-- BASIC QUERIES
-- ============================================

-- Get dataset overview
SELECT 
    COUNT(*) AS total_records,
    COUNT(DISTINCT gene_name) AS unique_genes,
    AVG(expression) AS avg_expression,
    STDDEV(expression) AS std_expression,
    MIN(expression) AS min_expression,
    MAX(expression) AS max_expression
FROM gene_expression_dataset;

-- Filter by conditions
SELECT 
    gene_id,
    gene_name,
    expression,
    p_value,
    log2_fold_change
FROM gene_expression_dataset
WHERE p_value < 0.05
    AND ABS(log2_fold_change) > 1
ORDER BY p_value ASC
LIMIT 100;

-- ============================================
-- AGGREGATION & GROUPING
-- ============================================

-- Group by pathway/category
SELECT 
    pathway,
    COUNT(*) AS gene_count,
    AVG(expression) AS mean_expression,
    MEDIAN(expression) AS median_expression,
    -- Count significant genes in each pathway
    SUM(CASE WHEN p_value < 0.05 THEN 1 ELSE 0 END) AS sig_count
FROM gene_expression_dataset
GROUP BY pathway
HAVING COUNT(*) >= 10  -- Only pathways with 10+ genes
ORDER BY sig_count DESC;

-- Time series analysis (if applicable)
SELECT 
    DATE(timepoint) AS date,
    COUNT(*) AS measurements,
    AVG(value) AS daily_avg,
    MIN(value) AS daily_min,
    MAX(value) AS daily_max
FROM time_series_data
GROUP BY DATE(timepoint)
ORDER BY date;

-- ============================================
-- JOINS ACROSS DATASETS
-- ============================================

-- Join expression data with protein annotations
SELECT 
    g.gene_id,
    g.gene_name,
    g.expression,
    g.p_value,
    p.protein_name,
    p.function_description,
    p.cellular_location,
    c.compound_name,
    c.binding_affinity
FROM gene_expression g
JOIN protein_annotations p ON g.gene_id = p.gene_id
LEFT JOIN compound_bindings c ON p.protein_id = c.target_protein
WHERE g.tumor_type = 'BRCA'
    AND c.binding_affinity < 1000  -- High affinity compounds
ORDER BY c.binding_affinity ASC;

-- Complex multi-table join for network analysis
SELECT DISTINCT
    n1.node_id AS source_gene,
    n1.name AS source_name,
    e.interaction_type,
    e.confidence_score,
    n2.node_id AS target_gene,
    n2.name AS target_name
FROM network_nodes n1
JOIN network_edges e ON n1.node_id = e.source_id
JOIN network_nodes n2 ON e.target_id = n2.node_id
WHERE n1.pathway = 'Cell Cycle'
    AND e.confidence_score > 0.7
ORDER BY e.confidence_score DESC;

-- ============================================
-- WINDOW FUNCTIONS
-- ============================================

-- Rank genes by expression within each sample
SELECT 
    *,
    RANK() OVER (PARTITION BY sample_id ORDER BY expression DESC) AS expr_rank,
    NTILE(4) OVER (PARTITION BY sample_id ORDER BY expression) AS expression_quartile,
    LAG(expression, 1) OVER (PARTITION BY gene_id ORDER BY timepoint) AS prev_expression
FROM longitudinal_data
WHERE sample_id IN ('sample_001', 'sample_002');

-- Calculate running statistics
SELECT 
    timepoint,
    value,
    AVG(value) OVER (
        ORDER BY timepoint 
        ROWS BETWEEN 5 PRECEDING AND CURRENT ROW
    ) AS moving_avg_6,
    SUM(value) OVER (
        ORDER BY timepoint 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_sum
FROM time_series_data
ORDER BY timepoint;

-- ============================================
-- SUBQUERIES & CTEs
-- ============================================

-- Find genes with outlier expression using CTE
WITH gene_stats AS (
    SELECT 
        gene_id,
        AVG(expression) AS mean_expr,
        STDDEV(expression) AS std_expr
    FROM gene_expression
    GROUP BY gene_id
),
normalized AS (
    SELECT 
        g.*,
        (g.expression - gs.mean_expr) / NULLIF(gs.std_expr, 0) AS z_score
    FROM gene_expression g
    JOIN gene_stats gs ON g.gene_id = gs.gene_id
)
SELECT *
FROM normalized
WHERE ABS(z_score) > 2  -- Outliers beyond 2 std devs
ORDER BY z_score DESC;
`,
  },
  {
    id: 'tpl-r-stats',
    name: 'Statistical Analysis (R)',
    description: 'R template for statistical tests and visualization',
    language: 'r',
    category: 'analysis',
    code: `# Statistical Analysis Template (R)
# SciHub Pro Workspace

# Load required libraries
library(tidyverse)
library(ggplot2)
library(stats)
library(pheatmap)
library(corrplot)

# ============================================
# 1. LOAD AND PREPARE DATA
# ============================================

# Create sample dataset (replace with your data)
set.seed(42)
n_samples <- 100

data <- tibble(
  sample_id = paste0("sample_", sprintf("%03d", 1:n_samples)),
  group = rep(c("Control", "Treatment"), each = n_samples/2),
  gene_A = rnorm(n_samples, mean = 10, sd = 2),
  gene_B = rnorm(n_samples, mean = ifelse(rep(c("Control", "Treatment"), each = n_samples/2) == "Treatment", 12, 10), sd = 2),
  gene_C = rnorm(n_samples, mean = 5, sd = 1.5),
  batch = rep(c("B1", "B2", "B3", "B4", "B5"), each = 20)
)

cat("Dataset loaded:", nrow(data), "samples x", ncol(data)-1, "features\\n")

# ============================================
# 2. EXPLORATORY DATA ANALYSIS
# ============================================

cat("\\n=== Data Summary ===\\n")
summary(data[, c("gene_A", "gene_B", "gene_C")])

# Check for missing values
cat("\\nMissing values:\\n")
colSums(is.na(data))

# Distribution plots
p1 <- ggplot(data, aes(x = gene_A, fill = group)) +
  geom_histogram(alpha = 0.7, position = "identity", bins = 30) +
  labs(title = "Gene A Distribution by Group", x = "Expression", y = "Count") +
  theme_minimal()
print(p1)

# Boxplot comparison
p2 <- data %>%
  pivot_longer(cols = starts_with("gene_"), names_to = "gene", values_to = "expression") %>%
  ggplot(aes(x = gene, y = expression, fill = group)) +
  geom_boxplot(alpha = 0.7) +
  labs(title = "Expression Comparison Across Genes", x = "Gene", y = "Expression") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))
print(p2)

# ============================================
# 3. STATISTICAL TESTS
# ============================================

cat("\\n=== Statistical Tests ===\\n")

# T-test for Gene B (Treatment effect)
t_result <- t.test(gene_B ~ group, data = data)
cat("T-test (Gene B):\\n")
print(t_result)

# Effect size (Cohen's d)
cohens_d <- function(x, y) {
  (mean(x) - mean(y)) / sqrt((var(x) + var(y)) / 2)
}
d <- cohens_d(data$gene_B[data$group == "Treatment"], 
              data$gene_B[data$group == "Control"])
cat(sprintf("\\nCohen's d: %.3f\\n", d))

# ANOVA for multiple groups
anova_result <- aov(gene_A ~ batch, data = data)
cat("\\nANOVA (Gene A by Batch):\\n")
print(summary(anova_result))

# Correlation matrix
cor_matrix <- cor(data[, c("gene_A", "gene_B", "gene_C")])
cat("\\nCorrelation Matrix:\\n")
print(round(cor_matrix, 3))

# Visualize correlations
corrplot(cor_matrix, method = "color", type = "upper",
         addCoef.col = "black", tl.cex = 0.8)

# ============================================
# 4. MULTIVARIATE ANALYSIS
# ============================================

# PCA
pca_data <- data[, c("gene_A", "gene_B", "gene_C")]
pca_result <- prcomp(pca_data, scale. = TRUE)

cat("\\n=== PCA Results ===\\n")
cat("Variance explained:\\n")
print(summary(pca_result)$importance)

# PCA plot
pca_df <- data.frame(
  PC1 = pca_result$x[, 1],
  PC2 = pca_result$x[, 2],
  group = data$group
)

p3 <- ggplot(pca_df, aes(x = PC1, y = PC2, color = group)) +
  geom_point(size = 3, alpha = 0.7) +
  stat_ellipse(level = 0.95) +
  labs(title = "PCA of Gene Expression", 
       x = paste0("PC1 (", round(summary(pca_result)$importance[2,1]*1, 1), "%)"),
       y = paste0("PC2 (", round(summary(pca_result)$importance[2,2]*1, 1), "%)")) +
  theme_minimal()
print(p3)

# ============================================
# 5. SAVE RESULTS
# ============================================

results <- list(
  t_test = t_result,
  anova = summary(anova_result),
  correlations = cor_matrix,
  pca = list(
    scores = pca_result$x,
    variance_explained = summary(pca_result)$importance
  )
)

saveRDS(results, "statistical_results.rds")
cat("\\n✅ Results saved to 'statistical_results.rds'\\n")
cat("🎉 Analysis complete!\\n")
`,
  },
  {
    id: 'tpl-md-report',
    name: 'Research Report Template',
    description: 'Markdown template for documenting research findings',
    language: 'markdown',
    category: 'template',
    code: `# Research Report Template

**Project:** [Project Name]  
**Author:** [Your Name]  
**Date:** ${new Date().toLocaleDateString()}  
**Status:** In Progress

---

## Executive Summary

> Provide a brief overview (2-3 sentences) of the research question, approach, and key findings.

---

## 1. Introduction

### 1.1 Background

[Describe the scientific context and motivation for this work]

### 1.2 Research Questions

- **Primary Question:** [What is the main question you're trying to answer?]
- **Secondary Questions:**
  - [Question 2]
  - [Question 3]

### 1.3 Hypothesis

[H1]: [Your primary hypothesis]

---

## 2. Methods

### 2.1 Data Sources

| Dataset | Source | Size | Type |
|---------|--------|------|------|
| [Name] | [Source] | [Size] | [Type] |

### 2.2 Analysis Pipeline

\`\`\`mermaid
graph LR
    A[Raw Data] --> B[Quality Control]
    B --> C[Normalization]
    C --> D[Statistical Analysis]
    D --> E[Visualization]
    E --> F[Interpretation]
\`\`\`

### 2.3 Software/Tools

- **Programming Language:** Python 3.11 / R 4.3
- **Key Packages:** pandas, scikit-learn, ggplot2
- **Environment:** SciHub Pro Workspace

---

## 3. Results

### 3.1 Data Overview

- Total samples: [N]
- Features: [N]
- Missing data: [X%]

### 3.2 Key Findings

#### Finding 1: [Title]

**Observation:** [What did you find?]  
**Statistical Evidence:** [p-value, effect size]  
**Visualization:** [Reference figure]

#### Finding 2: [Title]

**Observation:** [What did you find?]

---

## 4. Discussion

### 4.1 Interpretation

[How do your results answer the research questions?]

### 4.2 Limitations

- [Limitation 1]
- [Limitation 2]

### 4.3 Future Directions

- [Next step 1]
- [Next step 2]

---

## 5. Conclusions

[Summarize the main takeaways and their implications]

---

## References

1. [Author et al. (Year). Title. Journal. DOI:...]
2. [Add more references...]

---

## Appendix

### A. Supplementary Figures

[Additional figures and tables]

### B. Code Availability

[Link to analysis scripts / repository]

### C. Raw Data

[Data availability statement]

---

*Report generated using SciHub Pro Workspace*
`,
  },
  {
    id: 'tpl-js-viz',
    name: 'Interactive Visualization',
    description: 'JavaScript template for creating interactive charts',
    language: 'javascript',
    category: 'visualization',
    code: `// Interactive Visualization Template
// SciHub Pro Workspace

// This template creates interactive D3.js-style visualizations
// For use in notebook environments or web export

const data = {
  // Sample gene expression data
  genes: Array.from({ length: 50 }, (_, i) => ({
    id: \`GENE_\${i+1}\`,
    expression: Math.random() * 20 + 5,
    pValue: Math.random() * 0.1,
    foldChange: (Math.random() - 0.5) * 6,
    pathway: ['Cell Cycle', 'Apoptosis', 'DNA Repair', 'Signaling'][Math.floor(Math.random() * 4)],
    significant: Math.random() > 0.8
  }))
};

// ============================================
// VOLCANO PLOT
// ============================================

function createVolcanoPlot(containerId) {
  const container = document.getElementById(containerId);
  
  // Setup SVG
  const width = 800;
  const height = 500;
  const margin = { top: 40, right: 40, bottom: 60, left: 70 };
  
  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data.genes, d => d.foldChange))
    .range([margin.left, width - margin.right]);
    
  const yScale = d3.scaleLinear()
    .domain([0, -Math.log10(d3.min(data.genes, d => d.pValue)) * 1.1])
    .range([height - margin.bottom, margin.top]);
  
  // Draw points
  const svg = d3.select(container).append('svg')
    .attr('width', width)
    .attr('height', height);
    
  svg.selectAll('circle')
    .data(data.genes)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.foldChange))
    .attr('cy', d => yScale(-Math.log10(d.pValue)))
    .attr('r', d => d.significant ? 6 : 4)
    .attr('fill', d => {
      if (d.significant && d.foldChange > 0) return '#e41a1c'; // Red up
      if (d.significant && d.foldChange < 0) return '#377eb8'; // Blue down
      return '#999999'; // Gray not significant
    })
    .attr('opacity', 0.7)
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip);
    
  // Threshold lines
  svg.append('line')
    .attr('x1', xScale(-1))
    .attr('y1', margin.top)
    .attr('x2', xScale(-1))
    .attr('y2', height - margin.bottom)
    .attr('stroke', 'green')
    .attr('stroke-dasharray', '5,5');
    
  svg.append('line')
    .attr('x1', xScale(1))
    .attr('y1', margin.top)
    .attr('x2', xScale(1))
    .attr('y2', height - margin.bottom)
    .attr('stroke', 'green')
    .attr('stroke-dasharray', '5,5');
    
  svg.append('line')
    .attr('x1', margin.left)
    .attr('y1', yScale(-Math.log10(0.05)))
    .attr('x2', width - margin.right)
    .attr('y2', yScale(-Math.log10(0.05)))
    .attr('stroke', 'blue')
    .attr('stroke-dasharray', '5,5');
    
  // Axes
  svg.append('g')
    .attr('transform', \`translate(0, \${height - margin.bottom})\`)
    .call(d3.axisBottom(xScale));
    
  svg.append('g')
    .attr('transform', \`translate(\${margin.left}, 0)\`)
    .call(d3.axisLeft(yScale));
    
  // Labels
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .text('Log2 Fold Change');
    
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(height / 2))
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .text('-Log10(P-value)');
}

// ============================================
// HEATMAP
// ============================================

function createHeatmap(containerId) {
  // Sample matrix data
  const matrix = [];
  const genes = data.genes.slice(0, 10);
  const samples = ['Sample_1', 'Sample_2', 'Sample_3', 'Sample_4', 'Sample_5'];
  
  genes.forEach(gene => {
    samples.forEach(sample => {
      matrix.push({
        gene: gene.id,
        sample: sample,
        value: gene.expression + (Math.random() - 0.5) * 5
      });
    });
  });
  
  // Color scale
  const colorScale = d3.scaleSequential(d3.interpolateRdBu)
    .domain(d3.extent(matrix, d => d.value));
    
  // Render heatmap cells...
}

// ============================================
// USAGE
// ============================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  createVolcanoPlot('volcano-container');
  createHeatmap('heatmap-container');
});

console.log('Visualization templates loaded successfully!');
console.log(\`Ready to visualize \${data.genes.length} genes\`);
`,
  },
];

// ============ WORKSPACE PAGE COMPONENT ============

export default function WorkspacePage() {
  const { t } = useTranslation();
  const store = useSciHubStore();
  
  // Store state
  const {
    workspaceFiles,
    activeFileId,
    addWorkspaceFile,
    updateFileContent,
    setActiveFile,
    deleteWorkspaceFile,
    executeCode,
    activities,
    addActivity,
    preferences,
    guidanceSuggestions,
    getRelevantGuidance,
    dismissGuidance,
  } = store;

  // Local UI state
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState<WorkspaceFile['language']>('python');
  const [showTemplates, setShowTemplates] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Get active file
  const activeFile = workspaceFiles.find((f) => f.id === activeFileId);

  // Guidance for this context
  const relevantGuidance = getRelevantGuidance('workspace');

  // Auto-save effect
  useEffect(() => {
    if (!activeFile || !activeFile.isModified.value) return;
    
    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      // Simulate auto-save
      setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 500);
    }, preferences.autoSaveInterval * 1000);

    return () => clearTimeout(timer);
  }, [activeFile?.content.value, preferences.autoSaveInterval]);

  // ============ HANDLERS ============

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;

    addWorkspaceFile({
      name: createDynamicField(newFileName.endsWith(`.${newFileLanguage}`) ? newFileName : `${newFileName}.${newFileLanguage}`),
      content: createDynamicField(getDefaultContent(newFileLanguage)),
      language: newFileLanguage,
      isModified: createDynamicField(false),
    });

    addActivity({
      type: 'create',
      message: createDynamicField(`Created file: ${newFileName}`),
      icon: '📄',
    });

    setShowNewFileDialog(false);
    setNewFileName('');
  };

  const handleContentChange = (content: string) => {
    if (!activeFileId) return;
    updateFileContent(activeFileId, content);
    setAutoSaveStatus('unsaved');
  };

  const handleExecute = async () => {
    if (!activeFileId) return;
    
    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);

    try {
      const result = await executeCode(activeFileId);
      
      if (result.status === 'success') {
        setExecutionResult(result.output);
        addActivity({
          type: 'compute',
          message: createDynamicField(`Executed ${activeFile?.name.value}: Success`),
          icon: '✅',
        });
      } else {
        setExecutionError(result.error || 'Unknown error occurred');
        addActivity({
          type: 'error_recovery',
          message: createDynamicField(`Execution error in ${activeFile?.name.value}`),
          icon: '⚠️',
          metadata: { error: result.error },
        });
      }
    } catch (error) {
      setExecutionError('Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleUseTemplate = (template: CodeTemplate) => {
    addWorkspaceFile({
      name: createDynamicField(`${template.name.toLowerCase().replace(/\s+/g, '_')}.${template.language === 'r' ? 'r' : template.language}`),
      content: createDynamicField(template.code),
      language: template.language,
      isModified: createDynamicField(true),
    });

    addActivity({
      type: 'create',
      message: createDynamicField(`Created file from template: ${template.name}`),
      icon: '📋',
    });

    setShowTemplates(false);
  };

  const handleDeleteFile = (id: string) => {
    const file = workspaceFiles.find((f) => f.id === id);
    if (!file) return;

    deleteWorkspaceFile(id);
    addActivity({
      type: 'delete',
      message: createDynamicField(`Deleted file: ${file.name.value}`),
      icon: '🗑️',
    });
  };

  // ============ HELPERS ============

  const getDefaultContent = (lang: WorkspaceFile['language']): string => {
    const defaults: Record<string, string> = {
      python: '# New Python script\n# Start coding here...\n\nprint("Hello, Science!")\n',
      sql: '-- New SQL query\n-- Write your query here\n\nSELECT * FROM dataset LIMIT 10;\n',
      r: '# New R script\n# Start coding here\n\ncat("Hello, Science!\\n")\n',
      markdown: '# New Document\n\nStart writing here...\n',
      javascript: '// New JavaScript file\n// Start coding here\n\nconsole.log("Hello, Science!");\n',
      bash: '#!/bin/bash\n# New shell script\n\necho "Hello, Science!"\n',
      java: '// New Java file\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Science!");\n    }\n}\n',
      cpp: '// New C++ file\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, Science!" << std::endl;\n    return 0;\n}\n',
      typescript: '// New TypeScript file\nconsole.log("Hello, Science!");\n',
    };
    return defaults[lang] || '';
  };

  const getLanguageIcon = (lang: WorkspaceFile['language']): string => {
    const icons: Record<string, string> = {
      python: '🐍',
      sql: '🗃️',
      r: '📊',
      markdown: '📝',
      javascript: '⚡',
      bash: '💻',
      java: '☕',
      cpp: '⚙️',
      typescript: '💎',
    };
    return icons[lang] || '📄';
  };

  const getLanguageColor = (lang: WorkspaceFile['language']): string => {
    const colors: Record<string, string> = {
      python: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      sql: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      r: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      markdown: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      bash: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      java: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cpp: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[lang] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('workspace.title') || 'Workspace'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('workspace.subtitle') || 'Write, execute, and analyze code interactively'}
            </p>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            {/* Auto-save Status */}
            <div className="flex items-center gap-2 text-sm">
              {autoSaveStatus === 'saved' && <span className="text-green-500">● Saved</span>}
              {autoSaveStatus === 'saving' && <span className="text-yellow-500 animate-pulse">● Saving...</span>}
              {autoSaveStatus === 'unsaved' && <span className="text-orange-500">● Unsaved</span>}
            </div>

            {/* File Count */}
            <Badge variant="secondary">
              {workspaceFiles.length} files
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-120px)] mt-6">
        {/* Sidebar - File List */}
        <div className="w-72 border-r bg-muted/30 flex flex-col">
          {/* File Actions */}
          <div className="p-4 border-b space-y-2">
            <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start gap-2">
                  📄 New File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">File Name</label>
                    <Input
                      placeholder="my_analysis.py"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="mt-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <Select value={newFileLanguage} onValueChange={(v) => setNewFileLanguage(v as WorkspaceFile['language'])}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">🐍 Python</SelectItem>
                        <SelectItem value="sql">🗃️ SQL</SelectItem>
                        <SelectItem value="r">📊 R</SelectItem>
                        <SelectItem value="markdown">📝 Markdown</SelectItem>
                        <SelectItem value="javascript">⚡ JavaScript</SelectItem>
                        <SelectItem value="bash">💻 Bash</SelectItem>
                        <SelectItem value="java">☕ Java</SelectItem>
                        <SelectItem value="cpp">⚙️ C++</SelectItem>
                        <SelectItem value="typescript">💎 TypeScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFile} disabled={!newFileName.trim()}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowTemplates(!showTemplates)}>
              📋 Templates
            </Button>
          </div>

          {/* Template Panel */}
          {showTemplates && (
            <div className="p-4 border-b bg-background max-h-64 overflow-auto">
              <h4 className="font-medium mb-3 text-sm">Quick Start Templates</h4>
              <div className="space-y-2">
                {CODE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getLanguageIcon(template.language)}</span>
                      <span className="text-sm font-medium">{template.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6 mt-1 line-clamp-1">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File List */}
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {workspaceFiles.map((file) => (
              <div
                key={file.id}
                role="button"
                tabIndex={0}
                className={`w-full text-left p-3 rounded-lg transition-colors group cursor-pointer ${
                  activeFileId === file.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                }`}
                onClick={() => setActiveFile(file.id)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveFile(file.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span>{getLanguageIcon(file.language)}</span>
                    <span className={`text-sm truncate ${file.isModified.value ? 'font-medium' : ''}`}>
                      {file.name.value}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.isModified.value && (
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-1 hover:text-destructive"
                      aria-label={`Delete ${file.name.value}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1 ml-6">
                  <Badge variant="outline" className={`text-xs px-1.5 py-0 ${getLanguageColor(file.language)}`}>
                    {file.language}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(file.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {workspaceFiles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-2xl block mb-2">📂</span>
                <p className="text-sm">No files yet</p>
                <p className="text-xs mt-1">Create a new file or use a template</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <>
              {/* Editor Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <span>{getLanguageIcon(activeFile.language)}</span>
                  <span className="font-medium">{activeFile.name.value}</span>
                  {activeFile.isModified.value && (
                    <Badge variant="secondary" className="text-xs">Modified</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleExecute}
                    disabled={isExecuting || activeFile.language === 'markdown'}
                  >
                    {isExecuting ? (
                      <>⏳ Running...</>
                    ) : (
                      <>▶️ Run (Ctrl+Enter)</>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const content = activeFile.content.value;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = activeFile.name.value;
                      a.click();
                      URL.revokeObjectURL(url);
                      
                      addActivity({
                        type: 'export',
                        message: createDynamicField(`Downloaded: ${activeFile.name.value}`),
                        icon: '📥',
                      });
                    }}
                  >
                    ⬇️ Download
                  </Button>
                </div>
              </div>

              {/* Editor + Output Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                  <Textarea
                    value={activeFile.content.value}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="flex-1 resize-none font-mono text-sm p-4 border-0 focus-visible:ring-0 bg-background"
                    style={{
                      fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
                      fontSize: '14px',
                      lineHeight: '1.6',
                      tabSize: 4,
                    }}
                    spellCheck={false}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleExecute();
                      }
                      // Handle Tab for indentation
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        const start = e.currentTarget.selectionStart;
                        const end = e.currentTarget.selectionEnd;
                        const value = e.currentTarget.value;
                        e.currentTarget.value =
                          value.substring(0, start) + '    ' + value.substring(end);
                        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                        handleContentChange(e.currentTarget.value);
                      }
                    }}
                  />
                </div>

                {/* Output Panel */}
                {(executionResult || executionError || isExecuting) && (
                  <div className="w-[480px] border-l flex flex-col bg-muted/20">
                    <div className="px-4 py-2 border-b bg-muted/50 flex items-center justify-between">
                      <span className="font-medium text-sm">Output</span>
                      {(executionResult || executionError) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setExecutionResult(null);
                            setExecutionError(null);
                          }}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4">
                      {isExecuting && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="animate-spin">⏳</span>
                          <span>Executing code...</span>
                        </div>
                      )}

                      {executionResult && (
                        <pre className="text-sm whitespace-pre-wrap font-mono bg-background p-3 rounded-lg border">
                          {executionResult}
                        </pre>
                      )}

                      {executionError && (
                        <pre className="text-sm whitespace-pre-wrap font-mono bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20">
                          ❌ Error:\n{executionError}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <span className="text-6xl block mb-4">💻</span>
                <h3 className="text-xl font-semibold mb-2">Welcome to Your Workspace</h3>
                <p className="text-muted-foreground mb-6">
                  Create a new file or choose a template to start analyzing your data.
                  Write Python, R, SQL, or JavaScript code and see results instantly.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setShowNewFileDialog(true)} className="gap-2">
                    📄 New File
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplates(true)} className="gap-2">
                    📋 Use Template
                  </Button>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left">
                  <h4 className="font-medium mb-2">💡 Quick Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Press Ctrl+Enter to run code</li>
                    <li>• Files auto-save every {preferences.autoSaveInterval}s</li>
                    <li>• Use templates for common analysis tasks</li>
                    <li>• Connect datasets from the Data Lake</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guidance Panel */}
      {relevantGuidance.length > 0 && !showTemplates && (
        <Card className="m-6 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{relevantGuidance[0].icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  {relevantGuidance[0].title}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {relevantGuidance[0].message}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissGuidance(relevantGuidance[0].id)}
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
