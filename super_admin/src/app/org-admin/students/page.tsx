"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Users,
  GraduationCap,
  Flame,
  Crown,
  Download,
  Upload,
  Filter,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  FileText,
  Zap,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
import { OrgContextBanner } from "@/components/org-admin/OrgContextBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock students data
const studentsData = [
  {
    id: "STU-00001",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 9876543210",
    class: "Class 12",
    batch: "JEE Batch A",
    target: "JEE 2026",
    packs: ["JEE Gold Pack", "JEE Platinum"],
    testsTaken: 48,
    avgScore: 72,
    streak: 12,
    status: "active",
    joined: "Jan 15, 2026",
    lastActive: "2 hours ago",
    aiPoints: 342,
    totalPoints: 2450,
  },
  {
    id: "STU-00002",
    name: "Priya Verma",
    email: "priya.verma@email.com",
    phone: "+91 9876543211",
    class: "Class 12",
    batch: "NEET Batch",
    target: "NEET 2026",
    packs: ["NEET Gold Pack"],
    testsTaken: 32,
    avgScore: 85,
    streak: 5,
    status: "active",
    joined: "Feb 1, 2026",
    lastActive: "30 min ago",
    aiPoints: 180,
    totalPoints: 1820,
  },
  {
    id: "STU-00003",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "+91 9876543212",
    class: "Class 11",
    batch: "JEE Batch B",
    target: "JEE 2027",
    packs: ["JEE Silver Pack"],
    testsTaken: 18,
    avgScore: 65,
    streak: 0,
    status: "active",
    joined: "Feb 10, 2026",
    lastActive: "1 day ago",
    aiPoints: 95,
    totalPoints: 890,
  },
  {
    id: "STU-00004",
    name: "Sunita Devi",
    email: "sunita.devi@email.com",
    phone: "+91 9876543213",
    class: "Class 12",
    batch: "SSC GD Batch",
    target: "SSC GD 2026",
    packs: ["SSC GD Complete"],
    testsTaken: 24,
    avgScore: 78,
    streak: 8,
    status: "active",
    joined: "Jan 20, 2026",
    lastActive: "4 hours ago",
    aiPoints: 210,
    totalPoints: 1560,
  },
  {
    id: "STU-00005",
    name: "Vikash Patel",
    email: "vikash.patel@email.com",
    phone: "+91 9876543214",
    class: "Class 12",
    batch: "JEE Batch A",
    target: "JEE 2026",
    packs: [],
    testsTaken: 5,
    avgScore: 58,
    streak: 0,
    status: "inactive",
    joined: "Feb 15, 2026",
    lastActive: "5 days ago",
    aiPoints: 0,
    totalPoints: 250,
  },
  {
    id: "STU-00006",
    name: "Neha Singh",
    email: "neha.singh@email.com",
    phone: "+91 9876543215",
    class: "Class 12",
    batch: "NEET Batch",
    target: "NEET 2026",
    packs: ["NEET Gold Pack", "NEET Test Series"],
    testsTaken: 42,
    avgScore: 82,
    streak: 21,
    status: "active",
    joined: "Dec 1, 2025",
    lastActive: "1 hour ago",
    aiPoints: 450,
    totalPoints: 3210,
  },
  {
    id: "STU-00007",
    name: "Rohit Gupta",
    email: "rohit.gupta@email.com",
    phone: "+91 9876543216",
    class: "Class 11",
    batch: "Foundation Batch",
    target: "JEE 2027",
    packs: ["Foundation Pack"],
    testsTaken: 15,
    avgScore: 70,
    streak: 3,
    status: "active",
    joined: "Feb 5, 2026",
    lastActive: "6 hours ago",
    aiPoints: 120,
    totalPoints: 780,
  },
  {
    id: "STU-00008",
    name: "Anjali Kumari",
    email: "anjali.kumari@email.com",
    phone: "+91 9876543217",
    class: "Class 12",
    batch: "SSC GD Batch",
    target: "SSC GD 2026",
    packs: ["SSC GD Complete"],
    testsTaken: 28,
    avgScore: 75,
    streak: 15,
    status: "suspended",
    joined: "Jan 25, 2026",
    lastActive: "3 days ago",
    aiPoints: 0,
    totalPoints: 1650,
  },
];

// Available packs for assignment
const availablePacks = [
  { id: "pack-001", name: "JEE Gold Pack", price: 999, duration: "Monthly" },
  { id: "pack-002", name: "JEE Platinum", price: 1999, duration: "Monthly" },
  { id: "pack-003", name: "NEET Gold Pack", price: 999, duration: "Monthly" },
  { id: "pack-004", name: "NEET Test Series", price: 499, duration: "Monthly" },
  { id: "pack-005", name: "SSC GD Complete", price: 799, duration: "Monthly" },
  { id: "pack-006", name: "Foundation Pack", price: 599, duration: "Monthly" },
  { id: "pack-007", name: "JEE Silver Pack", price: 499, duration: "Monthly" },
];

// Stats
const stats = [
  { label: "Total Students", value: 847, icon: Users, color: "blue", change: "+12" },
  { label: "Active Today", value: 234, icon: GraduationCap, color: "green", change: "28%" },
  { label: "Avg Test Score", value: "74%", icon: Target, color: "orange", change: "+3%" },
  { label: "Avg Streak", value: 8.5, icon: Flame, color: "red", change: "days" },
];

// Pack Badge
function PackBadge({ pack }: { pack: string }) {
  const isGold = pack.toLowerCase().includes("gold");
  const isPlatinum = pack.toLowerCase().includes("platinum");
  const isSilver = pack.toLowerCase().includes("silver");

  const className = isPlatinum
    ? "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-300"
    : isGold
    ? "bg-gradient-to-r from-yellow-50 to-amber-100 text-amber-700 border-amber-200"
    : isSilver
    ? "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", className)}>
      {isPlatinum && <Crown className="w-3 h-3 mr-1" />}
      {isGold && <Zap className="w-3 h-3 mr-1" />}
      {pack}
    </Badge>
  );
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
    red: "bg-red-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-gray-600";
};

export default function StudentsPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packFilter, setPackFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPackDialog, setShowPackDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof studentsData[0] | null>(null);
  const [addStep, setAddStep] = useState(1);

  const clearFilters = () => {
    setSearchQuery("");
    setBatchFilter("all");
    setStatusFilter("all");
    setPackFilter("all");
  };

  const hasActiveFilters = searchQuery || batchFilter !== "all" || statusFilter !== "all" || packFilter !== "all";

  // Filter students
  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter === "all" || student.batch === batchFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesPack = packFilter === "all" || student.packs.some(p => p.toLowerCase().includes(packFilter.toLowerCase()));
    return matchesSearch && matchesBatch && matchesStatus && matchesPack;
  });

  const handleAddStudent = () => {
    toast.success("Student added successfully!");
    setShowAddDialog(false);
    setAddStep(1);
  };

  const handleViewStudent = (student: typeof studentsData[0]) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
  };

  const handleAssignPack = (student: typeof studentsData[0]) => {
    setSelectedStudent(student);
    setShowPackDialog(true);
  };

  const handlePackAssign = () => {
    toast.success("Pack assigned successfully!");
    setShowPackDialog(false);
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
                  <span className="text-gray-900 font-medium">Students</span>
                </div>

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Students Management</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Manage students, packs, and performance
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import CSV
                    </Button>
                    <Button onClick={() => setShowAddDialog(true)} className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Student
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
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${getIconColor(stat.color)}`} />
                            </div>
                            <div>
                              <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{stat.label}</div>
                              <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</div>
                              <div className="text-[10px] sm:text-xs text-green-600">{stat.change}</div>
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
                          placeholder="Search students..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 input-field"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                        <Select value={batchFilter} onValueChange={setBatchFilter}>
                          <SelectTrigger className="w-full sm:w-[150px] input-field">
                            <SelectValue placeholder="Batch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            <SelectItem value="JEE Batch A">JEE Batch A</SelectItem>
                            <SelectItem value="JEE Batch B">JEE Batch B</SelectItem>
                            <SelectItem value="NEET Batch">NEET Batch</SelectItem>
                            <SelectItem value="SSC GD Batch">SSC GD Batch</SelectItem>
                            <SelectItem value="Foundation Batch">Foundation Batch</SelectItem>
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
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={packFilter} onValueChange={setPackFilter}>
                          <SelectTrigger className="w-full sm:w-[150px] input-field">
                            <SelectValue placeholder="Pack" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Packs</SelectItem>
                            <SelectItem value="gold">Gold Packs</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="none">No Pack</SelectItem>
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

                {/* Students Table */}
                <Card>
                  <CardContent className="p-0">
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-gray-100">
                      {filteredStudents.map((student) => (
                        <div key={student.id} className="p-4 space-y-3 hover:bg-orange-50 cursor-pointer" onClick={() => handleViewStudent(student)}>
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                                {student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900">{student.name}</div>
                                {student.streak > 0 && (
                                  <span className="flex items-center text-xs text-orange-600">
                                    <Flame className="w-3 h-3 mr-0.5" />
                                    {student.streak}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{student.email}</div>
                              <div className="text-xs text-gray-400 font-mono mt-0.5">{student.id}</div>
                            </div>
                            <StatusBadge status={student.status} />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {student.packs.length > 0 ? (
                              student.packs.slice(0, 2).map((pack) => (
                                <PackBadge key={pack} pack={pack} />
                              ))
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-gray-400">No Pack</Badge>
                            )}
                            {student.packs.length > 2 && (
                              <Badge variant="outline" className="text-[10px]">+{student.packs.length - 2}</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{student.batch}</span>
                            <span>{student.testsTaken} tests · {student.avgScore}% avg</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 h-8" onClick={(e) => { e.stopPropagation(); handleAssignPack(student); }}>
                              <Crown className="w-3 h-3 mr-1" />
                              Assign Pack
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Batch / Target</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Packs</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Tests</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Avg Score</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Streak</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id} className="hover:bg-orange-50 cursor-pointer" onClick={() => handleViewStudent(student)}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-9 h-9">
                                    <AvatarFallback className="bg-orange-100 text-orange-600 text-sm font-medium">
                                      {student.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.email}</div>
                                    <div className="text-xs text-gray-400 font-mono">{student.id}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-gray-900 text-sm">{student.batch}</div>
                                <div className="text-xs text-gray-500">{student.target}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {student.packs.length > 0 ? (
                                    student.packs.slice(0, 2).map((pack) => (
                                      <PackBadge key={pack} pack={pack} />
                                    ))
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-gray-400">No Pack</Badge>
                                  )}
                                  {student.packs.length > 2 && (
                                    <Badge variant="outline" className="text-[10px]">+{student.packs.length - 2}</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="font-medium">{student.testsTaken}</div>
                                <div className="text-xs text-gray-500">tests</div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className={cn(
                                  "font-medium",
                                  student.avgScore >= 80 ? "text-green-600" :
                                  student.avgScore >= 60 ? "text-orange-600" : "text-red-600"
                                )}>
                                  {student.avgScore}%
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {student.streak > 0 ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium text-orange-600">{student.streak}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={student.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="outline" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); handleAssignPack(student); }}>
                                    <Crown className="w-3 h-3 mr-1" />
                                    Pack
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                                        <Eye className="w-4 h-4 mr-2" /> View Profile
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Edit className="w-4 h-4 mr-2" /> Edit Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileText className="w-4 h-4 mr-2" /> View Results
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Mail className="w-4 h-4 mr-2" /> Send Notification
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <CreditCard className="w-4 h-4 mr-2" /> Manage Fee
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Suspend
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-gray-500">
                    Showing {filteredStudents.length} of {studentsData.length} students
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </OrgContextBanner>
        </div>
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Step {addStep} of 3 — {addStep === 1 && "Basic Info"}
              {addStep === 2 && "Batch & Target"}
              {addStep === 3 && "Pack Assignment"}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex-1 h-1 rounded-full",
                  step <= addStep ? "bg-orange-500" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {addStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Enter student name" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="email@example.com" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+91 9876543210" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Class</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Class 10</SelectItem>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                    <SelectItem value="dropper">Dropper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Batch *</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jee-a">JEE Batch A</SelectItem>
                    <SelectItem value="jee-b">JEE Batch B</SelectItem>
                    <SelectItem value="neet">NEET Batch</SelectItem>
                    <SelectItem value="ssc">SSC GD Batch</SelectItem>
                    <SelectItem value="foundation">Foundation Batch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Exam</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jee-2026">JEE 2026</SelectItem>
                    <SelectItem value="jee-2027">JEE 2027</SelectItem>
                    <SelectItem value="neet-2026">NEET 2026</SelectItem>
                    <SelectItem value="neet-2027">NEET 2027</SelectItem>
                    <SelectItem value="ssc-gd">SSC GD 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Parent/Guardian Name</Label>
                <Input placeholder="Guardian name" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Parent Phone</Label>
                <Input placeholder="+91 9876543210" className="input-field" />
              </div>
            </div>
          )}

          {addStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Assign Pack (Optional)</Label>
                <div className="space-y-2">
                  {availablePacks.slice(0, 4).map((pack) => (
                    <div key={pack.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="accent-orange-500" />
                        <div>
                          <div className="font-medium text-sm">{pack.name}</div>
                          <div className="text-xs text-gray-500">{pack.duration}</div>
                        </div>
                      </div>
                      <div className="font-medium text-orange-600">₹{pack.price}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input value="STU-00XXX (auto-generated)" disabled className="input-field bg-gray-50" />
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Note:</strong> You can assign packs later from the student profile.
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
              <Button onClick={handleAddStudent} className="btn-primary w-full sm:w-auto">
                Add Student
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle>Student Profile</DialogTitle>
                <DialogDescription>
                  {selectedStudent.id} · {selectedStudent.batch}
                </DialogDescription>
              </DialogHeader>

              {/* Student Header */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-orange-500 text-white text-xl font-semibold">
                    {selectedStudent.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h3>
                    <StatusBadge status={selectedStudent.status} />
                    {selectedStudent.streak > 0 && (
                      <Badge className="bg-orange-100 text-orange-700 text-xs">
                        <Flame className="w-3 h-3 mr-1" />
                        {selectedStudent.streak} day streak
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{selectedStudent.email}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedStudent.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {selectedStudent.joined}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600">{selectedStudent.testsTaken}</div>
                  <div className="text-xs text-gray-600">Tests</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-600">{selectedStudent.avgScore}%</div>
                  <div className="text-xs text-gray-600">Avg Score</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-purple-600">{selectedStudent.aiPoints}</div>
                  <div className="text-xs text-gray-600">AI Points</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-orange-600">{selectedStudent.totalPoints}</div>
                  <div className="text-xs text-gray-600">Total Points</div>
                </div>
              </div>

              <Tabs defaultValue="packs" className="w-full">
                <TabsList className="bg-gray-100 rounded-lg p-1 w-full grid grid-cols-3">
                  <TabsTrigger value="packs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Packs</TabsTrigger>
                  <TabsTrigger value="tests" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Tests</TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="packs" className="mt-4 space-y-3">
                  {selectedStudent.packs.length > 0 ? (
                    selectedStudent.packs.map((pack, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{pack}</div>
                            <div className="text-xs text-gray-500">Monthly subscription · Active</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">Expires Mar 31</div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">Extend</Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Crown className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p>No packs assigned</p>
                      <Button size="sm" className="mt-2 btn-primary" onClick={() => { setShowDetailsDialog(false); setShowPackDialog(true); }}>
                        Assign Pack
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tests" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    {[
                      { name: "JEE Full Mock #12", score: 285, total: 360, rank: 45 },
                      { name: "Physics Chapter Test", score: 42, total: 50, rank: 12 },
                      { name: "Chemistry Unit Test", score: 78, total: 100, rank: 28 },
                    ].map((test, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{test.name}</div>
                          <div className="text-xs text-gray-500">Rank: #{test.rank}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{test.score}/{test.total}</div>
                          <div className="text-xs text-green-600">{Math.round((test.score / test.total) * 100)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    {[
                      { action: "Completed JEE Full Mock #12", time: "2 hours ago", icon: CheckCircle2 },
                      { action: "Achieved 10-day streak", time: "1 day ago", icon: Trophy },
                      { action: "Started Daily Practice", time: "1 day ago", icon: Target },
                      { action: "Earned 50 AI Points", time: "2 days ago", icon: Zap },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <activity.icon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{activity.action}</div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="w-full sm:w-auto">
                  Close
                </Button>
                <Button className="btn-primary w-full sm:w-auto" onClick={() => handleAssignPack(selectedStudent)}>
                  <Crown className="w-4 h-4 mr-2" />
                  Assign Pack
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Pack Dialog */}
      <Dialog open={showPackDialog} onOpenChange={setShowPackDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Pack</DialogTitle>
            <DialogDescription>
              {selectedStudent?.name} ({selectedStudent?.id})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Pack(s) to Assign</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availablePacks.map((pack) => (
                  <div key={pack.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="accent-orange-500" />
                      <div>
                        <div className="font-medium text-sm">{pack.name}</div>
                        <div className="text-xs text-gray-500">{pack.duration}</div>
                      </div>
                    </div>
                    <div className="font-medium text-orange-600">₹{pack.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select defaultValue="1month">
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">Payment Mode</div>
                <div className="text-xs text-gray-500">How was this pack purchased?</div>
              </div>
              <Select defaultValue="admin">
                <SelectTrigger className="w-[140px] input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Assigned</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="inapp">In-App Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-bold text-orange-600">₹0 (Free Assignment)</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePackAssign} className="btn-primary">
              Assign Pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrgSidebarProvider>
  );
}
