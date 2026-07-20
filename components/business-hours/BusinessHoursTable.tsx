import { BusinessHours } from "@/types/appointments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface BusinessHoursTableProps {
  hours: BusinessHours[];
}

export function BusinessHoursTable({ hours }: BusinessHoursTableProps) {
  // Map array to dictionary for easy access by weekday
  const hoursMap = hours.reduce((acc, curr) => {
    acc[curr.weekday] = curr;
    return acc;
  }, {} as Record<number, BusinessHours>);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Break</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {WEEKDAYS.map((day, index) => {
            const row = hoursMap[index];
            if (!row) {
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{day}</TableCell>
                  <TableCell colSpan={3} className="text-muted-foreground text-sm italic">Not configured</TableCell>
                </TableRow>
              );
            }

            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{day}</TableCell>
                <TableCell>
                  {row.is_open ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Open</Badge>
                  ) : (
                    <Badge variant="secondary">Closed</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {row.is_open ? `${row.opens_at.slice(0,5)} - ${row.closes_at.slice(0,5)}` : '-'}
                </TableCell>
                <TableCell>
                  {row.is_open && row.break_start && row.break_end 
                    ? `${row.break_start.slice(0,5)} - ${row.break_end.slice(0,5)}` 
                    : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
