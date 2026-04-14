export interface Question {
  id: string;
  record_id?: string;
  question_unique_id?: string;
  question_hin?: string;
  question_eng?: string;
  subject?: string;
  chapter?: string;
  option1_hin?: string;
  option1_eng?: string;
  option2_hin?: string;
  option2_eng?: string;
  option3_hin?: string;
  option3_eng?: string;
  option4_hin?: string;
  option4_eng?: string;
  option5_hin?: string;
  option5_eng?: string;
  answer?: string;
  solution_hin?: string;
  solution_eng?: string;
  type?: string;
  video?: string;
  page_no?: string;
  collection?: string;
  text: string;
  options: string[];
  correctOption: string;
  status: 'Draft' | 'Published';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  image?: string;
  tags?: string[];
}

export interface Document {
  id: string;
  name: string;
  status: 'Completed' | 'Processed' | 'Error';
  totalQuestions: number;
  totalImages: number;
  uploadDate: string;
  questions: Question[];
}
