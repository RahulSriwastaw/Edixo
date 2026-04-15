"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Settings, 
  Cpu, 
  Zap, 
  Beaker, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Type as TextIcon,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getAISettings, updateAISettings, AISettings } from '@/services/aiSettingsService';
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

// Available Models List (Sync with backend ai.config.ts)
const ALL_MODELS = [
  { id: 'GEMINI_3_1_PRO_PREVIEW', name: 'Gemini 3.1 Pro (Preview)', provider: 'Google', capabilities: ['Vision', 'Complex'] },
  { id: 'GEMINI_3_FLASH_PREVIEW', name: 'Gemini 2.0 Flash', provider: 'Google', capabilities: ['Vision', 'Fast'] },
  { id: 'GEMINI_3_1_FLASH_LITE_PREVIEW', name: 'Gemini 3.1 Flash Lite (Preview)', provider: 'Google', capabilities: ['Vision', 'Lite'] },
  { id: 'GEMINI_PRO_LATEST', name: 'Gemini Pro (Latest)', provider: 'Google', capabilities: ['Vision', 'Complex'] },
  { id: 'GEMINI_FLASH_LATEST', name: 'Gemini Flash (Latest)', provider: 'Google', capabilities: ['Vision', 'Fast'] },
  { id: 'GEMINI_FLASH_LITE_LATEST', name: 'Gemini Flash Lite (Latest)', provider: 'Google', capabilities: ['Vision', 'Lite'] },
  { id: 'GEMINI_2_0_FLASH', name: 'Gemini 2.0 Flash (Stable)', provider: 'Google', capabilities: ['Vision', 'Next-Gen'] },
  { id: 'GEMINI_1_5_PRO', name: 'Gemini 1.5 Pro', provider: 'Google', capabilities: ['Vision', 'Complex'] },
  { id: 'GEMINI_1_5_FLASH', name: 'Gemini 1.5 Flash', provider: 'Google', capabilities: ['Vision', 'Fast'] },
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
    const updated = current.includes(modelId)
      ? current.filter(id => id !== modelId)
      : [...current, modelId].slice(0, 5); // Limit to top 5
    
    setSettings({ ...settings, top5Models: updated });
  };

  const toggleKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const ConnectionBadge = ({ active, label }: { active: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
      <div className={`w-1 h-1 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
      {active ? `Connected (${label})` : `Not Linked (${label})`}
    </div>
  );

  if (loading) {
    return (
      <div className="flex bg-neutral-bg min-h-screen">
        <Sidebar />
        <div className={cn("flex flex-col flex-1 transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
           <TopBar />
           <div className="flex h-[80vh] items-center justify-center">
             <RefreshCw className="w-10 h-10 text-primary animate-spin" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-neutral-bg min-h-screen">
      <Sidebar />
      <div className={cn("flex flex-col flex-1 transition-all duration-300", isOpen ? "ml-60" : "ml-0")}>
        <TopBar />
        <main className="flex-1 p-8 space-y-10 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                   <Sparkles className="w-6 h-6 text-primary" />
                 </div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Settings</h1>
              </div>
              <p className="text-slate-500 font-medium ml-1">Centralized Neural Management & API Orchestration</p>
            </div>
            <Button 
              size="lg" 
              onClick={handleSave} 
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white px-8 h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 w-full md:w-auto"
            >
              {saving ? <RefreshCw className="mr-2 animate-spin" /> : <Save className="mr-2" />}
              Save Global Configuration
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* API Connections Card */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <div>
                       <CardTitle className="text-xl font-black">API Connections</CardTitle>
                       <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">Configure your Neural Gateways</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Gemini (Google)</Label>
                           {settings?.envStatus && <ConnectionBadge active={settings.envStatus.gemini} label="ENV" />}
                        </div>
                        <div className="relative">
                          <Input 
                            type={showKeys.gemini ? "text" : "password"}
                            value={settings?.apiKeyGemini || ''}
                            onChange={(e) => setSettings(s => s ? ({ ...s, apiKeyGemini: e.target.value }) : null)}
                            placeholder={settings?.envStatus?.gemini ? "Using System Key (.env)" : "AIzaSy..."}
                            className="h-12 border-slate-200 rounded-xl pr-12 focus:ring-primary/10 bg-slate-50/30"
                          />
                          <button onClick={()=>toggleKey('gemini')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showKeys.gemini ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                        {settings?.envStatus?.gemini && <p className="text-[10px] text-green-600 font-bold ml-1">✓ System Variable (.env) is Active</p>}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">OpenRouter (Gemma/Llama)</Label>
                           {settings?.envStatus && <ConnectionBadge active={settings.envStatus.openrouter} label="ENV" />}
                        </div>
                        <div className="relative">
                          <Input 
                            type={showKeys.or ? "text" : "password"}
                            value={settings?.apiKeyOpenRouter || ''}
                            onChange={(e) => setSettings(s => s ? ({ ...s, apiKeyOpenRouter: e.target.value }) : null)}
                            placeholder={settings?.envStatus?.openrouter ? "Using System Key (.env)" : "sk-or-v1-..."}
                            className="h-12 border-slate-200 rounded-xl pr-12 focus:ring-primary/10 bg-slate-50/30"
                          />
                          <button onClick={()=>toggleKey('or')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showKeys.or ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                        {settings?.envStatus?.openrouter && <p className="text-[10px] text-green-600 font-bold ml-1">✓ System Variable (.env) is Active</p>}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Modal (Research GLM)</Label>
                           {settings?.envStatus && <ConnectionBadge active={settings.envStatus.modal} label="ENV" />}
                        </div>
                        <div className="relative">
                          <Input 
                            type={showKeys.modal ? "text" : "password"}
                            value={settings?.apiKeyModal || ''}
                            onChange={(e) => setSettings(s => s ? ({ ...s, apiKeyModal: e.target.value }) : null)}
                            placeholder={settings?.envStatus?.modal ? "Using System Key (.env)" : "modalresearch_..."}
                            className="h-12 border-slate-200 rounded-xl pr-12 focus:ring-primary/10 bg-slate-50/30"
                          />
                          <button onClick={()=>toggleKey('modal')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showKeys.modal ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                        {settings?.envStatus?.modal && <p className="text-[10px] text-green-600 font-bold ml-1">✓ System Variable (.env) is Active</p>}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Claude (Whiteboard AI)</Label>
                           {settings?.envStatus && <ConnectionBadge active={settings.envStatus.claude} label="ENV" />}
                        </div>
                        <div className="relative">
                          <Input 
                            type={showKeys.claude ? "text" : "password"}
                            value={settings?.apiKeyClaude || ''}
                            onChange={(e) => setSettings(s => s ? ({ ...s, apiKeyClaude: e.target.value }) : null)}
                            placeholder={settings?.envStatus?.claude ? "Using System Key (.env)" : "sk-ant-..."}
                            className="h-12 border-slate-200 rounded-xl pr-12 focus:ring-primary/10 bg-slate-50/30"
                          />
                          <button onClick={()=>toggleKey('claude')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showKeys.claude ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                        {settings?.envStatus?.claude && <p className="text-[10px] text-green-600 font-bold ml-1">✓ System Variable (.env) is Active</p>}
                      </div>
                   </div>
                </CardContent>
              </Card>

              {/* Model Mapping */}
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem]">
                <CardHeader className="p-8">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-primary" />
                    <div>
                       <CardTitle className="text-xl font-black">Dynamic Mapping</CardTitle>
                       <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">Define Smart Logic Defaults</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="bg-slate-50 p-6 rounded-3xl space-y-6 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <TextIcon className="w-5 h-5 text-indigo-500" />
                        <span className="font-black text-slate-900">Text Engine</span>
                      </div>
                      <Select 
                        value={settings?.defaultTextModel} 
                        onValueChange={(v)=>setSettings(s => s ? ({ ...s, defaultTextModel: v }) : null)}
                      >
                        <SelectTrigger className="bg-white h-14 rounded-2xl border-none shadow-sm font-bold text-slate-700">
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                          {ALL_MODELS.map(m => (
                            <SelectItem key={m.id} value={m.id} className="rounded-xl focus:bg-primary/5 py-3">
                               <div className="flex flex-col">
                                 <span className="font-bold text-sm">{m.name}</span>
                                 <span className="text-[10px] text-slate-400">{m.provider}</span>
                               </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-slate-400 font-medium px-2">Used for text processing, question proofer, and MCQ extraction without images.</p>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-3xl space-y-6 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-rose-500" />
                        <span className="font-black text-slate-900">Vision Engine</span>
                      </div>
                      <Select 
                        value={settings?.defaultImageModel} 
                        onValueChange={(v)=>setSettings(s => s ? ({ ...s, defaultImageModel: v }) : null)}
                      >
                        <SelectTrigger className="bg-white h-14 rounded-2xl border-none shadow-sm font-bold text-slate-700">
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-2xl border-none p-2">
                          {ALL_MODELS.filter(m => m.capabilities.includes('Vision')).map(m => (
                            <SelectItem key={m.id} value={m.id} className="rounded-xl focus:bg-primary/5 py-3">
                               <div className="flex flex-col">
                                 <span className="font-bold text-sm">{m.name}</span>
                                 <span className="text-[10px] text-slate-400">{m.provider}</span>
                               </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-slate-400 font-medium px-2">Used for Image-to-Text, OCR, and document scanning tasks.</p>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Top 5 Selection Sidebar */}
            <div>
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] sticky top-8">
                 <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black">Preferred Models</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">Select Top 5 for Global Tools</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8 pt-0 space-y-4">
                    {ALL_MODELS.map(model => {
                      const isSelected = settings?.top5Models.includes(model.id);
                      return (
                        <motion.div 
                          key={model.id}
                          whileHover={{ x: 5 }}
                          onClick={() => toggleTop5(model.id)}
                          className={`group p-4 rounded-2xl cursor-pointer border-2 transition-all flex items-center justify-between ${isSelected ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-white text-slate-400 group-hover:text-primary'}`}>
                               {model.capabilities.includes('Vision') ? <ImageIcon size={20}/> : <TextIcon size={20}/>}
                            </div>
                            <div className="flex flex-col">
                               <span className={`font-black text-sm ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{model.name}</span>
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{model.provider}</span>
                            </div>
                          </div>
                          {isSelected ? <CheckCircle2 className="text-primary w-5 h-5" /> : <PlusCircle className="text-slate-200 w-5 h-5 group-hover:text-slate-300" />}
                        </motion.div>
                      )
                    })}

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between px-2">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Slots:</span>
                       <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-4 py-1 rounded-full">
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

function PlusCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
  );
}
