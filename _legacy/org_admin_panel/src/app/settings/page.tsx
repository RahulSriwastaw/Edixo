"use client";

import { useState } from "react";
import {
  Save,
  RotateCcw,
  Globe,
  Shield,
  Key,
  Coins,
  Server,
  Mail,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { toast } from "sonner";

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState("EduHub");
  const [platformUrl, setPlatformUrl] = useState("https://eduhub.in");
  const [supportEmail, setSupportEmail] = useState("support@eduhub.in");
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");

  const [sessionTimeout, setSessionTimeout] = useState("120");
  const [mfaRequired, setMfaRequired] = useState(true);

  const [defaultAICost, setDefaultAICost] = useState("5");
  const [pointRate, setPointRate] = useState("1");

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const handleReset = () => {
    toast.info("Settings reset to defaults");
  };

  return (
    <div className="min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6">
          <div className="max-w-[900px] mx-auto space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage platform configuration and preferences
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleReset} className="btn-secondary">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button onClick={handleSave} className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Platform Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Platform Settings</CardTitle>
                    <CardDescription>Basic platform configuration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformUrl">Platform URL</Label>
                    <Input
                      id="platformUrl"
                      value={platformUrl}
                      onChange={(e) => setPlatformUrl(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security</CardTitle>
                    <CardDescription>Authentication and access control settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="Enter allowed IP addresses, one per line"
                    className="input-field min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500">Leave empty to allow all IPs</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger className="input-field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                        <SelectItem value="240">240 minutes</SelectItem>
                        <SelectItem value="480">480 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>MFA Enforcement</Label>
                    <p className="text-sm text-gray-500">Require multi-factor authentication for Super Admin</p>
                  </div>
                  <Switch
                    checked={mfaRequired}
                    onCheckedChange={setMfaRequired}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">Deactivate Account</div>
                    <div className="text-sm text-gray-500">Temporarily suspend organization access</div>
                  </div>
                  <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                    Deactivate
                  </Button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-gray-900">Delete Organization</div>
                    <div className="text-sm text-gray-500">Permanently delete organization data. This cannot be undone.</div>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
