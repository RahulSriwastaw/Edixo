import { useState, useRef, useEffect } from 'react';

export function useDraggable(initialPosition = { x: 0, y: 0 }, onDragEnd?: (pos: {x:number, y:number}) => void) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // Sync with external state if provided
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    
    // Prevent dragging if clicking interactive elements
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault(); // Prevent text selection
    
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const newPos = {
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y
    };
    
    setPosition(newPos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
        setIsDragging(false);
        try {
          (e.target as Element).releasePointerCapture(e.pointerId);
        } catch (e) {
            // Ignore if not captured
        }
        if (onDragEnd) onDragEnd(position);
    }
  };

  return {
    position,
    isDragging,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp
    }
  };
}
