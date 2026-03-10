"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import Link from "next/link";
import {
  BookOpen,
  Globe,
  Layers,
  Coins,
  TrendingUp,
  Plus,
  Sparkles,
  Upload,
  ArrowUpRight,
  Copy,
  ExternalLink,
  History,
  Settings,
  FolderOpen,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useState, useEffect } from "react";

// API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';


function getIconBgColor(color: string) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
    red: "bg-red-50",
    amber: "bg-amber-50",
  };
  return colors[color] || "bg-gray-50";
}

function getIconColor(color: string) {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    red: "text-red-600",
    amber: "text-amber-600",
  };
  return colors[color] || "text-gray-600";
}

function getToken(): string {

  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

export default function QuestionBankPage() {
  const { isOpen } = useSidebarStore();
  const [stats, setStats] = useState<any[]>([
    { label: "Total Questions", value: 0, change: "+0 this month", icon: BookOpen, color: "orange" },
    { label: "Public Questions", value: 0, change: "+0 this month", icon: Globe, color: "blue" },
    { label: "Sets Created", value: 0, change: "+0 this month", icon: Layers, color: "purple" },
    { label: "Points Earned", value: 0, change: "+0 this month", icon: Coins, color: "green" },
  ]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [recentData, setRecentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/qbank/dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const { data } = await res.json();
          setStats([
            { label: "Total Questions", value: data.totalQuestions || 0, change: `+${data.newQuestions || 0} this month`, icon: BookOpen, color: "orange" },
            { label: "Public Questions", value: data.publicQuestions || 0, change: `+${data.newPublic || 0} this month`, icon: Globe, color: "blue" },
            { label: "Sets Created", value: data.totalSets || 0, change: `+${data.newSets || 0} this month`, icon: Layers, color: "purple" },
            { label: "Points Earned", value: data.totalPoints || 0, change: `+${data.newPoints || 0} this month`, icon: Coins, color: "green" },
          ]);
          setSubjectData(data.bySubject || []);
          setTrendData(data.usageTrend || []);
          setRecentData(data.recentUsage || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
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
                <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Global platform questions — manage, generate, and publish
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/question-generation">
                  <Button variant="outline" className="btn-secondary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                </Link>
                <Link href="/question-bank/questions?action=import">
                  <Button variant="outline" className="btn-secondary">
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                </Link>
                <Link href="/question-bank/create">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Question
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {stat.label}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {isLoading ? "..." : stat.value.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600">{stat.change}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Questions by Subject */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Questions by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {subjectData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                          <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                          <YAxis type="category" dataKey="subject" stroke="#9CA3AF" fontSize={12} width={80} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="questions" fill="#F4511E" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        {isLoading ? "Loading subject data..." : "No subject data available"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Usage Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    {trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
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
                            dataKey="usage"
                            stroke="#F4511E"
                            strokeWidth={2}
                            dot={{ fill: "#F4511E", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        {isLoading ? "Loading trend data..." : "No trend data available"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Usage Table */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Usage</CardTitle>
                <Link href="/question-bank/usage-log">
                  <Button variant="ghost" size="sm" className="text-brand-primary">
                    View All <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Question Preview</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Used By</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Teacher</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentData.length > 0 ? (
                      recentData.map((usage: any) => (
                        <TableRow key={usage.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <span className="text-sm text-gray-700 italic truncate max-w-[300px] block">
                              {usage.question}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-900">{usage.org}</span>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-brand-primary">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{usage.teacher}</TableCell>
                          <TableCell className="text-sm text-gray-500">{usage.date}</TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                              <Coins className="w-3 h-3" />
                              {usage.points}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 italic">
                          {isLoading ? "Loading recent usage..." : "No recent activity recorded"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/question-bank/questions">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Manage Questions</div>
                      <div className="text-sm text-gray-500">View, edit, and organize all questions</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/sets">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Question Sets</div>
                      <div className="text-sm text-gray-500">Create and manage question sets</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/marketplace">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Marketplace</div>
                      <div className="text-sm text-gray-500">Browse public questions catalog</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/usage-log">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                      <History className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Usage Log</div>
                      <div className="text-sm text-gray-500">Track question usage & points</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/questions">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Manage Folders</div>
                      <div className="text-sm text-gray-500">Create & organize global folders</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/question-bank/reports">
                <Card className="kpi-card cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Error Reports</div>
                      <div className="text-sm text-gray-500">Resolve reported question issues</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
