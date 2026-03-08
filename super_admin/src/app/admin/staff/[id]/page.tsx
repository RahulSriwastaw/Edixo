"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Shield,
  Building2,
  GraduationCap,
  BarChart3,
  Edit,
  User,
  Mail,
  Phone,
  Key,
  Ban,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
  Users,
  FileText,
  Activity,
  Clock,
  Check,
  X,
  Settings,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock staff data
const staffData = {
  id: "u1",
  name: "Rahul Kumar",
  email: "rahul@apex.edu",
  phone: "+91 98765 43210",
  role: "teacher",
  org: "Apex Academy",
  orgId: "org-1",
  department: "Mathematics",
  designation: "Senior Math Teacher",
  status: "active",
  lastLogin: "Mar 2, 2026 10:30 AM",
  memberSince: "Jan 2025",
  loginId: "rahul.kumar",
  photo: null,
  stats: {
    setsCreated: 8,
    questionsAdded: 142,
    studentsHelped: 480,
    mocktestsCreated: 3,
    totalViews: 2341,
  },
  recentActivity: [
    { id: 1, action: "Created Set", item: "Mathematics — Algebra & Calculus", time: "2 hours ago" },
    { id: 2, action: "Added Question", item: "Q#4521 — Calculus derivative problem", time: "5 hours ago" },
    { id: 3, action: "Updated MockTest", item: "JEE Main Full Mock — March 2026", time: "1 day ago" },
    { id: 4, action: "Created MockTest", item: "SSC CGL Practice Set 12", time: "2 days ago" },
    { id: 5, action: "Added 5 Questions", item: "Physics — Kinematics", time: "3 days ago" },
  ],
  permissions: {
    "Question Bank": { read: true, write: true, delete: true },
    "Mock Tests": { read: true, write: true, delete: false },
    "eBooks": { read: true, write: true, delete: false },
    "Students": { read: true, write: false, delete: false },
    "Analytics": { read: true, write: false, delete: false },
    "Settings": { read: false, write: false, delete: false },
  },
  sets: [
    { id: "1", code: "482931", name: "Mathematics — Algebra & Calculus", questions: 25, created: "Mar 1, 2026" },
    { id: "2", code: "591047", name: "JEE Advanced Problems", questions: 30, created: "Feb 25, 2026" },
    { id: "3", code: "673829", name: "Board Exam Practice", questions: 50, created: "Feb 20, 2026" },
  ],
};

// Role config
const roleConfig: Record<string, { label: string; icon: typeof Shield; color: string; description: string }> = {
  super_admin: { label: "Super Admin", icon: Shield, color: "bg-red-100 text-red-700", description: "Full platform access" },
  org_admin: { label: "Org Admin", icon: Building2, color: "bg-blue-100 text-blue-700", description: "Manage organization" },
  teacher: { label: "Teacher", icon: GraduationCap, color: "bg-green-100 text-green-700", description: "Create & manage content" },
  content_manager: { label: "Content Manager", icon: Edit, color: "bg-purple-100 text-purple-700", description: "Manage Q-Bank & sets" },
  analytics_viewer: { label: "Analytics Viewer", icon: BarChart3, color: "bg-amber-100 text-amber-700", description: "View reports only" },
};

export default function StaffProfilePage({   const { isOpen } = useSidebarStore();
params }: { params: { id: string } }) {
  const router = useRouter();
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const roleInfo = roleConfig[staffData.role] || roleConfig.teacher;
  const RoleIcon = roleInfo.icon;

  // Handlers
  const handleResetPassword = () => {
    toast.success("Password reset email sent to " + staffData.email);
    setShowResetPassword(false);
    setNewPassword("");
  };

  const handleSuspend = () => {
    toast.success("Account suspended");
    setShowSuspend(false);
  };

  const handleDelete = () => {
    toast.success("Staff member deleted");
    setShowDelete(false);
    router.push("/admin/staff");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/admin/staff" className="hover:text-[#F4511E]">Staff Management</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{staffData.name}</span>
            </div>

            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={staffData.photo || ""} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xl font-medium">
                        {staffData.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{staffData.name}</h1>
                        <Badge className={roleInfo.color}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                        {staffData.status === "active" ? (
                          <Badge className="bg-green-100 text-green-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1" /> Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-500 mt-1">{staffData.designation} • {staffData.department}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" /> {staffData.org}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> Member since {staffData.memberSince}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowResetPassword(true)}>
                      <Key className="w-4 h-4 mr-1" /> Reset Password
                    </Button>
                    <Button variant="outline" onClick={() => setShowSuspend(true)}>
                      <Ban className="w-4 h-4 mr-1" /> Suspend
                    </Button>
                    <Button variant="destructive" onClick={() => setShowDelete(true)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Layers className="w-5 h-5 mx-auto text-[#F4511E] mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{staffData.stats.setsCreated}</div>
                  <div className="text-xs text-gray-500">Sets Created</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-5 h-5 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{staffData.stats.questionsAdded}</div>
                  <div className="text-xs text-gray-500">Questions Added</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <FileText className="w-5 h-5 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{staffData.stats.mocktestsCreated}</div>
                  <div className="text-xs text-gray-500">MockTests</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{staffData.stats.studentsHelped}</div>
                  <div className="text-xs text-gray-500">Students Helped</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="w-5 h-5 mx-auto text-amber-600 mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{staffData.stats.totalViews}</div>
                  <div className="text-xs text-gray-500">Total Views</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="activity" className="space-y-4">
              <TabsList className="bg-white border">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="sets">Sets</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#F4511E]" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {staffData.recentActivity.map((activity) => (
                        <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                              {activity.action.includes("Created") ? (
                                <Layers className="w-5 h-5 text-[#F4511E]" />
                              ) : activity.action.includes("Added") ? (
                                <BookOpen className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Edit className="w-5 h-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.action}</p>
                              <p className="text-sm text-gray-500">{activity.item}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {activity.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#F4511E]" />
                      Role Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-5 h-5" />
                        <span className="font-medium">{roleInfo.label}</span>
                        <Badge variant="outline">{roleInfo.description}</Badge>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium text-gray-500">Module</th>
                            <th className="text-center p-3 font-medium text-gray-500">Read</th>
                            <th className="text-center p-3 font-medium text-gray-500">Write</th>
                            <th className="text-center p-3 font-medium text-gray-500">Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(staffData.permissions).map(([module, perms]) => (
                            <tr key={module} className="border-b">
                              <td className="p-3 font-medium text-gray-900">{module}</td>
                              <td className="p-3 text-center">
                                {perms.read ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {perms.write ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {perms.delete ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-1" /> Edit Permissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sets Tab */}
              <TabsContent value="sets">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#F4511E]" />
                      Sets Created
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 font-medium text-gray-500">Set</th>
                          <th className="text-left p-4 font-medium text-gray-500">ID</th>
                          <th className="text-center p-4 font-medium text-gray-500">Questions</th>
                          <th className="text-left p-4 font-medium text-gray-500">Created</th>
                          <th className="text-center p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffData.sets.map((set) => (
                          <tr key={set.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <span className="font-medium text-gray-900">{set.name}</span>
                            </td>
                            <td className="p-4">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                {set.code}
                              </code>
                            </td>
                            <td className="p-4 text-center">
                              <Badge className="bg-blue-50 text-blue-700">{set.questions}</Badge>
                            </td>
                            <td className="p-4 text-gray-500 text-sm">{set.created}</td>
                            <td className="p-4 text-center">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-[#F4511E]" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Full Name</label>
                          <p className="font-medium text-gray-900">{staffData.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Login ID</label>
                          <p className="font-medium text-gray-900">{staffData.loginId}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email Address</label>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {staffData.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Phone Number</label>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {staffData.phone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#F4511E]" />
                        Organization Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Organization</label>
                          <p className="font-medium text-gray-900">{staffData.org}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Department</label>
                          <p className="font-medium text-gray-900">{staffData.department}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Designation</label>
                          <p className="font-medium text-gray-900">{staffData.designation}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Role</label>
                          <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Last Login</label>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {staffData.lastLogin}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Back Button */}
            <div className="pt-4">
              <Button variant="outline" onClick={() => router.push("/admin/staff")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Staff List
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {staffData.name} or leave blank to send a reset link.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter new password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              {newPassword ? "Set Password" : "Send Reset Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={showSuspend} onOpenChange={setShowSuspend}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Account?</DialogTitle>
            <DialogDescription>
              {staffData.name} will immediately lose access to the platform. This action can be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspend(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              Suspend Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data associated with {staffData.name} will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
