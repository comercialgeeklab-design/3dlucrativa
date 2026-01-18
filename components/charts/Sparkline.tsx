"use client";

import React from "react";

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color = "#7c3aed",
  fillOpacity = 0.2,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
}) {
  if (!data || data.length === 0) {
    return <div style={{ width, height }} />;
  }

  const max = Math.max(...data, 0);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (width * i) / (data.length - 1 || 1);
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const pathD = data
    .map((v, i) => {
      const x = (width * i) / (data.length - 1 || 1);
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const fillPath = `${pathD} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} className="inline-block">
      <path d={fillPath} fill={color} opacity={fillOpacity} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
