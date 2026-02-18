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
import type { Event } from "@/types/events";

interface EventExportButtonProps {
  events: Event[];
}

const STATUS_LABELS: Record<string, string> = {
  planned: "מתוכנן",
  ongoing: "מתרחש",
  completed: "הושלם",
  canceled: "בוטל",
  draft: "טיוטה",
};

const TYPE_LABELS: Record<string, string> = {
  kidush: "קידוש",
  melave_malka: "מלווה מלכה",
  workshop: "סדנה",
  other: "אחר",
};

const EVENT_COLUMNS: CsvColumn<Event>[] = [
  { header: "מזהה", getValue: e => e.id },
  { header: "כותרת", getValue: e => e.title },
  { header: "תאריך", getValue: e => e.date },
  { header: "שעה", getValue: e => e.main_time ?? e.time ?? "" },
  { header: "מיקום", getValue: e => e.location_name ?? e.location ?? "" },
  { header: "סוג", getValue: e => TYPE_LABELS[e.type ?? ""] ?? e.type ?? "" },
  { header: "סטטוס", getValue: e => STATUS_LABELS[e.status ?? ""] ?? e.status ?? "" },
  { header: "פרשה", getValue: e => e.parasha ?? "" },
  { header: "תיאור", getValue: e => e.description ?? "" },
  { header: "נוצר בתאריך", getValue: e => e.created_at ? new Date(e.created_at).toLocaleDateString("he-IL") : "" },
  { header: "עודכן בתאריך", getValue: e => e.updated_at ? new Date(e.updated_at).toLocaleDateString("he-IL") : "" },
];

export const EventExportButton = ({ events }: EventExportButtonProps) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filtered = filterByDateRange(events, e => e.date, from, to);

    const today = new Date().toISOString().split("T")[0];
    downloadCsv(filtered, {
      columns: EVENT_COLUMNS,
      filename: `אירועים-${today}`,
    });

    setOpen(false);
  };

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  const filteredCount = filterByDateRange(events, e => e.date, from, to).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="הורד אירועים לקובץ CSV">
          <Download className="h-4 w-4 ms-1" />
          ייצוא CSV
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">ייצוא אירועים ל-CSV</h3>

          <div className="space-y-2">
            <Label htmlFor="event-export-from">מתאריך</Label>
            <Input
              id="event-export-from"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-export-to">עד תאריך</Label>
            <Input
              id="event-export-to"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {filteredCount} מתוך {events.length} אירועים לייצוא
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
