"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Edit,
    Key,
    FileText,
    Ban,
    Trash2,
    Download,
    Filter,
    Shield,
    Building2,
    GraduationCap,
    BarChart3,
    Settings,
    ChevronDown,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : '';
}

// Role config
const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
    ORG_ADMIN: { label: "Org Admin", icon: Building2, color: "bg-blue-100 text-blue-700" },
    TEACHER: { label: "Teacher", icon: GraduationCap, color: "bg-green-100 text-green-700" },
    CONTENT_MANAGER: { label: "Content Mgr", icon: Edit, color: "bg-purple-100 text-purple-700" },
    FEE_MANAGER: { label: "Fee Manager", icon: Shield, color: "bg-orange-100 text-orange-700" },
    RECEPTIONIST: { label: "Receptionist", icon: Users, color: "bg-cyan-100 text-cyan-700" },
    ANALYTICS_VIEWER: { label: "Analytics", icon: BarChart3, color: "bg-amber-100 text-amber-700" },
};

function RoleBadge({ role }: { role: string }) {
    const config = roleConfig[role] || { label: role, icon: Users, color: "bg-gray-100 text-gray-600" };
    const Icon = config.icon;
    return (
        <Badge className={cn(config.color, "gap-1 border-none")}>
            <Icon className="w-3 h-3" />
            {config.label}
        </Badge>
    );
}

function StatusBadge({ status }: { status: boolean }) {
    return (
        <div className="flex items-center justify-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", status ? "bg-green-500" : "bg-gray-400")} />
            <span className={cn("text-xs font-medium", status ? "text-green-700" : "text-gray-500")}>
                {status ? "Active" : "Inactive"}
            </span>
        </div>
    );
}

export default function StaffManagementPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/staff`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const json = await res.json();
            if (json.success) {
                setStaff(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            toast.error("Failed to load staff members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const filteredStaff = staff.filter((s) => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || s.role === roleFilter;
        const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? s.isActive : !s.isActive);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const stats = {
        total: staff.length,
        active: staff.filter(s => s.isActive).length,
        teachers: staff.filter(s => s.role === 'TEACHER').length,
        admins: staff.filter(s => s.role === 'ORG_ADMIN').length
    };

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className="ml-60 flex flex-col min-h-screen">
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                                <p className="text-gray-500 text-sm">Manage employees, teachers, and their access permissions</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" /> Export List
                                </Button>
                                <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2">
                                    <Plus className="w-4 h-4" /> Add Staff Member
                                </Button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                                    <div className="text-sm text-gray-500">Total Staff Members</div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                                    <div className="text-sm text-gray-500">Currently Active</div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-blue-600">{stats.teachers}</div>
                                    <div className="text-sm text-gray-500">Teachers / Creators</div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4">
                                    <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
                                    <div className="text-sm text-gray-500">Administrative Staff</div>
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
                                            <Input
                                                placeholder="Search by name or email..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            {Object.entries(roleConfig).map(([key, cfg]) => (
                                                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active Members</SelectItem>
                                            <SelectItem value="inactive">Inactive Members</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Staff Table */}
                        <Card>
                            <CardHeader className="border-b bg-gray-50/30">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#F4511E]" />
                                    <CardTitle className="text-lg">Staff Directory</CardTitle>
                                    <Badge variant="outline" className="ml-auto bg-white">{filteredStaff.length} Records</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto min-h-[400px]">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-gray-50/50">
                                                    <th className="w-12 p-4"><Checkbox /></th>
                                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase">Staff Member</th>
                                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase">Role</th>
                                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase">Employee ID</th>
                                                    <th className="text-center p-4 font-semibold text-gray-500 text-xs uppercase">Status</th>
                                                    <th className="text-left p-4 font-semibold text-gray-500 text-xs uppercase">Last Login</th>
                                                    <th className="text-center p-4 font-semibold text-gray-500 text-xs uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {filteredStaff.length === 0 ? (
                                                    <tr><td colSpan={7} className="p-12 text-center text-gray-500">No staff members found matching filters</td></tr>
                                                ) : (
                                                    filteredStaff.map((s) => (
                                                        <tr key={s.id} className="hover:bg-gray-50/80 transition-colors group">
                                                            <td className="p-4"><Checkbox /></td>
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="w-9 h-9 border border-gray-100">
                                                                        <AvatarImage src={s.photoUrl || ""} />
                                                                        <AvatarFallback className="bg-brand-primary-tint text-brand-primary font-semibold text-xs">
                                                                            {s.name.split(" ").map((n: string) => n[0]).join("")}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors text-sm">{s.name}</p>
                                                                        <p className="text-xs text-gray-500">{s.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <RoleBadge role={s.role} />
                                                            </td>
                                                            <td className="p-4">
                                                                <p className="text-sm font-medium text-gray-700">{s.staffId}</p>
                                                                <p className="text-[10px] text-gray-400">{s.mobile || "No Mobile"}</p>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <StatusBadge status={s.isActive} />
                                                            </td>
                                                            <td className="p-4 text-xs text-gray-500">
                                                                {s.user?.lastLoginAt ? new Date(s.user.lastLoginAt).toLocaleString() : "Never"}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Profile</DropdownMenuItem>
                                                                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit Permissions</DropdownMenuItem>
                                                                        <DropdownMenuItem><Key className="w-4 h-4 mr-2" /> Reset Password</DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-rose-600"><Trash2 className="w-4 h-4 mr-2" /> Remove Staff</DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
