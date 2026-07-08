import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function statusBadge(status) {
  const variants = {
    active: 'bg-[color-mix(in_oklch,var(--color-secondary),transparent_90%)] text-[color:var(--color-secondary-dark)]',
    pending: 'bg-muted text-muted-foreground',
    paused: 'bg-muted text-muted-foreground',
  };
  return variants[status] || variants.pending;
}

export function UserTable({ users, onAction }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-primary">
                    {user.role === 'admin' ? 'Admin' : 'Viewer'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusBadge(user.status)}>
                    {user.status === 'active' && 'Active'}
                    {user.status === 'pending' && 'Pending'}
                    {user.status === 'paused' && 'Paused'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {user.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => onAction(user.id, 'approve')}
                        className="bg-[color:var(--color-secondary)] text-white hover:opacity-90"
                      >
                        Approve
                      </Button>
                    )}
                    {user.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => onAction(user.id, 'pause')}>
                        Pause
                      </Button>
                    )}
                    {user.status === 'paused' && (
                      <Button
                        size="sm"
                        onClick={() => onAction(user.id, 'resume')}
                        className="bg-[color:var(--color-secondary)] text-white hover:opacity-90"
                      >
                        Resume
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => onAction(user.id, 'remove')}>
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
