"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  GraduationCap,
  Shield,
  Zap,
  Trophy,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ─── Animated Background Orbs ─────────────────────── */
const orbs = [
  { size: 400, x: "-20%", y: "-20%", color: "from-indigo-600/20 to-purple-600/10", animDelay: "0s" },
  { size: 350, x: "60%", y: "50%", color: "from-cyan-500/15 to-blue-500/10", animDelay: "2s" },
  { size: 300, x: "20%", y: "70%", color: "from-violet-600/15 to-pink-500/10", animDelay: "4s" },
];

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
        // Redirect back to where the user came from, or default to /tests
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
    setIsLogin(p => !p);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen flex bg-slate-950 overflow-hidden relative">
      {/* Animated Background Orbs */}
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full blur-3xl animate-pulse pointer-events-none",
            orb.color
          )}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            animationDelay: orb.animDelay,
            animationDuration: "8s",
          }}
        />
      ))}

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 flex w-full min-h-screen">

        {/* ══════════ LEFT PANEL - Branding ══════════ */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] flex-col justify-between p-8 xl:p-12 relative">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="text-white font-extrabold text-2xl tracking-tight">Mockbook</span>
          </Link>

          {/* Hero Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">India's #1 AI Testing Platform</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-black leading-tight text-white">
                Ace Your Exams with{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  AI Precision
                </span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Join 1.2 Lakh+ aspirants preparing for SSC, JEE, NEET, Railway & Banking with real-time analytics and AI-powered guidance.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <stat.icon className="h-5 w-5 text-blue-400 mb-2" />
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3">
              {features.map((f) => (
                <div key={f.title} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                  <f.icon className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-300">{f.title}</span>
                  <span className="text-slate-500 text-xs">· {f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Footer */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>Bank-grade security · Your data is encrypted</span>
          </div>
        </div>

        {/* ══════════ RIGHT PANEL - Auth Form ══════════ */}
        <div className="flex-1 flex items-center justify-center p-6 xl:p-12">
          <div
            className={cn(
              "w-full max-w-md transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Form Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

              {/* Header */}
              <div className="text-center mb-8">
                <div className={cn(
                  "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-500",
                  isLogin ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30" : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30"
                )}>
                  {isLogin ? <LogIn className="h-7 w-7 text-white" /> : <UserPlus className="h-7 w-7 text-white" />}
                </div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isLogin ? "Sign in to continue your preparation" : "Start your journey to success"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-5">

                {/* Name Field (Signup only) */}
                {!isLogin && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Full Name</Label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Student ID or Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      type="text"
                      placeholder="student@email.com or ID123"
                      required
                      className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Password</Label>
                    {isLogin && (
                      <Link href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all mt-2",
                    isLogin
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30 text-white"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30 text-white"
                  )}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500 font-medium">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Toggle Mode */}
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={switchMode}
                    className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mt-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">M</div>
              <span className="text-white font-bold text-lg">Mockbook</span>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-500 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}