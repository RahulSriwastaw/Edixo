"use client";

import { useExportStudio, type PageSize } from "../hooks/useExportStudio";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const pageSizes: { value: PageSize; label: string }[] = [
  { value: "a4_portrait", label: "A4 Portrait" },
  { value: "a4_landscape", label: "A4 Landscape" },
  { value: "a3_portrait", label: "A3 Portrait" },
  { value: "us_letter", label: "US Letter" },
  { value: "presentation_16_9", label: "Presentation (16:9)" },
  { value: "certificate", label: "Certificate" },
  { value: "social_1_1", label: "Social Post (1:1)" },
];

export function DocumentProperties() {
  const { title, setTitle, pageSize, setPageSize, pages, orgBranding } = useExportStudio();

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-800">Document Properties</h3>

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Document Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      {/* Page Size */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Page Size</Label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as PageSize)}
          className="w-full h-9 px-3 border rounded text-sm bg-white"
        >
          {pageSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Background */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Background Color</Label>
        <div className="flex gap-2">
          <Input type="color" value="#ffffff" className="w-10 h-9 p-1" />
          <Input value="#FFFFFF" className="flex-1 h-9 text-sm font-mono" readOnly />
        </div>
      </div>

      <Separator />

      {/* Margins */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Margins (mm)</Label>
        <div className="grid grid-cols-4 gap-1">
          <div>
            <span className="text-[10px] text-gray-400">Top</span>
            <Input type="number" defaultValue={20} className="h-8 text-xs" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400">Right</span>
            <Input type="number" defaultValue={20} className="h-8 text-xs" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400">Bottom</span>
            <Input type="number" defaultValue={20} className="h-8 text-xs" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400">Left</span>
            <Input type="number" defaultValue={20} className="h-8 text-xs" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Organization Branding */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500">Organization Branding</Label>
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: orgBranding.color }}
          >
            {orgBranding.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{orgBranding.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: orgBranding.color }}
              />
              <span className="text-xs text-gray-400 font-mono">
                {orgBranding.color}
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          Apply Branding to Document
        </Button>
      </div>

      <Separator />

      {/* Page Info */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>Pages: {pages.length}</p>
        <p>Total Elements: {pages.reduce((sum, p) => sum + p.elements.length, 0)}</p>
      </div>
    </div>
  );
}
