"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Bot, BarChart3, BookOpen,
  Trophy, Flame, TrendingUp, Clock,
  Users, Sparkles, ChevronRight, Play, Layers, PenLine,
  Cpu, Quote, CheckCircle2, Star, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useOrganization } from "@/providers/OrganizationProvider";

/* ═══ COUNTUP HOOK ═══════════════════════════ */
function useCountUp(target: number, duration = 2000, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let s: number | null = null;
    const raf = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

/* ═══ TYPED TEXT HOOK ════════════════════════ */
function useTyped(words: string[], speed = 80, pause = 1800) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = words[wordIdx % words.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) setTimeout(() => setDeleting(true), pause);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setWordIdx((i) => i + 1); }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, speed, pause]);
  return text;
}

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { org, loading: orgLoading } = useOrganization();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && !isUserLoading) {
      router.push("/tests");
    }
  }, [user, isUserLoading, router]);

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsActive, setStatsActive] = useState(false);
  const students = useCountUp(50000, 2000, statsActive);
  const mocks = useCountUp(12000, 2000, statsActive);
  const success = useCountUp(92, 1600, statsActive);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const typedWord = useTyped(["SSC CGL", "JEE Mains", "NEET", "UPSC", "Railway", "Banking"], 90, 1600);

  const [activeT, setActiveT] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setParallax({ x: (e.clientX - r.width / 2) / 30, y: (e.clientY - r.height / 2) / 30 });
  }, []);

  if (!mounted || orgLoading || (user && !isUserLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      <Navbar />
      
      <main className="relative overflow-hidden pt-20 pb-32">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Hero Section */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold tracking-wide uppercase animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen Mock Test Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.05]">
              Crack <span className="text-primary italic">{typedWord || "\u00a0"}</span> <br />
              with <span className="text-primary">AI Precision.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed">
              Personalized study plans, real-time analytics, and thousands of premium mock tests tailored for your success.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all group" asChild>
                <Link href="/login" className="flex items-center gap-3">
                  Start Practicing Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all" asChild>
                <Link href="/tests">Explore Courses</Link>
              </Button>
            </div>

            {/* Social Proof / Stats */}
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 w-full max-w-3xl">
              {[
                { label: "Active Students", value: students >= 50000 ? "50K+" : `${students.toLocaleString()}+` },
                { label: "Mock Tests", value: mocks >= 12000 ? "12K+" : `${mocks.toLocaleString()}+` },
                { label: "Success Rate", value: `${success}%` },
                { label: "AI Study Plans", value: "25K+" }
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Cards Redesign */}
          <div className="grid md:grid-cols-3 gap-8 mt-40">
            {[
              {
                title: "AI Study Planner",
                desc: "Get a dynamic roadmap based on your strengths and weaknesses.",
                icon: Bot,
                color: "bg-purple-50 text-purple-600",
                shadow: "hover:shadow-purple-500/10"
              },
              {
                title: "Real-time Analytics",
                desc: "Deep dive into your performance with granular subject-wise insights.",
                icon: BarChart3,
                color: "bg-blue-50 text-blue-600",
                shadow: "hover:shadow-blue-500/10"
              },
              {
                title: "Premium Content",
                desc: "Access high-quality mock tests created by top exam experts.",
                icon: BookOpen,
                color: "bg-orange-50 text-orange-600",
                shadow: "hover:shadow-orange-500/10"
              }
            ].map((feature) => (
              <div 
                key={feature.title} 
                className={cn(
                  "p-10 rounded-[32px] bg-white border border-slate-100 transition-all duration-500 hover:-translate-y-2 group shadow-sm",
                  feature.shadow
                )}
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", feature.color)}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="border-t py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            {org?.logoUrl ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" />
              </div>
            ) : (
              <span className="bg-primary text-white p-2 rounded-xl text-xs font-black w-10 h-10 flex items-center justify-center shadow-lg shadow-primary/20">
                {org?.name?.charAt(0) || "M"}
              </span>
            )}
            <span className="text-2xl font-black tracking-tight text-slate-900">{org?.name || "Mockbook"}</span>
          </div>
          
          <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>

          <p className="text-sm font-medium text-slate-400">
            © 2026 {org?.name || "Mockbook"}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
