"use client";

import { useState } from "react";
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  FileCode,
  Image,
  Mail,
  Share2,
  Link2,
  Bookmark,
  Printer,
  ChevronRight,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExportStudio } from "../hooks/useExportStudio";

const downloadFormats = [
  { id: "pdf", label: "PDF", icon: FileText, description: "Portable Document" },
  { id: "pptx", label: "PowerPoint (.pptx)", icon: Presentation, description: "Presentation" },
  { id: "docx", label: "Word (.docx)", icon: FileText, description: "Word Document" },
  { id: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet, description: "Spreadsheet" },
  { id: "csv", label: "CSV", icon: FileCode, description: "Comma Separated" },
  { id: "png", label: "Image (PNG / JPG)", icon: Image, description: "Raster Image" },
];

const cloudFormats = [
  { id: "google_sheets", label: "Save to Google Sheets", icon: FileSpreadsheet },
  { id: "google_slides", label: "Save to Google Slides", icon: Presentation },
  { id: "google_docs", label: "Save to Google Docs", icon: FileText },
  { id: "canva", label: "Open in Canva", icon: Palette },
];

const shareFormats = [
  { id: "whatsapp", label: "Share via WhatsApp", icon: Share2 },
  { id: "email", label: "Send via Email", icon: Mail },
  { id: "link", label: "Copy link (view-only)", icon: Link2 },
];

export function ExportDropdown() {
  const { toggleExportModal, pages, title } = useExportStudio();
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: string) => {
    // For Canva, handle specially
    if (format === "canva") {
      handleCanvaExport();
      setIsOpen(false);
      return;
    }
    
    toggleExportModal(format);
    setIsOpen(false);
  };

  const handleCanvaExport = () => {
    // Generate a design payload for Canva
    const designData = {
      title: title,
      pages: pages.map(page => ({
        elements: page.elements.map(el => ({
          type: el.type,
          content: el.content,
          style: el.style,
          position: el.position,
          size: el.size,
        })),
        background: page.background,
      })),
    };

    // Store in sessionStorage for Canva to access
    sessionStorage.setItem('eduhub_canva_export', JSON.stringify(designData));
    
    // Open Canva with the design
    // In production, this would use Canva's API to create a design
    const canvaUrl = `https://www.canva.com/design?create=true&type=DAGQgRk&title=${encodeURIComponent(title)}`;
    
    // Open in new tab
    window.open(canvaUrl, '_blank');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#F4511E] hover:bg-[#E64A19] text-white h-9 px-4 gap-2 font-semibold">
          📤 Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel className="text-sm font-semibold text-gray-700 px-2">
          📤 EXPORT AS
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Download Section */}
        <DropdownMenuLabel className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mt-1">
          Download
        </DropdownMenuLabel>
        {downloadFormats.map((format) => (
          <DropdownMenuItem
            key={format.id}
            onClick={() => handleExport(format.id)}
            className="flex items-center justify-between py-2.5 px-2 cursor-pointer hover:bg-orange-50 rounded-md"
          >
            <div className="flex items-center gap-3">
              <format.icon className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">{format.label}</div>
                <div className="text-xs text-gray-400">{format.description}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Cloud Section */}
        <DropdownMenuLabel className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mt-1">
          Cloud
        </DropdownMenuLabel>
        {cloudFormats.map((format) => (
          <DropdownMenuItem
            key={format.id}
            onClick={() => handleExport(format.id)}
            className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-orange-50 rounded-md"
          >
            <div className="flex items-center gap-3">
              <format.icon className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-sm text-gray-700">{format.label}</span>
                {format.id === "canva" && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">NEW</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Share Section */}
        <DropdownMenuLabel className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mt-1">
          Share
        </DropdownMenuLabel>
        {shareFormats.map((format) => (
          <DropdownMenuItem
            key={format.id}
            onClick={() => handleExport(format.id)}
            className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-orange-50 rounded-md"
          >
            <div className="flex items-center gap-3">
              <format.icon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{format.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Other Section */}
        <DropdownMenuItem
          onClick={() => handleExport("template")}
          className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-orange-50 rounded-md"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Save as Template</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.print()}
          className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-orange-50 rounded-md"
        >
          <div className="flex items-center gap-3">
            <Printer className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Print</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
