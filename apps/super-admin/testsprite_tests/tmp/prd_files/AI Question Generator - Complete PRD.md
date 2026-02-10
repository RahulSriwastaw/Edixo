# 🤖 AI Question Generator - Complete PRD
## Advanced Multi-Input Question Generation System

**Version:** 1.0  
**Date:** January 2026  
**Status:** Ready for Development

---

# 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Current System Overview](#2-current-system)
3. [Enhanced Features](#3-enhanced-features)
4. [Multi-Input Question Generation](#4-multi-input-generation)
5. [Auto-Detection & Classification](#5-auto-detection)
6. [Answer Generation System](#6-answer-generation)
7. [Book Generation & Storage](#7-book-generation)
8. [Technical Implementation](#8-technical-implementation)
9. [UI/UX Design](#9-ui-ux-design)
10. [AI Prompts for Development](#10-ai-prompts)

---

# 1. EXECUTIVE SUMMARY

## 1.1 Vision
Intelligence Lab ko ek powerful AI-powered question generation system se equip karna jo multiple input methods support kare aur automatically content ko analyze karke high-quality questions generate kare.

## 1.2 Key Enhancements

### Current System:
- ✅ Subject aur Topic input karke question generation
- ✅ Domain: Current Affairs
- ✅ Count: 5 questions
- ✅ Quality: Medium
- ✅ Syntax: Bilingual

### New Features (To Be Added):
- 🆕 **Multi-Input Support**: Text, Image, PDF, URL input
- 🆕 **Auto-Detection**: AI automatically detects subject, topic, difficulty
- 🆕 **Answer Generation**: Generate detailed answers for any question
- 🆕 **Book Generation**: Create complete books from topics
- 🆕 **Smart Storage**: Organize and store generated content
- 🆕 **Batch Processing**: Multiple files/inputs at once
- 🆕 **Context-Aware**: Understand document context

---

# 2. CURRENT SYSTEM

## 2.1 Existing Interface Analysis

```
Left Panel - Configuration:
├─ DOMAIN: Current Affairs (dropdown)
├─ COUNT: 5 (numeric input)
├─ QUALITY: Medium (dropdown)
└─ SYNTAX: Bilingual (dropdown)

Right Panel - Topic Explorer:
├─ Topic Cards (Grid layout)
├─ Search: "Type new topic name and press Enter..."
└─ ADD button (top right)

Bottom:
└─ INITIALIZE SYNTHESIS button
```

## 2.2 Current Workflow
```
Step 1: Select Domain (Current Affairs)
Step 2: Enter Count (5)
Step 3: Select Quality (Medium)
Step 4: Select Syntax (Bilingual)
Step 5: Choose/Create Topics
Step 6: Click "Initialize Synthesis"
Step 7: AI generates questions
```

---

# 3. ENHANCED FEATURES

## 3.1 Feature Matrix

| Feature | Current | Enhanced |
|---------|---------|----------|
| **Input Methods** | Text (Topic only) | Text, Image, PDF, URL, Audio |
| **Auto-Detection** | Manual selection | AI detects subject/topic |
| **Question Types** | MCQ only | MCQ, Subjective, True/False, Fill-in-blanks |
| **Answer Generation** | Not available | Full answer generation |
| **Book Generation** | Not available | Complete book creation |
| **Batch Processing** | Single topic | Multiple files/topics |
| **Context Understanding** | Topic-based | Document context analysis |
| **Storage** | Basic | Smart categorization |

---

# 4. MULTI-INPUT QUESTION GENERATION

## 4.1 Input Method 1: Text Input

### 4.1.1 Simple Text/Topic (Existing)
```
Input: "Photosynthesis"
AI Action:
- Detect Subject: Biology/Science
- Detect Topic: Photosynthesis
- Generate 5 questions
```

### 4.1.2 Paragraph/Long Text (New)
```
Input Box (Large textarea):
┌─────────────────────────────────────────┐
│ Paste Text / Paragraph / Article       │
├─────────────────────────────────────────┤
│ [Type or paste your content here...    │
│  Can be paragraph, article, notes, etc.]│
│                                         │
│ Example:                                │
│ "Photosynthesis is the process by which│
│  green plants use sunlight to synthesize│
│  foods from carbon dioxide and water.   │
│  It generally involves the green pigment│
│  chlorophyll and generates oxygen..."   │
│                                         │
└─────────────────────────────────────────┘

AI Processing:
1. Analyze text content
2. Extract key concepts
3. Identify subject & topics
4. Determine difficulty level
5. Generate contextual questions

Output:
- Subject: Science (Auto-detected)
- Topic: Photosynthesis (Auto-detected)
- Sub-topics: Chlorophyll, Oxygen, Carbon dioxide
- 5-10 questions based on content
```

### UI Design:
```
┌─────────────────────────────────────────┐
│ 📝 TEXT INPUT                           │
├─────────────────────────────────────────┤
│ Input Type: ○ Topic  ● Paragraph        │
│                                         │
│ [Large textarea with rich text editor] │
│ Character count: 0 / 5000               │
│                                         │
│ AI Auto-Detect:                         │
│ ☑ Subject                               │
│ ☑ Topics                                │
│ ☑ Difficulty                            │
│                                         │
│ [Analyze Content] [Generate Questions]  │
└─────────────────────────────────────────┘
```

---

## 4.2 Input Method 2: Image Upload

### 4.2.1 Feature Description
Upload images of:
- Textbook pages
- Notes (handwritten/printed)
- Diagrams/Charts
- Question papers
- Flashcards

### 4.2.2 AI Processing Pipeline
```
Step 1: Image Upload
Step 2: OCR (Optical Character Recognition)
Step 3: Text Extraction
Step 4: Content Analysis
Step 5: Subject/Topic Detection
Step 6: Question Generation
```

### UI Design:
```
┌─────────────────────────────────────────┐
│ 🖼️ IMAGE UPLOAD                         │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────┐      │
│   │                             │      │
│   │  📷 Drag & Drop Image       │      │
│   │     or Click to Browse      │      │
│   │                             │      │
│   │  Supported: JPG, PNG, PDF   │      │
│   │  Max size: 10MB             │      │
│   └─────────────────────────────┘      │
│                                         │
│ Multiple Upload: ☑ (up to 10 images)   │
│                                         │
│ Preview:                                │
│ ┌────┐ ┌────┐ ┌────┐                   │
│ │Img1│ │Img2│ │Img3│ [+ More]          │
│ └────┘ └────┘ └────┘                   │
│                                         │
│ OCR Language: [English ▼]              │
│                                         │
│ [Extract Text] [Generate Questions]     │
└─────────────────────────────────────────┘
```

### Processing Flow:
```
After Upload:
┌─────────────────────────────────────────┐
│ 📊 Processing Image...                  │
├─────────────────────────────────────────┤
│ ✓ Image uploaded (2.3 MB)               │
│ ⏳ Running OCR...                        │
│ ▓▓▓▓▓▓▓▓░░ 80%                         │
│                                         │
│ Extracted Text Preview:                 │
│ ┌─────────────────────────────────────┐ │
│ │ "Chapter 5: Photosynthesis          │ │
│ │  Plants use sunlight to make food..." │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Auto-Detected:                          │
│ Subject: Biology ✓                      │
│ Topic: Photosynthesis ✓                 │
│ Difficulty: Medium ✓                    │
│                                         │
│ [Edit Detection] [Continue]             │
└─────────────────────────────────────────┘
```

---

## 4.3 Input Method 3: PDF Upload

### 4.3.1 Feature Description
Upload PDF files:
- Textbooks
- Study materials
- Research papers
- Previous year papers
- Notes documents

### 4.3.2 Advanced PDF Processing
```
Capabilities:
- Multi-page PDF support
- Table extraction
- Image extraction from PDF
- Preserve formatting
- Chapter/section detection
- Page-wise question generation
```

### UI Design:
```
┌─────────────────────────────────────────┐
│ 📄 PDF UPLOAD                           │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────────────────────────────┐      │
│   │  📑 Drop PDF Here           │      │
│   │     or Browse               │      │
│   │  Max: 50MB, 100 pages       │      │
│   └─────────────────────────────┘      │
│                                         │
│ Uploaded: Mathematics_Class10.pdf       │
│ Size: 12.5 MB | Pages: 45              │
│                                         │
│ Processing Options:                     │
│ ○ Entire Document                       │
│ ○ Specific Pages: [1-10, 25-30]        │
│ ○ Specific Chapter: [Chapter 3 ▼]      │
│                                         │
│ Question Generation:                    │
│ Questions per page: [2] ──○             │
│ Total estimated: ~90 questions          │
│                                         │
│ [Process PDF] [Advanced Settings]       │
└─────────────────────────────────────────┘
```

### Processing Screen:
```
┌─────────────────────────────────────────┐
│ 📊 PDF Processing Status                │
├─────────────────────────────────────────┤
│ File: Mathematics_Class10.pdf           │
│                                         │
│ Progress:                               │
│ ▓▓▓▓▓▓▓▓▓▓ 100%                        │
│                                         │
│ ✓ PDF parsed (45 pages)                │
│ ✓ Text extracted (15,240 words)        │
│ ✓ Images extracted (23 diagrams)       │
│ ✓ Chapters detected (8 chapters)       │
│ ✓ Topics identified (34 topics)        │
│ ⏳ Generating questions... 45/90        │
│                                         │
│ Detected Subjects:                      │
│ • Mathematics (Primary)                 │
│ • Algebra (15 pages)                    │
│ • Geometry (12 pages)                   │
│ • Trigonometry (10 pages)               │
│ • Statistics (8 pages)                  │
│                                         │
│ [Cancel] [View Generated Questions]     │
└─────────────────────────────────────────┘
```

---

## 4.4 Input Method 4: URL/Web Content

### 4.4.1 Feature Description
Generate questions from:
- Wikipedia articles
- Educational websites
- Blog posts
- News articles
- Online tutorials

### UI Design:
```
┌─────────────────────────────────────────┐
│ 🌐 URL INPUT                            │
├─────────────────────────────────────────┤
│ Enter URL:                              │
│ [https://en.wikipedia.org/wiki/______]  │
│                                         │
│ ○ Single URL                            │
│ ○ Multiple URLs (paste list)           │
│                                         │
│ Options:                                │
│ ☑ Scrape full article                  │
│ ☑ Include images                       │
│ ☑ Follow internal links (depth: 1)     │
│                                         │
│ [Fetch Content] [Generate Questions]    │
└─────────────────────────────────────────┘
```

### Processing:
```
After URL Submission:
┌─────────────────────────────────────────┐
│ 🌐 Fetching Web Content...              │
├─────────────────────────────────────────┤
│ URL: wikipedia.org/wiki/Photosynthesis  │
│                                         │
│ ✓ Page loaded                           │
│ ✓ Content extracted (3,450 words)      │
│ ✓ 5 images found                        │
│ ✓ 3 tables extracted                    │
│                                         │
│ Article Summary:                        │
│ Title: Photosynthesis                   │
│ Sections: 8                             │
│ Reading time: ~15 minutes               │
│                                         │
│ Auto-Detected:                          │
│ Subject: Biology                        │
│ Topics: Photosynthesis, Chlorophyll,    │
│         Light Reactions, Calvin Cycle   │
│                                         │
│ Generate Questions:                     │
│ Per section: [3] questions              │
│ Total: ~24 questions                    │
│                                         │
│ [Edit Settings] [Generate]              │
└─────────────────────────────────────────┘
```

---

## 4.5 Input Method 5: Audio/Video (Future)

### 4.5.1 Feature Description
```
Upload:
- Lecture recordings
- YouTube video links
- Audio lessons
- Podcast episodes

Process:
1. Speech-to-Text conversion
2. Content analysis
3. Question generation
```

---

# 5. AUTO-DETECTION & CLASSIFICATION

## 5.1 AI Auto-Detection System

### 5.1.1 What AI Detects Automatically

```
Input: [Any content - Text/Image/PDF/URL]
        ↓
AI Analysis:
├─ Subject Detection
│  ├─ Primary: Mathematics
│  └─ Secondary: Geometry
│
├─ Topic Extraction
│  ├─ Main Topics: [Triangles, Angles, Theorems]
│  └─ Sub-Topics: [Pythagorean Theorem, Congruence]
│
├─ Difficulty Assessment
│  ├─ Easy: 30%
│  ├─ Medium: 50%
│  └─ Hard: 20%
│
├─ Content Type
│  ├─ Theoretical: 60%
│  └─ Practical: 40%
│
├─ Question Types Suitable
│  ├─ MCQ: 40%
│  ├─ Subjective: 35%
│  ├─ True/False: 15%
│  └─ Fill-in-blanks: 10%
│
└─ Language Detected
   └─ English (with some Hindi terms)
```

### 5.1.2 UI Display of Auto-Detection

```
┌─────────────────────────────────────────┐
│ 🤖 AI Analysis Results                  │
├─────────────────────────────────────────┤
│ Content analyzed successfully!          │
│                                         │
│ AUTO-DETECTED INFORMATION:              │
│                                         │
│ 📚 Subject:                             │
│ ┌─────────────────────────────────────┐ │
│ │ Mathematics (95% confidence) ✓      │ │
│ │ [Edit if incorrect]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📖 Topics Found: (3)                    │
│ ┌─────────────────────────────────────┐ │
│ │ • Triangles (Primary)               │ │
│ │ • Pythagorean Theorem               │ │
│ │ • Angles and Properties             │ │
│ │ [+ Add more topics]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🎯 Difficulty Distribution:             │
│ Easy   ▓▓▓░░░░░░░ 30%                  │
│ Medium ▓▓▓▓▓░░░░░ 50%                  │
│ Hard   ▓▓░░░░░░░░ 20%                  │
│                                         │
│ 🌐 Language: English + Hindi terms      │
│                                         │
│ 📊 Content Stats:                       │
│ Words: 1,245 | Concepts: 12             │
│ Estimated questions: 15-20              │
│                                         │
│ [Confirm & Generate] [Refine Settings]  │
└─────────────────────────────────────────┘
```

### 5.1.3 Manual Override Option

```
If AI detection is wrong, user can edit:

┌─────────────────────────────────────────┐
│ ✏️ Edit Auto-Detection                  │
├─────────────────────────────────────────┤
│ Subject:                                │
│ [Mathematics ▼] ← Change if needed      │
│                                         │
│ Primary Topic:                          │
│ [Triangles ▼]                           │
│                                         │
│ Additional Topics:                      │
│ [+ Pythagorean Theorem] [×]             │
│ [+ Angles] [×]                          │
│ [+ Add more...]                         │
│                                         │
│ Difficulty Override:                    │
│ ○ Use AI suggestion (Mixed)             │
│ ○ All Easy                              │
│ ○ All Medium                            │
│ ○ All Hard                              │
│ ○ Custom distribution                   │
│                                         │
│ [Cancel] [Save & Continue]              │
└─────────────────────────────────────────┘
```

---

## 5.2 Smart Classification System

### 5.2.1 Automatic Organization

```
After Generation, questions auto-stored in:

Database Structure:
└─ Subjects/
   ├─ Mathematics/
   │  ├─ Algebra/
   │  │  ├─ Linear Equations/
   │  │  │  └─ [Questions 1-50]
   │  │  └─ Quadratic Equations/
   │  │     └─ [Questions 51-80]
   │  └─ Geometry/
   │     └─ Triangles/
   │        └─ [Questions 81-120]
   └─ Science/
      └─ Biology/
         └─ Photosynthesis/
            └─ [Questions 1-30]
```

### 5.2.2 Tagging System

```
Each question auto-tagged with:

Question #145:
├─ Subject: Mathematics
├─ Topic: Geometry
├─ Sub-topic: Triangles
├─ Difficulty: Medium
├─ Type: MCQ
├─ Source: PDF Upload
├─ Source File: "Geometry_Class10.pdf"
├─ Page Number: 25
├─ Generated From: "Pythagorean theorem section"
├─ Language: Bilingual
├─ Quality Score: 4.5/5 (AI assessed)
├─ Keywords: [triangle, right-angle, hypotenuse]
└─ Related Concepts: [Pythagoras, squares, sides]
```

---

# 6. ANSWER GENERATION SYSTEM

## 6.1 Generate Answers for Existing Questions

### 6.1.1 Feature Description
AI generates detailed answers for:
- User's own questions
- Imported questions (without answers)
- Practice questions
- Old question papers

### UI Design:
```
┌─────────────────────────────────────────┐
│ 💡 ANSWER GENERATOR                     │
├─────────────────────────────────────────┤
│ Input Question:                         │
│ ┌─────────────────────────────────────┐ │
│ │ What is the Pythagorean theorem?    │ │
│ │                                     │ │
│ │ Or paste multiple questions (one    │ │
│ │ per line or numbered)               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Answer Detail Level:                    │
│ ○ Brief (1-2 sentences)                │
│ ● Detailed (with explanation)          │
│ ○ Step-by-Step (for math/science)     │
│ ○ Comprehensive (with examples)        │
│                                         │
│ Include:                                │
│ ☑ Formula/Theorem statement            │
│ ☑ Explanation                          │
│ ☑ Example                              │
│ ☑ Common mistakes                      │
│ ☑ Related concepts                     │
│                                         │
│ Language: [Bilingual ▼]                │
│                                         │
│ [Generate Answer]                       │
└─────────────────────────────────────────┘
```

### Generated Answer Output:
```
┌─────────────────────────────────────────┐
│ ✅ Answer Generated                     │
├─────────────────────────────────────────┤
│ Question:                               │
│ What is the Pythagorean theorem?        │
│                                         │
│ ANSWER:                                 │
│ ┌─────────────────────────────────────┐ │
│ │ The Pythagorean theorem states that │ │
│ │ in a right-angled triangle, the     │ │
│ │ square of the hypotenuse (longest   │ │
│ │ side) equals the sum of squares of  │ │
│ │ the other two sides.                │ │
│ │                                     │ │
│ │ FORMULA:                            │ │
│ │ a² + b² = c²                        │ │
│ │ where c = hypotenuse                │ │
│ │       a, b = other two sides        │ │
│ │                                     │ │
│ │ EXAMPLE:                            │ │
│ │ If a = 3 and b = 4                  │ │
│ │ Then c² = 3² + 4² = 9 + 16 = 25     │ │
│ │ Therefore c = 5                     │ │
│ │                                     │ │
│ │ COMMON MISTAKE:                     │ │
│ │ Adding a + b instead of a² + b²     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Quality Score: ⭐⭐⭐⭐⭐ (5/5)           │
│                                         │
│ [Edit Answer] [Regenerate] [Save]       │
└─────────────────────────────────────────┘
```

---

## 6.2 Batch Answer Generation

### UI for Multiple Questions:
```
┌─────────────────────────────────────────┐
│ 📝 BATCH ANSWER GENERATION              │
├─────────────────────────────────────────┤
│ Upload questions list:                  │
│ ┌─────────────────────────────────────┐ │
│ │ 1. What is photosynthesis?          │ │
│ │ 2. Define Newton's first law        │ │
│ │ 3. What is the capital of France?   │ │
│ │ ... (up to 100 questions)           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Or upload file:                         │
│ [📄 Choose File] questions.txt          │
│                                         │
│ Format detected: Numbered list ✓        │
│ Questions found: 45                     │
│                                         │
│ Settings:                               │
│ Detail level: [Detailed ▼]             │
│ Language: [Bilingual ▼]                │
│                                         │
│ Estimated time: ~5 minutes              │
│                                         │
│ [Generate All Answers]                  │
└─────────────────────────────────────────┘
```

### Processing Screen:
```
┌─────────────────────────────────────────┐
│ ⚙️ Generating Answers...                │
├─────────────────────────────────────────┤
│ Progress: ▓▓▓▓▓▓▓░░░ 75% (34/45)       │
│                                         │
│ Currently processing:                   │
│ Q34: "Explain the process of..."        │
│                                         │
│ ✓ Completed: 34 answers                 │
│ ⏳ Remaining: 11 questions               │
│ ⚠️ Failed: 0                             │
│                                         │
│ Estimated time remaining: 1m 30s        │
│                                         │
│ [Pause] [Cancel]                        │
└─────────────────────────────────────────┘
```

---

# 7. BOOK GENERATION & STORAGE

## 7.1 AI Book Generator

### 7.1.1 Feature Description
Generate complete study books/guides on any topic with:
- Chapters
- Sections
- Examples
- Practice questions
- Diagrams (text descriptions)
- Summary points

### UI Design:
```
┌─────────────────────────────────────────┐
│ 📚 BOOK GENERATOR                       │
├─────────────────────────────────────────┤
│ Book Topic/Title:                       │
│ [Complete Guide to Algebra__________]   │
│                                         │
│ Target Audience:                        │
│ ○ Class 6-8 (Beginner)                 │
│ ● Class 9-10 (Intermediate)            │
│ ○ Class 11-12 (Advanced)               │
│ ○ Competitive Exams                    │
│                                         │
│ Subject: [Mathematics ▼]                │
│ Main Topics to Cover:                   │
│ ☑ Linear Equations                      │
│ ☑ Quadratic Equations                   │
│ ☑ Polynomials                           │
│ ☑ Factorization                         │
│ [+ Add more topics]                     │
│                                         │
│ Book Structure:                         │
│ Chapters: [8] ──○                       │
│ Sections per chapter: [4] ──○           │
│ Examples per section: [3] ──○           │
│ Practice Qs per chapter: [10] ──○       │
│                                         │
│ Include:                                │
│ ☑ Introduction to each chapter          │
│ ☑ Key concepts summary                  │
│ ☑ Worked examples                       │
│ ☑ Practice exercises                    │
│ ☑ Chapter-end questions                 │
│ ☑ Answer key                            │
│ ☑ Tips and tricks                       │
│                                         │
│ Language: [Bilingual ▼]                │
│ Book Length: ~120 pages (estimated)     │
│                                         │
│ [Preview Structure] [Generate Book]     │
└─────────────────────────────────────────┘
```

### Generated Book Structure Preview:
```
┌─────────────────────────────────────────┐
│ 📖 Book Structure Preview               │
├─────────────────────────────────────────┤
│ Title: Complete Guide to Algebra        │
│ Target: Class 9-10                      │
│                                         │
│ TABLE OF CONTENTS:                      │
│                                         │
│ Chapter 1: Introduction to Algebra      │
│ ├─ 1.1 What is Algebra?                 │
│ ├─ 1.2 Variables and Constants          │
│ ├─ 1.3 Algebraic Expressions            │
│ ├─ 1.4 Practice Exercises (10 Q)        │
│ └─ Summary & Key Points                 │
│                                         │
│ Chapter 2: Linear Equations             │
│ ├─ 2.1 Understanding Linear Equations   │
│ ├─ 2.2 Solving Simple Equations         │
│ ├─ 2.3 Word Problems                    │
│ ├─ 2.4 Practice Exercises (10 Q)        │
│ └─ Summary & Key Points                 │
│                                         │
│ ... (6 more chapters)                   │
│                                         │
│ Appendix: Answer Keys                   │
│ Index                                   │
│                                         │
│ Total Pages: ~120                       │
│ Est. Generation Time: 15-20 minutes     │
│                                         │
│ [Edit Structure] [Proceed to Generate]  │
└─────────────────────────────────────────┘
```

### Book Generation Process:
```
┌─────────────────────────────────────────┐
│ ⚙️ Generating Book...                   │
├─────────────────────────────────────────┤
│ "Complete Guide to Algebra"             │
│                                         │
│ Overall Progress: ▓▓▓░░░░░░░ 35%       │
│                                         │
│ Current Status:                         │
│ ✓ Cover page created                    │
│ ✓ Table of contents generated           │
│ ✓ Chapter 1: Introduction ✓             │
│ ✓ Chapter 2: Linear Equations ✓         │
│ ⏳ Chapter 3: Quadratic Equations...     │
│   ├─ Section 3.1 done                   │
│   ├─ Section 3.2 done                   │
│   └─ Generating Section 3.3...          │
│                                         │
│ Completed: 45/120 pages                 │
│ Time elapsed: 8 minutes                 │
│ Est. remaining: 12 minutes              │
│                                         │
│ [Pause] [Cancel]                        │
└─────────────────────────────────────────┘
```

---

## 7.2 Book Storage & Management

### 7.2.1 My Books Library

```
┌─────────────────────────────────────────┐
│ 📚 MY GENERATED BOOKS (12 books)        │
├─────────────────────────────────────────┤
│ [All] [Mathematics] [Science] [English] │
│                                         │
│ Sort: [Recently Created ▼] [Search🔍]   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 📖 Complete Guide to Algebra      │   │
│ │ Subject: Mathematics              │   │
│ │ Pages: 120 | Chapters: 8          │   │
│ │ Created: Jan 15, 2026             │   │
│ │ Status: ✓ Complete                │   │
│ │ [View] [Download] [Edit] [Share]  │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 📖 Biology Class 10 - Full Guide  │   │
│ │ Subject: Science/Biology          │   │
│ │ Pages: 180 | Chapters: 12         │   │
│ │ Created: Jan 14, 2026             │   │
│ │ Status: ✓ Complete                │   │
│ │ [View] [Download] [Edit] [Share]  │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 📖 English Grammar Basics         │   │
│ │ Subject: English                  │   │
│ │ Pages: 95 | Chapters: 6           │   │
│ │ Created: Jan 12, 2026             │   │
│ │ Status: 🔄 Generating (85%)       │   │
│ │ [View Progress] [Pause]           │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ... more books                          │
│                                         │
│ [+ Generate New Book]                   │
└─────────────────────────────────────────┘
```

### 7.2.2 Book Viewer

```
┌─────────────────────────────────────────┐
│ 📖 Complete Guide to Algebra            │
├─────────────────────────────────────────┤
│ [📑 Contents] [🔍 Search] [⬇️ Download]  │
│                                         │
│ ← Chapter 2: Linear Equations         →│
│                                         │
│ ╔═══════════════════════════════════╗   │
│ ║ 2.1 Understanding Linear Equations║   │
│ ║                                   ║   │
│ ║ A linear equation is an equation  ║   │
│ ║ in which the highest power of the ║   │
│ ║ variable is 1.                    ║   │
│ ║                                   ║   │
│ ║ General Form: ax + b = 0          ║   │
│ ║ where a ≠ 0                       ║   │
│ ║                                   ║   │
│ ║ Example 1:                        ║   │
│ ║ 2x + 5 = 15                       ║   │
│ ║                                   ║   │
│ ║ Solution:                         ║   │
│ ║ Step 1: Subtract 5 from both sides║   │
│ ║ 2x = 10                           ║   │
│ ║ Step 2: Divide by 2               ║   │
│ ║ x = 5                             ║   │
│ ║                                   ║   │
│ ║ ... more content ...              ║   │
│ ╚═══════════════════════════════════╝   │
│                                         │
│ Page 15 of 120                          │
│ [Previous Page] [Next Page]             │
│                                         │
│ Actions:                                │
│ [📝 Add Note] [🔖 Bookmark] [📤 Share]  │
└─────────────────────────────────────────┘
```

### 7.2.3 Export Options

```
Download Book in Multiple Formats:
┌─────────────────────────────────────────┐
│ 📥 Export Book                          │
├─────────────────────────────────────────┤
│ Format:                                 │
│ ○ PDF (Printable)                       │
│ ○ DOCX (Editable)                       │
│ ○ EPUB (E-Reader)                       │
│ ○ HTML (Web)                            │
│ ○ Markdown (Plain text)                 │
│                                         │
│ Include:                                │
│ ☑ Table of Contents                     │
│ ☑ Page numbers                          │
│ ☑ Answer keys                           │
│ ☑ Notes (if any)                        │
│                                         │
│ Language Version:                       │
│ ○ English only                          │
│ ○ Hindi only                            │
│ ● Bilingual (default)                   │
│                                         │
│ [Download]                              │
└─────────────────────────────────────────┘
```

---

# 8. TECHNICAL IMPLEMENTATION

## 8.1 System Architecture

### 8.1.1 High-Level Architecture

```
┌─────────────────────────────────────────┐
│         FRONTEND (React + TS)           │
├─────────────────────────────────────────┤
│ • Multi-input upload interface          │
│ • Real-time processing status           │
│ • Question preview/edit                 │
│ • Book viewer                           │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│         API GATEWAY (Node.js)           │
├─────────────────────────────────────────┤
│ • Authentication                        │
│ • Rate limiting                         │
│ • Request routing                       │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
┌───────────────┐  ┌──────────────────┐
│ AI SERVICES   │  │ STORAGE SERVICE  │
├───────────────┤  ├──────────────────┤
│ • OpenAI/     │  │ • PostgreSQL     │
│   Claude API  │  │ • MongoDB        │
│ • OCR Service │  │ • S3/Cloud       │
│ • NLP Engine  │  │   Storage        │
└───────────────┘  └──────────────────┘
```

### 8.1.2 Data Flow

```
User Upload (Image/PDF/Text)
        ↓
Frontend Validation
        ↓
Upload to Server
        ↓
File Processing Service
├─ PDF → Text Extraction
├─ Image → OCR
├─ URL → Web Scraping
└─ Text → Direct Processing
        ↓
AI Analysis Service
├─ Subject Detection
├─ Topic Extraction
├─ Difficulty Assessment
└─ Content Classification
        ↓
Question Generation Service
├─ Generate Questions
├─ Generate Answers
└─ Quality Check
        ↓
Database Storage
├─ Save Questions
├─ Save Metadata
└─ Index for Search
        ↓
Return to Frontend
```

---

## 8.2 Database Schema

### 8.2.1 Questions Table

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_text_hi TEXT,  -- Hindi translation
  answer TEXT,
  answer_hi TEXT,
  explanation TEXT,
  explanation_hi TEXT,
  
  -- Classification
  subject VARCHAR(100),
  topic VARCHAR(200),
  subtopic VARCHAR(200),
  difficulty VARCHAR(20),  -- Easy, Medium, Hard
  question_type VARCHAR(50), -- MCQ, Subjective, etc.
  
  -- Source Information
  source_type VARCHAR(50),  -- 'ai_generated', 'pdf_upload', 'image', 'url', etc.
  source_file VARCHAR(500),
  source_page INT,
  source_url TEXT,
  
  -- AI Metadata
  ai_model VARCHAR(100),
  ai_confidence FLOAT,
  quality_score FLOAT,
  
  -- Organization
  tags TEXT[],
  keywords TEXT[],
  related_concepts TEXT[],
  
  -- MCQ Specific
  options JSONB,  -- {A: {en, hi}, B: {en, hi}, C: {en, hi}, D: {en, hi}}
  correct_option VARCHAR(1),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Stats
  usage_count INT DEFAULT 0,
  bookmark_count INT DEFAULT 0,
  
  -- Full-text search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_subject ON questions(subject);
CREATE INDEX idx_topic ON questions(topic);
CREATE INDEX idx_difficulty ON questions(difficulty);
CREATE INDEX idx_source_type ON questions(source_type);
CREATE INDEX idx_tags ON questions USING GIN(tags);
CREATE INDEX idx_search ON questions USING GIN(search_vector);
```

### 8.2.2 Books Table

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  
  -- Classification
  subject VARCHAR(100),
  target_audience VARCHAR(100),  -- Class 6-8, 9-10, etc.
  
  -- Structure
  total_chapters INT,
  total_pages INT,
  total_questions INT,
  
  -- Content
  table_of_contents JSONB,
  chapters JSONB[],  -- Array of chapter objects
  
  -- Metadata
  language VARCHAR(20),
  status VARCHAR(50),  -- 'generating', 'complete', 'draft'
  generation_progress INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- File Storage
  pdf_url TEXT,
  docx_url TEXT,
  epub_url TEXT
);
```

### 8.2.3 Upload History Table

```sql
CREATE TABLE upload_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  -- Upload Info
  upload_type VARCHAR(50),  -- 'pdf', 'image', 'text', 'url'
  file_name VARCHAR(500),
  file_size BIGINT,
  file_url TEXT,
  
  -- Processing Status
  status VARCHAR(50),  -- 'uploaded', 'processing', 'completed', 'failed'
  progress INT DEFAULT 0,
  
  -- Results
  questions_generated INT DEFAULT 0,
  extraction_time INT,  -- in seconds
  
  -- AI Analysis
  detected_subject VARCHAR(100),
  detected_topics TEXT[],
  confidence_score FLOAT,
  
  -- Timestamps
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  
  -- Error Handling
  error_message TEXT
);
```

---

## 8.3 AI Integration

### 8.3.1 AI Service Configuration

```typescript
// AI Service Interface
interface AIService {
  // Question Generation
  generateQuestions(params: {
    content: string;
    count: number;
    difficulty?: string;
    questionType?: string;
    language?: string;
  }): Promise<Question[]>;
  
  // Answer Generation
  generateAnswer(params: {
    question: string;
    detailLevel: 'brief' | 'detailed' | 'comprehensive';
    language?: string;
  }): Promise<Answer>;
  
  // Content Analysis
  analyzeContent(content: string): Promise<{
    subject: string;
    topics: string[];
    difficulty: string;
    confidence: number;
  }>;
  
  // Book Generation
  generateBook(params: {
    title: string;
    topics: string[];
    chapters: number;
    targetAudience: string;
  }): Promise<Book>;
  
  // OCR
  extractTextFromImage(imageUrl: string): Promise<string>;
  
  // PDF Processing
  extractTextFromPDF(pdfUrl: string): Promise<{
    text: string;
    pages: number;
    metadata: any;
  }>;
}
```

### 8.3.2 AI Prompts

```typescript
// Question Generation Prompt
const QUESTION_GENERATION_PROMPT = `
You are an expert educational content creator. Generate high-quality questions based on the following content.

Content: {content}

Requirements:
- Generate {count} questions
- Difficulty level: {difficulty}
- Question type: {questionType}
- Language: {language}
- Include detailed explanations
- For MCQ, provide 4 options with one correct answer

Output Format (JSON):
{
  "questions": [
    {
      "questionText": "...",
      "questionText_hi": "..." (if bilingual),
      "type": "MCQ",
      "options": {
        "A": {"en": "...", "hi": "..."},
        "B": {"en": "...", "hi": "..."},
        "C": {"en": "...", "hi": "..."},
        "D": {"en": "...", "hi": "..."}
      },
      "correctAnswer": "B",
      "explanation": "...",
      "explanation_hi": "..." (if bilingual),
      "difficulty": "Medium",
      "topic": "..."
    }
  ]
}
`;

// Content Analysis Prompt
const CONTENT_ANALYSIS_PROMPT = `
Analyze the following educational content and provide structured information.

Content: {content}

Provide:
1. Primary subject (Mathematics, Science, English, etc.)
2. Main topics (list of 3-5 topics)
3. Sub-topics
4. Difficulty level (Easy, Medium, Hard)
5. Key concepts
6. Suitable question types
7. Confidence score (0-1)

Output Format (JSON):
{
  "subject": "Mathematics",
  "topics": ["Algebra", "Linear Equations"],
  "subtopics": ["Solving equations", "Word problems"],
  "difficulty": "Medium",
  "keyConcepts": ["variables", "equations", "solving"],
  "suitableQuestionTypes": ["MCQ", "Subjective"],
  "confidence": 0.95
}
`;

// Answer Generation Prompt
const ANSWER_GENERATION_PROMPT = `
Generate a detailed answer for the following question.

Question: {question}
Detail Level: {detailLevel}
Language: {language}

For detail level "comprehensive", include:
- Direct answer
- Detailed explanation
- Step-by-step solution (if applicable)
- Example
- Common mistakes to avoid
- Related concepts

Output Format (JSON):
{
  "answer": "...",
  "answer_hi": "..." (if bilingual),
  "explanation": "...",
  "steps": ["Step 1: ...", "Step 2: ..."],
  "example": "...",
  "commonMistakes": ["..."],
  "relatedConcepts": ["..."]
}
`;
```

---

## 8.4 API Endpoints

### 8.4.1 Question Generation APIs

```typescript
// Generate questions from text
POST /api/v1/questions/generate/text
{
  text: string;
  count: number;
  difficulty?: string;
  questionType?: string;
  language?: string;
}
Response: { questions: Question[], analysisResult: AnalysisResult }

// Generate questions from image
POST /api/v1/questions/generate/image
FormData: { image: File, count: number, ... }
Response: { questions: Question[], extractedText: string }

// Generate questions from PDF
POST /api/v1/questions/generate/pdf
FormData: { pdf: File, pages?: string, count: number }
Response: { questions: Question[], metadata: PDFMetadata }

// Generate questions from URL
POST /api/v1/questions/generate/url
{ url: string, count: number, ... }
Response: { questions: Question[], scrapedContent: string }

// Batch generation
POST /api/v1/questions/generate/batch
{ inputs: Input[], settings: GenerationSettings }
Response: { results: BatchResult[] }
```

### 8.4.2 Answer Generation APIs

```typescript
// Generate answer for single question
POST /api/v1/answers/generate
{
  question: string;
  detailLevel: 'brief' | 'detailed' | 'comprehensive';
  language?: string;
}
Response: { answer: Answer }

// Batch answer generation
POST /api/v1/answers/generate/batch
{
  questions: string[];
  detailLevel: string;
  language?: string;
}
Response: { answers: Answer[], progress: Progress }
```

### 8.4.3 Book Generation APIs

```typescript
// Generate book
POST /api/v1/books/generate
{
  title: string;
  subject: string;
  topics: string[];
  chapters: number;
  targetAudience: string;
  language: string;
}
Response: { bookId: string, estimatedTime: number }

// Check book generation status
GET /api/v1/books/:bookId/status
Response: { status: string, progress: number, pagesCompleted: number }

// Get book content
GET /api/v1/books/:bookId
Response: { book: Book }

// Download book
GET /api/v1/books/:bookId/download?format=pdf
Response: File download
```

### 8.4.4 Content Analysis APIs

```typescript
// Analyze content
POST /api/v1/analyze/content
{ content: string }
Response: { analysis: AnalysisResult }

// Auto-detect from file
POST /api/v1/analyze/file
FormData: { file: File }
Response: { analysis: AnalysisResult, extractedContent: string }
```

---

# 9. UI/UX DESIGN

## 9.1 Enhanced Intelligence Lab Interface

### 9.1.1 Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Q-BANK PRO                                    [ADMIN]      │
│  INTELLIGENCE LAB                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌─────────────────────────────────┐ │
│  │   GENERATION     │  │     INPUT METHODS               │ │
│  │   SETTINGS       │  │                                 │ │
│  ├──────────────────┤  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │ │
│  │                  │  │  │📝  │ │🖼️  │ │📄  │ │🌐  │  │ │
│  │ DOMAIN           │  │  │TEXT│ │IMG │ │PDF │ │URL │  │ │
│  │ [Current Affairs]│  │  └────┘ └────┘ └────┘ └────┘  │ │
│  │                  │  │                                 │ │
│  │ COUNT            │  │  [Selected: TEXT INPUT]         │ │
│  │ [5] ──○          │  │                                 │ │
│  │                  │  │  ┌─────────────────────────┐   │ │
│  │ QUALITY          │  │  │ Type or paste content   │   │ │
│  │ [Medium ▼]       │  │  │ here...                 │   │ │
│  │                  │  │  │                         │   │ │
│  │ SYNTAX           │  │  │ Can be topic, paragraph,│   │ │
│  │ [Bilingual ▼]    │  │  │ notes, article, etc.    │   │ │
│  │                  │  │  │                         │   │ │
│  │ ☑ Auto-Detect    │  │  └─────────────────────────┘   │ │
│  │   Subject/Topic  │  │                                 │ │
│  │                  │  │  Characters: 0 / 5000           │ │
│  │ ☑ Generate       │  │                                 │ │
│  │   Answers        │  │  [🤖 Analyze] [Generate]        │ │
│  │                  │  │                                 │ │
│  │ [INITIALIZE]     │  └─────────────────────────────────┘ │
│  │ [SYNTHESIS]      │                                     │ │
│  └──────────────────┘                                     │ │
│                                                           │ │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📊 RECENT GENERATIONS                               │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  • 5 questions from "Photosynthesis" - 2 min ago    │  │
│  │  • 10 questions from PDF "Class10.pdf" - 10 min ago │  │
│  │  • Book "Algebra Guide" - Completed                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 9.1.2 Tabbed Input Interface

```
┌─────────────────────────────────────────────────────────────┐
│  INPUT METHOD                                               │
├─────────────────────────────────────────────────────────────┤
│  [📝 Text] [🖼️ Image] [📄 PDF] [🌐 URL] [📚 Book Gen]       │
├─────────────────────────────────────────────────────────────┤
│  Currently Active: 📝 TEXT INPUT                            │
│                                                             │
│  Input Type:                                                │
│  ○ Simple Topic                                             │
│  ● Paragraph/Content                                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Paste your content here]                             │  │
│  │                                                       │  │
│  │ Example:                                              │  │
│  │ Photosynthesis is the process used by plants to      │  │
│  │ convert light energy into chemical energy...         │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  AI Analysis:                                               │
│  ☑ Auto-detect Subject                                      │
│  ☑ Auto-detect Topics                                       │
│  ☑ Auto-detect Difficulty                                   │
│  ☐ Manual Override                                          │
│                                                             │
│  [🤖 Analyze Content]  [Generate Questions]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 9.2 Mobile-Responsive Design

### 9.2.1 Mobile View

```
┌──────────────────────┐
│  Q-BANK PRO         │
│  Intelligence Lab   │
├──────────────────────┤
│                     │
│  ⊞ Generation       │
│     Settings        │
│                     │
│  ┌────────────────┐ │
│  │ Input Method   │ │
│  │ [📝▼]          │ │
│  └────────────────┘ │
│                     │
│  [Type or paste]   │
│  [content here...] │
│                     │
│  ☑ Auto-detect     │
│                     │
│  [🤖 Generate]      │
│                     │
│  Recent:           │
│  • 5Q from Photo.. │
│  • 10Q from PDF... │
│                     │
└──────────────────────┘
```

---

# 10. AI PROMPTS FOR DEVELOPMENT

## 10.1 Frontend Development Prompts

### Prompt 1: Multi-Input Upload Component

```
Create a React TypeScript component for multi-input question generation:

Requirements:
1. Tabbed interface with 5 tabs: Text, Image, PDF, URL, Book
2. Each tab has specific input fields
3. Drag-and-drop support for files
4. Real-time file validation
5. Progress indicators for uploads
6. Preview of uploaded content
7. Integration with backend APIs

Components to create:
- MultiInputUpload.tsx (main container)
- TextInput.tsx
- ImageUpload.tsx
- PDFUpload.tsx
- URLInput.tsx
- BookGenerator.tsx
- UploadProgress.tsx
- ContentPreview.tsx

State Management (Zustand):
interface UploadStore {
  activeTab: 'text' | 'image' | 'pdf' | 'url' | 'book';
  uploadProgress: number;
  uploadedFiles: File[];
  extractedContent: string;
  analysisResult: AnalysisResult | null;
  
  setActiveTab: (tab: string) => void;
  uploadFile: (file: File) => Promise<void>;
  analyzeContent: (content: string) => Promise<void>;
  generateQuestions: (params: any) => Promise<void>;
}

Styling: Use Tailwind CSS
Include proper TypeScript types
Add error handling for all file operations
```

### Prompt 2: Auto-Detection Display Component

```
Create a component to display AI auto-detection results:

Features:
- Show detected subject with confidence percentage
- Display list of topics
- Difficulty distribution visualization
- Edit/override options
- Clean, professional UI

Component: AutoDetectionResult.tsx

Props:
interface AutoDetectionProps {
  result: {
    subject: string;
    confidence: number;
    topics: string[];
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
    keywords: string[];
  };
  onEdit: (field: string, value: any) => void;
  onConfirm: () => void;
}

Include:
- Progress bars for difficulty distribution
- Editable dropdowns
- Confirmation button
- Professional styling
```

### Prompt 3: Book Generator Interface

```
Create a comprehensive book generation interface:

Features:
1. Multi-step form
2. Topic selection
3. Chapter configuration
4. Progress tracking
5. Preview generated content
6. Export options

Components:
- BookGeneratorWizard.tsx
- StepIndicator.tsx
- TopicSelector.tsx
- ChapterConfig.tsx
- GenerationProgress.tsx
- BookPreview.tsx
- ExportOptions.tsx

Include:
- Step-by-step navigation
- Form validation
- Real-time preview
- Download functionality
```

---

## 10.2 Backend Development Prompts

### Prompt 1: PDF Processing Service

```
Create a Node.js/Python service for PDF processing:

Requirements:
1. Extract text from PDF
2. Detect chapters/sections
3. Extract images
4. Preserve formatting
5. Handle multi-page PDFs
6. Error handling for corrupted PDFs

Technologies:
- pdf-parse (Node.js) or PyPDF2 (Python)
- Tesseract for OCR (if needed)

API Endpoint:
POST /api/pdf/process

Input: FormData with PDF file
Output: {
  text: string,
  pages: number,
  chapters: Chapter[],
  images: Image[],
  metadata: Metadata
}

Include:
- File size validation (max 50MB)
- Progress tracking
- Async processing for large files
- Caching mechanism
```

### Prompt 2: AI Question Generation Service

```
Create an AI service that integrates with OpenAI/Claude:

Requirements:
1. Generate questions from content
2. Auto-detect subject/topics
3. Generate answers
4. Support multiple question types
5. Bilingual support (English + Hindi)
6. Quality scoring

Service: AIQuestionService.ts

Methods:
- analyzeContent(content: string): Promise<Analysis>
- generateQuestions(params: GenParams): Promise<Question[]>
- generateAnswer(question: string): Promise<Answer>
- translateContent(text: string, to: string): Promise<string>

Include:
- Prompt engineering for best results
- Rate limiting
- Error handling
- Caching for repeated requests
- Cost optimization
```

### Prompt 3: Book Generation Pipeline

```
Create a service for generating complete books:

Features:
1. Chapter-by-chapter generation
2. Progress tracking
3. Content coherence across chapters
4. Auto-save after each chapter
5. Export to multiple formats

Service: BookGenerationService.ts

Methods:
- createBook(params: BookParams): Promise<string> // returns bookId
- generateChapter(bookId: string, chapterNum: number): Promise<Chapter>
- checkProgress(bookId: string): Promise<Progress>
- exportBook(bookId: string, format: string): Promise<Buffer>

Background Processing:
- Use job queue (Bull/BullMQ)
- WebSocket updates for real-time progress
- Atomic operations for data consistency
```

---

## 10.3 Database Setup Prompts

```
Create database migrations and seed data:

1. Create tables for:
   - questions (with all metadata)
   - books (with chapters)
   - upload_history
   - user_preferences

2. Add indexes for:
   - Fast subject/topic filtering
   - Full-text search
   - Date-based queries

3. Seed data:
   - Sample questions
   - Subject categories
   - Topic hierarchies

Use PostgreSQL with Prisma ORM
Include TypeScript types
Add database backup strategy
```

---

# 11. TESTING STRATEGY

## 11.1 Unit Tests

```typescript
// Test AI Detection
describe('AI Content Analysis', () => {
  it('should correctly detect subject from content', async () => {
    const content = "Photosynthesis is the process...";
    const result = await aiService.analyzeContent(content);
    expect(result.subject).toBe('Biology');
    expect(result.confidence).toBeGreaterThan(0.9);
  });
  
  it('should extract topics from long text', async () => {
    // Test implementation
  });
});

// Test Question Generation
describe('Question Generation', () => {
  it('should generate specified number of questions', async () => {
    // Test implementation
  });
  
  it('should generate bilingual questions', async () => {
    // Test implementation
  });
});
```

## 11.2 Integration Tests

```typescript
// Test complete flow
describe('PDF to Questions Flow', () => {
  it('should process PDF and generate questions', async () => {
    const pdf = fs.readFileSync('test.pdf');
    const result = await uploadAndProcess(pdf);
    expect(