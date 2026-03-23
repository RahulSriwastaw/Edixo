const fs = require('fs');
const content = `
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  BarChart3,
  User as UserIcon,
  Download,
  Loader2,
  AlertTriangle,
  Star,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TestbookAnalysisPage() {
  const [activeTab, setActiveTab] = useState("analysis");
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  let attemptId = params?.id as string;
  const urlTestId = searchParams.get('testId');

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [attemptData, setAttemptData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper flags
  const bestAttempt = allAttempts.reduce((prev, current) => (prev && prev.score > current.score) ? prev : current, null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (attemptId === 'latest' && urlTestId) {
            const myAttRes = await apiFetch(\`/mockbook/tests/\${urlTestId}/my-attempts\`);
            const attempts = myAttRes.data || [];
            if (attempts.length === 0) {
               setLoading(false);
               return; 
            }
            const latest = attempts[attempts.length - 1];
            attemptId = latest.id;
            setAllAttempts(attempts);
            router.replace(\`/tests/results/\${attemptId}\`);
            return; 
        }

        if (attemptId && attemptId !== 'latest') {
          const attRes = await apiFetch(\`/mockbook/attempts/\${attemptId}\`);
          const data = attRes.data;
          setAttemptData(data || null);

          if (data?.testId) {
            const [lbRes, myAttRes, reportRes] = await Promise.all([
              apiFetch(\`/mockbook/\${data.testId}/leaderboard\`),
              allAttempts.length > 0 ? Promise.resolve({data: allAttempts}) : apiFetch(\`/mockbook/tests/\${data.testId}/my-attempts\`),
              apiFetch(\`/mockbook/attempts/\${attemptId}/report\`).catch(() => ({data: null}))
            ]);
            setLeaderboard(lbRes.data || []);
            setAllAttempts(myAttRes.data || []);
            setReportData(reportRes.data || null);
          }
        }
      } catch (err) {
        console.error("Could not fetch attempt analysis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId, urlTestId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
        </div>
      </div>
    );
  }

  if (!attemptData && !loading) {
      return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <div className="flex-1 flex items-center justify-center text-gray-500 font-bold">No Attempt Data Found.</div>
        </div>
      );
  }

  const topperScore = attemptData.topperScore || 0;
  const myScore = attemptData.score || 0;
  const cutoff = 32; 
  const lessThanCutoff = Math.max(0, cutoff - myScore);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Navbar />
      
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="text-[#1a73e8] font-bold text-[13px]">{attemptData.testName}</span>
           </div>
           <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
              <button 
                onClick={() => router.push(\`/tests/instructions/\${attemptData.testId}\`)}
                className="flex items-center gap-1.5 text-[#1a73e8] bg-blue-50 px-3 py-1.5 rounded transition-colors hover:bg-blue-100"
              >
                  Reattempt This Test <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <span className="hidden sm:inline border-r border-gray-300 pr-4">Rate this Test: <Star className="h-3 w-3 inline text-gray-300 ml-1"/><Star className="h-3 w-3 inline text-gray-300"/><Star className="h-3 w-3 inline text-gray-300"/><Star className="h-3 w-3 inline text-gray-300"/><Star className="h-3 w-3 inline text-gray-300"/></span>
              <button onClick={() => router.push('/tests')} className="hidden sm:inline hover:text-[#1a73e8]">Go to Tests</button>
              <button onClick={() => setActiveTab('solutions')} className={cn("hidden sm:inline transition-colors hover:text-[#1a73e8]", activeTab === 'solutions' && "text-[#1a73e8]")}>Solutions</button>
           </div>
        </div>
      </div>

      <div className="flex flex-1 justify-center p-4 md:p-6 overflow-y-auto w-full">
         <div className="max-w-[1000px] w-full bg-white rounded shadow-sm border border-gray-200 min-h-[800px] flex flex-col items-center">
            
            <div className="flex items-center justify-center w-full border-b border-gray-200 mt-4">
                {allAttempts.map((att) => {
                    const isBest = bestAttempt?.id === att.id && allAttempts.length > 1;
                    const isActive = att.id === attemptId;
                    
                    return (
                       <button
                         key={att.id}
                         onClick={() => router.replace(\`/tests/results/\${att.id}\`)}
                         className={cn(
                            "px-6 py-3 text-xs font-bold font-sans transition-colors relative",
                            isActive ? "text-[#1a73e8]" : "text-gray-500 hover:text-gray-900 border-transparent",
                         )}
                       >
                         Attempt {att.attemptNumber}
                         {isBest && <Star className="h-2.5 w-2.5 inline text-emerald-500 ml-1 mb-0.5 fill-emerald-500"/>}
                         {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a73e8]" />}
                       </button>
                    )
                })}
            </div>

            <div className="w-full max-w-4xl p-6 lg:p-10 space-y-10">
               
               <div className="w-full flex">
                   <div className="inline-flex bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded items-center gap-1.5 border border-gray-200/60">
                       <Clock className="h-3.5 w-3.5" /> 
                       Attempt {attemptData.attemptNumber} was made on {new Date(attemptData.submittedAt || new Date()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </div>
               </div>

               <section>
                   <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 mb-6">
                       Overall Performance Summary <AlertCircle className="h-3 w-3 text-gray-400" />
                   </h3>
                   <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                       {[
                           { val: \`\${attemptData.rank || 0} / \${Math.max(attemptData.totalStudents || 1, attemptData.rank || 1)}\`, label: "Rank", color: "bg-pink-500", icon: Trophy, wrapper: "bg-pink-50" },
                           { val: \`\${attemptData.score || 0} / \${attemptData.totalMarks || 0}\`, label: "Score", color: "bg-purple-500", icon: Award, wrapper: "bg-purple-50" },
                           { val: \`\${attemptData.attempted || 0} / \${attemptData.totalQuestions || 0}\`, label: "Attempted", color: "bg-sky-500", icon: Zap, wrapper: "bg-sky-50" },
                           { val: \`\${attemptData.accuracy || 0}%\`, label: "Accuracy", color: "bg-emerald-500", icon: CheckCircle2, wrapper: "bg-emerald-50" },
                           { val: \`\${attemptData.percentile || 0}%\`, label: "Percentile", color: "bg-indigo-500", icon: TrendingUp, wrapper: "bg-indigo-50" }
                       ].map((m, i) => (
                           <div key={i} className="flex flex-col items-center gap-3 text-center">
                               <div className={cn("w-12 h-12 rounded-full flex items-center justify-center relative", m.wrapper)}>
                                   <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white transistion-transform hover:scale-110", m.color)}>
                                       <m.icon className="h-4 w-4" />
                                   </div>
                               </div>
                               <div>
                                   <p className="text-xs font-black text-gray-900">{m.val}</p>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{m.label}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </section>

               <section className="border border-gray-100 rounded-lg shadow-sm bg-white overflow-hidden p-6 relative">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                               <TrendingUp className="h-5 w-5" />
                           </div>
                           <div>
                               <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none mb-1">
                                   {cutoff} Cutoff Cleared
                               </p>
                               <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                   You scored <span className="text-red-500">{myScore} Marks ▼</span> less than cutoff !
                               </h2>
                           </div>
                       </div>
                   </div>
                   
                   <div className="mt-6 bg-orange-50/50 p-4 rounded-lg flex items-start flex-col sm:flex-row sm:items-center gap-4 border border-orange-100">
                       <AlertTriangle className="h-8 w-8 text-orange-500 shrink-0" />
                       <div className="flex-1">
                           <h4 className="text-sm font-bold text-gray-900">Major gaps observed, strong basemap needed.</h4>
                           <p className="text-xs text-gray-600 mt-0.5 font-medium">Turn weaknesses into strengths with guided Live Classes from Mokebook Super.</p>
                       </div>
                       <button className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-xs px-6 py-2.5 rounded whitespace-nowrap">
                           Start Trial Now
                       </button>
                   </div>
               </section>

               <hr className="border-gray-100" />

               <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                   <div className="md:col-span-8 space-y-10">
                       
                       <section>
                           <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 mb-4">
                               Sectional Summary <AlertCircle className="h-3 w-3 text-gray-400" />
                           </h3>
                           <div className="overflow-hidden border border-gray-200 rounded text-xs select-none">
                               <Table>
                                  <TableHeader className="bg-gray-50/80">
                                      <TableRow>
                                          <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Section Name</TableHead>
                                          <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Score</TableHead>
                                          <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Attempted</TableHead>
                                          <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Accuracy</TableHead>
                                          <TableHead className="font-bold text-gray-500 uppercase py-2.5 text-[10px]">Time</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      <TableRow className="bg-white">
                                          <TableCell className="font-bold text-gray-900 py-3">Overall</TableCell>
                                          <TableCell className="py-3">
                                              <span className="font-bold text-gray-900">{myScore}</span> <span className="text-gray-400">/ {attemptData.totalMarks || 50}</span>
                                              <div className="text-[9px] text-red-500 flex items-center gap-1 mt-0.5 font-bold"><ArrowRight className="h-2 w-2 rotate-90" /> 32-35 cut-off</div>
                                          </TableCell>
                                          <TableCell className="font-bold text-gray-900 py-3">{attemptData.attempted || 0} <span className="text-gray-400">/ {attemptData.totalQuestions || 0}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-3">{attemptData.accuracy || 0}%</TableCell>
                                          <TableCell className="font-bold text-gray-900 py-3">
                                              {Math.floor((attemptData.timeTakenSecs || 0)/60).toString().padStart(2,'0')}:
                                              {((attemptData.timeTakenSecs || 0)%60).toString().padStart(2,'0')} 
                                          </TableCell>
                                      </TableRow>
                                  </TableBody>
                               </Table>
                           </div>
                       </section>

                       <section>
                           <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 mb-6">
                               Rank Predictor <AlertCircle className="h-3 w-3 text-gray-400" />
                           </h3>
                           <div className="border border-gray-100 rounded p-8 bg-white relative mt-10 shadow-sm">
                               
                               <div className="w-full h-1 bg-gray-200 relative mt-4">
                                  {[0,10,20,30,40,50].map((t) => (
                                     <div key={t} className="absolute top-1 text-[9px] text-gray-400 font-bold" style={{left: \`\${(t/50)*100}%\`, transform: 'translateX(-50%)'}}>
                                        <div className="h-2 w-px bg-gray-300 mx-auto mb-1"></div>
                                        {t}
                                     </div>
                                  ))}

                                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded bg-gray-800 border-2 border-white shadow-sm" style={{left: \`\${Math.min(100, Math.max(0, (myScore/50)*100))}%\`, transform: 'translate(-50%, -50%)'}} />
                                  <div className="absolute -top-8 px-2 py-1 bg-gray-900 text-white rounded text-[9px] font-bold" style={{left: \`\${Math.min(100, Math.max(0, (myScore/50)*100))}%\`, transform: 'translateX(-50%)'}}>
                                      Rank {attemptData.rank || 0}
                                  </div>
                               </div>
                               <div className="text-center mt-10 text-[9px] text-gray-400 font-bold uppercase tracking-widest">Marks</div>

                           </div>
                       </section>

                       <section>
                           <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 mb-4">
                               Compare with topper <AlertCircle className="h-3 w-3 text-gray-400" />
                           </h3>
                           <div className="overflow-hidden border border-gray-200 rounded text-xs select-none">
                               <Table>
                                  <TableHeader className="bg-gray-50/80">
                                      <TableRow>
                                          <TableHead className="font-bold text-gray-400 py-2.5">Test</TableHead>
                                          <TableHead className="font-bold text-gray-500 py-2.5">Score</TableHead>
                                          <TableHead className="font-bold text-gray-500 py-2.5">Accuracy</TableHead>
                                          <TableHead className="font-bold text-gray-500 py-2.5">Correct</TableHead>
                                          <TableHead className="font-bold text-gray-500 py-2.5">Wrong</TableHead>
                                          <TableHead className="font-bold text-gray-500 py-2.5">Time</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      <TableRow className="bg-white">
                                          <TableCell className="font-bold text-gray-900 py-4 border-r border-gray-100">You</TableCell>
                                          <TableCell className="py-4"><span className="font-bold text-gray-900">{myScore}</span> <span className="text-gray-400">/ {attemptData.totalMarks || 50}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">{attemptData.accuracy || 0}%</TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">{attemptData.correct || 0}<span className="text-emerald-500"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">{attemptData.incorrect || 0}<span className="text-gray-400"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">00:00 <span className="text-gray-400 font-normal"> / 60 min</span></TableCell>
                                      </TableRow>
                                      <TableRow className="bg-purple-50/30">
                                          <TableCell className="font-bold text-gray-900 py-4 border-r border-gray-100">Topper</TableCell>
                                          <TableCell className="py-4"><span className="font-bold text-purple-600">{topperScore}</span> <span className="text-gray-400">/ {attemptData.totalMarks || 50}</span></TableCell>
                                          <TableCell className="font-bold text-purple-600 py-4">100%</TableCell>
                                          <TableCell className="font-bold text-emerald-600 py-4">{Math.round((topperScore/(attemptData.totalMarks||1))*(attemptData.totalQuestions||0))}<span className="text-emerald-500"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">0<span className="text-gray-400"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">17:37 <span className="text-gray-400 font-normal"> / 60 min</span></TableCell>
                                      </TableRow>
                                      <TableRow className="bg-gray-50/50">
                                          <TableCell className="font-bold text-gray-900 py-4 border-r border-gray-100">Avg</TableCell>
                                          <TableCell className="py-4"><span className="font-bold text-gray-600">{attemptData.avgScore || 0}</span> <span className="text-gray-400">/ {attemptData.totalMarks || 50}</span></TableCell>
                                          <TableCell className="font-bold text-gray-600 py-4">63%</TableCell>
                                          <TableCell className="font-bold text-emerald-600 py-4">11<span className="text-emerald-500"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">2<span className="text-gray-400"> / {attemptData.totalQuestions || 0}</span></TableCell>
                                          <TableCell className="font-bold text-gray-900 py-4">17:03 <span className="text-gray-400 font-normal"> / 60 min</span></TableCell>
                                      </TableRow>
                                  </TableBody>
                               </Table>
                           </div>
                       </section>

                       <section>
                           <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1 mb-4">
                               Marks Distribution <AlertCircle className="h-3 w-3 text-gray-400" />
                           </h3>
                           <div className="border border-gray-200 rounded p-4 pt-10 h-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                  {attemptData?.marksDistribution?.length > 0 ? (
                                    <LineChart data={attemptData.marksDistribution}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                      <XAxis dataKey="marks" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={{stroke: '#e2e8f0'}} tickLine={false} />
                                      <YAxis dataKey="students" allowDecimals={false} tick={{ fontSize: 9, fill: '#94a3b8', dx: -10 }} axisLine={{stroke: '#e2e8f0'}} tickLine={false} />
                                      <Tooltip contentStyle={{ border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '11px', borderRadius: '4px' }} formatter={(value) => [value, "Students"]} labelFormatter={(label) => \`Score: \${label}\`} />
                                      <Line type="linear" dataKey="students" stroke="#00d8ff" strokeWidth={2} dot={{ fill: '#00d8ff', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                  ) : (
                                    <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold italic">
                                      Not enough data available.
                                    </div>
                                  )}
                              </ResponsiveContainer>
                           </div>
                       </section>

                   </div>

                   <div className="md:col-span-4 space-y-8">
                       
                       <section>
                           <h3 className="text-sm font-bold text-gray-900 mb-4">Top Rankers</h3>
                           <div className="border border-gray-200 rounded overflow-hidden">
                               <div className="p-4 bg-gray-50 border-b border-gray-200">
                                   <p className="text-[10px] text-gray-600 leading-relaxed font-semibold">
                                       Leaderboard is generated on the basis of <span className="font-black text-gray-900">Attempt 1</span> of the students.
                                   </p>
                               </div>
                               <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto no-scrollbar bg-white">
                                   {leaderboard.length > 0 ? leaderboard.slice(0, 10).map((u, i) => (
                                       <div key={i} className="p-3 flex items-center gap-3">
                                           <span className="text-xs font-bold text-gray-400 w-4 text-center">{i+1}.</span>
                                           <Avatar className="h-8 w-8 bg-[#1a73e8] text-white flex items-center justify-center font-bold text-[10px]">
                                               {(u.student?.name || '?')[0]}
                                           </Avatar>
                                           <div className="flex-1 min-w-0">
                                              <p className="text-xs font-bold text-gray-900 truncate">{u.student?.name || 'Anonymous'}</p>
                                              <p className="text-[9px] font-bold text-gray-400">{u.score}/{attemptData.totalMarks || 50}</p>
                                           </div>
                                       </div>
                                   )) : (
                                      <div className="p-8 text-center text-[10px] font-bold text-slate-400">No attempts yet.</div>
                                   )}
                               </div>
                           </div>
                       </section>

                       <section>
                           <h3 className="text-sm font-bold text-gray-900 mb-4">Download Our App</h3>
                           <div className="border border-gray-200 rounded p-5 bg-white text-center shadow-sm">
                               <p className="text-[11px] text-gray-600 font-semibold px-4 mb-4">
                                   To see your statistics on your mobile on the go, anytime, anywhere!
                               </p>
                               <div className="flex flex-col gap-2 items-center mb-6">
                                   <div className="h-8 w-24 bg-black rounded text-white text-[10px] flex items-center justify-center font-bold">App Store</div>
                                   <div className="h-8 w-24 bg-black rounded text-white text-[10px] flex items-center justify-center font-bold">Google Play</div>
                               </div>
                               <input type="text" placeholder="Enter Phone Number" className="w-full h-8 text-xs border border-gray-300 rounded mb-2 px-3 focus:outline-none focus:border-[#00d8ff]" />
                               <button className="w-full bg-[#00d8ff] text-white font-bold h-8 text-xs rounded hover:bg-[#00c0e5] transition-colors">
                                   Get App Link
                               </button>
                           </div>
                       </section>

                   </div>
               </div>

            </div>
         </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('d:\\RahulProjects\\New EduHub\\mokebook\\src\\app\\tests\\results\\[id]\\page.tsx', content, 'utf8');
