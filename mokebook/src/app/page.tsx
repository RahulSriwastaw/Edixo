"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  ArrowRight, Bot, BarChart3, BookOpen,
  Users, Sparkles, Play,
  CheckCircle2, Star, Shield, Clock, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { useOrganization } from "@/providers/OrganizationProvider";

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
  const students = useCountUp(125000, 2000, statsActive);
  const mocks = useCountUp(15000, 2000, statsActive);
  const success = useCountUp(94, 1600, statsActive);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const typedWord = useTyped(["SSC CGL", "RRB NTPC", "SBI PO", "CUET", "UPSC", "Defence"], 90, 1600);

  if (!mounted || orgLoading || (user && !isUserLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F0F2F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "#1a73e8 transparent #1a73e8 #1a73e8" }} />
          <p className="text-sm font-bold text-[#1a73e8]">Loading MockBook...</p>
        </div>
      </div>
    );
  }

  const features = [
    { title: "AI Study Planner", desc: "Personalized roadmaps built on your specific strengths.", icon: Bot, bg: "bg-blue-50", color: "text-blue-600", border: "border-blue-100", badge: "AI" },
    { title: "Topic Analytics", desc: "Detailed insights with AIR tracking and rank projection.", icon: BarChart3, bg: "bg-emerald-50", color: "text-emerald-600", border: "border-emerald-100", badge: "Pro" },
    { title: "Premium Tests", desc: "10,000+ mock tests crafted by world-class exam experts.", icon: BookOpen, bg: "bg-orange-50", color: "text-orange-600", border: "border-orange-100", badge: "12K+" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#0f1b2d] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f1b2d 0%, #1e2a3b 100%)" }}>
        
        {/* Background Mesh */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(at 100% 0%, #1a73e8 0px, transparent 50%), radial-gradient(at 0% 100%, #1a73e8 0px, transparent 50%)` }} />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 backdrop-blur-md rounded-full border border-blue-500/20 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] font-black uppercase tracking-[1.5px] text-blue-200">#1 Trusted Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
              Master Your <br />
              <span className="text-[#1a73e8] italic flex items-center justify-center md:justify-start gap-3">
                {typedWord || "\u00a0"}
                <div className="w-1.5 h-[0.8em] bg-[#1a73e8] animate-pulse rounded-full" />
              </span>
              Exam with Confidence.
            </h1>

            <p className="text-slate-400 text-base md:text-lg mb-10 max-w-md font-medium leading-relaxed mx-auto md:mx-0">
              Join 1.2 Lakh+ students using AI-powered analytics and expert-curated mock tests to crack their dream exams.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto h-12 px-10 bg-[#1a73e8] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tests"
                className="w-full sm:w-auto h-12 px-10 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                Explore Courses
              </Link>
            </div>
          </div>

          <div className="flex-1 relative hidden lg:block">
             <div className="relative z-10 bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl skew-y-3 md:skew-y-0 md:rotate-2">
                <div className="bg-[#0f1b2d] rounded-2xl p-4 overflow-hidden border border-white/5">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-black text-white">M</div>
                      <div>
                         <div className="h-2 w-24 bg-white/20 rounded-full mb-2" />
                         <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-16 w-full bg-white/5 rounded-xl border border-white/5 flex items-center px-4 gap-3">
                         <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30" />
                         <div className="h-2 w-32 bg-white/10 rounded-full" />
                      </div>
                      <div className="h-16 w-full bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center px-4 gap-3">
                         <div className="w-8 h-8 rounded-lg bg-blue-500" />
                         <div className="h-2 w-40 bg-blue-400/30 rounded-full" />
                      </div>
                   </div>
                </div>
             </div>
             {/* Decorative Circles */}
             <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
             <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="bg-white border-b border-slate-100 py-10 md:py-14" ref={statsRef}>
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { val: students, label: "Registered Students", suffix: "+", color: "text-[#1a73e8]" },
                 { val: mocks, label: "Mock tests", suffix: "+", color: "text-emerald-500" },
                 { val: success, label: "Success Rate", suffix: "%", color: "text-orange-500" },
                 { val: 120, label: "Exam Categories", suffix: "+", color: "text-purple-500" },
               ].map((s, i) => (
                 <div key={i} className="text-center group">
                    <div className={cn("text-2xl md:text-4xl font-black mb-1 transition-transform group-hover:-translate-y-1", s.color)}>
                      {s.val.toLocaleString()}{s.suffix}
                    </div>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 md:py-32 bg-[#F0F2F8]">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
               <span className="text-[11px] font-black text-[#1a73e8] uppercase tracking-[2px] mb-3 block">Features</span>
               <h2 className="text-3xl md:text-4xl font-black text-[#0f1b2d] mb-4 tracking-tight">Everything you need to crack your exam</h2>
               <p className="text-slate-500 font-bold max-w-lg mx-auto">Powerful tools built specifically for competitive exam preparation.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {features.map((f, i) => (
                 <div key={i} className={cn("bg-white p-8 rounded-3xl border transition-all hover:shadow-2xl hover:shadow-blue-500/5 group", f.border)}>
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 relative", f.bg)}>
                       <f.icon className={cn("h-7 w-7", f.color)} />
                       {f.badge && <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#1a73e8] text-white text-[8px] font-black rounded-full">{f.badge}</span>}
                    </div>
                    <h3 className="text-xl font-black mb-3">{f.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-6">{f.desc}</p>
                    <Link href="/tests" className="text-[12px] font-black text-[#1a73e8] uppercase tracking-wider flex items-center gap-2 hover:translate-x-1 transition-transform">
                      Learn More <Play className="h-3 w-3 fill-current" />
                    </Link>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── TRUSTED BY SECTION ── */}
      <section className="py-20 md:py-32 bg-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="flex-1">
                  <span className="text-[11px] font-black text-[#1a73e8] uppercase tracking-[2px] mb-3 block">Excellence</span>
                  <h2 className="text-3xl md:text-4xl font-black text-[#0f1b2d] mb-6 tracking-tight">Designed by Top <span className="text-[#1a73e8]">Rankers</span>.</h2>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">Every mock test is designed to mirror the actual exam environment, difficulty levels, and syllabus coverage.</p>
                  
                  <div className="space-y-4">
                     {[
                       "Real-time All India Rank (AIR)",
                       "Previous Year Question Sets",
                       "Chapter-wise Performance Analysis",
                       "Video Solutions & Expert Tips"
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <span className="font-bold text-slate-700">{item}</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="flex-1 relative">
                  <div className="bg-[#F0F2F8] rounded-[40px] p-8 md:p-12 relative overflow-hidden group border border-slate-100">
                     <div className="relative z-10">
                        <Star className="h-8 w-8 text-orange-400 mb-6 fill-orange-400" />
                        <p className="text-lg md:text-xl font-black text-[#0f1b2d] leading-relaxed mb-8 italic">
                          "MockBook changed the way I prepare. The AI analysis helped me identify my weak topics in SSC CGL, improving my speed by 40%."
                        </p>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-[#1a73e8]/20 border border-[#1a73e8]/30 flex items-center justify-center font-black text-[#1a73e8]">AV</div>
                           <div>
                              <div className="font-black text-sm">Aditya Verma</div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">SSC CGL, AIR 42</div>
                           </div>
                        </div>
                     </div>
                     <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full text-white/40 pointer-events-none scale-150 group-hover:rotate-12 transition-transform duration-[8000ms]" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="pb-24 px-4 md:px-8">
         <div className="max-w-5xl mx-auto bg-[#1a73e8] rounded-[40px] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-500/30 border border-white/20">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative tracking-tight">Crack your dream exam <br /> in your first attempt.</h2>
            <p className="text-blue-100 font-bold mb-10 relative max-w-lg mx-auto text-lg opacity-80">Join 1.2 Lakh+ users today and take your first step towards success.</p>
            <Link
              href="/login"
              className="inline-flex h-14 px-12 bg-white text-[#1a73e8] rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/10 hover:bg-blue-50 active:scale-95 transition-all relative items-center justify-center gap-3"
            >
              Start Practice Now
              <Zap className="h-5 w-5 fill-[#1a73e8]" />
            </Link>
         </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#0f1b2d] flex items-center justify-center text-white font-black">MB</div>
             <span className="text-xl font-black tracking-tight text-[#0f1b2d] uppercase">MockBook</span>
          </div>
          <div className="flex gap-10">
             <Link href="#" className="text-sm font-black text-slate-400 hover:text-[#1a73e8] uppercase tracking-widest transition-colors">Privacy</Link>
             <Link href="#" className="text-sm font-black text-slate-400 hover:text-[#1a73e8] uppercase tracking-widest transition-colors">Terms</Link>
             <Link href="#" className="text-sm font-black text-slate-400 hover:text-[#1a73e8] uppercase tracking-widest transition-colors">Contact</Link>
          </div>
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">© 2026 MockBook. Built for success.</p>
        </div>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
