"use client";

import { useState } from "react";
import {
  Coins,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Calendar,
  Building2,
  ArrowUpDown,
  CreditCard,
  Gift,
  RefreshCw,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Mock data
const mockOrganizations = [
  { id: "1", name: "Apex Academy", balance: 1190, plan: "Medium", usedThisMonth: 85, monthlyCredits: 2000 },
  { id: "2", name: "Brilliant Classes", balance: 2250, plan: "Large", usedThisMonth: 120, monthlyCredits: 5000 },
  { id: "3", name: "Career Point", balance: 890, plan: "Small", usedThisMonth: 45, monthlyCredits: 500 },
  { id: "4", name: "Med Academy", balance: 1800, plan: "Medium", usedThisMonth: 95, monthlyCredits: 2000 },
  { id: "5", name: "IAS Hub", balance: 850, plan: "Small", usedThisMonth: 32, monthlyCredits: 500 },
];

const mockTransactions = [
  { id: "1", org: "Apex Academy", type: "plan_credit", description: "Monthly plan credit (Medium)", points: 2000, balanceAfter: 3190, createdAt: "Mar 1, 2026" },
  { id: "2", org: "Apex Academy", type: "usage", description: "Used JEE Physics Set 1", points: -50, balanceAfter: 1190, createdAt: "Feb 28, 2026" },
  { id: "3", org: "Apex Academy", type: "usage", description: "Used Newton's Second Law Q", points: -5, balanceAfter: 1240, createdAt: "Feb 27, 2026" },
  { id: "4", org: "Brilliant Classes", type: "manual_credit", description: "Manual top-up by Admin", points: 500, balanceAfter: 2750, createdAt: "Feb 25, 2026" },
  { id: "5", org: "Career Point", type: "usage", description: "Used Thermodynamics Set", points: -100, balanceAfter: 990, createdAt: "Feb 24, 2026" },
  { id: "6", org: "Med Academy", type: "bonus", description: "Annual plan bonus (25%)", points: 500, balanceAfter: 2300, createdAt: "Feb 20, 2026" },
  { id: "7", org: "Apex Academy", type: "refund", description: "Refund - duplicate charge", points: 10, balanceAfter: 1250, createdAt: "Feb 18, 2026" },
];

const typeIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  plan_credit: { icon: <CreditCard className="w-4 h-4" />, color: "text-blue-600 bg-blue-50" },
  usage: { icon: <FileText className="w-4 h-4" />, color: "text-red-600 bg-red-50" },
  manual_credit: { icon: <Plus className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50" },
  bonus: { icon: <Gift className="w-4 h-4" />, color: "text-purple-600 bg-purple-50" },
  refund: { icon: <RefreshCw className="w-4 h-4" />, color: "text-amber-600 bg-amber-50" },
};

export default function PointsLedgerPage() {
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addPointsDialog, setAddPointsDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");

  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) || tx.org.toLowerCase().includes(search.toLowerCase());
    const matchesOrg = orgFilter === "all" || tx.org === orgFilter;
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesOrg && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Points Ledger</h1>
                <p className="text-gray-500 text-sm">Manage organization point balances and transactions</p>
              </div>
              <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2" onClick={() => setAddPointsDialog(true)}>
                <Plus className="w-4 h-4" /> Add Points
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#F4511E]/5 to-white border-[#F4511E]/20">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F4511E]/10 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-[#F4511E]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">7,180</div>
                    <div className="text-sm text-gray-500">Total Points in System</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">+9,500</div>
                    <div className="text-sm text-gray-500">Credits This Month</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">-2,320</div>
                    <div className="text-sm text-gray-500">Usage This Month</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{mockOrganizations.length}</div>
                    <div className="text-sm text-gray-500">Active Organizations</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Balances */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#F4511E]" />
                  <CardTitle>Organization Point Balances</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Organization</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Plan</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Monthly Credits</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Used This Month</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Current Balance</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrganizations.map((org) => (
                        <tr key={org.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-purple-600" />
                              </div>
                              <span className="font-medium text-gray-900">{org.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={org.plan === "Large" ? "bg-purple-50 text-purple-700" : org.plan === "Medium" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-700"}>
                              {org.plan}
                            </Badge>
                          </td>
                          <td className="p-4 text-center text-gray-600">{org.monthlyCredits.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-gray-600">{org.usedThisMonth}</span>
                              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#F4511E] rounded-full" style={{ width: `${Math.min((org.usedThisMonth / org.monthlyCredits) * 100, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-[#F4511E]">{org.balance.toLocaleString()} pts</span>
                          </td>
                          <td className="p-4 text-center">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedOrg(org.id); setAddPointsDialog(true); }}>
                              Add Points
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Select value={orgFilter} onValueChange={setOrgFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      {mockOrganizations.map(org => (
                        <SelectItem key={org.id} value={org.name}>{org.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="plan_credit">Plan Credit</SelectItem>
                      <SelectItem value="usage">Usage</SelectItem>
                      <SelectItem value="manual_credit">Manual Credit</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#F4511E]" />
                  <CardTitle>Transaction History</CardTitle>
                  <Badge className="bg-gray-100 text-gray-600">{filteredTransactions.length} transactions</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Date</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Organization</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Type</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Description</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Points</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => {
                        const typeInfo = typeIcons[tx.type] || { icon: <FileText className="w-4 h-4" />, color: "text-gray-600 bg-gray-50" };
                        return (
                          <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-gray-500 text-sm">{tx.createdAt}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{tx.org}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={typeInfo.color}>
                                {typeInfo.icon}
                                <span className="ml-1 capitalize">{tx.type.replace("_", " ")}</span>
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-600">{tx.description}</td>
                            <td className="p-4 text-center">
                              <span className={`font-semibold ${tx.points > 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {tx.points > 0 ? "+" : ""}{tx.points}
                              </span>
                            </td>
                            <td className="p-4 text-center text-gray-600">{tx.balanceAfter.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Points Dialog */}
      <Dialog open={addPointsDialog} onOpenChange={setAddPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Points to Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Organization</Label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {mockOrganizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Points to Add</Label>
              <Input type="number" placeholder="Enter points..." value={pointsToAdd} onChange={(e) => setPointsToAdd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPointsDialog(false)}>Cancel</Button>
            <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white">Add Points</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
