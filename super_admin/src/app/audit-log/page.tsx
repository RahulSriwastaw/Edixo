"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Building2,
  Shield,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

import { api } from "@/lib/api";
import { useEffect } from "react";

// Action type badge colors
const actionColors: Record<string, string> = {
  ORG_CREATED: "bg-green-50 text-green-700",
  ORG_SUSPENDED: "bg-red-50 text-red-700",
  ORG_DELETED: "bg-red-50 text-red-700",
  ID_GENERATED: "bg-blue-50 text-blue-700",
  ID_REVOKED: "bg-orange-50 text-orange-700",
  PLAN_CHANGED: "bg-purple-50 text-purple-700",
  PAYMENT_RECEIVED: "bg-green-50 text-green-700",
  QUESTION_PUBLISHED: "bg-blue-50 text-blue-700",
  AI_QUOTA_RESET: "bg-yellow-50 text-yellow-700",
  LOGIN_SUCCESS: "bg-green-50 text-green-700",
  LOGIN_FAILED: "bg-red-50 text-red-700",
  SETTINGS_CHANGED: "bg-gray-50 text-gray-700",
};

// Role badge colors
const roleColors: Record<string, string> = {
  "SUPER_ADMIN": "bg-orange-50 text-orange-700",
  "ORG_ADMIN": "bg-green-50 text-green-700",
  "TEACHER": "bg-purple-50 text-purple-700",
  "SYSTEM": "bg-blue-50 text-blue-700",
};

export default function AuditLogPage() {
    const { isOpen } = useSidebarStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [searchQuery, setSearchQuery] = useState("");
  const [actorFilter, setActorFilter] = useState("all");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        search: searchQuery,
      };
      if (actorFilter !== 'all') params.category = actorFilter;

      const json = await api.get('/super-admin/audit-logs', { params });
      if (json.success) {
        setLogs(json.data.logs);
        setTotal(json.data.total);
      }
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, actorFilter, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setActorFilter("all");
    setActionTypeFilter("all");
    setPage(1);
  };

  const hasActiveFilters = searchQuery || actorFilter !== "all" || actionTypeFilter !== "all";

  // Get unique values for filters (mocked from current page's logs)
  const actorRoles = ["SUPER_ADMIN", "ORG_ADMIN", "ORG_STAFF", "SYSTEM"];
  const actionTypes = ["ORG", "ID", "PLAN", "PAYMENT", "QUESTION", "AI", "LOGIN", "SETTINGS"];

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
                <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Complete trail of all platform actions
                </p>
              </div>
              <Button variant="outline" className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Today's Events</div>
                      <div className="text-xl font-bold text-gray-900">847</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Unique Actors</div>
                      <div className="text-xl font-bold text-gray-900">124</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Security Events</div>
                      <div className="text-xl font-bold text-gray-900">23</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Impersonations</div>
                      <div className="text-xl font-bold text-gray-900">5</div>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search actions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={actorFilter} onValueChange={setActorFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Actor Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {actorRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Action Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
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

            {/* Audit Log Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Timestamp</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Actor</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Action</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Entity</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Details</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                       <TableRow>
                         <TableCell colSpan={6} className="text-center py-10">
                           <div className="flex flex-col items-center gap-2">
                             <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                             <span className="text-gray-500">Loading logs...</span>
                           </div>
                         </TableCell>
                       </TableRow>
                    ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-brand-primary-tint">
                          <TableCell>
                            <span className="font-mono text-xs text-gray-600">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">{log.actorName}</span>
                                </div>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                    roleColors[log.actorType] || "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {log.actorType}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`badge ${actionColors[log.action] || "bg-gray-100 text-gray-600"}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900">{log.resource || '—'}</div>
                              <span className="text-xs text-gray-400">Resource</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 line-clamp-2 max-w-[250px]">
                              {log.action} performed on {log.resource || 'system'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs text-gray-500">{log.ip || 'N/A'}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= total}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
