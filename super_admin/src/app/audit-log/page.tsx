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

// Mock audit log data
const auditLogs = [
  {
    id: 1,
    timestamp: "2026-03-01 14:32:56",
    actor: {
      name: "Platform Owner",
      role: "Super Admin",
      impersonated: false,
    },
    action: "ORG_CREATED",
    actionLabel: "Organization Created",
    entity: {
      type: "Organization",
      id: "GK-ORG-00142",
      name: "Apex Academy",
    },
    details: "New organization 'Apex Academy' created with Medium plan",
    ipAddress: "192.168.1.100",
  },
  {
    id: 2,
    timestamp: "2026-03-01 14:28:15",
    actor: {
      name: "Platform Owner",
      role: "Super Admin",
      impersonated: false,
    },
    action: "ID_GENERATED",
    actionLabel: "Unique ID Generated",
    entity: {
      type: "Teacher ID",
      id: "GK-TCH-00892",
      name: "Rajesh Kumar",
    },
    details: "Generated Teacher ID for Apex Academy",
    ipAddress: "192.168.1.100",
  },
  {
    id: 3,
    timestamp: "2026-03-01 13:45:22",
    actor: {
      name: "Priya Singh",
      role: "Org Admin",
      impersonated: true,
    },
    action: "QUESTION_PUBLISHED",
    actionLabel: "Question Published",
    entity: {
      type: "Question",
      id: "Q-00234",
      name: "Newton's Laws",
    },
    details: "Published 5 questions to marketplace",
    ipAddress: "192.168.1.105",
  },
  {
    id: 4,
    timestamp: "2026-03-01 12:30:10",
    actor: {
      name: "Platform Owner",
      role: "Super Admin",
      impersonated: false,
    },
    action: "PLAN_CHANGED",
    actionLabel: "Plan Changed",
    entity: {
      type: "Organization",
      id: "GK-ORG-00140",
      name: "Excel Institute",
    },
    details: "Plan upgraded from Medium to Large",
    ipAddress: "192.168.1.100",
  },
  {
    id: 5,
    timestamp: "2026-03-01 11:15:45",
    actor: {
      name: "System",
      role: "System",
      impersonated: false,
    },
    action: "PAYMENT_RECEIVED",
    actionLabel: "Payment Received",
    entity: {
      type: "Invoice",
      id: "INV-2026-003",
      name: "",
    },
    details: "Payment of ₹40,000 received from Excel Institute",
    ipAddress: "N/A",
  },
  {
    id: 6,
    timestamp: "2026-03-01 10:45:30",
    actor: {
      name: "Platform Owner",
      role: "Super Admin",
      impersonated: false,
    },
    action: "ORG_SUSPENDED",
    actionLabel: "Organization Suspended",
    entity: {
      type: "Organization",
      id: "GK-ORG-00138",
      name: "Vision Academy",
    },
    details: "Suspended due to non-payment",
    ipAddress: "192.168.1.100",
  },
  {
    id: 7,
    timestamp: "2026-03-01 09:30:00",
    actor: {
      name: "Platform Owner",
      role: "Super Admin",
      impersonated: false,
    },
    action: "AI_QUOTA_RESET",
    actionLabel: "AI Quota Reset",
    entity: {
      type: "Organization",
      id: "GK-ORG-00137",
      name: "Prime Tutorials",
    },
    details: "Monthly AI quota reset to 2000 credits",
    ipAddress: "192.168.1.100",
  },
  {
    id: 8,
    timestamp: "2026-03-01 08:15:20",
    actor: {
      name: "Amit Verma",
      role: "Teacher",
      impersonated: false,
    },
    action: "LOGIN_SUCCESS",
    actionLabel: "Login Success",
    entity: {
      type: "User",
      id: "U-00003",
      name: "Amit Verma",
    },
    details: "Successful login from Android device",
    ipAddress: "192.168.1.120",
  },
  {
    id: 9,
    timestamp: "2026-02-28 18:30:45",
    actor: {
      name: "Platform Owner",
      role: "Super Admin",
      impersonated: false,
    },
    action: "SETTINGS_CHANGED",
    actionLabel: "Settings Changed",
    entity: {
      type: "Settings",
      id: "PLATFORM",
      name: "Platform Settings",
    },
    details: "Updated default AI usage cost to 5 points/question",
    ipAddress: "192.168.1.100",
  },
  {
    id: 10,
    timestamp: "2026-02-28 16:20:30",
    actor: {
      name: "Unknown",
      role: "Unknown",
      impersonated: false,
    },
    action: "LOGIN_FAILED",
    actionLabel: "Login Failed",
    entity: {
      type: "User",
      id: "unknown@example.com",
      name: "Unknown User",
    },
    details: "Failed login attempt - Invalid credentials",
    ipAddress: "203.45.67.89",
  },
];

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
  "Super Admin": "bg-orange-50 text-orange-700",
  "Org Admin": "bg-green-50 text-green-700",
  "Teacher": "bg-purple-50 text-purple-700",
  "System": "bg-blue-50 text-blue-700",
  "Unknown": "bg-gray-50 text-gray-600",
};

export default function AuditLogPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [actorFilter, setActorFilter] = useState("all");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");

  const clearFilters = () => {
    setSearchQuery("");
    setActorFilter("all");
    setActionTypeFilter("all");
  };

  const hasActiveFilters = searchQuery || actorFilter !== "all" || actionTypeFilter !== "all";

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActor = actorFilter === "all" || log.actor.role === actorFilter;
    const matchesAction = actionTypeFilter === "all" || log.action.includes(actionTypeFilter);
    return matchesSearch && matchesActor && matchesAction;
  });

  // Get unique values for filters
  const actorRoles = [...new Set(auditLogs.map((l) => l.actor.role))];
  const actionTypes = [...new Set(auditLogs.map((l) => l.action.split("_")[0]))];

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
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-brand-primary-tint">
                        <TableCell>
                          <span className="font-mono text-xs text-gray-600">{log.timestamp}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{log.actor.name}</span>
                                {log.actor.impersonated && (
                                  <Badge className="bg-red-100 text-red-700 text-[10px]">IMPERSONATED</Badge>
                                )}
                              </div>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  roleColors[log.actor.role] || "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {log.actor.role}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`badge ${actionColors[log.action] || "bg-gray-100 text-gray-600"}`}>
                            {log.actionLabel}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm text-gray-900">{log.entity.name || log.entity.type}</div>
                            <span className="text-xs text-gray-500">{log.entity.type}</span>
                            {log.entity.id && (
                              <span className="text-xs text-gray-400 ml-1">• {log.entity.id}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 line-clamp-2 max-w-[250px]">
                            {log.details}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-500">{log.ipAddress}</span>
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
                Showing 1–{filteredLogs.length} of {auditLogs.length}
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
          </div>
        </main>
      </div>
    </div>
  );
}
