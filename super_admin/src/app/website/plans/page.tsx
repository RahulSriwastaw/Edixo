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
  Copy,
  Archive,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Crown,
  Star,
  Sparkles,
  BookOpen,
  Target,
  Trophy,
  Clock,
  Users,
  Check,
  Globe,
  IndianRupee,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  GripVertical,
  Minus,
  Tag,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types
interface PricingPlan {
  id: string;
  durationType: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  duration: number;
  price: number;
  originalPrice: number;
  label: string;
  isDefault: boolean;
}

interface PackFeature {
  id: string;
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  badge?: string;
  color: string;
  icon: string;
  thumbnail?: string;
  features: PackFeature[];
  aiPoints: number;
  mockTests: string;
  dailyQuestions: number;
  studyPlan: boolean;
  analytics: "none" | "basic" | "advanced";
  aiSolver: boolean;
  certificate: boolean;
  prioritySupport: boolean;
  pricingPlans: PricingPlan[];
  examCategories: string[];
  trialDays: number;
  status: "active" | "draft" | "archived";
  isPopular: boolean;
  sortOrder: number;
  subscribers: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

// Mock plans data
const plansData: Plan[] = [
  {
    id: "plan-001",
    name: "JEE Silver Pack",
    slug: "jee-silver",
    description: "Perfect for beginners starting their JEE preparation journey with essential mock tests and practice questions.",
    shortDescription: "Essential JEE prep for beginners",
    badge: null,
    color: "gray",
    icon: "star",
    features: [
      { id: "f1", text: "100+ Mock Tests", included: true },
      { id: "f2", text: "Chapter-wise Tests", included: true },
      { id: "f3", text: "Daily Practice Questions", included: true },
      { id: "f4", text: "Basic Performance Analytics", included: true },
      { id: "f5", text: "50 AI Points/month", included: true },
      { id: "f6", text: "PYQ Papers", included: false },
      { id: "f7", text: "AI Doubt Solver", included: false },
    ],
    aiPoints: 50,
    mockTests: "100+",
    dailyQuestions: 10,
    studyPlan: false,
    analytics: "none",
    aiSolver: false,
    certificate: false,
    prioritySupport: false,
    pricingPlans: [
      { id: "p1", durationType: "monthly", duration: 1, price: 299, originalPrice: 399, label: "", isDefault: false },
      { id: "p2", durationType: "yearly", duration: 1, price: 2499, originalPrice: 4788, label: "Best Value", isDefault: true },
    ],
    examCategories: ["JEE Main", "JEE Advanced"],
    trialDays: 3,
    status: "active",
    isPopular: false,
    sortOrder: 1,
    subscribers: 1234,
    revenue: 245000,
    createdAt: "2026-01-15",
    updatedAt: "2026-03-01",
  },
  {
    id: "plan-002",
    name: "JEE Gold Pack",
    slug: "jee-gold",
    description: "Complete JEE preparation with AI-powered features for serious aspirants aiming for top ranks.",
    shortDescription: "Complete JEE prep with AI features",
    badge: "Most Popular",
    color: "amber",
    icon: "zap",
    features: [
      { id: "f1", text: "500+ Mock Tests", included: true },
      { id: "f2", text: "All Chapter Tests", included: true },
      { id: "f3", text: "PYQ Papers (2015-2024)", included: true },
      { id: "f4", text: "90-Day Study Plan", included: true },
      { id: "f5", text: "AI Performance Analysis", included: true },
      { id: "f6", text: "AI Doubt Solver", included: true },
      { id: "f7", text: "200 AI Points/month", included: true },
    ],
    aiPoints: 200,
    mockTests: "500+",
    dailyQuestions: 20,
    studyPlan: true,
    analytics: "basic",
    aiSolver: true,
    certificate: false,
    prioritySupport: false,
    pricingPlans: [
      { id: "p1", durationType: "monthly", duration: 1, price: 599, originalPrice: 799, label: "", isDefault: false },
      { id: "p2", durationType: "yearly", duration: 1, price: 4999, originalPrice: 9588, label: "Best Value", isDefault: true },
    ],
    examCategories: ["JEE Main", "JEE Advanced"],
    trialDays: 3,
    status: "active",
    isPopular: true,
    sortOrder: 2,
    subscribers: 3456,
    revenue: 1250000,
    createdAt: "2026-01-15",
    updatedAt: "2026-03-01",
  },
  {
    id: "plan-003",
    name: "JEE Platinum Pack",
    slug: "jee-platinum",
    description: "Ultimate JEE preparation with unlimited access and premium features for top rankers.",
    shortDescription: "Ultimate JEE prep with all features",
    badge: "Premium",
    color: "purple",
    icon: "crown",
    features: [
      { id: "f1", text: "1000+ Mock Tests", included: true },
      { id: "f2", text: "All Test Types", included: true },
      { id: "f3", text: "All PYQ Papers", included: true },
      { id: "f4", text: "Custom Study Plans", included: true },
      { id: "f5", text: "Advanced Analytics Dashboard", included: true },
      { id: "f6", text: "Unlimited AI Doubt Solver", included: true },
      { id: "f7", text: "500 AI Points/month", included: true },
      { id: "f8", text: "Certificate Generation", included: true },
      { id: "f9", text: "Priority Support", included: true },
    ],
    aiPoints: 500,
    mockTests: "1000+",
    dailyQuestions: 30,
    studyPlan: true,
    analytics: "advanced",
    aiSolver: true,
    certificate: true,
    prioritySupport: true,
    pricingPlans: [
      { id: "p1", durationType: "monthly", duration: 1, price: 999, originalPrice: 1299, label: "", isDefault: false },
      { id: "p2", durationType: "yearly", duration: 1, price: 7999, originalPrice: 15588, label: "Best Value", isDefault: true },
    ],
    examCategories: ["JEE Main", "JEE Advanced"],
    trialDays: 3,
    status: "active",
    isPopular: false,
    sortOrder: 3,
    subscribers: 890,
    revenue: 890000,
    createdAt: "2026-01-15",
    updatedAt: "2026-03-01",
  },
  {
    id: "plan-004",
    name: "NEET Gold Pack",
    slug: "neet-gold",
    description: "Complete NEET preparation with biology, chemistry, and physics coverage.",
    shortDescription: "Complete NEET prep with AI",
    badge: "Popular",
    color: "green",
    icon: "zap",
    features: [
      { id: "f1", text: "400+ Mock Tests", included: true },
      { id: "f2", text: "NCERT Based Questions", included: true },
      { id: "f3", text: "Biology Special Tests", included: true },
      { id: "f4", text: "AI Analysis", included: true },
      { id: "f5", text: "150 AI Points/month", included: true },
    ],
    aiPoints: 150,
    mockTests: "400+",
    dailyQuestions: 20,
    studyPlan: true,
    analytics: "basic",
    aiSolver: true,
    certificate: false,
    prioritySupport: false,
    pricingPlans: [
      { id: "p1", durationType: "monthly", duration: 1, price: 499, originalPrice: 699, label: "", isDefault: true },
      { id: "p2", durationType: "yearly", duration: 1, price: 3999, originalPrice: 8388, label: "Best Value", isDefault: false },
    ],
    examCategories: ["NEET UG"],
    trialDays: 3,
    status: "active",
    isPopular: false,
    sortOrder: 4,
    subscribers: 2100,
    revenue: 780000,
    createdAt: "2026-02-01",
    updatedAt: "2026-03-01",
  },
  {
    id: "plan-005",
    name: "SSC GD Complete",
    slug: "ssc-gd-complete",
    description: "Complete SSC GD preparation with reasoning, math, GK, and language tests.",
    shortDescription: "Complete SSC GD prep",
    badge: null,
    color: "blue",
    icon: "target",
    features: [
      { id: "f1", text: "200+ Mock Tests", included: true },
      { id: "f2", text: "All Subjects Covered", included: true },
      { id: "f3", text: "Hindi & English Medium", included: true },
      { id: "f4", text: "100 AI Points/month", included: true },
    ],
    aiPoints: 100,
    mockTests: "200+",
    dailyQuestions: 15,
    studyPlan: true,
    analytics: "basic",
    aiSolver: true,
    certificate: false,
    prioritySupport: false,
    pricingPlans: [
      { id: "p1", durationType: "monthly", duration: 1, price: 399, originalPrice: 499, label: "", isDefault: true },
    ],
    examCategories: ["SSC GD"],
    trialDays: 3,
    status: "active",
    isPopular: false,
    sortOrder: 5,
    subscribers: 1567,
    revenue: 450000,
    createdAt: "2026-02-15",
    updatedAt: "2026-03-01",
  },
  {
    id: "plan-006",
    name: "UPSC Prelims Pack",
    slug: "upsc-prelims",
    description: "Comprehensive UPSC Civil Services Prelims preparation.",
    shortDescription: "UPSC Prelims complete prep",
    badge: "New",
    color: "red",
    icon: "book-open",
    features: [
      { id: "f1", text: "300+ Mock Tests", included: true },
      { id: "f2", text: "CSAT Practice", included: true },
      { id: "f3", text: "Current Affairs Tests", included: true },
      { id: "f4", text: "200 AI Points/month", included: true },
    ],
    aiPoints: 200,
    mockTests: "300+",
    dailyQuestions: 25,
    studyPlan: true,
    analytics: "advanced",
    aiSolver: true,
    certificate: true,
    prioritySupport: false,
    pricingPlans: [
      { id: "p1", durationType: "monthly", duration: 1, price: 799, originalPrice: 999, label: "", isDefault: true },
    ],
    examCategories: ["UPSC CSE"],
    trialDays: 3,
    status: "draft",
    isPopular: false,
    sortOrder: 6,
    subscribers: 0,
    revenue: 0,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
  },
];

// Stats
const stats = [
  { label: "Total Plans", value: 6, icon: Target, color: "blue" },
  { label: "Active Plans", value: 5, icon: Check, color: "green" },
  { label: "Total Subscribers", value: "9.2K", icon: Users, color: "orange" },
  { label: "Monthly Revenue", value: "₹36.2L", icon: IndianRupee, color: "purple" },
];

// Color options
const colorOptions = [
  { value: "gray", label: "Gray", class: "bg-gray-100 text-gray-700" },
  { value: "amber", label: "Amber", class: "bg-amber-100 text-amber-700" },
  { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-700" },
  { value: "green", label: "Green", class: "bg-green-100 text-green-700" },
  { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-700" },
  { value: "red", label: "Red", class: "bg-red-100 text-red-700" },
  { value: "orange", label: "Orange", class: "bg-orange-100 text-orange-700" },
  { value: "teal", label: "Teal", class: "bg-teal-100 text-teal-700" },
];

// Icon options
const iconOptions = [
  { value: "star", label: "Star", icon: Star },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "crown", label: "Crown", icon: Crown },
  { value: "target", label: "Target", icon: Target },
  { value: "book-open", label: "Book", icon: BookOpen },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
  { value: "trophy", label: "Trophy", icon: Trophy },
];

// Exam categories
const examCategoryOptions = [
  "JEE Main",
  "JEE Advanced",
  "NEET UG",
  "SSC GD",
  "SSC CGL",
  "SSC CHSL",
  "IBPS PO",
  "SBI Clerk",
  "UPSC CSE",
  "GATE",
  "CAT",
];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-50 text-green-700 border-green-200" },
    draft: { label: "Draft", className: "bg-gray-50 text-gray-600 border-gray-200" },
    archived: { label: "Archived", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  };

  const { label, className } = config[status] || config.draft;

  return (
    <Badge variant="outline" className={cn("text-[10px]", className)}>
      {status === "active" && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />}
      {label}
    </Badge>
  );
}

// Color Badge
function ColorBadge({ color }: { color: string }) {
  const colorConfig = colorOptions.find(c => c.value === color) || colorOptions[0];
  return (
    <Badge className={cn("text-[10px]", colorConfig.class)}>
      {colorConfig.label}
    </Badge>
  );
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
    gray: "bg-gray-50",
    amber: "bg-amber-50",
    red: "bg-red-50",
    teal: "bg-teal-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    gray: "text-gray-600",
    amber: "text-amber-600",
    red: "text-red-600",
    teal: "text-teal-600",
  };
  return colors[color] || "text-gray-600";
};

const getIconComponent = (iconName: string) => {
  const icon = iconOptions.find(i => i.value === iconName);
  return icon ? icon.icon : Star;
};

export default function PlansManagementPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewSheet, setShowPreviewSheet] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    badge: "",
    color: "amber",
    icon: "zap",
    aiPoints: 100,
    mockTests: "100+",
    dailyQuestions: 15,
    studyPlan: true,
    analytics: "basic" as "none" | "basic" | "advanced",
    aiSolver: true,
    certificate: false,
    prioritySupport: false,
    trialDays: 3,
    isPopular: false,
    examCategories: [] as string[],
    features: [
      { id: "f1", text: "", included: true },
    ] as PackFeature[],
    pricingPlans: [
      { id: "p1", durationType: "monthly" as const, duration: 1, price: 0, originalPrice: 0, label: "", isDefault: true },
    ] as PricingPlan[],
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || categoryFilter !== "all";

  // Filter plans
  const filteredPlans = plansData.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || plan.examCategories.includes(categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreatePlan = () => {
    setEditMode(false);
    setFormData({
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      badge: "",
      color: "amber",
      icon: "zap",
      aiPoints: 100,
      mockTests: "100+",
      dailyQuestions: 15,
      studyPlan: true,
      analytics: "basic",
      aiSolver: true,
      certificate: false,
      prioritySupport: false,
      trialDays: 3,
      isPopular: false,
      examCategories: [],
      features: [{ id: "f1", text: "", included: true }],
      pricingPlans: [{ id: "p1", durationType: "monthly", duration: 1, price: 0, originalPrice: 0, label: "", isDefault: true }],
    });
    setShowCreateDialog(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditMode(true);
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      shortDescription: plan.shortDescription,
      description: plan.description,
      badge: plan.badge || "",
      color: plan.color,
      icon: plan.icon,
      aiPoints: plan.aiPoints,
      mockTests: plan.mockTests,
      dailyQuestions: plan.dailyQuestions,
      studyPlan: plan.studyPlan,
      analytics: plan.analytics,
      aiSolver: plan.aiSolver,
      certificate: plan.certificate,
      prioritySupport: plan.prioritySupport,
      trialDays: plan.trialDays,
      isPopular: plan.isPopular,
      examCategories: plan.examCategories,
      features: plan.features,
      pricingPlans: plan.pricingPlans,
    });
    setShowCreateDialog(true);
  };

  const handlePreview = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPreviewSheet(true);
  };

  const handleDuplicate = (plan: Plan) => {
    toast.success(`Plan "${plan.name}" duplicated! You can now edit the copy.`);
  };

  const handleSavePlan = () => {
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    toast.success(editMode ? "Plan updated successfully!" : "Plan created successfully!");
    setShowCreateDialog(false);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { id: `f${Date.now()}`, text: "", included: true }],
    });
  };

  const removeFeature = (id: string) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f.id !== id),
    });
  };

  const updateFeature = (id: string, text: string) => {
    setFormData({
      ...formData,
      features: formData.features.map(f => f.id === id ? { ...f, text } : f),
    });
  };

  const addPricingPlan = () => {
    setFormData({
      ...formData,
      pricingPlans: [...formData.pricingPlans, {
        id: `p${Date.now()}`,
        durationType: "monthly",
        duration: 1,
        price: 0,
        originalPrice: 0,
        label: "",
        isDefault: false,
      }],
    });
  };

  const removePricingPlan = (id: string) => {
    if (formData.pricingPlans.length <= 1) return;
    setFormData({
      ...formData,
      pricingPlans: formData.pricingPlans.filter(p => p.id !== id),
    });
  };

  const updatePricingPlan = (id: string, field: keyof PricingPlan, value: string | number | boolean) => {
    setFormData({
      ...formData,
      pricingPlans: formData.pricingPlans.map(p => p.id === id ? { ...p, [field]: value } : p),
    });
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/website" className="hover:text-orange-600">Public Website CMS</Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">Plans & Packs</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plans & Packs Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Create and manage subscription plans for public website
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleCreatePlan} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {stat.label}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </div>
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
                      placeholder="Search plans..."
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {examCategoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plans Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase w-[60px]">Order</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Pricing</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">AI Points</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Subscribers</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Revenue</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => {
                      const IconComponent = getIconComponent(plan.icon);
                      return (
                        <TableRow key={plan.id} className="hover:bg-orange-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                              <span className="text-sm text-gray-500">{plan.sortOrder}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${getIconBgColor(plan.color)} flex items-center justify-center`}>
                                <IconComponent className={`w-5 h-5 ${getIconColor(plan.color)}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{plan.name}</span>
                                  {plan.isPopular && (
                                    <Badge className="bg-orange-100 text-orange-700 text-[10px]">Popular</Badge>
                                  )}
                                  {plan.badge && (
                                    <Badge className="bg-purple-100 text-purple-700 text-[10px]">{plan.badge}</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{plan.shortDescription}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {plan.pricingPlans.slice(0, 2).map((p, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">₹{p.price.toLocaleString()}</span>
                                  <span className="text-xs text-gray-500">/{p.durationType === "yearly" ? "yr" : "mo"}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-orange-600">
                              <Zap className="w-4 h-4" />
                              <span className="font-medium">{plan.aiPoints}</span>
                              <span className="text-xs text-gray-500">/mo</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{plan.subscribers.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              ₹{(plan.revenue / 100000).toFixed(1)}L
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={plan.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8" onClick={() => handlePreview(plan)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8" onClick={() => handleEditPlan(plan)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDuplicate(plan)}>
                                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePreview(plan)}>
                                    <Eye className="w-4 h-4 mr-2" /> Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {plan.status === "active" && (
                                    <DropdownMenuItem>
                                      <Archive className="w-4 h-4 mr-2" /> Archive
                                    </DropdownMenuItem>
                                  )}
                                  {plan.status === "archived" && (
                                    <DropdownMenuItem>
                                      <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Plan" : "Create New Plan"}</DialogTitle>
            <DialogDescription>
              Configure plan details, pricing, and features
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="bg-gray-100 rounded-lg p-1 w-full grid grid-cols-4">
              <TabsTrigger value="basic" className="text-xs">Basic Info</TabsTrigger>
              <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    placeholder="e.g., JEE Gold Pack"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    placeholder="auto-generated"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input-field font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input
                  placeholder="Brief description for cards"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea
                  placeholder="Detailed plan description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Badge (Optional)</Label>
                  <Input
                    placeholder="e.g., Most Popular"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-4 h-4 rounded", c.class)} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger className="input-field">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((i) => {
                        const IconComp = i.icon;
                        return (
                          <SelectItem key={i.value} value={i.value}>
                            <div className="flex items-center gap-2">
                              <IconComp className="w-4 h-4" />
                              {i.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Exam Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {examCategoryOptions.map((cat) => (
                    <Badge
                      key={cat}
                      variant={formData.examCategories.includes(cat) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        formData.examCategories.includes(cat) && "bg-orange-500 text-white"
                      )}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          examCategories: formData.examCategories.includes(cat)
                            ? formData.examCategories.filter(c => c !== cat)
                            : [...formData.examCategories, cat],
                        });
                      }}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mock Tests Count</Label>
                  <Input
                    placeholder="e.g., 500+"
                    value={formData.mockTests}
                    onChange={(e) => setFormData({ ...formData, mockTests: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <Label>AI Points / Month</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.aiPoints}
                    onChange={(e) => setFormData({ ...formData, aiPoints: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPopular}
                    onCheckedChange={(v) => setFormData({ ...formData, isPopular: v })}
                  />
                  <Label className="text-sm">Mark as Popular</Label>
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Plan Features</Label>
                <Button variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Feature
                </Button>
              </div>

              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <Check className={cn(
                      "w-4 h-4",
                      feature.included ? "text-green-500" : "text-gray-300"
                    )} />
                    <Input
                      placeholder={`Feature ${index + 1}`}
                      value={feature.text}
                      onChange={(e) => updateFeature(feature.id, e.target.value)}
                      className="input-field flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeFeature(feature.id)}
                      disabled={formData.features.length <= 1}
                    >
                      <Minus className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="mb-3 block">Additional Features</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Daily Questions</div>
                        <div className="text-xs text-gray-500">Questions per day</div>
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={formData.dailyQuestions}
                      onChange={(e) => setFormData({ ...formData, dailyQuestions: parseInt(e.target.value) || 0 })}
                      className="w-20 input-field"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Study Plans</div>
                        <div className="text-xs text-gray-500">Structured learning</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.studyPlan}
                      onCheckedChange={(v) => setFormData({ ...formData, studyPlan: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Analytics</div>
                        <div className="text-xs text-gray-500">Performance insights</div>
                      </div>
                    </div>
                    <Select value={formData.analytics} onValueChange={(v: "none" | "basic" | "advanced") => setFormData({ ...formData, analytics: v })}>
                      <SelectTrigger className="w-28 input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">AI Solver</div>
                        <div className="text-xs text-gray-500">Doubt solving</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.aiSolver}
                      onCheckedChange={(v) => setFormData({ ...formData, aiSolver: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Certificates</div>
                        <div className="text-xs text-gray-500">Course completion</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.certificate}
                      onCheckedChange={(v) => setFormData({ ...formData, certificate: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Priority Support</div>
                        <div className="text-xs text-gray-500">Dedicated help</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.prioritySupport}
                      onCheckedChange={(v) => setFormData({ ...formData, prioritySupport: v })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pricing Plans</Label>
                <Button variant="outline" size="sm" onClick={addPricingPlan}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Plan
                </Button>
              </div>

              <div className="space-y-3">
                {formData.pricingPlans.map((plan, index) => (
                  <Card key={plan.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm">Plan {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePricingPlan(plan.id)}
                          disabled={formData.pricingPlans.length <= 1}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Duration Type</Label>
                          <Select
                            value={plan.durationType}
                            onValueChange={(v) => updatePricingPlan(plan.id, "durationType", v)}
                          >
                            <SelectTrigger className="input-field h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Duration</Label>
                          <Input
                            type="number"
                            value={plan.duration}
                            onChange={(e) => updatePricingPlan(plan.id, "duration", parseInt(e.target.value) || 0)}
                            className="input-field h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price (₹)</Label>
                          <Input
                            type="number"
                            value={plan.price}
                            onChange={(e) => updatePricingPlan(plan.id, "price", parseInt(e.target.value) || 0)}
                            className="input-field h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Original (₹)</Label>
                          <Input
                            type="number"
                            value={plan.originalPrice}
                            onChange={(e) => updatePricingPlan(plan.id, "originalPrice", parseInt(e.target.value) || 0)}
                            className="input-field h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            placeholder="e.g., Best Value"
                            value={plan.label}
                            onChange={(e) => updatePricingPlan(plan.id, "label", e.target.value)}
                            className="input-field h-9"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Trial Period</div>
                        <div className="text-xs text-gray-500">Free trial days for new users</div>
                      </div>
                      <Input
                        type="number"
                        value={formData.trialDays}
                        onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                        className="w-20 input-field"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="font-medium">Purchase Methods</div>
                    <div className="space-y-2">
                      {["In-App Purchase", "Admin Assign", "Website Purchase"].map((method) => (
                        <label key={method} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="accent-orange-500" defaultChecked />
                          <span className="text-sm">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="font-medium">Thumbnail Image</div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Browse Files
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium mb-3">Status</div>
                    <Select defaultValue="draft">
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSavePlan} className="btn-primary">
              {editMode ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Sheet */}
      <Sheet open={showPreviewSheet} onOpenChange={setShowPreviewSheet}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Plan Preview</SheetTitle>
            <SheetDescription>
              How this plan appears on the public website
            </SheetDescription>
          </SheetHeader>

          {selectedPlan && (
            <div className="mt-6 space-y-4">
              {/* Preview Card */}
              <Card className="overflow-hidden border-2 border-orange-500">
                <div className={cn("h-2 bg-gradient-to-r", 
                  selectedPlan.color === "gray" ? "from-gray-100 to-gray-200" :
                  selectedPlan.color === "amber" ? "from-amber-50 to-yellow-100" :
                  selectedPlan.color === "purple" ? "from-purple-50 to-violet-100" :
                  selectedPlan.color === "green" ? "from-green-50 to-emerald-100" :
                  selectedPlan.color === "blue" ? "from-blue-50 to-cyan-100" :
                  "from-orange-50 to-red-100"
                )} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      getIconBgColor(selectedPlan.color)
                    )}>
                      {(() => {
                        const IconComp = getIconComponent(selectedPlan.icon);
                        return <IconComp className={cn("w-5 h-5", getIconColor(selectedPlan.color))} />;
                      })()}
                    </div>
                    <div className="flex items-center gap-1 text-orange-600">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold text-sm">{selectedPlan.aiPoints}</span>
                      <span className="text-xs text-gray-500">pts/mo</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedPlan.shortDescription}</p>

                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{selectedPlan.pricingPlans[0]?.price.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-sm">/month</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {selectedPlan.features.filter(f => f.included).slice(0, 5).map((feature) => (
                      <div key={feature.id} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white">
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>

              {/* Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Plan Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Status:</span>
                    <StatusBadge status={selectedPlan.status} />
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Subscribers:</span>
                    <span className="font-medium ml-1">{selectedPlan.subscribers.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-medium ml-1">₹{(selectedPlan.revenue / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Trial:</span>
                    <span className="font-medium ml-1">{selectedPlan.trialDays} days</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setShowPreviewSheet(false);
                  handleEditPlan(selectedPlan);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Plan
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    toast.success("Plan activated! Users can now subscribe.");
                    setShowPreviewSheet(false);
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
