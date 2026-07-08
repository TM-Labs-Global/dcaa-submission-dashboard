'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check } from '@phosphor-icons/react';

export function InviteModal({ onClose, onInviteSent }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerateLink(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create invite');
        return;
      }

      setInviteLink(data.inviteLink);
      setShowLink(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 4000);
  }

  if (showLink) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-ink">Invite Link Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Share this link with the person you want to invite. It expires in 48 hours.
            </p>
            <div className="p-4 bg-canvas-subtle border border-hairline rounded-xl text-xs font-mono text-ink break-all select-all">
              {inviteLink}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCopyLink}
                className={`flex-1 h-11 rounded-xl font-medium shadow-soft-lift cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  copied 
                    ? 'bg-secondary hover:bg-secondary text-primary' 
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={16} weight="bold" className="text-primary" />
                    Copied!
                  </>
                ) : (
                  'Copy Link'
                )}
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-canvas-subtle text-ink border border-hairline hover:bg-hairline h-11 rounded-xl font-medium cursor-pointer transition-all duration-200"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-ink">Invite User</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Generate a single-use invite token link to register a new user dashboard account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerateLink} className="space-y-4 pt-2">
          {error && (
            <div className="p-3.5 rounded-xl bg-error-tint border border-error/20 text-error text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white hover:bg-primary-hover h-11 rounded-xl font-medium shadow-soft-lift disabled:opacity-50 cursor-pointer transition-all duration-200"
            >
              {loading ? 'Generating...' : 'Generate Link'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-canvas-subtle text-ink border border-hairline hover:bg-hairline h-11 rounded-xl font-medium cursor-pointer transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
