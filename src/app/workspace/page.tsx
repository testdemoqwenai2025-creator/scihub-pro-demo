'use client';

/**
 * SciHub Pro - Workspace Page
 * 
 * Interactive code editor and execution environment with:
 * - Multi-file workspace (Python, SQL, R, Markdown)
 * - Code execution simulation with realistic terminal output
 * - File persistence to store
 * - Auto-save functionality
 * - Template library for quick start
 * - Execution history tracking
 * - Never let user hit a wall - always show next steps
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { useSciHubStore } from '@/store/useSciHubStore';
import { createDynamicField } from '@/store/useDynamicStore';
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
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/lib/toast-utils';

// ============ TYPES ============

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  language: 'python' | 'sql' | 'r' | 'markdown' | 'javascript';
  code: string;
  category: 'analysis' | 'visualization' | 'ml' | 'data-import' | 'template';
}

interface ExecutionRecord {
  id: string;
  timestamp: Date;
  language: string;
  code: string;
  output: string;
  duration: number;
  success: boolean;
  memory: string;
}

interface WorkspaceFile {
  id: string;
  name: { value: string };
  content: { value: string };
  language: 'python' | 'sql' | 'r' | 'markdown' | 'javascript' | 'bash' | 'java' | 'cpp' | 'typescript';
  isModified: { value: boolean };
  lastModified: number;
}

type ExecutionState = 'idle' | 'compiling' | 'running' | 'complete' | 'error';

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

// ============ EXECUTION SIMULATION HELPERS ============

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generatePythonOutput = (code: string): string => {
  const lines = code.split('\n');
  const outputs: string[] = [];
  
  // Detect print statements and generate appropriate output
  const hasPrint = code.includes('print(');
  const hasDataFrame = code.includes('pd.DataFrame') || code.includes('DataFrame');
  const hasMatplotlib = code.includes('plt.') || code.includes('matplotlib');
  const hasDescribe = code.includes('.describe()');
  
  if (hasDataFrame || hasPrint) {
    // Simulate DataFrame creation
    if (hasDataFrame) {
      outputs.push('');
      outputs.push('   gene_id  expression   p_value  log2_fold_change     pathway');
      outputs.push('0   GENE_0    9.823452  0.045678          -0.234567   Cell Cycle');
      outputs.push('1   GENE_1   11.234567  0.023456           1.345678  Apoptosis');
      outputs.push('2   GENE_2    8.765432  0.067890          -0.987654   DNA Repair');
      outputs.push('3   GENE_3   12.345678  0.012345           2.123456   Signaling');
      outputs.push('4   GENE_4   10.123456  0.056789          -0.456789   Cell Cycle');
      outputs.push('...');
      outputs.push(`[${Math.floor(Math.random() * 50 + 80)} rows x 5 columns]`);
    }
    
    // Simulate print statements
    if (hasPrint) {
      outputs.push('');
      if (code.includes('Loading dataset')) {
        outputs.push('Loading dataset: ds-001');
      }
      if (code.includes('Loaded')) {
        outputs.push(`Loaded ${Math.floor(Math.random() * 50 + 80)} genes with columns: ['gene_id', 'expression', 'p_value', 'log2_fold_change', 'pathway']`);
      }
      if (code.includes('Data Quality')) {
        outputs.push('');
        outputs.push('--- Data Quality Report ---');
        outputs.push('Missing values:');
        outputs.push('gene_id             0');
        outputs.push('expression          0');
        outputs.push('p_value             0');
        outputs.push('log2_fold_change    0');
        outputs.push('pathway             0');
        outputs.push('dtype: int64');
      }
      if (code.includes('Outliers detected')) {
        const outlierCount = Math.floor(Math.random() * 10 + 3);
        outputs.push(`\\nOutliers detected: ${outlierCount} (${(outlierCount / 100 * 100).toFixed(1)}%)`);
      }
      if (code.includes('Statistical Summary') || hasDescribe) {
        outputs.push('');
        outputs.push('--- Statistical Summary ---');
        outputs.push('         expression      p_value  log2_fold_change');
        outputs.push('count   100.000000   100.000000        100.000000');
        outputs.push('mean     10.023456     0.048765          0.123456');
        outputs.push('std       2.012345     0.028765          1.487654');
        outputs.push('min       4.567890     0.001234         -3.987654');
        outputs.push('25%       8.654321     0.025678         -0.987654');
        outputs.push('50%      10.012345     0.048765          0.098765');
        outputs.push('75%     11.345678     0.069876          1.234567');
        outputs.push('max      15.678901     0.098765          4.567890');
      }
      if (code.includes('Significant genes found')) {
        const sigCount = Math.floor(Math.random() * 20 + 10);
        outputs.push(`\\nSignificant genes found: ${sigCount} (${sigCount}%)`);
      }
      if (code.includes('Visualization saved')) {
        outputs.push('\\n✅ Visualization saved to \'analysis_results.png\'');
      }
      if (code.includes('exported')) {
        outputs.push('✅ Results exported to \'significant_genes.csv\'');
      }
      if (code.includes('complete')) {
        outputs.push('\\n🎉 Analysis complete!');
      }
    }
  } else {
    // Generic Python output
    outputs.push('Hello, Science!');
    outputs.push('');
    outputs.push('[Execution completed successfully]');
  }
  
  // ASCII Chart simulation if matplotlib is used
  if (hasMatplotlib) {
    outputs.push('');
    outputs.push('┌─────────────────────────────────────────────────────────────┐');
    outputs.push('│                    Volcano Plot                            │');
    outputs.push('│                                                             │');
    outputs.push('│  5 │                                    ●                   │');
    outputs.push('│    │                               ●     ●                  │');
    outputs.push('│  4 │                          ●  ●  ●     ●                │');
    outputs.push('│    │                     ●  ●  ●        ●  ●               │');
    outputs.push('│  3 │                ●  ●  ●                 ●              │');
    outputs.push('│    │           ●  ●  ●        ----|----●  ●                 │');
    outputs.push('│  2 │      ●  ●  ●              |    |                       │');
    outputs.push('│    │   ●  ●                     |    |                       │');
    outputs.push('│  1 │  ●  ●                      |    |                       │');
    outputs.push('│    │●                            |    |                       │');
    outputs.push('│  0 ┼────────────────────────────┼────┼──────────────────────│');
    outputs.push('│   -4  -3  -2  -1   0   1   2   3    4   Log2 Fold Change    │');
    outputs.push('└─────────────────────────────────────────────────────────────┘');
  }
  
  return outputs.length > 0 ? '\n' + outputs.join('\n') : '\n[No output]';
};

const generateSQLOutput = (code: string): string => {
  const outputs: string[] = [];
  
  // Detect query type
  const hasSelect = code.toUpperCase().includes('SELECT');
  const hasJoin = code.toUpperCase().includes('JOIN');
  const hasGroupBy = code.toUpperCase().includes('GROUP BY');
  const hasCTE = code.toUpperCase().includes('WITH');
  const hasWindowFunc = code.includes('OVER (');
  
  if (hasSelect) {
    // Query plan
    outputs.push('');
    outputs.push('→ Query Plan: Seq Scan on gene_expression_dataset (cost=0.00..142.50 rows=100 width=124)');
    
    if (code.toUpperCase().includes('WHERE')) {
      outputs.push('→ Filter: (p_value < 0.05::double precision)');
    }
    if (hasJoin) {
      outputs.push('→ Hash Join: (cost=145.00..520.30 rows=50 width=256)');
      outputs.push('→   Hash Cond: (g.gene_id = p.gene_id)');
    }
    if (hasGroupBy) {
      outputs.push('→ GroupAggregate (cost=120.00..180.00 rows=10 width=64)');
      outputs.push('→   Group Key: pathway');
      outputs.push('→   Sort Key: sig_count DESC');
    }
    
    outputs.push('');
    
    // Result table based on query type
    if (code.includes('COUNT(*)') && !hasGroupBy) {
      outputs.push('┌──────────────┬─────────────┬───────────────┬──────────────┬──────────────┬──────────────┐');
      outputs.push('│ total_records│ unique_genes│ avg_expression│ std_expression│ min_expression│ max_expression│');
      outputs.push('├──────────────┼─────────────┼───────────────┼──────────────┼──────────────┼──────────────┤');
      outputs.push('│        1,247│         892│      10.2345  │     2.0123   │     4.5679   │    15.6789   │');
      outputs.push('└──────────────┴─────────────┴───────────────┴──────────────┴──────────────┴──────────────┘');
      outputs.push('');
      outputs.push('→ Returned 1 row in 45ms');
    } else if (hasGroupBy) {
      outputs.push('┌───────────────┬───────────┬───────────────┬────────────────┬──────────┐');
      outputs.push('│    pathway    │ gene_count│ mean_expression│ median_expression│ sig_count│');
      outputs.push('├───────────────┼───────────┼───────────────┼────────────────┼──────────┤');
      outputs.push('│ Cell Cycle    │       245│       10.4567  │       10.2345  │       42│');
      outputs.push('│ Apoptosis     │       198│        9.8765  │        9.7654  │       38│');
      outputs.push('│ DNA Repair    │       176│       11.2345  │       11.0123  │       28│');
      outputs.push('│ Signaling     │       234│        9.5432  │        9.4321  │       35│');
      outputs.push('│ Metabolism    │       187│       10.1234  │        9.9876  │       31│');
      outputs.push('└───────────────┴───────────┴───────────────┴────────────────┴──────────┘');
      outputs.push('');
      outputs.push('→ Returned 5 rows in 128ms');
    } else if (hasJoin) {
      outputs.push('┌─────────┬───────────┬────────────┬──────────┬──────────────────┬───────────────────┬────────────────┬───────────────┬──────────────┐');
      outputs.push('│ gene_id │ gene_name │ expression │ p_value  │   protein_name   │ function_description│ cellular_location│ compound_name │binding_affinity│');
      outputs.push('├─────────┼───────────┼────────────┼──────────┼──────────────────┼───────────────────┼────────────────┼───────────────┼──────────────┤');
      outputs.push('│ GENE_042│ TP53      │   14.5678 │ 0.00123  │ P53 protein      │ Tumor suppressor  │ Nucleus        │ Nutlin-3      │          5.2  │');
      outputs.push('│ GENE_089│ BRCA1     │   13.2345 │ 0.00234  │ BRCA1 protein    │ DNA repair        │ Nucleus        │ Olaparib      │         42.1  │');
      outputs.push('│ GENE_156│ EGFR      │   12.9876 │ 0.00345  │ EGFR receptor    │ Signal transduction│ Membrane       │ Gefitinib     │        125.6  │');
      outputs.push('│ ...     │           │            │          │                  │                  │                │               │              │');
      outputs.push('└─────────┴───────────┴────────────┴──────────┴──────────────────┴───────────────────┴────────────────┴───────────────┴──────────────┘');
      outputs.push('');
      outputs.push('→ Returned 47 rows in 234ms');
    } else if (hasWindowFunc) {
      outputs.push('┌──────────┬────────────┬───────────┬───────────┬──────────────┬───────────────────┬────────────────────┬────────────────┐');
      outputs.push('│  gene_id │ expression │  p_value  │fold_change│  expr_rank   │expression_quartile│ prev_expression    │    sample_id   │');
      outputs.push('├──────────┼────────────┼───────────┼───────────┼──────────────┼───────────────────┼────────────────────┼────────────────┤');
      outputs.push('│ GENE_012 │   15.2345  │ 0.00234   │  2.34567  │      1       │        4         │     14.1234        │  sample_001    │');
      outputs.push('│ GENE_045 │   14.9876  │ 0.00345   │  2.12345  │      2       │        4         │     14.5678        │  sample_001    │');
      outputs.push('│ GENE_078 │   14.5678  │ 0.00456   │  1.98765  │      3       │        4         │     14.2345        │  sample_001    │');
      outputs.push('│ GENE_023 │   11.2345  │ 0.02345   │ -1.23456  │     45       │        2         │     11.5678        │  sample_001    │');
      outputs.push('│ ...      │            │           │           │             │                   │                    │                │');
      outputs.push('└──────────┴────────────┴───────────┴───────────┴──────────────┴───────────────────┴────────────────────┴────────────────┘');
      outputs.push('');
      outputs.push('→ Returned 200 rows in 189ms');
    } else {
      // Default SELECT result
      outputs.push('┌─────────┬───────────┬────────────┬──────────┬────────────────┐');
      outputs.push('│ gene_id │ gene_name │ expression │ p_value  │ log2_fold_change│');
      outputs.push('├─────────┼───────────┼────────────┼──────────┼────────────────┤');
      outputs.push('│ GENE_001│ GENEA     │   9.8234   │ 0.04567  │    -0.23456    │');
      outputs.push('│ GENE_002│ GENEB     │  11.2345   │ 0.02345  │     1.34567    │');
      outputs.push('│ GENE_003│ GENEC     │   8.7654   │ 0.06789  │    -0.98765    │');
      outputs.push('│ GENE_004| GENED     │  12.3456   │ 0.01234  │     2.12345    │');
      outputs.push('│ GENE_005| GENEE     │  10.1234   │ 0.05678  │    -0.45678    │');
      outputs.push('│ ...     │           │            │          │                │');
      outputs.push('└─────────┴───────────┴────────────┴──────────┴────────────────┘');
      outputs.push('');
      outputs.push('→ Returned 87 rows in 156ms');
    }
  }
  
  if (hasCTE) {
    outputs.push('');
    outputs.push('→ CTE "gene_stats": Materialized (892 rows)');
    outputs.push('→ CTE "normalized": Materialized (892 rows, filtered to 43 outliers)');
  }
  
  return outputs.length > 0 ? outputs.join('\n') : '\nQuery executed successfully.';
};

const generateROutput = (code: string): string => {
  const outputs: string[] = [];
  
  const hasCat = code.includes('cat(');
  const hasPrint = code.includes('print(');
  const hasSummary = code.includes('summary(');
  const hasTTest = code.includes('t.test(');
  const hasAnova = code.includes('aov(');
  const hasCorr = code.includes('cor(');
  const hasPCA = code.includes('prcomp(');
  const hasGgplot = code.includes('ggplot(');
  
  // Library loading messages
  if (code.includes('library(')) {
    outputs.push('Loading required package: ggplot2');
    outputs.push('Warning: package \'ggplot2\' was built under R version 4.3.3');
    outputs.push('Loading required package: pheatmap');
    outputs.push('Loading required package: corrplot');
    outputs.push('corrplot 0.92 loaded');
    outputs.push('');
  }
  
  if (hasCat) {
    if (code.includes('Dataset loaded')) {
      outputs.push('Dataset loaded: 100 samples x 4 features');
    }
    if (code.includes('Data Summary')) {
      outputs.push('');
      outputs.push('=== Data Summary ===');
      outputs.push('');
      outputs.push('     gene_A          gene_B          gene_C       ');
      outputs.push(' Min.   : 4.567   Min.   : 8.123   Min.   :1.234  ');
      outputs.push(' 1st Qu.: 8.654   1st Qu.:10.456   1st Qu.:3.987  ');
      outputs.push(' Median :10.123   Median :11.987   Median :5.012  ');
      outputs.push(' Mean   :10.023   Mean   :11.876   Mean   :5.034  ');
      outputs.push(' 3rd Qu.:11.456   3rd Qu.:13.234   3rd Qu.:6.078  ');
      outputs.push(' Max.   :15.678   Max.   :15.987   Max.   :8.976  ');
    }
    if (code.includes('Missing values')) {
      outputs.push('');
      outputs.push('Missing values:');
      outputs.push('sample_id       gene_A       gene_B       gene_C        batch ');
      outputs.push('        0           0           0           0           0 ');
    }
  }
  
  if (hasSummary) {
    outputs.push('');
    outputs.push('=== Statistical Tests ===');
    outputs.push('');
    outputs.push('T-test (Gene B):');
  }
  
  if (hasTTest) {
    outputs.push('');
    outputs.push('\tWelch Two Sample t-test');
    outputs.push('');
    outputs.push('data:  gene_B by group');
    outputs.push('t = 4.2345, df = 97.123, p-value = 0.0000523');
    outputs.push('alternative hypothesis: true difference in means is not equal to 0');
    outputs.push('95 percent confidence interval:');
    outputs.push(' 1.234567 3.456789');
    outputs.push('sample estimates:');
    outputs.push('mean in group Control mean in group Treatment ');
    outputs.push('           10.123456            11.768789 ');
    outputs.push('');
    outputs.push("Cohen's d: 0.847");
  }
  
  if (hasAnova) {
    outputs.push('');
    outputs.push('ANOVA (Gene A by Batch):');
    outputs.push('            Df Sum Sq Mean Sq F value Pr(>F)  ');
    outputs.push('batch        4  45.67  11.418   2.987  0.0234 *');
    outputs.push('Residuals   95 364.32   3.835                 ');
    outputs.push('---');
    outputs.push('Signif. codes:  0 \'***\' 0.001 \'**\' 0.01 \'*\' 0.05 \'.\' 0.1 \' \' 1');
  }
  
  if (hasCorr) {
    outputs.push('');
    outputs.push('Correlation Matrix:');
    outputs.push('         gene_A gene_B gene_C');
    outputs.push('gene_A  1.000  0.234 -0.123');
    outputs.push('gene_B  0.234  1.000  0.456');
    outputs.push('gene_C -0.123  0.456  1.000');
  }
  
  if (hasPCA) {
    outputs.push('');
    outputs.push('=== PCA Results ===');
    outputs.push('Variance explained:');
    outputs.push('                            PC1     PC2     PC3');
    outputs.push('Standard deviation     1.4567  0.9876  0.8234');
    outputs.push('Proportion of Variance 0.5234  0.2401  0.1665');
    outputs.push('Cumulative Proportion  0.5234  0.7635  1.0000');
  }
  
  if (hasGgplot) {
    outputs.push('');
    outputs.push('`geom_smooth()` using formula = \'y ~ x\'');
    outputs.push('');
    outputs.push('┌─────────────────────────────────────────────────────────────┐');
    outputs.push('│              Gene A Distribution by Group                 │');
    outputs.push('│                                                             │');
    outputs.push('│  Count  30 │  ████                                           │');
    outputs.push('│         25 │  █████                                         │');
    outputs.push('│         20 │  ███████                                       │');
    outputs.push('│         15 │  █████████                                     │');
    outputs.push('│         10 │  ███████████                                   │');
    outputs.push('│          5 │  █████████████                                 │');
    outputs.push('│          0 │  ████████████████                              │');
    outputs.push('│             └────────────────────────────────              │');
    outputs.push('│              6    8   10   12   14                         │');
    outputs.push('│                        Expression                           │');
    outputs.push('└─────────────────────────────────────────────────────────────┘');
  }
  
  if (code.includes('saveRDS')) {
    outputs.push('');
    outputs.push('✅ Results saved to \'statistical_results.rds\'');
    outputs.push('🎉 Analysis complete!');
  }
  
  return outputs.length > 0 ? '\n' + outputs.join('\n') : '\n[No output]';
};

const generateJSOutput = (code: string): string => {
  const outputs: string[] = [];
  
  const hasConsoleLog = code.includes('console.log');
  const hasD3 = code.includes('d3.');
  const hasData = code.includes('const data');
  
  if (hasConsoleLog) {
    if (code.includes('loaded successfully')) {
      outputs.push('Visualization templates loaded successfully!');
    }
    if (code.includes('Ready to visualize')) {
      outputs.push('Ready to visualize 50 genes');
    }
    if (code.includes('Hello, Science!')) {
      outputs.push('Hello, Science!');
    }
  }
  
  if (hasData) {
    outputs.push('');
    outputs.push('{');
    outputs.push('  genes: [');
    outputs.push('    { id: \'GENE_1\', expression: 18.23, pValue: 0.045, foldChange: 2.34, pathway: \'Cell Cycle\', significant: false },');
    outputs.push('    { id: \'GENE_2\', expression: 12.45, pValue: 0.023, foldChange: -1.56, pathway: \'Apoptosis\', significant: true },');
    outputs.push('    { id: \'GENE_3\', expression: 22.67, pValue: 0.012, foldChange: 1.89, pathway: \'DNA Repair\', significant: true },');
    outputs.push('    ... 47 more items');
    outputs.push('  ]');
    outputs.push('}');
  }
  
  if (hasD3) {
    outputs.push('');
    outputs.push('SVG created: 800x500');
    outputs.push('Data points rendered: 50');
    outputs.push('Threshold lines added: 3');
    outputs.push('Axes configured: X (Log2 Fold Change), Y (-Log10 P-value)');
  }
  
  // Object inspection
  if (code.includes('createVolcanoPlot')) {
    outputs.push('');
    outputs.push('[Function: createVolcanoPlot] {');
    outputs.push('  length: 1,');
    outputs.push('  name: \'createVolcanoPlot\'');
    outputs.push('}');
  }
  
  if (code.includes('createHeatmap')) {
    outputs.push('');
    outputs.push('[Function: createHeatmap] {');
    outputs.push('  length: 1,');
    outputs.push('  name: \'createHeatmap\'');
    outputs.push('}');
  }
  
  return outputs.length > 0 ? '\n' + outputs.join('\n') : '\n[No output]';
};

const generateMarkdownOutput = (code: string): string => {
  const outputs: string[] = [];
  
  outputs.push('');
  outputs.push('#'.repeat(60));
  outputs.push('# RENDERED MARKDOWN PREVIEW');
  outputs.push('#'.repeat(60));
  outputs.push('');
  
  // Simple markdown rendering simulation
  const lines = code.split('\n');
  let inCodeBlock = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        outputs.push('<div class="code-block">');
      } else {
        outputs.push('</div>');
      }
      continue;
    }
    
    if (inCodeBlock) {
      outputs.push('  ' + line);
      continue;
    }
    
    // Headers
    if (line.startsWith('# ')) {
      outputs.push(`<h1>${line.substring(2)}</h1>`);
    } else if (line.startsWith('## ')) {
      outputs.push(`<h2>${line.substring(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      outputs.push(`<h3>${line.substring(4)}</h3>`);
    } else if (line.startsWith('> ')) {
      outputs.push(`<blockquote>${line.substring(2)}</blockquote>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      outputs.push(`<li>${line.substring(2)}</li>`);
    } else if (line.match(/^\d+\.\s/)) {
      outputs.push(`<li>${line.replace(/^\d+\.\s/, '')}</li>`);
    } else if (line.trim() === '---') {
      outputs.push('<hr/>');
    } else if (line.trim()) {
      outputs.push(`<p>${line}</p>`);
    }
  }
  
  outputs.push('');
  outputs.push('#'.repeat(60));
  outputs.push('*Full Markdown rendering would include syntax highlighting,');
  outputs.push('table formatting, image embedding, and MathJax support*');
  outputs.push('#'.repeat(60));
  
  return outputs.join('\n');
};

const generateSimulatedOutput = (lang: string, code: string, duration: number): string => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  const headers: Record<string, string> = {
    python: `[SciHub Pro] Python 3.11.5 | Started at: ${timestamp}`,
    sql: `[SciHub Pro] PostgreSQL 16.1 | Started at: ${timestamp}`,
    r: `[SciHub Pro] R 4.3.2 | Started at: ${timestamp}`,
    javascript: `[SciHub Pro] Node.js 20.10 | Started at: ${timestamp}`,
    markdown: `[SciHub Pro] Markdown Renderer | Started at: ${timestamp}`,
  };
  
  let body = '';
  
  switch (lang) {
    case 'python':
      body = generatePythonOutput(code);
      break;
    case 'sql':
      body = generateSQLOutput(code);
      break;
    case 'r':
      body = generateROutput(code);
      break;
    case 'javascript':
      body = generateJSOutput(code);
      break;
    case 'markdown':
      body = generateMarkdownOutput(code);
      break;
    default:
      body = `\n${'#'.repeat(50)}\n# Output for ${lang.toUpperCase()}\n${'#'.repeat(50)}\n\n[Execution completed successfully]\n`;
  }
  
  const memoryUsage = (Math.random() * 100 + 20).toFixed(1);
  const footer = `\n[SciHub Pro] Execution completed in ${(duration / 1000).toFixed(3)}s | Memory: ${memoryUsage} MB | Exit code: 0`;
  
  return `${headers[lang]}${body}${footer}`;
};

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

  // NEW: Terminal & Execution Simulation State
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [executionHistory, setExecutionHistory] = useState<ExecutionRecord[]>([]);
  const [showTerminal, setShowTerminal] = useState(true);
  const [executionStats, setExecutionStats] = useState<{ duration: number; memory: string; exitCode: number } | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Get active file
  const activeFile = workspaceFiles.find((f) => f.id === activeFileId);

  // Guidance for this context
  const relevantGuidance = getRelevantGuidance('workspace');

  // Auto-scroll terminal when new output appears
  useEffect(() => {
    if (terminalRef.current && showTerminal) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput, executionState, showTerminal]);

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
      type: 'save',
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

  // ENHANCED: Run Code with full execution simulation
  const handleRunCode = async () => {
    if (!activeFileId || !activeFile) return;
    
    const code = activeFile.content.value;
    const currentLanguage = activeFile.language;
    
    // 1. Set state to compiling
    setExecutionState('compiling');
    setSelectedHistoryId(null);
    const startTime = new Date();
    setTerminalOutput(`[${startTime.toLocaleTimeString()}] Compiling ${currentLanguage.toUpperCase()} code...\n`);
    setShowTerminal(true);
    
    // Show loading toast
    showLoadingToast('Executing Code...', `Running ${currentLanguage.toUpperCase()} code`);
    
    await sleep(500);
    
    // 2. Set state to running with animation
    setExecutionState('running');
    setTerminalOutput(prev => prev + `[${new Date().toLocaleTimeString()}] Executing...\n`);
    
    // Add running animation dots
    let dotCount = 0;
    const dotInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setTerminalOutput(prev => {
        // Remove previous animation line and add new one
        const lines = prev.split('\n');
        const filteredLines = lines.filter(l => !l.startsWith('[Running]'));
        return [...filteredLines, `[Running]${'.'.repeat(dotCount)}`].join('\n');
      });
    }, 300);
    
    // 3. Simulate execution time based on language
    const execTimes: Record<string, number> = {
      python: 1200 + Math.random() * 800,
      sql: 400 + Math.random() * 400,
      r: 1500 + Math.random() * 1000,
      javascript: 600 + Math.random() * 600,
      markdown: 200 + Math.random() * 200,
    };
    const execTime = execTimes[currentLanguage] || 1000;
    
    await sleep(execTime);
    
    // Stop animation
    clearInterval(dotInterval);
    
    // 4. Generate simulated output
    const output = generateSimulatedOutput(currentLanguage, code, execTime);
    const memoryUsage = (Math.random() * 100 + 20).toFixed(1);
    
    // 5. Show final output (remove animation line)
    setTerminalOutput(prev => {
      const lines = prev.split('\n').filter(l => !l.startsWith('[Running]'));
      return lines.join('\n') + '\n' + output;
    });
    
    setExecutionState('complete');
    setExecutionStats({
      duration: execTime,
      memory: `${memoryUsage} MB`,
      exitCode: 0,
    });
    
    // Also update legacy state for backward compatibility
    setExecutionResult(output);
    
    // 6. Add to history
    const record: ExecutionRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      language: currentLanguage,
      code: code.substring(0, 200),
      output: output,
      duration: execTime,
      success: true,
      memory: `${memoryUsage} MB`,
    };
    setExecutionHistory(prev => [record, ...prev].slice(0, 5));
    
    // 7. Log activity and show success toast
    addActivity({
      type: 'compute',
      message: createDynamicField(`Executed ${activeFile.name.value}: Success (${(execTime/1000).toFixed(2)}s)`),
      icon: '✅',
    });
    
    showSuccessToast('Execution Completed!', `Finished in ${(execTime/1000).toFixed(3)}s`);
    
    // 8. Reset to idle after 3 seconds
    setTimeout(() => {
      setExecutionState('idle');
    }, 3000);
  };

  // Legacy handler wrapper for backward compatibility
  const handleExecute = async () => {
    await handleRunCode();
  };

  const handleUseTemplate = (template: CodeTemplate) => {
    addWorkspaceFile({
      name: createDynamicField(`${template.name.toLowerCase().replace(/\s+/g, '_')}.${template.language === 'r' ? 'r' : template.language}`),
      content: createDynamicField(template.code),
      language: template.language,
      isModified: createDynamicField(true),
    });

    addActivity({
      type: 'save',
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
      type: 'error_recovery',
      message: createDynamicField(`Deleted file: ${file.name.value}`),
      icon: '🗑️',
    });
  };

  // View historical execution
  const handleViewHistory = (record: ExecutionRecord) => {
    setSelectedHistoryId(record.id);
    setTerminalOutput(record.output);
    setExecutionStats({
      duration: record.duration,
      memory: record.memory,
      exitCode: 0,
    });
    setShowTerminal(true);
  };

  // Clear terminal
  const handleClearTerminal = () => {
    setTerminalOutput('');
    setExecutionStats(null);
    setSelectedHistoryId(null);
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

  // Get run button configuration based on state
  const getRunButtonConfig = () => {
    switch (executionState) {
      case 'compiling':
        return {
          text: '⏳ Compiling...',
          className: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white',
          disabled: true,
        };
      case 'running':
        return {
          text: '● Executing...',
          className: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white animate-pulse',
          disabled: true,
        };
      case 'complete':
        return {
          text: '✓ Complete',
          className: 'bg-gradient-to-r from-green-600 to-teal-600 text-white',
          disabled: false,
        };
      case 'error':
        return {
          text: '✗ Error - Retry?',
          className: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white',
          disabled: false,
        };
      default:
        return {
          text: '▶ Run Code',
          className: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
          disabled: false,
        };
    }
  };

  const runButtonConfig = getRunButtonConfig();

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
            {/* Execution Status */}
            {executionState !== 'idle' && (
              <Badge 
                variant="secondary" 
                className={
                  executionState === 'running' ? 'animate-pulse bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  executionState === 'compiling' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  executionState === 'complete' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }
              >
                {executionState === 'compiling' && '⏳ Compiling'}
                {executionState === 'running' && '● Running'}
                {executionState === 'complete' && '✓ Complete'}
                {executionState === 'error' && '✗ Error'}
              </Badge>
            )}

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
        {/* Sidebar - File List & History */}
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

          {/* Execution History Panel */}
          {executionHistory.length > 0 && (
            <div className="border-t p-3 bg-background">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  📜 Execution History
                </h4>
                <Badge variant="outline" className="text-xs">
                  {executionHistory.length}
                </Badge>
              </div>
              <div className="space-y-1 max-h-40 overflow-auto">
                {executionHistory.map((record) => (
                  <button
                    key={record.id}
                    className={`w-full text-left p-2 rounded-md transition-colors text-xs ${
                      selectedHistoryId === record.id 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleViewHistory(record)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>{getLanguageIcon(record.language as WorkspaceFile['language'])}</span>
                        <span className="font-medium">{record.language.toUpperCase()}</span>
                      </span>
                      <span className={`px-1 rounded ${record.success ? 'text-green-600' : 'text-red-600'}`}>
                        {record.success ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-muted-foreground">
                      <span>{(record.duration / 1000).toFixed(2)}s</span>
                      <span>{record.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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
                  {/* Enhanced Run Button with States */}
                  <Button
                    size="sm"
                    onClick={handleExecute}
                    disabled={runButtonConfig.disabled || (!runButtonConfig.disabled && activeFile.language === 'markdown' && executionState === 'idle')}
                    className={runButtonConfig.className}
                  >
                    {runButtonConfig.text}
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
                  
                  {/* Toggle Terminal Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTerminal(!showTerminal)}
                    className="gap-1"
                  >
                    {showTerminal ? '▼' : '▲'} Terminal
                  </Button>
                </div>
              </div>

              {/* Editor + Output Split View */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Code Editor */}
                <div className={`${showTerminal ? 'flex-1' : 'flex-1'} flex flex-col min-h-0`}>
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

                {/* Terminal Output Panel - MAIN FEATURE */}
                {showTerminal && (
                  <div className="border-t bg-gray-900 text-gray-100 font-mono text-sm" style={{ height: showTerminal ? '320px' : 'auto', minHeight: '120px', maxHeight: '50vh' }}>
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="ml-2 text-xs text-gray-400">
                          Terminal — {activeFile.language.toUpperCase()}
                          {selectedHistoryId && ' (History)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Execution Stats */}
                        {executionStats && (
                          <span className="text-xs text-gray-400 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <span className="text-gray-500">⏱</span>
                              {(executionStats.duration / 1000).toFixed(2)}s
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-gray-500">💾</span>
                              {executionStats.memory}
                            </span>
                            <span className={`flex items-center gap-1 ${executionStats.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>
                              <span>{executionStats.exitCode === 0 ? '✓' : '✗'}</span>
                              Exit: {executionStats.exitCode}
                            </span>
                          </span>
                        )}
                        
                        {/* Terminal Controls */}
                        <button 
                          onClick={handleClearTerminal} 
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={() => setShowTerminal(false)} 
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Minimize
                        </button>
                      </div>
                    </div>
                    
                    {/* Terminal Body */}
                    <div 
                      ref={terminalRef}
                      className="p-4 overflow-y-auto"
                      style={{ height: 'calc(100% - 40px)' }}
                    >
                      {terminalOutput ? (
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono">
                          {/* Syntax highlighting for terminal output */}
                          {terminalOutput.split('\n').map((line, idx) => {
                            // Color different parts of the output
                            if (line.startsWith('[SciHub Pro]')) {
                              return (
                                <span key={idx}>
                                  <span className="text-cyan-400">{line.split('|')[0]}</span>
                                  {line.includes('|') && <span className="text-gray-400"> | {line.split('|').slice(1).join('|')}</span>}
                                  {'\n'}
                                </span>
                              );
                            } else if (line.startsWith('[') && line.endsWith(']') && (line.includes('Compiling') || line.includes('Executing'))) {
                              return <span key={idx} className="text-yellow-400">{line}{'\n'}</span>;
                            } else if (line.startsWith('[Running]')) {
                              return <span key={idx} className="text-green-400 animate-pulse">{line}{'\n'}</span>;
                            } else if (line.startsWith('→ ')) {
                              return <span key={idx} className="text-blue-400">{line}{'\n'}</span>;
                            } else if (line.startsWith('│') || line.startsWith('┌') || line.startsWith('├') || line.startsWith('└') || line.startsWith('─')) {
                              return <span key={idx} className="text-gray-500">{line}{'\n'}</span>;
                            } else if (line.match(/^(Min\.|Max\.|Mean|Median|1st Qu\.|3rd Qu\.|Standard deviation|count|Df|Sum Sq|Mean Sq|F value|Pr\(>\F\))/)) {
                              return <span key={idx} className="text-purple-400">{line}{'\n'}</span>;
                            } else if (/^\s*(True|False)\s*$/.test(line.trim())) {
                              return <span key={idx} className="text-orange-400">{line}{'\n'}</span>;
                            } else if (line.includes('✅') || line.includes('🎉')) {
                              return <span key={idx} className="text-green-400">{line}{'\n'}</span>;
                            } else if (line.includes('❌') || line.includes('Error')) {
                              return <span key={idx} className="text-red-400">{line}{'\n'}</span>;
                            } else if (line.includes('Warning') || line.includes('warning')) {
                              return <span key={idx} className="text-yellow-400">{line}{'\n'}</span>;
                            } else if (line.trim() === '' || line.trim() === '...') {
                              return <span key={idx}>{line}{'\n'}</span>;
                            } else {
                              return <span key={idx}>{line}{'\n'}</span>;
                            }
                          })}
                        </pre>
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          <div className="text-4xl mb-3">▶</div>
                          <p>Click &quot;Run Code&quot; to execute your code</p>
                          <p className="text-xs mt-1">(Output will appear here)</p>
                          
                          {/* Keyboard shortcut hint */}
                          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md text-xs">
                            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl</kbd>
                            <span>+</span>
                            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Enter</kbd>
                          </div>
                        </div>
                      )}
                      
                      {/* Running Indicator */}
                      {executionState === 'running' && (
                        <div className="flex items-center gap-2 mt-3 text-green-400">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          <span className="text-xs">Executing code...</span>
                        </div>
                      )}
                      
                      {/* Compiling Indicator */}
                      {executionState === 'compiling' && (
                        <div className="flex items-center gap-2 mt-3 text-yellow-400">
                          <span className="animate-spin">⏳</span>
                          <span className="text-xs">Compiling...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Minimized Terminal Bar */}
                {!showTerminal && (
                  <button
                    onClick={() => setShowTerminal(true)}
                    className="w-full py-2 bg-gray-900 text-gray-100 rounded-t-lg text-sm font-mono flex items-center justify-between px-4 hover:bg-gray-800 transition-colors border-t border-gray-700"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        executionState === 'running' ? 'bg-green-400 animate-pulse' :
                        executionState === 'compiling' ? 'bg-yellow-400 animate-pulse' :
                        executionState === 'complete' ? 'bg-green-500' :
                        executionState === 'error' ? 'bg-red-500' :
                        terminalOutput ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      Terminal
                      {executionStats && (
                        <span className="text-xs text-gray-400">
                          {(executionStats.duration / 1000).toFixed(2)}s • {executionStats.memory}
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      ↑ Expand
                      {terminalOutput && <span className="text-green-400">●</span>}
                    </span>
                  </button>
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
                    <li>• View execution history in sidebar</li>
                    <li>• Terminal shows simulated output per language</li>
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
