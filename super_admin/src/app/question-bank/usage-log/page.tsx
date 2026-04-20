"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  TrendingUp,
  Users,
  FileText,
  Coins,
  Calendar,
  Building2,
  ArrowUpDown,
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

// Mock data
const mockUsageLog = [
  { id: "1", question: "Newton's Second Law Application", type: "question", org: "Apex Academy", user: "Rahul Sharma", points: 5, balanceAfter: 1185, usedAt: "Mar 2, 2026 14:32" },
  { id: "2", question: "JEE Physics Set 1", type: "set", org: "Apex Academy", user: "Rahul Sharma", points: 50, balanceAfter: 1190, usedAt: "Mar 2, 2026 14:28" },
  { id: "3", question: "Thermodynamics MCQ Collection", type: "set", org: "Brilliant Classes", user: "Priya Singh", points: 100, balanceAfter: 2150, usedAt: "Mar 2, 2026 11:15" },
  { id: "4", question: "Organic Chemistry Reactions", type: "question", org: "Career Point", user: "Amit Kumar", points: 10, balanceAfter: 890, usedAt: "Mar 1, 2026 16:45" },
  { id: "5", question: "Calculus Integration Problems", type: "question", org: "Apex Academy", user: "Neha Gupta", points: 8, balanceAfter: 1240, usedAt: "Mar 1, 2026 10:20" },
  { id: "6", question: "NEET Biology Complete Set", type: "set", org: "Med Academy", user: "Dr. Sharma", points: 200, balanceAfter: 1800, usedAt: "Feb 28, 2026 15:30" },
  { id: "7", question: "Electromagnetic Induction", type: "question", org: "Brilliant Classes", user: "Priya Singh", points: 5, balanceAfter: 2250, usedAt: "Feb 28, 2026 09:45" },
  { id: "8", question: "UPSC GS Paper 1 Questions", type: "set", org: "IAS Hub", user: "Vikram Patel", points: 150, balanceAfter: 850, usedAt: "Feb 27, 2026 14:00" },
];

export default function UsageLogPage() {
    const { isOpen } = useSidebarStore();
const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredLogs = mockUsageLog.filter(log => {
    const matchesSearch = log.question.toLowerCase().includes(search.toLowerCase()) || log.org.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Usage Log</h1>
                <p className="text-gray-500 text-sm">Track question and set usage across organizations</p>
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" /> Export CSV
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
                    <div className="text-2xl font-bold text-gray-900">48,201</div>
                    <div className="text-sm text-gray-500">Total Points Earned</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">3,842</div>
                    <div className="text-sm text-gray-500">Total Usage Events</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">Apex Academy</div>
                    <div className="text-sm text-gray-500">Top Org This Month</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">+12.5%</div>
                    <div className="text-sm text-gray-500">vs Last Month</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Points Earned (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end gap-2">
                    {[45, 62, 38, 85, 72, 58, 94, 67, 81, 56, 73, 48, 92, 68, 55, 78, 64, 89, 52, 76, 83, 59, 71, 48, 95, 67, 84, 53, 79, 66].map((val, i) => (
                      <div key={i} className="flex-1 bg-[#F4511E] rounded-t opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${val}%` }} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Top Organizations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Apex Academy", points: 1240, bar: 100 },
                    { name: "Brilliant Classes", points: 980, bar: 79 },
                    { name: "Career Point", points: 756, bar: 61 },
                    { name: "Med Academy", points: 542, bar: 44 },
                    { name: "IAS Hub", points: 428, bar: 35 },
                  ].map((org, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{org.name}</span>
                        <span className="font-medium text-[#F4511E]">{org.points} pts</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#F4511E] rounded-full" style={{ width: `${org.bar}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="Search by question or organization..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="question">Questions</SelectItem>
                      <SelectItem value="set">Sets</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" /> Date Range
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Table */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#F4511E]" />
                  <CardTitle>Usage History</CardTitle>
                  <Badge className="bg-gray-100 text-gray-600">{filteredLogs.length} events</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Question / Set</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Type</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Used By (Org)</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">User</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Points Deducted</th>
                        <th className="text-center p-4 font-medium text-gray-500 text-sm">Balance After</th>
                        <th className="text-left p-4 font-medium text-gray-500 text-sm">Used At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-gray-900 max-w-[250px] truncate">{log.question}</div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge className={log.type === "set" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}>
                              {log.type}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{log.org}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">{log.user}</td>
                          <td className="p-4 text-center">
                            <span className="font-semibold text-[#F4511E]">-{log.points}</span>
                          </td>
                          <td className="p-4 text-center text-gray-600">{log.balanceAfter.toLocaleString()}</td>
                          <td className="p-4 text-gray-500 text-sm">{log.usedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
