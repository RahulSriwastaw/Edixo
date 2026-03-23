"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Search, Lock, ChevronRight, Loader2, BookOpen, Users, Star,
  ChevronDown, Filter, Bell, ArrowRight, Globe, FileText, X,
  Sparkles, TrendingUp, Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Category icons and gradient colors
const CATEGORY_META: Record<string, { icon: string; gradient: string; color: string }> = {
  default:     { icon: "📚", gradient: "from-indigo-500 to-indigo-700",   color: "bg-indigo-500" },
  railways:    { icon: "🚂", gradient: "from-blue-500 to-blue-700",       color: "bg-blue-500" },
  rrb:         { icon: "🚂", gradient: "from-blue-500 to-blue-700",       color: "bg-blue-500" },
  ssc:         { icon: "📋", gradient: "from-red-500 to-red-700",         color: "bg-red-500" },
  banking:     { icon: "🏦", gradient: "from-teal-500 to-teal-700",      color: "bg-teal-500" },
  insurance:   { icon: "🏦", gradient: "from-teal-500 to-teal-700",      color: "bg-teal-500" },
  defence:     { icon: "🎖️", gradient: "from-green-600 to-green-800",    color: "bg-green-600" },
  police:      { icon: "🛡️", gradient: "from-green-500 to-green-700",    color: "bg-green-500" },
  state:       { icon: "🏛️", gradient: "from-amber-500 to-amber-700",    color: "bg-amber-500" },
  teaching:    { icon: "🎓", gradient: "from-pink-500 to-pink-700",      color: "bg-pink-500" },
  civil:       { icon: "⚖️", gradient: "from-purple-500 to-purple-700",  color: "bg-purple-500" },
  upsc:        { icon: "⚖️", gradient: "from-purple-500 to-purple-700",  color: "bg-purple-500" },
  engineering: { icon: "🔧", gradient: "from-orange-500 to-orange-700",  color: "bg-orange-500" },
  gate:        { icon: "🔧", gradient: "from-orange-500 to-orange-700",  color: "bg-orange-500" },
  ncert:       { icon: "📖", gradient: "from-cyan-500 to-cyan-700",      color: "bg-cyan-500" },
  school:      { icon: "📖", gradient: "from-cyan-500 to-cyan-700",      color: "bg-cyan-500" },
};

function getCategoryMeta(name: string) {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_META)) {
    if (lower.includes(key)) return val;
  }
  return CATEGORY_META.default;
}

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest",  label: "Newest First" },
  { value: "most-tests", label: "Most Tests" },
  { value: "free-first", label: "Free First" },
];

function ComingSoonState({ categoryName, onExplore }: { categoryName: string; onExplore: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-8 mx-4 my-4 rounded-xl text-center"
      style={{ background: "linear-gradient(135deg, #FFF8F6 0%, #ffffff 100%)" }}
    >
      {/* Inline SVG Illustration */}
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
        <circle cx="80" cy="60" r="50" fill="#FFF3F0" />
        <rect x="50" y="35" width="60" height="70" rx="6" fill="white" stroke="#F4511E" strokeWidth="2" />
        <rect x="58" y="48" width="44" height="5" rx="2.5" fill="#F4511E" fillOpacity="0.3" />
        <rect x="58" y="60" width="35" height="4" rx="2" fill="#E0E0E0" />
        <rect x="58" y="70" width="30" height="4" rx="2" fill="#E0E0E0" />
        <rect x="58" y="80" width="40" height="4" rx="2" fill="#E0E0E0" />
        <circle cx="110" cy="38" r="14" fill="#F4511E" />
        <text x="110" y="43" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">🚧</text>
        <ellipse cx="80" cy="112" rx="40" ry="6" fill="#F4511E" fillOpacity="0.08" />
      </svg>

      <h3 className="text-lg font-bold text-gray-900 mb-2">Tests Coming Soon for {categoryName}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
        We're adding premium mock tests for this category. Be the first to know when they go live!
      </p>

      <button className="flex items-center gap-2 border-2 border-[#F4511E] text-[#F4511E] font-bold text-sm px-6 py-2.5 rounded-lg mb-3 hover:bg-[#FFF3F0] transition-colors">
        <Bell className="h-4 w-4" />
        Notify Me When Available
      </button>

      <div className="flex items-center gap-2 mt-1">
        <div className="h-px w-12 bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or</span>
        <div className="h-px w-12 bg-gray-200" />
      </div>

      <button
        onClick={onExplore}
        className="mt-3 text-sm font-bold text-[#F4511E] hover:underline flex items-center gap-1"
      >
        Explore other exam series <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SeriesCard({ series, categoryName }: { series: any; categoryName: string }) {
  const meta = getCategoryMeta(categoryName);
  const isNew = series.isNew;
  const isPopular = series.enrolledCount > 500;

  return (
    <Link href={`/tests/series/${series.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-full">
        {/* Gradient Header */}
        <div className={cn("relative h-28 bg-gradient-to-br flex items-end p-4", meta.gradient)}>
          {/* Badge */}
          {isNew ? (
            <span className="absolute top-3 left-3 text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-[#00C853] text-white">NEW</span>
          ) : isPopular ? (
            <span className="absolute top-3 left-3 text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-[#FF6F00] text-white">POPULAR</span>
          ) : null}

          {/* Free/Paid badge */}
          <span className={cn(
            "absolute top-3 right-3 text-[10px] font-black tracking-widest px-2 py-0.5 rounded",
            series.isFree ? "bg-[#4CAF50] text-white" : "bg-[#F4511E] text-white"
          )}>
            {series.isFree ? "FREE" : series.price ? `₹${series.price}` : "PAID"}
          </span>

          {/* Logo */}
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
            {series.icon
              ? <Image src={series.icon} alt={series.name} width={32} height={32} className="object-contain rounded-full" />
              : <BookOpen className="h-5 w-5 text-gray-400" />
            }
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-0.5">{series.name}</h3>
          <p className="text-[11px] text-gray-400 font-medium mb-3">{categoryName}</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-1 text-center text-[11px] bg-gray-50 rounded-lg p-2 mb-4">
            <div>
              <p className="font-black text-gray-900">{series.testsCount ?? "—"}</p>
              <p className="text-gray-400 font-medium">Tests</p>
            </div>
            <div className="border-x border-gray-200">
              <p className="font-black text-emerald-600">{series.freeTestCount ?? "—"}</p>
              <p className="text-gray-400 font-medium">Free</p>
            </div>
            <div>
              <Globe className="h-3 w-3 text-gray-400 mx-auto mb-0.5" />
              <p className="text-gray-400 font-medium">EN+HI</p>
            </div>
          </div>

          <div className="mt-auto">
            <div className="h-px bg-gray-100 mb-3" />
            <div className="flex items-center justify-between text-[11px] font-bold text-[#F4511E]">
              <span>View Test Series</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TestSeriesPage() {
  const [categorySearch, setCategorySearch] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string>("");
  const [folders, setFolders] = useState<any[]>([]);
  const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterFree, setFilterFree] = useState<"all" | "free" | "paid">("all");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [fRes, sRes] = await Promise.all([
          apiFetch("/mockbook/folders"),
          apiFetch("/mockbook/categories"),
        ]);
        const fetchedFolders = fRes.data || [];
        setFolders(fetchedFolders);
        if (fetchedFolders.length > 0) setActiveFolderId(fetchedFolders[0].id);

        const grouped = (sRes.data || []).reduce((acc: any, s: any) => {
          if (!acc[s.folderId]) acc[s.folderId] = [];
          acc[s.folderId].push(s);
          return acc;
        }, {});
        setSeriesByFolder(grouped);
      } catch (err) {
        console.error("Failed to load tests data", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filteredFolders = folders.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const activeCat = folders.find(f => f.id === activeFolderId);
  const activeMeta = activeCat ? getCategoryMeta(activeCat.name) : CATEGORY_META.default;

  let activeSeries = seriesByFolder[activeFolderId] || [];

  // Apply free/paid filter
  if (filterFree === "free") activeSeries = activeSeries.filter(s => s.isFree);
  if (filterFree === "paid") activeSeries = activeSeries.filter(s => !s.isFree);

  // Apply sort
  if (sort === "newest") activeSeries = [...activeSeries].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  if (sort === "most-tests") activeSeries = [...activeSeries].sort((a, b) => (b.testsCount ?? 0) - (a.testsCount ?? 0));
  if (sort === "free-first") activeSeries = [...activeSeries].sort((a, b) => (a.isFree ? 0 : 1) - (b.isFree ? 0 : 1));
  // popular = default order

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex flex-col">

          {/* Page title bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-base font-bold text-gray-900">Mock Test Series</h1>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                placeholder="Search tests, topics..."
                className="pl-9 pr-4 h-8 bg-gray-50 border border-gray-200 rounded-lg text-sm w-52 focus:outline-none focus:border-[#F4511E] focus:ring-1 focus:ring-[#F4511E]/20 transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32 flex-1">
              <Loader2 className="h-8 w-8 animate-spin text-[#F4511E]" />
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">

              {/* LEFT: Redesigned Category Sidebar */}
              <div
                className="w-56 flex-shrink-0 bg-white border-r border-gray-200 sticky top-[49px] self-start overflow-y-auto no-scrollbar flex flex-col"
                style={{ maxHeight: "calc(100vh - 49px)" }}
              >
                {/* Sidebar search */}
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      className="w-full pl-8 pr-3 h-8 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F4511E]"
                    />
                  </div>
                </div>

                <p className="px-4 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Exam Categories
                </p>

                <div className="flex flex-col pb-4">
                  {/* All Exams pill */}
                  <button
                    onClick={() => setActiveFolderId(folders[0]?.id || "")}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left relative",
                      activeFolderId === (folders[0]?.id || "")
                        ? "bg-[#F4511E] text-white font-bold"
                        : "text-gray-700 hover:bg-[#FFF3F0] font-medium"
                    )}
                  >
                    {activeFolderId === (folders[0]?.id || "") && (
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r" />
                    )}
                    <span className="flex items-center gap-2.5">
                      <span>🏠</span>
                      <span className="truncate">All Exams</span>
                    </span>
                  </button>

                  {filteredFolders.map(cat => {
                    const m = getCategoryMeta(cat.name);
                    const isActive = activeFolderId === cat.id;
                    const count = (seriesByFolder[cat.id] || []).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveFolderId(cat.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all text-left relative",
                          isActive
                            ? "bg-[#F4511E] text-white font-bold"
                            : "text-gray-700 hover:bg-[#FFF3F0] font-medium hover:border-l-[3px] hover:border-[#F4511E]"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-white rounded-r" />
                        )}
                        <span className="flex items-center gap-2.5">
                          <span>{m.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {count > 0 && (
                          <span className={cn(
                            "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                            isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                          )}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Main content */}
              <div className="flex-1 min-w-0 overflow-y-auto">

                {/* Sub-header with sort + filter */}
                <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
                  <p className="text-xs font-bold text-gray-500">
                    Showing <span className="text-gray-900">{activeSeries.length}</span> series
                    {activeCat ? ` for ${activeCat.name}` : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Sort */}
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        className="h-8 pl-3 pr-7 text-xs font-bold border border-gray-200 rounded-lg bg-white text-gray-700 appearance-none focus:outline-none focus:border-[#F4511E] cursor-pointer"
                      >
                        {SORT_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Filter button */}
                    <button
                      onClick={() => setFilterOpen(true)}
                      className="h-8 px-3 flex items-center gap-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:border-[#F4511E] hover:text-[#F4511E] transition-colors"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                      {filterFree !== "all" && (
                        <span className="w-1.5 h-1.5 bg-[#F4511E] rounded-full" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Filter drawer overlay */}
                {filterOpen && (
                  <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/30" onClick={() => setFilterOpen(false)} />
                    <div className="w-72 bg-white h-full shadow-2xl p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Filter Series</h3>
                        <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-900">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Access Type</p>
                      <div className="flex gap-2 mb-6">
                        {([["all", "All"], ["free", "Free"], ["paid", "Paid"]] as const).map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => setFilterFree(val)}
                            className={cn(
                              "px-4 py-1.5 text-xs font-bold rounded-full border transition-all",
                              filterFree === val
                                ? "bg-[#F4511E] text-white border-[#F4511E]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-[#F4511E]"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="mt-auto flex gap-3">
                        <button
                          onClick={() => { setFilterFree("all"); setFilterOpen(false); }}
                          className="flex-1 h-9 text-sm font-bold border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="flex-1 h-9 text-sm font-bold bg-[#F4511E] text-white rounded-lg hover:bg-[#D03B12]"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Series grid or empty state */}
                {activeSeries.length > 0 ? (
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSeries.map(series => (
                      <SeriesCard key={series.id} series={series} categoryName={activeCat?.name || ""} />
                    ))}
                  </div>
                ) : (
                  <ComingSoonState
                    categoryName={activeCat?.name || "this category"}
                    onExplore={() => { if (folders.length > 0) setActiveFolderId(folders[0].id); }}
                  />
                )}

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
