"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  BarChart3,
  Target,
  Calendar,
  Download,
  Filter,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

// Performance trend data
const performanceTrend = [
  { month: "Jan", avgScore: 68.5, testsTaken: 2847, passRate: 78 },
  { month: "Feb", avgScore: 70.2, testsTaken: 3124, passRate: 80 },
  { month: "Mar", avgScore: 72.8, testsTaken: 3456, passRate: 82 },
  { month: "Apr", avgScore: 71.5, testsTaken: 2987, passRate: 79 },
  { month: "May", avgScore: 74.1, testsTaken: 3567, passRate: 84 },
  { month: "Jun", avgScore: 73.5, testsTaken: 3245, passRate: 83 },
  { month: "Jul", avgScore: 75.2, testsTaken: 3678, passRate: 85 },
  { month: "Aug", avgScore: 76.8, testsTaken: 3890, passRate: 87 },
  { month: "Sep", avgScore: 77.5, testsTaken: 4012, passRate: 88 },
  { month: "Oct", avgScore: 78.2, testsTaken: 4156, passRate: 89 },
  { month: "Nov", avgScore: 79.1, testsTaken: 4321, passRate: 90 },
  { month: "Dec", avgScore: 80.5, testsTaken: 4567, passRate: 91 },
];

// Subject performance data
const subjectPerformance = [
  { subject: "Physics", avgScore: 75.2, tests: 1234, improvement: 5.2 },
  { subject: "Chemistry", avgScore: 72.8, tests: 1156, improvement: 4.8 },
  { subject: "Mathematics", avgScore: 78.5, tests: 1567, improvement: 6.1 },
  { subject: "Biology", avgScore: 81.2, tests: 987, improvement: 7.3 },
  { subject: "English", avgScore: 85.4, tests: 456, improvement: 3.2 },
];

// Organization performance data
const orgPerformance = [
  { org: "Apex Academy", avgScore: 82.5, students: 1850, trend: "up" },
  { org: "Excel Institute", avgScore: 78.3, students: 1240, trend: "up" },
  { org: "Prime Tutorials", avgScore: 76.8, students: 980, trend: "down" },
  { org: "Success Classes", avgScore: 74.2, students: 756, trend: "up" },
  { org: "Knowledge Hub", avgScore: 79.1, students: 1120, trend: "up" },
];

// Top performers data
const topPerformers = [
  { rank: 1, name: "Rahul Sharma", org: "Apex Academy", score: 98.5, tests: 45 },
  { rank: 2, name: "Ananya Reddy", org: "Excel Institute", score: 97.8, tests: 52 },
  { rank: 3, name: "Vikram Patel", org: "Knowledge Hub", score: 96.2, tests: 38 },
  { rank: 4, name: "Priya Gupta", org: "Apex Academy", score: 95.7, tests: 41 },
  { rank: 5, name: "Arjun Singh", org: "Prime Tutorials", score: 94.9, tests: 47 },
];

// Difficulty distribution
const difficultyDistribution = [
  { name: "Easy", value: 45, color: "#16A34A" },
  { name: "Medium", value: 35, color: "#F59E0B" },
  { name: "Hard", value: 20, color: "#DC2626" },
];

// Stats data
const stats = [
  { label: "Avg Score", value: "80.5%", icon: Target, color: "green", change: "+2.3%" },
  { label: "Pass Rate", value: "91%", icon: Trophy, color: "orange", change: "+5%" },
  { label: "Tests Taken", value: "34,291", icon: BarChart3, color: "blue", change: "+12%" },
  { label: "Active Students", value: "8,234", icon: Users, color: "purple", change: "+8%" },
];

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-gray-600";
};

export default function StudentPerformancePage() {
    const { isOpen } = useSidebarStore();
const [timeRange, setTimeRange] = useState("12m");
  const [selectedOrg, setSelectedOrg] = useState("all");

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "lg:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/student-app" className="hover:text-brand-primary flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Student App</span>
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Performance</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cross-Org Analytics</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Student performance insights across all organizations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px] input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Last 1 Month</SelectItem>
                    <SelectItem value="3m">Last 3 Months</SelectItem>
                    <SelectItem value="6m">Last 6 Months</SelectItem>
                    <SelectItem value="12m">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                          <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                        <Badge className="bg-green-50 text-green-700 text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Performance Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Trend</CardTitle>
                <CardDescription>Average score and pass rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrend}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F4511E" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#F4511E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} domain={[60, 100]} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Avg Score"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgScore"
                        stroke="#F4511E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subject-wise Performance</CardTitle>
                  <CardDescription>Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjectPerformance.map((subject) => (
                      <div key={subject.subject} className="flex items-center gap-4">
                        <div className="w-28 text-sm font-medium text-gray-700">{subject.subject}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{subject.avgScore}%</span>
                            <span className="text-xs text-green-600">+{subject.improvement}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F4511E] rounded-full"
                              style={{ width: `${subject.avgScore}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 w-16 text-right">
                          {subject.tests} tests
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                  <CardDescription>Highest scoring students this period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformers.map((performer) => (
                      <div
                        key={performer.rank}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          performer.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                          performer.rank === 2 ? "bg-gray-200 text-gray-600" :
                          performer.rank === 3 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {performer.rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{performer.name}</div>
                          <div className="text-xs text-gray-500">{performer.org}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#F4511E]">{performer.score}%</div>
                          <div className="text-xs text-gray-500">{performer.tests} tests</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Performance</CardTitle>
                <CardDescription>Performance comparison across organizations</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Organization</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Students</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Trend</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgPerformance.map((org) => (
                      <tr key={org.org} className="border-b last:border-0">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{org.org}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{org.students.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="font-bold text-[#F4511E]">{org.avgScore}%</span>
                        </td>
                        <td className="p-4">
                          {org.trend === "up" ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-sm">Improving</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <TrendingDown className="w-4 h-4" />
                              <span className="text-sm">Declining</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F4511E] rounded-full"
                              style={{ width: `${org.avgScore}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Difficulty Distribution</CardTitle>
                  <CardDescription>Questions by difficulty level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={difficultyDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {difficultyDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {difficultyDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tests Taken Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Tests Volume</CardTitle>
                  <CardDescription>Monthly test attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <RechartsTooltip
                          formatter={(value: number) => [value.toLocaleString(), "Tests"]}
                        />
                        <Bar dataKey="testsTaken" fill="#F4511E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
