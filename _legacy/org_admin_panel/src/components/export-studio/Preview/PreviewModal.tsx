"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Smartphone, Monitor, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportStudio } from "../hooks/useExportStudio";

export function PreviewModal() {
  const { togglePreview, pages, currentPageIndex, setCurrentPage, pageSize } = useExportStudio();
  const [viewMode, setViewMode] = useState<"mobile" | "desktop" | "print">("desktop");
  const [zoom, setZoom] = useState(80);
  const [format, setFormat] = useState<"pdf" | "pptx" | "png">("pdf");

  const currentPage = pages[currentPageIndex];

  const viewModes = [
    { id: "mobile", icon: Smartphone, label: "Mobile" },
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "print", icon: FileText, label: "Print" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={togglePreview} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Edit
          </Button>
          <span className="text-sm font-medium text-gray-500">PREVIEW</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {viewModes.map((mode) => (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? "default" : "ghost"}
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setViewMode(mode.id as typeof viewMode)}
              >
                <mode.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </Button>
            ))}
          </div>

          {/* Format Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {["pdf", "pptx", "png"].map((f) => (
              <Button
                key={f}
                variant={format === f ? "default" : "ghost"}
                size="sm"
                className="h-8 uppercase text-xs"
                onClick={() => setFormat(f as typeof format)}
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Zoom */}
          <select
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="h-8 px-2 border rounded text-sm"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={80}>80%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
          </select>

          <Button className="bg-[#F4511E] hover:bg-[#E64A19]">
            📤 Export
          </Button>

          <Button variant="ghost" size="icon" onClick={togglePreview}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8">
        <div
          className="bg-white shadow-2xl"
          style={{
            width: 794,
            height: 1123,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
          }}
        >
          {/* Render elements as preview */}
          {currentPage?.elements.map((element) => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                transform: `rotate(${element.rotation}deg)`,
                opacity: element.opacity,
              }}
            >
              {element.type === "text" && (
                <div
                  style={{
                    fontFamily: element.content.fontFamily,
                    fontSize: element.content.fontSize,
                    fontWeight: element.content.fontWeight,
                    fontStyle: element.content.fontStyle,
                    textAlign: element.content.textAlign,
                    color: element.style.color,
                    lineHeight: element.style.lineHeight,
                  }}
                  dangerouslySetInnerHTML={{ __html: element.content.text || "" }}
                />
              )}
              {element.type === "shape" && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: element.style.fill,
                    borderRadius: element.style.borderRadius,
                    border: `${element.style.strokeWidth}px solid ${element.style.stroke}`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          disabled={currentPageIndex === 0}
          onClick={() => setCurrentPage(currentPageIndex - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentPageIndex ? "bg-[#F4511E]" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        <span className="text-sm text-gray-500">
          Page {currentPageIndex + 1} of {pages.length}
        </span>

        <Button
          variant="outline"
          size="icon"
          disabled={currentPageIndex === pages.length - 1}
          onClick={() => setCurrentPage(currentPageIndex + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
