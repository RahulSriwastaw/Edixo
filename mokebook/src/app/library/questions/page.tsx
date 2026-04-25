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
  { id: "quant", title: "Quantitative Aptitude", count: 28, icon: Calculator },
  { id: "gk", title: "General Knowledge", count: 20, icon: Globe },
  { id: "science", title: "General Science", count: 9, icon: Zap },
  { id: "reasoning", title: "Logical Reasoning", count: 8, icon: BrainCircuit },
  { id: "ca", title: "Current Affairs", count: 4, icon: Newspaper },
  { id: "di", title: "Data Interpretation", count: 2, icon: BarChart3 },
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
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="px-3 md:px-4 py-3 sticky top-0 z-20" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
            <div className="max-w-5xl mx-auto space-y-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-lg" style={{ color: "var(--text-muted)" }}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-base md:text-lg font-bold leading-tight tracking-tight">Saved Questions</h1>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#FF6B2B" }}>71 Bookmarks Total</p>
                </div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" style={{ borderColor: "var(--btn-secondary-border)" }}>
                  <Filter className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                <Input
                  placeholder="Search in your saved questions..."
                  className="pl-9 h-9 rounded-lg text-[12px]"
                  style={{ background: "var(--bg-input)", border: "var(--border-input)" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="max-w-5xl mx-auto p-3 md:p-4 space-y-6 pb-20">
            {/* Category Grid */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 rounded-full" style={{ background: "#FF6B2B" }} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Question Categories</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <Card key={cat.id} className="cursor-pointer rounded-lg group overflow-hidden card-hover" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6" style={{ background: "var(--bg-main)" }}>
                        <cat.icon className="h-4.5 w-4.5" style={{ color: "#FF6B2B" }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[11px] font-bold line-clamp-1 leading-tight" style={{ color: "var(--text-primary)" }}>{cat.title}</h3>
                        <p className="text-[10px] font-bold mt-0.5" style={{ color: "var(--text-muted)" }}>{cat.count} Questions</p>
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
                  <div className="w-1 h-4 rounded-full" style={{ background: "#FF6B2B" }} />
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: "var(--text-muted)" }}>Recently Saved</h2>
                </div>
                <Button variant="link" className="text-[10px] font-bold h-auto p-0" style={{ color: "#FF6B2B" }}>View Timeline</Button>
              </div>

              <div className="space-y-3">
                {savedQuestions.map((q) => (
                  <Card key={q.id} className="rounded-lg cursor-pointer group card-hover" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                    <CardContent className="p-4 md:p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,107,43,0.08)" }}>
                              <HelpCircle className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Question #{q.id}</span>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-[14px] md:text-base font-bold leading-snug transition-colors" style={{ color: "var(--text-primary)" }}>
                              {q.text}
                            </h4>

                            {q.hasImage && (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-main)", border: "var(--border-card)" }}>
                                <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg shrink-0" style={{ color: "var(--text-muted)" }}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderTop: "var(--divider)" }}>
                        <div className="flex items-center gap-2 text-[10px] font-medium min-w-0">
                          <Bookmark className="h-3 w-3 shrink-0" style={{ color: "#FF6B2B" }} />
                          <p className="truncate italic" style={{ color: "var(--text-muted)" }}>
                            {q.category}
                          </p>
                        </div>
                        <span className="text-[9px] font-bold uppercase whitespace-nowrap self-start sm:self-center px-2 py-1 rounded-lg" style={{ background: "var(--bg-main)", color: "var(--text-muted)" }}>
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
