"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Search,
  Target,
  Zap,
  ArrowRight,
  BookOpen,
  Flame,
  Trophy,
  ChevronRight,
  BrainCircuit,
  Calculator,
  Globe,
  Star,
  ArrowLeft,
  LayoutGrid,
  FileSearch
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const examCategories = [
  { id: "ssc", name: "SSC Exams", desc: "CGL, CHSL, MTS, GD", icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", target: "2025-26" },
  { id: "railway", name: "Railway", desc: "RRB NTPC, Group D, ALP", icon: Target, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", target: "2025" },
  { id: "banking", name: "Banking", desc: "IBPS, SBI, RBI Grade B", icon: Calculator, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", target: "2025" },
  { id: "jee", name: "JEE & NEET", desc: "IIT Entrance, Medical", icon: BrainCircuit, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", target: "2026" },
  { id: "upsc", name: "UPSC/State PSC", desc: "Civil Services, CDS", icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", target: "2025" },
  { id: "teaching", name: "Teaching", desc: "CTET, KVS, State TET", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", target: "2025" },
];

const subjects = [
  { id: "gk", name: "General Knowledge", icon: Globe },
  { id: "quant", name: "Quant Aptitude", icon: Calculator },
  { id: "reasoning", name: "Logical Reasoning", icon: BrainCircuit },
  { id: "science", name: "General Science", icon: Zap },
  { id: "english", name: "English Language", icon: BookOpen },
];

const suggestedChapters = [
  { id: "c1", name: "Trigonometric Ratios", questions: 250, mastery: 42, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "c2", name: "Laws of Motion", questions: 120, mastery: 65, icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
  { id: "c3", name: "Indian Constitution", questions: 310, mastery: 15, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
];

export default function PracticePage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState("quant");
  const [searchQuery, setSearchQuery] = useState("");
  const [examSearch, setExamSearch] = useState("");

  const filteredExams = examCategories.filter(exam =>
    exam.name.toLowerCase().includes(examSearch.toLowerCase()) ||
    exam.desc.toLowerCase().includes(examSearch.toLowerCase())
  );

  // ── EXAM SELECTOR ────────────────────────────────────
  if (!selectedExam) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-white overflow-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
            <div className="max-w-5xl mx-auto space-y-8">
              <header className="text-center space-y-4 pt-4 md:pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-bold uppercase tracking-widest">
                  <Star className="h-3.5 w-3.5 fill-primary" /> Select Your Target Exam
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Start Your <span className="text-primary italic">Practice Drills</span>
                  </h1>
                  <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                    Choose a category to unlock topic-wise mastery and AI-curated question banks.
                  </p>
                </div>
                <div className="relative max-w-sm mx-auto pt-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search exams (SSC, JEE, IBPS)..."
                    className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 hover:border-slate-300 text-sm"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                  />
                </div>
              </header>

              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {filteredExams.map((exam) => (
                    <Card
                      key={exam.id}
                      className="group border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer rounded-2xl overflow-hidden bg-white card-hover transition-all duration-200"
                      onClick={() => setSelectedExam(exam.id)}
                    >
                      <CardContent className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 group-hover:shadow-lg duration-200 border", exam.bg, exam.border)}>
                            <exam.icon className={cn("h-5 w-5", exam.color)} />
                          </div>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                            TARGET {exam.target}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{exam.name}</h3>
                          <p className="text-xs text-slate-400 font-medium">{exam.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-primary">Explore</span>
                          <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                    <FileSearch className="h-7 w-7 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">No matches for "{examSearch}"</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Try a different keyword</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 text-sm" onClick={() => setExamSearch("")}>
                    Reset Search
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-800">New Exams Added Weekly</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Don't see yours? Request a new category.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl h-9 text-sm font-semibold px-5 border-slate-200">
                  Request Exam
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── PRACTICE HUB ───────────────────────────────────
  const selectedExamData = examCategories.find(e => e.id === selectedExam);

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedExam(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" /> Change Target
                </button>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-slate-900">
                    Practice Hub: <span className="text-primary">{selectedExamData?.name}</span>
                  </h1>
                  <Badge className="bg-emerald-500 text-white text-[10px] font-bold h-5 px-2 rounded-lg">LIVE</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl">
                  <Flame className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-xs font-bold text-primary">18 Days</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold">1.2k XP</span>
                </div>
              </div>
            </header>

            {/* High Weightage Chapters */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">High Weightage Chapters</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestedChapters.map((chap) => (
                  <Card key={chap.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group card-hover">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className={cn("p-2.5 rounded-xl", chap.bg)}>
                          <chap.icon className={cn("h-5 w-5", chap.color)} />
                        </div>
                        <Badge variant="secondary" className="bg-slate-50 text-slate-400 text-[10px] font-bold h-5 rounded-lg">{chap.questions} Qs</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{chap.name}</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Mastery</span>
                            <span className="text-primary">{chap.mastery}%</span>
                          </div>
                          <Progress value={chap.mastery} className="h-1.5 bg-slate-100" />
                        </div>
                      </div>
                      <Button className="w-full h-9 rounded-xl bg-slate-900 hover:bg-primary text-white font-bold text-sm transition-colors" asChild>
                        <Link href={`/practice/session/${chap.id}`}>Start Drill</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Subject Explorer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Subject sidebar */}
              <aside className="lg:col-span-3 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="h-4 w-4 text-slate-400" />
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subjects</h2>
                </div>
                <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubject(sub.id)}
                      className={cn(
                        "flex-shrink-0 lg:w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap",
                        activeSubject === sub.id
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <sub.icon className={cn("h-4 w-4", activeSubject === sub.id ? "text-white" : "text-slate-400")} />
                        {sub.name}
                      </div>
                      <ChevronRight className={cn("h-3.5 w-3.5 hidden lg:block", activeSubject === sub.id ? "text-white/70" : "text-slate-300")} />
                    </button>
                  ))}
                </div>
              </aside>

              {/* Chapter grid */}
              <div className="lg:col-span-9 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={`Search in ${subjects.find(s => s.id === activeSubject)?.name}...`}
                    className="pl-10 h-11 bg-white border-slate-100 rounded-xl focus-visible:ring-primary shadow-sm text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border-none shadow-sm rounded-xl bg-white hover:shadow-md transition-all group cursor-pointer card-hover">
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                            <BookOpen className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">Chapter Name {i}</h4>
                            <p className="text-xs text-slate-400 font-medium">42 Questions</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[10px] font-bold text-slate-400 h-5 px-2 shrink-0">BEGINNER</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Cross-Exam Drills */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Cross-Exam Drills</h2>
                <Button variant="link" className="text-xs font-bold text-primary h-auto p-0">View All</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Banking", "UPSC", "GATE", "CUET"].map((ex) => (
                  <Card key={ex} className="border border-dashed border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer rounded-xl">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Target className="h-5 w-5 text-slate-300" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{ex} Practice</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}