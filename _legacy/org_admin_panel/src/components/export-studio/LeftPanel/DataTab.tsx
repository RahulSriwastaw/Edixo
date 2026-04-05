"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExportStudio } from "../hooks/useExportStudio";

export function DataTab() {
  const { dataBindings } = useExportStudio();
  const [searchQuery, setSearchQuery] = useState("");

  // Group bindings by category
  const groupedBindings = dataBindings.reduce((acc, binding) => {
    if (!acc[binding.category]) {
      acc[binding.category] = [];
    }
    acc[binding.category].push(binding);
    return acc;
  }, {} as Record<string, typeof dataBindings>);

  // Filter by search
  const filteredGroups = Object.entries(groupedBindings).reduce((acc, [category, bindings]) => {
    const filtered = bindings.filter(
      (b) =>
        b.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(b.value).toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof dataBindings>);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Data Bindings</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Click any variable to insert into text
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search variables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>

      {/* Variable Groups */}
      <div className="space-y-3">
        {Object.entries(filteredGroups).map(([category, bindings]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {category}
            </h4>
            <div className="space-y-1">
              {bindings.map((binding) => (
                <div
                  key={binding.key}
                  className="flex items-center justify-between p-2 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-purple-600 font-mono bg-purple-50 px-1.5 py-0.5 rounded">
                        {`{{${binding.key}}}`}
                      </code>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {binding.label}: <span className="font-medium text-gray-800">{binding.value}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4 text-[#F4511E]" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          💡 Variables like <code className="bg-blue-100 px-1 rounded">{"{{student_name}}"}</code> will be 
          automatically replaced with actual data when exporting.
        </p>
      </div>

      {/* Quick Insert */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          QUICK INSERT
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {["{{student_name}}", "{{exam_name}}", "{{score}}", "{{rank}}", "{{grade}}"].map((variable) => (
            <Badge
              key={variable}
              variant="outline"
              className="cursor-pointer hover:bg-[#F4511E] hover:text-white hover:border-[#F4511E] transition-colors font-mono text-[10px]"
            >
              {variable}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
