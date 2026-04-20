"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Check,
  Trash2,
  Eye,
  X,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Server,
  CreditCard,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Mock alerts data
const alertsData = [
  {
    id: 1,
    type: "critical",
    category: "Billing",
    title: "Payment Overdue - Vision Academy",
    message: "Invoice INV-2026-012 is 15 days overdue. Amount: ₹40,000",
    org: { id: "GK-ORG-00138", name: "Vision Academy" },
    timestamp: "2026-03-01 10:30:00",
    status: "unread",
    actionRequired: true,
    action: "Send Reminder",
  },
  {
    id: 2,
    type: "critical",
    category: "Security",
    title: "Multiple Failed Login Attempts",
    message: "5 failed login attempts detected from IP 203.45.67.89 in last 10 minutes",
    org: null,
    timestamp: "2026-03-01 09:45:00",
    status: "unread",
    actionRequired: true,
    action: "Review",
  },
  {
    id: 3,
    type: "warning",
    category: "AI Quota",
    title: "AI Quota Exceeded - Success Classes",
    message: "Organization has used 100% of their monthly AI quota (500/500 credits)",
    org: { id: "GK-ORG-00139", name: "Success Classes" },
    timestamp: "2026-03-01 09:15:00",
    status: "unread",
    actionRequired: true,
    action: "Upgrade Plan",
  },
  {
    id: 4,
    type: "info",
    category: "System",
    title: "Scheduled Maintenance",
    message: "Platform maintenance scheduled for Mar 5, 2026 at 2:00 AM IST. Expected downtime: 30 minutes.",
    org: null,
    timestamp: "2026-02-28 18:00:00",
    status: "read",
    actionRequired: false,
    action: null,
  },
  {
    id: 5,
    type: "warning",
    category: "Storage",
    title: "Storage Limit Warning - Prime Tutorials",
    message: "Organization has used 85% of their storage quota (8.5GB/10GB)",
    org: { id: "GK-ORG-00137", name: "Prime Tutorials" },
    timestamp: "2026-02-28 15:30:00",
    status: "read",
    actionRequired: false,
    action: null,
  },
  {
    id: 6,
    type: "info",
    category: "Organization",
    title: "New Organization Onboarded",
    message: "New organization 'Knowledge Hub' has completed onboarding",
    org: { id: "GK-ORG-00143", name: "Knowledge Hub" },
    timestamp: "2026-02-28 14:00:00",
    status: "read",
    actionRequired: false,
    action: null,
  },
  {
    id: 7,
    type: "warning",
    category: "Trial",
    title: "Trial Expiring Soon - Excel Institute",
    message: "Trial period expires in 3 days. Convert to paid plan to retain access.",
    org: { id: "GK-ORG-00144", name: "Excel Institute" },
    timestamp: "2026-02-28 12:00:00",
    status: "unread",
    actionRequired: true,
    action: "Send Proposal",
  },
  {
    id: 8,
    type: "critical",
    category: "Compliance",
    title: "Content Flagged for Review",
    message: "3 questions from Apex Academy have been flagged for content policy review",
    org: { id: "GK-ORG-00142", name: "Apex Academy" },
    timestamp: "2026-02-27 16:45:00",
    status: "unread",
    actionRequired: true,
    action: "Review Content",
  },
];

// Stats data
const stats = [
  { label: "Unread Alerts", value: 3, icon: Bell, color: "orange" },
  { label: "Critical", value: 2, icon: AlertTriangle, color: "red" },
  { label: "Action Required", value: 4, icon: Zap, color: "yellow" },
  { label: "Resolved Today", value: 8, icon: CheckCircle, color: "green" },
];

// Alert Type Badge
function AlertTypeBadge({ type }: { type: string }) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    critical: { bg: "bg-red-50", text: "text-red-700", icon: <XCircle className="w-3 h-3" /> },
    warning: { bg: "bg-yellow-50", text: "text-yellow-700", icon: <AlertTriangle className="w-3 h-3" /> },
    info: { bg: "bg-blue-50", text: "text-blue-700", icon: <Info className="w-3 h-3" /> },
    success: { bg: "bg-green-50", text: "text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  };
  const style = styles[type] || styles.info;
  return (
    <span className={`badge ${style.bg} ${style.text} flex items-center gap-1`}>
      {style.icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// Category Badge
function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    Billing: "bg-green-50 text-green-700",
    Security: "bg-red-50 text-red-700",
    "AI Quota": "bg-purple-50 text-purple-700",
    System: "bg-blue-50 text-blue-700",
    Storage: "bg-cyan-50 text-cyan-700",
    Organization: "bg-indigo-50 text-indigo-700",
    Trial: "bg-orange-50 text-orange-700",
    Compliance: "bg-pink-50 text-pink-700",
  };
  return <span className={`badge ${styles[category] || "bg-gray-50 text-gray-600"}`}>{category}</span>;
}

// Category Icon
function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    Billing: <CreditCard className="w-5 h-5" />,
    Security: <Shield className="w-5 h-5" />,
    "AI Quota": <Zap className="w-5 h-5" />,
    System: <Server className="w-5 h-5" />,
    Storage: <Server className="w-5 h-5" />,
    Organization: <Users className="w-5 h-5" />,
    Trial: <Clock className="w-5 h-5" />,
    Compliance: <AlertCircle className="w-5 h-5" />,
  };
  const colors: Record<string, string> = {
    Billing: "bg-green-50 text-green-600",
    Security: "bg-red-50 text-red-600",
    "AI Quota": "bg-purple-50 text-purple-600",
    System: "bg-blue-50 text-blue-600",
    Storage: "bg-cyan-50 text-cyan-600",
    Organization: "bg-indigo-50 text-indigo-600",
    Trial: "bg-orange-50 text-orange-600",
    Compliance: "bg-pink-50 text-pink-600",
  };
  return (
    <div className={`w-10 h-10 rounded-full ${colors[category] || "bg-gray-50 text-gray-600"} flex items-center justify-center`}>
      {icons[category] || <Bell className="w-5 h-5" />}
    </div>
  );
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    red: "bg-red-50",
    yellow: "bg-yellow-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
  };
  return colors[color] || "text-gray-600";
};

export default function AlertsPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || typeFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all";

  // Get unique categories
  const categories = [...new Set(alertsData.map((a) => a.category))];

  // Filter alerts
  const filteredAlerts = alertsData.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.org?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || alert.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter;
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const allSelected = selectedAlerts.length === filteredAlerts.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map((a) => a.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedAlerts.includes(id)) {
      setSelectedAlerts(selectedAlerts.filter((i) => i !== id));
    } else {
      setSelectedAlerts([...selectedAlerts, id]);
    }
  };

  const handleMarkAsRead = (id: number) => {
    toast.success("Alert marked as read");
  };

  const handleBulkMarkRead = () => {
    toast.success(`${selectedAlerts.length} alerts marked as read`);
    setSelectedAlerts([]);
  };

  const handleBulkDelete = () => {
    toast.success(`${selectedAlerts.length} alerts deleted`);
    setSelectedAlerts([]);
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Platform notifications and action items
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="btn-secondary" onClick={() => toast.success("All alerts marked as read")}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark All Read
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
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
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

            {/* Bulk Action Bar */}
            {selectedAlerts.length > 0 && (
              <div className="bg-brand-primary-tint border border-brand-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedAlerts.length} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleBulkMarkRead}>
                    <Check className="w-4 h-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAlerts([])}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            {/* Alerts List */}
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`${alert.status === "unread" ? "border-l-4 border-l-brand-primary" : ""} hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedAlerts.includes(alert.id)}
                        onCheckedChange={() => toggleSelect(alert.id)}
                        className="mt-1"
                      />
                      <CategoryIcon category={alert.category} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTypeBadge type={alert.type} />
                          <CategoryBadge category={alert.category} />
                          {alert.actionRequired && (
                            <Badge className="bg-orange-100 text-orange-700 text-[10px]">ACTION REQUIRED</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="font-mono">{alert.timestamp}</span>
                          {alert.org && (
                            <Link
                              href={`/organizations/${alert.org.id}`}
                              className="text-brand-primary hover:underline"
                            >
                              {alert.org.name}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {alert.action && (
                          <Button size="sm" className="btn-primary">
                            {alert.action}
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
                            {alert.status === "unread" && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(alert.id)}>
                                <Check className="w-4 h-4 mr-2" /> Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredAlerts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No alerts found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
