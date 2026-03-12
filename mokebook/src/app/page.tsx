"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, CheckCircle2, Star, Zap, Bot, BarChart3, BookOpen,
  Shield, Globe, BrainCircuit, Trophy, Flame, TrendingUp, Clock,
  Users, Target, Award, Sparkles, ChevronRight, Play, Layers, PenLine,
  Cpu, Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";

/* ═══ SCROLL REVEAL HOOK ════════════════════ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

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

/* ═══ DATA ════════════════════════════════════ */
const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i, size: Math.random() * 6 + 3,
  x: Math.random() * 100, y: Math.random() * 100,
  delay: Math.random() * 8, duration: Math.random() * 6 + 6,
  opacity: Math.random() * 0.4 + 0.1,
}));

const examCategories = [
  { name: "SSC", icon: "📋", color: "from-blue-500 to-blue-600", count: "245+ Tests" },
  { name: "JEE Mains", icon: "⚗️", color: "from-purple-500 to-purple-600", count: "180+ Tests" },
  { name: "NEET", icon: "🔬", color: "from-green-500 to-green-600", count: "160+ Tests" },
  { name: "UPSC", icon: "🏛️", color: "from-amber-500 to-orange-500", count: "120+ Tests" },
  { name: "Railway", icon: "🚂", color: "from-red-500 to-rose-600", count: "200+ Tests" },
  { name: "Banking", icon: "🏦", color: "from-teal-500 to-teal-600", count: "190+ Tests" },
  { name: "Teaching", icon: "📚", color: "from-pink-500 to-rose-500", count: "90+ Tests" },
  { name: "GATE", icon: "⚙️", color: "from-indigo-500 to-violet-600", count: "75+ Tests" },
];

const features = [
  { icon: Bot, title: "AI Study Planner", desc: "Builds a personalized daily schedule by analyzing your weak chapters from mock results.", color: "text-purple-500", gradient: "from-purple-50 to-violet-50", iconBg: "bg-purple-100", tag: "AI" },
  { icon: BarChart3, title: "Deep Analytics", desc: "Rank, percentile, speed & accuracy breakdown per section — compared vs. top rankers.", color: "text-blue-500", gradient: "from-blue-50 to-sky-50", iconBg: "bg-blue-100", tag: "DATA" },
  { icon: Zap, title: "12,000+ Mock Tests", desc: "Full-length, chapter-wise & PYQ mocks for all major exams. Updated after each paper.", color: "text-orange-500", gradient: "from-orange-50 to-amber-50", iconBg: "bg-orange-100", tag: "CONTENT" },
  { icon: Globe, title: "Live Test Arena", desc: "Join 10,000+ students in real-time. Live rank updates as results come in nationwide.", color: "text-teal-500", gradient: "from-teal-50 to-emerald-50", iconBg: "bg-teal-100", tag: "LIVE" },
  { icon: Shield, title: "Smart Error Bank", desc: "Every wrong answer auto-builds a custom revision quiz. Review only what needs work.", color: "text-rose-500", gradient: "from-rose-50 to-red-50", iconBg: "bg-rose-100", tag: "SMART" },
  { icon: BrainCircuit, title: "AI Doubt Solver", desc: "Instant step-by-step explanations for any question — available 24/7, zero wait time.", color: "text-violet-500", gradient: "from-violet-50 to-purple-50", iconBg: "bg-violet-100", tag: "AI" },
];

const steps = [
  { n: "01", icon: Target, title: "Choose Your Exam", desc: "Select from 8 major exam categories. Set your target year and Mockbook personalizes everything.", color: "bg-primary text-white", num: "bg-white text-primary border-2 border-primary" },
  { n: "02", icon: PenLine, title: "Take AI Mocks", desc: "Adaptive tests that match real exam patterns. Full-length, sectional, or quick 5-min drills.", color: "bg-blue-500 text-white", num: "bg-white text-blue-600 border-2 border-blue-500" },
  { n: "03", icon: BarChart3, title: "Get Deep Analysis", desc: "Instant AI-powered report spotlights your weak topics and shows exactly how to improve.", color: "bg-purple-500 text-white", num: "bg-white text-purple-600 border-2 border-purple-500" },
  { n: "04", icon: Trophy, title: "Climb the Ranks", desc: "Watch your All India Rank improve week over week as you complete more targeted practice.", color: "bg-amber-500 text-white", num: "bg-white text-amber-600 border-2 border-amber-500" },
];

const testimonials = [
  { name: "Priya Sharma", exam: "SSC CGL 2024", rank: "AIR 42", avatar: "https://picsum.photos/seed/priya22/80/80", text: "The AI planner noticed I was weak in trigonometry and built a focused 7-day sprint. My score jumped from 85 to 132 in just two weeks!", stars: 5, study: "60 days" },
  { name: "Arjun Mehta", exam: "JEE Mains 2025", rank: "99.2%ile", avatar: "https://picsum.photos/seed/arjun33/80/80", text: "The sectional analytics drilled down to chapter-level mistakes I never knew I had. Full-length mocks feel exactly like the real thing.", stars: 5, study: "90 days" },
  { name: "Sneha Patel", exam: "NEET 2024", rank: "680/720", avatar: "https://picsum.photos/seed/sneha44/80/80", text: "Competing live with 10,000+ students made me exam-ready mentally. The error bank alone saved me 2 months of revision.", stars: 5, study: "45 days" },
];

/* ═══════════════════════════════════════════ */
export default function LandingPage() {
  useReveal();
  const router = useRouter();
  const auth = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/tests");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);  /* Stats count-up */
  const statsRef = useRef<HTMLElement>(null);
  const [statsActive, setStatsActive] = useState(false);
  const students = useCountUp(50000, 2000, statsActive);
  const mocks = useCountUp(12000, 2000, statsActive);
  const success = useCountUp(92, 1600, statsActive);
  const packs = useCountUp(500, 1800, statsActive);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsActive(true); }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Typing effect */
  const typedWord = useTyped(["SSC CGL", "JEE Mains", "NEET", "UPSC", "Railway", "Banking"], 90, 1600);

  /* Testimonial auto-cycle */
  const [activeT, setActiveT] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveT(p => (p + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  /* Mouse parallax on hero */
  const heroRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setParallax({ x: (e.clientX - r.width / 2) / 30, y: (e.clientY - r.height / 2) / 30 });
  }, []);

  if (checkingAuth) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden selection:bg-primary/20">
      <Navbar />

      {/* ═══════════════════ HERO ═════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={handleMouse}
        className="relative min-h-[92vh] flex items-center pt-8 pb-20 overflow-hidden"
      >
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30" />
          <div
            className="absolute top-[-15%] right-[-10%] w-[900px] h-[900px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(255,92,40,0.15) 0%, rgba(255,140,80,0.08) 40%, transparent 70%)",
              transform: `translate(${-parallax.x * 0.8}px, ${-parallax.y * 0.8}px)`,
              transition: "transform 0.15s ease-out"
            }}
          />
          <div
            className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(147,51,234,0.06) 40%, transparent 70%)",
              transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)`,
              transition: "transform 0.15s ease-out"
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
              transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`,
              transition: "transform 0.15s ease-out"
            }}
          />
          {/* Enhanced grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {floatingParticles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-primary"
              style={{
                width: p.size, height: p.size,
                left: `${p.x}%`, top: `${p.y}%`,
                opacity: p.opacity,
                animation: `float-slow ${p.duration}s ${p.delay}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left Column ── */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Live pill */}
              <div className="animate-slide-up-fade inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-primary/15 shadow-sm shadow-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                1,284 students online right now
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl xl:text-[3.6rem] font-extrabold leading-[1.06] tracking-tight text-slate-900">
                  Crack{" "}
                  <span className="relative">
                    <span className="shimmer-text">{typedWord || "\u00a0"}</span>
                    <span className="inline-block w-0.5 h-10 bg-primary align-middle ml-0.5 animate-[blink_1s_step-end_infinite]" />
                  </span>
                  <br />
                  <span className="text-slate-900">With AI Precision</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Personalized mocks, adaptive AI study plans & real-time nationwide rank tracking.
                  Join <strong className="text-slate-900">50,000+</strong> top aspirants who trust Mockbook.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="btn-glow group h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/30 animate-glow-pulse hover:shadow-primary/50 transition-all hover:-translate-y-0.5"
                  asChild
                >
                  <Link href="/login" className="flex items-center gap-2.5">
                    Start Free Today
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform animate-bounce-x" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-2xl border-slate-200 text-slate-700 font-bold text-base hover:border-primary/30 hover:bg-orange-50 transition-all gap-2.5 group"
                  asChild
                >
                  <Link href="/tests" className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Play className="h-3 w-3 fill-white text-white ml-0.5" />
                    </div>
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Trust micro-badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                {[
                  { icon: CheckCircle2, label: "No Credit Card" },
                  { icon: Star, label: "4.9★ Rated" },
                  { icon: Zap, label: "Instant Access" },
                  { icon: Users, label: "50K+ Students" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <item.icon className="h-3.5 w-3.5 text-emerald-500" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Column: Hero Visual ── */}
            <div
              className="relative animate-float-slow"
              style={{ transform: `perspective(1000px) rotateY(${-parallax.x * 0.3}deg) rotateX(${parallax.y * 0.3}deg)`, transition: "transform 0.1s ease-out" }}
            >
              {/* Main card */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-100/60 aspect-[16/11]">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85"
                  alt="Students studying with Mockbook"
                  fill className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Live quiz overlay */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="glass rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="flex -space-x-2 shrink-0">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                          <Image src={`https://picsum.photos/seed/stu${i}/40`} alt="" width={32} height={32} className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">Live Mock in Progress</p>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ width: "68%" }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">68%</span>
                  </div>
                </div>
              </div>

              {/* Floating Badge: Rank */}
              <div className="absolute -top-5 -left-5 glass rounded-2xl shadow-xl p-3.5 flex items-center gap-3 animate-float-badge" style={{ animationDelay: "0s" }}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">All India Rank</p>
                  <p className="text-base font-extrabold text-slate-900">#42 / 50K</p>
                </div>
              </div>

              {/* Floating Badge: Streak */}
              <div className="absolute -bottom-5 -right-5 glass rounded-2xl shadow-xl p-3.5 flex items-center gap-3 animate-float-badge" style={{ animationDelay: "2s" }}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Flame className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Study Streak</p>
                  <p className="text-base font-extrabold text-slate-900">24 Days 🔥</p>
                </div>
              </div>

              {/* Floating Badge: Score */}
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 glass rounded-2xl shadow-xl p-3.5 text-center animate-float-badge" style={{ animationDelay: "1s" }}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score Jump</p>
                <p className="text-2xl font-extrabold text-emerald-500">+47</p>
                <p className="text-[9px] font-bold text-slate-400">pts this week</p>
              </div>

              {/* Decorative rings */}
              <div className="absolute -z-10 -inset-6 rounded-[3rem] border border-primary/5 animate-spin-slow" />
              <div className="absolute -z-10 -inset-10 rounded-[4rem] border border-primary/5 animate-spin-reverse" />
            </div>
          </div>
        </div>

        {/* Exam category strip */}
        <div className="absolute bottom-0 left-0 right-0 pb-6 pt-4 bg-gradient-to-t from-white via-white/80 to-transparent">
          <div className="max-w-7xl mx-auto px-5">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4">
              All major exams covered
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {examCategories.map((cat, i) => (
                <Link
                  key={cat.name} href="/tests"
                  className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 hover:border-primary/30 rounded-full text-sm font-bold text-slate-600 hover:text-primary shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ════════════════════════ */}
      <section ref={statsRef} className="relative py-16 bg-slate-900 overflow-hidden noise-overlay">
        {/* Animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 animate-gradient-x bg-[length:200%_200%]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Animated bars in background */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-16 opacity-10 pointer-events-none">
          {[40, 70, 55, 85, 60, 90, 75, 45, 80, 65].map((h, i) => (
            <div key={i} className="w-8 bg-primary rounded-t-sm" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, val: students >= 50000 ? "50,000+" : `${students.toLocaleString()}+`, label: "Active Aspirants", color: "text-blue-400", iconBg: "bg-blue-400/10" },
              { icon: BookOpen, val: mocks >= 12000 ? "12,000+" : `${mocks.toLocaleString()}+`, label: "Mock Tests", color: "text-emerald-400", iconBg: "bg-emerald-400/10" },
              { icon: TrendingUp, val: `${success}%`, label: "Success Rate", color: "text-amber-400", iconBg: "bg-amber-400/10" },
              { icon: Layers, val: packs >= 500 ? "500+" : `${packs}+`, label: "Mock Packs", color: "text-purple-400", iconBg: "bg-purple-400/10" },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-col items-center text-center gap-3 reveal" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className={cn("p-3 rounded-2xl", s.iconBg)}>
                  <s.icon className={cn("h-6 w-6", s.color)} />
                </div>
                <div>
                  <span className={cn("text-3xl md:text-4xl font-extrabold tracking-tight text-white block")}>{s.val}</span>
                  <span className="text-sm text-slate-400 font-semibold mt-1 block">{s.label}</span>
                </div>
                {/* Wave bars */}
                <div className="flex items-end gap-0.5 h-6 mt-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className={cn("w-1.5 rounded-full", s.color.replace("text-", "bg-"))}
                      style={{ height: `${[40, 70, 55, 90, 65][j]}%`, animation: `wave 1.2s ease-in-out ${j * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 space-y-16">
          <div className="text-center space-y-4 reveal">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-black uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Platform Superpowers
            </div>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight">
              Built for the <span className="shimmer-text">Serious Aspirant</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Every tool you need to study smarter, rank higher, and stay motivated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={cn("group relative rounded-3xl p-7 border-0 bg-gradient-to-br cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl reveal", f.gradient)}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />

                <div className="absolute top-5 right-5">
                  <span className={cn("text-[8px] font-black tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm", f.color)}>
                    {f.tag}
                  </span>
                </div>

                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300", f.iconBg)}>
                  <f.icon className={cn("h-7 w-7", f.color)} />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>

                <div className={cn("mt-5 flex items-center gap-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1", f.color)}>
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,92,40,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06),transparent_60%)]" />

        {/* Animated dots grid */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 space-y-16 relative">
          <div className="text-center space-y-4 reveal">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-widest">
              <Cpu className="h-3.5 w-3.5" /> How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight">
              Zero to <span className="text-primary italic">Topper</span> in 4 Steps
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
              A proven system trusted by 50,000+ aspirants across India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* connector */}
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />

            {steps.map((step, i) => (
              <div key={i} className="group flex flex-col items-center text-center reveal" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="relative z-10 mb-6">
                  <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3", step.color)}>
                    <step.icon className="h-9 w-9" />
                  </div>
                  <div className={cn("absolute -top-2 -right-2 w-7 h-7 rounded-full text-[11px] font-black flex items-center justify-center shadow-md", step.num)}>
                    {i + 1}
                  </div>
                </div>
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">{step.n}</div>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Start CTA inside section */}
          <div className="reveal text-center pt-4">
            <Button size="lg" className="btn-glow h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/30 animate-glow-pulse group" asChild>
              <Link href="/login" className="flex items-center gap-2.5">
                Begin My Journey <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 space-y-14">
          <div className="text-center space-y-4 reveal">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black uppercase tracking-widest">
              <Award className="h-3.5 w-3.5" /> Student Success Stories
            </div>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight">
              Real Students. <span className="shimmer-text">Real Results.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "relative rounded-3xl p-7 space-y-5 border transition-all duration-500 reveal cursor-default",
                  activeT === i
                    ? "bg-slate-900 text-white border-primary/30 shadow-2xl shadow-primary/10 -translate-y-2 scale-[1.02]"
                    : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
                onClick={() => setActiveT(i)}
              >
                {/* Quote icon */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", activeT === i ? "bg-primary/20" : "bg-slate-50")}>
                  <Quote className={cn("h-5 w-5", activeT === i ? "text-primary fill-primary" : "text-slate-300 fill-slate-100")} />
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className={cn("text-sm leading-relaxed", activeT === i ? "text-slate-300" : "text-slate-600")}>
                  "{t.text}"
                </p>

                <div className={cn("pt-4 border-t flex items-center gap-3", activeT === i ? "border-white/10" : "border-slate-100")}>
                  <div className="relative shrink-0">
                    <Image src={t.avatar} alt={t.name} width={44} height={44} className="rounded-full border-2 border-white shadow-sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-bold truncate", activeT === i ? "text-white" : "text-slate-900")}>{t.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-semibold truncate", activeT === i ? "text-slate-400" : "text-slate-400")}>{t.exam}</span>
                      <span className="shrink-0 text-xs font-black text-primary">{t.rank}</span>
                    </div>
                  </div>
                  <div className={cn("shrink-0 text-center", activeT === i ? "text-slate-400" : "text-slate-300")}>
                    <Clock className="h-3 w-3 mx-auto mb-0.5" />
                    <p className="text-[9px] font-bold">{t.study}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setActiveT(i)} className={cn("h-2 rounded-full transition-all duration-300 cursor-pointer", activeT === i ? "w-10 bg-primary" : "w-2 bg-slate-200 hover:bg-slate-300")} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ EXAM CATEGORIES ════════════ */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,92,40,0.08),transparent_70%)]" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 space-y-14 relative">
          <div className="text-center space-y-4 reveal">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest">
              <BookOpen className="h-3.5 w-3.5" /> Exam Library
            </div>
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-white">
              One Platform, <span className="text-primary italic">Every Exam</span>
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">12,000+ mocks across 8 major categories. All updated to 2025 patterns.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {examCategories.map((cat, i) => (
              <Link key={cat.name} href="/tests" className="group reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-primary/20">
                  {/* Gradient bg */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity", cat.color)} />
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors" />

                  <div className="relative p-6 flex flex-col items-center text-center text-white gap-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                    <div>
                      <p className="font-bold text-sm">{cat.name}</p>
                      <p className="text-[10px] opacity-70 font-semibold mt-0.5">{cat.count}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPARISON ═════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 space-y-14">
          <div className="text-center space-y-4 reveal">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" /> Why Mockbook?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The Smarter Way to <span className="shimmer-text">Prepare</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="reveal-left rounded-3xl border-2 border-red-100 bg-red-50/40 p-8 space-y-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-xl">😫</div>
                <h3 className="font-bold text-slate-700 text-base">Traditional Coaching</h3>
              </div>
              {["Generic study plans — same for all", "No real-time rank comparison", "Miss a class, miss everything", "Outdated question banks", "₹50,000+ per year", "No doubt resolution at 2 AM"].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 text-red-500 font-bold text-xs">✗</div>
                  {item}
                </div>
              ))}
            </div>

            <div className="reveal-right rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-8 space-y-4 shadow-xl shadow-emerald-50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-white text-[9px] font-black tracking-widest px-2.5 h-6">SMARTER</Badge>
              </div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl shadow-lg shadow-primary/20">🚀</div>
                <h3 className="font-bold text-slate-900 text-base">Mockbook Platform</h3>
              </div>
              {["AI-personalized daily study plans", "Live nationwide rank in every mock", "Study anytime, any device, 24/7", "Updated to the latest exam patterns", "Start free — upgrade for ₹499/mo", "AI Doubt Solver available 24/7"].map(item => (
                <div key={item} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <div className="reveal relative rounded-[2.5rem] bg-slate-950 overflow-hidden p-12 md:p-20 text-center noise-overlay">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-accent" />
            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,92,40,0.2),transparent_60%)]" />
            {/* Decorative orbs */}
            <div className="absolute top-8 right-8 w-48 h-48 rounded-full bg-primary/5 animate-float-slow pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-blue-500/5 animate-float-slow pointer-events-none" style={{ animationDelay: "3s" }} />

            <div className="relative space-y-7 max-w-xl mx-auto">
              <Badge className="bg-white/10 text-white border-white/10 text-xs font-bold backdrop-blur cursor-default">
                🎯 Join 50,000+ Top Aspirants
              </Badge>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Your Rank Won't
                <br />
                <span className="text-primary italic">Improve Itself.</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Start your first mock today — completely free. No credit card. No commitment. Just results.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Button size="lg" className="btn-glow animate-glow-pulse group h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all hover:-translate-y-0.5" asChild>
                  <Link href="/login" className="flex items-center gap-2.5">
                    Get Started — It's Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white font-bold text-base backdrop-blur hover:bg-white/10 transition-all" asChild>
                  <Link href="/tests">View All Mocks</Link>
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                ✓ 500+ Free Mocks &nbsp;·&nbsp; ✓ No Credit Card &nbsp;·&nbsp; ✓ Cancel Anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ══════════════════════ */}
      <footer className="bg-slate-950 text-white border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-5 lg:col-span-2">
              <div className="flex items-center gap-2.5 font-bold text-xl">
                <span className="bg-primary text-white p-2 rounded-xl text-sm font-black">M</span>
                Mockbook
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                India's smartest AI-powered mock test platform. 50,000+ aspirants trust Mockbook to crack SSC, JEE, NEET, UPSC, Railway &amp; Banking exams.
              </p>
              <div className="flex flex-wrap gap-2">
                {["SSC", "JEE", "NEET", "Railway", "Banking", "UPSC"].map(tag => (
                  <Badge key={tag} variant="outline" className="border-white/10 text-slate-400 text-[10px] font-bold h-5">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Platform</h4>
              <div className="space-y-3">
                {[{ label: "Test Series", href: "/tests" }, { label: "Practice", href: "/practice" }, { label: "AI Planner", href: "/study-plans" }, { label: "Analytics", href: "/analytics" }, { label: "Leaderboard", href: "/tests" }].map(l => (
                  <Link key={l.label} href={l.href} className="block text-sm text-slate-400 hover:text-white transition-colors font-medium hover:translate-x-1 transition-all duration-200">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Account</h4>
              <div className="space-y-3">
                {[{ label: "Sign Up Free", href: "/login" }, { label: "Login", href: "/login" }, { label: "Profile", href: "/profile" }, { label: "Settings", href: "/settings" }, { label: "Refer & Earn", href: "/settings" }].map(l => (
                  <Link key={l.label} href={l.href} className="block text-sm text-slate-400 hover:text-white transition-colors font-medium hover:translate-x-1 transition-all duration-200">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">© 2026 Mockbook. All rights reserved. Built for serious aspirants.</p>
            <div className="flex gap-6 text-xs text-slate-600">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
