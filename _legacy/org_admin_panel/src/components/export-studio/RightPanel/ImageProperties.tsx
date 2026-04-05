"use client";

import type { CanvasElement } from "../hooks/useExportStudio";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Crop, FlipHorizontal, FlipVertical } from "lucide-react";

interface Props {
  element: CanvasElement;
}

const filters = [
  { id: "none", label: "None" },
  { id: "bw", label: "B&W" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "vintage", label: "Vintage" },
  { id: "fade", label: "Fade" },
];

const maskShapes = [
  { id: "none", label: "None", icon: "□" },
  { id: "circle", label: "Circle", icon: "○" },
  { id: "rounded", label: "Rounded", icon: "▢" },
  { id: "star", label: "Star", icon: "★" },
  { id: "hexagon", label: "Hexagon", icon: "⬡" },
];

export function ImageProperties({ element }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Image Properties</h3>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Crop className="w-3.5 h-3.5" />
          Crop
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FlipHorizontal className="w-3.5 h-3.5" />
          Flip H
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FlipVertical className="w-3.5 h-3.5" />
          Flip V
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs text-purple-600 border-purple-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Remove BG
        </Button>
      </div>

      <Separator />

      {/* Adjustments */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">ADJUSTMENTS</Label>
        {[
          { label: "Brightness", value: 0 },
          { label: "Contrast", value: 0 },
          { label: "Saturation", value: 0 },
          { label: "Blur", value: 0 },
        ].map((adj) => (
          <div key={adj.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{adj.label}</span>
              <span className="text-gray-400">{adj.value}</span>
            </div>
            <input
              type="range"
              min={adj.label === "Blur" ? 0 : -100}
              max={100}
              defaultValue={adj.value}
              className="w-full"
            />
          </div>
        ))}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Opacity</span>
            <span className="text-gray-400">{Math.round(element.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={Math.round(element.opacity * 100)}
            className="w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Filters */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">FILTERS</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Mask Shape */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">MASK SHAPE</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {maskShapes.map((mask) => (
            <button
              key={mask.id}
              className="aspect-square rounded border border-gray-200 flex items-center justify-center text-lg hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              {mask.icon}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Border & Shadow */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">BORDER & SHADOW</Label>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-gray-400">Width</span>
            <Input type="number" defaultValue={0} className="h-8 text-sm" min={0} />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-gray-400">Color</span>
            <Input type="color" defaultValue="#000000" className="h-8" />
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs">
          Add Shadow
        </Button>
      </div>

      <Separator />

      {/* Position & Size */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">POSITION & SIZE</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">X</span>
            <Input type="number" value={Math.round(element.position.x)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Y</span>
            <Input type="number" value={Math.round(element.position.y)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Width</span>
            <Input type="number" value={Math.round(element.size.width)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Height</span>
            <Input type="number" value={Math.round(element.size.height)} className="h-8 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
