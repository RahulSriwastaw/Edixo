"use client";

import { useState } from "react";
import { BarChart3, LineChart, PieChart, Target, TrendingUp, AreaChart } from "lucide-react";

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart3, color: "#F4511E" },
  { id: "line", label: "Line Chart", icon: LineChart, color: "#1E3A5F" },
  { id: "pie", label: "Pie Chart", icon: PieChart, color: "#10B981" },
  { id: "donut", label: "Donut", icon: Target, color: "#8B5CF6" },
  { id: "area", label: "Area Chart", icon: TrendingUp, color: "#F59E0B" },
  { id: "scatter", label: "Scatter", icon: AreaChart, color: "#EF4444" },
];

const chartStyles = [
  { id: "brand", label: "Brand Colors", colors: ["#F4511E", "#1E3A5F", "#FFB74D"] },
  { id: "warm", label: "Warm", colors: ["#F4511E", "#FF8A65", "#FFB74D"] },
  { id: "cool", label: "Cool", colors: ["#1E3A5F", "#64B5F6", "#90CAF9"] },
  { id: "mono", label: "Monochrome", colors: ["#111827", "#6B7280", "#D1D5DB"] },
];

export function ChartsTab() {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <p className="text-xs text-orange-700">
          💡 Charts auto-fill with your exported data. Select a chart type to add it to your document.
        </p>
      </div>

      {/* Chart Types */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          CHART TYPES
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded border transition-all ${
                selectedChart === chart.id
                  ? "border-[#F4511E] bg-orange-50 ring-2 ring-[#F4511E]"
                  : "border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E]"
              }`}
            >
              <chart.icon
                className="w-6 h-6"
                style={{ color: chart.color }}
              />
              <span className="text-xs text-gray-600">{chart.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Styles */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          COLOR SCHEMES
        </h3>
        <div className="space-y-2">
          {chartStyles.map((style) => (
            <button
              key={style.id}
              className="w-full flex items-center gap-3 p-2 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <div className="flex gap-0.5">
                {style.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color, marginLeft: i > 0 ? -4 : 0 }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Preview */}
      {selectedChart && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            PREVIEW
          </h3>
          <div className="aspect-video rounded border border-gray-200 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              {chartTypes.find((c) => c.id === selectedChart)?.label}
              <p className="text-xs text-gray-400 mt-1">Click to add to canvas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
