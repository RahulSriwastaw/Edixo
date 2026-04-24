"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  Clock,
  Globe,
  Monitor,
  Smartphone,
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

// Mock public users data
const publicUsers = [
  {
    id: "PU-00001",
    setCode: "482931",
    ipAddress: "203.45.67.89",
    location: "Mumbai, Maharashtra",
    device: "Windows Desktop",
    browser: "Chrome 122",
    accessedAt: "Mar 2, 2026 14:30",
    duration: "00:45:12",
    status: "Active",
  },
  {
    id: "PU-00002",
    setCode: "593847",
    ipAddress: "45.67.89.101",
    location: "Delhi, NCR",
    device: "Android Mobile",
    browser: "Chrome Mobile",
    accessedAt: "Mar 2, 2026 12:15",
    duration: "00:32:45",
    status: "Ended",
  },
  {
    id: "PU-00003",
    setCode: "674928",
    ipAddress: "89.101.112.134",
    location: "Bangalore, Karnataka",
    device: "MacBook Pro",
    browser: "Safari 17",
    accessedAt: "Mar 2, 2026 10:45",
    duration: "00:28:30",
    status: "Ended",
  },
  {
    id: "PU-00004",
    setCode: "785039",
    ipAddress: "112.134.156.178",
    location: "Chennai, Tamil Nadu",
    device: "iPhone 15",
    browser: "Safari Mobile",
    accessedAt: "Mar 2, 2026 09:30",
    duration: "00:15:22",
    status: "Ended",
  },
  {
    id: "PU-00005",
    setCode: "896140",
    ipAddress: "134.156.178.190",
    location: "Hyderabad, Telangana",
    device: "Windows Desktop",
    browser: "Firefox 123",
    accessedAt: "Mar 1, 2026 18:20",
    duration: "00:52:18",
    status: "Ended",
  },
  {
    id: "PU-00006",
    setCode: "907251",
    ipAddress: "156.178.190.201",
    location: "Pune, Maharashtra",
    device: "Android Tablet",
    browser: "Chrome Mobile",
    accessedAt: "Mar 1, 2026 16:45",
    duration: "00:38:55",
    status: "Ended",
  },
  {
    id: "PU-00007",
    setCode: "482931",
    ipAddress: "178.190.201.212",
    location: "Kolkata, West Bengal",
    device: "Windows Desktop",
    browser: "Edge 122",
    accessedAt: "Mar 1, 2026 14:10",
    duration: "01:05:42",
    status: "Ended",
  },
  {
    id: "PU-00008",
    setCode: "593847",
    ipAddress: "190.201.212.223",
    location: "Ahmedabad, Gujarat",
    device: "MacBook Air",
    browser: "Chrome 122",
    accessedAt: "Mar 1, 2026 11:30",
    duration: "00:22:15",
    status: "Ended",
  },
];

// Stats data
const stats = [
  { label: "Total Public Access", value: "1,847", icon: Users, color: "blue" },
  { label: "Active Sessions", value: "23", icon: Globe, color: "green" },
  { label: "Today's Access", value: "156", icon: Monitor, color: "purple" },
  { label: "Avg Duration", value: "32 min", icon: Clock, color: "orange" },
];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "badge-active",
    Ended: "bg-[var(--bg-main)] text-[var(--text-secondary)]",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Device Badge
function DeviceBadge({ device }: { device: string }) {
  const isMobile = device.includes("Mobile") || device.includes("iPhone") || device.includes("Android") || device.includes("Tablet");
  return (
    <div className="flex items-center gap-2">
      {isMobile ? (
        <Smartphone className="w-4 h-4 text-[var(--text-muted)]" />
      ) : (
        <Monitor className="w-4 h-4 text-[var(--text-muted)]" />
      )}
      <span className="text-sm text-[var(--text-primary)]">{device}</span>
    </div>
  );
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-[var(--bg-main)]";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-[var(--text-secondary)]";
};

export default function PublicUsersPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDeviceFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || deviceFilter !== "all";

  // Filter public users
  const filteredUsers = publicUsers.filter((user) => {
    const matchesSearch =
      user.setCode.includes(searchQuery) ||
      user.ipAddress.includes(searchQuery) ||
      user.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesDevice = deviceFilter === "all" || 
      (deviceFilter === "mobile" && (user.device.includes("Mobile") || user.device.includes("iPhone") || user.device.includes("Android") || user.device.includes("Tablet"))) ||
      (deviceFilter === "desktop" && !user.device.includes("Mobile") && !user.device.includes("iPhone") && !user.device.includes("Android") && !user.device.includes("Tablet"));
    return matchesSearch && matchesStatus && matchesDevice;
  });

  const handleBlockIP = (ip: string) => {
    toast.success(`IP ${ip} has been blocked`);
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Link href="/digital-board" className="hover:text-[#F4511E]">Digital Board</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[var(--text-primary)] font-medium">Public Users</span>
            </div>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Public Access Log</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  Track all public access sessions via Set ID + Password
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export Log
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                        </div>
                        <div>
                          <div className="text-xs text-[var(--text-secondary)] uppercase">{stat.label}</div>
                          <div className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</div>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <Input
                      placeholder="Search by Set ID, IP, location..."
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
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                    <SelectTrigger className="w-[140px] input-field">
                      <SelectValue placeholder="Device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
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

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[var(--bg-main)]">
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Session ID</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Set Code</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">IP Address</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Location</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Device</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Browser</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Accessed At</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Duration</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-[var(--text-secondary)] uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-brand-primary-tint">
                        <TableCell>
                          <span className="font-mono text-xs text-[var(--text-secondary)]">{user.id}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-[#F4511E]">{user.setCode}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-[var(--text-secondary)]">{user.ipAddress}</span>
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-primary)]">{user.location}</TableCell>
                        <TableCell>
                          <DeviceBadge device={user.device} />
                        </TableCell>
                        <TableCell className="text-sm text-[var(--text-secondary)]">{user.browser}</TableCell>
                        <TableCell className="text-sm text-[var(--text-secondary)]">{user.accessedAt}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-[var(--text-secondary)]">{user.duration}</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
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
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleBlockIP(user.ipAddress)}
                              >
                                <Ban className="w-4 h-4 mr-2" /> Block IP
                              </DropdownMenuItem>
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
              <div className="text-sm text-[var(--text-secondary)]">
                Showing 1–{filteredUsers.length} of {publicUsers.length}
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
