"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Globe,
  FileText,
  Wrench,
  Download,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: "How to Crack JEE 2026: Complete Study Plan",
    slug: "how-to-crack-jee-2026",
    status: "Published",
    category: "Exam Tips",
    author: "Dr. Sharma",
    publishedDate: "Mar 01, 2026",
    views: 4521,
  },
  {
    id: 2,
    title: "NEET Biology: Important Topics and Weightage",
    slug: "neet-biology-important-topics",
    status: "Published",
    category: "Exam Tips",
    author: "Dr. Priya",
    publishedDate: "Feb 28, 2026",
    views: 3842,
  },
  {
    id: 3,
    title: "Benefits of AI-Powered Learning Platforms",
    slug: "ai-powered-learning-benefits",
    status: "Draft",
    category: "Technology",
    author: "Admin",
    publishedDate: null,
    views: 0,
  },
  {
    id: 4,
    title: "Top 10 Coaching Institutes in Maharashtra",
    slug: "top-coaching-institutes-maharashtra",
    status: "Published",
    category: "Rankings",
    author: "Team EduHub",
    publishedDate: "Feb 25, 2026",
    views: 8921,
  },
  {
    id: 5,
    title: "Understanding the New JEE Pattern Changes",
    slug: "jee-pattern-changes-2026",
    status: "Scheduled",
    category: "News",
    author: "Dr. Sharma",
    publishedDate: "Mar 05, 2026",
    views: 0,
  },
];

// Mock tools data
const toolsData = [
  {
    id: 1,
    name: "JEE Rank Predictor",
    type: "Free",
    price: null,
    uses30d: 12450,
    revenue30d: null,
    status: "Active",
  },
  {
    id: 2,
    name: "NEET Score Calculator",
    type: "Free",
    price: null,
    uses30d: 8921,
    revenue30d: null,
    status: "Active",
  },
  {
    id: 3,
    name: "AI Question Solver",
    type: "Paid",
    price: 99,
    uses30d: 2341,
    revenue30d: 231759,
    status: "Active",
  },
  {
    id: 4,
    name: "Study Planner Generator",
    type: "Free",
    price: null,
    uses30d: 5672,
    revenue30d: null,
    status: "Active",
  },
  {
    id: 5,
    name: "Previous Year Paper Analysis",
    type: "Paid",
    price: 149,
    uses30d: 1892,
    revenue30d: 281908,
    status: "Active",
  },
  {
    id: 6,
    name: "College Predictor",
    type: "Free",
    price: null,
    uses30d: 3421,
    revenue30d: null,
    status: "Hidden",
  },
];

// Mock leads data
const leadsData = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "+91 98765 43210",
    organization: "Future Academy",
    source: "Contact Form",
    date: "Mar 01, 2026",
    status: "New",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 87654 32109",
    organization: null,
    source: "Demo Request",
    date: "Mar 01, 2026",
    status: "Contacted",
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit@example.com",
    phone: "+91 76543 21098",
    organization: "Success Classes",
    source: "Pricing Page",
    date: "Feb 28, 2026",
    status: "Qualified",
  },
];

// Mock downloads data
const downloadsData = [
  {
    id: 1,
    platform: "Windows",
    version: "v2.4.1",
    downloads: 3241,
    lastUpdated: "Feb 28, 2026",
    status: "Live",
  },
  {
    id: 2,
    platform: "Android",
    version: "v2.4.0",
    downloads: 8102,
    lastUpdated: "Feb 20, 2026",
    status: "Live",
  },
  {
    id: 3,
    platform: "iOS",
    version: "v2.3.9",
    downloads: 2890,
    lastUpdated: "Jan 15, 2026",
    status: "Under Review",
  },
];

// Stats data
const stats = [
  { label: "Blog Views (30d)", value: "45.2K", icon: Eye, color: "blue" },
  { label: "Tool Uses (30d)", value: "34.7K", icon: Wrench, color: "purple" },
  { label: "New Leads (30d)", value: "128", icon: Users, color: "green" },
  { label: "Revenue (30d)", value: "₹5.1L", icon: TrendingUp, color: "orange" },
];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Published: "badge-active",
    Draft: "bg-gray-100 text-gray-600",
    Scheduled: "bg-blue-50 text-blue-700",
    Active: "badge-active",
    Hidden: "bg-gray-100 text-gray-600",
    New: "bg-orange-50 text-orange-700",
    Contacted: "bg-blue-50 text-blue-700",
    Qualified: "badge-active",
    Live: "badge-active",
    "Under Review": "bg-yellow-50 text-yellow-700",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Type Badge for tools
function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Free: "bg-green-50 text-green-700",
    Paid: "bg-purple-50 text-purple-700",
  };
  return <span className={`badge ${styles[type] || ""}`}>{type}</span>;
}

const getIconBgColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    purple: "bg-purple-50",
  };
  return colors[color] || "bg-gray-50";
};

const getIconColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
  };
  return colors[color] || "text-gray-600";
};

export default function WebsiteCMSPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBlogs = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                <h1 className="text-2xl font-bold text-gray-900">Public Website CMS</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage blogs, tools, SEO content and leads
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="btn-secondary">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Website
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="kpi-card">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${getIconColor(stat.color)}`} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {stat.label}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="blogs" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="blogs" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Blogs
                </TabsTrigger>
                <TabsTrigger value="tools" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Wrench className="w-4 h-4 mr-2" />
                  Tools
                </TabsTrigger>
                <TabsTrigger value="leads" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Leads
                </TabsTrigger>
                <TabsTrigger value="downloads" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Downloads
                </TabsTrigger>
                <TabsTrigger value="seo" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  SEO
                </TabsTrigger>
              </TabsList>

              {/* Blogs Tab */}
              <TabsContent value="blogs" className="mt-6 space-y-4">
                {/* Filter Bar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search blogs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 input-field"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] input-field">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="btn-primary ml-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        New Blog
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Blogs Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Title</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Category</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Author</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Published</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Views</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBlogs.map((post) => (
                          <TableRow key={post.id} className="hover:bg-brand-primary-tint">
                            <TableCell>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                <div className="text-xs text-gray-500">{post.slug}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={post.status} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{post.category}</TableCell>
                            <TableCell className="text-sm text-gray-600">{post.author}</TableCell>
                            <TableCell className="text-sm text-gray-500">{post.publishedDate || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-900 font-medium">{post.views.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" /> Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
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

              {/* Tools Tab */}
              <TabsContent value="tools" className="mt-6 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Manage free and paid tools</div>
                      <Button className="btn-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tool
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Tool Name</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Type</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Price</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Uses (30d)</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Revenue (30d)</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {toolsData.map((tool) => (
                          <TableRow key={tool.id} className="hover:bg-brand-primary-tint">
                            <TableCell className="font-medium text-gray-900">{tool.name}</TableCell>
                            <TableCell>
                              <TypeBadge type={tool.type} />
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {tool.price ? `₹${tool.price}` : "Free"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">{tool.uses30d.toLocaleString()}</TableCell>
                            <TableCell className="text-sm text-gray-900 font-medium">
                              {tool.revenue30d ? `₹${(tool.revenue30d / 1000).toFixed(1)}K` : "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={tool.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" /> View Usage
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
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

              {/* Leads Tab */}
              <TabsContent value="leads" className="mt-6 space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Name</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Email</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Phone</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Organization</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Source</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leadsData.map((lead) => (
                          <TableRow key={lead.id} className="hover:bg-brand-primary-tint">
                            <TableCell className="font-medium text-gray-900">{lead.name}</TableCell>
                            <TableCell className="text-sm text-gray-600">{lead.email}</TableCell>
                            <TableCell className="text-sm text-gray-600">{lead.phone}</TableCell>
                            <TableCell className="text-sm text-gray-600">{lead.organization || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-600">{lead.source}</TableCell>
                            <TableCell className="text-sm text-gray-500">{lead.date}</TableCell>
                            <TableCell>
                              <StatusBadge status={lead.status} />
                            </TableCell>
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
                                    <Users className="w-4 h-4 mr-2" /> Convert to Org
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

              {/* Downloads Tab */}
              <TabsContent value="downloads" className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {downloadsData.map((download) => (
                    <Card key={download.id} className="kpi-card">
                      <CardHeader>
                        <CardTitle className="text-lg">{download.platform}</CardTitle>
                        <CardDescription>{download.version}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Downloads</span>
                            <span className="text-lg font-bold text-gray-900">{download.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Last Updated</span>
                            <span className="text-sm text-gray-600">{download.lastUpdated}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Status</span>
                            <StatusBadge status={download.status} />
                          </div>
                          <Button className="w-full btn-primary">
                            Manage Version
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>Manage meta tags, sitemap, and robots.txt</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Meta Tags</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600">Site Title</label>
                            <Input defaultValue="EduHub - Complete EdTech Platform" className="input-field mt-1" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Meta Description</label>
                            <Input defaultValue="Multi-tenant EdTech platform for coaching institutes" className="input-field mt-1" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Focus Keywords</label>
                            <Input defaultValue="edtech, coaching, mock tests, JEE, NEET" className="input-field mt-1" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Sitemap & Indexing</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">sitemap.xml</span>
                            <Button variant="outline" size="sm">Regenerate</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">robots.txt</span>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">Google Search Console</span>
                            <Badge className="badge-active">Connected</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button className="btn-primary">Save SEO Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
