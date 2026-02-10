# Product Requirements Document (PRD)
## Question Paper Generator Tool - Enhanced Version

**Version:** 2.0 (Enhanced with Table Support & Advanced Preservation)
**Last Updated:** January 28, 2026

---

## 1. Executive Summary

### 1.1 Tool Name
**QuestionMaster Pro - AI Question Paper Generator**

### 1.2 Core Value Proposition
AI-powered tool jo Word/PDF files se **har tarah ka content** extract karta hai - questions, tables, images, equations, formatting - sab kuch **exactly preserve** karke database me store karta hai aur multiple professional templates me beautiful question papers generate karta hai.

### 1.3 Key Differentiators
- ✅ **100% Content Preservation** - Tables, images, formatting sab intact
- ✅ **Multilingual Support** - Hindi, English, mixed content
- ✅ **Complex Table Handling** - Data tables, comparison tables, answer tables
- ✅ **Advanced Equation Support** - LaTeX, MathML, Unicode symbols
- ✅ **Smart Question Detection** - MCQs, fill-ups, tables, diagrams sab detect kare
- ✅ **Flexible Output** - Original jaise ka taisa ya customized templates me

---

## 2. Enhanced Core Features

### 2.1 Advanced Document Import System

#### Feature 1: Universal Content Extraction
**Description:** Kisi bhi type ka content extract kare without loss

**Supported Content Types:**
1. **Text Content**
   - Plain text paragraphs
   - Formatted text (bold, italic, underline, colors)
   - Bulleted/numbered lists
   - Indented content
   - Headers and subheadings
   - Multilingual text (Hindi, English, Sanskrit, etc.)
   - Special characters and symbols

2. **Tables** ⭐ NEW
   - Simple tables (2x2 to unlimited)
   - Complex nested tables
   - Merged cells (horizontal/vertical)
   - Colored cells and borders
   - Table headers
   - Table captions
   - Data tables with formulas
   - Comparison tables
   - Answer key tables
   - Option tables for MCQs

3. **Images & Diagrams**
   - Embedded images (JPEG, PNG, GIF)
   - Inline images
   - Diagrams and charts
   - Graphs and plots
   - Scanned images
   - Image captions
   - Image positioning (left, right, center, inline)

4. **Mathematical Content**
   - LaTeX equations (inline and display)
   - MathML equations
   - Unicode math symbols (∑, ∫, √, ∞, ≤, ≥, etc.)
   - Chemical formulas (H₂O, CO₂, subscripts/superscripts)
   - Physics formulas with units
   - Matrices and vectors
   - Fractions and radicals

5. **Structural Elements**
   - Page breaks
   - Section breaks
   - Headers and footers
   - Footnotes and endnotes
   - Hyperlinks
   - Bookmarks

**Technical Implementation:**

```python
# Extraction Pipeline
Document Input
    ↓
Deep Structure Analysis:
├── Text Extraction (with formatting)
├── Table Extraction (with structure)
├── Image Extraction (with metadata)
├── Equation Detection (with LaTeX conversion)
├── List Structure Recognition
└── Formatting Preservation (styles, colors, alignment)
    ↓
Rich JSON Storage:
{
  "content": [
    {"type": "paragraph", "text": "...", "style": {...}},
    {"type": "table", "rows": [...], "cells": [...], "formatting": {...}},
    {"type": "image", "src": "...", "caption": "...", "position": "..."},
    {"type": "equation", "latex": "...", "display": true}
  ]
}
    ↓
Database Storage (Complete Preservation)
```

---

#### Feature 2: Intelligent Table Handling ⭐ KEY FEATURE

**Description:** Tables ko detect, extract, preserve aur regenerate kare with full fidelity

**Table Detection Capabilities:**

1. **Question Tables**
   - Match the following type questions
   - Fill in the table questions
   - Data interpretation tables
   
   Example:
   ```
   | Column A          | Column B         |
   |-------------------|------------------|
   | 1. Photosynthesis | a. Respiration   |
   | 2. Mitochondria   | b. Chloroplast   |
   ```

2. **Option Tables**
   - MCQ options in table format
   - True/False tables
   - Multiple select tables
   
   Example:
   ```
   | (A) Option 1 | (B) Option 2 |
   | (C) Option 3 | (D) Option 4 |
   ```

3. **Data Tables**
   - Numerical data
   - Experimental results
   - Observation tables
   
   Example:
   ```
   | Temperature | Pressure | Volume |
   |-------------|----------|--------|
   | 300 K       | 1 atm    | 22.4 L |
   | 600 K       | 2 atm    | 22.4 L |
   ```

4. **Answer Tables**
   - Answer key in table format
   - Marking scheme tables
   - Rubric tables

**Table Storage Structure:**

```json
{
  "type": "table",
  "id": "table_001",
  "metadata": {
    "rows": 5,
    "columns": 3,
    "has_header": true,
    "has_borders": true,
    "alignment": "center"
  },
  "structure": {
    "merged_cells": [
      {"row": 0, "col": 0, "rowspan": 2, "colspan": 1}
    ]
  },
  "content": [
    {
      "row": 0,
      "cells": [
        {
          "col": 0,
          "text": "Header 1",
          "bold": true,
          "background": "#f0f0f0",
          "align": "center"
        },
        {
          "col": 1,
          "text": "Header 2",
          "bold": true
        }
      ]
    },
    {
      "row": 1,
      "cells": [...]
    }
  ],
  "styling": {
    "border_color": "#000000",
    "border_width": 1,
    "cell_padding": 5
  }
}
```

**Table Operations:**

- **Extract:** Original table ka complete structure capture
- **Store:** JSON format me with all properties
- **Edit:** Visual table editor me edit kare
- **Render:** Output document me exact reproduction
- **Resize:** Columns/rows add/remove
- **Format:** Colors, borders, alignment change
- **Export:** Same table across all export formats

---

#### Feature 3: Multilingual Content Support ⭐ NEW

**Description:** Hindi, English aur mixed content ko perfectly handle kare

**Supported Languages:**
- Hindi (Devanagari script - खण्ड, प्रश्न)
- English
- Mixed Hindi-English content
- Sanskrit (for relevant subjects)
- Urdu (if needed)
- Other Indian languages (extensible)

**Font Handling:**
- Auto-detect Unicode fonts
- Preserve font families
- Support for Devanagari fonts (Mangal, Kruti Dev, etc.)
- Fallback fonts for compatibility

**Special Character Preservation:**
- Hindi vowels and consonants (अ, आ, क, ख)
- Matras and conjuncts (ं, ्, ँ)
- Special symbols (°, %, ₹)
- Mathematical symbols (×, ÷, =)
- Punctuation (।, ?)

**Text Direction:**
- Left-to-right (English)
- Right-to-left support (if needed for Urdu)
- Mixed direction handling

---

#### Feature 4: Smart Question Detection with Context

**Description:** AI samajhe ki kahan question hai, uska type kya hai, aur uska complete context

**Enhanced Detection:**

1. **Question Boundary Detection**
   - Number patterns: 1., 2., (1), Q1, प्रश्न 1
   - Section markers: खण्ड-अ, Section A
   - Sub-questions: (a), (i), अ, क
   - End markers: next question number, section break

2. **Question Type Classification**
   ```
   Types Detected:
   ├── Multiple Choice (MCQ)
   │   ├── Single correct
   │   ├── Multiple correct
   │   └── Assertion-Reason
   ├── True/False
   ├── Fill in the Blanks
   │   ├── Single blank
   │   └── Multiple blanks
   ├── Match the Following
   ├── Short Answer (2-3 marks)
   ├── Long Answer (5-10 marks)
   ├── Numerical Problems
   ├── Diagram-based
   └── Comprehension-based
   ```

3. **Context Association**
   - Question + Options (for MCQs)
   - Question + Table (for table-based questions)
   - Question + Diagram (for diagram-based questions)
   - Question + Data (for numerical problems)
   - Instructions + Questions set
   - Passage + Questions (for comprehension)

4. **Marks Detection**
   - Pattern recognition: (2 marks), [5], (2)
   - Hindi patterns: (2 अंक)
   - Auto-assign if not found

**Example Detection:**

```
Input Text:
---
1. खड़िया का रासायनिक सूत्र है: (The chemical formula of Chalk is:)
(A) CaCO₃
(B) CaO
(C) Ca(OH)₂
(D) CaSO₄

AI Detection Output:
{
  "question_number": "1",
  "question_text": "खड़िया का रासायनिक सूत्र है:",
  "question_text_english": "The chemical formula of Chalk is:",
  "type": "MCQ",
  "options": [
    {"id": "A", "text": "CaCO₃"},
    {"id": "B", "text": "CaO"},
    {"id": "C", "text": "Ca(OH)₂"},
    {"id": "D", "text": "CaSO₄"}
  ],
  "has_equation": true,
  "language": "mixed",
  "marks": null,
  "subject": "Chemistry"
}
```

---

### 2.2 Enhanced Database & Storage

#### Feature 5: Rich Content Database Schema

**Database Structure:**

**Questions Table:**
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    
    -- Core Content
    question_number VARCHAR(20),
    question_text TEXT,
    question_html TEXT,              -- Rich formatted content
    question_json JSONB,              -- Complete structure
    
    -- Question Context
    has_options BOOLEAN,
    options JSONB,                    -- Array of options
    has_table BOOLEAN,
    table_data JSONB,                 -- Table structure
    has_image BOOLEAN,
    images JSONB,                     -- Array of images
    has_equation BOOLEAN,
    equations JSONB,                  -- Array of equations
    
    -- Metadata
    subject VARCHAR(100),
    topic VARCHAR(200),
    subtopic VARCHAR(200),
    difficulty VARCHAR(20),           -- Easy, Medium, Hard
    question_type VARCHAR(50),        -- MCQ, Short Answer, etc.
    marks INTEGER,
    estimated_time INTEGER,           -- In minutes
    cognitive_level VARCHAR(50),      -- Bloom's taxonomy
    
    -- Source Information
    source_file VARCHAR(500),
    source_year INTEGER,
    source_board VARCHAR(100),
    original_position INTEGER,        -- Position in source doc
    
    -- Language & Formatting
    language VARCHAR(20),             -- Hindi, English, Mixed
    primary_language VARCHAR(20),
    fonts_used JSONB,
    formatting JSONB,                 -- Colors, styles, etc.
    
    -- Tags & Classification
    tags TEXT[],
    keywords TEXT[],
    related_questions UUID[],
    
    -- Usage & Analytics
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    quality_score FLOAT,
    user_rating INTEGER,
    
    -- Version Control
    version INTEGER DEFAULT 1,
    parent_question_id UUID,
    is_latest BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Full text search
    search_vector TSVECTOR
);

-- Indexes for fast searching
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_search ON questions USING GIN(search_vector);
```

**Tables Content Table:**
```sql
CREATE TABLE question_tables (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id),
    
    -- Table Structure
    row_count INTEGER,
    column_count INTEGER,
    has_header BOOLEAN,
    has_merged_cells BOOLEAN,
    
    -- Complete Table Data
    table_json JSONB,                 -- Full table structure
    table_html TEXT,                  -- HTML representation
    
    -- Styling
    border_style VARCHAR(50),
    cell_padding INTEGER,
    alignment VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Images Table:**
```sql
CREATE TABLE question_images (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id),
    
    -- Image Data
    image_url TEXT,
    image_base64 TEXT,
    image_type VARCHAR(20),           -- JPEG, PNG, etc.
    
    -- Metadata
    caption TEXT,
    position VARCHAR(20),             -- inline, left, right, center
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Papers Table:**
```sql
CREATE TABLE papers (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    
    -- Paper Information
    title VARCHAR(500),
    subject VARCHAR(100),
    class VARCHAR(50),
    exam_name VARCHAR(200),
    
    -- Configuration
    total_marks INTEGER,
    duration INTEGER,                 -- In minutes
    
    -- Content
    sections JSONB,                   -- Array of sections
    questions_order UUID[],           -- Question IDs in order
    
    -- Template & Styling
    template_id UUID REFERENCES templates(id),
    custom_styling JSONB,
    
    -- Header/Footer
    header_config JSONB,
    footer_config JSONB,
    
    -- Generated Files
    docx_url TEXT,
    pdf_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

#### Feature 6: Advanced Search & Filtering System

**Multi-Criteria Search:**

1. **Text Search**
   - Full-text search in question content
   - Search in Hindi/English both
   - Search in options
   - Search in table content
   - Fuzzy matching for typos
   - Synonym support

2. **Filter Combinations**
   ```
   Filters:
   ├── Subject
   │   └── Topic
   │       └── Subtopic
   ├── Difficulty (Easy, Medium, Hard)
   ├── Question Type
   ├── Marks (Range slider)
   ├── Language (Hindi, English, Mixed)
   ├── Has Table (Yes/No)
   ├── Has Image (Yes/No)
   ├── Has Equation (Yes/No)
   ├── Source Year (2016-2025)
   ├── Tags (Multiple select)
   └── Usage (Most used, Least used, Never used)
   ```

3. **Smart Filters**
   - "Similar to this question" - AI finds similar questions
   - "Same topic different difficulty" - Quick variations
   - "Unused questions" - Questions never used in papers
   - "Recently added" - Last 7/30 days

4. **Saved Searches**
   - Save frequently used filter combinations
   - Quick access to saved searches
   - Share searches with team members

**Search UI:**

```
┌────────────────────────────────────────────────────┐
│  🔍 Search Questions                               │
│  [Search in hindi/english...____________] [Search] │
│                                                     │
│  Quick Filters:                                    │
│  [Science ▼] [MCQ ▼] [Medium ▼] [Has Table ▼]    │
│                                                     │
│  Advanced Filters ▼                                │
│  ┌─────────────────────────────────────────────┐  │
│  │ Subject:    [Science ▼]                     │  │
│  │ Topic:      [Chemistry ▼]                   │  │
│  │ Difficulty: ☑ Easy ☑ Medium ☐ Hard        │  │
│  │ Type:       ☑ MCQ ☐ Short Answer           │  │
│  │ Marks:      [1]━━━●━━━[10]                 │  │
│  │ Language:   ☑ Hindi ☑ English              │  │
│  │ Content:    ☑ Has Table ☐ Has Image        │  │
│  │ Year:       [2016]━━●━━[2025]              │  │
│  │ Tags:       [Chemistry, Acids, CBSE]       │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  [Save Search] [Clear All]                         │
└────────────────────────────────────────────────────┘
```

---

### 2.3 Enhanced Question Management

#### Feature 7: Visual Rich Content Editor

**Editor Components:**

1. **Main Text Editor**
   - WYSIWYG interface
   - Formatting toolbar (Bold, Italic, Underline, Color, etc.)
   - Font selection with Devanagari support
   - Undo/Redo functionality
   - Spell check (Hindi + English)

2. **Table Editor** ⭐ KEY FEATURE
   ```
   Table Editor Interface:
   ┌──────────────────────────────────────┐
   │ [+ Row] [- Row] [+ Col] [- Col]     │
   │ [Merge] [Split] [Border ▼] [Color]  │
   │                                      │
   │ ┌───────────┬───────────┬──────┐   │
   │ │ Header 1  │ Header 2  │ H3   │   │
   │ ├───────────┼───────────┼──────┤   │
   │ │ Cell 1,1  │ Cell 1,2  │ C1,3 │   │
   │ ├───────────┼───────────┼──────┤   │
   │ │ Cell 2,1  │ Cell 2,2  │ C2,3 │   │
   │ └───────────┴───────────┴──────┘   │
   │                                      │
   │ [Apply] [Cancel]                    │
   └──────────────────────────────────────┘
   
   Features:
   - Add/remove rows and columns
   - Merge/split cells
   - Cell formatting (background, text color)
   - Border customization
   - Cell alignment (left, center, right)
   - Copy/paste table structure
   - Import table from Excel
   - Table templates (common formats)
   ```

3. **Equation Editor**
   - Visual builder with palette
   - LaTeX code editor
   - Common templates (fractions, roots, integrals)
   - Chemistry equation builder
   - Live preview

4. **Image Manager**
   - Upload images
   - Crop and resize
   - Set captions
   - Position control
   - Image library

5. **Options Manager (for MCQs)**
   ```
   Options Editor:
   ┌──────────────────────────────────────┐
   │ Options:                             │
   │ ○ (A) [Option 1 text_____________]  │
   │ ○ (B) [Option 2 text_____________]  │
   │ ○ (C) [Option 3 text_____________]  │
   │ ● (D) [Option 4 text_____________]  │ ← Correct
   │                                      │
   │ [+ Add Option] [- Remove]           │
   │ Correct Answer: (D) ✓               │
   └──────────────────────────────────────┘
   ```

6. **Metadata Editor**
   - Subject/Topic dropdowns
   - Difficulty selector
   - Marks input
   - Tags manager
   - Language selector

**Auto-Save:**
- Every 30 seconds
- On blur (when you click outside)
- Manual save button
- Version history maintained

---

#### Feature 8: Bulk Import & Management

**Batch Upload:**
- Upload multiple files at once (up to 20 files)
- Combined processing
- Progress tracking for each file
- Consolidated results view

**Bulk Edit Operations:**

1. **Select Multiple Questions**
   - Checkbox selection
   - Select all in current view
   - Select by filter (e.g., all Easy questions)
   - Select range (Question 1-10)

2. **Batch Actions**
   ```
   Selected: 25 questions
   
   Actions:
   ├── Change Subject → [Physics ▼]
   ├── Change Topic → [Mechanics ▼]
   ├── Set Difficulty → [Medium]
   ├── Add Tags → [CBSE, 2024, Important]
   ├── Remove Tags → [Old]
   ├── Set Marks → [3]
   ├── Delete Selected
   ├── Duplicate Selected
   ├── Export Selected
   └── Move to Collection
   ```

3. **Smart Suggestions**
   - "These 5 questions seem similar - merge them?"
   - "This question has no tags - auto-tag?"
   - "Missing marks in 10 questions - auto-assign?"

---

### 2.4 Advanced Paper Generation

#### Feature 9: Flexible Paper Builder

**Three Building Modes:**

**Mode 1: Manual Drag-Drop Builder**

```
┌─────────────┬──────────────────┬─────────────┐
│ Question    │  Paper Canvas    │ Settings    │
│ Bank        │                  │             │
│             │  📄 My Paper     │ 📋 Config   │
│ [Search]    │  ─────────────── │             │
│ [Filters]   │  Section A       │ Title: ___  │
│             │  (MCQs - 20m)    │ Marks: 100  │
│ Q1. What    │  ┌────────────┐  │ Time: 3h    │
│ is...       │  │ Q1. [Drag] │  │             │
│ [Drag →]    │  │ Q5. [Drag] │  │ Sections:   │
│             │  │ Q12.[Drag] │  │ ☑ Section A │
│ Q2. Calc... │  └────────────┘  │ ☑ Section B │
│ [Drag →]    │                  │ ☐ Section C │
│             │  Section B       │             │
│ Q3. Table   │  (Short - 30m)   │ Template:   │
│ shows...    │  ┌────────────┐  │ [Modern ▼]  │
│ [Drag →]    │  │ Q2. [Drag] │  │             │
│             │  │ Q8. [Drag] │  │ [Preview]   │
│ [Load More] │  └────────────┘  │ [Generate]  │
└─────────────┴──────────────────┴─────────────┘

Features:
- Drag questions from bank to paper
- Reorder questions within sections
- Visual section management
- Real-time marks calculation
- Difficulty distribution graph
- Time estimation based on question types
```

**Mode 2: AI Smart Generation**

```
AI Paper Generator
┌──────────────────────────────────────────────┐
│ Step 1: Basic Configuration                  │
│ Subject:  [Science ▼]                        │
│ Class:    [10th ▼]                           │
│ Board:    [CBSE ▼]                           │
│                                               │
│ Step 2: Paper Structure                      │
│ Total Marks:    [80]                         │
│ Duration:       [3] hours                    │
│ Sections:       [3]                          │
│                                               │
│ Section A - MCQs                             │
│   Questions: [20]  Marks each: [1]           │
│   Topics: [All ▼]                            │
│                                               │
│ Section B - Short Answer                     │
│   Questions: [10]  Marks each: [3]           │
│   Topics: [All ▼]                            │
│                                               │
│ Section C - Long Answer                      │
│   Questions: [5]   Marks each: [5]           │
│   Topics: [All ▼]                            │
│                                               │
│ Step 3: Difficulty Distribution              │
│ Easy:   [━━━●────] 30%                       │
│ Medium: [━━━━━●──] 50%                       │
│ Hard:   [━━●─────] 20%                       │
│                                               │
│ Step 4: Topic Coverage (Optional)            │
│ ☑ Chemistry     Weight: [━━━●─] 40%         │
│ ☑ Physics       Weight: [━━━●─] 35%         │
│ ☑ Biology       Weight: [━●──] 25%          │
│                                               │
│ Advanced Options ▼                           │
│ ☑ Include diagrams                           │
│ ☑ Include tables                             │
│ ☑ Include numerical problems                │
│ ☐ Avoid recently used questions             │
│                                               │
│ [Generate Paper] [Save as Template]          │
└──────────────────────────────────────────────┘

AI Processing:
1. Analyzes question bank
2. Selects optimal questions based on criteria
3. Ensures topic coverage
4. Balances difficulty
5. Arranges logically (easy to hard)
6. Generates in <10 seconds
```

**Mode 3: Template-Based Quick Start**

```
Quick Start Templates
┌────────────────────────────────────────┐
│                                        │
│  📋 CBSE Board Pattern (Class 10)     │
│  80 marks | 3 hours                   │
│  Section A: 20 MCQs (1 mark each)     │
│  Section B: 10 Short (3 marks each)   │
│  Section C: 5 Long (5 marks each)     │
│  [Use Template]                        │
│                                        │
│  📋 ICSE Pattern (Class 12)           │
│  100 marks | 3 hours                  │
│  [Use Template]                        │
│                                        │
│  📋 JEE Main Pattern                  │
│  300 marks | 3 hours                  │
│  [Use Template]                        │
│                                        │
│  📋 My Saved Template: Mid-Term       │
│  50 marks | 2 hours                   │
│  [Use Template] [Edit]                │
│                                        │
│  [+ Create Custom Template]           │
└────────────────────────────────────────┘
```

---

#### Feature 10: Section Management System

**Section Configuration:**

```json
{
  "sections": [
    {
      "id": "section_a",
      "name": "Section A - Objective Questions",
      "name_hindi": "खण्ड-अ : वस्तुनिष्ठ प्रश्न",
      "instructions": [
        "All questions are compulsory",
        "Each question carries 1 mark"
      ],
      "instructions_hindi": [
        "सभी प्रश्न अनिवार्य हैं",
        "प्रत्येक प्रश्न 1 अंक का है"
      ],
      "total_marks": 20,
      "question_count": 20,
      "marks_per_question": 1,
      "question_type": "MCQ",
      "questions": ["q_uuid_1", "q_uuid_2", ...],
      "layout": {
        "columns": 1,
        "spacing": "normal"
      }
    },
    {
      "id": "section_b",
      "name": "Section B - Short Answer Questions",
      "name_hindi": "खण्ड-ब : लघु उत्तरीय प्रश्न",
      "instructions": [
        "Attempt any 8 questions",
        "Each question carries 3 marks"
      ],
      "total_marks": 24,
      "question_count": 10,
      "marks_per_question": 3,
      "attempt_required": 8,
      "question_type": "Short Answer",
      "questions": ["q_uuid_21", ...],
      "has_internal_choice": true
    }
  ]
}
```

**Section Editor:**
```
Section Management
┌──────────────────────────────────────────┐
│ Section A                          [▼]   │
│ ┌──────────────────────────────────────┐ │
│ │ Name (English):                      │ │
│ │ [Section A - Objective Questions___] │ │
│ │                                      │ │
│ │ Name (Hindi):                        │ │
│ │ [खण्ड-अ : वस्तुनिष्ठ प्रश्न_____]     │ │
│ │                                      │ │
│ │ Instructions (English):              │ │
│ │ [All questions are compulsory____]   │ │
│ │ [+ Add instruction]                  │ │
│ │                                      │ │
│ │ Instructions (Hindi):                │ │
│ │ [सभी प्रश्न अनिवार्य हैं___________]  │ │
│ │ [+ Add instruction]                  │ │
│ │                                      │ │
│ │ Configuration:                       │ │
│ │ Total Questions: [20]                │ │
│ │ Marks per Q:    [1]                  │ │
│ │ Total Marks:    [20] (auto)          │ │
│ │                                      │ │
│ │ ☑ Internal Choice                    │ │
│ │   Attempt: [8] out of [10]          │ │
│ │                                      │ │
│ │ Layout:                              │ │
│ │ Columns: ○ 1  ● 2  ○ 3              │ │
│ │ Spacing: ○ Compact ● Normal ○ Wide  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [+ Add Section] [Remove Section]        │
└──────────────────────────────────────────┘
```

---

#### Feature 11: Professional Template System with Table Support

**Template Categories:**

**1. Classic Academic Templates (3 variants)**
- Traditional board exam style
- Conservative design
- Focus on readability
- **Table rendering:** Classic bordered tables
- Example: CBSE/ICSE traditional format

**2. Modern Professional (3 variants)**
- Contemporary design
- Subtle color accents
- Clean typography
- **Table rendering:** Modern borderless/subtle border tables
- Example: International school format

**3. Minimalist Clean (2 variants)**
- Ultra-clean layout
- Maximum white space
- Simple borders
- **Table rendering:** Minimal tables with light borders

**4. Institution Branded (2 variants)**
- Custom logo placement
- Brand colors support
- Professional headers
- **Table rendering:** Branded table styling

**Template Features:**

```javascript
// Template Structure
{
  "template_id": "modern_v2",
  "name": "Modern Professional v2",
  "category": "modern",
  
  "page_config": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 2.5,
      "bottom": 2.5,
      "left": 2.0,
      "right": 2.0
    }
  },
  
  "header": {
    "show": true,
    "height": 3.0,
    "components": [
      {
        "type": "logo",
        "position": "left",
        "max_width": 2.5,
        "max_height": 2.5
      },
      {
        "type": "text",
        "position": "center",
        "content": "{{institution_name}}",
        "font": "Arial",
        "size": 16,
        "bold": true
      },
      {
        "type": "text",
        "position": "right",
        "content": "{{exam_name}}",
        "font": "Arial",
        "size": 12
      }
    ],
    "border": {
      "show": true,
      "color": "#333333",
      "width": 1
    }
  },
  
  "title_section": {
    "font": "Arial",
    "size": 14,
    "bold": true,
    "align": "center",
    "spacing_bottom": 1.0
  },
  
  "info_table": {
    "show": true,
    "fields": [
      {"label": "Subject", "value": "{{subject}}"},
      {"label": "Class", "value": "{{class}}"},
      {"label": "Date", "value": "{{date}}"},
      {"label": "Max Marks", "value": "{{max_marks}}"},
      {"label": "Duration", "value": "{{duration}}"}
    ],
    "layout": "2_columns",
    "border": true
  },
  
  "section_style": {
    "heading": {
      "font": "Arial",
      "size": 12,
      "bold": true,
      "background": "#f0f0f0",
      "padding": 0.3
    },
    "instructions": {
      "font": "Arial",
      "size": 10,
      "italic": true,
      "indent": 0.5
    }
  },
  
  "question_style": {
    "number": {
      "format": "{{number}}.",
      "bold": true
    },
    "text": {
      "font": "Arial",
      "size": 11,
      "line_spacing": 1.15
    },
    "spacing_after": 0.5
  },
  
  "table_style": { // ⭐ KEY FEATURE
    "border": {
      "show": true,
      "color": "#000000",
      "width": 1,
      "style": "solid"
    },
    "header": {
      "background": "#e0e0e0",
      "bold": true,
      "align": "center"
    },
    "cells": {
      "padding": 5,
      "align": "left",
      "vertical_align": "middle"
    },
    "alternate_rows": {
      "enabled": false,
      "color": "#f9f9f9"
    }
  },
  
  "options_style": { // For MCQs
    "layout": "inline", // or "table" or "block"
    "format": "({{letter}}) {{text}}",
    "spacing": 0.3
  },
  
  "equation_style": {
    "renderer": "mathjax",
    "display_mode": "centered",
    "font_size": 12
  },
  
  "image_style": {
    "max_width": "100%",
    "align": "center",
    "border": false
  },
  
  "footer": {
    "show": true,
    "left": "{{institution_name}}",
    "center": "Page {{page}} of {{total_pages}}",
    "right": "{{subject}} - {{class}}"
  }
}
```

**Template Customization Panel:**

```
Customize Template
┌─────────────────────────────────────────┐
│ General                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Institution Name:                    │ │
│ │ [Delhi Public School_____________]   │ │
│ │                                      │ │
│ │ Logo: [Upload] [school_logo.png]    │ │
│ │ Logo Position: ○ Left ● Center ○ Right│ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Colors & Fonts                          │
│ ┌─────────────────────────────────────┐ │
│ │ Primary Color:   [#2c3e50] [🎨]     │ │
│ │ Accent Color:    [#3498db] [🎨]     │ │
│ │ Text Font:       [Arial ▼]          │ │
│ │ Heading Font:    [Arial Bold ▼]     │ │
│ │ Font Size:       [11] pt            │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Layout                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Page Size:    [A4 ▼]                │ │
│ │ Orientation:  ● Portrait ○ Landscape│ │
│ │ Margins:                             │ │
│ │   Top:    [2.5] cm                  │ │
│ │   Bottom: [2.5] cm                  │ │
│ │   Left:   [2.0] cm                  │ │
│ │   Right:  [2.0] cm                  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Tables                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Border Style:   [Solid ▼]           │ │
│ │ Border Color:   [#000000] [🎨]      │ │
│ │ Border Width:   [1] px              │ │
│ │ Header BG:      [#e0e0e0] [🎨]      │ │
│ │ ☑ Alternate row colors              │ │
│ │ Alt. Row Color: [#f9f9f9] [🎨]      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Preview Changes] [Save] [Reset]        │
└─────────────────────────────────────────┘
```

**Table Rendering Examples:**

**Classic Style:**
```
┌──────────────┬──────────────┬──────────────┐
│  Column A    │  Column B    │  Match       │
├──────────────┼──────────────┼──────────────┤
│ 1. Item      │ a. Answer    │              │
├──────────────┼──────────────┼──────────────┤
│ 2. Item      │ b. Answer    │              │
└──────────────┴──────────────┴──────────────┘
```

**Modern Style:**
```
 Column A      Column B      Match      
──────────────────────────────────────────
 1. Item       a. Answer                
 2. Item       b. Answer                
──────────────────────────────────────────
```

**Minimal Style:**
```
Column A          Column B          Match
1. Item           a. Answer
2. Item           b. Answer
```

---

#### Feature 12: Live Preview with Instant Template Switching ⭐

**Preview Interface:**

```
┌────────────────────────────────────────────────────┐
│  Preview                              [⚙️ Settings] │
│  ┌──────────────────────────────────────────────┐  │
│  │ Template: [Modern v2 ▼]  [⟲ Refresh]        │  │
│  │ ┌──────────────────────────┐ Zoom: [100% ▼] │  │
│  │ │                          │ [🔍+] [🔍-]    │  │
│  │ │  📄 DELHI PUBLIC SCHOOL  │                 │  │
│  │ │  ═══════════════════════ │                 │  │
│  │ │  MID-TERM EXAMINATION    │ [🖨️ Print]     │  │
│  │ │                          │ [⬇️ Download]   │  │
│  │ │  Subject: Science        │                 │  │
│  │ │  Class: X    Date: ...   │                 │  │
│  │ │  ───────────────────────│                 │  │
│  │ │                          │                 │  │
│  │ │  SECTION A               │                 │  │
│  │ │  All questions compul... │                 │  │
│  │ │                          │                 │  │
│  │ │  1. Question text here   │ Page 1 of 4    │  │
│  │ │     (A) Option A         │ [◀️] [▶️]       │  │
│  │ │     (B) Option B         │                 │  │
│  │ │                          │                 │  │
│  │ │  2. Table question:      │ View Mode:     │  │
│  │ │     ┌─────┬─────┐        │ ● Page         │  │
│  │ │     │Col A│Col B│        │ ○ Continuous   │  │
│  │ │     ├─────┼─────┤        │ ○ Two-page     │  │
│  │ │     │Data │Data │        │                 │  │
│  │ │     └─────┴─────┘        │ [🖼️ Full Screen]│  │
│  │ └──────────────────────────┘                 │  │
│  │                                              │  │
│  │  Try Different Templates:                   │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐            │  │
│  │  │ T1│ │ T2│ │ T3│ │ T4│ │ T5│            │  │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘            │  │
│  │  Click any template for instant preview     │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘

Features:
- ⚡ Instant template switching (<200ms)
- 🔍 Zoom in/out (50% to 200%)
- 📄 Page navigation
- 🖨️ Print preview mode
- 📱 Responsive preview (Desktop/Tablet/Mobile)
- 🎨 Side-by-side template comparison
- 💾 Auto-save on template change
```

**Template Comparison View:**

```
Compare Templates
┌─────────────────────┬─────────────────────┐
│  Classic Template   │  Modern Template    │
│  ┌───────────────┐  │  ┌───────────────┐  │
│  │               │  │  │               │  │
│  │  [Preview]    │  │  │  [Preview]    │  │
│  │               │  │  │               │  │
│  │               │  │  │               │  │
│  └───────────────┘  │  └───────────────┘  │
│                     │                     │
│  [Use This]         │  [Use This]         │
└─────────────────────┴─────────────────────┘
```

---

### 2.5 Export & Output System

#### Feature 13: Multi-Format Export with Perfect Preservation

**Primary Export Formats:**

**1. DOCX (Microsoft Word) - Fully Editable**

Technical Implementation:
```python
# DOCX Generation with Tables
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def generate_docx(paper_data):
    doc = Document()
    
    # Apply template styles
    style = doc.styles['Normal']
    font = style.font
    font.name = paper_data['template']['font']
    font.size = Pt(11)
    
    # Header
    header = doc.sections[0].header
    header_para = header.paragraphs[0]
    # ... add logo, text
    
    # Title and Info Table
    title = doc.add_paragraph(paper_data['title'])
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.runs[0].bold = True
    
    # Info table
    info_table = doc.add_table(rows=2, cols=5)
    info_table.style = 'Table Grid'
    # ... populate info
    
    # Questions
    for section in paper_data['sections']:
        # Section heading
        section_heading = doc.add_paragraph(section['name'])
        section_heading.runs[0].bold = True
        
        # Section instructions
        for instruction in section['instructions']:
            inst_para = doc.add_paragraph(instruction)
            inst_para.runs[0].italic = True
        
        # Questions
        for question in section['questions']:
            # Question number and text
            q_para = doc.add_paragraph()
            q_para.add_run(f"{question['number']}. ").bold = True
            q_para.add_run(question['text'])
            
            # If question has table
            if question['has_table']:
                table_data = question['table']
                question_table = doc.add_table(
                    rows=table_data['rows'],
                    cols=table_data['cols']
                )
                question_table.style = 'Table Grid'
                
                # Populate table cells
                for row_idx, row_data in enumerate(table_data['content']):
                    for col_idx, cell_data in enumerate(row_data):
                        cell = question_table.rows[row_idx].cells[col_idx]
                        cell.text = cell_data['text']
                        
                        # Apply cell formatting
                        if cell_data.get('bold'):
                            cell.paragraphs[0].runs[0].bold = True
                        if cell_data.get('background'):
                            # Apply background color
                            pass
            
            # If question has image
            if question['has_image']:
                doc.add_picture(
                    question['image_path'],
                    width=Inches(question['image_width'])
                )
            
            # If MCQ, add options
            if question['type'] == 'MCQ':
                for option in question['options']:
                    opt_para = doc.add_paragraph()
                    opt_para.add_run(f"({option['id']}) ").bold = True
                    opt_para.add_run(option['text'])
            
            # If has equation
            if question['has_equation']:
                # Use python-docx-template or omath for equations
                # For now, insert as image or MathType
                pass
            
            # Spacing
            doc.add_paragraph()
    
    # Save
    doc.save(output_path)
    return output_path
```

Features:
- ✅ All formatting preserved
- ✅ Tables with exact structure
- ✅ Images embedded
- ✅ Equations (as MathType objects or images)
- ✅ Fonts and colors
- ✅ Headers and footers
- ✅ Page breaks and sections
- ✅ Fully editable after export

**2. PDF - Print-Ready, High Quality**

Technical Implementation:
```python
# PDF Generation using WeasyPrint
from weasyprint import HTML, CSS
from jinja2 import Template

def generate_pdf(paper_data):
    # Create HTML from template
    html_template = Template("""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                size: A4;
                margin: 2.5cm 2cm;
                @top-center {
                    content: "{{ paper_data.institution }}";
                }
                @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                }
            }
            
            body {
                font-family: "{{ template.font }}", Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.15;
            }
            
            .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            
            .section {
                margin-top: 20px;
                page-break-inside: avoid;
            }
            
            .section-heading {
                font-weight: bold;
                font-size: 12pt;
                background: #f0f0f0;
                padding: 5px;
                margin-bottom: 10px;
            }
            
            .question {
                margin-bottom: 15px;
                page-break-inside: avoid;
            }
            
            .question-number {
                font-weight: bold;
            }
            
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 10px 0;
                page-break-inside: avoid;
            }
            
            table th {
                background: #e0e0e0;
                font-weight: bold;
                text-align: center;
                padding: 8px;
                border: 1px solid #000;
            }
            
            table td {
                padding: 8px;
                border: 1px solid #000;
            }
            
            .equation {
                text-align: center;
                margin: 10px 0;
            }
            
            img {
                max-width: 100%;
                display: block;
                margin: 10px auto;
            }
        </style>
        
        <!-- MathJax for equations -->
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <h1>{{ paper_data.institution }}</h1>
            <h2>{{ paper_data.exam_name }}</h2>
            <!-- Info table -->
            <table class="info-table">
                <tr>
                    <td><strong>Subject:</strong> {{ paper_data.subject }}</td>
                    <td><strong>Class:</strong> {{ paper_data.class }}</td>
                    <td><strong>Date:</strong> {{ paper_data.date }}</td>
                </tr>
                <tr>
                    <td><strong>Max Marks:</strong> {{ paper_data.max_marks }}</td>
                    <td><strong>Duration:</strong> {{ paper_data.duration }}</td>
                    <td></td>
                </tr>
            </table>
        </div>
        
        <!-- Sections -->
        {% for section in paper_data.sections %}
        <div class="section">
            <div class="section-heading">
                {{ section.name }}
            </div>
            
            <!-- Instructions -->
            {% for instruction in section.instructions %}
            <p style="font-style: italic;">{{ instruction }}</p>
            {% endfor %}
            
            <!-- Questions -->
            {% for question in section.questions %}
            <div class="question">
                <span class="question-number">{{ question.number }}.</span>
                {{ question.text }}
                
                <!-- Table if present -->
                {% if question.has_table %}
                <table>
                    {% for row in question.table.content %}
                    <tr>
                        {% for cell in row %}
                        <td {% if cell.bold %}style="font-weight:bold"{% endif %}>
                            {{ cell.text }}
                        </td>
                        {% endfor %}
                    </tr>
                    {% endfor %}
                </table>
                {% endif %}
                
                <!-- Image if present -->
                {% if question.has_image %}
                <img src="{{ question.image_path }}" alt="Question image">
                {% endif %}
                
                <!-- Equation if present -->
                {% if question.has_equation %}
                <div class="equation">
                    \\( {{ question.equation }} \\)
                </div>
                {% endif %}
                
                <!-- Options for MCQ -->
                {% if question.type == 'MCQ' %}
                <div class="options">
                    {% for option in question.options %}
                    <div>({{ option.id }}) {{ option.text }}</div>
                    {% endfor %}
                </div>
                {% endif %}
            </div>
            {% endfor %}
        </div>
        {% endfor %}
    </body>
    </html>
    """)
    
    html_content = html_template.render(
        paper_data=paper_data,
        template=paper_data['template']
    )
    
    # Generate PDF
    pdf = HTML(string=html_content).write_pdf()
    
    with open(output_path, 'wb') as f:
        f.write(pdf)
    
    return output_path
```

Features:
- ✅ Perfect page layout
- ✅ High-quality rendering
- ✅ Equations rendered beautifully
- ✅ Tables with borders and styling
- ✅ Images embedded
- ✅ Professional typography
- ✅ Optimized file size
- ✅ Print-ready quality

**3. Additional Export Formats:**

**Google Docs:**
- Direct upload to Google Drive
- Conversion to Google Docs format
- Shareable link generation
- Collaborative editing enabled

**HTML:**
- Clean semantic HTML
- Responsive design
- MathJax for equations
- Embeddable in websites
- Print stylesheet included

**Markdown:**
- Plain text with formatting
- LaTeX equations in $$...$$ format
- Tables in GitHub-flavored markdown
- Version control friendly

---

#### Feature 14: Export Variations & Options

**Content Variations:**

```
Export Options
┌──────────────────────────────────────────┐
│ What to Export?                          │
│                                          │
│ ☑ Question Paper                         │
│ ☑ Answer Key                             │
│ ☑ Detailed Solutions                     │
│ ☑ Marking Scheme                         │
│ ☐ Blank Answer Sheet                     │
│ ☐ Question Bank Summary                  │
│                                          │
│ ─────────────────────────────────────   │
│                                          │
│ Format Selection:                        │
│ ☑ DOCX (Word) - Editable                │
│ ☑ PDF - Print Ready                     │
│ ☐ Google Docs                            │
│ ☐ HTML                                   │
│ ☐ Markdown                               │
│                                          │
│ ─────────────────────────────────────   │
│                                          │
│ Additional Options:                      │
│ ☑ Include blank space for answers       │
│ ☑ Add page numbers                       │
│ ☑ Add watermark                          │
│ ☐ Password protect PDF                   │
│                                          │
│ Naming:                                  │
│ [Science_Class10_MidTerm_2026_____]     │
│                                          │
│ [Generate & Download] [Email to Me]     │
└──────────────────────────────────────────┘
```

**Answer Key Format:**

```
┌──────────────────────────────────────────┐
│ ANSWER KEY                               │
│ Science - Class X - Mid-Term 2026        │
│ ────────────────────────────────────────│
│                                          │
│ Section A - MCQs                         │
│                                          │
│ 1. (A) CaCO₃                             │
│ 2. (B) Copper                            │
│ 3. (C) Option C                          │
│ ...                                      │
│                                          │
│ Section B - Short Answers                │
│                                          │
│ 21. Answer: Photosynthesis is the       │
│     process by which...                  │
│     [Key Points for 3 marks:             │
│     - Definition (1 mark)                │
│     - Process (1 mark)                   │
│     - Equation (1 mark)]                 │
│                                          │
│ ...                                      │
└──────────────────────────────────────────┘
```

**Detailed Solutions Format:**

```
┌──────────────────────────────────────────┐
│ DETAILED SOLUTIONS                       │
│ Science - Class X - Mid-Term 2026        │
│ ────────────────────────────────────────│
│                                          │
│ Question 1: What is the chemical formula│
│ of Chalk?                                │
│                                          │
│ Solution:                                │
│ The chemical formula of chalk (calcium   │
│ carbonate) is CaCO₃.                     │
│                                          │
│ Explanation:                             │
│ Chalk is primarily made of calcium       │
│ carbonate. It consists of:               │
│ - 1 Calcium (Ca) atom                    │
│ - 1 Carbon (C) atom                      │
│ - 3 Oxygen (O) atoms                     │
│                                          │
│ Therefore, Answer: (A) CaCO₃             │
│                                          │
│ Common Mistakes:                         │
│ - CaO is Calcium Oxide (quicklime)       │
│ - Ca(OH)₂ is Calcium Hydroxide           │
│                                          │
│ ────────────────────────────────────────│
│                                          │
│ Question 2: ...                          │
│ ...                                      │
└──────────────────────────────────────────┘
```

---

#### Feature 15: Print & Share System

**Print Configuration:**

```
Print Settings
┌──────────────────────────────────────────┐
│ Printer: [HP LaserJet Pro ▼]            │
│                                          │
│ Page Setup:                              │
│ Size:        [A4 ▼]                     │
│ Orientation: ● Portrait ○ Landscape     │
│                                          │
│ Print Range:                             │
│ ● All pages                              │
│ ○ Current page                           │
│ ○ Pages: [1-5, 8, 10-12________]        │
│                                          │
│ Copies: [50]  ☑ Collate                 │
│                                          │
│ Quality:                                 │
│ ● High (600 dpi)                         │
│ ○ Standard (300 dpi)                     │
│ ○ Draft (150 dpi)                        │
│                                          │
│ Color:                                   │
│ ○ Color                                  │
│ ● Grayscale                              │
│ ○ Black & White                          │
│                                          │
│ Two-Sided:                               │
│ ● Yes (Flip on long edge)                │
│ ○ Yes (Flip on short edge)               │
│ ○ No                                     │
│                                          │
│ Pages per sheet: [1 ▼]                  │
│                                          │
│ [Print] [Cancel] [Save as Preset]       │
└──────────────────────────────────────────┘
```

**Share Options:**

```
Share Paper
┌──────────────────────────────────────────┐
│ 📧 Email                                 │
│ To: [teacher@school.com___________]     │
│ Subject: [Science Mid-Term Paper___]    │
│ ☑ Include Answer Key                    │
│ [Send Email]                             │
│                                          │
│ 💾 Save to Cloud                         │
│ ● Google Drive  ○ Dropbox  ○ OneDrive  │
│ Folder: [/Question Papers/2026______]   │
│ [Upload]                                 │
│                                          │
│ 🔗 Generate Link                         │
│ ● Public link  ○ Private (password)     │
│ Link expires: [Never ▼]                 │
│ [Generate Link]                          │
│                                          │
│ 📱 QR Code                               │
│ Generate QR code for mobile access      │
│ [Generate QR]                            │
│                                          │
│ 👥 Share with Team                       │
│ Select team members:                     │
│ ☑ John Doe (Math Teacher)               │
│ ☑ Jane Smith (Science HOD)              │
│ Permission: [Can View ▼]                │
│ [Share]                                  │
└──────────────────────────────────────────┘
```

---

## 3. Complete User Workflow Example

### Scenario: Teacher uploads 10 years of past papers and creates new paper

**Step 1: Batch Upload (2 minutes)**
1. Teacher clicks "Import Questions"
2. Uploads all 10 DOCX files (2016-2025)
3. AI processes all files in parallel
4. Shows progress: "Processing 450 questions from 10 files..."
5. Extraction complete in 90 seconds

**Step 2: Review & Confirm (3 minutes)**
1. System shows extracted questions with preview
2. Teacher reviews sample questions
3. Checks table rendering
4. Verifies equations are correct
5. Clicks "Confirm Import"
6. All 450 questions saved to database

**Step 3: Create New Paper (5 minutes)**
1. Clicks "Create Paper" → "AI Auto-Generate"
2. Configures:
   - Subject: Science
   - Class: 10th
   - Board: CBSE
   - Total Marks: 80
   - Duration: 3 hours
   - Sections:
     * A: 20 MCQs (1 mark each)
     * B: 10 Short (3 marks each)
     * C: 5 Long (5 marks each)
   - Difficulty: 30% Easy, 50% Medium, 20% Hard
   - Topic coverage: All topics equally
3. AI generates paper in 8 seconds
4. Reviews generated paper

**Step 4: Customize (3 minutes)**
1. Removes 2 questions that are too similar
2. Adds 1 table-based question from bank
3. Rearranges Section B order
4. Edits header to add school logo
5. Adds specific instructions in Hindi

**Step 5: Template Selection (2 minutes)**
1. Opens template gallery
2. Tries "Classic CBSE" - looks good
3. Tries "Modern Professional" - even better!
4. Customizes colors to match school branding
5. Applies template

**Step 6: Preview & Export (2 minutes)**
1. Reviews complete preview
2. Switches to print preview
3. Checks page breaks
4. All looks perfect!
5. Exports:
   - Question Paper (PDF + DOCX)
   - Answer Key (PDF)
   - Blank Answer Sheet (PDF)
6. Downloads all files

**Step 7: Print (1 minute)**
1. Opens print dialog
2. Selects printer
3. Sets copies: 50
4. Two-sided printing
5. Prints!

**Total Time: ~15 minutes**
**vs Traditional Method: 3-4 hours** ✨

---

## 4. Technical Implementation Details

### 4.1 AI Processing Pipeline

```
┌──────────────────────────────────────────────┐
│ INPUT: DOCX/PDF File                         │
└────────────────┬─────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────┐
│ STAGE 1: Document Parsing                    │
│ • Extract raw text with formatting           │
│ • Extract tables with structure              │
│ • Extract images with metadata               │
│ • Preserve all styling information           │
└────────────────┬─────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────┐
│ STAGE 2: AI Analysis (Claude API)            │
│                                               │
│ Prompt:                                       │
│ "Analyze this document and extract:          │
│  1. Individual questions with boundaries      │
│  2. Question types (MCQ, Short Answer, etc.) │
│  3. Subject and topic for each question      │
│  4. Difficulty level estimation              │
│  5. Marks (if mentioned)                     │
│  6. Associate tables/images with questions   │
│  7. Detect equations and convert to LaTeX    │
│  8. Preserve Hindi/English content           │
│                                               │
│ Return structured JSON."                      │
│                                               │
│ Response Format:                              │
│ {                                             │
│   "questions": [                              │
│     {                                         │
│       "id": "q_001",                         │
│       "number": "1",                         │
│       "text": "...",                         │
│       "type": "MCQ",                         │
│       "subject": "Chemistry",                │
│       "topic": "Acids and Bases",            │
│       "difficulty": "Easy",                  │
│       "options": [...],                      │
│       "table": {...},                        │
│       "equations": [...]                     │
│     }                                         │
│   ]                                           │
│ }                                             │
└────────────────┬─────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────┐
│ STAGE 3: Content Processing                  │
│ • Convert equations to LaTeX                  │
│ • Store images in cloud storage              │
│ • Process table structures                   │
│ • Normalize formatting                       │
│ • Generate search keywords                   │
└────────────────┬─────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────┐
│ STAGE 4: Database Storage                    │
│ • Insert questions into PostgreSQL            │
│ • Store tables in separate table             │
│ • Store images in separate table             │
│ • Create search index                        │
│ • Link related data                          │
└────────────────┬─────────────────────────────┘
                 ▼
┌──────────────────────────────────────────────┐
│ OUTPUT: Structured Question Bank             │
│ ✅ Ready for search, edit, use               │
└──────────────────────────────────────────────┘
```

### 4.2 Database Schema (Complete)

```sql
-- Users table (existing)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Questions table (enhanced)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Question Content
    question_number VARCHAR(50),
    question_text TEXT NOT NULL,
    question_html TEXT,
    question_json JSONB,
    
    -- Question Context
    has_options BOOLEAN DEFAULT false,
    options JSONB,
    has_table BOOLEAN DEFAULT false,
    has_image BOOLEAN DEFAULT false,
    has_equation BOOLEAN DEFAULT false,
    has_diagram BOOLEAN DEFAULT false,
    
    -- Classification
    subject VARCHAR(100),
    topic VARCHAR(200),
    subtopic VARCHAR(200),
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    question_type VARCHAR(50),
    marks INTEGER,
    estimated_time INTEGER,
    cognitive_level VARCHAR(50),
    
    -- Source
    source_file VARCHAR(500),
    source_year INTEGER,
    source_board VARCHAR(100),
    source_position INTEGER,
    
    -- Language
    language VARCHAR(20) DEFAULT 'English',
    primary_language VARCHAR(20),
    secondary_language VARCHAR(20),
    fonts_used JSONB,
    
    -- Formatting & Styling
    formatting JSONB,
    
    -- Tags & Classification
    tags TEXT[],
    keywords TEXT[],
    related_questions UUID[],
    
    -- Analytics
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    quality_score FLOAT,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    
    -- Version Control
    version INTEGER DEFAULT 1,
    parent_question_id UUID REFERENCES questions(id),
    is_latest BOOLEAN DEFAULT true,
    change_log JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Full-text search
    search_vector TSVECTOR
);

-- Tables associated with questions
CREATE TABLE question_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    
    row_count INTEGER,
    column_count INTEGER,
    has_header BOOLEAN DEFAULT false,
    has_merged_cells BOOLEAN DEFAULT false,
    
    -- Complete structure
    table_json JSONB NOT NULL,
    table_html TEXT,
    
    -- Styling
    border_style VARCHAR(50),
    border_color VARCHAR(20),
    border_width INTEGER,
    cell_padding INTEGER,
    alignment VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Images associated with questions
CREATE TABLE question_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    
    image_url TEXT NOT NULL,
    image_base64 TEXT,
    image_type VARCHAR(20),
    
    caption TEXT,
    alt_text TEXT,
    position VARCHAR(20),
    width INTEGER,
    height INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Equations in questions
CREATE TABLE question_equations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    
    equation_latex TEXT NOT NULL,
    equation_mathml TEXT,
    display_mode BOOLEAN DEFAULT false,
    position_index INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Paper templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    
    is_public BOOLEAN DEFAULT false,
    is_system_template BOOLEAN DEFAULT false,
    
    template_json JSONB NOT NULL,
    
    usage_count INTEGER DEFAULT 0,
    rating FLOAT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated papers
CREATE TABLE papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(500) NOT NULL,
    subject VARCHAR(100),
    class VARCHAR(50),
    exam_name VARCHAR(200),
    institution_name VARCHAR(300),
    
    total_marks INTEGER,
    duration INTEGER,
    
    sections JSONB NOT NULL,
    questions_order UUID[],
    
    template_id UUID REFERENCES templates(id),
    custom_styling JSONB,
    
    header_config JSONB,
    footer_config JSONB,
    
    -- Generated files
    docx_url TEXT,
    pdf_url TEXT,
    answer_key_url TEXT,
    solutions_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_downloaded TIMESTAMP
);

-- Paper question association
CREATE TABLE paper_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    
    section_id VARCHAR(50),
    position INTEGER,
    marks_allocated INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Collections (saved question sets)
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    
    question_ids UUID[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_user ON questions(user_id);
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);
CREATE INDEX idx_questions_search ON questions USING GIN(search_vector);
CREATE INDEX idx_questions_source_file ON questions(source_file);

CREATE INDEX idx_papers_user ON papers(user_id);
CREATE INDEX idx_papers_subject ON papers(subject);
CREATE INDEX idx_papers_created ON papers(created_at DESC);

CREATE INDEX idx_question_tables_question ON question_tables(question_id);
CREATE INDEX idx_question_images_question ON question_images(question_id);
CREATE INDEX idx_question_equations_question ON question_equations(question_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = 
        setweight(to_tsvector('english', COALESCE(NEW.question_text, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.topic, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.keywords, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questions_search_update
BEFORE INSERT OR UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER papers_updated_at
BEFORE UPDATE ON papers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. Success Metrics & KPIs

### 5.1 User Adoption Metrics
- Monthly Active Users (MAU)
- Questions imported per user
- Papers generated per user
- Feature adoption rate (% using auto-generation)

### 5.2 Product Performance Metrics
- AI extraction accuracy: >95% target
- Average time to create paper: <15 minutes
- Table preservation accuracy: >98%
- Equation rendering quality: >99%

### 5.3 User Satisfaction Metrics
- Net Promoter Score (NPS): Target >8/10
- Feature satisfaction ratings
- Time saved vs traditional method
- Error/complaint rate

---

## 6. Launch Checklist

### Pre-Launch
- [x] PRD Complete
- [ ] Database schema implemented
- [ ] AI extraction tested on 100+ documents
- [ ] Table handling verified
- [ ] 10 templates designed
- [ ] Export functions working
- [ ] UI/UX finalized
- [ ] Beta testing with 20-30 teachers
- [ ] Performance benchmarks met
- [ ] Security audit passed

### Launch
- [ ] Deploy to production
- [ ] Add to website
- [ ] User onboarding flow
- [ ] Video tutorial
- [ ] Documentation
- [ ] Support system ready

### Post-Launch
- [ ] Monitor usage daily
- [ ] Collect feedback
- [ ] Fix critical bugs within 24h
- [ ] Plan Phase 2 features

---

## Conclusion

Yeh **Question Paper Generator Tool** ek complete, production-ready specification hai jo:

✅ **100% Content Preservation** - Tables, equations, images sab perfectly
✅ **Multilingual** - Hindi, English, mixed content
✅ **AI-Powered** - Smart extraction and categorization
✅ **Flexible** - Manual, auto, template-based generation
✅ **Professional** - Multiple beautiful templates
✅ **Fast** - 10 minutes vs 3-4 hours traditional method

**ROI for Teachers:**
- 80% time saving
- Professional-quality papers
- Reusable question bank
- Less formatting headaches
- More time for teaching

**Technical Feasibility:** 100% achievable with current technology
**Market Differentiation:** No existing tool has this complete feature set
**Expected Impact:** Game-changer for education sector

---

**Ready for development! 🚀**
