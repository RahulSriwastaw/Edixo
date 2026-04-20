"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Eye,
  Square,
  Copy,
  Monitor,
  Clock,
  Users,
  Activity,
  Wifi,
  Download,
  Plus,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { digitalBoardService, WhiteboardSettings } from "@/services/digitalBoardService";
import { toast } from "sonner";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Live sessions data
const liveSessions = [
  {
    id: "SET-2A94F",
    organization: "Apex Academy",
    viewers: 23,
    duration: "00:42:10",
    platform: "Windows",
    teacher: "Rajesh Kumar",
    startedAt: "10 min ago",
  },
  {
    id: "SET-7B12C",
    organization: "Public Access",
    viewers: 5,
    duration: "00:12:30",
    platform: "Android",
    teacher: null,
    startedAt: "12 min ago",
  },
  {
    id: "SET-3D56E",
    organization: "Excel Institute",
    viewers: 45,
    duration: "00:58:42",
    platform: "Windows",
    teacher: "Amit Verma",
    startedAt: "1 hour ago",
  },
  {
    id: "SET-8F23A",
    organization: "Prime Tutorials",
    viewers: 18,
    duration: "00:25:15",
    platform: "Android",
    teacher: "Priya Sharma",
    startedAt: "25 min ago",
  },
  {
    id: "SET-5G89B",
    organization: "Knowledge Park",
    viewers: 32,
    duration: "01:15:00",
    platform: "Windows",
    teacher: "Suresh Patel",
    startedAt: "1 hour ago",
  },
];

// App releases data
const appReleases = [
  {
    platform: "Windows",
    icon: "🪟",
    version: "v2.4.1",
    status: "Live",
    installs: 3241,
    lastUpdated: "Feb 28, 2026",
    changelog: "Bug fixes and performance improvements",
  },
  {
    platform: "Android",
    icon: "🤖",
    version: "v2.4.0",
    status: "Live",
    installs: 8102,
    lastUpdated: "Feb 20, 2026",
    changelog: "New drawing tools, improved stability",
  },
  {
    platform: "iOS",
    icon: "🍎",
    version: "v2.3.9",
    status: "Under Review",
    installs: 2890,
    lastUpdated: "Feb 15, 2026",
    changelog: "iOS 18 compatibility update",
  },
];

// Set IDs data
const setIDs = [
  {
    id: "SET-2A94F",
    organization: "Apex Academy",
    teacher: "Rajesh Kumar",
    status: "Active",
    createdAt: "Feb 10, 2026",
    sessions: 45,
    lastUsed: "10 min ago",
  },
  {
    id: "SET-7B12C",
    organization: "Public Access",
    teacher: null,
    status: "Active",
    createdAt: "Mar 01, 2026",
    sessions: 12,
    lastUsed: "12 min ago",
  },
  {
    id: "SET-3D56E",
    organization: "Excel Institute",
    teacher: "Amit Verma",
    status: "Active",
    createdAt: "Jan 25, 2026",
    sessions: 89,
    lastUsed: "1 hour ago",
  },
  {
    id: "SET-4C78G",
    organization: "Success Classes",
    teacher: "Neha Gupta",
    status: "Inactive",
    createdAt: "Jan 15, 2026",
    sessions: 34,
    lastUsed: "2 weeks ago",
  },
  {
    id: "SET-9H12D",
    organization: "Prime Tutorials",
    teacher: "Priya Sharma",
    status: "Active",
    createdAt: "Feb 05, 2026",
    sessions: 67,
    lastUsed: "25 min ago",
  },
];

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Live: "badge-active",
    Active: "badge-active",
    Inactive: "bg-gray-100 text-gray-600",
    "Under Review": "badge-pending",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Platform Badge
function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    Windows: "bg-blue-50 text-blue-700",
    Android: "bg-green-50 text-green-700",
    iOS: "bg-gray-50 text-gray-700",
  };
  return <span className={`badge ${styles[platform] || ""}`}>{platform}</span>;
}

export default function DigitalBoardPage() {
  const { isOpen } = useSidebarStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [wbSettings, setWbSettings] = useState<WhiteboardSettings | null>(null);

  const selectedOrgId = null;
  const selectedOrg = null;

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setIsLoading(true);
        // Using a default 'global' or 'system' id if needed, or update service to handle null
        const settingsRes = await digitalBoardService.getSettings("global"); 
        setWbSettings(settingsRes);
      } catch (error) {
        console.error("Failed to fetch digital board settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrgData();
  }, [selectedOrgId]);

  const handleUpdateSetting = async (key: keyof WhiteboardSettings, value: any) => {
    if (!wbSettings) return;
    const newSettings = { ...wbSettings, [key]: value };
    setWbSettings(newSettings);
    try {
      await digitalBoardService.updateSettings("global", { [key]: value });
      toast.success("Settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
      setWbSettings(wbSettings); // Rollback
    }
  };

  const handleEndSession = (sessionId: string) => {
    toast.success(`Session ${sessionId} ended successfully`);
  };

  const handleCopyID = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`Copied ${id} to clipboard`);
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Digital Board</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage whiteboard sessions, Set IDs, and app releases
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  className={autoRefresh ? "btn-primary" : "btn-secondary"}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                  Auto-refresh: {autoRefresh ? "30s" : "Off"}
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Live Sessions</div>
                      <div className="text-xl font-bold text-gray-900">47</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Total Viewers</div>
                      <div className="text-xl font-bold text-gray-900">1,247</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Active Set IDs</div>
                      <div className="text-xl font-bold text-gray-900">156</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">24h Sessions</div>
                      <div className="text-xl font-bold text-gray-900">892</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="sessions" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Live Sessions
                </TabsTrigger>
                <TabsTrigger value="sets" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Set IDs
                </TabsTrigger>
                <TabsTrigger value="releases" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  App Releases
                </TabsTrigger>
                <TabsTrigger value="assets" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Assets
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Live Sessions Tab */}
              <TabsContent value="sessions" className="mt-6 space-y-4">
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <CardTitle className="text-lg">Live Sessions</CardTitle>
                      <Badge className="bg-green-50 text-green-700">{liveSessions.length} active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Set ID</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Teacher</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Viewers</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Duration</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Platform</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Started</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {liveSessions
                          .map((session) => (
                          <TableRow key={session.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-brand-primary">{session.id}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-gray-400 hover:text-brand-primary"
                                  onClick={() => handleCopyID(session.id)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-900">{session.organization}</span>
                            </TableCell>
                            <TableCell>
                              {session.teacher ? (
                                <span className="text-sm text-gray-700">{session.teacher}</span>
                              ) : (
                                <span className="text-sm text-gray-400">Public Session</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{session.viewers}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm text-gray-600">{session.duration}</span>
                            </TableCell>
                            <TableCell>
                              <PlatformBadge platform={session.platform} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">{session.startedAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" className="text-brand-primary">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleEndSession(session.id)}
                                >
                                  <Square className="w-4 h-4 mr-1" />
                                  End
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Set IDs Tab */}
              <TabsContent value="sets" className="mt-6 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search Set IDs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 input-field"
                        />
                      </div>
                      <Button className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Set ID
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Set ID</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Teacher</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-center">Sessions</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Created</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Last Used</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {setIDs.map((set) => (
                          <TableRow key={set.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-brand-primary">{set.id}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-gray-400 hover:text-brand-primary"
                                  onClick={() => handleCopyID(set.id)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-900">{set.organization}</span>
                            </TableCell>
                            <TableCell>
                              {set.teacher ? (
                                <span className="text-sm text-gray-700">{set.teacher}</span>
                              ) : (
                                <span className="text-sm text-gray-400">Public</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={set.status} />
                            </TableCell>
                            <TableCell className="text-center text-sm">{set.sessions}</TableCell>
                            <TableCell className="text-sm text-gray-500">{set.createdAt}</TableCell>
                            <TableCell className="text-sm text-gray-500">{set.lastUsed}</TableCell>
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
                                  <DropdownMenuItem>
                                    <Copy className="w-4 h-4 mr-2" /> Copy ID
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Revoke ID
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
              </TabsContent>

              {/* App Releases Tab */}
              <TabsContent value="releases" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {appReleases.map((release) => (
                    <Card key={release.platform} className="kpi-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{release.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900">{release.platform} App</div>
                              <div className="text-sm text-gray-500">{release.version}</div>
                            </div>
                          </div>
                          <StatusBadge status={release.status} />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Total Installs</span>
                            <span className="font-semibold text-gray-900">
                              {release.installs.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Last Updated</span>
                            <span className="text-gray-600">{release.lastUpdated}</span>
                          </div>
                          <div className="pt-2 border-t">
                            <span className="text-xs text-gray-500">Changelog:</span>
                            <p className="text-sm text-gray-700 mt-1">{release.changelog}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" className="flex-1 btn-secondary">
                            Push Update
                          </Button>
                          <Button variant="outline" className="btn-secondary">
                            Changelog
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Assets Tab */}
              <TabsContent value="assets" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Drawing asset library coming soon...
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6 space-y-6">
                    <div className="p-12 text-center text-gray-500">
                      Whiteboard settings are managed globally
                    </div>
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Core Features</CardTitle>
                        <CardDescription>Toggle main whiteboard functionalities</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>AI Assistant</Label>
                            <p className="text-sm text-gray-500">Enable AI-powered drawing and explanations</p>
                          </div>
                          <Switch 
                            checked={wbSettings?.aiAssistant} 
                            onCheckedChange={(v) => handleUpdateSetting('aiAssistant', v)} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Homework Generator</Label>
                            <p className="text-sm text-gray-500">Auto-generate assignments from board content</p>
                          </div>
                          <Switch 
                            checked={wbSettings?.homeworkGenerator} 
                            onCheckedChange={(v) => handleUpdateSetting('homeworkGenerator', v)} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Attendance Tracking</Label>
                            <p className="text-sm text-gray-500">Auto-mark attendance for session viewers</p>
                          </div>
                          <Switch 
                            checked={wbSettings?.attendance} 
                            onCheckedChange={(v) => handleUpdateSetting('attendance', v)} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Split Screen Mode</Label>
                            <p className="text-sm text-gray-500">Allow multiple boards in one view</p>
                          </div>
                          <Switch 
                            checked={wbSettings?.splitScreen} 
                            onCheckedChange={(v) => handleUpdateSetting('splitScreen', v)} 
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Subject-Specific Tools</CardTitle>
                        <CardDescription>Enable specialized toolsets for different subjects</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Math Tools</Label>
                            <p className="text-sm text-gray-500">Calculators, geometry tools, and equations</p>
                          </div>
                          <Switch 
                            checked={wbSettings?.mathTools} 
                            onCheckedChange={(v) => handleUpdateSetting('mathTools', v)} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Chemistry Suite</Label>
                            <p className="text-sm text-gray-500">Periodic table and molecular structure drawing</p>
                          </div>
                          <Switch 
                            checked={wbSettings?.chemistryTools || wbSettings?.periodicTable} 
                            onCheckedChange={(v) => {
                              handleUpdateSetting('chemistryTools', v);
                              handleUpdateSetting('periodicTable', v);
                            }} 
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Physics Simulations</Label>
                            <p className="text-sm text-gray-500">Interactive 3D models and force simulations</p>
                          </div>
                          <Switch 
                            checked={wbSettings?.physicsSimulations || wbSettings?.shapeBuilder3D} 
                            onCheckedChange={(v) => {
                              handleUpdateSetting('physicsSimulations', v);
                              handleUpdateSetting('shapeBuilder3D', v);
                            }} 
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Usage Controls</CardTitle>
                        <CardDescription>Manage resource limits and access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Global AI Token Limit</Label>
                            <div className="flex gap-2">
                              <Input 
                                type="number" 
                                value={wbSettings?.globalAiTokenLimit} 
                                onChange={(e) => handleUpdateSetting('globalAiTokenLimit', parseInt(e.target.value))}
                                className="max-w-[150px]"
                              />
                              <Button variant="outline" size="sm">Set Limit</Button>
                            </div>
                            <p className="text-xs text-gray-500">Total monthly AI tokens shared across all boards</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
