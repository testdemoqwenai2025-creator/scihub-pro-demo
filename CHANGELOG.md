# Changelog

All notable changes to SciHub Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features
- Collaboration Features (share battles, comments, real-time presence)
- Advanced analytics dashboard
- Mobile app (React Native)
- Plugin system for custom integrations

---

## [1.4] - 2025-01-08

### Added
- **Export Reports System** (`/src/components/features/ReportGenerator.tsx`)
  - Multi-format report generation: Markdown (.md), Plain Text (.txt), JSON (.json), BibTeX (.bib)
  - Report types: Debate summaries, Literature search reports, AI conversation transcripts
  - One-click copy to clipboard and download functionality
  - Report preview with line/character/size statistics
  - Reusable component for integration across pages

- **User Authentication & Profile System** (`/src/app/settings/page.tsx`)
  - Demo authentication mode (localStorage-based, no backend required)
  - User registration with name, email, organization, role selection
  - User profile management with bio and preferences
  - Session persistence across page reloads
  - Login/Register dialog components

- **Activity History Tracking**
  - Automatic activity logging for: searches, AI chats, paper saves, exports, settings changes
  - Activity timeline with icons and timestamps
  - "Time ago" relative date formatting
  - Persistent storage (up to 100 activities)

- **Battle History Persistence**
  - Battle/debate history storage with full metadata
  - Topic, participants, winner, rounds count, duration tracking
  - Export battle history as formatted reports
  - Clear history functionality

- **Enhanced Settings Page** (5 tabs)
  - **Profile Tab**: Personal information form, account statistics dashboard
  - **Preferences Tab**: Theme, font size, notification toggles
  - **History Tab**: Complete activity timeline
  - **Battles Tab**: Debate history with export capability
  - **Data Tab**: Data management, export all data, storage usage visualization

- **Data Management**
  - Full JSON export of user data (profile, settings, history)
  - Local storage usage visualization per category
  - Reset to defaults option
  - Delete all local data option

### Changed
- Settings page completely rewritten with tabbed interface
- Added ReportGenerator import to settings page
- localStorage keys now organized under `scihub_` namespace

### Files Modified
- `src/app/settings/page.tsx` - Complete rewrite with auth/history features
- `src/components/features/ReportGenerator.tsx` - New file

---

## [1.3] - 2025-01-08

### Added
- **Enhanced Paper Details Dialog** (`/src/app/query/page.tsx`)
  - Tabbed interface with 5 views: Overview, Read, Citations, Related, Export
  
  - **Overview Tab**
    - Authors display with badges
    - Full abstract with formatting
    - Metrics grid: Citations, Year, Author count, Open Access status
    - External links: arXiv, HTML5 version, PDF, DOI, PubMed
    - Personal notes per paper (localStorage)
    - Save/bookmark toggle with star icon
  
  - **Read Tab (PDF/HTML Viewer)**
    - Inline arXiv HTML5 viewer via ar5iv.labs.arxiv.org
    - Embedded iframe for seamless reading experience
    - Fallback to PDF download when HTML unavailable
    - "No Preview Available" state with link to original source
  
  - **Citations Tab**
    - Live citation count fetching from Semantic Scholar API
    - Citation impact visualization bars (Highly Cited, Well Cited, Emerging)
    - SVG-based citation network graph visualization
    - Dynamic node sizing based on citation count
  
  - **Related Papers Tab**
    - Auto-fetch related papers from Semantic Scholar API
    - Display title, authors, year, citation count
    - "Load Related" button for on-demand loading
  
  - **Export Tab**
    - BibTeX format (for LaTeX/papers)
    - RIS format (for EndNote/Zotero)
    - APA style (7th edition)
    - MLA style (9th edition)
    - One-click copy with success indicator
    - BibTeX preview expandable section
    - Raw metadata JSON export

- **Paper Save/Bookmark System**
  - Star icon on each search result row
  - Toggle save/unsave functionality
  - Persisted in localStorage
  - Saved count displayed in header
  - Visual feedback (filled/empty star)

- **arXiv Categories Display**
  - Category extraction from arXiv XML responses
  - Badge display for each paper's categories
  - Up to 3 categories shown per paper

### Changed
- SearchResultRow component enhanced with save button
- PaperDetailDialog completely rewritten with tabs
- Added new helper components: ExternalLink, ExportButton, ImpactBar, CitationGraphVisualization
- Search results table now shows save star icon in first column

### Files Modified
- `src/app/query/page.tsx` - Enhanced paper details with tabs, viewer, citations, export

---

## [1.2] - 2025-01-08

### Added
- **Real arXiv API Integration** (`/src/app/query/page.tsx`)
  - Direct calls to arXiv export API (free, no API key required)
  - Search across 2M+ scientific preprints
  - XML parsing for paper metadata extraction
  - Fields retrieved: title, authors, abstract, categories, journal reference, DOI
  - PDF link detection from arXiv links
  - arXiv HTML5 URL generation (ar5iv.labs.arxiv.org)
  - Error handling with fallback to demo data

- **Real Semantic Scholar API Integration** (`/src/app/query/page.tsx`)
  - Direct calls to Semantic Scholar Graph API (free, no API key required)
  - Search across 200M+ academic papers
  - JSON response parsing
  - Fields retrieved: title, authors, year, citationCount, abstract, venue, openAccessPdf, externalIds
  - DOI, ArXiv, PubMed ID cross-references
  - Open access PDF URL availability

- **Multi-Source Search**
  - "All Sources" mode: combines results from both APIs
  - "arXiv Only" mode: searches only arXiv preprints
  - "Semantic Scholar Only" mode: searches only S2 database
  - Source-specific result counts in header
  - Per-source status indicators (Live badges)

- **Paper Detail Dialog**
  - Modal dialog for viewing complete paper information
  - Authors list with badge styling
  - Abstract display with background highlight
  - Metrics cards: Citations (with live fetch), Year, Authors, OA Status
  - External source links (arXiv, S2, DOI, PubMed)
  - One-click BibTeX copy with success feedback
  - BibTeX preview (expandable)
  - Raw JSON metadata export

- **Source Badges**
  - Orange badge for arXiv papers (📄 arXiv)
  - Blue badge for Semantic Scholar papers (🔍 S2)
  - Green badge for open access papers
  - PDF available indicator (📕 icon)

- **API Status Indicators**
  - Real-time API status display in search bar
  - Green dot + "Online" text for both APIs
  - Free tier notification ("No authentication required")

### Changed
- Search page completely rewritten with real API integration
- Sample data now serves as fallback when APIs unavailable
- Error handling with graceful degradation
- Search statistics sidebar showing per-source breakdown

### Technical Details
- All API calls are client-side (compatible with static export)
- CORS mode enabled for browser requests
- No server-side dependencies
- Rate limiting handled by API providers

### Files Modified
- `src/app/query/page.tsx` - Complete rewrite with real API integration

---

## [1.1] - 2025-01-08

### Added
- **Real LLM Integration** (`/src/app/aethel/page.tsx`)
  
  - **OpenAI API Support**
    - GPT-4o: Most capable model, optimized for speed
    - GPT-4 Turbo: High-intelligence with extended context
    - GPT-3.5 Turbo: Fast and cost-effective
    - Direct API calls to https://api.openai.com/v1/chat/completions
  
  - **Anthropic Claude API Support**
    - Claude 3.5 Sonnet: Latest model, excellent balance
    - Claude 3 Opus: Most powerful for complex tasks
    - Claude 3.5 Haiku: Fastest for quick responses
    - Direct API calls to https://api.anthropic.com/v1/messages
  
  - **API Key Management**
    - Settings panel (top-right button)
    - Secure localStorage storage (never sent to servers)
    - Show/hide API key toggle
    - Connection test button with validation
    - Clear saved key option
    - Security information panel

  - **Demo Mode**
    - Works immediately without any configuration
    - Simulated AI responses for testing
    - Context-aware mock responses (CRISPR, code, statistics topics)
    - Smooth typing simulation delay

  - **Chat Interface Enhancements**
    - Provider badges: 🟢 OpenAI / 🟠 Claude / 🤖 Demo
    - Model info panel with pricing details
    - Token usage tracking per session
    - Streaming response indicators
    - Copy and Follow Up action buttons
    - Connection status display in header

  - **Model Selection UI**
    - Dropdown with provider grouping
    - Model comparison sidebar
    - Tier badges (Free/Pro)
    - Speed and max tokens display
    - Input cost per 1K tokens

### Changed
- AETHEL page completely rewritten with real LLM support
- Added LLMConfig type and localStorage helpers
- New system prompts for scientific research assistance
- Mock response generator based on query content analysis

### Files Modified
- `src/app/aethel/page.tsx` - Complete rewrite with LLM integration

---

## [1.0] - 2025-01-07

### Added
- **Initial Release of SciHub Pro**
  - Next.js 16 application with TypeScript
  - Tailwind CSS 4 styling with shadcn/ui components
  - Static export mode for GitHub Pages deployment
  - GitHub Actions workflow for automated deployments

- **Core Pages**
  - Landing page with hero section and feature highlights
  - Dashboard with microservices monitoring
  - Query/Search interface (mock data)
  - AETHEL AI assistant (demo mode)
  - Compute Hub with HPC/AI/Bioinformatics tools
  - Connectors Hub (15+ integrations listed)
  - Knowledge Graph visualization
  - Workspace with code editor templates
  - Collaboration hub
  - Subscription/pricing page
  - Settings page (basic)

- **Enhanced Computation Hub**
  - Quantum Computing tab
  - HPC Clusters tab
  - AI Platforms tab
  - Bioinformatics tab (enhanced):
    - Bioinformatics Tools (GATK, BLAST+, AlphaFold 3, etc.)
    - Cheminformatics Tools (RDKit, Open Babel, AutoDock Vina, etc.)
    - Molecular Modelling (PyMOL, Schrodinger Suite, NAMD, etc.)
    - Drug Discovery (Maestro, Phase, Glide, QikProp, etc.)
  - System Status Dashboard tab

- **GitHub Pages Deployment**
  - `.nojekyll` file for proper static asset serving
  - GitHub Actions workflow with deploy-pages action
  - Base path configuration (`/scihub-pro-demo`)

### Infrastructure
- Repository: `testdemoqwenai2025-creator/scihub-pro-demo`
- Live Preview: `https://testdemoqwenai2025-creator.github.io/scihub-pro-demo`

---

## Version Summary

| Version | Date | Key Features | Status |
|---------|------|--------------|--------|
| **v1.4** | 2025-01-08 | Export Reports, User Auth, History Tracking | ✅ Completed |
| **v1.3** | 2025-01-08 | Enhanced Paper Details (Tabs, Viewer, Citations) | ✅ Completed |
| **v1.2** | 2025-01-08 | Real arXiv & Semantic Scholar API Integration | ✅ Completed |
| **v1.1** | 2025-01-08 | Real LLM Integration (OpenAI/Claude) | ✅ Completed |
| **v1.0** | 2025-01-07 | Initial Release with core platform | ✅ Completed |

---

## Deployment Information

### Live URLs
- **Main Site**: https://testdemoqwenai2025-creator.github.io/scihub-pro-demo/
- **Query Page**: /query
- **AETHEL AI**: /aethel
- **Settings**: /settings
- **Compute Hub**: /compute-hub

### Deployment Method
- Static export (`output: 'export'`)
- GitHub Pages via GitHub Actions
- No server-side dependencies
- Client-side API calls only

---

*This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format.*
