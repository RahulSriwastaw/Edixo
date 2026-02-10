
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type QuestionType = 'MCQ' | 'TrueFalse' | 'ShortAnswer' | 'FillBlanks' | 'LongAnswer';

export interface Question {
  id: string;
  // Airtable specific fields
  question_unique_id: string;
  question_hin: string;
  question_eng: string;
  subject: string;
  chapter: string;
  option1_hin: string;
  option1_eng: string;
  option2_hin: string;
  option2_eng: string;
  option3_hin: string;
  option3_eng: string;
  option4_hin: string;
  option4_eng: string;
  option5_hin?: string;
  option5_eng?: string;
  answer: string; // The correct option index (e.g., 1, 2, 3, 4) for MCQs
  answer_text?: string; // For Short/Long answers
  solution_hin: string;
  solution_eng: string;

  // Internal fields
  type: QuestionType;
  difficulty: Difficulty;
  language: string;
  tags: string[];
  createdDate: string;
  sources?: Source[];
  topic?: string;
  flagged?: boolean;

  // Metadata for Airtable mapping
  collection?: string;
  previous_of?: string;
  video?: string;
  airtable_table_name?: string;
  exam?: string;
  section?: string;
  year?: string;
  date?: string;
  // Airtable status fields
  action?: string;
  current_status?: string;
  sync_code?: string;
  error_report?: string;
  error_description?: string;
  question_source?: string;
  usageCount?: number;

  // Phase 2: Enhanced Features
  has_table?: boolean;
  table_data?: TableStructure;
  has_image?: boolean;
  has_equation?: boolean;

  // Advanced Detection
  marks?: number;
  context?: string; // e.g., "based on diagram", "passage 1"
  cognitive_level?: 'Knowledge' | 'Understanding' | 'Application' | 'Analysis' | 'Evaluation' | 'Creation';
}

export interface Source {
  title: string;
  uri: string;
  credibility: 'High' | 'Medium' | 'Low';
}

export interface TableCell {
  row: number;
  col: number;
  text: string;
  isHeader?: boolean;
  rowSpan?: number;
  colSpan?: number;
  style?: {
    bold?: boolean;
    align?: 'left' | 'center' | 'right';
    background?: string;
  };
}

export interface TableStructure {
  rows: number;
  cols: number;
  title?: string;
  cells: TableCell[];
  style?: {
    bordered?: boolean;
    striped?: boolean;
  };
}

export interface QuestionSet {
  setId: string;
  name: string;
  description: string;
  password?: string;
  questionIds: string[];
  createdDate: string;
  settings: {
    timerEnabled: boolean;
    timePerQuestion: number;
    durationSeconds?: number; // Total exam duration
    showQuestionNumbers: boolean;
    randomize: boolean;
    showResults?: boolean;
    allowRetake?: boolean;
    annotations?: Record<number, any[]>;
    class_notes?: Record<number, string>;
    class_notes_url?: string;
    allowDownload?: boolean;
    backgroundImage?: string;
    toolSettings?: {
      eraser?: {
        mode: 'partial' | 'whole' | 'lasso';
        size: number;
        locked: boolean;
      };
      laser?: {
        mode: 'trail' | 'point';
        size: number;
        color: string;
        effect: 'standard' | 'white_burn';
        intensity: number;
        delay: number;
        locked: boolean;
        glow: boolean;
        highlight: boolean;
      };
    };
  };
  status?: 'draft' | 'public';
  category?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';
  publishedDate?: string;
  tags?: string[];
  subject?: string;
}

export interface ExamResult {
  id: string;
  setId: string;
  studentName?: string;
  score: number;
  totalQuestions: number;
  answers: Record<number, string>;
  timeTaken: number; // Seconds
  completedDate: string;
}

// --- Phase 3: Paper Builder Types ---

export interface PaperSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  marks?: number; // Total marks for section
}

export interface PaperConfiguration {
  title: string;
  subtitle?: string;
  course?: string;
  time?: string;
  marks?: number;
  instructions?: string[];
  sections: PaperSection[];
  templateId: 'classic' | 'modern' | 'minimal';
}

export interface GenerateParams {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  count: number;
  type: QuestionType;
  language: string;
  date?: string; // New field for daily updates
  context?: string;
  inputMode?: 'text' | 'image' | 'pdf' | 'url';
  files?: File[];
  outputFormat?: 'html' | 'plain'; // HTML formatted or plain text output
}

// --- Bulk Upload System Types ---

export interface QuestionMaster {
  question_id?: string;
  question_text: string;
  question_type: 'MCQ' | 'TrueFalse' | 'Numeric' | 'Descriptive';
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  answer_explanation?: string;
  subject_name?: string;
  topic_name?: string;
  sub_topic_name?: string;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  language_type: 'Hindi' | 'English' | 'Bilingual';
  exam_category?: string;
  created_by_user_id?: string;
  question_source: string;
  exam_year?: string;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BulkUploadBatch {
  batch_id?: string;
  uploaded_by_user_id?: string;
  upload_file_name: string;
  upload_file_type: string;
  total_rows_found: number;
  total_questions_saved: number;
  total_failed_rows: number;
  upload_status: 'Processing' | 'Completed' | 'Failed';
  created_at?: string;
}

export interface BulkUploadRow {
  row_id?: string;
  batch_id?: string;
  row_number: number;
  raw_question_text?: string;
  error_message?: string;
  error_type?: string;
  is_fixed: boolean;
  created_at?: string;
}

export interface PreviewRow extends Partial<QuestionMaster> {
  id: string; // Temporary frontend ID
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  originalData: any;
}
