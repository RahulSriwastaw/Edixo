import React from 'react';
import { Stage, Layer, Path, Line, Rect, Circle, RegularPolygon, Arrow } from 'react-konva';
import { getStroke } from 'perfect-freehand';
import { getSvgPathFromStroke } from './utils/getSvgPathFromStroke';
import { Stroke } from './types';

interface ReadOnlyCanvasProps {
  width: number;
  height: number;
  strokes: Stroke[];
  opacity?: number;
}

export const ReadOnlyCanvas: React.FC<ReadOnlyCanvasProps> = ({ width, height, strokes, opacity = 1 }) => {
  const bottomStrokes = strokes.filter(s => s.tool === 'highlighter' || s.tool === 'eraser');
  const topStrokes = strokes.filter(s => s.tool !== 'highlighter');

  return (
    <>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Stage width={width} height={height} opacity={1}>
          <Layer>
            {bottomStrokes.map((stroke) => {
               if (stroke.tool === 'pen' || stroke.tool === 'highlighter' || stroke.tool === 'eraser') {
                const outlinePoints = getStroke(stroke.points, {
                  size: stroke.size,
                  thinning: stroke.tool === 'highlighter' ? 0 : 0.5,
                  smoothing: 0.5,
                  streamline: 0.5,
                  start: {
                    cap: stroke.tool === 'highlighter',
                    taper: stroke.tool === 'highlighter' ? 0 : undefined
                  },
                  end: {
                    cap: stroke.tool === 'highlighter',
                    taper: stroke.tool === 'highlighter' ? 0 : undefined
                  }
                });
                const pathData = getSvgPathFromStroke(outlinePoints);
                
                return (
                   <Path
                     key={stroke.id}
                     data={pathData}
                     fill={stroke.tool === 'eraser' ? undefined : stroke.color}
                     stroke={stroke.tool === 'eraser' ? '#000000' : undefined}
                     strokeWidth={stroke.tool === 'eraser' ? stroke.size : 0}
                     globalCompositeOperation={
                       stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                     }
                     opacity={stroke.tool === 'highlighter' ? 0.5 : 1}
                     lineCap={stroke.tool === 'highlighter' ? 'square' : 'round'}
                     lineJoin={stroke.tool === 'highlighter' ? 'bevel' : 'round'}
                   />
                 );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>

      <Stage width={width} height={height} className="absolute inset-0 z-20 pointer-events-none" opacity={opacity}>
        <Layer>
          {topStrokes.map((stroke) => {
            if (stroke.tool === 'pen' || stroke.tool === 'highlighter' || stroke.tool === 'eraser') {
              const outlinePoints = getStroke(stroke.points, {
                size: stroke.size,
                thinning: stroke.tool === 'highlighter' ? 0 : 0.5,
                smoothing: 0.5,
                streamline: 0.5,
                start: {
                  cap: stroke.tool === 'highlighter',
                  taper: stroke.tool === 'highlighter' ? 0 : undefined
                },
                end: {
                  cap: stroke.tool === 'highlighter',
                  taper: stroke.tool === 'highlighter' ? 0 : undefined
                }
              });
              const pathData = getSvgPathFromStroke(outlinePoints);
              
              return (
                <Path
                  key={stroke.id}
                  data={pathData}
                  fill={stroke.tool === 'eraser' ? undefined : stroke.color}
                  stroke={stroke.tool === 'eraser' ? '#000000' : undefined}
                  strokeWidth={stroke.tool === 'eraser' ? stroke.size : 0}
                  globalCompositeOperation={
                    stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                  opacity={stroke.tool === 'highlighter' ? 0.5 : 1}
                  lineCap={stroke.tool === 'highlighter' ? 'square' : 'round'}
                  lineJoin={stroke.tool === 'highlighter' ? 'bevel' : 'round'}
                />
              );
            }

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
                  lineCap="round"
                  lineJoin="round"
                />
              );
            }

            if (stroke.tool === 'arrow') {
               return (
                  <Arrow
                      key={stroke.id}
                      points={[start.x, start.y, end.x, end.y]}
                      stroke={stroke.color}
                      strokeWidth={stroke.size}
                      fill={stroke.color}
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
                      rotation={0}
                  />
               );
            }

            return null;
          })}
        </Layer>
      </Stage>
    </>
  );
};
