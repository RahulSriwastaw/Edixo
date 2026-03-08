import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  Eye,
  Mail,
  Phone,
  MoreHorizontal,
  X,
  ArrowLeft,
  TrendingUp,
  Building2,
  Calendar,
  Filter,
  Download,
  Building,
  UserPlus,
  CheckCircle,
  Clock,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

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
    notes: "Interested in MockBook plan",
    city: "Mumbai",
    teachers: 25,
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
    notes: "Requested demo for next week",
    city: "Delhi",
    teachers: null,
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
    notes: "Ready to onboard - Medium plan",
    city: "Ahmedabad",
    teachers: 35,
  },
  {
    id: 4,
    name: "Sneha Reddy",
    email: "sneha@example.com",
    phone: "+91 65432 10987",
    organization: "Bright Minds Institute",
    source: "Blog Article",
    date: "Feb 27, 2026",
    status: "New",
    notes: "Found through JEE blog post",
    city: "Hyderabad",
    teachers: 15,
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "+91 54321 09876",
    organization: null,
    source: "Contact Form",
    date: "Feb 26, 2026",
    status: "Lost",
    notes: "Chose competitor platform",
    city: "Jaipur",
    teachers: null,
  },
  {
    id: 6,
    name: "Anita Desai",
    email: "anita@example.com",
    phone: "+91 43210 98765",
    organization: "Knowledge Hub",
    source: "Demo Request",
    date: "Feb 25, 2026",
    status: "Converted",
    notes: "Converted to GK-ORG-00145",
    city: "Pune",
    teachers: 42,
  },
  {
    id: 7,
    name: "Ravi Mehta",
    email: "ravi@example.com",
    phone: "+91 32109 87654",
    organization: "Excel Coaching",
    source: "Pricing Page",
    date: "Feb 24, 2026",
    status: "Contacted",
    notes: "Following up on Enterprise plan",
    city: "Bangalore",
    teachers: 150,
  },
];

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    New: "bg-orange-50 text-orange-700",
    Contacted: "bg-blue-50 text-blue-700",
    Qualified: "bg-green-50 text-green-700",
    Converted: "badge-active",
    Lost: "bg-red-50 text-red-700",
  };
  return <span className={`badge ${styles[status] || ""}`}>{status}</span>;
}

// Source Badge
function SourceBadge({ source }: { source: string }) {
  const styles: Record<string, string> = {
    "Contact Form": "bg-blue-50 text-blue-700",
    "Demo Request": "bg-purple-50 text-purple-700",
    "Pricing Page": "bg-green-50 text-green-700",
    "Blog Article": "bg-orange-50 text-orange-700",
  };
  return <span className={`badge ${styles[source] || "bg-gray-100 text-gray-600"}`}>{source}</span>;
}

export default function LeadsManagementPage() {
    const { isOpen } = useSidebarStore();
const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<typeof leadsData[0] | null>(null);

  const filteredLeads = leadsData.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.organization?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleViewLead = (lead: typeof leadsData[0]) => {
    setSelectedLead(lead);
    setShowLeadDialog(true);
  };

  const handleConvertToOrg = (lead: typeof leadsData[0]) => {
    toast.success(`Converting ${lead.name} to organization...`);
    setShowLeadDialog(false);
  };

  const handleUpdateStatus = (lead: typeof leadsData[0], newStatus: string) => {
    toast.success(`Status updated to ${newStatus}`);
    setShowLeadDialog(false);
  };

  // Calculate stats
  const newLeads = leadsData.filter(l => l.status === "New").length;
  const contactedLeads = leadsData.filter(l => l.status === "Contacted").length;
  const qualifiedLeads = leadsData.filter(l => l.status === "Qualified").length;
  const convertedLeads = leadsData.filter(l => l.status === "Converted").length;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
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
                <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Track and manage leads from the public website
                </p>
              </div>
              <Button variant="outline" className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">New Leads</div>
                      <div className="text-xl font-bold text-gray-900">{newLeads}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Contacted</div>
                      <div className="text-xl font-bold text-gray-900">{contactedLeads}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Qualified</div>
                      <div className="text-xl font-bold text-gray-900">{qualifiedLeads}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Converted</div>
                      <div className="text-xl font-bold text-gray-900">{convertedLeads}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search leads..."
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
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-[150px] input-field">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Contact Form">Contact Form</SelectItem>
                      <SelectItem value="Demo Request">Demo Request</SelectItem>
                      <SelectItem value="Pricing Page">Pricing Page</SelectItem>
                      <SelectItem value="Blog Article">Blog Article</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || statusFilter !== "all" || sourceFilter !== "all") && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSourceFilter("all");
                      }}
                      className="btn-ghost"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Leads Table */}
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
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="hover:bg-brand-primary-tint">
                        <TableCell className="font-medium text-gray-900">{lead.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{lead.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{lead.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.organization ? (
                            <div className="flex items-center gap-1">
                              <Building className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-900">{lead.organization}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <SourceBadge source={lead.source} />
                        </TableCell>
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
                              <DropdownMenuItem onClick={() => handleViewLead(lead)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewLead(lead)}>
                                <Mail className="w-4 h-4 mr-2" /> Send Email
                              </DropdownMenuItem>
                              {lead.status !== "Converted" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleConvertToOrg(lead)}>
                                    <UserPlus className="w-4 h-4 mr-2" /> Convert to Org
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={showLeadDialog} onOpenChange={setShowLeadDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View and manage lead information
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Name</Label>
                  <div className="text-sm font-medium text-gray-900">{selectedLead.name}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <StatusBadge status={selectedLead.status} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Email</Label>
                  <div className="text-sm text-gray-900">{selectedLead.email}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Phone</Label>
                  <div className="text-sm text-gray-900">{selectedLead.phone}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Organization</Label>
                  <div className="text-sm text-gray-900">{selectedLead.organization || "—"}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">City</Label>
                  <div className="text-sm text-gray-900">{selectedLead.city}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Teachers</Label>
                  <div className="text-sm text-gray-900">{selectedLead.teachers || "—"}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Source</Label>
                  <SourceBadge source={selectedLead.source} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Notes</Label>
                <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                  {selectedLead.notes}
                </div>
              </div>

              {selectedLead.status !== "Converted" && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUpdateStatus(selectedLead, "Contacted")}
                  >
                    Mark Contacted
                  </Button>
                  <Button
                    className="flex-1 btn-primary"
                    onClick={() => handleConvertToOrg(selectedLead)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Convert to Org
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeadDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
