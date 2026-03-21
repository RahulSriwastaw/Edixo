"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Zap, 
  Award, 
  TrendingUp, 
  ChevronLeft,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const mySeries = [
  { id: 1, name: "RRB Group D Mock Test Series", progress: 45, tests: 45, totalTests: 100, icon: Zap, color: "bg-red-500", status: "active", lastActivity: "2h ago", image: "https://picsum.photos/seed/myrrb/640/360" },
  { id: 2, name: "SSC CGL Tier-I Mega Pack", progress: 12, tests: 12, totalTests: 45, icon: Award, color: "bg-blue-500", status: "active", lastActivity: "1d ago", image: "https://picsum.photos/seed/myssc/640/360" },
  { id: 3, name: "Current Affairs 2024 Daily", progress: 88, tests: 88, totalTests: 100, icon: TrendingUp, color: "bg-orange-500", status: "active", lastActivity: "3h ago", image: "https://picsum.photos/seed/myca/640/360" },
  { id: 4, name: "Physics: Master the Laws of Motion", progress: 100, tests: 20, totalTests: 20, icon: Zap, color: "bg-green-500", status: "completed", lastActivity: "5d ago", image: "https://picsum.photos/seed/myphys/640/360" },
  { id: 5, name: "General Intelligence & Reasoning", progress: 60, tests: 30, totalTests: 50, icon: Award, color: "bg-purple-500", status: "active", lastActivity: "4d ago", image: "https://picsum.photos/seed/myreason/640/360" },
];

export default function MySeriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSeries = mySeries.filter(series => 
    series.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6 space-y-6 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col gap-4">
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="h-7 px-0 text-[11px] font-bold text-muted-foreground hover:bg-transparent hover:text-primary transition-colors" asChild>
                  <Link href="/tests">
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back to Catalog
                  </Link>
                </Button>
                <h1 className="text-xl md:text-2xl font-headline font-bold text-slate-900">My Test Series</h1>
                <p className="text-xs text-muted-foreground font-medium tracking-tight">Tracking {mySeries.length} enrolled preparations.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search your mocks..." 
                    className="pl-10 h-11 text-sm bg-white border-primary/10 shadow-sm rounded-xl focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="h-11 w-full sm:w-auto px-5 text-xs font-bold border-primary/10 bg-white rounded-xl shadow-sm">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSeries.map((series) => (
                <Link key={series.id} href={`/tests/series/${series.id}`} className="group block">
                  <Card className="hover:shadow-lg transition-all border-none bg-white relative overflow-hidden flex flex-col shadow-sm h-full cursor-pointer">
                    <div className="relative aspect-video w-full">
                      <Image 
                        src={series.image}
                        alt={series.name}
                        fill
                        className="object-cover"
                        data-ai-hint="study materials"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      <div className={cn("absolute top-0 left-0 w-full h-1", series.color)} />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                        <div className={cn("p-1.5 rounded-lg text-white shadow-md", series.color)}>
                          <series.icon className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[9px] font-bold uppercase h-5 px-2",
                            series.status === "completed" ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"
                          )}
                        >
                          {series.status === "completed" ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</span>
                          ) : "In Progress"}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{series.lastActivity}</span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm md:text-[15px] font-bold leading-snug group-hover:text-primary transition-colors min-h-[44px] line-clamp-2">
                          {series.name}
                        </h3>
                      </div>

                      <div className="space-y-2.5 mt-auto pt-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500 font-mono">{series.tests}/{series.totalTests} Tests</span>
                          <span className="text-primary">{series.progress}%</span>
                        </div>
                        <Progress value={series.progress} className="h-1.5 bg-slate-100" />
                      </div>

                      <div className="w-full h-9 flex items-center justify-center text-xs font-bold rounded-xl mt-3 shadow-sm bg-slate-900 text-white group-hover:bg-primary transition-all">
                        {series.status === "completed" ? "Review Analysis" : "Continue Test"}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-5 px-4 w-full">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <Search className="h-10 w-10" />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <h3 className="font-bold text-lg text-slate-900">No series found</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">We couldn't find any results for "{searchQuery}". Check the spelling or browse our full catalog.</p>
                </div>
                <Button size="lg" className="h-11 px-8 text-xs font-bold bg-primary rounded-xl shadow-lg shadow-primary/20" asChild>
                  <Link href="/tests">Browse Full Catalog</Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}