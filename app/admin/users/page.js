'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { UserTable } from '@/components/UserTable';
import { InviteModal } from '@/components/InviteModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [refreshKey]);

  async function handleUserAction(userId, action) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setRefreshKey((k) => k + 1);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }

  function handleInviteSent() {
    setShowInviteModal(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <AppShell sidebar={<AppSidebar isAdminPage />}>
      <AppHeader
        showDateFilter={false}
        mobileActions={
          <Button
            onClick={() => setShowInviteModal(true)}
            className="h-9 rounded-md px-3 py-2 text-sm"
          >
            Invite User
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-2xl text-foreground">Manage Users</h1>
            <p className="text-muted-foreground text-sm">
              Approve, pause, or remove access for people invited to this dashboard.
            </p>
          </div>
          <Button
            onClick={() => setShowInviteModal(true)}
            className="hidden h-9 w-full rounded-md px-3 py-2 text-sm sm:w-auto md:flex"
          >
            Invite User
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading users…</p>
        ) : (
          <UserTable users={users} onAction={handleUserAction} />
        )}
      </div>

      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} onInviteSent={handleInviteSent} />
      )}
    </AppShell>
  );
}
