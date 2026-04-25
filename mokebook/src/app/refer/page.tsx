
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  Share2,
  Copy,
  CheckCircle2,
  Users,
  Coins,
  TrendingUp,
  MessageCircle,
  Send,
  Zap
} from "lucide-react";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ReferAndEarnPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const userDoc = useDoc(user ? doc(db, "users", user.uid) : null);
  const referralCode = user?.uid?.substring(0, 8).toUpperCase() || "MOCKBOOK10";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Code Copied!",
      description: "Share this code with your friends.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareStats = [
    { label: "Friends Joined", value: "12", icon: Users, color: "text-[var(--badge-info-text)]" },
    { label: "Coins Earned", value: "6,000", icon: Coins, color: "text-[#FF6B2B]" },
    { label: "Milestone", value: "Silver", icon: Zap, color: "text-[#FF6B2B]" },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6 space-y-6 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="space-y-0.5">
              <h1 className="text-[18px] font-bold">Refer & Earn</h1>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Invite fellow students and unlock rewards.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden rounded-lg card-hover" style={{ background: "#FF6B2B" }}>
                  <CardContent className="p-6 space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.2)" }}>
                        <Gift className="h-5 w-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-[8px] font-bold" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none" }}>
                        LIMITED TIME OFFER
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-white leading-tight">
                        Give 500 Coins,<br />Get 500 Coins!
                      </h2>
                      <p className="text-white/80 text-[11px] max-w-sm">
                        Share your code, both get 500 coins instantly.
                      </p>
                    </div>

                    <div className="p-1 rounded-xl flex flex-col sm:flex-row items-center gap-2" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <div className="flex-1 px-3 py-1 text-center sm:text-left">
                        <p className="text-[8px] font-bold uppercase opacity-60 text-white">Referral Code</p>
                        <p className="text-lg font-mono font-bold tracking-widest text-white">{referralCode}</p>
                      </div>
                      <Button
                        onClick={handleCopy}
                        className="w-full sm:w-auto font-bold h-10 px-4 text-[11px] rounded-lg"
                        style={{ background: "#fff", color: "#FF6B2B" }}
                      >
                        {copied ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <section className="space-y-3">
                  <h3 className="text-[13px] font-bold">Quick Share</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "WhatsApp", icon: MessageCircle, color: "bg-emerald-500" },
                      { name: "Telegram", icon: Send, color: "bg-blue-500" },
                      { name: "Twitter", icon: Share2, color: "bg-slate-700" },
                      { name: "Others", icon: Share2, color: "bg-[#FF6B2B]" },
                    ].map((social) => (
                      <Button
                        key={social.name}
                        variant="outline"
                        className={cn("h-10 flex flex-col items-center justify-center gap-0.5 border-none text-white rounded-lg", social.color)}
                      >
                        <social.icon className="h-3 w-3" />
                        <span className="text-[9px] font-bold">{social.name}</span>
                      </Button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-[13px] font-bold">How it Works?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { step: "01", title: "Share Code", desc: "Send it to your study group." },
                      { step: "02", title: "Friend Joins", desc: "They sign up with your code." },
                      { step: "03", title: "Get Rewarded", desc: "Both get 500 coins instantly." },
                    ].map((item) => (
                      <div key={item.step} className="p-4 rounded-lg space-y-2 relative overflow-hidden group" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                        <span className="text-[28px] font-bold absolute -right-1 -top-1" style={{ color: "var(--text-muted)", opacity: 0.1 }}>
                          {item.step}
                        </span>
                        <h4 className="text-[11px] font-bold relative z-10" style={{ color: "var(--text-primary)" }}>{item.title}</h4>
                        <p className="text-[10px] leading-snug relative z-10" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <Card className="card-hover">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle className="text-[13px] font-bold flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} /> Referral Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {shareStats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "var(--bg-main)", border: "var(--border-card)" }}>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                            <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{stat.label}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</span>
                      </div>
                    ))}

                    <div className="pt-3 space-y-2" style={{ borderTop: "var(--divider)" }}>
                      <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        <span>Gold Milestone</span>
                        <span style={{ color: "#FF6B2B" }}>8/20 Friends</span>
                      </div>
                      <Progress value={40} className="h-1" />
                      <p className="text-[9px] text-center" style={{ color: "var(--text-muted)" }}>
                        Invite <span className="font-bold" style={{ color: "var(--text-primary)" }}>12 more</span> for <span className="font-bold" style={{ color: "#FF6B2B" }}>Gold Badge</span>!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
