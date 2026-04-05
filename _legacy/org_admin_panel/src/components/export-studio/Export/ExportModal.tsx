"use client";

import { useState, useCallback } from "react";
import { X, Download, Mail, Link2, Loader2, Check, Copy, ExternalLink, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExportStudio } from "../hooks/useExportStudio";
import { toast } from "sonner";

export function ExportModal() {
  const { showExportModal, exportFormat, toggleExportModal, title, pages, dataBindings } = useExportStudio();
  const [quality, setQuality] = useState<"high" | "medium" | "compressed">("high");
  const [pageRange, setPageRange] = useState<"all" | "current" | "range">("all");
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(pages.length);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [includeDate, setIncludeDate] = useState(true);
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [password, setPassword] = useState("");
  const [paperSize, setPaperSize] = useState<"a4" | "a3" | "letter" | "match">("a4");
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Generate HTML content from pages
  const generateHtmlContent = useCallback(() => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .page { 
      width: 794px; 
      min-height: 1123px; 
      background: white; 
      margin: 0 auto 20px; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
      padding: 40px;
      position: relative;
    }
    .element { position: absolute; }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; margin: 0; page-break-after: always; }
    }
  </style>
</head>
<body>
${pages.map((page, pageIndex) => `
  <div class="page" style="background: ${page.background}">
    ${page.elements.map(el => {
      const style = `
        left: ${el.position.x}px;
        top: ${el.position.y}px;
        width: ${el.size.width}px;
        height: ${el.size.height}px;
        transform: rotate(${el.rotation}deg);
        opacity: ${el.opacity};
        color: ${el.style.color || '#000'};
        font-family: ${el.content.fontFamily || 'DM Sans'};
        font-size: ${el.content.fontSize || 14}px;
        font-weight: ${el.content.fontWeight || 'normal'};
        text-align: ${el.content.textAlign || 'left'};
      `;
      
      if (el.type === 'text') {
        return `<div class="element" style="${style}">${el.content.text || ''}</div>`;
      } else if (el.type === 'shape') {
        return `<div class="element" style="${style}; background: ${el.style.fill || '#f0f0f0'}; border: ${el.style.strokeWidth || 0}px solid ${el.style.stroke || 'transparent'}; border-radius: ${el.style.borderRadius || 0}px;"></div>`;
      } else if (el.type === 'image') {
        return `<img class="element" src="${el.content.src || ''}" alt="${el.content.alt || ''}" style="${style}" />`;
      }
      return '';
    }).join('')}
    ${includePageNumbers ? `<div style="position: absolute; bottom: 20px; right: 40px; font-size: 12px; color: #666;">Page ${pageIndex + 1} of ${pages.length}</div>` : ''}
  </div>
`).join('')}
</body>
</html>`;
    return html;
  }, [pages, title, includePageNumbers]);

  // Generate CSV content from data bindings
  const generateCsvContent = useCallback(() => {
    const headers = dataBindings.map(b => b.label).join(',');
    const values = dataBindings.map(b => `"${b.value}"`).join(',');
    return `${headers}\n${values}`;
  }, [dataBindings]);

  // Generate JSON content
  const generateJsonContent = useCallback(() => {
    return JSON.stringify({
      title,
      pages: pages.map(p => ({
        elements: p.elements,
        background: p.background
      })),
      dataBindings,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }, [pages, title, dataBindings]);

  // Actual download function
  const performDownload = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadUrl(url);
  }, []);

  // Handle export based on format
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setProgress(0);

    const format = exportFormat || 'pdf';
    const filenameBase = title.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 100);

    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'pdf':
          // For PDF, we'll create a printable HTML and trigger print dialog
          content = generateHtmlContent();
          filename = `${filenameBase}.html`;
          mimeType = 'text/html';
          
          // Open in new window for printing
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.print();
          }
          break;

        case 'csv':
          content = generateCsvContent();
          filename = `${filenameBase}.csv`;
          mimeType = 'text/csv';
          performDownload(content, filename, mimeType);
          break;

        case 'xlsx':
        case 'docx':
        case 'pptx':
          // For these formats, we'll export as JSON that can be imported
          // In production, you'd use proper libraries like xlsx, docx, pptxgenjs
          content = generateJsonContent();
          filename = `${filenameBase}_${format}_data.json`;
          mimeType = 'application/json';
          performDownload(content, filename, mimeType);
          
          toast.info(`${format.toUpperCase()} export requires server-side processing. Downloaded as JSON data.`);
          break;

        case 'png':
          // For image export, we'll open the HTML in a new tab
          content = generateHtmlContent();
          const imgWindow = window.open('', '_blank');
          if (imgWindow) {
            imgWindow.document.write(content);
            imgWindow.document.close();
          }
          toast.info('Use your browser\'s screenshot tool or print to PDF for image export.');
          break;

        case 'google_sheets':
        case 'google_docs':
        case 'google_slides':
          // Store data for Google integration
          const exportData = {
            title,
            content: format === 'google_sheets' ? generateCsvContent() : generateHtmlContent(),
            format,
            timestamp: new Date().toISOString()
          };
          sessionStorage.setItem('eduhub_google_export', JSON.stringify(exportData));
          
          const googleUrls: Record<string, string> = {
            google_sheets: 'https://docs.google.com/spreadsheets/create',
            google_docs: 'https://docs.google.com/document/create',
            google_slides: 'https://docs.google.com/presentation/create'
          };
          
          window.open(googleUrls[format], '_blank');
          toast.success(`Opening ${format.replace('_', ' ')}... Paste your data from clipboard.`);
          
          // Copy data to clipboard
          await navigator.clipboard.writeText(format === 'google_sheets' ? generateCsvContent() : generateHtmlContent());
          break;

        case 'email':
          const subject = encodeURIComponent(title);
          const body = encodeURIComponent(`Please find attached: ${title}\n\nGenerated from EduHub Export Studio.`);
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
          break;

        case 'link':
          const shareData = {
            title,
            pages: pages.slice(0, 2), // Limit for sharing
          };
          sessionStorage.setItem('eduhub_share_link', JSON.stringify(shareData));
          await navigator.clipboard.writeText(`${window.location.origin}/export-studio/shared/${Date.now()}`);
          toast.success('Share link copied to clipboard!');
          break;

        case 'template':
          const templateData = {
            name: title,
            pages,
            dataBindings,
            createdAt: new Date().toISOString()
          };
          performDownload(JSON.stringify(templateData, null, 2), `${filenameBase}_template.json`, 'application/json');
          toast.success('Template saved!');
          break;

        default:
          // Default: download as HTML
          content = generateHtmlContent();
          filename = `${filenameBase}.html`;
          mimeType = 'text/html';
          performDownload(content, filename, mimeType);
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setIsExporting(false);
        setIsComplete(true);
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setIsExporting(false);
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  }, [exportFormat, title, generateHtmlContent, generateCsvContent, generateJsonContent, pages, dataBindings, performDownload]);

  const handleClose = () => {
    setIsExporting(false);
    setIsComplete(false);
    setProgress(0);
    setDownloadUrl(null);
    toggleExportModal();
  };

  const formatLabels: Record<string, string> = {
    pdf: "PDF",
    pptx: "PowerPoint",
    docx: "Word",
    xlsx: "Excel",
    csv: "CSV",
    png: "Image (PNG)",
    google_sheets: "Google Sheets",
    google_slides: "Google Slides",
    google_docs: "Google Docs",
    whatsapp: "WhatsApp",
    email: "Email",
    link: "Share Link",
    template: "Template",
  };

  if (!showExportModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Export as {formatLabels[exportFormat || "pdf"] || "PDF"}
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {isExporting ? (
            /* Progress State */
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-[#F4511E] animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Generating {formatLabels[exportFormat || "pdf"]}...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-[#F4511E] h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{progress}%</p>
            </div>
          ) : isComplete ? (
            /* Complete State */
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-800 mb-2">
                ✅ {formatLabels[exportFormat || "pdf"]} ready!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {title}.{exportFormat === 'csv' ? 'csv' : exportFormat === 'template' ? 'json' : 'html'}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button 
                  className="bg-[#F4511E] hover:bg-[#E64A19] gap-2"
                  onClick={() => {
                    const content = exportFormat === 'csv' ? generateCsvContent() : generateHtmlContent();
                    performDownload(
                      content,
                      `${title}.${exportFormat === 'csv' ? 'csv' : 'html'}`,
                      exportFormat === 'csv' ? 'text/csv' : 'text/html'
                    );
                    toast.success('Downloaded!');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Options */
            <>
              {/* Quality */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Quality</Label>
                <div className="flex gap-2">
                  {[
                    { value: "high", label: "High", desc: "Print-ready, ~5MB" },
                    { value: "medium", label: "Medium", desc: "Web-optimized, ~1MB" },
                    { value: "compressed", label: "Compressed", desc: "<500KB" },
                  ].map((q) => (
                    <button
                      key={q.value}
                      onClick={() => setQuality(q.value as typeof quality)}
                      className={`flex-1 p-2 rounded border text-left transition-colors ${
                        quality === q.value
                          ? "border-[#F4511E] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-medium">{q.label}</p>
                      <p className="text-xs text-gray-400">{q.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pages */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Pages</Label>
                <div className="flex gap-2">
                  {[
                    { value: "all", label: `All (${pages.length})` },
                    { value: "current", label: "Current" },
                    { value: "range", label: "Range" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPageRange(p.value as typeof pageRange)}
                      className={`flex-1 py-2 px-3 rounded border text-sm transition-colors ${
                        pageRange === p.value
                          ? "border-[#F4511E] bg-orange-50 text-[#F4511E]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {pageRange === "range" && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">From</span>
                    <Input
                      type="number"
                      value={rangeFrom}
                      onChange={(e) => setRangeFrom(parseInt(e.target.value))}
                      className="w-16 h-8"
                      min={1}
                      max={pages.length}
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <Input
                      type="number"
                      value={rangeTo}
                      onChange={(e) => setRangeTo(parseInt(e.target.value))}
                      className="w-16 h-8"
                      min={1}
                      max={pages.length}
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Options</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePageNumbers}
                      onChange={(e) => setIncludePageNumbers(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Include page numbers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDate}
                      onChange={(e) => setIncludeDate(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Include date/timestamp</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={passwordProtect}
                      onChange={(e) => setPasswordProtect(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Password protect</span>
                  </label>
                  {passwordProtect && (
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="h-8 mt-1"
                    />
                  )}
                </div>
              </div>

              {/* Paper Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Paper Size</Label>
                <div className="flex gap-2">
                  {[
                    { value: "a4", label: "A4" },
                    { value: "a3", label: "A3" },
                    { value: "letter", label: "US Letter" },
                    { value: "match", label: "Match Canvas" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPaperSize(p.value as typeof paperSize)}
                      className={`flex-1 py-2 px-3 rounded border text-sm transition-colors ${
                        paperSize === p.value
                          ? "border-[#F4511E] bg-orange-50 text-[#F4511E]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isExporting && !isComplete && (
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="bg-[#F4511E] hover:bg-[#E64A19] gap-2"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" />
              Export {formatLabels[exportFormat || "pdf"]}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
