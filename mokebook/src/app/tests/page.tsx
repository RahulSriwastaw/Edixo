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
    <Link href={`/${series.slug || series.id}`} className="block group shrink-0 w-[220px] md:w-[260px]">
      <div
        className="rounded-lg p-3 transition-all h-full flex flex-col"
        style={{
          background: "var(--bg-card)",
          border: "var(--border-card)",
        }}
      >
        {/* Tags Row - Compact */}
        <div className="flex gap-1 mb-2 overflow-x-hidden">
          <span
            className="text-[8px] font-bold px-1.5 py-[1px] rounded uppercase tracking-tighter"
            style={{ background: "var(--badge-info-bg)", color: "var(--badge-info-text)" }}
          >
            {categoryName}
          </span>
          <span
            className="text-[8px] font-bold px-1.5 py-[1px] rounded uppercase tracking-tighter"
            style={{ background: "var(--badge-error-bg)", color: "var(--badge-error-text)" }}
          >
            Live
          </span>
        </div>

        {/* Info Row - Tighter */}
        <div className="flex gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center p-1.5 shrink-0 transition-colors"
            style={{ background: "var(--bg-main)", border: "var(--border-card)" }}
          >
            {series.icon ? (
              <Image src={series.icon} alt={series.name} width={20} height={20} className="object-contain" />
            ) : (
              <FileText className="h-4 w-4" style={{ color: "#FF6B2B" }} />
            )}
          </div>
          <div className="min-w-0">
            <h3
              className="text-[12px] font-semibold leading-tight line-clamp-2 min-h-[28px] transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              {series.name}
            </h3>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-auto pt-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>1.2k+ Aspirants</span>
            <span className="text-[9px] font-semibold" style={{ color: "var(--badge-success-text)" }}>{series.freeTestCount || 5} Free</span>
          </div>

          {/* Progress Bar - Slimmer */}
          <div className="h-1 w-full rounded-full mb-3 overflow-hidden" style={{ background: "var(--bg-main)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(progress, 2)}%`, background: "#FF6B2B" }} />
          </div>

          <button
            className="w-full h-7 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-[0.98]"
            style={{
              background: "var(--bg-main)",
              color: "#FF6B2B",
              border: "var(--border-card)",
            }}
          >
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
    <Link
      href={`/${series.slug || series.id}`}
      className="rounded-lg p-2.5 flex items-center gap-3 transition-all group active:scale-[0.99]"
      style={{
        background: "var(--bg-card)",
        border: "var(--border-card)",
      }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center p-1.5 shrink-0"
        style={{ background: "var(--bg-main)", border: "var(--border-card)" }}
      >
        {series.icon ? (
          <Image src={series.icon} alt={series.name} width={22} height={22} className="object-contain" />
        ) : (
          <Play className="h-4 w-4" style={{ color: "#FF6B2B" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[12px] font-semibold truncate transition-colors" style={{ color: "var(--text-primary)" }}>{series.name}</h4>
        <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{series.attemptedCount || 0}/{series.testsCount || 0} tests</p>
      </div>
      <ChevronRight className="h-4 w-4 transition-all" style={{ color: "var(--text-muted)" }} />
    </Link>
  );
}

/** 3. Live Quiz Card (Premium High-Density) */
function LiveQuizCard({ quiz }: { quiz: any }) {
  return (
    <div
      className="rounded-lg p-3 transition-all flex flex-col h-full min-w-[220px] md:min-w-[260px]"
      style={{
        background: "var(--bg-card)",
        border: "var(--border-card)",
      }}
    >
      <div className="flex gap-1.5 mb-2">
        <span
          className="text-[8px] font-bold px-1.5 py-[1px] rounded flex items-center gap-1 uppercase tracking-tighter"
          style={{ background: "var(--badge-error-bg)", color: "var(--badge-error-text)" }}
        >
          <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: "var(--badge-error-text)" }} />
          Live Now
        </span>
        <span
          className="text-[8px] font-bold px-1.5 py-[1px] rounded uppercase tracking-tighter"
          style={{ background: "var(--badge-success-bg)", color: "var(--badge-success-text)" }}
        >
          Free
        </span>
      </div>

      <h3 className="text-[12px] font-semibold leading-tight mb-3 flex-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>
        RRB NTPC 2024 Phase 1 Special Live Mock Test
      </h3>

      <div className="flex items-center justify-between text-[9px] font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>2h Left</span>
        </div>
        <div className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          <Users className="h-3 w-3" />
          <span>1,240</span>
        </div>
      </div>

      <button
        className="w-full h-7 text-white rounded-lg text-[10px] font-semibold uppercase tracking-widest active:scale-95 transition-all"
        style={{ background: "#FF6B2B" }}
      >
        Join Now
      </button>
    </div>
  );
}

/** 4. Category Grid Item (Professional & Compact) */
function CategoryGridItem({ series, categoryName }: { series: any; categoryName: string }) {
  return (
    <Link
      href={`/${series.slug || series.id}`}
      className="rounded-lg p-3 flex items-center gap-3 transition-all group active:scale-[0.99]"
      style={{
        background: "var(--bg-card)",
        border: "var(--border-card)",
      }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center p-1.5 shrink-0 transition-colors"
        style={{ background: "var(--bg-main)", border: "var(--border-card)" }}
      >
        {series.icon ? (
          <Image src={series.icon} alt={series.name} width={20} height={20} className="object-contain" />
        ) : (
          <FileText className="h-4 w-4" style={{ color: "#FF6B2B" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[12px] font-semibold leading-tight truncate transition-colors mb-0.5 line-clamp-1" style={{ color: "var(--text-primary)" }}>
          {series.name}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-medium">
          <span style={{ color: "var(--text-muted)" }}>{series.testsCount} Tests</span>
          <span style={{ color: "var(--badge-success-text)" }}>{series.freeTestCount || 0} Free</span>
        </div>
      </div>
      <div
        className="h-7 px-2.5 rounded-md text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center transition-all"
        style={{
          background: "rgba(255,107,43,0.08)",
          color: "#FF6B2B",
        }}
      >
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
  const [enrolledSeries, setEnrolledSeries] = useState<any[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [foldersRes, seriesRes, enrollRes, profileRes] = await Promise.all([
          apiFetch("/mockbook/folders"),
          apiFetch("/mockbook/categories"),
          apiFetch("/mockbook/enrollments/my").catch(() => ({ data: [] })),
          apiFetch("/students/me").catch(() => null)
        ]);

        const fetchedFolders = foldersRes.data || [];
        setFolders(fetchedFolders);
        setStudentProfile(profileRes?.data || null);

        let allFetchedSeries: any[] = [];
        if (seriesRes.success) {
          allFetchedSeries = seriesRes.data || [];
          const grouped: Record<string, any[]> = {};
          allFetchedSeries.forEach((s: any) => {
            const fId = s.folderId || "other";
            if (!grouped[fId]) grouped[fId] = [];
            grouped[fId].push(s);
          });
          setSeriesByFolder(grouped);
        }

        // Get enrolled series
        const enrolledIds = new Set((enrollRes.data || []).map((e: any) => e.seriesId));
        const filteredEnrolled = allFetchedSeries.filter((s: any) => enrolledIds.has(s.id));
        setEnrolledSeries(filteredEnrolled);

      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isEnrolled = enrolledSeries.length > 0;
  
  // Logic for display:
  // 1. If enrolled: Show only enrolled tests
  // 2. If NOT enrolled: Show suggestions (based on targetExamId)
  
  let displaySeries = enrolledSeries;
  let sectionTitle = "Your Enrolled Test Series";
  
  if (!isEnrolled && !loading) {
    sectionTitle = "Recommended for Your Exam";
    const allAvailable = Object.values(seriesByFolder).flat();
    
    if (studentProfile?.targetExamId) {
      // Suggest tests from the same folder
      displaySeries = allAvailable.filter(s => s.folderId === studentProfile.targetExamId);
    } 
    
    // Fallback: If no specific target or no matches, show featured or all
    if (displaySeries.length === 0) {
      displaySeries = allAvailable.filter(s => s.isFeatured).slice(0, 6);
      if (displaySeries.length === 0) displaySeries = allAvailable.slice(0, 6);
    }
  }

  const currentSeries = activeFolderId === "all" 
    ? displaySeries 
    : displaySeries.filter(s => s.folderId === activeFolderId);

  const filteredSeries = currentSeries.filter(s =>
    s.name.toLowerCase().includes(testSearch.toLowerCase())
  );

  return (
    <div
      className="flex flex-col min-h-screen font-sans antialiased"
      style={{
        background: "var(--bg-body)",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main
          className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-10"
          style={{ background: "var(--bg-main)" }}
        >
          {/* SEARCH HEADER - Compact & Refined */}
          <div
            className="px-4 py-3 md:px-6"
            style={{
              background: "var(--bg-sidebar)",
              borderBottom: "var(--divider)",
            }}
          >
            <div className="max-w-3xl mx-auto relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search your exam (e.g. SSC CGL, RRB NTPC...)"
                value={testSearch}
                onChange={e => setTestSearch(e.target.value)}
                className="w-full h-9 pl-10 pr-4 rounded-md text-[12px] font-medium transition-all"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-input)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-10">

            {isEnrolled && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF6B2B" }} />
                    Your Recent Test Series
                  </h2>
                  <Link href="/analytics" className="text-[11px] font-semibold hover:underline flex items-center gap-1" style={{ color: "#FF6B2B" }}>
                    View all Attempted Tests <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[260px] h-44 rounded-lg animate-pulse shrink-0"
                        style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
                      />
                    ))
                  ) : enrolledSeries.length > 0 ? (
                    enrolledSeries.slice(0, 4).map(s => (
                      <RecentSeriesCard key={s.id} series={s} categoryName="Exam" />
                    ))
                  ) : (
                    <div
                      className="w-full py-10 rounded-lg flex flex-col items-center justify-center italic text-sm"
                      style={{ background: "var(--bg-card)", border: "var(--border-card)", color: "var(--text-muted)" }}
                    >
                      No recent tests found. Start your first test now!
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 2. ENROLLED/SUGGESTED TEST SERIES */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF6B2B" }} />
                  {sectionTitle}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 rounded-lg animate-pulse"
                      style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
                    />
                  ))
                ) : displaySeries.length > 0 ? (
                  displaySeries.slice(0, 6).map(s => (
                    <EnrolledSeriesItem key={s.id} series={s} />
                  ))
                ) : (
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 rounded-lg border-dashed"
                      style={{ background: "var(--bg-card)", border: "var(--border-card)", opacity: 0.5 }}
                    />
                  ))
                )}
              </div>
            </section>

            {/* 3. LIVE TESTS & FREE QUIZZES */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF6B2B" }} />
                  Live Tests & <span style={{ color: "#FF6B2B" }}>Free</span> Quizzes
                </h2>
                <Link href="#" className="text-[11px] font-semibold hover:underline flex items-center gap-1" style={{ color: "#FF6B2B" }}>
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
                {[...Array(3)].map((_, i) => (
                  <LiveQuizCard key={i} quiz={{}} />
                ))}
              </div>
            </section>

            {/* 4. TEST SERIES BY CATEGORIES */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[18px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF6B2B" }} />
                  Test Series by Categories
                </h2>
              </div>

              {/* Category Filter Tabs - Refined */}
              <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-2">
                <button
                  onClick={() => setActiveFolderId("all")}
                  className={cn(
                    "px-3.5 h-7 flex items-center justify-center rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                    activeFolderId === "all"
                      ? "text-white"
                      : "hover:opacity-80"
                  )}
                  style={{
                    background: activeFolderId === "all" ? "#FF6B2B" : "var(--bg-card)",
                    color: activeFolderId === "all" ? "#FFFFFF" : "var(--text-secondary)",
                    border: activeFolderId === "all" ? "none" : "var(--border-card)",
                  }}
                >
                  All Exams
                </button>
                {folders.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFolderId(cat.id)}
                    className={cn(
                      "px-3.5 h-7 flex items-center justify-center rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                      activeFolderId === cat.id
                        ? "text-white"
                        : "hover:opacity-80"
                    )}
                    style={{
                      background: activeFolderId === cat.id ? "#FF6B2B" : "var(--bg-card)",
                      color: activeFolderId === cat.id ? "#FFFFFF" : "var(--text-secondary)",
                      border: activeFolderId === cat.id ? "none" : "var(--border-card)",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-lg animate-pulse"
                      style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
                    />
                  ))
                ) : filteredSeries.length > 0 ? (
                  filteredSeries.map(s => (
                    <CategoryGridItem key={s.id} series={s} categoryName={folders.find(f => f.id === s.folderId)?.name || "Exam"} />
                  ))
                ) : (
                  <div
                    className="col-span-full rounded-lg p-10 text-center border-2 border-dashed"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-input)" }}
                  >
                    <p className="font-semibold mb-3" style={{ color: "var(--text-muted)" }}>No test series found in this category.</p>
                    <button onClick={() => setActiveFolderId("all")} className="font-bold hover:underline" style={{ color: "#FF6B2B" }}>Explore All Exams →</button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
