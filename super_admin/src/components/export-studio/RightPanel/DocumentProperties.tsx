"use client";
import { useExportStudio, type PageSize } from "../hooks/useExportStudio";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const pageSizes: { value: PageSize; label: string }[] = [
  { value: "a4_portrait", label: "A4 Portrait" },
  { value: "a4_landscape", label: "A4 Landscape" },
  { value: "a3_portrait", label: "A3 Portrait" },
  { value: "us_letter", label: "US Letter" },
  { value: "presentation_16_9", label: "Presentation (16:9)" },
  { value: "certificate", label: "Certificate" },
  { value: "social_1_1", label: "Social Post (1:1)" },
];

export function DocumentProperties() {
  const { 
    title, setTitle, 
    pageSize, setPageSize, 
    pages, 
    orgBranding,
    layoutSettings, setLayoutSettings,
    toggleBulkEditMode,
    bulkEditMode,
    showGrid,
    availableSubjects,
    selectedSubject,
    setSelectedSubject
  } = useExportStudio();

  const handleMarginChange = (side: string, value: string) => {
    const val = parseInt(value) || 0;
    setLayoutSettings({
      pageMargins: {
        ...layoutSettings.pageMargins,
        [side]: val
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Document Properties</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            if (confirm("Are you sure you want to reset all layout settings to their defaults?")) {
              useExportStudio.getState().resetLayoutSettings();
            }
          }}
          className="h-6 text-[10px] px-2"
        >
          Reset Defaults
        </Button>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Document Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      {/* Page Size */}
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">Page Size</Label>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as PageSize)}
          className="w-full h-9 px-3 border rounded text-sm bg-white"
        >
          {pageSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* Layout Columns */}
      <div className="space-y-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Label className="text-[11px] font-bold text-gray-700 uppercase">Columns</Label>
            <span className="text-[9px] text-gray-400">Multi-column layout</span>
          </div>
          <div className="flex bg-white border rounded-md p-0.5">
            <Button 
              variant={layoutSettings.numColumns === 1 ? "default" : "ghost"}
              size="sm"
              onClick={() => setLayoutSettings({ numColumns: 1 })}
              className="h-7 text-[10px] px-3 shadow-none"
            >
              1 Col
            </Button>
            <Button 
              variant={layoutSettings.numColumns === 2 ? "default" : "ghost"}
              size="sm"
              onClick={() => setLayoutSettings({ numColumns: 2 })}
              className="h-7 text-[10px] px-3 shadow-none"
            >
              2 Col
            </Button>
          </div>
        </div>

        {layoutSettings.numColumns > 1 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center">
              <Label className="text-[10px] text-gray-500 uppercase tracking-tighter">Column Gap (Gutter)</Label>
              <span className="text-[10px] font-mono text-indigo-600">{layoutSettings.columnGap}px</span>
            </div>
            <Slider
              value={[layoutSettings.columnGap]}
              min={10}
              max={100}
              step={2}
              onValueChange={([val]) => setLayoutSettings({ columnGap: val })}
              className="py-1"
            />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-gray-500">Page Margins (px)</Label>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Top</span>
            <Input 
              type="number" 
              value={layoutSettings.pageMargins.top} 
              onChange={(e) => handleMarginChange("top", e.target.value)}
              className="h-8 text-xs px-1 text-center" 
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Right</span>
            <Input 
              type="number" 
              value={layoutSettings.pageMargins.right} 
              onChange={(e) => handleMarginChange("right", e.target.value)}
              className="h-8 text-xs px-1 text-center" 
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Bottom</span>
            <Input 
              type="number" 
              value={layoutSettings.pageMargins.bottom} 
              onChange={(e) => handleMarginChange("bottom", e.target.value)}
              className="h-8 text-xs px-1 text-center" 
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400">Left</span>
            <Input 
              type="number" 
              value={layoutSettings.pageMargins.left} 
              onChange={(e) => handleMarginChange("left", e.target.value)}
              className="h-8 text-xs px-1 text-center" 
            />
          </div>
        </div>
      </div>

      {/* PDF Configuration (PageMaker-like) */}
      <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
          <div className="flex flex-col">
            <Label className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest">Bulk Edit Mode</Label>
            <span className="text-[9px] text-indigo-400 font-medium">Auto-apply changes to all questions</span>
          </div>
          <Switch 
            checked={bulkEditMode}
            onCheckedChange={toggleBulkEditMode}
            className="scale-90"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column: Typography & Spacing */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-[11px] text-indigo-800">Font Size</Label>
                <span className="text-[10px] text-indigo-700 font-mono">{layoutSettings.fontSize}</span>
              </div>
              <Slider
                value={[layoutSettings.fontSize]}
                min={8}
                max={24}
                step={1}
                onValueChange={([val]) => setLayoutSettings({ fontSize: val })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-[11px] text-indigo-800">Spacing (Question)</Label>
                <span className="text-[10px] text-indigo-700 font-mono">{layoutSettings.itemGap}</span>
              </div>
              <Slider
                value={[layoutSettings.itemGap]}
                min={0}
                max={100}
                step={2}
                onValueChange={([val]) => setLayoutSettings({ itemGap: val })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-[11px] text-indigo-800">Spacing (Option)</Label>
                <span className="text-[10px] text-indigo-700 font-mono">{layoutSettings.optionGap}</span>
              </div>
              <Slider
                value={[layoutSettings.optionGap]}
                min={-10}
                max={40}
                step={1}
                onValueChange={([val]) => setLayoutSettings({ optionGap: val })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-[11px] text-indigo-800">Spacing (Qst-Opt)</Label>
                <span className="text-[10px] text-indigo-700 font-mono">{layoutSettings.questionToOptionsGap}</span>
              </div>
              <Slider
                value={[layoutSettings.questionToOptionsGap]}
                min={-50}
                max={60}
                step={2}
                onValueChange={([val]) => setLayoutSettings({ questionToOptionsGap: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Answer Bold</Label>
              <Switch 
                checked={layoutSettings.answerBold}
                onCheckedChange={(val) => setLayoutSettings({ answerBold: val })}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Show Watermark</Label>
              <Switch 
                checked={layoutSettings.showWatermark}
                onCheckedChange={(val) => setLayoutSettings({ showWatermark: val })}
                className="scale-75"
              />
            </div>



            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Question Opacity</Label>
              <Switch 
                checked={layoutSettings.questionOpacity}
                onCheckedChange={(val) => setLayoutSettings({ questionOpacity: val })}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Option Opacity</Label>
              <Switch 
                checked={layoutSettings.optionOpacity}
                onCheckedChange={(val) => setLayoutSettings({ optionOpacity: val })}
                className="scale-75"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] text-indigo-700">1st Logo URL</Label>
              <Input 
                value={layoutSettings.firstLogo}
                onChange={(e) => setLayoutSettings({ firstLogo: e.target.value })}
                placeholder="Logo path..."
                className="h-7 text-[10px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-[11px] text-indigo-800 whitespace-nowrap">Q-Boldness:</Label>
              <Input 
                value={layoutSettings.questionBoldness}
                onChange={(e) => setLayoutSettings({ questionBoldness: e.target.value })}
                className="h-7 text-[10px] w-16"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">New Header</Label>
              <Switch 
                checked={layoutSettings.showHeader}
                onCheckedChange={(val) => setLayoutSettings({ showHeader: val })}
                className="scale-75"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] text-indigo-700">2nd Logo URL</Label>
              <Input 
                value={layoutSettings.secondLogo}
                onChange={(e) => setLayoutSettings({ secondLogo: e.target.value })}
                placeholder="Logo path..."
                className="h-7 text-[10px]"
              />
            </div>
          </div>

          {/* Right Column: Visibility & Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Show Answer Widget</Label>
              <Switch 
                checked={layoutSettings.showAnswerWidget}
                onCheckedChange={(val) => setLayoutSettings({ showAnswerWidget: val })}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Hide Question</Label>
              <Switch 
                checked={layoutSettings.hideQuestion}
                onCheckedChange={(val) => setLayoutSettings({ hideQuestion: val })}
                className="scale-75 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Hide Option</Label>
              <Switch 
                checked={layoutSettings.hideOption}
                onCheckedChange={(val) => setLayoutSettings({ hideOption: val })}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Hide Box (Expl.)</Label>
              <Switch 
                checked={!layoutSettings.showExplanation}
                onCheckedChange={(val) => setLayoutSettings({ showExplanation: !val })}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Bilingual PDF</Label>
              <Switch 
                checked={layoutSettings.showEn && layoutSettings.showHi}
                onCheckedChange={(val) => setLayoutSettings({ showEn: val, showHi: val })}
                className="scale-75"
              />
            </div>

            {layoutSettings.showEn && layoutSettings.showHi && (
              <div className="flex items-center justify-between pl-2">
                <Label className="text-[10px] text-indigo-600/70">Order:</Label>
                <div className="flex bg-indigo-50/50 rounded p-0.5 border border-indigo-100">
                  <button
                    onClick={() => setLayoutSettings({ primaryLanguage: 'hi' })}
                    className={`px-2 py-0.5 text-[9px] rounded-sm transition-all ${
                      layoutSettings.primaryLanguage === 'hi' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    Hindi First
                  </button>
                  <button
                    onClick={() => setLayoutSettings({ primaryLanguage: 'en' })}
                    className={`px-2 py-0.5 text-[9px] rounded-sm transition-all ${
                      layoutSettings.primaryLanguage === 'en' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    English First
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-indigo-800">Prev Year Tag</Label>
                <Switch 
                  checked={layoutSettings.showPreviousYearTag}
                  onCheckedChange={(val) => setLayoutSettings({ showPreviousYearTag: val })}
                  className="scale-75"
                />
              </div>
              {layoutSettings.showPreviousYearTag && (
                <div className="pl-3 py-1.5 space-y-2 border-l-2 border-indigo-50 bg-indigo-50/30 rounded-r-md">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-indigo-600/70 w-8">X/Y:</Label>
                    <Input 
                      type="number"
                      value={layoutSettings.pyTagOffsetX}
                      onChange={(e) => setLayoutSettings({ pyTagOffsetX: Number(e.target.value) })}
                      className="h-6 text-[9px] w-11 px-1 bg-white"
                    />
                    <Input 
                      type="number"
                      value={layoutSettings.pyTagOffsetY}
                      onChange={(e) => setLayoutSettings({ pyTagOffsetY: Number(e.target.value) })}
                      className="h-6 text-[9px] w-11 px-1 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-indigo-600/70 w-8">Sz/Cl:</Label>
                    <Input 
                      type="number"
                      value={layoutSettings.pyTagFontSize}
                      onChange={(e) => setLayoutSettings({ pyTagFontSize: Number(e.target.value) })}
                      className="h-6 text-[9px] w-11 px-1 bg-white"
                    />
                    <div className="flex items-center gap-1 bg-white rounded border h-6 px-1">
                      <input 
                        type="color"
                        value={layoutSettings.pyTagColor}
                        onChange={(e) => setLayoutSettings({ pyTagColor: e.target.value })}
                        className="w-4 h-4 p-0 border-none cursor-pointer bg-transparent"
                      />
                      <span className="text-[8px] text-gray-400 font-mono">{layoutSettings.pyTagColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Show QR</Label>
              <Switch 
                checked={layoutSettings.showQR}
                onCheckedChange={(val) => setLayoutSettings({ showQR: val })}
                className="scale-75"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-indigo-800">Show Book</Label>
              <Switch 
                checked={layoutSettings.showBook}
                onCheckedChange={(val) => setLayoutSettings({ showBook: val })}
                className="scale-75"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-indigo-800 font-bold">Solutions & Expl.</Label>
                <Switch 
                  checked={layoutSettings.showAnswerWithDesc}
                  onCheckedChange={(val) => setLayoutSettings({ 
                    showAnswerWithDesc: val,
                    showSolutions: val,
                    answerBold: val
                  })}
                  className="scale-75"
                />
              </div>
              {layoutSettings.showAnswerWithDesc && (
                <div className="pl-3 py-1.5 space-y-2 border-l-2 border-indigo-200 bg-indigo-50/30 rounded-r-md">
                  {/* Language Picker */}
                  <div className="flex items-center justify-between pr-2">
                    <Label className="text-[9px] text-indigo-600/70 font-semibold uppercase tracking-tighter">Language:</Label>
                    <div className="flex bg-white rounded p-0.5 border border-indigo-100 shadow-sm">
                      {['en', 'hi', 'both'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLayoutSettings({ explanationLanguage: lang as any })}
                          className={`px-1.5 py-0.5 text-[8px] rounded-sm transition-all capitalize ${
                            layoutSettings.explanationLanguage === lang 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          {lang === 'both' ? 'Both' : lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Solution Font Size */}
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter">Solution Size:</Label>
                      <span className="text-[9px] font-mono text-indigo-600 font-bold">{layoutSettings.solutionFontSize}px</span>
                    </div>
                    <Slider
                      value={[layoutSettings.solutionFontSize]}
                      onValueChange={([val]) => setLayoutSettings({ solutionFontSize: val })}
                      min={6}
                      max={24}
                      step={1}
                      className="py-1 forced-colors:bg-indigo-600"
                    />
                  </div>

                  {/* Explanation font settings */}
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between items-center">
                      <Label className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter">Expl. Size:</Label>
                      <span className="text-[9px] font-mono text-indigo-600 font-bold">{layoutSettings.explanationFontSize}px</span>
                    </div>
                    <Slider
                      value={[layoutSettings.explanationFontSize]}
                      onValueChange={([val]) => setLayoutSettings({ explanationFontSize: val })}
                      min={6}
                      max={24}
                      step={1}
                      className="py-1"
                    />
                    <div className="flex items-center gap-1 bg-white rounded border h-5 px-1 w-fit mt-1">
                      <input 
                        type="color"
                        value={layoutSettings.explanationColor}
                        onChange={(e) => setLayoutSettings({ explanationColor: e.target.value })}
                        className="w-3 h-3 p-0 border-none cursor-pointer bg-transparent"
                      />
                      <span className="text-[8px] text-gray-400 font-mono">{layoutSettings.explanationColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-[11px] text-indigo-800 whitespace-nowrap">Opt-Bold:</Label>
              <Input 
                value={layoutSettings.optionBoldness}
                onChange={(e) => setLayoutSettings({ optionBoldness: e.target.value })}
                className="h-7 text-[10px] w-16"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-[11px] text-indigo-800 whitespace-nowrap">Sol-Bold:</Label>
              <Input 
                value={layoutSettings.solutionBoldness}
                onChange={(e) => setLayoutSettings({ solutionBoldness: e.target.value })}
                className="h-7 text-[10px] w-16"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-[10px] text-indigo-900 uppercase font-bold opacity-70">Subject Filter</Label>
              <Select 
                value={selectedSubject} 
                onValueChange={(val) => setSelectedSubject(val)}
              >
                <SelectTrigger className="h-8 text-[11px] bg-white border-indigo-200 text-indigo-900">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Subjects">All Subjects</SelectItem>
                  {availableSubjects.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Grid & Margins Group */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-gray-500">Snap to Grid</Label>
            <Switch 
              checked={layoutSettings.snapToGrid}
              onCheckedChange={(val) => setLayoutSettings({ snapToGrid: val })}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-gray-500">Show Margins</Label>
            <Switch 
              checked={layoutSettings.showMargins}
              onCheckedChange={(val) => setLayoutSettings({ showMargins: val })}
              className="scale-75"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-gray-500">Canvas Grid</Label>
            <Switch 
              checked={showGrid}
              onCheckedChange={() => useExportStudio.setState((state) => ({ showGrid: !state.showGrid }))}
              className="scale-75"
            />
          </div>
          {showGrid && (
            <div className="space-y-1">
              <Slider
                value={[layoutSettings.gridSize]}
                min={5} max={50} step={5}
                onValueChange={([val]) => setLayoutSettings({ gridSize: val })}
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Organization Branding */}
      <div className="space-y-3">
        <Label className="text-xs text-gray-500">Organization Branding</Label>
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: orgBranding.color }}
          >
            {orgBranding.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{orgBranding.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: orgBranding.color }}
              />
              <span className="text-xs text-gray-400 font-mono">
                {orgBranding.color}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Page Info */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>Pages: {pages.length}</p>
        <p>Total Elements: {pages.reduce((sum, p) => sum + p.elements.length, 0)}</p>
      </div>
    </div>
  );
}
