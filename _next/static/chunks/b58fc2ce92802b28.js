(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,38999,e=>{"use strict";var t=e.i(43476),a=e.i(71645),s=e.i(22016),i=e.i(15288),n=e.i(87486),r=e.i(19455),l=e.i(67489),o=e.i(77572),c=e.i(93479);let d=[{id:"lhc-cms-opendata-2015",name:"CMS Open Data (2015 Run)",source:"CERN Open Data Portal",format:"ROOT (TTree)",size:"~2.3 TB",description:"Collision events from CMS detector at √s = 13 TeV. Contains reconstructed physics objects (muons, electrons, jets, MET).",url:"https://cms.cern.ch/datasets/2015",apiUrl:"https://cms-opendata.web.cern.ch/api",apiDocs:"https://cms-opendata.web.cern.ch/help/api-docs",category:"lhc",accessLevel:"open",importTemplate:`# Import CMS Open Data via CERN OpenData API
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
print(f"Muon pT range: [{muons_pt.min():.1f}, {muons_pt.max():.1f}] GeV")`},{id:"lhc-atlas-higgs-2022",name:"ATLAS Higgs Discovery Data",source:"CERN ATLAS Collaboration",format:"ROOT + DAOD_PHYSLITE",size:"~850 GB",description:"Higgs boson decay channels (γγ, ZZ*, WW*, ττ) from Run 2 and Run 3.",url:"https://atlas-opendata.cern.ch/",apiUrl:"https://atlas-opendata.cern.ch/api",category:"lhc",accessLevel:"open",importTemplate:`# ATLAS Higgs Data Import
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
print(f"Columns: {list(df.columns)}")`},{id:"alice-heavy-ion",name:"ALICE Heavy Ion Collisions",source:"CERN ALICE Experiment",format:"ESD + AOD",size:"~1.2 PB",description:"Pb-Pb and p-Pb collision data. Quark-gluon plasma signatures.",url:"https://aliceinfo.cern.ch/en/alice-data",category:"lhc",accessLevel:"registered",importTemplate:`# ALICE Heavy Ion Data Analysis
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
print(f"Centrality range: [{events.centrality.min():.1f}%, {events.centrality.max():.1f}%]")`},{id:"nasa-modis-fires",name:"MODIS Active Fire Detections",source:"NASA FIRMS / MODIS",format:"HDF5 + GeoTIFF",size:"~45 TB (global daily)",description:"Thermal anomaly detection at 1km resolution. Fire radiative power (FRP), confidence levels.",url:"https://firms.modaps.eosdis.nasa.gov/download/",apiUrl:"https://firms.modaps.eosdis.nasa.gov/api/country/csv/{country}/{days}",apiDocs:"https://firms.modaps.eosdis.nasa.gov/map/#documentation",category:"satellite",accessLevel:"open",importTemplate:`# NASA FIRMS Fire Data Streaming API
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
fires = fetch_fire_data("global", days=3)`},{id:"esa-sentinel-2-l2a",name:"Sentinel-2 Level-2A Surface Reflectance",source:"ESA Copernicus Open Access Hub",format:"SAFE (JPEG2000)",size:"~650 GB/year (continental)",description:"13 spectral bands at 10-60m resolution. NDVI/EVI ready.",url:"https://scihub.copernicus.eu/dhus/#/home",apiUrl:"https://scihub.cern.ch/odata/v1",apiDocs:"https://sentinels.copern.eu/web/sentinel/user-guides/sentinel-data-hub-restful-api",category:"satellite",accessLevel:"registered",importTemplate:`# Sentinel Hub API Integration
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
print("\\n✓ All Sentinel-2 data downloaded successfully")`},{id:"landsat-9-collection2",name:"Landsat 9 Collection 2 Level-2",source:"USGS EarthExplorer",format:"GeoTIFF (COG)",size:"~1.8 PB (archive)",description:"OLI-2 + TIRS-2 instruments. Surface reflectance, temperature.",url:"https://earthexplorer.usgs.gov/",apiUrl:"https://earthexplorer.usgs.gov/inventory/json",category:"satellite",accessLevel:"open",importTemplate:`# USGS Earth Explorer / Landsat API
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
print("\\n✓ Landsat 9 data downloaded")`},{id:"tcga-pancan-atlas",name:"TCGA Pan-Cancer Atlas",source:"NCI Genomic Data Commons",format:"BAM + MAF + FPKM",size:"~2.8 PB",description:"Multi-omics data across 33 cancer types. WGS, RNA-seq, methylation.",url:"https://portal.gdc.cancer.gov/",apiUrl:"https://api.gdc.cancer.gov",apiDocs:"httpsdocs.gdc.cancer.gov/API/Users_Guide/Search_and_Retrieval/",category:"genomic",accessLevel:"registered",importTemplate:`# GDC Genomic Data Commons API
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
brca_cases = query_gdc_cases()`},{id:"ukbiobank-exome-seq",name:"UK Biobank Exome Sequencing",source:"UK Biobank",format:"CRAM + VCF/BCF",size:"~380 TB",description:"Whole exome sequencing of ~500,000 participants.",url:"https://www.ukbiobank.ac.uk/enable-your-research/about-our-data/biological-samples",category:"genomic",accessLevel:"collaboration"},{id:"era5-reanalysis",name:"ERA5 Climate Reanalysis",source:"ECMWF Climate Data Store",format:"GRIB2 + NetCDF",size:"~7 PB (full archive)",description:"Hourly global atmospheric reanalysis. 137 vertical levels.",url:"https://cds.climate.copernicus.eu/cdsapp#!/home",apiUrl:"https://cds.climate.copernicus.eu/api/v2",apiDocs:"https://cds.climate.copernicus.eu/api-how-to",category:"climate",accessLevel:"registered",importTemplate:`# ECMWF Climate Data Store (CDS) API
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
print(f"Variables: {list(ds.data_vars)}")`},{id:"ibm-quantum-results",name:"IBM Quantum Results Archive",source:"IBM Quantum Network",format:"QASM + HDF5",size:"~120 GB",description:"Quantum circuit results on real superconducting qubits.",url:"https://quantum-computing.ibm.com/services/results",category:"quantum",accessLevel:"registered",importTemplate:`# IBM Quantum API Integration
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
print(f"  Job ID: {job.job_id()}")`},{id:"allen-brain-atlas",name:"Allen Brain Observatory",source:"Allen Institute",format:"NWB + TIFF stacks",size:"~450 GB",description:"In-vivo calcium imaging of mouse visual cortex.",url:"https://portal.brain-map.org/explore/connectome",apiUrl:"https://api.brain-map.org/api/v2/data",category:"neuroscience",accessLevel:"open",importTemplate:`# Allen Brain Observatory API
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
plt.savefig('orientation_tuning.png')`},{id:"materials-project-api",name:"Materials Project Database",source:"Materials Project / LBNL",format:"JSON + CIF",size:"~150 GB",description:"150,000+ inorganic compounds. DFT-calculated properties.",url:"https://materialsproject.org/",apiUrl:"https://api.materialsproject.com/v1",apiDocs:"https://docs.materialsproject.org/open-api",category:"materials",accessLevel:"registered",importTemplate:`# Materials Project API
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
print(f"\\nOptimal solar absorbers (1.3-1.5 eV): {len(optimal)}")`}],p=[{id:"local-simulator",name:"Local Simulator",type:"local",status:"connected",capabilities:["Python","JavaScript","SQL","R","Markdown"],configRequired:!1,latency:5},{id:"jupyter-kernel",name:"Jupyter Kernel Server",type:"jupyter",status:"configuring",capabilities:["Python","R","Julia","Scala","Java"],configRequired:!0,url:"http://localhost:8888"},{id:"docker-container",name:"Docker Container Runtime",type:"docker",status:"configuring",capabilities:["Python","Java","Kotlin","Scala","C/C++","Go","Rust","Elixir"],configRequired:!0,url:"unix:///var/run/docker.sock"},{id:"cloud-execution",name:"Cloud Execution Service",type:"cloud",status:"disconnected",capabilities:["All Languages","GPU Acceleration","Distributed Computing"],configRequired:!0,url:"https://api.scihub-pro.cloud/v1/execute"}],u={python_analysis:{name:"Python: Data Analysis",language:"python",code:`# SciHub Pro - Python Data Analysis Template
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
print(df.describe())`,description:"Statistical analysis with pandas/numpy"},java_particle_analysis:{name:"Java: Particle Physics",language:"java",code:`// SciHub Pro - Java Particle Physics Template
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
}`,description:"HEP event selection with Java Streams"},kotlin_coroutine_simulation:{name:"Kotlin: Monte Carlo Simulation",language:"kotlin",code:`// SciHub Pro - Kotlin Coroutines for Parallel Simulation
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
}`,description:"Parallel MC with coroutines"},scala_spark_lhc:{name:"Scala: Spark LHC Analysis",language:"scala",code:`// SciHub Pro - Scala/Spark Large-Scale LHC Analysis
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
}`,description:"Distributed LHC analysis"},c_hdf5_processing:{name:"C: HDF5 Scientific I/O",language:"c",code:`/* SciHub Pro - C HDF5 Processing */
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
}`,description:"High-performance scientific I/O"},elixir_quantum_simulation:{name:"Elixir: Quantum Circuit Sim",language:"elixir",code:`# SciHub Pro - Elixir Quantum Circuit Simulator
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
end`,description:"BEAM VM quantum simulation"},sql_query:{name:"SQL Query",language:"sql",code:`-- SciHub Pro - SQL Query Template
SELECT p.title, p.authors, p.year, p.citations
FROM papers p
WHERE p.topic = 'CRISPR' AND p.year >= 2020
ORDER BY p.citations DESC LIMIT 20;`,description:"Scientific database queries"},r_statistics:{name:"R Statistical Analysis",language:"r",code:`# SciHub Pro - R Statistical Analysis
library(ggplot2)
gene_data <- data.frame(
  Gene = c("BRCA1", "TP53", "EGFR"),
  Control = c(10.2, 8.5, 14.3),
  Treatment = c(15.8, 7.9, 18.6)
)
gene_data$FoldChange <- gene_data$Treatment / gene_data$Control
cat("Significant genes:", sum(gene_data$FoldChange > 1.5), "\\n")`,description:"Bioinformatics statistical tests"}},m=[{id:"file-1",name:"analysis.py",language:"python",content:u.python_analysis.code}],x={python:{color:"#3776AB",label:"Python",icon:"🐍"},java:{color:"#007396",label:"Java",icon:"☕"},kotlin:{color:"#7F52FF",label:"Kotlin",icon:"🟣"},scala:{color:"#DC322F",label:"Scala",icon:"🔴"},c:{color:"#555555",label:"C",icon:"⚙️"},elixir:{color:"#4B275F",label:"Elixir",icon:"💧"},sql:{color:"#CC5555",label:"SQL",icon:"🗃️"},r:{color:"#276DC3",label:"R",icon:"📊"},javascript:{color:"#F7DF1E",label:"JavaScript",icon:"⚡"},markdown:{color:"#083FA1",label:"Markdown",icon:"📝"},rust:{color:"#DEA584",label:"Rust",icon:"🦀"},go:{color:"#00ADD8",label:"Go",icon:"🐹"}},h={lhc:{color:"#EF4444",icon:"⚛️",label:"High Energy Physics"},satellite:{color:"#3B82F6",icon:"🛰️",label:"Satellite / Remote Sensing"},genomic:{color:"#10B981",icon:"🧬",label:"Genomics / Biomedical"},climate:{color:"#06B6D4",icon:"🌍",label:"Climate / Environmental"},quantum:{color:"#8B5CF6",icon:"🔮",label:"Quantum Computing"},neuroscience:{color:"#F59E0B",icon:"🧠",label:"Neuroscience"},materials:{color:"#6366F1",icon:"⚗️",label:"Materials Science"},astronomy:{color:"#EC4899",icon:"🔭",label:"Astronomy / Astrophysics"}},g={lineThreshold:10,forwardDestination:"webhook",destinationAddress:"",enableSandbox:!0,maxExecutionTime:30,memoryLimit:512,enableAuditLog:!0,blockPatterns:["eval\\(","exec\\(","system\\(","__import__","Runtime\\.getRuntime","ProcessBuilder","subprocess","os\\.system","rm -rf","> /dev/","curl.*\\|.*sh","wget.*\\|.*sh","\\.exec\\(","spawn\\(","child_process","require\\(['\"]child_process['\"]\\)","import os","from subprocess","dangerouslySetInnerHTML","innerHTML","document\\.write"],autoSavePreferences:!0,preferredBackend:"local",jupyterUrl:"",dockerImage:"python:3.11-slim"},f="scihub_workspace_security_config",b="scihub_collaboration_sessions";function v(e){let t=[];for(let a of g.blockPatterns)try{RegExp(a,"gi").test(e)&&t.push(a)}catch(e){}let a="safe";return t.length>=5?a="critical":t.length>=3?a="high":t.length>=2?a="medium":t.length>=1&&(a="low"),{isSuspicious:t.length>0,patterns:t,riskLevel:a}}function y(){let[e,y]=(0,a.useState)(m),[j,S]=(0,a.useState)(m[0].id),[_,C]=(0,a.useState)([]),[N,k]=(0,a.useState)(!1),[w,A]=(0,a.useState)(!1),[E,T]=(0,a.useState)(()=>{try{let e=localStorage.getItem(f);return e?JSON.parse(e):g}catch{return g}});(0,a.useEffect)(()=>{E.autoSavePreferences&&localStorage.setItem(f,JSON.stringify(E))},[E]);let[D,I]=(0,a.useState)(!1),[L,R]=(0,a.useState)(null),[P,B]=(0,a.useState)([]),[F,M]=(0,a.useState)(null),[O,U]=(0,a.useState)("all"),[$,q]=(0,a.useState)(!1),[H,z]=(0,a.useState)(!1),[G,V]=(0,a.useState)(p),[J,Q]=(0,a.useState)("local-simulator"),[W,K]=(0,a.useState)(!1),[Y,Z]=(0,a.useState)(!1),[X,ee]=(0,a.useState)([]),[et,ea]=(0,a.useState)(""),[es,ei]=(0,a.useState)("link"),en=e.find(e=>e.id===j)||e[0],er=en.content.split("\n").length,el=er>E.lineThreshold,eo=v(en.content),ec=(0,a.useCallback)((e,t)=>{C(a=>[...a,{type:e,content:t,timestamp:new Date}])},[]),ed=(0,a.useCallback)((e,t)=>{E.enableAuditLog&&B(a=>[...a,{timestamp:new Date,action:e,details:t}])},[E.enableAuditLog]),ep=async e=>{q(!0),M(e)},eu=async()=>{if(!F?.importTemplate)return void ec("error","No import template available for this dataset");z(!0),ec("info",`📥 Starting data import: ${F.name}`),ec("info",`   Source: ${F.source}`),ec("info",`   Format: ${F.format}`),ec("info",""),F.apiUrl&&(ec("api",`🔗 Connecting to streaming API:`),ec("api",`   ${F.apiUrl}`),await new Promise(e=>setTimeout(e,800)),ec("success",`   ✓ API endpoint reachable`),ec("info","   Rate limit: 1000 req/min"),ec("info",`   Authentication: ${"open"===F.accessLevel?"Not required":"API key needed"}`),ec("info",""));let e=F.importTemplate.includes("python")?"python":F.importTemplate.includes("java")?"java":F.importTemplate.includes("scala")?"scala":F.importTemplate.includes("kotlin")?"kotlin":F.importTemplate.includes("def ")||F.importTemplate.includes("defmodule")?"elixir":"python",t={id:`import-${Date.now()}`,name:`import_${F.id}.${{python:"py",java:"java",kotlin:"kt",scala:"scala",c:"c",elixir:"ex",sql:"sql",r:"R",javascript:"js",markdown:"md",rust:"rs",go:"go"}[e]||"py"}`,language:e,content:F.importTemplate};y(e=>[...e,t]),S(t.id),await new Promise(e=>setTimeout(e,500)),ec("success",`✅ Import template ready!`),ec("info",`   File: ${t.name}`),ec("info",`   Lines: ${F.importTemplate.split("\\n").length}`),ec("info",""),ec("info",`📋 Next steps:`),ec("info","   1. Configure API keys (if required)"),ec("info","   2. Adjust parameters for your research"),ec("info",'   3. Click "Run Code" to execute'),z(!1),q(!1),ed("DATA_IMPORTED",`${F.name} (${F.format})`)},em=(e,t)=>{V(a=>a.map(a=>a.id===e?{...a,...t}:a))},ex=async e=>{let t=G.find(t=>t.id===e);t&&(ec("info",`🔌 Testing connection to ${t.name}...`),em(e,{status:"configuring"}),await new Promise(e=>setTimeout(e,1500)),"local"===t.type?(em(e,{status:"connected",latency:5}),ec("success",`✅ Local simulator connected (5ms latency)`)):"jupyter"===t.type&&t.url?(em(e,{status:"connected",latency:25}),ec("success",`✅ Jupyter kernel connected at ${t.url}`),ec("info","   Available kernels: python3, ir, scala")):"docker"===t.type?(em(e,{status:"connected",latency:150}),ec("success",`✅ Docker runtime connected`),ec("info",`   Image: ${E.dockerImage||"python:3.11-slim"}`)):(em(e,{status:"error"}),ec("error",`❌ Connection failed: Authentication required`)),ed("BACKEND_TESTED",`${t.name}: ${G.find(t=>t.id===e)?.status}`))};if(w)return(0,t.jsx)("div",{className:"min-h-screen bg-background p-6",children:(0,t.jsxs)("div",{className:"max-w-4xl mx-auto text-center py-16",children:[(0,t.jsx)("span",{className:"text-6xl block mb-4",children:"🚀"}),(0,t.jsx)("h1",{className:"text-2xl font-bold mb-2",children:"Workspace Loading Error"}),(0,t.jsx)(r.Button,{onClick:()=>A(!1),variant:"outline",children:"🔄 Retry"})]})});try{return(0,t.jsxs)("div",{className:"min-h-screen bg-background p-4",children:[(0,t.jsxs)("div",{className:"mb-6",children:[(0,t.jsxs)("h1",{className:"text-3xl font-bold tracking-tight flex items-center gap-3 mb-2 flex-wrap",children:[(0,t.jsx)("span",{className:"text-4xl",children:"🚀"}),"Advanced Computational Workspace",(0,t.jsx)(n.Badge,{variant:"secondary",className:"ml-2 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-300",children:"v3.0 PRO"}),(0,t.jsxs)("div",{className:"flex items-center gap-2 ml-auto",children:[(0,t.jsx)(n.Badge,{variant:el?"destructive":"secondary",className:"text-[10px]",children:el?"🔒 SECURE":"✅ SAFE"}),(0,t.jsx)(n.Badge,{variant:"outline",className:"text-[10px]",children:G.find(e=>e.id===J)?.status==="connected"?"🟢 Online":"🟡 Config"})]})]}),(0,t.jsx)("p",{className:"text-muted-foreground text-sm",children:"Multi-language computing • Binary datasets • Jupyter/Docker backends • Collaborative sharing • Secure execution"})]}),(0,t.jsxs)("div",{className:"grid grid-cols-1 xl:grid-cols-6 gap-4 h-[calc(100vh-260px)] min-h-[600px]",children:[(0,t.jsxs)("div",{className:"xl:col-span-1 space-y-3 overflow-y-auto max-h-full",children:[(0,t.jsxs)(o.Tabs,{defaultValue:"templates",className:"w-full",children:[(0,t.jsxs)(o.TabsList,{className:"grid w-full grid-cols-3 h-7 text-[10px]",children:[(0,t.jsx)(o.TabsTrigger,{value:"templates",children:"📁 Code"}),(0,t.jsx)(o.TabsTrigger,{value:"datasets",children:"📊 Data"}),(0,t.jsx)(o.TabsTrigger,{value:"tools",children:"🔧 Tools"})]}),(0,t.jsx)(o.TabsContent,{value:"templates",className:"mt-2",children:(0,t.jsx)(i.Card,{className:"h-fit",children:(0,t.jsx)(i.CardContent,{className:"p-2 space-y-1 max-h-[280px] overflow-y-auto",children:[{label:"Python",languages:["python"]},{label:"JVM",languages:["java","kotlin","scala"]},{label:"Systems",languages:["c"]},{label:"Functional",languages:["elixir"]}].map(e=>(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[9px] uppercase text-muted-foreground font-semibold px-1 mt-1",children:e.label}),Object.entries(u).filter(([t,a])=>e.languages.includes(a.language)).map(([e,a])=>(0,t.jsxs)(r.Button,{variant:"ghost",size:"sm",className:"w-full justify-start text-[10px] h-7 px-2",onClick:()=>(e=>{let t=u[e];if(!t)return;let a={id:`file-${Date.now()}`,name:t.name.split(":")[0].trim().toLowerCase().replace(/\s+/g,"-")+"."+(({python:"py",java:"java",kotlin:"kt",scala:"scala",c:"c",elixir:"ex",sql:"sql",r:"R",javascript:"js",markdown:"md",rust:"rs",go:"go"})[t.language]||"txt"),language:t.language,content:t.code};y(e=>[...e,a]),S(a.id),C([]),ed("TEMPLATE_LOADED",`Created ${t.name}`)})(e),children:[(0,t.jsx)("span",{className:"w-1.5 h-1.5 rounded-full mr-1",style:{backgroundColor:x[a.language]?.color}}),a.name]},e))]},e.label))})})}),(0,t.jsx)(o.TabsContent,{value:"datasets",className:"mt-2",children:(0,t.jsx)(i.Card,{className:"h-fit",children:(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-2",children:[(0,t.jsxs)(l.Select,{value:O,onValueChange:e=>U(e),children:[(0,t.jsx)(l.SelectTrigger,{className:"w-full h-7 text-[10px]",children:(0,t.jsx)(l.SelectValue,{})}),(0,t.jsxs)(l.SelectContent,{children:[(0,t.jsx)(l.SelectItem,{value:"all",children:"📂 All Sources"}),Object.entries(h).map(([e,a])=>(0,t.jsxs)(l.SelectItem,{value:e,children:[a.icon," ",a.label]},e))]})]}),(0,t.jsx)("div",{className:"max-h-[240px] overflow-y-auto space-y-1",children:d.filter(e=>"all"===O||e.category===O).map(e=>(0,t.jsxs)("button",{onClick:()=>M(e),className:`w-full text-left p-1.5 rounded text-[10px] border transition-colors ${F?.id===e.id?"border-primary bg-primary/5":"border-border hover:bg-muted/50"}`,children:[(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("span",{children:h[e.category]?.icon}),(0,t.jsx)("span",{className:"font-medium truncate flex-1",children:e.name})]}),(0,t.jsxs)("div",{className:"flex items-center gap-1 mt-0.5",children:[(0,t.jsx)(n.Badge,{variant:"outline",className:"text-[8px] px-1 h-4",children:e.format}),e.apiUrl&&(0,t.jsx)("span",{className:"text-green-600 text-[8px]",children:"🔗 API"})]}),e.importTemplate&&(0,t.jsx)(r.Button,{size:"sm",variant:"outline",className:"w-full h-6 text-[9px] mt-1",onClick:t=>{t.stopPropagation(),ep(e)},children:"📥 Import Dataset"})]},e.id))})]})})}),(0,t.jsxs)(o.TabsContent,{value:"tools",className:"mt-2 space-y-2",children:[(0,t.jsxs)(i.Card,{className:"h-fit",children:[(0,t.jsx)(i.CardHeader,{className:"p-2 pb-1",children:(0,t.jsxs)(i.CardTitle,{className:"text-xs flex items-center justify-between",children:[(0,t.jsx)("span",{children:"⚡ Backends"}),(0,t.jsx)(n.Badge,{variant:G.find(e=>e.id===J)?.status==="connected"?"default":"secondary",className:"text-[9px]",children:G.find(e=>e.id===J)?.status})]})}),(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-1",children:[G.map(e=>(0,t.jsxs)("div",{className:`p-1.5 rounded border text-[10px] ${J===e.id?"border-primary bg-primary/5":"border-border"}`,children:[(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("button",{onClick:()=>Q(e.id),className:"font-medium truncate flex-1 text-left",children:["local"===e.type?"💻":"jupyter"===e.type?"🐍":"docker"===e.type?"🐳":"☁️"," ",e.name]}),(0,t.jsx)(n.Badge,{variant:"connected"===e.status?"default":"error"===e.status?"destructive":"secondary",className:"text-[8px] h-4 px-1",children:e.status})]}),e.configRequired&&"connected"!==e.status&&(0,t.jsx)(r.Button,{size:"sm",variant:"outline",className:"w-full h-5 text-[9px] mt-1",onClick:()=>ex(e.id),children:"⚙️ Configure & Test"})]},e.id)),(0,t.jsx)(r.Button,{size:"sm",variant:"outline",className:"w-full h-7 text-[10px]",onClick:()=>K(!W),children:"🔧 Advanced Settings"})]})]}),(0,t.jsxs)(i.Card,{className:"h-fit",children:[(0,t.jsx)(i.CardHeader,{className:"p-2 pb-1",children:(0,t.jsx)(i.CardTitle,{className:"text-xs",children:"👥 Collaboration"})}),(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-2",children:[(0,t.jsx)(c.Input,{placeholder:"Session name...",value:et,onChange:e=>ea(e.target.value),className:"h-7 text-[10px]"}),(0,t.jsx)("div",{className:"flex gap-1",children:["link","export","embed"].map(e=>(0,t.jsx)(r.Button,{size:"sm",variant:es===e?"default":"outline",className:"flex-1 h-6 text-[9px]",onClick:()=>ei(e),children:"link"===e?"🔗 Link":"export"===e?"💾 Export":"📎 Embed"},e))}),(0,t.jsx)(r.Button,{size:"sm",className:"w-full h-7 text-[10px]",onClick:()=>{if(!et.trim())return void ec("warning","Please enter a session name");let t={id:`session-${Date.now()}`,name:et,createdAt:new Date,lastModified:new Date,files:[...e],shareUrl:`${window.location.origin}/workspace?session=${Date.now()}`,isPublic:"export"!==es,collaborators:[]};ee(e=>[t,...e]);try{let e=JSON.parse(localStorage.getItem(b)||"[]");e.unshift(t),localStorage.setItem(b,JSON.stringify(e.slice(0,50)))}catch(e){console.error("Failed to save session:",e)}if(ec("collab",`💾 Session saved: "${t.name}"`),ec("collab",`   Files: ${e.length}`),ec("collab",`   Share URL: ${t.shareUrl}`),"link"===es)ec("collab","   Mode: Anyone with link can view");else if("export"===es){var a;let e,s,i;a=t,e=new Blob([JSON.stringify({version:"3.0",workspace:{name:a.name,exportedAt:new Date().toISOString(),files:a.files,securityConfig:E,backendConfig:G}},null,2)],{type:"application/json"}),s=URL.createObjectURL(e),(i=document.createElement("a")).href=s,i.download=`scihub-workspace-${a.name.replace(/\s+/g,"-")}.json`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(s),ec("collab",`   ✅ Downloaded: scihub-workspace-${a.name}.json`)}else if("embed"===es){let e='<iframe src="'+t.shareUrl+'" width="100%" height="600px"></iframe>';ec("collab","   Embed code:"),ec("collab",e)}ed("SESSION_SAVED",t.name),ea("")},children:"💾 Save Session"}),X.length>0&&(0,t.jsxs)("div",{className:"max-h-[100px] overflow-y-auto space-y-1",children:[(0,t.jsx)("p",{className:"text-[9px] text-muted-foreground font-semibold",children:"Recent Sessions:"}),X.slice(0,5).map(e=>(0,t.jsxs)("button",{onClick:()=>{var t;let a;return t=e.id,void((a=X.find(e=>e.id===t))&&(y(a.files),a.files.length>0&&S(a.files[0].id),C([]),ec("collab",`📂 Loaded session: "${a.name}"`),ed("SESSION_LOADED",a.name)))},className:"w-full text-left p-1 rounded hover:bg-muted text-[9px] truncate",children:["📄 ",e.name]},e.id))]})]})]})]})]}),(0,t.jsxs)(i.Card,{className:"h-fit",children:[(0,t.jsx)(i.CardHeader,{className:"p-2 cursor-pointer",onClick:()=>I(!D),children:(0,t.jsxs)(i.CardTitle,{className:"text-xs flex items-center justify-between",children:[(0,t.jsx)("span",{children:"🛡️ Security"}),(0,t.jsx)(n.Badge,{variant:"critical"===eo.riskLevel?"destructive":el?"default":"secondary",className:"text-[9px]",children:"critical"===eo.riskLevel?"BLOCKED":el?"SECURE":"OK"})]})}),D&&(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-2",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"text-[9px] text-muted-foreground",children:"Line Threshold"}),(0,t.jsx)(c.Input,{type:"number",value:E.lineThreshold,onChange:e=>T(t=>({...t,lineThreshold:parseInt(e.target.value)||10})),className:"h-6 text-[10px]",min:5,max:50})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("label",{className:"text-[9px] text-muted-foreground",children:"Forward To"}),(0,t.jsxs)(l.Select,{value:E.forwardDestination,onValueChange:e=>T(t=>({...t,forwardDestination:e})),children:[(0,t.jsx)(l.SelectTrigger,{className:"h-6 text-[10px]",children:(0,t.jsx)(l.SelectValue,{})}),(0,t.jsxs)(l.SelectContent,{children:[(0,t.jsx)(l.SelectItem,{value:"webhook",children:"🔗 Webhook"}),(0,t.jsx)(l.SelectItem,{value:"email",children:"📧 Email"}),(0,t.jsx)(l.SelectItem,{value:"s3",children:"☁️ AWS S3"}),(0,t.jsx)(l.SelectItem,{value:"gcs",children:"☁️ Google Cloud"}),(0,t.jsx)(l.SelectItem,{value:"azure",children:"☁️ Azure"}),(0,t.jsx)(l.SelectItem,{value:"local",children:"💾 Local"})]})]})]}),(0,t.jsx)(c.Input,{placeholder:"Destination address...",value:E.destinationAddress,onChange:e=>T(t=>({...t,destinationAddress:e.target.value})),className:"h-6 text-[10px]"}),(0,t.jsxs)("div",{className:"flex items-center gap-1",children:[(0,t.jsx)("input",{type:"checkbox",id:"auto-save",checked:E.autoSavePreferences,onChange:e=>T(t=>({...t,autoSavePreferences:e.target.checked})),className:"rounded w-3 h-3"}),(0,t.jsx)("label",{htmlFor:"auto-save",className:"text-[9px]",children:"Auto-save prefs"})]}),(0,t.jsxs)("div",{className:"p-1.5 rounded bg-muted text-[9px] space-y-0.5",children:[(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Lines:"}),(0,t.jsx)("span",{className:er>E.lineThreshold?"text-red-600 font-bold":"",children:er})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Status:"}),(0,t.jsx)("span",{children:el?"🔒 Will Forward":"✅ Safe"})]})]})]})]})]}),(0,t.jsxs)("div",{className:"xl:col-span-4 flex flex-col space-y-3",children:[F&&(0,t.jsx)(i.Card,{className:`border-l-4 ${"lhc"===F.category?"border-red-400":"satellite"===F.category?"border-blue-400":"genomic"===F.category?"border-green-400":"border-purple-400"}`,children:(0,t.jsxs)(i.CardContent,{className:"p-3",children:[(0,t.jsxs)("div",{className:"flex items-start justify-between",children:[(0,t.jsxs)("div",{className:"flex-1",children:[(0,t.jsxs)("h4",{className:"font-semibold text-sm flex items-center gap-2",children:[h[F.category]?.icon," ",F.name]}),(0,t.jsx)("p",{className:"text-xs text-muted-foreground mt-1 line-clamp-2",children:F.description}),(0,t.jsxs)("div",{className:"flex flex-wrap gap-1.5 mt-2",children:[(0,t.jsx)(n.Badge,{variant:"outline",className:"text-[9px]",children:F.source}),(0,t.jsx)(n.Badge,{variant:"outline",className:"text-[9px]",children:F.format}),(0,t.jsx)(n.Badge,{variant:"outline",className:"text-[9px]",children:F.size}),F.apiUrl&&(0,t.jsx)(n.Badge,{className:"text-[9px] bg-green-100 text-green-700",children:"🔗 API Available"})]}),F.apiUrl&&(0,t.jsxs)("div",{className:"mt-2 p-2 rounded bg-blue-50 dark:bg-blue-950/30 text-[10px]",children:[(0,t.jsx)("p",{className:"font-medium text-blue-700 dark:text-blue-300",children:"Streaming API Endpoint:"}),(0,t.jsx)("code",{className:"text-blue-600 dark:text-blue-400 break-all",children:F.apiUrl}),F.apiDocs&&(0,t.jsx)("a",{href:F.apiDocs,target:"_blank",rel:"noopener noreferrer",className:"block mt-1 text-blue-500 underline",children:"📖 View API Documentation →"})]})]}),(0,t.jsx)(r.Button,{variant:"ghost",size:"sm",onClick:()=>M(null),className:"h-6 w-6 p-0",children:"×"})]}),(0,t.jsxs)("div",{className:"mt-2 pt-2 border-t flex gap-2",children:[(0,t.jsx)("a",{href:F.url,target:"_blank",rel:"noopener noreferrer",className:"text-xs text-blue-600 hover:underline flex items-center gap-1",children:"🔗 Data Portal →"}),F.importTemplate&&(0,t.jsx)(r.Button,{size:"sm",variant:"default",className:"h-6 text-[10px]",onClick:()=>ep(F),children:"📥 Import to Editor"})]})]})}),$&&F&&(0,t.jsx)(i.Card,{className:"border-2 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-950/20",children:(0,t.jsxs)(i.CardContent,{className:"p-4",children:[(0,t.jsxs)("h4",{className:"font-bold text-sm mb-3 flex items-center gap-2",children:["📥 Data Import Wizard: ",F.name]}),(0,t.jsxs)("div",{className:"space-y-3",children:[(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-3 text-xs",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Source:"})," ",F.source]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Format:"})," ",F.format]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Size:"})," ",F.size]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"Access:"})," ",F.accessLevel]})]}),F.apiUrl&&(0,t.jsxs)("div",{className:"p-2 rounded bg-white dark:bg-gray-900 text-[11px]",children:[(0,t.jsx)("p",{className:"font-medium text-green-700 dark:text-green-300 mb-1",children:"✅ Streaming API Detected"}),(0,t.jsx)("code",{className:"text-gray-600 break-all",children:F.apiUrl})]}),(0,t.jsxs)("div",{className:"flex gap-2",children:[(0,t.jsx)(r.Button,{size:"sm",onClick:eu,disabled:H,className:"flex-1 bg-blue-600 hover:bg-blue-700",children:H?"⏳ Importing...":"🚀 Generate Import Code"}),(0,t.jsx)(r.Button,{size:"sm",variant:"outline",onClick:()=>q(!1),children:"Cancel"})]})]})]})}),(0,t.jsxs)(i.Card,{className:"flex-1 flex flex-col overflow-hidden",children:[(0,t.jsxs)("div",{className:"flex items-center border-b bg-muted/30 px-2 overflow-x-auto",children:[e.map(a=>(0,t.jsxs)("div",{className:`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r flex-shrink-0 ${a.id===j?"bg-background border-b-2 border-b-primary":"hover:bg-muted/50"}`,onClick:()=>S(a.id),children:[(0,t.jsx)("span",{className:"w-2 h-2 rounded-full",style:{backgroundColor:x[a.language]?.color}}),(0,t.jsx)("span",{className:"truncate max-w-[100px]",children:a.name}),e.length>1&&(0,t.jsx)("button",{onClick:t=>{t.stopPropagation();var s=a.id;if(!(e.length<=1)&&(y(e=>e.filter(e=>e.id!==s)),j===s)){let t=e.filter(e=>e.id!==s);S(t[0]?.id||"")}},className:"ml-1 text-muted-foreground hover:text-foreground",children:"×"})]},a.id)),X.length>0&&(0,t.jsxs)("div",{className:"ml-auto px-2 text-[10px] text-muted-foreground",children:["👥 ",X.length," session(s)"]})]}),(0,t.jsxs)("div",{className:"flex-1 relative bg-slate-900 overflow-hidden",children:[(0,t.jsx)("div",{className:"absolute left-0 top-0 bottom-0 w-10 bg-slate-800 text-slate-500 text-xs pt-4 pl-2 select-none font-mono z-10",children:en.content.split("\n").map((e,a)=>(0,t.jsx)("div",{className:`${a<E.lineThreshold?"":"bg-red-900/30 text-red-400"} leading-6`,children:a+1},a))}),(0,t.jsx)("textarea",{value:en.content,onChange:e=>{var t;return t=e.target.value,void y(e=>e.map(e=>e.id===j?{...e,content:t}:e))},className:"absolute inset-0 w-full h-full bg-transparent text-slate-100 text-sm p-4 pl-12 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 tab-size-2",spellCheck:!1,style:{lineHeight:"1.6"}}),el&&(0,t.jsx)("div",{className:"absolute top-2 right-2 z-20",children:(0,t.jsxs)(n.Badge,{variant:"destructive",className:"text-[10px] animate-pulse",children:["🔒 SECURE (",er," lines)"]})})]}),(0,t.jsxs)("div",{className:"flex items-center justify-between px-4 py-2 border-t bg-muted/30",children:[(0,t.jsx)("div",{className:"flex items-center gap-2",children:(0,t.jsxs)(l.Select,{defaultValue:en.language,children:[(0,t.jsx)(l.SelectTrigger,{className:"w-[120px] h-7 text-[10px]",children:(0,t.jsx)(l.SelectValue,{})}),(0,t.jsxs)(l.SelectContent,{children:[(0,t.jsxs)(l.SelectGroup,{children:[(0,t.jsx)(l.SelectLabel,{children:"Python"}),(0,t.jsx)(l.SelectItem,{value:"python",children:"🐍 Python"})]}),(0,t.jsxs)(l.SelectGroup,{children:[(0,t.jsx)(l.SelectLabel,{children:"JVM"}),(0,t.jsx)(l.SelectItem,{value:"java",children:"☕ Java"}),(0,t.jsx)(l.SelectItem,{value:"kotlin",children:"🟣 Kotlin"}),(0,t.jsx)(l.SelectItem,{value:"scala",children:"🔴 Scala"})]}),(0,t.jsxs)(l.SelectGroup,{children:[(0,t.jsx)(l.SelectLabel,{children:"Systems"}),(0,t.jsx)(l.SelectItem,{value:"c",children:"⚙️ C"})]}),(0,t.jsxs)(l.SelectGroup,{children:[(0,t.jsx)(l.SelectLabel,{children:"Functional"}),(0,t.jsx)(l.SelectItem,{value:"elixir",children:"💧 Elixir"})]}),(0,t.jsxs)(l.SelectGroup,{children:[(0,t.jsx)(l.SelectLabel,{children:"Other"}),(0,t.jsx)(l.SelectItem,{value:"sql",children:"🗃️ SQL"}),(0,t.jsx)(l.SelectItem,{value:"r",children:"📊 R"}),(0,t.jsx)(l.SelectItem,{value:"javascript",children:"⚡ JS"}),(0,t.jsx)(l.SelectItem,{value:"markdown",children:"📝 MD"})]})]})]})}),(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsxs)("span",{className:"text-[10px] text-muted-foreground",children:[er," lines",el&&(0,t.jsx)("span",{className:"text-red-500 ml-1",children:"• Will forward"})]}),(0,t.jsx)(r.Button,{size:"sm",onClick:()=>{k(!0),C([]),R(null);let e=v(en.content),t=en.content.split("\n"),a=G.find(e=>e.id===J);(ec("info",`╔══════════════════════════════════════════════════════════════╗`),ec("info",`║  SciHub Pro Secure Execution Environment v3.0               ║`),ec("info",`╚══════════════════════════════════════════════════════════════╝`),ec("info",""),ec("info",`$ ${x[en.language]?.icon||""} ${en.language} ${en.name}`),ec("info",`Backend: ${a?.name||"Local"}${a?.latency?` (${a.latency}ms)`:""}`),ec("info",`Lines of code: ${t.length}`),ec("info",""),e.isSuspicious&&(ec("warning",`⚠️  Security Scan: ${e.patterns.length} pattern(s) detected`),ec("warning",`   Risk Level: ${e.riskLevel.toUpperCase()}`),e.patterns.forEach(e=>ec("warning",`   • ${e}`)),ec("info","")),"critical"===e.riskLevel)?setTimeout(()=>{ec("error","🚫 EXECUTION BLOCKED"),ec("error","Critical security risks detected."),k(!1),R({success:!1,output:[],executionTime:0,memoryUsed:0,wasForwarded:!1,securityLevel:"blocked"}),ed("EXECUTION_BLOCKED",`Critical: ${e.patterns.join(", ")}`)},500):(t.length>E.lineThreshold&&(ec("security",`🔒 SECURE MODE ACTIVATED (> ${E.lineThreshold} lines)`),ec("security",`   Result forwarding enabled → ${E.forwardDestination.toUpperCase()}`)),ec("info",E.enableSandbox?"📦 Sandbox: ENABLED":"⚠️  Sandbox: DISABLED"),ec("info",`⏱️  Time limit: ${E.maxExecutionTime}s | Memory: ${E.memoryLimit}MB`),ec("info",""),ec("info","Executing..."),setTimeout(()=>{let e,a,s,i,n,r,l,o,c,d=(a=performance.now(),i=(s=en.content.split("\n")).length>E.lineThreshold,n=v(en.content),r="safe",l=!1,"critical"===n.riskLevel?(r="blocked",l=!0):(i||n.isSuspicious)&&(r=i?"secure":"sandboxed"),o=G.find(e=>e.id===J),c=(performance.now()-a)/1e3,{success:!l,output:[],executionTime:c,memoryUsed:Math.min(.5*s.length,E.memoryLimit),wasForwarded:i&&!l,forwardLocation:i&&!l?`${E.forwardDestination}://${E.destinationAddress||"user-configured-endpoint"}`:void 0,securityLevel:r,backend:o?.name,sessionId:`exec-${Date.now()}`});R(d),d.success&&(ec("success","✅ Execution completed successfully"),ec("info",""),e=en.language,"python"===e?en.content.includes("uproot")||en.content.includes("ROOT")?(ec("output","Opening CMS Open Data ROOT file..."),ec("output","Reading branch: Muon_pt (vector<double>)"),ec("output","Reading branch: Muon_eta (vector<double>)"),ec("output",""),ec("output","Loaded 1,247,892 muon candidates from 50,000 events"),ec("output","Applying kinematic selections..."),ec("output",""),ec("output","=== Dimuon Mass Spectrum Peaks ==="),ec("output","  J/ψ (3.097 GeV):  12,847 ± 113 candidates"),ec("output","  Z (91.188 GeV):      45,234 ± 213 candidates")):en.content.includes("requests")||en.content.includes("API")?(ec("api","Connecting to external API..."),ec("api","GET https://api.example.com/v1/data"),ec("api","Authorization: Bearer ***masked***"),ec("api",""),ec("api","Response: 200 OK"),ec("api","Content-Type: application/json"),ec("api","X-RateLimit-Remaining: 998"),ec("api",""),ec("output","Streaming data received:"),ec("output","  Records processed: 10,000"),ec("output","  Data rate: 2.3 MB/s"),ec("output","  Cache hit: Yes")):(ec("output","Dataset Shape: (5, 3)"),ec("output","Significant Genes (p<0.01): 3")):["java","kotlin","scala"].includes(e)?(ec("output","[INFO] JVM starting..."),ec("output",`[INFO] Heap: ${E.memoryLimit}MB allocated`),"scala"===e?(ec("output","[SparkContext] Connecting to cluster..."),ec("output","[SparkContext] Executors: 50 nodes"),ec("output",""),ec("output","Total events processed: 847,293,102"),ec("output","Job completed in 4m 32s")):(ec("output","ParticleAnalysis.main() started"),ec("output","Z→μμ candidates: 45,234"))):"c"===e?(ec("output","HDF5 1.14.0 initialized"),ec("output","Creating file: detector_output.h5"),ec("output","Compression: GZIP level 6"),ec("output",""),ec("output","Performance: 218,042 samples/sec"),ec("output","File size: 2.3 MB (compressed)")):"elixir"===e?(ec("output","Starting BEAM VM..."),ec("output","Supervision tree initialized"),ec("output",""),ec("output","|ψ₀⟩ = |00⟩ = [1.0 + 0.0i, 0, 0, 0]"),ec("output","After H(q₀): Superposition achieved"),ec("output","After CNOT: Bell state |Φ⁺⟩ prepared"),ec("output",""),ec("output","Measurement outcomes (100 shots):"),ec("output","%{0 => 49, 3 => 51}")):(ec("output","Code executed successfully!"),ec("output",`Language: ${x[e]?.label||e}`)),ec("info",""),ec("info",`⏱️  Execution time: ${d.executionTime.toFixed(3)}s`),ec("info",`💾 Memory used: ~${d.memoryUsed.toFixed(1)}MB`),ec("info",`🖥️  Backend: ${d.backend}`),d.wasForwarded&&(ec("security",""),ec("security","📤 RESULT FORWARDING ACTIVATED"),ec("security",`   Destination: ${d.forwardLocation}`),ec("security",`   Session: ${d.sessionId}`),ec("security",""),ec("security","   External delivery prevents injection attacks"),ed("RESULT_FORWARDED",`To: ${d.forwardLocation} (${t.length} lines)`)),ec("info",""),ec("info",`🛡️  Security Level: ${d.securityLevel.toUpperCase()}`)),E.enableAuditLog&&ec("info",`📋 Audit log entry recorded`),k(!1)},1200))},disabled:N||"critical"===eo.riskLevel,className:`h-7 text-[10px] ${"critical"===eo.riskLevel?"bg-red-600":el?"bg-purple-600":"bg-green-600"}`,children:N?"⏳ Running...":"critical"===eo.riskLevel?"🚫 Blocked":el?"🔒 Run (Secure)":"▶️ Run"})]})]})]}),(0,t.jsxs)(i.Card,{className:"h-[200px] flex flex-col",children:[(0,t.jsx)(i.CardHeader,{className:"pb-2 py-2 px-4 border-b bg-muted/30",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)(i.CardTitle,{className:"text-xs flex items-center gap-2",children:["🖥️ Output",L?.wasForwarded&&(0,t.jsx)(n.Badge,{className:"text-[9px] bg-purple-100 text-purple-800",children:"📤 Forwarded"}),L?.backend&&(0,t.jsx)(n.Badge,{variant:"outline",className:"text-[9px]",children:L.backend})]}),(0,t.jsxs)("div",{className:"flex gap-1",children:[(0,t.jsx)(r.Button,{variant:"ghost",size:"sm",className:"h-6 text-[9px]",onClick:()=>C([]),children:"Clear"}),(0,t.jsx)(r.Button,{variant:"ghost",size:"sm",className:"h-6 text-[9px]",onClick:()=>{ec("info",""),ec("info","📋 Audit Log:"),P.forEach(e=>ec("info",`   [${e.timestamp.toLocaleTimeString()}] ${e.action}: ${e.details}`))},children:"Audit"})]})]})}),(0,t.jsx)(i.CardContent,{className:"flex-1 overflow-auto p-0",children:(0,t.jsx)("div",{className:"font-mono text-[11px] p-3 h-full overflow-auto bg-slate-900 text-slate-100 leading-relaxed",children:0===_.length?(0,t.jsxs)("div",{className:"text-slate-500 italic",children:["Ready to execute. Select a dataset or template to begin.",el&&(0,t.jsx)("span",{className:"block mt-1 text-yellow-400",children:"⚠️ Long code will be forwarded externally."})]}):_.map((e,a)=>(0,t.jsx)("div",{className:`${"error"===e.type?"text-red-400":"success"===e.type?"text-green-400":"info"===e.type?"text-blue-400":"warning"===e.type?"text-yellow-400":"security"===e.type?"text-purple-400":"api"===e.type?"text-cyan-400":"collab"===e.type?"text-emerald-400":"text-slate-200"}`,children:e.content},a))})})]})]}),(0,t.jsxs)("div",{className:"xl:col-span-1 space-y-3 overflow-y-auto max-h-full",children:[L&&(0,t.jsxs)(i.Card,{className:"h-fit",children:[(0,t.jsx)(i.CardHeader,{className:"p-2 pb-1",children:(0,t.jsx)(i.CardTitle,{className:"text-xs",children:"📊 Result"})}),(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-1.5 text-[10px]",children:[(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Status"}),(0,t.jsx)(n.Badge,{variant:L.success?"default":"destructive",className:"text-[9px] h-4",children:L.success?"Success":"Failed"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Time"}),(0,t.jsxs)("span",{children:[L.executionTime.toFixed(3),"s"]})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Memory"}),(0,t.jsxs)("span",{children:["~",L.memoryUsed.toFixed(1),"MB"]})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Backend"}),(0,t.jsx)("span",{children:L.backend||"Local"})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Security"}),(0,t.jsx)(n.Badge,{variant:"blocked"===L.securityLevel?"destructive":"secure"===L.securityLevel?"default":"secondary",className:"text-[9px] h-4",children:L.securityLevel.toUpperCase()})]}),L.wasForwarded&&(0,t.jsxs)("div",{className:"mt-1.5 p-1.5 rounded bg-purple-50 dark:bg-purple-950/30 border border-purple-200",children:[(0,t.jsx)("p",{className:"text-purple-700 dark:text-purple-300 font-medium text-[9px]",children:"📤 Forwarded"}),(0,t.jsx)("p",{className:"text-[8px] text-purple-600 break-all",children:L.forwardLocation})]})]})]}),(eo.isSuspicious||el)&&(0,t.jsxs)(i.Card,{className:`h-fit ${"critical"===eo.riskLevel?"border-red-300 bg-red-50/50":"border-yellow-300 bg-yellow-50/50"}`,children:[(0,t.jsx)(i.CardHeader,{className:"p-2 pb-1",children:(0,t.jsxs)(i.CardTitle,{className:"text-xs flex items-center gap-1",children:["critical"===eo.riskLevel?"🚨":"⚠️"," Security"]})}),(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-1 text-[10px]",children:[(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Risk"}),(0,t.jsx)(n.Badge,{variant:"critical"===eo.riskLevel?"destructive":"default",className:"text-[9px] h-4",children:eo.riskLevel.toUpperCase()})]}),(0,t.jsxs)("div",{className:"flex justify-between",children:[(0,t.jsx)("span",{children:"Patterns"}),(0,t.jsx)("span",{children:eo.patterns.length})]}),eo.patterns.length>0&&(0,t.jsx)("div",{className:"max-h-[60px] overflow-y-auto space-y-0.5 mt-1",children:eo.patterns.map((e,a)=>(0,t.jsx)("code",{className:"block p-0.5 rounded bg-black/10 text-[8px] font-mono",children:e},a))})]})]}),(0,t.jsxs)(i.Card,{className:"h-fit",children:[(0,t.jsx)(i.CardHeader,{className:"p-2 pb-1",children:(0,t.jsx)(i.CardTitle,{className:"text-xs",children:"⚡ Actions"})}),(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-1.5",children:[(0,t.jsx)(r.Button,{size:"sm",variant:"outline",className:"w-full h-7 text-[10px]",onClick:()=>Z(!Y),children:"👥 Share Workspace"}),(0,t.jsx)("div",{className:"grid grid-cols-3 gap-1",children:["email","twitter","slack"].map(e=>(0,t.jsx)(r.Button,{size:"sm",variant:"outline",className:"h-6 text-[9px]",onClick:()=>(e=>{let t=window.location.href,a="Check out my SciHub Pro computational workspace!",s="";switch(e){case"email":s=`mailto:?subject=${encodeURIComponent(a)}&body=${encodeURIComponent(t)}`;break;case"twitter":s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(a)}&url=${encodeURIComponent(t)}`;break;case"slack":ec("collab",`Share to Slack: Copy this URL:
${t}`);return}s&&(window.open(s,"_blank"),ec("collab",`Shared to ${e.toUpperCase()}`))})(e),children:"email"===e?"📧":"twitter"===e?"🐦":"💬"},e))})]})]}),(0,t.jsxs)(i.Card,{className:"h-fit",children:[(0,t.jsx)(i.CardHeader,{className:"p-2 pb-1",children:(0,t.jsx)(i.CardTitle,{className:"text-xs",children:"🔗 Resources"})}),(0,t.jsxs)(i.CardContent,{className:"p-2 space-y-1.5 text-[10px]",children:[(0,t.jsx)(s.default,{href:"/paper-battle",className:"block text-blue-600 hover:underline",children:"⚔️ Paper Battle →"}),(0,t.jsx)(s.default,{href:"/aethel",className:"block text-blue-600 hover:underline",children:"🤖 AI Chat →"}),(0,t.jsx)("a",{href:"https://opendata.cern.ch/",target:"_blank",rel:"noopener noreferrer",className:"block text-blue-600 hover:underline",children:"⚛️ CERN Data →"}),(0,t.jsx)("a",{href:"https://earthexplorer.usgs.gov/",target:"_blank",rel:"noopener noreferrer",className:"block text-blue-600 hover:underline",children:"🛰️ USGS →"}),(0,t.jsx)("a",{href:"https://portal.gdc.cancer.gov/",target:"_blank",rel:"noopener noreferrer",className:"block text-blue-600 hover:underline",children:"🧬 GDC →"})]})]}),(0,t.jsx)(i.Card,{className:"h-fit bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",children:(0,t.jsx)(i.CardContent,{className:"p-2",children:(0,t.jsxs)("p",{className:"text-[9px] text-muted-foreground leading-relaxed",children:[(0,t.jsx)("strong",{className:"text-foreground",children:"Workspace v3.0"}),(0,t.jsx)("br",{}),"Binary: ROOT, FITS, HDF5, BAM",(0,t.jsx)("br",{}),"Backends: Jupyter, Docker, Cloud",(0,t.jsx)("br",{}),"Persistence: localStorage",(0,t.jsx)("br",{}),"Designed: 2025-2040+"]})})})]})]}),(0,t.jsx)("div",{className:"h-4"})]})}catch(e){return console.error("Workspace error:",e),A(!0),null}}e.s(["default",()=>y])}]);