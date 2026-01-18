"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type SeriesDef = { key: string; label: string; color?: string };

export function LineChart({
  data,
  series,
  height = 240,
  colors = [
    "#7c3aed",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#a855f7",
  ],
}: {
  data: Array<Record<string, any>> & Array<{ x: string | number }>;
  series: SeriesDef[];
  height?: number;
  colors?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState<number>(600);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => setWidth(el.clientWidth || 600);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padding = { top: 16, right: 16, bottom: 28, left: 42 };
  const innerW = Math.max(100, width - padding.left - padding.right);
  const innerH = Math.max(60, height - padding.top - padding.bottom);

  const xValues = data.map((d) => d.x);
  const yMax = useMemo(() => {
    let max = 0;
    for (const d of data) {
      for (let i = 0; i < series.length; i++) {
        const key = series[i].key;
        const v = Number(d[key] || 0);
        if (v > max) max = v;
      }
    }
    return max || 1;
  }, [data, series]);

  const xScale = (idx: number) => (innerW * idx) / Math.max(1, data.length - 1);
  const yScale = (v: number) => innerH - (innerH * v) / yMax;

  const palette = (i: number) => series[i].color || colors[i % colors.length];

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={width} height={height} role="img">
        {/* axes */}
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* hover capture */}
          <rect
            x={0}
            y={0}
            width={innerW}
            height={innerH}
            fill="transparent"
            onMouseMove={(e) => {
              const rect = svgRef.current?.getBoundingClientRect();
              if (!rect) return;
              const px = e.clientX - rect.left - padding.left;
              const clamped = Math.max(0, Math.min(innerW, px));
              const idx = Math.round((clamped * (data.length - 1)) / innerW);
              setHoverIdx(isFinite(idx) ? idx : null);
            }}
            onMouseLeave={() => setHoverIdx(null)}
          />
          {/* grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line
              key={i}
              x1={0}
              x2={innerW}
              y1={innerH * t}
              y2={innerH * t}
              stroke="currentColor"
              strokeDasharray="4,4"
              className="text-gray-300 dark:text-gray-700"
            />
          ))}

          {/* lines */}
          {series.map((s, si) => {
            const path = data
              .map((d, i) => {
                const x = xScale(i);
                const y = yScale(Number(d[s.key] || 0));
                return `${i === 0 ? "M" : "L"}${x},${y}`;
              })
              .join(" ");
            return (
              <path
                key={s.key}
                d={path}
                fill="none"
                stroke={palette(si)}
                strokeWidth={2}
              />
            );
          })}

          {/* hover markers & guideline */}
          {hoverIdx !== null && data[hoverIdx] && (
            <g>
              {/* guideline */}
              <line
                x1={xScale(hoverIdx)}
                x2={xScale(hoverIdx)}
                y1={0}
                y2={innerH}
                stroke="#9ca3af"
                strokeDasharray="4,4"
              />
              {/* point markers */}
              {series.map((s, si) => (
                <circle
                  key={s.key}
                  cx={xScale(hoverIdx)}
                  cy={yScale(Number(data[hoverIdx][s.key] || 0))}
                  r={3}
                  fill={palette(si)}
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              ))}
              {/* tooltip */}
              <foreignObject
                x={Math.min(innerW - 180, Math.max(0, xScale(hoverIdx) + 8))}
                y={8}
                width={180}
                height={series.length * 20 + 40}
              >
                <div className="rounded-md bg-white/95 dark:bg-gray-900/95 shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700 text-xs">
                  <div className="font-semibold text-gray-800 dark:text-white mb-1">{String(data[hoverIdx].x)}</div>
                  {series.map((s, si) => {
                    const value = Number(data[hoverIdx][s.key] || 0);
                    const isCurrency = ['Bruto', 'Líquido', 'Comissão', 'Imposto'].includes(s.label);
                    const formatted = isCurrency 
                      ? `R$ ${value.toFixed(2)}`
                      : value % 1 === 0 ? value.toString() : value.toFixed(2);
                    return (
                      <div key={s.key} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span
                          style={{ background: palette(si), width: 10, height: 2 as any, display: 'inline-block' }}
                        />
                        <span>{s.label}:</span>
                        <span className="font-semibold">
                          {formatted}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </foreignObject>
            </g>
          )}

          {/* x labels */}
          {data.map((d, i) => (
            <g key={i} transform={`translate(${xScale(i)}, ${innerH + 14})`}>
              <text
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
                className="text-gray-600 dark:text-gray-400"
                style={{ userSelect: "none" }}
              >
                {String(d.x)}
              </text>
            </g>
          ))}

          {/* y labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i} transform={`translate(-8, ${innerH * (1 - t)})`}>
              <text
                textAnchor="end"
                fontSize={10}
                fill="currentColor"
                className="text-gray-600 dark:text-gray-400"
                style={{ userSelect: "none" }}
              >
                {Math.round(yMax * t)}
              </text>
            </g>
          ))}
        </g>

        {/* legend */}
        <g transform={`translate(${padding.left}, ${height - 6})`}>
          {series.map((s, i) => (
            <g key={s.key} transform={`translate(${i * 140}, 0)`}>
              <rect width={10} height={2} fill={palette(i)} />
              <text x={14} y={2} fontSize={11} fill="currentColor" className="text-gray-700 dark:text-gray-300">
                {s.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
