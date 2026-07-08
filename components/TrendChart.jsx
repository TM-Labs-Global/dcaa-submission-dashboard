'use client';

import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { bucketDailyData } from '@/lib/chartBucketing';
import { formatChartTooltipDate } from '@/components/formater';

const chartConfig = {
  signups: {
    label: 'Sign-ups',
    color: 'var(--chart-1)',
  },
};

export function TrendChart({ daily, dateFrom, dateTo }) {
  const chartUid = useId().replace(/:/g, '');
  const gradientId = `trend-area-grad-${chartUid}`;
  const { points, granularity } = bucketDailyData(daily, dateFrom, dateTo);

  if (points.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-muted-foreground text-sm">
        No sign-ups in this period. Try a wider date range.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <AreaChart data={points} margin={{ left: 12, right: 12, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-signups)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-signups)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="2 2" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) => {
                const label = payload?.[0]?.payload?.label;
                if (!label) return '';
                return granularity === 'daily' ? formatChartTooltipDate(label) : label;
              }}
            />
          }
        />
        <Area
          dataKey="signups"
          dot={false}
          fill={`url(#${gradientId})`}
          stroke="var(--color-signups)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}
