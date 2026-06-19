"use client";
import { useState, useEffect } from "react";
import {
  Store, Search, Filter, Coins, Users, Eye, ShoppingCart, TrendingUp,
  Package, Globe, Star, ToggleLeft, ToggleRight, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
  return match ? match[1] : '';
}

export default function MarketplacePage() {
  const { isOpen } = useSidebarStore();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMarketplace, setTotalMarketplace] = useState(0);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      const res = await fetch(`${API_URL}/qbank/sets?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const d = await res.json();
        const allSets = d.data?.sets || [];
        setPacks(allSets);
        setTotalMarketplace(allSets.filter((s: any) => s.isGlobal).length);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMarketplace(); }, []);

  const toggleMarketplace = async (setId: string, currentGlobal: boolean) => {
    setToggling(setId);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/qbank/sets/${setId}/marketplace`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ isGlobal: !currentGlobal }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(d.message);
        fetchMarketplace();
      } else throw new Error(d.message);
    } catch (e: any) { toast.error(e.message || 'Failed to toggle'); }
    finally { setToggling(null); }
  };

  const filteredPacks = packs.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || p.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const subjects = [...new Set(packs.map(p => p.subject).filter(Boolean))];

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Marketplace</h1>
                <p className="text-[var(--text-secondary)] text-sm">Manage global question packs for sale to users</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={fetchMarketplace} disabled={loading} className="gap-2">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
                <Link href="/question-bank/sets/create">
                  <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2">
                    <Package className="w-4 h-4" /> Create Pack
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{packs.length}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Total Question Sets</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{totalMarketplace}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Published on Marketplace</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{packs.length - totalMarketplace}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Private (Not Published)</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <Input placeholder="Search packs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Packs List */}
            {loading ? (
              <div className="text-center py-12 text-[var(--text-muted)]">Loading marketplace data...</div>
            ) : (
              <div className="space-y-3">
                {filteredPacks.map((pack) => (
                  <Card key={pack.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pack.isGlobal ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                          {pack.isGlobal ? <Globe className="w-5 h-5 text-emerald-600" /> : <Package className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--text-primary)] truncate">{pack.name}</div>
                          <div className="text-xs text-[var(--text-secondary)] flex gap-3 mt-1">
                            <span>{pack.subject || 'No subject'}</span>
                            <span className="font-medium">{pack.totalQuestions || pack._count?.items || 0} questions</span>
                            {pack.chapter && <span>Chapter: {pack.chapter}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <Badge className={pack.isGlobal ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}>
                          {pack.isGlobal ? 'Marketplace' : 'Private'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--text-secondary)]">
                            {pack.isGlobal ? 'Published' : 'Not Published'}
                          </span>
                          <Switch
                            checked={pack.isGlobal}
                            disabled={toggling === pack.id}
                            onCheckedChange={() => toggleMarketplace(pack.id, pack.isGlobal)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredPacks.length === 0 && (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No question sets found. Create a set first, then publish it to the marketplace.</p>
                    <Link href="/question-bank/sets/create">
                      <Button className="mt-4 bg-[#F4511E] hover:bg-[#E64A19] text-white">Create Question Set</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}