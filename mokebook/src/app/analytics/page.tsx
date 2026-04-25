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
        const userRes = await apiFetch("/auth/me");
        const studentId = userRes.data?.user?.studentId;

        if (studentId) {
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
    { label: "Total Tests", value: analytics?.totalTests || 0, icon: Target, color: "text-[#FF6B2B]" },
    { label: "Avg Score", value: analytics?.averageScore ? `${analytics.averageScore.toFixed(1)}` : "0", icon: Trophy, color: "text-[#FF6B2B]" },
    { label: "Avg Accuracy", value: analytics?.averageAccuracy ? `${Math.round(analytics.averageAccuracy)}%` : "0%", icon: CheckCircle2, color: "text-[var(--badge-success-text)]" },
    { label: "Time Spent", value: analytics?.totalTimeSecs ? `${Math.round(analytics.totalTimeSecs / 3600)}h` : "0h", icon: Clock, color: "text-[var(--badge-info-text)]" }
  ];

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--bg-body)", color: "var(--text-primary)" }}
    >
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-5 overflow-y-auto thin-scrollbar pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto space-y-5">
            <div>
              <h1 className="text-[18px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <BarChart3 className="h-5 w-5" style={{ color: "#FF6B2B" }} />
                Overall Analytics
              </h1>
              <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>Your 30-day performance overview across all mock tests</p>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: "#FF6B2B" }} />
                <p className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Generating Your Analytics...</p>
              </div>
            ) : !analytics || analytics.totalTests === 0 ? (
              <Card className="py-10 text-center">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bg-main)" }}>
                  <Target className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
                </div>
                <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>Not Enough Data</h3>
                <p className="text-[12px] max-w-sm mx-auto mt-2" style={{ color: "var(--text-muted)" }}>
                  You need to attempt at least one mock test to see your overall 30-day analytics. Let's get started!
                </p>
              </Card>
            ) : (
              <div className="space-y-5">
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {kpis.map((kpi) => (
                    <Card key={kpi.label} className="card-hover">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="p-2 rounded-lg shrink-0" style={{ background: "var(--bg-main)" }}>
                          <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-tight" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
                          <p className="text-lg font-bold leading-none mt-0.5" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Performance Trend Chart */}
                <Card className="card-hover">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" style={{ color: "#FF6B2B" }} /> Performance Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[220px] p-3 pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics?.trend || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          labelFormatter={(val) => new Date(val).toLocaleDateString()}
                          contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                        />
                        <Line type="monotone" dataKey="score" name="Score" stroke="#FF6B2B" strokeWidth={2} dot={{ r: 3, fill: '#FF6B2B' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI Insights & Weaknesses Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="card-hover">
                    <CardHeader className="p-3 pb-1" style={{ borderBottom: "var(--divider)" }}>
                      <CardTitle className="flex items-center gap-2" style={{ color: "var(--badge-error-text)" }}>
                        <AlertCircle className="h-4 w-4" /> Focus Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 flex flex-col items-center justify-center text-center min-h-[140px] text-[12px]" style={{ color: "var(--text-muted)" }}>
                      <p>Subject-wise breakdown is being processed.</p>
                      <p className="text-[11px] mt-1">Attempt more sectional tests for detailed insights.</p>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="flex items-center gap-2" style={{ color: "#FF6B2B" }}>
                        <Zap className="h-4 w-4" /> AI Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <p className="text-[12px] font-medium leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Based on your last {analytics.totalTests} tests, your accuracy is {Math.round(analytics.averageAccuracy || 0)}%. Consider dedicating more time to unattempted questions and reviewing incorrect answers carefully before jumping to the next mock.
                      </p>
                      <div className="pt-1">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors"
                          style={{
                            background: "rgba(255,107,43,0.08)",
                            color: "#FF6B2B",
                            border: "1px solid rgba(255,107,43,0.15)",
                          }}
                        >
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
