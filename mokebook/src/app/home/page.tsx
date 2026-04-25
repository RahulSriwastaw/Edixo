"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
    Search, ChevronRight, Loader2, FileText, X,
    Zap, Play, Users, CheckCircle2, Plus
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════

/** Series Card with Enroll button */
function SeriesCard({ series, categoryName, isEnrolled, onEnroll }: { series: any; categoryName: string; isEnrolled: boolean; onEnroll: () => void }) {
    return (
        <div
            className="rounded-lg p-3 transition-all flex flex-col h-full"
            style={{
                background: "var(--bg-card)",
                border: "var(--border-card)",
            }}
        >
            {/* Tags Row */}
            <div className="flex gap-1 mb-2 overflow-x-hidden">
                <span
                    className="text-[8px] font-bold px-1.5 py-[1px] rounded uppercase tracking-tighter"
                    style={{ background: "var(--badge-info-bg)", color: "var(--badge-info-text)" }}
                >
                    {categoryName}
                </span>
                {series.isFree && (
                    <span
                        className="text-[8px] font-bold px-1.5 py-[1px] rounded uppercase tracking-tighter"
                        style={{ background: "var(--badge-success-bg)", color: "var(--badge-success-text)" }}
                    >
                        Free
                    </span>
                )}
            </div>

            {/* Info Row */}
            <div className="flex gap-2.5 mb-3">
                <div
                    className="w-8 h-8 rounded-md flex items-center justify-center p-1.5 shrink-0"
                    style={{ background: "var(--bg-main)", border: "var(--border-card)" }}
                >
                    {series.icon ? (
                        <Image src={series.icon} alt={series.name} width={20} height={20} className="object-contain" />
                    ) : (
                        <FileText className="h-4 w-4" style={{ color: "#FF6B2B" }} />
                    )}
                </div>
                <div className="min-w-0">
                    <h3
                        className="text-[12px] font-semibold leading-tight line-clamp-2 min-h-[28px]"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {series.name}
                    </h3>
                </div>
            </div>

            {/* Stats & Actions */}
            <div className="mt-auto pt-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-medium" style={{ color: "var(--text-muted)" }}>1.2k+ Aspirants</span>
                    <span className="text-[9px] font-semibold" style={{ color: "var(--badge-success-text)" }}>{series.freeTestCount || 5} Free</span>
                </div>

                {isEnrolled ? (
                    <Link href={`/${series.slug || series.id}`}>
                        <button
                            className="w-full h-7 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                            style={{
                                background: "rgba(255,107,43,0.08)",
                                color: "#FF6B2B",
                                border: "1px solid rgba(255,107,43,0.2)",
                            }}
                        >
                            <CheckCircle2 className="h-3 w-3" />
                            Enrolled
                        </button>
                    </Link>
                ) : (
                    <button
                        onClick={onEnroll}
                        className="w-full h-7 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                        style={{
                            background: "#FF6B2B",
                            color: "#fff",
                        }}
                    >
                        <Plus className="h-3 w-3" />
                        Enroll Now
                    </button>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════

export default function TestHomePage() {
    const [folders, setFolders] = useState<any[]>([]);
    const [seriesByFolder, setSeriesByFolder] = useState<Record<string, any[]>>({});
    const [activeFolderId, setActiveFolderId] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [testSearch, setTestSearch] = useState("");
    const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const [foldersRes, seriesRes, enrollRes] = await Promise.all([
                    apiFetch("/mockbook/folders"),
                    apiFetch("/mockbook/categories"),
                    apiFetch("/mockbook/enrollments/my").catch(() => ({ data: [] }))
                ]);

                const fetchedFolders = foldersRes.data || [];
                setFolders(fetchedFolders);

                if (seriesRes.success) {
                    const grouped: Record<string, any[]> = {};
                    (seriesRes.data || []).forEach((s: any) => {
                        const fId = s.folderId || "other";
                        if (!grouped[fId]) grouped[fId] = [];
                        grouped[fId].push(s);
                    });
                    setSeriesByFolder(grouped);
                }

                const enrollments = enrollRes.data || [];
                setEnrolledIds(new Set(enrollments.map((e: any) => e.seriesId)));
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleEnroll = async (seriesId: string) => {
        try {
            await apiFetch("/mockbook/enrollments", {
                method: "POST",
                body: JSON.stringify({ seriesId })
            });
            setEnrolledIds(prev => new Set(prev).add(seriesId));
        } catch (err) {
            console.error("Enroll failed", err);
            alert("Enrollment failed. Please try again.");
        }
    };

    const activeCat = folders.find(f => f.id === activeFolderId);
    const allSeries = Object.values(seriesByFolder).flat();
    const currentSeries = activeFolderId === "all" ? allSeries : (seriesByFolder[activeFolderId] || []);

    const filteredSeries = currentSeries.filter(s =>
        s.name.toLowerCase().includes(testSearch.toLowerCase())
    );

    return (
        <div
            className="flex flex-col min-h-screen font-sans antialiased"
            style={{
                background: "var(--bg-body)",
                color: "var(--text-primary)",
            }}
        >
            <Navbar />

            <div className="flex-1 flex overflow-hidden">
                <Sidebar />

                <main
                    className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-10"
                    style={{ background: "var(--bg-main)" }}
                >
                    {/* SEARCH HEADER */}
                    <div
                        className="px-4 py-3 md:px-6"
                        style={{
                            background: "var(--bg-sidebar)",
                            borderBottom: "var(--divider)",
                        }}
                    >
                        <div className="max-w-3xl mx-auto relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors" style={{ color: "var(--text-muted)" }} />
                            <input
                                type="text"
                                placeholder="Search all test series (e.g. SSC CGL, RRB NTPC...)"
                                value={testSearch}
                                onChange={e => setTestSearch(e.target.value)}
                                className="w-full h-9 pl-10 pr-4 rounded-md text-[12px] font-medium transition-all"
                                style={{
                                    background: "var(--bg-input)",
                                    border: "1px solid var(--border-input)",
                                    color: "var(--text-primary)",
                                }}
                            />
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-10">

                        {/* ALL TEST SERIES SECTION */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[16px] font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF6B2B" }} />
                                    Explore All Test Series
                                </h2>
                                <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                                    {allSeries.length} Series Available
                                </span>
                            </div>

                            {/* Category Filter Tabs */}
                            <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-2">
                                <button
                                    onClick={() => setActiveFolderId("all")}
                                    className={cn(
                                        "px-3.5 h-7 flex items-center justify-center rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                                        activeFolderId === "all" ? "text-white" : "hover:opacity-80"
                                    )}
                                    style={{
                                        background: activeFolderId === "all" ? "#FF6B2B" : "var(--bg-card)",
                                        color: activeFolderId === "all" ? "#FFFFFF" : "var(--text-secondary)",
                                        border: activeFolderId === "all" ? "none" : "var(--border-card)",
                                    }}
                                >
                                    All Exams
                                </button>
                                {folders.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveFolderId(cat.id)}
                                        className={cn(
                                            "px-3.5 h-7 flex items-center justify-center rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                                            activeFolderId === cat.id ? "text-white" : "hover:opacity-80"
                                        )}
                                        style={{
                                            background: activeFolderId === cat.id ? "#FF6B2B" : "var(--bg-card)",
                                            color: activeFolderId === cat.id ? "#FFFFFF" : "var(--text-secondary)",
                                            border: activeFolderId === cat.id ? "none" : "var(--border-card)",
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {loading ? (
                                    [...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-44 rounded-lg animate-pulse"
                                            style={{ background: "var(--bg-card)", border: "var(--border-card)" }}
                                        />
                                    ))
                                ) : filteredSeries.length > 0 ? (
                                    filteredSeries.map(s => (
                                        <SeriesCard
                                            key={s.id}
                                            series={s}
                                            categoryName={activeCat?.name || "Exam"}
                                            isEnrolled={enrolledIds.has(s.id)}
                                            onEnroll={() => handleEnroll(s.id)}
                                        />
                                    ))
                                ) : (
                                    <div
                                        className="col-span-full rounded-lg p-10 text-center border-2 border-dashed"
                                        style={{ background: "var(--bg-card)", borderColor: "var(--border-input)" }}
                                    >
                                        <p className="font-semibold mb-3" style={{ color: "var(--text-muted)" }}>No test series found in this category.</p>
                                        <button onClick={() => setActiveFolderId("all")} className="font-bold hover:underline" style={{ color: "#FF6B2B" }}>Explore All Exams →</button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
