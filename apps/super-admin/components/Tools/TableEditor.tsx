import React, { useState, useEffect } from 'react';
import { Plus, Minus, Type, Grid, Trash2, AlignLeft, AlignCenter, AlignRight, Columns, Rows } from 'lucide-react';
import { TableStructure, TableCell } from '../../types';

interface TableEditorProps {
    initialData?: TableStructure;
    onChange: (data: TableStructure) => void;
}

export const TableEditor: React.FC<TableEditorProps> = ({ initialData, onChange }) => {
    const [rows, setRows] = useState(initialData?.rows || 2);
    const [cols, setCols] = useState(initialData?.cols || 2);
    const [cells, setCells] = useState<TableCell[]>(initialData?.cells || []);
    const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);

    useEffect(() => {
        // Initialize cells if empty
        if (cells.length === 0) {
            const newCells: TableCell[] = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    newCells.push({
                        row: r, col: c, text: '',
                        isHeader: r === 0,
                        style: { align: 'center' }
                    });
                }
            }
            setCells(newCells);
        }
    }, []);

    useEffect(() => {
        onChange({
            rows,
            cols,
            cells,
            title: initialData?.title,
            style: initialData?.style
        });
    }, [rows, cols, cells]);

    const getCell = (r: number, c: number) => cells.find(cell => cell.row === r && cell.col === c);

    const updateCell = (r: number, c: number, updates: Partial<TableCell>) => {
        setCells(prev => prev.map(cell =>
            (cell.row === r && cell.col === c) ? { ...cell, ...updates } : cell
        ));
    };

    const addRow = () => {
        const newCells = [...cells];
        for (let c = 0; c < cols; c++) {
            newCells.push({ row: rows, col: c, text: '', style: { align: 'center' } });
        }
        setCells(newCells);
        setRows(r => r + 1);
    };

    const addCol = () => {
        const newCells = [...cells];
        for (let r = 0; r < rows; r++) {
            newCells.push({ row: r, col: cols, text: '', isHeader: r === 0, style: { align: 'center' } });
        }
        setCells(newCells);
        setCols(c => c + 1);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2 items-center flex-wrap">
                <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    <button onClick={addRow} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Add Row">
                        <Rows size={16} /><Plus size={10} className="absolute ml-3 -mt-3" />
                    </button>
                    <button onClick={addCol} className="p-1.5 hover:bg-slate-100 rounded text-slate-600" title="Add Column">
                        <Columns size={16} /><Plus size={10} className="absolute ml-3 -mt-3" />
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    <button
                        onClick={() => selectedCell && updateCell(selectedCell.r, selectedCell.c, { isHeader: !getCell(selectedCell.r, selectedCell.c)?.isHeader })}
                        className={`p-1.5 rounded ${selectedCell && getCell(selectedCell.r, selectedCell.c)?.isHeader ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                        disabled={!selectedCell}
                        title="Toggle Header"
                    >
                        <Type size={16} className="font-bold" />
                    </button>
                    <button
                        onClick={() => selectedCell && updateCell(selectedCell.r, selectedCell.c, { style: { ...getCell(selectedCell.r, selectedCell.c)?.style, bold: !getCell(selectedCell.r, selectedCell.c)?.style?.bold } })}
                        className={`p-1.5 rounded ${selectedCell && getCell(selectedCell.r, selectedCell.c)?.style?.bold ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                        disabled={!selectedCell}
                        title="Bold"
                    >
                        <span className="font-bold text-xs">B</span>
                    </button>
                </div>

                <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                    <button
                        onClick={() => selectedCell && updateCell(selectedCell.r, selectedCell.c, { style: { ...getCell(selectedCell.r, selectedCell.c)?.style, align: 'left' } })}
                        className={`p-1.5 rounded ${selectedCell && getCell(selectedCell.r, selectedCell.c)?.style?.align === 'left' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                        disabled={!selectedCell}
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        onClick={() => selectedCell && updateCell(selectedCell.r, selectedCell.c, { style: { ...getCell(selectedCell.r, selectedCell.c)?.style, align: 'center' } })}
                        className={`p-1.5 rounded ${selectedCell && getCell(selectedCell.r, selectedCell.c)?.style?.align === 'center' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                        disabled={!selectedCell}
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        onClick={() => selectedCell && updateCell(selectedCell.r, selectedCell.c, { style: { ...getCell(selectedCell.r, selectedCell.c)?.style, align: 'right' } })}
                        className={`p-1.5 rounded ${selectedCell && getCell(selectedCell.r, selectedCell.c)?.style?.align === 'right' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                        disabled={!selectedCell}
                    >
                        <AlignRight size={16} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300">
                    <tbody>
                        {Array.from({ length: rows }).map((_, r) => (
                            <tr key={r}>
                                {Array.from({ length: cols }).map((_, c) => {
                                    const cell = getCell(r, c);
                                    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                                    return (
                                        <td
                                            key={`${r}-${c}`}
                                            className={`border border-slate-300 p-0 relative transition-all
                                                ${cell?.isHeader ? 'bg-slate-100 font-bold' : 'bg-white'}
                                                ${isSelected ? 'ring-2 ring-indigo-500 z-10' : ''}
                                            `}
                                            onClick={() => setSelectedCell({ r, c })}
                                        >
                                            <input
                                                type="text"
                                                value={cell?.text || ''}
                                                onChange={(e) => updateCell(r, c, { text: e.target.value })}
                                                className={`w-full h-full p-2 outline-none bg-transparent ${cell?.style?.bold ? 'font-bold' : ''} text-${cell?.style?.align || 'left'}`}
                                                placeholder={cell?.isHeader ? 'Header' : ''}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-2 text-xs text-slate-400 flex justify-between">
                <span>{rows} Rows x {cols} Columns</span>
                <span>Click cell to edit properties</span>
            </div>
        </div>
    );
};
