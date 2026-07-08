import { useId } from 'react';

// Ambient signature element — a quiet pulse under each form card's count,
// always showing the last 30 days regardless of the selected filter.
// No axes, no dots, no tooltip: shape only, in the dashboard's navy.
export function Sparkline({ data, width = 96, height = 36 }) {
  const gradientId = `sparkline-gradient-${useId().replace(/:/g, '')}`;

  if (!data || data.length < 2 || data.every((d) => d.signups === 0)) {
    return (
      <svg width={width} height={height} className="overflow-visible" aria-hidden="true">
        <line
          x1={0}
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke="var(--border)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const values = data.map((d) => d.signups);
  const max = Math.max(...values, 1);
  const min = 0;
  const range = max - min || 1;
  const padding = 2;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = padding + (height - padding * 2) * (1 - (v - min) / range);
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
