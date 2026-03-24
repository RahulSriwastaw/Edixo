"use client";

import { useExportStudio, type CanvasElement } from "../hooks/useExportStudio";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
} from "lucide-react";

interface Props {
  element: CanvasElement;
}

const fonts = [
  "DM Serif Display",
  "DM Sans",
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Merriweather",
  "Playfair Display",
];

export function TextProperties({ element }: Props) {
  const { updateElement, updateElementsByRole, bulkEditMode, dataBindings } = useExportStudio();

  const handleChange = (field: string, value: unknown) => {
    let updates = {};
    if (field.startsWith("content.")) {
      const contentField = field.split(".")[1];
      updates = { content: { ...element.content, [contentField]: value } };
    } else if (field.startsWith("style.")) {
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
      <h3 className="text-sm font-semibold text-gray-800">Text Properties</h3>

      {/* Font Section */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Font Family</Label>
          <select
            value={element.content.fontFamily || "DM Sans"}
            onChange={(e) => handleChange("content.fontFamily", e.target.value)}
            className="w-full h-9 px-3 border rounded text-sm bg-white"
          >
            {fonts.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-gray-500">Size</Label>
            <Input
              type="number"
              value={element.content.fontSize || 16}
              onChange={(e) => handleChange("content.fontSize", parseInt(e.target.value))}
              className="h-9 text-sm"
              min={8}
              max={96}
            />
          </div>
          <div className="flex items-end gap-0.5">
            <Button
              variant={element.content.fontWeight === "bold" ? "default" : "outline"}
              size="icon"
              className="h-9 w-9"
              onClick={() =>
                handleChange(
                  "content.fontWeight",
                  element.content.fontWeight === "bold" ? "normal" : "bold"
                )
              }
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={element.content.fontStyle === "italic" ? "default" : "outline"}
              size="icon"
              className="h-9 w-9"
              onClick={() =>
                handleChange(
                  "content.fontStyle",
                  element.content.fontStyle === "italic" ? "normal" : "italic"
                )
              }
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Underline className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={element.style.color || "#111827"}
              onChange={(e) => handleChange("style.color", e.target.value)}
              className="w-10 h-9 p-1"
            />
            <Input
              value={element.style.color || "#111827"}
              onChange={(e) => handleChange("style.color", e.target.value)}
              className="flex-1 h-9 text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Alignment</Label>
          <div className="flex gap-1">
            {[
              { value: "left", icon: AlignLeft },
              { value: "center", icon: AlignCenter },
              { value: "right", icon: AlignRight },
              { value: "justify", icon: AlignJustify },
            ].map((align) => (
              <Button
                key={align.value}
                variant={element.content.textAlign === align.value ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => handleChange("content.textAlign", align.value)}
              >
                <align.icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Spacing Section */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">SPACING</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Line Height</span>
            <Input
              type="number"
              value={element.style.lineHeight || 1.5}
              onChange={(e) => handleChange("style.lineHeight", parseFloat(e.target.value))}
              className="h-8 text-sm"
              step={0.1}
              min={0.5}
              max={3}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Letter Spacing</span>
            <Input
              type="number"
              value={element.style.letterSpacing || 0}
              onChange={(e) => handleChange("style.letterSpacing", parseFloat(e.target.value))}
              className="h-8 text-sm"
              step={0.01}
              min={-0.5}
              max={1}
            />
          </div>
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
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Rotation</span>
            <Input
              type="number"
              value={element.rotation}
              onChange={(e) => handleChange("rotation", parseInt(e.target.value))}
              className="h-8 text-sm"
              min={-360}
              max={360}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Opacity</span>
            <Input
              type="number"
              value={Math.round(element.opacity * 100)}
              onChange={(e) => handleChange("opacity", parseInt(e.target.value) / 100)}
              className="h-8 text-sm"
              min={0}
              max={100}
            />
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs">
          🔒 Lock Position
        </Button>
      </div>

      <Separator />

      {/* Data Binding */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 font-semibold">DATA BINDING</Label>
        <select
          value={element.dataBinding || ""}
          onChange={(e) => updateElement(element.id, { dataBinding: e.target.value || undefined })}
          className="w-full h-9 px-3 border rounded text-sm bg-white"
        >
          <option value="">None (Static Text)</option>
          {dataBindings.map((binding) => (
            <option key={binding.key} value={binding.key}>
              {binding.label} ({binding.value})
            </option>
          ))}
        </select>
        {element.dataBinding && (
          <p className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
            This text will be replaced with {"{{"}
            {element.dataBinding}
            {"}}"} when exported.
          </p>
        )}
      </div>
    </div>
  );
}
