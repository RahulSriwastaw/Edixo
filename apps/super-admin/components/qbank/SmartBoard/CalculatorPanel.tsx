import React, { useState, useEffect, useRef } from 'react';
import { X, Delete, GripHorizontal, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useDraggable } from './useDraggable';

interface CalculatorPanelProps {
    onClose: () => void;
}

interface HistoryItem {
    expression: string;
    result: string;
}

export const CalculatorPanel: React.FC<CalculatorPanelProps> = ({ onClose }) => {
    const { position, dragHandlers } = useDraggable({ x: 100, y: 100 });
    const [display, setDisplay] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

    // Auto-scroll history
    const historyRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history, showHistory]);

    const calculate = (expression: string) => {
        try {
            // Advanced replacement logic
            let evalExpr = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/\^/g, '**')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/cbrt/g, 'Math.cbrt')
                .replace(/ln/g, 'Math.log')
                .replace(/log/g, 'Math.log10')
                .replace(/abs/g, 'Math.abs');

            // Factorial handling (simple implementation for integers < 170)
            evalExpr = evalExpr.replace(/(\d+)!/g, (_, n) => {
                let num = parseInt(n);
                if (num < 0) return 'NaN';
                let res = 1;
                for (let i = 2; i <= num; i++) res *= i;
                return res.toString();
            });

            // Trig handling with mode
            const trigFuncs = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan'];
            trigFuncs.forEach(func => {
                const regex = new RegExp(`${func}\\(([\\d.\\-+*/]+)\\)`, 'g');
                evalExpr = evalExpr.replace(regex, (_, arg) => {
                    let val = parseFloat(new Function('return ' + arg)()); // Evaluate argument first
                    if (angleMode === 'deg') {
                        // Convert inputs for normal trig, outputs for arc trig
                        if (!func.startsWith('a')) val = val * (Math.PI / 180);
                    }

                    let res = (Math[func as keyof Math] as (x: number) => number)(val); // Execute trig function

                    if (angleMode === 'deg' && func.startsWith('a')) {
                        res = res * (180 / Math.PI);
                    }
                    return res.toString();
                });
            });

            // Fallback for remaining trig if not caught by regex (e.g. nested)
            // This is a basic implementation. For robust parsing, a library is recommended.
            // We'll stick to basic JS Math functions for anything remaining.
            evalExpr = evalExpr
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/asin/g, 'Math.asin')
                .replace(/acos/g, 'Math.acos')
                .replace(/atan/g, 'Math.atan');


            // eslint-disable-next-line no-new-func
            const evalResult = new Function('return ' + evalExpr)();

            // Format result
            let finalRes = String(evalResult);
            if (finalRes.includes('.') && finalRes.length > 10) {
                finalRes = parseFloat(finalRes).toPrecision(10);
            }
            if (finalRes === 'NaN') finalRes = 'Error';

            return finalRes;
        } catch (error) {
            return 'Error';
        }
    };

    const handleBtnClick = (val: string) => {
        if (val === 'C') {
            setDisplay('');
            setResult('');
        } else if (val === 'DEL') {
            setDisplay(prev => prev.slice(0, -1));
        } else if (val === '=') {
            if (!display) return;
            const res = calculate(display);
            setResult(res);
            setHistory(prev => [...prev, { expression: display, result: res }].slice(-20)); // Keep last 20
            setDisplay(res);
        } else if (val === 'ans') {
            if (history.length > 0) {
                const lastRes = history[history.length - 1].result;
                setDisplay(prev => prev + lastRes);
            }
        } else {
            // If result acts as new starting point
            if (result && !['+', '-', '×', '÷', '^', '%'].includes(val) && display === result) {
                // Numbers/Funcs start new, Operators continue
                if (!isNaN(Number(val)) || val === '(' || val.length > 1) {
                    setDisplay(val);
                } else {
                    setDisplay(prev => prev + val);
                }
                setResult('');
            } else {
                setDisplay(prev => prev + val);
            }
        }
    };

    const basicButtons = [
        { label: 'C', type: 'action', val: 'C' },
        { label: 'DEL', type: 'action', val: 'DEL' },
        { label: '%', type: 'func', val: '%' },
        { label: '÷', type: 'op', val: '÷' },

        { label: '7', type: 'num', val: '7' },
        { label: '8', type: 'num', val: '8' },
        { label: '9', type: 'num', val: '9' },
        { label: '×', type: 'op', val: '×' },

        { label: '4', type: 'num', val: '4' },
        { label: '5', type: 'num', val: '5' },
        { label: '6', type: 'num', val: '6' },
        { label: '-', type: 'op', val: '-' },

        { label: '1', type: 'num', val: '1' },
        { label: '2', type: 'num', val: '2' },
        { label: '3', type: 'num', val: '3' },
        { label: '+', type: 'op', val: '+' },

        { label: '0', type: 'num', val: '0' },
        { label: '.', type: 'num', val: '.' },
        { label: 'π', type: 'const', val: 'π' },
        { label: '=', type: 'submit', val: '=' },
    ];

    const advancedButtons = [
        { label: 'sin', val: 'sin(' }, { label: 'cos', val: 'cos(' }, { label: 'tan', val: 'tan(' },
        { label: 'sin⁻¹', val: 'asin(' }, { label: 'cos⁻¹', val: 'acos(' }, { label: 'tan⁻¹', val: 'atan(' },
        { label: 'ln', val: 'ln(' }, { label: 'log', val: 'log(' }, { label: 'e', val: 'e' },
        { label: 'x²', val: '^2' }, { label: 'x^y', val: '^' }, { label: '√', val: 'sqrt(' },
        { label: '!', val: '!' }, { label: '(', val: '(' }, { label: ')', val: ')' },
        { label: 'Ans', val: 'ans' }, { label: 'abs', val: 'abs(' }, { label: '∛', val: 'cbrt(' }
    ];

    return (
        <div
            className="fixed z-50 flex flex-col smartboard-ui calculator-panel"
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                top: 0,
                left: 0
            }}
        >
            <div className={`bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isAdvanced ? 'w-[400px]' : 'w-72'} touch-none`}>

                {/* Header */}
                <div
                    className="h-10 bg-white/5 border-b border-white/5 flex items-center justify-between px-3 cursor-move"
                    onPointerDown={dragHandlers.onPointerDown}
                    onPointerMove={dragHandlers.onPointerMove}
                    onPointerUp={dragHandlers.onPointerUp}
                >
                    <div className="flex items-center gap-2 text-slate-400">
                        <GripHorizontal size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Calculator</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`p-1 rounded hover:bg-white/10 transition-colors ${showHistory ? 'text-blue-400' : 'text-slate-500'}`}
                            title="History"
                        >
                            <History size={16} />
                        </button>
                        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* History View */}
                {showHistory && (
                    <div ref={historyRef} className="h-32 bg-black/60 border-b border-white/5 overflow-y-auto p-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-slate-600 text-xs text-center mt-4">No history</div>
                        ) : (
                            history.map((item, i) => (
                                <div key={i} className="flex flex-col items-end mb-2 p-1 hover:bg-white/5 rounded cursor-pointer" onClick={() => setDisplay(item.result)}>
                                    <div className="text-slate-400 text-xs">{item.expression} =</div>
                                    <div className="text-emerald-400 font-mono text-sm">{item.result}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Main Display */}
                <div className="p-4 bg-black/40 text-right space-y-1 relative">
                    <div className="absolute top-2 left-2 flex gap-1">
                        <div className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">{angleMode.toUpperCase()}</div>
                    </div>
                    <div className="text-slate-400 text-xs h-4 overflow-hidden">{result !== display ? display : ''}</div>
                    <div className="text-white text-3xl font-mono font-medium truncate tracking-tight">{display || '0'}</div>
                </div>

                {/* Mode Toggles */}
                <div className="flex items-center gap-2 p-2 bg-white/5 border-b border-white/5">
                    <button
                        onClick={() => setIsAdvanced(!isAdvanced)}
                        className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase hover:bg-indigo-500/30 transition-all"
                    >
                        {isAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isAdvanced ? 'Basic Mode' : 'Scientific Mode'}
                    </button>
                    <button
                        onClick={() => setAngleMode(prev => prev === 'deg' ? 'rad' : 'deg')}
                        className="w-16 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase hover:bg-slate-700 transition-all"
                    >
                        {angleMode}
                    </button>
                </div>

                <div className="p-3 flex gap-2">
                    {/* Advanced Keys Left Panel */}
                    {isAdvanced && (
                        <div className="grid grid-cols-3 gap-2 w-1/2 animate-in slide-in-from-left-4 fade-in duration-200">
                            {advancedButtons.map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleBtnClick(btn.val)}
                                    className="h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center"
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Basic Keys Right Panel */}
                    <div className={`grid grid-cols-4 gap-2 ${isAdvanced ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
                        {basicButtons.map((btn, i) => (
                            <button
                                key={i}
                                onClick={() => handleBtnClick(btn.val)}
                                className={`
                                    h-10 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center
                                    ${btn.type === 'num' ? 'bg-white/5 hover:bg-white/10 text-white' : ''}
                                    ${btn.type === 'op' ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300' : ''}
                                    ${btn.type === 'func' || btn.type === 'const' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs' : ''}
                                    ${btn.type === 'action' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300' : ''}
                                    ${btn.type === 'submit' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}
                                `}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
