"use client";

const tableStyles = [
  {
    id: "simple",
    name: "Simple",
    description: "Clean, minimal borders",
    preview: "simple",
  },
  {
    id: "striped",
    name: "Striped",
    description: "Alternating row colors",
    preview: "striped",
  },
  {
    id: "bordered",
    name: "Bordered",
    description: "Full cell borders",
    preview: "bordered",
  },
  {
    id: "card",
    name: "Card Style",
    description: "Modern card layout",
    preview: "card",
  },
  {
    id: "colorful",
    name: "Colorful Header",
    description: "Brand-colored header",
    preview: "colorful",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "No borders, clean look",
    preview: "minimal",
  },
];

const predefinedTables = [
  {
    id: "marks",
    name: "Marks Table",
    description: "Subject-wise marks with total",
    columns: 4,
    rows: 5,
  },
  {
    id: "results",
    name: "Results Summary",
    description: "Exam results with grades",
    columns: 5,
    rows: 4,
  },
  {
    id: "attendance",
    name: "Attendance Sheet",
    description: "Student attendance records",
    columns: 6,
    rows: 10,
  },
];

export function TablesTab() {
  return (
    <div className="space-y-4">
      {/* Table Styles */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          TABLE STYLES
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {tableStyles.map((style) => (
            <button
              key={style.id}
              className="p-2 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all text-left"
            >
              {/* Table Preview */}
              <div className="aspect-[4/3] rounded border border-gray-100 bg-gray-50 mb-2 flex items-center justify-center">
                <div className="w-[80%] space-y-0.5">
                  {/* Header row */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-sm ${
                          style.preview === "colorful" ? "bg-[#F4511E]" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Data rows */}
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-sm ${
                            style.preview === "striped" && row % 2 === 0
                              ? "bg-gray-200"
                              : style.preview === "bordered"
                              ? "border border-gray-200 bg-white"
                              : style.preview === "card"
                              ? "bg-white border border-gray-100"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs font-medium text-gray-700">{style.name}</p>
              <p className="text-[10px] text-gray-400">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Predefined Tables */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          PRE-MADE TABLES
        </h3>
        <div className="space-y-2">
          {predefinedTables.map((table) => (
            <button
              key={table.id}
              className="w-full flex items-center justify-between p-3 rounded border border-gray-200 bg-white hover:ring-2 hover:ring-[#F4511E] transition-all"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">{table.name}</p>
                <p className="text-xs text-gray-400">{table.description}</p>
              </div>
              <div className="text-xs text-gray-400">
                {table.columns} × {table.rows}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Table */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          CUSTOM TABLE
        </h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Columns</label>
            <input
              type="number"
              defaultValue={3}
              min={1}
              max={10}
              className="w-full h-9 px-2 border rounded text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Rows</label>
            <input
              type="number"
              defaultValue={4}
              min={1}
              max={20}
              className="w-full h-9 px-2 border rounded text-sm"
            />
          </div>
        </div>
        <button className="w-full mt-2 py-2 text-sm rounded bg-[#F4511E] text-white hover:bg-[#E64A19] transition-colors">
          Insert Table
        </button>
      </div>

      {/* Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <p className="text-xs text-orange-700">
          💡 Tables can auto-populate with your data. Use data bindings to connect table cells to your dataset.
        </p>
      </div>
    </div>
  );
}
