
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  HelpCircle, 
  MoreVertical, 
  Search, 
  Filter, 
  Calculator, 
  Globe, 
  Zap, 
  BrainCircuit, 
  Newspaper, 
  BarChart3,
  Bookmark
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const categories = [
  { id: "quant", title: "Quantitative Aptitude", count: 28, icon: Calculator, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "gk", title: "General Knowledge", count: 20, icon: Globe, color: "text-purple-500", bg: "bg-purple-50" },
  { id: "science", title: "General Science", count: 9, icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "reasoning", title: "Logical Reasoning", count: 8, icon: BrainCircuit, color: "text-green-500", bg: "bg-green-50" },
  { id: "ca", title: "Current Affairs", count: 4, icon: Newspaper, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "di", title: "Data Interpretation", count: 2, icon: BarChart3, color: "text-pink-500", bg: "bg-pink-50" },
];

const savedQuestions = [
  {
    id: 1,
    text: "Which pattern resembles closer to?",
    category: "Analogy | RRC Group D Previous Year Paper 1 (Held On: 27 Nov, 2025 Shift 1)",
    hasImage: true,
    date: "2 days ago"
  },
  {
    id: 2,
    text: "If sec⁴θ - sec²θ = 3 then the value of tan⁴θ + tan²θ is:",
    category: "Trigonometry | RRC Group D Previous Year Paper 1 (Held On: 27 Nov, 2025 Shift 1)",
    hasImage: false,
    date: "1 week ago"
  },
  {
    id: 3,
    text: "Name the badminton player who won his maiden Super Series title in Singapore in 2017.",
    category: "Sports | RRC Group D Previous Year Paper 1 (Held On: 27 Nov, 2025 Shift 1)",
    hasImage: false,
    date: "2 weeks ago"
  },
  {
    id: 4,
    text: "Dayanand Saraswati was the founder of which of the following missions?",
    category: "Modern India (Pre-Congress Phase) | RRC Group D Previous Year Paper 1 (Held On: 27 Nov, 2025 Shift 1)",
    hasImage: false,
    date: "1 month ago"
  }
];

export default function LibraryQuestionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="bg-white border-b p-3 md:p-4 sticky top-0 z-20 shadow-sm">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-lg text-slate-500">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-base md:text-lg font-headline font-bold text-slate-900 leading-tight tracking-tight">Saved Questions</h1>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">71 Bookmarks Total</p>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 shadow-sm">
                  <Filter className="h-3.5 w-3.5 text-slate-500" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  placeholder="Search in your saved questions..." 
                  className="pl-9 h-9 bg-slate-50 border-none rounded-xl focus-visible:ring-primary text-xs shadow-inner" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="max-w-5xl mx-auto p-3 md:p-4 space-y-8 pb-20">
            {/* Category Grid */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Question Categories</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {categories.map((cat) => (
                  <Card key={cat.id} className="border-none shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer rounded-2xl group overflow-hidden bg-white">
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6", cat.bg)}>
                        <cat.icon className={cn("h-4.5 w-4.5", cat.color)} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[11px] font-bold text-slate-800 line-clamp-1 leading-tight">{cat.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{cat.count} Questions</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Questions List */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recently Saved</h2>
                </div>
                <Button variant="link" className="text-[10px] font-bold text-primary p-0 h-auto">View Timeline</Button>
              </div>

              <div className="space-y-3">
                {savedQuestions.map((q) => (
                  <Card key={q.id} className="border-none shadow-sm rounded-[1.5rem] hover:shadow-md transition-all cursor-pointer group bg-white">
                    <CardContent className="p-4 md:p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center">
                              <HelpCircle className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Question #{q.id}</span>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="text-[14px] md:text-base font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">
                              {q.text}
                            </h4>
                            
                            {q.hasImage && (
                              <div className="w-10 h-10 rounded-lg border-2 border-slate-100 bg-slate-50 flex items-center justify-center">
                                <Filter className="h-4 w-4 text-slate-300" />
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600 rounded-xl shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 min-w-0">
                          <Bookmark className="h-3 w-3 text-primary shrink-0" />
                          <p className="truncate italic">
                            {q.category}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 uppercase whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg self-start sm:self-center">
                          {q.date}
                        </span>
                      </div>
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
