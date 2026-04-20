"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import {
    ChevronRight, GripVertical, Star, BookOpen, Users,
    Plus, Eye, ToggleLeft, ToggleRight, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import { mockbookService, ExamSeries } from "@/services/mockbookService";
import { useEffect } from "react";

// No longer needed: initialFeatured and categoryFeatured lists

export default function FeaturedPage() {
    const { isOpen } = useSidebarStore();
    const [series, setSeries] = useState<ExamSeries[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const data = await mockbookService.getSeries();
                setSeries(data.sort((a, b) => a.sortOrder - b.sortOrder));
            } catch (error) {
                toast.error("Failed to load test series");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSeries();
    }, []);

    const toggleFeatured = async (id: string, current: boolean) => {
        try {
            await mockbookService.updateSeries(id, { isFeatured: !current });
            setSeries(prev => prev.map(s => s.id === id ? { ...s, isFeatured: !current } : s));
            toast.success("Featured status updated");
        } catch (error) {
            toast.error("Failed to update featured status");
        }
    };

    const saveOrder = async () => {
        try {
            await Promise.all(series.map((s, i) => mockbookService.updateSeries(s.id, { sortOrder: i })));
            toast.success("Order saved successfully!");
        } catch (error) {
            toast.error("Failed to save order");
        }
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        setSeries(prev => {
            const arr = [...prev];
            [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
            return arr;
        });
    };

    const moveDown = (index: number) => {
        setSeries(prev => {
            if (index >= prev.length - 1) return prev;
            const arr = [...prev];
            [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
            return arr;
        });
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">Loading series...</div>;
    const featuredSeries = series.filter(s => s.isFeatured);

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Featured Series</span>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Featured Series Management</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Control which series appear prominently on the MockVeda homepage
                                </p>
                            </div>
                            <Button className="btn-primary" onClick={saveOrder}>
                                Save Order
                            </Button>
                        </div>

                        {/* Info Banner */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                            <Info className="w-4 h-4 shrink-0" />
                            <span>Featured series appear at the top of the MockVeda homepage and in "Recommended For You" sections. Students see the series in the order shown below.</span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-800">{featuredSeries.length} featured</span>
                            </div>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">{series.length} total series</span>
                            </div>
                        </div>

                        {/* Homepage Featured — Ordered list */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    Homepage Featured Order
                                </CardTitle>
                                <CardDescription>
                                    These series appear on the MockVeda homepage in this order (drag or use arrows to reorder)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {series.map((s, i) => (
                                    <div
                                        key={s.id}
                                        className={cn(
                                            "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                            s.isFeatured
                                                ? "border-yellow-200 bg-yellow-50/40"
                                                : "border-gray-100 bg-gray-50 opacity-60"
                                        )}
                                    >
                                        {/* Drag handle */}
                                        <div className="flex flex-col gap-0.5 cursor-grab">
                                            <GripVertical className="w-4 h-4 text-gray-300" />
                                        </div>

                                        {/* Position */}
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                                            s.isFeatured ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-500"
                                        )}>
                                            {i + 1}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 text-sm truncate">{s.name}</div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                <span>SSC</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{((s as any).enrolledCount || 0).toLocaleString()} enrolled</span>
                                            </div>
                                        </div>

                                        {/* Featured toggle */}
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={cn("text-[10px]", s.isFeatured ? "border-yellow-300 text-yellow-700" : "border-gray-200 text-gray-500")}>
                                                {s.isFeatured ? "Featured" : "Not Featured"}
                                            </Badge>
                                            <button
                                                onClick={() => toggleFeatured(s.id, s.isFeatured)}
                                                className="text-gray-400 hover:text-orange-500 transition-colors"
                                            >
                                                {s.isFeatured
                                                    ? <ToggleRight className="w-6 h-6 text-orange-500" />
                                                    : <ToggleLeft className="w-6 h-6" />}
                                            </button>
                                        </div>

                                        {/* Order arrows */}
                                        <div className="flex flex-col gap-0.5">
                                            <button
                                                disabled={i === 0}
                                                onClick={() => moveUp(i)}
                                                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                disabled={i === series.length - 1}
                                                onClick={() => moveDown(i)}
                                                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-lg"
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <Button variant="outline" className="w-full mt-2">
                                    <Plus className="w-4 h-4 mr-2" /> Add Series to Featured
                                </Button>
                            </CardContent>
                        </Card>

                                <div className="p-10 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed">
                                    Category-wise specific reordering will be enabled as we refine the homepage layout.
                                </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
