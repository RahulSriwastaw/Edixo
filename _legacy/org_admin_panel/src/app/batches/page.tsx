"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Calendar,
    Clock,
    BookOpen,
    GraduationCap,
    ChevronRight,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Global API utility
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken(): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : '';
}

export default function BatchesPage() {
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_URL}/batches`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const json = await res.json();
            if (json.success) {
                setBatches(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch batches:", error);
            toast.error("Failed to load batches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const filteredBatches = batches.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(search.toLowerCase()))
    );

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
                                <h1 className="text-2xl font-bold text-gray-900">Manage Batches</h1>
                                <p className="text-gray-500 text-sm mt-1">Organize students into batches and assign teachers</p>
                            </div>
                            <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white gap-2 shadow-lg shadow-orange-500/20">
                                <Plus className="w-4 h-4" /> Create New Batch
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search batches or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11 border-gray-200 focus:border-brand-primary"
                                />
                            </div>
                        </div>

                        {/* Batches Grid */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                            </div>
                        ) : filteredBatches.length === 0 ? (
                            <Card className="p-12 text-center text-gray-500">
                                No batches found. Create your first batch to get started!
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBatches.map((batch) => (
                                    <Card key={batch.id} className="hover:shadow-md transition-all hover:-translate-y-1 group border-none shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-green-100 text-green-700 border-none text-[10px]">
                                                            Active
                                                        </Badge>
                                                        <span className="text-[10px] text-gray-400 font-medium">Created {new Date(batch.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <CardTitle className="text-lg group-hover:text-brand-primary transition-colors cursor-pointer">
                                                        {batch.name}
                                                    </CardTitle>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                                                        <BookOpen className="w-3 h-3" /> {batch.description || "No description provided"}
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit Batch</DropdownMenuItem>
                                                        <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> Manage Students</DropdownMenuItem>
                                                        <DropdownMenuItem><Calendar className="w-4 h-4 mr-2" /> Class Schedule</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-rose-600"><Trash2 className="w-4 h-4 mr-2" /> Delete Batch</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-3 space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>{batch._count?.students || 0} Students Enrolled</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs font-medium">
                                                    <span className="text-gray-500">Utilization</span>
                                                    <span className="text-gray-900">{Math.round((batch._count?.students || 0) / 50 * 100)}%</span>
                                                </div>
                                                <Progress value={(batch._count?.students || 0) / 50 * 100} className="h-1.5 bg-gray-100" />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-2">
                                            <div className="w-full flex items-center justify-between text-xs text-gray-500">
                                                <Button variant="ghost" size="sm" className="w-full text-brand-primary text-[11px] group">
                                                    View Details <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
