"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  BookOpen,
  Monitor,
  Coins,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

// Revenue Growth Data
const revenueGrowth = [
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

// Org Onboarding Data
const orgOnboarding = [
  { week: "W1", newOrgs: 4 },
  { week: "W2", newOrgs: 6 },
  { week: "W3", newOrgs: 3 },
  { week: "W4", newOrgs: 8 },
  { week: "W5", newOrgs: 5 },
  { week: "W6", newOrgs: 7 },
  { week: "W7", newOrgs: 4 },
  { week: "W8", newOrgs: 9 },
];

// User Growth Data
const userGrowth = [
  { month: "Mar", students: 8500, teachers: 420 },
  { month: "Apr", students: 9200, teachers: 445 },
  { month: "May", students: 9800, teachers: 478 },
  { month: "Jun", students: 10500, teachers: 512 },
  { month: "Jul", students: 11200, teachers: 548 },
  { month: "Aug", students: 11800, teachers: 589 },
  { month: "Sep", students: 12200, teachers: 615 },
  { month: "Oct", students: 12600, teachers: 642 },
  { month: "Nov", students: 12900, teachers: 668 },
  { month: "Dec", students: 13100, teachers: 685 },
  { month: "Jan", students: 13400, teachers: 702 },
  { month: "Feb", students: 13800, teachers: 724 },
];

// Test Volume Data
const testVolume = [
  { day: "Mon", tests: 1240 },
  { day: "Tue", tests: 1580 },
  { day: "Wed", tests: 1420 },
  { day: "Thu", tests: 1890 },
  { day: "Fri", tests: 2100 },
  { day: "Sat", tests: 2850 },
  { day: "Sun", tests: 2340 },
];

// App Distribution Data
const appDistribution = [
  { name: "Student App Only", value: 12, color: "#2563EB" },
  { name: "MockBook Only", value: 8, color: "#7C3AED" },
  { name: "Both Apps", value: 28, color: "#F4511E" },
];

// Question Usage Data
const questionUsage = [
  { day: "Mar 1", points: 420 },
  { day: "Mar 2", points: 580 },
  { day: "Mar 3", points: 340 },
  { day: "Mar 4", points: 870 },
  { day: "Mar 5", points: 920 },
  { day: "Mar 6", points: 670 },
  { day: "Mar 7", points: 740 },
];

// AI Usage Trend Data
const aiUsageTrend = [
  { day: "Mon", credits: 145 },
  { day: "Tue", credits: 232 },
  { day: "Wed", credits: 189 },
  { day: "Thu", credits: 278 },
  { day: "Fri", credits: 312 },
  { day: "Sat", credits: 245 },
  { day: "Sun", credits: 198 },
];

// Retention Cohort Data
const retentionCohort = [
  { month: "Jan", m0: 100, m1: 85, m2: 78, m3: 72, m4: 68 },
  { month: "Feb", m0: 100, m1: 88, m2: 82, m3: 75, m4: null },
  { month: "Mar", m0: 100, m1: 90, m2: 84, m3: null, m4: null },
  { month: "Apr", m0: 100, m1: 87, m2: null, m3: null, m4: null },
  { month: "May", m0: 100, m1: null, m2: null, m3: null, m4: null },
];

// Geography Data
const geographyData = [
  { state: "Maharashtra", orgs: 12, color: "#F4511E" },
  { state: "Delhi", orgs: 9, color: "#E64A19" },
  { state: "Karnataka", orgs: 7, color: "#F97316" },
  { state: "Tamil Nadu", orgs: 6, color: "#FB923C" },
  { state: "Gujarat", orgs: 5, color: "#FDBA74" },
  { state: "Rajasthan", orgs: 4, color: "#FED7AA" },
  { state: "Others", orgs: 5, color: "#F3F4F6" },
];

// Whiteboard Sessions Heatmap Data
const sessionsHeatmap = [
  { hour: "6AM", mon: 2, tue: 1, wed: 2, thu: 1, fri: 2, sat: 5, sun: 4 },
  { hour: "9AM", mon: 8, tue: 9, wed: 10, thu: 8, fri: 7, sat: 12, sun: 10 },
  { hour: "12PM", mon: 12, tue: 14, wed: 11, thu: 15, fri: 10, sat: 8, sun: 6 },
  { hour: "3PM", mon: 18, tue: 20, wed: 17, thu: 22, fri: 15, sat: 10, sun: 7 },
  { hour: "6PM", mon: 25, tue: 28, wed: 24, thu: 30, fri: 22, sat: 15, sun: 12 },
  { hour: "9PM", mon: 20, tue: 22, wed: 18, thu: 25, fri: 18, sat: 12, sun: 8 },
];

export default function AnalyticsPage() {
    const { isOpen } = useSidebarStore();
const [dateRange, setDateRange] = useState("last-30-days");
  const [compareMode, setCompareMode] = useState("previous-period");

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Comprehensive insights across all organizations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[180px] input-field">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 days</SelectItem>
                    <SelectItem value="this-year">This year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={compareMode} onValueChange={setCompareMode}>
                  <SelectTrigger className="w-[180px] input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous-period">Compare to: Previous Period</SelectItem>
                    <SelectItem value="year-ago">Compare to: Year Ago</SelectItem>
                    <SelectItem value="none">No Comparison</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="btn-secondary">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                    <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                    <DropdownMenuItem>Export Charts as PNG</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Total Revenue</div>
                      <div className="text-xl font-bold text-gray-900">₹86.88L</div>
                      <div className="text-xs text-green-600">+8.2% vs last year</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Total Users</div>
                      <div className="text-xl font-bold text-gray-900">14,524</div>
                      <div className="text-xs text-green-600">+12.4% growth</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Active Orgs</div>
                      <div className="text-xl font-bold text-gray-900">48</div>
                      <div className="text-xs text-green-600">+6 this month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Tests Taken</div>
                      <div className="text-xl font-bold text-gray-900">34,291</div>
                      <div className="text-xs text-green-600">+4,120 this month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Growth */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueGrowth}>
                        <defs>
                          <linearGradient id="colorMrr2" x1="0" y1="0" x2="0" y2="1">
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
                          }}
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, "MRR"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="mrr"
                          stroke="#F4511E"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorMrr2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Org Onboarding */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Org Onboarding</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orgOnboarding}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="newOrgs" fill="#F4511E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="students"
                          stackId="1"
                          stroke="#2563EB"
                          fill="#2563EB"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="teachers"
                          stackId="1"
                          stroke="#F4511E"
                          fill="#F4511E"
                          fillOpacity={0.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-xs text-gray-600">Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-xs text-gray-600">Teachers</span>
                    </div>
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
                          innerRadius={40}
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
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {appDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Test Volume */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Test Volume (This Week)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={testVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="tests" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Question Usage */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Points Transacted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={questionUsage}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="points"
                          stroke="#F4511E"
                          strokeWidth={2}
                          dot={{ fill: "#F4511E", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* AI Usage Trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">AI Credits Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={aiUsageTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="credits"
                          stroke="#16A34A"
                          strokeWidth={2}
                          dot={{ fill: "#16A34A", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Geography & Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Geography Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Organizations by State</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {geographyData.map((item) => (
                      <div key={item.state} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600">{item.state}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.orgs / 12) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <div className="w-8 text-sm font-semibold text-gray-900 text-right">
                          {item.orgs}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Whiteboard Sessions Heatmap */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Whiteboard Sessions (Hour × Day)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="p-2 text-left text-gray-500 font-medium">Hour</th>
                          <th className="p-2 text-center text-gray-500 font-medium">Mon</th>
                          <th className="p-2 text-center text-gray-500 font-medium">Tue</th>
                          <th className="p-2 text-center text-gray-500 font-medium">Wed</th>
                          <th className="p-2 text-center text-gray-500 font-medium">Thu</th>
                          <th className="p-2 text-center text-gray-500 font-medium">Fri</th>
                          <th className="p-2 text-center text-gray-500 font-medium">Sat</th>
                          <th className="p-2 text-center text-gray-500 font-medium">Sun</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionsHeatmap.map((row) => (
                          <tr key={row.hour}>
                            <td className="p-2 text-gray-600 font-medium">{row.hour}</td>
                            {[row.mon, row.tue, row.wed, row.thu, row.fri, row.sat, row.sun].map((val, idx) => {
                              const intensity = Math.min((val / 30) * 100, 100);
                              return (
                                <td key={idx} className="p-1">
                                  <div
                                    className="w-full h-6 rounded flex items-center justify-center text-xs font-medium"
                                    style={{
                                      backgroundColor: `rgba(244, 81, 30, ${intensity / 100 * 0.8})`,
                                      color: intensity > 50 ? 'white' : '#374151',
                                    }}
                                  >
                                    {val}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Retention Cohort */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Org Retention Cohort</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-3 text-left text-gray-500 font-medium">Cohort</th>
                        <th className="p-3 text-center text-gray-500 font-medium">Month 0</th>
                        <th className="p-3 text-center text-gray-500 font-medium">Month 1</th>
                        <th className="p-3 text-center text-gray-500 font-medium">Month 2</th>
                        <th className="p-3 text-center text-gray-500 font-medium">Month 3</th>
                        <th className="p-3 text-center text-gray-500 font-medium">Month 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retentionCohort.map((row) => (
                        <tr key={row.month} className="border-b border-gray-100">
                          <td className="p-3 font-medium text-gray-900">{row.month}</td>
                          {[row.m0, row.m1, row.m2, row.m3, row.m4].map((val, idx) => {
                            if (val === null) {
                              return (
                                <td key={idx} className="p-3 text-center">
                                  <span className="text-gray-300">—</span>
                                </td>
                              );
                            }
                            const intensity = val;
                            return (
                              <td key={idx} className="p-2">
                                <div
                                  className="w-full h-8 rounded flex items-center justify-center text-sm font-medium"
                                  style={{
                                    backgroundColor: idx === 0 
                                      ? '#F4511E' 
                                      : `rgba(244, 81, 30, ${intensity / 100 * 0.8})`,
                                    color: idx === 0 || intensity > 50 ? 'white' : '#374151',
                                  }}
                                >
                                  {val}%
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Exportable Reports Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Exportable Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Monthly Revenue", icon: TrendingUp, format: "PDF" },
                    { name: "All Users", icon: Users, format: "CSV" },
                    { name: "Organizations Summary", icon: Building2, format: "CSV" },
                    { name: "Question Usage + Points", icon: Coins, format: "CSV" },
                    { name: "MockBook Results", icon: BookOpen, format: "CSV" },
                    { name: "Invoice History", icon: Building2, format: "CSV" },
                    { name: "Audit Log", icon: Monitor, format: "CSV" },
                    { name: "AI Usage Report", icon: Sparkles, format: "PDF" },
                  ].map((report) => {
                    const Icon = report.icon;
                    return (
                      <button
                        key={report.name}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-primary hover:bg-brand-primary-tint transition-all text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.name}</div>
                          <div className="text-xs text-gray-500">{report.format}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
