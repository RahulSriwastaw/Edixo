import { useSidebarStore } from "@/store/sidebarStore";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Calendar,
  Check,
  X,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgAdminSidebar, OrgSidebarProvider } from "@/components/org-admin/OrgAdminSidebar";
import { OrgAdminTopBar } from "@/components/org-admin/OrgAdminTopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OrgContextBanner } from "@/components/org-admin/OrgContextBanner";

// Stats
const stats = [
  { label: "Present", value: "187 (78%)", icon: CheckCircle2, color: "green" },
  { label: "Absent", value: "34 (14%)", icon: XCircle, color: "red" },
  { label: "Not Marked", value: "26 (8%)", icon: Clock, color: "yellow" },
  { label: "Average", value: "87%", icon: Calendar, color: "blue" },
];

// Classes for attendance
const classesToday = [
  { time: "09:00 AM", subject: "Physics Batch A", teacher: "Rahul Sir", students: 30, marked: true },
  { time: "11:00 AM", subject: "Chemistry Batch B", teacher: "Priya Ma'am", students: 38, marked: false },
  { time: "02:00 PM", subject: "SSC Mock Test", teacher: "All Batches", students: 245, marked: false },
  { time: "04:00 PM", subject: "Math Doubt Session", teacher: "Amit Sir", students: 15, marked: false },
];

// Students for marking attendance
const studentsList = [
  { id: "STU-00001", name: "Rahul Kumar", roll: "01" },
  { id: "STU-00002", name: "Priya Sharma", roll: "02" },
  { id: "STU-00003", name: "Amit Verma", roll: "03" },
  { id: "STU-00004", name: "Sunita Devi", roll: "04" },
  { id: "STU-00005", name: "Vikash Patel", roll: "05" },
  { id: "STU-00006", name: "Neha Singh", roll: "06" },
  { id: "STU-00007", name: "Ravi Kumar", roll: "07" },
  { id: "STU-00008", name: "Anita Gupta", roll: "08" },
];

// Attendance record for report
const attendanceReport = [
  { date: 1, status: "present" },
  { date: 2, status: "present" },
  { date: 3, status: "absent" },
  { date: 4, status: "present" },
  { date: 5, status: "holiday" },
];

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    green: "bg-green-50",
    red: "bg-red-50",
    yellow: "bg-yellow-50",
    blue: "bg-blue-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
  };
  return colors[color] || "text-gray-600";
};

export default function AttendancePage() {
    const { isOpen } = useSidebarStore();
const [activeTab, setActiveTab] = useState("today");
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const handleMarkAttendance = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    toast.success("Attendance saved successfully!");
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, string> = {};
    studentsList.forEach(s => allPresent[s.id] = "present");
    setAttendance(allPresent);
    toast.success("All students marked present");
  };

  return (
    <OrgSidebarProvider>
      <div className="min-h-screen bg-neutral-bg">
        <OrgAdminSidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "lg:ml-60" : "ml-0")}>
          <OrgAdminTopBar />
          <OrgContextBanner>
            <main className="flex-1 p-4 lg:p-6">
              <div className="max-w-[1400px] mx-auto space-y-4 lg:space-y-6 animate-fade-in">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/org-admin" className="hover:text-orange-600">Dashboard</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Attendance</span>
              </div>

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Attendance</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
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
                          <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{stat.label}</div>
                            <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                  <TabsTrigger value="today" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Today's Classes
                  </TabsTrigger>
                  <TabsTrigger value="mark" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Mark Attendance
                  </TabsTrigger>
                  <TabsTrigger value="report" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Report
                  </TabsTrigger>
                </TabsList>

                {/* Today's Classes Tab */}
                <TabsContent value="today" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Classes Today</CardTitle>
                      <CardDescription>Mark attendance for each class</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {classesToday.map((cls, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-lg border",
                              cls.marked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                            )}
                          >
                            <div className="w-20 text-sm font-mono text-gray-500">{cls.time}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{cls.subject}</div>
                              <div className="text-xs text-gray-500">{cls.teacher} · {cls.students} students</div>
                            </div>
                            {cls.marked ? (
                              <Badge className="bg-green-100 text-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                Marked
                              </Badge>
                            ) : (
                              <Button size="sm" onClick={() => setActiveTab("mark")} className="btn-primary">
                                Mark
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Mark Attendance Tab */}
                <TabsContent value="mark" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Mark Attendance</CardTitle>
                        <CardDescription>Physics Batch A · 30 students</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                          Mark All Present
                        </Button>
                        <Button variant="outline" size="sm">
                          Mark All Absent
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studentsList.map((student) => (
                          <div 
                            key={student.id}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-8 text-center text-sm font-medium text-gray-500">{student.roll}</div>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm">{student.name}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant={attendance[student.id] === "present" ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-8 px-3",
                                  attendance[student.id] === "present" && "bg-green-600 hover:bg-green-700"
                                )}
                                onClick={() => handleMarkAttendance(student.id, "present")}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant={attendance[student.id] === "absent" ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-8 px-3",
                                  attendance[student.id] === "absent" && "bg-red-600 hover:bg-red-700"
                                )}
                                onClick={() => handleMarkAttendance(student.id, "absent")}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                variant={attendance[student.id] === "late" ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-8 px-3",
                                  attendance[student.id] === "late" && "bg-yellow-600 hover:bg-yellow-700"
                                )}
                                onClick={() => handleMarkAttendance(student.id, "late")}
                              >
                                <Clock className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-4 pt-4 border-t">
                        <Button onClick={handleSaveAttendance} className="btn-primary">
                          Save Attendance
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Report Tab */}
                <TabsContent value="report" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-base">Monthly Attendance Report</CardTitle>
                        <div className="flex gap-2">
                          <Select defaultValue="batch-a">
                            <SelectTrigger className="w-[150px] input-field h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="batch-a">Batch A</SelectItem>
                              <SelectItem value="batch-b">Batch B</SelectItem>
                              <SelectItem value="ssc">SSC Batch</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select defaultValue="3">
                            <SelectTrigger className="w-[120px] input-field h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">March 2026</SelectItem>
                              <SelectItem value="2">February 2026</SelectItem>
                              <SelectItem value="1">January 2026</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 font-medium text-gray-500">Student</th>
                              {Array.from({ length: 10 }, (_, i) => (
                                <th key={i} className="p-2 text-center font-medium text-gray-500">{i + 1}</th>
                              ))}
                              <th className="p-2 text-center font-medium text-gray-500">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsList.slice(0, 5).map((student) => (
                              <tr key={student.id} className="border-b last:border-0">
                                <td className="p-3 font-medium">{student.name}</td>
                                {Array.from({ length: 10 }, (_, i) => (
                                  <td key={i} className="p-2 text-center">
                                    {i === 2 || i === 7 ? (
                                      <span className="inline-block w-5 h-5 rounded bg-red-100 text-red-600 text-xs">A</span>
                                    ) : i === 4 ? (
                                      <span className="inline-block w-5 h-5 rounded bg-gray-200 text-gray-500 text-xs">H</span>
                                    ) : (
                                      <span className="inline-block w-5 h-5 rounded bg-green-100 text-green-600 text-xs">P</span>
                                    )}
                                  </td>
                                ))}
                                <td className="p-2 text-center font-medium">
                                  <span className={cn(
                                    "text-xs px-2 py-1 rounded-full",
                                    80 >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  )}>
                                    80%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-green-100" /> Present
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-red-100" /> Absent
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-yellow-100" /> Late
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-gray-200" /> Holiday
                        </span>
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="w-3 h-3" /> Below 75%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              </div>
            </main>
          </OrgContextBanner>
        </div>
      </div>
    </OrgSidebarProvider>
  );
}
