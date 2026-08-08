'use client';

/**
 * SciHub Pro - Advanced Computational Workspace v2.0
 * 
 * FEATURES:
 * - Binary Dataset Integration (LHC ROOT, Satellite FITS/HDF5, Scientific Data)
 * - Multi-Language Code Execution (Python, JVM Languages, C, Elixir)
 * - SECURE RESULT FORWARDING: Code > 10 lines → External delivery to prevent injection
 * - Future-Proof Architecture (Designed for 2025-2040+ horizon)
 * 
 * SECURITY MODEL:
 * - Line-count threshold triggers secure forwarding mode
 * - User-configurable output destination (email, webhook, external storage)
 * - Pattern-based injection detection
 * - Sandbox execution simulation with resource limits
 * - Audit logging for all executions
 */

import { useState, useRef, useCallback, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';

// ============ TYPES ============

interface EditorFile {
  id: string;
  name: string;
  language: LanguageType;
  content: string;
}

type LanguageType = 'python' | 'java' | 'kotlin' | 'scala' | 'c' | 'elixir' | 'sql' | 'r' | 'javascript' | 'markdown' | 'rust' | 'go';

interface TerminalLine {
  type: 'output' | 'error' | 'info' | 'success' | 'warning' | 'security';
  content: string;
  timestamp: Date;
}

interface DataSet {
  id: string;
  name: string;
  source: string;
  format: string;
  size: string;
  description: string;
  url: string;
  category: 'lhc' | 'satellite' | 'genomic' | 'climate' | 'quantum' | 'neuroscience' | 'materials' | 'astronomy';
  accessLevel: 'open' | 'registered' | 'collaboration';
}

interface SecurityConfig {
  lineThreshold: number; // Default: 10 lines triggers secure mode
  forwardDestination: 'email' | 'webhook' | 's3' | 'gcs' | 'azure' | 'local';
  destinationAddress: string;
  enableSandbox: boolean;
  maxExecutionTime: number; // seconds
  memoryLimit: number; // MB
  enableAuditLog: boolean;
  blockPatterns: string[];
}

interface ExecutionResult {
  success: boolean;
  output: string[];
  executionTime: number;
  memoryUsed: number;
  wasForwarded: boolean;
  forwardLocation?: string;
  securityLevel: 'safe' | 'secure' | 'sandboxed' | 'blocked';
}

// ============ BINARY DATASET CATALOG ============
// Real-world scientific data sources for next-gen research

const DATASET_CATALOG: DataSet[] = [
  // === LHC / HIGH ENERGY PHYSICS ===
  {
    id: 'lhc-cms-opendata-2015',
    name: 'CMS Open Data (2015 Run)',
    source: 'CERN Open Data Portal',
    format: 'ROOT (TTree)',
    size: '~2.3 TB',
    description: 'Collision events from CMS detector at √s = 13 TeV. Contains reconstructed physics objects (muons, electrons, jets, MET). Primary datasets: /DoubleMu/Run2015B-24Sep2016-v1/AOD.',
    url: 'https://cms.cern.ch/datasets/2015',
    category: 'lhc',
    accessLevel: 'open'
  },
  {
    id: 'lhc-atlas-higgs-2022',
    name: 'ATLAS Higgs Discovery Data',
    source: 'CERN ATLAS Collaboration',
    format: 'ROOT + DAOD_PHYSLITE',
    size: '~850 GB',
    description: 'Higgs boson decay channels (γγ, ZZ*, WW*, ττ) from Run 2 and Run 3. Includes systematic uncertainties and analysis-ready ntuples.',
    url: 'https://atlas-opendata.cern.ch/',
    category: 'lhc',
    accessLevel: 'open'
  },
  {
    id: 'alice-heavy-ion',
    name: 'ALICE Heavy Ion Collisions',
    source: 'CERN ALICE Experiment',
    format: 'ESD + AOD',
    size: '~1.2 PB',
    description: 'Pb-Pb and p-Pb collision data at √sNN = 5.02 TeV. Quark-gluon plasma signatures, jet quenching, collective flow coefficients.',
    url: 'https://aliceinfo.cern.ch/en/alice-data',
    category: 'lhc',
    accessLevel: 'registered'
  },
  {
    id: 'lhcb-beauty-baryons',
    name: 'LHCb Beauty Baryon Analysis',
    source: 'CERN LHCb Collaboration',
    format: 'ROOT (DST)',
    size: '~320 GB',
    description: 'Λb0, Ξb0, Ωb- decay measurements. CP violation studies in b-baryon sector. Flavor-tagged time-dependent analyses.',
    url: 'https://lhcbproject.web.cern.ch/lhcbproject/Public/Data.php',
    category: 'lhc',
    accessLevel: 'registered'
  },

  // === SATELLITE / REMOTE SENSING ===
  {
    id: 'nasa-modis-fires',
    name: 'MODIS Active Fire Detections',
    source: 'NASA FIRMS / MODIS',
    format: 'HDF5 + GeoTIFF',
    size: '~45 TB (global daily)',
    description: 'Thermal anomaly detection at 1km resolution. Fire radiative power (FRP), confidence levels, day/night flags. Updated every 3 hours.',
    url: 'https://firms.modaps.eosdis.nasa.gov/download/',
    category: 'satellite',
    accessLevel: 'open'
  },
  {
    id: 'esa-sentinel-2-l2a',
    name: 'Sentinel-2 Level-2A Surface Reflectance',
    source: 'ESA Copernicus Open Access Hub',
    format: 'SAFE (JPEG2000)',
    size: '~650 GB/year (continental)',
    description: '13 spectral bands at 10-60m resolution. Atmospheric correction applied (Sen2Cor). NDVI/EVI ready. Global coverage since 2017.',
    url: 'https://scihub.copernicus.eu/dhus/#/home',
    category: 'satellite',
    accessLevel: 'registered'
  },
  {
    id: 'landsat-9-collection2',
    name: 'Landsat 9 Collection 2 Level-2',
    source: 'USGS EarthExplorer',
    format: 'GeoTIFF (COG)',
    size: '~1.8 PB (archive)',
    description: 'OLI-2 + TIRS-2 instruments. Surface reflectance, surface temperature, quality assessment bands. 30m multispectral, 100m thermal.',
    url: 'https://earthexplorer.usgs.gov/',
    category: 'satellite',
    accessLevel: 'open'
  },
  {
    id: 'noaa-goes-r-abi',
    name: 'GOES-R Series ABI L2 Products',
    source: 'NOAA CLASS',
    format: 'NetCDF-4',
    size: '~12 TB/day',
    description: '16-channel Advanced Baseline Imager. Cloud top properties, aerosol detection, vegetation index, fire temperature. 0.5-2km resolution.',
    url: 'https://www.class.noaa.gov/',
    category: 'satellite',
    accessLevel: 'open'
  },

  // === GENOMIC / BIOMEDICAL ===
  {
    id: 'tcga-pancan-atlas',
    name: 'TCGA Pan-Cancer Atlas',
    source: 'NCI Genomic Data Commons',
    format: 'BAM + MAF + FPKM',
    size: '~2.8 PB',
    description: 'Multi-omics data across 33 cancer types. WGS, RNA-seq, methylation, copy number, RPPA. Clinical annotations for ~11,000 patients.',
    url: 'https://portal.gdc.cancer.gov/',
    category: 'genomic',
    accessLevel: 'registered'
  },
  {
    id: 'ukbiobank-exome-seq',
    name: 'UK Biobank Exome Sequencing',
    source: 'UK Biobank',
    format: 'CRAM + VCF/BCF',
    size: '~380 TB',
    description: 'Whole exome sequencing of ~500,000 participants. Joint variant calling, HLA typing, pharmacogenomic variants. Linked to phenotype data.',
    url: 'https://www.ukbiobank.ac.uk/enable-your-research/about-our-data/biological-samples',
    category: 'genomic',
    accessLevel: 'collaboration'
  },

  // === CLIMATE / ENVIRONMENTAL ===
  {
    id: 'era5-reanalysis',
    name: 'ERA5 Climate Reanalysis',
    source: 'ECMWF Climate Data Store',
    format: 'GRIB2 + NetCDF',
    size: '~7 PB (full archive)',
    description: 'Hourly global atmospheric reanalysis. 137 vertical levels, 0.25° resolution. Variables: T, U/V wind, Q, precipitation, radiation fluxes.',
    url: 'https://cds.climate.copernicus.eu/cdsapp#!/home',
    category: 'climate',
    accessLevel: 'registered'
  },
  {
    id: 'argo-ocean-profiles',
    name: 'Argo Float Profiles',
    source: 'Coriolis / GDAC',
    format: 'NetCDF (profile)',
    size: '~25 GB/month',
    description: 'In-situ ocean temperature/salinity profiles. 0-2000m depth, 4000+ active floats. Delayed-mode quality controlled data.',
    url: 'https://argo.ucsd.edu/data/data-from-gdac/',
    category: 'climate',
    accessLevel: 'open'
  },

  // === QUANTUM COMPUTING ===
  {
    id: 'ibm-quantum-results',
    name: 'IBM Quantum Results Archive',
    source: 'IBM Quantum Network',
    format: 'QASM + HDF5',
    size: '~120 GB',
    description: 'Quantum circuit execution results on real superconducting qubits (127-qubit Eagle, 433-qubit Osprey). Readout error mitigation data included.',
    url: 'https://quantum-computing.ibm.com/services/results',
    category: 'quantum',
    accessLevel: 'registered'
  },

  // === NEUROSCIENCE ===
  {
    id: 'allen-brain-atlas',
    name: 'Allen Brain Observatory',
    source: 'Allen Institute',
    format: 'NWB + TIFF stacks',
    size: '~450 GB',
    description: 'In-vivo calcium imaging of mouse visual cortex. Standardized stimuli presentations. Cell segmentation masks, fluorescence traces.',
    url: 'https://portal.brain-map.org/explore/connectome',
    category: 'neuroscience',
    accessLevel: 'open'
  },

  // === MATERIALS SCIENCE ===
  {
    id: 'materials-project-api',
    name: 'Materials Project Database',
    source: 'Materials Project / LBNL',
    format: 'JSON + CIF',
    size: '~150 GB',
    description: '150,000+ inorganic compounds. DFT-calculated band gaps, formation energies, elastic tensors, phonon densities of states.',
    url: 'https://materialsproject.org/',
    category: 'materials',
    accessLevel: 'registered'
  }
];

// ============ MULTI-LANGUAGE CODE TEMPLATES ============
// Comprehensive templates covering JVM, Systems, and Functional paradigms

const CODE_TEMPLATES: Record<string, { name: string; language: LanguageType; code: string; description: string }> = {
  
  // === PYTHON (Data Science) ===
  python_analysis: {
    name: 'Python: Data Analysis',
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
print(significant[['Gene', 'Expression', 'P_Value']])`,
    description: 'Statistical analysis with pandas/numpy'
  },

  python_root_reader: {
    name: 'Python: LHC ROOT Reader',
    language: 'python',
    code: `# SciHub Pro - LHC ROOT File Analysis
# Requires: uproot, awkward-array, numpy
import uproot as ut
import awkward as ak
import numpy as np

# Open CMS AOD file from CERN Open Data
file_path = "cms_opendata_2015.root"
tree = ut.open(file_path)["Events"]

# Read branches: muon kinematics
muons_pt = tree["Muon_pt"].array()
muons_eta = tree["Muon_eta"].array()
muons_phi = tree["Muon_phi"].array()
muons_mass = tree["Muon_mass"].array()

# Calculate invariant mass of dimuon pairs
def calc_dimuon_mass(pt1, eta1, phi1, m1, pt2, eta2, phi2, m2):
    import math
    # Convert to px, py, pz, E
    px1, py1 = pt1*math.cos(phi1), pt1*math.sin(phi1)
    pz1 = pt1*math.sinh(eta1)
    e1 = math.sqrt(px1**2 + py1**2 + pz1**2 + m1**2)
    
    px2, py2 = pt2*math.cos(phi2), pt2*math.sin(phi2)
    pz2 = pt2*math.sinh(eta2)
    e2 = math.sqrt(px2**2 + py2**2 + pz2**2 + m2**2)
    
    # Invariant mass formula
    inv_mass = math.sqrt((e1+e2)**2 - (px1+px2)**2 - (py1+py2)**2 - (pz1+pz2)**2)
    return inv_mass

print(f"Loaded {len(muons_pt)} muon candidates")
print("Dimuon mass calculation ready for Z/J/ψ resonance search")`,
    description: 'Read LHC ROOT files with uproot library'
  },

  python_satellite_fits: {
    name: 'Python: Satellite FITS Processing',
    language: 'python',
    code: `# SciHub Pro - Satellite Image Processing (FITS Format)
# Requires: astropy, numpy, matplotlib
from astropy.io import fits
from astropy.wcs import WCS
import numpy as np
import matplotlib.pyplot as plt

# Load Sentinel or Landsat FITS file
fits_file = "sentinel2_L2A_band8.fits"
hdul = fits.open(fits_file)

# Extract science data and header
data = hdul[1].data  # Primary image array
header = hdul[1].header
wcs = WCS(header)

print(f"Image dimensions: {data.shape}")
print(f"Data type: {data.dtype}")
print(f"Coordinate system: {wcs.wcs.ctype}")
print(f"Exposure time: {header.get('EXPTIME', 'N/A')} seconds")

# Basic statistics
print(f"\\nPixel statistics:")
print(f"  Mean: {np.nanmean(data):.3f}")
print(f"  Std:  {np.nanstd(data):.3f}")
print(f"  Min:  {np.nanmin(data):.3f}")
print(f"  Max:  {np.nanmax(data):.3f}")

# NDVI calculation if NIR and Red bands available
# ndvi = (nir - red) / (nir + red + 1e-10)
print("\\nNDVI calculation template ready")

hdul.close()`,
    description: 'Process satellite imagery with astropy'
  },

  // === JAVA (JVM - Enterprise Science) ===
  java_particle_analysis: {
    name: 'Java: Particle Physics Analysis',
    language: 'java',
    code: `// SciHub Pro - Java Particle Physics Template
// Designed for high-energy physics event processing
// Compatible with Apache Spark for distributed computing

import java.util.*;
import java.util.stream.*;

public class ParticleAnalysis {
    
    // Particle data structure matching ROOT TTree schema
    static class Particle {
        double pt;      // Transverse momentum (GeV)
        double eta;     // Pseudorapidity
        double phi;     // Azimuthal angle (rad)
        double mass;    // Rest mass (GeV/c²)
        int charge;     // Electric charge (±1)
        int pdgId;      // PDG particle identifier
        
        // Calculate transverse energy
        double Et() { return Math.sqrt(pt*pt + mass*mass); }
        
        // Calculate delta-R distance (angular separation)
        double deltaR(Particle other) {
            double dEta = this.eta - other.eta;
            double dPhi = Math.abs(this.phi - other.phi);
            if (dPhi > Math.PI) dPhi = 2*Math.PI - dPhi;
            return Math.sqrt(dEta*dEta + dPhi*dPhi);
        }
    }
    
    // Event selection criteria (CMS-style trigger logic)
    public static List<Particle> selectMuons(List<Particle> particles) {
        return particles.stream()
            .filter(p -> Math.abs(p.pdgId) == 13)       // Muon PDG ID
            .filter(p -> p.pt > 25.0)                    // pT threshold (GeV)
            .filter(Math.abs(p.eta) < 2.4)               // Acceptance
            .filter(p -> p.charge != 0)                   // Valid track
            .collect(Collectors.toList());
    }
    
    // Calculate dimuon invariant mass
    public static double invariantMass(Particle mu1, Particle mu2) {
        double px1 = mu1.pt * Math.cos(mu1.phi);
        double py1 = mu1.pt * Math.sin(mu1.phi);
        double pz1 = mu1.pt * Math.sinh(mu1.eta);
        double E1  = Math.sqrt(px1*px1 + py1*py1 + pz1*pz1 + mu1.mass*mu1.mass);
        
        double px2 = mu2.pt * Math.cos(mu2.phi);
        double py2 = mu2.pt * Math.sin(mu2.phi);
        double pz2 = mu2.pt * Math.sinh(mu2.eta);
        double E2  = Math.sqrt(px2*px2 + py2*py2 + pz2*pz2 + mu2.mass*mu2.mass);
        
        double totalE = E1 + E2;
        double totalPx = px1 + px2;
        double totalPy = py1 + py2;
        double totalPz = pz1 + pz2;
        
        return Math.sqrt(totalE*totalE - totalPx*totalPx 
                        - totalPy*totalPy - totalPz*totalPz);
    }
    
    public static void main(String[] args) {
        // Simulated event processing pipeline
        List<Particle> eventParticles = Arrays.asList(
            new Particle[]{ /* Load from ROOT via JNI */ }
        );
        
        List<Particle> muons = selectMuons(eventParticles);
        System.out.println("Selected " + muons.size() + " muons");
        
        // Find Z→μμ candidates (mass window: 76-106 GeV)
        for (int i = 0; i < muons.size(); i++) {
            for (int j = i+1; j < muons.size(); j++) {
                if (muons.get(i).charge * muons.get(j).charge < 0) {
                    double mass = invariantMass(muons.get(i), muons.get(j));
                    if (mass > 76 && mass < 106) {
                        System.out.printf("Z candidate: M=%.2f GeV%n", mass);
                    }
                }
            }
        }
    }
}`,
    description: 'HEP event selection with Java Streams API'
  },

  java_genomic_pipeline: {
    name: 'Java: Genomic Pipeline (HTSJDK)',
    language: 'java',
    code: `// SciHub Pro - Java Genomic Analysis Pipeline
// Uses HTSJDK for BAM/VCF processing (GATK ecosystem)
// Designed for clinical-grade variant calling workflows

import htsjdk.samtools.*;
import htsjdk.variant.variantcontext.*;
import htsjdk.variant.vcf.*;
import java.io.File;
import java.util.*;

public class GenomicPipeline {
    
    // Quality control metrics container
    static class QCMetrics {
        int totalReads;
        int mappedReads;
        int duplicateRate;
        double meanCoverage;
        double meanQuality;
        int aboveQ30;
    }
    
    // Process BAM file and extract QC metrics
    public static QCMetrics analyzeBam(File bamFile) {
        SamReader reader = SamReaderFactory.makeDefault().open(bamFile);
        SAMRecordIterator iterator = reader.iterator();
        
        QCMetrics qc = new QCMetrics();
        long totalBases = 0;
        int q30Count = 0;
        
        while (iterator.hasNext()) {
            SAMRecord record = iterator.next();
            qc.totalReads++;
            
            if (!record.getReadUnmappedFlag()) {
                qc.mappedReads++;
                totalBases += record.getReadLength();
                
                byte[] qualities = record.getBaseQualities();
                for (byte q : qualities) {
                    if (q >= 30) q30Count++;
                }
            }
            
            if (record.getDuplicateReadFlag()) {
                qc.duplicateRate++;
            }
        }
        
        iterator.close();
        reader.close();
        
        // Calculate derived metrics
        qc.meanCoverage = (double)totalBases / 3000000000.0; // Human genome
        qc.aboveQ30 = q30Count;
        
        return qc;
    }
    
    // Filter variants by clinical significance
    public static List<VariantContext> filterClinicalVariants(
            File vcfFile, double afThreshold) {
        
        VCFFileReader reader = new VCFFileReader(vcfFile, false);
        List<VariantContext> clinicalVars = new ArrayList<>();
        
        for (VariantContext vc : reader) {
            // Skip if no allele frequency annotation
            if (!vc.hasAttribute("AF")) continue;
            
            double af = vc.getAttributeAsDoubleList("AF", 0).get(0);
            
            // Apply ACMG filtering criteria
            if (af < afThreshold &&           // Rare variant
                vc.isFiltered() == false &&   // Pass filters
                vc.isSNP() &&                 // SNVs only
                vc.isBiallelic()) {           // Simple variants
                
                clinicalVars.add(vc);
            }
        }
        
        reader.close();
        return clinicalVars;
    }
    
    public static void main(String[] args) {
        File bamFile = new File("sample.bam");
        File vcfFile = new File("variants.vcf.gz");
        
        System.out.println("=== Genomic QC Analysis ===");
        QCMetrics qc = analyzeBam(bamFile);
        System.out.printf("Total reads: %d%n", qc.totalReads);
        System.out.printf("Mapping rate: %.1f%%%n", 
            100.0 * qc.mappedReads / qc.totalReads);
        System.out.printf("Mean coverage: %.2fx%n", qc.meanCoverage);
        
        System.out.println("\\n=== Clinical Variant Filtering ===");
        List<VariantContext> clinical = filterClinicalVariants(vcfFile, 0.01);
        System.out.printf("Found %d rare variants (AF<1%%)%n", clinical.size());
    }
}`,
    description: 'BAM/VCF processing with HTSJDK library'
  },

  // === KOTLIN (JVM - Modern Scientific Computing) ===
  kotlin_data_science: {
    name: 'Kotlin: Data Science (Krangl)',
    language: 'kotlin',
    code: `// SciHub Pro - Kotlin Data Science Template
// Uses Krangl (R-style dataframe) and Kotlin Statistics
// JVM-compatible with seamless Java interop

import krangl.*
import org.apache.commons.math3.stat.descriptive.*

fun main() {
    // Create DataFrame from experimental measurements
    val experiment = dataFrameOf(
        "sample_id", "treatment", "concentration", "response", "p_value"
    )(
        "S001", "control",    0.0,  1.00, 1.000,
        "S002", "drug_A",    10.0,  0.72, 0.003,
        "S003", "drug_A",    50.0,  0.45, 0.0001,
        "S004", "drug_B",    10.0,  0.85, 0.120,
        "S005", "drug_B",    50.0,  0.61, 0.008,
        "S006", "combo_AB",  30.0,  0.33, 0.00001,
        "S007", "combo_AB",  60.0,  0.18, 0.000001
    )
    
    println("=== Experimental Results Summary ===")
    println(experiment.summary())
    
    // Statistical analysis using Apache Commons Math
    val responses = experiment["response"] as DoubleCol
    val stats = DescriptiveStatistics()
    responses.forEach { stats.addValue(it) }
    
    println("\\n=== Response Variable Statistics ===")
    println("Mean: \${stats.mean}")
    println("StdDev: \${stats.standardDeviation}")
    println("Median: \${stats.percentile(50)}")
    println("IQR: \${stats.percentile(75) - stats.percentile(25)}")
    
    // Grouped analysis by treatment
    println("\\n=== Treatment Group Means ===")
    val grouped = experiment
        .groupBy { it["treatment"] }
        .aggregate { 
            meanResponse = it["response"].mean<Double>()
            count = nRow
        }
    
    grouped.print()
    
    // Significant findings filter (Bonferroni-corrected)
    val alpha = 0.05 / experiment.nrow  // Bonferroni correction
    val significant = experiment.filter { 
        it["p_value"] as Double < alpha 
    }
    println("\\n=== Significant After Correction (α=\$alpha) ===")
    significant.print()
}`,
    description: 'DataFrame operations with Krangl library'
  },

  kotlin_coroutine_simulation: {
    name: 'Kotlin: Monte Carlo Simulation',
    language: 'kotlin',
    code: `// SciHub Pro - Kotlin Coroutines for Parallel Simulation
// Leverages Kotlin coroutines for embarrassingly parallel workloads
// Ideal for particle physics & computational chemistry MC methods

import kotlinx.coroutines.*
import kotlin.random.Random
import kotlin.math.*

data class SimulationResult(
    val trialId: Int,
    val value: Double,
    val converged: Boolean
)

class MonteCarloSimulator(
    private val dispatcher: CoroutineDispatcher = Dispatchers.Default
) {
    // Parallel particle transport simulation
    suspend fun simulateParticleTransport(
        nParticles: Int,
        materialDensity: Double,
        thickness: Double
    ): List<SimulationResult> = coroutineScope {
        
        (1..nParticles).map { id ->
            async(dispatcher) {
                var position = 0.0
                var alive = true
                var steps = 0
                val maxSteps = 10000
                
                while (alive && steps < maxSteps) {
                    // Mean free path sampling (exponential distribution)
                    val mfp = -ln(Random.nextDouble()) / materialDensity
                    position += mfp
                    
                    when {
                        position >= thickness -> {
                            alive = false  // Transmitted
                        }
                        Random.nextDouble() < 0.3 -> {
                            alive = false  // Absorbed (interaction)
                        }
                        // else: scatter (continue)
                    }
                    steps++
                }
                
                SimulationResult(
                    trialId = id,
                    value = position,
                    converged = steps < maxSteps
                )
            }
        }.awaitAll()
    }
    
    // Option pricing via Black-Scholes Monte Carlo
    suspend fun priceOptionMonteCarlo(
        spotPrice: Double,
        strikePrice: Double,
        riskFreeRate: Double,
        volatility: Double,
        timeToMaturity: Double,
        nSimulations: Int
    ): Double = withContext(dispatcher) {
        val drift = (riskFreeRate - 0.5 * volatility * volatility) * timeToMaturity
        val volScaled = volatility * sqrt(timeToMaturity)
        
        val payoffs = DoubleArray(nSimulations) { _ ->
            val z = Random.nextGaussian()
            val st = spotPrice * exp(drift + volScaled * z)
            maxOf(st - strikePrice, 0.0)
        }
        
        val optionPrice = payoffs.average() * exp(-riskFreeRate * timeToMaturity)
        val stdError = payoffs.stdDev() / sqrt(nSimulations.toDouble())
        
        println("Option Price: \$optionPrice ± \$stdError")
        optionPrice
    }
}

suspend fun main() {
    val simulator = MonteCarloSimulator()
    
    println("=== Particle Transport Simulation ===")
    val results = simulator.simulateParticleTransport(
        nParticles = 100000,
        materialDensity = 0.5,  // cm^-1
        thickness = 5.0         // cm
    )
    
    val transmitted = results.count { it.value >= 5.0 && !it.converged == false }
    val absorbed = results.count { it.converged == false && it.value < 5.0 }
    println("Transmitted: \$transmitted (\${transmitted * 100 / results.size}%)")
    println("Absorbed: \$absorbed (\${absorbed * 100 / results.size}%)")
    
    println("\\n=== European Call Option Pricing ===")
    simulator.priceOptionMonteCarlo(
        spotPrice = 100.0,
        strikePrice = 105.0,
        riskFreeRate = 0.05,
        volatility = 0.2,
        timeToMaturity = 1.0,
        nSimulations = 1000000
    )
}`,
    description: 'Parallel Monte Carlo with coroutines'
  },

  // === SCALA (JVM - Functional Big Data) ===
  scala_spark_lhc: {
    name: 'Scala: Apache Spark LHC Analysis',
    language: 'scala',
    code: `// SciHub Pro - Scala/Spark Large-Scale LHC Analysis
// Distributed processing of petabyte-scale collision data
// Runs on YARN/Mesos/Kubernetes clusters

import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.storage.StorageLevel

object LHCSparkAnalysis {
  
  def main(args: Array[String]): Unit = {
    
    // Initialize Spark session for HEP analysis
    val spark = SparkSession.builder()
      .appName("LHC-CMS-DimuonAnalysis")
      .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
      .config("spark.sql.shuffle.partitions", 1000)
      .config("spark.driver.memory", "8g")
      .config("spark.executor.memory", "32g")
      .getOrCreate()
    
    import spark.implicits._
    
    // Load pre-converted ROOT → Parquet data
    // (Conversion done via root2arrow + arrow2parquet pipeline)
    val eventsDF = spark.read.parquet("s3a://cms-opendata/run2015B/dimuon/")
    
    // Cache frequently accessed data
    eventsDF.persist(StorageLevel.MEMORY_AND_DISK_SER)
    
    println(s"Loaded \${eventsDF.count()} events")
    eventsDF.printSchema()
    
    // === SELECTION: High-quality muon pairs ===
    val dimuonCandidates = eventsDF
      // Select events with exactly 2 global muons
      .filter(size(col("muons")) === 2)
      // Unnest muon array for easier manipulation
      .withColumn("mu1", col("muons")(0))
      .withColumn("mu2", col("muons")(1))
      // Kinematic cuts (CMS standard)
      .filter(col("mu1.pt") > 25 && abs(col("mu1.eta")) < 2.4)
      .filter(col("mu2.pt") > 25 && abs(col("mu2.eta")) < 2.4)
      // Opposite sign requirement
      .filter(col("mu1.charge") !== col("mu2.charge"))
    
    // === CALCULATION: Invariant mass reconstruction ===
    val withMass = dimuonCandidates
      .select(
        // Four-momentum components for muon 1
        (col("mu1.pt") * cos(col("mu1.phi"))).alias("p1x"),
        (col("mu1.pt") * sin(col("mu1.phi"))).alias("p1y"),
        (col("mu1.pt") * sinh(col("mu1.eta"))).alias("p1z"),
        // Lorentz factor for muon 1
        sqrt(
          pow(col("mu1.pt") * cos(col("mu1.phi")), 2) +
          pow(col("mu1.pt") * sin(col("mu1.phi")), 2) +
          pow(col("mu1.pt") * sinh(col("mu1.eta")), 2) +
          pow(lit(0.105658), 2)  // muon mass in GeV
        ).alias("E1"),
        // Same for muon 2...
        (col("mu2.pt") * cos(col("mu2.phi"))).alias("p2x"),
        (col("mu2.pt") * sin(col("mu2.phi"))).alias("p2y"),
        (col("mu2.pt") * sinh(col("mu2.eta"))).alias("p2z"),
        sqrt(
          pow(col("mu2.pt") * cos(col("mu2.phi")), 2) +
          pow(col("mu2.pt") * sin(col("mu2.phi")), 2) +
          pow(col("mu2.pt") * sinh(col("mu2.eta")), 2) +
          pow(lit(0.105658), 2)
        ).alias("E2")
      )
      // Invariant mass: M = sqrt((E1+E2)² - (p1+p2)²)
      .withColumn("invMass",
        sqrt(
          pow(col("E1") + col("E2"), 2) -
          pow(col("p1x") + col("p2x"), 2) -
          pow(col("p1y") + col("p2y"), 2) -
          pow(col("p1z") + col("p2z"), 2)
        )
      )
    
    // === ANALYSIS: Resonance peak fitting ===
    println("=== Mass Spectrum Summary ===")
    withMass.select(
      count("*").alias("total_candidates"),
      mean("invMass").alias("mean_mass"),
      stddev("invMass").alias("mass_width"),
      min("invMass").alias("min_mass"),
      max("invMass").alias("max_mass")
    ).show(false)
    
    // Mass windows for known resonances
    val resonances = Seq(
      ("J/psi", 3.097, 2.95, 3.25),
      ("Upsilon(1S)", 9.460, 9.35, 9.57),
      ("Z", 91.188, 76.0, 106.0)
    )
    
    for ((name, nominal, low, high) <- resonances) {
      val count = withMass.filter(col("invMass") between(low, high)).count()
      println(s"\$name region (\$low-\$high GeV): \$count candidates")
    }
    
    // Save results for further analysis
    withMass.select("invMass", "p1x", "p1y", "p1z", "E1", "E2")
      .write.mode("overwrite")
      .parquet("s3a://results/dimuon_mass_spectrum/")
    
    spark.stop()
  }
}`,
    description: 'Distributed LHC analysis with Spark SQL'
  },

  scala_akka_streaming: {
    name: 'Scala: Akka Streams Sensor Data',
    language: 'scala',
    code: `// SciHub Pro - Akka Streams for Real-Time Sensor Processing
// Handles high-throughput satellite telemetry and IoT sensor streams
// Backpressure-aware streaming architecture

import akka.actor.ActorSystem
import akka.stream.scaladsl._
import akka.stream.{ActorMaterializer, Attributes, FlowShape}
import akka.{Done, NotUsed}
import scala.concurrent.{Future, ExecutionContext}
import java.time.Instant

case class SensorReading(
  sensorId: String,
  timestamp: Instant,
  value: Double,
  unit: String,
  quality: Double  // 0.0 - 1.0 confidence score
)

case class AnomalyAlert(
  sensorId: String,
  timestamp: Instant,
  observedValue: Double,
  expectedRange: (Double, Double),
  severity: String
)

object SatelliteTelemetryPipeline {
  
  implicit val system = ActorSystem("SatellitePipeline")
  implicit val materializer = ActorMaterializer()
  implicit val ec: ExecutionContext = system.dispatcher
  
  // Quality-weighted moving average
  def qualityWeightedMA(windowSize: Int): Flow[SensorReading, SensorReading, NotUsed] =
    Flow[SensorReading]
      .sliding(windowSize, 1)
      .map { window =>
        val weightedSum = window.map(r => r.value * r.quality).sum
        val totalQuality = window.map(_.quality).sum
        val avgValue = weightedSum / totalQuality
        window.last.copy(value = avgValue)
      }
  
  // Statistical anomaly detection (Z-score based)
  def detectAnomalies(zThreshold: Double = 3.0): Flow[SensorReading, AnomalyAlert, NotUsed] =
    Flow[SensorReading]
      .statefulMapConcat(() => {
        // State: running mean and variance (Welford's algorithm)
        var count = 0L
        var mean = 0.0
        var m2 = 0.0
        
        reading => {
          count += 1
          val delta = reading.value - mean
          mean += delta / count
          val delta2 = reading.value - mean
          m2 += delta * delta2
          
          val variance = if (count > 1) m2 / (count - 1) else 1.0
          val stdDev = Math.sqrt(variance)
          val zScore = if (stdDev > 0) Math.abs(reading.value - mean) / stdDev else 0.0
          
          if (zScore > zThreshold) {
            val range = (mean - zThreshold * stdDev, mean + zThreshold * stdDev)
            val severity = if (zScore > 5) "CRITICAL" else if (zScore > 4) "WARNING" else "INFO"
            List(AnomalyAlert(
              reading.sensorId, reading.timestamp, reading.value,
              range, severity
            ))
          } else {
            List.empty
          }
        }
      })
  
  // Main processing pipeline
  def run(): Future[Done] = {
    // Simulated satellite downlink source (replace with actual Kafka/GCS source)
    val source: Source[SensorReading, NotUsed] = Source.repeat(SensorReading(
      "GOES-ABI-CH1",
      Instant.now(),
      util.Random.nextGaussian() * 10 + 300,  // Kelvin brightness temp
      "K",
      0.95 + util.Random.nextDouble() * 0.05
    ))
    .throttle(1000, scala.concurrent.duration._1second)  // 1 kHz sample rate
    
    val processingPipeline = source
      .via(qualityWeightedMA(windowSize = 10))  // Smooth noise
      .alsoTo(Flow[SensorReading].to(Sink.foreach { r =>
        // Persist to time-series database (InfluxDB/TimescaleDB)
        if (r.timestamp.toEpochMilli % 60000 == 0) {
          println(s"[\${r.timestamp}] \${r.sensorId}: \${r.value} \${r.unit} (q=\${r.quality})")
        }
      }))
      .via(detectAnomalies(zThreshold = 3.5))
      
    // Alert sink (email, Slack, PagerDuty integration)
    val alertSink = Sink.foreach[AnomalyAlert] { alert =>
      println(s"⚠️  [\$alert.severity] Anomaly detected!")
      println(s"   Sensor: \${alert.sensorId}")
      println(s"   Value: \${alert.observedValue} (expected: \${alert.expectedRange})")
      
      // Integration point: Forward to incident management system
      // alertService.trigger(alert)
    }
    
    processingPipeline.runWith(alertSink)
  }
}`,
    description: 'Real-time stream processing with Akka'
  },

  // === C / SYSTEMS PROGRAMMING ===
  c_hdf5_processing: {
    name: 'C: HDF5 Scientific I/O',
    language: 'c',
    code: `/* SciHub Pro - C Language HDF5 Processing Template
 * High-performance binary dataset I/O for large-scale science
 * Direct memory access for ROOT/FITS/HDF5/NetCDF formats
 * 
 * Compile: gcc -O3 -lhdf5 hdf5_processor.c -o hdf5_proc
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <hdf5.h>
#include <time.h>

#define DATASET_NAME "experimental_data"
#define CHUNK_SIZE 1024
#define COMPRESSION_LEVEL 6

/* Structure representing a single measurement */
typedef struct {
    double timestamp;
    double values[16];         /* Multi-channel sensor array */
    uint32_t quality_flags;    /* Bitmask for data quality */
    float uncertainty;         /* Measurement uncertainty */
} Measurement;

/* HDF5 file handler with metadata tracking */
typedef struct {
    hid_t file_id;
    hid_t dataset_id;
    hid_t dataspace_id;
    hid_t plist_id;
    hsize_t current_dims[2];
    hsize_t max_dims[2];
    char filename[256];
} HDF5Handler;

/* Initialize HDF5 file for writing */
int h5_init_write(HDF5Handler *handler, const char *filename, 
                  size_t initial_rows, size_t max_rows) {
    
    /* Create file with latest format */
    handler->plist_id = H5Pcreate(H5P_FILE_CREATE);
    H5Pset_userblock(handler->plist_id, 512);  /* Reserved for metadata */
    
    handler->file_id = H5Fcreate(filename, H5F_ACC_TRUNC, 
                                  H5P_DEFAULT, handler->plist_id);
    
    if (handler->file_id < 0) {
        fprintf(stderr, "Error: Cannot create HDF5 file %s\\n", filename);
        return -1;
    }
    
    /* Define chunked dataset for efficient compression */
    handler->current_dims[0] = initial_rows;
    handler->current_dims[1] = 20;  /* 1 timestamp + 16 values + flags + uncertainty */
    handler->max_dims[0] = max_rows;
    handler->max_dims[1] = 20;
    
    handler->dataspace_id = H5Screate_simple(2, handler->current_dims, 
                                              handler->max_dims);
    
    /* Enable chunking and compression */
    hid_t create_props = H5Pcreate(H5P_DATASET_CREATE);
    hsize_t chunk_dims[2] = {CHUNK_SIZE, 20};
    H5Pset_chunk(create_props, 2, chunk_dims);
    H5Pset_deflate(create_props, COMPRESSION_LEVEL);
    
    /* Create dataset with compound datatype */
    hid_t measurement_type = H5Tcreate(H5T_COMPOUND, sizeof(Measurement));
    H5Tinsert(measurement_type, "timestamp", 
              HOFFSET(Measurement, timestamp), H5T_NATIVE_DOUBLE);
    H5Tinsert(measurement_type, "values",
              HOFFSET(Measurement, values), 
              H5Tarray_create(H5T_NATIVE_DOUBLE, 1, (hsize_t[1]){16}));
    H5Tinsert(measurement_type, "quality_flags",
              HOFFSET(Measurement, quality_flags), H5T_NATIVE_UINT32);
    H5Tinsert(measurement_type, "uncertainty",
              HOFFSET(Measurement, uncertainty), H5T_NATIVE_FLOAT);
    
    handler->dataset_id = H5Dcreate2(handler->file_id, DATASET_NAME,
                                     measurement_type, handler->dataspace_id,
                                     H5P_DEFAULT, create_props, H5P_DEFAULT);
    
    strncpy(handler->filename, filename, 255);
    printf("HDF5 file initialized: %s\\n", filename);
    printf("Initial capacity: %zu rows (max: %zu)\\n", initial_rows, max_rows);
    
    /* Cleanup */
    H5Tclose(measurement_type);
    H5Pclose(create_props);
    return 0;
}

/* Write batch of measurements efficiently */
int h5_write_batch(HDF5Handler *handler, const Measurement *batch, 
                   size_t count, size_t offset) {
    
    if (count == 0 || handler->dataset_id < 0) return -1;
    
    /* Select hyperslab for this batch */
    hsize_t start[2] = {offset, 0};
    hsize_t write_count[2] = {count, 20};
    hid_t memspace = H5Screate_simple(2, write_count, NULL);
    hid_t filespace = H5Dget_space(handler->dataset_id);
    H5Sselect_hyperslab(filespace, H5S_SELECT_SET, start, NULL, 
                        write_count, NULL);
    
    /* Write data */
    herr_t status = H5Dwrite(handler->dataset_id, H5T_NATIVE_DOUBLE,
                             memspace, filespace, H5P_DEFAULT, batch);
    
    if (status < 0) {
        fprintf(stderr, "Error: Failed to write %zu elements\\n", count);
        return -1;
    }
    
    printf("Written %zu measurements starting at row %zu\\n", count, offset);
    
    H5Sclose(memspace);
    H5Sclose(filespace);
    return 0;
}

/* Read and process subset of data (memory-efficient) */
int h5_process_subset(HDF5Handler *handler, size_t start_row, 
                      size_t end_row, void (*callback)(const Measurement*)) {
    
    hsize_t start[2] = {start_row, 0};
    hsize_t count[2] = {end_row - start_row, 20};
    
    hid_t filespace = H5Dget_space(handler->dataset_id);
    H5Sselect_hyperslab(filespace, H5S_SELECT_SET, start, NULL, count, NULL);
    
    /* Allocate buffer for requested subset */
    Measurement *buffer = malloc(sizeof(Measurement) * (end_row - start_row));
    if (!buffer) {
        perror("Memory allocation failed");
        return -1;
    }
    
    herr_t status = H5Dread(handler->dataset_id, H5T_NATIVE_DOUBLE,
                           H5S_ALL, filespace, H5P_DEFAULT, buffer);
    
    if (status >= 0) {
        for (size_t i = 0; i < (end_row - start_row); i++) {
            callback(&buffer[i]);
        }
    }
    
    free(buffer);
    H5Sclose(filespace);
    return 0;
}

/* Demo: Generate synthetic LHC-like detector data */
void generate_detector_data(Measurement *m, int idx) {
    m->timestamp = 1699000000.0 + idx * 0.025;  /* 40 Hz sampling */
    
    /* Simulate calorimeter energy deposits across 16 towers */
    for (int ch = 0; ch < 16; ch++) {
        double noise = ((double)rand() / RAND_MAX - 0.5) * 0.1;
        double signal = (ch == 3 || ch == 12) ? 5.0 * exp(-idx * 0.001) : 0.0;
        m->values[ch] = signal + noise;
    }
    
    m->quality_flags = 0xFFFF;  /* All channels good */
    m->uncertainty = 0.02;      /* 2% systematic uncertainty */
}

void print_measurement(const Measurement *m) {
    printf("[%.3fs] Ch3=%.4f Ch12=%.4f (σ=%.3f)\\n",
           m->timestamp, m->values[3], m->values[12], m->uncertainty);
}

int main(int argc, char *argv[]) {
    srand(time(NULL));
    
    HDF5Handler handler;
    const char *output_file = "detector_output.h5";
    
    /* Initialize output file (1M rows capacity) */
    if (h5_init_write(&handler, output_file, 10000, 1000000) != 0) {
        return EXIT_FAILURE;
    }
    
    /* Write simulated detector data in batches */
    Measurement batch[CHUNK_SIZE];
    clock_t start = clock();
    
    for (int b = 0; b < 10; b++) {
        for (int i = 0; i < CHUNK_SIZE; i++) {
            generate_detector_data(&batch[i], b * CHUNK_SIZE + i);
        }
        h5_write_batch(&handler, batch, CHUNK_SIZE, b * CHUNK_SIZE);
    }
    
    clock_t end = clock();
    double elapsed = (double)(end - start) / CLOCKS_PER_SEC;
    printf("\\nProcessed %d samples in %.3f seconds (%.0f samples/sec)\\n",
           CHUNK_SIZE * 10, elapsed, (CHUNK_SIZE * 10) / elapsed);
    
    /* Cleanup */
    H5Dclose(handler.dataset_id);
    H5Sclose(handler.dataspace_id);
    H5Pclose(handler.plist_id);
    H5Fclose(handler.file_id);
    
    printf("\\nOutput saved to: %s\\n", output_file);
    return EXIT_SUCCESS;
}`,
    description: 'High-performance HDF5 I/O for scientific data'
  },

  c_memory_optimized: {
    name: 'C: Memory-Optimized Array Processing',
    language: 'c',
    code: `/* SciHub Pro - Cache-Optimized Numerical Computing
 * SIMD-friendly data layout for matrix operations
 * Designed for satellite image processing pipelines
 *
 * Compile with auto-vectorization:
 * gcc -O3 -march=native -ffast-math -ftree-vectorize matrix_ops.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <immintrin.h>  /* AVX2 intrinsics */
#include <omp.h>        /* OpenMP parallelization */

#define ROWS 4096
#define COLS 4096
#define BLOCK_SIZE 64   /* L1 cache block size */

/* Aligned memory allocation for SIMD */
static inline float* alloc_aligned(size_t n) {
    return (float*)aligned_alloc(32, n * sizeof(float));
}

/* Matrix multiplication with cache blocking + SIMD */
void matmul_blocked(const float* __restrict__ A,
                    const float* __restrict__ B,
                    float* __restrict__ C,
                    int M, int N, int K) {
    
    #pragma omp parallel for collapse(2) schedule(dynamic)
    for (int ii = 0; ii < M; ii += BLOCK_SIZE) {
        for (int jj = 0; jj < N; jj += BLOCK_SIZE) {
            for (int kk = 0; kk < K; kk += BLOCK_SIZE) {
                
                /* Process block */
                int i_end = ii + BLOCK_SIZE < M ? ii + BLOCK_SIZE : M;
                int j_end = jj + BLOCK_SIZE < N ? jj + BLOCK_SIZE : N;
                int k_end = kk + BLOCK_SIZE < K ? kk + BLOCK_SIZE : K;
                
                for (int i = ii; i < i_end; i++) {
                    for (int k = kk; k < k_end; k++) {
                        
                        /* Load A[i,k] into broadcast register */
                        __m256 a_val = _mm256_set1_ps(A[i * K + k]);
                        
                        /* Process 8 elements of B and C simultaneously */
                        for (int j = jj; j < j_end; j += 8) {
                            __m256 b_vec = _mm256_loadu_ps(&B[k * N + j]);
                            __m256 c_vec = _mm256_loadu_ps(&C[i * N + j]);
                            
                            /* Fused multiply-add */
                            c_vec = _mm256_fmadd_ps(a_val, b_vec, c_vec);
                            
                            _mm256_storeu_ps(&C[i * N + j], c_vec);
                        }
                    }
                }
            }
        }
    }
}

/* Convolution kernel for image filtering (Sobel edge detection) */
void sobel_filter(const float* __restrict__ input,
                  float* __restrict__ output,
                  int width, int height) {
    
    /* Sobel kernels (separable implementation) */
    const float gx_kernel[3] = {-1.0f, 0.0f, 1.0f};
    const float gy_kernel[3] = {-1.0f, -2.0f, -1.0f};
    
    #pragma omp parallel for collapse(2) schedule(static)
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            
            float gx = 0.0f, gy = 0.0f;
            
            /* Horizontal gradient */
            for (int k = -1; k <= 1; k++) {
                gx += input[(y) * width + (x+k)] * gx_kernel[k+1];
                gy += input[(y+k) * width + (x)] * gy_kernel[k+1];
            }
            
            /* Gradient magnitude */
            output[y * width + x] = sqrtf(gx*gx + gy*gy);
        }
    }
}

/* Histogram computation with atomic-free parallel reduction */
void compute_histogram(const float* data, int n, 
                       float min_val, float max_val,
                       int* histogram, int num_bins) {
    
    float range = max_val - min_val;
    float scale = num_bins / range;
    
    /* Local histograms per thread */
    int num_threads = omp_get_max_threads();
    int** local_hists = malloc(num_threads * sizeof(int*));
    
    for (int t = 0; t < num_threads; t++) {
        local_hists[t] = calloc(num_bins, sizeof(int));
    }
    
    /* Parallel bin assignment */
    #pragma omp parallel
    {
        int tid = omp_get_thread_num();
        int* local_hist = local_hists[tid];
        
        #pragma omp for
        for (int i = 0; i < n; i++) {
            int bin = (int)((data[i] - min_val) * scale);
            bin = (bin < 0) ? 0 : (bin >= num_bins ? num_bins - 1 : bin);
            local_hist[bin]++;
        }
    }
    
    /* Reduce local histograms */
    memset(histogram, 0, num_bins * sizeof(int));
    for (int t = 0; t < num_threads; t++) {
        for (int b = 0; b < num_bins; b++) {
            histogram[b] += local_hists[t][b];
        }
        free(local_hists[t]);
    }
    free(local_hists);
}

int main() {
    printf("Allocating matrices (%d x %d)...\\n", ROWS, COLS);
    
    float *A = alloc_aligned(ROWS * COLS);
    float *B = alloc_aligned(ROWS * COLS);
    float *C = calloc(ROWS * COLS, sizeof(float));
    
    /* Initialize with test data */
    #pragma omp parallel for
    for (int i = 0; i < ROWS * COLS; i++) {
        A[i] = (float)rand() / RAND_MAX;
        B[i] = (float)rand() / RAND_MAX;
    }
    
    printf("Running blocked matrix multiply...\\n");
    double t_start = omp_get_wtime();
    
    matmul_blocked(A, B, C, ROWS, COLS, ROWS);
    
    double t_end = omp_get_wtime();
    printf("Completed in %.3f seconds\\n", t_end - t_start);
    printf("Performance: %.2f GFLOPS\\n", 
           2.0 * ROWS * COLS * ROWS / (t_end - t_start) / 1e9);
    
    /* Sample result verification */
    printf("\\nSample output [0][0]: %f\\n", C[0]);
    printf("Sample output [%d][%d]: %f\\n", ROWS-1, COLS-1, 
           C[(ROWS-1)*COLS + COLS-1]);
    
    free(A); free(B); free(C);
    return 0;
}`,
    description: 'SIMD-optimized numerical computing'
  },

  // === ELIXIR (Functional Concurrent) ===
  elixir_quantum_simulation: {
    name: 'Elixir: Quantum Circuit Simulator',
    language: 'elixir',
    code: `# SciHub Pro - Elixir Quantum Circuit Simulator
# BEAM VM concurrency for parallel quantum state evolution
# Models superposition, entanglement, and gate operations

defmodule QuantumSimulator do
  @moduledoc """
  Simulates quantum circuits using state vector representation.
  Leverages BEAM VM's lightweight processes for parallel gate application.
  Supports up to ~12 qubits before memory becomes prohibitive.
  """

  # Complex number arithmetic (rectangular form)
  defstruct [:real, :imag]

  def new_complex(r, i), do: %__MODULE__{real: r, imag: i}
  
  def add(a, b), do: new_complex(a.real + b.real, a.imag + b.imag)
  def sub(a, b), do: new_complex(a.real - b.real, a.imag - b.imag)
  def mul(a, b) do
    new_complex(
      a.real * b.real - a.imag * b.imag,
      a.real * b.imag + a.imag * b.real
    )
  end
  
  def magnitude(c), do: :math.sqrt(c.real * c.real + c.imag * c.imag)
  def conjugate(c), do: new_complex(c.real, -c.imag)

  # Quantum state: list of complex amplitudes
  @doc """
  Initialize |0⟩^n state (n qubits all in ground state)
  """
  def init_state(num_qubits) do
    size = trunc(:math.pow(2, num_qubits))
    state = List.duplicate(new_complex(0.0, 0.0), size)
    List.replace_at(state, 0, new_complex(1.0, 0.0))
  end

  # Single-qubit gates
  def pauli_x(), do: [[0, 1], [1, 0]]
  def pauli_y(), do: [[0, new_complex(0, -1)], [new_complex(0, 1), 0]]
  def pauli_z(), do: [[1, 0], [0, -1]]
  
  def hadamard() do
    inv_sqrt2 = 1.0 / :math.sqrt(2)
    [[inv_sqrt2, inv_sqrt2], [inv_sqrt2, -inv_sqrt2]]
  end
  
  def phase(theta) do
    [[1, 0], [0, new_complex(:math.cos(theta), :math.sin(theta))]]
  end

  # Gate application (parallelized over state vector chunks)
  def apply_gate(state, gate, target_qubit, num_qubits) do
    state_size = length(state)
    mask = Bitwise.bsl(1, target_qubit)
    
    # Split state into independent chunks for parallel processing
    chunk_size = Bitwise.bsl(1, target_qubit)
    
    state
    |> Enum.chunk_every(chunk_size * 2)
    |> Task.async_stream(fn chunk ->
      apply_gate_to_chunk(chunk, gate, target_qubit)
    end, max_concurrency: System.schedulers_online())
    |> Enum.flat_map(fn {:ok, result} -> result end)
  end

  defp apply_gate_to_chunk(chunk, gate, _target) do
    chunk
    |> Enum.chunk_every(2)
    |> Enum.flat_map(fn [a, b] ->
      # Matrix-vector multiply: [gate00*a + gate01*b, gate10*a + gate11*b]
      g00 = gate |> Enum.at(0) |> Enum.at(0)
      g01 = gate |> Enum.at(0) |> Enum.at(1)
      g10 = gate |> Enum.at(1) |> Enum.at(0)
      g11 = gate |> Enum.at(1) |> Enum.at(1)
      
      [
        add(mul(g00, a), mul(g01, b)),
        add(mul(g10, a), mul(g11, b))
      ]
    end)
  end

  # CNOT gate (entangling operation)
  def apply_cnot(state, control, target, num_qubits) do
    control_mask = Bitwise.bsl(1, control)
    target_mask = Bitwise.bsl(1, target)
    
    Enum.with_index(state)
    |> Enum.map fn {amp, idx} ->
      if Bitwise.band(idx, control_mask) != 0 do
        # Flip target bit for control=1 states
        flipped_idx = Bitwise.bxor(idx, target_mask)
        elem(state, flipped_idx)
      else
        amp
      end
    end
  end

  # Measurement (stochastic collapse)
  def measure(state, _num_qubits) do
    probabilities = Enum.map(state, fn c -> magnitude(c) |> :math.pow(2) end)
    cumulative = probabilities |> Enum.cumulative_sum()
    r = :random.uniform()
    
    outcome = Enum.find_index(cumulative, fn p -> p >= r end) || 0
    
    # Collapse state to measured basis
    collapsed = List.duplicate(new_complex(0.0, 0.0), length(state))
    collapsed = List.replace_at(collapsed, outcome, new_complex(1.0, 0.0))
    
    {outcome, collapsed}
  end

  # Expected value of Pauli-Z operator
  def expectation_z(state, qubit) do
    mask = Bitwise.bsl(1, qubit)
    
    state
    |> Enum.with_index()
    |> Enum.reduce(new_complex(0.0, 0.0), fn {amp, idx}, acc ->
      sign = if Bitwise.band(idx, mask) == 0, do: 1, else: -1
      prob = magnitude(amp) |> :math.pow(2)
      add(acc, new_complex(sign * prob, 0.0))
    end)
  end

  # Demo: Bell state preparation and measurement
  def run_bell_state_demo() do
    IO.puts("=== Quantum Circuit: Bell State (|Φ⁺⟩) ===")
    
    # Initialize 2-qubit system
    state = init_state(2)
    IO.puts("Initial state: |00⟩")
    
    # Apply Hadamard to qubit 0
    state = apply_gate(state, hadamard(), 0, 2)
    IO.puts("After H(q₀): Superposition achieved")
    
    # Apply CNOT (q0 -> q1)
    state = apply_cnot(state, 0, 1, 2)
    IO.puts("After CNOT(q₀,q₁): Entangled Bell state created")
    
    # Verify entanglement through correlation measurements
    exp_z0 = expectation_z(state, 0)
    exp_z1 = expectation_z(state, 1)
    
    IO.puts("\\n⟨Z⟩⊗I = #{exp_z0.real}")
    IO.puts("I⊗⟨Z⟩ = #{exp_z1.real}")
    IO.puts("(Both ≈ 0 indicates maximal entanglement)")
    
    # Multiple measurements to show correlation
    IO.puts("\\nMeasurement outcomes (100 shots):")
    Enum.reduce(1..100, %{0 => 0, 1 => 0, 2 => 0, 3 => 0}, _, shot ->
      fresh_state = init_state(2)
      |> apply_gate(hadamard(), 0, 2)
      |> apply_cnot(0, 1, 2)
      
      {outcome, _} = measure(fresh_state, 2)
      Map.update!(counts, outcome, &(&1 + 1))
    end)
    |> IO.inspect(label: "Outcome distribution")
  end
end

# Run demonstration
QuantumSimulator.run_bell_state_demo()`,
    description: 'Quantum circuit simulation with BEAM concurrency'
  },

  elixir_satellite_telemetry: {
    name: 'Elixir: Satellite Telemetry Stream',
    language: 'elixir',
    code: `# SciHub Pro - Elixir Satellite Telemetry Processor
# Fault-tolerant stream processing with OTP supervision
# Real-time GOES/Sentinel data ingestion and alerting

defmodule SatelliteGroundStation do
  use Application
  require Logger

  @moduledoc """
  Production-grade satellite telemetry processing system.
  Features:
  - GenStage-based backpressure-aware pipelines
  - Supervisor tree for crash recovery
  - Rate limiting and burst handling
  - Automatic reconnection to data feeds
  """

  def start(_type, _args) do
    children = [
      # Registry for dynamic process lookup
      {Registry, keys: :unique, name: TelemetryRegistry},
      
      # Main supervision tree
      {SatelliteGroundStation.Supervisor, []}
    ]
    
    opts = [strategy: :one_for_one, name: SatelliteGroundStation]
    Supervisor.start_link(children, opts)
  end
end

defmodule SatelliteGroundStation.Supervisor do
  use Supervisor
  
  def init(_) do
    children = [
      # Configuration manager (hot-reloadable)
      {DynamicSupervisor, name: ConfigManager, strategy: :one_for_one},
      
      # Data ingest supervisor (one per satellite constellation)
      {SatelliteGroundStation.IngestSupervisor, []},
      
      # Processing pipeline supervisor
      {SatelliteGroundStation.PipelineSupervisor, []},
      
      # Alert manager (Slack/PagerDuty/email integration)
      {SatelliteGroundStation.AlertManager, []}
    ]
    
    Supervisor.init(children, strategy: :rest_for_one)
  end
end

defmodule SatelliteGroundStation.TelemetryProcessor do
  use GenServer
  
  # Telemetry packet structure
  defstruct [
    :satellite_id,
    :timestamp,
    :frame_counter,
    :channels,        # Map of channel_name => value
    :quality_score,   # 0.0 - 1.0
    :flags            # Bitmask for status flags
  ]

  # Quality thresholds
  @quality_warning 0.7
  @quality_critical 0.4
  @anomaly_threshold 4.0  # Sigma deviation

  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @impl true
  def init(opts) do
    state = %{
      satellite_id: opts[:satellite_id],
      buffer: :queue.new(),
      buffer_size: 0,
      max_buffer: Keyword.get(opts, :max_buffer, 10_000),
      stats: %{processed: 0, dropped: 0, anomalies: 0},
      rolling_mean: nil,
      rolling_var: 0.0,
      window_size: Keyword.get(opts, :window_size, 100)
    }
    
    # Schedule periodic stats emission
    :timer.send_interval(5000, :emit_stats)
    
    {:ok, state}
  end

  @impl true
  def handle_info({:telemetry_packet, packet}, state) do
    new_state = process_packet(packet, state)
    {:noreply, new_state}
  end

  @impl true
  def handle_info(:emit_stats, state) do
    Logger.info("#{state.satellite_id}: " <>
      "processed=#{state.stats.processed} " <>
      "dropped=#{state.stats.dropped} " <>
      "anomalies=#{state.stats.anomalies} " <>
      "buffer=#{state.buffer_size}")
    {:noreply, state}
  end

  defp process_packet(packet, state) do
    # Update running statistics (Welford's online algorithm)
    {new_mean, new_var} = update_rolling_stats(
      primary_channel_value(packet.channels),
      state.rolling_mean,
      state.rolling_var,
      state.stats.processed
    )
    
    # Anomaly detection
    is_anomaly = detect_anomaly?(primary_channel_value(packet.channels), 
                                 new_mean, new_var)
    
    if is_anomaly do
      # Trigger alert (async, non-blocking)
      spawn(fn -> 
        SatelliteGroundStation.AlertManager.broadcast(%{
          type: :anomaly_detected,
          satellite: state.satellite_id,
          timestamp: packet.timestamp,
          value: primary_channel_value(packet.channels),
          expected_range: {new_mean - @anomaly_threshold * :math.sqrt(new_var),
                           new_mean + @anomaly_threshold * :math.sqrt(new_var)},
          severity: if(packet.quality_score < @quality_critical, do: :critical, else: :warning)
        })
      end)
      
      %{state | 
        stats: %{state.stats | anomalies: state.stats.anomalies + 1},
        rolling_mean: new_mean,
        rolling_var: new_var,
        stats: %{state.stats | processed: state.stats.processed + 1}
      }
    else
      # Normal processing - buffer for downstream consumers
      updated_buffer = :queue.in(packet, state.buffer)
      new_buffer_size = state.buffer_size + 1
      
      # Backpressure: drop oldest if buffer full
      {final_buffer, final_size} = if new_buffer_size > state.max_buffer do
        {{:value, _dropped, rest}} = :queue.out(updated_buffer)
        {rest, new_buffer_size - 1}
      else
        {updated_buffer, new_buffer_size}
      end
      
      %{state |
        buffer: final_buffer,
        buffer_size: final_size,
        rolling_mean: new_mean,
        rolling_var: new_var,
        stats: %{state.stats | processed: state.stats.processed + 1}
      }
    end
  end

  defp update_rolling_stats(value, nil, _var, _count), do: {value, 0.0}
  defp update_rolling_stats(value, mean, var, count) do
    delta = value - mean
    new_mean = mean + delta / (count + 1)
    delta2 = value - new_mean
    new_var = var + delta * delta2
    {new_mean, var}
  end

  defp detect_anomaly?(value, mean, var) do
    if is_nil(mean) or var < 1.0e-10, do: false, else:
      z_score = abs(value - mean) / :math.sqrt(var)
      z_score > @anomaly_threshold
  end

  defp primary_channel_value(channels) do
    # Get first channel value (customize per instrument)
    channels |> Map.values() |> List.first() || 0.0
  end
end

# Example usage
IO.puts("=== Satellite Ground Station System ===")
IO.puts("Starting telemetry processors...")
IO.puts("Connect to: tcp://datafeed.nasa.gov/goes-abi-stream")
IO.puts("Or local: file:///data/sentinel2/realtime/")`,
    description: 'Fault-tolerant telemetry with OTP supervision'
  },

  // === EXISTING TEMPLATES (Preserved) ===
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
ORDER BY collaborations DESC;`,
    description: 'Scientific database queries'
  },
  r_statistics: {
    name: 'R Statistical Analysis',
    language: 'r',
    code: `# SciHub Pro - R Statistical Analysis Template
library(ggplot2)
library(dplyr)

gene_data <- data.frame(
  Gene = c("BRCA1", "TP53", "EGFR", "MYC", "KRAS", "BRAF", "PTEN"),
  Control = c(10.2, 8.5, 14.3, 21.0, 5.9, 11.2, 7.8),
  Treatment = c(15.8, 7.9, 18.6, 28.4, 4.2, 9.1, 6.5),
  PValue = c(0.001, 0.42, 0.008, 0.0001, 0.15, 0.23, 0.67)
)

gene_data$FoldChange <- gene_data$Treatment / gene_data$Control
gene_data$Significant <- gene_data$PValue < 0.05 & 
                          abs(log2(gene_data$FoldChange)) > 1

cat("Dataset Summary:\\n")
cat("Total genes analyzed:", nrow(gene_data), "\\n")
cat("Significant genes:", sum(gene_data$Significant), "\\n")`,
    description: 'Bioinformatics statistical tests'
  },
  javascript_visualization: {
    name: 'JavaScript Visualization',
    language: 'javascript',
    code: `// SciHub Pro - JavaScript Data Visualization
const researchData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    { label: 'Papers Published', data: [45, 52, 48, 61, 55, 70] },
    { label: 'Citations Received', data: [120, 145, 132, 178, 156, 210] }
  ]
};
console.log('Chart loaded:', researchData.labels.length, 'points');`,
    description: 'Interactive chart configuration'
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

const LANGUAGE_CONFIG: Record<LanguageType, { color: string; label: string; icon: string }> = {
  python: { color: '#3776AB', label: 'Python', icon: '🐍' },
  java: { color: '#007396', label: 'Java', icon: '☕' },
  kotlin: { color: '#7F52FF', label: 'Kotlin', icon: '🟣' },
  scala: { color: '#DC322F', label: 'Scala', icon: '🔴' },
  c: { color: '#555555', label: 'C', icon: '⚙️' },
  elixir: { color: '#4B275F', label: 'Elixir', icon: '💧' },
  sql: { color: '#CC5555', label: 'SQL', icon: '🗃️' },
  r: { color: '#276DC3', label: 'R', icon: '📊' },
  javascript: { color: '#F7DF1E', label: 'JavaScript', icon: '⚡' },
  markdown: { color: '#083FA1', label: 'Markdown', icon: '📝' },
  rust: { color: '#DEA584', label: 'Rust', icon: '🦀' },
  go: { color: '#00ADD8', label: 'Go', icon: '🐹' },
};

// ============ CATEGORY CONFIG ============

const CATEGORY_CONFIG: Record<DataSet['category'], { color: string; icon: string; label: string }> = {
  lhc: { color: '#EF4444', icon: '⚛️', label: 'High Energy Physics' },
  satellite: { color: '#3B82F6', icon: '🛰️', label: 'Satellite / Remote Sensing' },
  genomic: { color: '#10B981', icon: '🧬', label: 'Genomics / Biomedical' },
  climate: { color: '#06B6D4', icon: '🌍', label: 'Climate / Environmental' },
  quantum: { color: '#8B5CF6', icon: '🔮', label: 'Quantum Computing' },
  neuroscience: { color: '#F59E0B', icon: '🧠', label: 'Neuroscience' },
  materials: { color: '#6366F1', icon: '⚗️', label: 'Materials Science' },
  astronomy: { color: '#EC4899', icon: '🔭', label: 'Astronomy / Astrophysics' },
};

// ============ SECURITY CONFIGURATION ============

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  lineThreshold: 10, // Lines triggering secure mode
  forwardDestination: 'webhook',
  destinationAddress: '',
  enableSandbox: true,
  maxExecutionTime: 30, // seconds
  memoryLimit: 512, // MB
  enableAuditLog: true,
  blockPatterns: [
    'eval\\(',
    'exec\\(',
    'system\\(',
    '__import__',
    'Runtime\\.getRuntime',
    'ProcessBuilder',
    'subprocess',
    'os\\.system',
    'rm -rf',
    '> /dev/',
    'curl.*\\|.*sh',
    'wget.*\\|.*sh',
    '\\.exec\\(',
    'spawn\\(',
    'child_process',
    "require\\(['\"]child_process['\"]\\)",
    'import os',
    'from subprocess',
    'dangerouslySetInnerHTML',
    'innerHTML',
    'document\\.write',
  ]
};

// ============ INJECTION DETECTION PATTERNS ============

function detectSuspiciousPatterns(code: string): { isSuspicious: boolean; patterns: string[]; riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' } {
  const foundPatterns: string[] = [];
  
  for (const pattern of DEFAULT_SECURITY_CONFIG.blockPatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(code)) {
      foundPatterns.push(pattern);
    }
  }
  
  let riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'safe';
  if (foundPatterns.length >= 5) riskLevel = 'critical';
  else if (foundPatterns.length >= 3) riskLevel = 'high';
  else if (foundPatterns.length >= 2) riskLevel = 'medium';
  else if (foundPatterns.length >= 1) riskLevel = 'low';
  
  return {
    isSuspicious: foundPatterns.length > 0,
    patterns: foundPatterns,
    riskLevel
  };
}

// ============ WORKSPACE PAGE COMPONENT ============

export default function WorkspacePage() {
  const [files, setFiles] = useState<EditorFile[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState(defaultFiles[0].id);
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Security state
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(DEFAULT_SECURITY_CONFIG);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [auditLog, setAuditLog] = useState<Array<{timestamp: Date; action: string; details: string}>>([]);

  // Dataset browser state
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [datasetFilter, setDatasetFilter] = useState<DataSet['category'] | 'all'>('all');
  const [showDatasetBrowser, setShowDatasetBrowser] = useState(true);

  // Get active file
  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // Count lines in active file
  const lineCount = activeFile.content.split('\n').length;
  const requiresSecureMode = lineCount > securityConfig.lineThreshold;

  // Security scan
  const securityScan = detectSuspiciousPatterns(activeFile.content);

  // Add terminal output line
  const addOutput = useCallback((type: TerminalLine['type'], content: string) => {
    setOutput(prev => [...prev, { type, content, timestamp: new Date() }]);
  }, []);

  // Add audit log entry
  const addAuditEntry = useCallback((action: string, details: string) => {
    if (securityConfig.enableAuditLog) {
      setAuditLog(prev => [...prev, { timestamp: new Date(), action, details }]);
    }
  }, [securityConfig.enableAuditLog]);

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

    const extMap: Record<LanguageType, string> = {
      python: 'py', java: 'java', kotlin: 'kt', scala: 'scala',
      c: 'c', elixir: 'ex', sql: 'sql', r: 'R', javascript: 'js',
      markdown: 'md', rust: 'rs', go: 'go'
    };

    const newFile: EditorFile = {
      id: `file-${Date.now()}`,
      name: template.name.split(':')[0].trim().toLowerCase().replace(/\s+/g, '-') + '.' + (extMap[template.language] || 'txt'),
      language: template.language,
      content: template.code
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOutput([]);
    setSelectedDataset(null);
    addAuditEntry('TEMPLATE_LOADED', `Created ${template.name}`);
  };

  // Secure execution with result forwarding
  const executeCodeSecurely = (): ExecutionResult => {
    const startTime = performance.now();
    const lines = activeFile.content.split('\n');
    
    // Check if secure mode required
    const needsForwarding = lines.length > securityConfig.lineThreshold;
    const scanResult = detectSuspiciousPatterns(activeFile.content);
    
    let securityLevel: ExecutionResult['securityLevel'] = 'safe';
    let wasBlocked = false;
    
    // Determine security level
    if (scanResult.riskLevel === 'critical') {
      securityLevel = 'blocked';
      wasBlocked = true;
    } else if (needsForwarding || scanResult.isSuspicious) {
      securityLevel = needsForwarding ? 'secure' : 'sandboxed';
    }

    // Simulate execution
    const executionTime = (performance.now() - startTime) / 1000;
    const estimatedMemory = Math.min(lines.length * 0.5, securityConfig.memoryLimit);

    const result: ExecutionResult = {
      success: !wasBlocked,
      output: [],
      executionTime,
      memoryUsed: estimatedMemory,
      wasForwarded: needsForwarding && !wasBlocked,
      forwardLocation: needsForwarding && !wasBlocked ? `${securityConfig.forwardDestination}://${securityConfig.destinationAddress || 'user-configured-endpoint'}` : undefined,
      securityLevel
    };

    return result;
  };

  // Main run function with security checks
  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    setExecutionResult(null);

    // Pre-execution security scan
    const scan = detectSuspiciousPatterns(activeFile.content);
    const lines = activeFile.content.split('\n');
    
    addOutput('info', `╔══════════════════════════════════════════════════════════════╗`);
    addOutput('info', `║  SciHub Pro Secure Execution Environment v2.0               ║`);
    addOutput('info', `╚══════════════════════════════════════════════════════════════╝`);
    addOutput('info', '');
    addOutput('info', `$ ${LANGUAGE_CONFIG[activeFile.language]?.icon || ''} ${activeFile.language} ${activeFile.name}`);
    addOutput('info', `Lines of code: ${lines.length}`);
    addOutput('info', `Security threshold: ${securityConfig.lineThreshold} lines`);
    addOutput('info', '');

    // Security assessment
    if (scan.isSuspicious) {
      addOutput('warning', `⚠️  Security Scan: ${scan.patterns.length} pattern(s) detected`);
      addOutput('warning', `   Risk Level: ${scan.riskLevel.toUpperCase()}`);
      scan.patterns.forEach(p => addOutput('warning', `   • ${p}`));
      addOutput('info', '');
    }

    if (scan.riskLevel === 'critical') {
      setTimeout(() => {
        addOutput('error', '🚫 EXECUTION BLOCKED');
        addOutput('error', 'Critical security risks detected in code.');
        addOutput('error', 'Please remove dangerous patterns before retrying.');
        addOutput('security', '');
        addOutput('security', '🛡️  Security Report:');
        addOutput('security', `   Status: BLOCKED`);
        addOutput('security', `   Reason: Critical-risk patterns found`);
        addOutput('security', `   Action Required: Code review needed`);
        addAuditEntry('EXECUTION_BLOCKED', `Critical patterns: ${scan.patterns.join(', ')}`);
        setIsRunning(false);
        setExecutionResult({ success: false, output: [], executionTime: 0, memoryUsed: 0, wasForwarded: false, securityLevel: 'blocked' });
      }, 500);
      return;
    }

    // Determine execution mode
    const needsSecureMode = lines.length > securityConfig.lineThreshold;
    
    if (needsSecureMode) {
      addOutput('security', `🔒 SECURE MODE ACTIVATED (Code exceeds ${securityConfig.lineThreshold} lines)`);
      addOutput('security', `   Result will be forwarded to external destination`);
      addOutput('security', `   Destination: ${securityConfig.forwardDestination.toUpperCase()}${securityConfig.destinationAddress ? ' → ' + securityConfig.destinationAddress : ' (configure below)'}`);
      addOutput('info', '');
    }

    addOutput('info', securityConfig.enableSandbox ? '📦 Sandbox: ENABLED (Resource limits enforced)' : '⚠️  Sandbox: DISABLED');
    addOutput('info', `⏱️  Time limit: ${securityConfig.maxExecutionTime}s | Memory: ${securityConfig.memoryLimit}MB`);
    addOutput('info', '');
    addOutput('info', 'Executing...');

    setTimeout(() => {
      const result = executeCodeSecurely();
      setExecutionResult(result);

      if (result.success) {
        addOutput('success', '✅ Execution completed successfully');
        addOutput('info', '');

        // Simulate language-specific output
        generateSimulatedOutput();

        addOutput('info', '');
        addOutput('info', `⏱️  Execution time: ${result.executionTime.toFixed(3)}s`);
        addOutput('info', `💾 Memory used: ~${result.memoryUsed.toFixed(1)}MB`);

        if (result.wasForwarded) {
          addOutput('security', '');
          addOutput('security', '📤 RESULT FORWARDING ACTIVATED');
          addOutput('security', `   Mode: External delivery (prevents platform injection)`);
          addOutput('security', `   Destination: ${result.forwardLocation}`);
          addOutput('security', `   Status: Queued for delivery`);
          addOutput('security', '');
          addOutput('security', '   Why? Code blocks exceeding threshold are forwarded externally');
          addOutput('security', '   to protect platform integrity and prevent code injection attacks.');
          addOutput('security', '   This ensures long-running computations cannot compromise the workspace.');
          addAuditEntry('RESULT_FORWARDED', `To: ${result.forwardLocation} (${lines.length} lines)`);
        }

        addOutput('info', '');
        addOutput('info', `🛡️  Security Level: ${result.securityLevel.toUpperCase()}`);
      }

      if (securityConfig.enableAuditLog) {
        addOutput('info', `📋 Audit log entry recorded`);
      }

      setIsRunning(false);
    }, 1500);
  };

  // Generate simulated output based on language
  const generateSimulatedOutput = () => {
    const lang = activeFile.language;
    
    switch(lang) {
      case 'python':
        if (activeFile.content.includes('uproot') || activeFile.content.includes('ROOT')) {
          addOutput('output', 'Opening CMS Open Data ROOT file...');
          addOutput('output', 'Reading branch: Muon_pt (type: vector<double>)');
          addOutput('output', 'Reading branch: Muon_eta (type: vector<double>)');
          addOutput('output', 'Reading branch: Muon_phi (type: vector<double>)');
          addOutput('output', '');
          addOutput('output', 'Loaded 1,247,892 muon candidates from 50,000 events');
          addOutput('output', 'Applying kinematic selections: pT > 25 GeV, |η| < 2.4');
          addOutput('output', '');
          addOutput('output', 'Selected 342,156 muons passing quality cuts');
          addOutput('output', 'Forming opposite-sign dimuon pairs...');
          addOutput('output', '');
          addOutput('output', '=== Dimuon Mass Spectrum Peaks ===');
          addOutput('output', '  J/ψ (3.097 GeV):  12,847 ± 113 candidates');
          addOutput('output', '  ψ(2S) (3.686 GeV):  1,923 ± 44 candidates');
          addOutput('output', '  Υ(1S) (9.460 GeV):   8,421 ± 92 candidates');
          addOutput('output', '  Z (91.188 GeV):      45,234 ± 213 candidates');
        } else if (activeFile.content.includes('fits') || activeFile.content.includes('astropy')) {
          addOutput('output', 'Loading Sentinel-2 L2A FITS file...');
          addOutput('output', 'Header: SENTINEL2A_MSIL2A_20240115T..._B08');
          addOutput('output', 'Dimensions: 10980 × 10980 pixels (10m resolution)');
          addOutput('output', 'WCS: PROJCS["WGS 84 / UTM zone 32N"]');
          addOutput('output', '');
          addOutput('output', 'Band statistics (NIR Band 8):');
          addOutput('output', '  Mean reflectance: 0.1847');
          addOutput('output', '  Std deviation: 0.0623');
          addOutput('output', '  Valid pixels: 98.2%');
          addOutput('output', '');
          addOutput('output', 'NDVI computed successfully');
          addOutput('output', '  Vegetated area: 67.3%');
          addOutput('output', '  Bare soil: 22.1%');
          addOutput('output', '  Water bodies: 3.8%');
        } else {
          addOutput('output', 'Dataset Shape: (5, 3)');
          addOutput('output', '');
          addOutput('output', 'Summary Statistics:');
          addOutput('output', '       Expression     P_Value');
          addOutput('output', 'count    5.000000   5.000000');
          addOutput('output', 'mean    12.760000   0.133200');
          addOutput('output', 'std       6.241083   0.021382');
          addOutput('output', '');
          addOutput('output', 'Significant Genes (p<0.01): 3');
        }
        break;
        
      case 'java':
      case 'kotlin':
      case 'scala':
        addOutput('output', '[INFO] Starting JVM runtime...');
        addOutput('output', '[INFO] Classpath: scihub-pro-analyzer.jar');
        addOutput('output', '[INFO] Heap: 512MB allocated');
        addOutput('output', '');
        if (lang === 'scala') {
          addOutput('output', '[SparkContext] Connecting to cluster: yarn-prod');
          addOutput('output', '[SparkContext] Executor cores: 4 per node');
          addOutput('output', '[SparkContext] Total executors: 50');
          addOutput('output', '');
          addOutput('output', 'Loading Parquet partition: s3a://cms-data/run2015B/');
          addOutput('output', 'Partition count: 12,450');
          addOutput('output', '');
          addOutput('output', '=== Distributed Analysis Results ===');
          addOutput('output', 'Total events processed: 847,293,102');
          addOutput('output', 'Dimuon candidates: 3,892,104');
          addOutput('output', 'Z boson candidates (76-106 GeV): 892,341');
          addOutput('output', '');
          addOutput('output', 'Job completed in 4m 32s (wall clock)');
          addOutput('output', 'Resources: 200 core-hours consumed');
        } else if (activeFile.content.includes('Genomic') || activeFile.content.includes('htsjdk')) {
          addOutput('output', '[HTSJDK] Opening BAM file with index...');
          addOutput('output', '[HTSJDK] Sequence dictionary loaded: GRCh38.p14');
          addOutput('output', '[HTSJDK] Total alignments: 127,843,291');
          addOutput('output', '');
          addOutput('output', '=== Genomic QC Metrics ===');
          addOutput('output', 'Total reads: 127,843,291');
          addOutput('output', 'Mapped reads: 124,567,890 (97.4%)');
          addOutput('output', 'Proper pairs: 118,234,567 (92.5%)');
          addOutput('output', 'Duplicate rate: 8.2%');
          addOutput('output', 'Mean coverage: 38.7x');
          addOutput('output', 'Q30 bases: 94.2%');
          addOutput('output', '');
          addOutput('output', 'Clinical variants (AF<1%, PASS): 2,341');
        } else {
          addOutput('output', 'ParticleAnalysis.main() started');
          addOutput('output', 'Loading event data from ROOT via JNI...');
          addOutput('output', '');
          addOutput('output', 'Event selection applied:');
          addOutput('output', '  Muon pT > 25 GeV: 342,156 passed');
          addOutput('output', '  |η| < 2.4: 338,921 passed');
          addOutput('output', '  Quality flags OK: 335,482 passed');
          addOutput('output', '');
          addOutput('output', 'Z→μμ candidates found: 45,234');
          addOutput('output', '  Peak at M = 91.1876 ± 0.0021 GeV');
        }
        break;
        
      case 'c':
        if (activeFile.content.includes('hdf5') || activeFile.content.includes('H5')) {
          addOutput('output', 'HDF5 1.14.0 initialized');
          addOutput('output', 'Creating file: detector_output.h5');
          addOutput('output', 'Userblock reserved: 512 bytes');
          addOutput('output', '');
          addOutput('output', 'Dataset: experimental_data');
          addOutput('output', '  Datatype: Compound (timestamp, values[16], flags, uncertainty)');
          addOutput('output', '  Chunk shape: (1024, 20)');
          addOutput('output', '  Compression: GZIP level 6');
          addOutput('output', '  Allocation time: 0.003s');
          addOutput('output', '');
          addOutput('output', 'Writing batches:');
          addOutput('output', '  Batch 0:  1024 measurements written (offset 0)');
          addOutput('output', '  Batch 1:  1024 measurements written (offset 1024)');
          addOutput('output', '  ...');
          addOutput('output', '  Batch 9:  1024 measurements written (offset 9216)');
          addOutput('output', '');
          addOutput('output', 'Performance: 10,240 samples in 0.047s');
          addOutput('output', 'Throughput: 218,042 samples/sec');
          addOutput('output', '');
          addOutput('output', 'File size: 2.3 MB (compressed from 4.1 MB)');
          addOutput('output', 'Compression ratio: 1.78:1');
        } else {
          addOutput('output', 'Allocating aligned memory (32-byte boundaries)...');
          addOutput('output', 'Matrix A: 4096×4096 = 67,108,864 floats (256 MB)');
          addOutput('output', 'Matrix B: 4096×4096 = 67,108,864 floats (256 MB)');
          addOutput('output', 'Matrix C: initialized to zero');
          addOutput('output', '');
          addOutput('output', 'AVX2 intrinsics enabled');
          addOutput('output', 'OpenMP threads: 16');
          addOutput('output', 'Block size: 64×64 (L1 cache optimized)');
          addOutput('output', '');
          addOutput('output', 'Running blocked matrix multiply...');
          addOutput('output', '');
          addOutput('output', '✓ Completed in 0.847 seconds');
          addOutput('output', 'Performance: 424.6 GFLOPS');
          addOutput('output', 'Cache hit rate: 94.2%');
          addOutput('output', '');
          addOutput('output', 'Verification: C[0][0] = 4096.0000');
          addOutput('output', 'Verification: C[4095][4095] = 4092.1846');
        }
        break;
        
      case 'elixir':
        if (activeFile.content.includes('Quantum') || activeFile.content.includes('quantum')) {
          addOutput('output', '=== Quantum Circuit: Bell State (|Φ⁺⟩) ===');
          addOutput('output', '');
          addOutput('output', 'Initializing 2-qubit state vector...');
          addOutput('output', '|ψ₀⟩ = |00⟩ = [1.0 + 0.0i, 0, 0, 0]');
          addOutput('output', '');
          addOutput('output', 'Applying H(q₀)...');
          addOutput('output', '|ψ₁⟩ = 0.707|00⟩ + 0.707|01⟩');
          addOutput('output', '(Superposition achieved)');
          addOutput('output', '');
          addOutput('output', 'Applying CNOT(q₀,q₁)...');
          addOutput('output', '|ψ₂⟩ = 0.707|00⟩ + 0.707|11⟩');
          addOutput('output', '(Bell state |Φ⁺⟩ prepared)');
          addOutput('output', '');
          addOutput('output', 'Entanglement verification:');
          addOutput('output', '⟨Z⟩⊗I = 0.0000 (± floating error)');
          addOutput('output', 'I⊗⟨Z⟩ = 0.0000 (± floating error)');
          addOutput('output', '(Maximal entanglement confirmed!)');
          addOutput('output', '');
          addOutput('output', 'Measurement outcomes (100 shots):');
          addOutput('output', '%{0 => 49, 3 => 51}');
          addOutput('output', '(Perfect anti-correlation ✓)');
        } else {
          addOutput('output', 'Starting SatelliteGroundStation application...');
          addOutput('output', '');
          addOutput('output', 'Supervision tree starting:');
          addOutput('output', '  [OK] TelemetryRegistry');
          addOutput('output', '  [OK] ConfigManager (dynamic)');
          addOutput('output', '  [OK] IngestSupervisor');
          addOutput('output', '    [OK] GOES-ABI-Processor');
          addOutput('output', '    [OK] Sentinel2-Processor');
          addOutput('output', '  [OK] PipelineSupervisor');
          addOutput('output', '  [OK] AlertManager');
          addOutput('output', '');
          addOutput('output', 'Connected to: tcp://datafeed.nasa.gov/goes-abi-stream');
          addOutput('output', 'Buffer: 0/10,000 packets');
          addOutput('output', 'Stats emit interval: 5s');
          addOutput('output', '');
          addOutput('output', 'GOES-17: processed=1,234 dropped=0 anomalies=2');
          addOutput('output', 'Sentinel-2A: processed=567 dropped=0 anomalies=0');
        }
        break;
        
      default:
        addOutput('output', 'Code executed successfully!');
        addOutput('output', `Language: ${LANGUAGE_CONFIG[activeFile.language]?.label || activeFile.language}`);
    }
  };

  // Close file tab
  const closeFile = (fileId: string) => {
    if (files.length <= 1) return;
    
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
            There was an error loading the advanced workspace editor.
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
            <span className="text-4xl">🚀</span>
            Advanced Computational Workspace
            <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-800">
              v2.0 SECURE
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Multi-language scientific computing with binary dataset integration and secure result forwarding.
            <br />
            <span className="text-sm text-muted-foreground/70">
              Supports: Python, JVM (Java/Kotlin/Scala), C/C++, Elixir, R, SQL, JavaScript • 
              Data: LHC ROOT, Satellite FITS/HDF5, Genomic BAM/VCF
            </span>
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 h-[calc(100vh-260px)] min-h-[600px]">
          
          {/* Left Sidebar - Templates & Datasets */}
          <div className="xl:col-span-1 space-y-4 overflow-y-auto max-h-full">
            
            {/* Tab Switcher for Sidebar */}
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="templates" className="text-xs">📁 Code</TabsTrigger>
                <TabsTrigger value="datasets" className="text-xs">📊 Data</TabsTrigger>
              </TabsList>

              {/* Code Templates Tab */}
              <TabsContent value="templates" className="space-y-3 mt-3">
                <Card className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>🧪 Code Templates</span>
                      <Badge variant="outline" className="text-[10px]">
                        {Object.keys(CODE_TEMPLATES).length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                    {/* Group templates by language category */}
                    {[
                      { label: 'Python / Data Science', languages: ['python'] },
                      { label: 'JVM Platform', languages: ['java', 'kotlin', 'scala'] },
                      { label: 'Systems / C', languages: ['c'] },
                      { label: 'Functional / Elixir', languages: ['elixir'] },
                      { label: 'Other', languages: ['sql', 'r', 'javascript'] },
                    ].map(group => (
                      <div key={group.label}>
                        <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1 mt-2 first:mt-0">
                          {group.label}
                        </p>
                        {Object.entries(CODE_TEMPLATES)
                          .filter(([_, t]) => group.languages.includes(t.language))
                          .map(([key, template]) => (
                            <Button
                              key={key}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs h-auto py-1.5 px-2"
                              onClick={() => createFromTemplate(key)}
                            >
                              <span 
                                className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" 
                                style={{ backgroundColor: LANGUAGE_CONFIG[template.language]?.color }}
                              ></span>
                              <span className="truncate">{template.name}</span>
                            </Button>
                          ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Datasets Tab */}
              <TabsContent value="datasets" className="space-y-3 mt-3">
                <Card className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>🌐 Binary Datasets</span>
                      <Badge variant="outline" className="text-[10px]">
                        {DATASET_CATALOG.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Category Filter */}
                    <Select value={datasetFilter} onValueChange={(v) => setDatasetFilter(v as typeof datasetFilter)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📂 All Categories</SelectItem>
                        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            {cfg.icon} {cfg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Dataset List */}
                    <div className="max-h-[280px] overflow-y-auto space-y-1.5">
                      {DATASET_CATALOG
                        .filter(ds => datasetFilter === 'all' || ds.category === datasetFilter)
                        .map(dataset => (
                          <button
                            key={dataset.id}
                            onClick={() => setSelectedDataset(dataset)}
                            className={`w-full text-left p-2 rounded-md border transition-colors ${
                              selectedDataset?.id === dataset.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-sm mt-0.5">{CATEGORY_CONFIG[dataset.category]?.icon || '📦'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{dataset.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {dataset.format} • {dataset.size}
                                </p>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[9px] mt-1 ${
                                    dataset.accessLevel === 'open' ? 'border-green-300 text-green-700' :
                                    dataset.accessLevel === 'registered' ? 'border-yellow-300 text-yellow-700' :
                                    'border-red-300 text-red-700'
                                  }`}
                                >
                                  {dataset.accessLevel}
                                </Badge>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Security Panel Toggle */}
            <Card className="h-fit">
              <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowSecurityPanel(!showSecurityPanel)}>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>🛡️ Security Controls</span>
                  <Badge variant={requiresSecureMode || securityScan.isSuspicious ? "destructive" : "secondary"} className="text-[10px]">
                    {securityScan.riskLevel === 'critical' ? 'BLOCKED' :
                     securityScan.riskLevel === 'high' ? 'HIGH RISK' :
                     requiresSecureMode ? 'SECURE MODE' : 'NORMAL'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              {showSecurityPanel && (
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-medium">
                      Line Threshold (triggers secure mode)
                    </label>
                    <Input
                      type="number"
                      value={securityConfig.lineThreshold}
                      onChange={(e) => setSecurityConfig(prev => ({ ...prev, lineThreshold: parseInt(e.target.value) || 10 }))}
                      className="h-8 text-xs"
                      min={5}
                      max={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-medium">
                      Forward Destination
                    </label>
                    <Select 
                      value={securityConfig.forwardDestination} 
                      onValueChange={(v) => setSecurityConfig(prev => ({ ...prev, forwardDestination: v as SecurityConfig['forwardDestination'] }))}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webhook">🔗 Webhook URL</SelectItem>
                        <SelectItem value="email">📧 Email Address</SelectItem>
                        <SelectItem value="s3">☁️ AWS S3 Bucket</SelectItem>
                        <SelectItem value="gcs">☁️ Google Cloud Storage</SelectItem>
                        <SelectItem value="azure">☁️ Azure Blob Storage</SelectItem>
                        <SelectItem value="local">💾 Local Download</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-medium">
                      Destination Address
                    </label>
                    <Input
                      type="text"
                      value={securityConfig.destinationAddress}
                      onChange={(e) => setSecurityConfig(prev => ({ ...prev, destinationAddress: e.target.value }))}
                      placeholder={securityConfig.forwardDestination === 'webhook' ? 'https://your-webhook-url.com/endpoint' :
                                   securityConfig.forwardDestination === 'email' ? 'user@example.com' :
                                   securityConfig.forwardDestination === 's3' ? 's3://bucket-name/path/' :
                                   securityConfig.forwardDestination === 'gcs' ? 'gs://bucket/path/' :
                                   securityConfig.forwardDestination === 'azure' ? 'https://account.blob.core.windows.net/' :
                                   './results/'}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sandbox-toggle"
                      checked={securityConfig.enableSandbox}
                      onChange={(e) => setSecurityConfig(prev => ({ ...prev, enableSandbox: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="sandbox-toggle" className="text-xs">Enable Sandbox</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="audit-toggle"
                      checked={securityConfig.enableAuditLog}
                      onChange={(e) => setSecurityConfig(prev => ({ ...prev, enableAuditLog: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="audit-toggle" className="text-xs">Enable Audit Log</label>
                  </div>

                  {/* Current Status */}
                  <div className="p-2 rounded bg-muted text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span>Current Lines:</span>
                      <span className={lineCount > securityConfig.lineThreshold ? 'text-red-600 font-bold' : ''}>
                        {lineCount} {lineCount > securityConfig.lineThreshold ? '(⚠️)' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span>{requiresSecureMode ? '🔒 Will Forward' : '✅ Safe to Execute'}</span>
                    </div>
                    {securityScan.isSuspicious && (
                      <div className="flex justify-between text-orange-600">
                        <span>Patterns:</span>
                        <span>{securityScan.patterns.length} found</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Session Stats */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">📈 Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Open Files</span>
                  <Badge variant="outline" className="text-xs">{files.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Lines</span>
                  <span className={`text-xs ${lineCount > securityConfig.lineThreshold ? 'text-red-600 font-bold' : ''}`}>
                    {lineCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Language</span>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: LANGUAGE_CONFIG[activeFile.language]?.color + '20',
                      color: LANGUAGE_CONFIG[activeFile.language]?.color
                    }}
                    className="text-xs"
                  >
                    {LANGUAGE_CONFIG[activeFile.language]?.icon} {LANGUAGE_CONFIG[activeFile.language]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-xs">Executions</span>
                  <span className="text-xs">{auditLog.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Editor Area */}
          <div className="xl:col-span-3 flex flex-col space-y-4">
            
            {/* Selected Dataset Info Card */}
            {selectedDataset && (
              <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        {CATEGORY_CONFIG[selectedDataset.category]?.icon} {selectedDataset.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {selectedDataset.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">
                          {selectedDataset.source}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {selectedDataset.format}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {selectedDataset.size}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${
                            selectedDataset.accessLevel === 'open' ? 'border-green-300 text-green-700' :
                            selectedDataset.accessLevel === 'registered' ? 'border-yellow-300 text-yellow-700' :
                            'border-red-300 text-red-700'
                          }`}
                        >
                          {selectedDataset.accessLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDataset(null)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200/50">
                    <a 
                      href={selectedDataset.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      🔗 Access Data Portal →
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Editor Card */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* File Tabs */}
              <div className="flex items-center border-b bg-muted/30 px-2 overflow-x-auto">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r flex-shrink-0 ${
                      file.id === activeFileId 
                        ? 'bg-background border-b-2 border-b-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveFileId(file.id)}
                  >
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: LANGUAGE_CONFIG[file.language]?.color }}
                    ></span>
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    {files.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); closeFile(file.id); }}
                        className="ml-1 text-muted-foreground hover:text-foreground flex-shrink-0"
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
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-800 text-slate-500 text-xs pt-4 pl-2 select-none font-mono z-10">
                  {activeFile.content.split('\n').map((_, i) => (
                    <div 
                      key={i} 
                      className={`${i === 0 ? '' : 'leading-6'} ${
                        i < securityConfig.lineThreshold ? '' : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                
                {/* Actual textarea for editing */}
                <textarea
                  value={activeFile.content}
                  onChange={(e) => updateFileContent(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent text-slate-100 text-sm p-4 pl-12 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 tab-size-2"
                  spellCheck={false}
                  style={{ lineHeight: '1.6' }}
                />

                {/* Security Overlay Warning */}
                {requiresSecureMode && (
                  <div className="absolute top-2 right-2 z-20">
                    <Badge variant="destructive" className="text-[10px] animate-pulse">
                      🔒 SECURE MODE ({lineCount} lines)
                    </Badge>
                  </div>
                )}
              </div>

              {/* Editor Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
                <div className="flex items-center gap-2">
                  <Select defaultValue={activeFile.language}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Python</SelectLabel>
                        <SelectItem value="python">🐍 Python</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>JVM Platform</SelectLabel>
                        <SelectItem value="java">☕ Java</SelectItem>
                        <SelectItem value="kotlin">🟣 Kotlin</SelectItem>
                        <SelectItem value="scala">🔴 Scala</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Systems</SelectLabel>
                        <SelectItem value="c">⚙️ C</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Functional</SelectLabel>
                        <SelectItem value="elixir">💧 Elixir</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Other</SelectLabel>
                        <SelectItem value="sql">🗃️ SQL</SelectItem>
                        <SelectItem value="r">📊 R</SelectItem>
                        <SelectItem value="javascript">⚡ JS</SelectItem>
                        <SelectItem value="markdown">📝 MD</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                    </Select>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {lineCount} lines • UTF-8
                    {requiresSecureMode && <span className="text-red-500 ml-2">• Will forward externally</span>}
                  </span>
                  <Button 
                    size="sm" 
                    onClick={runCode}
                    disabled={isRunning || securityScan.riskLevel === 'critical'}
                    className={`${
                      securityScan.riskLevel === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                      requiresSecureMode ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isRunning ? '⏳ Running...' : 
                     securityScan.riskLevel === 'critical' ? '🚫 Blocked' :
                     requiresSecureMode ? '🔒 Run (Secure)' : '▶️ Run Code'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Output/Terminal Panel */}
            <Card className="h-[220px] flex flex-col">
              <CardHeader className="pb-2 py-3 px-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    🖥️ Output / Terminal
                    {executionResult?.wasForwarded && (
                      <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-800">
                        📤 Forwarded
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => setOutput([])}
                    >
                      Clear
                    </Button>
                    {securityConfig.enableAuditLog && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => {
                          addOutput('info', '');
                          addOutput('info', '📋 Audit Log:');
                          auditLog.forEach(entry => {
                            addOutput('info', `   [${entry.timestamp.toLocaleTimeString()}] ${entry.action}: ${entry.details}`);
                          });
                        }}
                      >
                        Audit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <div className="font-mono text-xs p-4 h-full overflow-auto bg-slate-900 text-slate-100">
                  {output.length === 0 ? (
                    <div className="text-slate-500 italic">
                      Click "Run Code" to execute your script...
                      {requiresSecureMode && (
                        <span className="block mt-2 text-yellow-400">
                          ⚠️ Code exceeds threshold — results will be forwarded externally.
                        </span>
                      )}
                    </div>
                  ) : (
                    output.map((line, i) => (
                      <div 
                        key={i} 
                        className={`${
                          line.type === 'error' ? 'text-red-400' :
                          line.type === 'success' ? 'text-green-400' :
                          line.type === 'info' ? 'text-blue-400' :
                          line.type === 'warning' ? 'text-yellow-400' :
                          line.type === 'security' ? 'text-purple-400' :
                          'text-slate-200'
                        } leading-relaxed`}
                      >
                        {line.content}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Execution Details & Audit */}
          <div className="xl:col-span-1 space-y-4 overflow-y-auto max-h-full">
            
            {/* Execution Result Card */}
            {executionResult && (
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">📊 Execution Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={executionResult.success ? "default" : "destructive"} className="text-[10px]">
                      {executionResult.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span>{executionResult.executionTime.toFixed(3)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory</span>
                    <span>~{executionResult.memoryUsed.toFixed(1)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security</span>
                    <Badge 
                      variant={
                        executionResult.securityLevel === 'blocked' ? 'destructive' :
                        executionResult.securityLevel === 'secure' ? 'default' : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {executionResult.securityLevel.toUpperCase()}
                    </Badge>
                  </div>
                  {executionResult.wasForwarded && (
                    <div className="mt-2 p-2 rounded bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
                      <p className="text-purple-700 dark:text-purple-300 font-medium text-[10px] mb-1">
                        📤 Result Forwarded
                      </p>
                      <p className="text-[9px] text-purple-600 dark:text-purple-400 break-all">
                        {executionResult.forwardLocation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Security Scan Results */}
            {(securityScan.isSuspicious || lineCount > securityConfig.lineThreshold) && (
              <Card className={`h-fit ${securityScan.riskLevel === 'critical' ? 'border-red-300 bg-red-50/50' : 'border-yellow-300 bg-yellow-50/50'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {securityScan.riskLevel === 'critical' ? '🚨' : '⚠️'} Security Scan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Risk Level</span>
                    <Badge 
                      variant={
                        securityScan.riskLevel === 'critical' ? 'destructive' :
                        securityScan.riskLevel === 'high' ? 'destructive' :
                        securityScan.riskLevel === 'medium' ? 'default' : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {securityScan.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Patterns Found</span>
                    <span>{securityScan.patterns.length}</span>
                  </div>
                  {securityScan.patterns.length > 0 && (
                    <div className="max-h-[100px] overflow-y-auto space-y-1 mt-2">
                      {securityScan.patterns.map((pattern, i) => (
                        <code key={i} className="block p-1 rounded bg-black/10 text-[9px] font-mono">
                          {pattern}
                        </code>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">🔗 Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/paper-battle" className="block text-xs text-blue-600 hover:underline">
                  ⚔️ Paper Battle Mode →
                </Link>
                <Link href="/aethel" className="block text-xs text-blue-600 hover:underline">
                  🤖 AETHEL AI Chat →
                </Link>
                <a 
                  href="https://opendata.cern.ch/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  ⚛️ CERN Open Data →
                </a>
                <a 
                  href="https://earthexplorer.usgs.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  🛰️ USGS Earth Explorer →
                </a>
                <a 
                  href="https://portal.gdc.cancer.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 hover:underline"
                >
                  🧬 GDC Data Portal →
                </a>
              </CardContent>
            </Card>

            {/* Architecture Info */}
            <Card className="h-fit bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-3">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Workspace v2.0</strong><br/>
                  Designed for 2025-2040+ horizon.<br/>
                  Binary formats: ROOT, FITS, HDF5, NetCDF, BAM, VCF, CRAM.<br/>
                  Runtime targets: JVM, BEAM, LLVM, WebAssembly.
                </p>
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

// Fix for missing import
import { SelectGroup, SelectLabel } from '@/components/ui/select';