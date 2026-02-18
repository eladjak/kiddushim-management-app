import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { downloadCsv, filterByDateRange, type CsvColumn } from "@/utils/csvExport";
import type { Report } from "./ReportsList";

interface ExportButtonProps {
  reports: Report[];
}

const REPORT_COLUMNS: CsvColumn<Report>[] = [
  { header: "מזהה", getValue: r => r.id },
  { header: "סוג דיווח", getValue: r => {
    switch (r.type) {
      case "event_report": return "דיווח אירוע";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return r.type;
    }
  }},
  { header: "כותרת", getValue: r => r.content.title ?? '' },
  { header: "שם מדווח", getValue: r => r.content.reporter_name ?? '' },
  { header: "סטטוס", getValue: r => r.content.status ?? '' },
  { header: "חומרה", getValue: r => r.content.severity ?? '' },
  { header: "תיאור", getValue: r => r.content.description ?? '' },
  { header: "שם אירוע", getValue: r => r.events?.title ?? '' },
  { header: "תאריך אירוע", getValue: r => r.events?.date ?? '' },
  { header: "נוצר בתאריך", getValue: r => r.created_at ? new Date(r.created_at).toLocaleDateString('he-IL') : '' },
  { header: "עודכן בתאריך", getValue: r => r.updated_at ? new Date(r.updated_at).toLocaleDateString('he-IL') : '' },
];

export const ExportButton = ({ reports }: ExportButtonProps) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = filterByDateRange(
      reports,
      r => r.created_at,
      from,
      to
    );

    const today = new Date().toISOString().split('T')[0];
    downloadCsv(filtered, {
      columns: REPORT_COLUMNS,
      filename: `דיווחים-${today}`,
    });

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="הורד דוח CSV">
          <Download className="h-4 w-4 ms-1" />
          הורד דוח
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">הורד דוח CSV</h3>

          <div className="space-y-2">
            <Label htmlFor="export-from">מתאריך</Label>
            <Input
              id="export-from"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-to">עד תאריך</Label>
            <Input
              id="export-to"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {reports.length} דיווחים זמינים לייצוא
          </p>

          <Button onClick={handleExport} className="w-full" size="sm">
            <Download className="h-4 w-4 ms-1" />
            ייצא לקובץ CSV
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
