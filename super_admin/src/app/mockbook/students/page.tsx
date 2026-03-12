"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search, Users, ChevronRight, Loader2, FileText,
    TrendingUp, Target, CheckCircle2, Phone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService, AdminStudent } from "@/services/mockbookService";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

export default function MockbookStudentsPage() {
    const { isOpen } = useSidebarStore();
    const router = useRouter();
    const [students, setStudents] = useState<AdminStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await mockbookService.getAdminStudents();
            setStudents(data);
        } catch {
            toast.error("Failed to load students");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return s.name?.toLowerCase().includes(q) ||
            s.studentId?.toLowerCase().includes(q) ||
            s.phone?.includes(q);
    });

    const totalAttempts = students.reduce((a, s) => a + s.totalAttempts, 0);
    const activeStudents = students.filter(s => s.isActive).length;
    const avgScore = students.length > 0
        ? (students.filter(s => s.avgScore !== null).reduce((a, s) => a + Number(s.avgScore), 0) /
            Math.max(students.filter(s => s.avgScore !== null).length, 1)).toFixed(1)
        : "—";

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Students</span>
                        </div>

                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                View all students, their test attempts, and performance analytics
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: "Total Students", value: students.length, icon: Users },
                                { label: "Active", value: activeStudents, icon: CheckCircle2 },
                                { label: "Total Attempts", value: totalAttempts.toLocaleString(), icon: Target },
                                { label: "Avg Score", value: avgScore, icon: TrendingUp },
                            ].map(stat => (
                                <Card key={stat.label} className="kpi-card">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-orange-50">
                                            <stat.icon className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">{stat.label}</div>
                                            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Search */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search by name, student ID, or phone..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="pl-9 input-field"
                                        />
                                    </div>
                                    {search && (
                                        <Button variant="ghost" onClick={() => setSearch("")}>Clear</Button>
                                    )}
                                    <span className="ml-auto text-sm text-gray-500">{filtered.length} students</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-16 text-center flex flex-col items-center gap-3 text-gray-400">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                        <p className="text-sm">Loading students...</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="p-16 text-center space-y-3">
                                        <Users className="w-14 h-14 text-gray-200 mx-auto" />
                                        <p className="text-gray-500 font-medium">No students found</p>
                                        <p className="text-sm text-gray-400">Students appear here once they register and attempt tests</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Student ID</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Contact</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Total Attempts</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Avg Score</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                                                <TableHead className="text-xs font-semibold text-gray-500 uppercase">Joined</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filtered.map(student => (
                                                <TableRow 
                                                    key={student.id} 
                                                    className="hover:bg-orange-50/30 cursor-pointer"
                                                    onClick={() => router.push(`/mockbook/students/${student.id}`)}
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="text-xs font-bold bg-orange-100 text-orange-700">
                                                                    {student.name?.charAt(0).toUpperCase() || "?"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="font-medium text-sm text-gray-900">{student.name || "Unnamed"}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-mono text-gray-500">{student.studentId}</TableCell>
                                                    <TableCell>
                                                        {student.phone ? (
                                                            <span className="flex items-center gap-1 text-xs text-gray-600">
                                                                <Phone className="w-3 h-3" /> {student.phone}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-300">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="font-semibold text-sm text-gray-800">{student.totalAttempts}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {student.avgScore !== null ? (
                                                            <span className="font-semibold text-sm text-emerald-600">{student.avgScore}%</span>
                                                        ) : (
                                                            <span className="text-xs text-gray-300">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn("text-[10px]", student.isActive
                                                                ? "bg-green-50 text-green-700 border-green-200"
                                                                : "bg-gray-50 text-gray-500 border-gray-200"
                                                            )}
                                                        >
                                                            {student.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-gray-500">
                                                        {new Date(student.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
