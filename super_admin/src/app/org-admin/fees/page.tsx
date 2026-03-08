import { useSidebarStore } from "@/store/sidebarStore";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Download,
  ChevronRight,
  ChevronLeft,
  X,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  Send,
  Printer,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// Stats
const stats = [
  { label: "Total Billed", value: "₹10,58,750", icon: IndianRupee, color: "blue", subtext: "247 students" },
  { label: "Collected", value: "₹8,45,000", icon: CheckCircle2, color: "green", subtext: "80% paid" },
  { label: "Pending", value: "₹1,52,500", icon: TrendingUp, color: "orange", subtext: "45 students" },
  { label: "Overdue", value: "₹61,250", icon: AlertTriangle, color: "red", subtext: "7 students" },
];

// Fee structure
const feeStructure = [
  { name: "Monthly Tuition Fee", amount: "₹3,000", batches: ["Batch A", "Batch B"] },
  { name: "SSC GD Foundation", amount: "₹2,500", batches: ["SSC Batch"] },
  { name: "Registration Fee", amount: "₹500", batches: ["All"] },
];

// Pending fees
const pendingFees = [
  { studentId: "STU-00001", name: "Rahul Kumar", batch: "Batch A", amount: "₹3,000", dueSince: "Mar 1" },
  { studentId: "STU-00002", name: "Priya Sharma", batch: "Batch B", amount: "₹6,000", dueSince: "Feb 1", overdue: true },
  { studentId: "STU-00003", name: "Amit Singh", batch: "SSC Batch", amount: "₹2,500", dueSince: "Feb 15", overdue: true },
  { studentId: "STU-00004", name: "Sunita Devi", batch: "Batch A", amount: "₹3,000", dueSince: "Mar 1" },
  { studentId: "STU-00005", name: "Vikash Patel", batch: "Batch B", amount: "₹3,000", dueSince: "Mar 1" },
];

// Recent transactions
const recentTransactions = [
  { receiptNo: "2026-00458", student: "Rahul Kumar", amount: "₹6,500", mode: "UPI", date: "Mar 4, 2026" },
  { receiptNo: "2026-00457", student: "Priya Singh", amount: "₹3,000", mode: "Cash", date: "Mar 3, 2026" },
  { receiptNo: "2026-00456", student: "Amit Verma", amount: "₹2,500", mode: "UPI", date: "Mar 3, 2026" },
  { receiptNo: "2026-00455", student: "Sunita Kumari", amount: "₹3,000", mode: "Bank Transfer", date: "Mar 2, 2026" },
];

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    red: "bg-red-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    red: "text-red-600",
  };
  return colors[color] || "text-gray-600";
};

export default function FeesPage() {
    const { isOpen } = useSidebarStore();
const [showCollectDialog, setShowCollectDialog] = useState(false);
  const [showRemindDialog, setShowRemindDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleCollectFee = () => {
    toast.success("Payment recorded successfully! Receipt generated.");
    setShowCollectDialog(false);
  };

  const handleSendReminders = () => {
    toast.success("Reminders sent to 45 students via WhatsApp");
    setShowRemindDialog(false);
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
                <span className="text-gray-900 font-medium">Fee Collection</span>
              </div>

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Fee Collection</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage fees, collect payments, and send reminders
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setShowRemindDialog(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button onClick={() => setShowCollectDialog(true)} className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Collect Fee
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
                          <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] sm:text-xs text-gray-500 uppercase">{stat.label}</div>
                            <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-[10px] sm:text-xs text-gray-500">{stat.subtext}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                  <TabsTrigger value="pending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Pending Fees
                  </TabsTrigger>
                  <TabsTrigger value="structure" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Fee Structure
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Transactions
                  </TabsTrigger>
                </TabsList>

                {/* Pending Fees Tab */}
                <TabsContent value="pending" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Pending Fee Payments</CardTitle>
                      <CardDescription>45 students have pending fees totalling ₹1,52,500</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Mobile View */}
                      <div className="lg:hidden divide-y divide-gray-100">
                        {pendingFees.map((fee) => (
                          <div key={fee.studentId} className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{fee.name}</div>
                                <div className="text-xs text-gray-500">{fee.batch}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">{fee.amount}</div>
                                {fee.overdue && (
                                  <Badge className="bg-red-50 text-red-700 text-[10px]">Overdue</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 h-8">Remind</Button>
                              <Button size="sm" className="flex-1 h-8 btn-primary">Mark Paid</Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden lg:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase">Batch</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Amount</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase">Due Since</TableHead>
                              <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingFees.map((fee) => (
                              <TableRow key={fee.studentId} className="hover:bg-orange-50">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                                        {fee.name.split(" ").map(n => n[0]).join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-gray-900">{fee.name}</div>
                                      <div className="text-xs text-gray-500 font-mono">{fee.studentId}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{fee.batch}</TableCell>
                                <TableCell className="text-right font-medium">{fee.amount}</TableCell>
                                <TableCell>
                                  <span className={cn(fee.overdue && "text-red-600 font-medium")}>
                                    {fee.dueSince}
                                    {fee.overdue && " ⚠️"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="h-8">
                                      <Send className="w-3 h-3 mr-1" />
                                      Remind
                                    </Button>
                                    <Button size="sm" className="h-8 btn-primary">
                                      Mark Paid
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fee Structure Tab */}
                <TabsContent value="structure" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Fee Structure</CardTitle>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Fee Type
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {feeStructure.map((fee, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{fee.name}</div>
                              <div className="text-xs text-gray-500">Applicable to: {fee.batches.join(", ")}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-gray-900">{fee.amount}</span>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Recent Transactions</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Receipt #</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Amount</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Mode</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTransactions.map((txn) => (
                            <TableRow key={txn.receiptNo} className="hover:bg-orange-50">
                              <TableCell className="font-mono text-orange-600">{txn.receiptNo}</TableCell>
                              <TableCell className="font-medium">{txn.student}</TableCell>
                              <TableCell className="text-right font-medium">{txn.amount}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px]">{txn.mode}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">{txn.date}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  <Printer className="w-4 h-4" />
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
          </OrgContextBanner>
        </div>
      </div>

      {/* Collect Fee Dialog */}
      <Dialog open={showCollectDialog} onOpenChange={setShowCollectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Collect fee and generate receipt
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Input placeholder="Search by name / ID..." className="input-field" />
            </div>

            <div className="space-y-2">
              <Label>Outstanding Fees</Label>
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">March 2026 Tuition</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₹3,000</span>
                    <input type="checkbox" className="accent-orange-500" defaultChecked />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Feb 2026 Tuition (Overdue)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₹3,000</span>
                    <input type="checkbox" className="accent-orange-500" defaultChecked />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selected Amount</Label>
              <div className="text-2xl font-bold text-gray-900">₹6,500</div>
            </div>

            <div className="space-y-2">
              <Label>Payment Mode *</Label>
              <Select defaultValue="upi">
                <SelectTrigger className="input-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reference No</Label>
              <Input placeholder="UPI-20260304-XXXX" className="input-field" />
            </div>

            <div className="space-y-2">
              <Label>Discount (%)</Label>
              <Input type="number" placeholder="0" className="input-field" />
            </div>

            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea placeholder="Optional note..." className="input-field" rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCollectFee} className="btn-primary">
              Generate Receipt & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Reminders Dialog */}
      <Dialog open={showRemindDialog} onOpenChange={setShowRemindDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Send Fee Reminders</DialogTitle>
            <DialogDescription>
              Send payment reminders to 45 students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Channel</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">WhatsApp</Button>
                <Button variant="outline" size="sm">SMS</Button>
                <Button variant="outline" size="sm">All</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message Preview</Label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                "Dear Parent, ₹3,000 fee for [Student Name] is pending since [Date]. 
                Please pay at the earliest. — Apex Academy"
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemindDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminders} className="btn-primary">
              <Send className="w-4 h-4 mr-2" />
              Send to 45 Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OrgSidebarProvider>
  );
}
