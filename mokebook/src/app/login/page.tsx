"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogIn, Mail, Lock, Loader2, Eye, EyeOff,
  UserPlus, GraduationCap, Shield, Zap,
  Trophy, Users, Star, ArrowRight, BrainCircuit,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ─── Stats Bar ─────────────────────── */
const stats = [
  { value: "1.2L+", label: "Active Students", icon: Users },
  { value: "12K+", label: "Mock Tests", icon: Trophy },
  { value: "98%", label: "Success Rate", icon: TrendingUp },
];

/* ─── Features ─────────────────────── */
const features = [
  { icon: BrainCircuit, title: "AI-Powered", desc: "Smart learning" },
  { icon: Zap, title: "Real-time", desc: "Instant results" },
  { icon: Star, title: "Top Rankers", desc: "Proven track record" },
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

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
        document.cookie = `token=${data.data.accessToken}; path=/; max-age=604800`;
        toast({
          title: isLogin ? "Welcome back! 🎉" : "Account created! 🚀",
          description: isLogin ? "Redirecting to your dashboard..." : "Your learning journey has begun."
        });
        const redirectTo = searchParams.get('redirect') || '/tests';
        window.location.href = redirectTo;
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
    setIsLogin((p) => !p);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative" style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}>
      <style jsx global>{`
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient { animation: gradient 4s ease infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes glow-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .animate-glow { animation: glow-pulse 4s ease-in-out infinite; }
      `}</style>

      {/* Background Glow Orbs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-[#FF6B2B]/8 rounded-full blur-[150px] animate-glow pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[#ff4400]/5 rounded-full blur-[120px] animate-glow pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Main Container */}
      <div className="relative z-10 flex w-full min-h-screen">

        {/* ══════════ LEFT PANEL - Branding ══════════ */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] flex-col justify-between p-8 xl:p-12 relative overflow-hidden" style={{ background: "var(--bg-sidebar)", borderRight: "var(--divider)" }}>
          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 100%)" }}>
              M
            </div>
            <span className="font-bold text-xl tracking-tight">Mockbook</span>
          </Link>

          {/* Hero Content */}
          <div className="relative z-10 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full animate-float"
              style={{ background: "linear-gradient(135deg, rgba(255,107,43,0.1) 0%, rgba(255,107,43,0.04) 100%)", border: "1px solid rgba(255,107,43,0.2)" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#FF6B2B" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#FF6B2B" }} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#FF6B2B" }}>India's #1 AI Testing Platform</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                Ace Your Exams with{" "}
                <span className="bg-gradient-to-r from-[#FF6B2B] via-[#ff8a5c] to-[#FF6B2B] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">AI Precision</span>
              </h1>
              <p className="text-sm leading-relaxed max-w-md opacity-60">
                Join 1.2 Lakh+ aspirants preparing for SSC, JEE, NEET, Railway & Banking with real-time analytics and AI-powered guidance.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative rounded-2xl p-3 overflow-hidden transition-all duration-500 hover:-translate-y-1"
                  style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF6B2B]/5 rounded-full blur-2xl translate-x-8 -translate-y-8 group-hover:bg-[#FF6B2B]/10 transition-all duration-700" />
                  <div className="relative z-10">
                    <stat.icon className="h-4 w-4 mb-1.5" style={{ color: "#FF6B2B" }} />
                    <div className="text-lg font-bold bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">{stat.value}</div>
                    <div className="text-[10px] font-medium opacity-50">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                  style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <f.icon className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} />
                  <span className="text-[12px] font-semibold">{f.title}</span>
                  <span className="text-[10px] opacity-50">· {f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Footer */}
          <div className="relative z-10 flex items-center gap-2 text-sm opacity-50">
            <Shield className="h-4 w-4" style={{ color: "#4CAF50" }} />
            <span>Bank-grade security · Your data is encrypted</span>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL - Auth Form ══════════ */}
        <div className="flex-1 flex items-center justify-center p-6 xl:p-12 relative">
          <div
            className={cn(
              "w-full max-w-md transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Form Card */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
            >
              {/* Top Glow Line */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF6B2B]/30 to-transparent" />

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-500 group-hover:scale-110" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 100%)" }}>
                  {isLogin ? <LogIn className="h-5 w-5 text-white" /> : <UserPlus className="h-5 w-5 text-white" />}
                </div>
                <h2 className="text-xl font-bold mb-1">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <p className="text-[12px] opacity-50">
                  {isLogin ? "Sign in to continue your preparation" : "Start your journey to success"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">

                {/* Name Field (Signup only) */}
                {!isLogin && (
                  <div className="space-y-1.5 animate-fade-in">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider opacity-50">Full Name</Label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10 h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF6B2B]/50 focus:ring-[#FF6B2B]/20"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider opacity-50">Student ID or Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                    <Input
                      type="text"
                      placeholder="student@email.com or ID123"
                      required
                      className="pl-10 h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF6B2B]/50 focus:ring-[#FF6B2B]/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider opacity-50">Password</Label>
                    {isLogin && (
                      <Link href="#" className="text-[11px] font-semibold transition-colors" style={{ color: "#FF6B2B" }}>
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="pl-10 pr-10 h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF6B2B]/50 focus:ring-[#FF6B2B]/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors opacity-50 hover:opacity-80"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-xl font-bold text-[13px] uppercase tracking-wider transition-all mt-1 relative overflow-hidden group"
                  style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 100%)" }}
                >
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-400" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isLogin ? "Signing In..." : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] font-medium opacity-50">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Toggle Mode */}
              <div className="text-center">
                <p className="text-[12px] opacity-70">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={switchMode}
                    className="font-bold transition-colors"
                    style={{ color: "#FF6B2B" }}
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mt-5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-black text-sm" style={{ background: "linear-gradient(135deg, #FF6B2B 0%, #ff8533 100%)" }}>M</div>
              <span className="font-bold text-base">Mockbook</span>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] mt-5 opacity-40">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}