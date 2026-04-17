"use client";
import { useSidebarStore } from "@/store/sidebarStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Save,
  X,
  Plus,
  Trash2,
  Check,
  Package,
  ArrowLeft,
  Settings2,
  Info,
  ShieldCheck,
  CreditCard,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockbookPricingService } from "@/services/mockbookPricingService";
import { mockbookService, ExamFolder } from "@/services/mockbookService";

export default function CreatePlanPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ExamFolder[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    durationDays: "365",
    isActive: true,
    accessType: "GLOBAL",
    examCategoryIds: [] as string[],
    features: ["Access to all Mock Tests", "Detailed Analytics", "PDF Solutions"],
    sortOrder: "0",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const folders = await mockbookService.getFolders();
      setCategories(folders);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData({ ...formData, features: updated });
  };

  const removeFeature = (index: number) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updated });
  };

  const toggleCategory = (catId: string) => {
    const updated = formData.examCategoryIds.includes(catId)
      ? formData.examCategoryIds.filter(id => id !== catId)
      : [...formData.examCategoryIds, catId];
    setFormData({ ...formData, examCategoryIds: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.durationDays) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await mockbookPricingService.createPlan({
        ...formData,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        durationDays: Number(formData.durationDays),
        sortOrder: Number(formData.sortOrder),
        features: formData.features.filter(f => f.trim() !== ""),
      });
      toast.success("Plan created successfully!");
      router.push("/mockbook/plans");
    } catch (error) {
      console.error("Failed to create plan:", error);
      toast.error("Failed to create plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <Link href="/mockbook/plans">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Subscription Plan</h1>
                  <p className="text-gray-500 text-sm">Define a new package for your students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" type="button" asChild>
                  <Link href="/mockbook/plans">Cancel</Link>
                </Button>
                <Button className="btn-primary" type="submit" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Save Plan"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Basic Info & Pricing */}
              <div className="lg:col-span-2 space-y-6">
                {/* General Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-brand-primary" />
                      General Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Plan Name <span className="text-red-500">*</span></Label>
                        <Input 
                          id="name" 
                          placeholder="e.g. JEE Gold Pass" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="input-field" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Custom Slug (Optional)</Label>
                        <Input 
                          id="slug" 
                          placeholder="e.g. jee-gold" 
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          className="input-field" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Write a catchy description for the students..." 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="input-field min-h-[100px]" 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Validity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-brand-primary" />
                      Pricing & Validity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Regular Price (₹) <span className="text-red-500">*</span></Label>
                        <Input 
                          id="price" 
                          type="number"
                          placeholder="0.00" 
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="input-field" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountPrice">Discounted Price (₹)</Label>
                        <Input 
                          id="discountPrice" 
                          type="number"
                          placeholder="Leave blank if no discount" 
                          value={formData.discountPrice}
                          onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                          className="input-field border-orange-200 focus:ring-orange-200" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="durationDays">Validity (Days) <span className="text-red-500">*</span></Label>
                        <Select 
                          value={formData.durationDays} 
                          onValueChange={(val) => setFormData({...formData, durationDays: val})}
                        >
                          <SelectTrigger className="input-field">
                            <SelectValue placeholder="Select Duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">Monthly (30 Days)</SelectItem>
                            <SelectItem value="90">Quarterly (90 Days)</SelectItem>
                            <SelectItem value="180">Half-Yearly (180 Days)</SelectItem>
                            <SelectItem value="365">Yearly (365 Days)</SelectItem>
                            <SelectItem value="730">2 Years (730 Days)</SelectItem>
                            <SelectItem value="0">Lifetime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700 leading-relaxed">
                        Students will be automatically unsubscribed once the validity period ends. 
                        If set to <strong>Lifetime (0)</strong>, the plan will never expire.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features List */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Check className="w-5 h-5 text-brand-primary" />
                        Plan Features
                      </CardTitle>
                      <CardDescription>List the benefits students get with this plan</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center text-gray-400 font-mono text-xs">
                          {index + 1}.
                        </div>
                        <Input 
                          placeholder="e.g. Access to 500+ Mock Tests" 
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="input-field rounded-full h-9" 
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Access & Settings */}
              <div className="space-y-6">
                {/* Status & Visibility */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-brand-primary" />
                      Publication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold">Active Status</Label>
                        <p className="text-xs text-gray-500">Enable or disable this plan</p>
                      </div>
                      <Switch 
                        checked={formData.isActive}
                        onCheckedChange={(val) => setFormData({...formData, isActive: val})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input 
                        id="sortOrder" 
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({...formData, sortOrder: e.target.value})}
                        className="input-field" 
                      />
                      <p className="text-[10px] text-gray-400">Lower numbers appear first</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Scope & Access */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-brand-primary" />
                      Plan Access Range
                    </CardTitle>
                    <CardDescription>Control what this plan covers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button"
                          variant={formData.accessType === 'GLOBAL' ? 'primary' : 'outline'}
                          className={cn("h-10 text-xs", formData.accessType === 'GLOBAL' ? 'bg-brand-primary text-white' : '')}
                          onClick={() => setFormData({...formData, accessType: 'GLOBAL'})}
                        >
                          Global Access
                        </Button>
                        <Button 
                          type="button"
                          variant={formData.accessType === 'CATEGORY' ? 'primary' : 'outline'}
                          className={cn("h-10 text-xs", formData.accessType === 'CATEGORY' ? 'bg-brand-primary text-white' : '')}
                          onClick={() => setFormData({...formData, accessType: 'CATEGORY'})}
                        >
                          Category Based
                        </Button>
                      </div>

                      {formData.accessType === 'GLOBAL' ? (
                        <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700 leading-relaxed">
                          <strong>Global Pass:</strong> This plan will give students access to <strong>all</strong> mock tests and series across the entire application.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label className="text-xs font-semibold uppercase text-gray-400">Select Exam Categories</Label>
                          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {categories.map((cat) => (
                              <div 
                                key={cat.id} 
                                onClick={() => toggleCategory(cat.id)}
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all",
                                  formData.examCategoryIds.includes(cat.id) 
                                    ? "bg-brand-primary/5 border-brand-primary/50" 
                                    : "bg-white border-gray-100 hover:border-gray-300"
                                )}
                              >
                                <span className={cn("text-sm", formData.examCategoryIds.includes(cat.id) ? "font-bold text-brand-primary" : "text-gray-600")}>
                                  {cat.name}
                                </span>
                                {formData.examCategoryIds.includes(cat.id) && <Check className="w-4 h-4 text-brand-primary" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
