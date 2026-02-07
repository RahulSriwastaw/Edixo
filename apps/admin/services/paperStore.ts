import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaperConfiguration, Question } from '../types';

interface PaperStore {
    paperConfig: PaperConfiguration;
    setPaperConfig: (config: PaperConfiguration) => void;
    updateSectionQuestions: (sectionId: string, questions: Question[]) => void;
    initializePaper: (questions: Question[]) => void;
}

export const usePaperStore = create<PaperStore>()(
    persist(
        (set) => ({
            paperConfig: {
                title: 'Untitled Question Paper',
                sections: [],
                templateId: 'modern',
            },
            setPaperConfig: (config) => set({ paperConfig: config }),
            updateSectionQuestions: (sectionId, questions) =>
                set((state) => ({
                    paperConfig: {
                        ...state.paperConfig,
                        sections: state.paperConfig.sections.map((s) =>
                            s.id === sectionId ? { ...s, questions } : s
                        ),
                    },
                })),
            initializePaper: (questions) =>
                set({
                    paperConfig: {
                        title: 'Generated Question Paper',
                        sections: [
                            {
                                id: 'section-a',
                                title: 'Section A',
                                questions: questions,
                                marks: 0,
                            },
                        ],
                        templateId: 'modern',
                    },
                }),
        }),
        {
            name: 'paper-builder-storage',
        }
    )
);
