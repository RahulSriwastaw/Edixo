"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Settings,
  Key,
  CheckCircle2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Type as TextIcon,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getAISettings, updateAISettings, AISettings } from "@/services/aiSettingsService";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

const ALL_MODELS = [
  { id: "GEMINI_3_1_PRO_PREVIEW", name: "Gemini 3.1 Pro (Preview)", provider: "Google", capabilities: ["Vision", "Complex"] },
  { id: "GEMINI_3_FLASH_PREVIEW", name: "Gemini 2.0 Flash", provider: "Google", capabilities: ["Vision", "Fast"] },
  { id: "GEMINI_3_1_FLASH_LITE_PREVIEW", name: "Gemini 3.1 Flash Lite (Preview)", provider: "Google", capabilities: ["Vision", "Lite"] },
  { id: "GEMINI_PRO_LATEST", name: "Gemini Pro (Latest)", provider: "Google", capabilities: ["Vision", "Complex"] },
  { id: "GEMINI_FLASH_LATEST", name: "Gemini Flash (Latest)", provider: "Google", capabilities: ["Vision", "Fast"] },
  { id: "GEMINI_FLASH_LITE_LATEST", name: "Gemini Flash Lite (Latest)", provider: "Google", capabilities: ["Vision", "Lite"] },
  { id: "GEMINI_2_0_FLASH", name: "Gemini 2.0 Flash (Stable)", provider: "Google", capabilities: ["Vision", "Next-Gen"] },
  { id: "GEMINI_1_5_PRO", name: "Gemini 1.5 Pro", provider: "Google", capabilities: ["Vision", "Complex"] },
  { id: "GEMINI_1_5_FLASH", name: "Gemini 1.5 Flash", provider: "Google", capabilities: ["Vision", "Fast"] },
];

export default function AISettingsPage() {
  const { isOpen } = useSidebarStore();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getAISettings();
      setSettings(data);
    } catch (error) {
      toast.error("Failed to load AI settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await updateAISettings(settings);
      toast.success("AI Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleTop5 = (modelId: string) => {
    if (!settings) return;
    const current = settings.top5Models || [];
    const updated = current.includes(modelId) ? current.filter((id) => id !== modelId) : [...current, modelId].slice(0, 5);
    setSettings({ ...settings, top5Models: updated });
  };

  const toggleKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const ConnectionBadge = ({ active, label }: { active: boolean; label: string }) => (
    <div
      className={`flex items-center gap-1.5 px-2 py-[3px] rounded-[20px] text-[11px] font-medium uppercase tracking-wider ${active ? "bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]" : "bg-[var(--bg-main)] text-[var(--text-muted)]"
        }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[var(--badge-success-text)]" : "bg-[var(--text-muted)]"}`} />
      {active ? `Connected (${label})` : `Not Linked (${label})`}
    </div>
  );

  if (loading) {
    return (
      <div className="flex bg-neutral-bg min-h-screen">
        <Sidebar />
        <div className={cn("flex flex-col flex-1 transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
          <TopBar />
          <div className="flex h-[80vh] items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-neutral-bg min-h-screen">
      <Sidebar />
      <div className={cn("flex flex-col flex-1 transition-all duration-300", isOpen ? "md:ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-4 lg:p-5 space-y-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight">AI Settings</h1>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium ml-0.5">
                Centralized Neural Management & API Orchestration
              </p>
            </div>
            <Button
              size="default"
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white px-5 h-9 rounded-[6px] w-full md:w-auto text-[13px] font-medium"
            >
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Global Configuration
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* API Connections Card */}
            <div className="lg:col-span-2 space-y-3">
              <Card className="border border-[var(--border-card)] rounded-lg overflow-hidden">
                <CardHeader className="bg-[var(--bg-main)] border-b border-[var(--divider)] p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-[13px] font-semibold">API Connections</CardTitle>
                      <CardDescription className="text-[11px] font-medium uppercase tracking-[0.8px] mt-0.5 text-[var(--text-muted)]">
                        Configure your Neural Gateways
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        key: "gemini",
                        label: "Gemini (Google)",
                        value: settings?.apiKeyGemini || "",
                        placeholder: settings?.envStatus?.gemini ? "Using System Key (.env)" : "AIzaSy...",
                        setter: (v: string) => setSettings((s) => (s ? { ...s, apiKeyGemini: v } : null)),
                      },
                      {
                        key: "or",
                        label: "OpenRouter (Gemma/Llama)",
                        value: settings?.apiKeyOpenRouter || "",
                        placeholder: settings?.envStatus?.openrouter ? "Using System Key (.env)" : "sk-or-v1-...",
                        setter: (v: string) => setSettings((s) => (s ? { ...s, apiKeyOpenRouter: v } : null)),
                      },
                      {
                        key: "modal",
                        label: "Modal (Research GLM)",
                        value: settings?.apiKeyModal || "",
                        placeholder: settings?.envStatus?.modal ? "Using System Key (.env)" : "modalresearch_...",
                        setter: (v: string) => setSettings((s) => (s ? { ...s, apiKeyModal: v } : null)),
                      },
                      {
                        key: "claude",
                        label: "Claude (Whiteboard AI)",
                        value: settings?.apiKeyClaude || "",
                        placeholder: settings?.envStatus?.claude ? "Using System Key (.env)" : "sk-ant-...",
                        setter: (v: string) => setSettings((s) => (s ? { ...s, apiKeyClaude: v } : null)),
                      },
                    ].map((field) => (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] font-semibold uppercase tracking-[0.8px] text-[var(--text-muted)]">
                            {field.label}
                          </Label>
                          {settings?.envStatus && (
                            <ConnectionBadge
                              active={settings.envStatus[field.key as keyof typeof settings.envStatus] as boolean}
                              label="ENV"
                            />
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            type={showKeys[field.key] ? "text" : "password"}
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            placeholder={field.placeholder}
                            className="h-8 border-[var(--border-input)] rounded-[6px] pr-10 bg-[var(--bg-input)]"
                          />
                          <button
                            onClick={() => toggleKey(field.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          >
                            {showKeys[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {settings?.envStatus?.[field.key as keyof typeof settings.envStatus] && (
                          <p className="text-[11px] text-[var(--badge-success-text)] font-medium ml-0.5">
                            ✓ System Variable (.env) is Active
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Model Mapping */}
              <Card className="border border-[var(--border-card)] rounded-lg">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-[13px] font-semibold">Dynamic Mapping</CardTitle>
                      <CardDescription className="text-[11px] font-medium uppercase tracking-[0.8px] mt-0.5 text-[var(--text-muted)]">
                        Define Smart Logic Defaults
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      icon: <TextIcon className="w-4 h-4 text-[#2196F3]" />,
                      title: "Text Engine",
                      value: settings?.defaultTextModel,
                      onChange: (v: string) => setSettings((s) => (s ? { ...s, defaultTextModel: v } : null)),
                      filter: () => true,
                      desc: "Used for text processing, question proofer, and MCQ extraction without images.",
                    },
                    {
                      icon: <ImageIcon className="w-4 h-4 text-[#9C27B0]" />,
                      title: "Vision Engine",
                      value: settings?.defaultImageModel,
                      onChange: (v: string) => setSettings((s) => (s ? { ...s, defaultImageModel: v } : null)),
                      filter: (m: typeof ALL_MODELS[0]) => m.capabilities.includes("Vision"),
                      desc: "Used for Image-to-Text, OCR, and document scanning tasks.",
                    },
                  ].map((engine) => (
                    <div
                      key={engine.title}
                      className="bg-[var(--bg-main)] p-3 rounded-lg space-y-3 border border-[var(--divider)]"
                    >
                      <div className="flex items-center gap-2">
                        {engine.icon}
                        <span className="font-semibold text-[13px] text-[var(--text-primary)]">{engine.title}</span>
                      </div>
                      <Select value={engine.value} onValueChange={engine.onChange}>
                        <SelectTrigger className="bg-[var(--bg-input)] h-8 rounded-[6px] border-[var(--border-input)] text-[13px] text-[var(--text-primary)]">
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)]">
                          {ALL_MODELS.filter(engine.filter).map((m) => (
                            <SelectItem key={m.id} value={m.id} className="rounded-[6px] py-2 text-[13px]">
                              <div className="flex flex-col">
                                <span className="font-medium text-[13px]">{m.name}</span>
                                <span className="text-[11px] text-[var(--text-muted)]">{m.provider}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium px-0.5">{engine.desc}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Top 5 Selection Sidebar */}
            <div>
              <Card className="border border-[var(--border-card)] rounded-lg sticky top-4">
                <CardHeader className="p-4">
                  <CardTitle className="text-[13px] font-semibold">Preferred Models</CardTitle>
                  <CardDescription className="text-[11px] font-medium uppercase tracking-[0.8px] mt-0.5 text-[var(--text-muted)]">
                    Select Top 5 for Global Tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {ALL_MODELS.map((model) => {
                    const isSelected = settings?.top5Models.includes(model.id);
                    return (
                      <div
                        key={model.id}
                        onClick={() => toggleTop5(model.id)}
                        className={`group p-2.5 rounded-lg cursor-pointer border transition-all flex items-center justify-between ${isSelected
                            ? "border-primary bg-primary/5"
                            : "border-[var(--divider)] bg-[var(--bg-main)] hover:bg-[var(--bg-card)] hover:border-[var(--border-input)]"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-[6px] flex items-center justify-center ${isSelected ? "bg-primary text-white" : "bg-[var(--bg-card)] text-[var(--text-muted)] group-hover:text-primary"
                              }`}
                          >
                            {model.capabilities.includes("Vision") ? <ImageIcon size={16} /> : <TextIcon size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-semibold text-[13px] ${isSelected ? "text-primary" : "text-[var(--text-primary)]"}`}>
                              {model.name}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-tighter">
                              {model.provider}
                            </span>
                          </div>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="text-primary w-4 h-4" />
                        ) : (
                          <Plus className="text-[var(--text-muted)] w-4 h-4 group-hover:text-[var(--text-secondary)]" />
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-3 border-t border-[var(--divider)] flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.8px]">Active Slots:</span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary font-semibold px-2.5 py-[3px] rounded-[20px] text-[11px]"
                    >
                      {settings?.top5Models.length || 0} / 5
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
