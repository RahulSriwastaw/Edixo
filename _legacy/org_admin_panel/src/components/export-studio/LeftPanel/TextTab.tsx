"use client";

const fontPresets = [
  { family: "DM Serif Display", label: "HEADING TEXT", weight: "bold" },
  { family: "DM Sans", label: "Body text sample", weight: "normal" },
  { family: "Courier New", label: "Code block sample", weight: "normal" },
];

const colorPresets = [
  { color: "#F4511E", name: "Brand Orange" },
  { color: "#1E3A5F", name: "Dark Blue" },
  { color: "#111827", name: "Black" },
  { color: "#6B7280", name: "Gray" },
  { color: "#10B981", name: "Green" },
  { color: "#EF4444", name: "Red" },
  { color: "#8B5CF6", name: "Purple" },
  { color: "#F59E0B", name: "Amber" },
];

const textEffects = [
  { id: "none", label: "None" },
  { id: "shadow", label: "Shadow" },
  { id: "glow", label: "Glow" },
  { id: "outline", label: "Outline" },
  { id: "3d", label: "3D" },
  { id: "neon", label: "Neon" },
];

export function TextTab() {
  return (
    <div className="space-y-4">
      {/* Font Presets */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          FONT PRESETS
        </h3>
        <div className="space-y-2">
          {fontPresets.map((font, i) => (
            <button
              key={i}
              className="w-full text-left p-3 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <p
                className="text-sm truncate"
                style={{
                  fontFamily: font.family,
                  fontWeight: font.weight,
                }}
              >
                {font.label}
              </p>
              <p className="text-xs text-gray-400 mt-1">{font.family}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          COLOR PRESETS
        </h3>
        <div className="flex flex-wrap gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.color}
              className="w-7 h-7 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
          <button className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
            +
          </button>
        </div>
      </div>

      {/* Text Effects */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          TEXT EFFECTS
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {textEffects.map((effect) => (
            <button
              key={effect.id}
              className="px-2 py-1.5 text-xs rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              {effect.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Text */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          QUICK ADD
        </h3>
        <div className="space-y-1">
          <button className="w-full text-left px-3 py-2 text-sm rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all">
            <p className="font-semibold">Heading</p>
            <p className="text-xs text-gray-400">Large title text</p>
          </button>
          <button className="w-full text-left px-3 py-2 text-sm rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all">
            <p>Subheading</p>
            <p className="text-xs text-gray-400">Medium text</p>
          </button>
          <button className="w-full text-left px-3 py-2 text-sm rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all">
            <p className="text-gray-600">Body text</p>
            <p className="text-xs text-gray-400">Regular paragraph</p>
          </button>
        </div>
      </div>
    </div>
  );
}
