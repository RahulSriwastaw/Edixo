"use client";

import type { CanvasElement } from "../hooks/useExportStudio";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  element: CanvasElement;
}

const chartTypes = [
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "pie", label: "Pie" },
  { id: "donut", label: "Donut" },
  { id: "area", label: "Area" },
];

const colorSchemes = [
  { id: "brand", colors: ["#F4511E", "#1E3A5F", "#FFB74D"] },
  { id: "warm", colors: ["#F4511E", "#FF8A65", "#FFB74D"] },
  { id: "cool", colors: ["#1E3A5F", "#64B5F6", "#90CAF9"] },
  { id: "mono", colors: ["#111827", "#6B7280", "#D1D5DB"] },
];

export function ChartProperties({ element }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Chart Properties</h3>

      {/* Chart Type */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">CHART TYPE</Label>
        <div className="grid grid-cols-5 gap-1">
          {chartTypes.map((type) => (
            <Button
              key={type.id}
              variant={element.content.chartType === type.id ? "default" : "outline"}
              size="sm"
              className="h-9 text-[10px] px-1"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Chart Data */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-500 font-semibold">CHART DATA</Label>
          <Button variant="outline" size="sm" className="text-xs h-7">
            Edit Data
          </Button>
        </div>
        <p className="text-xs text-gray-400">
          Connect to your data source or manually edit values.
        </p>
      </div>

      <Separator />

      {/* Color Scheme */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">COLOR SCHEME</Label>
        <div className="space-y-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.id}
              className="w-full flex items-center gap-3 p-2 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <div className="flex gap-0.5">
                {scheme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color, marginLeft: i > 0 ? -4 : 0 }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 capitalize">{scheme.id}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Chart Options */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">OPTIONS</Label>
        <div className="space-y-2">
          {["Show legend", "Show labels", "Show grid", "Animate on load"].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-xs text-gray-600">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Position & Size */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">POSITION & SIZE</Label>
        <div className="grid grid-cols-2 gap-2">
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
