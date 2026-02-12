import React, { useEffect, useState, useMemo } from 'react';
import { BoardCanvas } from './BoardCanvas';
import { BoardToolbar } from './BoardToolbar';
import { useBoardStore } from './store';
import { useDraggable } from './useDraggable';
import { useResizable } from './useResizable';
import { Question } from '../../types';
import { Clock, Presentation, Maximize, CheckCircle, ArrowLeft, BookOpen, X, Hourglass, Settings, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';

import { ClassNotesModal } from './ClassNotesModal';
import { CalculatorPanel } from './CalculatorPanel';
import { useLiveSession } from '../../hooks/useLiveSession';

interface SmartBoardProps {
    questions: Question[];
    initialIdx?: number;
    setName?: string;
    setId?: string;
    onExit: () => void;
    broadcastMode?: boolean;
}


type Slide =
    | { type: 'question'; data: Question }
    | { type: 'solution'; data: Question };

export const SmartBoard: React.FC<SmartBoardProps> = ({
    questions = [],
    initialIdx = 0,
    setName = 'Live Session',
    setId,
    onExit,
    broadcastMode = false
}) => {
    // Initialize slides: Map each question to a 'question' slide initially
    const [slides, setSlides] = useState<Slide[]>(() =>
        questions.map(q => ({ type: 'question', data: q }))
    );

    const [currentIdx, setCurrentIdx] = useState(initialIdx);
    const [timer, setTimer] = useState(0);
    const [showAns, setShowAns] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [langMode, setLangMode] = useState<'both' | 'eng' | 'hin'>('both');

    // Countdown Timer State
    const [solveTimer, setSolveTimer] = useState<number | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showTimerSettings, setShowTimerSettings] = useState(false);

    const [manualTime, setManualTime] = useState('');
    const [showClassNotes, setShowClassNotes] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    // showCalculator replaced by store.activePanel === 'calculator'

    const sessionId = setId || 'demo-session';
    const { broadcastStroke, broadcastClear, broadcastUpdate, broadcastSlideChange, broadcastSessionConfig } = useLiveSession(sessionId, true);

    const {
        strokes,
        questionStyle, setQuestionStyle,
        boardBackgroundColor, boardBackgroundImage, boardOpacity, tool,
        saveSlideStrokes, loadSlideStrokes, saveSlideImage,
        activePanel, setActivePanel
    } = useBoardStore();

    // Tools Draggable State
    const { position: toolbarPos, dragHandlers: toolbarDragHandlers } = useDraggable({
        x: window.innerWidth / 2 - 250,
        y: window.innerHeight - 100
    });

    const { position: explPos, dragHandlers: explHandlers } = useDraggable(
        questionStyle.explanationPosition || { x: 50, y: 50 },
        (pos) => setQuestionStyle({ explanationPosition: pos })
    );
    const { size: explSize, isResizing: isExplResizing, resizeHandlers: explResizeHandlers, initResize: initExplResize } = useResizable(
        questionStyle.explanationSize || { width: 800, height: 600 },
        (newSize) => setQuestionStyle({ explanationSize: newSize })
    );

    const { position: timerPos, dragHandlers: timerHandlers } = useDraggable({ x: window.innerWidth - 200, y: 80 });

    const isCursor = tool === 'cursor';

    // Question Card Draggable/Resizable
    const { position, isDragging, dragHandlers } = useDraggable(
        questionStyle.position,
        (pos) => setQuestionStyle({ position: pos })
    );

    const { size, resizeHandlers, initResize } = useResizable(
        questionStyle.dimensions,
        (newSize) => setQuestionStyle({ dimensions: newSize })
    );

    // Explanation Panel Resizer - Removed old unused hook if present
    // ...

    const currentSlide = slides[currentIdx];
    // Helper to get underlying question data safely
    const currentQuestion = currentSlide?.data;

    // Check if next slide is already a solution for the current question
    const hasNextSlideSolution = useMemo(() => {
        if (!currentQuestion) return false;
        const nextSlide = slides[currentIdx + 1];
        return nextSlide && nextSlide.type === 'solution' && nextSlide.data.id === currentQuestion.id;
    }, [slides, currentIdx, currentQuestion]);

    useEffect(() => {
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Countdown Timer Logic
    useEffect(() => {
        let interval: any;
        if (isTimerRunning && solveTimer !== null && solveTimer > 0) {
            interval = setInterval(() => {
                setSolveTimer(prev => {
                    if (prev === null || prev <= 1) {
                        setIsTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, solveTimer]);

    const toggleSolveTimer = () => {
        if (solveTimer === null) {
            setSolveTimer(30);
            setIsTimerRunning(true);
        } else if (solveTimer === 30) {
            setSolveTimer(60);
            setIsTimerRunning(true);
        } else if (solveTimer === 60) {
            setSolveTimer(120);
            setIsTimerRunning(true);
        } else {
            setSolveTimer(null);
            setIsTimerRunning(false);
        }
    };

    // Initial Load
    useEffect(() => {
        loadSlideStrokes(initialIdx);
        // Broadcast session config on mount to sync students
        broadcastSessionConfig({ setId, setName });
    }, []);

    // Toggle Solution Slide Logic
    const toggleSolutionSlide = () => {
        if (!currentQuestion) return;

        if (hasNextSlideSolution) {
            // Remove the solution slide
            const newSlides = [...slides];
            newSlides.splice(currentIdx + 1, 1);
            setSlides(newSlides);
        } else {
            // Add solution slide
            const newSlides = [...slides];
            newSlides.splice(currentIdx + 1, 0, { type: 'solution', data: currentQuestion });
            setSlides(newSlides);
        }
    };

    const captureScreen = async () => {
        const element = document.getElementById('smartboard-container');
        if (!element) return;

        // Robustly hide ALL UI elements for clean capture
        // We use a specific set of selectors to ensure everything is caught
        const uiSelectors = [
            '.smartboard-ui',       // Header and Toolbar
            '.timer-overlay',       // Draggable Timer Widget
            '.resize-handle',       // Resize handles in cursor mode
            '.cursor-overlay',      // Any other potential overlays
            '.explanation-panel'    // Hide detailed explanation panel during capture? User said "classnotes me aa sake" (so it should appear?)
            // Wait, user said "explanation pura dikhna chahiye taki classnotes me aa sake". 
            // This implies they WANT the explanation IN the capture.
            // So do NOT hide '.explanation-panel' if it is intended for notes. 
            // I will NOT add explanation-panel to the hidden list.
        ];

        const hiddenElements: HTMLElement[] = [];

        uiSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const htmlEl = el as HTMLElement;
                // Store original visibility only if not already hidden
                if (htmlEl.style.visibility !== 'hidden') {
                    htmlEl.style.visibility = 'hidden';
                    hiddenElements.push(htmlEl);
                }
            });
        });

        try {
            const canvas = await html2canvas(element, {
                scale: 1,
                useCORS: true,
                logging: false,
                backgroundColor: boardBackgroundColor,
                // Ensure we capture the full viewport size
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: window.innerHeight
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.8); // Slightly higher quality
            saveSlideImage(currentIdx, imgData);
        } catch (error) {
            console.error("Capture failed", error);
        } finally {
            // Restore visibility
            hiddenElements.forEach(el => el.style.visibility = '');
        }
    };

    const handleNext = async () => {
        if (currentIdx < slides.length - 1) {
            await captureScreen();
            saveSlideStrokes(currentIdx, strokes);
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            broadcastSlideChange(nextIdx);
            loadSlideStrokes(nextIdx);
            // Reset local view states for new slide
            setShowAns(false);
            setShowSolution(false);
        }
    };

    const handlePrev = async () => {
        if (currentIdx > 0) {
            await captureScreen();
            saveSlideStrokes(currentIdx, strokes);
            const prevIdx = currentIdx - 1;
            setCurrentIdx(prevIdx);
            broadcastSlideChange(prevIdx);
            loadSlideStrokes(prevIdx);
            setShowAns(false);
            setShowSolution(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen().catch(() => { });
        }
    };

    return (
        <div id="smartboard-container" className="fixed inset-0 flex flex-col text-slate-200 font-sans overflow-hidden">

            {/* Board Background Layer */}
            <div
                className="absolute inset-0 transition-colors duration-500 z-0"
                style={{
                    backgroundColor: boardBackgroundColor,
                    backgroundImage: boardBackgroundImage ? `url(${boardBackgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: boardOpacity
                }}
            />

            {/* Top Bar */}
            <header className={`smartboard-ui absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-6 z-50 bg-[#0A0C10]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300 ease-in-out ${isHeaderVisible && !broadcastMode ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                {/* Fold Toggle Tab */}
                <div
                    onClick={() => setIsHeaderVisible(!isHeaderVisible)}
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#0A0C10]/90 backdrop-blur-md rounded-b-lg border-b border-x border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors z-50 shadow-sm group"
                    style={{ display: broadcastMode ? 'none' : 'flex' }}
                    title={isHeaderVisible ? "Fold Menu (Hide)" : "Unfold Menu (Show)"}
                >
                    {isHeaderVisible ? (
                        <ChevronUp size={14} className="text-slate-500 group-hover:text-white" />
                    ) : (
                        <ChevronDown size={14} className="text-slate-500 group-hover:text-white" />
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <Presentation size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">
                            {setName} {hasNextSlideSolution ? '(+Sol)' : ''}
                        </span>
                    </div>
                    {/* ... (rest of header same) ... */}
                    <div className="h-4 w-px bg-white/10" />
                    {/* Timer Display */}
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-xs font-bold">
                        {solveTimer !== null ? (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${solveTimer <= 10 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                <Hourglass size={14} className={isTimerRunning ? 'animate-spin-slow' : ''} />
                                <span className="text-sm font-black tracking-widest">{Math.floor(solveTimer / 60)}:{(solveTimer % 60).toString().padStart(2, '0')}</span>
                            </div>
                        ) : (
                            <>
                                <Clock size={14} />
                                <span>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSolveTimer}
                        className={`p-2 rounded-lg border transition-all ${solveTimer !== null ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                        title="Set Timer (30s / 60s / 120s / Off)"
                    >
                        <Hourglass size={18} />
                    </button>
                    <button
                        onClick={() => setShowTimerSettings(true)}
                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        title="Manual Timer"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={async () => {
                            // First, capture current screen to ensure up-to-date notes
                            await captureScreen();
                            setShowClassNotes(true);
                        }}
                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg transition-all"
                    >
                        <BookOpen size={16} />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            Class Notes
                        </span>
                    </button>
                    <div className="h-4 w-px bg-white/10" />


                    <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                        {(['both', 'eng', 'hin'] as const).map(l => (
                            <button
                                key={l}
                                onClick={() => setLangMode(l)}
                                className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${langMode === l ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                        <Maximize size={18} />
                    </button>
                    <button
                        onClick={onExit}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20"
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>
            </header>

            {/* Content Layer (Behind Canvas, but moves to front for interaction in Cursor mode) */}
            <main
                className={`flex-1 relative flex items-center justify-center p-4 sm:p-8 ${isCursor ? 'z-30 pointer-events-none' : 'z-10'}`}
                onPointerMove={(e) => {
                    dragHandlers.onPointerMove(e);
                    resizeHandlers.onPointerMove(e);
                    explHandlers.onPointerMove(e);
                    explResizeHandlers.onPointerMove(e);
                }}
                onPointerUp={(e) => {
                    dragHandlers.onPointerUp(e);
                    resizeHandlers.onPointerUp(e);
                    explHandlers.onPointerUp(e);
                    explResizeHandlers.onPointerUp(e);
                }}
            >
                {/* 
                    RENDER LOGIC:
                    Check 'currentSlide.type'.
                    If 'explanation', render full screen explanation.
                    If 'question', render standard card.
                */}

                {currentSlide?.type === 'solution' ? (
                    <div
                        className={`absolute flex flex-col pointer-events-auto shadow-2xl rounded-2xl overflow-hidden group/expl ${isExplResizing ? 'cursor-grabbing' : ''}`}
                        style={{
                            transform: `translate(${explPos.x}px, ${explPos.y}px)`,
                            width: explSize.width,
                            height: explSize.height,
                            maxWidth: '98vw',
                            maxHeight: '95vh',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onPointerDown={(e) => {
                            const target = e.target as HTMLElement;
                            if (!target.closest('.resize-handle') && !target.closest('.scroll-content')) {
                                explHandlers.onPointerDown(e);
                            }
                        }}
                    >
                        {/* Background Layer with Opacity */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                backgroundColor: questionStyle.backgroundColor,
                                opacity: questionStyle.cardOpacity,
                                backdropFilter: questionStyle.backgroundColor === 'transparent' ? 'none' : 'blur(20px)',
                            }}
                        />

                        {/* Resize Handles - Subtle 8 directions */}
                        {/* Corner Handles - Subtle with hover effect */}
                        {/* Top-Left */}
                        <div className="resize-handle absolute -left-1 -top-1 w-4 h-4 bg-indigo-500/30 hover:bg-indigo-500 rounded-full cursor-nw-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/expl:opacity-60"
                            onPointerDown={(e) => initExplResize(e, 'nw')}
                        >
                            <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                        </div>
                        {/* Top-Right */}
                        <div className="resize-handle absolute -right-1 -top-1 w-4 h-4 bg-indigo-500/30 hover:bg-indigo-500 rounded-full cursor-ne-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/expl:opacity-60"
                            onPointerDown={(e) => initExplResize(e, 'ne')}
                        >
                            <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                        </div>
                        {/* Bottom-Left */}
                        <div className="resize-handle absolute -left-1 -bottom-1 w-4 h-4 bg-indigo-500/30 hover:bg-indigo-500 rounded-full cursor-sw-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/expl:opacity-60"
                            onPointerDown={(e) => initExplResize(e, 'sw')}
                        >
                            <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                        </div>
                        {/* Bottom-Right */}
                        <div className="resize-handle absolute -right-1 -bottom-1 w-4 h-4 bg-indigo-500/30 hover:bg-indigo-500 rounded-full cursor-se-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/expl:opacity-60"
                            onPointerDown={(e) => initExplResize(e, 'se')}
                        >
                            <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                        </div>

                        {/* Edge Handles - Very subtle */}
                        {/* Top Edge */}
                        <div className="resize-handle absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 hover:bg-indigo-500/80 rounded-full cursor-n-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/expl:opacity-40"
                            onPointerDown={(e) => initExplResize(e, 'n')}
                        />
                        {/* Bottom Edge */}
                        <div className="resize-handle absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 hover:bg-indigo-500/80 rounded-full cursor-s-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/expl:opacity-40"
                            onPointerDown={(e) => initExplResize(e, 's')}
                        />
                        {/* Left Edge */}
                        <div className="resize-handle absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/10 hover:bg-indigo-500/80 rounded-full cursor-w-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/expl:opacity-40"
                            onPointerDown={(e) => initExplResize(e, 'w')}
                        />
                        {/* Right Edge */}
                        <div className="resize-handle absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/10 hover:bg-indigo-500/80 rounded-full cursor-e-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/expl:opacity-40"
                            onPointerDown={(e) => initExplResize(e, 'e')}
                        />


                        {/* Explanation Header (Draggable, Compact) */}
                        <div
                            className="relative z-10 flex items-center justify-between px-3 py-2 border-b border-indigo-500/30 cursor-move"
                            style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                            onPointerDown={explHandlers.onPointerDown}
                            onPointerMove={explHandlers.onPointerMove}
                            onPointerUp={explHandlers.onPointerUp}
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                                    <BookOpen size={16} />
                                </div>
                                <div className="pointer-events-none">
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Solution</h2>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow-sm opacity-80">
                                {currentQuestion?.id || 'Slide'}
                            </div>
                        </div>

                        {/* Explanation Body (Scrollable & Styled) */}
                        <div
                            className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-content"
                            style={{
                                fontFamily: questionStyle.fontFamily,
                                color: questionStyle.color,
                                fontSize: `${questionStyle.fontSize}px`,
                                lineHeight: questionStyle.lineHeight,
                                fontWeight: questionStyle.fontWeight,
                                fontStyle: questionStyle.fontStyle,
                                textDecoration: questionStyle.textDecoration,
                                opacity: questionStyle.textOpacity
                            }}
                            onPointerDown={(e) => e.stopPropagation()} // Allow text selection
                        >
                            {(langMode === 'both' || langMode === 'eng') && currentQuestion?.solution_eng && (
                                <div className="prose prose-invert prose-lg max-w-none"
                                    style={{
                                        color: 'inherit',
                                        fontSize: '1em',
                                        lineHeight: questionStyle.lineHeight
                                    }}
                                    dangerouslySetInnerHTML={{ __html: currentQuestion.solution_eng }}
                                />
                            )}

                            {(langMode === 'both' || langMode === 'hin') && currentQuestion?.solution_hin && (
                                <>
                                    {(langMode === 'both' && currentQuestion?.solution_eng) && <div className="h-px bg-white/10 my-6" />}
                                    <div className="prose prose-invert prose-lg max-w-none font-heading"
                                        style={{
                                            color: 'inherit',
                                            fontSize: '1em',
                                            lineHeight: questionStyle.lineHeight
                                        }}
                                        dangerouslySetInnerHTML={{ __html: currentQuestion.solution_hin }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                ) : currentQuestion ? (
                    <div
                        className={`select-none transition-all duration-75 relative pointer-events-auto group/card ${isDragging ? 'cursor-grabbing scale-[1.005]' : isCursor ? 'cursor-move' : ''}`}
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            width: size.width,
                            maxWidth: '100%',
                        }}
                        onPointerDown={(e) => {
                            const target = e.target as HTMLElement;
                            if (!target.closest('.resize-handle') && !target.closest('button') && !target.closest('.explanation-panel')) {
                                dragHandlers.onPointerDown(e);
                            }
                        }}
                    >
                        {/* Question Card Content (Standard) */}

                        {/* Resize Handles (Only visible in Cursor mode) - Subtle 8 directions */}
                        {isCursor && (
                            <>
                                {/* Corner Handles - Subtle with hover effect */}
                                {/* Top-Left */}
                                <div className="resize-handle absolute -left-1 -top-1 w-4 h-4 bg-blue-500/30 hover:bg-blue-500 rounded-full cursor-nw-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/card:opacity-60"
                                    onPointerDown={(e) => initResize(e, 'nw')}
                                >
                                    <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                                </div>
                                {/* Top-Right */}
                                <div className="resize-handle absolute -right-1 -top-1 w-4 h-4 bg-blue-500/30 hover:bg-blue-500 rounded-full cursor-ne-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/card:opacity-60"
                                    onPointerDown={(e) => initResize(e, 'ne')}
                                >
                                    <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                                </div>
                                {/* Bottom-Left */}
                                <div className="resize-handle absolute -left-1 -bottom-1 w-4 h-4 bg-blue-500/30 hover:bg-blue-500 rounded-full cursor-sw-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/card:opacity-60"
                                    onPointerDown={(e) => initResize(e, 'sw')}
                                >
                                    <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                                </div>
                                {/* Bottom-Right */}
                                <div className="resize-handle absolute -right-1 -bottom-1 w-4 h-4 bg-blue-500/30 hover:bg-blue-500 rounded-full cursor-se-resize z-50 hover:scale-150 transition-all border border-white/20 hover:border-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover/card:opacity-60"
                                    onPointerDown={(e) => initResize(e, 'se')}
                                >
                                    <div className="w-1 h-1 bg-white rounded-full opacity-70" />
                                </div>

                                {/* Edge Handles - Very subtle */}
                                {/* Top Edge */}
                                <div className="resize-handle absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 hover:bg-blue-500/80 rounded-full cursor-n-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/card:opacity-40"
                                    onPointerDown={(e) => initResize(e, 'n')}
                                />
                                {/* Bottom Edge */}
                                <div className="resize-handle absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 hover:bg-blue-500/80 rounded-full cursor-s-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/card:opacity-40"
                                    onPointerDown={(e) => initResize(e, 's')}
                                />
                                {/* Left Edge */}
                                <div className="resize-handle absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/10 hover:bg-blue-500/80 rounded-full cursor-w-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/card:opacity-40"
                                    onPointerDown={(e) => initResize(e, 'w')}
                                />
                                {/* Right Edge */}
                                <div className="resize-handle absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/10 hover:bg-blue-500/80 rounded-full cursor-e-resize z-50 transition-all opacity-0 hover:opacity-100 group-hover/card:opacity-40"
                                    onPointerDown={(e) => initResize(e, 'e')}
                                />
                            </>
                        )}

                        {/* Card Background Layer */}
                        <div
                            className="absolute inset-0 rounded-2xl border border-white/5"
                            style={{
                                backgroundColor: questionStyle.backgroundColor,
                                opacity: questionStyle.cardOpacity,
                                backdropFilter: questionStyle.backgroundColor === 'transparent' ? 'none' : 'blur(12px)',
                            }}
                        />

                        {/* Card Content Layer */}
                        <div className="relative z-10 p-3 md:p-4 space-y-2 flex flex-col" style={{
                            fontSize: `${questionStyle.fontSize}px`,
                            fontFamily: questionStyle.fontFamily,
                            color: questionStyle.color,
                            opacity: questionStyle.textOpacity,
                            textAlign: questionStyle.textAlign,
                            lineHeight: questionStyle.lineHeight,
                            fontWeight: questionStyle.fontWeight,
                            fontStyle: questionStyle.fontStyle,
                            textDecoration: questionStyle.textDecoration
                        }}>
                            {/* Logic to Toggle "Explanation on Next Slide" */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                {/* This toggle could be placed better, e.g. in options or toolbar */}
                            </div>

                            {/* Question Text */}
                            <div className="space-y-1.5 shrink-0 group/cardHeader relative">
                                {/* Toggle Button for Next Slide Expl */}
                                {/* Toggle Button Removed - Moved to Toolbar */}

                                {(langMode === 'both' || langMode === 'eng') && (
                                    <h1
                                        className="drop-shadow-lg"
                                        style={{ fontSize: '1.5em', color: 'inherit', fontWeight: 'inherit', lineHeight: questionStyle.lineHeight }}
                                        dangerouslySetInnerHTML={{ __html: currentQuestion.question_eng || '' }}
                                    />
                                )}
                                {(langMode === 'both' || langMode === 'hin') && (
                                    <h2
                                        className="drop-shadow-md mt-2"
                                        style={{ fontSize: '1.25em', color: 'inherit', opacity: 0.9, fontFamily: 'inherit', fontWeight: 'inherit', lineHeight: questionStyle.lineHeight }}
                                        dangerouslySetInnerHTML={{ __html: currentQuestion.question_hin || '' }}
                                    />
                                )}
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-1.5 pointer-events-auto shrink-0">
                                {[
                                    { e: currentQuestion.option1_eng, h: currentQuestion.option1_hin },
                                    { e: currentQuestion.option2_eng, h: currentQuestion.option2_hin },
                                    { e: currentQuestion.option3_eng, h: currentQuestion.option3_hin },
                                    { e: currentQuestion.option4_eng, h: currentQuestion.option4_hin }
                                ].map((opt, i) => {
                                    const isCorrect = (i + 1).toString() === currentQuestion.answer;
                                    const show = showAns && isCorrect;

                                    return (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setShowAns(!showAns); }}
                                            style={{
                                                backgroundColor: show ? 'rgba(16, 185, 129, 0.1)' : `rgba(255, 255, 255, ${0.05 * (questionStyle.cardOpacity ?? 1)})`,
                                                borderColor: show ? 'rgba(16, 185, 129, 0.5)' : `rgba(255, 255, 255, ${0.1 * (questionStyle.cardOpacity ?? 1)})`
                                            }}

                                            className={`
                                        group relative p-1.5 rounded-md border text-left transition-all duration-200
                                        ${show ? 'shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'hover:!border-blue-500/30 hover:!bg-white/10'}
                                    `}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className={`
                                            w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black transition-colors shrink-0 mt-0.5
                                            ${show ? 'bg-emerald-500 text-white' : 'bg-white/10 text-inherit group-hover:bg-blue-500 group-hover:text-white'}
                                        `}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                    {(langMode === 'both' || langMode === 'eng') && (
                                                        <div className={`font-medium ${show ? 'text-emerald-100' : 'text-inherit'}`} style={{ fontSize: '0.9em', lineHeight: questionStyle.lineHeight }} dangerouslySetInnerHTML={{ __html: opt.e || '' }} />
                                                    )}
                                                    {(langMode === 'both' || langMode === 'hin') && (
                                                        <div className={`${show ? 'text-emerald-200/70' : 'text-inherit opacity-70'}`} style={{ fontSize: '0.8em', lineHeight: questionStyle.lineHeight }} dangerouslySetInnerHTML={{ __html: opt.h || '' }} />
                                                    )}
                                                </div>
                                            </div>
                                            {show && (
                                                <div className="absolute top-1 right-1 text-emerald-500 animate-in zoom-in">
                                                    <CheckCircle size={10} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* View Solution Button - Appears only when answer is shown */}
                            {showAns && (
                                <div className="mt-3 pt-3 border-t border-white/10 space-y-2 shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            if (hasNextSlideSolution) {
                                                // If solution slide exists, navigate to it
                                                if (currentIdx < slides.length - 1) {
                                                    setCurrentIdx(currentIdx + 1);
                                                }
                                            } else {
                                                // Otherwise, toggle inline solution display
                                                setShowSolution(!showSolution);
                                            }
                                        }}
                                        className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 group ${(hasNextSlideSolution || showSolution)
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40'
                                            }`}
                                    >
                                        <BookOpen size={18} className={(hasNextSlideSolution || showSolution) ? '' : 'group-hover:scale-110 transition-transform'} />
                                        {hasNextSlideSolution ? 'View Solution →' : (showSolution ? 'Hide Solution' : 'View Solution')}
                                    </button>

                                    {/* Inline Solution Content - Only shown when explanation slide is NOT active */}
                                    {!hasNextSlideSolution && showSolution && currentQuestion && (
                                        <div
                                            className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl overflow-hidden border border-emerald-500/20 shadow-lg"
                                            style={{
                                                backgroundColor: `rgba(16, 185, 129, 0.05)`,
                                            }}
                                        >
                                            <div className="p-4 space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                                {(langMode === 'both' || langMode === 'eng') && currentQuestion.solution_eng && (
                                                    <div
                                                        className="prose prose-invert prose-sm max-w-none"
                                                        style={{
                                                            fontSize: `${questionStyle.fontSize * 0.85}px`,
                                                            lineHeight: questionStyle.lineHeight,
                                                            color: 'rgba(255, 255, 255, 0.9)'
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: currentQuestion.solution_eng }}
                                                    />
                                                )}

                                                {(langMode === 'both' || langMode === 'hin') && currentQuestion.solution_hin && (
                                                    <>
                                                        {(langMode === 'both' && currentQuestion.solution_eng) && <div className="h-px bg-white/10 my-3" />}
                                                        <div
                                                            className="prose prose-invert prose-sm max-w-none font-heading"
                                                            style={{
                                                                fontSize: `${questionStyle.fontSize * 0.85}px`,
                                                                lineHeight: questionStyle.lineHeight,
                                                                color: 'rgba(255, 255, 255, 0.85)'
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: currentQuestion.solution_hin }}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}


                            {/* Note: Explanation removed from here to make it floatable */}

                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 font-mono">No Question Loaded</div>
                )
                }
            </main >

            {/* Canvas Layer (Top) */}
            < BoardCanvas width={window.innerWidth} height={window.innerHeight} onStrokeAdd={broadcastStroke} onStrokeUpdate={broadcastUpdate} />

            {/* Toolbar - Movable */}
            < div className={`smartboard-ui fixed z-40 transition-opacity duration-300 ${broadcastMode ? 'hover:opacity-100 opacity-20' : 'opacity-100'}`} style={{ transform: `translate(${toolbarPos.x}px, ${toolbarPos.y}px)`, left: 0, top: 0 }}>
                <BoardToolbar
                    currentSlide={currentIdx}
                    totalSlides={questions.length || 1}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    dragHandlers={toolbarDragHandlers}
                    onToggleExplanation={toggleSolutionSlide}
                    hasExplanationSlide={hasNextSlideSolution}
                    onClear={broadcastClear}
                    broadcastMode={broadcastMode}
                />
            </div >



            {/* Calculator Panel */}
            {
                activePanel === 'calculator' && (
                    <div className="smartboard-ui">
                        <CalculatorPanel onClose={() => setActivePanel('none')} />
                    </div>
                )
            }
            {/* Timer Overlay Widget (Draggable) */}
            {
                solveTimer !== null && (
                    <div
                        className="fixed z-50 flex flex-col items-center gap-2 cursor-move pointer-events-auto touch-none group timer-overlay"
                        style={{
                            transform: `translate(${timerPos.x}px, ${timerPos.y}px)`,
                            left: 0,
                            top: 0
                        }}
                        onPointerDown={timerHandlers.onPointerDown}
                        onPointerMove={timerHandlers.onPointerMove}
                        onPointerUp={timerHandlers.onPointerUp}
                    >
                        <div className={`relative w-40 h-40 rounded-full bg-slate-900/90 backdrop-blur-xl border-4 ${solveTimer <= 10 ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-pulse' : 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]'} flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105`}>
                            {/* Metallic Rim Effect */}
                            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                            <div className="absolute inset-1 rounded-full border border-white/5 pointer-events-none" />

                            {/* Digital Display */}
                            <div className={`font-mono text-5xl font-black tracking-tighter ${solveTimer <= 10 ? 'text-red-400' : 'text-white'}`}>
                                {Math.floor(solveTimer / 60)}:{(solveTimer % 60).toString().padStart(2, '0')}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1">Time Left</div>

                            {/* Controls (Visible on Hover) */}
                            <div className="absolute -bottom-12 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsTimerRunning(!isTimerRunning); }}
                                    className="p-2 rounded-full bg-white text-slate-900 hover:bg-primary hover:text-white shadow-lg transition-colors"
                                >
                                    {isTimerRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSolveTimer(null); setIsTimerRunning(false); }}
                                    className="p-2 rounded-full bg-white text-slate-900 hover:bg-red-500 hover:text-white shadow-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Manual Timer Modal */}
            {
                showTimerSettings && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-80 shadow-2xl relative">
                            <button onClick={() => setShowTimerSettings(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={18} /></button>
                            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-indigo-400" />
                                Timer Settings
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Manual Time (Seconds)</label>
                                    <input
                                        type="number"
                                        autoFocus
                                        value={manualTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        placeholder="e.g. 45"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        const t = parseInt(manualTime);
                                        if (t > 0) {
                                            setSolveTimer(t);
                                            setIsTimerRunning(true);
                                            setShowTimerSettings(false);
                                            setManualTime('');
                                        }
                                    }}
                                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase tracking-wider transition-all"
                                >
                                    Start Timer
                                </button>

                                <div className="grid grid-cols-3 gap-2">
                                    {[30, 60, 300].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                setSolveTimer(t);
                                                setIsTimerRunning(true);
                                                setShowTimerSettings(false);
                                            }}
                                            className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                                        >
                                            {t >= 60 ? `${t / 60}m` : `${t}s`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Class Notes Modal */}
            {
                showClassNotes && (
                    <ClassNotesModal
                        onClose={() => setShowClassNotes(false)}
                        setId={setId}
                    />
                )
            }

        </div >
    );
};
