
## 20.3 PDF GENERATION & TAGS

**Intelligent Tagging System:**
The PDF output (and preview) features an intelligent tagging system that dynamically displays metadata based on the question source and type.

**Tag Logic:**

1.  **Current Affairs:**
    *   **Trigger:** Question belongs to 'Current Affairs' subject/category.
    *   **Display:** `[Date]` (e.g., "18 Jan, 2026")
    *   **Style:** Red accent color.

2.  **AI Generated:**
    *   **Trigger:** Question is marked as AI-generated.
    *   **Display:** `[AI Icon] [Topic]` (e.g., "✨ ECONOMY")
    *   **Style:** Purple accent color with Sparkles icon.

3.  **Previous Year Questions (PYQ):**
    *   **Trigger:** Question has Exam, Year, and Shift data.
    *   **Display:** `[Exam Name] | [Date] | [Shift]` (e.g., "SSC CGL | 12 Dec 2024 | Shift 1")
    *   **Style:** Dark/Slate accent color.

4.  **General/Standard:**
    *   **Trigger:** None of the above.
    *   **Display:** Topic or relevant tag.
    *   **Style:** Gray/Neutral.

**Note:** The previous "Set Name" tag has been deprecated to reduce redundancy.
