import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export function ErrorBlock({ onRetry }) {
  return (
    <div className="bg-error-tint border border-error rounded-md p-xxl flex flex-col items-center text-center">
      <WarningCircle size={40} className="text-error mb-md" aria-hidden="true" />
      <p className="text-body text-error mb-lg">
        Couldn&rsquo;t load report data. Retry, or check back in a few minutes.
      </p>
      <Button
        onClick={onRetry}
        className="flex items-center gap-xs bg-primary text-canvas hover:bg-primary-hover font-button focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowClockwise size={16} aria-hidden="true" />
        Retry
      </Button>
    </div>
  );
}
