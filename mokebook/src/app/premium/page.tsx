"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Zap, 
  Crown, 
  Star, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  Sparkles,
  Loader2,
  Gift,
  ArrowRight
} from "lucide-react";
import { pricingService, MockbookPlan } from "@/lib/pricingService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PremiumPage() {
  const [plans, setPlans] = useState<MockbookPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await pricingService.getPlans();
      // Filter only active plans
      setPlans(data.filter(p => p.isActive));
      if (data.length > 0) {
        // Default to a popular looking plan or middle one
        const popular = data.find(p => p.price > 100) || data[0];
        setSelectedPlan(popular.id);
      }
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast.error("Failed to load official plans. Showing demo plans instead.");
      // Fallback demo plans if API fails
      setPlans([
        {
          id: "demo-1",
          name: "Standard Pass",
          slug: "standard",
          description: "Essential Mock Tests for quick practice",
          price: 299,
          discountPrice: 499,
          durationDays: 30,
          features: ["Access to 100+ Tests", "Basic Analytics", "Daily Quiz"],
          accessType: "GLOBAL",
          examCategoryIds: [],
          isActive: true
        },
        {
          id: "demo-2",
          name: "Pro Yearly",
          slug: "pro-year",
          description: "Full access to everything for a whole year",
          price: 999,
          discountPrice: 2999,
          durationDays: 365,
          features: ["Unlimited Mock Tests", "AI Performance Report", "Priority Support", "PDF Solutions"],
          accessType: "GLOBAL",
          examCategoryIds: [],
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F8] overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto thin-scrollbar pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header Section */}
            <div className="text-center space-y-4 pt-4 md:pt-8 animate-fade-in">
              <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1 font-bold text-xs tracking-widest uppercase rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Upgrade to Premium
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Accelerate Your Preparation <br className="hidden md:block" />
                with <span className="text-blue-600">Mockbook Pro</span>
              </h1>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
                Join thousands of toppers who trust our research-backed mock tests and AI-powered analytics to crack their dream exams.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-slate-400 font-medium">Fetching best plans for you...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id}
                    className={cn(
                      "relative border-none shadow-xl transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer group",
                      selectedPlan === plan.id 
                        ? "ring-2 ring-blue-600 scale-[1.02] shadow-blue-600/10" 
                        : "hover:scale-[1.01]"
                    )}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {/* Visual Decor */}
                    <div className={cn(
                        "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 transition-all",
                        selectedPlan === plan.id ? "bg-blue-600" : "bg-slate-400"
                    )} />

                    <CardContent className="p-8 space-y-8 h-full flex flex-col">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                            selectedPlan === plan.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                          )}>
                             <Crown className="w-6 h-6" />
                          </div>
                          {plan.price > 500 && (
                            <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] tracking-wide px-3 py-1">
                               BEST VALUE
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                          <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                          {plan.discountPrice && (
                            <span className="text-lg text-slate-400 line-through">₹{plan.discountPrice}</span>
                          )}
                          <span className="text-slate-400 font-bold text-sm">/ {plan.durationDays} Days</span>
                        </div>
                        <p className="text-[10px] font-bold text-blue-600 mt-2 flex items-center gap-1.5 uppercase">
                            <Clock className="w-3 h-3" /> Valid for {Math.floor(plan.durationDays / 30)} Months
                        </p>
                      </div>

                      <div className="space-y-3 flex-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Included Features</p>
                        <div className="space-y-2.5">
                          {Array.isArray(plan.features) ? plan.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </div>
                              <span className="text-sm font-medium text-slate-700">{feature}</span>
                            </div>
                          )) : (
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </div>
                              <span className="text-sm font-medium text-slate-700">Access to {plan.accessType === 'GLOBAL' ? 'All' : plan.examCategoryIds.length} Series</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button className={cn(
                        "w-full h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all",
                        selectedPlan === plan.id 
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}>
                        Choose This Plan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-slate-200">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                     <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Secure Payment</h4>
                    <p className="text-xs text-slate-500">Industry standard encryption</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                     <Star className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Quality Guaranteed</h4>
                    <p className="text-xs text-slate-500">Content by industry experts</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                     <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Instant Activation</h4>
                    <p className="text-xs text-slate-500">Access features within seconds</p>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
