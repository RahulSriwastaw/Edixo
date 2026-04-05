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
    GraduationCap,
    History,
    Trash2,
    Download,
    Filter,
    CreditCard,
    BookOpen,
    Calendar,
    ChevronLeft,
    ChevronRight,
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

function StatusBadge({ status }: { status: boolean }) {
    return (
        <Badge className={cn(status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700", "border-none capitalize")}>
            {status ? 'Active' : 'Inactive'}
        </Badge>
    );
}

function FeesBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        PAID: "bg-emerald-100 text-emerald-700",
        PARTIAL: "bg-amber-100 text-amber-700",
        OVERDUE: "bg-rose-100 text-rose-700",
        PENDING: "bg-blue-100 text-blue-700",
    };
    return (
        <Badge className={cn(colors[status] || "bg-gray-100 text-gray-700", "border-none capitalize")}>
            {status}
        </Badge>
    );
}

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [batchFilter, setBatchFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

    const fetchBatches = async () => {
        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/batches`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const json = await res.json();
            if (json.success) setBatches(json.data);
        } catch (error) {
            console.error("Failed to fetch batches:", error);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) params.append('search', search);
            if (batchFilter !== 'all') params.append('batchId', batchFilter);

            const res = await fetch(`${API_URL}/students?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const json = await res.json();
            if (json.success) {
                setStudents(json.data.students);
                setTotal(json.data.total);
            }
        } catch (error) {
            console.error("Failed to fetch students:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, batchFilter]);

    const totalPages = Math.ceil(total / limit);

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
                                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                                <p className="text-gray-500 text-sm mt-1">Manage your student roster, admissions, and fee status</p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" /> Export List
                                </Button>
                                <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2">
                                    <Plus className="w-4 h-4" /> New Admission
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats (Semi-Real based on fetched data for now) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{total}</div>
                                        <div className="text-xs text-gray-500">Total Students</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{students.filter(s => new Date(s.enrolledAt).getMonth() === new Date().getMonth()).length}</div>
                                        <div className="text-xs text-gray-500">New This Month</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">₹0</div>
                                        <div className="text-xs text-gray-500">Fees Collected</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-soft transition-all">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">0</div>
                                        <div className="text-xs text-gray-500">Fee Overdue</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters & Actions */}
                        <Card>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex-1 relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search by name, email or phone..."
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select value={batchFilter} onValueChange={(val) => { setBatchFilter(val); setPage(1); }}>
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="All Batches" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Batches</SelectItem>
                                            {batches.map(batch => (
                                                <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon">
                                        <Filter className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Students Table */}
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto min-h-[400px]">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-64">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-gray-50/50">
                                                    <th className="p-4 w-12 text-left">
                                                        <Checkbox />
                                                    </th>
                                                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Batch & Mobile</th>
                                                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Reg. Date</th>
                                                    <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                    <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Tests</th>
                                                    <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {students.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                                            No students found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    students.map((student) => (
                                                        <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                                                            <td className="p-4">
                                                                <Checkbox />
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-9 w-9 border border-gray-100">
                                                                        <AvatarImage src={student.photoUrl || ""} />
                                                                        <AvatarFallback className="bg-brand-primary-tint text-brand-primary font-semibold text-xs">
                                                                            {student.name.split(" ").map((n: string) => n[0]).join("")}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">
                                                                            {student.name}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">{student.studentId}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {student.batchEnrollments?.[0]?.batch?.name || "No Batch"}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{student.mobile || "N/A"}</div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="text-sm text-gray-600">
                                                                    {new Date(student.enrolledAt).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <StatusBadge status={student.isActive} />
                                                            </td>
                                                            <td className="p-4 text-center text-sm">
                                                                {student.testsCompleted}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem>
                                                                            <Eye className="w-4 h-4 mr-2" /> View Profile
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Edit className="w-4 h-4 mr-2" /> Edit Details
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <BookOpen className="w-4 h-4 mr-2" /> Academic Performance
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <CreditCard className="w-4 h-4 mr-2" /> Fee Ledger
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-rose-600">
                                                                            <Trash2 className="w-4 h-4 mr-2" /> Remove Student
                                                                        </DropdownMenuItem>
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
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                                </Button>
                                <div className="text-sm font-medium px-4">
                                    Page {page} of {totalPages || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
