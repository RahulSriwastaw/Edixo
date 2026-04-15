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
    getStats: async (orgId?: string): Promise<MockBookStats> => {
        const path = orgId ? `/super-admin/mockbook/analytics?orgId=${orgId}` : '/super-admin/mockbook/analytics';
        const res = await api.get(path);
        return res.data;
    },

    getAnalytics: async (orgId?: string): Promise<any> => {
        const path = orgId ? `/super-admin/mockbook/analytics?orgId=${orgId}` : '/super-admin/mockbook/analytics';
        const res = await api.get(path);
        return res.data;
    },

    // ─── Exam Folders (Top Category: SSC, Railway, etc.) ───────────
    getFolders: async (orgId?: string): Promise<ExamFolder[]> => {
        const path = orgId ? `/super-admin/mockbook/categories?orgId=${orgId}` : '/super-admin/mockbook/categories';
        const res = await api.get(path);
        return res.data || [];
    },

    createFolder: async (data: Partial<ExamFolder>) => {
        return api.post('/super-admin/mockbook/categories', data);
    },

    updateFolder: async (id: string, data: Partial<ExamFolder>) => {
        return api.patch(`/super-admin/mockbook/categories/${id}`, data);
    },

    deleteFolder: async (id: string) => {
        return api.delete(`/super-admin/mockbook/categories/${id}`);
    },

    // ─── Exam Series (Test Series: SSC CGL 2026, etc.) ─────────────
    getSeriesDetail: async (id: string): Promise<any> => {
        const res = await api.get(`/super-admin/mockbook/test-series/${id}`);
        return res.data;
    },

    getSeries: async (folderId?: string, orgId?: string): Promise<ExamSeries[]> => {
        const params = new URLSearchParams();
        if (folderId) params.set('folderId', folderId);
        if (orgId) params.set('orgId', orgId);
        const path = `/super-admin/mockbook/test-series${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await api.get(path);
        return res.data || [];
    },

    createSeries: async (data: Partial<ExamSeries>) => {
        return api.post('/super-admin/mockbook/test-series', data);
    },

    updateSeries: async (id: string, data: Partial<ExamSeries>) => {
        return api.patch(`/super-admin/mockbook/test-series/${id}`, data);
    },

    deleteSeries: async (id: string) => {
        return api.delete(`/super-admin/mockbook/test-series/${id}`);
    },

    // ─── Sub-Categories (Test Folders: Tier 1, Sectional, etc.) ───
    getSubCategories: async (categoryId: string): Promise<ExamSubCategory[]> => {
        const res = await api.get(`/super-admin/mockbook/sub-categories?categoryId=${categoryId}`);
        return res.data || [];
    },

    createSubCategory: async (data: Partial<ExamSubCategory>) => {
        return api.post('/super-admin/mockbook/sub-categories', data);
    },

    updateSubCategory: async (id: string, data: Partial<ExamSubCategory>) => {
        return api.patch(`/super-admin/mockbook/sub-categories/${id}`, data);
    },

    deleteSubCategory: async (id: string) => {
        return api.delete(`/super-admin/mockbook/sub-categories/${id}`);
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
        const res = await api.get(`/super-admin/mockbook/tests?${params.toString()}`);
        return res.data || [];
    },

    getAdminTestDetail: async (id: string): Promise<MockTest> => {
        const res = await api.get(`/super-admin/mockbook/tests/${id}`);
        return res.data;
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
        const res = await api.post('/super-admin/mockbook/tests', { 
            ...data,
            orgId: data.orgId || ORG_ID
        });
        return res.data;
    },

    updateMockTest: async (id: string, data: Partial<MockTest>) => {
        const res = await api.patch(`/super-admin/mockbook/tests/${id}`, data);
        return res.data;
    },

    changeMockTestStatus: async (id: string, status: "DRAFT" | "LIVE" | "ENDED") => {
        const res = await api.patch(`/super-admin/mockbook/tests/${id}/status`, { status });
        return res.data;
    },

    deleteMockTest: async (id: string) => {
        return api.delete(`/super-admin/mockbook/tests/${id}`);
    },

    addMockTestSection: async (testId: string, data: { setId: string; name: string; durationMins?: number }) => {
        const res = await api.post(`/super-admin/mockbook/tests/${testId}/sections`, data);
        return res.data;
    },

    removeMockTestSection: async (testId: string, sectionId: string) => {
        return api.delete(`/super-admin/mockbook/tests/${testId}/sections/${sectionId}`);
    },

    // ─── Admin Students ─────────────────────────────────────────────
    getAdminStudents: async (filters?: { orgId?: string; search?: string }): Promise<AdminStudent[]> => {
        const params = new URLSearchParams();
        const orgId = filters?.orgId || ORG_ID;
        if (orgId) params.set('orgId', orgId);
        if (filters?.search) params.set('search', filters.search);
        const res = await api.get(`/super-admin/mockbook/students?${params.toString()}`);
        return res.data || [];
    },

    // ─── Admin Live Tests ───────────────────────────────────────────
    getLiveAndScheduledTests: async (orgId?: string): Promise<{ live: MockTest[]; scheduled: MockTest[] }> => {
        const params = new URLSearchParams();
        const targetOrgId = orgId || ORG_ID;
        if (targetOrgId) params.set('orgId', targetOrgId);
        const res = await api.get(`/super-admin/mockbook/live-tests?${params.toString()}`);
        return res.data || { live: [], scheduled: [] };
    },

    getTestPerformance: async (testId: string): Promise<any> => {
        const res = await api.get(`/super-admin/mockbook/tests/${testId}/performance`);
        return res.data;
    },

    getStudentDrilldown: async (studentId: string): Promise<any> => {
        const res = await api.get(`/super-admin/mockbook/students/${studentId}`);
        return res.data;
    },

    // ─── Leaderboard ────────────────────────────────────────────────
    getLeaderboard: async (testId: string): Promise<any[]> => {
        const res = await api.get(`/super-admin/mockbook/leaderboards/${testId}`);
        return res.data || [];
    },

    // ─── Comprehensive Analytics ────────────────────────────────────
    getStudentOverallAnalytics: async (studentId: string, days: number = 30): Promise<any> => {
        const res = await api.get(`/super-admin/mockbook/analytics/student/${studentId}/overall?days=${days}`);
        return res.data;
    },

    getAttemptReport: async (attemptId: string): Promise<any> => {
        const res = await api.get(`/super-admin/mockbook/analytics/${attemptId}/report`);
        return res.data;
    },

    generateStudyPlan: async (studentId: string, durationInDays: number = 15): Promise<any> => {
        const res = await api.post(`/super-admin/mockbook/analytics/student/${studentId}/study-plan`, { durationInDays });
        return res.data;
    },

};
