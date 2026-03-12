"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { Loader2, TrendingUp, Trophy, Target, Zap, CheckCircle2, AlertCircle, BarChart3, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export default function OverallAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverallAnalytics = async () => {
      try {
        setLoading(true);
        // Step 1: Get current student user
        const userRes = await apiFetch("/auth/me");
        const studentId = userRes.data?.user?.studentId;
        
        if (studentId) {
          // Step 2: Fetch 30-day overall analytics from backend
          const analyticsRes = await apiFetch(`/mockbook/analytics/student/${studentId}/overall`);
          setAnalytics(analyticsRes.data);
        }
      } catch (err) {
        console.error("Failed to load overall analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverallAnalytics();
  }, []);

  const kpis = [
    { label: "Total Tests", value: analytics?.totalTests || 0, icon: Target, color: "text-blue-500 bg-blue-50" },
    { label: "Avg Score", value: analytics?.averageScore ? `${analytics.averageScore.toFixed(1)}` : "0", icon: Trophy, color: "text-purple-500 bg-purple-50" },
    { label: "Avg Accuracy", value: analytics?.averageAccuracy ? `${Math.round(analytics.averageAccuracy)}%` : "0%", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
    { label: "Time Spent", value: analytics?.totalTimeSecs ? `${Math.round(analytics.totalTimeSecs / 3600)}h` : "0h", icon: Clock, color: "text-orange-500 bg-orange-50" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Overall Analytics
              </h1>
              <p className="text-sm text-slate-500 mt-1">Your 30-day performance overview across all mock tests</p>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
                <p className="text-sm text-slate-500 font-semibold">Generating Your Analytics...</p>
              </div>
            ) : !analytics || analytics.totalTests === 0 ? (
               <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden py-12 text-center">
                 <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                   <Target className="h-8 w-8 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800">Not Enough Data</h3>
                 <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                   You need to attempt at least one mock test to see your overall 30-day analytics. Let's get started!
                 </p>
               </Card>
            ) : (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {kpis.map((kpi) => (
                    <Card key={kpi.label} className="border-none shadow-sm bg-white rounded-2xl">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl shrink-0", kpi.color)}>
                          <kpi.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{kpi.label}</p>
                          <p className="text-xl font-bold text-slate-900 leading-none mt-0.5">{kpi.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Performance Trend Chart */}
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Performance Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] p-4 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.trend || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          labelFormatter={(val) => new Date(val).toLocaleDateString()}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="score" name="Score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: 'hsl(var(--primary))'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI Insights & Weaknesses Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" /> Focus Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center min-h-[160px] text-slate-500 text-sm">
                      <p>Subject-wise breakdown is being processed.</p>
                      <p className="text-xs mt-1">Attempt more sectional tests for detailed insights.</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-sm bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-700">
                        AI Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        Based on your last {analytics.totalTests} tests, your accuracy is {Math.round(analytics.averageAccuracy || 0)}%. Consider dedicating more time to unattempted questions and reviewing incorrect answers carefully before jumping to the next mock.
                      </p>
                      <div className="pt-2">
                        <span className="inline-block bg-white text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 shadow-sm cursor-pointer hover:bg-indigo-50 transition-colors">
                          Suggested: Generate a 7-Day Revision Plan
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
