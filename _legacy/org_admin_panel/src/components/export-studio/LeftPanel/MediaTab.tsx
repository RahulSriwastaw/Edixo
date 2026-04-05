"use client";

import { useState } from "react";
import { Upload, Search, Sparkles, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockUploads = [
  { id: "u1", color: "#E8F4FD" },
  { id: "u2", color: "#FEF3E2" },
  { id: "u3", color: "#E8F5E9" },
];

const mockOrgAssets = [
  { id: "o1", name: "Logo", color: "#F4511E" },
  { id: "o2", name: "Banner", color: "#1E3A5F" },
];

const stockPhotos = [
  { id: "s1", color: "#FFE4C4" },
  { id: "s2", color: "#E6E6FA" },
  { id: "s3", color: "#F0FFF0" },
  { id: "s4", color: "#FFF0F5" },
  { id: "s5", color: "#F0F8FF" },
  { id: "s6", color: "#FFFACD" },
];

const icons = [
  "📚", "🎓", "📝", "🔬", "🧪", "📐", "📊", "💡", "✏️", "📖", "🎯", "🏆",
];

export function MediaTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#F4511E] hover:bg-orange-50/50 transition-colors cursor-pointer">
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600">Upload Image</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 10MB</p>
      </div>

      {/* My Uploads */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          📷 YOUR UPLOADS
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {mockUploads.map((img) => (
            <button
              key={img.id}
              className="aspect-square rounded border border-gray-200 overflow-hidden hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: img.color }}>
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Org Assets */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          🎨 ORG ASSETS
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {mockOrgAssets.map((asset) => (
            <button
              key={asset.id}
              className="flex items-center gap-2 p-2 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center"
                style={{ backgroundColor: asset.color }}
              >
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-600">{asset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Photos */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          🖼️ STOCK PHOTOS
        </h3>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search photos (Unsplash)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {stockPhotos.map((img) => (
            <button
              key={img.id}
              className="aspect-square rounded border border-gray-200 overflow-hidden hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: img.color }}>
                <ImageIcon className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-gray-500">
          Load more...
        </Button>
      </div>

      {/* Icons */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          📊 CHARTS & ICONS
        </h3>
        <div className="grid grid-cols-6 gap-1">
          {icons.map((icon, i) => (
            <button
              key={i}
              className="aspect-square rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all flex items-center justify-center text-base"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* AI Image Generation */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          🤖 AI IMAGE GENERATION
        </h3>
        {!showAIGenerator ? (
          <Button
            variant="outline"
            className="w-full gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowAIGenerator(true)}
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Describe the image..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="h-9 text-sm"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowAIGenerator(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Generate
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
