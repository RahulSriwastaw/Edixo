"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportStudio } from "../hooks/useExportStudio";
import { CanvasElement } from "./CanvasElement";

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
    selectMultipleElements,
    deselectAll,
    setCurrentPage,
    addPage,
    deletePage,
    updateElement,
    layoutSettings,
    bulkEditMode,
    showGrid,
  } = useExportStudio();

  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialElementsPos = useRef<Record<string, { x: number; y: number }>>({});
  
  const currentPage = pages[currentPageIndex];
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4_portrait;

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      deselectAll();
    }
  };

  const handleElementMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const clickedEl = currentPage.elements.find(el => el.id === id);
    let idsToMove = selectedIds;

    if (bulkEditMode && clickedEl?.role) {
      // Select all elements with the same role across ALL pages
      idsToMove = pages.flatMap(p => p.elements)
        .filter(el => el.role === clickedEl.role)
        .map(el => el.id);
      
      selectMultipleElements(idsToMove);
    } else {
      // Select the element if not already selected
      if (!selectedIds.includes(id)) {
        selectElement(id, e.shiftKey);
        idsToMove = [...selectedIds, id];
      }
    }

    // Start dragging
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    // Store initial positions of all selected elements (from all pages)
    const initialPos: Record<string, { x: number; y: number }> = {};
    const allElements = pages.flatMap(p => p.elements);

    idsToMove.forEach(sid => {
      const el = allElements.find(e => e.id === sid);
      if (el && !el.locked) {
        initialPos[sid] = { ...el.position };
      }
    });
    
    initialElementsPos.current = initialPos;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = (e.clientX - dragStartPos.current.x) / (zoom / 100);
      const deltaY = (e.clientY - dragStartPos.current.y) / (zoom / 100);

      const { snapToGrid, gridSize } = layoutSettings;

      Object.keys(initialElementsPos.current).forEach(id => {
        const initialPos = initialElementsPos.current[id];
        let newX = initialPos.x + deltaX;
        let newY = initialPos.y + deltaY;

        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        } else {
          newX = Math.round(newX);
          newY = Math.round(newY);
        }

        updateElement(id, {
          position: { x: newX, y: newY }
        });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, zoom, updateElement]);

  return (
    <div className="flex-1 flex flex-col bg-[#F0F0F0] overflow-hidden">
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
          {/* Grid Background */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.15]"
              style={{
                backgroundImage:
                  `linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)`,
                backgroundSize: `${layoutSettings.gridSize}px ${layoutSettings.gridSize}px`,
              }}
            />
          )}

          {/* Margin Guides */}
          {layoutSettings.showMargins && (
            <div 
              className="absolute pointer-events-none border border-dashed border-blue-400 opacity-40"
              style={{
                top: layoutSettings.pageMargins.top,
                left: layoutSettings.pageMargins.left,
                right: layoutSettings.pageMargins.right,
                bottom: layoutSettings.pageMargins.bottom,
              }}
            />
          )}

          {currentPage.elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={selectedIds.includes(element.id)}
              onClick={(e) => {}} 
              onMouseDown={(e) => handleElementMouseDown(element.id, e)}
            />
          ))}

          {layoutSettings.numColumns === 2 && (
            <>
              <div 
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-orange-300 pointer-events-none z-10"
                style={{ height: size.height }}
              />
              {/* Column margins (Gutter visualization) */}
              <div 
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-orange-500/5 pointer-events-none"
                style={{ width: layoutSettings.columnGap, height: size.height }}
              />
            </>
          )}

          {pages.length > 1 && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-300 font-mono">
              Page {currentPageIndex + 1} of {pages.length}
            </div>
          )}
        </div>
      </div>

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
            <div
              key={page.id}
              onClick={() => setCurrentPage(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setCurrentPage(index)}
              className={`relative flex-shrink-0 w-12 h-16 rounded border-2 transition-all cursor-pointer ${
                index === currentPageIndex
                  ? "border-[#F4511E] ring-2 ring-orange-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="absolute inset-1 bg-white rounded-sm overflow-hidden pointer-events-none">
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
                  />
                ))}
              </div>
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                {index + 1}
              </span>
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePage(index);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>

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
