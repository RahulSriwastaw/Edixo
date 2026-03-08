"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Building2,
  Palette,
  BookOpen,
  Shield,
  Globe,
  Upload,
  Save,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
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
import { OrgAdminSidebar, OrgSidebarProvider } from "@/components/org-admin/OrgAdminSidebar";
import { OrgAdminTopBar } from "@/components/org-admin/OrgAdminTopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { OrgContextBanner } from "@/components/org-admin/OrgContextBanner";

// Subjects data
const subjectsData = [
  {
    name: "Physics",
    topics: ["Mechanics", "Optics", "Thermodynamics", "Electricity"],
    expanded: true,
  },
  {
    name: "Chemistry",
    topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
    expanded: false,
  },
  {
    name: "Mathematics",
    topics: ["Algebra", "Calculus", "Geometry", "Trigonometry"],
    expanded: false,
  },
  {
    name: "General Knowledge",
    topics: ["History", "Geography", "Current Affairs"],
    expanded: false,
  },
];

export default function SettingsPage() {
    const { isOpen } = useSidebarStore();
const [subjects, setSubjects] = useState(subjectsData);
  const [activeTab, setActiveTab] = useState("profile");

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const toggleSubject = (name: string) => {
    setSubjects(subjects.map(s => 
      s.name === name ? { ...s, expanded: !s.expanded } : s
    ));
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
                <span className="text-gray-900 font-medium">Settings</span>
              </div>

              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Organization Settings</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage your organization profile and preferences
                  </p>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white border border-gray-200 rounded-lg p-1 flex-wrap h-auto">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Branding
                  </TabsTrigger>
                  <TabsTrigger value="subjects" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Subjects
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Security
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-orange-600" />
                        Organization Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Organization Name</Label>
                          <Input defaultValue="Apex Academy" className="input-field" />
                        </div>
                        <div className="space-y-2">
                          <Label>Organization ID</Label>
                          <Input defaultValue="GK-ORG-00142" disabled className="input-field bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Email</Label>
                          <Input defaultValue="info@apexacademy.com" className="input-field" />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Phone</Label>
                          <Input defaultValue="+91 9876543210" className="input-field" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input defaultValue="23, Nehru Nagar, New Delhi" className="input-field" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input defaultValue="New Delhi" className="input-field" />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Select defaultValue="delhi">
                            <SelectTrigger className="input-field">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="delhi">Delhi</SelectItem>
                              <SelectItem value="maharashtra">Maharashtra</SelectItem>
                              <SelectItem value="karnataka">Karnataka</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Pincode</Label>
                          <Input defaultValue="110023" className="input-field" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input defaultValue="www.apexacademy.com" className="input-field" />
                      </div>

                      <div className="space-y-2">
                        <Label>About Organization</Label>
                        <Textarea 
                          placeholder="Short description..." 
                          className="input-field" 
                          rows={3}
                          defaultValue="India's #1 SSC GD Coaching Institute"
                        />
                      </div>

                      <Button onClick={handleSave} className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Branding Tab */}
                <TabsContent value="branding" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-600" />
                        Branding & Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Logo */}
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <Label className="text-sm">Organization Logo</Label>
                          <p className="text-xs text-gray-500 mt-0.5 mb-2">PNG/JPG, min 200x200px, max 2MB</p>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-1" />
                            Upload New Logo
                          </Button>
                        </div>
                      </div>

                      {/* Primary Color */}
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500" />
                          <Input defaultValue="#FF6B35" className="input-field w-32" />
                        </div>
                      </div>

                      {/* Custom Tagline */}
                      <div className="space-y-2">
                        <Label>Custom Tagline</Label>
                        <Input 
                          defaultValue="India's #1 SSC GD Coaching Institute" 
                          className="input-field" 
                        />
                        <p className="text-xs text-gray-500">Shown on student portal</p>
                      </div>

                      {/* Custom Domain */}
                      <div className="pt-4 border-t">
                        <Label className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Custom Domain
                        </Label>
                        <div className="mt-2 space-y-2">
                          <Input defaultValue="www.apexacademy.com" className="input-field" />
                          <div className="flex items-center gap-2 text-xs text-yellow-600">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                            Awaiting DNS Verification
                          </div>
                        </div>
                      </div>

                      <Button onClick={handleSave} className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Branding
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Subjects Tab */}
                <TabsContent value="subjects" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Subjects & Topics
                      </CardTitle>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Subject
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {subjects.map((subject) => (
                          <div key={subject.name} className="border rounded-lg overflow-hidden">
                            <button
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                              onClick={() => toggleSubject(subject.name)}
                            >
                              <div className="flex items-center gap-3">
                                <ChevronDown className={cn(
                                  "w-4 h-4 text-gray-400 transition-transform",
                                  subject.expanded && "rotate-180"
                                )} />
                                <span className="font-medium text-gray-900">{subject.name}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {subject.topics.length} topics
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </button>
                            {subject.expanded && (
                              <div className="border-t bg-gray-50 p-3 space-y-1">
                                {subject.topics.map((topic) => (
                                  <div key={topic} className="flex items-center justify-between p-2 hover:bg-white rounded">
                                    <span className="text-sm text-gray-700">{topic}</span>
                                    <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-red-600">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-orange-600">
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Topic
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Password Policy */}
                      <div>
                        <h4 className="font-medium text-sm mb-3">Password Policy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Minimum Length</Label>
                            <Input type="number" defaultValue="8" className="input-field" />
                          </div>
                          <div className="space-y-3">
                            <Label>Requirements</Label>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Uppercase letter</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Number</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Special character</span>
                                <Switch />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Session Settings */}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-sm mb-3">Session Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Idle Timeout (minutes)</Label>
                            <Input type="number" defaultValue="120" className="input-field" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Concurrent Sessions</Label>
                            <Input type="number" defaultValue="3" className="input-field" />
                          </div>
                        </div>
                      </div>

                      {/* Student Login */}
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-sm mb-3">Student Portal Login</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input type="radio" name="login" defaultChecked className="accent-orange-500" />
                            <span className="text-sm">Student ID + Password</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input type="radio" name="login" className="accent-orange-500" />
                            <span className="text-sm">Phone OTP only</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input type="radio" name="login" className="accent-orange-500" />
                            <span className="text-sm">Both options</span>
                          </div>
                        </div>
                      </div>

                      <Button onClick={handleSave} className="btn-primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Security Settings
                      </Button>
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
