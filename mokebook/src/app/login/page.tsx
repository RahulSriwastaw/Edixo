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



export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);

  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { org } = useOrganization();

  useEffect(() => {
    setMounted(true);
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
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden">

      {/* ══════════ LEFT PANEL (Redesigned) ══════════ */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden bg-slate-950">
        
        {/* Abstract Glowing Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.15),transparent_50%)] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-0 -right-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.12),transparent_50%)] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* High-tech Grid overlay */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />
        <div className="absolute inset-0 border-white/5 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          
          {/* Logo Container */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            {org?.logoUrl ? (
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-105 transition-all duration-300 border border-white/10 relative z-10">
                <Image src={org.logoUrl} alt={org.name} fill className="object-cover" sizes="48px" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300 border border-white/10 relative z-10">
                {org?.name?.charAt(0) || "M"}
              </div>
            )}
            <span className="text-white font-extrabold text-2xl tracking-tight relative z-10">{org?.name || "Mockbook"}</span>
          </Link>

          {/* Hero Section */}
          <div className="flex-1 flex flex-col justify-center space-y-12">
            
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[11px] font-black uppercase tracking-widest backdrop-blur-sm shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                {org?.name ? `${org.name} Student Portal` : "Next-Gen AI Testing Platform"}
              </div>
              
              <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm">
                Crack Any Exam
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  With AI Precision
                </span>
              </h1>
              
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg font-medium">
                Join 50,000+ aspirants who trust Mockbook for SSC, JEE, NEET, UPSC, Railway & Banking preparation.
              </p>
            </div>

            {/* Bento Grid Features */}
            <div className="grid grid-cols-2 gap-4 xl:gap-6 mt-8">
              {leftFeatures.map((f, i) => (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 transition-all duration-500 backdrop-blur-sm cursor-default"
                >
                  {/* Subtle hover background glow */}
                  <div className={cn("absolute -inset-2 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500", f.color)} />
                  
                  <div className="relative z-10">
                    <div className={cn("inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500", f.color, f.glow)}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1.5 tracking-tight group-hover:text-indigo-100 transition-colors">{f.title}</h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{f.desc}</p>
                  </div>
                </div>
              ))}
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
      <div className="flex-1 lg:w-[48%] xl:w-[45%] flex flex-col relative bg-white overflow-hidden">
        {/* Top strip on mobile */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-amber-400 to-accent" />

        {/* Subtle bg decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-50 blur-3xl pointer-events-none" />

        <div className="relative flex-1 flex flex-col justify-center px-4 sm:px-8 xl:px-12 py-6 overflow-y-auto">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6 mt-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm shadow-md">M</div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Mockbook</span>
            </Link>
          </div>

          <div className={cn("bg-white sm:border border-slate-100 sm:shadow-2xl sm:shadow-primary/5 sm:rounded-3xl p-4 sm:p-8 transition-all duration-500 max-w-[420px] w-full mx-auto space-y-5", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>

            {/* Header */}
            <div className="space-y-1.5 text-center">
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500", isLogin ? "bg-gradient-to-br from-primary to-accent shadow-primary/30" : "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30")}>
                  {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isLogin ? "Welcome Back!" : "Join Mockbook"}
              </h2>
              <p className="text-xs text-slate-500">
                {isLogin ? "Sign in to continue your preparation." : "Start your free journey today."}
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleAuth} className="space-y-3.5">

              {/* Name (signup only) */}
              {!isLogin && (
                <div className="space-y-1 animate-slide-up-fade">
                  <Label htmlFor="name" className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">Full Name</Label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="name"
                      placeholder="Your full name"
                      className="pl-9 h-11 text-sm rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white transition-all shadow-sm"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">Student ID or Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter ID or Email"
                    required
                    className="pl-9 h-11 text-sm rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white transition-all shadow-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-bold uppercase text-slate-500 tracking-wide">Password</Label>
                  {isLogin && (
                    <Link href="#" className="text-[11px] font-bold text-primary hover:underline">Forgot?</Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "••••••••" : "Min. 6 characters"}
                    required
                    className="pl-9 pr-10 h-11 text-sm rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-white transition-all shadow-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-11 rounded-xl font-bold text-sm shadow-md transition-all mt-2",
                  isLogin
                    ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 text-white"
                )}
              >
                {loading
                  ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{isLogin ? "Signing In..." : "Creating Account..."}</span>
                  : <span className="flex items-center justify-center gap-2">
                    {isLogin ? "Sign In" : "Create Account"} <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                }
              </Button>
            </form>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Toggle login/signup */}
            <div className="text-center pb-2">
              <p className="text-[13px] text-slate-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={switchMode}
                  className="font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

          </div>
        </div>

        {/* Bottom link */}
        <div className="relative px-6 sm:px-10 pb-6 flex items-center justify-center text-center mt-auto">
          <p className="text-[11px] font-medium text-slate-400">© 2026 Mockbook. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
