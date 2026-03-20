"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bot, LogIn, Mail, Lock, Sparkles, Loader2,
  CheckCircle2, BarChart3, ArrowRight, Eye, EyeOff,
  Shield, Zap, Trophy, Users, Flame, UserPlus, GraduationCap,
  Star, Target, BrainCircuit, TrendingUp, ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";

/* ─── Floating Particle ─────────────────────── */
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 5 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 8,
  duration: Math.random() * 6 + 5,
  opacity: Math.random() * 0.3 + 0.08,
}));

/* ─── Features shown on left panel ─────────── */
const leftFeatures = [
  {
    icon: Bot,
    title: "AI Study Planner",
    desc: "Personalized day-by-day schedule built from your mock results.",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-purple-500/30",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Chapter-wise accuracy, speed, and live All India Rank.",
    color: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/30",
  },
  {
    icon: Trophy,
    title: "12,000+ Mocks",
    desc: "Full-length and sectional tests for SSC, JEE, NEET, UPSC & more.",
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/30",
  },
  {
    icon: BrainCircuit,
    title: "AI Doubt Solver",
    desc: "Step-by-step explanations for any question, available 24/7.",
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/30",
  },
];

/* ─── Testimonials ──────────────────────────── */
const quotes = [
  { text: "Jumped from 85 to 132 marks in SSC CGL in just 3 weeks!", name: "Priya S.", rank: "AIR 42", avatar: "https://picsum.photos/seed/priya/40/40" },
  { text: "The AI planner knew exactly which chapters I was weak in.", name: "Arjun M.", rank: "99.2%ile JEE", avatar: "https://picsum.photos/seed/arjun/40/40" },
  { text: "Live mocks with 10,000+ students made me exam-ready.", name: "Sneha P.", rank: "680/720 NEET", avatar: "https://picsum.photos/seed/sneha/40/40" },
];

/* ─── Floating stats cards ──────────────────── */
const floatCards = [
  { icon: Flame, label: "Study Streak", value: "24 Days 🔥", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: TrendingUp, label: "Score Jump", value: "+47 pts", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Users, label: "Online Now", value: "1,284", color: "text-blue-600", bg: "bg-blue-50" },
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);

  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { org } = useOrganization();

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setActiveQuote(p => (p + 1) % quotes.length), 3800);
    return () => clearInterval(t);
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body: any = { 
        email: email.includes('@') ? email : undefined,
        studentId: !email.includes('@') ? email : undefined,
        password,
        orgId: org?.orgId || process.env.NEXT_PUBLIC_ORG_ID,
        role: "STUDENT"
      };
      if (!isLogin) body.name = name;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        // Set cookie
        document.cookie = `token=${data.data.accessToken}; path=/; max-age=604800`;
        toast({
          title: isLogin ? "Welcome back! 🎉" : "Account created! 🚀",
          description: isLogin ? "Redirecting to your dashboard..." : "Your learning journey has begun."
        });
        window.location.href = "/tests";
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: data.error || "Something went wrong. Please try again."
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the authentication server."
      });
    } finally {
      setLoading(false);
    }
  };


  const switchMode = () => {
    setIsLogin(p => !p);
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,92,40,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.10),transparent_55%)]" />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Animated ring decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5 animate-spin-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/10 animate-spin-reverse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/5 animate-spin-slow pointer-events-none" />

        {/* Particles */}
        {mounted && particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-primary pointer-events-none"
            style={{
              width: p.size, height: p.size,
              left: `${p.x}%`, top: `${p.y}%`,
              opacity: p.opacity,
              animation: `float-slow ${p.duration}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            {org?.logoUrl ? (
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" sizes="40px" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/40 group-hover:scale-105 transition-transform">
                {org?.name?.charAt(0) || "M"}
              </div>
            )}
            <span className="text-white font-bold text-xl tracking-tight">{org?.name || "Mockbook"}</span>
          </Link>

          {/* Hero text */}
          <div className="flex-1 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {org?.name ? `${org.name} - Official Student Portal` : "India's #1 AI Mock Test Platform"}
              </div>
              <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.08] tracking-tight text-white">
                Crack Any Exam
                <br />
                <span className="shimmer-text">With AI Precision</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Join 50,000+ aspirants who trust Mockbook for SSC, JEE, NEET, UPSC, Railway & Banking preparation.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {leftFeatures.map((f, i) => (
                <div
                  key={f.title}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 hover:border-white/15 transition-all group cursor-default"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform", f.color, f.glow)}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="text-xs text-slate-400 leading-snug mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial carousel */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="absolute top-4 right-4 opacity-20">
                <span className="text-4xl font-black text-white">"</span>
              </div>
              <div className="relative min-h-[80px] transition-all duration-500">
                <p className="text-sm text-slate-300 leading-relaxed italic pr-8">
                  "{quotes[activeQuote].text}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/8">
                <Image src={quotes[activeQuote].avatar} alt={quotes[activeQuote].name} width={32} height={32} className="rounded-full border border-white/20" />
                <div>
                  <p className="text-xs font-bold text-white">{quotes[activeQuote].name}</p>
                  <p className="text-[10px] text-primary font-bold">{quotes[activeQuote].rank}</p>
                </div>
                <div className="ml-auto flex gap-1.5">
                  {quotes.map((_, i) => (
                    <button key={i} onClick={() => setActiveQuote(i)} className={cn("h-1.5 rounded-full transition-all", activeQuote === i ? "w-6 bg-primary" : "w-1.5 bg-white/20")} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom trust strip */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-6">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Secure · No Spam · Your data is encrypted
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div className="flex-1 lg:w-[48%] xl:w-[45%] flex flex-col relative bg-white overflow-y-auto">
        {/* Top strip on mobile */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-accent" />

        {/* Subtle bg decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-50 blur-3xl pointer-events-none" />

        <div className="relative flex-1 flex flex-col justify-center px-6 sm:px-10 xl:px-16 py-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black">M</div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">Mockbook</span>
            </Link>
          </div>

          <div className={cn("transition-all duration-500 max-w-sm w-full mx-auto space-y-7", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>

            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500", isLogin ? "bg-gradient-to-br from-primary to-accent shadow-primary/30" : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30")}>
                  {isLogin ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isLogin ? "Welcome Back! 👋" : "Join Mockbook 🚀"}
              </h2>
              <p className="text-sm text-slate-500">
                {isLogin ? "Continue your exam preparation journey." : "Start your free journey to your dream rank."}
              </p>
            </div>

            {/* Demo/Guest Mode Removed */}

            {/* OR divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Or {isLogin ? "sign in" : "sign up"} with email</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleAuth} className="space-y-4">

              {/* Name (signup only) */}
              {!isLogin && (
                <div className="space-y-1.5 animate-slide-up-fade">
                  <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Full Name</Label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="name"
                      placeholder="Your full name"
                      className="pl-10 h-12 text-sm rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white transition-all"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Student ID or Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter Student ID or Email"
                    required
                    className="pl-10 h-12 text-sm rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-400 tracking-wide">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
                    required
                    className="pl-10 pr-12 h-12 text-sm rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {isLogin && (
                  <div className="flex justify-end">
                    <Link href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "btn-glow w-full h-12 rounded-xl font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5 relative overflow-hidden",
                  isLogin
                    ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 text-white"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20 text-white"
                )}
              >
                {loading
                  ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{isLogin ? "Signing In..." : "Creating Account..."}</span>
                  : <span className="flex items-center justify-center gap-2">
                    {isLogin ? <><LogIn className="h-4 w-4" /> Sign In</> : <><UserPlus className="h-4 w-4" /> Create Account</>}
                  </span>
                }
              </Button>
            </form>

            {/* Mini trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, label: "SSL Secure", color: "text-emerald-500" },
                { icon: Zap, label: "Instant Access", color: "text-amber-500" },
                { icon: Star, label: "4.9★ Rated", color: "text-blue-500" },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  <span className="text-[9px] font-bold text-slate-500 text-center leading-tight">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Floating mini stat cards */}
            <div className="grid grid-cols-3 gap-2">
              {floatCards.map(card => (
                <div key={card.label} className={cn("flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-100 text-center", card.bg)}>
                  <card.icon className={cn("h-4 w-4", card.color)} />
                  <p className={cn("text-sm font-black leading-none", card.color)}>{card.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 leading-tight">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Toggle login/signup */}
            <div className="text-center pt-1">
              <p className="text-sm text-slate-500">
                {isLogin ? "New to Mockbook?" : "Already have an account?"}{" "}
                <button
                  onClick={switchMode}
                  className="font-bold text-primary hover:underline underline-offset-2 transition-colors"
                >
                  {isLogin ? "Create free account →" : "Sign in →"}
                </button>
              </p>
            </div>

          </div>
        </div>

        {/* Bottom link */}
        <div className="relative px-6 sm:px-10 xl:px-16 pb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors font-semibold">
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </Link>
          <p className="text-xs text-slate-300">© 2026 Mockbook</p>
        </div>
      </div>

      {/* Mobile: floating stats row at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-100 px-4 py-3 flex items-center justify-around gap-2 z-50">
        {[
          { icon: Users, label: "50K+ Students", color: "text-blue-500" },
          { icon: Trophy, label: "12K+ Mocks", color: "text-amber-500" },
          { icon: CheckCircle2, label: "92% Success", color: "text-emerald-500" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <item.icon className={cn("h-3.5 w-3.5", item.color)} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
