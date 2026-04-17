"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  KeyRound,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Trophy,
  Bell,
  Settings,
  GraduationCap,
  Gamepad2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { studentAppService, PersonalizationSettings } from "@/services/studentAppService";
import { toast } from "sonner";

// Mock students data
const students = [
  {
    id: "STU-00001",
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    avatar: null,
    organization: "Apex Academy",
    orgId: "GK-ORG-00142",
    appAccess: "STUDENT",
    linkedTeacherId: "GK-TCH-00892",
    lastActive: "30 min ago",
    testsTaken: 24,
    status: "Active",
  },
  {
    id: "STU-00002",
    name: "Ananya Reddy",
    email: "ananya.reddy@yahoo.com",
    avatar: null,
    organization: "Excel Institute",
    orgId: "GK-ORG-00140",
    appAccess: "BOTH",
    linkedTeacherId: "GK-TCH-00765",
    lastActive: "2 hours ago",
    testsTaken: 18,
    status: "Active",
  },
  {
    id: "STU-00003",
    name: "Vikram Patel",
    email: "vikram.patel@outlook.com",
    avatar: null,
    organization: "Prime Tutorials",
    orgId: "GK-ORG-00137",
    appAccess: "BOTH",
    linkedTeacherId: "GK-TCH-00389",
    lastActive: "1 day ago",
    testsTaken: 32,
    status: "Active",
  },
  {
    id: "STU-00004",
    name: "Priya Gupta",
    email: "priya.gupta@gmail.com",
    avatar: null,
    organization: "Apex Academy",
    orgId: "GK-ORG-00142",
    appAccess: "MOCKBOOK",
    linkedTeacherId: "GK-TCH-00892",
    lastActive: "5 hours ago",
    testsTaken: 12,
    status: "Active",
  },
  {
    id: "STU-00005",
    name: "Arjun Singh",
    email: "arjun.singh@gmail.com",
    avatar: null,
    organization: "Brilliant Coaching",
    orgId: "GK-ORG-00141",
    appAccess: "STUDENT",
    linkedTeacherId: null,
    lastActive: "3 days ago",
    testsTaken: 5,
    status: "Suspended",
  },
];

// Stats data
const stats = [
  { label: "Total Students", value: "12,847", icon: Users, color: "blue" },
  { label: "Active Today", value: "8,234", icon: GraduationCap, color: "green" },
  { label: "Tests Taken (30d)", value: "34,291", icon: BarChart3, color: "purple" },
  { label: "Avg Score", value: "72.4%", icon: Trophy, color: "orange" },
];

// App Access Badge
function AppAccessBadge({ access }: { access: string }) {
  const styles: Record<string, string> = {
    STUDENT: "badge-student",
    MOCKBOOK: "badge-mockbook",
    BOTH: "badge-both",
  };
  return <span className={`badge ${styles[access] || ""}`}>{access}</span>;
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "badge-active",
    Suspended: "badge-suspended",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

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

// Gamification config state
const defaultGamificationConfig = {
  pointsPerCorrect: 10,
  pointsDeductedPerWrong: -3,
  dailyLoginBonus: 5,
  testCompletionBonus: 25,
  perfectScoreBonus: 50,
  streakMultiplier: "1.5x",
};

// Badge definitions
const availableBadges = [
  { id: "champion", name: "Champion", icon: "🏆", enabled: true },
  { id: "streak30", name: "30 Day Streak", icon: "🔥", enabled: true },
  { id: "perfect", name: "Perfect Score", icon: "⭐", enabled: true },
  { id: "quick", name: "Speed Demon", icon: "⚡", enabled: false },
  { id: "scholar", name: "Scholar", icon: "📚", enabled: true },
  { id: "helper", name: "Helpful", icon: "🤝", enabled: false },
];

export default function StudentAppPage() {
  const { isOpen } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [gamificationConfig, setGamificationConfig] = useState<PersonalizationSettings>({});

  const selectedOrgId = null;
  const selectedOrg = null;

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setIsLoading(true);
        const [studentsRes, personalizationRes] = await Promise.all([
          studentAppService.getStudents(undefined, searchQuery),
          // studentAppService.getPersonalization(selectedOrgId) // Temporarily disabled if not global
        ]);
        setStudentList(studentsRes);
        // if (personalizationRes) {
        //   setGamificationConfig(personalizationRes);
        // }
      } catch (error) {
        console.error("Failed to fetch student app data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgData();
  }, [selectedOrgId, searchQuery]);

  const handleSavePersonalization = async () => {
    try {
      // await studentAppService.updatePersonalization(selectedOrgId, gamificationConfig);
      toast.info("Global personalization update not yet implemented in backend");
      toast.success("Personalization settings updated successfully");
    } catch (error) {
      console.error("Failed to update personalization:", error);
      toast.error("Failed to update settings");
    }
  };

  const [badges, setBadges] = useState(availableBadges);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all";

  const toggleBadge = (id: string) => {
    setBadges(badges.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "lg:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student App</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage students, gamification, and notifications
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="btn-secondary">
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

            {/* Tabs */}
            <Tabs defaultValue="students" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="students" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Students
                </TabsTrigger>
                <TabsTrigger value="gamification" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Gamification
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="app-config" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  App Config
                </TabsTrigger>
              </TabsList>

              {/* Students Tab */}
              <TabsContent value="students" className="mt-6 space-y-4">
                {/* Filter Bar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search students..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 input-field"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] input-field">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      {hasActiveFilters && (
                        <Button variant="ghost" onClick={clearFilters} className="btn-ghost">
                          <X className="w-4 h-4 mr-1" />
                          Clear Filters
                        </Button>
                      )}
                      
                    </div>
                  </CardContent>
                </Card>

                {/* Students Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student ID</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">App Access</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Linked Teacher</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Active</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Tests</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                              Loading students...
                            </TableCell>
                          </TableRow>
                        ) : studentList.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                              No students found for this organization.
                            </TableCell>
                          </TableRow>
                        ) : studentList.map((student) => (
                          <TableRow key={student.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                    {student.name ? student.name.split(" ").map((n: string) => n[0]).join("") : "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{student.name}</div>
                                  <div className="text-xs text-gray-500">{student.phone || "No phone"}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs text-gray-600">{student.studentId}</span>
                            </TableCell>
                            <TableCell>
                              {selectedOrg?.name || "Global"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-gray-400">—</span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center text-sm">{student.totalAttempts}</TableCell>
                            <TableCell>
                              <StatusBadge status={student.isActive ? "Active" : "Suspended"} />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" /> View Profile
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {studentList.length} students
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Gamification Tab */}
              <TabsContent value="gamification" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Points Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-purple-600" />
                        {selectedOrg?.name || "Organization"} Points Configuration
                      </CardTitle>
                      <CardDescription>Configure points and bonuses for this organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Points per correct answer</Label>
                          <Input
                            type="number"
                            value={gamificationConfig.pointsPerCorrect || 0}
                            onChange={(e) =>
                              setGamificationConfig({
                                ...gamificationConfig,
                                pointsPerCorrect: parseInt(e.target.value) || 0,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Points deducted per wrong</Label>
                          <Input
                            type="number"
                            value={gamificationConfig.pointsDeductedPerWrong || 0}
                            onChange={(e) =>
                              setGamificationConfig({
                                ...gamificationConfig,
                                pointsDeductedPerWrong: parseInt(e.target.value) || 0,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Daily login bonus</Label>
                          <Input
                            type="number"
                            value={gamificationConfig.dailyLoginBonus || 0}
                            onChange={(e) =>
                              setGamificationConfig({
                                ...gamificationConfig,
                                dailyLoginBonus: parseInt(e.target.value) || 0,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Test completion bonus</Label>
                          <Input
                            type="number"
                            value={gamificationConfig.testCompletionBonus || 0}
                            onChange={(e) =>
                              setGamificationConfig({
                                ...gamificationConfig,
                                testCompletionBonus: parseInt(e.target.value) || 0,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Perfect score bonus</Label>
                          <Input
                            type="number"
                            value={gamificationConfig.perfectScoreBonus || 0}
                            onChange={(e) =>
                              setGamificationConfig({
                                ...gamificationConfig,
                                perfectScoreBonus: parseInt(e.target.value) || 0,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button className="btn-primary" onClick={handleSavePersonalization}>
                          Save Configuration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Badge Management */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Badge Management
                      </CardTitle>
                      <CardDescription>Enable/disable badges for students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {badges.map((badge) => (
                          <div
                            key={badge.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                              badge.enabled
                                ? "border-brand-primary bg-brand-primary-tint"
                                : "border-gray-200 bg-gray-50"
                            }`}
                            onClick={() => toggleBadge(badge.id)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{badge.icon}</span>
                              <span className="font-medium text-gray-900">{badge.name}</span>
                            </div>
                            <Switch checked={badge.enabled} />
                          </div>
                        ))}
                      </div>
                      <Button className="btn-primary mt-4 w-full">Save Badge Settings</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      Push Notification Center
                    </CardTitle>
                    <CardDescription>Send notifications to students</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input placeholder="Notification title..." className="input-field" />
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <textarea
                            placeholder="Notification message..."
                            className="input-field min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Target Audience</Label>
                          <Select defaultValue="all">
                            <SelectTrigger className="input-field">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Students</SelectItem>
                              <SelectItem value="org">Specific Organization</SelectItem>
                              <SelectItem value="app">By App Type</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Schedule</Label>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 btn-secondary">
                              Send Now
                            </Button>
                            <Button variant="outline" className="flex-1 btn-secondary">
                              Schedule
                            </Button>
                          </div>
                        </div>
                        <Button className="btn-primary w-full">
                          <Bell className="w-4 h-4 mr-2" />
                          Send Notification
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-2">Preview</div>
                        <div className="bg-white rounded-xl shadow-md p-4 max-w-[280px]">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
                              <span className="text-white font-bold text-sm">E</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-gray-900">EduHub</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Your notification message will appear here...
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* App Config Tab */}
              <TabsContent value="app-config" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      App Configuration
                    </CardTitle>
                    <CardDescription>Global student app settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Maintenance Mode</div>
                          <div className="text-sm text-gray-500">Disable app for all users</div>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Force Update Required</div>
                          <div className="text-sm text-gray-500">Require app update to continue</div>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Show Leaderboard</div>
                          <div className="text-sm text-gray-500">Display public leaderboard</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Allow Offline Mode</div>
                          <div className="text-sm text-gray-500">Download content for offline</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label>Minimum App Version (Android)</Label>
                        <Input placeholder="e.g., 2.4.0" className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <Label>Minimum App Version (iOS)</Label>
                        <Input placeholder="e.g., 2.4.0" className="input-field" />
                      </div>
                    </div>
                    <Button className="btn-primary">Save Configuration</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
