'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretDown } from '@phosphor-icons/react';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { FormStats } from '@/components/FormStats';
import { TrendChart } from '@/components/TrendChart';
import { HistoryTable } from '@/components/HistoryTable';
import { SubscriberOverview } from '@/components/SubscriberOverview';
import { DateRangeFilter, presetToRange } from '@/components/DateRangeFilter';
import { ErrorBlock } from '@/components/ErrorBlock';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveStatusDot } from '@/components/LiveStatusDot';
import { getFormConfig } from '@/config/sites';

function formatTimestamp(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function DashboardPage() {
  const [selectedForm, setSelectedForm] = useState(null);
  const [activePreset, setActivePreset] = useState('all-time');
  const [dateRange, setDateRange] = useState(() => presetToRange('all-time'));

  // Overview trend switcher state
  const [selectedTrendForm, setSelectedTrendForm] = useState('all');
  const [showTrendDropdown, setShowTrendDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Overview grid: date-filtered sign-up counts per form, driven by the
  // same date filter as the detail view.
  const [totalsData, setTotalsData] = useState(null);
  const [totalsLoading, setTotalsLoading] = useState(true);
  const [totalsError, setTotalsError] = useState(false);

  // Detail view's navy card: all-time total, independent of any date filter
  // (unchanged behavior — only Overview's grid became date-filtered).
  const [allTimeTotalsData, setAllTimeTotalsData] = useState(null);

  // Detail view: date-filtered stats for whichever form is selected.
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const totalsRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  const fetchTotals = useCallback(async (dateFrom, dateTo) => {
    const requestId = ++totalsRequestIdRef.current;
    setTotalsLoading(true);
    setTotalsError(false);

    try {
      const params = new URLSearchParams({ dateFrom, dateTo });
      const res = await fetch(`/api/stats?${params.toString()}`);
      const json = await res.json();

      if (requestId !== totalsRequestIdRef.current) return;

      if (!res.ok) {
        setTotalsError(true);
        setTotalsLoading(false);
        return;
      }

      setTotalsData(json);

      const allFailed =
        json.forms.length > 0 && json.errors && json.errors.length === json.forms.length;
      setTotalsError(allFailed);
    } catch (err) {
      if (requestId !== totalsRequestIdRef.current) return;
      setTotalsError(true);
    } finally {
      if (requestId === totalsRequestIdRef.current) {
        setTotalsLoading(false);
      }
    }
  }, []);

  const fetchDetail = useCallback(async (formId, dateFrom, dateTo) => {
    const requestId = ++detailRequestIdRef.current;
    setDetailLoading(true);
    setDetailError(false);

    try {
      const params = new URLSearchParams({ formId, dateFrom, dateTo });
      const res = await fetch(`/api/stats?${params.toString()}`);
      const json = await res.json();

      // Race guard: discard stale responses if filters changed while this was in flight
      if (requestId !== detailRequestIdRef.current) return;

      if (!res.ok) {
        setDetailError(true);
        setDetailLoading(false);
        return;
      }

      setDetailData(json);

      const allFailed =
        json.forms.length > 0 && json.errors && json.errors.length === json.forms.length;
      setDetailError(allFailed);
    } catch (err) {
      if (requestId !== detailRequestIdRef.current) return;
      setDetailError(true);
    } finally {
      if (requestId === detailRequestIdRef.current) {
        setDetailLoading(false);
      }
    }
  }, []);

  // Overview totals re-fetch whenever the date filter changes.
  useEffect(() => {
    if (!selectedForm) {
      fetchTotals(dateRange.dateFrom, dateRange.dateTo);
    }
  }, [selectedForm, dateRange, fetchTotals]);

  // All-time totals for the detail view's navy card — fetched once, never
  // affected by the date filter.
  useEffect(() => {
    fetch('/api/stats/totals')
      .then((res) => res.json())
      .then(setAllTimeTotalsData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedForm) {
      fetchDetail(selectedForm, dateRange.dateFrom, dateRange.dateTo);
    }
  }, [selectedForm, dateRange, fetchDetail]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTrendDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Switching forms (or returning to Overview) resets the date filter to
  // the default range — a date picked while viewing one form must never
  // carry over and silently apply to a different form.
  function handleSelectForm(formId) {
    setSelectedForm(formId);
    setActivePreset('month');
    setDateRange(presetToRange('month'));
  }

  function handlePresetSelect(presetKey) {
    setActivePreset(presetKey);
    setDateRange(presetToRange(presetKey));
  }

  function handleCustomRange(dateFrom, dateTo) {
    setActivePreset(null);
    setDateRange({ dateFrom, dateTo });
  }

  function handleRetry() {
    if (selectedForm) {
      fetchDetail(selectedForm, dateRange.dateFrom, dateRange.dateTo);
    } else {
      fetchTotals(dateRange.dateFrom, dateRange.dateTo);
    }
  }

  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const totalsForms = totalsData?.forms || [];
  const totalsWithErrors = totalsData?.errors || [];
  const enrichedTotals = totalsForms.map((f) => ({
    ...f,
    error: totalsWithErrors.includes(f.formId) ? 'Unavailable' : null,
  }));

  const getAggregatedDailyData = useCallback(() => {
    if (!totalsForms || totalsForms.length === 0) return [];
    const dateMap = {};
    totalsForms.forEach((form) => {
      const dailyStats = form.daily || [];
      dailyStats.forEach(({ date, signups }) => {
        if (!dateMap[date]) {
          dateMap[date] = 0;
        }
        dateMap[date] += signups;
      });
    });
    return Object.entries(dateMap)
      .map(([date, signups]) => ({ date, signups }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [totalsForms]);

  const trendDailyData = selectedTrendForm === 'all'
    ? getAggregatedDailyData()
    : (totalsForms.find((f) => f.formId === selectedTrendForm)?.daily || []);

  const detailForms = detailData?.forms || [];
  const selectedFormData = selectedForm ? detailForms.find((f) => f.formId === selectedForm) : null;
  const allTimeTotalsForms = allTimeTotalsData?.forms || [];
  const selectedFormTotal = selectedForm
    ? allTimeTotalsForms.find((f) => f.formId === selectedForm)
    : null;
  const pageTitle = selectedForm ? getFormConfig(selectedForm).formName : 'Overview';

  const loading = selectedForm ? detailLoading : totalsLoading;
  const error = selectedForm ? detailError : totalsError;
  const lastUpdated = selectedForm ? detailData?.fetchedAt : totalsData?.fetchedAt;

  return (
    <AppShell sidebar={<AppSidebar selectedForm={selectedForm} onSelectForm={handleSelectForm} />}>
      <AppHeader
        pageTitle={selectedForm ? pageTitle : undefined}
        activePreset={activePreset}
        onPresetSelect={handlePresetSelect}
        dateFrom={dateRange.dateFrom}
        dateTo={dateRange.dateTo}
        onCustomRange={handleCustomRange}
        showDateFilter
        hideDateFilterOnMobile={Boolean(selectedForm)}
      />

      {!selectedForm && (
        <div className="mb-4 flex flex-col gap-1">
          <h1 className="font-bold text-2xl text-foreground">Overview</h1>
          <p className="text-muted-foreground text-sm">
            Downloads across every form for the selected period.
          </p>
        </div>
      )}

      {!loading && lastUpdated && (
        <div className="flex justify-start md:justify-end">
          <LiveStatusDot lastUpdated={formatTimestamp(lastUpdated)} />
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {!loading && error && <ErrorBlock onRetry={handleRetry} />}

      {!loading && !error && !selectedForm && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormStats forms={enrichedTotals} onSelectForm={handleSelectForm} />
          </div>

          <Card className="shadow-soft-lift rounded-2xl border border-hairline bg-canvas">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-ink">Performance Trend</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedTrendForm === 'all'
                      ? 'Aggregated downloads stats for the selected period'
                      : `Downloads stats for ${totalsForms.find((f) => f.formId === selectedTrendForm)?.formName || ''}`}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-canvas-subtle border border-hairline px-2 py-0.5 rounded-md">
                    {formatDate(dateRange.dateFrom)} – {formatDate(dateRange.dateTo)}
                  </span>
                </div>
              </div>

              {/* Selector dropdown menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowTrendDropdown(!showTrendDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-hairline rounded-xl bg-canvas text-xs font-semibold text-body hover:border-hairline-strong transition-all duration-150 cursor-pointer shadow-soft-lift"
                >
                  <span>
                    {selectedTrendForm === 'all'
                      ? 'All Forms'
                      : totalsForms.find((f) => f.formId === selectedTrendForm)?.formName || 'Select Form'}
                  </span>
                  <CaretDown size={14} className="text-muted-foreground" />
                </button>

                {showTrendDropdown && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-canvas border border-hairline rounded-xl shadow-xl z-50 overflow-hidden py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrendForm('all');
                        setShowTrendDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-canvas-subtle transition-colors cursor-pointer ${
                        selectedTrendForm === 'all' ? 'text-primary bg-primary-tint-10/40' : 'text-body'
                      }`}
                    >
                      All Forms
                    </button>
                    {totalsForms.map((form) => (
                      <button
                        key={form.formId}
                        type="button"
                        onClick={() => {
                          setSelectedTrendForm(form.formId);
                          setShowTrendDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-canvas-subtle transition-colors cursor-pointer ${
                          selectedTrendForm === form.formId ? 'text-primary bg-primary-tint-10/40' : 'text-body'
                        }`}
                      >
                        {form.formName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <TrendChart
                daily={trendDailyData}
                dateFrom={dateRange.dateFrom}
                dateTo={dateRange.dateTo}
              />
            </CardContent>
          </Card>

          <HistoryTable daily={trendDailyData} />
        </div>
      )}

      {!loading && !error && selectedForm && selectedFormData && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSelectForm(null)}
            className="flex w-fit items-center gap-1.5 rounded-sm text-primary text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <CaretLeft size={16} aria-hidden="true" />
            Back to overview
          </button>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="bg-primary text-primary-foreground shadow-soft-lift rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="font-normal text-primary-foreground/70 text-xs">
                  {selectedFormData.websiteName}
                </CardTitle>
                <p className="font-semibold text-primary-foreground text-sm">Total Downloads (All-Time)</p>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl text-[color:var(--color-secondary)] tabular-nums tracking-tight">
                  {selectedFormTotal?.total ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-canvas border border-hairline text-ink shadow-soft-lift rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="font-normal text-muted-foreground text-xs">
                  {selectedFormData.websiteName}
                </CardTitle>
                <p className="font-semibold text-body text-sm">Downloads in Period</p>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-3xl text-primary tabular-nums tracking-tight">
                  {selectedFormData.signups ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <DateRangeFilter
            activePreset={activePreset}
            dateFrom={dateRange.dateFrom}
            dateTo={dateRange.dateTo}
            onCustomRange={handleCustomRange}
            onPresetSelect={handlePresetSelect}
            className="w-full md:hidden"
          />

          <Card>
            <CardHeader>
              <CardTitle>Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart
                daily={selectedFormData.daily || []}
                dateFrom={dateRange.dateFrom}
                dateTo={dateRange.dateTo}
              />
            </CardContent>
          </Card>

          <SubscriberOverview
            formId={selectedForm}
            formName={selectedFormData.formName}
            websiteName={selectedFormData.websiteName}
          />

          <HistoryTable daily={selectedFormData.daily || []} />
        </div>
      )}
    </AppShell>
  );
}
