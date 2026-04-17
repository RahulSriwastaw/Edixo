import { api } from '@/lib/api';

const BASE = '/super-admin/mockbook/pricing';

export interface MockbookPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  durationDays: number;
  features: any;
  accessType: string;
  examCategoryIds: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSubscription {
  id: string;
  studentId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
  paymentId: string | null;
  student: any;
  plan: MockbookPlan;
  createdAt: string;
}

export const mockbookPricingService = {
  getPlans: async (): Promise<MockbookPlan[]> => {
    const response = await api.get(`${BASE}/plans`);
    return response.data;
  },

  createPlan: async (data: Partial<MockbookPlan>): Promise<MockbookPlan> => {
    const response = await api.post(`${BASE}/plans`, data);
    return response.data;
  },

  updatePlan: async (id: string, data: Partial<MockbookPlan>): Promise<MockbookPlan> => {
    const response = await api.patch(`${BASE}/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/plans/${id}`);
  },

  getSubscriptions: async (): Promise<StudentSubscription[]> => {
    const response = await api.get(`${BASE}/subscriptions`);
    return response.data;
  }
};
