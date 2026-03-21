
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6 space-y-6 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="h-8 px-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            
            <header className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-headline font-bold text-slate-900">Custom Path Generator</h1>
              </div>
              <p className="text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">
                Describe your goals, and our neural engine will build a structured daily schedule to bridge your knowledge gaps.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-6">
                <Card className="shadow-xl border-none rounded-[2rem] overflow-hidden bg-white ring-1 ring-slate-100">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="exam" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Preparation Target</Label>
                        <Select value={formData.examType} onValueChange={(v) => setFormData({...formData, examType: v})}>
                          <SelectTrigger id="exam" className="h-12 text-sm rounded-xl border-slate-100 bg-slate-50/50">
                            <SelectValue placeholder="Select competitive exam" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="JEE">JEE Mains & Advanced</SelectItem>
                            <SelectItem value="NEET">NEET Medical</SelectItem>
                            <SelectItem value="UPSC">UPSC Civil Services</SelectItem>
                            <SelectItem value="SSC">SSC CGL Graduate Level</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Describe Weak Areas or Topic</Label>
                        <Textarea 
                          id="description"
                          placeholder="e.g. I am consistently scoring below 40% in Trigonometry. I need to master formulas and then solve past year papers."
                          className="min-h-[120px] text-sm rounded-2xl border-slate-100 bg-slate-50/50 resize-none p-4"
                          required
                          value={formData.weakAreasDescription}
                          onChange={(e) => setFormData({...formData, weakAreasDescription: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Plan Duration</Label>
                          <Select value={formData.durationDays.toString()} onValueChange={(v) => setFormData({...formData, durationDays: parseInt(v)})}>
                            <SelectTrigger className="h-12 text-sm rounded-xl border-slate-100 bg-slate-50/50">
                              <SelectValue placeholder="Duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 Days (Sprint)</SelectItem>
                              <SelectItem value="7">7 Days (Standard)</SelectItem>
                              <SelectItem value="30">30 Days (Mastery)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Target Proficiency</Label>
                            <Badge className="bg-primary/10 text-primary text-[11px] font-bold">{formData.targetOverallScore}%</Badge>
                          </div>
                          <Slider 
                            min={0} 
                            max={100} 
                            step={5} 
                            value={[formData.targetOverallScore]} 
                            onValueChange={([val]) => setFormData({...formData, targetOverallScore: val})}
                            className="py-2"
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 h-14 text-sm font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3" 
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

              <div className="lg:col-span-5 space-y-6">
                <Card className="border-none bg-slate-900 text-white rounded-[2rem] shadow-xl p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-bold">Pro Guidelines</h3>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Follow these tips to get the highest quality results from our AI model.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
                        <div className="p-2 rounded-xl bg-primary/20 text-primary">
                          <tip.icon className="h-4 w-4" />
                        </div>
                        <p className="text-xs md:text-sm font-medium leading-relaxed">{tip.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between p-4 bg-primary rounded-2xl">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase opacity-70">Model Status</span>
                        <span className="text-sm font-bold">Gemini 2.5 Flash</span>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
