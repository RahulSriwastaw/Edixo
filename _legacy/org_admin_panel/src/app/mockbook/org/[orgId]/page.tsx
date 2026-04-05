"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  BookOpen,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Gift,
  Clock,
  Target,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";

// Quick actions
const quickActions = [
  { title: "MockTests", desc: "Create and manage tests", icon: BookOpen, href: "mocktests", color: "purple" },
  { title: "Packs", desc: "Manage subscription plans", icon: Gift, href: "packs", color: "orange" },
  { title: "Students", desc: "View and manage students", icon: Users, href: "students", color: "blue" },
  { title: "Study Plans", desc: "Day-wise content plans", icon: Calendar, href: "study-plans", color: "green" },
  { title: "Daily Practice", desc: "Configure daily questions", icon: Target, href: "daily-practice", color: "teal" },
  { title: "Results", desc: "Analytics and reports", icon: BarChart3, href: "results", color: "indigo" },
];

// Stats
const orgStats = [
  { label: "Total MockTests", value: 24, icon: BookOpen, color: "purple" },
  { label: "Active Students", value: 692, icon: Users, color: "blue" },
  { label: "Tests This Month", value: 1247, icon: CheckCircle2, color: "green" },
  { label: "AI Credits Used", value: "342/500", icon: Sparkles, color: "orange" },
];

// Recent activity
const recentActivity = [
  { action: "New student enrolled: Rahul Sharma", time: "10 min ago", type: "student" },
  { action: "MockTest 'JEE Full Mock #12' published", time: "1 hour ago", type: "test" },
  { action: "Pack 'JEE Gold' renewed by 3 students", time: "2 hours ago", type: "pack" },
  { action: "Daily Practice completed by 45 students", time: "3 hours ago", type: "practice" },
  { action: "New MockTest scheduled for Mar 10", time: "5 hours ago", type: "test" },
];

// Top performers
const topPerformers = [
  { name: "Neha Gupta", score: 95, tests: 67, streak: 28 },
  { name: "Priya Verma", score: 89, tests: 32, streak: 5 },
  { name: "Rahul Sharma", score: 85, tests: 48, streak: 12 },
  { name: "Amit Kumar", score: 82, tests: 15, streak: 0 },
  { name: "Sunita Patel", score: 78, tests: 8, streak: 3 },
];

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
    teal: "bg-teal-50",
    indigo: "bg-indigo-50",
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
    indigo: "text-indigo-600",
  };
  return colors[color] || "text-gray-600";
};

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    student: "👤",
    test: "📝",
    pack: "📦",
    practice: "🎯",
  };
  return icons[type] || "📌";
};

export default function OrgMockBookPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Mock: Load org from ID
    const mockOrg: MockBookOrg = {
      id: orgId,
      name: "Apex Academy",
      plan: "Medium",
      status: "Active",
      students: 847,
      mockTests: 24,
    };
    setSelectedOrg(mockOrg);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [orgId]);

  const handleOrgSelect = (org: MockBookOrg) => {
    setSelectedOrg(org);
    setShowOrgSwitcher(false);
    router.push(`/mockbook/org/${org.id}`);
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    router.push("/mockbook");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!selectedOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-4">
        <MockBookOrgSwitcher open={true} onSelect={handleOrgSelect} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <MockBookOrgBanner
          org={selectedOrg}
          onSwitch={() => setShowOrgSwitcher(true)}
          onExit={handleExitOrg}
        >
          <main className="flex-1 p-6">
            <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">{selectedOrg.name}</span>
              </div>

              {/* Page Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MockBook Overview</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage content for {selectedOrg.name}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {orgStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="kpi-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase">{stat.label}</div>
                            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Navigate to key management areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Link
                          key={action.title}
                          href={`/mockbook/org/${orgId}/${action.href}`}
                          className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group cursor-pointer"
                        >
                          <div className={`w-10 h-10 rounded-lg ${getIconBgColor(action.color)} flex items-center justify-center mb-3`}>
                            <Icon className={`w-5 h-5 ${getIconColor(action.color)}`} />
                          </div>
                          <div className="font-medium text-gray-900 text-sm">{action.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{action.desc}</div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Credits Usage */}
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">AI Credits Usage</CardTitle>
                      <CardDescription>Monthly allocation and consumption</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Resets Mar 15
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Used this month</span>
                          <span className="font-medium">342 / 500 credits</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">124</div>
                          <div className="text-xs text-gray-500">Questions Generated</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">89</div>
                          <div className="text-xs text-gray-500">Solutions Created</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">45</div>
                          <div className="text-xs text-gray-500">Analysis Runs</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>Latest events in MockBook</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                          <span className="text-lg">{getActivityIcon(item.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900">{item.action}</div>
                            <div className="text-xs text-gray-500">{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Top Performers</CardTitle>
                    <CardDescription>Students with highest scores this month</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/mockbook/org/${orgId}/students`}>
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {topPerformers.map((student, index) => (
                      <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-orange-50 border border-gray-100">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                          {student.name.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                        <div className="text-lg font-bold text-orange-600 mt-1">{student.score}%</div>
                        <div className="text-xs text-gray-500 mt-1">{student.tests} tests</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </MockBookOrgBanner>
      </div>

      {/* Org Switcher */}
      <MockBookOrgSwitcher
        open={showOrgSwitcher}
        onSelect={handleOrgSelect}
        recentOrgs={selectedOrg ? [selectedOrg] : []}
      />
    </div>
  );
}
