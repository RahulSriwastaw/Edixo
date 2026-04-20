"use client";
import { api } from "@/lib/api";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import {
  Building2,
  IndianRupee,
  GraduationCap,
  ClipboardList,
  BookOpen,
  Fingerprint,
  Monitor,
  Receipt,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Copy,
  MoreHorizontal,
  ExternalLink,
  Users,
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

async function fetchDashboard() {
  try {
    const json = await api.get('/super-admin/dashboard');
    return json.data;
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    return null;
  }
}

// KPI Data
const kpiData = [
  {
    label: "Total Whiteboard Accounts",
    value: 124,
    change: "+12 this month",
    trend: "up",
    icon: Users,
    color: "blue",
    sparkline: [80, 85, 92, 105, 112, 118, 124],
  },
  {
    label: "MRR — Monthly Revenue",
    value: "₹7,24,000",
    change: "+₹52,000 this month",
    trend: "up",
    icon: IndianRupee,
    color: "green",
    sparkline: [620, 650, 680, 695, 710, 702, 724],
  },
  {
    label: "Active Students (30d)",
    value: "12,847",
    change: "+842 this month",
    trend: "up",
    icon: GraduationCap,
    color: "orange",
    sparkline: [11200, 11500, 11800, 12100, 12300, 12500, 12847],
  },
  {
    label: "Tests Attempted (30d)",
    value: "34,291",
    change: "+4,120 this month",
    trend: "up",
    icon: ClipboardList,
    color: "purple",
    sparkline: [28000, 29500, 31000, 32000, 33000, 33500, 34291],
  },
  {
    label: "Global Questions",
    value: "2,341",
    change: "+128 this month",
    trend: "up",
    icon: BookOpen,
    color: "orange",
    sparkline: [2100, 2150, 2200, 2250, 2280, 2310, 2341],
  },
  {
    label: "Unique IDs Issued",
    value: "1,247",
    change: "+89 this month",
    trend: "up",
    icon: Fingerprint,
    color: "blue",
    sparkline: [1100, 1120, 1150, 1180, 1200, 1225, 1247],
  },
  {
    label: "Whiteboard Sessions (24h)",
    value: "156",
    change: "+12 from yesterday",
    trend: "up",
    icon: Monitor,
    color: "teal",
    sparkline: [120, 130, 128, 140, 145, 150, 156],
  },
  {
    label: "Pending Invoices",
    value: 8,
    change: "₹1,20,000 total",
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
    title: "New organization onboarded",
    message: "Apex Academy signed up for Medium plan",
    time: "5 min ago",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment received",
    message: "₹15,000 from Brilliant Coaching",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "id",
    title: "New Unique ID generated",
    message: "GK-TCH-00892 for Apex Academy",
    time: "2 hours ago",
  },
  {
    id: 4,
    type: "alert",
    title: "AI Service degraded",
    message: "Response time increased to 320ms",
    time: "3 hours ago",
  },
  {
    id: 5,
    type: "suspension",
    title: "Organization suspended",
    message: "Test Academy suspended due to non-payment",
    time: "5 hours ago",
  },
  {
    id: 6,
    type: "org",
    title: "New organization onboarded",
    message: "Excel Institute signed up for Large plan",
    time: "6 hours ago",
  },
];

// Plan Distribution Data
const planDistribution = [
  { name: "Small", value: 18, color: "#2563EB" },
  { name: "Medium", value: 20, color: "#F4511E" },
  { name: "Large", value: 8, color: "#16A34A" },
  { name: "Enterprise", value: 2, color: "#7C3AED" },
];

// App Distribution Data
const appDistribution = [
  { name: "Student App Only", value: 12, color: "#2563EB" },
  { name: "MockBook Only", value: 8, color: "#7C3AED" },
  { name: "Both Apps", value: 28, color: "#F4511E" },
];

// System Status Data
const systemStatus = [
  { name: "API Gateway", status: "operational", latency: "48ms" },
  { name: "PostgreSQL DB (AWS RDS)", status: "operational", latency: "22ms" },
  { name: "AI Service", status: "degraded", latency: "320ms" },
  { name: "CDN", status: "operational", latency: null },
  { name: "Auth", status: "operational", latency: null },
  { name: "Email", status: "operational", latency: null },
];

// Recent Whiteboard Accounts Data
const recentAccounts = [
  {
    id: "WB-ACC-001",
    name: "Demo Teacher 1",
    loginId: "teacher_01",
    status: "Active",
    lastUsed: "2 hours ago",
  },
  {
    id: "WB-ACC-002",
    name: "Demo Teacher 2",
    loginId: "teacher_02",
    status: "Active",
    lastUsed: "5 hours ago",
  },
  {
    id: "WB-ACC-003",
    name: "Demo Teacher 3",
    loginId: "teacher_03",
    status: "Inactive",
    lastUsed: "1 day ago",
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
  const { isOpen } = useSidebarStore();
  const [dashStats, setDashStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then((stats) => {
        setDashStats(stats);
      })
      .finally(() => setLoading(false));
  }, []);

  // Merge live stats into kpiData
  const liveKpiData = kpiData.map((kpi) => {
    if (!dashStats) return kpi;

    switch (kpi.label) {
      case "Total Whiteboard Accounts":
        return { ...kpi, value: dashStats.stats.totalWhiteboardAccounts };
      case "MRR — Monthly Revenue":
        return { ...kpi, value: `₹${dashStats.stats.mrr.toLocaleString()}` };
      case "Active Students (30d)":
        return { ...kpi, value: dashStats.stats.totalStudents.toLocaleString() };
      case "Tests Attempted (30d)":
        return { ...kpi, value: (dashStats.stats.testAttemptCount || 0).toLocaleString() };
      case "Global Questions":
        return { ...kpi, value: (dashStats.stats.globalQuestionCount || 0).toLocaleString() };
      case "Unique IDs Issued":
        return { ...kpi, value: (dashStats.stats.totalStudents + dashStats.stats.totalStaff).toLocaleString() }; // Combined Student+Staff IDs
      case "Active Users (30d)":
        return { ...kpi, label: "Active Users (30d)", value: (dashStats.stats.activeUserCount || 0).toLocaleString() };
      case "Pending Invoices":
        return { ...kpi, value: dashStats.stats.suspendedOrgs }; // Use suspended orgs as a proxy for "pending/issue" orgs if no billing model yet
      default:
        return kpi;
    }
  });

  const displayAccounts = (dashStats?.recentAccounts?.length > 0) 
    ? dashStats.recentAccounts.map((acc: any) => ({
        ...acc,
        lastUsed: acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : 'Never'
      }))
    : recentAccounts; // Fallback to mock if API data is missing

  const displayPlanDistribution = dashStats?.planDistribution?.length > 0
    ? dashStats.planDistribution.map((p: any) => ({
      ...p,
      color: p.name === 'SMALL' ? '#2563EB' : p.name === 'MEDIUM' ? '#F4511E' : p.name === 'LARGE' ? '#16A34A' : '#7C3AED'
    }))
    : planDistribution;

  const displayActivityData = dashStats?.recentActivity?.length > 0
    ? dashStats.recentActivity.map((log: any) => ({
        id: log.id,
        type: log.action.toLowerCase().includes('create') ? 'org' : 
              log.action.toLowerCase().includes('payment') ? 'payment' : 'alert',
        title: log.action,
        message: `${log.actorName} ${log.action.toLowerCase()} ${log.resource || ''}`,
        time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    : activityData;

  const displayRevenueData = dashStats?.revenueHistory?.length > 0
    ? dashStats.revenueHistory
    : revenueData;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, Platform Owner 👋</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Platform Health:{" "}
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
                      <AreaChart data={displayRevenueData}>
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
                    {displayActivityData.map((activity: any) => (
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
              {/* Plan Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Org Plan Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayPlanDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {displayPlanDistribution.map((entry, index) => (
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
                    {displayPlanDistribution.map((item) => (
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
                  <CardTitle className="text-lg font-semibold">App Distribution</CardTitle>
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

            {/* Recent Whiteboard Accounts Table */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Whiteboard Accounts</CardTitle>
                <Button variant="ghost" size="sm" className="text-brand-primary">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap min-w-[200px]">Account Name</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase min-w-[120px]">Login ID</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase min-w-[120px]">Last Used</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayAccounts.map((account: any) => (
                        <TableRow key={account.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                  {account.name ? account.name.split(" ").map((n: string) => n[0]).join("") : "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium text-gray-900 whitespace-nowrap">{account.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="mono">{account.loginId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={account.status} />
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                            {account.lastUsed}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
