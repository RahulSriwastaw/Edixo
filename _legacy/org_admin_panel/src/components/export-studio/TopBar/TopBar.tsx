"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  ChevronDown,
  Sparkles,
  AlignLeft,
  Square,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExportStudio, type LeftTabType, type PageSize } from "../hooks/useExportStudio";
import { ExportDropdown } from "./ExportDropdown";

const pageSizeOptions: { value: PageSize; label: string; icon: string }[] = [
  { value: "a4_portrait", label: "A4 Portrait", icon: "📄" },
  { value: "a4_landscape", label: "A4 Landscape", icon: "📄" },
  { value: "a3_portrait", label: "A3 Portrait", icon: "📄" },
  { value: "us_letter", label: "US Letter", icon: "📄" },
  { value: "presentation_16_9", label: "Presentation (16:9)", icon: "📊" },
  { value: "certificate", label: "Certificate", icon: "🏆" },
  { value: "social_1_1", label: "Social Post (1:1)", icon: "📱" },
  { value: "custom", label: "Custom Size...", icon: "✏️" },
];

const tabItems: { value: LeftTabType; label: string; icon: string }[] = [
  { value: "templates", label: "Templates", icon: "🎨" },
  { value: "elements", label: "Elements", icon: "⬛" },
  { value: "media", label: "Media", icon: "📷" },
  { value: "text", label: "Text", icon: "Aa" },
  { value: "charts", label: "Charts", icon: "📊" },
  { value: "data", label: "Data", icon: "🔗" },
  { value: "tables", label: "Tables", icon: "📋" },
];

export function TopBar() {
  const {
    title,
    setTitle,
    pageSize,
    setPageSize,
    activeLeftTab,
    setActiveLeftTab,
    zoom,
    setZoom,
    toggleAIPanel,
    togglePreview,
    undo,
    redo,
    history,
    historyIndex,
    selectedIds,
    pages,
    currentPageIndex,
  } = useExportStudio();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Check if any elements are selected to show contextual toolbar
  const hasSelection = selectedIds.length > 0;
  const currentPage = pages[currentPageIndex];
  const selectedElement = hasSelection && selectedIds.length === 1
    ? currentPage?.elements.find((el) => el.id === selectedIds[0])
    : null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Main Top Bar Row */}
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#F4511E] to-[#E64A19] flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Document Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                className="w-64 h-8 text-sm font-semibold"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors group"
              >
                <span className="max-w-[200px] truncate">{title}</span>
                <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Page Size Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 text-gray-600">
                📄 {pageSizeOptions.find((p) => p.value === pageSize)?.label || "A4"}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Page Size</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pageSizeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setPageSize(option.value)}
                  className={pageSize === option.value ? "bg-orange-50 text-[#F4511E]" : ""}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center - Tool Tabs */}
        <Tabs value={activeLeftTab} onValueChange={(v) => setActiveLeftTab(v as LeftTabType)}>
          <TabsList className="bg-transparent h-auto p-0 gap-0.5">
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-orange-50 data-[state=active]:text-[#F4511E] px-3 py-1.5 text-sm rounded-md transition-colors"
              >
                <span className="mr-1.5">{tab.icon}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* AI Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAIPanel}
            className="h-8 gap-1.5 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-300"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Undo/Redo */}
          <TooltipProvider>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={undo}
                    disabled={!canUndo}
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={redo}
                    disabled={!canRedo}
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6" />

          {/* Zoom */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-gray-600">
                {zoom}%
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setZoom(50)}>50%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom(75)}>75%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom(90)}>90%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom(100)}>100%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom(125)}>125%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setZoom(150)}>150%</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setZoom(90)}>Fit to screen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Preview */}
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            className="h-8 gap-1.5"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>

          {/* Export */}
          <ExportDropdown />
        </div>
      </div>

      {/* Contextual Toolbar Row (appears when element is selected) */}
      {hasSelection && selectedElement && (
        <div className="h-11 px-4 flex items-center gap-3 border-t border-gray-100 bg-gray-50/50 animate-slide-down">
          {/* Element Type Badge */}
          <Badge variant="outline" className="text-xs capitalize">
            {selectedElement.type}
          </Badge>

          <Separator orientation="vertical" className="h-5" />

          {/* Text-specific controls */}
          {selectedElement.type === "text" && (
            <>
              <select
                value={selectedElement.content.fontFamily || "DM Sans"}
                onChange={(e) => {
                  // Update element font family
                }}
                className="h-7 text-xs border rounded px-2 bg-white"
              >
                <option value="DM Serif Display">DM Serif Display</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
              </select>

              <Input
                type="number"
                value={selectedElement.content.fontSize || 16}
                onChange={(e) => {
                  // Update font size
                }}
                className="w-14 h-7 text-xs"
                min={8}
                max={96}
              />

              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 font-bold">
                  B
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 italic">
                  I
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 underline">
                  U
                </Button>
              </div>

              <Separator orientation="vertical" className="h-5" />

              {/* Alignment */}
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <AlignLeft className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Color */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Color:</span>
                <input
                  type="color"
                  value={selectedElement.style.color || "#111827"}
                  onChange={() => {}}
                  className="w-6 h-6 rounded cursor-pointer border"
                />
              </div>
            </>
          )}

          {/* Shape-specific controls */}
          {selectedElement.type === "shape" && (
            <>
              {/* Fill Color */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Fill:</span>
                <input
                  type="color"
                  value={selectedElement.style.fill || "#F4511E"}
                  onChange={() => {}}
                  className="w-6 h-6 rounded cursor-pointer border"
                />
              </div>

              {/* Stroke */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Stroke:</span>
                <input
                  type="color"
                  value={selectedElement.style.stroke || "#F4511E"}
                  onChange={() => {}}
                  className="w-6 h-6 rounded cursor-pointer border"
                />
                <Input
                  type="number"
                  value={selectedElement.style.strokeWidth || 0}
                  onChange={() => {}}
                  className="w-12 h-7 text-xs"
                  min={0}
                  max={20}
                />
              </div>

              {/* Border Radius */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Radius:</span>
                <Input
                  type="number"
                  value={selectedElement.style.borderRadius || 0}
                  onChange={() => {}}
                  className="w-12 h-7 text-xs"
                  min={0}
                  max={100}
                />
              </div>
            </>
          )}

          {/* Image-specific controls */}
          {selectedElement.type === "image" && (
            <>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                ✂️ Crop
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                ↔ Flip H
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                ↕ Flip V
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Opacity:</span>
                <Input
                  type="number"
                  value={Math.round((selectedElement.opacity || 1) * 100)}
                  onChange={() => {}}
                  className="w-12 h-7 text-xs"
                  min={0}
                  max={100}
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-purple-600">
                <Sparkles className="w-3 h-3" />
                Remove BG
              </Button>
            </>
          )}

          <div className="flex-1" />

          {/* Position info */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>X: {Math.round(selectedElement.position.x)}</span>
            <span>Y: {Math.round(selectedElement.position.y)}</span>
            <span>W: {Math.round(selectedElement.size.width)}</span>
            <span>H: {Math.round(selectedElement.size.height)}</span>
          </div>

          {/* Lock & Delete */}
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <Square className="w-3 h-3" />
            Lock
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
            🗑️ Delete
          </Button>
        </div>
      )}
    </div>
  );
}
