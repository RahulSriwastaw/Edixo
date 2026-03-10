"use client";
import { useSidebarStore } from "@/store/sidebarStore";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  Monitor,
  Palette,
  UserPlus,
  Check,
  Copy,
  Loader2,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const steps = [
  { id: 1, name: "Basic Info", icon: Building2 },
  { id: 2, name: "Plan", icon: CreditCard },
  { id: 3, name: "App Type", icon: Monitor },
  { id: 4, name: "Branding", icon: Palette },
  { id: 5, name: "Admin User", icon: UserPlus },
];

const plans = [
  {
    id: "Small",
    name: "Small",
    price: "₹5,000",
    period: "/month",
    teachers: "1-10 teachers",
    features: ["10 Teachers", "100 Students", "5GB Storage", "100 AI Credits/month", "Email Support"],
    color: "blue",
  },
  {
    id: "Medium",
    name: "Medium",
    price: "₹15,000",
    period: "/month",
    teachers: "11-50 teachers",
    features: ["50 Teachers", "500 Students", "10GB Storage", "500 AI Credits/month", "Priority Support"],
    color: "orange",
    popular: true,
  },
  {
    id: "Large",
    name: "Large",
    price: "₹40,000",
    period: "/month",
    teachers: "51-200 teachers",
    features: ["200 Teachers", "2000 Students", "25GB Storage", "2000 AI Credits/month", "Dedicated Support"],
    color: "green",
  },
  {
    id: "Enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    teachers: "200+ teachers",
    features: ["Unlimited Teachers", "Unlimited Students", "Unlimited Storage", "Unlimited AI Credits", "24/7 Support", "Custom Integrations"],
    color: "purple",
  },
];

const appTypes = [
  {
    id: "STUDENT",
    name: "Student App Only",
    icon: "🎓",
    description: "Courses, notes, videos, class schedule",
    color: "blue",
  },
  {
    id: "MOCKBOOK",
    name: "MockBook App Only",
    icon: "📋",
    description: "Mock tests, question bank, exam practice",
    color: "purple",
  },
  {
    id: "BOTH",
    name: "Both Apps",
    icon: "🎓 + 📋",
    description: "Full platform access for students",
    color: "orange",
    recommended: true,
  },
];

export default function NewOrganizationPage() {
  const { isOpen } = useSidebarStore();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedOrgId, setGeneratedOrgId] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    orgName: "",
    domain: "",
    email: "",
    phone: "",
    address: "",
    // Step 2: Plan
    plan: "Medium",
    billingCycle: "monthly",
    // Step 3: App Type
    appType: "BOTH",
    // Step 4: Branding
    displayName: "",
    primaryColor: "#F4511E",
    logoUrl: "",
    // Step 5: Admin User
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
  });

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.orgName,
        email: formData.email,
        mobile: formData.phone,
        plan: formData.plan.toUpperCase(),
        billingCycle: formData.billingCycle.toUpperCase(),
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        trialDays: 30,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/super-admin/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create organization');
      }

      setGeneratedOrgId(result.data.orgId);
      setIsComplete(true);
      toast.success("Organization created successfully");
    } catch (error: any) {
      console.error('Create Org Error:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(generatedOrgId);
    toast.success("Organization ID copied to clipboard");
  };

  const handleViewOrg = () => {
    router.push(`/organizations/${generatedOrgId}`);
  };

  const handleCreateAnother = () => {
    setIsComplete(false);
    setCurrentStep(1);
    setFormData({
      orgName: "",
      domain: "",
      email: "",
      phone: "",
      address: "",
      plan: "Medium",
      billingCycle: "monthly",
      appType: "BOTH",
      displayName: "",
      primaryColor: "#F4511E",
      logoUrl: "",
      adminName: "",
      adminEmail: "",
      adminPhone: "",
      adminPassword: "",
    });
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[1000px] mx-auto space-y-6 animate-fade-in">
            {/* Back Link */}
            <Link
              href="/organizations"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Organizations
            </Link>

            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Organization</h1>
              <p className="text-gray-500 text-sm mt-1">
                Create a new organization with the 5-step wizard
              </p>
            </div>

            {/* Stepper */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                              status === "completed"
                                ? "bg-green-500 text-white"
                                : status === "active"
                                  ? "bg-brand-primary text-white"
                                  : "bg-gray-100 text-gray-400"
                            )}
                          >
                            {status === "completed" ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-xs mt-2 font-medium",
                              status === "active"
                                ? "text-brand-primary"
                                : status === "completed"
                                  ? "text-green-600"
                                  : "text-gray-400"
                            )}
                          >
                            {step.id}. {step.name}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={cn(
                              "w-20 h-0.5 mx-2",
                              getStepStatus(step.id + 1) === "pending"
                                ? "bg-gray-200"
                                : "bg-green-500"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Completion Screen */}
            {isComplete ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Organization Created Successfully!
                  </h2>
                  <p className="text-gray-500 mb-6">
                    The organization has been set up and is ready to use.
                  </p>

                  <div className="max-w-sm mx-auto mb-6">
                    <Label className="text-left block mb-2">Unique Org ID</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-50 border rounded-lg px-4 py-3">
                        <span className="mono text-lg text-brand-primary">{generatedOrgId}</span>
                      </div>
                      <Button variant="outline" size="icon" onClick={handleCopyId}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">App Provisioning: In Progress</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">Estimated time: 2-3 minutes</p>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <Button className="btn-primary" onClick={handleViewOrg}>
                      View Organization
                    </Button>
                    <Button variant="outline" onClick={handleCreateAnother}>
                      Create Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Enter the basic details for the new organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Organization Name *</Label>
                          <Input
                            value={formData.orgName}
                            onChange={(e) => updateFormData("orgName", e.target.value)}
                            placeholder="e.g., Apex Academy"
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Domain *</Label>
                          <Input
                            value={formData.domain}
                            onChange={(e) => updateFormData("domain", e.target.value)}
                            placeholder="e.g., apex-academy.com"
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Email *</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            placeholder="e.g., contact@apex.com"
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            placeholder="e.g., +91 98765 43210"
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => updateFormData("address", e.target.value)}
                          placeholder="Full address"
                          className="input-field"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Plan Selection */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Label>Billing Cycle</Label>
                      <Select value={formData.billingCycle} onValueChange={(v) => updateFormData("billingCycle", v)}>
                        <SelectTrigger className="w-[180px] input-field">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly (Save 10%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {plans.map((plan) => (
                        <Card
                          key={plan.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md relative",
                            formData.plan === plan.id
                              ? "border-2 border-brand-primary shadow-md"
                              : "border hover:border-gray-300"
                          )}
                          onClick={() => updateFormData("plan", plan.id)}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-brand-primary text-white text-[10px]">RECOMMENDED</Badge>
                            </div>
                          )}
                          <CardContent className="p-4 text-center">
                            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                            <div className="mt-2">
                              <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                              <span className="text-gray-500">{plan.period}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{plan.teachers}</p>
                            <ul className="mt-4 space-y-2 text-left">
                              {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                  <Check className="w-3 h-3 text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            {formData.plan === plan.id && (
                              <div className="mt-4">
                                <Badge className="bg-brand-primary text-white">Selected</Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: App Type Selection */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Select App Type</CardTitle>
                      <CardDescription>Choose which app(s) this organization's students will use</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {appTypes.map((type) => (
                          <Card
                            key={type.id}
                            className={cn(
                              "cursor-pointer transition-all hover:shadow-md relative",
                              formData.appType === type.id
                                ? "border-2 border-brand-primary shadow-md"
                                : "border hover:border-gray-300"
                            )}
                            onClick={() => updateFormData("appType", type.id)}
                          >
                            {type.recommended && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-green-500 text-white text-[10px]">RECOMMENDED</Badge>
                              </div>
                            )}
                            <CardContent className="p-6 text-center">
                              <div className="text-4xl mb-3">{type.icon}</div>
                              <h3 className="font-semibold text-gray-900">{type.name}</h3>
                              <p className="text-sm text-gray-500 mt-2">{type.description}</p>
                              {formData.appType === type.id && (
                                <div className="mt-4">
                                  <Badge className="bg-brand-primary text-white">Selected</Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Branding */}
                {currentStep === 4 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding Settings</CardTitle>
                      <CardDescription>Customize the look and feel for this organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Display Name</Label>
                          <Input
                            value={formData.displayName || formData.orgName}
                            onChange={(e) => updateFormData("displayName", e.target.value)}
                            placeholder="e.g., Apex Academy"
                            className="input-field"
                          />
                          <p className="text-xs text-gray-500">Used in the app header and emails</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={formData.primaryColor}
                              onChange={(e) => updateFormData("primaryColor", e.target.value)}
                              className="w-14 h-10 p-1 border rounded"
                            />
                            <Input
                              value={formData.primaryColor}
                              onChange={(e) => updateFormData("primaryColor", e.target.value)}
                              className="input-field mono"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Logo URL</Label>
                          <Input
                            value={formData.logoUrl}
                            onChange={(e) => updateFormData("logoUrl", e.target.value)}
                            placeholder="https://..."
                            className="input-field"
                          />
                          <p className="text-xs text-gray-500">Optional - leave blank to use initials</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Custom Admin Domain</Label>
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="admin.example.com"
                              className="input-field"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Optional - can be configured later</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 5: Admin User */}
                {currentStep === 5 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Admin User</CardTitle>
                      <CardDescription>Set up the first admin user for this organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Admin Name *</Label>
                          <Input
                            value={formData.adminName}
                            onChange={(e) => updateFormData("adminName", e.target.value)}
                            placeholder="e.g., John Doe"
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Admin Email *</Label>
                          <Input
                            type="email"
                            value={formData.adminEmail}
                            onChange={(e) => updateFormData("adminEmail", e.target.value)}
                            placeholder="e.g., admin@apex.com"
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Admin Phone</Label>
                          <Input
                            value={formData.adminPhone}
                            onChange={(e) => updateFormData("adminPhone", e.target.value)}
                            placeholder="e.g., +91 98765 43210"
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Initial Password *</Label>
                          <Input
                            type="password"
                            value={formData.adminPassword}
                            onChange={(e) => updateFormData("adminPassword", e.target.value)}
                            placeholder="Set a secure password"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="btn-secondary"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 5 ? (
                    <Button className="btn-primary" onClick={nextStep}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      className="btn-primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Organization
                          <Check className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
