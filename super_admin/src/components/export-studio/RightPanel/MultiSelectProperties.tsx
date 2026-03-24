"use client";

import { useExportStudio, type CanvasElement } from "../hooks/useExportStudio";
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
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from "lucide-react";

interface Props {
  elements: CanvasElement[];
}

export function MultiSelectProperties({ elements }: Props) {
  const { 
    alignElements, 
    distributeElements, 
    reorderElements, 
    matchSize, 
    deleteMultipleElements,
    updateElement
  } = useExportStudio();

  const elementIds = elements.map(el => el.id);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">
        {elements.length} Elements Selected
      </h3>

      {/* Align Section */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Align</Label>

        {/* Horizontal Alignment */}
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400">Horizontal</span>
          <div className="flex gap-1.5">
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => alignElements(elementIds, 'left')}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => alignElements(elementIds, 'center')}
              title="Align Center"
            >
              <AlignCenterHorizontal className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => alignElements(elementIds, 'right')}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => distributeElements(elementIds, 'horizontal')}
              title="Distribute Horizontally"
            >
              <AlignHorizontalDistributeCenter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Vertical Alignment */}
        <div className="space-y-1">
          <span className="text-[10px] text-gray-400">Vertical</span>
          <div className="flex gap-1.5">
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => alignElements(elementIds, 'top')}
              title="Align Top"
            >
              <AlignStartVertical className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => alignElements(elementIds, 'middle')}
              title="Align Middle"
            >
              <AlignCenterVertical className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => alignElements(elementIds, 'bottom')}
              title="Align Bottom"
            >
              <AlignEndVertical className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" size="icon" className="h-9 w-9"
              onClick={() => distributeElements(elementIds, 'vertical')}
              title="Distribute Vertically"
            >
              <AlignVerticalDistributeCenter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Group Actions */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Actions</Label>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-2"
            onClick={() => {/* Implement Grouping logic if needed */}}
          >
            <span className="text-base">📦</span> Group Elements
          </Button>
          <Button 
            variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-2"
            onClick={() => reorderElements(elementIds, 'forward')}
          >
            <span className="text-base">📤</span> Bring Forward
          </Button>
          <Button 
            variant="outline" size="sm" className="w-full text-xs h-9 justify-start gap-2"
            onClick={() => reorderElements(elementIds, 'backward')}
          >
            <span className="text-base">📥</span> Send Backward
          </Button>
        </div>
      </div>

      <Separator />

      {/* Size */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Size</Label>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-gray-400">Width</span>
            <input
              type="number"
              className="w-full h-8 px-2 border rounded text-xs"
              placeholder="Auto"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  elements.forEach(el => updateElement(el.id, { size: { ...el.size, width: val } }));
                }
              }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-gray-400">Height</span>
            <input
              type="number"
              className="w-full h-8 px-2 border rounded text-xs"
              placeholder="Auto"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  elements.forEach(el => updateElement(el.id, { size: { ...el.size, height: val } }));
                }
              }}
            />
          </div>
        </div>
        <Button 
          variant="outline" size="sm" className="w-full text-xs h-9 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          onClick={() => matchSize(elementIds, 'both')}
        >
          Make Same Size
        </Button>
      </div>

      <Separator />

      {/* Selected Elements List */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Selected Elements</Label>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {elements.map((el) => (
            <div
              key={el.id}
              className="flex items-center justify-between p-2 bg-indigo-50/50 rounded-md border border-indigo-100/50 text-[10px]"
            >
              <div className="flex flex-col">
                <span className="capitalize font-bold text-indigo-900">{el.type}</span>
                <span className="text-indigo-400 truncate max-w-[120px]">
                  {el.content.text?.replace(/<[^>]*>/g, '') || el.content.shapeType || "No content"}
                </span>
              </div>
              <div className="text-gray-400 font-mono text-[8px]">
                {Math.round(el.position.x)}, {Math.round(el.position.y)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Delete All */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full text-xs h-10 gap-2 shadow-sm"
        onClick={() => deleteMultipleElements(elementIds)}
      >
        <span className="text-base">🗑️</span> Delete All Selected
      </Button>
    </div>
  );
}
