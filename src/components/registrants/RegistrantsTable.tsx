import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatConsent, statusLabel, type RegistrantRow } from "@/lib/registrants";

interface Props {
  rows: RegistrantRow[];
}

const Phone = ({ phone }: { phone: string }) => (
  <a href={`tel:${phone}`} dir="ltr" className="inline-block text-primary underline-offset-2 hover:underline">
    {phone}
  </a>
);

/** Desktop: table. Mobile (< md): stacked cards, no horizontal scroll. */
export const RegistrantsTable = ({ rows }: Props) => (
  <div dir="rtl">
    <div className="hidden md:block bg-white dark:bg-card rounded-md shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">שם</TableHead>
            <TableHead className="text-right">טלפון</TableHead>
            <TableHead className="text-right">מועד הסכמה</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell><Phone phone={r.phone} /></TableCell>
              <TableCell>{formatConsent(r.consent_at)}</TableCell>
              <TableCell><Badge variant="secondary">{statusLabel(r.status)}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <ul className="md:hidden space-y-3">
      {rows.map((r) => (
        <li key={r.id} className="bg-white dark:bg-card rounded-md shadow p-4 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">{r.name}</span>
            <Badge variant="secondary">{statusLabel(r.status)}</Badge>
          </div>
          <div><Phone phone={r.phone} /></div>
          <div className="text-sm text-muted-foreground">הסכמה: {formatConsent(r.consent_at)}</div>
        </li>
      ))}
    </ul>
  </div>
);
