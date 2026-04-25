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
            const myAttRes = await apiFetch(`/mockbook/tests/${testId}/my-attempts`);
            const attempts = myAttRes.data || [];
            setAllAttempts(attempts);

            if (attempts.length === 0) {
               setLoading(false);
               return;
            }

            let targetAttempt = attempts[attempts.length - 1];
            if (attemptNo) {
               const num = parseInt(attemptNo);
               if (!isNaN(num) && num > 0 && num <= attempts.length) {
                  targetAttempt = attempts[num - 1];
               }
            }

            const attRes = await apiFetch(`/mockbook/attempts/${targetAttempt.id}`);
            setAttemptData(attRes.data || null);

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
         <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)" }}>
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="h-10 w-10 animate-spin opacity-20" style={{ color: "#FF6B2B" }} />
               <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Generating Analysis...</p>
            </div>
         </div>
      );
   }

   if (!attemptData) {
      return (
         <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)" }}>
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
               <AlertTriangle className="h-12 w-12 mb-4" style={{ color: "var(--badge-error-text)" }} />
               <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No Analysis Available</h2>
               <p className="mb-6 max-w-sm" style={{ color: "var(--text-muted)" }}>You haven't completed any attempts for this test yet. Complete the test to see your performance analysis.</p>
               <button onClick={() => router.push(`/${seriesSlug}/tests/${testId}`)} className="px-8 py-3 rounded-xl font-black text-white" style={{ background: "#FF6B2B" }}>Attempt Now</button>
            </div>
         </div>
      );
   }

   const myScore = attemptData.score || 0;
   const cutoff = attemptData.passingMarks || Math.round((attemptData.totalMarks || 100) * 0.4);

   return (
      <div className="flex flex-col min-h-screen font-sans antialiased" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
         <Navbar />

         {/* Sub-header */}
         <div className="sticky top-0 z-30" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="text-white p-1.5 rounded-lg shadow-sm" style={{ background: "#FF6B2B" }}>
                     <Trophy className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                     <span className="font-black text-[14px] leading-tight truncate max-w-xs" style={{ color: "var(--text-primary)" }}>{attemptData.test?.name}</span>
                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        <Link href={`/${seriesSlug}`} className="hover:text-[#FF6B2B] transition-colors">{seriesSlug}</Link>
                        <span>/</span>
                        <span>Analysis</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <button
                     onClick={() => router.push(`/${seriesSlug}/tests/${testId}`)}
                     className="h-9 px-5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 text-white"
                     style={{ background: "#FF6B2B" }}
                  >
                     Reattempt <ArrowRight className="h-3.5 w-3.5" />
                  </button>
               </div>
            </div>
         </div>

         <div className="flex-1 flex justify-center p-4 md:p-6 overflow-y-auto w-full">
            <div className="max-w-6xl w-full space-y-6">

               {/* Attempt Switcher */}
               {allAttempts.length > 1 && (
                  <div className="rounded-xl p-1.5 flex items-center gap-1 shadow-sm overflow-x-auto no-scrollbar" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                     {allAttempts.map((att, idx) => (
                        <button
                           key={att.id}
                           onClick={() => router.push(`/${seriesSlug}/tests/${testId}/analysis?attemptNo=${idx + 1}`)}
                           className={cn(
                              "px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                              (attemptNo ? parseInt(attemptNo) === idx + 1 : idx === allAttempts.length - 1)
                                 ? "shadow-sm"
                                 : "hover:opacity-80"
                           )}
                           style={(attemptNo ? parseInt(attemptNo) === idx + 1 : idx === allAttempts.length - 1) ? { background: "rgba(255,107,43,0.08)", color: "#FF6B2B" } : { color: "var(--text-muted)" }}
                        >
                           Attempt {idx + 1}
                        </button>
                     ))}
                  </div>
               )}

               {/* Performance Summary Cards */}
               <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                     { val: `#${attemptData.rank || 0}`, label: "Rank", icon: Trophy, color: "var(--badge-error-text)", bg: "var(--badge-error-bg)" },
                     { val: `${attemptData.score || 0}/${attemptData.totalMarks || 0}`, label: "Score", icon: Award, color: "var(--badge-info-text)", bg: "var(--badge-info-bg)" },
                     { val: `${attemptData.answers?.filter((a: any) => a.selectedOptions.length > 0).length || 0}/${attemptData.test?.totalQuestions || 0}`, label: "Attempted", icon: Zap, color: "#FF6B2B", bg: "rgba(255,107,43,0.08)" },
                     { val: `${attemptData.accuracy || 0}%`, label: "Accuracy", icon: CheckCircle2, color: "var(--badge-success-text)", bg: "var(--badge-success-bg)" },
                     { val: `${attemptData.percentile || 0}%`, label: "Percentile", icon: TrendingUp, color: "#FF6B2B", bg: "rgba(255,107,43,0.08)" }
                  ].map((m, i) => (
                     <div key={i} className="p-4 rounded-xl flex flex-col items-center shadow-sm transition-all card-hover" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: m.bg }}>
                           <m.icon className="h-4 w-4" style={{ color: m.color }} />
                        </div>
                        <p className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>{m.val}</p>
                        <p className="text-[10px] font-black uppercase tracking-[2px] mt-1" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                     </div>
                  ))}
               </div>

               {/* Cutoff & Feedback */}
               <div className="rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--badge-success-bg)" }}>
                     <TrendingUp className="h-8 w-8" style={{ color: "var(--badge-success-text)" }} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <p className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Pass Score: {cutoff}</p>
                     <h2 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                        {myScore >= cutoff ? (
                           <>Incredible! You cleared the cutoff by <span style={{ color: "var(--badge-success-text)" }}>{(myScore - cutoff).toFixed(2)} Marks</span></>
                        ) : (
                           <>You scored <span style={{ color: "var(--badge-error-text)" }}>{(cutoff - myScore).toFixed(2)} Marks</span> less than the target</>
                        )}
                     </h2>
                  </div>
                  <div className="p-5 rounded-xl flex-1 max-w-sm" style={{ background: "var(--bg-main)", border: "var(--border-card)" }}>
                     <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Expert Tip</p>
                     </div>
                     <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        Focus on {attemptData.sectionStats?.sort((a: any, b: any) => a.correct - b.correct)[0]?.name || "your weakest section"} to boost your score by 15-20% in the next attempt.
                     </p>
                  </div>
               </div>

               {/* Sectional Analysis Table */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-8 space-y-4">
                     <section className="rounded-xl shadow-sm overflow-hidden" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "var(--divider)" }}>
                           <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                              <BarChart3 className="h-5 w-5" style={{ color: "#FF6B2B" }} /> Sectional Analytics
                           </h3>
                        </div>
                        <div className="p-4">
                           <Table>
                              <TableHeader>
                                 <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black uppercase" style={{ color: "var(--text-muted)" }}>Section</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase" style={{ color: "var(--text-muted)" }}>Correct</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase" style={{ color: "var(--text-muted)" }}>Wrong</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase" style={{ color: "var(--text-muted)" }}>Accuracy</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {attemptData.sectionStats?.map((sec: any, i: number) => (
                                    <TableRow key={i} style={{ borderColor: "var(--divider)" }}>
                                       <TableCell className="font-black" style={{ color: "var(--text-primary)" }}>{sec.name}</TableCell>
                                       <TableCell className="font-bold" style={{ color: "var(--badge-success-text)" }}>+{sec.correct}</TableCell>
                                       <TableCell className="font-bold" style={{ color: "var(--badge-error-text)" }}>-{sec.incorrect}</TableCell>
                                       <TableCell>
                                          <div className="flex items-center gap-2">
                                             <div className="flex-1 h-1.5 rounded-full max-w-[60px]" style={{ background: "var(--bg-main)" }}>
                                                <div className="h-full rounded-full" style={{ width: `${Math.round((sec.correct / (sec.correct + sec.incorrect + sec.unattempted)) * 100)}%`, background: "#FF6B2B" }} />
                                             </div>
                                             <span className="text-[11px] font-black" style={{ color: "var(--text-primary)" }}>{Math.round((sec.correct / (sec.correct + sec.incorrect + sec.unattempted || 1)) * 100)}%</span>
                                          </div>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     </section>

                     {/* Charts */}
                     <section className="rounded-xl shadow-sm p-6" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-6" style={{ color: "var(--text-primary)" }}>
                           <BarChart3 className="h-5 w-5" style={{ color: "#FF6B2B" }} /> Accuracy Distribution
                        </h3>
                        <div className="h-[300px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={attemptData.sectionStats}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--scrollbar-track)" />
                                 <XAxis dataKey="name" tick={{ fontSize: 10, fontStyle: 'bold', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                 <Tooltip cursor={{ fill: 'var(--bg-main)' }} contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--card-hover-shadow)' }} />
                                 <Bar dataKey="correct" fill="var(--badge-success-text)" radius={[4, 4, 0, 0]} barSize={32} />
                                 <Bar dataKey="incorrect" fill="var(--badge-error-text)" radius={[4, 4, 0, 0]} barSize={32} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </section>
                  </div>

                  {/* Leaderboard Sidebar */}
                  <div className="lg:col-span-4 space-y-4">
                     <section className="rounded-xl shadow-sm overflow-hidden" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                        <div className="p-5" style={{ borderBottom: "var(--divider)" }}>
                           <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>Global Leaderboard</h3>
                        </div>
                        <div style={{ borderColor: "var(--divider)" }}>
                           {leaderboard.slice(0, 5).map((entry, idx) => (
                              <div key={idx} className="p-4 flex items-center gap-4 transition-colors" style={{ borderBottom: "var(--divider)" }}>
                                 <span className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                                    idx === 0 ? "" : ""
                                 )} style={idx === 0 ? { background: "rgba(255,107,43,0.08)", color: "#FF6B2B" } : { background: "var(--bg-main)", color: "var(--text-muted)" }}>{idx + 1}</span>
                                 <Avatar className="h-9 w-9 flex items-center justify-center font-black text-white" style={{ background: "#FF6B2B" }}>
                                    {entry.student?.name?.charAt(0).toUpperCase()}
                                 </Avatar>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>{entry.student?.name}</p>
                                    <p className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>Score: {entry.score}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="p-4 text-center" style={{ background: "var(--bg-main)" }}>
                           <button className="text-[10px] font-black uppercase tracking-widest hover:underline" style={{ color: "#FF6B2B" }}>View Full Leaderboard</button>
                        </div>
                     </section>

                     <section className="rounded-xl p-6 text-white shadow-xl relative overflow-hidden group" style={{ background: "#FF6B2B" }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-125 transition-transform" style={{ background: "rgba(255,255,255,0.1)" }} />
                        <div className="relative z-10">
                           <Star className="h-10 w-10 mb-6" style={{ color: "#FFD700" }} />
                           <h4 className="text-lg font-black leading-tight mb-2">Upgrade to Pro</h4>
                           <p className="text-[11px] text-white/70 font-bold mb-6 leading-relaxed">Get detailed insights on your weak topics and personalized improvement plans.</p>
                           <button className="w-full h-11 font-black text-[11px] uppercase tracking-widest rounded-xl transition-all active:scale-95" style={{ background: "var(--bg-card)", color: "#FF6B2B" }}>Explore Plans</button>
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
