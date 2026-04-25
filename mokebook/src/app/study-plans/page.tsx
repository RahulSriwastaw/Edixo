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
  Bot,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [duration, setDuration] = useState("15");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
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

  const typeConfig: Record<string, { bg: string, text: string, label: string }> = {
    'Full Length Mock': { bg: "var(--badge-error-bg)", text: "var(--badge-error-text)", label: "Mock Test" },
    'Review Concepts': { bg: "var(--badge-info-bg)", text: "var(--badge-info-text)", label: "Revision" },
    'Sectional Mock': { bg: "var(--badge-info-bg)", text: "var(--badge-info-text)", label: "Sectional Mock" },
    'Previous Year Questions': { bg: "var(--badge-success-bg)", text: "var(--badge-success-text)", label: "Practice" },
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[20px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <ListTodo className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                  Study Plans
                </h1>
                <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>Structured plans dynamically generated to reach your goals</p>
              </div>
              <Button
                className="h-9 px-5 rounded-lg font-bold flex items-center gap-2"
                onClick={() => setShowGenerateModal(true)}
              >
                <Sparkles className="h-4 w-4" />
                Generate AI Plan
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Active Plans", value: generatedPlan ? 1 : 0, icon: Target, color: "text-[#FF6B2B]" },
                { label: "Tasks Today", value: generatedPlan ? 1 : 0, icon: CheckCircle2, color: "text-[var(--badge-success-text)]" },
                { label: "Streak Days", value: 3, icon: Zap, color: "text-[#FF6B2B]" },
                { label: "Study Hours", value: "12", icon: Clock, color: "text-[var(--badge-info-text)]" },
              ].map((stat) => (
                <Card key={stat.label} className="card-hover">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="p-2 rounded-lg shrink-0" style={{ background: "var(--bg-main)" }}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                      <p className="text-xl font-bold leading-none mt-0.5" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Plans List */}
            {loading ? (
              <div className="py-24 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: "#FF6B2B" }} />
                <p className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Loading your study profile...</p>
              </div>
            ) : !generatedPlan ? (
              <Card className="rounded-lg overflow-hidden card-hover">
                <CardContent className="p-0">
                  <div className="h-1" style={{ background: "#FF6B2B" }} />
                  <div className="p-12 text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto" style={{ background: "rgba(255,107,43,0.08)" }}>
                      <Bot className="h-10 w-10" style={{ color: "#FF6B2B" }} />
                    </div>
                    <div className="space-y-2 max-w-sm mx-auto">
                      <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>No Study Plans Yet</h3>
                      <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        AI-powered personalized study plans help you stay on track for your target exam with daily tasks, revision cycles, and mock test schedules. Let's create one now!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-6">
                      {[
                        { icon: Sparkles, title: "AI-Generated", desc: "Smart plans targeting your weakest sections" },
                        { icon: Calendar, title: "Daily Schedule", desc: "Structured daily tasks with interspersed revisions" },
                        { icon: TrendingUp, title: "Progress Tracking", desc: "Streak monitoring to keep you consistently accountable" },
                      ].map((f) => (
                        <div key={f.title} className="rounded-lg p-4 text-left space-y-2" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                          <f.icon className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                          <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{f.title}</p>
                          <p className="text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6">
                      <Button onClick={() => setShowGenerateModal(true)} className="h-9 px-6 rounded-full font-bold text-[11px] uppercase tracking-wider">
                        Generate Your First Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="rounded-lg overflow-hidden card-hover">
                  <div className="h-1" style={{ background: "#FF6B2B" }} />
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">{generatedPlan.title}</CardTitle>
                        <p className="text-[11px] mt-0.5 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                          <Target className="h-3 w-3" /> {generatedPlan.targetExam}
                          <span className="w-px h-3 mx-1" style={{ background: "var(--divider)" }} />
                          <Calendar className="h-3 w-3" /> {new Date(generatedPlan.startDate).toLocaleDateString()} → {new Date(generatedPlan.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="text-[10px] font-bold border-none shrink-0" style={{ background: "rgba(255,107,43,0.08)", color: "#FF6B2B" }}>
                        {generatedPlan.progress}% done
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-4 space-y-4">

                    <div className="flex items-center gap-3">
                      <Progress value={generatedPlan.progress} className="h-2 flex-1" />
                      <span className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>Day 1 of {generatedPlan.tasks.length}</span>
                    </div>

                    <div className="space-y-2 mt-4">
                      <h4 className="text-[13px] font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Target className="w-4 h-4" style={{ color: "#FF6B2B" }} /> Daily Schedule
                      </h4>

                      {generatedPlan.tasks.map((task: StudyTask) => {
                        const conf = typeConfig[task.taskType] || typeConfig['Review Concepts'];
                        return (
                          <div key={task.day} className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                            style={{
                              background: task.completed ? "var(--bg-main)" : "var(--bg-card)",
                              border: task.completed ? "none" : "var(--border-card)",
                              opacity: task.completed ? 0.6 : 1,
                            }}
                          >
                            <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0" style={{ background: "var(--bg-main)" }}>
                              <span className="text-[10px] uppercase font-bold" style={{ color: "var(--text-muted)" }}>Day</span>
                              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{task.day}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] font-semibold truncate ${task.completed ? "line-through" : ""}`} style={{ color: task.completed ? "var(--text-muted)" : "var(--text-primary)" }}>
                                {task.title}
                              </p>
                              <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{task.description}</p>
                            </div>

                            <Badge className="text-[10px] font-bold border-none" style={{ background: conf.bg, color: conf.text }}>
                              {conf.label}
                            </Badge>

                            <Button variant="ghost" size="sm" className="h-8 rounded-full ml-2 text-[11px]">
                              {task.taskType.includes("Mock") ? "Attempt Now" : "Mark Done"}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="sm:max-w-[420px]" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--text-primary)" }}>Generate AI Study Plan</DialogTitle>
            <DialogDescription style={{ color: "var(--text-muted)" }}>
              Select the duration for your sprint. AI will create a day-wise mock test & revision schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>Duration (Days)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-9 rounded-lg" style={{ background: "var(--bg-input)", border: "var(--border-input)" }}>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <SelectItem value="7">7 Days Sprint</SelectItem>
                  <SelectItem value="15">15 Days Plan</SelectItem>
                  <SelectItem value="30">30 Days Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateModal(false)} disabled={generating} className="rounded-lg h-8 text-[12px]">
              Cancel
            </Button>
            <Button className="rounded-lg h-8 text-[12px] font-bold flex items-center gap-2" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating Plan..." : "Generate AI Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
