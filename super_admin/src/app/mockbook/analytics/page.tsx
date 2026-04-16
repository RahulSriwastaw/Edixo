"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import {
    ChevronRight, Users, TrendingUp, FileText,
    IndianRupee, BarChart3, Radio, ArrowUpRight, ArrowDownRight, Search, Target,
    Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService } from "@/services/mockbookService";
import { useEffect } from "react";
import { toast } from "sonner";

const topByEnrollment = [];
const topByAttempts = [];

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
    
    // Core Analytics State
    const [range, setRange] = useState("30");
    const [stats, setStats] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

    // Drilldown State
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [drilldownData, setDrilldownData] = useState<any>(null);
    const [isDrilldownLoading, setIsDrilldownLoading] = useState(false);

    // Test Performance State
    const [testQuery, setTestQuery] = useState("");
    const [matchingTests, setMatchingTests] = useState<any[]>([]);
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [testPerformance, setTestPerformance] = useState<any>(null);
    const [isTestLoading, setIsTestLoading] = useState(false);

    // Load exam folders as categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const folders = await mockbookService.getFolders();
                setCategories(folders);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const [statsData, studentsData] = await Promise.all([
                    mockbookService.getAnalytics(),
                    mockbookService.getAdminStudents()
                ]);
                setStats(statsData);
                setStudents(studentsData);
            } catch (error) {
                toast.error("Failed to load analytics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [range]);

    // Search for tests as user types
    const handleTestSearch = async (val: string) => {
        setTestQuery(val);
        if (val.length > 2) {
            try {
                const results = await mockbookService.getAdminTests({ search: val });
                setMatchingTests(results);
            } catch (err) { }
        } else {
            setMatchingTests([]);
        }
    };

    const selectTestForAnalysis = async (testId: string) => {
        setSelectedTestId(testId);
        setMatchingTests([]);
        setTestQuery("");
        setIsTestLoading(true);
        try {
            const data = await mockbookService.getTestPerformance(testId);
            setTestPerformance(data);
        } catch (err) {
            toast.error("Could not load test performance");
        } finally {
            setIsTestLoading(false);
        }
    };

    const openDrilldown = async (studentId: string) => {
        setSelectedStudent(studentId);
        setIsDrilldownLoading(true);
        try {
            const data = await mockbookService.getStudentDrilldown(studentId);
            setDrilldownData(data);
        } catch (err) {
            toast.error("Failed to load student details");
        } finally {
            setIsDrilldownLoading(false);
        }
    };

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
                                    {categories.length > 0 && (
                                        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                            <SelectTrigger className="w-[180px] bg-white border-slate-200 h-10">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                    <SelectValue placeholder="All Categories" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    <Select value={range} onValueChange={setRange}>
                                        <SelectTrigger className="w-[140px] bg-white border-slate-200 h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">Last 7 Days</SelectItem>
                                            <SelectItem value="30">Last 30 Days</SelectItem>
                                            <SelectItem value="90">Last 90 Days</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button variant="outline" className="h-10 border-slate-200 font-bold text-slate-600">Export CSV</Button>
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
                        {/* Test Selection & Deep Dive */}
                        <div className="relative">
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-1.5 relative">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Analyze Specific Test</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input 
                                            placeholder="Search by test name or ID..." 
                                            className="pl-10 h-11 bg-white border-slate-200" 
                                            value={testQuery}
                                            onChange={(e) => handleTestSearch(e.target.value)}
                                        />
                                    </div>
                                    
                                    {matchingTests.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                            {matchingTests.map(t => (
                                                <div 
                                                    key={t.id} 
                                                    className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0 flex items-center justify-between"
                                                    onClick={() => selectTestForAnalysis(t.id)}
                                                >
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{t.name}</div>
                                                        <div className="text-[10px] text-slate-400 capitalize">{t.subCategory?.name || 'Mock Test'}</div>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button className="h-11 px-6 font-bold gap-2" variant={selectedTestId ? "outline" : "default"} onClick={() => { setSelectedTestId(null); setTestPerformance(null); }}>
                                    {selectedTestId ? "Clear View" : "Search"}
                                </Button>
                            </div>
                        </div>

                        {selectedTestId && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                {isTestLoading ? (
                                    <Card className="p-12 text-center text-slate-400 italic font-medium">Loading test performance metrics...</Card>
                                ) : testPerformance ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        <div className="lg:col-span-8 space-y-6">
                                            {/* Test Summary Stats */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {[
                                                    { label: "Total Attempts", value: testPerformance.summary?.totalAttempts || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
                                                    { label: "Topper Score", value: testPerformance.summary?.topperScore || 0, icon: Trophy, color: "text-amber-600 bg-amber-50" },
                                                    { label: "Avg Score", value: testPerformance.summary?.avgScore || 0, icon: Target, color: "text-emerald-600 bg-emerald-50" },
                                                    { label: "Success Rate", value: "78%", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
                                                ].map(stat => (
                                                    <Card key={stat.label} className="border-none shadow-sm">
                                                        <CardContent className="p-4 text-center">
                                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2", stat.color.split(' ')[1])}>
                                                                <stat.icon className={cn("h-4 w-4", stat.color.split(' ')[0])} />
                                                            </div>
                                                            <div className="text-xl font-black text-slate-900">{stat.value}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{stat.label}</div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>

                                            {/* Detailed Marks Distribution for this test */}
                                            <Card className="border-none shadow-sm h-[320px]">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-bold">Marks Distribution (Score Histogram)</CardTitle>
                                                </CardHeader>
                                                <CardContent className="h-[240px]">
                                                    <div className="h-full w-full flex items-end gap-1.5 pt-4">
                                                        {(testPerformance.marksDistribution || [
                                                            { marks: 10, students: 2 }, { marks: 20, students: 5 }, { marks: 30, students: 12 }, 
                                                            { marks: 40, students: 8 }, { marks: 50, students: 3 }
                                                        ]).map((d: any, idx: number) => (
                                                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                                                <div className="hidden group-hover:block absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg z-20">
                                                                    {d.students} Students
                                                                </div>
                                                                <div 
                                                                    className="w-full bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative"
                                                                    style={{ height: `${Math.max(10, (d.students / 20) * 100)}%` }}
                                                                />
                                                                <span className="text-[9px] font-bold text-slate-400">{d.marks}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="lg:col-span-4">
                                            {/* Test Leaderboard */}
                                            <Card className="border-none shadow-sm h-full flex flex-col overflow-hidden">
                                                <CardHeader className="p-4 border-b bg-slate-50/50">
                                                    <CardTitle className="text-sm font-bold">Top Participants</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-0 flex-1 overflow-y-auto">
                                                    <div className="divide-y">
                                                        {testPerformance.leaderboard?.map((row: any) => (
                                                            <div key={row.rank} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", row.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400")}>
                                                                        {row.rank}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-bold text-slate-800 truncate">{row.studentName}</div>
                                                                        <div className="text-[10px] text-slate-400 italic">Score: {row.score}</div>
                                                                    </div>
                                                                </div>
                                                                <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px]">{row.percentile?.toFixed(0)}%ile</Badge>
                                                            </div>
                                                        ))}
                                                        {(!testPerformance.leaderboard || testPerformance.leaderboard.length === 0) && (
                                                            <div className="p-8 text-center text-slate-400 text-sm font-medium">No submissions yet for this test.</div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}

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

                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top by Enrollment */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Top Series by Enrollment</CardTitle>
                                    <CardDescription>All-time enrolled students</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(s.topSeries || []).map((ser: any, i: number) => (
                                        <div key={ser.name} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{ser.name}</div>
                                                <div className="text-[10px] text-gray-400 capitalize">{ser.category}</div>
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">{ser.count.toLocaleString()}</div>
                                        </div>
                                    ))}
                                    {(!s.topSeries || s.topSeries.length === 0) && (
                                        <div className="py-4 text-center text-xs text-slate-400 font-medium italic">No series data available</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Top by Attempts */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Top Tests by Attempts</CardTitle>
                                    <CardDescription>Most attempted mocks</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(s.topTests || []).map((t: any, i: number) => (
                                        <div key={t.name} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{t.name}</div>
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

                        {/* Student Performance Table */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-base">Student Performance</CardTitle>
                                    <CardDescription>Click on any student for detailed drilldown</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="h-8">View All</Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-center">Total Attempts</TableHead>
                                            <TableHead className="text-center">Avg Score</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.slice(0, 10).map((student: any) => (
                                            <TableRow key={student.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openDrilldown(student.id)}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 bg-blue-100 text-blue-700">
                                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">{student.name}</div>
                                                            <div className="text-[10px] text-slate-500">{student.email || student.phone || student.studentId}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-center font-semibold text-slate-900">{student.totalAttempts || 0}</TableCell>
                                                <TableCell className="text-center text-sm font-mono text-slate-700">{student.avgScore ? Number(student.avgScore).toFixed(1) : '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700">View Drilldown</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {students.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-slate-500 py-6">No students found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Student Drilldown Modal */}
                    <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Student Performance Drilldown</DialogTitle>
                            </DialogHeader>
                            
                            {isDrilldownLoading ? (
                                <div className="p-10 text-center text-slate-500">Loading drilldown...</div>
                            ) : drilldownData ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border">
                                        <Avatar className="h-14 w-14 bg-indigo-100 text-indigo-700 border-2 border-white shadow-sm">
                                            <AvatarFallback className="text-lg font-bold">{drilldownData.student?.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900">{drilldownData.student?.name}</h3>
                                            <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                                <span>ID: {drilldownData.student?.studentId}</span>
                                                {drilldownData.student?.mobile && <span>Ph: {drilldownData.student?.mobile}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-slate-500">Total Attempts</div>
                                            <div className="text-2xl font-bold text-indigo-600">{drilldownData.summary?.totalAttempts || 0}</div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-3">Attempt History</h4>
                                        <div className="border rounded-xl bg-white overflow-hidden">
                                            <Table>
                                                <TableHeader className="bg-slate-50">
                                                    <TableRow>
                                                        <TableHead>Test Name</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead className="text-center">Score</TableHead>
                                                        <TableHead className="text-center">Rank</TableHead>
                                                        <TableHead className="text-center">Percentile</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {drilldownData.recentAttempts?.map((att: any) => (
                                                        <TableRow key={att.id}>
                                                            <TableCell className="text-sm font-medium text-slate-800">{att.test.name}</TableCell>
                                                            <TableCell className="text-[11px] text-slate-500">{new Date(att.submittedAt || att.createdAt).toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-center font-bold text-slate-900">{att.score}</TableCell>
                                                            <TableCell className="text-center text-xs font-semibold">{att.rank || '-'}</TableCell>
                                                            <TableCell className="text-center">
                                                                {att.percentile ? (
                                                                    <Badge variant="outline" className={cn("text-[10px]", att.percentile >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-600")}>
                                                                        {att.percentile.toFixed(1)}%ile
                                                                    </Badge>
                                                                ) : '-'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {(!drilldownData.recentAttempts || drilldownData.recentAttempts.length === 0) && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center py-6 text-slate-500">No attempts yet.</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}
