"use client";

import { useExportStudio } from "../hooks/useExportStudio";
import { TemplatesTab } from "./TemplatesTab";
import { ElementsTab } from "./ElementsTab";
import { MediaTab } from "./MediaTab";
import { TextTab } from "./TextTab";
import { ChartsTab } from "./ChartsTab";
import { DataTab } from "./DataTab";
import { TablesTab } from "./TablesTab";

export function LeftPanel() {
  const { activeLeftTab } = useExportStudio();

  const renderContent = () => {
    switch (activeLeftTab) {
      case "templates":
        return <TemplatesTab />;
      case "elements":
        return <ElementsTab />;
      case "media":
        return <MediaTab />;
      case "text":
        return <TextTab />;
      case "charts":
        return <ChartsTab />;
      case "data":
        return <DataTab />;
      case "tables":
        return <TablesTab />;
      default:
        return <TemplatesTab />;
    }
  };

  return (
    <div className="w-60 bg-[#FAFAFA] border-r border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-3">
        {renderContent()}
      </div>
    </div>
  );
}
