"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportStudio } from "../hooks/useExportStudio";
import { CanvasElement } from "./CanvasElement";

// A4 dimensions at 96dpi (pixels)
const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  a4_portrait: { width: 794, height: 1123 },
  a4_landscape: { width: 1123, height: 794 },
  a3_portrait: { width: 1123, height: 1587 },
  us_letter: { width: 816, height: 1056 },
  presentation_16_9: { width: 1920, height: 1080 },
  certificate: { width: 1123, height: 794 },
  social_1_1: { width: 1080, height: 1080 },
  custom: { width: 794, height: 1123 },
};

export function Canvas() {
  const {
    pages,
    currentPageIndex,
    pageSize,
    zoom,
    selectedIds,
    selectElement,
    deselectAll,
    setCurrentPage,
    addPage,
    deletePage,
  } = useExportStudio();

  const [isDragging, setIsDragging] = useState(false);
  const currentPage = pages[currentPageIndex];
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4_portrait;

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect if clicking on canvas background
    if (e.target === e.currentTarget) {
      deselectAll();
    }
  };

  const handleElementClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(id, e.shiftKey);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F0F0F0] overflow-hidden">
      {/* Canvas Area */}
      <div
        className="flex-1 overflow-auto flex items-start justify-center p-8"
        onClick={handleCanvasClick}
      >
        <div
          className="relative bg-white shadow-xl"
          style={{
            width: size.width,
            height: size.height,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Render elements */}
          {currentPage.elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedIds.includes(element.id)}
              onClick={(e) => handleElementClick(element.id, e)}
            />
          ))}

          {/* Page number watermark */}
          {pages.length > 1 && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-300 font-mono">
              Page {currentPageIndex + 1} of {pages.length}
            </div>
          )}
        </div>
      </div>

      {/* Page Thumbnails Strip */}
      <div className="h-20 bg-white border-t border-gray-200 flex items-center px-4 gap-2 overflow-x-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={addPage}
          className="flex-shrink-0 gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </Button>

        <div className="h-full flex items-center gap-2 overflow-x-auto flex-1">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(index)}
              className={`relative flex-shrink-0 w-12 h-16 rounded border-2 transition-all ${
                index === currentPageIndex
                  ? "border-[#F4511E] ring-2 ring-orange-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Thumbnail preview */}
              <div className="absolute inset-1 bg-white rounded-sm overflow-hidden">
                {/* Mini elements */}
                {page.elements.slice(0, 5).map((el, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${(el.position.x / 794) * 100}%`,
                      top: `${(el.position.y / 1123) * 100}%`,
                      width: `${(el.size.width / 794) * 100}%`,
                      height: `${(el.size.height / 1123) * 100}%`,
                      backgroundColor: el.type === "shape" ? el.style.fill : "transparent",
                      fontSize: "2px",
                    }}
                  >
                    {el.type === "text" && (
                      <span className="opacity-30 truncate">
                        {el.content.text?.slice(0, 5)}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Page number */}
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                {index + 1}
              </span>

              {/* Delete button (only if more than 1 page) */}
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(index);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPage(currentPageIndex - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-500 min-w-[60px] text-center">
            {currentPageIndex + 1} / {pages.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={currentPageIndex === pages.length - 1}
            onClick={() => setCurrentPage(currentPageIndex + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
