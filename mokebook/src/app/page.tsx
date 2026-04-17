"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  ArrowRight, Bot, BarChart3, Trophy,
  Sparkles, Play, Target, Zap, Star,
  Brain, Award, TrendingUp, Globe, Users,
  CheckCircle, ChevronRight, BookOpen,
  Medal, Rocket, Shield, Zap as Lightning
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent", className)}>
      {children}
    </span>
  );
}

function GlowButton({ children, href, primary = false }: { children: React.ReactNode; href: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300",
        primary
          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
          : "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
      )}
    >
      {children}
      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}

function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all">
        <Icon className="h-6 w-6 text-cyan-400 mb-3" />
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, icon: Icon, title, desc }: {
  number: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-all">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-black text-white/10">{number}</span>
      </div>
      <h4 className="font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-white/50">{desc}</p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && !isUserLoading) {
      router.push("/tests");
    }
  }, [user, isUserLoading, router]);

  if (!mounted || (user && !isUserLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-ping" />
            <div className="w-12 h-12 border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm font-medium text-cyan-400/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Floating Elements */}
        <div className="absolute top-20 right-[10%] w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-40 left-[15%] w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 right-[20%] w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-8">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400">Next-Gen Testing Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
            <span className="block text-white/90">Crack Your</span>
            <GradientText className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl">Dream Exam</GradientText>
            <span className="block text-white/60 text-2xl sm:text-3xl md:text-4xl mt-2">with AI-Powered Analytics</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto mb-10 font-medium">
            Join 1.25L+ students. Access 15K+ expert-crafted mock tests with real-time analytics & AIR tracking.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlowButton href="/login" primary>
              Start Free Trial
              <Rocket className="h-4 w-4" />
            </GlowButton>
            <GlowButton href="/tests">
              <Play className="h-4 w-4" />
              Explore Tests
            </GlowButton>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-white/40">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">1.25L+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value="1.25L+" label="Active Students" icon={Users} />
            <StatCard value="15K+" label="Mock Tests" icon={BookOpen} />
            <StatCard value="94%" label="Success Rate" icon={TrendingUp} />
            <StatCard value="120+" label="Exam Categories" icon={Globe} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Everything You <GradientText>Need</GradientText>
            </h2>
            <p className="text-white/50 max-w-lg mx-auto text-sm sm:text-base">
              Comprehensive tools designed by experts to help you succeed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Bot}
              title="AI Study Planner"
              desc="Personalized roadmaps based on your strengths & weaknesses"
              color="bg-gradient-to-br from-cyan-500 to-blue-600"
            />
            <FeatureCard
              icon={BarChart3}
              title="Real-time Analytics"
              desc="Track AIR ranking, percentile & detailed performance insights"
              color="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <FeatureCard
              icon={Trophy}
              title="Premium Tests"
              desc="15,000+ expert-crafted mocks for 120+ government exams"
              color="bg-gradient-to-br from-orange-500 to-red-600"
            />
            <FeatureCard
              icon={Brain}
              title="Smart Analysis"
              desc="AI-powered topic-wise breakdown & improvement suggestions"
              color="bg-gradient-to-br from-green-500 to-emerald-600"
            />
            <FeatureCard
              icon={Target}
              title="Exam Simulation"
              desc="Real exam environment with timer & strict proctoring"
              color="bg-gradient-to-br from-yellow-500 to-orange-600"
            />
            <FeatureCard
              icon={Award}
              title="Certificates"
              desc="Earn verified certificates & track your achievements"
              color="bg-gradient-to-br from-violet-500 to-purple-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              4 Steps to <GradientText>Success</GradientText>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard number="01" icon={Target} title="Choose Exam" desc="Select from 120+ categories" />
            <StepCard number="02" icon={Play} title="Take Test" desc="Real exam environment" />
            <StepCard number="03" icon={BarChart3} title="Analyze" desc="Get detailed insights" />
            <StepCard number="04" icon={Medal} title="Improve" desc="Track rank & progress" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-semibold text-green-400 uppercase tracking-wider mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Trusted by <GradientText>Top Rankers</GradientText>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Aditya V.", exam: "SSC CGL", rank: "AIR 42", quote: "AI analysis helped identify weak topics instantly." },
              { name: "Priya S.", exam: "SBI PO", rank: "AIR 156", quote: "Mock tests feel exactly like real exams." },
              { name: "Rahul K.", exam: "UPSC CSE", rank: "AIR 89", quote: "Structured preparation with detailed analytics." },
            ].map((t, i) => (
              <div key={i} className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/70 mb-4 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.exam} • {t.rank}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6,182,212,0.3) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to Start<br /><GradientText>Your Journey?</GradientText>
          </h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto text-sm sm:text-base">
            Join thousands of successful students. Start your preparation today.
          </p>
          <GlowButton href="/login" primary>
            Get Started Free
            <Lightning className="h-4 w-4" />
          </GlowButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-black">MB</div>
            <span className="text-sm font-bold tracking-tight">MockBook</span>
          </div>
          <div className="flex gap-6 text-xs text-white/40">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-white/30">© 2026 MockBook</p>
        </div>
      </footer>
    </div>
  );
}