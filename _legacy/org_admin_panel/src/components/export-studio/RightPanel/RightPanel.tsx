"use client";

import { useExportStudio } from "../hooks/useExportStudio";
import { DocumentProperties } from "./DocumentProperties";
import { TextProperties } from "./TextProperties";
import { ShapeProperties } from "./ShapeProperties";
import { ImageProperties } from "./ImageProperties";
import { ChartProperties } from "./ChartProperties";
import { MultiSelectProperties } from "./MultiSelectProperties";

export function RightPanel() {
  const { pages, currentPageIndex, selectedIds } = useExportStudio();
  const currentPage = pages[currentPageIndex];
  const selectedElements = currentPage?.elements.filter((el) =>
    selectedIds.includes(el.id)
  );

  // Determine what to show
  const renderContent = () => {
    // Nothing selected - show document properties
    if (selectedIds.length === 0) {
      return <DocumentProperties />;
    }

    // Multiple selected
    if (selectedIds.length > 1) {
      return <MultiSelectProperties elements={selectedElements || []} />;
    }

    // Single selected
    const element = selectedElements?.[0];
    if (!element) return <DocumentProperties />;

    switch (element.type) {
      case "text":
        return <TextProperties element={element} />;
      case "image":
        return <ImageProperties element={element} />;
      case "shape":
        return <ShapeProperties element={element} />;
      case "chart":
        return <ChartProperties element={element} />;
      default:
        return <DocumentProperties />;
    }
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-4">{renderContent()}</div>
    </div>
  );
}
