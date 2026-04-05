"use client";

import { useState } from "react";
import { Sparkles, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExportStudio } from "../hooks/useExportStudio";

const quickActions = [
  { id: "branding", label: "Apply org branding", icon: "🎨" },
  { id: "summary", label: "Add summary page", icon: "📋" },
  { id: "improve", label: "Improve all text", icon: "📝" },
  { id: "charts", label: "Add data charts", icon: "📊" },
  { id: "translate", label: "Translate Hindi", icon: "🌐" },
  { id: "concise", label: "Make more concise", icon: "🎯" },
  { id: "images", label: "Suggest images", icon: "🖼️" },
  { id: "layout", label: "New layout", icon: "✨" },
  { id: "toc", label: "Add TOC", icon: "📋" },
  { id: "headings", label: "Better headings", icon: "🖊️" },
  { id: "page_numbers", label: "Add page numbers", icon: "🔢" },
  { id: "check_data", label: "Check data accuracy", icon: "✅" },
];

const historyItems = [
  { action: "Applied org branding", time: "2 min ago" },
  { action: "Added summary section", time: "5 min ago" },
];

export function AIPanel() {
  const { toggleAIPanel } = useExportStudio();
  const [prompt, setPrompt] = useState("");
  const [editTarget, setEditTarget] = useState<"document" | "page" | "element">("document");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApply = () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setPrompt("");
    }, 2000);
  };

  return (
    <div className="w-80 bg-[#FAFAFA] border-l border-gray-200 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleAIPanel}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Prompt Area */}
        <div className="space-y-3">
          <label className="text-sm text-gray-600">What do you want to do?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Make it look more professional"
            className="w-full h-24 px-3 py-2 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />

          {/* Edit Target */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Edit Target</label>
            <div className="flex gap-2">
              {[
                { value: "document", label: "Document" },
                { value: "page", label: "Page" },
                { value: "element", label: "Element" },
              ].map((target) => (
                <button
                  key={target.value}
                  onClick={() => setEditTarget(target.value as typeof editTarget)}
                  className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                    editTarget === target.value
                      ? "bg-purple-100 border-purple-300 text-purple-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {target.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleApply}
            disabled={!prompt.trim() || isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
          >
            {isProcessing ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Apply AI
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase">Quick Actions</label>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <span>{action.icon}</span>
                <span className="text-gray-700 text-left">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase">Recent AI Actions</label>
          <div className="space-y-1.5">
            {historyItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
              >
                <div>
                  <p className="text-xs text-gray-700">{item.action}</p>
                  <p className="text-[10px] text-gray-400">{item.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500">
                  ↩ Undo
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
