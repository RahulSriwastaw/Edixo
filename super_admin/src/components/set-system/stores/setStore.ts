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
  options?: any[];
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
  folderId: string | null;
  createdSet: { id: string; contentId: string; password: string; name: string } | null;
  isLoading: boolean;

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
  setFolderId: (folderId: string | null) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
  return match ? match[1] : '';
}

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
  folderId: null,

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
  setFolderId: (folderId) => set({ folderId }),

  submit: async () => {
    const state = get();
    if (!state.name || state.questions.length === 0) return;

    set({ isLoading: true });
    try {
      const token = getToken();
      const questionIds = state.questions.map(q => q.id);

      const response = await fetch(`${API_URL}/qbank/sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: state.name,
          description: state.description,
          questionIds: questionIds,
          folderId: state.folderId,
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const setObj = resData.data;
        set({
          createdSet: {
            id: setObj.id,
            contentId: setObj.setId,
            password: setObj.pin,
            name: setObj.name
          },
          step: 3,
          isLoading: false
        });
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create set");
      }
    } catch (error: any) {
      console.error("Set creation error:", error);
      set({ isLoading: false });
      throw error;
    }
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
    folderId: null,
    createdSet: null,
    isLoading: false
  })
}));

// Section type for MockTest
interface MockTestSection {
  id: string;
  name: string;
  setId: string;
  setDbId?: string;
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
  orgId: string;
  folderId: string;
  categoryId: string;
  subCategoryId: string;
  duration: number;
  marksCorrect: number;
  marksWrong: number;
  instructions: string;
  visibility: "private" | "org_only" | "public";
  isPublic: boolean;
  sections: MockTestSection[];
  questionOrder: "section_wise" | "shuffle_all" | "shuffle_within_section";
  createdMock: { id: string; testId: string; name: string; sections: MockTestSection[] } | null;
  isLoading: boolean;

  setName: (name: string) => void;
  setCategory: (category: string) => void;
  setOrgId: (orgId: string) => void;
  setFolderId: (id: string) => void;
  setCategoryId: (id: string) => void;
  setSubCategoryId: (id: string) => void;
  setDuration: (duration: number) => void;
  setMarksCorrect: (marks: number) => void;
  setMarksWrong: (marks: number) => void;
  setInstructions: (instructions: string) => void;
  setVisibility: (visibility: "private" | "org_only" | "public") => void;
  setIsPublic: (isPublic: boolean) => void;
  setQuestionOrder: (order: "section_wise" | "shuffle_all" | "shuffle_within_section") => void;
  addSection: () => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<MockTestSection>) => void;
  verifySection: (id: string) => Promise<void>;
  submit: () => Promise<void>;
  reset: () => void;
  initFromSet: (setData: { id: string; contentId: string; name: string; questionCount: number; password: string }) => void;

  getTotalQuestions: () => number;
  getTotalCreators: () => Creator[];
}

export const useMockTestCreationStore = create<MockTestCreationState>((set, get) => ({
  name: "",
  category: "",
  orgId: "demo-org",
  folderId: "",
  categoryId: "",
  subCategoryId: "",
  duration: 60,
  marksCorrect: 1,
  marksWrong: -0.33,
  instructions: "",
  visibility: "private",
  isPublic: true,
  sections: [
    { id: "section-1", name: "Section 1", setId: "", password: "", verified: false },
  ],
  questionOrder: "section_wise",
  createdMock: null,
  isLoading: false,

  setName: (name) => set({ name }),
  setCategory: (category) => set({ category }),
  setOrgId: (orgId) => set({ orgId }),
  setFolderId: (folderId) => set({ folderId }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setSubCategoryId: (subCategoryId) => set({ subCategoryId }),
  setDuration: (duration) => set({ duration }),
  setMarksCorrect: (marksCorrect) => set({ marksCorrect }),
  setMarksWrong: (marksWrong) => set({ marksWrong }),
  setInstructions: (instructions) => set({ instructions }),
  setVisibility: (visibility) => set({ visibility }),
  setIsPublic: (isPublic) => set({ isPublic }),
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
    if (!section || !section.setId) {
      set((state) => ({
        sections: state.sections.map(s => s.id === id ? { ...s, error: "Please enter the Set ID" } : s)
      }));
      return;
    }

    set((state) => ({
      sections: state.sections.map(s => s.id === id ? { ...s, error: undefined, verified: false } : s)
    }));

    try {
      const token = getToken();

      // Try direct fetch by DB id first
      let setObj: any = null;
      const directRes = await fetch(`${API_URL}/qbank/sets/${section.setId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (directRes.ok) {
        const dd = await directRes.json();
        setObj = dd.data;
      }

      if (!setObj) {
        // Try searching by setId (6-digit code)
        const searchRes = await fetch(`${API_URL}/qbank/sets?limit=10&page=1`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (searchRes.ok) {
          const sd = await searchRes.json();
          const sets = sd.data?.sets || sd.data || [];
          setObj = sets.find((s: any) => s.setId === section.setId || s.id === section.setId);
        }
      }

      if (!setObj) {
        set((state) => ({
          sections: state.sections.map(s => s.id === id ? {
            ...s, verified: false,
            error: "Set not found. Please paste the Set DB-ID (from Q-Bank > Sets page)."
          } : s)
        }));
        return;
      }

      set((state) => ({
        sections: state.sections.map(s => s.id === id ? {
          ...s,
          verified: true,
          setDbId: setObj.id,
          name: s.name || setObj.name,
          setData: {
            id: setObj.id,
            contentId: setObj.setId,
            name: setObj.name,
            questionCount: setObj._count?.items || setObj.totalQuestions || 0,
            difficulty: { easy: 0, medium: setObj._count?.items || setObj.totalQuestions || 0, hard: 0 },
            creator: {
              id: "system", name: "Q-Bank", email: "", role: "Admin", org: "EduHub",
              setsCreated: 0, memberSince: ""
            }
          },
          error: undefined
        } : s)
      }));
    } catch (err: any) {
      set((state) => ({
        sections: state.sections.map(s => s.id === id ? {
          ...s, verified: false, error: err.message || "Verification failed."
        } : s)
      }));
    }
  },

  submit: async () => {
    const state = get();
    const allVerified = state.sections.every(s => s.verified && s.setDbId);
    if (!allVerified || !state.name || !state.orgId) return;

    set({ isLoading: true });
    try {
      const token = getToken();
      const totalQuestions = state.sections.reduce((t, s) => t + (s.setData?.questionCount || 0), 0);
      const totalMarks = totalQuestions * state.marksCorrect;

      // Step 1: Create the mock test
      const testRes = await fetch(`${API_URL}/super-admin/mockbook/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          orgId: state.orgId,
          name: state.name,
          description: state.instructions || `Mock test with ${totalQuestions} questions`,
          durationMins: state.duration,
          totalMarks,
          subCategoryId: state.subCategoryId || null,
          isPublic: state.isPublic,
          shuffleQuestions: state.questionOrder === 'shuffle_all',
          maxAttempts: 1,
          showResult: true,
          scheduledAt: null,
          endsAt: null,
        })
      });

      if (!testRes.ok) {
        const err = await testRes.json();
        throw new Error(err.message || "Failed to create mock test");
      }

      const testData = await testRes.json();
      const createdTest = testData.data;

      // Step 2: Add sections (question sets) to the test
      for (const section of state.sections) {
        if (!section.setDbId) continue;
        await fetch(`${API_URL}/super-admin/mockbook/tests/${createdTest.id}/sections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            setId: section.setDbId,
            name: section.name || section.setData?.name || "Section",
            durationMins: null
          })
        });
      }

      // Step 3: Set status to LIVE
      await fetch(`${API_URL}/super-admin/mockbook/tests/${createdTest.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'LIVE' })
      });

      set({
        createdMock: {
          id: createdTest.id,
          testId: createdTest.testId,
          name: state.name,
          sections: state.sections
        },
        isLoading: false
      });
    } catch (error: any) {
      console.error("Mock test creation error:", error);
      set({ isLoading: false });
      throw error;
    }
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
    orgId: "demo-org",
    folderId: "",
    categoryId: "",
    subCategoryId: "",
    duration: 60,
    marksCorrect: 1,
    marksWrong: -0.33,
    instructions: "",
    visibility: "private",
    isPublic: true,
    sections: [
      { id: "section-1", name: "Section 1", setId: "", password: "", verified: false },
    ],
    questionOrder: "section_wise",
    createdMock: null,
    isLoading: false
  }),

  initFromSet: (setData) => {
    set({
      name: `${setData.name} - MockTest`,
      sections: [
        {
          id: "section-1",
          name: "Section 1",
          setId: setData.id,
          setDbId: setData.id,
          password: setData.password,
          verified: true,
          setData: {
            id: setData.id,
            contentId: setData.contentId,
            name: setData.name,
            questionCount: setData.questionCount,
            difficulty: { easy: 0, medium: setData.questionCount, hard: 0 },
            creator: {
              id: "system", name: "System", email: "", role: "System", org: "System",
              setsCreated: 0, memberSince: ""
            }
          }
        }
      ]
    });
  }
}));
