"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Search,
  FileText,
  Link2,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Edit,
  ExternalLink,
  Save,
  Settings,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

// Mock SEO data
const seoSettings = {
  siteTitle: "EduHub - Complete EdTech Platform for Coaching Institutes",
  metaDescription: "Multi-tenant EdTech platform for coaching institutes. Manage students, teachers, mock tests, and more.",
  focusKeywords: "edtech, coaching, mock tests, JEE, NEET, education platform",
  ogImage: "https://eduhub.in/og-image.png",
  twitterHandle: "@eduhub_in",
  siteUrl: "https://eduhub.in",
};

// Mock sitemap data
const sitemapPages = [
  { url: "/", priority: "1.0", changeFreq: "daily", lastModified: "Mar 01, 2026" },
  { url: "/pricing", priority: "0.9", changeFreq: "weekly", lastModified: "Feb 28, 2026" },
  { url: "/features", priority: "0.8", changeFreq: "weekly", lastModified: "Feb 25, 2026" },
  { url: "/blog", priority: "0.8", changeFreq: "daily", lastModified: "Mar 01, 2026" },
  { url: "/tools", priority: "0.7", changeFreq: "weekly", lastModified: "Feb 20, 2026" },
  { url: "/contact", priority: "0.6", changeFreq: "monthly", lastModified: "Jan 15, 2026" },
  { url: "/about", priority: "0.6", changeFreq: "monthly", lastModified: "Jan 10, 2026" },
];

// Mock indexed pages
const indexedPages = [
  { url: "/", indexed: true, lastCrawled: "Mar 01, 2026", impressions: 45210, clicks: 3420 },
  { url: "/pricing", indexed: true, lastCrawled: "Feb 28, 2026", impressions: 28420, clicks: 2150 },
  { url: "/blog", indexed: true, lastCrawled: "Mar 01, 2026", impressions: 38920, clicks: 2840 },
  { url: "/features", indexed: true, lastCrawled: "Feb 25, 2026", impressions: 19230, clicks: 1450 },
  { url: "/tools/jee-rank-predictor", indexed: true, lastCrawled: "Feb 20, 2026", impressions: 15620, clicks: 1280 },
  { url: "/blog/jee-pattern-changes", indexed: false, lastCrawled: null, impressions: 0, clicks: 0 },
];

export default function SEOSettingsPage() {
    const { isOpen } = useSidebarStore();
const [formData, setFormData] = useState(seoSettings);
  const [robotsContent, setRobotsContent] = useState(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://eduhub.in/sitemap.xml`);

  const handleSave = () => {
    toast.success("SEO settings saved successfully");
  };

  const handleRegenerateSitemap = () => {
    toast.success("Sitemap regenerated successfully");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Link
                href="/website"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage meta tags, sitemap, and search engine indexing
                </p>
              </div>
              <Button className="btn-primary" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="general" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  General SEO
                </TabsTrigger>
                <TabsTrigger value="sitemap" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Sitemap
                </TabsTrigger>
                <TabsTrigger value="robots" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Robots.txt
                </TabsTrigger>
                <TabsTrigger value="indexing" className="data-[state=active]:bg-brand-primary data-[state=active]:text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Indexing
                </TabsTrigger>
              </TabsList>

              {/* General SEO Tab */}
              <TabsContent value="general" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meta Tags</CardTitle>
                      <CardDescription>Configure site-wide SEO meta tags</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Site Title</Label>
                          <span className={`text-xs ${formData.siteTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>
                            {formData.siteTitle.length}/60
                          </span>
                        </div>
                        <Input
                          value={formData.siteTitle}
                          onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500">Recommended: 50-60 characters</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Meta Description</Label>
                          <span className={`text-xs ${formData.metaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                            {formData.metaDescription.length}/160
                          </span>
                        </div>
                        <Textarea
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          className="input-field min-h-[80px]"
                        />
                        <p className="text-xs text-gray-500">Recommended: 150-160 characters</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Focus Keywords</Label>
                        <Input
                          value={formData.focusKeywords}
                          onChange={(e) => setFormData({ ...formData, focusKeywords: e.target.value })}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500">Comma-separated keywords</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Open Graph & Social</CardTitle>
                      <CardDescription>Configure how your site appears on social media</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Site URL</Label>
                        <Input
                          value={formData.siteUrl}
                          onChange={(e) => setFormData({ ...formData, siteUrl: e.target.value })}
                          className="input-field"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>OG Image URL</Label>
                        <Input
                          value={formData.ogImage}
                          onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                          className="input-field"
                        />
                        <p className="text-xs text-gray-500">Recommended: 1200x630 pixels</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Twitter Handle</Label>
                        <Input
                          value={formData.twitterHandle}
                          onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>Connect with third-party SEO tools</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Search className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Google Search Console</div>
                              <div className="text-xs text-gray-500">Track search performance</div>
                            </div>
                          </div>
                          <Badge className="badge-active">Connected</Badge>
                        </div>

                        <div className="p-4 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Google Analytics</div>
                              <div className="text-xs text-gray-500">Track user behavior</div>
                            </div>
                          </div>
                          <Badge className="badge-active">Connected</Badge>
                        </div>

                        <div className="p-4 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                              <Globe className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Bing Webmaster</div>
                              <div className="text-xs text-gray-500">Bing search indexing</div>
                            </div>
                          </div>
                          <Badge className="bg-gray-100 text-gray-600">Not Connected</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Sitemap Tab */}
              <TabsContent value="sitemap" className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Sitemap Configuration</CardTitle>
                      <CardDescription>Manage your XML sitemap for search engines</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="btn-secondary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Sitemap
                      </Button>
                      <Button className="btn-primary" onClick={handleRegenerateSitemap}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">URL</th>
                            <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                            <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Change Frequency</th>
                            <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Last Modified</th>
                            <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sitemapPages.map((page, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Link2 className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900 mono">{page.url}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge className="bg-blue-50 text-blue-700">{page.priority}</Badge>
                              </td>
                              <td className="p-4 text-sm text-gray-600">{page.changeFreq}</td>
                              <td className="p-4 text-sm text-gray-500">{page.lastModified}</td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Robots.txt Tab */}
              <TabsContent value="robots" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Robots.txt Editor</CardTitle>
                    <CardDescription>Configure which pages search engines can crawl</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={robotsContent}
                      onChange={(e) => setRobotsContent(e.target.value)}
                      className="input-field mono min-h-[300px]"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Current URL: <span className="mono text-gray-700">https://eduhub.in/robots.txt</span>
                      </p>
                      <Button className="btn-primary" onClick={() => toast.success("Robots.txt updated successfully")}>
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Indexing Tab */}
              <TabsContent value="indexing" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Google Indexing Status</CardTitle>
                    <CardDescription>Track which pages are indexed by Google</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b">
                            <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">URL</th>
                            <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Indexed</th>
                            <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Last Crawled</th>
                            <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase">Impressions</th>
                            <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase">Clicks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {indexedPages.map((page, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <span className="text-sm text-gray-900 mono">{page.url}</span>
                              </td>
                              <td className="p-4">
                                {page.indexed ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-sm">Indexed</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-sm">Not Indexed</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-sm text-gray-500">{page.lastCrawled || "—"}</td>
                              <td className="p-4 text-right text-sm text-gray-900">{page.impressions.toLocaleString()}</td>
                              <td className="p-4 text-right text-sm text-gray-900">{page.clicks.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
