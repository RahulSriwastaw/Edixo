"use client";

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
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  CreditCard,
  CheckCircle2,
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

// KPI data
const kpiData = [
  {
    label: "Current Plan",
    value: "Premium (Large)",
    change: "Renews on Apr 05, 2026",
    trend: "up",
    icon: IndianRupee,
    color: "blue",
  },
  {
    label: "Monthly Usage",
    value: "142 / 200",
    change: "71% Capacity used",
    trend: "up",
    icon: TrendingUp,
    color: "green",
  },
  {
    label: "Student Fees Due",
    value: "₹1,20,000",
    change: "15 Pending payments",
    trend: "warning",
    icon: Clock,
    color: "yellow",
  },
  {
    label: "Total Revenue (Mar)",
    value: "₹7,24,000",
    change: "+8.2% from Feb",
    trend: "up",
    icon: TrendingUp,
    color: "blue",
  },
];

// Mock invoices data (Org's own invoices from EduHub)
const invoices = [
  {
    id: "EH-INV-00142",
    description: "EduHub Subscription - Large Plan (Mar 2026)",
    amount: 40000,
    period: "Mar 2026",
    status: "Paid",
    dueDate: "Mar 05, 2026",
    paidDate: "Mar 03, 2026",
  },
  {
    id: "EH-INV-00128",
    description: "EduHub Subscription - Large Plan (Feb 2026)",
    amount: 40000,
    period: "Feb 2026",
    status: "Paid",
    dueDate: "Feb 05, 2026",
    paidDate: "Feb 04, 2026",
  },
  {
    id: "EH-INV-00089",
    description: "EduHub Subscription - Large Plan (Jan 2026)",
    amount: 40000,
    period: "Jan 2026",
    status: "Paid",
    dueDate: "Jan 05, 2026",
    paidDate: "Jan 04, 2026",
  },
];

const currentPlanDetails = {
  name: "Large",
  limit: "51–200 teachers",
  price: "₹40,000 / month",
  features: [
    "Unlimited Students",
    "Priority AI Generation",
    "Custom Branding",
    "Advanced Analytics",
    "Export Studio Access",
  ],
};

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
  const [activeTab, setActiveTab] = useState("subscription");

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-500 text-sm">Manage your EduHub plan and view payment history</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", getIconBgColor(kpi.color))}>
                          <Icon className={cn("w-5 h-5", getIconColor(kpi.color))} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold">{kpi.label}</p>
                          <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Tabs defaultValue="subscription" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="subscription">Current Plan</TabsTrigger>
                <TabsTrigger value="invoices">Payment History</TabsTrigger>
              </TabsList>

              <TabsContent value="subscription" className="space-y-6 mt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Plan Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-500">Active Plan</p>
                          <p className="text-xl font-bold text-[#F4511E]">{currentPlanDetails.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="text-lg font-bold">{currentPlanDetails.price}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">What's included in your plan:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {currentPlanDetails.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Usage Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Teachers</span>
                          <span className="font-semibold">142 / 200</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#F4511E]" style={{ width: "71%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">AI Tokens</span>
                          <span className="font-semibold">82%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: "82%" }} />
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-[#F4511E] hover:bg-[#E64A19] text-white">
                        Upgrade Plan
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="invoices" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                            <TableCell className="text-sm">{inv.description}</TableCell>
                            <TableCell className="text-sm font-medium">₹{inv.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{inv.paidDate}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
