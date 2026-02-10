import { useState, useRef, useEffect } from 'react';

type Direction = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 's' | 'w' | 'n';

export function useResizable(
  initialSize: { width: number, height: number }, 
  onResizeEnd?: (size: { width: number, height: number }) => void,
  minSize = { width: 300, height: 200 }
) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const activeHandle = useRef<Direction | null>(null);

  useEffect(() => {
    setSize(initialSize);
  }, [initialSize.width, initialSize.height]);

  const handlePointerDown = (e: React.PointerEvent, direction: Direction) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    activeHandle.current = direction;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...size };
    
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isResizing || !activeHandle.current) return;
    
    e.stopPropagation();
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    const direction = activeHandle.current;
    
    let newWidth = startSize.current.width;
    let newHeight = startSize.current.height;

    // Handle Width
    if (direction.includes('e')) {
        newWidth = startSize.current.width + deltaX;
    } else if (direction.includes('w')) {
        newWidth = startSize.current.width - deltaX;
        // Note: Changing width from left requires updating position too, 
        // but for simplicity in this implementation we'll just expand/shrink
        // A full implementation would also return position deltas
    }

    // Handle Height
    if (direction.includes('s')) {
        newHeight = startSize.current.height + deltaY;
    } else if (direction.includes('n')) {
        newHeight = startSize.current.height - deltaY;
    }

    // Apply constraints
    newWidth = Math.max(minSize.width, newWidth);
    newHeight = Math.max(minSize.height, newHeight);

    setSize({ width: newWidth, height: newHeight });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isResizing) {
        setIsResizing(false);
        activeHandle.current = null;
        try {
          (e.target as Element).releasePointerCapture(e.pointerId);
        } catch (e) {
            // Ignore
        }
        if (onResizeEnd) onResizeEnd(size);
    }
  };

  return {
    size,
    isResizing,
    resizeHandlers: {
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    initResize: handlePointerDown
  };
}
