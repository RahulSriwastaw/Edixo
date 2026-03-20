"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, Plus, Trash2, Save, LayoutTemplate, Zap,
  Link2, Image, Star, BarChart3, Loader2, CheckCircle, 
  GripVertical, MoveUp, MoveDown, Youtube, BookOpen,
  FileText, Trophy, Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const QUICK_LINK_ICONS = [
  { id: "free-test", label: "Free Test", icon: "📝" },
  { id: "previous-papers", label: "Prev. Papers", icon: "📄" },
  { id: "full-length", label: "Full Length", icon: "🏆" },
  { id: "sectional", label: "Sectional", icon: "🎯" },
  { id: "speed-test", label: "Speed Test", icon: "⚡" },
  { id: "daily-quiz", label: "Daily Quiz", icon: "📅" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "bookmarks", label: "Bookmarks", icon: "🔖" },
];

const GRADIENT_OPTIONS = [
  { label: "Purple → Blue", value: "from-violet-600 to-blue-600" },
  { label: "Orange → Red", value: "from-orange-500 to-red-600" },
  { label: "Teal → Cyan", value: "from-teal-500 to-cyan-500" },
  { label: "Indigo → Violet", value: "from-indigo-600 to-violet-700" },
  { label: "Emerald → Teal", value: "from-emerald-500 to-teal-600" },
  { label: "Rose → Pink", value: "from-rose-500 to-pink-600" },
];

function getToken() {
  const m = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
  return m ? m[1] : "";
}

export default function FrontendConfigPage() {
  const { isOpen } = useSidebarStore();
  const params = useParams();
  const orgId = params.orgId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Config State
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [quickLinks, setQuickLinks] = useState<any[]>([]);
  const [heroText, setHeroText] = useState("Ready to crack your exam?");
  const [heroSubText, setHeroSubText] = useState("Attempt mocks, track analytics, and build your strategy.");
  const [stats, setStats] = useState<any[]>([
    { label: "Active Students", value: "0+" },
    { label: "Mock Tests", value: "0+" },
    { label: "Success Rate", value: "0%" },
    { label: "AI Study Plans", value: "0+" },
  ]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/organizations/public/${orgId}`);
        const data = await res.json();
        if (data.success && data.data.frontendConfig) {
          const cfg = data.data.frontendConfig;
          if (cfg.promoBanners) setPromoBanners(cfg.promoBanners);
          if (cfg.quickLinks) setQuickLinks(cfg.quickLinks);
          if (cfg.heroText) setHeroText(cfg.heroText);
          if (cfg.heroSubText) setHeroSubText(cfg.heroSubText);
          if (cfg.stats) setStats(cfg.stats);
        }
      } catch (e) {
        console.error("Failed to fetch frontend config", e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [orgId]);

  const saveConfig = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/organizations/${orgId}/frontend-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promoBanners, quickLinks, heroText, heroSubText, stats }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    setPromoBanners(prev => [...prev, {
      id: `banner-${Date.now()}`,
      title: "New Promotion",
      subtitle: "Description here",
      badgeText: "NEW",
      ctaText: "Start Now",
      imageUrl: "",
      linkUrl: "/tests",
      gradient: "from-violet-600 to-blue-600",
    }]);
  };

  const updateBanner = (id: string, key: string, value: string) => {
    setPromoBanners(prev => prev.map(b => b.id === id ? { ...b, [key]: value } : b));
  };

  const removeBanner = (id: string) => setPromoBanners(prev => prev.filter(b => b.id !== id));

  const addQuickLink = (preset: typeof QUICK_LINK_ICONS[0]) => {
    if (quickLinks.some(ql => ql.id === preset.id)) return;
    setQuickLinks(prev => [...prev, { ...preset, linkUrl: "/tests" }]);
  };

  const removeQuickLink = (id: string) => setQuickLinks(prev => prev.filter(ql => ql.id !== id));

  const updateStat = (index: number, key: string, value: string) => {
    setStats(prev => prev.map((s, i) => i === index ? { ...s, [key]: value } : s));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/mockbook/org/${orgId}`} className="hover:text-orange-600">{orgId}</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Frontend Config</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <LayoutTemplate className="h-5 w-5 text-purple-600" />
                  </div>
                  Student App Frontend Config
                </h1>
                <p className="text-gray-500 text-sm mt-1">Customize what students see when they log in to Mockbook ({orgId}).</p>
              </div>
              <Button
                onClick={saveConfig}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white gap-2 h-10 px-6 rounded-xl"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Saved!" : "Save All Changes"}
              </Button>
            </div>

            <Tabs defaultValue="banners">
              <TabsList className="bg-white border">
                <TabsTrigger value="banners" className="gap-2"><Image className="h-4 w-4" />Promo Banners</TabsTrigger>
                <TabsTrigger value="quicklinks" className="gap-2"><Zap className="h-4 w-4" />Quick Links</TabsTrigger>
                <TabsTrigger value="hero" className="gap-2"><Star className="h-4 w-4" />Welcome Banner</TabsTrigger>
                <TabsTrigger value="stats" className="gap-2"><BarChart3 className="h-4 w-4" />Platform Stats</TabsTrigger>
              </TabsList>

              {/* ── PROMO BANNERS ─────────────────────── */}
              <TabsContent value="banners" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Promotional Banners</CardTitle>
                      <CardDescription>Sliding banners shown at the top of the student dashboard</CardDescription>
                    </div>
                    <Button onClick={addBanner} variant="outline" className="gap-2 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50">
                      <Plus className="h-4 w-4" /> Add Banner
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {promoBanners.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <Image className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No banners yet. Click "Add Banner" to create the first one.</p>
                      </div>
                    )}
                    {promoBanners.map((banner, index) => (
                      <div key={banner.id} className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-300" />
                            <Badge variant="outline" className="text-xs">Banner {index + 1}</Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl" onClick={() => removeBanner(banner.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Preview */}
                        <div className={`h-28 rounded-xl bg-gradient-to-br ${banner.gradient || 'from-violet-600 to-blue-600'} p-5 text-white flex flex-col justify-between`}>
                          <div>
                            {banner.badgeText && <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{banner.badgeText}</span>}
                            <h3 className="font-black text-lg mt-1">{banner.title}</h3>
                            <p className="text-sm opacity-80">{banner.subtitle}</p>
                          </div>
                          {banner.ctaText && <span className="text-xs font-bold bg-white text-violet-600 px-4 py-1 rounded-full self-start">{banner.ctaText}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500">Title</Label>
                            <Input value={banner.title} onChange={e => updateBanner(banner.id, "title", e.target.value)} className="h-9 rounded-xl text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500">Badge Text</Label>
                            <Input value={banner.badgeText} onChange={e => updateBanner(banner.id, "badgeText", e.target.value)} className="h-9 rounded-xl text-sm" placeholder="e.g. NEW, FREE, HOT" />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs font-bold text-gray-500">Subtitle</Label>
                            <Input value={banner.subtitle} onChange={e => updateBanner(banner.id, "subtitle", e.target.value)} className="h-9 rounded-xl text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500">CTA Button Text</Label>
                            <Input value={banner.ctaText} onChange={e => updateBanner(banner.id, "ctaText", e.target.value)} className="h-9 rounded-xl text-sm" placeholder="e.g. Start Now" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-gray-500">Link URL</Label>
                            <Input value={banner.linkUrl} onChange={e => updateBanner(banner.id, "linkUrl", e.target.value)} className="h-9 rounded-xl text-sm" placeholder="/tests/series/..." />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs font-bold text-gray-500">Gradient</Label>
                            <div className="flex flex-wrap gap-2">
                              {GRADIENT_OPTIONS.map(g => (
                                <button
                                  key={g.value}
                                  onClick={() => updateBanner(banner.id, "gradient", g.value)}
                                  className={`h-8 w-24 rounded-xl bg-gradient-to-r ${g.value} text-white text-[10px] font-bold ring-2 ring-offset-2 transition-all ${banner.gradient === g.value ? 'ring-orange-500' : 'ring-transparent'}`}
                                >
                                  {g.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── QUICK LINKS ─────────────────────────── */}
              <TabsContent value="quicklinks" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                    <CardDescription>Icon buttons shown below the promo banners for quick navigation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold text-gray-500 mb-3 block">Click to Add Preset Quick Links</Label>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_LINK_ICONS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => addQuickLink(preset)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                              quickLinks.some(ql => ql.id === preset.id)
                                ? "bg-orange-50 border-orange-300 text-orange-700"
                                : "bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50"
                            )}
                          >
                            <span>{preset.icon}</span> {preset.label}
                            {quickLinks.some(ql => ql.id === preset.id) && <CheckCircle className="h-3.5 w-3.5 text-orange-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <Label className="text-xs font-bold text-gray-500 mb-3 block">Active Quick Links (Edit URLs)</Label>
                      {quickLinks.length === 0 && (
                        <p className="text-gray-400 text-sm italic text-center py-6">No quick links added yet.</p>
                      )}
                      <div className="space-y-2">
                        {quickLinks.map(ql => (
                          <div key={ql.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="text-xl w-8 text-center">{ql.icon}</span>
                            <span className="font-semibold text-sm text-gray-700 w-32 shrink-0">{ql.label}</span>
                            <Input
                              value={ql.linkUrl}
                              onChange={e => setQuickLinks(prev => prev.map(q => q.id === ql.id ? { ...q, linkUrl: e.target.value } : q))}
                              className="h-8 rounded-lg text-sm flex-1"
                              placeholder="Link URL"
                            />
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 h-8 w-8 rounded-lg" onClick={() => removeQuickLink(ql.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── HERO / WELCOME BANNER ───────────────── */}
              <TabsContent value="hero" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Banner Text</CardTitle>
                    <CardDescription>The motivational banner shown at the top of the dashboard (logged-in view)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preview */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                      <div className="relative z-10 space-y-2">
                        <p className="text-xs font-black text-orange-400 uppercase tracking-widest">Your Daily Target</p>
                        <h2 className="text-3xl font-black">{heroText || "Welcome back!"}</h2>
                        <p className="text-slate-300 text-sm">{heroSubText}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500">Main Heading</Label>
                      <Input value={heroText} onChange={e => setHeroText(e.target.value)} className="h-10 rounded-xl" placeholder="e.g. Ready to crack your exam?" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500">Sub-heading</Label>
                      <Input value={heroSubText} onChange={e => setHeroSubText(e.target.value)} className="h-10 rounded-xl" placeholder="e.g. Attempt mocks, track your progress..." />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── STATS ─────────────────────────────────── */}
              <TabsContent value="stats" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Statistics</CardTitle>
                    <CardDescription>Numbers shown on the student dashboard as social proof</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stats.map((stat, index) => (
                      <div key={index} className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-gray-500">Label</Label>
                          <Input value={stat.label} onChange={e => updateStat(index, "label", e.target.value)} className="h-9 rounded-xl text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-gray-500">Value (e.g. "50K+", "92%")</Label>
                          <Input value={stat.value} onChange={e => updateStat(index, "value", e.target.value)} className="h-9 rounded-xl text-sm" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
