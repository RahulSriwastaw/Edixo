"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, RefreshCw, Palette, Type, Layout, Upload, ImageIcon } from "lucide-react";
import { BACKEND_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

interface WhiteboardSettingsProps {
  setId: string;
  initialSettings: any;
  onSave: (settings: any) => Promise<void>;
}

// Helper to convert hex to ARGB integer
const hexToArgb = (hex: string) => {
  if (!hex) return 0;
  const cleanHex = hex.replace("#", "");
  return parseInt(`FF${cleanHex}`, 16);
};

// Helper to convert ARGB integer to hex
const argbToHex = (argb: number) => {
  if (argb === undefined || argb === null) return "#000000";
  const hex = (argb & 0x00ffffff).toString(16).padStart(6, "0");
  return `#${hex}`;
};

export function WhiteboardSettings({ setId, initialSettings, onSave }: WhiteboardSettingsProps) {
  const [settings, setSettings] = useState<any>({
    questionColor: 0xFFFFFFFF,
    questionBg: 0xFF262626,
    optionColor: 0xFFFFFF00,
    optionBg: 0x00000000,
    screenBg: 0xFF0D0D0D,
    questionFontSize: 24,
    optionFontSize: 20,
    showSourceBadge: true,
    questionBorderColor: 0x00000000,
    questionBorderWidth: 0,
    optionBorderColor: 0x00000000,
    optionBorderWidth: 0,
    backgroundPreset: "",
    showCardBackground: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings((prev: any) => ({ ...prev, ...initialSettings }));
    }
  }, [initialSettings]);

  const updateField = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      toast.success("Whiteboard settings saved successfully");
    } catch (error) {
      toast.error("Failed to save whiteboard settings");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      questionColor: 0xFFFFFFFF,
      questionBg: 0xFF262626,
      optionColor: 0xFFFFFF00,
      optionBg: 0x00000000,
      screenBg: 0xFF0D0D0D,
      questionFontSize: 24,
      optionFontSize: 20,
      showSourceBadge: true,
      questionBorderColor: 0x00000000,
      questionBorderWidth: 0,
      optionBorderColor: 0x00000000,
      optionBorderWidth: 0,
      backgroundPreset: "",
      showCardBackground: true,
    });
    toast.info("Settings reset to defaults (locally)");
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const match = document.cookie.match(/(?:^|;\s*)sb_token=([^;]*)/);
      const token = match ? match[1] : '';

      const res = await fetch(`${BACKEND_URL}/whiteboard/upload-image`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const resData = await res.json();
      updateField("backgroundPreset", resData.data.url);
      toast.success("Background image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload background image");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" /> Whiteboard Appearance
          </h2>
          <p className="text-sm text-gray-500">Configure how this set looks in the Whiteboard application.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>
          <Button size="sm" className="bg-[#F4511E] hover:bg-[#E64A19]" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question Card Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Type className="w-4 h-4 text-[#F4511E]" /> Question Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2 items-center">
                   <Input 
                    type="color" 
                    value={argbToHex(settings.questionColor)} 
                    onChange={(e) => updateField('questionColor', hexToArgb(e.target.value))}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <code className="text-xs uppercase">{argbToHex(settings.questionColor)}</code>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    value={argbToHex(settings.questionBg)} 
                    onChange={(e) => updateField('questionBg', hexToArgb(e.target.value))}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                   <code className="text-xs uppercase">{argbToHex(settings.questionBg)}</code>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Font Size ({settings.questionFontSize}px)</Label>
              </div>
              <Slider 
                value={[settings.questionFontSize]} 
                min={12} 
                max={64} 
                step={1} 
                onValueChange={([val]) => updateField('questionFontSize', val)} 
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Border Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    value={argbToHex(settings.questionBorderColor)} 
                    onChange={(e) => updateField('questionBorderColor', hexToArgb(e.target.value))}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <code className="text-xs uppercase">{argbToHex(settings.questionBorderColor)}</code>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                 <Label className="block mb-1">Border Width ({settings.questionBorderWidth}px)</Label>
                 <Slider 
                  value={[settings.questionBorderWidth]} 
                  min={0} 
                  max={10} 
                  step={0.5} 
                  onValueChange={([val]) => updateField('questionBorderWidth', val)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options Card Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center gap-2">
              <Layout className="w-4 h-4 text-blue-500" /> Options Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    value={argbToHex(settings.optionColor)} 
                    onChange={(e) => updateField('optionColor', hexToArgb(e.target.value))}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                   <code className="text-xs uppercase">{argbToHex(settings.optionColor)}</code>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    value={argbToHex(settings.optionBg)} 
                    onChange={(e) => updateField('optionBg', hexToArgb(e.target.value))}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                   <code className="text-xs uppercase">{argbToHex(settings.optionBg)}</code>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Font Size ({settings.optionFontSize}px)</Label>
              </div>
              <Slider 
                value={[settings.optionFontSize]} 
                min={12} 
                max={48} 
                step={1} 
                onValueChange={([val]) => updateField('optionFontSize', val)} 
              />
            </div>

            <Separator />

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label>Border Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    value={argbToHex(settings.optionBorderColor)} 
                    onChange={(e) => updateField('optionBorderColor', hexToArgb(e.target.value))}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <code className="text-xs uppercase">{argbToHex(settings.optionBorderColor)}</code>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                 <Label className="block mb-1">Border Width ({settings.optionBorderWidth}px)</Label>
                 <Slider 
                  value={[settings.optionBorderWidth]} 
                  min={0} 
                  max={10} 
                  step={0.5} 
                  onValueChange={([val]) => updateField('optionBorderWidth', val)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global Whiteboard Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-md">Global Whiteboard Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Canvas Background Color</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    value={argbToHex(settings.screenBg)} 
                    onChange={(e) => updateField('screenBg', hexToArgb(e.target.value))}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <code className="text-xs uppercase">{argbToHex(settings.screenBg)}</code>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Background Image</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="https://example.com/background.jpg" 
                      value={settings.backgroundPreset || ""} 
                      onChange={(e) => updateField('backgroundPreset', e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="bg-upload" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('bg-upload')?.click()}
                      disabled={isUploading}
                    >
                      <Upload className={cn("w-4 h-4 mr-2", isUploading && "animate-bounce")} />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Enter a URL or upload a local image to use as the default background.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-card-bg" 
                  checked={settings.showCardBackground}
                  onCheckedChange={(val) => updateField('showCardBackground', val)}
                />
                <Label htmlFor="show-card-bg">Show Card Background and Shadows</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-source" 
                  checked={settings.showSourceBadge}
                  onCheckedChange={(val) => updateField('showSourceBadge', val)}
                />
                <Label htmlFor="show-source">Show Exam Source Badge</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 italic">
        Tip: These settings will serve as the initial default theme for any teacher who imports this question set. Teachers can still make temporary adjustments while teaching, but starting from your pre-configured look saves them time and ensures consistency.
      </div>
    </div>
  );
}
