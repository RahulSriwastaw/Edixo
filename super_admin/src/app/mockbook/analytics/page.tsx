"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import {
    ChevronRight, Users, TrendingUp, FileText,
    IndianRupee, BarChart3, Radio, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService } from "@/services/mockbookService";
import { useEffect } from "react";
import { toast } from "sonner";

const topByEnrollment = [
    { name: "SSC CGL Mock Test Series 2026", category: "SSC", count: 74636 },
    { name: "RRB NTPC Graduate 2025 Series", category: "Railways", count: 61540 },
    { name: "IBPS PO Complete Series 2026", category: "Banking", count: 45230 },
    { name: "NEET 2026 Full Mock Series", category: "NEET", count: 38900 },
    { name: "JEE Mains 2026 Practice Series", category: "JEE", count: 29100 },
];

const topByAttempts = [
    { name: "SSC CGL Full Mock 1", series: "SSC CGL 2026", count: 45230 },
    { name: "Daily GK Booster — March", series: "Free Quizzes", count: 38450 },
    { name: "CA Booster March 2026", series: "Current Affairs", count: 29100 },
    { name: "Banking PO Full Mock 3", series: "IBPS PO 2026", count: 18760 },
    { name: "NEET Biology Booster Live", series: "NEET 2026", count: 14900 },
];

const dailyData = [
    { day: "Mar 5", tests: 3820, revenue: 18400, users: 9200 },
    { day: "Mar 6", tests: 4100, revenue: 21000, users: 10300 },
    { day: "Mar 7", tests: 5200, revenue: 28500, users: 12100 },
    { day: "Mar 8", tests: 4800, revenue: 24000, users: 11400 },
    { day: "Mar 9", tests: 6100, revenue: 34000, users: 14800 },
    { day: "Mar 10", tests: 7400, revenue: 42000, users: 16900 },
    { day: "Mar 11", tests: 6900, revenue: 39000, users: 15600 },
];

const maxTests = Math.max(...dailyData.map(d => d.tests));

export default function AnalyticsPage() {
    const { isOpen } = useSidebarStore();
    const [range, setRange] = useState("30");
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await mockbookService.getAnalytics();
                setStats(data);
            } catch (error) {
                toast.error("Failed to load analytics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading) return <div className="p-10 text-center text-gray-500">Loading analytics...</div>;
    const s = stats || {};

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Analytics</span>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">MockBook Analytics</h1>
                                <p className="text-gray-500 text-sm mt-1">Platform-wide performance metrics</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={range} onValueChange={setRange}>
                                    <SelectTrigger className="w-[160px] input-field">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">Last 7 days</SelectItem>
                                        <SelectItem value="30">Last 30 days</SelectItem>
                                        <SelectItem value="90">Last 90 days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline">Export CSV</Button>
                            </div>
                        </div>

                        {/* KPIs */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Live Students Now", value: s.liveNow || "0", change: "+12%", positive: true, icon: Users, color: "text-blue-600 bg-blue-50" },
                                { label: "Total Tests (Live)", value: s.platformTests || "0", change: "+8%", positive: true, icon: FileText, color: "text-orange-600 bg-orange-50" },
                                { label: "Total Test Series", value: s.totalSeries || "0", change: "+23%", positive: true, icon: TrendingUp, color: "text-green-600 bg-green-50" },
                                { label: "Revenue (MTD)", value: `₹${(s.revenueMTD || 0).toLocaleString()}`, change: "+15%", positive: true, icon: IndianRupee, color: "text-purple-600 bg-purple-50" },
                            ].map(kpi => {
                                const Icon = kpi.icon;
                                const [iconColor, bgColor] = kpi.color.split(" ");
                                return (
                                    <Card key={kpi.label} className="kpi-card">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", bgColor)}>
                                                    <Icon className={cn("w-5 h-5", iconColor)} />
                                                </div>
                                                <div className={cn("flex items-center gap-1 text-xs font-medium", kpi.positive ? "text-green-600" : "text-red-500")}>
                                                    {kpi.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                                    {kpi.change}
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Daily Tests Chart (CSS bar chart) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Daily Tests Attempted — Last 7 days</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end gap-3 h-40">
                                    {dailyData.map(d => (
                                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="text-[10px] text-gray-500 font-mono">{d.tests.toLocaleString()}</div>
                                            <div
                                                className="w-full rounded-t-md bg-gradient-to-t from-orange-500 to-orange-300 transition-all hover:opacity-80"
                                                style={{ height: `${(d.tests / maxTests) * 100}%`, minHeight: 4 }}
                                            />
                                            <div className="text-[10px] text-gray-400">{d.day}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Series Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top by Enrollment */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Top Series by Enrollment</CardTitle>
                                    <CardDescription>All-time enrolled students</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {topByEnrollment.map((s, i) => (
                                        <div key={s.name} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">{s.category}</div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-gradient-to-r from-orange-400 to-orange-300 h-1.5 rounded-full"
                                                        style={{ width: `${(s.count / topByEnrollment[0].count) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-700 shrink-0">{s.count.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Top by Attempts */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Top Tests by Attempts</CardTitle>
                                    <CardDescription>Most attempted individual tests</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {topByAttempts.map((t, i) => (
                                        <div key={t.name} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{t.name}</div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">{t.series}</div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-400 to-blue-300 h-1.5 rounded-full"
                                                        style={{ width: `${(t.count / topByAttempts[0].count) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-700 shrink-0">{t.count.toLocaleString()}</div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Revenue Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Revenue Breakdown — MTD</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <div className="space-y-4 flex-1">
                                        {[
                                            { label: "Individual Series Purchases", amount: 145000, pct: 62, color: "bg-orange-500" },
                                            { label: "Pass Subscriptions (Monthly)", amount: 54000, pct: 23, color: "bg-blue-500" },
                                            { label: "Pass Subscriptions (Yearly)", amount: 35500, pct: 15, color: "bg-purple-500" },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-700 flex items-center gap-2">
                                                        <span className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
                                                        {item.label}
                                                    </span>
                                                    <span className="font-semibold">₹{item.amount.toLocaleString()} ({item.pct}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3">
                                                    <div className={cn("h-3 rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="shrink-0 text-center p-6 border-l">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Total Revenue</div>
                                        <div className="text-3xl font-bold text-gray-900">₹{(s.revenueMTD || 0).toLocaleString()}</div>
                                        <div className="text-xs text-green-600 mt-1">↑ +15% vs last month</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
