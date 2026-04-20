"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Radio, Clock, ChevronRight, Loader2, Calendar,
    Users, Play, XCircle, RefreshCw, Zap, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { mockbookService, MockTest } from "@/services/mockbookService";
import { toast } from "sonner";

function LiveTimer({ startedAt }: { startedAt: string }) {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const start = new Date(startedAt).getTime();
        const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
        return () => clearInterval(id);
    }, [startedAt]);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return <span className="font-mono text-xs text-green-600">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')} elapsed</span>;
}

export default function LiveMonitorPage() {
    const { isOpen } = useSidebarStore();
    const [data, setData] = useState<{ live: MockTest[]; scheduled: MockTest[] }>({ live: [], scheduled: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [statusChanging, setStatusChanging] = useState<string | null>(null);
    const [endConfirm, setEndConfirm] = useState<MockTest | null>(null);

    const loadData = useCallback(async () => {
        try {
            const result = await mockbookService.getLiveAndScheduledTests();
            setData(result);
            setLastRefresh(new Date());
        } catch {
            toast.error("Failed to refresh live tests");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        // Auto-refresh every 30 seconds
        const id = setInterval(loadData, 30000);
        return () => clearInterval(id);
    }, [loadData]);

    const handlePublish = async (test: MockTest) => {
        setStatusChanging(test.id);
        try {
            await mockbookService.changeMockTestStatus(test.id, "LIVE");
            toast.success(`"${test.name}" is now LIVE`);
            loadData();
        } catch {
            toast.error("Failed to publish test");
        } finally {
            setStatusChanging(null);
        }
    };

    const handleEnd = async () => {
        if (!endConfirm) return;
        setStatusChanging(endConfirm.id);
        try {
            await mockbookService.changeMockTestStatus(endConfirm.id, "ENDED");
            toast.success(`"${endConfirm.name}" has been ended`);
            setEndConfirm(null);
            loadData();
        } catch {
            toast.error("Failed to end test");
        } finally {
            setStatusChanging(null);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-bg">
            <Sidebar />
            <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
                <TopBar />
                <main className="flex-1 p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/mockbook" className="hover:text-orange-600">MockBook</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">Live Monitor</span>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse inline-block" />
                                    Live Monitor
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Real-time view of live and upcoming tests · Auto-refreshes every 30s
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">
                                    Last: {lastRefresh.toLocaleTimeString()}
                                </span>
                                <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                                    <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="py-24 text-center flex flex-col items-center gap-3">
                                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                                <p className="text-sm text-gray-400">Loading live tests...</p>
                            </div>
                        ) : (
                            <>
                                {/* Live Tests */}
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Radio className="w-4 h-4 text-green-600" />
                                        Currently Live
                                        <Badge className="bg-green-100 text-green-700 border border-green-200 text-[10px]">{data.live.length}</Badge>
                                    </h2>

                                    {data.live.length === 0 ? (
                                        <Card>
                                            <CardContent className="p-10 text-center space-y-2">
                                                <Radio className="w-10 h-10 text-gray-200 mx-auto" />
                                                <p className="text-gray-400 text-sm">No tests are currently live</p>
                                                <p className="text-xs text-gray-300">Publish a test from the Mock Tests page</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {data.live.map(test => (
                                                <Card key={test.id} className="border-green-200 bg-green-50/30 shadow-sm">
                                                    <CardContent className="p-5">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                                                <Badge className="bg-green-100 text-green-700 border border-green-200 text-[10px]">LIVE</Badge>
                                                            </div>
                                                            {test.scheduledAt && (
                                                                <LiveTimer startedAt={test.scheduledAt} />
                                                            )}
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
                                                            {test.name}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" />
                                                                {(test as any)._count?.attempts || 0} attempts
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {test.durationMins}m
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="w-full text-xs h-8"
                                                            onClick={() => setEndConfirm(test)}
                                                            disabled={statusChanging === test.id}
                                                        >
                                                            {statusChanging === test.id
                                                                ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                : <XCircle className="w-3 h-3 mr-1" />
                                                            }
                                                            End Test
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Scheduled Tests */}
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        Upcoming Scheduled
                                        <Badge className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px]">{data.scheduled.length}</Badge>
                                    </h2>

                                    {data.scheduled.length === 0 ? (
                                        <Card>
                                            <CardContent className="p-10 text-center space-y-2">
                                                <Calendar className="w-10 h-10 text-gray-200 mx-auto" />
                                                <p className="text-gray-400 text-sm">No scheduled tests</p>
                                                <p className="text-xs text-gray-300">Set scheduledAt when creating a test</p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {data.scheduled.map(test => (
                                                <Card key={test.id} className="border-blue-100">
                                                    <CardContent className="p-5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Calendar className="w-4 h-4 text-blue-500" />
                                                            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">SCHEDULED</Badge>
                                                        </div>
                                                        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{test.name}</h3>
                                                        {test.scheduledAt && (
                                                            <p className="text-xs text-gray-500 mb-3">
                                                                <Clock className="w-3 h-3 inline mr-1" />
                                                                {new Date(test.scheduledAt).toLocaleString("en-IN", {
                                                                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                                                })}
                                                            </p>
                                                        )}
                                                        <div className="flex gap-2 mt-3">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 btn-primary text-xs h-8"
                                                                onClick={() => handlePublish(test)}
                                                                disabled={statusChanging === test.id}
                                                            >
                                                                {statusChanging === test.id
                                                                    ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                    : <Play className="w-3 h-3 mr-1" />
                                                                }
                                                                Publish Now
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* End Confirm Dialog */}
            <Dialog open={!!endConfirm} onOpenChange={() => setEndConfirm(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" /> End Live Test
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to end <strong>{endConfirm?.name}</strong>? Students who haven't submitted yet will be unable to continue.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEndConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleEnd} disabled={!!statusChanging}>
                            {statusChanging && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            End Test Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
