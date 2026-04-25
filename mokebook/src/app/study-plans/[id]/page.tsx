"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  BookOpen,
  HelpCircle,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Target,
  Sparkles,
  Zap,
  Calendar as CalendarIcon,
  MoreVertical,
  RotateCcw,
  Archive,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, isSameDay } from "date-fns";

export default function StudyPlanDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  const planRef = useMemoFirebase(() => {
    if (!db || !user || !id) return null;
    return doc(db, "users", user.uid, "study_plans", id as string);
  }, [db, user, id]);

  const { data: plan, isLoading } = useDoc(planRef);

  const toggleTask = (dayIdx: number, taskIdx: number) => {
    if (!plan || !planRef) return;

    const newDailyTasks = JSON.parse(JSON.stringify(plan.dailyTasks));
    const task = newDailyTasks[dayIdx].tasks[taskIdx];
    task.status = task.status === 'completed' ? 'pending' : 'completed';

    const completedDaysCount = newDailyTasks.filter((d: any) =>
      d.tasks.every((t: any) => t.status === 'completed')
    ).length;

    updateDoc(planRef, {
      dailyTasks: newDailyTasks,
      daysCompleted: completedDaysCount,
      updatedAt: serverTimestamp()
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: planRef.path,
        operation: 'update',
        requestResourceData: { dailyTasks: newDailyTasks }
      }));
    });
  };

  const handleResetProgress = async () => {
    if (!plan || !planRef) return;
    setIsManaging(true);

    const resetTasks = plan.dailyTasks.map((day: any) => ({
      ...day,
      tasks: day.tasks.map((task: any) => ({ ...task, status: 'pending' }))
    }));

    try {
      await updateDoc(planRef, {
        dailyTasks: resetTasks,
        daysCompleted: 0,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Progress Reset", description: "Your learning path has been reset." });
    } catch (err) {
      console.error(err);
    } finally {
      setIsManaging(false);
    }
  };

  const handleArchive = async () => {
    if (!plan || !planRef) return;
    setIsManaging(true);
    try {
      await updateDoc(planRef, {
        status: 'archived',
        updatedAt: serverTimestamp()
      });
      toast({ title: "Plan Archived", description: "The plan has been moved to archives." });
      router.push("/study-plans");
    } catch (err) {
      console.error(err);
    } finally {
      setIsManaging(false);
    }
  };

  const handleDelete = async () => {
    if (!planRef) return;
    setIsManaging(true);
    try {
      await deleteDoc(planRef);
      toast({ title: "Plan Deleted", description: "The study plan has been permanently removed." });
      router.push("/study-plans");
    } catch (err) {
      console.error(err);
    } finally {
      setIsManaging(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Watch": return <PlayCircle className="h-4 w-4" style={{ color: "var(--badge-error-text)" }} />;
      case "Read": return <BookOpen className="h-4 w-4" style={{ color: "var(--badge-info-text)" }} />;
      case "Practice": return <HelpCircle className="h-4 w-4" style={{ color: "var(--badge-success-text)" }} />;
      case "Quiz": return <CheckCircle2 className="h-4 w-4" style={{ color: "#FF6B2B" }} />;
      default: return <Clock className="h-4 w-4" style={{ color: "var(--text-muted)" }} />;
    }
  };

  const currentDay = useMemo(() => plan?.dailyTasks?.[selectedDayIdx], [plan, selectedDayIdx]);

  const stats = useMemo(() => {
    if (!plan) return { total: 0, completed: 0, percent: 0 };
    const allTasks = plan.dailyTasks.flatMap((d: any) => d.tasks);
    const completed = allTasks.filter((t: any) => t.status === 'completed').length;
    return {
      total: allTasks.length,
      completed,
      percent: Math.round((completed / allTasks.length) * 100)
    };
  }, [plan]);

  const planDates = useMemo(() => {
    if (!plan?.createdAt) return [];
    const startDate = plan.createdAt.toDate ? plan.createdAt.toDate() : new Date(plan.createdAt);
    return Array.from({ length: plan.totalDays || 7 }, (_, i) => addDays(startDate, i));
  }, [plan]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)" }}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: "#FF6B2B" }} />
        </div>
      </div>
    );
  }

  if (!plan || !currentDay) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)" }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Badge variant="outline" style={{ color: "var(--text-muted)", borderColor: "var(--border-card)" }}>PLAN NOT FOUND</Badge>
          <Button className="rounded-xl h-10 px-6 font-bold" onClick={() => router.push("/study-plans")}>Back to My Plans</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-0 p-3 md:p-5 space-y-4 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()} className="h-8 px-2 text-xs font-bold transition-colors" style={{ color: "var(--text-muted)" }}>
                <ArrowLeft className="h-4 w-4 mr-2" /> All Study Plans
              </Button>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" style={{ borderColor: "var(--btn-secondary-border)" }}>
                      <CalendarIcon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl" align="end" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                    <Calendar
                      mode="multiple"
                      selected={planDates}
                      className="rounded-xl border-none"
                    />
                    <div className="p-3 text-[10px] font-bold uppercase text-center rounded-b-xl" style={{ background: "var(--bg-main)", color: "var(--text-muted)", borderTop: "var(--divider)" }}>
                      Plan Schedule: {format(planDates[0], "MMM d")} - {format(planDates[planDates.length - 1], "MMM d")}
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" style={{ borderColor: "var(--btn-secondary-border)" }} disabled={isManaging}>
                      {isManaging ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                    <DropdownMenuItem onClick={handleResetProgress} className="text-xs font-medium rounded-lg cursor-pointer" style={{ color: "var(--text-primary)" }}>
                      <RotateCcw className="h-3.5 w-3.5 mr-2" style={{ color: "var(--badge-info-text)" }} /> Reset Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive} className="text-xs font-medium rounded-lg cursor-pointer" style={{ color: "var(--text-primary)" }}>
                      <Archive className="h-3.5 w-3.5 mr-2" style={{ color: "var(--text-muted)" }} /> Archive Plan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ background: "var(--divider)" }} />
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-xs font-bold rounded-lg cursor-pointer" style={{ color: "var(--badge-error-text)" }}>
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-[20px] md:text-2xl font-bold">{plan.topic}</h1>
                  <Badge className="text-[10px] font-bold h-6 px-2.5 rounded-lg uppercase tracking-wider" style={{ background: "#FF6B2B", color: "#fff" }}>{plan.status?.toUpperCase()}</Badge>
                </div>
                <p className="text-sm font-medium max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {plan.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-center p-3 rounded-xl min-w-[90px]" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Current</p>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{plan.currentLevelPercentage}%</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,107,43,0.08)" }}>
                  <ChevronRight className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl min-w-[90px]" style={{ background: "#FF6B2B", color: "#fff" }}>
                  <p className="text-[10px] font-bold uppercase opacity-70">Target</p>
                  <p className="text-xl font-bold">{plan.targetLevelPercentage}%</p>
                </div>
              </div>
            </div>

            <div className="p-1 rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "var(--divider)" }}>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Mastery Progress</span>
                <span className="text-xs font-bold" style={{ color: "#FF6B2B" }}>{stats.percent}% Achieved</span>
              </div>
              <div className="p-1">
                <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: "var(--bg-main)" }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%`, background: "#FF6B2B" }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Timeline Sidebar */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-widest px-1 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Zap className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} /> Timeline
                </h3>
                <div className="space-y-2">
                  {plan.dailyTasks.map((day: any, idx: number) => {
                    const isCompleted = day.tasks.every((t: any) => t.status === 'completed');
                    const isActive = selectedDayIdx === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDayIdx(idx)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg transition-all text-left group relative border",
                          isActive
                            ? "shadow-sm"
                            : "hover:opacity-80"
                        )}
                        style={{
                          background: isActive ? "var(--bg-card)" : "transparent",
                          borderColor: isActive ? "#FF6B2B" : "transparent",
                        }}
                      >
                        <div className="space-y-0.5">
                          <p className={cn("text-[10px] font-bold uppercase tracking-tight", isActive ? "" : "")} style={{ color: isActive ? "#FF6B2B" : "var(--text-muted)" }}>Day {day.day}</p>
                          <p className="font-bold text-[13px]" style={{ color: "var(--text-primary)" }}>Learning Block</p>
                        </div>
                        {isCompleted && (
                          <div className="p-1 rounded-lg" style={{ background: "var(--badge-success-bg)" }}>
                            <CheckCircle2 className="h-4 w-4" style={{ color: "var(--badge-success-text)" }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Tasks Main View */}
              <div className="lg:col-span-3 space-y-4">
                <Card className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <CardHeader className="p-4 flex flex-row items-center justify-between" style={{ borderBottom: "var(--divider)" }}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-pulse" style={{ color: "#FF6B2B" }} />
                        <CardTitle className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Day {currentDay.day} Focus</CardTitle>
                      </div>
                      <CardDescription className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        Complete these {currentDay.tasks.length} specific tasks to stay on track.
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: "#FF6B2B" }}>{currentDay.tasks.filter((t: any) => t.status === 'completed').length}/{currentDay.tasks.length}</div>
                      <p className="text-[10px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Tasks Done</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {currentDay.tasks.map((task: any, idx: number) => {
                      const isDone = task.status === 'completed';
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                            isDone ? "opacity-75" : ""
                          )}
                          style={{
                            background: isDone ? "var(--bg-main)" : "var(--bg-card)",
                            borderColor: isDone ? "transparent" : "var(--border-card)",
                          }}
                          onClick={() => toggleTask(selectedDayIdx, idx)}
                        >
                          <Checkbox
                            checked={isDone}
                            className="h-5 w-5 rounded-lg"
                          />
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getIcon(task.type)}
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{task.type}</span>
                              </div>
                              <p className={cn("text-sm md:text-base font-bold transition-all", isDone && "line-through")} style={{ color: isDone ? "var(--text-muted)" : "var(--text-primary)" }}>
                                {task.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-xl self-start sm:self-center" style={{ background: "var(--bg-main)", color: "var(--text-muted)" }}>
                              <Clock className="h-3.5 w-3.5" /> {task.duration}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Day Summary Action */}
                <div className="p-6 rounded-xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group" style={{ background: "#FF6B2B" }}>
                  <div className="space-y-2 relative z-10 text-center sm:text-left">
                    <h3 className="text-xl font-bold">Ready for the Quiz?</h3>
                    <p className="text-white/60 text-sm max-w-[340px] leading-relaxed">
                      Verify your learning for Day {currentDay.day} with a focused 10-minute assessment.
                    </p>
                  </div>
                  <Button className="font-bold h-12 px-10 text-sm rounded-xl relative z-10 transition-all" style={{ background: "var(--bg-card)", color: "#FF6B2B" }}>
                    Start Assessment <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(255,255,255,0.1)" }} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl max-w-sm" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "var(--text-primary)" }}>Delete Study Plan?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: "var(--text-muted)" }}>
              This action cannot be undone. All progress and tasks for this plan will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl font-bold h-10" style={{ background: "var(--bg-main)", color: "var(--text-secondary)", border: "var(--border-card)" }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl font-bold h-10 text-white" style={{ background: "var(--badge-error-text)" }}>
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
