"use client";

import { useExportStudio } from "../hooks/useExportStudio";

export function StatusBar() {
  const { pages, currentPageIndex, selectedIds, lastSavedAt, isDirty, pageSize } = useExportStudio();

  const currentPage = pages[currentPageIndex];
  const selectedElement = selectedIds.length === 1
    ? currentPage?.elements.find((el) => el.id === selectedIds[0])
    : null;

  const pageSizeLabels: Record<string, string> = {
    a4_portrait: "A4 Portrait",
    a4_landscape: "A4 Landscape",
    a3_portrait: "A3 Portrait",
    us_letter: "US Letter",
    presentation_16_9: "Presentation (16:9)",
    certificate: "Certificate",
    social_1_1: "Social Post (1:1)",
    custom: "Custom",
  };

  const canvasSizes: Record<string, { w: number; h: number }> = {
    a4_portrait: { w: 794, h: 1123 },
    a4_landscape: { w: 1123, h: 794 },
    a3_portrait: { w: 1123, h: 1587 },
    us_letter: { w: 816, h: 1056 },
    presentation_16_9: { w: 1920, h: 1080 },
    certificate: { w: 1123, h: 794 },
    social_1_1: { w: 1080, h: 1080 },
  };

  const size = canvasSizes[pageSize] || canvasSizes.a4_portrait;

  return (
    <div className="h-7 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-400">
      {/* Left: Save Status */}
      <div className="flex items-center gap-2">
        {isDirty ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Unsaved changes
          </span>
        ) : lastSavedAt ? (
          <span>
            Auto-saved {Math.floor((Date.now() - lastSavedAt.getTime()) / 60000)} min ago
          </span>
        ) : (
          <span>Ready</span>
        )}
      </div>

      {/* Center: Canvas Info */}
      <div className="flex items-center gap-4">
        <span>
          {size.w} × {size.h}px
        </span>
        <span className="text-gray-300">|</span>
        <span>{pageSizeLabels[pageSize] || "A4"}</span>
      </div>

      {/* Right: Selection Info */}
      <div className="flex items-center gap-4">
        {selectedElement ? (
          <>
            <span>
              X: {Math.round(selectedElement.position.x)} &nbsp; Y: {Math.round(selectedElement.position.y)}
            </span>
            <span>
              W: {Math.round(selectedElement.size.width)} &nbsp; H: {Math.round(selectedElement.size.height)}
            </span>
          </>
        ) : (
          <>
            <span>{pages.length} page{pages.length > 1 ? "s" : ""}</span>
            <span className="text-gray-300">|</span>
            <span>
              {pages.reduce((sum, p) => sum + p.elements.length, 0)} element{pages.reduce((sum, p) => sum + p.elements.length, 0) !== 1 ? "s" : ""}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
