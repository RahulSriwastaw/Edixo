"use client";

import { TopBar } from "./TopBar/TopBar";
import { LeftPanel } from "./LeftPanel/LeftPanel";
import { Canvas } from "./Canvas/Canvas";
import { RightPanel } from "./RightPanel/RightPanel";
import { AIPanel } from "./AIPanel/AIPanel";
import { PreviewModal } from "./Preview/PreviewModal";
import { ExportModal } from "./Export/ExportModal";
import { StatusBar } from "./StatusBar/StatusBar";
import { useExportStudio } from "./hooks/useExportStudio";

export function ExportStudio() {
  const { showAIPanel, showPreview, showExportModal } = useExportStudio();

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <TopBar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <LeftPanel />
        
        {/* Canvas Area */}
        <Canvas />
        
        {/* Right Panel */}
        <RightPanel />
        
        {/* AI Panel (slides in from right) */}
        {showAIPanel && <AIPanel />}
      </div>
      
      {/* Status Bar */}
      <StatusBar />
      
      {/* Modals */}
      {showPreview && <PreviewModal />}
      {showExportModal && <ExportModal />}
    </div>
  );
}
