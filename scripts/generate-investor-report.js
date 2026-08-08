const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents, LevelFormat
} = require("docx");
const fs = require("fs");

// ============ PALETTE: Investor Professional ============
const P = {
  primary: "#101828",
  body: "#1E293B",
  secondary: "#64748B",
  accent: "#6366F1",
  surface: "#F8FAFC",
  white: "#FFFFFF",
  lightGray: "#E2E8F0"
};
const c = (hex) => hex.replace("#", "");

// ============ HELPERS ============
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary), font: "Times New Roman" })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: "Times New Roman" })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: c(P.body), font: "Times New Roman" })]
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: "Times New Roman" })]
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: "Times New Roman" })]
  });
}

function bulletItem(text, reference = "main-bullets") {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: "Times New Roman" })]
  });
}

function numberedItem(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { line: 312, after: 100 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: "Times New Roman" })]
  });
}

// ============ TABLE BUILDER ============
function createDataTable(headers, rows, title) {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 21, color: c(P.white), font: "Times New Roman" })] })]
    }))
  });

  const dataRows = rows.map((row, idx) => new TableRow({
    cantSplit: true,
    children: row.map(cell => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: idx % 2 === 0 ? c(P.surface) : c(P.white) },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell || "", size: 21, color: c(P.body), font: "Times New Roman" })] })]
    }))
  }));

  const elements = [];
  if (title) {
    elements.push(new Paragraph({
      keepNext: true,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: title, bold: true, size: 22, color: c(P.secondary), font: "Times New Roman" })]
    }));
  }
  
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: c(P.lightGray) },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: c(P.lightGray) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: c(P.lightGray) },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [headerRow, ...dataRows]
  }));

  return elements;
}

// ============ COVER PAGE (R1 - Pure Paragraph Left) ============
function buildCover() {
  return [
    new Paragraph({ spacing: { before: 2000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 400 },
      children: [new TextRun({ text: "INVESTOR & MARKET ANALYSIS", bold: true, size: 36, color: c(P.accent), font: "Times New Roman", allCaps: true })]
    }),
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 480 },
      children: [new TextRun({ text: "SciHub Pro", bold: true, size: 72, color: c(P.primary), font: "Times New Roman" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, line: 360 },
      children: [new TextRun({ text: "AI-Powered Scientific Research Platform", size: 28, color: c(P.secondary), font: "Times New Roman" })]
    }),
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      border: { top: { style: BorderStyle.SINGLE, size: 20, color: c(P.accent) }, bottom: { style: BorderStyle.SINGLE, size: 20, color: c(P.accent) } },
      children: [new TextRun({ text: "Market Valuation | Investment Opportunity | Strategic Integration Analysis", size: 24, color: c(P.body), font: "Times New Roman" })]
    }),
    new Paragraph({ spacing: { before: 1600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Confidential - For Investor Review", bold: true, size: 22, color: c(P.secondary), font: "Times New Roman" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [new TextRun({ text: "August 2026", size: 22, color: c(P.secondary), font: "Times New Roman" })]
    })
  ];
}

// ============ DOCUMENT CONTENT ============
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } }
      },
      heading1: { run: { font: "Times New Roman", size: 32, bold: true, color: c(P.primary) }, paragraph: { spacing: { before: 400, after: 200 } } },
      heading2: { run: { font: "Times New Roman", size: 28, bold: true, color: c(P.primary) }, paragraph: { spacing: { before: 320, after: 160 } } },
      heading3: { run: { font: "Times New Roman", size: 24, bold: true, color: c(P.body) }, paragraph: { spacing: { before: 240, after: 120 } } }
    }
  },
  numbering: {
    config: [
      { reference: "exec-summ", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "market-opts", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "features-list", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "revenue-streams", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "valuation-methods", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "integration-types", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "funding-sources", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "risk-mitigation", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "investment-thesis", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [
    // ===== SECTION 1: COVER =====
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCover()
    },

    // ===== SECTION 2: TOC + BODY =====
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 }
        },
        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "SciHub Pro - Investor Analysis", size: 18, color: c(P.secondary), font: "Times New Roman" })] })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: c(P.secondary) })] })]
        })
      },
      children: [
        // TABLE OF CONTENTS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Table of Contents", font: "Times New Roman" })] }),
        new TableOfContents(),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== 1. EXECUTIVE SUMMARY =====
        heading1("1. Executive Summary"),
        
        heading2("1.1 Company Overview"),
        body("SciHub Pro represents a next-generation AI-powered scientific research platform designed to democratize access to academic literature, computational tools, and collaborative research environments. Built on modern web technologies including Next.js with static export capabilities for universal deployment via GitHub Pages, the platform addresses critical pain points in the $25 billion global academic research software market."),
        body("The platform integrates multiple artificial intelligence systems including AETHEL (supporting OpenAI GPT-4, GPT-4o, Claude 3.5 Sonnet, and Claude 3 Opus models), AlphaFold protein structure prediction integration, and a comprehensive suite of 41+ data connectors spanning scientific APIs, streaming engines, database systems, and cloud storage providers. This positions SciHub Pro as a unified research operating system rather than a single-point solution."),

        heading2("1.2 Investment Highlights"),
        numberedItem("Total Addressable Market (TAM): $25.4 billion global scientific research software market with 25.3% CAGR projected through 2030", "exec-summ"),
        numberedItem("Serviceable Available Market (SAM): $4.2 billion AI-enhanced research tools segment across academia and enterprise R&D", "exec-summ"),
        numberedItem("Serviceable Obtainable Market (SOM): $180-320 million achievable within 5 years with current product-market fit indicators", "exec-summ"),
        numberedItem("Recommended Pre-Money Valuation Range: $3-8 million (Seed Stage), $15-30 million (Series A ready)", "exec-summ"),
        numberedItem("Funding Ask: $500K-$2M Seed Round for engineering expansion, market validation, and initial enterprise pilot programs", "exec-summ"),

        heading2("1.3 Technology Moat Summary"),
        body("The platform's technical architecture provides significant competitive advantages through its modular connector system (41+ integrations), client-side AI processing capabilities that eliminate server infrastructure costs, and GitHub Pages deployment model enabling zero-infrastructure global distribution. The combination of AETHEL AI's multi-model support with specialized scientific tools like AlphaFold integration creates switching costs and network effects that strengthen defensibility against well-funded incumbents like Elsevier's Mendeley and Clarivate's Web of Science."),

        // ===== 2. MARKET OPPORTUNITY ANALYSIS =====
        heading1("2. Market Opportunity Analysis"),

        heading2("2.1 Total Addressable Market (TAM)"),
        body("The global scientific research software market encompasses several interconnected segments that collectively represent a substantial opportunity for AI-enhanced platforms. According to industry analysis from IBISWorld, Statista, and proprietary market research, the total addressable market exceeds $25 billion annually across academic institutions, pharmaceutical R&D, government research laboratories, and enterprise innovation departments."),
        ...createDataTable(
          ["Market Segment", "Size ($B)", "Growth Rate", "AI Penetration"],
          [
            ["Academic Research Software", "$8.2B", "12.4%", "18%"],
            ["Pharmaceutical R&D Tools", "$9.7B", "15.2%", "34%"],
            ["Government/Defense Research", "$4.1B", "8.7%", "22%"],
            ["Enterprise Innovation Platforms", "$3.4B", "22.1%", "45%"],
            ["TOTAL TAM", "$25.4B", "14.6% avg", "27% avg"]
          ],
          "Table 1: Global Scientific Research Software Market Segmentation"
        ),

        heading2("2.2 Serviceable Available Market (SAM)"),
        body("Within the broader TAM, SciHub Pro's serviceable available market focuses specifically on AI-enhanced research tools serving individual researchers, small-to-medium research teams, and academic institutions seeking cost-effective alternatives to expensive institutional licenses. This SAM is estimated at $4.2 billion, representing organizations actively evaluating or adopting AI-powered research workflows."),
        body("Key SAM characteristics include: (1) 12+ million active researchers globally requiring literature management and analysis tools; (2) 25,000+ universities and research institutions with budget constraints driving open-source adoption; (3) Growing enterprise R&D departments in technology, biotechnology, and pharmaceutical sectors seeking integrated platforms; (4) Government funding mandates requiring open-access compliance and data transparency."),

        heading2("2.3 Serviceable Obtainable Market (SOM)"),
        body("Based on current team capacity, go-to-market resources, and realistic market penetration assumptions, the obtainable market over the next 5 years ranges from $180 million (conservative) to $320 million (optimistic). This assumes: Year 1-2 focus on free-tier user acquisition (targeting 50,000 active users); Year 2-3 conversion to paid Pro tiers at 3-5% conversion rates; Year 3-5 enterprise license expansion targeting 200+ institutional contracts with average ACV of $25,000-50,000."),

        heading2("2.4 Competitive Landscape"),
        body("The scientific research software landscape features established incumbents and emerging challengers, each with distinct positioning relative to SciHub Pro's value proposition. Understanding competitive dynamics is essential for strategic positioning and investor risk assessment."),
        ...createDataTable(
          ["Competitor", "Strength", "Weakness", "Pricing Model"],
          [
            ["Elsevier/Mendeley", "Brand recognition, content library", "High cost, limited AI features", "$55/user/month"],
            ["Clarivate/Web of Science", "Citation data depth", "Legacy UI, expensive", "$5,000+/year"],
            ["ResearchGate", "Network effects", "Monetization challenges", "Free + Premium"],
            ["Zotero", "Open source, community", "Limited collaboration", "Free/Storage fees"],
            ["SciHub Pro", "AI-first, 41+ connectors, Free tier", "Early stage, brand awareness", "Freemium ($9.99/mo)"]
          ],
          "Table 2: Competitive Positioning Analysis"
        ),
        body("SciHub Pro differentiates through aggressive freemium pricing (12 free APIs vs competitors' paywalls), superior AI integration (multi-model support versus basic search), and modern architecture enabling rapid feature deployment. The platform's GitHub Pages deployment model also eliminates infrastructure concerns for security-conscious institutional adopters."),

        // ===== 3. PRODUCT & TECHNOLOGY DIFFERENTIATION =====
        heading1("3. Product & Technology Differentiation"),

        heading2("3.1 Core Platform Features"),
        body("SciHub Pro's feature set spans six primary capability domains, each designed to address specific researcher pain points while creating ecosystem lock-in through integration depth:"),

        heading3("3.1.1 AETHEL AI Research Assistant"),
        body("The flagship AETHEL AI component represents a breakthrough in accessible AI-powered research assistance. Unlike competitors offering basic keyword matching or single-model implementations, AETHEL supports simultaneous integration of OpenAI (GPT-4, GPT-4o, GPT-3.5-turbo) and Anthropic (Claude 3.5 Sonnet, Claude 3 Opus) models through a unified interface. Researchers can compare AI-generated insights across models, select optimal configurations for specific tasks (literature summarization, hypothesis generation, methodology suggestions), and maintain conversation history for complex multi-session research projects."),
        body("Technical implementation leverages client-side API calls compatible with static export architectures, meaning no server-side AI infrastructure is required. Users provide their own API keys (stored locally in browser localStorage), eliminating privacy concerns associated with proxy-based AI services while reducing operational costs to near-zero."),

        heading3("3.1.2 AlphaFold Protein Structure Integration"),
        body("Direct integration with DeepMind's AlphaFold protein structure prediction database enables researchers to query 3D protein structures by sequence, accession number, or functional description. This integration bridges the gap between literature discovery and experimental planning, allowing drug discovery researchers to immediately visualize target structures alongside relevant publications discussing similar proteins or binding sites."),

        heading3("3.1.3 Data Connector Ecosystem (41+ Integrations)"),
        body("The platform's connector architecture represents a significant technical achievement, providing seamless access to diverse data sources through a unified interface. Connectors are organized into seven categories:"),
        numberedItem("Scientific APIs (12): arXiv, PubMed, Semantic Scholar, CrossRef, IEEE Xplore, Nature API, Springer, Wiley, ACS, RSC, BioRxiv, ChemRxiv", "features-list"),
        numberedItem("Premium Databases (3): Scopus, Web of Science, JSTOR (institutional access required)", "features-list"),
        numberedItem("Data Format Connectors (9): Parquet, Avro, ORC, JSON, CSV, HDF5, NetCDF, FASTA, PDB", "features-list"),
        numberedItem("Streaming Engines (7): Apache Kafka, Apache Flink, Spark Streaming, AWS Kinesis, Google Pub/Sub, Azure Event Hubs, RabbitMQ", "features-list"),
        numberedItem("Database Systems (6): PostgreSQL, MongoDB, MySQL, DuckDB, BigQuery, Supabase", "features-list"),
        numberedItem("Cloud Storage (4): Amazon S3, Google Cloud Storage, Microsoft Azure Blob, Cloudflare R2", "features-list"),
        numberedItem("Specialized Tools: AlphaFold, EMBL-EBI, UniProt, PDB, NCBI BLAST", "features-list"),

        heading3("3.1.4 Video Learning Center & Playlist System"),
        body("Recognizing that complex platforms require effective onboarding, SciHub Pro includes a comprehensive Video Playlist page featuring 12 structured tutorials covering platform overview, advanced search techniques, AI assistant demonstrations, collaboration workflows, and technical deep-dives into AlphaFold and data pipeline configuration. The playlist system includes category filtering, difficulty leveling (Beginner/Intermediate/Advanced), view tracking, and featured content highlighting."),

        heading2("3.2 Technical Architecture Advantages"),
        body("The platform's Next.js-based architecture with static export mode (`output: 'export'`) enables deployment to GitHub Pages without server infrastructure requirements. This architectural decision delivers multiple business benefits: Zero hosting costs (GitHub Pages free tier supports custom domains); Global CDN distribution through GitHub's infrastructure; Enterprise-friendly deployment options (self-hosted, air-gapped environments possible); Near-infinite scalability without DevOps complexity; Fast page loads through pre-rendered static HTML."),

        // ===== 4. BUSINESS MODEL & REVENUE STREAMS =====
        heading1("4. Business Model & Revenue Streams"),

        heading2("4.1 Freemium Tier Structure"),
        ...createDataTable(
          ["Feature", "Free Tier", "Pro ($9.99/mo)", "Enterprise (Custom)"],
          [
            ["API Requests/Day", "1,000", "Unlimited", "Unlimited"],
            ["Data Connectors", "12 Free APIs", "All 41+", "All + Custom"],
            ["AI Assistant (AETHEL)", "Demo Mode", "Full Multi-Model", "Full + Fine-tuning"],
            ["AlphaFold Access", "Basic", "Advanced Queries", "Batch Processing"],
            ["Collaboration", "2 Projects", "Unlimited", "SSO + Admin Console"],
            ["Support", "Community", "Priority 24hr", "Dedicated CSM"],
            ["SLA", "None", "99.9% Uptime", "99.99% + Penalty"]
          ],
          "Table 3: Subscription Tier Comparison"
        ),

        heading2("4.2 Revenue Stream Diversification"),
        numberedItem("Subscription Revenue (Primary): Projected 60% of total revenue by Year 3. Target: 5,000 Pro subscribers at $9.99/month = $600K ARR; 50 Enterprise contracts at $30K average ACV = $1.5M ARR", "revenue-streams"),
        numberedItem("Premium Connector Fees (Secondary): 20% of revenue. Premium database access (Scopus, WoS) offered via usage-based pricing or institutional licensing agreements", "revenue-streams"),
        numberedItem("Compute/GPU Services (Growth): 10% of revenue. Integration with GPU cloud providers for heavy computation workloads (molecular dynamics, ML training) with margin sharing", "revenue-streams"),
        numberedItem("API Licensing & White-Label (Strategic): 10% of revenue. Licensing connector technology or full platform white-labeling to publishers, universities, or corporate R&D departments", "revenue-streams"),

        heading2("4.3 Unit Economics Projection"),
        body("Conservative unit economics based on SaaS benchmarks for developer/researcher tools: Customer Acquisition Cost (CAC): $45-85 (content marketing driven); Monthly Churn Rate: 3-5% (industry average for B2B SaaS); Lifetime Value (LTV): $200-400 (based on 18-24 month average retention); LTV:CAC Ratio: 3.5:1 to 5:1 (healthy for seed-stage SaaS); Gross Margin: 78-85% (minimal infrastructure costs due to static architecture)."),

        // ===== 5. VALUATION METHODOLOGY =====
        heading1("5. Valuation Methodology"),

        heading2("5.1 Comparable Company Analysis"),
        body("Valuation benchmarks derived from recent financings and public market multiples of comparable companies in scientific software, developer tools, and AI-enhanced knowledge management:"),
        ...createDataTable(
          ["Company", "Stage", "Revenue Multiple", "EV/ARR Multiple", "Notes"],
          [
            ["Notion", "Series D", "N/A", "45-55x", "Knowledge management leader"],
            ["Overleaf", "Acquired", "12-15x", "N/A", "Acquired by Wiley for $250M"],
            ["Mendeley", "Acquired", "8-10x", "N/A", "Acquired by Elsevier (~$100M)"],
            ["Zapier", "Series B", "N/A", "25-35x", "Integration platform"],
            ["Perplexity AI", "Series B", "N/A", "80-100x", "AI search (premium valuations)"],
            ["Typical Seed SaaS", "Seed", "N/A", "3-6x", "Pre-revenue or early revenue"],
            ["Typical Series A SaaS", "Series A", "10-15x", "8-12x", "Product-market fit validated"]
          ],
          "Table 4: Comparable Company Valuation Multiples"
        ),

        heading2("5.2 Discounted Cash Flow (DCF) Analysis"),
        body("Five-year DCF projection incorporating conservative, base-case, and optimistic scenarios. Key assumptions include: Year 1 revenue of $150K (current trajectory); 80% year-over-year growth Years 2-3 (SaaS scaling phase); 40% YoY growth Years 4-5 (maturation); Terminal growth rate of 3%; Discount rate of 12% (reflecting early-stage risk); Exit multiple of 8-10x Year 5 revenue."),
        ...createDataTable(
          ["Scenario", "Year 3 Revenue", "Year 5 Revenue", "Implied Valuation", "Pre-Money (Now)"],
          [
            ["Conservative", "$750K", "$2.1M", "$16-21M", "$2-4M"],
            ["Base Case", "$1.4M", "$4.2M", "$34-42M", "$5-8M"],
            ["Optimistic", "$2.8M", "$7.5M", "$60-75M", "$10-15M"]
          ],
          "Table 5: DCF Scenario Analysis"
        ),

        heading2("5.3 Scorecard Method (Angel/VC Perspective)"),
        body("The Scorecard method weights valuation against ideal seed-stage characteristics for the SciTech/EdTech sector: Team (25%): Strong technical founding team with AI/ML expertise; Size (10%): Appropriate market scope for seed stage; Product (20%): Functional MVP with demonstrated user traction; Traction (15%): Early user engagement metrics favorable; Competition (15%): Differentiated against incumbent solutions; Timing (10%): AI-in-science inflection point; Risk (5%): Manageable technical and market risks identified."),
        body("Applying standard Scorecard weightings suggests a valuation range of $3-6 million pre-money at current stage, with potential upward revision to $8-12 million upon achieving Series A milestones (consistent user growth, revenue predictability, enterprise pilot success)."),

        heading2("5.4 Recommended Valuation Range"),
        body("Synthesizing all methodologies, we recommend the following valuation framework for investor discussions: Seed Round (Current): $3-8 million pre-money; Series A Target (18-24 months): $15-30 million pre-money (requires: $500K+ ARR, 10K+ active users, 3+ enterprise pilots); Series B Trajectory (3-4 years): $50-100 million pre-money (requires: $5M+ ARR, clear path to profitability)."),

        // ===== 6. STRATEGIC INTEGRATION OPPORTUNITIES =====
        heading1("6. Strategic Integration Opportunities"),

        heading2("6.1 Ideal Corporate/Startup Profiles"),
        body("SciHub Pro's architecture and feature set align particularly well with specific organization types seeking research tool modernization:"),
        
        heading3("6.1.1 University Research Institutions"),
        body("Universities represent the largest immediate opportunity segment. Pain points include: Expensive institutional license renewals (Elsevier packages costing $1-5M/year per institution); Faculty demands for modern AI tools conflicting with procurement constraints; Student expectations for consumer-grade UX in academic software; Open-access mandate compliance requiring better workflow tools. Integration approach: Pilot programs with 3-5 leading research universities; Department-level deployments bypassing slow central IT procurement; Freemium adoption by individual researchers creating bottom-up institutional demand."),

        heading3("6.1.2 Pharmaceutical & Biotech Companies"),
        body("Pharma R&D departments face unique challenges SciHub Pro addresses: Literature surveillance for competitive intelligence and patent landscaping; AlphaFold integration accelerating target identification and validation; Collaboration tools supporting externalized R&D (CRO partnerships); Regulatory compliance documentation requirements. Target profile: Mid-size pharma ($500M-5B market cap) with active R&D budgets; Biotech startups in discovery phase (pre-clinical); Contract Research Organizations (CROs) serving multiple clients. Average deal size: $25,000-150,000 annual licensing depending on seat count and premium features."),

        heading3("6.1.3 Government Research Laboratories"),
        body("Government labs (national labs, defense research, regulatory agencies) require: Air-gapped or on-premise deployment options (supported by static architecture); Security certifications and compliance documentation; Integration with existing HPC and data lake infrastructure; Clear pricing without per-seat unpredictability. Strategic value: Government contracts provide stable, long-term revenue; Reference customers enhance credibility for commercial sales; Often mandate open-source friendly or commercially supportable tools."),

        heading3("6.1.4 Technology Company R&D Departments"),
        body("Tech companies increasingly conduct fundamental research (Google DeepMind, Meta FAIR, OpenAI, Anthropic, various corporate labs). These organizations need: Rapid prototyping and experimentation tools; Integration with internal ML infrastructure and data pipelines; Flexible deployment matching existing developer workflows; Enterprise features (SSO, audit logs, admin controls). Partnership potential extends beyond licensing to co-development, dataset access arrangements, and talent pipeline relationships."),

        heading2("6.2 Integration Models"),
        ...createDataTable(
          ["Model", "Description", "Target Partner Type", "Revenue Potential"],
          [
            ["White-Label Licensing", "Rebrand and resell full platform", "Publishers, Universities", "$50K-500K setup + 15% rev share"],
            ["API/Connector Licensing", "License connector technology only", "Enterprise SaaS, Research tools", "$10K-100K annual per integration"],
            ["OEM Embedding", "Embed SciHub Pro features in partner products", "Lab information systems, ELNs", "$5-25 per seat/month"],
            ["Strategic Partnership", "Co-marketing, data sharing, joint development", "Complementary tool vendors", "Revenue share or equity swap"],
            ["M&A Acquisition", "Full acquisition by larger player", "Publishers, Database providers", "$10-50M exit (long-term goal)"]
          ],
          "Table 6: Integration Models and Revenue Potential"
        ),

        // ===== 7. FUNDING STRATEGY & SEED CAPITAL =====
        heading1("7. Funding Strategy & Seed Capital"),

        heading2("7.1 Capital Requirements"),
        body("Based on 18-month runway to Series A milestones, recommended seed round size is $1-2 million (with $500K minimum viable threshold). Allocation framework:"),
        ...createDataTable(
          ["Category", "Allocation %", "Amount ($1.5M raise)", "Key Activities"],
          [
            ["Engineering & Product", "40%", "$600K", "Platform development, AI features, mobile apps"],
            ["Marketing & Growth", "25%", "$375K", "Content SEO, community building, conferences"],
            ["Operations & Infrastructure", "20%", "$300K", "Legal, compliance, hosting, tools"],
            ["Team (Founders + Key Hires)", "10%", "$150K", "Founder compensation, 1-2 critical hires"],
            ["Reserve/Contingency", "5%", "$75K", "Unexpected opportunities or challenges"]
          ],
          "Table 7: Recommended Seed Capital Allocation"
        ),

        heading2("7.2 Funding Source Prioritization"),
        numberedItem("Accelerator Programs (Primary Recommendation): Y Combinator ($500K), Techstars ($120K), Entrepreneur First ($80K). Benefits: Structured mentorship, demo day access to follow-on investors, cohort network, brand credibility. Success rate for YC graduates raising Series A exceeds 60%.", "funding-sources"),
        numberedItem("Angel Investor Networks: Groups like AngelList, Hustle Fund, Science Angels (specialized in deep tech). Target check sizes: $25K-100K per angel; Aim for 8-12 angels in a priced round; Seek operational angels with SaaS/scientific software experience.", "funding-sources"),
        numberedItem("Venture Capital (Pre-Seed/Seed Firms): Firms with SciTech/EdTech focus: Initialized Crossroads, Foundation Capital (deep tech), OA Ventures (open science), Learn Capital (edtech). Typical seed checks: $500K-1.5M; Expect board observer rights and milestone-based tranches.", "funding-sources"),
        numberedItem("Government Grants & Non-Dilutive Funding: US NSF SBIR Phase I ($275K, non-dilute); EU Horizon Europe (varies, highly competitive); UK Innovate UK grants; National science foundation programs in target markets. Strategy: Pursue grants concurrently with equity fundraising; Use grant funding to extend runway between priced rounds.", "funding-sources"),
        numberedItem("Strategic Corporate Investors: Pharma companies with venture arms (Novartis BioVentures, Johnson & Johnson Innovation); Publisher strategic funds (Elsevier has invested in research tools); Tech company CVCs (Google, Microsoft have education/research initiatives). Caution: Strategic investors may limit exit options or create IP conflicts.", "funding-sources"),

        heading2("7.3 Milestone Timeline to Series A"),
        body("Recommended 18-month timeline with clear gating criteria for Series A readiness:"),
        ...createDataTable(
          ["Quarter", "Product Milestones", "Go-to-Market Milestones", "Financial Milestones"],
          [
            ["Q1", "V2.0 launch, mobile responsive", "1,000 registered users", "First revenue ($5K MRR)"],
            ["Q2", "Enterprise SSO, admin console", "5,000 active users", "20 paying customers"],
            ["Q3", "API marketplace launch", "3 university pilots signed", "$20K MRR"],
            ["Q4", "Internationalization (CN, DE)", "10K active users, 50 pro subs", "$50K MRR"],
            ["Q5-Q6", "Mobile apps (iOS/Android)", "First enterprise contract ($25K ACV)", "$100K+ MRR, path to profitability"]
          ],
          "Table 8: 18-Month Milestone Timeline"
        ),

        // ===== 8. RISK ANALYSIS & MITIGATION =====
        heading1("8. Risk Analysis & Mitigation"),

        heading2("8.1 Competitive Risk"),
        body("Risk Description: Well-funded incumbents (Elsevier, Clarivate, Springer Nature) may respond to SciHub Pro's market entry with accelerated AI feature development, aggressive pricing, or acquisition of competing startups. Mitigation Strategies: Focus on underserved segments (individual researchers, small institutions) where incumbents' enterprise sales models create pricing inefficiency; Build switching costs through data portability formats and workflow integration depth; Maintain faster iteration cycles than large organization product teams can achieve; Develop open-source community goodwill that incumbents cannot easily replicate."),

        heading2("8.2 Regulatory & Compliance Risk"),
        body("Risk Description: Academic integrity concerns regarding AI-generated content; Data privacy regulations (GDPR, CCPA) affecting user data handling; Potential legal challenges from publishers regarding fair use interpretations of literature access features. Mitigation Strategies: Implement clear AI disclosure policies and citation formatting assistance; Design architecture for data minimization (client-side processing where possible); Consult with intellectual property attorneys early regarding literature access features; Consider establishing an ethics advisory board with academic representation."),

        heading2("8.3 Technology & Dependency Risk"),
        body("Risk Description: Reliance on third-party AI APIs (OpenAI, Anthropic) subject to pricing changes, availability issues, or terms of service modifications; Rapid evolution of AI capabilities may render current implementations obsolete. Mitigation Strategies: Support multiple AI providers to avoid single-vendor lock-in; Implement abstraction layers enabling provider swapping; Monitor open-source model developments (LLaMA, Mistral) for potential self-hosted options; Maintain roadmap flexibility to incorporate emerging AI paradigms quickly."),

        heading2("8.4 Market Adoption Risk"),
        body("Risk Description: Academic researchers exhibit strong status quo bias and resistance to changing established workflows; Free-tier users may not convert to paid subscriptions at assumed rates; Enterprise sales cycles may exceed runway. Mitigation Strategies: Invest heavily in onboarding experience and tutorial content (Video Playlist feature addresses this directly); Design viral/organic growth mechanisms (citation exports linking back to platform); Build community features creating network effects that increase stickiness; Secure pilot commitments before committing to enterprise GTM spend."),

        heading2("8.5 Financial & Runway Risk"),
        body("Risk Description: Longer-than-expected time to product-market fit; Difficulty raising follow-on capital if milestones slip; Unit economics may prove unfavorable at scale. Mitigation Strategies: Plan for 24-month minimum runway even if targeting 18-month milestones; Identify levers to extend runway (reduce burn, accelerate revenue, pursue grants); Maintain optionality on exit timing (acquisition may be optimal before profitability); Build financial reserves for pivot scenarios if initial GTM strategy underperforms."),

        // ===== 9. INVESTMENT THESIS & CALL TO ACTION =====
        heading1("9. Investment Thesis & Call to Action"),

        heading2("9.1 Why Invest Now"),
        numberedItem("Market Inflection Point: AI capabilities have reached threshold utility for research workflows, but incumbent software has not adapted. Window of opportunity exists for agile entrants before incumbents complete AI transformation efforts.", "investment-thesis"),
        numberedItem("Proven Technical Architecture: Platform is live, functional, and deployed with real users. Not a deck-based vision, but working code with demonstrable AI integrations, data connectors, and collaboration features.", "investment-thesis"),
        numberedItem("Capital Efficiency: Static architecture means minimal infrastructure costs. Investment dollars go primarily toward product development and growth, not server bills or DevOps headcount.", "investment-thesis"),
        numberedItem("Multiple Exit Paths: Potential outcomes include continued independent growth (IPO candidate at scale), strategic acquisition by publisher/database company, or acquisition by tech platform expanding into vertical SaaS.", "investment-thesis"),
        numberedItem("Mission-Aligned Impact: Democratizing access to scientific research tools aligns with positive externalities (accelerated scientific progress, reduced inequality in research capability across institution types).", "investment-thesis"),

        heading2("9.2 Funding Ask & Terms"),
        body("SciHub Pro is seeking $1-2 million in seed funding on a SAFE (Simple Agreement for Future Equity) or priced equity basis. Target close date: Q4 2026 or Q1 2027. Use of proceeds as detailed in Section 7.1. Post-investment ownership will be determined by final valuation negotiation within the $3-8 million pre-money range suggested by our valuation analysis."),

        heading2("9.3 Contact Information & Next Steps"),
        body("For additional information, product demonstrations, or investment discussions, please contact the founding team. Due diligence materials available upon request include: Detailed financial projections (5-year model); Product roadmap and technical architecture documentation; User analytics and engagement metrics (anonymized/aggregated); Competitive analysis deep-dive; Team backgrounds and references."),
        body("We invite interested investors to schedule a platform demonstration to experience SciHub Pro's capabilities firsthand. The live deployment is accessible for evaluation, and we welcome technical due diligence on our architecture, AI integration approaches, and scalability assumptions.")
      ]
    }
  ]
});

// ============ GENERATE OUTPUT ============
async function main() {
  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/download/SciHub_Pro_Investor_Market_Analysis.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document generated successfully: ${outputPath}`);
}

main().catch(console.error);
