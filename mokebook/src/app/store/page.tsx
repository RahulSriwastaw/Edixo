
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, ShieldCheck, Crown, ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const packs = [
  {
    id: "super-ssc",
    name: "SSC Super Pack",
    description: "CGL, CHSL, MTS & GD",
    tests: "500+ Tests",
    priceCoins: 2500,
    priceReal: "₹299",
    tag: "BEST SELLER",
    features: ["Full mocks", "Sectional Tests", "PYQ Papers"]
  },
  {
    id: "railway-elite",
    name: "Railway Elite Pass",
    description: "RRB NTPC, Group D & ALP",
    tests: "350+ Tests",
    priceCoins: 1800,
    priceReal: "₹199",
    tag: "POPULAR",
    features: ["Bilingual support", "Instant Solutions", "1-Year Valid"]
  },
  {
    id: "jee-advance-bundle",
    name: "JEE Mastery Bundle",
    description: "Mains + Advanced Focus",
    tests: "120+ Tests",
    priceCoins: 5000,
    priceReal: "₹599",
    tag: "PREMIUM",
    features: ["High-diff problems", "Video Solutions", "Mentor Access"]
  }
];

const individualSeries = [
  { name: "Current Affairs Monthly", price: 200, icon: Zap },
  { name: "Static GK Masterclass", price: 450, icon: ShieldCheck },
  { name: "Reasoning Drills", price: 300, icon: Zap },
];

export default function StorePage() {
  const [currentPoints] = useState(0);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-3 md:p-5 space-y-4 overflow-y-auto pb-16 md:pb-0">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="space-y-0.5">
              <Badge variant="outline" className="text-[8px] font-bold h-3.5" style={{ borderColor: "#FF6B2B", color: "#FF6B2B" }}>STORE</Badge>
              <h1 className="text-[18px] font-bold tracking-tight">Redeem Rewards</h1>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Unlock mocks with earned points.</p>
            </div>

            <Card className="shrink-0 card-hover">
              <CardContent className="p-2.5 flex items-center gap-2.5">
                <Coins className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                <div>
                  <p className="text-[8px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Balance</p>
                  <p className="text-base font-bold" style={{ color: "#FF6B2B" }}>{currentPoints.toLocaleString()} Coins</p>
                </div>
              </CardContent>
            </Card>
          </header>

          <section className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} />
              <h2 className="text-[13px] font-bold">Test Packs</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {packs.map((pack) => (
                <Card key={pack.id} className="relative overflow-hidden group card-hover">
                  <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "#FF6B2B" }} />
                  <CardHeader className="p-3.5">
                    <div className="flex justify-between items-start mb-1">
                      <Badge className="text-[7px] font-bold px-1 py-0" style={{ background: "var(--text-primary)", color: "var(--bg-card)" }}>{pack.tag}</Badge>
                      <span className="text-[8px] font-bold flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <ShoppingBag className="h-2.5 w-2.5" /> {pack.tests}
                      </span>
                    </div>
                    <CardTitle className="text-[13px] font-bold leading-tight">{pack.name}</CardTitle>
                    <CardDescription className="text-[9px] font-medium">{pack.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0 space-y-2">
                    <ul className="space-y-1">
                      {pack.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[9px]" style={{ color: "var(--text-secondary)" }}>
                          <CheckCircle2 className="h-2.5 w-2.5" style={{ color: "var(--badge-success-text)" }} />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 flex items-center justify-between" style={{ borderTop: "var(--divider)" }}>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-bold uppercase" style={{ color: "var(--text-muted)" }}>Price</p>
                        <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{pack.priceReal}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[8px] font-bold uppercase" style={{ color: "#FF6B2B" }}>Redeem</p>
                        <p className="text-[13px] font-bold flex items-center gap-1 justify-end" style={{ color: "#FF6B2B" }}>
                          <Coins className="h-3 w-3" /> {pack.priceCoins.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3.5 pt-0">
                    <Button className="w-full h-7 text-[9px] font-bold">Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="card-hover">
              <CardHeader className="p-3" style={{ borderBottom: "var(--divider)" }}>
                <CardTitle className="text-[13px] font-bold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" style={{ color: "#FF6B2B" }} /> Mini Packs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y" style={{ borderColor: "var(--divider)" }}>
                  {individualSeries.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 transition-colors hover:opacity-80">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
                        <span className="text-[11px] font-bold" style={{ color: "var(--text-primary)" }}>{item.name}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-[8px] font-bold"
                        style={{ borderColor: "rgba(255,107,43,0.3)", color: "#FF6B2B" }}
                      >
                        <Coins className="h-2.5 w-2.5 mr-1" /> {item.price}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover" style={{ background: "rgba(255,107,43,0.04)", border: "1px dashed rgba(255,107,43,0.2)" }}>
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto" style={{ background: "var(--bg-card)", border: "var(--border-card)" }}>
                  <Coins className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold">Need more coins?</h4>
                  <p className="text-[9px] leading-snug" style={{ color: "var(--text-muted)" }}>Complete daily streaks and mocks to earn more.</p>
                </div>
                <Button variant="link" size="sm" className="text-[9px] font-bold h-auto p-0" style={{ color: "#FF6B2B" }} asChild>
                  <Link href="/practice">Go to Practice</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
