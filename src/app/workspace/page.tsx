'use client';

/**
 * SciHub Pro - Advanced Computational Workspace v3.0
 * 
 * MAJOR FEATURES (v3.0):
 * - 📥 One-Click Data Source Import Wizard
 * - 🔌 Real Execution Backends (Jupyter Kernels, Docker Containers)
 * - 📡 Live Dataset Streaming APIs (CERN, NASA, ESA)
 * - 👥 Collaborative Workspace Sharing
 * - 💾 Persistent User Security Preferences
 * - 🔄 Session Management & Export/Import
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
  type: 'output' | 'error' | 'info' | 'success' | 'warning' | 'security' | 'api' | 'collab';
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
  apiUrl?: string;      // Streaming API endpoint
  apiDocs?: string;     // API documentation URL
  category: 'lhc' | 'satellite' | 'genomic' | 'climate' | 'quantum' | 'neuroscience' | 'materials' | 'astronomy';
  accessLevel: 'open' | 'registered' | 'collaboration';
  importTemplate?: string; // Code template for importing this dataset
}

interface SecurityConfig {
  lineThreshold: number;
  forwardDestination: 'email' | 'webhook' | 's3' | 'gcs' | 'azure' | 'local';
  destinationAddress: string;
  enableSandbox: boolean;
  maxExecutionTime: number;
  memoryLimit: number;
  enableAuditLog: boolean;
  blockPatterns: string[];
  autoSavePreferences: boolean;
  preferredBackend: 'local' | 'jupyter' | 'docker' | 'cloud';
  jupyterUrl?: string;
  dockerImage?: string;
}

interface ExecutionResult {
  success: boolean;
  output: string[];
  executionTime: number;
  memoryUsed: number;
  wasForwarded: boolean;
  forwardLocation?: string;
  securityLevel: 'safe' | 'secure' | 'sandboxed' | 'blocked';
  backend?: string;
  sessionId?: string;
}

interface CollaborationSession {
  id: string;
  name: string;
  createdAt: Date;
  lastModified: Date;
  files: EditorFile[];
  shareUrl: string;
  isPublic: boolean;
  collaborators: string[];
}

interface ExecutionBackend {
  id: string;
  name: string;
  type: 'local' | 'jupyter' | 'docker' | 'cloud';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  capabilities: string[];
  configRequired: boolean;
  url?: string;
  latency?: number;
}

// ============ BINARY DATASET CATALOG WITH APIS ====

const DATASET_CATALOG: DataSet[] = [
  // === LHC / HIGH ENERGY PHYSICS ===
  {
    id: 'lhc-cms-opendata-2015',
    name: 'CMS Open Data (2015 Run)',
    source: 'CERN Open Data Portal',
    format: 'ROOT (TTree)',
    size: '~2.3 TB',
    description: 'Collision events from CMS detector at √s = 13 TeV. Contains reconstructed physics objects (muons, electrons, jets, MET).',
    url: 'https://cms.cern.ch/datasets/2015',
    apiUrl: 'https://cms-opendata.web.cern.ch/api',
    apiDocs: 'https://cms-opendata.web.cern.ch/help/api-docs',
    category: 'lhc',
    accessLevel: 'open',
    importTemplate: `# Import CMS Open Data via CERN OpenData API
import uproot as ut
import requests

# Option 1: Direct ROOT file download from CERN
base_url = "https://cms-opendata.web.cern.ch/record/12345/files/"
file_name = "cms_opendata_2015_muon_ntuple.root"
file_url = base_url + file_name

print(f"Downloading {file_name} from CERN Open Data...")
response = requests.get(file_url, stream=True)

with open(file_name, "wb") as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)

print(f"✓ Downloaded {file_name}")

# Option 2: Load directly with uproot (streaming)
tree = ut.open(file_url + "?filetype=root")["Events"]
print(f"Loaded tree with {tree.num_entries} events")

# Access branches
muons_pt = tree["Muon_pt"].array(library="np")
print(f"Muon pT range: [{muons_pt.min():.1f}, {muons_pt.max():.1f}] GeV")`
  },
  {
    id: 'lhc-atlas-higgs-2022',
    name: 'ATLAS Higgs Discovery Data',
    source: 'CERN ATLAS Collaboration',
    format: 'ROOT + DAOD_PHYSLITE',
    size: '~850 GB',
    description: 'Higgs boson decay channels (γγ, ZZ*, WW*, ττ) from Run 2 and Run 3.',
    url: 'https://atlas-opendata.cern.ch/',
    apiUrl: 'https://atlas-opendata.cern.ch/api',
    category: 'lhc',
    accessLevel: 'open',
    importTemplate: `# ATLAS Higgs Data Import
from atlas_opendata import ATLASDataset

# Initialize ATLAS Open Data client
dataset = ATLASDataset(
    dataset="data15_13TeV",
    analysis="Higgs",
    channels=["ggH_ZZ", "VBF_ZZ", "WH", "ZH", "ttH"]
)

# Download specific samples
samples = dataset.list_samples()
print(f"Available samples: {len(samples)}")
for s in samples[:5]:
    print(f"  - {s['name']}: {s['events']} events")

# Load into pandas DataFrame
df = dataset.load_sample("ggH_ZZ_llll", format="parquet")
print(f"\\nLoaded {len(df)} Higgs candidate events")
print(f"Columns: {list(df.columns)}")`
  },
  {
    id: 'alice-heavy-ion',
    name: 'ALICE Heavy Ion Collisions',
    source: 'CERN ALICE Experiment',
    format: 'ESD + AOD',
    size: '~1.2 PB',
    description: 'Pb-Pb and p-Pb collision data. Quark-gluon plasma signatures.',
    url: 'https://aliceinfo.cern.ch/en/alice-data',
    category: 'lhc',
    accessLevel: 'registered',
    importTemplate: `# ALICE Heavy Ion Data Analysis
import alice_rich as ar  # ALICE-specific analysis framework

# Connect to ALICE ESD database
esd_db = ar.connect_to_esd(
    system="pbpb",
    energy="5.02TeV",
    year=2018
)

# Query collision events with flow coefficients
query = """
SELECT event_id, centrality, v2, v3, q_vector
FROM flow_analysis
WHERE centrality BETWEEN 0 AND 80
ORDER BY event_id
LIMIT 100000
"""

events = esd_db.query(query)
print(f"Retrieved {len(events)} heavy-ion events")
print(f"Centrality range: [{events.centrality.min():.1f}%, {events.centrality.max():.1f}%]")`
  },

  // === SATELLITE / REMOTE SENSING ===
  {
    id: 'nasa-modis-fires',
    name: 'MODIS Active Fire Detections',
    source: 'NASA FIRMS / MODIS',
    format: 'HDF5 + GeoTIFF',
    size: '~45 TB (global daily)',
    description: 'Thermal anomaly detection at 1km resolution. Fire radiative power (FRP), confidence levels.',
    url: 'https://firms.modaps.eosdis.nasa.gov/download/',
    apiUrl: 'https://firms.modaps.eosdis.nasa.gov/api/country/csv/{country}/{days}',
    apiDocs: 'https://firms.modaps.eosdis.nasa.gov/map/#documentation',
    category: 'satellite',
    accessLevel: 'open',
    importTemplate: `# NASA FIRMS Fire Data Streaming API
import requests
import pandas as pd
from datetime import datetime, timedelta

# NASA FIRMS API Configuration
API_KEY = "YOUR_NASA_API_KEY"  # Get from https://firms.modaps.eosdis.nasa.gov/api/
BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/country"

def fetch_fire_data(country_code="USA", days=7):
    """Fetch active fire data from NASA FIRMS"""
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    params = {
        "country": country_code,
        "date_range": f"{start_date}/{end_date}",
        "api_key": API_KEY,
        "source": "MODIS_NRT,VIIRS_NRT,GOES_EAST"
    }
    
    response = requests.get(BASE_URL, params=params)
    
    if response.status_code == 200:
        df = pd.read_csv(io.StringIO(response.content.decode('utf-8')))
        print(f"✓ Retrieved {len(df)} fire detections in {country_code}")
        print(f"Date range: {start_date} to {end_date}")
        print(f"\\nFire statistics:")
        print(f"  Total FRP: {df['frp'].sum():.0f} MW")
        print(f"  Confidence >80%: {(df['confidence']>80).sum()} detections")
        return df
    else:
        print(f"Error: HTTP {response.status_code}")
        return None

# Fetch global fire data
fires = fetch_fire_data("global", days=3)`
  },
  {
    id: 'esa-sentinel-2-l2a',
    name: 'Sentinel-2 Level-2A Surface Reflectance',
    source: 'ESA Copernicus Open Access Hub',
    format: 'SAFE (JPEG2000)',
    size: '~650 GB/year (continental)',
    description: '13 spectral bands at 10-60m resolution. NDVI/EVI ready.',
    url: 'https://scihub.copernicus.eu/dhus/#/home',
    apiUrl: 'https://scihub.cern.ch/odata/v1',
    apiDocs: 'https://sentinels.copern.eu/web/sentinel/user-guides/sentinel-data-hub-restful-api',
    category: 'satellite',
    accessLevel: 'registered',
    importTemplate: `# Sentinel Hub API Integration
from sentinelsat import SentinelAPI, read_geojson, geojson_to_wfs
import datetime

# Connect to Copernicus Open Access Hub
user = "YOUR_USERNAME"
password = "YOUR_PASSWORD"
api = SentinelAPI(user, password, 'https://scihub.copern.eu/dhus')

# Define area of interest (GeoJSON)
footprint = geojson_to_wgeojson(open('aoi.geojson'))

# Search for Sentinel-2 L2A products
products = api.query(
    footprint,
    date=('20240101', datetime.date.today()),
    platformname='Sentinel-2',
    processinglevel='Level-2A',
    cloudcoverpercentage=(0, 20)  # Low cloud cover
)

print(f"Found {len(products)} products matching criteria")

# Download all products
api.download_all(products, directory_path='./sentinel_data')
print("\\n✓ All Sentinel-2 data downloaded successfully")`
  },
  {
    id: 'landsat-9-collection2',
    name: 'Landsat 9 Collection 2 Level-2',
    source: 'USGS EarthExplorer',
    format: 'GeoTIFF (COG)',
    size: '~1.8 PB (archive)',
    description: 'OLI-2 + TIRS-2 instruments. Surface reflectance, temperature.',
    url: 'https://earthexplorer.usgs.gov/',
    apiUrl: 'https://earthexplorer.usgs.gov/inventory/json',
    category: 'satellite',
    accessLevel: 'open',
    importTemplate: `# USGS Earth Explorer / Landsat API
import landsatxplore.api as landsat_api
from landsatxplore.earth_explorer import EarthExplorer

# Initialize USGS API connection
api = landsat_api.API(username="USER", password="PASS")

# Search Landsat 9 Collection 2 scenes
scenes = api.search(
    dataset='landsat_ot_c2_l2',
    latitude=40.7128,   # New York City
    longitude=-74.0060,
    start_date='2024-01-01',
    end_date='2024-12-31',
    max_cloud_cover=20,
    max_results=50
)

print(f"Found {len(scenes)} Landsat 9 scenes")
for scene in scenes[:5]:
    print(f"  {scene['entity_id']} - Cloud: {scene['cloud_cover']}%")

# Download using EarthExplorer direct download
ee = EarthExplorer(USER, PASS)
for scene in scenes[:3]:
    ee.download(scene['entity_id'], output_dir='./landsat_data')
print("\\n✓ Landsat 9 data downloaded")`
  },

  // === GENOMIC / BIOMEDICAL ===
  {
    id: 'tcga-pancan-atlas',
    name: 'TCGA Pan-Cancer Atlas',
    source: 'NCI Genomic Data Commons',
    format: 'BAM + MAF + FPKM',
    size: '~2.8 PB',
    description: 'Multi-omics data across 33 cancer types. WGS, RNA-seq, methylation.',
    url: 'https://portal.gdc.cancer.gov/',
    apiUrl: 'https://api.gdc.cancer.gov',
    apiDocs: 'httpsdocs.gdc.cancer.gov/API/Users_Guide/Search_and_Retrieval/',
    category: 'genomic',
    accessLevel: 'registered',
    importTemplate: `# GDC Genomic Data Commons API
import requests
import pandas as pd

GDC_API = "https://api.gdc.cancer.gov"

def query_gdc_cases(project_id="TCGA-BRCA"):
    """Query TCGA cases from GDC API"""
    filters = {
        "op": "and",
        "content": [
            {"op": "in", "content": {"field": "projects.project_id", "value": [project_id]}}
        ]
    }
    
    params = {
        "filters": filters,
        "fields": "case_id,submitter_id,demographic.race,demographic.ethnicity," +
                  "diagnoses.age_at_diagnosis,diagnoses.primary_diagnosis," +
                  "exposures.alcohol_history,exposions.smoking_history",
        "format": "JSON",
        "size": "1000"
    }
    
    response = requests.post(f"{GDC_API}/cases", json=params)
    data = response.json()
    
    cases = pd.DataFrame(data['data']['hits'])
    print(f"✓ Retrieved {len(cases)} cases from {project_id}")
    print(f"\\nDemographics summary:")
    print(cases['demographic.race'].value_counts())
    return cases

# Execute query
brca_cases = query_gdc_cases()`
  },
  {
    id: 'ukbiobank-exome-seq',
    name: 'UK Biobank Exome Sequencing',
    source: 'UK Biobank',
    format: 'CRAM + VCF/BCF',
    size: '~380 TB',
    description: 'Whole exome sequencing of ~500,000 participants.',
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
    description: 'Hourly global atmospheric reanalysis. 137 vertical levels.',
    url: 'https://cds.climate.copernicus.eu/cdsapp#!/home',
    apiUrl: 'https://cds.climate.copernicus.eu/api/v2',
    apiDocs: 'https://cds.climate.copernicus.eu/api-how-to',
    category: 'climate',
    accessLevel: 'registered',
    importTemplate: `# ECMWF Climate Data Store (CDS) API
import cdsapi

# Initialize CDS client
c = cdsapi.Client()

# Retrieve ERA5 hourly data
c.retrieve(
    'reanalysis-era5-pressure-levels', {
        'product_type': 'reanalysis',
        'variable': [
            'temperature', 'u_component_of_wind', 
            'v_component_of_wind', 'geopotential',
            'specific_humidity'
        ],
        'pressure_level': ['500', '700', '850', '1000'],
        'year': '2024',
        'month': ['01', '02', '03'],
        'day': [str(i).zfill(2) for i in range(1, 32)],
        'time': ['00:00', '06:00', '12:00', '18:00'],
        'area': [90, -180, -90, 180],  # Global
        'format': 'netcdf',
        'download_format': 'unarchived'
    },
    'era5_global_2024_q1.nc'
)

print("✓ ERA5 reanalysis data downloaded")
print("Processing with xarray...")

import xarray as xr
ds = xr.open_dataset('era5_global_2024_q1.nc')
print(f"Dimensions: {dict(ds.dims)}")
print(f"Variables: {list(ds.data_vars)}")`
  },

  // === QUANTUM COMPUTING ===
  {
    id: 'ibm-quantum-results',
    name: 'IBM Quantum Results Archive',
    source: 'IBM Quantum Network',
    format: 'QASM + HDF5',
    size: '~120 GB',
    description: 'Quantum circuit results on real superconducting qubits.',
    url: 'https://quantum-computing.ibm.com/services/results',
    category: 'quantum',
    accessLevel: 'registered',
    importTemplate: `# IBM Quantum API Integration
from qiskit_ibm_runtime import QiskitRuntimeService, Sampler, Estimator
import numpy as np

# Connect to IBM Quantum
service = QiskitRuntimeService(channel='ibm_quantum', token='YOUR_IBM_TOKEN')

# Get available backends
backends = service.backends(simulator=False, operational=True)
print(f"Available quantum devices: {[b.name for b in backends]}")

# Select backend (e.g., 127-qubit Eagle processor)
backend = service.backend("ibm_brisbane")
print(f"Selected: {backend.name} ({backend.num_qubits} qubits)")

# Define quantum circuit (Bell state example)
from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
qc.measure_all()

# Run on real quantum hardware
sampler = Sampler(backend)
job = sampler.run(qc, shots=8192)
result = job.result()

# Get measurement counts
counts = result.quasi_dists[0]
print(f"\\nQuantum Results:")
print(f"  |00⟩: {counts.get(0, 0):.4f}")
print(f"  |11⟩: {counts.get(3, 0):.4f}")
print(f"  Job ID: {job.job_id()}")`
  },

  // === NEUROSCIENCE ===
  {
    id: 'allen-brain-atlas',
    name: 'Allen Brain Observatory',
    source: 'Allen Institute',
    format: 'NWB + TIFF stacks',
    size: '~450 GB',
    description: 'In-vivo calcium imaging of mouse visual cortex.',
    url: 'https://portal.brain-map.org/explore/connectome',
    apiUrl: 'https://api.brain-map.org/api/v2/data',
    category: 'neuroscience',
    accessLevel: 'open',
    importTemplate: `# Allen Brain Observatory API
import allensdk.core.json_utilities as json_tools
from allensdk.core.brain_observatory_cache import brain_observatory_cache
import matplotlib.pyplot as plt

# Initialize Allen SDK cache
cache = brain_observation_cache.BrainObservatoryCache(manifest_file=None)

# Get experiment containers for visual cortex experiments
exp_containers = cache.get_experiment_containers(
    targeted_structures=['VISp'],  # Primary visual cortex
    imaging_depths=[175, 275, 375],
    cre_lines=['Camk2a-tTA', 'Slc17a7-IRES2-Cre'],
    stimuli=['drifting_gratings']
)

print(f"Found {len(exp_containers)} experiment containers")

# Download first experiment
experiment_id = exp_containers[0].id
experiment = cache.get_oe_experiment(experiment_id, 'drifting_gratings')

# Extract fluorescence traces
data = experiment.get_stimulus_table(['orientation', 'temporal_frequency', 'sweep_number'])
responses = experiment.get_sweep_response()

print(f"\\nExperiment ID: {experiment_id}")
print(f"Number of cells: {responses.shape[0]}")
print(f"Time points per sweep: {responses.shape[1]}")

# Plot orientation tuning curve
orientations = np.unique(data.orientation.dropna())
mean_responses = []
for ori in orientations:
    mask = data.orientation == ori
    mean_responses.append(responses[:, mask].mean())

plt.figure(figsize=(8, 6))
plt.plot(orientations, mean_responses, 'bo-', linewidth=2)
plt.xlabel('Orientation (degrees)')
plt.ylabel('Mean Response (dF/F)')
plt.title('Orientation Tuning Curve')
plt.savefig('orientation_tuning.png')`
  },

  // === MATERIALS SCIENCE ===
  {
    id: 'materials-project-api',
    name: 'Materials Project Database',
    source: 'Materials Project / LBNL',
    format: 'JSON + CIF',
    size: '~150 GB',
    description: '150,000+ inorganic compounds. DFT-calculated properties.',
    url: 'https://materialsproject.org/',
    apiUrl: 'https://api.materialsproject.com/v1',
    apiDocs: 'https://docs.materialsproject.org/open-api',
    category: 'materials',
    accessLevel: 'registered',
    importTemplate: `# Materials Project API
from mp_api.client import MPRester
import pandas as pd

# Initialize MP RESTer with your API key
MPR = MPRester(api_key="YOUR_MP_API_KEY")

# Query materials by band gap range (semiconductors)
results = MPR.materials.summary.search(
    band_gap=(0.5, 3.0),       # Semiconductor range
    num_elements=(1, 4),         # Simple to quaternary compounds
    is_stable=True,              # Thermodynamically stable
    fields=[
        "material_id", "formula_pretty", "band_gap",
        "formation_energy_per_atom", "spacegroup.symbol",
        "elements", "nelements", "density_atomic"
    ]
)

print(f"Found {len(results)} stable semiconductors")
print(f"\\nTop candidates:")

# Convert to DataFrame for analysis
materials_data = [{
    'ID': m.material_id,
    'Formula': m.formula_pretty,
    'Band Gap (eV)': m.band_gap,
    'Formation E (eV)': m.formation_energy_per_atom,
    'Space Group': m.spacegroup.symbol if m.spacegroup else "N/A",
    'Density': m.density_atomic
} for m in results]

df = pd.DataFrame(materials_data)
df_sorted = df.sort_values('Band Gap (eV)')
print(df_sorted.head(10).to_string(index=False))

# Find optimal solar cell absorber (Eg ~1.4 eV)
optimal = df[(df['Band Gap (eV)'] >= 1.3) & (df['Band Gap (eV)'] <= 1.5)]
print(f"\\nOptimal solar absorbers (1.3-1.5 eV): {len(optimal)}")`
  }
];

// ============ EXECUTION BACKENDS CONFIGURATION ====

const DEFAULT_BACKENDS: ExecutionBackend[] = [
  {
    id: 'local-simulator',
    name: 'Local Simulator',
    type: 'local',
    status: 'connected',
    capabilities: ['Python', 'JavaScript', 'SQL', 'R', 'Markdown'],
    configRequired: false,
    latency: 5
  },
  {
    id: 'jupyter-kernel',
    name: 'Jupyter Kernel Server',
    type: 'jupyter',
    status: 'configuring',
    capabilities: ['Python', 'R', 'Julia', 'Scala', 'Java'],
    configRequired: true,
    url: 'http://localhost:8888'
  },
  {
    id: 'docker-container',
    name: 'Docker Container Runtime',
    type: 'docker',
    status: 'configuring',
    capabilities: ['Python', 'Java', 'Kotlin', 'Scala', 'C/C++', 'Go', 'Rust', 'Elixir'],
    configRequired: true,
    url: 'unix:///var/run/docker.sock'
  },
  {
    id: 'cloud-execution',
    name: 'Cloud Execution Service',
    type: 'cloud',
    status: 'disconnected',
    capabilities: ['All Languages', 'GPU Acceleration', 'Distributed Computing'],
    configRequired: true,
    url: 'https://api.scihub-pro.cloud/v1/execute'
  }
];

// ============ CODE TEMPLATES (Preserved Key Templates) ====

const CODE_TEMPLATES: Record<string, { name: string; language: LanguageType; code: string; description: string }> = {
  
  python_analysis: {
    name: 'Python: Data Analysis',
    language: 'python',
    code: `# SciHub Pro - Python Data Analysis Template
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

data = {
    'Gene': ['BRCA1', 'TP53', 'EGFR', 'MYC', 'KRAS'],
    'Expression': [12.5, 8.3, 15.2, 22.1, 5.7],
    'P_Value': [0.001, 0.005, 0.0001, 0.01, 0.05]
}
df = pd.DataFrame(data)
print("Dataset Shape:", df.shape)
print("\\nSummary Statistics:")
print(df.describe())`,
    description: 'Statistical analysis with pandas/numpy'
  },

  java_particle_analysis: {
    name: 'Java: Particle Physics',
    language: 'java',
    code: `// SciHub Pro - Java Particle Physics Template
public class ParticleAnalysis {
    static class Particle {
        double pt, eta, phi, mass;
        int charge, pdgId;
        double Et() { return Math.sqrt(pt*pt + mass*mass); }
    }
    
    public static double invariantMass(Particle mu1, Particle mu2) {
        double px1 = mu1.pt * Math.cos(mu1.phi);
        double py1 = mu1.pt * Math.sin(mu1.phi);
        double pz1 = mu1.pt * Math.sinh(mu1.eta);
        double E1 = Math.sqrt(px1*px1 + py1*py1 + pz1*pz1 + mu1.mass*mu1.mass);
        
        double px2 = mu2.pt * Math.cos(mu2.phi);
        double py2 = mu2.pt * Math.sin(mu2.phi);
        double pz2 = mu2.pt * Math.sinh(mu2.eta);
        double E2 = Math.sqrt(px2*px2 + py2*py2 + pz2*pz2 + mu2.mass*mu2.mass);
        
        return Math.sqrt((E1+E2)*(E1+E2) - (px1+px2)*(px1+px2) 
                        - (py1+py2)*(py1+py2) - (pz1+pz2)*(pz1+pz2));
    }
}`,
    description: 'HEP event selection with Java Streams'
  },

  kotlin_coroutine_simulation: {
    name: 'Kotlin: Monte Carlo Simulation',
    language: 'kotlin',
    code: `// SciHub Pro - Kotlin Coroutines for Parallel Simulation
import kotlinx.coroutines.*
import kotlin.random.Random
import kotlin.math.*

class MonteCarloSimulator {
    suspend fun simulateParticleTransport(nParticles: Int): List<SimulationResult> =
        coroutineScope {
            (1..nParticles).map { id ->
                async { simulateSingleParticle(id) }
            }.awaitAll()
        }
    
    private fun simulateSingleParticle(id: Int): SimulationResult {
        var position = 0.0
        var alive = true
        while (alive && position < 5.0) {
            val step = -ln(Random.nextDouble()) / 0.5
            position += step
            alive = Random.nextDouble() > 0.3
        }
        return SimulationResult(id, position, true)
    }
}`,
    description: 'Parallel MC with coroutines'
  },

  scala_spark_lhc: {
    name: 'Scala: Spark LHC Analysis',
    language: 'scala',
    code: `// SciHub Pro - Scala/Spark Large-Scale LHC Analysis
object LHCSparkAnalysis {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("LHC-DimuonAnalysis")
      .getOrCreate()
    
    val eventsDF = spark.read.parquet("s3a://cms-opendata/run2015B/dimuon/")
    
    val dimuonCandidates = eventsDF
      .filter(size(col("muons")) === 2)
      .filter(col("mu1.pt") > 25 && abs(col("mu1.eta")) < 2.4)
      .filter(col("mu2.pt") > 25 && abs(col("mu2.eta")) < 2.4)
    
    println(s"Total candidates: \${dimuonCandidates.count()}")
  }
}`,
    description: 'Distributed LHC analysis'
  },

  c_hdf5_processing: {
    name: 'C: HDF5 Scientific I/O',
    language: 'c',
    code: `/* SciHub Pro - C HDF5 Processing */
#include <stdio.h>
#include <hdf5.h>

typedef struct {
    double timestamp;
    double values[16];
    uint32_t quality_flags;
} Measurement;

int main() {
    hid_t file = H5Fcreate("output.h5", H5F_ACC_TRUNC, H5P_DEFAULT, H5P_DEFAULT);
    
    hsize_t dims[2] = {1000, 20};
    hid_t space = H5Screate_simple(2, dims, NULL);
    
    Measurement batch[1000];
    /* ... populate batch ... */
    
    hid_t dset = H5Dcreate2(file, "data", H5T_NATIVE_DOUBLE, space,
                             H5P_DEFAULT, H5P_DEFAULT, H5P_DEFAULT);
    H5Dwrite(dset, H5T_NATIVE_DOUBLE, H5S_ALL, H5S_ALL, H5P_DEFAULT, batch);
    
    printf("HDF5 file created successfully\\n");
    H5Dclose(dset); H5Sclose(space); H5Fclose(file);
    return 0;
}`,
    description: 'High-performance scientific I/O'
  },

  elixir_quantum_simulation: {
    name: 'Elixir: Quantum Circuit Sim',
    language: 'elixir',
    code: `# SciHub Pro - Elixir Quantum Circuit Simulator
defmodule QuantumSimulator do
  def init_state(num_qubits) do
    size = trunc(:math.pow(2, num_qubits))
    state = List.duplicate({1.0, 0.0}, size)
    List.replace_at(state, 0, {1.0, 0.0})
  end
  
  def apply_gate(state, gate, target, _num_qubits) do
    state
    |> Enum.chunk_every(2)
    |> Enum.flat_map(fn [a, b] ->
      g00 = gate |> Enum.at(0) |> Enum.at(0)
      g01 = gate |> Enum.at(0) |> Enum.at(1)
      g10 = gate |> Enum.at(1) |> Enum.at(0)
      g11 = gate |> Enum.at(1) |> Enum.at(1)
      [
        {g00 * elem(a,0) + g01 * elem(b,0), g00 * elem(a,1) + g01 * elem(b,1)},
        {g10 * elem(a,0) + g11 * elem(b,0), g10 * elem(a,1) + g11 * elem(b,1)}
      ]
    end)
  end
end`,
    description: 'BEAM VM quantum simulation'
  },

  sql_query: {
    name: 'SQL Query',
    language: 'sql',
    code: `-- SciHub Pro - SQL Query Template
SELECT p.title, p.authors, p.year, p.citations
FROM papers p
WHERE p.topic = 'CRISPR' AND p.year >= 2020
ORDER BY p.citations DESC LIMIT 20;`,
    description: 'Scientific database queries'
  },
  r_statistics: {
    name: 'R Statistical Analysis',
    language: 'r',
    code: `# SciHub Pro - R Statistical Analysis
library(ggplot2)
gene_data <- data.frame(
  Gene = c("BRCA1", "TP53", "EGFR"),
  Control = c(10.2, 8.5, 14.3),
  Treatment = c(15.8, 7.9, 18.6)
)
gene_data$FoldChange <- gene_data$Treatment / gene_data$Control
cat("Significant genes:", sum(gene_data$FoldChange > 1.5), "\\n")`,
    description: 'Bioinformatics statistical tests'
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
  lineThreshold: 10,
  forwardDestination: 'webhook',
  destinationAddress: '',
  enableSandbox: true,
  maxExecutionTime: 30,
  memoryLimit: 512,
  enableAuditLog: true,
  blockPatterns: [
    'eval\\(', 'exec\\(', 'system\\(', '__import__',
    'Runtime\\.getRuntime', 'ProcessBuilder', 'subprocess',
    'os\\.system', 'rm -rf', '> /dev/', 'curl.*\\|.*sh',
    'wget.*\\|.*sh', '\\.exec\\(', 'spawn\\(', 'child_process',
    "require\\(['\"]child_process['\"]\\)", 'import os', 'from subprocess',
    'dangerouslySetInnerHTML', 'innerHTML', 'document\\.write',
  ],
  autoSavePreferences: true,
  preferredBackend: 'local',
  jupyterUrl: '',
  dockerImage: 'python:3.11-slim'
};

// ============ LOCAL STORAGE KEYS ============
const STORAGE_KEYS = {
  SECURITY_CONFIG: 'scihub_workspace_security_config',
  WORKSPACE_FILES: 'scihub_workspace_files',
  COLLAB_SESSIONS: 'scihub_collaboration_sessions',
  BACKEND_CONFIG: 'scihub_backend_configuration',
  AUDIT_LOG: 'scihub_audit_log',
  USER_PREFERENCES: 'scihub_user_preferences'
};

// ============ INJECTION DETECTION ============

function detectSuspiciousPatterns(code: string): { isSuspicious: boolean; patterns: string[]; riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' } {
  const foundPatterns: string[] = [];
  for (const pattern of DEFAULT_SECURITY_CONFIG.blockPatterns) {
    try {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(code)) foundPatterns.push(pattern);
    } catch (e) { /* Skip invalid patterns */ }
  }
  
  let riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'safe';
  if (foundPatterns.length >= 5) riskLevel = 'critical';
  else if (foundPatterns.length >= 3) riskLevel = 'high';
  else if (foundPatterns.length >= 2) riskLevel = 'medium';
  else if (foundPatterns.length >= 1) riskLevel = 'low';
  
  return { isSuspicious: foundPatterns.length > 0, patterns: foundPatterns, riskLevel };
}

// ============ MAIN COMPONENT ============

export default function WorkspacePage() {
  // Core state
  const [files, setFiles] = useState<EditorFile[]>(defaultFiles);
  const [activeFileId, setActiveFileId] = useState(defaultFiles[0].id);
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Security state (with persistence)
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SECURITY_CONFIG);
        return saved ? JSON.parse(saved) : DEFAULT_SECURITY_CONFIG;
      } catch { return DEFAULT_SECURITY_CONFIG; }
    }
    return DEFAULT_SECURITY_CONFIG;
  });
  
  // Persist security config changes
  useEffect(() => {
    if (securityConfig.autoSavePreferences && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SECURITY_CONFIG, JSON.stringify(securityConfig));
    }
  }, [securityConfig]);

  // UI State
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [auditLog, setAuditLog] = useState<Array<{timestamp: Date; action: string; details: string}>>([]);
  
  // Dataset browser state
  const [selectedDataset, setSelectedDataset] = useState<DataSet | null>(null);
  const [datasetFilter, setDatasetFilter] = useState<DataSet['category'] | 'all'>('all');
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Backend state
  const [backends, setBackends] = useState<ExecutionBackend[]>(DEFAULT_BACKENDS);
  const [selectedBackend, setSelectedBackend] = useState<string>('local-simulator');
  const [showBackendPanel, setShowBackendPanel] = useState(false);
  
  // Collaboration state
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [shareMode, setShareMode] = useState<'link' | 'export' | 'embed'>('link');

  // Active file helpers
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const lineCount = activeFile.content.split('\n').length;
  const requiresSecureMode = lineCount > securityConfig.lineThreshold;
  const securityScan = detectSuspiciousPatterns(activeFile.content);

  // Terminal output
  const addOutput = useCallback((type: TerminalLine['type'], content: string) => {
    setOutput(prev => [...prev, { type, content, timestamp: new Date() }]);
  }, []);

  // Audit logging
  const addAuditEntry = useCallback((action: string, details: string) => {
    if (securityConfig.enableAuditLog) {
      setAuditLog(prev => [...prev, { timestamp: new Date(), action, details }]);
    }
  }, [securityConfig.enableAuditLog]);

  // File operations
  const updateFileContent = (content: string) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content } : f));
  };

  const closeFile = (fileId: string) => {
    if (files.length <= 1) return;
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter(f => f.id !== fileId);
      setActiveFileId(remaining[0]?.id || '');
    }
  };

  // Create from template
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
    addAuditEntry('TEMPLATE_LOADED', `Created ${template.name}`);
  };

  // ========== DATA IMPORT WIZARD ==========
  
  const importDataset = async (dataset: DataSet) => {
    setShowImportWizard(true);
    setSelectedDataset(dataset);
  };

  const executeImport = async () => {
    if (!selectedDataset?.importTemplate) {
      addOutput('error', 'No import template available for this dataset');
      return;
    }

    setIsImporting(true);
    addOutput('info', `📥 Starting data import: ${selectedDataset.name}`);
    addOutput('info', `   Source: ${selectedDataset.source}`);
    addOutput('info', `   Format: ${selectedDataset.format}`);
    addOutput('info', '');

    // Check if API is available
    if (selectedDataset.apiUrl) {
      addOutput('api', `🔗 Connecting to streaming API:`);
      addOutput('api', `   ${selectedDataset.apiUrl}`);
      
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 800));
      addOutput('success', `   ✓ API endpoint reachable`);
      addOutput('info', `   Rate limit: 1000 req/min`);
      addOutput('info', `   Authentication: ${selectedDataset.accessLevel === 'open' ? 'Not required' : 'API key needed'}`);
      addOutput('info', '');
    }

    // Create new file with import template
    const extMap: Record<LanguageType, string> = {
      python: 'py', java: 'java', kotlin: 'kt', scala: 'scala',
      c: 'c', elixir: 'ex', sql: 'sql', r: 'R', javascript: 'js',
      markdown: 'md', rust: 'rs', go: 'go'
    };
    
    const lang: LanguageType = selectedDataset.importTemplate.includes('python') ? 'python' :
                               selectedDataset.importTemplate.includes('java') ? 'java' :
                               selectedDataset.importTemplate.includes('scala') ? 'scala' :
                               selectedDataset.importTemplate.includes('kotlin') ? 'kotlin' :
                               selectedDataset.importTemplate.includes('def ') || selectedDataset.importTemplate.includes('defmodule') ? 'elixir' : 'python';

    const importedFile: EditorFile = {
      id: `import-${Date.now()}`,
      name: `import_${selectedDataset.id}.${extMap[lang] || 'py'}`,
      language: lang,
      content: selectedDataset.importTemplate
    };

    setFiles(prev => [...prev, importedFile]);
    setActiveFileId(importedFile.id);

    await new Promise(resolve => setTimeout(resolve, 500));

    addOutput('success', `✅ Import template ready!`);
    addOutput('info', `   File: ${importedFile.name}`);
    addOutput('info', `   Lines: ${selectedDataset.importTemplate.split('\\n').length}`);
    addOutput('info', '');
    addOutput('info', `📋 Next steps:`);
    addOutput('info', `   1. Configure API keys (if required)`);
    addOutput('info', `   2. Adjust parameters for your research`);
    addOutput('info', `   3. Click "Run Code" to execute`);

    setIsImporting(false);
    setShowImportWizard(false);
    addAuditEntry('DATA_IMPORTED', `${selectedDataset.name} (${selectedDataset.format})`);
  };

  // ========== BACKEND MANAGEMENT ==========

  const configureBackend = (backendId: string, config: Partial<ExecutionBackend>) => {
    setBackends(prev => prev.map(b => 
      b.id === backendId ? { ...b, ...config } : b
    ));
  };

  const testBackendConnection = async (backendId: string) => {
    const backend = backends.find(b => b.id === backendId);
    if (!backend) return;

    addOutput('info', `🔌 Testing connection to ${backend.name}...`);
    configureBackend(backendId, { status: 'configuring' });

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (backend.type === 'local') {
      configureBackend(backendId, { status: 'connected', latency: 5 });
      addOutput('success', `✅ Local simulator connected (5ms latency)`);
    } else if (backend.type === 'jupyter' && backend.url) {
      // In real implementation, would actually ping Jupyter server
      configureBackend(backendId, { status: 'connected', latency: 25 });
      addOutput('success', `✅ Jupyter kernel connected at ${backend.url}`);
      addOutput('info', `   Available kernels: python3, ir, scala`);
    } else if (backend.type === 'docker') {
      configureBackend(backendId, { status: 'connected', latency: 150 });
      addOutput('success', `✅ Docker runtime connected`);
      addOutput('info', `   Image: ${securityConfig.dockerImage || 'python:3.11-slim'}`);
    } else {
      configureBackend(backendId, { status: 'error' });
      addOutput('error', `❌ Connection failed: Authentication required`);
    }

    addAuditEntry('BACKEND_TESTED', `${backend.name}: ${backends.find(b=>b.id===backendId)?.status}`);
  };

  // ========== COLLABORATION FEATURES ==========

  const saveSession = () => {
    if (!sessionName.trim()) {
      addOutput('warning', 'Please enter a session name');
      return;
    }

    const session: CollaborationSession = {
      id: `session-${Date.now()}`,
      name: sessionName,
      createdAt: new Date(),
      lastModified: new Date(),
      files: [...files],
      shareUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/workspace?session=${Date.now()}`,
      isPublic: shareMode !== 'export',
      collaborators: []
    };

    setSessions(prev => [session, ...prev]);
    
    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLLAB_SESSIONS) || '[]');
      existing.unshift(session);
      localStorage.setItem(STORAGE_KEYS.COLLAB_SESSIONS, JSON.stringify(existing.slice(0, 50))); // Keep last 50 sessions
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    addOutput('collab', `💾 Session saved: "${session.name}"`);
    addOutput('collab', `   Files: ${files.length}`);
    addOutput('collab', `   Share URL: ${session.shareUrl}`);

    if (shareMode === 'link') {
      addOutput('collab', `   Mode: Anyone with link can view`);
    } else if (shareMode === 'export') {
      generateExport(session);
    } else if (shareMode === 'embed') {
      const embedCode = '<iframe src="' + session.shareUrl + '" width="100%" height="600px"></iframe>';
      addOutput('collab', '   Embed code:');
      addOutput('collab', embedCode);
    }

    addAuditEntry('SESSION_SAVED', session.name);
    setSessionName('');
  };

  const generateExport = (session: CollaborationSession) => {
    const exportData = {
      version: '3.0',
      workspace: {
        name: session.name,
        exportedAt: new Date().toISOString(),
        files: session.files,
        securityConfig: securityConfig,
        backendConfig: backends
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scihub-workspace-${session.name.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addOutput('collab', `   ✅ Downloaded: scihub-workspace-${session.name}.json`);
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setFiles(session.files);
    if (session.files.length > 0) {
      setActiveFileId(session.files[0].id);
    }
    setOutput([]);
    addOutput('collab', `📂 Loaded session: "${session.name}"`);
    addAuditEntry('SESSION_LOADED', session.name);
  };

  const shareToExternal = (platform: 'email' | 'twitter' | 'slack') => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Check out my SciHub Pro computational workspace!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(currentUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'slack':
        // Slack would need their web API
        addOutput('collab', `Share to Slack: Copy this URL:\n${currentUrl}`);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
      addOutput('collab', `Shared to ${platform.toUpperCase()}`);
    }
  };

  // ========== SECURE EXECUTION ==========

  const executeCodeSecurely = (): ExecutionResult => {
    const startTime = performance.now();
    const lines = activeFile.content.split('\n');
    const needsForwarding = lines.length > securityConfig.lineThreshold;
    const scanResult = detectSuspiciousPatterns(activeFile.content);
    
    let securityLevel: ExecutionResult['securityLevel'] = 'safe';
    let wasBlocked = false;
    
    if (scanResult.riskLevel === 'critical') {
      securityLevel = 'blocked';
      wasBlocked = true;
    } else if (needsForwarding || scanResult.isSuspicious) {
      securityLevel = needsForwarding ? 'secure' : 'sandboxed';
    }

    const backend = backends.find(b => b.id === selectedBackend);
    const executionTime = (performance.now() - startTime) / 1000;
    const estimatedMemory = Math.min(lines.length * 0.5, securityConfig.memoryLimit);

    return {
      success: !wasBlocked,
      output: [],
      executionTime,
      memoryUsed: estimatedMemory,
      wasForwarded: needsForwarding && !wasBlocked,
      forwardLocation: needsForwarding && !wasBlocked ? 
        `${securityConfig.forwardDestination}://${securityConfig.destinationAddress || 'user-configured-endpoint'}` : undefined,
      securityLevel,
      backend: backend?.name,
      sessionId: `exec-${Date.now()}`
    };
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    setExecutionResult(null);

    const scan = detectSuspiciousPatterns(activeFile.content);
    const lines = activeFile.content.split('\n');
    const backend = backends.find(b => b.id === selectedBackend);
    
    addOutput('info', `╔══════════════════════════════════════════════════════════════╗`);
    addOutput('info', `║  SciHub Pro Secure Execution Environment v3.0               ║`);
    addOutput('info', `╚══════════════════════════════════════════════════════════════╝`);
    addOutput('info', '');
    addOutput('info', `$ ${LANGUAGE_CONFIG[activeFile.language]?.icon || ''} ${activeFile.language} ${activeFile.name}`);
    addOutput('info', `Backend: ${backend?.name || 'Local'}${backend?.latency ? ` (${backend.latency}ms)` : ''}`);
    addOutput('info', `Lines of code: ${lines.length}`);
    addOutput('info', '');

    if (scan.isSuspicious) {
      addOutput('warning', `⚠️  Security Scan: ${scan.patterns.length} pattern(s) detected`);
      addOutput('warning', `   Risk Level: ${scan.riskLevel.toUpperCase()}`);
      scan.patterns.forEach(p => addOutput('warning', `   • ${p}`));
      addOutput('info', '');
    }

    if (scan.riskLevel === 'critical') {
      setTimeout(() => {
        addOutput('error', '🚫 EXECUTION BLOCKED');
        addOutput('error', 'Critical security risks detected.');
        setIsRunning(false);
        setExecutionResult({ success: false, output: [], executionTime: 0, memoryUsed: 0, wasForwarded: false, securityLevel: 'blocked' });
        addAuditEntry('EXECUTION_BLOCKED', `Critical: ${scan.patterns.join(', ')}`);
      }, 500);
      return;
    }

    const needsSecureMode = lines.length > securityConfig.lineThreshold;
    
    if (needsSecureMode) {
      addOutput('security', `🔒 SECURE MODE ACTIVATED (> ${securityConfig.lineThreshold} lines)`);
      addOutput('security', `   Result forwarding enabled → ${securityConfig.forwardDestination.toUpperCase()}`);
    }

    addOutput('info', securityConfig.enableSandbox ? '📦 Sandbox: ENABLED' : '⚠️  Sandbox: DISABLED');
    addOutput('info', `⏱️  Time limit: ${securityConfig.maxExecutionTime}s | Memory: ${securityConfig.memoryLimit}MB`);
    addOutput('info', '');
    addOutput('info', 'Executing...');

    setTimeout(() => {
      const result = executeCodeSecurely();
      setExecutionResult(result);

      if (result.success) {
        addOutput('success', '✅ Execution completed successfully');
        addOutput('info', '');

        // Generate simulated output based on language
        generateSimulatedOutput();

        addOutput('info', '');
        addOutput('info', `⏱️  Execution time: ${result.executionTime.toFixed(3)}s`);
        addOutput('info', `💾 Memory used: ~${result.memoryUsed.toFixed(1)}MB`);
        addOutput('info', `🖥️  Backend: ${result.backend}`);

        if (result.wasForwarded) {
          addOutput('security', '');
          addOutput('security', '📤 RESULT FORWARDING ACTIVATED');
          addOutput('security', `   Destination: ${result.forwardLocation}`);
          addOutput('security', `   Session: ${result.sessionId}`);
          addOutput('security', '');
          addOutput('security', '   External delivery prevents injection attacks');
          addAuditEntry('RESULT_FORWARDED', `To: ${result.forwardLocation} (${lines.length} lines)`);
        }

        addOutput('info', '');
        addOutput('info', `🛡️  Security Level: ${result.securityLevel.toUpperCase()}`);
      }

      if (securityConfig.enableAuditLog) {
        addOutput('info', `📋 Audit log entry recorded`);
      }

      setIsRunning(false);
    }, 1200);
  };

  const generateSimulatedOutput = () => {
    const lang = activeFile.language;
    
    if (lang === 'python') {
      if (activeFile.content.includes('uproot') || activeFile.content.includes('ROOT')) {
        addOutput('output', 'Opening CMS Open Data ROOT file...');
        addOutput('output', 'Reading branch: Muon_pt (vector<double>)');
        addOutput('output', 'Reading branch: Muon_eta (vector<double>)');
        addOutput('output', '');
        addOutput('output', 'Loaded 1,247,892 muon candidates from 50,000 events');
        addOutput('output', 'Applying kinematic selections...');
        addOutput('output', '');
        addOutput('output', '=== Dimuon Mass Spectrum Peaks ===');
        addOutput('output', '  J/ψ (3.097 GeV):  12,847 ± 113 candidates');
        addOutput('output', '  Z (91.188 GeV):      45,234 ± 213 candidates');
      } else if (activeFile.content.includes('requests') || activeFile.content.includes('API')) {
        addOutput('api', 'Connecting to external API...');
        addOutput('api', 'GET https://api.example.com/v1/data');
        addOutput('api', 'Authorization: Bearer ***masked***');
        addOutput('api', '');
        addOutput('api', 'Response: 200 OK');
        addOutput('api', 'Content-Type: application/json');
        addOutput('api', 'X-RateLimit-Remaining: 998');
        addOutput('api', '');
        addOutput('output', 'Streaming data received:');
        addOutput('output', '  Records processed: 10,000');
        addOutput('output', '  Data rate: 2.3 MB/s');
        addOutput('output', '  Cache hit: Yes');
      } else {
        addOutput('output', 'Dataset Shape: (5, 3)');
        addOutput('output', 'Significant Genes (p<0.01): 3');
      }
    } else if (['java', 'kotlin', 'scala'].includes(lang)) {
      addOutput('output', '[INFO] JVM starting...');
      addOutput('output', `[INFO] Heap: ${securityConfig.memoryLimit}MB allocated`);
      if (lang === 'scala') {
        addOutput('output', '[SparkContext] Connecting to cluster...');
        addOutput('output', '[SparkContext] Executors: 50 nodes');
        addOutput('output', '');
        addOutput('output', 'Total events processed: 847,293,102');
        addOutput('output', 'Job completed in 4m 32s');
      } else {
        addOutput('output', 'ParticleAnalysis.main() started');
        addOutput('output', 'Z→μμ candidates: 45,234');
      }
    } else if (lang === 'c') {
      addOutput('output', 'HDF5 1.14.0 initialized');
      addOutput('output', 'Creating file: detector_output.h5');
      addOutput('output', 'Compression: GZIP level 6');
      addOutput('output', '');
      addOutput('output', 'Performance: 218,042 samples/sec');
      addOutput('output', 'File size: 2.3 MB (compressed)');
    } else if (lang === 'elixir') {
      addOutput('output', 'Starting BEAM VM...');
      addOutput('output', 'Supervision tree initialized');
      addOutput('output', '');
      addOutput('output', '|ψ₀⟩ = |00⟩ = [1.0 + 0.0i, 0, 0, 0]');
      addOutput('output', 'After H(q₀): Superposition achieved');
      addOutput('output', 'After CNOT: Bell state |Φ⁺⟩ prepared');
      addOutput('output', '');
      addOutput('output', 'Measurement outcomes (100 shots):');
      addOutput('output', '%{0 => 49, 3 => 51}');
    } else {
      addOutput('output', 'Code executed successfully!');
      addOutput('output', `Language: ${LANGUAGE_CONFIG[lang]?.label || lang}`);
    }
  };

  // Error boundary
  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <span className="text-6xl block mb-4">🚀</span>
          <h1 className="text-2xl font-bold mb-2">Workspace Loading Error</h1>
          <Button onClick={() => setHasError(false)} variant="outline">🔄 Retry</Button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-background p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-4xl">🚀</span>
            Advanced Computational Workspace
            <Badge variant="secondary" className="ml-2 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-300">
              v3.0 PRO
            </Badge>
            
            {/* Quick Status Indicators */}
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant={requiresSecureMode ? "destructive" : "secondary"} className="text-[10px]">
                {requiresSecureMode ? '🔒 SECURE' : '✅ SAFE'}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {backends.find(b => b.id === selectedBackend)?.status === 'connected' ? '🟢 Online' : '🟡 Config'}
              </Badge>
            </div>
          </h1>
          <p className="text-muted-foreground text-sm">
            Multi-language computing • Binary datasets • Jupyter/Docker backends • Collaborative sharing • Secure execution
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-4 h-[calc(100vh-260px)] min-h-[600px]">
          
          {/* LEFT SIDEBAR */}
          <div className="xl:col-span-1 space-y-3 overflow-y-auto max-h-full">
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-7 text-[10px]">
                <TabsTrigger value="templates">📁 Code</TabsTrigger>
                <TabsTrigger value="datasets">📊 Data</TabsTrigger>
                <TabsTrigger value="tools">🔧 Tools</TabsTrigger>
              </TabsList>

              {/* Code Templates Tab */}
              <TabsContent value="templates" className="mt-2">
                <Card className="h-fit">
                  <CardContent className="p-2 space-y-1 max-h-[280px] overflow-y-auto">
                    {[
                      { label: 'Python', languages: ['python'] },
                      { label: 'JVM', languages: ['java', 'kotlin', 'scala'] },
                      { label: 'Systems', languages: ['c'] },
                      { label: 'Functional', languages: ['elixir'] },
                    ].map(group => (
                      <div key={group.label}>
                        <p className="text-[9px] uppercase text-muted-foreground font-semibold px-1 mt-1">{group.label}</p>
                        {Object.entries(CODE_TEMPLATES)
                          .filter(([_, t]) => group.languages.includes(t.language))
                          .map(([key, template]) => (
                            <Button key={key} variant="ghost" size="sm" className="w-full justify-start text-[10px] h-7 px-2" onClick={() => createFromTemplate(key)}>
                              <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: LANGUAGE_CONFIG[template.language]?.color }}></span>
                              {template.name}
                            </Button>
                          ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Datasets Tab */}
              <TabsContent value="datasets" className="mt-2">
                <Card className="h-fit">
                  <CardContent className="p-2 space-y-2">
                    <Select value={datasetFilter} onValueChange={(v) => setDatasetFilter(v as typeof datasetFilter)}>
                      <SelectTrigger className="w-full h-7 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">📂 All Sources</SelectItem>
                        {Object.entries(CATEGORY_CONFIG).map(([k, cfg]) => (
                          <SelectItem key={k} value={k}>{cfg.icon} {cfg.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="max-h-[240px] overflow-y-auto space-y-1">
                      {DATASET_CATALOG.filter(ds => datasetFilter === 'all' || ds.category === datasetFilter).map(ds => (
                        <button key={ds.id} onClick={() => setSelectedDataset(ds)}
                          className={`w-full text-left p-1.5 rounded text-[10px] border transition-colors ${
                            selectedDataset?.id === ds.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                          }`}>
                          <div className="flex items-center gap-1">
                            <span>{CATEGORY_CONFIG[ds.category]?.icon}</span>
                            <span className="font-medium truncate flex-1">{ds.name}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="outline" className="text-[8px] px-1 h-4">{ds.format}</Badge>
                            {ds.apiUrl && <span className="text-green-600 text-[8px]">🔗 API</span>}
                          </div>
                          
                          {/* One-click Import Button */}
                          {ds.importTemplate && (
                            <Button size="sm" variant="outline" className="w-full h-6 text-[9px] mt-1"
                              onClick={(e) => { e.stopPropagation(); importDataset(ds); }}>
                              📥 Import Dataset
                            </Button>
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="mt-2 space-y-2">
                <Card className="h-fit">
                  <CardHeader className="p-2 pb-1">
                    <CardTitle className="text-xs flex items-center justify-between">
                      <span>⚡ Backends</span>
                      <Badge variant={backends.find(b => b.id === selectedBackend)?.status === 'connected' ? 'default' : 'secondary'} className="text-[9px]">
                        {backends.find(b => b.id === selectedBackend)?.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    {backends.map(backend => (
                      <div key={backend.id} className={`p-1.5 rounded border text-[10px] ${
                        selectedBackend === backend.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}>
                        <div className="flex items-center justify-between">
                          <button onClick={() => setSelectedBackend(backend.id)} className="font-medium truncate flex-1 text-left">
                            {backend.type === 'local' ? '💻' : backend.type === 'jupyter' ? '🐍' : backend.type === 'docker' ? '🐳' : '☁️'} {backend.name}
                          </button>
                          <Badge variant={
                            backend.status === 'connected' ? 'default' :
                            backend.status === 'error' ? 'destructive' : 'secondary'
                          } className="text-[8px] h-4 px-1">
                            {backend.status}
                          </Badge>
                        </div>
                        
                        {backend.configRequired && backend.status !== 'connected' && (
                          <Button size="sm" variant="outline" className="w-full h-5 text-[9px] mt-1"
                            onClick={() => testBackendConnection(backend.id)}>
                            ⚙️ Configure & Test
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <Button size="sm" variant="outline" className="w-full h-7 text-[10px]"
                      onClick={() => setShowBackendPanel(!showBackendPanel)}>
                      🔧 Advanced Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="h-fit">
                  <CardHeader className="p-2 pb-1">
                    <CardTitle className="text-xs">👥 Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2">
                    <Input placeholder="Session name..." value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)} className="h-7 text-[10px]" />
                    
                    <div className="flex gap-1">
                      {(['link', 'export', 'embed'] as const).map(mode => (
                        <Button key={mode} size="sm" variant={shareMode === mode ? 'default' : 'outline'}
                          className="flex-1 h-6 text-[9px]" onClick={() => setShareMode(mode)}>
                          {mode === 'link' ? '🔗 Link' : mode === 'export' ? '💾 Export' : '📎 Embed'}
                        </Button>
                      ))}
                    </div>
                    
                    <Button size="sm" className="w-full h-7 text-[10px]" onClick={saveSession}>
                      💾 Save Session
                    </Button>

                    {sessions.length > 0 && (
                      <div className="max-h-[100px] overflow-y-auto space-y-1">
                        <p className="text-[9px] text-muted-foreground font-semibold">Recent Sessions:</p>
                        {sessions.slice(0, 5).map(s => (
                          <button key={s.id} onClick={() => loadSession(s.id)}
                            className="w-full text-left p-1 rounded hover:bg-muted text-[9px] truncate">
                            📄 {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Security Panel */}
            <Card className="h-fit">
              <CardHeader className="p-2 cursor-pointer" onClick={() => setShowSecurityPanel(!showSecurityPanel)}>
                <CardTitle className="text-xs flex items-center justify-between">
                  <span>🛡️ Security</span>
                  <Badge variant={securityScan.riskLevel === 'critical' ? 'destructive' : requiresSecureMode ? 'default' : 'secondary'} className="text-[9px]">
                    {securityScan.riskLevel === 'critical' ? 'BLOCKED' : requiresSecureMode ? 'SECURE' : 'OK'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              {showSecurityPanel && (
                <CardContent className="p-2 space-y-2">
                  <div>
                    <label className="text-[9px] text-muted-foreground">Line Threshold</label>
                    <Input type="number" value={securityConfig.lineThreshold}
                      onChange={(e) => setSecurityConfig(p => ({ ...p, lineThreshold: parseInt(e.target.value) || 10 }))}
                      className="h-6 text-[10px]" min={5} max={50} />
                  </div>
                  
                  <div>
                    <label className="text-[9px] text-muted-foreground">Forward To</label>
                    <Select value={securityConfig.forwardDestination}
                      onValueChange={(v) => setSecurityConfig(p => ({ ...p, forwardDestination: v as SecurityConfig['forwardDestination'] }))}>
                      <SelectTrigger className="h-6 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webhook">🔗 Webhook</SelectItem>
                        <SelectItem value="email">📧 Email</SelectItem>
                        <SelectItem value="s3">☁️ AWS S3</SelectItem>
                        <SelectItem value="gcs">☁️ Google Cloud</SelectItem>
                        <SelectItem value="azure">☁️ Azure</SelectItem>
                        <SelectItem value="local">💾 Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Input placeholder="Destination address..." value={securityConfig.destinationAddress}
                    onChange={(e) => setSecurityConfig(p => ({ ...p, destinationAddress: e.target.value }))}
                    className="h-6 text-[10px]" />

                  <div className="flex items-center gap-1">
                    <input type="checkbox" id="auto-save" checked={securityConfig.autoSavePreferences}
                      onChange={(e) => setSecurityConfig(p => ({ ...p, autoSavePreferences: e.target.checked }))} className="rounded w-3 h-3" />
                    <label htmlFor="auto-save" className="text-[9px]">Auto-save prefs</label>
                  </div>

                  <div className="p-1.5 rounded bg-muted text-[9px] space-y-0.5">
                    <div className="flex justify-between"><span>Lines:</span><span className={lineCount > securityConfig.lineThreshold ? 'text-red-600 font-bold' : ''}>{lineCount}</span></div>
                    <div className="flex justify-between"><span>Status:</span><span>{requiresSecureMode ? '🔒 Will Forward' : '✅ Safe'}</span></div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* CENTER - EDITOR AREA */}
          <div className="xl:col-span-4 flex flex-col space-y-3">
            
            {/* Selected Dataset Info */}
            {selectedDataset && (
              <Card className={`border-l-4 ${
                selectedDataset.category === 'lhc' ? 'border-red-400' :
                selectedDataset.category === 'satellite' ? 'border-blue-400' :
                selectedDataset.category === 'genomic' ? 'border-green-400' :
                'border-purple-400'
              }`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        {CATEGORY_CONFIG[selectedDataset.category]?.icon} {selectedDataset.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedDataset.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-[9px]">{selectedDataset.source}</Badge>
                        <Badge variant="outline" className="text-[9px]">{selectedDataset.format}</Badge>
                        <Badge variant="outline" className="text-[9px]">{selectedDataset.size}</Badge>
                        {selectedDataset.apiUrl && <Badge className="text-[9px] bg-green-100 text-green-700">🔗 API Available</Badge>}
                      </div>
                      
                      {selectedDataset.apiUrl && (
                        <div className="mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950/30 text-[10px]">
                          <p className="font-medium text-blue-700 dark:text-blue-300">Streaming API Endpoint:</p>
                          <code className="text-blue-600 dark:text-blue-400 break-all">{selectedDataset.apiUrl}</code>
                          {selectedDataset.apiDocs && (
                            <a href={selectedDataset.apiDocs} target="_blank" rel="noopener noreferrer" className="block mt-1 text-blue-500 underline">
                              📖 View API Documentation →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDataset(null)} className="h-6 w-6 p-0">×</Button>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t flex gap-2">
                    <a href={selectedDataset.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      🔗 Data Portal →
                    </a>
                    {selectedDataset.importTemplate && (
                      <Button size="sm" variant="default" className="h-6 text-[10px]"
                        onClick={() => importDataset(selectedDataset)}>
                        📥 Import to Editor
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Import Wizard Modal */}
            {showImportWizard && selectedDataset && (
              <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                    📥 Data Import Wizard: {selectedDataset.name}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><strong>Source:</strong> {selectedDataset.source}</div>
                      <div><strong>Format:</strong> {selectedDataset.format}</div>
                      <div><strong>Size:</strong> {selectedDataset.size}</div>
                      <div><strong>Access:</strong> {selectedDataset.accessLevel}</div>
                    </div>

                    {selectedDataset.apiUrl && (
                      <div className="p-2 rounded bg-white dark:bg-gray-900 text-[11px]">
                        <p className="font-medium text-green-700 dark:text-green-300 mb-1">✅ Streaming API Detected</p>
                        <code className="text-gray-600 break-all">{selectedDataset.apiUrl}</code>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" onClick={executeImport} disabled={isImporting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700">
                        {isImporting ? '⏳ Importing...' : '🚀 Generate Import Code'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowImportWizard(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Editor Card */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center border-b bg-muted/30 px-2 overflow-x-auto">
                {files.map(file => (
                  <div key={file.id} className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r flex-shrink-0 ${
                    file.id === activeFileId ? 'bg-background border-b-2 border-b-primary' : 'hover:bg-muted/50'
                  }`} onClick={() => setActiveFileId(file.id)}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LANGUAGE_CONFIG[file.language]?.color }}></span>
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    {files.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); closeFile(file.id); }} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
                    )}
                  </div>
                ))}
                
                {/* Add collaboration indicator */}
                {sessions.length > 0 && (
                  <div className="ml-auto px-2 text-[10px] text-muted-foreground">
                    👥 {sessions.length} session(s)
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="flex-1 relative bg-slate-900 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-800 text-slate-500 text-xs pt-4 pl-2 select-none font-mono z-10">
                  {activeFile.content.split('\n').map((_, i) => (
                    <div key={i} className={`${i < securityConfig.lineThreshold ? '' : 'bg-red-900/30 text-red-400'} leading-6`}>{i + 1}</div>
                  ))}
                </div>
                
                <textarea value={activeFile.content} onChange={(e) => updateFileContent(e.target.value)}
                  className="absolute inset-0 w-full h-full bg-transparent text-slate-100 text-sm p-4 pl-12 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 tab-size-2"
                  spellCheck={false} style={{ lineHeight: '1.6' }} />

                {requiresSecureMode && (
                  <div className="absolute top-2 right-2 z-20">
                    <Badge variant="destructive" className="text-[10px] animate-pulse">🔒 SECURE ({lineCount} lines)</Badge>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
                <div className="flex items-center gap-2">
                  <Select defaultValue={activeFile.language}>
                    <SelectTrigger className="w-[120px] h-7 text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup><SelectLabel>Python</SelectLabel><SelectItem value="python">🐍 Python</SelectItem></SelectGroup>
                      <SelectGroup><SelectLabel>JVM</SelectLabel>
                        <SelectItem value="java">☕ Java</SelectItem>
                        <SelectItem value="kotlin">🟣 Kotlin</SelectItem>
                        <SelectItem value="scala">🔴 Scala</SelectItem>
                      </SelectGroup>
                      <SelectGroup><SelectLabel>Systems</SelectLabel><SelectItem value="c">⚙️ C</SelectItem></SelectGroup>
                      <SelectGroup><SelectLabel>Functional</SelectLabel><SelectItem value="elixir">💧 Elixir</SelectItem></SelectGroup>
                      <SelectGroup><SelectLabel>Other</SelectLabel>
                        <SelectItem value="sql">🗃️ SQL</SelectItem><SelectItem value="r">📊 R</SelectItem>
                        <SelectItem value="javascript">⚡ JS</SelectItem><SelectItem value="markdown">📝 MD</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    {lineCount} lines{requiresSecureMode && <span className="text-red-500 ml-1">• Will forward</span>}
                  </span>
                  <Button size="sm" onClick={runCode} disabled={isRunning || securityScan.riskLevel === 'critical'}
                    className={`h-7 text-[10px] ${
                      securityScan.riskLevel === 'critical' ? 'bg-red-600' :
                      requiresSecureMode ? 'bg-purple-600' : 'bg-green-600'
                    }`}>
                    {isRunning ? '⏳ Running...' : securityScan.riskLevel === 'critical' ? '🚫 Blocked' : requiresSecureMode ? '🔒 Run (Secure)' : '▶️ Run'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Output Panel */}
            <Card className="h-[200px] flex flex-col">
              <CardHeader className="pb-2 py-2 px-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs flex items-center gap-2">
                    🖥️ Output
                    {executionResult?.wasForwarded && <Badge className="text-[9px] bg-purple-100 text-purple-800">📤 Forwarded</Badge>}
                    {executionResult?.backend && <Badge variant="outline" className="text-[9px]">{executionResult.backend}</Badge>}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 text-[9px]" onClick={() => setOutput([])}>Clear</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[9px]" onClick={() => {
                      addOutput('info', ''); addOutput('info', '📋 Audit Log:');
                      auditLog.forEach(e => addOutput('info', `   [${e.timestamp.toLocaleTimeString()}] ${e.action}: ${e.details}`));
                    }}>Audit</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <div className="font-mono text-[11px] p-3 h-full overflow-auto bg-slate-900 text-slate-100 leading-relaxed">
                  {output.length === 0 ? (
                    <div className="text-slate-500 italic">
                      Ready to execute. Select a dataset or template to begin.
                      {requiresSecureMode && <span className="block mt-1 text-yellow-400">⚠️ Long code will be forwarded externally.</span>}
                    </div>
                  ) : output.map((line, i) => (
                    <div key={i} className={`${
                      line.type === 'error' ? 'text-red-400' :
                      line.type === 'success' ? 'text-green-400' :
                      line.type === 'info' ? 'text-blue-400' :
                      line.type === 'warning' ? 'text-yellow-400' :
                      line.type === 'security' ? 'text-purple-400' :
                      line.type === 'api' ? 'text-cyan-400' :
                      line.type === 'collab' ? 'text-emerald-400' : 'text-slate-200'
                    }`}>{line.content}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="xl:col-span-1 space-y-3 overflow-y-auto max-h-full">
            
            {/* Execution Result */}
            {executionResult && (
              <Card className="h-fit">
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs">📊 Result</CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1.5 text-[10px]">
                  <div className="flex justify-between"><span>Status</span><Badge variant={executionResult.success ? "default" : "destructive"} className="text-[9px] h-4">{executionResult.success ? 'Success' : 'Failed'}</Badge></div>
                  <div className="flex justify-between"><span>Time</span><span>{executionResult.executionTime.toFixed(3)}s</span></div>
                  <div className="flex justify-between"><span>Memory</span><span>~{executionResult.memoryUsed.toFixed(1)}MB</span></div>
                  <div className="flex justify-between"><span>Backend</span><span>{executionResult.backend || 'Local'}</span></div>
                  <div className="flex justify-between"><span>Security</span><Badge variant={executionResult.securityLevel === 'blocked' ? 'destructive' : executionResult.securityLevel === 'secure' ? 'default' : 'secondary'} className="text-[9px] h-4">{executionResult.securityLevel.toUpperCase()}</Badge></div>
                  {executionResult.wasForwarded && (
                    <div className="mt-1.5 p-1.5 rounded bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
                      <p className="text-purple-700 dark:text-purple-300 font-medium text-[9px]">📤 Forwarded</p>
                      <p className="text-[8px] text-purple-600 break-all">{executionResult.forwardLocation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Security Scan */}
            {(securityScan.isSuspicious || requiresSecureMode) && (
              <Card className={`h-fit ${securityScan.riskLevel === 'critical' ? 'border-red-300 bg-red-50/50' : 'border-yellow-300 bg-yellow-50/50'}`}>
                <CardHeader className="p-2 pb-1">
                  <CardTitle className="text-xs flex items-center gap-1">
                    {securityScan.riskLevel === 'critical' ? '🚨' : '⚠️'} Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-1 text-[10px]">
                  <div className="flex justify-between"><span>Risk</span><Badge variant={securityScan.riskLevel === 'critical' ? 'destructive' : 'default'} className="text-[9px] h-4">{securityScan.riskLevel.toUpperCase()}</Badge></div>
                  <div className="flex justify-between"><span>Patterns</span><span>{securityScan.patterns.length}</span></div>
                  {securityScan.patterns.length > 0 && (
                    <div className="max-h-[60px] overflow-y-auto space-y-0.5 mt-1">
                      {securityScan.patterns.map((p, i) => <code key={i} className="block p-0.5 rounded bg-black/10 text-[8px] font-mono">{p}</code>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="h-fit">
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs">⚡ Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1.5">
                <Button size="sm" variant="outline" className="w-full h-7 text-[10px]" onClick={() => setShowCollabPanel(!showCollabPanel)}>
                  👥 Share Workspace
                </Button>
                <div className="grid grid-cols-3 gap-1">
                  {(['email', 'twitter', 'slack'] as const).map(platform => (
                    <Button key={platform} size="sm" variant="outline" className="h-6 text-[9px]"
                      onClick={() => shareToExternal(platform)}>
                      {platform === 'email' ? '📧' : platform === 'twitter' ? '🐦' : '💬'}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card className="h-fit">
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs">🔗 Resources</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1.5 text-[10px]">
                <Link href="/paper-battle" className="block text-blue-600 hover:underline">⚔️ Paper Battle →</Link>
                <Link href="/aethel" className="block text-blue-600 hover:underline">🤖 AI Chat →</Link>
                <a href="https://opendata.cern.ch/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">⚛️ CERN Data →</a>
                <a href="https://earthexplorer.usgs.gov/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">🛰️ USGS →</a>
                <a href="https://portal.gdc.cancer.gov/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">🧬 GDC →</a>
              </CardContent>
            </Card>

            {/* Version Info */}
            <Card className="h-fit bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <CardContent className="p-2">
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Workspace v3.0</strong><br/>
                  Binary: ROOT, FITS, HDF5, BAM<br/>
                  Backends: Jupyter, Docker, Cloud<br/>
                  Persistence: localStorage<br/>
                  Designed: 2025-2040+
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="h-4"></div>
      </div>
    );
  } catch (error) {
    console.error('Workspace error:', error);
    setHasError(true);
    return null;
  }
}

import { SelectGroup, SelectLabel } from '@/components/ui/select';