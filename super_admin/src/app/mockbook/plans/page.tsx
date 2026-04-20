"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronRight,
  Package,
  Users,
  IndianRupee,
  Check,
  X,
  PlusCircle,
  LayoutGrid,
  Zap,
  Clock,
  Settings2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { mockbookPricingService, MockbookPlan } from "@/services/mockbookPricingService";

export default function MockbookPlansPage() {
  const { isOpen } = useSidebarStore();
  const [plans, setPlans] = useState<MockbookPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<MockbookPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await mockbookPricingService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      setIsDeleting(true);
      await mockbookPricingService.deletePlan(planToDelete.id);
      toast.success("Plan deleted successfully");
      setPlans(plans.filter(p => p.id !== planToDelete.id));
      setPlanToDelete(null);
    } catch (error) {
      toast.error("Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Link href="/mockbook" className="hover:text-brand-primary">MockBook</Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">Plans & Packs</span>
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage student subscription packages for the Mockbook app
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="btn-primary" asChild>
                  <Link href="/mockbook/plans/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Plan
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="kpi-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase">Total Plans</div>
                    <div className="text-2xl font-bold">{plans.length}</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase">Active Plans</div>
                    <div className="text-2xl font-bold">{plans.filter(p => p.isActive).length}</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="kpi-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase">Subscribed Students</div>
                    <div className="text-2xl font-bold">--</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* List Section */}
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search plans by name..." 
                      className="pl-9 input-field"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="w-[80px]">Order</TableHead>
                        <TableHead>Plan Details</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Access</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7} className="text-center py-10 text-gray-400">Loading...</TableCell>
                          </TableRow>
                        ))
                      ) : filteredPlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-20">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="w-12 h-12 text-gray-200" />
                              <p className="font-medium text-gray-500">No plans found</p>
                              <Button variant="outline" size="sm" asChild className="mt-2">
                                <Link href="/mockbook/plans/create">Create your first plan</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPlans.map((plan) => (
                          <TableRow key={plan.id} className="group hover:bg-orange-50/30">
                            <TableCell className="font-mono text-gray-400">{plan.sortOrder}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                  <Zap className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{plan.name}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{plan.description || 'No description'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900">₹{plan.price}</span>
                                {plan.discountPrice && (
                                  <span className="text-xs text-gray-400 line-through">₹{plan.discountPrice}</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {plan.durationDays} Days
                              </div>
                            </TableCell>
                            <TableCell>
                              {plan.accessType === 'GLOBAL' ? (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5 font-medium">GLOBAL</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-none px-2 py-0.5 font-medium">
                                  {plan.examCategoryIds.length} Categories
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "text-[10px] font-bold px-2 py-0.5",
                                plan.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                              )}>
                                {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-brand-primary" asChild>
                                  <Link href={`/mockbook/plans/edit/${plan.id}`}>
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  onClick={() => setPlanToDelete(plan)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the plan "{planToDelete?.name}"? This action cannot be undone and will affect any existing logic tied to this plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
