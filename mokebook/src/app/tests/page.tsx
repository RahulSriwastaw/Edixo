"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search, ChevronRight, Loader2, BookOpen, Users, Star,
  ChevronDown, Filter, Bell, ArrowRight, FileText, X,
  Zap, LayoutGrid, Clock, Play
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════

/** 1. Recent Test Series Card (Refined & Compact) */
function RecentSeriesCard({ series, categoryName }: { series: any; categoryName: string }) {
  const progress = series.attemptedCount ? Math.round((series.attemptedCount / series.testsCount) * 100) : 0;
  
  return (
    <Link href={`/tests/series/${series.id}`} className="block group shrink-0 w-[220px] md:w-[260px]">
      <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:shadow-md hover:border-blue-100 transition-all h-full flex flex-col">
        {/* Tags Row - Compact */}
        <div className="flex gap-1 mb-2.5 overflow-x-hidden">
          <span className="bg-blue-50/80 text-blue-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">{categoryName}</span>
          <span className="bg-red-50/80 text-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Live</span>
        </div>

        {/* Info Row - Tighter */}
        <div className="flex gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center p-1.5 shrink-0 border border-slate-100 group-hover:border-blue-200 transition-colors">
            {series.icon ? (
              <Image src={series.icon} alt={series.name} width={20} height={20} className="object-contain" />
            ) : (
              <FileText className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="min-w-0">
             <h3 className="text-[12px] font-bold text-slate-800 leading-tight line-clamp-2 min-h-[30px] group-hover:text-blue-600 transition-colors">{series.name}</h3>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-auto pt-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-semibold text-slate-400">1.2k+ Aspirants</span>
            <span className="text-[9px] font-bold text-emerald-600">{series.freeTestCount || 5} Free</span>
          </div>
          
          {/* Progress Bar - Slimmer */}
          <div className="h-1 w-full bg-slate-50 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(progress, 2)}%` }} />
          </div>

          <button className="w-full h-8 rounded-lg bg-slate-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98]">
            Practice Now
          </button>
        </div>
      </div>
    </Link>
  );
}

/** 2. Enrolled Series List Item (Super Compact) */
function EnrolledSeriesItem({ series }: { series: any }) {
  return (
    <Link href={`/tests/series/${series.id}`} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 hover:border-blue-300 hover:shadow-sm transition-all group active:scale-[0.99]">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-50 p-2 shrink-0">
        {series.icon ? (
          <Image src={series.icon} alt={series.name} width={24} height={24} className="object-contain" />
        ) : (
          <Play className="h-4 w-4 text-blue-500 fill-blue-500/20" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-black text-[#0f1b2d] truncate group-hover:text-[#1a73e8] transition-colors">{series.name}</h4>
        <p className="text-[10px] font-bold text-slate-400">{series.attemptedCount || 0}/{series.testsCount || 0} tests</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

/** 3. Live Quiz Card (Premium High-Density) */
function LiveQuizCard({ quiz }: { quiz: any }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex flex-col h-full min-w-[220px] md:min-w-[260px]">
       <div className="flex gap-1.5 mb-2.5">
          <span className="bg-rose-50 text-rose-500 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter">
            <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
            Live Now
          </span>
          <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Free</span>
       </div>
       
       <h3 className="text-[12px] font-bold text-slate-800 leading-tight mb-3 flex-1 line-clamp-2">RRB NTPC 2024 Phase 1 Special Live Mock Test</h3>
       
       <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold mb-3">
         <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>2h Left</span>
         </div>
         <div className="flex items-center gap-1 text-slate-400">
            <Users className="h-3 w-3" />
            <span>1,240</span>
         </div>
       </div>
       
       <button className="w-full h-8 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:bg-blue-700 active:scale-95 transition-all">
         Join Now
       </button>
    </div>
  );
}

/** 4. Category Grid Item (Professional & Compact) */
function CategoryGridItem({ series, categoryName }: { series: any; categoryName: string }) {
  return (
    <Link href={`/tests/series/${series.id}`} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group active:scale-[0.99]">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center p-2 shrink-0 border border-slate-50 group-hover:border-blue-100 transition-colors">
        {series.icon ? (
          <Image src={series.icon} alt={series.name} width={22} height={22} className="object-contain" />
        ) : (
          <FileText className="h-4 w-4 text-blue-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors mb-0.5 line-clamp-1">{series.name}</h3>
        <div className="flex items-center gap-2 text-[10px] font-semibold">
           <span className="text-slate-400">{series.testsCount} Tests</span>
           <span className="text-emerald-500">{series.freeTestCount || 0} Free</span>
        </div>
      </div>
      <div className="h-8 px-3 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
        Start
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════

export default function TestSeriesPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
  const [activeFolderId, setActiveFolderId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [testSearch, setTestSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [foldersRes, seriesRes] = await Promise.all([
          apiFetch("/mockbook/folders"),
          apiFetch("/mockbook/categories")
        ]);

        const fetchedFolders = foldersRes.data || [];
        setFolders(fetchedFolders);

        if (seriesRes.success) {
          const grouped: Record<string, any[]> = {};
          (seriesRes.data || []).forEach((s: any) => {
            const fId = s.folderId || "other";
            if (!grouped[fId]) grouped[fId] = [];
            grouped[fId].push(s);
          });
          setSeriesByFolder(grouped);
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeCat = folders.find(f => f.id === activeFolderId);
  const allSeries = Object.values(seriesByFolder).flat();
  const currentSeries = activeFolderId === "all" ? allSeries : (seriesByFolder[activeFolderId] || []);
  
  const filteredSeries = currentSeries.filter(s => 
    s.name.toLowerCase().includes(testSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F8] text-[#0f1b2d] font-sans antialiased">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12 bg-slate-50">
          {/* SEARCH HEADER - Compact & Refined */}
          <div className="bg-white border-b border-slate-100 px-4 py-4 md:px-8">
             <div className="max-w-3xl mx-auto relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search your exam (e.g. SSC CGL, RRB NTPC...)"
                  value={testSearch}
                  onChange={e => setTestSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 text-[13px] font-medium transition-all"
                />
             </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
            
            {/* 1. RECENT TEST SERIES */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-black flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Your Recent Test Series
                </h2>
                <Link href="/analytics" className="text-[12px] font-bold text-[#1a73e8] hover:underline flex items-center gap-1">
                  View all Attempted Tests <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="w-[280px] h-48 bg-white rounded-xl animate-pulse border border-slate-100 shrink-0" />)
                ) : allSeries.length > 0 ? (
                  allSeries.slice(0, 4).map(s => (
                    <RecentSeriesCard key={s.id} series={s} categoryName="Exam" />
                  ))
                ) : (
                  <div className="w-full py-12 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center italic text-slate-400 text-sm">
                    No recent tests found. Start your first test now!
                  </div>
                )}
              </div>
            </section>

            {/* 2. ENROLLED TEST SERIES */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-black flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                   Your Enrolled Test Series
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                   [...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-slate-100" />)
                ) : allSeries.length > 0 ? (
                  allSeries.filter(s => s.isEnrolled).slice(0, 6).map(s => (
                    <EnrolledSeriesItem key={s.id} series={s} />
                  ))
                ) : (
                  [...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white/50 rounded-xl border border-slate-100 border-dashed" />)
                )}
              </div>
            </section>

            {/* 3. LIVE TESTS & FREE QUIZZES */}
            <section>
               <div className="flex items-center justify-between mb-5">
                 <h2 className="text-[18px] font-black flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Live Tests & <span className="text-[#1a73e8]">Free</span> Quizzes
                 </h2>
                 <Link href="#" className="text-[12px] font-bold text-[#1a73e8] hover:underline flex items-center gap-1">
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
               </div>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
                  {[...Array(3)].map((_, i) => (
                    <LiveQuizCard key={i} quiz={{}} />
                  ))}
               </div>
            </section>

            {/* 4. TEST SERIES BY CATEGORIES */}
            <section>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-[20px] font-black flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Test Series by Categories
                 </h2>
              </div>
              
              {/* Category Filter Tabs - Refined */}
              <div className="flex gap-1.5 mb-6 overflow-x-auto no-scrollbar pb-2">
                 <button 
                  onClick={() => setActiveFolderId("all")}
                  className={cn(
                    "px-4 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                    activeFolderId === "all" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                  )}
                 >
                   All Exams
                 </button>
                 {folders.map(cat => (
                   <button 
                    key={cat.id}
                    onClick={() => setActiveFolderId(cat.id)}
                    className={cn(
                      "px-4 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all whitespace-nowrap",
                      activeFolderId === cat.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                    )}
                   >
                     {cat.name}
                   </button>
                 ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {loading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl animate-pulse border border-slate-100" />)
                 ) : filteredSeries.length > 0 ? (
                    filteredSeries.map(s => (
                      <CategoryGridItem key={s.id} series={s} categoryName={activeCat?.name || "Exam"} />
                    ))
                 ) : (
                    <div className="col-span-full bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-bold mb-4">No test series found in this category.</p>
                      <button onClick={() => setActiveFolderId("all")} className="text-[#1a73e8] font-black hover:underline">Explore All Exams →</button>
                    </div>
                 )}
              </div>
            </section>
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

