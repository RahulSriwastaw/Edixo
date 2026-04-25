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
  { id: "ssc", name: "SSC Exams", desc: "CGL, CHSL, MTS, GD", icon: Zap, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", border: "border-[rgba(255,107,43,0.15)]", target: "2025-26" },
  { id: "railway", name: "Railway", desc: "RRB NTPC, Group D, ALP", icon: Target, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", border: "border-[rgba(255,107,43,0.15)]", target: "2025" },
  { id: "banking", name: "Banking", desc: "IBPS, SBI, RBI Grade B", icon: Calculator, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", border: "border-[rgba(255,107,43,0.15)]", target: "2025" },
  { id: "jee", name: "JEE & NEET", desc: "IIT Entrance, Medical", icon: BrainCircuit, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", border: "border-[rgba(255,107,43,0.15)]", target: "2026" },
  { id: "upsc", name: "UPSC/State PSC", desc: "Civil Services, CDS", icon: Globe, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", border: "border-[rgba(255,107,43,0.15)]", target: "2025" },
  { id: "teaching", name: "Teaching", desc: "CTET, KVS, State TET", icon: BookOpen, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", border: "border-[rgba(255,107,43,0.15)]", target: "2025" },
];

const subjects = [
  { id: "gk", name: "General Knowledge", icon: Globe },
  { id: "quant", name: "Quant Aptitude", icon: Calculator },
  { id: "reasoning", name: "Logical Reasoning", icon: BrainCircuit },
  { id: "science", name: "General Science", icon: Zap },
  { id: "english", name: "English Language", icon: BookOpen },
];

const suggestedChapters = [
  { id: "c1", name: "Trigonometric Ratios", questions: 250, mastery: 42, icon: Target, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]" },
  { id: "c2", name: "Laws of Motion", questions: 120, mastery: 65, icon: Zap, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]" },
  { id: "c3", name: "Indian Constitution", questions: 310, mastery: 15, icon: Globe, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]" },
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
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
            <div className="max-w-5xl mx-auto space-y-8">
              <header className="text-center space-y-4 pt-4 md:pt-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.8px]"
                  style={{ background: "rgba(255,107,43,0.08)", border: "1px solid rgba(255,107,43,0.15)", color: "#FF6B2B" }}
                >
                  <Star className="h-3.5 w-3.5" /> Select Your Target Exam
                </div>
                <div className="space-y-3">
                  <h1 className="text-[20px] md:text-[24px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    Start Your <span style={{ color: "#FF6B2B" }}>Practice Drills</span>
                  </h1>
                  <p className="text-[13px] max-w-md mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Choose a category to unlock topic-wise mastery and AI-curated question banks.
                  </p>
                </div>
                <div className="relative max-w-sm mx-auto pt-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <Input
                    placeholder="Search exams (SSC, JEE, IBPS)..."
                    className="pl-10 h-9 rounded-lg transition-all text-[12px]"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                  />
                </div>
              </header>

              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredExams.map((exam) => (
                    <Card
                      key={exam.id}
                      className="group cursor-pointer rounded-lg overflow-hidden card-hover"
                      onClick={() => setSelectedExam(exam.id)}
                    >
                      <CardContent className="p-3.5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 border", exam.bg, exam.border)}>
                            <exam.icon className={cn("h-4 w-4", exam.color)} />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            TARGET {exam.target}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-[13px] font-bold group-hover:text-[#FF6B2B] transition-colors" style={{ color: "var(--text-primary)" }}>{exam.name}</h3>
                          <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>{exam.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold" style={{ color: "#FF6B2B" }}>Explore</span>
                          <ArrowRight className="h-4 w-4 text-[#FF6B2B] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto" style={{ background: "var(--bg-main)", border: "var(--border-card)" }}>
                    <FileSearch className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>No matches for "{examSearch}"</h3>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Try a different keyword</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg h-8 text-[12px]" onClick={() => setExamSearch("")}>
                    Reset Search
                  </Button>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "var(--divider)" }}>
                <div className="text-center sm:text-left">
                  <h4 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>New Exams Added Weekly</h4>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Don't see yours? Request a new category.</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg h-8 text-[12px] font-semibold px-5"
                  style={{ borderColor: "var(--btn-secondary-border)", color: "var(--btn-secondary-text)" }}
                >
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
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
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.8px] transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ArrowLeft className="h-3 w-3" /> Change Target
                </button>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[18px] font-bold">
                    Practice Hub: <span style={{ color: "#FF6B2B" }}>{selectedExamData?.name}</span>
                  </h1>
                  <Badge variant="success" className="text-[10px] font-bold h-5 px-2 rounded-full">LIVE</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,107,43,0.08)", border: "1px solid rgba(255,107,43,0.15)" }}
                >
                  <Flame className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                  <span className="text-[11px] font-bold" style={{ color: "#FF6B2B" }}>18 Days</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
                >
                  <Trophy className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                  <span className="text-[11px] font-bold">1.2k XP</span>
                </div>
              </div>
            </header>

            {/* High Weightage Chapters */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: "#FF6B2B" }} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>High Weightage Chapters</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestedChapters.map((chap) => (
                  <Card key={chap.id} className="group card-hover">
                    <CardContent className="p-3.5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className={cn("p-2 rounded-lg", chap.bg)}>
                          <chap.icon className={cn("h-4 w-4", chap.color)} />
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold h-5 rounded-full">{chap.questions} Qs</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-[13px] font-bold group-hover:text-[#FF6B2B] transition-colors" style={{ color: "var(--text-primary)" }}>{chap.name}</h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span style={{ color: "var(--text-muted)" }}>Mastery</span>
                            <span style={{ color: "#FF6B2B" }}>{chap.mastery}%</span>
                          </div>
                          <Progress value={chap.mastery} className="h-1.5" style={{ background: "var(--bg-main)" }} />
                        </div>
                      </div>
                      <Button className="w-full h-8 rounded-lg text-[12px] font-bold transition-colors" asChild>
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
                  <LayoutGrid className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Subjects</h2>
                </div>
                <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubject(sub.id)}
                      className={cn(
                        "flex-shrink-0 lg:w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-semibold transition-all text-left whitespace-nowrap",
                        activeSubject === sub.id
                          ? "text-white"
                          : "hover:opacity-80"
                      )}
                      style={{
                        background: activeSubject === sub.id ? "#FF6B2B" : "var(--bg-card)",
                        color: activeSubject === sub.id ? "#FFFFFF" : "var(--text-secondary)",
                        border: activeSubject === sub.id ? "none" : "var(--border-card)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <sub.icon className={cn("h-4 w-4", activeSubject === sub.id ? "text-white" : "text-[var(--text-muted)]")} />
                        {sub.name}
                      </div>
                      <ChevronRight className={cn("h-3.5 w-3.5 hidden lg:block", activeSubject === sub.id ? "text-white/70" : "text-[var(--text-muted)]")} />
                    </button>
                  ))}
                </div>
              </aside>

              {/* Chapter grid */}
              <div className="lg:col-span-9 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <Input
                    placeholder={`Search in ${subjects.find(s => s.id === activeSubject)?.name}...`}
                    className="pl-10 h-9 rounded-lg text-[12px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="group cursor-pointer card-hover">
                      <CardContent className="p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
                            style={{ background: "var(--bg-main)", border: "var(--border-card)" }}
                          >
                            <BookOpen className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[13px] font-bold truncate group-hover:text-[#FF6B2B] transition-colors" style={{ color: "var(--text-primary)" }}>Chapter Name {i}</h4>
                            <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>42 Questions</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold h-5 px-2 shrink-0">BEGINNER</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Cross-Exam Drills */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Cross-Exam Drills</h2>
                <Button variant="link" className="text-[11px] font-bold h-auto p-0" style={{ color: "#FF6B2B" }}>View All</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Banking", "UPSC", "GATE", "CUET"].map((ex) => (
                  <Card key={ex} className="border-dashed cursor-pointer rounded-lg card-hover"
                    style={{ borderColor: "var(--border-input)" }}
                  >
                    <CardContent className="p-3 flex flex-col items-center text-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-main)" }}>
                        <Target className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: "var(--text-secondary)" }}>{ex} Practice</span>
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
