'use client';

import { useState } from 'react';
import { CalendarBlank, CaretDown } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const PRESETS = [
  { key: 'all-time', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
];

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(isoDate) {
  const date = new Date(isoDate + 'T00:00:00Z');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

export function presetToRange(presetKey) {
  const now = new Date();
  const dateTo = toISODate(now);
  let fromDate = new Date(now);

  switch (presetKey) {
    case 'all-time':
      fromDate = new Date('2000-01-01');
      break;
    case 'today':
      break;
    case 'week':
      fromDate.setDate(fromDate.getDate() - 6);
      break;
    case 'month':
      fromDate.setDate(1);
      break;
    case 'year':
      fromDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      break;
  }

  return { dateFrom: toISODate(fromDate), dateTo };
}

export function DateRangeFilter({ activePreset, onPresetSelect, dateFrom, dateTo, onCustomRange, className }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('presets'); // 'presets' | 'calendar'
  const [tempRange, setTempRange] = useState({ from: undefined, to: undefined });

  const activePresetLabel = PRESETS.find((p) => p.key === activePreset)?.label;

  function handlePresetClick(presetKey) {
    onPresetSelect(presetKey);
    setOpen(false);
  }

  function handleApplyCustomRange() {
    if (tempRange.from && tempRange.to) {
      onCustomRange(toISODate(tempRange.from), toISODate(tempRange.to));
      setOpen(false);
      setView('presets');
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setView('presets');
      }}
    >
      <PopoverTrigger
        className={`flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground min-h-[44px] sm:min-h-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className ?? ''}`}
      >
        <CalendarBlank size={16} className="text-muted-foreground" aria-hidden="true" />
        <span className="flex items-center gap-1.5">
          {activePresetLabel && (
            <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {activePresetLabel}
            </span>
          )}
          <span className="font-medium text-foreground">
            {formatDisplayDate(dateFrom)} – {formatDisplayDate(dateTo)}
          </span>
        </span>
        <CaretDown size={16} className="text-muted-foreground" aria-hidden="true" />
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        {view === 'presets' ? (
          <div className="flex flex-col min-w-[180px]">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePresetClick(preset.key)}
                className={`text-left px-3 py-2 text-sm font-medium transition first:rounded-t-md focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
                  activePreset === preset.key
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setView('calendar')}
              className="text-left px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-b-md border-t border-border flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
            >
              <CalendarBlank size={16} aria-hidden="true" />
              Custom range
            </button>
          </div>
        ) : (
          <div>
            <Calendar mode="range" selected={tempRange} onSelect={setTempRange} numberOfMonths={2} />
            <div className="p-2 border-t border-border flex justify-between items-center">
              <button
                onClick={() => setView('presets')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
              <Button
                onClick={handleApplyCustomRange}
                disabled={!tempRange.from || !tempRange.to}
              >
                Apply range
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
