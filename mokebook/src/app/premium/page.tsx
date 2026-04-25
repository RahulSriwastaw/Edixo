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
  Sparkles,
  Loader2,
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
      setPlans(data.filter(p => p.isActive));
      if (data.length > 0) {
        const popular = data.find(p => p.price > 100) || data[0];
        setSelectedPlan(popular.id);
      }
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast.error("Failed to load official plans. Showing demo plans instead.");
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto thin-scrollbar pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-12">

            {/* Header Section */}
            <div className="text-center space-y-4 pt-4 md:pt-8 animate-fade-in">
              <Badge className="text-[11px] font-bold uppercase tracking-[0.8px] border-none px-4 py-1 rounded-full"
                style={{ background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Upgrade to Premium
              </Badge>
              <h1 className="text-[20px] md:text-[28px] font-bold leading-tight">
                Accelerate Your Preparation <br className="hidden md:block" />
                with <span style={{ color: "#FF6B2B" }}>Mockbook Pro</span>
              </h1>
              <p className="text-[13px] max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
                Join thousands of toppers who trust our research-backed mock tests and AI-powered analytics to crack their dream exams.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#FF6B2B" }} />
                <p className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>Fetching best plans for you...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 rounded-lg cursor-pointer group card-hover",
                      selectedPlan === plan.id
                        ? "ring-1 scale-[1.02]"
                        : "hover:scale-[1.01]"
                    )}
                    style={selectedPlan === plan.id ? { borderColor: "#FF6B2B" } : {}}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardContent className="p-6 space-y-6 h-full flex flex-col">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            selectedPlan === plan.id ? "text-white" : ""
                          )}
                            style={selectedPlan === plan.id ? { background: "#FF6B2B" } : { background: "var(--bg-main)", color: "var(--text-muted)" }}
                          >
                            <Crown className="w-6 h-6" />
                          </div>
                          {plan.price > 500 && (
                            <Badge variant="secondary" className="text-[10px] font-bold px-3 py-1 rounded-full">
                              BEST VALUE
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-[18px] font-bold">{plan.name}</h3>
                          <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>{plan.description}</p>
                        </div>
                      </div>

                      <div className="pt-4" style={{ borderTop: "var(--divider)" }}>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[28px] font-bold" style={{ color: "var(--text-primary)" }}>₹{plan.price}</span>
                          {plan.discountPrice && (
                            <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>₹{plan.discountPrice}</span>
                          )}
                          <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>/ {plan.durationDays} Days</span>
                        </div>
                        <p className="text-[10px] font-bold mt-2 flex items-center gap-1.5 uppercase" style={{ color: "#FF6B2B" }}>
                          <Clock className="w-3 h-3" /> Valid for {Math.floor(plan.durationDays / 30)} Months
                        </p>
                      </div>

                      <div className="space-y-3 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Included Features</p>
                        <div className="space-y-2.5">
                          {Array.isArray(plan.features) ? plan.features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,107,43,0.08)" }}>
                                <Check className="w-3 h-3" style={{ color: "#FF6B2B" }} strokeWidth={3} />
                              </div>
                              <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{feature}</span>
                            </div>
                          )) : (
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,107,43,0.08)" }}>
                                <Check className="w-3 h-3" style={{ color: "#FF6B2B" }} strokeWidth={3} />
                              </div>
                              <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>Access to {plan.accessType === 'GLOBAL' ? 'All' : plan.examCategoryIds.length} Series</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button className={cn(
                        "w-full h-11 rounded-lg font-bold text-[12px] uppercase tracking-wider transition-all"
                      )}
                        style={selectedPlan === plan.id ? { background: "#FF6B2B" } : { background: "var(--btn-secondary-border)", color: "var(--btn-secondary-text)" }}
                      >
                        Choose This Plan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12" style={{ borderTop: "var(--divider)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <ShieldCheck className="w-6 h-6" style={{ color: "var(--badge-success-text)" }} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold">Secure Payment</h4>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Industry standard encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <Star className="w-6 h-6" style={{ color: "#FF6B2B" }} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold">Quality Guaranteed</h4>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Content by industry experts</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <Zap className="w-6 h-6" style={{ color: "#FF6B2B" }} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold">Instant Activation</h4>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Access features within seconds</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
