"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Key,
  FileText,
  Ban,
  Trash2,
  Download,
  Filter,
  Shield,
  Building2,
  GraduationCap,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock staff data
const mockStaff = [
  {
    id: "u1",
    name: "Rahul Kumar",
    email: "rahul@apex.edu",
    phone: "+91 98765 43210",
    role: "teacher",
    org: "Apex Academy",
    department: "Mathematics",
    designation: "Senior Math Teacher",
    status: "active",
    lastLogin: "Mar 2, 2026 10:30 AM",
    memberSince: "Jan 2025",
    setsCreated: 8,
    questionsAdded: 142,
    studentsHelped: 480,
    photo: null,
  },
  {
    id: "u2",
    name: "Priya Singh",
    email: "priya@apex.edu",
    phone: "+91 98765 43211",
    role: "teacher",
    org: "Apex Academy",
    department: "English",
    designation: "English Teacher",
    status: "active",
    lastLogin: "Mar 1, 2026 2:20 PM",
    memberSince: "Feb 2025",
    setsCreated: 5,
    questionsAdded: 98,
    studentsHelped: 320,
    photo: null,
  },
  {
    id: "u3",
    name: "Amit Sharma",
    email: "amit@apex.edu",
    phone: "+91 98765 43212",
    role: "content_manager",
    org: "Apex Academy",
    department: "Content",
    designation: "Content Manager",
    status: "active",
    lastLogin: "Feb 28, 2026 9:00 AM",
    memberSince: "Dec 2024",
    setsCreated: 12,
    questionsAdded: 256,
    studentsHelped: 0,
    photo: null,
  },
  {
    id: "u4",
    name: "Sunita Devi",
    email: "sunita@apex.edu",
    phone: "+91 98765 43213",
    role: "teacher",
    org: "Apex Academy",
    department: "General Studies",
    designation: "GK Teacher",
    status: "inactive",
    lastLogin: "Feb 20, 2026 4:45 PM",
    memberSince: "Jan 2025",
    setsCreated: 6,
    questionsAdded: 85,
    studentsHelped: 210,
    photo: null,
  },
  {
    id: "u5",
    name: "Vikram Patel",
    email: "vikram@apex.edu",
    phone: "+91 98765 43214",
    role: "org_admin",
    org: "Study Circle",
    department: "Administration",
    designation: "Org Admin",
    status: "active",
    lastLogin: "Mar 2, 2026 4:00 PM",
    memberSince: "Nov 2024",
    setsCreated: 3,
    questionsAdded: 45,
    studentsHelped: 150,
    photo: null,
  },
  {
    id: "u6",
    name: "Neha Gupta",
    email: "neha@apex.edu",
    phone: "+91 98765 43215",
    role: "analytics_viewer",
    org: "Apex Academy",
    department: "Analytics",
    designation: "Data Analyst",
    status: "active",
    lastLogin: "Mar 2, 2026 11:15 AM",
    memberSince: "Jan 2026",
    setsCreated: 0,
    questionsAdded: 0,
    studentsHelped: 0,
    photo: null,
  },
];

// Role config
const roleConfig: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  super_admin: { label: "Super Admin", icon: Shield, color: "bg-red-100 text-red-700" },
  org_admin: { label: "Org Admin", icon: Building2, color: "bg-blue-100 text-blue-700" },
  teacher: { label: "Teacher", icon: GraduationCap, color: "bg-green-100 text-green-700" },
  content_manager: { label: "Content Mgr", icon: Edit, color: "bg-purple-100 text-purple-700" },
  analytics_viewer: { label: "Analytics", icon: BarChart3, color: "bg-amber-100 text-amber-700" },
};

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const config = roleConfig[role] || { label: role, icon: Users, color: "bg-gray-100 text-gray-600" };
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-sm text-green-700">Active</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-red-500 rounded-full" />
      <span className="text-sm text-red-700">Inactive</span>
    </div>
  );
}

export default function StaffManagementPage() {
    const { isOpen } = useSidebarStore();
const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  // Filter staff
  const filteredStaff = mockStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: mockStaff.length,
    active: mockStaff.filter((s) => s.status === "active").length,
    teachers: mockStaff.filter((s) => s.role === "teacher").length,
    admins: mockStaff.filter((s) => s.role === "org_admin" || s.role === "super_admin").length,
  };

  // Select all
  const allSelected = selectedStaff.length === filteredStaff.length && filteredStaff.length > 0;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(filteredStaff.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions
  const handleResetPassword = (staffId: string) => {
    toast.success("Password reset email sent");
  };

  const handleSuspend = (staffId: string) => {
    toast.success("Account suspended");
  };

  const handleDelete = () => {
    if (staffToDelete) {
      toast.success("Staff member deleted");
      setShowDeleteDialog(false);
      setStaffToDelete(null);
    }
  };

  const handleExport = () => {
    toast.success("Staff list exported");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-500 text-sm">Manage employees, teachers, and their access permissions</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Link href="/admin/staff/add">
                  <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Staff Member
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-500">Total Staff</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-gray-500">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.teachers}</div>
                  <div className="text-sm text-gray-500">Teachers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                  <div className="text-sm text-gray-500">Admins</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="org_admin">Org Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="content_manager">Content Manager</SelectItem>
                      <SelectItem value="analytics_viewer">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedStaff.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedStaff.length} selected
                  </span>
                  <Button variant="outline" size="sm">
                    <Key className="w-4 h-4 mr-1" /> Reset Passwords
                  </Button>
                  <Button variant="outline" size="sm">
                    <Ban className="w-4 h-4 mr-1" /> Suspend
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStaff([])}>
                  Clear
                </Button>
              </div>
            )}

            {/* Staff Table */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#F4511E]" />
                  <CardTitle>Staff Members</CardTitle>
                  <Badge className="bg-gray-100 text-gray-600">{filteredStaff.length} staff</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="w-12 p-4">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all"
                          />
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Staff Member</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Role</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Organization</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Last Login</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map((staff) => (
                        <tr
                          key={staff.id}
                          className={cn(
                            "border-b hover:bg-gray-50 transition-colors cursor-pointer",
                            selectedStaff.includes(staff.id) && "bg-orange-50"
                          )}
                          onClick={() => {}}
                        >
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedStaff.includes(staff.id)}
                              onCheckedChange={() => toggleSelect(staff.id)}
                              aria-label={`Select ${staff.name}`}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={staff.photo || ""} />
                                <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                                  {staff.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{staff.name}</p>
                                <p className="text-xs text-gray-500">{staff.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <RoleBadge role={staff.role} />
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm text-gray-900">{staff.org}</p>
                              <p className="text-xs text-gray-500">{staff.department}</p>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <StatusBadge status={staff.status} />
                          </td>
                          <td className="p-4 text-sm text-gray-500">{staff.lastLogin}</td>
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" /> View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" /> Edit Role & Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResetPassword(staff.id)}>
                                    <Key className="w-4 h-4 mr-2" /> Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="w-4 h-4 mr-2" /> Activity Log
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleSuspend(staff.id)}>
                                    <Ban className="w-4 h-4 mr-2" /> Suspend Account
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => {
                                      setStaffToDelete(staff.id);
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Member?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the staff member account and remove their access from the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
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
