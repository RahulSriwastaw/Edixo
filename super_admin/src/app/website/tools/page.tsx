"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Wrench,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Users,
  BarChart3,
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Mock tools data
const toolsData = [
  {
    id: 1,
    name: "JEE Rank Predictor",
    slug: "jee-rank-predictor",
    type: "Free",
    price: null,
    uses30d: 12450,
    revenue30d: null,
    status: "Active",
    description: "Predict your JEE rank based on expected scores",
    category: "Prediction",
  },
  {
    id: 2,
    name: "NEET Score Calculator",
    slug: "neet-score-calculator",
    type: "Free",
    price: null,
    uses30d: 8921,
    revenue30d: null,
    status: "Active",
    description: "Calculate your NEET score from answer key",
    category: "Calculator",
  },
  {
    id: 3,
    name: "AI Question Solver",
    slug: "ai-question-solver",
    type: "Paid",
    price: 99,
    uses30d: 2341,
    revenue30d: 231759,
    status: "Active",
    description: "Get AI-powered solutions to any question",
    category: "AI Tools",
  },
  {
    id: 4,
    name: "Study Planner Generator",
    slug: "study-planner",
    type: "Free",
    price: null,
    uses30d: 5672,
    revenue30d: null,
    status: "Active",
    description: "Generate personalized study plans",
    category: "Planning",
  },
  {
    id: 5,
    name: "Previous Year Paper Analysis",
    slug: "pyq-analysis",
    type: "Paid",
    price: 149,
    uses30d: 1892,
    revenue30d: 281908,
    status: "Active",
    description: "Deep analysis of PYQs with trends",
    category: "Analysis",
  },
  {
    id: 6,
    name: "College Predictor",
    slug: "college-predictor",
    type: "Free",
    price: null,
    uses30d: 3421,
    revenue30d: null,
    status: "Hidden",
    description: "Predict colleges based on rank",
    category: "Prediction",
  },
  {
    id: 7,
    name: "Formula Sheet Generator",
    slug: "formula-sheet",
    type: "Paid",
    price: 49,
    uses30d: 4231,
    revenue30d: 207319,
    status: "Active",
    description: "Generate custom formula sheets by topic",
    category: "Study Material",
  },
  {
    id: 8,
    name: "Doubt Resolver AI",
    slug: "doubt-resolver",
    type: "Paid",
    price: 199,
    uses30d: 892,
    revenue30d: 177108,
    status: "Active",
    description: "AI-powered doubt resolution with video explanations",
    category: "AI Tools",
  },
];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "badge-active",
    Hidden: "bg-[var(--bg-main)] text-[var(--text-secondary)]",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Type Badge
function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Free: "bg-green-50 text-green-700",
    Paid: "bg-purple-50 text-purple-700",
  };
  return <span className={`badge ${styles[type] || ""}`}>{type}</span>;
}

export default function ToolsManagementPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTool, setEditingTool] = useState<typeof toolsData[0] | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    type: "Free",
    price: "",
    category: "Prediction",
    status: "Active",
  });

  const filteredTools = toolsData.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || tool.type === typeFilter;
    const matchesStatus = statusFilter === "all" || tool.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingTool(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      type: "Free",
      price: "",
      category: "Prediction",
      status: "Active",
    });
    setShowAddDialog(true);
  };

  const handleEdit = (tool: typeof toolsData[0]) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      type: tool.type,
      price: tool.price?.toString() || "",
      category: tool.category,
      status: tool.status,
    });
    setShowAddDialog(true);
  };

  const handleSave = () => {
    toast.success(editingTool ? "Tool updated successfully" : "Tool created successfully");
    setShowAddDialog(false);
  };

  const handleToggleStatus = (tool: typeof toolsData[0]) => {
    const newStatus = tool.status === "Active" ? "Hidden" : "Active";
    toast.success(`${tool.name} is now ${newStatus}`);
  };

  // Calculate stats
  const totalUses = toolsData.reduce((sum, t) => sum + t.uses30d, 0);
  const totalRevenue = toolsData.reduce((sum, t) => sum + (t.revenue30d || 0), 0);
  const activeTools = toolsData.filter(t => t.status === "Active").length;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Link
                href="/website"
                className="p-2 hover:bg-[var(--bg-main)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tools Management</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  Manage free and paid tools for the public website
                </p>
              </div>
              <Button className="btn-primary" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tool
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Total Tools</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{toolsData.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Uses (30d)</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{(totalUses / 1000).toFixed(1)}K</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Revenue (30d)</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">₹{(totalRevenue / 100000).toFixed(1)}L</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-secondary)]">Active Tools</div>
                      <div className="text-xl font-bold text-[var(--text-primary)]">{activeTools}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <Input
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[120px] input-field">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("");
                        setTypeFilter("all");
                        setStatusFilter("all");
                      }}
                      className="btn-ghost"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tools Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--bg-main)]">
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Tool Name</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Type</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Price</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Uses (30d)</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Revenue (30d)</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTools.map((tool) => (
                      <TableRow key={tool.id} className="hover:bg-brand-primary-tint">
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{tool.name}</div>
                            <div className="text-xs text-[var(--text-secondary)] mono">/{tool.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TypeBadge type={tool.type} />
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-secondary)]">
                          {tool.price ? `₹${tool.price}` : "Free"}
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-primary)]">{tool.uses30d.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-[var(--text-primary)] font-medium">
                          {tool.revenue30d ? `₹${(tool.revenue30d / 1000).toFixed(1)}K` : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={tool.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleToggleStatus(tool)}
                            >
                              {tool.status === "Active" ? (
                                <ToggleRight className="w-5 h-5 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-[var(--text-muted)]" />
                              )}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(tool)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" /> View Usage
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <BarChart3 className="w-4 h-4 mr-2" /> Analytics
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add/Edit Tool Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
            <DialogDescription>
              Configure the tool settings and pricing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tool Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., JEE Rank Predictor"
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., jee-rank-predictor"
                className="input-field mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the tool"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prediction">Prediction</SelectItem>
                    <SelectItem value="Calculator">Calculator</SelectItem>
                    <SelectItem value="AI Tools">AI Tools</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Analysis">Analysis</SelectItem>
                    <SelectItem value="Study Material">Study Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === "Paid" && (
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="99"
                  className="input-field"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button className="btn-primary" onClick={handleSave}>
              {editingTool ? "Update Tool" : "Add Tool"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
