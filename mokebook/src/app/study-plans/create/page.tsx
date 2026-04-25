"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, Loader2, ArrowLeft, Target, Zap, BrainCircuit, Lightbulb } from "lucide-react";
import { generateAIStudyPlan } from "@/ai/flows/ai-study-plan-generation";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function CreateStudyPlanPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const [formData, setFormData] = useState({
    durationDays: 7,
    weakAreasDescription: "",
    currentOverallScore: 45,
    targetOverallScore: 80,
    examType: "JEE",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !db) return;

    setLoading(true);
    try {
      const planResult = await generateAIStudyPlan({
        userId: user.uid,
        durationDays: formData.durationDays,
        weakAreasDescription: formData.weakAreasDescription,
        currentOverallScore: formData.currentOverallScore,
        targetOverallScore: formData.targetOverallScore,
        examType: formData.examType
      });

      const newPlanRef = doc(collection(db, "users", user.uid, "study_plans"));
      const planData = {
        id: newPlanRef.id,
        userId: user.uid,
        topic: planResult.topic,
        durationDays: planResult.durationDays,
        currentLevelPercentage: planResult.currentLevel,
        targetLevelPercentage: planResult.targetLevel,
        dailyTasks: planResult.dailyTasks,
        daysCompleted: 0,
        totalDays: planResult.durationDays,
        status: "active",
        summary: planResult.planSummary,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      setDoc(newPlanRef, planData).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: newPlanRef.path,
          operation: 'create',
          requestResourceData: planData
        }));
      });

      toast({
        title: "Study Path Created!",
        description: "AI has successfully mapped your journey to mastery.",
      });

      router.push("/study-plans");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Generation Error",
        description: "Our planners are currently busy. Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }

  const tips = [
    { icon: Lightbulb, text: "Be specific about topics (e.g. 'Thermodynamics Laws' instead of just 'Physics')" },
    { icon: Zap, text: "Describe your recent mock test scores for better accuracy" },
    { icon: Target, text: "A 7-day plan is ideal for focused conceptual clarity" }
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 md:p-5 space-y-4 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto space-y-4">
            <Button variant="ghost" onClick={() => router.back()} className="h-8 px-2 text-[12px] font-bold transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <header className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <h1 className="text-[20px] font-bold">Custom Path Generator</h1>
              </div>
              <p className="text-[12px] font-medium max-w-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Describe your goals, and our neural engine will build a structured daily schedule to bridge your knowledge gaps.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 space-y-4">
                <Card className="rounded-lg overflow-hidden card-hover" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="exam" className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Preparation Target</Label>
                        <Select value={formData.examType} onValueChange={(v) => setFormData({ ...formData, examType: v })}>
                          <SelectTrigger id="exam" className="h-9 rounded-lg" style={{ background: "var(--bg-input)", border: "var(--border-input)" }}>
                            <SelectValue placeholder="Select competitive exam" />
                          </SelectTrigger>
                          <SelectContent style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                            <SelectItem value="JEE">JEE Mains & Advanced</SelectItem>
                            <SelectItem value="NEET">NEET Medical</SelectItem>
                            <SelectItem value="UPSC">UPSC Civil Services</SelectItem>
                            <SelectItem value="SSC">SSC CGL Graduate Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Describe Weak Areas or Topic</Label>
                        <Textarea
                          id="description"
                          placeholder="e.g. I am consistently scoring below 40% in Trigonometry. I need to master formulas and then solve past year papers."
                          className="min-h-[100px] text-[12px] rounded-lg resize-none p-3"
                          style={{ background: "var(--bg-input)", border: "var(--border-input)" }}
                          required
                          value={formData.weakAreasDescription}
                          onChange={(e) => setFormData({ ...formData, weakAreasDescription: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Plan Duration</Label>
                          <Select value={formData.durationDays.toString()} onValueChange={(v) => setFormData({ ...formData, durationDays: parseInt(v) })}>
                            <SelectTrigger className="h-9 rounded-lg" style={{ background: "var(--bg-input)", border: "var(--border-input)" }}>
                              <SelectValue placeholder="Duration" />
                            </SelectTrigger>
                            <SelectContent style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                              <SelectItem value="3">3 Days (Sprint)</SelectItem>
                              <SelectItem value="7">7 Days (Standard)</SelectItem>
                              <SelectItem value="30">30 Days (Mastery)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Target Proficiency</Label>
                            <Badge className="text-[10px] font-bold h-5" style={{ background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}>{formData.targetOverallScore}%</Badge>
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[formData.targetOverallScore]}
                            onValueChange={([val]) => setFormData({ ...formData, targetOverallScore: val })}
                            className="py-2"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-10 text-[12px] font-bold rounded-lg transition-all flex items-center justify-center gap-3"
                        disabled={loading || !formData.weakAreasDescription || !user}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Synthesizing Study Path...
                          </>
                        ) : (
                          <>
                            <Bot className="h-5 w-5" />
                            Generate My Custom Plan
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <Card className="rounded-lg overflow-hidden card-hover" style={{ background: "var(--bg-sidebar)", border: "var(--border-card)" }}>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                        <h3 className="text-base font-bold">Pro Guidelines</h3>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        Follow these tips to get the highest quality results from our AI model.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg transition-colors group"
                          style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
                        >
                          <div className="p-2 rounded-lg" style={{ background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}>
                            <tip.icon className="h-4 w-4" />
                          </div>
                          <p className="text-[11px] font-medium leading-relaxed">{tip.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3" style={{ borderTop: "var(--divider)" }}>
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#FF6B2B" }}>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase opacity-70 text-white">Model Status</span>
                          <span className="text-sm font-bold text-white">Gemini 2.5 Flash</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
