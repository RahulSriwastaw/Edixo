"use client";

import { useExportStudio, type CanvasElement } from "../hooks/useExportStudio";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  element: CanvasElement;
}

export function ShapeProperties({ element }: Props) {
  const { updateElement, updateElementsByRole, bulkEditMode } = useExportStudio();

  const handleChange = (field: string, value: unknown) => {
    let updates = {};
    if (field.startsWith("style.")) {
      const styleField = field.split(".")[1];
      updates = { style: { ...element.style, [styleField]: value } };
    } else {
      updates = { [field]: value };
    }

    if (bulkEditMode && element.role) {
      updateElementsByRole(element.role, updates);
    } else {
      updateElement(element.id, updates);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">Shape Properties</h3>

      {/* Style Section */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">STYLE</Label>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Fill Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={element.style.fill || "#F4511E"}
              onChange={(e) => handleChange("style.fill", e.target.value)}
              className="w-10 h-9 p-1"
            />
            <Input
              value={element.style.fill || "#F4511E"}
              onChange={(e) => handleChange("style.fill", e.target.value)}
              className="flex-1 h-9 text-sm font-mono"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-gray-500">Stroke</Label>
            <Input
              type="color"
              value={element.style.stroke || "#000000"}
              onChange={(e) => handleChange("style.stroke", e.target.value)}
              className="w-full h-9 p-1"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-gray-500">Width</Label>
            <Input
              type="number"
              value={element.style.strokeWidth || 0}
              onChange={(e) => handleChange("style.strokeWidth", parseInt(e.target.value))}
              className="h-9 text-sm"
              min={0}
              max={20}
            />
          </div>
        </div>

        {element.content.shapeType === "rectangle" && (
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Corner Radius</Label>
            <Input
              type="number"
              value={element.style.borderRadius || 0}
              onChange={(e) => handleChange("style.borderRadius", parseInt(e.target.value))}
              className="h-9 text-sm"
              min={0}
              max={100}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Opacity</Label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(element.opacity * 100)}
              onChange={(e) => handleChange("opacity", parseInt(e.target.value) / 100)}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-10 text-right">
              {Math.round(element.opacity * 100)}%
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Effects Section */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">EFFECTS</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Shadow
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Glow
          </Button>
        </div>
      </div>

      <Separator />

      {/* Position & Size */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">POSITION & SIZE</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">X</span>
            <Input
              type="number"
              value={Math.round(element.position.x)}
              onChange={(e) => handleChange("position.x", parseInt(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Y</span>
            <Input
              type="number"
              value={Math.round(element.position.y)}
              onChange={(e) => handleChange("position.y", parseInt(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Width</span>
            <Input
              type="number"
              value={Math.round(element.size.width)}
              onChange={(e) => handleChange("size.width", parseInt(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Height</span>
            <Input
              type="number"
              value={Math.round(element.size.height)}
              onChange={(e) => handleChange("size.height", parseInt(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="lockAspect" defaultChecked />
          <label htmlFor="lockAspect" className="text-xs text-gray-600">
            Keep aspect ratio
          </label>
        </div>
      </div>
    </div>
  );
}
