import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  FileText,
  CheckCircle2,
  IndianRupee,
  Calendar,
  AlertTriangle,
  ChevronRight,
  UserPlus,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrgAdminSidebar, OrgSidebarProvider } from "@/components/org-admin/OrgAdminSidebar";
import { OrgAdminTopBar } from "@/components/org-admin/OrgAdminTopBar";
import { OrgSelectionModal } from "@/components/org-admin/OrgSelectionModal";
import { OrgContextBanner, SelectedOrg } from "@/components/org-admin/OrgContextBanner";

// Stats data
const stats = [
  { label: "Total Students", value: "847", change: "+12 MoM", icon: Users, color: "orange" },
  { label: "Active Staff", value: "24", change: "Active", icon: GraduationCap, color: "blue" },
  { label: "Tests Upcoming", value: "12", change: "Scheduled", icon: FileText, color: "purple" },
  { label: "Attendance", value: "87%", change: "Today", icon: CheckCircle2, color: "green" },
  { label: "Revenue", value: "₹8,45,000", change: "This month", icon: IndianRupee, color: "yellow" },
];

// Today's schedule
const todaySchedule = [
  { time: "09:00 AM", title: "Physics Batch A", teacher: "Rahul Sir", status: "live" },
  { time: "11:00 AM", title: "Chemistry Batch B", teacher: "Priya Ma'am", status: "upcoming" },
  { time: "02:00 PM", title: "SSC GD Mock Test", teacher: "All Batches", status: "scheduled" },
  { time: "04:00 PM", title: "Math Doubt Session", teacher: "Amit Sir", status: "upcoming" },
];

// Upcoming tests
const upcomingTests = [
  { date: "Mar 5", title: "SSC GD Full Mock Test", students: 245 },
  { date: "Mar 7", title: "Physics Unit Test - Batch A", students: 45 },
  { date: "Mar 10", title: "Chemistry Mid-Term - Batch B", students: 38 },
];

// Recent activity
const recentActivity = [
  { action: "Priya Singh added new test", time: "10 min ago" },
  { action: "23 students attended today", time: "1 hour ago" },
  { action: "5 new students enrolled", time: "2 hours ago" },
  { action: "Mock Test #11 results out", time: "3 hours ago" },
];

// Custom hook for localStorage with SSR support
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // Ignore errors
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Ignore errors
    }
  };

  return [storedValue, setValue];
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    yellow: "bg-yellow-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    orange: "text-orange-600",
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
  };
  return colors[color] || "text-gray-600";
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "live":
      return "bg-red-100 text-red-700";
    case "upcoming":
      return "bg-blue-100 text-blue-700";
    case "scheduled":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function OrgAdminDashboard() {
    const { isOpen } = useSidebarStore();
const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useLocalStorage<SelectedOrg | null>("selectedOrg", null);
  const [showOrgSelector, setShowOrgSelector] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && selectedOrg) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOrgSelector(false);
    }
  }, [mounted, selectedOrg]);

  const handleOrgSelect = (org: SelectedOrg) => {
    setSelectedOrg(org);
    setShowOrgSelector(false);
  };

  const handleChangeOrg = () => {
    setShowOrgSelector(true);
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    setShowOrgSelector(true);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show org selector modal
  if (showOrgSelector || !selectedOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Org Admin Panel</h1>
          <p className="text-gray-500 mt-1">Select an organization to manage</p>
        </div>
        <OrgSelectionModal open={showOrgSelector} onSelect={handleOrgSelect} />
      </div>
    );
  }

  return (
    <OrgSidebarProvider>
      <div className="min-h-screen bg-neutral-bg">
        <OrgAdminSidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "lg:ml-60" : "ml-0")}>
          <OrgAdminTopBar />
          
          {/* Org Context Banner */}
          <OrgContextBanner>
            <main className="flex-1 p-4 lg:p-6">
              <div className="max-w-[1400px] mx-auto space-y-4 lg:space-y-6 animate-fade-in">
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                      Good morning! 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Here's what's happening at {selectedOrg.name} today
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={index} className="kpi-card">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                              <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{stat.label}</div>
                              <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</div>
                              <div className="text-[10px] sm:text-xs text-gray-500">{stat.change}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button className="btn-primary h-9">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                  <Button variant="outline" className="h-9">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Test
                  </Button>
                  <Button variant="outline" className="h-9">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Attendance
                  </Button>
                  <Button variant="outline" className="h-9">
                    <IndianRupee className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </div>

                {/* Today's Schedule & Upcoming Tests */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Today's Schedule */}
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base lg:text-lg">Today's Schedule</CardTitle>
                      <Button variant="ghost" size="sm" className="text-orange-600 text-xs">
                        View Full Schedule
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {todaySchedule.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-mono text-gray-500 w-20 shrink-0">{item.time}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{item.title}</div>
                              <div className="text-xs text-gray-500">{item.teacher}</div>
                            </div>
                            {item.status === "live" ? (
                              <Badge className="bg-red-100 text-red-700 animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                                Live
                              </Badge>
                            ) : (
                              <Badge className={getStatusStyle(item.status)}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upcoming Tests */}
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base lg:text-lg">Upcoming Tests</CardTitle>
                      <Link href="/org-admin/tests">
                        <Button variant="ghost" size="sm" className="text-orange-600 text-xs">
                          View All Tests
                        </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {upcomingTests.map((test, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
                            <div className="w-12 text-center shrink-0">
                              <div className="text-xs text-gray-500">Mar</div>
                              <div className="text-lg font-bold text-gray-900">{test.date.split(" ")[1]}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{test.title}</div>
                              <div className="text-xs text-gray-500">{test.students} students enrolled</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Fee Alerts & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Fee Alerts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base lg:text-lg">Fee Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-yellow-800">7 payments pending</div>
                            <div className="text-xs text-yellow-600">₹1,52,500 total</div>
                          </div>
                          <Button variant="outline" size="sm" className="h-8">Remind</Button>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-red-800">2 payments overdue</div>
                            <div className="text-xs text-red-600">₹61,250 total</div>
                          </div>
                          <Button variant="outline" size="sm" className="h-8">Remind</Button>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-green-800">₹2,40,000 collected</div>
                            <div className="text-xs text-green-600">This month</div>
                          </div>
                        </div>
                      </div>
                      <Link href="/org-admin/fees">
                        <Button variant="outline" className="w-full mt-3 h-9">
                          Collect Fees
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentActivity.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 py-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900">{item.action}</div>
                            </div>
                            <div className="text-xs text-gray-500 shrink-0">{item.time}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </OrgContextBanner>
        </div>
      </div>
    </OrgSidebarProvider>
  );
}
