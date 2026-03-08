import { useSidebarStore } from "@/store/sidebarStore";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  KeyRound,
  ChevronRight,
  ChevronLeft,
  X,
  Users,
  UserCog,
  BookOpen,
  IndianRupee,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgAdminSidebar, OrgSidebarProvider } from "@/components/org-admin/OrgAdminSidebar";
import { OrgAdminTopBar } from "@/components/org-admin/OrgAdminTopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OrgContextBanner } from "@/components/org-admin/OrgContextBanner";

// Mock staff data
const staffData = [
  {
    id: "GK-TCH-00045",
    name: "Rahul Kumar",
    email: "rahul@apexacademy.com",
    phone: "+91 9876543210",
    role: "org_admin",
    subjects: [],
    status: "active",
    joined: "Jan 20, 2026",
    lastActive: "2 hours ago",
  },
  {
    id: "GK-TCH-00046",
    name: "Priya Singh",
    email: "priya@apexacademy.com",
    phone: "+91 9876543211",
    role: "teacher",
    subjects: ["Physics", "Chemistry"],
    status: "active",
    joined: "Feb 1, 2026",
    lastActive: "30 min ago",
  },
  {
    id: "GK-TCH-00047",
    name: "Amit Verma",
    email: "amit@apexacademy.com",
    phone: "+91 9876543212",
    role: "teacher",
    subjects: ["Math"],
    status: "active",
    joined: "Feb 5, 2026",
    lastActive: "1 day ago",
  },
  {
    id: "GK-STF-00001",
    name: "Sunita Kumari",
    email: "sunita@apexacademy.com",
    phone: "+91 9876543213",
    role: "receptionist",
    subjects: [],
    status: "active",
    joined: "Feb 10, 2026",
    lastActive: "1 hour ago",
  },
  {
    id: "GK-TCH-00048",
    name: "Vikash Patel",
    email: "vikash@apexacademy.com",
    phone: "+91 9876543214",
    role: "content_manager",
    subjects: [],
    status: "inactive",
    joined: "Feb 15, 2026",
    lastActive: "5 days ago",
  },
];

// Stats
const stats = [
  { label: "Total Staff", value: 24, icon: Users, color: "blue" },
  { label: "Teachers", value: 18, icon: BookOpen, color: "orange" },
  { label: "Admins", value: 2, icon: Shield, color: "purple" },
  { label: "Support Staff", value: 4, icon: UserCog, color: "green" },
];

// Role Badge
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; className: string }> = {
    org_admin: { label: "Org Admin", className: "bg-purple-50 text-purple-700" },
    teacher: { label: "Teacher", className: "bg-orange-50 text-orange-700" },
    content_manager: { label: "Content Mgr", className: "bg-blue-50 text-blue-700" },
    fee_manager: { label: "Fee Manager", className: "bg-green-50 text-green-700" },
    receptionist: { label: "Receptionist", className: "bg-gray-50 text-gray-700" },
  };

  const { label, className } = config[role] || config.receptionist;

  return <Badge className={cn("text-[10px]", className)}>{label}</Badge>;
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-50 text-green-700 border-green-200" },
    inactive: { label: "Inactive", className: "bg-gray-50 text-gray-600 border-gray-200" },
    suspended: { label: "Suspended", className: "bg-red-50 text-red-700 border-red-200" },
  };

  const { label, className } = config[status] || config.inactive;

  return (
    <Badge variant="outline" className={cn("text-[10px]", className)}>
      {status === "active" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />}
      {label}
    </Badge>
  );
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

export default function StaffPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addStep, setAddStep] = useState(1);

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || roleFilter !== "all" || statusFilter !== "all";

  // Filter staff
  const filteredStaff = staffData.filter((staff) => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = () => {
    toast.success("Staff member added successfully!");
    setShowAddDialog(false);
    setAddStep(1);
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
                <span className="text-gray-900 font-medium">Staff Management</span>
              </div>

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Staff Management</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage staff members and their permissions
                  </p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="kpi-card">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${getIconColor(stat.color)}`} />
                          </div>
                          <div>
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{stat.label}</div>
                            <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Filter Bar */}
              <Card>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center gap-3">
                    <div className="relative w-full lg:flex-1 lg:min-w-[200px] lg:max-w-[300px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search staff..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 input-field"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] input-field">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="org_admin">Org Admin</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="content_manager">Content Manager</SelectItem>
                          <SelectItem value="fee_manager">Fee Manager</SelectItem>
                          <SelectItem value="receptionist">Receptionist</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[130px] input-field">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {hasActiveFilters && (
                      <Button variant="ghost" onClick={clearFilters} className="w-full lg:w-auto">
                        <X className="w-4 h-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Table */}
              <Card>
                <CardContent className="p-0">
                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {filteredStaff.map((staff) => (
                      <div key={staff.id} className="p-4 space-y-3 hover:bg-orange-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                              {staff.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{staff.name}</div>
                            <div className="text-xs text-gray-500">{staff.email}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{staff.id}</div>
                          </div>
                          <StatusBadge status={staff.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <RoleBadge role={staff.role} />
                          {staff.subjects.length > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {staff.subjects.join(", ")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Joined: {staff.joined}</span>
                          <span>Active: {staff.lastActive}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Staff Member</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Role</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Subjects</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Active</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStaff.map((staff) => (
                          <TableRow key={staff.id} className="hover:bg-orange-50 cursor-pointer">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-9 h-9">
                                  <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                                    {staff.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{staff.name}</div>
                                  <div className="text-xs text-gray-500">{staff.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={staff.role} />
                            </TableCell>
                            <TableCell>
                              {staff.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {staff.subjects.map((s) => (
                                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={staff.status} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{staff.lastActive}</TableCell>
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
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" /> Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Deactivate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
          </OrgContextBanner>
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Step {addStep} of 3
            </DialogDescription>
          </DialogHeader>

          {addStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Enter full name" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="email@example.com" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+91 9876543210" className="input-field" />
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="content_manager">Content Manager</SelectItem>
                    <SelectItem value="fee_manager">Fee Manager</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subjects (if Teacher)</Label>
                <div className="flex flex-wrap gap-2">
                  {["Physics", "Chemistry", "Math", "Biology", "English"].map((subject) => (
                    <Badge 
                      key={subject} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-orange-50"
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {addStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Staff ID</Label>
                <Input value="GK-TCH-00XXX (auto-generated)" disabled className="input-field bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-auto py-3">
                    <span className="text-sm">Auto-generate</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-3">
                    <span className="text-sm">Set manually</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {addStep > 1 && (
              <Button variant="outline" onClick={() => setAddStep(addStep - 1)} className="w-full sm:w-auto">
                Back
              </Button>
            )}
            {addStep < 3 ? (
              <Button onClick={() => setAddStep(addStep + 1)} className="btn-primary w-full sm:w-auto">
                Next
              </Button>
            ) : (
              <Button onClick={handleAddStaff} className="btn-primary w-full sm:w-auto">
                Create Staff Member
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrgSidebarProvider>
  );
}
