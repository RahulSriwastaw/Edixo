const fs = require('fs');

const content = `"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  ChevronRight,
  Clock,
  HelpCircle,
  Calendar,
  Lock,
  PlayCircle,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Users,
  ChevronLeft,
  Loader2,
  Star,
  Zap,
  ShieldCheck,
  FileText
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MockTestItem {
  id: string;
  testId: string;
  name: string;
  durationMins: number;
  totalMarks: number;
  status: string;
  isPublic: boolean;
  scheduledAt?: string;
  attempts?: number;
}

interface SubCategory {
  id: string;
  name: string;
  mockTests: MockTestItem[];
}

interface CategoryDetail {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  subCategories: SubCategory[];
}

export default function SeriesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(\`/mockbook/categories/\${id}\`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load series:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const allTests: (MockTestItem & { subCategoryName: string })[] = data?.subCategories?.flatMap(
    sc => sc.mockTests.map(t => ({ ...t, subCategoryName: sc.name }))
  ) || [];

  const filteredTests = activeTab === "all"
    ? allTests
    : allTests.filter(t => t.subCategoryName.toLowerCase() === activeTab.toLowerCase());

  const totalTests = allTests.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          
          {loading ? (
            <div className="py-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a73e8]" />
            </div>
          ) : !data ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-base font-bold text-gray-900">Series not found</p>
              <p className="text-sm font-medium text-gray-500 mt-1 mb-6">The test series might have been moved or deleted.</p>
              <button 
                onClick={() => router.push("/tests")} 
                className="bg-[#1a73e8] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#1557b0]"
              >
                Browse All Tests
              </button>
            </div>
          ) : (
            <>
              {/* Breadcrumb & Header */}
              <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-2.5 flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <Link href="/tests" className="hover:text-[#1a73e8] transition-colors">Test Series</Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-gray-900 line-clamp-1">{data.name}</span>
                </div>
                
                <div className="px-6 py-6 md:py-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex items-center gap-2">
                      {data.isFree ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black tracking-widest px-2 py-0.5 rounded">
                          FREE ACCESS
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-black tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" /> PREMIUM
                        </span>
                      )}
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {data.name}
                    </h1>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {data.description || "Master your target exam with this comprehensive mock series. Designed by experts based on the latest 2025 exam patterns."}
                    </p>

                    <div className="flex flex-wrap items-center gap-5 pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <BookOpen className="h-4 w-4 text-[#1a73e8]" />
                        {totalTests} Tests
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <Users className="h-4 w-4 text-[#1a73e8]" />
                        12K+ Aspirants
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                        4.9 Rating
                      </div>
                    </div>
                  </div>

                  {!data.isFree && (
                    <div className="shrink-0">
                      <button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold h-11 px-8 rounded transition-colors w-full md:w-auto text-sm">
                        Unlock Full Series
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-start max-w-[1400px] mx-auto">
                <div className="w-full lg:flex-1 min-w-0 space-y-4">
                  
                  {/* Tabs */}
                  <div className="bg-white border text-sm border-gray-200 rounded overflow-x-auto no-scrollbar flex items-center">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={cn(
                        "px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2",
                        activeTab === "all" ? "border-[#1a73e8] text-[#1a73e8]" : "border-transparent text-gray-600 hover:text-gray-900"
                      )}
                    >
                      All Tests ({totalTests})
                    </button>
                    {data.subCategories.map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => setActiveTab(sc.name)}
                        className={cn(
                          "px-6 py-3 font-semibold whitespace-nowrap transition-colors border-b-2",
                          activeTab === sc.name ? "border-[#1a73e8] text-[#1a73e8]" : "border-transparent text-gray-600 hover:text-gray-900"
                        )}
                      >
                        {sc.name}
                      </button>
                    ))}
                  </div>

                  {/* Test List */}
                  <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    {filteredTests.length === 0 ? (
                      <div className="py-16 text-center">
                        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-500">No tests available in this section</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredTests.map((test, i) => {
                          const isLive = test.status === "LIVE";
                          const isAccessible = data.isFree || test.isPublic;
                          return (
                            <div key={test.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-400 text-sm shrink-0">
                                  {i + 1}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {isLive ? (
                                      <span className="bg-red-500 text-white text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded animate-pulse">LIVE NOW</span>
                                    ) : null}
                                    {!isAccessible && (
                                      <span className="bg-gray-100 text-gray-500 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <Lock className="h-2 w-2" /> LOCKED
                                      </span>
                                    )}
                                    {test.attempts && test.attempts > 0 ? (
                                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <CheckCircle2 className="h-2 w-2" /> COMPLETED
                                      </span>
                                    ) : null}
                                  </div>
                                  <h3 className="font-bold text-sm text-gray-900 leading-snug">{test.name}</h3>
                                  <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" /> {test.durationMins} Mins</span>
                                    <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3 text-gray-400" /> {test.totalMarks} Marks</span>
                                    {test.scheduledAt && (
                                      <span className="flex items-center gap-1 text-[#1a73e8]">
                                        <Calendar className="h-3 w-3" /> Available: {new Date(test.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="shrink-0 ml-14 md:ml-0">
                                {isAccessible ? (
                                  <button
                                    onClick={() => router.push(\`/tests/instructions/\${test.testId}\`)}
                                    className="bg-white border border-[#1a73e8] text-[#1a73e8] hover:bg-blue-50 font-bold text-xs h-8 px-6 rounded transition-colors flex items-center gap-1.5 w-full md:w-auto justify-center"
                                  >
                                    {test.attempts && test.attempts > 0 ? "Retake" : "Start"}
                                    <PlayCircle className="h-3.5 w-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="bg-gray-100 text-gray-400 font-bold text-xs h-8 px-6 rounded cursor-not-allowed flex items-center gap-1.5 w-full md:w-auto justify-center"
                                  >
                                    Unlock
                                    <Lock className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar */}
                <aside className="w-full lg:w-[320px] shrink-0 space-y-4">
                  <div className="bg-white border border-gray-200 rounded p-5">
                    <div className="inline-flex items-center gap-1.5 text-[#1a73e8] text-[10px] font-black uppercase tracking-widest mb-2">
                      <Sparkles className="h-3 w-3" />
                      Platform Benefits
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-4">Why study with us?</h3>
                    
                    <div className="space-y-4 mb-5">
                      {[
                        { icon: Zap, label: "Latest Exam Pattern", desc: "Updated for 2025 exam formats.", color: "text-[#1a73e8]" },
                        { icon: ShieldCheck, label: "Real Exam Feel", desc: "Interface matches the actual portal.", color: "text-[#1a73e8]" },
                        { icon: BarChart3, label: "Detailed Solutions", desc: "In-depth explanations for all questions.", color: "text-[#1a73e8]" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <item.icon className={cn("h-4 w-4", item.color)} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{item.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button className="w-full bg-white border border-gray-300 text-gray-700 font-bold text-xs h-9 rounded hover:bg-gray-50 transition-colors">
                      View Sample Analysis
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded p-5 text-center">
                    <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Need Guidance?</h4>
                    <p className="text-xs text-gray-500 mb-4">Our expert mentors are available to help you with your preparation strategy.</p>
                    <button className="w-full bg-white border border-gray-300 text-gray-700 font-bold text-xs h-9 rounded hover:bg-gray-50 transition-colors">
                      Talk to a Mentor
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/app/tests/series/[id]/page.tsx', content, 'utf8');
console.log('OK');
