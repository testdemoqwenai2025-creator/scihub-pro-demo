'use client';

/**
 * SciHub Pro - AlphaFold Protein Structure Prediction Page
 * 
 * Full-featured page for Google DeepMind's AlphaFold DB integration
 * FREE TIER: No API key required, fully functional
 * 
 * Features:
 * - UniProt ID lookup
 * - Gene name search
 * - 3D structure visualization
 * - Confidence score analysis
 * - PDB file downloads
 * - Batch queries
 * - ESM-Fold fast prediction (Meta AI)
 */

import { AlphaFoldConnector } from '@/components/AlphaFoldConnector';
import { Dna, Zap, Globe, ExternalLink, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AlphaFoldPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Dna className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">AlphaFold Connector</h1>
                  <p className="text-blue-100 text-lg">Protein Structure Prediction Platform</p>
                </div>
              </div>
              
              <p className="text-lg text-blue-50 leading-relaxed">
                Access Google DeepMind&apos;s revolutionary AI protein structure prediction database. 
                Explore 200M+ predicted structures with Nobel Prize-level accuracy — completely free, 
                no authentication required.
              </p>

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-4 py-2 text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  100% FREE
                </Badge>
                <Badge className="bg-white/10 text-blue-100 border-white/20 px-4 py-2 text-sm">
                  200M+ Structures
                </Badge>
                <Badge className="bg-white/10 text-blue-100 border-white/20 px-4 py-2 text-sm">
                  No API Key
                </Badge>
                <Badge className="bg-white/10 text-blue-100 border-white/20 px-4 py-2 text-sm">
                  Research Grade
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href="https://alphafold.ebi.ac.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 transition-all"
              >
                <Globe className="h-5 w-5" />
                AlphaFold Database
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://www.nature.com/articles/s41586-021-03819-2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 transition-all"
              >
                <BookOpen className="h-5 w-5" />
                Nature Paper (2021)
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">200M+</p>
              <p className="text-sm text-muted-foreground">Predicted Structures</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">48M+</p>
              <p className="text-sm text-muted-foreground">Organisms Covered</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">~90%</p>
              <p className="text-sm text-muted-foreground">High Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">$0</p>
              <p className="text-sm text-muted-foreground">Cost Per Query</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-xl">&#127919;</span>
                Nobel Prize Technology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AlphaFold&apos;s protein folding predictions earned the <strong>2024 Nobel Prize in Chemistry</strong>. 
                This connector gives you direct access to that breakthrough technology.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Instant Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No registration, no API keys, no waiting. Start querying protein structures immediately. 
                Perfect for research, education, and drug discovery workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Dna className="h-5 w-5 text-purple-600" />
                Multiple Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Search by UniProt ID, visualize 3D structures, download PDB files, run batch queries, 
                and access Meta&apos;s ESM-Fold for lightning-fast predictions.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Main AlphaFold Component */}
        <AlphaFoldConnector />

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-muted/30 rounded-xl border">
          <h3 className="font-semibold mb-3">About This Integration</h3>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Data Source</p>
              <p>AlphaFold Protein Structure Database hosted at EMBL-EBI (European Bioinformatics Institute)</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">API Status</p>
              <p>Free, public API with no authentication required. Rate limits: polite use recommended.</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Citation Required</p>
              <p>When using predictions in publications, cite: Jumper et al. (2021) Nature 596:583-589</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Disclaimer</p>
              <p>Predictions are computational models. Experimental validation recommended for critical applications.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
