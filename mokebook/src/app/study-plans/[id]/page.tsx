
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

    // Calculate completed days
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
      case "Watch": return <PlayCircle className="h-4 w-4 text-red-500" />;
      case "Read": return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "Practice": return <HelpCircle className="h-4 w-4 text-green-500" />;
      case "Quiz": return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
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

  // Date Logic for Calendar
  const planDates = useMemo(() => {
    if (!plan?.createdAt) return [];
    const startDate = plan.createdAt.toDate ? plan.createdAt.toDate() : new Date(plan.createdAt);
    return Array.from({ length: plan.totalDays || 7 }, (_, i) => addDays(startDate, i));
  }, [plan]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!plan || !currentDay) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Badge variant="outline" className="text-slate-400 border-slate-200">PLAN NOT FOUND</Badge>
          <Button className="rounded-xl h-10 px-6 font-bold bg-primary shadow-lg shadow-primary/20" onClick={() => router.push("/study-plans")}>Back to My Plans</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-0 p-3 md:p-6 space-y-6 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => router.back()} className="h-8 px-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" /> All Study Plans
              </Button>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="end">
                    <Calendar
                      mode="multiple"
                      selected={planDates}
                      className="rounded-2xl border-none"
                    />
                    <div className="p-3 border-t bg-slate-50 text-[10px] font-bold text-muted-foreground uppercase text-center rounded-b-2xl">
                      Plan Schedule: {format(planDates[0], "MMM d")} - {format(planDates[planDates.length - 1], "MMM d")}
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200" disabled={isManaging}>
                      {isManaging ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                    <DropdownMenuItem onClick={handleResetProgress} className="text-xs font-medium rounded-lg cursor-pointer">
                      <RotateCcw className="h-3.5 w-3.5 mr-2 text-blue-500" /> Reset Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleArchive} className="text-xs font-medium rounded-lg cursor-pointer">
                      <Archive className="h-3.5 w-3.5 mr-2 text-slate-500" /> Archive Plan
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-xs font-bold text-destructive rounded-lg cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Plan
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-headline font-bold text-slate-900">{plan.topic}</h1>
                  <Badge className="bg-primary text-white text-[10px] font-bold px-2.5 h-6 rounded-lg uppercase tracking-wider">{plan.status?.toUpperCase()}</Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
                  {plan.summary}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100 min-w-[90px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current</p>
                  <p className="text-xl font-bold text-slate-700">{plan.currentLevelPercentage}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChevronRight className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col items-center bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 min-w-[90px]">
                  <p className="text-[10px] font-bold text-white/70 uppercase">Target</p>
                  <p className="text-xl font-bold">{plan.targetLevelPercentage}%</p>
                </div>
              </div>
            </div>

            <div className="p-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mastery Progress</span>
                <span className="text-xs font-bold text-primary">{stats.percent}% Achieved</span>
              </div>
              <div className="p-1">
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: `${stats.percent}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Timeline Sidebar */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary fill-primary" /> Timeline
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
                          "w-full flex items-center justify-between p-4 rounded-[1.25rem] transition-all text-left group relative border-2",
                          isActive 
                            ? "bg-white border-primary shadow-md ring-4 ring-primary/5" 
                            : "bg-white border-transparent hover:border-slate-200"
                        )}
                      >
                        <div className="space-y-0.5">
                          <p className={cn("text-[10px] font-bold uppercase tracking-tight", isActive ? "text-primary" : "text-slate-400")}>Day {day.day}</p>
                          <p className="font-bold text-[13px] text-slate-700">Learning Block</p>
                        </div>
                        {isCompleted && (
                          <div className="bg-green-100 text-green-600 p-1 rounded-lg">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Tasks Main View */}
              <div className="lg:col-span-3 space-y-4">
                <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between bg-slate-50/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <CardTitle className="text-lg font-bold text-slate-800">Day {currentDay.day} Focus</CardTitle>
                      </div>
                      <CardDescription className="text-xs font-medium">
                        Complete these {currentDay.tasks.length} specific tasks to stay on track.
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{currentDay.tasks.filter((t: any) => t.status === 'completed').length}/{currentDay.tasks.length}</div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tasks Done</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {currentDay.tasks.map((task: any, idx: number) => {
                      const isDone = task.status === 'completed';
                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                            isDone ? "bg-slate-50/50 border-transparent opacity-75" : "bg-white border-slate-100 hover:border-primary/20 hover:shadow-sm"
                          )}
                          onClick={() => toggleTask(selectedDayIdx, idx)}
                        >
                          <Checkbox 
                            checked={isDone} 
                            className="h-5 w-5 rounded-lg border-slate-300"
                          />
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getIcon(task.type)}
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{task.type}</span>
                              </div>
                              <p className={cn("text-sm md:text-base font-bold text-slate-700 transition-all", isDone && "line-through text-slate-400")}>
                                {task.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-center">
                              <Clock className="h-3.5 w-3.5" /> {task.duration}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Day Summary Action */}
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                  <div className="space-y-2 relative z-10 text-center sm:text-left">
                    <h3 className="text-xl font-headline font-bold">Ready for the Quiz?</h3>
                    <p className="text-white/60 text-sm max-w-[340px] leading-relaxed">
                      Verify your learning for Day {currentDay.day} with a focused 10-minute assessment.
                    </p>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-10 text-sm rounded-2xl shadow-xl shadow-primary/30 relative z-10 group-hover:scale-105 transition-all">
                    Start Assessment <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                  <div className="absolute -left-10 -top-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All progress and tasks for this plan will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-2xl border-slate-100 bg-slate-50 text-slate-600 font-bold h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-bold h-11">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
