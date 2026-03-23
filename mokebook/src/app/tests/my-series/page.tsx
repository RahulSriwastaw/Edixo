"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Loader2, BookOpen, BarChart3, Clock, CheckCircle2,
  Trophy, ArrowRight, PlayCircle, RotateCcw, Search,
  ChevronRight, Calendar, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttemptSummary {
  id: string;
  testId: string;
  testName: string;
  score: number;
  totalMarks: number;
  rank?: number;
  percentile: number;
  attempted: number;
  submittedAt?: string;
  attemptNumber: number;
  status: string;
}

/** ═══════════════════════════════════════════════
 * SUB-COMPONENTS
 * ═══════════════════════════════════════════════ */

/** 1. Attempt History Card (Horizontal/Professional) */
function AttemptHistoryCard({ attempt }: { attempt: AttemptSummary }) {
  const router = useRouter();
  const scorePct = attempt.totalMarks ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
  
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Info & Metrics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-50 text-[#1a73e8] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">PRC</span>
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {attempt.submittedAt && new Date(attempt.submittedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
            </span>
          </div>
          
          <h3 className="text-[15px] font-black text-[#0f1b2d] leading-tight mb-3 group-hover:text-[#1a73e8] transition-colors truncate">
            {attempt.testName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-1.5">
               <div className="bg-purple-50 p-1 rounded-md">
                 <Trophy className="h-3.5 w-3.5 text-purple-600" />
               </div>
               <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Your Rank</p>
                 <p className="text-[13px] font-black text-[#0f1b2d] leading-none">#{attempt.rank || "-"}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-1.5">
               <div className="bg-emerald-50 p-1 rounded-md">
                 <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
               </div>
               <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Your Score</p>
                 <p className="text-[13px] font-black text-[#0f1b2d] leading-none">{attempt.score?.toFixed(2)}<span className="text-slate-400 text-[10px]"> / {attempt.totalMarks}</span></p>
               </div>
            </div>

            <div className="flex items-center gap-1.5">
               <div className="bg-blue-50 p-1 rounded-md">
                 <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
               </div>
               <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Percentile</p>
                 <p className="text-[13px] font-black text-[#0f1b2d] leading-none">{attempt.percentile ? `${attempt.percentile}%` : "-"}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row md:flex-col items-center gap-2 shrink-0">
          <div className="flex gap-2 w-full">
            <button
              onClick={() => router.push(`/tests/solutions/${attempt.id}`)}
              className="flex-1 md:w-28 h-9 border-2 border-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-lg hover:border-[#1a73e8] hover:text-[#1a73e8] transition-all"
            >
              Solution
            </button>
            <button
              onClick={() => router.push(`/tests/results/${attempt.id}`)}
              className="flex-1 md:w-28 h-9 border-2 border-[#1a73e8] text-[#1a73e8] text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-50 transition-all"
            >
              Analysis
            </button>
          </div>
          
          <button
            onClick={() => router.push(`/tests/instructions/${attempt.testId}`)}
            className="hidden md:flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-400 hover:text-[#1a73e8] uppercase tracking-widest mt-1 ml-auto transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reattempt
          </button>
        </div>
      </div>
    </div>
  );
}

/** ═══════════════════════════════════════════════
 * MAIN PAGE COMPONENT
 * ═══════════════════════════════════════════════ */

export default function MySeriesPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"tests" | "quizzes">("tests");

  useEffect(() => {
    async function fetchAttempts() {
      try {
        setLoading(true);
        const res = await apiFetch("/mockbook/user/my-attempts");
        setAttempts(res.data || []);
      } catch (err) {
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAttempts();
  }, []);

  const filtered = attempts.filter(a =>
    !search || (a.testName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Grouping by Month logic
  const groupAttemptsByMonth = (items: AttemptSummary[]) => {
    const groups: Record<string, AttemptSummary[]> = {};
    items
      .filter(a => a.status === "SUBMITTED")
      .forEach(a => {
        const date = a.submittedAt ? new Date(a.submittedAt) : new Date();
        const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(a);
      });
    return groups;
  };

  const groupedAttempts = groupAttemptsByMonth(filtered);
  const inProgressAttempts = filtered.filter(a => a.status === "IN_PROGRESS");

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F8] text-[#0f1b2d] font-sans antialiased">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">
          
          {/* 1. COMPACT PAGE HEADER */}
          <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
             <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-[20px] font-black tracking-tight leading-none mb-2">Your Attempted Tests & Quizzes</h1>
                    <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <Link href="/" className="hover:text-[#1a73e8] transition-colors">Home</Link>
                       <ChevronRight className="h-3 w-3" />
                       <span className="text-slate-600">Attempted Tests</span>
                    </nav>
                  </div>
                  
                  <div className="relative group min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#1a73e8] transition-colors" />
                    <input
                      placeholder="Search your tests..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:outline-none focus:border-[#1a73e8] transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                
                {/* TABS BAR */}
                <div className="flex gap-8 mt-6 -mb-6 border-b border-transparent relative">
                   <button 
                    onClick={() => setActiveTab("tests")}
                    className={cn(
                      "pb-2 text-[13px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === "tests" ? "text-[#1a73e8]" : "text-slate-400 hover:text-slate-600"
                    )}
                   >
                     Tests
                     {activeTab === "tests" && (
                       <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a73e8] rounded-full" />
                     )}
                   </button>
                   <button 
                    onClick={() => setActiveTab("quizzes")}
                    className={cn(
                      "pb-2 text-[13px] font-black uppercase tracking-widest transition-all relative",
                      activeTab === "quizzes" ? "text-[#1a73e8]" : "text-slate-400 hover:text-slate-600"
                    )}
                   >
                     Quizzes
                     {activeTab === "quizzes" && (
                       <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a73e8] rounded-full" />
                     )}
                   </button>
                </div>
             </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
            
            {loading ? (
               <div className="flex flex-col items-center justify-center py-24 space-y-4">
                 <Loader2 className="h-10 w-10 animate-spin text-[#1a73e8] opacity-20" />
                 <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Loading History...</p>
               </div>
            ) : attempts.length === 0 ? (
               <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 max-w-sm mx-auto">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-8 w-8 text-slate-200" />
                 </div>
                 <p className="text-sm font-black text-slate-600">No tests attempted yet!</p>
                 <Link href="/tests" className="inline-flex h-10 px-6 bg-[#1a73e8] text-white rounded-lg items-center justify-center text-[12px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all">
                   Explore Tests
                 </Link>
               </div>
            ) : (
               <>
                 {/* 2. IN-PROGRESS ATTEMPTS */}
                 {inProgressAttempts.length > 0 && (
                    <section>
                       <div className="flex items-center gap-3 mb-4">
                          <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center">
                            <PlayCircle className="h-5 w-5 text-amber-500" />
                          </div>
                          <h2 className="text-[14px] font-black text-slate-700 uppercase tracking-widest">Resume Learning ({inProgressAttempts.length})</h2>
                       </div>
                       <div className="space-y-3">
                          {inProgressAttempts.map(att => (
                            <div key={att.id} className="bg-white rounded-xl border border-amber-100 p-3.5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                               <div className="min-w-0">
                                  <h3 className="text-[14px] font-black text-slate-800 line-clamp-1 mb-1">{att.testName}</h3>
                                  <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 uppercase tracking-tight">
                                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
                                     Ready to resume
                                  </p>
                               </div>
                               <button 
                                onClick={() => router.push(`/tests/instructions/${att.testId}`)}
                                className="h-8 px-4 bg-amber-500 text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm"
                               >
                                  Resume
                               </button>
                            </div>
                          ))}
                       </div>
                    </section>
                 )}

                 {/* 3. ATTEMPT HISTORY GROUPED BY MONTH */}
                 <div className="space-y-12">
                   {Object.keys(groupedAttempts).map(monthYear => (
                      <section key={monthYear}>
                        <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-2">
                           <h2 className="text-[15px] font-black text-slate-800">{monthYear}</h2>
                           <Filter className="h-4 w-4 text-slate-300 cursor-pointer hover:text-slate-500 transition-colors" />
                        </div>
                        <div className="space-y-4">
                           {groupedAttempts[monthYear].map(att => (
                             <AttemptHistoryCard key={att.id} attempt={att} />
                           ))}
                        </div>
                      </section>
                   ))}
                 </div>
               </>
            )}

          </div>
        </main>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}