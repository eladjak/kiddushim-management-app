import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EventDateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onClear: () => void;
  totalCount: number;
  filteredCount: number;
}

export const EventDateRangeFilter = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
  totalCount,
  filteredCount,
}: EventDateRangeFilterProps) => {
  const hasFilter = fromDate !== "" || toDate !== "";

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-from" className="text-sm font-medium">
            מתאריך
          </Label>
          <Input
            id="filter-from"
            type="date"
            value={fromDate}
            onChange={e => onFromDateChange(e.target.value)}
            className="w-44"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-to" className="text-sm font-medium">
            עד תאריך
          </Label>
          <Input
            id="filter-to"
            type="date"
            value={toDate}
            onChange={e => onToDateChange(e.target.value)}
            className="w-44"
          />
        </div>

        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="נקה סינון תאריכים"
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 ms-1" />
            נקה
          </Button>
        )}

        <p className="text-sm text-muted-foreground flex-1 text-start">
          {hasFilter
            ? `מציג ${filteredCount} מתוך ${totalCount} אירועים`
            : `${totalCount} אירועים`}
        </p>
      </div>
    </div>
  );
};
