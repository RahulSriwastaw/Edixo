import { useSidebarStore } from "@/store/sidebarStore";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronRight,
  Bell,
  Send,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Smartphone,
  Globe,
  MoreHorizontal,
  Eye,
  Trash2,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrgAdminSidebar, OrgSidebarProvider } from "@/components/org-admin/OrgAdminSidebar";
import { OrgAdminTopBar } from "@/components/org-admin/OrgAdminTopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OrgContextBanner } from "@/components/org-admin/OrgContextBanner";

// Notification history
const notificationHistory = [
  {
    id: "NOT-001",
    title: "Results Published — Mock Test #11",
    sentAt: "Mar 4, 2026 · 10:30 AM",
    target: "All Students (230)",
    channels: ["whatsapp", "app"],
    delivered: 228,
    total: 230,
  },
  {
    id: "NOT-002",
    title: "Test Reminder — Physics Unit Test",
    sentAt: "Mar 3, 2026 · 6:00 PM",
    target: "Batch A (30)",
    channels: ["whatsapp"],
    delivered: 29,
    total: 30,
  },
  {
    id: "NOT-003",
    title: "Fee Reminder — March Pending",
    sentAt: "Mar 1, 2026 · 10:00 AM",
    target: "45 students",
    channels: ["whatsapp", "sms"],
    delivered: 43,
    total: 45,
  },
];

// Templates
const templates = [
  { id: 1, name: "Test Reminder", type: "reminder" },
  { id: 2, name: "Result Published", type: "result" },
  { id: 3, name: "Fee Reminder", type: "fee" },
  { id: 4, name: "Holiday Announcement", type: "general" },
];

export default function NotificationsPage() {
    const { isOpen } = useSidebarStore();
const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = () => {
    if (!title || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Notification sent successfully!");
    setTitle("");
    setMessage("");
  };

  return (
    <OrgSidebarProvider>
      <div className="min-h-screen bg-neutral-bg">
        <OrgAdminSidebar />
        <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "lg:ml-60" : "ml-0")}>
          <OrgAdminTopBar />
          <OrgContextBanner>
            <main className="flex-1 p-4 lg:p-6">
              <div className="max-w-[1400px] mx-auto space-y-4 lg:space-y-6 animate-fade-in">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/org-admin" className="hover:text-orange-600">Dashboard</Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Notifications</span>
              </div>

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Send notifications to students and parents
                  </p>
                </div>
              </div>

              <Tabs defaultValue="send" className="w-full">
                <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                  <TabsTrigger value="send" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Send New
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Templates
                  </TabsTrigger>
                </TabsList>

                {/* Send New Tab */}
                <TabsContent value="send" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Form */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Compose Notification</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Title *</Label>
                            <span className="text-xs text-gray-400">{title.length}/60</span>
                          </div>
                          <Input
                            placeholder="Notification title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                            className="input-field"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Message *</Label>
                            <span className="text-xs text-gray-400">{message.length}/500</span>
                          </div>
                          <Textarea
                            placeholder="Write your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                            className="input-field min-h-[120px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>To *</Label>
                          <Select defaultValue="all">
                            <SelectTrigger className="input-field">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Students (247)</SelectItem>
                              <SelectItem value="batch">Specific Batches</SelectItem>
                              <SelectItem value="students">Specific Students</SelectItem>
                              <SelectItem value="parents">All Parents</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Channels</Label>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Smartphone className="w-4 h-4" />
                              App
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 bg-green-50 border-green-200">
                              Globe
                              WhatsApp
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Bell className="w-4 h-4" />
                              SMS
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Schedule</Label>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 bg-orange-50 border-orange-200">
                              Send Now
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Schedule
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowPreview(true)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button onClick={handleSend} className="btn-primary flex-1">
                            <Send className="w-4 h-4 mr-2" />
                            Send Notification
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 rounded-xl p-4 text-white max-w-[300px]">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                              <span className="font-bold text-sm">A</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">Apex Academy</span>
                                <span className="text-xs text-gray-400">now</span>
                              </div>
                              <div className="font-medium text-sm mt-1 truncate">
                                {title || "Notification Title"}
                              </div>
                              <div className="text-xs text-gray-300 line-clamp-3 mt-1">
                                {message || "Your notification message will appear here..."}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-3">
                          Preview shows WhatsApp style notification
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Notification History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {notificationHistory.map((notif) => (
                          <div key={notif.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                              <Bell className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{notif.title}</div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {notif.sentAt} · {notif.target}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {notif.channels.map((ch) => (
                                  <Badge key={ch} variant="outline" className="text-[10px]">
                                    {ch}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-medium text-green-600">
                                {notif.delivered}/{notif.total}
                              </div>
                              <div className="text-xs text-gray-500">delivered</div>
                            </div>
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
                                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-base">Notification Templates</CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Create Template
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {templates.map((template) => (
                          <div key={template.id} className="p-4 border rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5 capitalize">{template.type}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              </div>
            </main>
          </OrgContextBanner>
        </div>
      </div>
    </OrgSidebarProvider>
  );
}
