"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Loader2,
  ListTodo,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface StudyTask {
  day: number;
  date: string;
  taskType: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function StudyPlansPage() {
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);
  
  // Actually, since there's no DB persistence yet in the mock endpoint,
  // we'll keep the generated plan in state
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Generate Dialog State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [duration, setDuration] = useState("15");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Step 1: Get current student user
        const userRes = await apiFetch("/auth/me");
        if (userRes.data?.user?.studentId) {
            setStudentId(userRes.data.user.studentId);
        }
      } catch (err) {
        console.error("Could not fetch user info");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleGenerate = async () => {
    if (!studentId) {
        toast.error("Student ID not found");
        return;
    }
    setGenerating(true);
    try {
        const res = await apiFetch(`/mockbook/analytics/student/${studentId}/study-plan`, {
            method: "POST",
            body: JSON.stringify({ durationInDays: Number(duration) })
        });
        
        if (res.success && res.data) {
            const newPlan = {
                id: `ai-plan-${Date.now()}`,
                title: "AI Personalised Target Plan",
                targetExam: "SSC CGL / RRB Group D",
                startDate: res.data.plan[0]?.date,
                endDate: res.data.plan[res.data.plan.length - 1]?.date,
                tasks: res.data.plan,
                progress: 0
            };
            setGeneratedPlan(newPlan);
            toast.success("Study plan generated successfully!");
            setShowGenerateModal(false);
        }
    } catch (err) {
        toast.error("Failed to generate plan");
    } finally {
        setGenerating(false);
    }
  };

  const typeConfig: Record<string, { color: string, label: string }> = {
    'Full Length Mock': { color: "bg-red-100 text-red-700", label: "Mock Test" },
    'Review Concepts': { color: "bg-blue-100 text-blue-700", label: "Revision" },
    'Sectional Mock': { color: "bg-purple-100 text-purple-700", label: "Sectional Mock" },
    'Previous Year Questions': { color: "bg-emerald-100 text-emerald-700", label: "Practice" },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ListTodo className="h-6 w-6 text-primary" />
                  Study Plans
                </h1>
                <p className="text-sm text-slate-500 mt-1">Structured plans dynamically generated to reach your goals</p>
              </div>
              <Button 
                className="h-10 px-5 rounded-xl font-bold bg-primary shadow-sm shadow-primary/20 flex items-center gap-2"
                onClick={() => setShowGenerateModal(true)}
              >
                <Sparkles className="h-4 w-4" />
                Generate AI Plan
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Active Plans", value: generatedPlan ? 1 : 0, icon: Target, color: "text-primary bg-primary/10" },
                { label: "Tasks Today", value: generatedPlan ? 1 : 0, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                { label: "Streak Days", value: 3, icon: Zap, color: "text-orange-500 bg-orange-50" },
                { label: "Study Hours", value: "12", icon: Clock, color: "text-blue-600 bg-blue-50" },
              ].map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm bg-white rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${stat.color} shrink-0`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900 leading-none mt-0.5">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Plans List */}
            {loading ? (
              <div className="py-24 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading your study profile...</p>
              </div>
            ) : !generatedPlan ? (
              <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-2 bg-gradient-to-r from-primary via-accent to-orange-400" />
                  <div className="p-12 text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto shadow-sm">
                      <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2 max-w-sm mx-auto">
                      <h3 className="text-xl font-bold text-slate-900">No Study Plans Yet</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        AI-powered personalized study plans help you stay on track for your target exam with daily tasks, revision cycles, and mock test schedules. Let's create one now!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-6">
                      {[
                        { icon: Sparkles, title: "AI-Generated", desc: "Smart plans targeting your weakest sections", color: "from-purple-50 to-indigo-50 text-purple-600" },
                        { icon: Calendar, title: "Daily Schedule", desc: "Structured daily tasks with interspersed revisions", color: "from-blue-50 to-cyan-50 text-blue-600" },
                        { icon: TrendingUp, title: "Progress Tracking", desc: "Streak monitoring to keep you consistently accountable", color: "from-emerald-50 to-teal-50 text-emerald-600" },
                      ].map((f) => (
                        <div key={f.title} className={`rounded-2xl bg-gradient-to-br ${f.color} p-4 text-left space-y-2`}>
                          <f.icon className={`h-5 w-5`} />
                          <p className="text-sm font-bold text-slate-800">{f.title}</p>
                          <p className="text-xs text-slate-500 leading-snug">{f.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6">
                      <Button onClick={() => setShowGenerateModal(true)} className="h-11 px-6 rounded-full font-bold bg-primary uppercase text-xs tracking-wider">
                        Generate Your First Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                  <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary to-accent" />
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900">{generatedPlan.title}</CardTitle>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Target className="h-3 w-3" /> {generatedPlan.targetExam}
                            <span className="w-px h-3 bg-slate-200 mx-1" />
                            <Calendar className="h-3 w-3" /> {new Date(generatedPlan.startDate).toLocaleDateString()} → {new Date(generatedPlan.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-primary/10 text-primary text-[10px] font-bold border-none shrink-0">
                          {generatedPlan.progress}% done
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-4 space-y-4">
                      
                      <div className="flex items-center gap-3">
                        <Progress value={generatedPlan.progress} className="h-2 flex-1" />
                        <span className="text-xs font-bold text-slate-500">Day 1 of {generatedPlan.tasks.length}</span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" /> Daily Schedule
                        </h4>
                        
                        {generatedPlan.tasks.map((task: StudyTask) => {
                          const conf = typeConfig[task.taskType] || typeConfig['Review Concepts'];
                          return (
                          <div key={task.day} className={`flex items-center gap-3 p-3 rounded-xl ${task.completed ? "bg-slate-50 opacity-60" : "bg-white border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer"}`}>
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Day</span>
                              <span className="text-sm font-extrabold text-slate-700">{task.day}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
                            </div>
                            
                            <Badge className={`text-[10px] font-bold border-none ${conf.color}`}>
                              {conf.label}
                            </Badge>
                            
                            <Button variant="ghost" size="sm" className="h-8 rounded-full ml-2">
                               {task.taskType.includes("Mock") ? "Attempt Now" : "Mark Done"}
                            </Button>
                          </div>
                        )})}
                      </div>
                    </CardContent>
                  </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="sm:max-w-[420px] bg-white">
          <DialogHeader>
            <DialogTitle>Generate AI Study Plan</DialogTitle>
            <DialogDescription>
              Select the duration for your sprint. AI will create a day-wise mock test & revision schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Duration (Days)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="7">7 Days Sprint</SelectItem>
                  <SelectItem value="15">15 Days Plan</SelectItem>
                  <SelectItem value="30">30 Days Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateModal(false)} disabled={generating}>
              Cancel
            </Button>
            <Button className="bg-primary flex items-center gap-2 font-bold" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating Plan..." : "Generate AI Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Bot(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
}
