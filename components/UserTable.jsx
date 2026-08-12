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
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
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
                <TableCell className="font-medium text-foreground py-3">
                  <div className="flex flex-col gap-1">
                    {/* Truncated Email */}
                    <div className="truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none text-sm font-semibold" title={user.email}>
                      {user.email}
                    </div>
                    {/* Mobile-only Role Badge styled with Status color */}
                    <div className="md:hidden">
                      <Badge className={`${statusBadge(user.status)} text-[10px] px-1.5 py-0 h-4 border-0 font-medium`}>
                        {user.role === 'admin' ? 'Admin' : 'Viewer'}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="text-primary">
                    {user.role === 'admin' ? 'Admin' : 'Viewer'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className={statusBadge(user.status)}>
                    {user.status === 'active' && 'Active'}
                    {user.status === 'pending' && 'Pending'}
                    {user.status === 'paused' && 'Paused'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
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
