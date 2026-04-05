"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  Users,
  Gift,
  Flame,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  Mail,
  KeyRound,
  BarChart3,
  BookOpen,
  Clock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { MockBookOrgSwitcher } from "@/components/mockbook/MockBookOrgSwitcher";
import { MockBookOrgBanner, MockBookOrg } from "@/components/mockbook/MockBookOrgBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock students data
const studentsData = [
  {
    id: "STU-001",
    name: "Rahul Sharma",
    email: "rahul@email.com",
    phone: "+91 9876543210",
    class: "Class 12",
    target: "JEE 2026",
    packs: ["JEE Gold Pack", "JEE Platinum Pack"],
    testsTaken: 48,
    avgScore: 72,
    streak: 12,
    aiPoints: 245,
    status: "active",
    joined: "Jan 15, 2026",
    lastActive: "2 hours ago",
  },
  {
    id: "STU-002",
    name: "Priya Verma",
    email: "priya@email.com",
    phone: "+91 9876543211",
    class: "Class 12",
    target: "NEET 2026",
    packs: ["NEET Complete"],
    testsTaken: 32,
    avgScore: 78,
    streak: 5,
    aiPoints: 180,
    status: "active",
    joined: "Feb 1, 2026",
    lastActive: "1 day ago",
  },
  {
    id: "STU-003",
    name: "Amit Kumar",
    email: "amit@email.com",
    phone: "+91 9876543212",
    class: "Class 11",
    target: "JEE 2027",
    packs: ["JEE Gold Pack"],
    testsTaken: 15,
    avgScore: 65,
    streak: 0,
    aiPoints: 50,
    status: "active",
    joined: "Feb 10, 2026",
    lastActive: "5 days ago",
  },
  {
    id: "STU-004",
    name: "Sunita Patel",
    email: "sunita@email.com",
    phone: "+91 9876543213",
    class: "Class 12",
    target: "SSC GD",
    packs: ["SSC GD Special"],
    testsTaken: 8,
    avgScore: 82,
    streak: 3,
    aiPoints: 95,
    status: "active",
    joined: "Feb 15, 2026",
    lastActive: "3 hours ago",
  },
  {
    id: "STU-005",
    name: "Vikash Singh",
    email: "vikash@email.com",
    phone: "+91 9876543214",
    class: "Class 12",
    target: "JEE 2026",
    packs: [],
    testsTaken: 0,
    avgScore: 0,
    streak: 0,
    aiPoints: 0,
    status: "inactive",
    joined: "Jan 5, 2026",
    lastActive: "30 days ago",
  },
  {
    id: "STU-006",
    name: "Neha Gupta",
    email: "neha@email.com",
    phone: "+91 9876543215",
    class: "Class 12",
    target: "NEET 2026",
    packs: ["NEET Complete", "JEE Gold Pack"],
    testsTaken: 67,
    avgScore: 85,
    streak: 28,
    aiPoints: 520,
    status: "active",
    joined: "Dec 1, 2025",
    lastActive: "1 hour ago",
  },
];

// Stats
const stats = [
  { label: "Total Students", value: 847, icon: Users, color: "blue" },
  { label: "Active (30d)", value: 692, icon: CheckCircle2, color: "green" },
  { label: "With Packs", value: 634, icon: Gift, color: "purple" },
  { label: "Avg Score", value: "71%", icon: BarChart3, color: "orange" },
];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-50 text-green-700 border-green-200" },
    inactive: { label: "Inactive", className: "bg-gray-50 text-gray-600 border-gray-200" },
    suspended: { label: "Suspended", className: "bg-red-50 text-red-700 border-red-200" },
  };
  const { label, className } = config[status] || config.inactive;
  return <Badge variant="outline" className={cn("text-[10px]", className)}>{label}</Badge>;
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

export default function StudentsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  
  const [mounted, setMounted] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<MockBookOrg | null>(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [packFilter, setPackFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAssignPackDialog, setShowAssignPackDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<typeof studentsData[0] | null>(null);

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
    router.push(`/mockbook/org/${org.id}/students`);
  };

  const handleExitOrg = () => {
    setSelectedOrg(null);
    router.push("/mockbook");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPackFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || packFilter !== "all";

  // Filter students
  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesPack = packFilter === "all" || 
      (packFilter === "with_pack" && student.packs.length > 0) ||
      (packFilter === "no_pack" && student.packs.length === 0);
    return matchesSearch && matchesStatus && matchesPack;
  });

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
                <Link href={`/mockbook/org/${orgId}`} className="hover:text-orange-600">{selectedOrg.name}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium">Students</span>
              </div>

              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage students and their pack assignments
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="btn-secondary">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={packFilter} onValueChange={setPackFilter}>
                      <SelectTrigger className="w-[140px] input-field">
                        <SelectValue placeholder="Pack Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="with_pack">With Pack</SelectItem>
                        <SelectItem value="no_pack">No Pack</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasActiveFilters && (
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear
                      </Button>
                    )}
                    <Button variant="outline" className="ml-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
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
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Class / Target</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Packs</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Tests</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Score</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Streak</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id} className="hover:bg-orange-50">
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
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900">{student.class}</div>
                              <div className="text-xs text-gray-500">{student.target}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.packs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {student.packs.slice(0, 2).map((pack) => (
                                  <Badge key={pack} variant="outline" className="text-[10px]">
                                    {pack}
                                  </Badge>
                                ))}
                                {student.packs.length > 2 && (
                                  <Badge variant="outline" className="text-[10px]">
                                    +{student.packs.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">No pack</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-medium">{student.testsTaken}</TableCell>
                          <TableCell className="text-center">
                            <div>
                              <span className={cn(
                                "font-medium",
                                student.avgScore >= 75 ? "text-green-600" : 
                                student.avgScore >= 50 ? "text-yellow-600" : "text-red-600"
                              )}>
                                {student.avgScore}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {student.streak > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="font-medium text-orange-600">{student.streak}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={student.status} />
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
                                <DropdownMenuItem>
                                  <BarChart3 className="w-4 h-4 mr-2" /> View Results
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Gift className="w-4 h-4 mr-2" /> Manage Packs
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="w-4 h-4 mr-2" /> Suspend
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

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a student to {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input placeholder="Rahul" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input placeholder="Sharma" className="input-field" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="student@email.com" className="input-field" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+91 9876543210" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11">Class 11</SelectItem>
                    <SelectItem value="12">Class 12</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Exam</Label>
                <Select>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jee">JEE</SelectItem>
                    <SelectItem value="neet">NEET</SelectItem>
                    <SelectItem value="ssc">SSC</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign Pack (Optional)</Label>
              <Select>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="Select pack..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">JEE Gold Pack</SelectItem>
                  <SelectItem value="platinum">JEE Platinum Pack</SelectItem>
                  <SelectItem value="neet">NEET Complete</SelectItem>
                  <SelectItem value="ssc">SSC GD Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button className="btn-primary" onClick={() => {
              toast.success("Student added successfully!");
              setShowAddDialog(false);
            }}>
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
