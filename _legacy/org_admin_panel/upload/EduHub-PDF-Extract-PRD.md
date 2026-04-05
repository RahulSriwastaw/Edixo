**EDUHUB PLATFORM**

**PDF Question Extraction**

*Feature PRD --- Super Admin Q-Bank Module*

  ---------------------------- ------------------------------------------
  **Document ID**              EH-QBANK-PDF-PRD-001

  **Version**                  1.0

  **Date**                     March 2026

  **Status**                   Final --- Ready for Development

  **Classification**           Confidential --- Internal Use Only

  **Module**                   Super Admin Panel → Q-Bank → PDF Extract

  **Prepared For**             Full Stack Development Team
  ---------------------------- ------------------------------------------

**Table of Contents**

> **1.** Vision & Overview
>
> **2.** Feature Architecture --- Where It Lives
>
> **3.** Complete User Flow
>
> **4.** Feature 1 --- Document Library (Folder System)
>
> **5.** Feature 2 --- PDF Upload
>
> **6.** Feature 3 --- AI Processing Engine
>
> **7.** Feature 4 --- Document Detail & Question Review
>
> **8.** Feature 5 --- Question Edit (Manual + AI)
>
> **9.** Feature 6 --- Image Editor
>
> **10.** Feature 7 --- Bulk Tag
>
> **11.** Feature 8 --- Bulk AI Edit
>
> **12.** Feature 9 --- Copy to Q-Bank / MockTest
>
> **13.** Database Schema
>
> **14.** API Endpoints
>
> **15.** UI Design Specification
>
> **16.** Business Rules & Edge Cases
>
> **17.** Development Phases

**1. Vision & Overview**

**1.1 Kya Banana Hai?**

EduHub Super Admin Q-Bank mein ek nayi \"PDF Extract\" feature add karni
hai jisse Super Admin (ya Org Admin) kisi bhi question paper PDF ko
directly upload karke AI se automatically saari questions extract karwa
sake, review kare, edit kare aur directly Global Q-Bank ya kisi bhi
MockTest mein add kar sake.

**1.2 Core Philosophy**

  -----------------------------------------------------------------------
  **Problem Statement**

  Abhi: Super Admin ko manually har question type karna padta hai ya CSV
  banana padta hai

  Manual entry = bohot time + errors

  PDF se questions copy-paste karna = formatting kharab ho jata hai

  Hindi text + images + LaTeX = manually handle karna impossible

  Solution: PDF Upload karo → AI automatically extract kare → Review +
  Edit karo → Q-Bank mein add karo
  -----------------------------------------------------------------------

**1.3 Key Benefits**

  -----------------------------------------------------------------------
  **Benefit**                 **Impact**
  --------------------------- -------------------------------------------
  Time Saving                 1000 questions = 2-3 ghante manual entry →
                              5 minutes AI extraction

  Accuracy                    AI-powered extraction with validation ---
                              error detection built-in

  Hindi Support               Hindi + English bilingual extraction
                              natively supported

  Image Handling              Images automatically extracted, cropped,
                              uploaded to S3/CDN

  Bulk Operations             Bulk Tag + Bulk AI Edit --- ek saath 100+
                              questions process

  Integration                 Direct copy to Global Q-Bank Sets ya
                              MockBook MockTests
  -----------------------------------------------------------------------

**1.4 Who Uses This Feature**

  -----------------------------------------------------------------------
  **User**           **Access Level**       **Use Case**
  ------------------ ---------------------- -----------------------------
  Super Admin        Full access --- all    Global Q-Bank ke liye mass
                     orgs                   import karna

  Org Admin          Only own org           Apne coaching ka question
                                            paper import karna

  Teacher (future)   Own content only       Apni class ke liye questions
                                            banana
  -----------------------------------------------------------------------

**2. Feature Architecture --- Where It Lives**

**2.1 Navigation Path**

  -----------------------------------------------------------------------
  **Location in Super Admin Panel**

  Super Admin Panel → Q-Bank → \[New Tab\] PDF Extract

  Q-Bank Tabs (Updated):

  Questions \| Sets \| Marketplace \| AI Generate \| Usage Log \| 📄 PDF
  Extract ← NEW
  -----------------------------------------------------------------------

**2.2 Sub-Navigation in PDF Extract**

  -----------------------------------------------------------------------
  **Tab / Section**          **Purpose**
  -------------------------- --------------------------------------------
  Documents                  Uploaded PDF documents ki list (folder
                             system)

  Processing Queue           Currently processing PDFs ka live status
  -----------------------------------------------------------------------

**2.3 Org Context**

PDF Extract feature mein Org Switcher similarly work karega jaise
MockBook mein hai:

-   Super Admin → Global view → Kisi bhi org ke liye extract kar sakta
    hai

-   Org Admin → Sirf apni org ke documents dikhenge

-   Extracted questions → chosen org ke Q-Bank mein jaayenge

**2.4 Integration Points**

  ------------------------------------------------------------------------
  **From**              **To**                **Action**
  --------------------- --------------------- ----------------------------
  PDF Extract →         Global Q-Bank         \"Add to Q-Bank\" →
  Document Questions                          questions directly global
                                              pool mein

  PDF Extract →         Q-Bank Set            \"Add to Set\" → existing ya
  Document Questions                          new set mein

  PDF Extract →         MockBook MockTest     \"Copy to Test\" → directly
  Document Questions                          exam create/update

  PDF Extract →         Org Q-Bank            \"Add to Org Q-Bank\" →
  Document Questions                          specific org ke liye
  ------------------------------------------------------------------------

**3. Complete User Flow**

**3.1 End-to-End Flow Diagram**

> STEP 1: User opens Q-Bank → PDF Extract tab
>
> ↓
>
> STEP 2: Document Library page --- empty ya existing docs dikhte hain
>
> ↓
>
> STEP 3: \"Upload PDF\" button click karo
>
> ↓
>
> STEP 4: Upload modal: Document Name enter karo + PDF file select karo
>
> ↓
>
> STEP 5: File uploads to S3 (presigned URL via backend)
>
> ↓
>
> STEP 6: \"Process & Extract\" button → AI processing shuru
>
> ↓
>
> STEP 7: Processing modal with real-time updates:
>
> Phase 1: Analyzing document structure (10%)
>
> Phase 2: Extracting questions (40%)
>
> Phase 3: Validating questions (90%)
>
> Complete! (100%)
>
> ↓
>
> STEP 8: Document card appear hota hai --- \"Completed\" status
>
> ↓
>
> STEP 9: Document click karo → Document Detail page
>
> ↓
>
> STEP 10: Questions review karo (Edit/Delete per question)
>
> Bulk Tag karo (Manual ya AI Auto)
>
> Bulk AI Edit karo (parallel processing)
>
> ↓
>
> STEP 11: Questions ko Q-Bank / MockTest mein copy karo

**3.2 Status Flow --- Document**

  -------------------------------------------------------------------------
  **Status**       **Color**       **Meaning**
  ---------------- --------------- ----------------------------------------
  Uploading        Blue            PDF file S3 pe upload ho rahi hai

  Processing       Yellow/Orange   AI questions extract kar raha hai

  Completed        Green           Saari questions successfully extracted

  Failed           Red             Processing mein error aaya --- retry
                                   possible

  Partial          Orange          Kuch questions extract hue, kuch failed
  -------------------------------------------------------------------------

**4. Feature 1 --- Document Library (Folder System)**

**4.1 Page Layout**

Main \"Extract Questions\" page jo documents aur folders dikhata hai.

**Header Bar:**

  -----------------------------------------------------------------------
  **Element**           **Description**
  --------------------- -------------------------------------------------
  Page Title            \"PDF Extract\" (with info icon --- tooltip mein
                        short description)

  Org Context           \"Extract questions for \[Org Name\]\"
                        (sub-title)

  ← Back button         Navigate back (breadcrumb)

  🏠 Home button        Root folder pe jaana

  ↻ Refresh             Current folder reload karna

  \+ New Folder         Naya folder banana

  Upload PDF button     Primary action --- orange/brand color

  Search bar            \"Search documents\...\" --- real-time filter

  Grid/List toggle      Card view ya table view switch karna
  -----------------------------------------------------------------------

**Document Card (Grid View):**

  -----------------------------------------------------------------------
  **Field**          **Value / Description**
  ------------------ ----------------------------------------------------
  Icon               Folder: blue folder icon \| Document: gray document
                     icon

  Name               Document/Folder name (truncated with ellipsis)

  Status Badge       Completed (green) / Processing (yellow) / Failed
                     (red)

  Question Count     e.g., \"18 questions\" with document icon

  Uploader           Email ya name (truncated)

  Date               \"Mar 4, 2026, 07:36 AM\" format

  Right-click menu   Rename / Move / Delete / Download original PDF
  -----------------------------------------------------------------------

**Document List (List View):**

Same data table format mein --- columns: Name \| Status \| Questions \|
Images \| Org \| Uploaded \| Actions

**4.2 Folder System**

-   Unlimited nesting --- folders ke andar folders ban sakte hain

-   Folder ko click karo → andar ke documents dikhte hain

-   Breadcrumb navigation: Q-Bank \> PDF Extract \> Folder Name \>
    Sub-Folder

-   Folder rename: double-click ya right-click menu

-   Document drag-drop: ek folder se doosre mein move karna

**4.3 Empty State**

  -----------------------------------------------------------------------
  **Empty State Design**

  Icon: Large document illustration (gray)

  Title: \"No documents or folders\"

  Sub-text: \"This folder is empty. Upload a PDF or create a folder to
  get started.\"

  Buttons: \[+ New Folder\] \[Upload PDF\]
  -----------------------------------------------------------------------

**5. Feature 2 --- PDF Upload**

**5.1 Upload Modal**

\"Upload PDF\" click karne par yeh modal open hoga:

  ------------------------------------------------------------------------------
  **Field**        **Type**        **Required**   **Validation**
  ---------------- --------------- -------------- ------------------------------
  Document Name    Text input      Yes            Min 3 chars, max 100 chars

  PDF File         File drop zone  Yes            Only .pdf, max 50MB

  Target Folder    Auto-detected   Auto           Current folder path

  Target Org       Dropdown (if    Yes            Must have active org selected
                   Switcher                       
                   active)                        
  ------------------------------------------------------------------------------

**5.2 Upload States --- Drop Zone**

  -----------------------------------------------------------------------
  **State**       **Visual**         **Text**
  --------------- ------------------ ------------------------------------
  Default         Gray dashed        \"Drop PDF here or click to browse\"
                  border, upload     
                  icon               

  Drag Over       Blue dashed        \"Drop to upload\"
                  border,            
                  highlighted        

  File Selected   Green checkmark    Filename + file size shown

  Uploading       Green border,      Filename + \"Uploading file to
                  spinner            storage\...\" + progress

  Upload Done     Green border,      \"PDF Uploaded Successfully!\" +
                  checkmark          \"Ready to process\"

  Error           Red border, X icon Error message + \"Try Again\" link
  -----------------------------------------------------------------------

**5.3 Upload Flow (Technical)**

> Client → POST /api/v1/admin/qbank/pdf-extract/upload/presign
>
> Body: { filename, content_type, org_id, folder_id? }
>
> Response: { presigned_url, s3_key, document_id }
>
> ↓
>
> Client → PUT {presigned_url} (direct S3 upload --- no server
> bandwidth)
>
> Progress tracked client-side
>
> ↓
>
> Client → POST /api/v1/admin/qbank/pdf-extract/upload/confirm
>
> Body: { document_id, s3_key, document_name }
>
> Response: { document: { id, name, status: \"uploaded\" } }
>
> ↓
>
> \"Process & Extract\" button enable hota hai

**5.4 Process & Extract --- Trigger**

User \"Process & Extract\" click karta hai:

> POST /api/v1/admin/qbank/pdf-extract/:documentId/process
>
> Body: { extraction_mode: \"auto\" }
>
> Response: { job_id, status: \"queued\" }
>
> Processing modal automatically open ho jaata hai
>
> Real-time updates via Server-Sent Events (SSE) ya polling

**6. Feature 3 --- AI Processing Engine**

**6.1 Processing Modal UI**

  -----------------------------------------------------------------------
  **Element**           **Description**
  --------------------- -------------------------------------------------
  Title                 \"Processing PDF\" with spinning loader

  Document Name         Sub-title mein document name

  Current Phase         Phase name + percent (e.g., \"Phase 1:
                        Analyzing\... 10%\")

  Progress Bar          Orange color, animated --- 0 to 100%

  Timer                 \"0:12\" --- elapsed time

  Recent Updates log    Real-time activity feed (scrollable)

  Hide/Show raw log     Toggle detailed logs

  Expand icon (↕)       Modal full-screen mode

  Stop button (⬛)      Cancel processing --- red circular button

  Close (X)             Close modal --- processing continues in
                        background
  -----------------------------------------------------------------------

**6.2 Processing Phases**

  ---------------------------------------------------------------------------
  **Phase**      **Percent**   **Activities**                  **Duration
                                                               (approx)**
  -------------- ------------- ------------------------------- --------------
  Phase 1:       0--20%        Document structure detect       5-15 sec
  Analyzing                    karna, pages count, complexity  
                               assess                          

  Phase 2:       20--80%       Questions identify karna,       15-60 sec
  Extracting                   options extract, answers        
                               detect, images crop             

  Phase 3:       80--95%       Questions validate karna,       3-10 sec
  Validating                   duplicates check, format verify 

  Saving         95--100%      Database mein save karna,       2-5 sec
                               images S3 pe upload karna       

  Complete       100%          Toast notification + status     Instant
                               update                          
  ---------------------------------------------------------------------------

**6.3 Recent Updates Log Format**

> 07:36:42 🔍 Phase 1: Analyzing document structure\...
>
> 07:36:53 ⏳ Processing\... (..)
>
> 07:36:58 ⏳ Processing\... (\...)
>
> 07:37:00 ✅ Found 18 questions across 1 pages.
>
> Using: Auto (AI decides based on complexity)
>
> 07:37:00 📝 Phase 2: Extracting questions\...
>
> 07:37:00 📄 Processing batch 1\...
>
> 07:37:10 ⏳ Processing batch 1\... (10s elapsed)
>
> 07:37:20 ⏳ Processing batch 1\... (20s elapsed)
>
> 07:37:40 ✅ Batch 1/1 complete
>
> 2.173 credits · 17848 tokens · 3 images
>
> 07:37:40 ✨ Phase 3: Validating questions\...
>
> 07:37:40 ✅ Extraction complete! 18 questions extracted

**6.4 Extraction Mode --- \"Auto\"**

  -----------------------------------------------------------------------
  **Auto Mode (AI Decides)**

  AI document ki complexity dekh ke automatically decide karta hai:

  \- Simple text questions → Fast extraction mode

  \- Images present → Image-aware extraction mode

  \- Complex layout (2-column, tables) → Layout-aware mode

  \- Hindi + English mix → Bilingual extraction mode

  User ko manually select nahi karna --- AI handles it automatically
  -----------------------------------------------------------------------

**6.5 Batch Processing**

-   Max 20 questions per batch (parallel processing)

-   Multiple batches ek saath process ho sakte hain (concurrent jobs)

-   Credits usage: per-batch mein shown (tokens + images count)

-   Failed batch: automatic retry 2 times, phir \"Partial\" status

**6.6 Completion --- Toast Notification**

  -----------------------------------------------------------------------
  **Success Toast (Green)**

  ✅ Processing completed for \"\[Document Name\]\"! Generated 18
  questions.

  Auto-dismiss: 5 seconds

  Click → Navigate to Document Detail page
  -----------------------------------------------------------------------

**7. Feature 4 --- Document Detail & Question Review**

**7.1 Document Information Card**

  -----------------------------------------------------------------------
  **Field**             **Value / Description**
  --------------------- -------------------------------------------------
  Document ID           Unique hash (e.g., GogKqllq2ZR3pQXf0ayW) ---
                        copyable

  Document Name         User-set name (editable inline)

  Status                Badge: Completed / Processing / Failed

  Total Questions       Count with document icon

  Total Images          Image count (0 if no images)

  Uploaded Date         \"March 4, 2026 at 07:36 AM\" format

  Organization          Org slug or name

  PDF Link              \"View Original PDF\" link (opens in new tab from
                        S3/CDN)
  -----------------------------------------------------------------------

**7.2 Document Questions Section**

**Header Controls:**

  -----------------------------------------------------------------------
  **Control**           **Description**
  --------------------- -------------------------------------------------
  Title                 \"Document Questions\" + total count

  Search bar            Real-time search within extracted questions

  All Status filter     Dropdown: All Status / Draft / Published

  Grid/List toggle      Card view ya table row view

  🏷️ Bulk Tag button    Open Bulk Tag modal (described in Section 10)

  ✨ Bulk Edit button   Open Bulk AI Edit modal (described in Section 11)

  Select checkbox       Select all / Select specific questions

  Copy to Test          Selected questions ko test mein copy karna
  -----------------------------------------------------------------------

**Per-Question Card (List View):**

  -----------------------------------------------------------------------
  **Element**           **Description**
  --------------------- -------------------------------------------------
  Checkbox              Bulk selection ke liye

  Q Number badge        Blue circle: 1, 2, 3\... (extraction order)

  Status toggle         Sliding toggle: Draft (gray) / Published (green)

  Type badge            \"Single Choice\" / \"Multi Select\" /
                        \"Integer\" / \"True/False\"

  Page badge            \"Page 1\" --- source PDF page reference

  Topic badge           Topic tag (if tagged)

  Difficulty badge      Easy (green) / Medium (yellow) / Hard (red)

  Correct Answer        \"D\" badge (shows correct option letter)

  Question Text         Full question content (Hindi ya English based on
                        default)

  Image                 If question has image → thumbnail shown

  Options               A, B, C, D listed (options content)

  Edit button           Open edit modal (orange outline button)

  Delete button         Delete this question (red outline, confirm
                        required)
  -----------------------------------------------------------------------

**7.3 Page Actions Bar (Bottom)**

  -----------------------------------------------------------------------
  **Button**             **Action**
  ---------------------- ------------------------------------------------
  ← Back to Documents    Document library pe wapas jaana
  List                   

  View Original PDF      Original PDF new tab mein open karna

  Add to Q-Bank          Selected questions → Global Q-Bank mein add karo
  (selected)             

  Copy to Test           Selected questions → MockTest mein copy karo
  (selected)             
  -----------------------------------------------------------------------

**8. Feature 5 --- Question Edit (Manual + AI)**

**8.1 Edit Modal --- Header**

  -----------------------------------------------------------------------
  **Element**           **Description**
  --------------------- -------------------------------------------------
  Title                 \"Edit Q#3\" --- question number

  Status dot            Green dot = active question

  Status toggle         Toggle switch: Draft / Published (yellow badge)

  Subject dropdown      Subject assign karna (Q-Bank subjects list se)

  Difficulty dropdown   Easy / Medium / Hard select karna

  Type dropdown         MCQ Single / MCQ Multi / Integer / True-False

  Save Changes button   Initially greyed --- enable hota hai jab koi
                        change ho

  \"Make changes to     Orange text hint
  enable save\" hint    
  -----------------------------------------------------------------------

**8.2 Edit Modal --- Two Tabs**

**TAB 1: AI Edit (Default active tab)**

  -----------------------------------------------------------------------
  **Element**           **Description**
  --------------------- -------------------------------------------------
  AI icon + tab label   Purple/brand color --- \"AI Edit\"

  EDIT TARGET selector  3 options: \[Both\] \[❓ Question\] \[💡
                        Solution\]

  YOUR PROMPT textarea  Free-form instruction for AI (placeholder:
                        \"e.g., Fix LaTeX, simplify language, add
                        steps\...\")

  Apply AI Edit button  Purple gradient button --- send to AI

  QUICK PROMPTS section Preset chips (described below)
  -----------------------------------------------------------------------

**Quick Prompts Chips:**

  -----------------------------------------------------------------------
  **Chip**           **Action**
  ------------------ ----------------------------------------------------
  Fix LaTeX          LaTeX syntax correct karna

  Simplify           Language simplify karna

  Add steps          Step-by-step solution add karna

  Format nicely      HTML formatting improve karna

  Create variation   Same concept ka naya question banana

  Make harder        Difficulty increase karna

  Improve clarity    Question aur clear banana

  Fix errors         Grammatical + factual errors fix karna
  -----------------------------------------------------------------------

**TAB 2: Manual Edit**

  -----------------------------------------------------------------------
  **Element**              **Description**
  ------------------------ ----------------------------------------------
  Source PDF thumbnail     Original PDF page ka image --- reference ke
  (left panel)             liye

  Page badge               \"Page 1\" --- current page number

  Add Passage/Instruction  Dashed border button --- passage ya
  button                   instruction add karna

  QUESTION section         Current question text (editable rich text)

  Add Image button         Image add karna (dashed, optional)

  OPTIONS section          Options A, B, C, D ka editor + \"Correct\"
                           dropdown

  Previous / Next buttons  Question navigation

  Counter                  \"QUESTION 3 of 18\" --- current position
  -----------------------------------------------------------------------

**8.3 AI Edit Response Flow**

> User types prompt (or clicks quick prompt chip)
>
> ↓
>
> POST /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId/ai-edit
>
> Body: { target: \"both\"\|\"question\"\|\"solution\", prompt: string }
>
> Response: { job_id } (async)
>
> ↓
>
> Loading state --- button spinner + \"Applying AI edit\...\"
>
> ↓
>
> GET /api/v1/admin/qbank/pdf-extract/ai-edit/:jobId (poll)
>
> ↓
>
> On complete → updated question data returned
>
> ↓
>
> Editor fields update with new content (side-by-side diff shown)
>
> ↓
>
> User accepts → \"Save Changes\" click karta hai
>
> ↓
>
> PATCH /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId

**9. Feature 6 --- Image Editor**

**9.1 Trigger**

Jab question mein image ho aur user \"Edit\" kare ya directly image pe
click kare --- \"Edit Image\" modal open hota hai.

**9.2 Image Editor Modal**

  -----------------------------------------------------------------------
  **Element**           **Description**
  --------------------- -------------------------------------------------
  Title                 \"Edit Image\"

  Sub-text              \"Apply edits to your image. Enable crop mode or
                        remove watermarks as needed.\"

  Canvas area           Image display area with light gray background

  Dashed crop border    Draggable corners/edges --- crop area define
                        karna

  Crop Mode toggle      \"Crop Mode: ON/OFF\" --- orange button with crop
  button                icon

  Watermark checkbox    \"Remove grey watermark (for black & white
                        images)\" --- DOMPurify + image processing

  Save Changes button   Orange primary button

  Cancel button         White secondary button
  -----------------------------------------------------------------------

**9.3 Image Operations**

-   CROP: User drag kare crop rectangle → Save → server-side crop
    (Sharp.js)

-   WATERMARK REMOVE: CSS-filter ya background removal for light gray
    watermarks

-   AUTO-CROP: AI extraction ke waqt obvious white space automatically
    crop hota hai

-   REPLACE: User naya image upload kar sakta hai

**9.4 Image Upload Flow**

> User image editor mein crop karta hai → \"Save Changes\"
>
> ↓
>
> POST /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId/image
>
> Body: { crop_x, crop_y, crop_w, crop_h, remove_watermark }
>
> Server: Sharp.js se image process → S3 pe upload → CDN URL return
>
> ↓
>
> Question ka image_url update hota hai

**10. Feature 7 --- Bulk Tag**

**10.1 Trigger**

\"Bulk Tag\" button click karne par (Document Detail page pe) yeh modal
open hota hai. Title: \"Bulk Tag All Questions\" --- shows total count.

**10.2 Two Tabs**

**TAB 1: Manual Tag**

  -----------------------------------------------------------------------
  **Field**        **Type**      **Description**
  ---------------- ------------- ----------------------------------------
  Topic            Dropdown      Org ke defined topics mein se choose
                   (Optional)    karo

  Difficulty Level Dropdown      Easy (green) / Medium (yellow) / Hard
                   (Optional)    (red)

  Overwrite        Checkbox      Default: OFF --- existing values skip
  existing                       karo. ON = overwrite sab

  Note text        Info text     \"This will update all X questions.
                                 Questions with existing values will be
                                 skipped.\"

  Apply button     Purple button \"Apply to All Questions\"
  -----------------------------------------------------------------------

**TAB 2: AI Auto Tag**

  ------------------------------------------------------------------------
  **Field**        **Type**        **Description**
  ---------------- --------------- ---------------------------------------
  Test Level\*     Dropdown        Difficulty assessment ke liye baseline
                   (Required)      

  Available Topics Display +       Org settings se configured topics
                   selector        dikhte hain

  Overwrite        Checkbox        Existing values overwrite karna
  checkbox                         
  ------------------------------------------------------------------------

**Test Level Options (AI Auto Tag):**

  -------------------------------------------------------------------------
  **Option**             **Icon**   **Use Case**
  ---------------------- ---------- ---------------------------------------
  High School (Class     🎓         Basic level questions
  9-10)                             

  Senior Secondary       📚         Intermediate level
  (Class 11-12)                     

  JEE Mains Level        🎯         Engineering entrance

  JEE Advanced Level     🚀         Top engineering entrance

  NEET Level             🏥         Medical entrance

  Undergraduate Level    🎓         College level

  Competitive Exams      🏆         SSC, UPSC, Banking etc.
  -------------------------------------------------------------------------

**10.3 AI Auto Tag --- How It Works**

  -----------------------------------------------------------------------
  **AI Auto Tag Process**

  1\. AI analyzes each question content

  2\. Question ko org ke defined topics mein se best match dhoondta hai

  3\. Test Level ke basis pe difficulty assign karta hai
  (easy/medium/hard)

  4\. Agar koi topic match nahi → topic empty chhod deta hai

  5\. Questions processed in batches of 10 for faster completion

  6\. Estimated time: 6-10 seconds (18 questions)
  -----------------------------------------------------------------------

**10.4 API Endpoints**

> Manual Tag:
>
> POST /api/v1/admin/qbank/pdf-extract/:docId/bulk-tag
>
> Body: { topic_id?, difficulty?, overwrite: boolean }
>
> AI Auto Tag:
>
> POST /api/v1/admin/qbank/pdf-extract/:docId/bulk-tag-ai
>
> Body: { test_level, overwrite: boolean }
>
> Response: { job_id }
>
> Poll status:
>
> GET /api/v1/admin/qbank/pdf-extract/bulk-tag-ai/:jobId

**11. Feature 8 --- Bulk AI Edit**

**11.1 Modal Description**

\"Bulk AI Edit\" modal --- selected ya saari questions ek saath AI se
edit karna.

Title: \"Bulk AI Edit\" \| Sub-text: \"Apply an AI-powered edit
instruction to all X questions in parallel\"

**11.2 Preset Instruction Chips**

  -----------------------------------------------------------------------
  **Chip Text**                   **What AI Does**
  ------------------------------- ---------------------------------------
  Add a step-by-step solution to  Solution field mein detailed steps add
  each question                   karta hai

  Simplify the language of each   Complex words replace, simple language
  question for better clarity     

  Add Hindi translation after     Hindi text add karta hai (if only
  each question and option        English)

  Fix any grammatical errors in   Grammar aur spelling corrections
  the questions and options       

  Add context or hints to make    Helpful hints add karta hai
  each question clearer           

  Convert all numerical values to Imperial → SI unit conversion
  SI units                        
  -----------------------------------------------------------------------

Custom prompt bhi type kar sakte hain --- free text input field.

**11.3 How Bulk AI Edit Works**

  -----------------------------------------------------------------------
  **Processing Details**

  • AI processes all questions in parallel batches for faster completion

  • Your instruction is applied to each question individually using AI

  • Edits include question text, options, and solution based on your
  instruction

  • Questions are updated automatically after processing

  • Estimated time: 3-6 seconds (20 questions at a time)
  -----------------------------------------------------------------------

**11.4 Warning Box**

  -----------------------------------------------------------------------
  **⚠️ Warning (Yellow)**

  This will modify all X questions. Make sure your instruction is
  correct.

  This action uses AI credits and changes are applied immediately.

  Note: Undo functionality: Last 1 save state preserve hoti hai ---
  \"Undo Last Bulk Edit\" option available hai for 10 minutes.
  -----------------------------------------------------------------------

**11.5 API**

> POST /api/v1/admin/qbank/pdf-extract/:docId/bulk-ai-edit
>
> Body: {
>
> question_ids?: uuid\[\], // empty = all questions
>
> instruction: string,
>
> target: \"both\" \| \"question\" \| \"solution\"
>
> }
>
> Response: { job_id, estimated_time_seconds }
>
> GET /api/v1/admin/qbank/pdf-extract/bulk-ai-edit/:jobId
>
> Response: { status, progress, completed_count, total_count }

**12. Feature 9 --- Copy to Q-Bank / MockTest**

**12.1 Two Options**

  -----------------------------------------------------------------------
  **Option**             **Description**
  ---------------------- ------------------------------------------------
  Add to Global Q-Bank   Questions directly Global Q-Bank pool mein jaate
                         hain (org_id = null)

  Copy to MockTest       \"Copy Questions to Test\" modal open hota hai
  -----------------------------------------------------------------------

**12.2 Copy to Test Modal**

**Two Tabs:**

  -----------------------------------------------------------------------
  **Tab**            **Description**
  ------------------ ----------------------------------------------------
  Select Existing    Platform ke existing tests list mein se choose karo
  Test               

  \+ Create New Test Naya test create karo aur questions add karo
  -----------------------------------------------------------------------

**\"Create New Test\" Fields:**

  ----------------------------------------------------------------------------
  **Field**        **Type**     **Required**   **Description**
  ---------------- ------------ -------------- -------------------------------
  Add to Test      Dropdown     Optional       Existing test series mein add
  Series                                       karna

  Test Name        Text input   Yes            e.g., \"SSC GD Reasoning Test
                                               1\"

  Duration         Number input Yes            Default: 60 minutes
  (minutes)                                    

  Description      Textarea     Optional       Test description / notes
  ----------------------------------------------------------------------------

**Information Box:**

  -----------------------------------------------------------------------
  **Create & Copy Information**

  • A new test will be created with the specified name

  • All X selected questions will be copied to the new test

  • Question identifiers will be preserved from source
  -----------------------------------------------------------------------

**12.3 Copy Logic**

-   Questions \"copied\" hoti hain --- original document mein bhi rehti
    hain

-   Copy mein is_copy = true, original_id = source question ID

-   Bilingual content (Hindi + English) preserve hota hai copy mein

-   Images CDN URLs same rehte hain (shared reference)

-   Tags, difficulty, topic bhi copy hote hain

**12.4 API**

> Add to Global Q-Bank:
>
> POST /api/v1/admin/qbank/pdf-extract/:docId/add-to-qbank
>
> Body: { question_ids?: uuid\[\], set_id?: uuid }
>
> Copy to Test:
>
> POST /api/v1/admin/qbank/pdf-extract/:docId/copy-to-test
>
> Body: {
>
> question_ids?: uuid\[\],
>
> mode: \"existing\" \| \"new\",
>
> test_id?: uuid,
>
> test_name?: string,
>
> duration_mins?: number,
>
> description?: string,
>
> series_id?: uuid
>
> }

**13. Database Schema**

**13.1 extracted_documents**

> CREATE TABLE extracted_documents (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>
> org_id UUID REFERENCES organizations(id),
>
> created_by UUID REFERENCES users(id),
>
> folder_id UUID REFERENCES extract_folders(id),
>
> document_name VARCHAR(255) NOT NULL,
>
> s3_key TEXT NOT NULL, \-- S3 storage path
>
> cdn_url TEXT, \-- CloudFront URL
>
> file_size BIGINT, \-- in bytes
>
> page_count INTEGER,
>
> status VARCHAR(20) DEFAULT \"uploaded\"
>
> CHECK (status IN
> (\"uploaded\",\"processing\",\"completed\",\"failed\",\"partial\")),
>
> total_questions INTEGER DEFAULT 0,
>
> total_images INTEGER DEFAULT 0,
>
> credits_used DECIMAL(10,4) DEFAULT 0,
>
> tokens_used INTEGER DEFAULT 0,
>
> processing_log JSONB DEFAULT \"\[\]\", \-- Recent Updates array
>
> error_message TEXT,
>
> created_at TIMESTAMP DEFAULT NOW(),
>
> updated_at TIMESTAMP DEFAULT NOW()
>
> );

**13.2 extract_folders**

> CREATE TABLE extract_folders (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>
> org_id UUID REFERENCES organizations(id),
>
> parent_id UUID REFERENCES extract_folders(id), \-- NULL = root
>
> name VARCHAR(100) NOT NULL,
>
> created_by UUID REFERENCES users(id),
>
> created_at TIMESTAMP DEFAULT NOW()
>
> );

**13.3 extracted_questions**

> CREATE TABLE extracted_questions (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>
> document_id UUID REFERENCES extracted_documents(id) ON DELETE CASCADE,
>
> org_id UUID REFERENCES organizations(id),
>
> question_no INTEGER, \-- Extraction order
>
> source_page INTEGER, \-- PDF page number
>
> \-- Content (same bilingual format as global q-bank)
>
> question_hin TEXT NOT NULL,
>
> question_eng TEXT NOT NULL,
>
> option1_hin TEXT NOT NULL,
>
> option1_eng TEXT NOT NULL,
>
> option2_hin TEXT NOT NULL,
>
> option2_eng TEXT NOT NULL,
>
> option3_hin TEXT,
>
> option3_eng TEXT,
>
> option4_hin TEXT,
>
> option4_eng TEXT,
>
> option5_hin TEXT,
>
> option5_eng TEXT,
>
> answer VARCHAR(20) NOT NULL,
>
> solution_hin TEXT,
>
> solution_eng TEXT,
>
> \-- Metadata
>
> question_type VARCHAR(20) DEFAULT \"mcq\",
>
> difficulty VARCHAR(10),
>
> subject_id UUID REFERENCES subjects(id),
>
> topic_id UUID REFERENCES topics(id),
>
> status VARCHAR(20) DEFAULT \"draft\",
>
> \-- Linking
>
> qbank_question_id UUID REFERENCES questions(id), \-- After adding to
> Q-Bank
>
> is_copied BOOLEAN DEFAULT false,
>
> created_at TIMESTAMP DEFAULT NOW(),
>
> updated_at TIMESTAMP DEFAULT NOW()
>
> );

**13.4 extract_jobs**

> CREATE TABLE extract_jobs (
>
> id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>
> document_id UUID REFERENCES extracted_documents(id),
>
> job_type VARCHAR(30) NOT NULL,
>
> \-- extract \| bulk_tag_ai \| bulk_ai_edit \| copy_to_test
>
> status VARCHAR(20) DEFAULT \"queued\",
>
> progress INTEGER DEFAULT 0, \-- 0-100
>
> result_data JSONB,
>
> error_message TEXT,
>
> started_at TIMESTAMP,
>
> completed_at TIMESTAMP,
>
> created_at TIMESTAMP DEFAULT NOW()
>
> );

**14. API Endpoints**

**14.1 Documents CRUD**

  -------------------------------------------------------------------------------------------
  **Method**   **Endpoint**                                    **Description**
  ------------ ----------------------------------------------- ------------------------------
  GET          /api/v1/admin/qbank/pdf-extract/documents       List documents (with folder
                                                               filter)

  GET          /api/v1/admin/qbank/pdf-extract/documents/:id   Get document detail

  PATCH        /api/v1/admin/qbank/pdf-extract/documents/:id   Update document name

  DELETE       /api/v1/admin/qbank/pdf-extract/documents/:id   Delete document + all
                                                               questions

  GET          /api/v1/admin/qbank/pdf-extract/folders         List folders

  POST         /api/v1/admin/qbank/pdf-extract/folders         Create folder

  PATCH        /api/v1/admin/qbank/pdf-extract/folders/:id     Rename folder

  DELETE       /api/v1/admin/qbank/pdf-extract/folders/:id     Delete folder
  -------------------------------------------------------------------------------------------

**14.2 Upload & Processing**

  --------------------------------------------------------------------------------------------
  **Method**   **Endpoint**                                     **Description**
  ------------ ------------------------------------------------ ------------------------------
  POST         /api/v1/admin/qbank/pdf-extract/upload/presign   Get S3 presigned PUT URL

  POST         /api/v1/admin/qbank/pdf-extract/upload/confirm   Confirm upload complete

  POST         /api/v1/admin/qbank/pdf-extract/:docId/process   Start AI extraction job

  GET          /api/v1/admin/qbank/pdf-extract/jobs/:jobId      Poll job status

  DELETE       /api/v1/admin/qbank/pdf-extract/jobs/:jobId      Cancel processing job
  --------------------------------------------------------------------------------------------

**14.3 Questions Management**

  ---------------------------------------------------------------------------------------------------------
  **Method**   **Endpoint**                                                    **Description**
  ------------ --------------------------------------------------------------- ----------------------------
  GET          /api/v1/admin/qbank/pdf-extract/:docId/questions                List extracted questions

  GET          /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId           Get single question

  PATCH        /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId           Update question

  DELETE       /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId           Delete question

  POST         /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId/ai-edit   AI edit single question

  POST         /api/v1/admin/qbank/pdf-extract/:docId/questions/:qId/image     Process/replace image

  POST         /api/v1/admin/qbank/pdf-extract/:docId/bulk-tag                 Manual bulk tag

  POST         /api/v1/admin/qbank/pdf-extract/:docId/bulk-tag-ai              AI auto tag (async)

  POST         /api/v1/admin/qbank/pdf-extract/:docId/bulk-ai-edit             Bulk AI edit (async)

  POST         /api/v1/admin/qbank/pdf-extract/:docId/add-to-qbank             Copy to Global Q-Bank

  POST         /api/v1/admin/qbank/pdf-extract/:docId/copy-to-test             Copy to MockTest
  ---------------------------------------------------------------------------------------------------------

**15. UI Design Specification**

**15.1 Design System Alignment**

EduHub ka existing design system follow karna hai. GyaanKendra Super
Admin UI PRD ke tokens use karne hain:

  ------------------------------------------------------------------------
  **Token**          **Value**       **Use**
  ------------------ --------------- -------------------------------------
  bg.base            #080c12         Page background

  surface.1          #1a2235         Cards, panels

  accent.blue        #4f8eff         Primary buttons, links

  accent.orange      #ff6b4a         Upload button, warnings

  accent.teal        #00e5c0         Success states, Completed badge

  semantic.success   #22c55e         Completed status

  semantic.warning   #f97316         Processing status, warnings

  semantic.danger    #ef4444         Failed status, delete

  accent.purple      #7b5fff         AI features, Bulk AI Edit, AI Auto
                                     Tag

  text.primary       #e8edf7         Headings, values

  text.secondary     #9faec7         Body text
  ------------------------------------------------------------------------

**15.2 Key UI Differences from Competitor (PrepLab)**

  -----------------------------------------------------------------------
  **EduHub = Different Design, Same Features**

  PrepLab: White/light background, orange primary

  EduHub: Dark theme (#080c12), accent.blue primary, accent.purple for AI
  features

  PrepLab: Simple card grid with rounded corners

  EduHub: Surface.1 cards with border.1 borders, shadow.sm

  PrepLab: Orange \"Process & Extract\" button

  EduHub: accent.blue gradient \"Process & Extract\" button

  PrepLab: White modals

  EduHub: bg.elevated (#0e1420) modals with border.1 borders

  PrepLab: Status badges solid color

  EduHub: Pill badges with icon + semantic color dot
  -----------------------------------------------------------------------

**15.3 Typography**

  -------------------------------------------------------------------------
  **Element**        **Font**        **Size**     **Weight**
  ------------------ --------------- ------------ -------------------------
  Page Title         Syne            32px         800

  Section Title      Syne            22px         700

  Card Title         Syne            16px         600

  Body Text          Literata        14px         400

  Document IDs /     DM Mono         13px         500
  Counts                                          

  Status Badges      DM Mono         10px         500 + UPPERCASE
  -------------------------------------------------------------------------

**15.4 Component Specifications**

**Document Card:**

-   Size: \~180px width (grid), auto height

-   Background: surface.1

-   Border: 1px border.1

-   Border-radius: radius.lg (8px)

-   Hover: surface.2 background + shadow.md

-   Status badge: top-left position

**Processing Modal:**

-   Width: 480px (centered)

-   Background: bg.elevated (#0e1420)

-   Border: 1px border.1

-   Border-radius: radius.xl (12px)

-   Progress bar: accent.orange, height 4px, rounded

-   Log area: bg.subtle, max-height 200px, scrollable, DM Mono font

**16. Business Rules & Edge Cases**

**16.1 File Constraints**

  -----------------------------------------------------------------------
  **Rule**                   **Value**
  -------------------------- --------------------------------------------
  Max file size              50MB per PDF

  Allowed formats            PDF only (.pdf)

  Max pages per PDF          200 pages

  Max questions per document 500 questions

  Max documents per org      1000 (soft limit --- configurable)

  Max folders                Unlimited

  Max folder nesting         5 levels
  -----------------------------------------------------------------------

**16.2 AI Credits Usage**

  -----------------------------------------------------------------------
  **Operation**              **Credits (approx)**
  -------------------------- --------------------------------------------
  PDF Extraction (per        \~0.12 credits
  question)                  

  Bulk AI Edit (per          \~0.08 credits
  question)                  

  AI Auto Tag (per question) \~0.03 credits

  Single Question AI Edit    \~0.1 credits
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **Credit Deduction Rule**

  Org ke AI quota se credits deduct hote hain.

  Agar insufficient credits → 402 error + message: \"Insufficient AI
  credits. Contact Super Admin.\"

  Super Admin ke liye: Unlimited credits (platform-level).
  -----------------------------------------------------------------------

**16.3 Language Detection**

-   PDF mein Hindi text → question_hin fill, question_eng = same (user
    manually translate kar sakta hai)

-   PDF mein English text → question_eng fill, question_hin = same

-   Bilingual PDF → AI dono separate karke fill karta hai

-   User \"Add Hindi translation\" bulk edit use kar sakta hai for
    auto-translation

**16.4 Image Handling Rules**

-   Images AI extraction ke waqt auto-detect hote hain

-   Images S3 pe upload, CDN URL mein store hota hai

-   External image URLs allowed nahi --- sab CDN pe hone chahiye

-   Watermark removal: only light gray backgrounds pe kaam karta hai

-   Min image size: 50x50px (smaller = ignored)

-   Max image size: 10MB per image

**16.5 Concurrent Processing**

-   Ek org ke liye: max 3 documents simultaneously process ho sakte hain

-   Queue mein baaki documents wait karte hain

-   Background processing --- user page close kar sakta hai

-   Email notification (optional) jab processing complete ho

**16.6 Data Retention**

-   Extracted documents: Indefinitely retained (user delete kare tab
    tak)

-   Processing logs: 30 days

-   Original PDF S3 pe: 90 days (then archived to Glacier, user can
    request)

-   Copied questions: Q-Bank mein permanently hain

**17. Development Phases**

**Phase 1 --- Foundation (Week 1--2)**

**Backend:**

-   Database tables: extracted_documents, extract_folders,
    extracted_questions, extract_jobs

-   S3 upload: presigned URL generation + confirmation API

-   Basic folder CRUD APIs

-   Document CRUD APIs

**Frontend:**

-   PDF Extract tab add karna Q-Bank navbar mein

-   Document Library page (empty state + folder navigation)

-   Upload modal (file picker + document name)

-   Upload progress UI

Deliverable: PDF upload + storage working

**Phase 2 --- AI Extraction (Week 3--4)**

**Backend:**

-   AI extraction job queue (BullMQ)

-   OpenAI API integration for PDF parsing

-   Image extraction + S3 upload pipeline

-   SSE / polling endpoint for real-time updates

-   Bilingual question parsing logic

**Frontend:**

-   Processing modal with real-time updates

-   Document Detail page

-   Questions list with Edit/Delete

Deliverable: PDF → AI → Questions working end-to-end

**Phase 3 --- Edit & Tag Features (Week 5--6)**

**Backend:**

-   Single question AI edit API

-   Bulk Tag (Manual + AI Auto) APIs

-   Bulk AI Edit job queue

-   Image editor (Sharp.js crop + watermark removal)

**Frontend:**

-   Per-question edit modal (Manual + AI tabs)

-   Image editor modal

-   Bulk Tag modal

-   Bulk AI Edit modal

Deliverable: Full review + editing workflow

**Phase 4 --- Integration & Polish (Week 7--8)**

**Backend:**

-   \"Add to Q-Bank\" integration

-   \"Copy to Test\" integration with MockBook

-   Audit logging for all extract operations

-   Credits deduction integration

**Frontend:**

-   \"Copy to Test\" modal

-   \"Add to Q-Bank\" flow

-   Org Switcher integration

-   Loading states, error states, empty states polish

-   Mobile responsiveness check

Deliverable: Full feature production-ready

**Document End**

*EduHub Platform --- PDF Question Extraction PRD*

Version 1.0 \| March 2026 \| Confidential --- Internal Use Only
