
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
    color: "from-blue-500 to-indigo-600",
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
    color: "from-orange-500 to-red-600",
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
    color: "from-purple-500 to-pink-600",
    features: ["High-diff problems", "Video Solutions", "Mentor Access"]
  }
];

const individualSeries = [
  { name: "Current Affairs Monthly", price: 200, icon: Zap },
  { name: "Static GK Masterclass", price: 450, icon: ShieldCheck },
  { name: "Reasoning Drills", price: 300, icon: Zap },
];

export default function StorePage() {
  const [currentPoints] = useState(0); // Points will come from a wallet API endpoint when available

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 md:ml-48 p-3 md:p-4 space-y-4">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="space-y-0.5">
              <Badge variant="outline" className="border-primary text-primary font-bold text-[8px] h-3.5">STORE</Badge>
              <h1 className="text-xl font-headline font-bold tracking-tight">Redeem Rewards</h1>
              <p className="text-[10px] text-muted-foreground">Unlock mocks with earned points.</p>
            </div>
            
            <Card className="bg-white border-primary/10 shadow-sm shrink-0">
              <CardContent className="p-2.5 flex items-center gap-2.5">
                <Coins className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                <div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Balance</p>
                  <p className="text-base font-headline font-bold text-yellow-700">{currentPoints.toLocaleString()} Coins</p>
                </div>
              </CardContent>
            </Card>
          </header>

          <section className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-sm font-headline font-bold">Test Packs</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {packs.map((pack) => (
                <Card key={pack.id} className="relative overflow-hidden group border-none shadow-sm hover:shadow-md transition-all">
                  <div className={cn("absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r", pack.color)} />
                  <CardHeader className="p-3.5">
                    <div className="flex justify-between items-start mb-1">
                      <Badge className="bg-slate-900 text-[7px] font-bold px-1 py-0">{pack.tag}</Badge>
                      <span className="text-[8px] font-bold text-muted-foreground flex items-center gap-1">
                        <ShoppingBag className="h-2.5 w-2.5" /> {pack.tests}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-headline font-bold leading-tight">{pack.name}</CardTitle>
                    <CardDescription className="text-[9px] font-medium">{pack.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0 space-y-2">
                    <ul className="space-y-1">
                      {pack.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[9px] text-slate-600">
                          <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">Price</p>
                        <p className="text-[13px] font-headline font-bold text-slate-900">{pack.priceReal}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[8px] font-bold text-primary uppercase">Redeem</p>
                        <p className="text-[13px] font-headline font-bold flex items-center gap-1 justify-end">
                          <Coins className="h-3 w-3 text-yellow-600 fill-yellow-600" /> {pack.priceCoins.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-3.5 pt-0">
                    <Button className="w-full bg-slate-900 h-7 text-[9px] font-bold">Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="p-3 border-b">
                <CardTitle className="text-[13px] font-headline font-bold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Mini Packs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {individualSeries.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-3 w-3 text-slate-500" />
                        <span className="text-[11px] font-bold text-slate-700">{item.name}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 border-yellow-500/30 text-yellow-700 font-bold text-[8px]">
                        <Coins className="h-2.5 w-2.5 mr-1 fill-yellow-600" /> {item.price}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-dashed border-primary/20 shadow-none">
              <CardContent className="p-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto">
                  <Coins className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-[11px]">Need more coins?</h4>
                  <p className="text-[9px] text-muted-foreground leading-snug">Complete daily streaks and mocks to earn more.</p>
                </div>
                <Button variant="link" size="sm" className="text-primary font-bold text-[9px] h-auto p-0" asChild>
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
