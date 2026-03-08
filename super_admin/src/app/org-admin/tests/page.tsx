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
  Calendar,
  Users,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { OrgContextBanner } from "@/components/org-admin/OrgContextBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock tests data
const testsData = [
  {
    id: "TEST-001",
    name: "SSC GD Full Mock Test",
    type: "Mock Test",
    schedule: "Mar 5, 2026 · 10:00 AM",
    duration: 120,
    batches: ["All Batches"],
    studentsEnrolled: 245,
    status: "scheduled",
    resultsPublished: false,
  },
  {
    id: "TEST-002",
    name: "Physics Unit Test",
    type: "Unit Test",
    schedule: "Mar 7, 2026 · 2:00 PM",
    duration: 60,
    batches: ["Batch A"],
    studentsEnrolled: 45,
    status: "scheduled",
    resultsPublished: false,
  },
  {
    id: "TEST-003",
    name: "Mock #11 - SSC GD",
    type: "Mock Test",
    schedule: "Feb 28, 2026 · Completed",
    duration: 120,
    batches: ["All Batches"],
    studentsEnrolled: 230,
    status: "completed",
    resultsPublished: true,
  },
  {
    id: "TEST-004",
    name: "Chemistry Mid-Term",
    type: "Practice Set",
    schedule: "Mar 10, 2026 · 11:00 AM",
    duration: 90,
    batches: ["Batch B"],
    studentsEnrolled: 38,
    status: "scheduled",
    resultsPublished: false,
  },
  {
    id: "TEST-005",
    name: "Math Speed Test",
    type: "Unit Test",
    schedule: "Feb 25, 2026 · Completed",
    duration: 30,
    batches: ["Batch A", "Batch B"],
    studentsEnrolled: 83,
    status: "completed",
    resultsPublished: false,
  },
];

// Stats
const stats = [
  { label: "Total Tests", value: 24, icon: FileText, color: "blue" },
  { label: "Scheduled", value: 12, icon: Calendar, color: "orange" },
  { label: "Completed", value: 10, icon: CheckCircle2, color: "green" },
  { label: "Results Pending", value: 2, icon: Clock, color: "yellow" },
];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    scheduled: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
    live: { label: "Live", className: "bg-red-50 text-red-700 border-red-200" },
    completed: { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" },
    draft: { label: "Draft", className: "bg-gray-50 text-gray-700 border-gray-200" },
  };

  const { label, className } = config[status] || config.draft;

  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", className)}>
      {label}
    </Badge>
  );
}

// Type Badge
function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { className: string }> = {
    "Mock Test": { className: "bg-purple-50 text-purple-700" },
    "Unit Test": { className: "bg-blue-50 text-blue-700" },
    "Practice Set": { className: "bg-green-50 text-green-700" },
  };

  const { className } = config[type] || config["Unit Test"];

  return <Badge className={cn("text-[10px]", className)}>{type}</Badge>;
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    yellow: "bg-yellow-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
  };
  return colors[color] || "text-gray-600";
};

export default function TestsPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all";

  // Filter tests
  const filteredTests = testsData.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    const matchesType = typeFilter === "all" || test.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateTest = () => {
    toast.success("Test created successfully!");
    setShowCreateDialog(false);
    setCreateStep(1);
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
                  <span className="text-gray-900 font-medium">Tests & Exams</span>
                </div>

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Tests & Exams</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Manage all tests and mock exams
                    </p>
                  </div>
                  <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Test
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
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 input-field"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[130px] input-field">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[130px] input-field">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Mock Test">Mock Test</SelectItem>
                          <SelectItem value="Unit Test">Unit Test</SelectItem>
                          <SelectItem value="Practice Set">Practice Set</SelectItem>
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

              {/* Tests Table */}
              <Card>
                <CardContent className="p-0">
                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {filteredTests.map((test) => (
                      <div key={test.id} className="p-4 space-y-3 hover:bg-orange-50 cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{test.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{test.id}</div>
                          </div>
                          <StatusBadge status={test.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <TypeBadge type={test.type} />
                          <Badge variant="outline" className="text-[10px]">{test.duration} min</Badge>
                        </div>
                        <div className="text-sm text-gray-600">{test.schedule}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{test.studentsEnrolled} enrolled</span>
                          <div className="flex gap-2">
                            {test.status === "completed" && (
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                Results
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Test</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Schedule</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Duration</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Students</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTests.map((test) => (
                          <TableRow key={test.id} className="hover:bg-orange-50 cursor-pointer">
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{test.name}</div>
                                <div className="text-xs text-gray-500">{test.batches.join(", ")}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <TypeBadge type={test.type} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{test.schedule}</TableCell>
                            <TableCell className="text-sm">{test.duration} min</TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">{test.studentsEnrolled}</span>
                              <span className="text-xs text-gray-500"> enrolled</span>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={test.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {test.status === "completed" && (
                                  <Button variant="outline" size="sm" className="h-8">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Results
                                  </Button>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="w-4 h-4 mr-2" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" /> Edit Test
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Users className="w-4 h-4 mr-2" /> View Students
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
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
                  Showing {filteredTests.length} of {testsData.length} tests
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

      {/* Create Test Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
            <DialogDescription>
              Step {createStep} of 4 — {createStep === 1 && "Basic Details"}
              {createStep === 2 && "Questions"}
              {createStep === 3 && "Schedule & Access"}
              {createStep === 4 && "Settings"}
            </DialogDescription>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex-1 h-1 rounded-full",
                  step <= createStep ? "bg-orange-500" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {createStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Test Name *</Label>
                <Input placeholder="e.g., SSC GD Full Mock Test #12" className="input-field" />
              </div>
              <div className="space-y-2">
                <Label>Test Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Mock Test", "Unit Test", "Practice Set"].map((type) => (
                    <Button key={type} variant="outline" className="h-auto py-3 flex-col">
                      <span className="text-sm">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea placeholder="Brief description of the test..." className="input-field" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea 
                  placeholder="Read carefully, no negative marking..." 
                  className="input-field" 
                  rows={3} 
                />
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Question Source *</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <FileText className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">From Q-Bank</div>
                      <div className="text-xs text-gray-500">Select question sets from your bank</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3">
                    <FileText className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">From PDF Extract</div>
                      <div className="text-xs text-gray-500">Use extracted questions from PDF</div>
                    </div>
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium mb-2">Selected Sets</div>
                <div className="text-sm text-gray-500">
                  No sets selected yet. Click above to add.
                </div>
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Assign To *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="h-auto py-3">All Students</Button>
                  <Button variant="outline" className="h-auto py-3">Specific Batches</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Schedule Date</Label>
                  <Input type="date" className="input-field" />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" className="input-field" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" placeholder="120" className="input-field" />
              </div>
            </div>
          )}

          {createStep === 4 && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Negative Marking</div>
                  <div className="text-xs text-gray-500">Deduct marks for wrong answers</div>
                </div>
                <Select defaultValue="no">
                  <SelectTrigger className="w-24 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="0.25">-0.25</SelectItem>
                    <SelectItem value="0.5">-0.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Shuffle Questions</div>
                  <div className="text-xs text-gray-500">Randomize question order</div>
                </div>
                <Select defaultValue="yes">
                  <SelectTrigger className="w-24 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">Result Release</div>
                  <div className="text-xs text-gray-500">When to show results</div>
                </div>
                <Select defaultValue="auto">
                  <SelectTrigger className="w-32 input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Attempts Allowed</Label>
                <Input type="number" defaultValue="1" className="input-field" />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {createStep > 1 && (
              <Button variant="outline" onClick={() => setCreateStep(createStep - 1)} className="w-full sm:w-auto">
                Back
              </Button>
            )}
            {createStep < 4 ? (
              <Button onClick={() => setCreateStep(createStep + 1)} className="btn-primary w-full sm:w-auto">
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateTest} className="btn-primary w-full sm:w-auto">
                Create & Schedule Test
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrgSidebarProvider>
  );
}
