"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  IndianRupee,
  GraduationCap,
  ClipboardList,
  BookOpen,
  Fingerprint,
  Receipt,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Copy,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

async function fetchDashboard() {
  const token = getToken();
  const res = await fetch(`${API_URL}/org-admin/dashboard`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

// Org admins don't manage multiple orgs, but we keep the mock structure to not break the UI grid entirely for now.
async function fetchRecentOrgs() {
  return [];
}

// KPI Data
const kpiData = [
  {
    label: "Total Staff",
    value: 12,
    change: "+2 this month",
    trend: "up",
    icon: Building2,
    color: "blue",
    sparkline: [8, 9, 10, 10, 10, 11, 12],
  },
  {
    label: "Fees Collected",
    value: "₹7,24,000",
    change: "+₹52,000 this month",
    trend: "up",
    icon: IndianRupee,
    color: "green",
    sparkline: [620, 650, 680, 695, 710, 702, 724],
  },
  {
    label: "Active Students (30d)",
    value: "847",
    change: "+42 this month",
    trend: "up",
    icon: GraduationCap,
    color: "orange",
    sparkline: [700, 750, 780, 810, 830, 840, 847],
  },
  {
    label: "Tests Attempted (30d)",
    value: "4,291",
    change: "+120 this month",
    trend: "up",
    icon: ClipboardList,
    color: "purple",
    sparkline: [2800, 2950, 3100, 3200, 3300, 3350, 4291],
  },
  {
    label: "Custom Questions",
    value: "341",
    change: "+28 this month",
    trend: "up",
    icon: BookOpen,
    color: "orange",
    sparkline: [210, 215, 220, 225, 280, 310, 341],
  },
  {
    label: "Active Batches",
    value: "24",
    change: "+3 this month",
    trend: "up",
    icon: Fingerprint,
    color: "blue",
    sparkline: [10, 12, 15, 18, 20, 22, 24],
  },
  {
    label: "Mock Tests Completed",
    value: "1,245",
    change: "+156 this week",
    trend: "up",
    icon: ClipboardList,
    color: "teal",
    sparkline: [800, 950, 1000, 1100, 1150, 1200, 1245],
  },
  {
    label: "Pending Fees",
    value: 8,
    change: "12 students pending",
    trend: "warning",
    icon: Receipt,
    color: "yellow",
    sparkline: [5, 6, 8, 7, 9, 8, 8],
  },
];

// Revenue Chart Data
const revenueData = [
  { month: "Mar", mrr: 580000, small: 180000, medium: 250000, large: 150000 },
  { month: "Apr", mrr: 595000, small: 190000, medium: 255000, large: 150000 },
  { month: "May", mrr: 610000, small: 195000, medium: 260000, large: 155000 },
  { month: "Jun", mrr: 635000, small: 200000, medium: 270000, large: 165000 },
  { month: "Jul", mrr: 660000, small: 210000, medium: 275000, large: 175000 },
  { month: "Aug", mrr: 685000, small: 215000, medium: 285000, large: 185000 },
  { month: "Sep", mrr: 695000, small: 220000, medium: 290000, large: 185000 },
  { month: "Oct", mrr: 705000, small: 225000, medium: 295000, large: 185000 },
  { month: "Nov", mrr: 715000, small: 230000, medium: 300000, large: 185000 },
  { month: "Dec", mrr: 700000, small: 225000, medium: 290000, large: 185000 },
  { month: "Jan", mrr: 712000, small: 228000, medium: 299000, large: 185000 },
  { month: "Feb", mrr: 724000, small: 232000, medium: 307000, large: 185000 },
];

// Activity Feed Data
const activityData = [
  {
    id: 1,
    type: "org",
    title: "New student admitted",
    message: "Rahul Sharma joined IIT JEE Batch 1",
    time: "5 min ago",
  },
  {
    id: 2,
    type: "payment",
    title: "Fee received",
    message: "₹15,000 received from Priya Singh",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "id",
    title: "Mock test assigned",
    message: "Physics Weekly Test assigned to Foundation Batch",
    time: "2 hours ago",
  },
  {
    id: 4,
    type: "alert",
    title: "Low Attendance Alert",
    message: "3 students marked absent for 3 consecutive days",
    time: "3 hours ago",
  },
  {
    id: 5,
    type: "suspension",
    title: "Test completed",
    message: "Chemistry Mock Test completed by 85% of batch",
    time: "5 hours ago",
  },
  {
    id: 6,
    type: "org",
    title: "New content uploaded",
    message: "Chapter 4 Notes added to File Repository",
    time: "6 hours ago",
  },
];

// Plan Distribution Data -> Batch Distribution
const planDistribution = [
  { name: "Morning", value: 18, color: "#2563EB" },
  { name: "Afternoon", value: 20, color: "#F4511E" },
  { name: "Evening", value: 8, color: "#16A34A" },
  { name: "Weekend", value: 2, color: "#7C3AED" },
];

// App Distribution Data -> Course Enrollments
const appDistribution = [
  { name: "JEE Mains", value: 45, color: "#2563EB" },
  { name: "JEE Advanced", value: 20, color: "#7C3AED" },
  { name: "NEET", value: 35, color: "#F4511E" },
];

// System Status Data -> Platform Services
const systemStatus = [
  { name: "Student App", status: "operational", latency: "12ms" },
  { name: "Mock Tests Sync", status: "operational", latency: "Offline Cache" },
  { name: "Live Classes", status: "operational", latency: null },
  { name: "Notifications", status: "operational", latency: null },
];

// Recent Admissions Data
const recentOrgs = [
  {
    id: "STU-00142",
    name: "Aarav Sharma",
    logo: null,
    domain: "Class 11",
    appType: "JEE Mains",
    plan: "Morning Batch",
    status: "Active",
    mrr: "₹15,000",
  },
  {
    id: "STU-00089",
    name: "Diya Patel",
    logo: null,
    domain: "Class 12",
    appType: "NEET",
    plan: "Evening Batch",
    status: "Active",
    mrr: "₹25,000",
  },
  {
    id: "STU-00215",
    name: "Rohan Gupta",
    logo: null,
    domain: "Class 10",
    appType: "Foundation",
    plan: "Weekend Batch",
    status: "Active",
    mrr: "₹12,000",
  },
  {
    id: "STU-00198",
    name: "Sneha Reddy",
    logo: null,
    domain: "Class 11",
    appType: "JEE Advanced",
    plan: "Morning Batch",
    status: "Active",
    mrr: "₹30,000",
  },
  {
    id: "STU-00056",
    name: "Vikram Singh",
    logo: null,
    domain: "Class 12",
    appType: "NEET",
    plan: "Afternoon Batch",
    status: "Suspended",
    mrr: "₹0",
  },
];

// Helper function to get KPI icon background color
const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
    teal: "bg-teal-50",
    yellow: "bg-yellow-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    teal: "text-teal-600",
    yellow: "text-yellow-600",
  };
  return colors[color] || "text-gray-600";
};

// Mini Sparkline Component
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-6">
      {data.map((value, index) => (
        <div
          key={index}
          className="w-1.5 rounded-full"
          style={{
            height: `${((value - min) / range) * 100}%`,
            minHeight: "20%",
            backgroundColor: color === "orange" ? "#F4511E" : color === "green" ? "#16A34A" : "#2563EB",
          }}
        />
      ))}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "badge-active",
    Trial: "badge-trial",
    Suspended: "badge-suspended",
    Pending: "badge-pending",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// App Type Badge Component
function AppTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    STUDENT: "badge-student",
    MOCKBOOK: "badge-mockbook",
    BOTH: "badge-both",
  };
  return <span className={`badge ${styles[type] || ""}`}>{type}</span>;
}

// Plan Badge Component
function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Small: "badge-small",
    Medium: "badge-medium",
    Large: "badge-large",
    Enterprise: "badge-enterprise",
  };
  return <span className={`badge ${styles[plan] || ""}`}>{plan}</span>;
}

export default function DashboardPage() {
  const [dashStats, setDashStats] = useState<any>(null);
  const [liveAdmissions, setLiveAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard().then(data => {
      if (data) {
        setDashStats(data);
        if (data.recentAdmissions) {
          setLiveAdmissions(data.recentAdmissions.map((s: any) => ({
            id: s.studentId,
            name: s.name,
            domain: new Date(s.createdAt).toLocaleDateString(),
            appType: "Student",
            plan: "Active",
            status: "Active",
            mrr: "₹0" // Placeholder or fetch if needed
          })));
        }
      }
      setLoading(false);
    });
  }, []);

  // Merge live stats into kpiData
  const liveKpiData = kpiData.map((kpi) => {
    if (!dashStats) return kpi;

    switch (kpi.label) {
      case "Total Staff":
        return { ...kpi, value: dashStats.stats?.staffCount ?? 0 };
      case "Active Students (30d)":
        return { ...kpi, value: dashStats.stats?.studentCount?.toLocaleString() ?? 0 };
      case "Fees Collected":
        return { ...kpi, value: `₹${(dashStats.stats?.monthlyRevenue ?? 0).toLocaleString()}` };
      case "Pending Fees":
        return { ...kpi, value: `₹${(dashStats.stats?.pendingFees ?? 0).toLocaleString()}` };
      case "Tests Attempted (30d)":
      case "Mock Tests Completed":
        return { ...kpi, value: (dashStats.stats?.testAttemptCount || 0).toLocaleString() };
      case "Custom Questions":
        return { ...kpi, value: (dashStats.stats?.customQuestionCount || 0).toLocaleString() };
      case "Active Batches":
        return { ...kpi, value: dashStats.stats?.batchCount || kpi.value }; // If we add batchCount to API later
      default:
        return kpi;
    }
  });

  const displayOrgs = liveAdmissions.length > 0 ? liveAdmissions : recentOrgs;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, Institute Admin 👋</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Today: Sunday, March 01, 2026 — Platform Health:{" "}
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-green-600 font-medium">All Systems Normal</span>
                  </span>
                </p>
              </div>
              <Button className="btn-secondary">
                View Reports
              </Button>
            </div>

            {/* KPI Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveKpiData.slice(0, 4).map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(kpi.color)} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${getIconColor(kpi.color)}`} />
                        </div>
                        <MiniSparkline data={kpi.sparkline} color={kpi.color} />
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {kpi.label}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                          {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {kpi.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                          {kpi.trend === "warning" && <TrendingDown className="w-3 h-3 text-yellow-500" />}
                          <span className={`text-xs ${kpi.trend === "up" ? "text-green-600" : "text-yellow-600"}`}>
                            {kpi.change}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* KPI Cards Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveKpiData.slice(4, 8).map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(kpi.color)} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${getIconColor(kpi.color)}`} />
                        </div>
                        <MiniSparkline data={kpi.sparkline} color={kpi.color} />
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {kpi.label}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">
                          {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {kpi.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                          {kpi.trend === "warning" && <TrendingDown className="w-3 h-3 text-yellow-500" />}
                          <span className={`text-xs ${kpi.trend === "up" ? "text-green-600" : "text-yellow-600"}`}>
                            {kpi.change}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F4511E" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#F4511E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis
                          stroke="#9CA3AF"
                          fontSize={12}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, "MRR"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="mrr"
                          stroke="#F4511E"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorMrr)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="text-brand-primary">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {activityData.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.type === "org"
                            ? "bg-green-500"
                            : activity.type === "payment"
                              ? "bg-orange-500"
                              : activity.type === "id"
                                ? "bg-blue-500"
                                : activity.type === "alert"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <div className="text-xs text-gray-500 truncate">{activity.message}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Panels Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Batch Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">User Batch Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {planDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {planDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* App Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Course Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {appDistribution.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {appDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">System Health</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                    Auto-refresh: 30s
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemStatus.map((service) => (
                      <div key={service.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${service.status === "operational"
                              ? "bg-green-500"
                              : service.status === "degraded"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                              }`}
                          />
                          <span className="text-sm text-gray-700">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs ${service.status === "operational"
                              ? "text-green-600"
                              : service.status === "degraded"
                                ? "text-yellow-600"
                                : "text-red-600"
                              }`}
                          >
                            {service.status === "operational"
                              ? "Operational"
                              : service.status === "degraded"
                                ? "Degraded"
                                : "Down"}
                          </span>
                          {service.latency && (
                            <span className="text-xs text-gray-400">· {service.latency}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Admissions Table */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Admissions</CardTitle>
                <Button variant="ghost" size="sm" className="text-brand-primary">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student Name</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student ID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Course Target</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Batch</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Fee Group</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayOrgs.map((org: any) => (
                      <TableRow key={org.id} className="hover:bg-brand-primary-tint">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                {org.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{org.name}</div>
                              <div className="text-xs text-gray-500">{org.domain}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="mono">{org.id}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-brand-primary">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {org.appType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {org.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={org.status} />
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {org.mrr}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-brand-primary">
                                <ExternalLink className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Manage IDs</DropdownMenuItem>
                              <DropdownMenuItem>Change Plan</DropdownMenuItem>
                              <DropdownMenuItem>Suspend</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
