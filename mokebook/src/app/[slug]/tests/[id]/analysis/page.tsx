"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, isAuthenticated } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  BarChart3,
  Loader2,
  AlertTriangle,
  Star,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export default function TestAnalysisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const testId = params?.id as string;
  const seriesSlug = params?.slug as string;
  const attemptNo = searchParams.get('attemptNo');

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [attemptData, setAttemptData] = useState<any>(null);
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?redirect=/${seriesSlug}/tests/${testId}/analysis`);
    }
  }, [router, seriesSlug, testId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated() || !testId) return;
      try {
        setLoading(true);

        // 1. Get all attempts for this test by current user
        const myAttRes = await apiFetch(`/mockbook/tests/${testId}/my-attempts`);
        const attempts = myAttRes.data || [];
        setAllAttempts(attempts);

        if (attempts.length === 0) {
           setLoading(false);
           return; 
        }

        // 2. Determine which attempt to show
        let targetAttempt = attempts[attempts.length - 1]; // default to latest
        if (attemptNo) {
           const num = parseInt(attemptNo);
           if (!isNaN(num) && num > 0 && num <= attempts.length) {
              targetAttempt = attempts[num - 1];
           }
        }

        // 3. Get detailed attempt analysis
        const attRes = await apiFetch(`/mockbook/attempts/${targetAttempt.id}`);
        setAttemptData(attRes.data || null);

        // 4. Get leaderboard
        const lbRes = await apiFetch(`/mockbook/${testId}/leaderboard`);
        setLeaderboard(lbRes.data || []);

      } catch (err) {
        console.error("Could not fetch attempt analysis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId, attemptNo]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Analysis...</p>
        </div>
      </div>
    );
  }

  if (!attemptData) {
      return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
               <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
               <h2 className="text-xl font-bold mb-2">No Analysis Available</h2>
               <p className="text-slate-500 mb-6 max-w-sm">You haven't completed any attempts for this test yet. Complete the test to see your performance analysis.</p>
               <button onClick={() => router.push(`/${seriesSlug}/tests/${testId}`)} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black">Attempt Now</button>
            </div>
        </div>
      );
  }

  const myScore = attemptData.score || 0;
  const cutoff = attemptData.passingMarks || Math.round((attemptData.totalMarks || 100) * 0.4); 

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F8] font-sans antialiased">
      <Navbar />
      
      {/* Sub-header / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                 <Trophy className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                 <span className="text-slate-800 font-black text-[14px] leading-tight truncate max-w-xs">{attemptData.test?.name}</span>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Link href={`/${seriesSlug}`} className="hover:text-blue-600">{seriesSlug}</Link>
                    <span>/</span>
                    <span className="text-slate-500">Analysis</span>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push(`/${seriesSlug}/tests/${testId}`)}
                className="h-10 px-6 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                  Reattempt <ArrowRight className="h-3.5 w-3.5" />
              </button>
           </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto w-full">
         <div className="max-w-6xl w-full space-y-6">
            
            {/* Attempt Switcher */}
            {allAttempts.length > 1 && (
               <div className="bg-white rounded-2xl p-2 flex items-center gap-1 border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                  {allAttempts.map((att, idx) => (
                     <button
                       key={att.id}
                       onClick={() => router.push(`/${seriesSlug}/tests/${testId}/analysis?attemptNo=${idx + 1}`)}
                       className={cn(
                          "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                          (attemptNo ? parseInt(attemptNo) === idx + 1 : idx === allAttempts.length - 1)
                             ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
                             : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                       )}
                     >
                       Attempt {idx + 1}
                     </button>
                  ))}
               </div>
            )}

            {/* Performance Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
               {[
                  { val: `#${attemptData.rank || 0}`, label: "Rank", color: "text-rose-600", bg: "bg-rose-50", icon: Trophy },
                  { val: `${attemptData.score || 0}/${attemptData.totalMarks || 0}`, label: "Score", color: "text-blue-600", bg: "bg-blue-50", icon: Award },
                  { val: `${attemptData.answers?.filter((a: any) => a.selectedOptions.length > 0).length || 0}/${attemptData.test?.totalQuestions || 0}`, label: "Attempted", color: "text-indigo-600", bg: "bg-indigo-50", icon: Zap },
                  { val: `${attemptData.accuracy || 0}%`, label: "Accuracy", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
                  { val: `${attemptData.percentile || 0}%`, label: "Percentile", color: "text-violet-600", bg: "bg-violet-50", icon: TrendingUp }
               ].map((m, i) => (
                  <div key={i} className={cn("p-6 rounded-3xl flex flex-col items-center border border-white shadow-sm transition-all", m.bg)}>
                     <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white shadow-sm", m.color)}>
                        <m.icon className="h-5 w-5" />
                     </div>
                     <p className="text-xl font-black text-slate-800 tracking-tight">{m.val}</p>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[2px] mt-1">{m.label}</p>
                  </div>
               ))}
            </div>

            {/* Cutoff & Feedback */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
               <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <TrendingUp className="h-10 w-10" />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Score: {cutoff}</p>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                     {myScore >= cutoff ? (
                        <>Incredible! You cleared the cutoff by <span className="text-emerald-500">{(myScore - cutoff).toFixed(2)} Marks</span></>
                     ) : (
                        <>You scored <span className="text-rose-500">{(cutoff - myScore).toFixed(2)} Marks</span> less than the target</>
                     )}
                  </h2>
               </div>
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex-1 max-w-sm">
                  <div className="flex items-center gap-3 mb-2">
                     <AlertCircle className="h-4 w-4 text-blue-500" />
                     <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Expert Tip</p>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                     Focus on {attemptData.sectionStats?.sort((a:any, b:any) => a.correct - b.correct)[0]?.name || "your weakest section"} to boost your score by 15-20% in the next attempt.
                  </p>
               </div>
            </div>

            {/* Sectional Analysis Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 space-y-8">
                  <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                     <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                           <BarChart3 className="h-5 w-5 text-blue-600" /> Sectional Analytics
                        </h3>
                     </div>
                     <div className="p-4">
                        <Table>
                           <TableHeader>
                              <TableRow className="border-none hover:bg-transparent">
                                 <TableHead className="text-[10px] font-black uppercase text-slate-400">Section</TableHead>
                                 <TableHead className="text-[10px] font-black uppercase text-slate-400">Correct</TableHead>
                                 <TableHead className="text-[10px] font-black uppercase text-slate-400">Wrong</TableHead>
                                 <TableHead className="text-[10px] font-black uppercase text-slate-400">Accuracy</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {attemptData.sectionStats?.map((sec: any, i: number) => (
                                 <TableRow key={i} className="border-slate-50">
                                    <TableCell className="font-black text-slate-800">{sec.name}</TableCell>
                                    <TableCell className="font-bold text-emerald-600">+{sec.correct}</TableCell>
                                    <TableCell className="font-bold text-rose-500">-{sec.incorrect}</TableCell>
                                    <TableCell>
                                       <div className="flex items-center gap-2">
                                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[60px]">
                                             <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.round((sec.correct / (sec.correct + sec.incorrect + sec.unattempted)) * 100)}%` }} />
                                          </div>
                                          <span className="text-[11px] font-black">{Math.round((sec.correct / (sec.correct + sec.incorrect + sec.unattempted || 1)) * 100)}%</span>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </section>

                  {/* Charts */}
                  <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-8">
                        <BarChart3 className="h-5 w-5 text-blue-600" /> Accuracy Distribution
                     </h3>
                     <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={attemptData.sectionStats}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fontStyle: 'bold', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                              <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="correct" fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} />
                              <Bar dataKey="incorrect" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={32} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </section>
               </div>

               {/* Leaderboard Sidebar */}
               <div className="lg:col-span-4 space-y-6">
                  <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                     <div className="p-6 border-b border-slate-50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Global Leaderboard</h3>
                     </div>
                     <div className="divide-y divide-slate-50">
                        {leaderboard.slice(0, 5).map((entry, idx) => (
                           <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                              <span className={cn(
                                 "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                 idx === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                              )}>{idx + 1}</span>
                              <Avatar className="h-9 w-9 bg-blue-600 text-white flex items-center justify-center font-black">
                                 {entry.student?.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-black text-slate-800 truncate">{entry.student?.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400">Score: {entry.score}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="p-4 bg-slate-50 text-center">
                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Full Leaderboard</button>
                     </div>
                  </section>

                  <section className="bg-gradient-to-br from-[#0f1b2d] to-[#1a73e8] rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-125 transition-transform" />
                     <div className="relative z-10">
                        <Star className="h-10 w-10 text-amber-400 mb-6 fill-amber-400" />
                        <h4 className="text-lg font-black leading-tight mb-2">Upgrade to Pro</h4>
                        <p className="text-[11px] text-white/70 font-bold mb-6 leading-relaxed">Get detailed insights on your weak topics and personalized improvement plans.</p>
                        <button className="w-full h-11 bg-white text-blue-600 font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all active:scale-95">Explore Plans</button>
                     </div>
                  </section>
               </div>
            </div>

         </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
