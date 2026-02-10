import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Path, Line, Rect, Circle, RegularPolygon, Arrow, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { getStroke } from 'perfect-freehand';
import { getSvgPathFromStroke } from './utils/getSvgPathFromStroke';
import { useBoardStore } from './store';
import { v4 as uuidv4 } from 'uuid';
import { Stroke } from './types';

// Helper component for loading images
const UrlImage = ({ stroke, isSelected, onSelect, onChange, draggable }: any) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (stroke.imageUrl) {
      const img = new window.Image();
      img.src = stroke.imageUrl;
      img.onload = () => setImage(img);
    }
  }, [stroke.imageUrl]);

  const shapeRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // Transformer attachment is handled by parent effect
    }
  }, [isSelected]);

  return (
    <KonvaImage
      ref={shapeRef}
      id={stroke.id}
      image={image}
      x={stroke.x || stroke.points[0]?.x}
      y={stroke.y || stroke.points[0]?.y}
      width={stroke.width}
      height={stroke.height}
      rotation={stroke.rotation || 0}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

interface BoardCanvasProps {
  width: number;
  height: number;
  onStrokeAdd?: (stroke: Stroke) => void;
  onStrokeUpdate?: (id: string, updates: Partial<Stroke>) => void;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({ width, height, onStrokeAdd, onStrokeUpdate }) => {
  const {
    tool,
    eraserMode,
    color,
    size,
    eraserSize,
    strokes,
    addStroke,
    updateStroke,
    setStrokes,
    fillColor,
    isFillEnabled,
    isBorderEnabled,
    borderStyle,
    opacity,
    laserConfig,
    selectedId,
    setSelectedId,
    setActivePanel
  } = useBoardStore();

  const isCursor = tool === 'cursor';

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeId, setCurrentStrokeId] = useState<string | null>(null);
  const [lassoPoints, setLassoPoints] = useState<{ x: number, y: number }[]>([]);
  const [laserPoints, setLaserPoints] = useState<{ x: number, y: number, time: number }[]>([]);
  const [isLaserDown, setIsLaserDown] = useState(false);

  // Ref-based drawing state for high performance
  const currentPointsRef = useRef<any[]>([]);
  const activePathRef = useRef<any>(null);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);

  // Text & Selection State
  const [isTyping, setIsTyping] = useState(false);
  const [typingPosition, setTypingPosition] = useState({ x: 0, y: 0 });
  const [typingText, setTypingText] = useState('');
  // selectedId is now global
  const transformerRef = useRef<any>(null);

  // Laser Cursor Management
  useEffect(() => {
    const stage = document.querySelector('canvas')?.parentElement; // Simplified selector, better to use ref if possible but stage creates a div
    if (!stage) return;

    if (tool === 'laser' && isLaserDown) {
      stage.style.cursor = 'none';
    } else {
      stage.style.cursor = 'default';
    }

    return () => {
      stage.style.cursor = 'default';
    };
  }, [tool, isLaserDown]);

  // Laser Keyboard Shortcuts
  useEffect(() => {
    if (tool !== 'laser') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r') useBoardStore.getState().setLaserConfig({ color: '#ef4444' }); // Red
      if (e.key === 'g') useBoardStore.getState().setLaserConfig({ color: '#22c55e' }); // Green
      if (e.key === 'b') useBoardStore.getState().setLaserConfig({ color: '#3b82f6' }); // Blue
      if (e.key === 'm') {
        // Cycle modes
        const modes = ['point', 'trail'] as const;
        const current = laserConfig.mode;
        const next = modes[(modes.indexOf(current as any) + 1) % modes.length];
        useBoardStore.getState().setLaserConfig({ mode: next });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, laserConfig]);

  // Laser Trail Animation
  useEffect(() => {
    // Clear points when tool changes (except if it stays laser) or mode changes
    // Actually, we want to clear if we exit laser tool.
    if (tool !== 'laser') {
      if (laserPoints.length > 0) setLaserPoints([]);
      return;
    }

    if (laserConfig.mode !== 'trail') return;

    let animationFrameId: number;

    const animate = () => {
      const now = Date.now();
      setLaserPoints(prev => {
        const activePoints = prev.filter(p => now - p.time < laserConfig.duration);
        if (activePoints.length !== prev.length) return activePoints;
        return prev;
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [tool, laserConfig.mode, laserConfig.duration]);

  // Clear laser points when switching modes
  useEffect(() => {
    setLaserPoints([]);
  }, [laserConfig.mode]);

  // Keyboard Shortcuts (Delete / Duplicate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        saveHistory();
        setStrokes(strokes.filter(s => s.id !== selectedId));
        setSelectedId(null);
      }

      // Duplicate (Ctrl+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const selectedStroke = strokes.find(s => s.id === selectedId);
        if (selectedStroke) {
          saveHistory();
          const newId = uuidv4();
          const newStroke = {
            ...selectedStroke,
            id: newId,
            x: (selectedStroke.x || 0) + 20,
            y: (selectedStroke.y || 0) + 20,
            points: selectedStroke.points.map(p => ({ ...p, x: p.x + 20, y: p.y + 20 }))
          };
          addStroke(newStroke);
          setSelectedId(newId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, strokes]);

  // Transformer Effect
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = transformerRef.current.getStage();
      const node = stage.findOne('#' + selectedId);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, strokes]); // Update when strokes change too, in case selected object is deleted

  // History management helper
  const saveHistory = () => {
    useBoardStore.setState(state => ({
      history: [...state.history, state.strokes],
      redoStack: []
    }));
  };

  const getDashArray = (style?: string) => {
    switch (style) {
      case 'dashed': return [15, 15];
      case 'dotted': return [2, 10];
      case 'dash-dot': return [15, 5, 2, 5];
      default: return undefined;
    }
  };

  const isPointInPolygon = (point: { x: number, y: number }, vs: { x: number, y: number }[]) => {
    // Ray-casting algorithm based on
    // https://github.com/substack/point-in-polygon
    const x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].x, yi = vs[i].y;
      const xj = vs[j].x, yj = vs[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleMouseDown = (e: any) => {
    // Close any active UI panels when interacting with canvas
    setActivePanel('none');

    // Selection logic for Cursor tool
    if (tool === 'cursor') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedId(null);
      } else {
        // Check if clicked object is a shape/image/text
        // e.target.id() should match stroke.id
        const id = e.target.id();
        if (id && strokes.find(s => s.id === id)) {
          setSelectedId(id);
        }
        // If clicked on something else (e.g. Transformer handle), do nothing (keep selection)
      }
      return;
    }

    if (tool === 'laser') {
      // Allow Left Click (0) or Right Click (2) for laser
      if (e.evt.button === 0 || e.evt.button === 2) {
        setIsLaserDown(true);
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        if (point) {
          setLaserPoints([{ x: point.x, y: point.y, time: Date.now() }]);
        }
      }
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    if (tool === 'eraser' && eraserMode === 'lasso') {
      setIsDrawing(true);
      setLassoPoints([{ x: point.x, y: point.y }]);
      return;
    }

    if (tool === 'text') {
      setTypingPosition({ x: point.x, y: point.y });
      setIsTyping(true);
      setTypingText('');
      // Wait for user to type and blur
      return;
    }

    // Start Drawing - Use Ref for Points (Imperative)
    setIsDrawing(true);
    saveHistory(); // Save state BEFORE adding new stroke

    const id = uuidv4();
    setCurrentStrokeId(id);

    // Initialize points ref
    currentPointsRef.current = [{ x: point.x, y: point.y, pressure: e.evt.pressure || 0.5 }];

    const isShape = ['rectangle', 'circle', 'triangle', 'star', 'arrow', 'line'].includes(tool);

    // Determine properties based on tool type
    let strokeColor = color;
    let strokeFill = undefined;
    let strokeOpacity = 1;
    let strokeBorderStyle = undefined;

    if (tool === 'eraser') {
      strokeColor = '#000000';
    } else if (tool === 'highlighter') {
      strokeOpacity = 0.5;
    } else if (isShape) {
      strokeColor = isBorderEnabled ? color : 'transparent';
      strokeFill = isFillEnabled ? fillColor : undefined;
      strokeOpacity = opacity;
      strokeBorderStyle = borderStyle;
    }

    const newStroke: Stroke = {
      id,
      tool,
      color: strokeColor,
      size: tool === 'eraser' ? eraserSize : size,
      points: currentPointsRef.current,
      isComplete: false,
      fill: strokeFill,
      borderStyle: strokeBorderStyle,
      opacity: strokeOpacity
    };

    setActiveStroke(newStroke);
    // Don't add to global store yet!
  };

  const handleMouseMove = (e: any) => {
    // Laser Logic: Track pointer only if activated
    if (tool === 'laser') {
      // Safety check: if mouse is not down (buttons=0), reset state
      // This prevents laser from getting stuck if mouseup happened outside
      if (isLaserDown && e.evt.buttons === 0) {
        setIsLaserDown(false);
        return;
      }

      if (!isLaserDown) return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      if (point) {
        if (laserConfig.mode === 'point') {
          setLaserPoints([{ x: point.x, y: point.y, time: Date.now() }]);
        } else {
          setLaserPoints(prev => [...prev, { x: point.x, y: point.y, time: Date.now() }]);
        }
      }
      return;
    }

    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (!point) return;

    if (tool === 'eraser' && eraserMode === 'lasso') {
      setLassoPoints(prev => [...prev, { x: point.x, y: point.y }]);
      return;
    }

    if (!activeStroke) return;

    // IMPERATIVE UPDATE: Update Ref and Konva Node directly
    // This bypasses React State updates for every pixel moved

    // 1. Update Points Data
    if (['rectangle', 'circle', 'triangle', 'arrow', 'line', 'star'].includes(tool)) {
      // Shapes: Update End Point only
      const start = currentPointsRef.current[0];
      currentPointsRef.current = [start, { x: point.x, y: point.y }];
    } else {
      // Freehand: Append Point
      currentPointsRef.current.push({
        x: point.x,
        y: point.y,
        pressure: e.evt.pressure || 0.5
      });
    }

    // 2. Direct DOM Update via Konva Ref (Render Loop)
    if (['pen', 'highlighter', 'eraser'].includes(tool)) {
      if (activePathRef.current) {
        const options = {
          size: activeStroke.size,
          thinning: tool === 'highlighter' ? 0 : 0.5,
          smoothing: 0.9,
          streamline: 0.85,
          easing: (t: any) => t,
          start: { cap: true, taper: tool === 'pen' ? 0 : undefined },
          end: { cap: true, taper: tool === 'pen' ? 0 : undefined }
        };

        const outlinePoints = getStroke(currentPointsRef.current, options);
        const pathData = getSvgPathFromStroke(outlinePoints);

        // Direct Set
        activePathRef.current.setData(pathData);
        activePathRef.current.getLayer().batchDraw();
      }
    } else {
      // Shapes need React update because their geometry props change (width/height etc)
      // For shapes, update state (less frequent updates usually fine for straight lines, or we prefer visual feedback)
      setActiveStroke(prev => ({
        ...prev!,
        points: currentPointsRef.current
      }));
    }
  };

  const handleMouseUp = () => {
    if (tool === 'laser') {
      setIsLaserDown(false);
      return;
    }

    if (tool === 'eraser' && eraserMode === 'lasso') {
      // Lasso logic: Find strokes inside the polygon
      saveHistory(); // Save state before deletion

      // Simple bounding box check first for performance
      const xs = lassoPoints.map(p => p.x);
      const ys = lassoPoints.map(p => p.y);

      const newStrokes = strokes.filter(stroke => {
        // Check if any point of the stroke is inside the lasso polygon
        // Sampling points to avoid checking every single pixel
        const pointsToCheck = stroke.points.filter((_, i) => i % 5 === 0);
        if (pointsToCheck.length === 0 && stroke.points.length > 0) pointsToCheck.push(stroke.points[0]);

        // Let's check if at least one point is inside
        return !pointsToCheck.some(p => isPointInPolygon(p, lassoPoints));
      });

      setStrokes(newStrokes);
      setLassoPoints([]);
      setIsDrawing(false);
      return;
    }

    if (activeStroke) {
      // Commit the stroke to the global store
      // For shapes, activeStroke state has the points. For freehand, use Ref.
      const finalPoints = ['pen', 'highlighter', 'eraser'].includes(tool)
        ? currentPointsRef.current
        : activeStroke.points;

      if (finalPoints.length > 0) {
        saveHistory();
        const finalStroke = { ...activeStroke, points: finalPoints, isComplete: true };
        addStroke(finalStroke);
        onStrokeAdd?.(finalStroke);
      }

      // Reset local drawing state
      setActiveStroke(null);
      currentPointsRef.current = [];
    }

    setIsDrawing(false);
    setCurrentStrokeId(null);
  };

  const highlighterStrokes = strokes.filter(s => s.tool === 'highlighter');
  const otherStrokes = strokes.filter(s => s.tool !== 'highlighter');

  // Determine current stroke tool for live rendering
  const isCurrentHighlighter = strokes.find(s => s.id === currentStrokeId)?.tool === 'highlighter';
  // Note: strokes already contains currentStroke (updated via updateStroke)
  // So we just rely on the filtered lists.

  // Eraser needs to be on both?
  // If we use standard eraser (destination-out), it only works on its own layer.
  // We need to render eraser strokes on BOTH layers if we are erasing.
  // But wait, our 'strokes' array contains the eraser strokes.
  // We should duplicate eraser strokes to both lists?
  // Actually, 'eraser' tool strokes are "destination-out".
  // So yes, filter:
  // Highlighters + Erasers -> Bottom Layer
  // Others + Erasers -> Top Layer

  const handleTextSubmit = () => {
    if (typingText.trim()) {
      saveHistory();
      const newStroke: Stroke = {
        id: uuidv4(),
        tool: 'text',
        points: [{ x: typingPosition.x, y: typingPosition.y }],
        color: color,
        size: size,
        text: typingText,
        isComplete: true,
        opacity: opacity
      };
      addStroke(newStroke);
      onStrokeAdd?.(newStroke);
    }
    setIsTyping(false);
    setTypingText('');
  };

  const bottomStrokes = strokes.filter(s => s.tool === 'highlighter' || s.tool === 'eraser');
  const topStrokes = strokes.filter(s => s.tool !== 'highlighter'); // Includes Eraser too

  return (
    <>
      {/* Text Input Overlay */}
      {isTyping && (
        <textarea
          value={typingText}
          onChange={(e) => setTypingText(e.target.value)}
          onBlur={handleTextSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleTextSubmit();
            }
          }}
          autoFocus
          className="fixed z-50 p-2 bg-transparent border border-blue-500 rounded outline-none resize-none overflow-hidden"
          style={{
            left: typingPosition.x,
            top: typingPosition.y,
            color: color,
            fontSize: `${size}px`,
            fontFamily: 'sans-serif',
            minWidth: '100px',
            minHeight: '40px'
          }}
          placeholder="Type here..."
        />
      )}

      {/* Highlighter Layer (Bottom, Blended) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Stage width={width} height={height}>
          <Layer>
            {bottomStrokes.map((stroke) => {
              // Render logic duplicated or shared?
              // Let's reuse the existing map block but inside this Layer.
              // We will just copy the map function body.
              // Ideally we extract a component <StrokeRenderer stroke={stroke} />
              if (stroke.tool !== 'highlighter' && stroke.tool !== 'eraser') return null;

              // Render Highlighters and Erasers
              if (stroke.tool === 'highlighter' || stroke.tool === 'eraser') {
                const outlinePoints = getStroke(stroke.points, {
                  size: stroke.size,
                  thinning: stroke.tool === 'highlighter' ? 0 : 0.5,
                  smoothing: 0.9,
                  streamline: 0.85,
                  easing: (t) => t,
                  start: { cap: stroke.tool === 'highlighter', taper: stroke.tool === 'highlighter' ? 0 : undefined },
                  end: { cap: stroke.tool === 'highlighter', taper: stroke.tool === 'highlighter' ? 0 : undefined }
                });
                const pathData = getSvgPathFromStroke(outlinePoints);
                return (
                  <Path
                    key={stroke.id}
                    data={pathData}
                    fill={stroke.tool === 'eraser' ? undefined : stroke.color}
                    stroke={stroke.tool === 'eraser' ? '#000000' : undefined}
                    strokeWidth={stroke.tool === 'eraser' ? stroke.size : 0}
                    globalCompositeOperation={stroke.tool === 'eraser' ? 'destination-out' : 'source-over'}
                    opacity={stroke.tool === 'highlighter' ? 0.5 : 1}
                    lineCap={stroke.tool === 'highlighter' ? 'square' : 'round'}
                    lineJoin={stroke.tool === 'highlighter' ? 'bevel' : 'round'}
                  />
                );
              }
              return null;
            })}

            {/* Active Imperative Highlighter (Bottom Layer) */}
            {activeStroke && activeStroke.tool === 'highlighter' && (
              <Path
                ref={activePathRef}
                opacity={0.5}
                lineCap="square"
                lineJoin="bevel"
                fill={activeStroke.color}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Laser Layer */}
      {tool === 'laser' && laserPoints.length > 0 && (
        <Stage width={width} height={height} className="absolute inset-0 z-50 pointer-events-none">
          <Layer>
            {/* Highlight Effect (Flashlight/Glow) */}
            {laserConfig.highlight && laserPoints.length > 0 && (
              <Circle
                x={laserPoints[laserPoints.length - 1].x}
                y={laserPoints[laserPoints.length - 1].y}
                radius={laserConfig.size * 4}
                fill={laserConfig.color}
                opacity={0.2}
                shadowColor={laserConfig.color}
                shadowBlur={40}
              />
            )}

            {/* Trail */}
            {laserConfig.mode === 'trail' && laserPoints.length > 1 && (() => {
              const outlinePoints = getStroke(laserPoints, {
                size: laserConfig.highlight ? laserConfig.size * 2 : laserConfig.size,
                thinning: 0.7,
                smoothing: 0.5,
                streamline: 0.6,
                start: { taper: true },
                end: { taper: false }
              });
              const pathData = getSvgPathFromStroke(outlinePoints);
              return (
                <Path
                  data={pathData}
                  fill={laserConfig.color}
                  opacity={laserConfig.highlight ? 0.4 : laserConfig.opacity}
                  shadowColor={laserConfig.glow ? laserConfig.color : undefined}
                  shadowBlur={laserConfig.glow ? 15 : 0}
                  globalCompositeOperation={laserConfig.highlight ? 'screen' : 'source-over'}
                />
              );
            })()}

            {/* Trail - White Core for Burn Effect */}
            {laserConfig.mode === 'trail' && laserConfig.effect === 'white-burn' && !laserConfig.highlight && laserPoints.length > 1 && (() => {
              const outlinePoints = getStroke(laserPoints, {
                size: laserConfig.size * 0.4,
                thinning: 0.7,
                smoothing: 0.5,
                streamline: 0.6,
                start: { taper: true },
                end: { taper: false }
              });
              const pathData = getSvgPathFromStroke(outlinePoints);
              return (
                <Path
                  data={pathData}
                  fill="#ffffff"
                  opacity={laserConfig.opacity}
                  shadowBlur={0}
                />
              );
            })()}

            {/* Pointer Head */}
            {laserPoints.length > 0 && (
              <Circle
                x={laserPoints[laserPoints.length - 1].x}
                y={laserPoints[laserPoints.length - 1].y}
                radius={laserConfig.size * 1.5}
                fill={laserConfig.color}
                shadowColor={laserConfig.glow ? laserConfig.color : undefined}
                shadowBlur={laserConfig.glow ? 20 : 0}
                shadowOpacity={1}
                opacity={laserConfig.highlight ? 0.5 : 1}
              />
            )}

            {/* Effect: White Burn Center */}
            {laserConfig.effect === 'white-burn' && !laserConfig.highlight && laserPoints.length > 0 && (
              <Circle
                x={laserPoints[laserPoints.length - 1].x}
                y={laserPoints[laserPoints.length - 1].y}
                radius={laserConfig.size * 0.5}
                fill="#ffffff"
                shadowColor="#ffffff"
                shadowBlur={5}
              />
            )}
          </Layer>
        </Stage>
      )}

      {/* Main Layer (Top, Normal) */}
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onContextMenu={(e) => e.evt.preventDefault()}
        className="absolute inset-0 z-20 pointer-events-auto"
      >
        <Layer>
          {/* Transformer */}
          <Transformer ref={transformerRef} />

          {/* Lasso Eraser Trace */}
          {tool === 'eraser' && eraserMode === 'lasso' && lassoPoints.length > 0 && (
            <Line
              points={lassoPoints.flatMap(p => [p.x, p.y])}
              stroke="#3b82f6"
              strokeWidth={2}
              dash={[5, 5]}
              closed
              fill="rgba(59, 130, 246, 0.1)"
            />
          )}

          {topStrokes.map((stroke, i) => {
            // Same rendering logic
            if (stroke.tool === 'pen' || stroke.tool === 'highlighter' || stroke.tool === 'eraser') {
              const outlinePoints = getStroke(stroke.points, {
                size: stroke.size,
                thinning: stroke.tool === 'highlighter' ? 0 : 0.5,
                smoothing: 0.9,
                streamline: 0.85,
                easing: (t) => t,
                start: { cap: true, taper: stroke.tool === 'pen' ? 0 : undefined },
                end: { cap: true, taper: stroke.tool === 'pen' ? 0 : undefined }
              });
              const pathData = getSvgPathFromStroke(outlinePoints);

              return (
                <Path
                  key={stroke.id}
                  data={pathData}
                  fill={stroke.tool === 'eraser' ? undefined : stroke.color}
                  stroke={stroke.tool === 'eraser' ? '#000000' : undefined}
                  strokeWidth={stroke.tool === 'eraser' ? stroke.size : 0}
                  globalCompositeOperation={stroke.tool === 'eraser' ? 'destination-out' : 'source-over'}
                  opacity={stroke.tool === 'highlighter' ? 0.5 : 1}
                  lineCap={stroke.tool === 'highlighter' ? 'square' : 'round'}
                  lineJoin={stroke.tool === 'highlighter' ? 'bevel' : 'round'}
                />
              );
            }

            // Shapes
            const start = stroke.points[0];
            const end = stroke.points[stroke.points.length - 1];
            if (!start || !end) return null;

            if (stroke.tool === 'line') {
              return (
                <Line
                  key={stroke.id}
                  points={[start.x, start.y, end.x, end.y]}
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  dash={getDashArray(stroke.borderStyle)}
                  opacity={stroke.opacity}
                  lineCap="round"
                  lineJoin="round"
                />
              );
            }
            // ... other shapes ...
            // Copy-paste remaining shapes logic from original file below
            if (stroke.tool === 'arrow') {
              return (
                <Arrow
                  key={stroke.id}
                  points={[start.x, start.y, end.x, end.y]}
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  fill={stroke.fill || stroke.color}
                  dash={getDashArray(stroke.borderStyle)}
                  opacity={stroke.opacity}
                  pointerLength={stroke.size * 2}
                  pointerWidth={stroke.size * 2}
                />
              );
            }
            if (stroke.tool === 'rectangle') {
              return (
                <Rect
                  key={stroke.id}
                  x={Math.min(start.x, end.x)}
                  y={Math.min(start.y, end.y)}
                  width={Math.abs(end.x - start.x)}
                  height={Math.abs(end.y - start.y)}
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  fill={stroke.fill}
                  dash={getDashArray(stroke.borderStyle)}
                  opacity={stroke.opacity}
                />
              );
            }
            if (stroke.tool === 'circle') {
              const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
              return (
                <Circle
                  key={stroke.id}
                  x={start.x}
                  y={start.y}
                  radius={radius}
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  fill={stroke.fill}
                  dash={getDashArray(stroke.borderStyle)}
                  opacity={stroke.opacity}
                />
              );
            }
            if (stroke.tool === 'triangle') {
              const width = end.x - start.x;
              const height = end.y - start.y;
              return (
                <Line
                  key={stroke.id}
                  points={[
                    start.x + width / 2, start.y,
                    start.x, start.y + height,
                    start.x + width, start.y + height
                  ]}
                  closed
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  fill={stroke.fill}
                  dash={getDashArray(stroke.borderStyle)}
                  opacity={stroke.opacity}
                />
              );
            }
            if (stroke.tool === 'star') {
              const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
              return (
                <RegularPolygon
                  key={stroke.id}
                  x={start.x}
                  y={start.y}
                  sides={5}
                  radius={radius}
                  innerRadius={radius / 2.5}
                  stroke={stroke.color}
                  strokeWidth={stroke.size}
                  fill={stroke.fill}
                  dash={getDashArray(stroke.borderStyle)}
                  opacity={stroke.opacity}
                  rotation={0}
                />
              );
            }
            if (stroke.tool === 'text' && stroke.text) {
              return (
                <Text
                  id={stroke.id}
                  key={stroke.id}
                  x={stroke.x || stroke.points[0].x}
                  y={stroke.y || stroke.points[0].y}
                  text={stroke.text}
                  fontSize={stroke.size}
                  fill={stroke.color}
                  opacity={stroke.opacity}
                  fontFamily="sans-serif"
                  draggable={tool === 'cursor'}
                  onClick={() => {
                    if (tool === 'cursor') setSelectedId(stroke.id);
                  }}
                  onTap={() => {
                    if (tool === 'cursor') setSelectedId(stroke.id);
                  }}
                  onDragEnd={(e) => {
                    const updates = {
                      x: e.target.x(),
                      y: e.target.y()
                    };
                    updateStroke(stroke.id, updates);
                    onStrokeUpdate?.(stroke.id, updates);
                  }}
                />
              );
            }

            if (stroke.tool === 'image' && stroke.imageUrl) {
              return (
                <UrlImage
                  key={stroke.id}
                  stroke={stroke}
                  isSelected={selectedId === stroke.id}
                  draggable={tool === 'cursor'}
                  onSelect={() => {
                    if (tool === 'cursor') setSelectedId(stroke.id);
                  }}
                  onChange={(newAttrs: any) => {
                    updateStroke(stroke.id, newAttrs);
                    onStrokeUpdate?.(stroke.id, newAttrs);
                  }}
                />
              );
            }
            return null;
          })}

          {/* Active Imperative Pen/Eraser (Top Layer) */}
          {activeStroke && (activeStroke.tool === 'pen' || activeStroke.tool === 'eraser') && (
            <Path
              ref={activePathRef}
              fill={activeStroke.tool === 'eraser' ? undefined : activeStroke.color}
              stroke={activeStroke.tool === 'eraser' ? '#000000' : undefined}
              strokeWidth={activeStroke.tool === 'eraser' ? activeStroke.size : 0}
              globalCompositeOperation={activeStroke.tool === 'eraser' ? 'destination-out' : 'source-over'}
              lineCap="round"
              lineJoin="round"
              listening={false}
            />
          )}

          {/* Active Shape Rendering (Standard React State) */}
          {activeStroke && ['rectangle', 'circle', 'triangle', 'star', 'arrow', 'line'].includes(activeStroke.tool) && (() => {
            const start = activeStroke.points[0];
            const end = activeStroke.points[activeStroke.points.length - 1];
            if (!start || !end) return null;

            if (activeStroke.tool === 'line') return <Line points={[start.x, start.y, end.x, end.y]} stroke={activeStroke.color} strokeWidth={activeStroke.size} dash={getDashArray(activeStroke.borderStyle)} opacity={activeStroke.opacity} lineCap="round" lineJoin="round" />;
            if (activeStroke.tool === 'arrow') return <Arrow points={[start.x, start.y, end.x, end.y]} stroke={activeStroke.color} strokeWidth={activeStroke.size} fill={activeStroke.fill || activeStroke.color} dash={getDashArray(activeStroke.borderStyle)} opacity={activeStroke.opacity} pointerLength={activeStroke.size * 2} pointerWidth={activeStroke.size * 2} />;
            if (activeStroke.tool === 'rectangle') return <Rect x={Math.min(start.x, end.x)} y={Math.min(start.y, end.y)} width={Math.abs(end.x - start.x)} height={Math.abs(end.y - start.y)} stroke={activeStroke.color} strokeWidth={activeStroke.size} fill={activeStroke.fill} dash={getDashArray(activeStroke.borderStyle)} opacity={activeStroke.opacity} />;
            if (activeStroke.tool === 'circle') return <Circle x={start.x} y={start.y} radius={Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))} stroke={activeStroke.color} strokeWidth={activeStroke.size} fill={activeStroke.fill} dash={getDashArray(activeStroke.borderStyle)} opacity={activeStroke.opacity} />;
            if (activeStroke.tool === 'triangle') return <Line points={[start.x + (end.x - start.x) / 2, start.y, start.x, start.y + (end.y - start.y), start.x + (end.x - start.x), start.y + (end.y - start.y)]} closed stroke={activeStroke.color} strokeWidth={activeStroke.size} fill={activeStroke.fill} dash={getDashArray(activeStroke.borderStyle)} opacity={activeStroke.opacity} />;
            if (activeStroke.tool === 'star') return <RegularPolygon x={start.x} y={start.y} sides={5} radius={Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))} innerRadius={Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2.5} stroke={activeStroke.color} strokeWidth={activeStroke.size} fill={activeStroke.fill} dash={getDashArray(activeStroke.borderStyle)} opacity={activeStroke.opacity} />;
            return null;
          })()}
        </Layer>
      </Stage>
    </>
  );
};
