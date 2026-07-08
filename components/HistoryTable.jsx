import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function HistoryTable({ daily }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Sign-ups</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {daily.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                No sign-ups in this period. Try a wider date range.
              </TableCell>
            </TableRow>
          ) : (
            daily.map((row) => (
              <TableRow key={row.date}>
                <TableCell className="text-muted-foreground">{row.date}</TableCell>
                <TableCell className="font-medium text-foreground tabular-nums">
                  {row.signups}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
