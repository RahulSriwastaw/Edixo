"use client";

import type { CanvasElement } from "../hooks/useExportStudio";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlignLeft,
  AlignCenterHorizontal,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  DistributeHorizontal,
  DistributeVertical,
} from "lucide-react";

interface Props {
  elements: CanvasElement[];
}

export function MultiSelectProperties({ elements }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">
        {elements.length} Elements Selected
      </h3>

      {/* Align Section */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">ALIGN</Label>
        
        {/* Horizontal Alignment */}
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400">Horizontal</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <AlignCenterHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <DistributeHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Vertical Alignment */}
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400">Vertical</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <AlignStartVertical className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <AlignCenterVertical className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <AlignEndVertical className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <DistributeVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Group Actions */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">ACTIONS</Label>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full text-xs">
            📦 Group Elements
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs">
            📤 Bring Forward
          </Button>
          <Button variant="outline" size="sm" className="w-full text-xs">
            📥 Send Backward
          </Button>
        </div>
      </div>

      <Separator />

      {/* Size */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">SIZE</Label>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-gray-400">Width</span>
            <input
              type="number"
              className="w-full h-8 px-2 border rounded text-sm"
              placeholder="Auto"
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-gray-400">Height</span>
            <input
              type="number"
              className="w-full h-8 px-2 border rounded text-sm"
              placeholder="Auto"
            />
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs">
          Make Same Size
        </Button>
      </div>

      <Separator />

      {/* Selected Elements List */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">SELECTED ELEMENTS</Label>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {elements.map((el) => (
            <div
              key={el.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
            >
              <span className="capitalize text-gray-700">{el.type}</span>
              <span className="text-gray-400 truncate max-w-[100px]">
                {el.content.text || el.content.shapeType || "..."}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Delete All */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        🗑️ Delete All Selected
      </Button>
    </div>
  );
}
