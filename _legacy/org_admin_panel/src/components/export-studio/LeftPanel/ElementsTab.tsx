"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Type, Square, Circle, Triangle, Minus, Star, Hexagon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useExportStudio, type CanvasElement } from "../hooks/useExportStudio";

const textElements = [
  { id: "heading", label: "Add a heading", fontSize: 28, fontWeight: "bold" },
  { id: "subheading", label: "Add subheading", fontSize: 18, fontWeight: "600" },
  { id: "body", label: "Add body text", fontSize: 14, fontWeight: "normal" },
  { id: "caption", label: "Add caption", fontSize: 12, fontWeight: "normal" },
  { id: "quote", label: "Add quote", fontSize: 16, fontWeight: "normal", fontStyle: "italic" },
];

const shapeElements = [
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "triangle", label: "Triangle", icon: Triangle },
  { id: "line", label: "Line", icon: Minus },
  { id: "star", label: "Star", icon: Star },
  { id: "hexagon", label: "Hexagon", icon: Hexagon },
];

const dataWidgets = [
  { id: "score_card", label: "Score Card", icon: "🎯" },
  { id: "rank_badge", label: "Rank Badge", icon: "🏆" },
  { id: "progress_bar", label: "Progress Bar", icon: "📊" },
  { id: "student_card", label: "Student Card", icon: "👤" },
  { id: "marks_table", label: "Marks Table", icon: "📋" },
  { id: "qr_code", label: "QR Code", icon: "🔗" },
  { id: "date_stamp", label: "Date Stamp", icon: "📅" },
  { id: "page_number", label: "Page Number", icon: "🔢" },
];

const decorativeElements = [
  { id: "border", label: "Border", icon: "▢" },
  { id: "divider", label: "Divider", icon: "─" },
  { id: "badge", label: "Badge", icon: "🏷️" },
  { id: "ribbon", label: "Ribbon", icon: "🎀" },
  { id: "watermark", label: "Watermark", icon: "💧" },
];

export function ElementsTab() {
  const { addElement } = useExportStudio();
  const [expandedSections, setExpandedSections] = useState<string[]>(["text", "shapes"]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const handleAddText = (element: typeof textElements[0]) => {
    const newElement: CanvasElement = {
      id: `text_${Date.now()}`,
      type: "text",
      position: { x: 100, y: 100 },
      size: { width: 300, height: 40 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: {
        text: element.label.replace("Add ", ""),
        fontFamily: element.fontWeight === "bold" ? "DM Serif Display" : "DM Sans",
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textAlign: "left",
      },
      style: {
        color: "#111827",
      },
    };
    addElement(newElement);
  };

  const handleAddShape = (shapeType: string) => {
    const newElement: CanvasElement = {
      id: `shape_${Date.now()}`,
      type: "shape",
      position: { x: 150, y: 150 },
      size: { width: 150, height: 150 },
      rotation: 0,
      opacity: 1,
      locked: false,
      content: {
        shapeType: shapeType as "rectangle" | "circle" | "triangle" | "star" | "hexagon",
      },
      style: {
        fill: "#F4511E",
        stroke: "transparent",
        strokeWidth: 0,
        borderRadius: shapeType === "rectangle" ? 8 : 0,
      },
    };
    addElement(newElement);
  };

  return (
    <div className="space-y-2">
      {/* Text Section */}
      <Collapsible
        open={expandedSections.includes("text")}
        onOpenChange={() => toggleSection("text")}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 hover:bg-gray-100 rounded px-1">
          {expandedSections.includes("text") ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <Type className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Text</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2 space-y-1">
          {textElements.map((element) => (
            <button
              key={element.id}
              onClick={() => handleAddText(element)}
              className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#F4511E] rounded transition-colors"
            >
              {element.label}
            </button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Shapes Section */}
      <Collapsible
        open={expandedSections.includes("shapes")}
        onOpenChange={() => toggleSection("shapes")}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 hover:bg-gray-100 rounded px-1">
          {expandedSections.includes("shapes") ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <Square className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Shapes</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2">
          <div className="grid grid-cols-3 gap-1.5">
            {shapeElements.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleAddShape(shape.id)}
                className="aspect-square rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] flex items-center justify-center transition-all"
                title={shape.label}
              >
                <shape.icon className="w-5 h-5 text-gray-500" />
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Data Widgets Section */}
      <Collapsible
        open={expandedSections.includes("widgets")}
        onOpenChange={() => toggleSection("widgets")}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 hover:bg-gray-100 rounded px-1">
          {expandedSections.includes("widgets") ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-lg">📊</span>
          <span className="text-sm font-medium text-gray-700">Data Widgets</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2">
          <div className="grid grid-cols-2 gap-1.5">
            {dataWidgets.map((widget) => (
              <button
                key={widget.id}
                className="flex items-center gap-2 px-2 py-2 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all text-xs text-gray-600"
              >
                <span>{widget.icon}</span>
                <span>{widget.label}</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Decorative Section */}
      <Collapsible
        open={expandedSections.includes("decorative")}
        onOpenChange={() => toggleSection("decorative")}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 hover:bg-gray-100 rounded px-1">
          {expandedSections.includes("decorative") ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-lg">🎨</span>
          <span className="text-sm font-medium text-gray-700">Decorative</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2">
          <div className="grid grid-cols-3 gap-1.5">
            {decorativeElements.map((element) => (
              <button
                key={element.id}
                className="aspect-square rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] flex items-center justify-center transition-all text-lg"
                title={element.label}
              >
                {element.icon}
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Lines & Dividers */}
      <Collapsible
        open={expandedSections.includes("lines")}
        onOpenChange={() => toggleSection("lines")}
      >
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 hover:bg-gray-100 rounded px-1">
          {expandedSections.includes("lines") ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <Minus className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Lines & Dividers</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2 space-y-1">
          <button className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#F4511E] rounded transition-colors">
            ─── Solid Line
          </button>
          <button className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#F4511E] rounded transition-colors">
            - - - Dashed Line
          </button>
          <button className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#F4511E] rounded transition-colors">
            ••• Dotted Line
          </button>
          <button className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-orange-50 hover:text-[#F4511E] rounded transition-colors">
            ═══ Double Line
          </button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
