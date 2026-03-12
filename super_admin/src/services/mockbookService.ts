import { api } from "@/lib/api";

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "GK-ORG-00001";

export interface MockBookStats {
    platformTests: number;
    totalSeries: number;
    totalAttempts: number;
    activeStudents: number;
    liveNow: number;
    revenueMTD: number;
}

export interface ExamFolder {
    id: string;
    orgId: string | null;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
}

export interface ExamSeries {
    id: string;
    orgId: string | null;
    folderId: string;
    name: string;
    description: string | null;
    icon: string | null;
    isFeatured: boolean;
    isFree: boolean;
    price: number | null;
    discountPrice: number | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
}

export interface ExamSubCategory {
    id: string;
    categoryId: string;
    parentId: string | null;
    name: string;
    description: string | null;
    sortOrder: number;
    createdAt: string;
}

export interface MockTest {
    id: string;
    testId: string;
    orgId: string;
    subCategoryId: string | null;
    name: string;
    description: string | null;
    status: "DRAFT" | "LIVE" | "ENDED";
    durationMins: number;
    totalMarks: number;
    passingMarks: number | null;
    shuffleQuestions: boolean;
    showResult: boolean;
    maxAttempts: number;
    isPublic: boolean;
    scheduledAt: string | null;
    endsAt: string | null;
    createdAt: string;
    _count?: { attempts: number; sections: number };
    subCategory?: { name: string; category?: { id: string; name: string } };
}

export interface AdminStudent {
    id: string;
    studentId: string;
    name: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    totalAttempts: number;
    avgScore: string | null;
}

export const mockbookService = {
    // ─── Stats & Analytics ─────────────────────────────────────────
    getStats: async (): Promise<MockBookStats> => {
        const res = await api.get('/mockbook/analytics/stats');
        return res.data.data;
    },

    getAnalytics: async (): Promise<any> => {
        const res = await api.get('/mockbook/analytics/stats');
        return res.data.data;
    },

    // ─── Exam Folders (Top Category: SSC, Railway, etc.) ───────────
    getFolders: async (): Promise<ExamFolder[]> => {
        const res = await api.get('/mockbook/folders');
        return res.data?.data || res.data || [];
    },

    createFolder: async (data: Partial<ExamFolder>) => {
        return api.post('/mockbook/folders', data);
    },

    updateFolder: async (id: string, data: Partial<ExamFolder>) => {
        return api.patch(`/mockbook/folders/${id}`, data);
    },

    deleteFolder: async (id: string) => {
        return api.delete(`/mockbook/folders/${id}`);
    },

    // ─── Exam Series (Test Series: SSC CGL 2026, etc.) ─────────────
    getSeriesDetail: async (id: string): Promise<any> => {
        const res = await api.get(`/mockbook/categories/${id}`);
        return res.data;
    },

    getSeries: async (folderId?: string): Promise<ExamSeries[]> => {
        const path = folderId ? `/mockbook/categories?folderId=${folderId}` : '/mockbook/categories';
        const res = await api.get(path);
        return res.data?.data || res.data || [];
    },

    createSeries: async (data: Partial<ExamSeries>) => {
        return api.post('/mockbook/categories', data);
    },

    updateSeries: async (id: string, data: Partial<ExamSeries>) => {
        return api.patch(`/mockbook/categories/${id}`, data);
    },

    deleteSeries: async (id: string) => {
        return api.delete(`/mockbook/categories/${id}`);
    },

    // ─── Sub-Categories (Test Folders: Tier 1, Sectional, etc.) ───
    getSubCategories: async (categoryId: string): Promise<ExamSubCategory[]> => {
        const res = await api.get(`/mockbook/subcategories?categoryId=${categoryId}`);
        return res.data?.data || res.data || [];
    },

    createSubCategory: async (data: Partial<ExamSubCategory>) => {
        return api.post('/mockbook/subcategories', data);
    },

    updateSubCategory: async (id: string, data: Partial<ExamSubCategory>) => {
        return api.patch(`/mockbook/subcategories/${id}`, data);
    },

    deleteSubCategory: async (id: string) => {
        return api.delete(`/mockbook/subcategories/${id}`);
    },

    // ─── Admin Mock Tests ──────────────────────────────────────────
    getAdminTests: async (filters?: {
        orgId?: string; categoryId?: string; subCategoryId?: string;
        status?: string; search?: string;
    }): Promise<MockTest[]> => {
        const params = new URLSearchParams();
        const orgId = filters?.orgId || ORG_ID;
        if (orgId) params.set('orgId', orgId);
        if (filters?.categoryId) params.set('categoryId', filters.categoryId);
        if (filters?.subCategoryId) params.set('subCategoryId', filters.subCategoryId);
        if (filters?.status) params.set('status', filters.status);
        if (filters?.search) params.set('search', filters.search);
        const res = await api.get(`/mockbook/admin/tests?${params.toString()}`);
        return res.data?.data || [];
    },

    getAdminTestDetail: async (id: string): Promise<MockTest> => {
        const res = await api.get(`/mockbook/admin/tests/${id}`);
        return res.data?.data;
    },

    createMockTest: async (data: {
        orgId: string;
        name: string;
        durationMins: number;
        totalMarks?: number;
        subCategoryId?: string | null;
        description?: string;
        isPublic?: boolean;
        shuffleQuestions?: boolean;
        scheduledAt?: string | null;
        endsAt?: string | null;
        maxAttempts?: number;
    }) => {
        const res = await api.post('/mockbook/admin/tests', { 
            ...data,
            orgId: data.orgId || ORG_ID
        });
        return res.data?.data;
    },

    updateMockTest: async (id: string, data: Partial<MockTest>) => {
        const res = await api.patch(`/mockbook/admin/tests/${id}`, data);
        return res.data?.data;
    },

    changeMockTestStatus: async (id: string, status: "DRAFT" | "LIVE" | "ENDED") => {
        const res = await api.patch(`/mockbook/admin/tests/${id}/status`, { status });
        return res.data?.data;
    },

    deleteMockTest: async (id: string) => {
        return api.delete(`/mockbook/admin/tests/${id}`);
    },

    addMockTestSection: async (testId: string, data: { setId: string; name: string; durationMins?: number }) => {
        const res = await api.post(`/mockbook/admin/tests/${testId}/sections`, data);
        return res.data?.data;
    },

    removeMockTestSection: async (testId: string, sectionId: string) => {
        return api.delete(`/mockbook/admin/tests/${testId}/sections/${sectionId}`);
    },

    // ─── Admin Students ─────────────────────────────────────────────
    getAdminStudents: async (filters?: { orgId?: string; search?: string }): Promise<AdminStudent[]> => {
        const params = new URLSearchParams();
        if (filters?.orgId || ORG_ID) params.set('orgId', filters?.orgId || ORG_ID);
        if (filters?.search) params.set('search', filters.search);
        const res = await api.get(`/mockbook/admin/students?${params.toString()}`);
        return res.data?.data || [];
    },

    // ─── Admin Live Tests ───────────────────────────────────────────
    getLiveAndScheduledTests: async (orgId?: string): Promise<{ live: MockTest[]; scheduled: MockTest[] }> => {
        const params = new URLSearchParams();
        if (orgId || ORG_ID) params.set('orgId', orgId || ORG_ID);
        const res = await api.get(`/mockbook/admin/live-tests?${params.toString()}`);
        return res.data?.data || { live: [], scheduled: [] };
    },

    // ─── Leaderboard ────────────────────────────────────────────────
    getLeaderboard: async (testId: string): Promise<any[]> => {
        const res = await api.get(`/mockbook/${testId}/leaderboard`);
        return res.data?.data || [];
    },

    // ─── Comprehensive Analytics ────────────────────────────────────
    getStudentOverallAnalytics: async (studentId: string, days: number = 30): Promise<any> => {
        const res = await api.get(`/mockbook/analytics/student/${studentId}/overall?days=${days}`);
        return res.data?.data;
    },

    getAttemptReport: async (attemptId: string): Promise<any> => {
        const res = await api.get(`/mockbook/attempts/${attemptId}/report`);
        return res.data?.data;
    },

    generateStudyPlan: async (studentId: string, durationInDays: number = 15): Promise<any> => {
        const res = await api.post(`/mockbook/analytics/student/${studentId}/study-plan`, { durationInDays });
        return res.data?.data;
    }
};
