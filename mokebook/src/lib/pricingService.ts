import { apiFetch } from "./api";

export interface MockbookPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  durationDays: number;
  features: string[];
  accessType: 'GLOBAL' | 'CATEGORY';
  examCategoryIds: string[];
  isActive: boolean;
}

export const pricingService = {
  getPlans: async (): Promise<MockbookPlan[]> => {
    const res = await apiFetch("/mockbook/pricing/plans");
    return res.data;
  },

  getCurrentSubscription: async (): Promise<any> => {
    const res = await apiFetch("/mockbook/pricing/my-subscription");
    return res.data;
  }
};
