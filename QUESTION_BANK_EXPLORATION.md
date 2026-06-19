# Super Admin Question Bank - Complete Exploration

## 1. PAGES & ROUTES STRUCTURE

### Main Question Bank Pages
- **[super_admin/src/app/question-bank/page.tsx](super_admin/src/app/question-bank/page.tsx)** - Dashboard with stats (total questions, public questions, sets created, points earned), charts, subject breakdown
- **[super_admin/src/app/question-bank/questions/page.tsx](super_admin/src/app/question-bank/questions/page.tsx)** - Questions listing with folder sidebar, search, filters, bulk operations
- **[super_admin/src/app/question-bank/questions/[id]/edit/page.tsx](super_admin/src/app/question-bank/questions/[id]/edit/page.tsx)** - Question editing interface
- **[super_admin/src/app/question-bank/create/page.tsx](super_admin/src/app/question-bank/create/page.tsx)** - Question creation form (bilingual support)
- **[super_admin/src/app/question-bank/builder/page.tsx](super_admin/src/app/question-bank/builder/page.tsx)** - Set builder page
- **[super_admin/src/app/question-bank/sets/page.tsx](super_admin/src/app/question-bank/sets/page.tsx)** - Question sets listing and management
- **[super_admin/src/app/question-bank/sets/create/page.tsx](super_admin/src/app/question-bank/sets/create/page.tsx)** - Create question set
- **[super_admin/src/app/question-bank/sets/[id]/page.tsx](super_admin/src/app/question-bank/sets/[id]/page.tsx)** - Set detail view
- **[super_admin/src/app/question-bank/sets/[id]/edit/page.tsx](super_admin/src/app/question-bank/sets/[id]/edit/page.tsx)** - Edit existing set
- **[super_admin/src/app/question-bank/sets/[id]/export/page.tsx](super_admin/src/app/question-bank/sets/[id]/export/page.tsx)** - Export set functionality
- **[super_admin/src/app/question-bank/ai-generate/page.tsx](super_admin/src/app/question-bank/ai-generate/page.tsx)** - AI question generation
- **[super_admin/src/app/question-bank/folders/page.tsx](super_admin/src/app/question-bank/folders/page.tsx)** - Folder management
- **[super_admin/src/app/question-bank/marketplace/page.tsx](super_admin/src/app/question-bank/marketplace/page.tsx)** - Question set marketplace
- **[super_admin/src/app/question-bank/reports/page.tsx](super_admin/src/app/question-bank/reports/page.tsx)** - Reports and analytics

---

## 2. KEY COMPONENTS

### Question Components
- **[super_admin/src/components/qbank/QuestionsList.tsx](super_admin/src/components/qbank/QuestionsList.tsx)** (~500 lines)
  - Main questions table with pagination
  - Filtering by subject, difficulty, type, scope
  - Advanced filter builder with custom operators
  - Bulk actions (delete, move, copy)
  - Search & real-time filtering
  - Type/Difficulty badge rendering
  - Visibility toggle (public/private/lock)

- **[super_admin/src/components/qbank/QuestionFullDetailView.tsx](super_admin/src/components/qbank/QuestionFullDetailView.tsx)**
  - Detailed preview of question with bilingual content
  - Options display
  - Solution/Explanation
  - Metadata display

- **[super_admin/src/components/qbank/AdvancedSetBuilder.tsx](super_admin/src/components/qbank/AdvancedSetBuilder.tsx)** (~300+ lines)
  - Advanced filtering with custom operators
  - Question selection and cart
  - Set creation workflow
  - Multiple display language options (en, hi, both)
  - Filter options: exam, subject, chapter, year, shift, source
  - Real-time search integration

### Folder Components
- **[super_admin/src/components/qbank/QuestionFolderSidebar.tsx](super_admin/src/components/qbank/QuestionFolderSidebar.tsx)** (~200 lines)
  - Hierarchical folder tree navigation
  - Folder expand/collapse with chevrons
  - Inline folder rename dialog
  - New folder creation
  - Delete folder with safe/permanent options
  - Folder count display
  - Context menu (rename, delete, new subfolder)
  - Selected folder highlight
  - Keyboard support (Enter to save)

- **[super_admin/src/components/qbank/SetFoldersManager.tsx](super_admin/src/components/qbank/SetFoldersManager.tsx)**
  - Folder management for sets
  - Similar tree structure as questions

### Set Components
- **[super_admin/src/components/set-system/QuestionSetExportModal.tsx](super_admin/src/components/set-system/QuestionSetExportModal.tsx)**
  - PDF export configuration
  - Visual settings for sets
  - Share modal functionality

- **[super_admin/src/components/set-system/ShareModal.tsx](super_admin/src/components/set-system/ShareModal.tsx)**
  - Share set with organizations
  - Visibility controls

---

## 3. DATA STRUCTURES & TYPES

### Question Form Type
```typescript
interface QuestionForm {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;           // 'easy' | 'medium' | 'hard'
  questionType: string;          // 'mcq' | 'integer' | 'multi_select' | 'true_false'
  language: string;              // 'bilingual' | 'hindi' | 'english'
  relatedExam: string;
  previousOf: string;
  collection: string;
  sourceType: string;            // 'original' | ...
  question_hin: string;          // HTML rich text
  question_eng: string;          // HTML rich text
  solution_hin: string;          // HTML rich text
  solution_eng: string;          // HTML rich text
  video: string;                 // URL
  answer: string;                // Correct option or numeric
  answerRangeMin: string;        // For numeric answers
  answerRangeMax: string;
  visibility: string;            // 'private' | 'org_only' | 'public'
  isGlobal: boolean;
  pointCost: number;             // Default: 5
  externalId: string;
  syncCode: string;
  questionNo: string;
  tags: string[];
}
```

### Bilingual Option Type
```typescript
interface BilingualOption {
  id: string;                    // 'A' | 'B' | 'C' | 'D' | 'E'
  label: string;
  text_hin: string;              // Hindi option text
  text_eng: string;              // English option text
}
```

### Set Creation Store (Zustand)
```typescript
interface SetCreationState {
  step: 1 | 2 | 3;              // Multi-step creation
  questions: Question[];
  name: string;
  description: string;
  subjectId: string;
  chapterId: string;
  visibility: "private" | "org_only" | "public";
  selectedOrgIds: string[];
  expiresAt: Date | null;
  folderId: string | null;
  createdSet: { id, contentId, password, name } | null;
  isLoading: boolean;
  // Methods for state management
}
```

### Question Type (Database)
```typescript
interface Question {
  id: string;
  question_id: string;           // Unique identifier
  text_en: string;
  text_hi: string | null;
  type: string;                  // 'mcq' | 'integer' | 'multi_select' | 'true_false'
  difficulty: string;            // 'EASY' | 'MEDIUM' | 'HARD'
  subject_name: string | null;
  chapter_name: string | null;
  point_cost: number;
  usage_count: number;
  is_approved: boolean;
  is_global: boolean;
  created_at: DateTime;
  updated_at: DateTime;
  question_no: number | null;
  explanation_en: string | null;
  explanation_hi: string | null;
  exam: string | null;
  collection: string | null;
  year: number | null;
  section: string | null;
  airtable_table_name: string | null;
  record_id: string | null;
  folderId: string | null;
}
```

---

## 4. DATABASE SCHEMA (Prisma Models)

### questions model
```prisma
model questions {
  id                  String               @id
  question_id         String               @unique
  text_en             String
  text_hi             String?
  type                String               @default("mcq")
  difficulty          String               @default("medium")
  subject_name        String?
  chapter_name        String?
  point_cost          Int                  @default(5)
  usage_count         Int                  @default(0)
  is_approved         Boolean              @default(false)
  is_global           Boolean              @default(false)
  created_at          DateTime             @default(now()) @db.Timestamptz(6)
  updated_at          DateTime             @updatedAt
  question_no         Int?
  explanation_en      String?
  explanation_hi      String?
  exam                String?
  collection          String?
  year                Int?
  section             String?
  airtable_table_name String?
  record_id           String?
  folderId            String?
  
  // Relations
  attemptAnswers      AttemptAnswer[]
  question_options    question_options[]
  question_set_items  question_set_items[]
  folder              qBankFolder?         @relation("QuestionFolder")
}
```

### question_options model
```prisma
model question_options {
  id          String    @id
  question_id String
  text_en     String?
  text_hi     String?
  is_correct  Boolean   @default(false)
  sort_order  Int       @default(0)
  questions   questions @relation(fields: [question_id], references: [id], onDelete: Cascade)
}
```

### question_sets model
```prisma
model question_sets {
  id                 String               @id
  set_id             String               @unique            // 6-digit unique code
  pin                String                                   // Password for access
  name               String
  description        String?
  total_questions    Int                  @default(0)
  subject            String?
  chapter            String?
  is_global          Boolean              @default(false)
  created_at         DateTime             @default(now())
  updated_at         DateTime             @updatedAt
  pdf_notes          Json?                                   // PDF configuration
  visual_settings    Json?
  folderId           String?
  
  // Relations
  question_set_items question_set_items[]
  folder             qBankFolder?         @relation("QuestionSetFolder")
}
```

### question_set_items model (Junction)
```prisma
model question_set_items {
  set_id        String
  question_id   String
  sort_order    Int           @default(0)
  questions     questions     @relation(fields: [question_id], references: [id], onDelete: Cascade)
  question_sets question_sets @relation(fields: [set_id], references: [id], onDelete: Cascade)
  
  @@id([set_id, question_id])
}
```

### qBankFolder model (Hierarchical)
```prisma
model qBankFolder {
  id          String          @id @default(uuid())
  name        String          @db.VarChar(255)
  slug        String          @db.VarChar(255)
  path        String          @default("/")          // Hierarchical path
  depth       Int             @default(0)            // Tree depth (0 = root)
  scope       String          @default("GLOBAL")     // 'GLOBAL' | 'ORG'
  parentId    String?
  isActive    Boolean         @default(true)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  description String?                                // 'AIRTABLE_SYNC' for Airtable sources
  color       String?
  icon        String?
  sortOrder   Int             @default(0)
  
  // Relations
  parent      qBankFolder?    @relation("FolderHierarchy", fields: [parentId])
  children    qBankFolder[]   @relation("FolderHierarchy")
  sets        question_sets[] @relation("QuestionSetFolder")
  questions   questions[]     @relation("QuestionFolder")
  
  @@index([parentId])
}
```

---

## 5. API ENDPOINTS (Backend Routes)

### Question Creation/Editing/Deletion
- **POST** `/api/superAdmin/mockbook/questions` - Create question
- **GET** `/api/superAdmin/mockbook/questions` - List questions (with filters)
- **GET** `/api/superAdmin/mockbook/questions/:id` - Get question detail
- **PUT/PATCH** `/api/superAdmin/mockbook/questions/:id` - Update question
- **DELETE** `/api/superAdmin/mockbook/questions/:id` - Delete question
- **POST** `/api/superAdmin/mockbook/questions/import` - Bulk import questions
- **GET** `/api/superAdmin/mockbook/questions/export` - Export questions

### Question Bank (qbank) Core
- **GET** `/api/qbank/folders` - Get folder tree
- **POST** `/api/qbank/folders` - Create folder
- **PATCH** `/api/qbank/folders/:id` - Update folder
- **GET** `/api/qbank/folders/:id` - Get folder details
- **GET** `/api/qbank/folders/:id/stats` - Get folder statistics
- **POST** `/api/qbank/folders/:id/move` - Move folder to new parent
- **DELETE** `/api/qbank/folders/:id` - Delete folder (safe or permanent)
- **GET** `/api/qbank/folders/:id/breadcrumb` - Get folder breadcrumb

### Question Sets Management
- **GET** `/api/qbank/sets` - List sets (paginated)
- **POST** `/api/qbank/sets` - Create set
- **GET** `/api/qbank/sets/:setId/questions` - Get set questions with password validation
- **PATCH** `/api/qbank/sets/:id` - Update set
- **DELETE** `/api/qbank/sets` - Bulk delete sets

### Airtable Integration
- **GET** `/api/qbank/airtable/tables` - Get Airtable tables list
- **POST** `/api/qbank/sync-airtable` - Trigger Airtable sync
- **GET** `/api/qbank/airtable-folders` - Get Airtable sync sources
- **POST** `/api/qbank/airtable-folders` - Create sync source
- **PATCH** `/api/qbank/airtable-folders/:id` - Rename sync source
- **DELETE** `/api/qbank/airtable-folders/:id` - Delete sync source

### Dashboard & Analytics
- **GET** `/api/qbank/dashboard` - Dashboard statistics

### User Question Packs (Non-admin)
- **GET** `/api/user-qbank/marketplace` - Browse public packs
- **GET** `/api/user-qbank/marketplace/:setId` - Pack details with preview
- **GET** `/api/user-qbank/dashboard` - User pack statistics
- **GET** `/api/user-qbank/my-packs` - List user's packs
- **POST** `/api/user-qbank/my-packs` - Create user pack
- **PATCH** `/api/user-qbank/my-packs/:id` - Update pack
- **DELETE** `/api/user-qbank/my-packs/:id` - Delete pack

---

## 6. QUESTION CREATION LOGIC

### Rich Text Editor Support
The question creation form supports rich formatting:
- **Tags**: `<strong>`, `<em>`, `<sub>`, `<sup>`
- **LaTeX**: Inline `\( \)`, Display `\[ \]`, Chemical `\[\ce{ }\]`
- **Images**: File upload with image insertion
- **Tables**: HTML table creation

### Multi-Step Question Creation Flow
1. **Basic Information**
   - Subject, Chapter, Topic selection (hierarchical folders)
   - Difficulty (easy/medium/hard)
   - Question Type (MCQ, Integer, Multi-select, True-False)
   - Language (bilingual/hindi/english)

2. **Question Content**
   - Hindi & English rich text editors
   - Live preview toggle
   - Support for LaTeX, images, formatting

3. **Options (MCQ)**
   - 2-5 bilingual options
   - Mark correct option(s)
   - Dynamic option addition/removal

4. **Solution & Metadata**
   - Solution text (bilingual)
   - Video link
   - Tags
   - Exam reference
   - Collection assignment
   - Point cost
   - Visibility (private/org/public)
   - Global flag
   - External sync code

### Frontend API Call Location
**File**: [super_admin/src/app/question-bank/create/page.tsx](super_admin/src/app/question-bank/create/page.tsx) (line ~800)
```typescript
// Save question to backend
const response = await fetch(`${API_URL}/superAdmin/mockbook/questions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify(formData)
});
```

---

## 7. QUESTION FILTERING & SEARCH

### Frontend Filters Available
**File**: [super_admin/src/components/qbank/QuestionsList.tsx](super_admin/src/components/qbank/QuestionsList.tsx)

**Simple Filters:**
- Subject (dropdown)
- Difficulty (easy/medium/hard)
- Type (MCQ/Integer/Multi-select/True-False)
- Scope (private/global/all)

**Advanced Filter Builder:**
- Custom filter conditions with operators:
  - `equals`, `not_equals`
  - `contains`, `doesNotContain`
  - `startsWith`, `endsWith`
  - `isEmpty`, `isNotEmpty`

- Filterable Fields:
  - `subjectName`, `chapterName`
  - `exam`, `year`, `collection`
  - `type`, `difficulty`
  - `pointCost`, `usageCount`
  - `questionUniqueId`, `isApproved`

### Advanced Set Builder Filters
**File**: [super_admin/src/components/qbank/AdvancedSetBuilder.tsx](super_admin/src/components/qbank/AdvancedSetBuilder.tsx)

- Exam category
- Subject
- Chapter
- Year
- Shift/Section
- Airtable source
- Multiple language display options

### Search Implementation
- Real-time search across question text (English & Hindi)
- Search in question metadata
- Pagination support (10, 25, 50 results per page)

---

## 8. PACK/SET/BUNDLE MANAGEMENT

### Set Creation Flow
**File**: [super_admin/src/components/set-system/stores/setStore.ts](super_admin/src/components/set-system/stores/setStore.ts)

**Three-step process:**
1. **Step 1**: Select questions using advanced builder
2. **Step 2**: Configure set name, description, visibility, folder assignment
3. **Step 3**: Review and submit

**Set Properties:**
- `name`: Display name
- `description`: Optional description
- `questionIds`: Array of selected question IDs
- `folderId`: Parent folder assignment
- `visibility`: 'private' | 'org_only' | 'public'
- `selectedOrgIds`: Organizations for 'org_only' visibility

### Set Operations
- **Create**: Multi-question selection → name & config → submit
- **Edit**: Modify name, description, visibility
- **Delete**: Bulk or individual deletion
- **Share**: Share with organizations
- **Export**: Export to PDF with visual settings
- **Password Protection**: Auto-generated 6-digit codes

### API Call (Create Set)
```typescript
const response = await fetch(`${API_URL}/qbank/sets`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    name: setName,
    description: setDescription,
    questionIds: questionIds,
    folderId: folderId
  })
});
```

---

## 9. STYLING & CSS APPROACH

### Framework
- **Tailwind CSS** with custom theme configuration
- **shadcn/ui** components library
- Custom CSS variables for theming

### Theme System
**File**: [super_admin/src/app/globals.css](super_admin/src/app/globals.css)

**CSS Custom Properties (Theme Variables):**
```css
--color-brand-primary: #FF6B2B (Orange)
--color-brand-primary-hover: #E55A1A
--color-brand-primary-tint: rgba(255, 107, 43, 0.10)

--bg-body: Main background
--bg-card: Card background
--bg-sidebar: Sidebar background
--bg-main: Main content area

--text-primary: Primary text
--text-secondary: Secondary text
--text-muted: Muted text

--border-input: Input borders
--border-card: Card borders

--color-status-success: #4CAF50
--color-status-warning: #FFC107
--color-status-error: #F44336
```

### Component Styling Patterns
**Badge Styling** (by type):
- MCQ: Blue
- Integer: Green
- Multi-select: Purple
- True-False: Amber

**Difficulty Styling**:
- Easy: Green
- Medium: Amber
- Hard: Red

**Visibility Styling**:
- Public: Orange (Globe icon)
- Private: Gray (Lock icon)
- Org: Blue (Building icon)

**Layout Classes**:
- Page container: `min-h-screen bg-neutral-bg`
- Sidebar layout: `flex flex-col transition-all duration-300`
- Cards: `rounded-lg border shadow-sm`
- Buttons: `rounded-lg px-3 py-2 text-sm font-medium`

### Tailwind Config
**File**: [super_admin/tailwind.config.ts](super_admin/tailwind.config.ts)
- Extends color palette with CSS variables
- Border radius: `lg` (8px), `md` (6px), `sm` (4px)
- Animation plugin: `tailwindcss-animate`
- Dark mode support: `class` strategy

---

## 10. KEY FUNCTIONS & UTILITIES

### Token Management
```typescript
function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
  return match ? match[1] : '';
}
```

### Folder Tree Building (Backend)
**File**: [eduhub-backend/src/modules/qbank/qbank.routes.ts](eduhub-backend/src/modules/qbank/qbank.routes.ts#L110)
```typescript
function buildTree(folders: any[], parentId: string | null = null): any[] {
  return folders
    .filter(f => f.parentId === parentId)
    .map(f => {
      const children = buildTree(folders, f.id);
      const totalChildrenSets = children.reduce((sum, child) => sum + (child.totalSetCount || 0), 0);
      return {
        ...f,
        children,
        totalSetCount: (f.setCount || 0) + totalChildrenSets
      };
    });
}
```

### Breadcrumb Generation
**Converts folder hierarchical path to breadcrumb:**
```typescript
async function getBreadcrumb(folderId: string): Promise<Array<{id, name, path}>> {
  const folder = await prisma.qBankFolder.findUnique({ where: { id: folderId } });
  const ancestorIds = getAncestorIds(folder.path);
  // Get all ancestors and return sorted array
}
```

### Airtable Sync
**File**: [eduhub-backend/src/modules/qbank/qbank.controller.ts](eduhub-backend/src/modules/qbank/qbank.controller.ts)
- Fetches questions from Airtable table
- Maps Airtable schema to local questions
- Stores airtable_table_name for tracking
- Updates sync folder's updatedAt timestamp

---

## 11. KEY FILES SUMMARY TABLE

| Path | Purpose | Key Functions |
|------|---------|----------------|
| [super_admin/src/app/question-bank/create/page.tsx](super_admin/src/app/question-bank/create/page.tsx) | Question creation form | Form state management, rich text editing, option handling, API submission |
| [super_admin/src/app/question-bank/questions/[id]/edit/page.tsx](super_admin/src/app/question-bank/questions/[id]/edit/page.tsx) | Question editing | Load existing question, form population, update API |
| [super_admin/src/components/qbank/QuestionsList.tsx](super_admin/src/components/qbank/QuestionsList.tsx) | Questions table view | Filtering, sorting, bulk operations, pagination |
| [super_admin/src/components/qbank/AdvancedSetBuilder.tsx](super_admin/src/components/qbank/AdvancedSetBuilder.tsx) | Set creation interface | Advanced filtering, question selection, cart management |
| [super_admin/src/components/qbank/QuestionFolderSidebar.tsx](super_admin/src/components/qbank/QuestionFolderSidebar.tsx) | Folder navigation | Tree rendering, folder operations, inline editing |
| [super_admin/src/components/set-system/stores/setStore.ts](super_admin/src/components/set-system/stores/setStore.ts) | Set creation state (Zustand) | Multi-step state, form data, API submission |
| [eduhub-backend/src/modules/qbank/qbank.routes.ts](eduhub-backend/src/modules/qbank/qbank.routes.ts) | Question bank API routes | Folder CRUD, set operations, dashboard |
| [eduhub-backend/src/modules/qbank/user-qbank.routes.ts](eduhub-backend/src/modules/qbank/user-qbank.routes.ts) | User pack marketplace | Browse, purchase, manage packs |
| [eduhub-backend/prisma/schema.prisma](eduhub-backend/prisma/schema.prisma) | Database schema | Models: questions, question_options, question_sets, qBankFolder |
| [super_admin/src/app/globals.css](super_admin/src/app/globals.css) | Theme variables | CSS custom properties for colors, sizing |
| [super_admin/tailwind.config.ts](super_admin/tailwind.config.ts) | Tailwind configuration | Color palette, border radius, plugins |

---

## 12. IMPORTANT ARCHITECTURAL NOTES

### Bilingual Support
- All questions support English & Hindi variants
- `text_en` / `text_hi` fields for questions
- `text_hin` / `text_eng` for frontend forms
- Options support bilingual text
- Solutions/Explanations bilingual
- Display language toggle in UI

### Hierarchical Folder System
- Maximum depth: 10 levels
- Path-based hierarchy: `/parent1/parent2/child`
- Supports bulk operations (move, delete, create)
- Each folder can contain questions and/or subfolders
- Airtable sync folders marked with description: 'AIRTABLE_SYNC'

### Question Set Password Protection
- 6-digit auto-generated PIN
- Stored in `question_sets.pin` field
- Used for whiteboard access validation

### Frontend State Management
- **Zustand** for set creation (multi-step)
- **React hooks** for local component state
- **URL search params** for pagination/filtering
- **Cookies** for authentication token storage

### API Configuration
**File**: [super_admin/src/lib/api-config.ts](super_admin/src/lib/api-config.ts)
- Backend URL: `process.env.NEXT_PUBLIC_API_URL` or `http://localhost:4000/api`
- Request timeout: 60 seconds
- Automatic 401 redirect on auth failure
- Bearer token authentication

---

## 13. FILTERING & SEARCH OPERATORS

### Question List Advanced Filters
```
FILTER FIELDS:
- subjectName, chapterName
- exam, year, collection
- type, difficulty
- pointCost, usageCount
- questionUniqueId, isApproved

OPERATORS:
- equals: Exact match
- not_equals: Not matching
- contains: Substring match
- doesNotContain: Exclude substring
- startsWith: Begins with
- endsWith: Ends with
- isEmpty: Null/empty
- isNotEmpty: Not null/empty
```

### Set Builder Advanced Filters
```
Available Filters:
- Exam Category (dropdown)
- Subject (multi-select)
- Chapter (dynamic based on subject)
- Year (multi-select)
- Shift/Section (multi-select)
- Airtable Source (multi-select)

Display Options:
- Language: Both | English only | Hindi only
```

---

## 14. QUESTION TYPES & DIFFICULTY LEVELS

### Supported Question Types
- **MCQ** (Single select)
- **Multi-select** (Multiple correct options)
- **Integer** (Numeric answer)
- **True/False**
- Additional: Fill in blank, Descriptive

### Difficulty Levels
- **Easy**
- **Medium**
- **Hard**

### Visibility Scopes
- **Private** - Only creator
- **Org Only** - Shared with specific organizations
- **Public/Global** - Visible to all users

---

## 15. USAGE TRACKING & ANALYTICS

### Dashboard Statistics
- Total questions count
- Public questions count
- Total sets created
- Points earned by user
- Subject-wise breakdown
- Usage trends (monthly)
- Recent activity log

### Question Metadata Tracked
- `usage_count` - How many times used
- `is_approved` - Admin approval status
- `is_global` - Public/private flag
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

