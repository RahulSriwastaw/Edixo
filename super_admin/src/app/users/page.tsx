"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  User,
  Mail,
  Shield,
  Ban,
  KeyRound,
  Trash2,
  ExternalLink,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : '';
}

// Role Badge Component
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    STUDENT: "bg-blue-50 text-blue-700",
    ORG_STAFF: "bg-purple-50 text-purple-700",
    ORG_ADMIN: "bg-green-50 text-green-700",
    SUPER_ADMIN: "bg-orange-50 text-orange-700",
  };
  const label: Record<string, string> = {
    STUDENT: "Student",
    ORG_STAFF: "Staff",
    ORG_ADMIN: "Org Admin",
    SUPER_ADMIN: "Super Admin",
  };
  return <span className={`badge ${styles[role] || ""}`}>{label[role] || role}</span>;
}

// App Access Badge Component
function AppAccessBadge({ access }: { access: string }) {
  const styles: Record<string, string> = {
    STUDENT: "badge-student",
    MOCKBOOK: "badge-mockbook",
    BOTH: "badge-both",
  };
  return <span className={`badge ${styles[access] || ""}`}>{access}</span>;
}

// Status Badge Component
function StatusBadge({ status }: { status: boolean }) {
  return (
    <span className={`badge ${status ? "badge-active" : "badge-suspended"}`}>
      {status ? "Active" : "Suspended"}
    </span>
  );
}

export default function UsersPage() {
    const { isOpen } = useSidebarStore();
const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`${API_URL}/super-admin/users?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data.users);
        setTotalCount(json.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const hasActiveFilters = searchQuery || roleFilter !== "all" || statusFilter !== "all";

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
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500 text-sm mt-1">
                  All users across all organizations
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {totalCount.toLocaleString()} total users
              </div>
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 input-field"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[130px] input-field">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ORG_STAFF">Staff</SelectItem>
                      <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] input-field">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="btn-primary">Search</Button>
                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="btn-ghost">
                      <X className="w-4 h-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">User</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Role</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Unique ID</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Login</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-gray-500">Loading users...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => {
                        const profile = user.student || user.orgStaff;
                        const org = profile?.org;
                        return (
                          <TableRow key={user.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
                                    {profile?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{profile?.name || "System User"}</div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    {user.email || user.mobile}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <RoleBadge role={user.role} />
                            </TableCell>
                            <TableCell>
                              {profile?.studentId || profile?.staffId ? (
                                <span className="mono text-xs">{profile.studentId || profile.staffId}</span>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {org ? (
                                <Link
                                  href={`/organizations/${org.orgId}`}
                                  className="text-sm text-gray-700 hover:text-brand-primary font-medium"
                                >
                                  {org.name}
                                </Link>
                              ) : (
                                <span className="text-xs text-gray-400">Platform</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={user.isActive} />
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
                                    <User className="w-4 h-4 mr-2" /> View Profile
                                  </DropdownMenuItem>
                                  {org && (
                                    <DropdownMenuItem>
                                      <ExternalLink className="w-4 h-4 mr-2" /> View in Org
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                                  </DropdownMenuItem>
                                  {user.isActive ? (
                                    <DropdownMenuItem className="text-orange-600">
                                      <Ban className="w-4 h-4 mr-2" /> Suspend
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="text-green-600">
                                      <Shield className="w-4 h-4 mr-2" /> Reactivate
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {!loading && totalCount > limit && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount}
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
                  <div className="flex items-center gap-1">
                    {[...Array(Math.ceil(totalCount / limit))].map((_, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className={`w-8 h-8 p-0 ${page === i + 1 ? 'bg-brand-primary text-white hover:bg-brand-primary-hover' : ''}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= totalCount}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
