import { create } from "zustand";

// Question type
interface Question {
  id: string;
  question_hin: string;
  question_eng: string;
  type: string;
  subject: string;
  chapter: string;
  difficulty: string;
  visibility: string;
  pointCost: number;
  usageCount: number;
  answer: string;
  option1_hin?: string;
  option1_eng?: string;
  option2_hin?: string;
  option2_eng?: string;
  option3_hin?: string;
  option3_eng?: string;
  option4_hin?: string;
  option4_eng?: string;
  solution_hin?: string;
  solution_eng?: string;
}

// Creator type
interface Creator {
  id: string;
  name: string;
  email: string;
  role: string;
  org: string;
  photo?: string;
  setsCreated: number;
  memberSince: string;
}

// Set creation store
interface SetCreationState {
  step: 1 | 2 | 3;
  questions: Question[];
  name: string;
  description: string;
  subjectId: string;
  chapterId: string;
  visibility: "private" | "org_only" | "public";
  selectedOrgIds: string[];
  expiresAt: Date | null;
  createdSet: { id: string; contentId: string; password: string; name: string } | null;
  isLoading: boolean;

  // Actions
  setStep: (step: 1 | 2 | 3) => void;
  setQuestions: (questions: Question[]) => void;
  addQuestions: (questions: Question[]) => void;
  removeQuestion: (id: string) => void;
  reorderQuestions: (questions: Question[]) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setSubjectId: (subjectId: string) => void;
  setChapterId: (chapterId: string) => void;
  setVisibility: (visibility: "private" | "org_only" | "public") => void;
  setSelectedOrgIds: (orgIds: string[]) => void;
  toggleOrg: (orgId: string) => void;
  setExpiresAt: (date: Date | null) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

// Generate unique 6-digit ID
const generateId = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// Generate unique 6-digit password
const generatePassword = (): string => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const useSetCreationStore = create<SetCreationState>((set, get) => ({
  step: 1,
  questions: [],
  name: "",
  description: "",
  subjectId: "",
  chapterId: "",
  visibility: "private",
  selectedOrgIds: [],
  expiresAt: null,
  createdSet: null,
  isLoading: false,

  setStep: (step) => set({ step }),
  setQuestions: (questions) => set({ questions }),
  addQuestions: (newQuestions) => set((state) => ({
    questions: [...state.questions, ...newQuestions]
  })),
  removeQuestion: (id) => set((state) => ({
    questions: state.questions.filter(q => q.id !== id)
  })),
  reorderQuestions: (questions) => set({ questions }),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setSubjectId: (subjectId) => set({ subjectId }),
  setChapterId: (chapterId) => set({ chapterId }),
  setVisibility: (visibility) => set({ visibility, selectedOrgIds: visibility === "org_only" ? get().selectedOrgIds : [] }),
  setSelectedOrgIds: (selectedOrgIds) => set({ selectedOrgIds }),
  toggleOrg: (orgId) => set((state) => ({
    selectedOrgIds: state.selectedOrgIds.includes(orgId)
      ? state.selectedOrgIds.filter(id => id !== orgId)
      : [...state.selectedOrgIds, orgId]
  })),
  setExpiresAt: (expiresAt) => set({ expiresAt }),

  submit: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const state = get();
    const contentId = generateId();
    const password = generatePassword();
    
    set({
      createdSet: {
        id: `set-${contentId}`,
        contentId: contentId,
        password: password,
        name: state.name
      },
      step: 3,
      isLoading: false
    });
  },

  reset: () => set({
    step: 1,
    questions: [],
    name: "",
    description: "",
    subjectId: "",
    chapterId: "",
    visibility: "private",
    selectedOrgIds: [],
    expiresAt: null,
    createdSet: null,
    isLoading: false
  })
}));

// Section type for MockTest
interface MockTestSection {
  id: string;
  name: string;
  setId: string;
  password: string;
  verified: boolean;
  setData?: {
    id: string;
    contentId: string;
    name: string;
    questionCount: number;
    difficulty: { easy: number; medium: number; hard: number };
    creator: Creator;
  };
  error?: string;
}

// MockTest creation store
interface MockTestCreationState {
  name: string;
  category: string;
  duration: number;
  marksCorrect: number;
  marksWrong: number;
  instructions: string;
  visibility: "private" | "org_only" | "public";
  sections: MockTestSection[];
  questionOrder: "section_wise" | "shuffle_all" | "shuffle_within_section";
  createdMock: { id: string; contentId: string; password: string; name: string; sections: MockTestSection[] } | null;
  isLoading: boolean;

  // Actions
  setName: (name: string) => void;
  setCategory: (category: string) => void;
  setDuration: (duration: number) => void;
  setMarksCorrect: (marks: number) => void;
  setMarksWrong: (marks: number) => void;
  setInstructions: (instructions: string) => void;
  setVisibility: (visibility: "private" | "org_only" | "public") => void;
  setQuestionOrder: (order: "section_wise" | "shuffle_all" | "shuffle_within_section") => void;
  addSection: () => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<MockTestSection>) => void;
  verifySection: (id: string) => Promise<void>;
  submit: () => Promise<void>;
  reset: () => void;

  // Computed
  getTotalQuestions: () => number;
  getTotalCreators: () => Creator[];
}

// Mock sets data for verification with creator info
const mockSetsData: Record<string, { id: string; contentId: string; name: string; questionCount: number; difficulty: { easy: number; medium: number; hard: number }; password: string; creator: Creator }> = {
  "482931": { 
    id: "set-1", 
    contentId: "482931",
    name: "Mathematics — Algebra & Calculus", 
    questionCount: 25, 
    difficulty: { easy: 8, medium: 12, hard: 5 }, 
    password: "738291",
    creator: { id: "u1", name: "Rahul Kumar", email: "rahul@apex.edu", role: "Teacher", org: "Apex Academy", setsCreated: 8, memberSince: "Jan 2025" }
  },
  "591047": { 
    id: "set-2", 
    contentId: "591047",
    name: "English Grammar & Comprehension", 
    questionCount: 25, 
    difficulty: { easy: 10, medium: 10, hard: 5 }, 
    password: "492018",
    creator: { id: "u2", name: "Priya Singh", email: "priya@apex.edu", role: "Teacher", org: "Apex Academy", setsCreated: 5, memberSince: "Feb 2025" }
  },
  "673829": { 
    id: "set-3", 
    contentId: "673829",
    name: "Reasoning — Verbal & Non-Verbal", 
    questionCount: 25, 
    difficulty: { easy: 6, medium: 14, hard: 5 }, 
    password: "381927",
    creator: { id: "u3", name: "Amit Sharma", email: "amit@apex.edu", role: "Teacher", org: "Apex Academy", setsCreated: 12, memberSince: "Dec 2024" }
  },
  "784930": { 
    id: "set-4", 
    contentId: "784930",
    name: "General Knowledge", 
    questionCount: 25, 
    difficulty: { easy: 12, medium: 8, hard: 5 }, 
    password: "573810",
    creator: { id: "u4", name: "Sunita Devi", email: "sunita@apex.edu", role: "Teacher", org: "Apex Academy", setsCreated: 6, memberSince: "Jan 2025" }
  },
};

export const useMockTestCreationStore = create<MockTestCreationState>((set, get) => ({
  name: "",
  category: "",
  duration: 60,
  marksCorrect: 2,
  marksWrong: -0.5,
  instructions: "",
  visibility: "private",
  sections: [
    { id: "section-1", name: "Section 1", setId: "", password: "", verified: false },
    { id: "section-2", name: "Section 2", setId: "", password: "", verified: false },
  ],
  questionOrder: "section_wise",
  createdMock: null,
  isLoading: false,

  setName: (name) => set({ name }),
  setCategory: (category) => set({ category }),
  setDuration: (duration) => set({ duration }),
  setMarksCorrect: (marksCorrect) => set({ marksCorrect }),
  setMarksWrong: (marksWrong) => set({ marksWrong }),
  setInstructions: (instructions) => set({ instructions }),
  setVisibility: (visibility) => set({ visibility }),
  setQuestionOrder: (questionOrder) => set({ questionOrder }),

  addSection: () => set((state) => ({
    sections: [
      ...state.sections,
      { id: `section-${Date.now()}`, name: `Section ${state.sections.length + 1}`, setId: "", password: "", verified: false }
    ]
  })),

  removeSection: (id) => set((state) => ({
    sections: state.sections.filter(s => s.id !== id)
  })),

  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  verifySection: async (id) => {
    const section = get().sections.find(s => s.id === id);
    if (!section || !section.setId || !section.password) {
      set((state) => ({
        sections: state.sections.map(s => s.id === id ? { ...s, error: "Please enter both Set ID and Password" } : s)
      }));
      return;
    }

    set((state) => ({
      sections: state.sections.map(s => s.id === id ? { ...s, error: undefined, verified: false } : s)
    }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const setData = mockSetsData[section.setId];
    
    if (setData && setData.password === section.password) {
      set((state) => ({
        sections: state.sections.map(s => s.id === id ? {
          ...s,
          verified: true,
          name: s.name || setData.name.split(" — ")[0],
          setData: {
            id: setData.id,
            contentId: setData.contentId,
            name: setData.name,
            questionCount: setData.questionCount,
            difficulty: setData.difficulty,
            creator: setData.creator
          },
          error: undefined
        } : s)
      }));
    } else {
      set((state) => ({
        sections: state.sections.map(s => s.id === id ? {
          ...s,
          verified: false,
          error: "Invalid Set ID or Password. Please try again."
        } : s)
      }));
    }
  },

  submit: async () => {
    const state = get();
    
    // Check all sections are verified
    const allVerified = state.sections.every(s => s.verified);
    if (!allVerified || !state.name) {
      return;
    }

    set({ isLoading: true });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const contentId = generateId();
    const password = generatePassword();

    set({
      createdMock: {
        id: `mock-${contentId}`,
        contentId: contentId,
        password: password,
        name: state.name,
        sections: state.sections
      },
      isLoading: false
    });
  },

  getTotalQuestions: () => {
    return get().sections.reduce((total, section) => total + (section.setData?.questionCount || 0), 0);
  },

  getTotalCreators: () => {
    const creators: Creator[] = [];
    get().sections.forEach(section => {
      if (section.setData?.creator && !creators.find(c => c.id === section.setData?.creator.id)) {
        creators.push(section.setData.creator);
      }
    });
    return creators;
  },

  reset: () => set({
    name: "",
    category: "",
    duration: 60,
    marksCorrect: 2,
    marksWrong: -0.5,
    instructions: "",
    visibility: "private",
    sections: [
      { id: "section-1", name: "Section 1", setId: "", password: "", verified: false },
      { id: "section-2", name: "Section 2", setId: "", password: "", verified: false },
    ],
    questionOrder: "section_wise",
    createdMock: null,
    isLoading: false
  })
}));
