"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Sparkles, Play, Target, Star, Brain, Award,
  TrendingUp, Globe, Users, BookOpen, Medal,
  Rocket, Shield, Zap, ChevronRight, ArrowUpRight,
  Flame, BarChart3, Timer, CheckCircle2, Trophy
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

/* ═══════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════ */
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════
   REVEAL ON SCROLL COMPONENT
   ═══════════════════════════════════════ */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   HERO PARTICLES BACKGROUND
   ═══════════════════════════════════════ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 107, 43, 0.4)";
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 107, 43, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    const raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }} />;
}

/* ═══════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════ */

function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-[#FF6B2B] via-[#ff944d] to-[#FF6B2B] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x ${className}`}>
      {children}
    </span>
  );
}

function PrimaryBtn({ children, href, icon: Icon }: { children: React.ReactNode; href: string; icon?: React.ElementType }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,107,43,0.3)] hover:-translate-y-0.5 active:scale-[0.98]"
      style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 50%, #FF6B2B 100%)", backgroundSize: "200% 200%" }}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {Icon && <Icon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />}
      </span>
    </Link>
  );
}

function SecondaryBtn({ children, href, icon: Icon }: { children: React.ReactNode; href: string; icon?: React.ElementType }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm border border-white/[0.08] hover:border-[#FF6B2B]/30 hover:bg-[#FF6B2B]/5 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] backdrop-blur-sm"
    >
      {Icon && <Icon className="h-4 w-4 text-[#FF6B2B]" />}
      <span>{children}</span>
      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
    </Link>
  );
}

function StatCard({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: React.ElementType }) {
  const { count, ref } = useCountUp(value, 2500);
  return (
    <div ref={ref} className="group relative p-5 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(255,107,43,0.12)]"
      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B2B]/5 rounded-full blur-2xl translate-x-8 -translate-y-8 group-hover:bg-[#FF6B2B]/10 transition-all duration-700" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.15) 0%, rgba(255,107,43,0.05) 100%)" }}>
          <Icon className="h-5 w-5 text-[#FF6B2B]" />
        </div>
        <div className="text-3xl font-extrabold mb-1 tabular-nums">
          <GradientText>{count.toLocaleString()}{suffix}</GradientText>
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider opacity-40">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, index }: { icon: React.ElementType; title: string; desc: string; index: number }) {
  return (
    <div className="group relative p-5 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-default"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        transitionDelay: `${index * 50}ms`
      }}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B2B]/0 via-[#FF6B2B]/0 to-[#FF6B2B]/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {/* Top line glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF6B2B]/0 to-transparent group-hover:via-[#FF6B2B]/40 transition-all duration-700" />

      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-400" style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.12) 0%, rgba(255,107,43,0.04) 100%)" }}>
          <Icon className="h-5 w-5 text-[#FF6B2B]" />
        </div>
        <h3 className="text-[15px] font-bold mb-1.5 group-hover:text-[#FF6B2B] transition-colors duration-300">{title}</h3>
        <p className="text-[13px] leading-relaxed opacity-50">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, desc }: { number: string; icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="group relative p-5 rounded-2xl transition-all duration-500 hover:-translate-y-1"
      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 100%)" }}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-20">{number}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <h4 className="font-bold text-[14px] mb-1">{title}</h4>
          <p className="text-[12px] opacity-45 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && !isUserLoading) router.push("/tests");
  }, [user, isUserLoading, router]);

  if (!mounted || (user && !isUserLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: "#09090b" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 rounded-full animate-ping" style={{ borderColor: "rgba(255,107,43,0.3)" }} />
            <div className="w-12 h-12 border-2 border-t-[#FF6B2B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[12px] font-medium opacity-50">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <Navbar />

      {/* ═══════════════════════════════════════
         HERO SECTION
         ═══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <ParticleField />

        {/* Gradient Orbs */}
        <div className="absolute top-[20%] left-[15%] w-[350px] h-[350px] bg-[#FF6B2B]/12 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-[20%] right-[15%] w-[280px] h-[280px] bg-[#ff4400]/8 rounded-full blur-[110px] animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF6B2B]/4 rounded-full blur-[140px]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />

        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 border border-[#FF6B2B]/20"
            style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.02) 100%)" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#FF6B2B" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#FF6B2B" }} />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-[#FF6B2B]" />
            <span className="text-[11px] font-bold tracking-wide text-[#FF6B2B]">Next-Gen Testing Platform</span>
            <span className="text-[10px] opacity-40 px-1.5 py-0.5 rounded bg-white/5">v3.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
            <span className="block">Crack Your</span>
            <span className="block mt-1"><GradientText>Dream Exam</GradientText></span>
            <span className="block text-xl sm:text-2xl md:text-3xl mt-4 font-semibold opacity-50">with AI-Powered Analytics</span>
          </h1>

          <p className="text-base sm:text-lg max-w-lg mx-auto mb-10 font-medium opacity-45 leading-relaxed">
            Join <span className="text-[#FF6B2B] font-bold">1.25L+</span> students. Access <span className="text-[#FF6B2B] font-bold">15K+</span> expert-crafted mock tests with real-time analytics & AIR tracking.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <PrimaryBtn href="/login" icon={Rocket}>Start Free Trial</PrimaryBtn>
            <SecondaryBtn href="/tests" icon={Play}>Explore Tests</SecondaryBtn>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {[
              { icon: Shield, label: "Bank-Grade Security" },
              { icon: Users, label: "1.25L+ Active Users" },
              { icon: Star, label: "4.9/5 Rating", special: true },
              { icon: Flame, label: "15K+ Mock Tests" },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <t.icon className="h-4 w-4" style={t.special ? { color: "#FF6B2B", fill: "#FF6B2B" } : {}} />
                <span className="text-[11px] font-semibold">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-body)] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════
         STATS SECTION
         ═══════════════════════════════════════ */}
      <section className="py-10 px-5 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={125} suffix="K+" label="Active Students" icon={Users} />
            <StatCard value={15} suffix="K+" label="Mock Tests" icon={BookOpen} />
            <StatCard value={94} suffix="%" label="Success Rate" icon={TrendingUp} />
            <StatCard value={120} suffix="+" label="Exam Categories" icon={Globe} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         FEATURES SECTION
         ═══════════════════════════════════════ */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 border border-[#FF6B2B]/20"
              style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.02) 100%)", color: "#FF6B2B" }}
            >
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Everything You <GradientText>Need</GradientText></h2>
            <p className="max-w-md mx-auto text-sm opacity-45">Comprehensive tools designed by experts to help you succeed in every competitive exam.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Brain, title: "AI Study Planner", desc: "Personalized roadmaps based on your strengths & weaknesses with daily targets." },
              { icon: BarChart3, title: "Real-time Analytics", desc: "Track AIR ranking, percentile & detailed performance insights instantly." },
              { icon: Trophy, title: "Premium Tests", desc: "15,000+ expert-crafted mocks for 120+ government and competitive exams." },
              { icon: Target, title: "Smart Analysis", desc: "AI-powered topic-wise breakdown with improvement suggestions." },
              { icon: Timer, title: "Exam Simulation", desc: "Real exam environment with timer, strict proctoring & OMR feel." },
              { icon: Award, title: "Certificates", desc: "Earn verified certificates & showcase achievements on your profile." },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <FeatureCard icon={f.icon} title={f.title} desc={f.desc} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         HOW IT WORKS
         ═══════════════════════════════════════ */}
      <section className="py-16 px-5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6B2B]/3 rounded-full blur-[180px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal className="text-center mb-10">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 border border-[#FF6B2B]/20"
              style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.02) 100%)", color: "#FF6B2B" }}
            >
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">4 Steps to <GradientText>Success</GradientText></h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { number: "01", icon: Target, title: "Choose Your Exam", desc: "Select from 120+ exam categories including SSC, Banking, Railway, JEE & NEET." },
              { number: "02", icon: Play, title: "Take Mock Tests", desc: "Attempt expert-crafted tests in a real exam-like environment with timer." },
              { number: "03", icon: BarChart3, title: "Analyze Results", desc: "Get detailed AI-powered analytics with topic-wise breakdown & AIR ranking." },
              { number: "04", icon: Medal, title: "Improve & Excel", desc: "Follow personalized improvement plans and track your progress daily." },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <StepCard number={s.number} icon={s.icon} title={s.title} desc={s.desc} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         TESTIMONIALS
         ═══════════════════════════════════════ */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 border border-[#FF6B2B]/20"
              style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.02) 100%)", color: "#FF6B2B" }}
            >
              Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Trusted by <GradientText>Top Rankers</GradientText></h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Aditya V.", exam: "SSC CGL", rank: "AIR 42", quote: "AI analysis helped identify weak topics instantly. Best platform for serious aspirants!" },
              { name: "Priya S.", exam: "SBI PO", rank: "AIR 156", quote: "Mock tests feel exactly like real exams. The analytics dashboard is a game changer." },
              { name: "Rahul K.", exam: "UPSC CSE", rank: "AIR 89", quote: "Structured preparation with detailed analytics. My rank improved by 200+ positions." },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group p-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col"
                  style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 text-[#FF6B2B]" style={{ fill: "#FF6B2B" }} />)}
                  </div>
                  <p className="text-[13px] mb-5 leading-relaxed opacity-60 flex-1">"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 100%)" }}>
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{t.name}</div>
                      <div className="text-[11px] opacity-40">{t.exam} • <span className="text-[#FF6B2B] font-semibold">{t.rank}</span></div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         WHY CHOOSE US
         ═══════════════════════════════════════ */}
      <section className="py-16 px-5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF6B2B]/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Why Choose <GradientText>Mockbook?</GradientText></h2>
            <p className="max-w-md mx-auto text-sm opacity-45">Built by top educators and engineers to give you the competitive edge.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle2, title: "Expert Curated", desc: "By IITians & top rankers" },
              { icon: Zap, title: "Lightning Fast", desc: "Sub-second load times" },
              { icon: Brain, title: "AI Powered", desc: "Personalized learning paths" },
              { icon: Globe, title: "All India Rank", desc: "Compete with 1.25L+ students" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="group p-5 rounded-2xl text-center transition-all duration-500 hover:-translate-y-2"
                  style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.12) 0%, rgba(255,107,43,0.04) 100%)" }}>
                    <item.icon className="h-5 w-5 text-[#FF6B2B]" />
                  </div>
                  <h3 className="text-[14px] font-bold mb-1">{item.title}</h3>
                  <p className="text-[12px] opacity-45">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         CTA SECTION
         ═══════════════════════════════════════ */}
      <section className="py-20 px-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF6B2B]/[0.02] to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF6B2B]/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">Ready to Start<br /><GradientText>Your Journey?</GradientText></h2>
            <p className="mb-8 max-w-md mx-auto text-base opacity-45">Join thousands of successful students. Start your preparation today and crack your dream exam.</p>
            <PrimaryBtn href="/login" icon={Zap}>Get Started Free</PrimaryBtn>
            <p className="mt-6 text-[12px] opacity-30">No credit card required • Free mock tests included</p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         FOOTER
         ═══════════════════════════════════════ */}
      <footer className="py-8 px-5 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 100%)" }}>M</div>
            <span className="text-[14px] font-bold tracking-tight">Mockbook</span>
          </div>
          <div className="flex gap-6 text-[12px] opacity-40">
            <Link href="#" className="hover:text-[#FF6B2B] hover:opacity-100 transition-all">Privacy</Link>
            <Link href="#" className="hover:text-[#FF6B2B] hover:opacity-100 transition-all">Terms</Link>
            <Link href="#" className="hover:text-[#FF6B2B] hover:opacity-100 transition-all">Contact</Link>
            <Link href="#" className="hover:text-[#FF6B2B] hover:opacity-100 transition-all">Help</Link>
          </div>
          <p className="text-[11px] opacity-30">© 2026 Mockbook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}