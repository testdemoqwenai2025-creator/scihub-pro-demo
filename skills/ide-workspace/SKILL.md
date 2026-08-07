# Aethelgard IDE Workspace Skill

## Overview
Minimal AI-first IDE inspired by Google AI Studio, optimized for **agentic workflows** and rapid prototyping.

## Core Principles

### 1. Prompt-Centric Design (Google AI Studio Pattern)
- **Prompt input is the hero element** - largest, most prominent UI component
- System instructions are **collapsible** (hidden by default)
- Output appears **only after user action** (no auto-generation)
- Progressive disclosure: show complexity only when needed

### 2. File Management: EMPTY BY DEFAULT RULE
```
DEFAULT_FILE_STATE = EMPTY

On initial load:
├── File Explorer: VISIBLE on RIGHT side
├── File List: EMPTY (no files shown)
├── Selected File: NONE
└── Open Files: NONE
```

**CRITICAL RULES:**
- ❌ NEVER pre-populate files in the file tree
- ❌ NEVER auto-open any file on load
- ❌ NEVER show placeholder/ghost files
- ✅ ALWAYS start with completely empty file explorer
- ✅ Files appear ONLY when user adds or imports them

**WHY?**
- Clean slate = fresh start mentality
- No cognitive overhead from irrelevant files
- User controls what they see
- Matches "tabula rasa" ideal for creative work

### 3. Max 5 Files (After User Adds Them)
```
MAX_FILES = 5

Once user adds files:
├── page.tsx        # Main page/component
├── layout.tsx      # Root layout  
├── globals.css     # Global styles
├── config.ts       # Config (next.config, etc.)
└── package.json    # Dependencies
```

### 4. Anti-Patterns (NEVER DO THESE)
```typescript
// ❌ NEVER pre-populate file tree
const FILES = [file1, file2, ...]; // BANNED on init

// ❌ NEVER auto-open files on load
useEffect(() => { openFiles(DEFAULT_FILES); }, []); // BANNED

// ❌ NEVER auto-select any file
setSelectedFile(firstFile); // BANNED

// ✅ ALWAYS start empty
const [files, setFiles] = useState<FileItem[]>([]); // CORRECT - empty array
const [selectedFile, setSelectedFile] = useState(null); // CORRECT - null
```

### 5. Agentic Workflow Support
The IDE should support:
- **Natural language → Code**: User types intent, AI generates code
- **Iterative refinement**: Easy to modify prompts and regenerate
- **Context awareness**: System instructions panel for persistent context
- **Model selection**: Quick switching between model capabilities
- **Temperature control**: Adjust creativity vs precision

## Component Architecture

### AethelgarIDE (Main Component)
```
┌─────────────────────────────────────────────────────┐
│ ⚡ Aethelgard IDE          [Model ▾] [📁 Explorer]   │
├─────────────────────────────────┬───────────────────┤
│ [System Instructions ▼]         │ 📂 Explorer        │
│ ┌─────────────────────────────┐ │                   │
│ │                             │ │  (empty)          │
│ │  What would you like to     │ │                   │
│ │  build or create?           │ │  No files yet     │
│ │                             │ │                   │
│ │                             │ │  Drop files here  │
│ │                             │ │  or use + button  │
│ └─────────────────────────────┘ │                   │
│                                 │                   │
│ [Brain] Temp: 0.7    [Generate]│                   │
│ [Create] [Write] [Fix] [Explain]│                   │
├─────────────────────────────────┴───────────────────┤
│ Ready • No files loaded                              │
└─────────────────────────────────────────────────────┘
```

### State Management
```typescript
interface IDEState {
  // Core
  prompt: string;              // User's input/intent
  output: string | null;       // Generated response
  
  // Configuration
  selectedModel: 'pro' | 'flash' | 'lite';
  temperature: number;         // 0.0 - 1.0
  systemInstruction: string;   // Persistent context
  
  // UI State
  showSystemPanel: boolean;    // Collapsed by default
  showFilePanel: boolean;      // Visible by default (but EMPTY)
  selectedFile: string | null; // None selected by default
  isRunning: boolean;          // Generation state
  
  // FILE STATE (EMPTY BY DEFAULT)
  files: FileItem[];           // EMPTY ARRAY on load []
  openFiles: FileItem[];       // EMPTY ARRAY on load []
}
```

## File Structure Rules

### Required Components
```
src/
├── app/
│   ├── page.tsx           # Renders <AethelgarIDE />
│   ├── layout.tsx         # Minimal root layout
│   └── globals.css        # Reset styles only
├── components/
│   └── ide/
│       └── AethelgarIDE.tsx  # Main IDE component (~300 lines max)
next.config.ts               # Next.js config
package.json                 # Dependencies
```

### Forbidden
- ❌ No pre-populated file lists/constants
- ❌ No `src/components/` with 50+ components
- ❌ No `src/lib/` with utility libraries
- ❌ No `src/hooks/` with custom hooks (keep in component)
- ❌ No massive UI component libraries loaded upfront
- ❌ No file explorer that scans entire project on load

## Google AI Studio Features to Mimic/Improve

### Mimicked (Proven Good UX)
| Feature | Implementation |
|---------|---------------|
| Prompt-first UI | Large textarea as hero element |
| Collapsible system instructions | Hidden panel, toggle to show |
| Model selector dropdown | Top-right, quick access |
| Temperature slider | Below prompt input |
| Quick action buttons | "Create", "Test", "Fix", etc. |
| Clean output view | Appears after generation, copy button |

### Improved Upon (Our Innovations)
| Feature | Our Version | Why Better |
|---------|------------|-----------|
| File panel | Empty by default, max 5 files | Zero distraction on load |
| File location | Right side panel | Natural reading flow L→R |
| Quick actions | Contextual buttons below prompt | Faster workflow |
| New Prompt button | Clear output, return to prompt | Easier iteration |
| Keyboard shortcut | Cmd+Enter to generate | Power user friendly |
| Status bar | Shows model + file count info | Always aware of context |

## API Integration Points (Future)

When connecting to real AI APIs:

```typescript
// Interface for AI provider
interface AIProvider {
  generate(prompt: string, options: GenerateOptions): Promise<string>;
  stop(): void;
}

interface GenerateOptions {
  model: string;
  temperature: number;
  systemInstruction?: string;
}
```

Supported providers (planned):
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Local Ollama models

## Deployment

### Development Mode
```bash
npx next dev -p 3000
# Hot reload enabled
# Turbopack for fast compilation
```

## Testing Checklist

Before shipping:
- [ ] File explorer is EMPTY on load (no files showing)
- [ ] No files auto-selected on load
- [ ] No files auto-opened in editor
- [ ] File explorer visible on RIGHT side
- [ ] System instructions collapsed by default
- [ ] Output area empty until user generates
- [ ] Prompt input is largest element on screen
- [ ] Status bar shows "No files loaded" initially
- [ ] Under 500KB total bundle size
- [ ] Loads in under 2 seconds on slow 3G

## Version History

- **v2.0** (Current): Empty file explorer by default, right-side panel, zero pre-population
- **v1.0**: Had 5 pre-populated files (REJECTED - caused confusion)
