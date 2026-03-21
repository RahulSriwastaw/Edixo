
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    { label: "Friends Joined", value: "12", icon: Users, color: "text-blue-600" },
    { label: "Coins Earned", value: "6,000", icon: Coins, color: "text-yellow-600" },
    { label: "Milestone", value: "Silver", icon: Zap, color: "text-primary" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 md:p-6 space-y-6 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="space-y-0.5">
              <h1 className="text-xl font-headline font-bold">Refer & Earn</h1>
              <p className="text-[11px] text-muted-foreground">Invite fellow students and unlock rewards.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gradient-to-br from-primary to-accent text-white border-none shadow-xl overflow-hidden relative">
                  <CardContent className="p-6 space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Gift className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-none text-[8px] font-bold">
                        LIMITED TIME OFFER
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <h2 className="text-2xl font-headline font-bold leading-tight">
                        Give 500 Coins,<br />Get 500 Coins!
                      </h2>
                      <p className="text-white/80 text-[11px] max-w-sm">
                        Share your code, both get 500 coins instantly.
                      </p>
                    </div>

                    <div className="p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex-1 px-3 py-1 text-center sm:text-left">
                        <p className="text-[8px] font-bold uppercase opacity-60">Referral Code</p>
                        <p className="text-lg font-mono font-bold tracking-widest">{referralCode}</p>
                      </div>
                      <Button 
                        onClick={handleCopy}
                        className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold h-10 px-4 text-xs"
                      >
                        {copied ? <CheckCircle2 className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <section className="space-y-3">
                  <h3 className="text-sm font-headline font-bold">Quick Share</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "WhatsApp", icon: MessageCircle, color: "bg-green-500", hover: "hover:bg-green-600" },
                      { name: "Telegram", icon: Send, color: "bg-blue-400", hover: "hover:bg-blue-500" },
                      { name: "Twitter", icon: Share2, color: "bg-slate-900", hover: "hover:bg-slate-800" },
                      { name: "Others", icon: Share2, color: "bg-primary", hover: "hover:bg-primary/90" },
                    ].map((social) => (
                      <Button 
                        key={social.name}
                        variant="outline" 
                        className={cn("h-10 flex flex-col items-center justify-center gap-0.5 border-none text-white", social.color, social.hover)}
                      >
                        <social.icon className="h-3 w-3" />
                        <span className="text-[9px] font-bold">{social.name}</span>
                      </Button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-headline font-bold">How it Works?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { step: "01", title: "Share Code", desc: "Send it to your study group." },
                      { step: "02", title: "Friend Joins", desc: "They sign up with your code." },
                      { step: "03", title: "Get Rewarded", desc: "Both get 500 coins instantly." },
                    ].map((item) => (
                      <div key={item.step} className="p-4 rounded-xl bg-white border shadow-sm space-y-2 relative overflow-hidden group">
                        <span className="text-3xl font-headline font-bold text-primary/10 absolute -right-1 -top-1">
                          {item.step}
                        </span>
                        <h4 className="font-bold text-[11px] relative z-10">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground leading-snug relative z-10">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <Card className="shadow-sm border-none bg-white">
                  <CardHeader className="p-4 pb-1">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" /> Referral Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {shareStats.map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg bg-white shadow-sm", stat.color)}>
                            <stat.icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{stat.label}</span>
                        </div>
                        <span className="text-sm font-headline font-bold">{stat.value}</span>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Gold Milestone</span>
                        <span className="text-primary">8/20 Friends</span>
                      </div>
                      <Progress value={40} className="h-1" />
                      <p className="text-[9px] text-center text-muted-foreground">
                        Invite <span className="font-bold text-foreground">12 more</span> for <span className="text-primary font-bold">Gold Badge</span>!
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
