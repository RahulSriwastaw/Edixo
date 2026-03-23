import { api } from "@/lib/api";

export interface PersonalizationSettings {
    pointsPerCorrect?: number;
    pointsDeductedPerWrong?: number;
    dailyLoginBonus?: number;
    testCompletionBonus?: number;
    perfectScoreBonus?: number;
}

export const studentAppService = {
    getPersonalization: async (orgId: string): Promise<PersonalizationSettings> => {
        const res = await api.get(`/organizations/${orgId}/personalization`);
        return res.data;
    },

    updatePersonalization: async (orgId: string, settings: PersonalizationSettings): Promise<any> => {
        return api.patch(`/organizations/${orgId}/personalization`, settings);
    },

    getStudents: async (orgId?: string, search?: string): Promise<any[]> => {
        const params = new URLSearchParams();
        if (orgId) params.set('orgId', orgId);
        if (search) params.set('search', search);
        const res = await api.get(`/super-admin/mockbook/students?${params.toString()}`);
        return res.data || [];
    }
};
