"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import {
    AlertCircle,
    Search,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Filter,
    ArrowUpRight,
    Clock,
    User,
    MessageSquare,
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
import { toast } from "sonner";

interface QuestionReport {
    id: string;
    questionId: string;
    reporterId: string;
    reporterName: string;
    reason: string;
    description: string;
    status: "PENDING" | "RESOLVED" | "REJECTED";
    createdAt: string;
    question: {
        id: string;
        questionId: string;
        textEn: string;
        textHi: string;
    };
}

function getToken(): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
    return match ? match[1] : '';
}

export default function ReportsPage() {
      const { isOpen } = useSidebarStore();
const [reports, setReports] = useState<QuestionReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchReports();
    }, [statusFilter]);

    const fetchReports = async () => {
        try {
            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/qbank/reports`);
            if (statusFilter !== "all") url.searchParams.append("status", statusFilter);

            const token = getToken();
            const res = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setReports(data.data);
            }
        } catch (err) {
            toast.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId: string, status: string) => {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/qbank/reports/${reportId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Report status updated to ${status}`);
                fetchReports();
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING": return <Badge className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
            case "RESOLVED": return <Badge className="bg-green-50 text-green-600 border-green-200">Resolved</Badge>;
            case "REJECTED": return <Badge className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const getReasonLabel = (reason: string) => {
        const reasons: Record<string, string> = {
            typo: "Typo Error",
            wrong_answer: "Wrong Answer",
            missing_content: "Missing Content",
            other: "Other Issue",
        };
        return reasons[reason] || reason;
    };

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Question Reports</h1>
                                <p className="text-gray-500 text-sm mt-1">Review and fix reported issues in questions</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] bg-white">
                                        <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                        <SelectValue placeholder="Status Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="kpi-card">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{reports.filter(r => r.status === 'PENDING').length}</div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending Reports</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="kpi-card">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{reports.filter(r => r.status === 'RESOLVED').length}</div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Resolved</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="kpi-card">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{reports.filter(r => r.status === 'REJECTED').length}</div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Rejected</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="kpi-card">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Reports</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Reports Table */}
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-[100px]">Date</TableHead>
                                            <TableHead>Question ID</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead className="w-[300px]">Description</TableHead>
                                            <TableHead>Reporter</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                                    Loading reports...
                                                </TableCell>
                                            </TableRow>
                                        ) : reports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-gray-500 text-lg">
                                                    No reports found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            reports.map((report) => (
                                                <TableRow key={report.id} className="hover:bg-brand-primary-tint transition-colors">
                                                    <TableCell className="text-sm text-gray-600">
                                                        {new Date(report.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{report.question.questionId}</span>
                                                            <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                                                {report.question.textEn || report.question.textHi}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[11px] uppercase tracking-tighter">
                                                            {getReasonLabel(report.reason)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-start gap-2 max-w-[300px]">
                                                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-1" />
                                                            <span className="text-sm text-gray-600 line-clamp-2">
                                                                {report.description || "No description provided."}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-sm text-gray-700">{report.reporterName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(report.status)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem onClick={() => window.open(`/question-bank/questions/${report.question.id}/edit`, '_blank')}>
                                                                    <Pencil className="w-4 h-4 mr-2" /> Fix Question
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, "RESOLVED")}>
                                                                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Mark as Resolved
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(report.id, "REJECTED")}>
                                                                    <XCircle className="w-4 h-4 mr-2 text-red-600" /> Reject Report
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Report
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
