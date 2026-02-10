// Type stub for Question - making SmartBoard work standalone
export interface Question {
    id: string;
    question_eng: string;
    question_hin?: string;
    option1_eng: string;
    option1_hin?: string;
    option2_eng: string;
    option2_hin?: string;
    option3_eng: string;
    option3_hin?: string;
    option4_eng: string;
    option4_hin?: string;
    answer: string;
    solution_eng?: string;
    solution_hin?: string;
}
