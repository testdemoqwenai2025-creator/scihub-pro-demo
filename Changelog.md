# SciHub Pro Changelog

## Version History & Roadmap

---

## ✅ v2.0.0 - Current Release (August 2026)

### 🚀 Enhanced Computation Hub (COMPLETED)

**Major Enhancement**: Expanded Bioinformatics tab into comprehensive Life Sciences Computing Hub

#### New Scientific Domains Added:

| Domain | Tools | Workflows | Status |
|-------|-------|-----------|--------|
| 🧬 **Bioinformatics** | 6 tools | 4 pipelines | ✅ Complete |
| ⚗️ **Cheminformatics** | 6 tools | 4 workflows | ✅ Complete |
| 🔬 **Molecular Modelling** | 6 tools | 4 workflows | ✅ Complete |
| 💊 **Drug Discovery** | 6 tools | 4 workflows | ✅ Complete |

#### Tools Library:

**Bioinformatics:**
- GATK 5.0 (Genomics)
- BLAST+ (Sequence Analysis)
- AlphaFold 3 (Structure Prediction)
- Bowtie 2 (Alignment)
- SAMtools (Analysis)
- BCFtools (Variant Calling)

**Cheminformatics:**
- RDKit 2024.03 (Chemistry Toolkit)
- Open Babel 3.1.1 (File Conversion)
- AutoDock Vina 1.2.5 (Molecular Docking)
- GROMACS 2024.3 (MD Simulation)
- AmberTools 24.0 (Simulation Suite)
- ChemAxon Marble 23.20 (Prediction Suite)

**Molecular Modelling:**
- PyMOL 3.0 (Visualization)
- Schrodinger Suite 2024.3 (Drug Design)
- NAMD 3.0 (MD Simulation - GPU)
- LAMMPS 2023.11 (Classical MD)
- CP2K 2024.1 (QM/MM)
- Desmond 6.9 (MD Engine)

**Drug Discovery:**
- Maestro 13.8 (Drug Design Suite)
- Phase 7.0 (Ligand-Based Design)
- Glide 9.5 (Docking Engine)
- QikProp 8.2 (ADMET Prediction)
- Epik 6.0 (Protonation States)
- LigPrep 5.0 (Ligand Preparation)

#### Pre-built Workflows (16 Total):
- RNA-Seq Analysis, Variant Calling, Single-Cell RNA-Seq, Metagenomics
- Virtual Screening Pipeline, QSAR Modeling, MD Simulation Setup, Property Prediction
- Protein-Ligand Complex Setup, Binding Free Energy Calculation, Conformational Analysis, Reaction Pathway Simulation
- Lead Optimization, Virtual Screening Campaign, Hit-to-Lead Workflow, De Novo Drug Design

### 🔧 Critical Bug Fix (COMPLETED)

**Issue**: GitHub Pages rendering broken - JavaScript/CSS files returning 404

**Root Cause**: Manual `git push --force origin gh-pages` deployment method not serving `_next` directory correctly

**Solution**: 
- Switched to official GitHub Actions workflow (`actions/deploy-pages`)
- Added `.nojekyll` file to build output
- All static assets now properly served via GitHub Pages CDN

**Files Modified**:
- `.github/workflows/deploy.yml` - Added `.nojekyll` step
- Deployment method changed from manual push to CI/CD pipeline

---

## 🚧 COMING SOON (v2.1.0 - v2.2.0)

### Priority 1: Real LLM Integration (v2.1.0) ⭐⭐⭐

**Location**: `/src/app/aethel/`, `/src/components/aethel/`

**Features**:
- [ ] OpenAI API integration for real AI responses
- [ ] Claude/Anthropic API integration
- [ ] Streaming chat responses
- [ ] Conversation history persistence
- [ ] Model selection UI (GPT-4, Claude 3, etc.)
- [ ] Token usage tracking & cost estimation

**API Routes Needed**:
```
src/app/api/aethel/chat/route.ts      ← Chat completions
src/app/api/aethel/models/route.ts    ← Available models
src/app/api/aethel/history/route.ts   ← Conversation history
```

**Components**:
```
src/components/aethel/ChatInterface.tsx    ← Main chat UI
src/components/aethel/ModelSelector.tsx   ← Model picker
src/components/aethel/MessageBubble.tsx   ← Message display
src/components/aethel/TokenCounter.tsx    ← Usage tracking
```

---

### Priority 2: arXiv/Semantic Scholar Integration (v2.1.0) ⭐⭐⭐

**Location**: `/src/app/query/`, `/src/app/connectors/`

**Features**:
- [ ] Live arXiv paper search API
- [ ] Semantic Scholar citation data
- [ ] Paper metadata extraction (authors, abstracts, references)
- [ ] Citation graph visualization
- [ ] Related papers recommendation
- [ ] Save papers to library

**API Routes Needed**:
```
src/app/api/query/arxiv/search/route.ts      ← arXiv search
src/app/api/query/arxiv/paper/[id]/route.ts   ← Paper details
src/app/api/connectors/semantic-scholar/route.ts ← Citation data
```

**Components**:
```
src/components/query/PaperCard.tsx            ← Paper display card
src/components/query/CitationGraph.tsx        ← Citation visualization
src/components/query/PaperModal.tsx           ← Detailed view
src/components/query/RelatedPapers.tsx        ← Recommendations
```

---

### Priority 3: Export Reports Feature (v2.1.0) ⭐⭐

**Location**: Cross-cutting utility feature

**Features**:
- [ ] Export debates as PDF reports
- [ ] Markdown export for documentation
- [ ] DOCX export for Word compatibility
- [ ] Include battle metadata, timestamps, participants
- [ ] Customizable report templates
- [ ] Batch export functionality

**Utilities**:
```
src/lib/export/pdf-generator.ts              ← PDF creation
src/lib/export/markdown-generator.ts         ← MD creation
src/lib/export/docx-generator.ts             ← DOCX creation
src/lib/export/templates.ts                 ← Report templates
```

**Components**:
```
src/components/ui/ExportDialog.tsx           ← Export options dialog
src/components/ui/ExportButton.tsx           ← Trigger button
```

**Integration Points**:
- AETH battles page
- Collaboration workspace
- User profile/history

---

### Priority 4: User Authentication System (v2.2.0) ⭐⭐

**Location**: `/src/app/auth/`, `/src/app/settings/`

**Features**:
- [ ] GitHub OAuth authentication
- [ ] Email/password login option
- [ ] User profile management
- [ ] Session persistence
- [ ] Role-based access (free/premium)
- [ ] Account settings page

**New Pages**:
```
src/app/auth/login/page.tsx                 ← Login page
src/app/auth/register/page.tsx              ← Registration
src/app/auth/callback/page.tsx              ← OAuth callback
src/app/settings/profile/page.tsx           ← Profile management
src/app/settings/security/page.tsx          ← Security settings
```

**API Routes**:
```
src/app/api/auth/login/route.ts            ← Authentication
src/app/api/auth/register/route.ts         ← Registration
src/app/api/auth/user/route.ts             ← User data
src/app/api/auth/session/route.ts          ← Session management
```

**Database Schema (if needed)**:
```sql
users (id, email, name, avatar, role, created_at)
sessions (id, user_id, token, expires_at)
profiles (user_id, bio, institution, orcid_id)
```

---

### Priority 5: Enhanced Collaboration Features (v2.2.0) ⭐

**Location**: `/src/app/collaboration/` (enhance existing)

**Features**:
- [ ] Share battles via link
- [ ] Comment system on debates
- [ ] Real-time presence indicators
- [ ] Team workspaces
- [ ] Invite collaborators
- [ ] Activity feed

**Enhancements to Existing**:
```
src/app/collaboration/page.tsx              ← Enhance with new features
src/components/collaboration/
  ShareDialog.tsx                           ← Share modal
  CommentSection.tsx                        ← Comments component
  TeamWorkspace.tsx                         ← Team area
  ActivityFeed.tsx                          ← Recent activity
```

**API Routes**:
```
src/app/api/collaboration/share/route.ts   ← Generate share links
src/app/api/collaboration/comments/route.ts ← Comments CRUD
src/app/api/collaboration/invite/route.ts  ← Team invites
```

---

## 📋 Implementation Timeline

### Phase 1: v2.1.0 (Next Sprint)
1. **LLM Integration** - Transform AETH page into real AI assistant
2. **arXiv Integration** - Enable live research data in Query page
3. **Export Reports** - Add export functionality across platform

### Phase 2: v2.2.0 (Following Sprint)
4. **Authentication** - User accounts & profiles
5. **Collaboration** - Social features & team work

---

## 🏗️ Architecture Decisions

### Deployment (FIXED ✅)
- **Method**: GitHub Actions CI/CD (`actions/deploy-pages`)
- **Build**: Next.js Static Export (`output: 'export'`)
- **CDN**: GitHub Pages with proper `_next` directory serving
- **Critical**: Must include `.nojekyll` file in build output

### Tech Stack
- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React hooks (client components)
- **API**: Next.js API routes (when needed)
- **Auth**: Planned: NextAuth.js or custom OAuth

### File Organization
```
src/
├── app/                    ← Pages & API routes
│   ├── aethel/            ← AI/LLM features
│   ├── query/             ← Search & arXiv
│   ├── collaboration/     ← Social features
│   ├── compute-hub/       ← Computing hub (enhanced)
│   └── settings/          ← User settings
├── components/            ← Reusable UI
│   ├── aethel/            ← AI components
│   ├── features/          ← Feature components
│   └── ui/                ← Base UI (shadcn)
├── lib/                   ← Utilities
│   ├── ai/                ← LLM clients
│   ├── arxiv/             ← arXiv API
│   ├── auth/              ← Auth logic
│   └── export/            ← Report generators
└── types/                 ← TypeScript definitions
```

---

## 🎯 Success Metrics

### Current Achievements (v2.0.0)
- ✅ 24+ scientific computing tools integrated
- ✅ 16 pre-built workflows across 4 domains
- ✅ GitHub Pages deployment working correctly
- ✅ Responsive design across all devices
- ✅ Dark mode support

### Target Metrics (v2.2.0)
- 🎯 Real AI responses (not mock data)
- 🎯 Live research paper database access
- 🎯 User accounts & battle history
- 🎯 Report generation capability
- 🎯 Team collaboration features

---

## 📝 Notes

### For Developers
- Always test on GitHub Pages preview after changes
- Use GitHub Actions workflow for deployment (never manual git push)
- Keep components modular and reusable
- Follow existing code patterns and styling

### For Investors/Demos
- Computation Hub is now investor-ready with 4 scientific domains
- LLM integration will be next major showcase feature
- Focus on visual polish and smooth interactions
- Ensure mobile responsiveness for all demos

---

*Last Updated: August 8, 2026*
*Version: v2.0.0 (Current) → v2.2.0 (Planned)*
