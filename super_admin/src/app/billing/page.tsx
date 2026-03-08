"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  IndianRupee,
  TrendingUp,
  Clock,
  AlertCircle,
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Send,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

// KPI data
const kpiData = [
  {
    label: "MRR",
    value: "₹7,24,000",
    change: "+8.2% from last month",
    trend: "up",
    icon: IndianRupee,
    color: "green",
  },
  {
    label: "ARR",
    value: "₹86,88,000",
    change: "+₹5,24,000 this year",
    trend: "up",
    icon: TrendingUp,
    color: "blue",
  },
  {
    label: "Pending Invoices",
    value: "8",
    change: "₹1,20,000 total",
    trend: "warning",
    icon: Clock,
    color: "yellow",
  },
  {
    label: "Overdue (Action Required)",
    value: "2",
    change: "₹55,000 overdue",
    trend: "danger",
    icon: AlertCircle,
    color: "red",
  },
];

// Revenue trend data
const revenueTrend = [
  { month: "Mar", mrr: 580000, arr: 6960000 },
  { month: "Apr", mrr: 595000, arr: 7140000 },
  { month: "May", mrr: 610000, arr: 7320000 },
  { month: "Jun", mrr: 635000, arr: 7620000 },
  { month: "Jul", mrr: 660000, arr: 7920000 },
  { month: "Aug", mrr: 685000, arr: 8220000 },
  { month: "Sep", mrr: 695000, arr: 8340000 },
  { month: "Oct", mrr: 705000, arr: 8460000 },
  { month: "Nov", mrr: 715000, arr: 8580000 },
  { month: "Dec", mrr: 700000, arr: 8400000 },
  { month: "Jan", mrr: 712000, arr: 8544000 },
  { month: "Feb", mrr: 724000, arr: 8688000 },
];

// Mock invoices data
const invoices = [
  {
    id: "INV-2026-001",
    orgId: "GK-ORG-00142",
    organization: "Apex Academy",
    plan: "Medium",
    amount: 15000,
    period: "Mar 2026",
    status: "Paid",
    dueDate: "Mar 05, 2026",
    paidDate: "Mar 03, 2026",
  },
  {
    id: "INV-2026-002",
    orgId: "GK-ORG-00141",
    organization: "Brilliant Coaching",
    plan: "Small",
    amount: 5000,
    period: "Mar 2026",
    status: "Pending",
    dueDate: "Mar 10, 2026",
    paidDate: null,
  },
  {
    id: "INV-2026-003",
    orgId: "GK-ORG-00140",
    organization: "Excel Institute",
    plan: "Large",
    amount: 40000,
    period: "Mar 2026",
    status: "Paid",
    dueDate: "Mar 01, 2026",
    paidDate: "Feb 28, 2026",
  },
  {
    id: "INV-2026-004",
    orgId: "GK-ORG-00139",
    organization: "Success Classes",
    plan: "Medium",
    amount: 15000,
    period: "Mar 2026",
    status: "Pending",
    dueDate: "Mar 15, 2026",
    paidDate: null,
  },
  {
    id: "INV-2026-005",
    orgId: "GK-ORG-00137",
    organization: "Prime Tutorials",
    plan: "Enterprise",
    amount: 75000,
    period: "Mar 2026",
    status: "Overdue",
    dueDate: "Feb 25, 2026",
    paidDate: null,
  },
  {
    id: "INV-2026-006",
    orgId: "GK-ORG-00136",
    organization: "Knowledge Park",
    plan: "Medium",
    amount: 15000,
    period: "Mar 2026",
    status: "Overdue",
    dueDate: "Feb 20, 2026",
    paidDate: null,
  },
  {
    id: "INV-2026-007",
    orgId: "GK-ORG-00135",
    organization: "Scholars Hub",
    plan: "Small",
    amount: 0,
    period: "Mar 2026",
    status: "Trial",
    dueDate: "Mar 15, 2026",
    paidDate: null,
  },
  {
    id: "INV-2026-008",
    orgId: "GK-ORG-00134",
    organization: "Rise Academy",
    plan: "Small",
    amount: 5000,
    period: "Mar 2026",
    status: "Cancelled",
    dueDate: "Mar 10, 2026",
    paidDate: null,
  },
];

// Plan reference data
const plans = [
  { name: "Small", limit: "1–10 teachers", monthly: "₹5,000", annual: "₹54,000" },
  { name: "Medium", limit: "11–50 teachers", monthly: "₹15,000", annual: "₹1,62,000" },
  { name: "Large", limit: "51–200 teachers", monthly: "₹40,000", annual: "₹4,32,000" },
  { name: "Enterprise", limit: "200+ teachers", monthly: "Custom", annual: "Custom" },
];

// Status Badge Component
function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: "badge-active",
    Pending: "badge-pending",
    Overdue: "badge-suspended",
    Trial: "badge-trial",
    Cancelled: "bg-gray-100 text-gray-600",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Plan Badge Component
function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    Small: "badge-small",
    Medium: "badge-medium",
    Large: "badge-large",
    Enterprise: "badge-enterprise",
  };
  return <span className={`badge ${styles[plan] || ""}`}>{plan}</span>;
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

export default function BillingPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlanFilter("all");
    setDateRange("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || planFilter !== "all" || dateRange !== "all";

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesPlan = planFilter === "all" || inv.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage invoices, subscriptions, and revenue
                </p>
              </div>
              <Button variant="outline" className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(kpi.color)} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${getIconColor(kpi.color)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {kpi.label}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {kpi.value}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {kpi.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                            <span className={`text-xs ${kpi.trend === "up" ? "text-green-600" : kpi.trend === "danger" ? "text-red-600" : "text-yellow-600"}`}>
                              {kpi.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="invoices" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="invoices" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Invoices</TabsTrigger>
                <TabsTrigger value="subscriptions" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Subscriptions</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">Revenue Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Revenue Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueTrend}>
                          <defs>
                            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F4511E" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#F4511E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                          <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, "MRR"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="mrr"
                            stroke="#F4511E"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorMrr)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Reference */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Plan Pricing Reference</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Teacher Limit</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Monthly</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Annual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plans.map((plan) => (
                          <TableRow key={plan.name} className="hover:bg-gray-50">
                            <TableCell>
                              <PlanBadge plan={plan.name} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{plan.limit}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{plan.monthly}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{plan.annual}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices" className="mt-6 space-y-6">
                {/* Filter Bar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search invoices..."
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
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                          <SelectItem value="Trial">Trial</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={planFilter} onValueChange={setPlanFilter}>
                        <SelectTrigger className="w-[130px] input-field">
                          <SelectValue placeholder="Plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Plans</SelectItem>
                          <SelectItem value="Small">Small</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Large">Large</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[150px] input-field">
                          <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="this-month">This Month</SelectItem>
                          <SelectItem value="last-month">Last Month</SelectItem>
                          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
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

                {/* Invoices Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Invoice #</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Plan</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Amount</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Period</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Due Date</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <span className="mono text-xs">{invoice.id}</span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Link 
                                  href={`/organizations/${invoice.orgId}`}
                                  className="text-sm font-medium text-gray-900 hover:text-brand-primary"
                                >
                                  {invoice.organization}
                                </Link>
                                <div className="text-xs text-gray-500">{invoice.orgId}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <PlanBadge plan={invoice.plan} />
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">
                              {invoice.amount > 0 ? `₹${invoice.amount.toLocaleString()}` : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{invoice.period}</TableCell>
                            <TableCell>
                              <InvoiceStatusBadge status={invoice.status} />
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm ${invoice.status === "Overdue" ? "text-red-600 font-medium" : "text-gray-500"}`}>
                                {invoice.dueDate}
                              </span>
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
                                    <Eye className="w-4 h-4 mr-2" /> View Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="w-4 h-4 mr-2" /> Download PDF
                                  </DropdownMenuItem>
                                  {invoice.status === "Pending" && (
                                    <DropdownMenuItem>
                                      <Send className="w-4 h-4 mr-2" /> Send Reminder
                                    </DropdownMenuItem>
                                  )}
                                  {invoice.status === "Pending" && (
                                    <DropdownMenuItem className="text-green-600">
                                      Mark as Paid
                                    </DropdownMenuItem>
                                  )}
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
                    Showing 1–{filteredInvoices.length} of {invoices.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subscriptions" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Subscription management coming soon...
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Revenue analytics coming soon...
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
