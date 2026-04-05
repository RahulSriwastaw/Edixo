"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const templateCategories = [
  {
    name: "Question Papers",
    count: 8,
    templates: [
      { id: "t1", name: "JEE Classic", color: "#E8F4FD" },
      { id: "t2", name: "NEET Modern", color: "#FEF3E2" },
      { id: "t3", name: "Board Exam", color: "#E8F5E9" },
    ],
  },
  {
    name: "Result Sheets",
    count: 6,
    templates: [
      { id: "t4", name: "Standard Marksheet", color: "#FFF8E1" },
      { id: "t5", name: "Modern Card", color: "#F3E5F5" },
    ],
  },
  {
    name: "Certificates",
    count: 10,
    templates: [
      { id: "t6", name: "Elegant Border", color: "#E3F2FD" },
      { id: "t7", name: "Modern Minimal", color: "#FBE9E7" },
    ],
  },
  {
    name: "Reports",
    count: 8,
    templates: [
      { id: "t8", name: "Analytics Report", color: "#E0F2F1" },
    ],
  },
  {
    name: "Invoices",
    count: 4,
    templates: [
      { id: "t9", name: "Clean Invoice", color: "#F1F8E9" },
    ],
  },
  {
    name: "Presentations",
    count: 6,
    templates: [],
  },
];

const suggestedTemplates = [
  { id: "s1", name: "JEE Paper Classic", color: "#FEF3E2", desc: "Based on your data" },
  { id: "s2", name: "Result Sheet", color: "#E8F5E9", desc: "Recommended" },
];

export function TemplatesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Question Papers"]);

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9 text-sm bg-white"
        />
      </div>

      {/* Suggested */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          📌 SUGGESTED FOR YOU
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {suggestedTemplates.map((template) => (
            <button
              key={template.id}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: template.color }}
              >
                <span className="text-2xl opacity-50">📄</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs font-medium text-white truncate">{template.name}</p>
              </div>
              {template.desc && (
                <Badge className="absolute top-1 right-1 text-[10px] bg-[#F4511E] text-white border-0">
                  {template.desc}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-1">
        {templateCategories.map((category) => (
          <Collapsible
            key={category.name}
            open={expandedCategories.includes(category.name)}
            onOpenChange={() => toggleCategory(category.name)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 px-1 rounded hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                {expandedCategories.includes(category.name) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                {category.count}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-5 pt-2">
              <div className="grid grid-cols-2 gap-2 pb-2">
                {category.templates.map((template) => (
                  <button
                    key={template.id}
                    className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-[#F4511E] hover:scale-[1.02] transition-all"
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: template.color }}
                    >
                      <span className="text-xl opacity-40">📄</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5">
                      <p className="text-[10px] font-medium text-white truncate">{template.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Blank */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          📄 BLANK
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {["A4 Portrait", "A4 Landscape", "US Letter", "Presentation"].map((size) => (
            <button
              key={size}
              className="aspect-[3/4] rounded-lg border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all flex flex-col items-center justify-center gap-1"
            >
              <div className="w-8 h-10 border border-gray-300 rounded-sm" />
              <span className="text-[10px] text-gray-500">{size}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
