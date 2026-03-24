"use client";

import { useState, useRef } from "react";
import { Move, RotateCw, Trash2, Copy, Lock, Unlock } from "lucide-react";
import type { CanvasElement as CanvasElementType } from "../hooks/useExportStudio";

interface Props {
  element: CanvasElementType;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function CanvasElement({ element, isSelected, onClick, onMouseDown }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === "text") {
      setIsEditing(true);
    }
  };

  const renderContent = () => {
    switch (element.type) {
      case "text":
        return (
          <div
            className="w-full h-full flex overflow-hidden"
            style={{
              fontFamily: element.content.fontFamily || "DM Sans",
              fontSize: element.content.fontSize || 16,
              fontWeight: element.content.fontWeight || "normal",
              fontStyle: element.content.fontStyle || "normal",
              textAlign: element.content.textAlign || "left",
              justifyContent: element.content.textAlign === "center" ? "center" : element.content.textAlign === "right" ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              color: element.style.color || "#111827",
              lineHeight: element.style.lineHeight || 1.5,
              letterSpacing: element.style.letterSpacing || 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {isEditing ? (
              <textarea
                defaultValue={element.content.text}
                className="w-full h-full resize-none border-none outline-none bg-transparent"
                style={{
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: "inherit",
                  color: "inherit",
                }}
                autoFocus
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
            ) : (
              <span
                style={{ whiteSpace: "pre-wrap", display: "block", width: "100%" }}
                dangerouslySetInnerHTML={{
                  __html: element.content.text || "Text",
                }}
              />
            )}
          </div>
        );

      case "image":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
            {element.content.src ? (
              <img
                src={element.content.src}
                alt={element.content.alt || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-xs">Image</span>
            )}
          </div>
        );

      case "shape":
        return renderShape();

      case "chart":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200">
            <span className="text-xs text-gray-400">
              {element.content.chartType?.toUpperCase() || "CHART"}
            </span>
          </div>
        );

      case "table":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200">
            <span className="text-xs text-gray-400">TABLE</span>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-400">Element</span>
          </div>
        );
    }
  };

  const renderShape = () => {
    const { shapeType } = element.content;
    const { fill = "#F4511E", stroke = "transparent", strokeWidth = 0, borderRadius = 0 } = element.style;

    const commonStyle = {
      width: "100%",
      height: "100%",
      backgroundColor: shapeType !== "circle" ? fill : undefined,
      border: `${strokeWidth}px solid ${stroke}`,
      borderRadius: shapeType === "circle" ? "50%" : borderRadius,
    };

    switch (shapeType) {
      case "circle":
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: fill,
              borderRadius: "50%",
              border: `${strokeWidth}px solid ${stroke}`,
            }}
          />
        );

      case "triangle":
        return (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "transparent" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,10 90,90 10,90"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            </svg>
          </div>
        );

      case "star":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            </svg>
          </div>
        );

      case "hexagon":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            </svg>
          </div>
        );

      default:
        return <div style={commonStyle} />;
    }
  };

  // Handle data binding display
  const displayContent = element.dataBinding
    ? `[${element.dataBinding}]`
    : null;

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move group ${
        element.locked ? "pointer-events-none" : ""
      }`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Element Content */}
      {renderContent()}

      {/* Data Binding Indicator */}
      {element.dataBinding && (
        <div className="absolute -top-5 left-0 text-[10px] bg-purple-100 text-purple-700 px-1 rounded font-mono">
          {element.dataBinding}
        </div>
      )}

      {/* Selection Border */}
      {isSelected && !element.locked && (
        <>
          {/* Border */}
          <div className="absolute inset-0 border-2 border-[#F4511E] pointer-events-none" />

          {/* Resize Handles */}
          {["nw", "ne", "sw", "se", "n", "s", "e", "w"].map((pos) => (
            <div
              key={pos}
              className={`absolute w-2.5 h-2.5 bg-white border-2 border-[#F4511E] rounded-sm cursor-${
                pos.includes("n") ? (pos.includes("w") ? "nw" : "ne") : pos.includes("s") ? (pos.includes("w") ? "sw" : "se") : pos
              }-resize`}
              style={{
                ...{
                  nw: { top: -5, left: -5 },
                  ne: { top: -5, right: -5 },
                  sw: { bottom: -5, left: -5 },
                  se: { bottom: -5, right: -5 },
                  n: { top: -5, left: "50%", transform: "translateX(-50%)" },
                  s: { bottom: -5, left: "50%", transform: "translateX(-50%)" },
                  e: { right: -5, top: "50%", transform: "translateY(-50%)" },
                  w: { left: -5, top: "50%", transform: "translateY(-50%)" },
                }[pos as "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"],
              }}
            />
          ))}

          {/* Rotation Handle */}
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-[#F4511E] rounded-full cursor-grab flex items-center justify-center"
            style={{ cursor: "grab" }}
          >
            <RotateCw className="w-3 h-3 text-[#F4511E]" />
          </div>
          <div className="absolute -top-3 left-1/2 w-px h-3 bg-[#F4511E]" />

          {/* Quick Actions */}
          <div className="absolute -top-10 right-0 flex items-center gap-1 bg-white rounded-lg shadow-lg px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">
              <Copy className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">
              {element.locked ? (
                <Lock className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>
          </div>
        </>
      )}

      {/* Locked Indicator */}
      {element.locked && (
        <div className="absolute inset-0 bg-gray-200/50 flex items-center justify-center">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
}
