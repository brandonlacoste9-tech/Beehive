// app/components/Sparkline.tsx
"use client";
import React from "react";

type Props = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  className?: string;
};

export default function Sparkline({
  values,
  width = 160,
  height = 48,
  stroke = "#10B981",
  fill = "rgba(16,185,129,0.12)",
  strokeWidth = 2,
  className,
}: Props) {
  if (!values || values.length < 2) return <svg width={width} height={height} />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = values.length;

  const points = values.map((v, i) => {
    const x = (i / (n - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const [lastX, lastY] = points[n - 1].split(",").map(Number);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ overflow: "visible" }}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.9" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
        </linearGradient>

        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feBlend in="SourceGraphic" in2="b" />
        </filter>
      </defs>

      <path d={areaD} fill="url(#spark-fill)" stroke="none" />

      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "all 600ms ease" }}
      />

      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.14}
        filter="url(#blur)"
      />

      <circle cx={lastX} cy={lastY} r={3.5} fill={stroke} stroke="white" strokeWidth={0.8} />
    </svg>
  );
}
