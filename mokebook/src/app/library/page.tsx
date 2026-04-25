
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  PlayCircle,
  BookOpen,
  FileText,
  ClipboardList,
  Newspaper,
  HelpCircle,
  GraduationCap,
  Download,
  AlertTriangle,
  MoreVertical,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const libraryCategories = [
  { id: "videos", title: "Videos", count: "0 Videos", icon: PlayCircle, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/videos" },
  { id: "lessons", title: "Lessons", count: "0 Lessons", icon: GraduationCap, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/lessons" },
  { id: "class-notes", title: "Class Notes", count: "0 Notes", icon: FileText, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/class-notes" },
  { id: "study-notes", title: "Study Notes", count: "0 Notes", icon: BookOpen, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/study-notes" },
  { id: "articles", title: "Articles", count: "0 Articles", icon: ClipboardList, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/articles" },
  { id: "saved-news", title: "Saved News", count: "0 News", icon: Newspaper, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/saved-news" },
  { id: "questions", title: "Questions", count: "71 Items", icon: HelpCircle, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/questions" },
  { id: "tests", title: "Tests", count: "0 Tests", icon: GraduationCap, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/tests" },
  { id: "downloads", title: "Downloads", count: "0 Files", icon: Download, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/downloads" },
  { id: "reported", title: "Reported", count: "0 Issues", icon: AlertTriangle, color: "text-[#FF6B2B]", bg: "bg-[rgba(255,107,43,0.08)]", href: "/library/reported" },
];

const recentlySaved = [
  {
    id: 1,
    text: "Which pattern resembles closer to?...",
    category: "Analogy | RRC Group D Paper 1",
    icon: HelpCircle,
    iconColor: "text-[#FF6B2B]",
    bg: "bg-[rgba(255,107,43,0.08)]"
  },
  {
    id: 2,
    text: "If sec⁴θ - sec²θ = 3 then the value of tan⁴θ + tan²θ is:",
    category: "Trigonometry | RRC Group D Paper...",
    icon: HelpCircle,
    iconColor: "text-[#FF6B2B]",
    bg: "bg-[rgba(255,107,43,0.08)]"
  }
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="sticky top-0 z-20 px-3 md:px-4 py-3" style={{ background: "var(--bg-sidebar)", borderBottom: "var(--divider)" }}>
            <div className="max-w-5xl mx-auto space-y-3">
              <div className="flex items-center justify-between px-1">
                <h1 className="text-[18px] font-bold tracking-tight">My Library</h1>
                <Button variant="ghost" size="sm" className="text-[11px] font-bold h-7 px-2" style={{ color: "#FF6B2B" }}>
                  Storage: 12% Used
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                <Input
                  placeholder="Quick search saved items..."
                  className="pl-9 h-9 rounded-lg text-[12px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </header>

          <div className="max-w-5xl mx-auto p-3 md:p-4 space-y-6">
            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {libraryCategories.map((cat) => (
                <Link key={cat.id} href={cat.href}>
                  <Card className="cursor-pointer rounded-lg overflow-hidden group h-full card-hover">
                    <CardContent className="p-2.5 flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors", cat.bg)}>
                        <cat.icon className={cn("h-4 w-4", cat.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[11px] font-bold truncate leading-none" style={{ color: "var(--text-primary)" }}>{cat.title}</h3>
                        <p className="text-[9px] font-bold uppercase tracking-tighter mt-1" style={{ color: "var(--text-muted)" }}>{cat.count}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <Bookmark className="h-3 w-3" style={{ color: "#FF6B2B" }} /> Recently Saved
                </h2>
                <Button variant="link" className="h-auto p-0 text-[10px] font-bold" style={{ color: "#FF6B2B" }}>View All</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentlySaved.map((item) => (
                  <Card key={item.id} className="rounded-lg card-hover">
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.bg)}>
                        <item.icon className={cn("h-4 w-4", item.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-[13px] font-bold line-clamp-1 transition-colors" style={{ color: "var(--text-primary)" }}>
                          {item.text}
                        </h4>
                        <p className="text-[10px] font-medium truncate" style={{ color: "var(--text-muted)" }}>
                          {item.category}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" style={{ color: "var(--text-muted)" }}>
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
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
