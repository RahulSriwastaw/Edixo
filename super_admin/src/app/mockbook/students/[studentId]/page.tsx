"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ChevronRight, Loader2, TrendingUp, Target, Clock,
    BookOpen, CheckCircle2, User, HelpCircle, Activity,
    CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService } from "@/services/mockbookService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentAnalyticsPage() {
    const { isOpen } = useSidebarStore();
    const params = useParams();
    const studentId = params.studentId as string;

    const [analytics, setAnalytics] = useState<any>(null);
    const [studyPlan, setStudyPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [analyticsData, planData] = await Promise.all([
                mockbookService.getStudentOverallAnalytics(studentId, 30),
                mockbookService.generateStudyPlan(studentId, 15)
            ]);
            
            setAnalytics(analyticsData);
            setStudyPlan(planData);
        } catch {
            toast.error("Failed to load student analytics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [studentId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!analytics) {
        return <div className="p-10 text-center text-red-500">Analytics not available.</div>;
    }

    // Format chart data
    const chartData = analytics.trend?.map((t: any, i: number) => ({
        name: `Test ${i + 1}`,
        score: t.score,
        accuracy: t.accuracy,
        date: new Date(t.date).toLocaleDateString()
    })) || [];

    const formatTime = (secs: number) => {
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link href="/mockbook/students" className="hover:text-orange-600">Students</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Performance Profile</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{analytics.studentName}'s Performance Profile</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Student ID: {analytics.studentRollId} | 30-Day performance overview and AI-generated study recommendations
                                </p>
                            </div>
                            <Button variant="outline" onClick={loadData}>Refresh Data</Button>
                        </div>

                        {/* Recommendation Banner */}
                        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100 shadow-sm">
                            <CardContent className="p-5 flex items-start gap-4">
                                <div className="p-2 bg-orange-100 rounded-lg shrink-0 mt-1">
                                    <HelpCircle className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-orange-900 mb-1">AI Performance Insight</h3>
                                    <p className="text-sm text-orange-800 leading-relaxed">
                                        {analytics.recommendation}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column - KPIs */}
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-xl">
                                            <Target className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 font-medium mb-0.5">Tests Completed</div>
                                            <div className="text-2xl font-bold text-gray-900">{analytics.totalTests}</div>
                                            <div className="text-xs text-gray-400 mt-1">in last 30 days</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 rounded-xl">
                                            <Activity className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 font-medium mb-0.5">Overall Accuracy</div>
                                            <div className="text-2xl font-bold text-gray-900">{analytics.overallAccuracy}%</div>
                                            <div className="text-xs text-gray-400 mt-1">across all subjects</div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="p-3 bg-purple-50 rounded-xl">
                                            <Clock className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500 font-medium mb-0.5">Time Spent</div>
                                            <div className="text-2xl font-bold text-gray-900">{formatTime(analytics.totalTimeSecs)}</div>
                                            <div className="text-xs text-gray-400 mt-1">active test taking time</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Charts & Plans */}
                            <div className="md:col-span-2">
                                <Tabs defaultValue="trend" className="w-full">
                                    <TabsList className="bg-white border mb-4">
                                        <TabsTrigger value="trend" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">Performance Trend</TabsTrigger>
                                        <TabsTrigger value="plan" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">Generated Study Plan</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="trend">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">Score Progression (Last 30 Days)</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {chartData.length > 0 ? (
                                                    <div className="h-[300px] w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                                                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                                                <Tooltip
                                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                    labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                                                                />
                                                                <Line yAxisId="left" type="monotone" dataKey="score" name="Score" stroke="#EA580C" strokeWidth={3} dot={{ r: 4, fill: '#EA580C' }} activeDot={{ r: 6 }} />
                                                                <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" strokeWidth={2} dot={false} />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                ) : (
                                                    <div className="h-[300px] flex items-center justify-center text-gray-400 flex-col">
                                                        <TrendingUp className="w-12 h-12 mb-2 text-gray-200" />
                                                        <p>Not enough test data to construct a trendline.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="plan">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <div>
                                                    <CardTitle className="text-base">Data-Driven Target Plan</CardTitle>
                                                    <CardDescription>Customized {studyPlan?.duration}-day schedule to improve weak areas</CardDescription>
                                                </div>
                                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                                                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> 
                                                    {studyPlan?.duration} Days
                                                </Badge>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4 mt-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {studyPlan?.plan?.map((day: any) => (
                                                        <div key={day.day} className="flex gap-4 p-4 border rounded-xl hover:border-orange-200 transition-colors bg-white">
                                                            <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 rounded-full bg-gray-50 border border-gray-100">
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Day</span>
                                                                <span className="text-lg font-bold text-gray-800 leading-none">{day.day}</span>
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-semibold text-gray-900">{day.title}</h4>
                                                                    <Badge variant="outline" className="text-[10px] font-medium bg-gray-50 text-gray-600">
                                                                        {day.taskType}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-gray-500">{day.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
