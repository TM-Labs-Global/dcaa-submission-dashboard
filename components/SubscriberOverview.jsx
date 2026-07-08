'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriberTable } from '@/components/SubscriberTable';

export function SubscriberOverview({ formId, formName, websiteName }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSubscribers() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats/subscribers?formId=${formId}`);
        const json = await res.json();
        if (!cancelled) {
          setSubscribers(json.subscribers || []);
        }
      } catch (error) {
        if (!cancelled) {
          setSubscribers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSubscribers();

    return () => {
      cancelled = true;
    };
  }, [formId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-none">Total downloads</CardTitle>
        <CardDescription>Everyone who downloaded {formName}, with name, email, and location.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">Loading…</div>
        ) : (
          <SubscriberTable subscribers={subscribers} formId={formId} formName={formName} />
        )}
      </CardContent>
    </Card>
  );
}
