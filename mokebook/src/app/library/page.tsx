
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
  { id: "videos", title: "Videos", count: "0 Videos", icon: PlayCircle, color: "text-red-500", bg: "bg-red-50", href: "/library/videos" },
  { id: "lessons", title: "Lessons", count: "0 Lessons", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50", href: "/library/lessons" },
  { id: "class-notes", title: "Class Notes", count: "0 Notes", icon: FileText, color: "text-pink-500", bg: "bg-pink-50", href: "/library/class-notes" },
  { id: "study-notes", title: "Study Notes", count: "0 Notes", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50", href: "/library/study-notes" },
  { id: "articles", title: "Articles", count: "0 Articles", icon: ClipboardList, color: "text-green-500", bg: "bg-green-50", href: "/library/articles" },
  { id: "saved-news", title: "Saved News", count: "0 News", icon: Newspaper, color: "text-indigo-500", bg: "bg-indigo-50", href: "/library/saved-news" },
  { id: "questions", title: "Questions", count: "71 Items", icon: HelpCircle, color: "text-orange-500", bg: "bg-orange-50", href: "/library/questions" },
  { id: "tests", title: "Tests", count: "0 Tests", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-100", href: "/library/tests" },
  { id: "downloads", title: "Downloads", count: "0 Files", icon: Download, color: "text-green-600", bg: "bg-green-100", href: "/library/downloads" },
  { id: "reported", title: "Reported", count: "0 Issues", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", href: "/library/reported" },
];

const recentlySaved = [
  {
    id: 1,
    text: "Which pattern resembles closer to?...",
    category: "Analogy | RRC Group D Paper 1",
    icon: HelpCircle,
    iconColor: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    id: 2,
    text: "If sec⁴θ - sec²θ = 3 then the value of tan⁴θ + tan²θ is:",
    category: "Trigonometry | RRC Group D Paper...",
    icon: HelpCircle,
    iconColor: "text-orange-500",
    bg: "bg-orange-50"
  }
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <header className="bg-white border-b sticky top-0 z-20 px-3 md:px-4 py-3 shadow-sm">
            <div className="max-w-5xl mx-auto space-y-3">
              <div className="flex items-center justify-between px-1">
                <h1 className="text-lg md:text-xl font-headline font-bold text-slate-900 tracking-tight">My Library</h1>
                <Button variant="ghost" size="sm" className="text-primary font-bold text-[10px] h-7 px-2">
                  Storage: 12% Used
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  placeholder="Quick search saved items..."
                  className="pl-9 h-9 bg-slate-50 border-none rounded-xl focus-visible:ring-primary shadow-inner text-xs"
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
                  <Card className="border-none shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer rounded-xl overflow-hidden group h-full">
                    <CardContent className="p-2.5 flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors", cat.bg)}>
                        <cat.icon className={cn("h-4.5 w-4.5", cat.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[11px] font-bold text-slate-800 truncate leading-none">{cat.title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{cat.count}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Bookmark className="h-3 w-3 text-primary" /> Recently Saved
                </h2>
                <Button variant="link" className="h-auto p-0 text-[10px] font-bold text-primary">View All</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentlySaved.map((item) => (
                  <Card key={item.id} className="border-none shadow-sm rounded-xl hover:shadow-md transition-shadow group">
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.bg)}>
                        <item.icon className={cn("h-4 w-4", item.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-[13px] font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                          {item.text}
                        </h4>
                        <p className="text-[10px] font-medium text-slate-400 truncate">
                          {item.category}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300">
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
