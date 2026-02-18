/**
 * CSV export utility - pure client-side, no server needed
 */

export interface CsvColumn<T> {
  header: string;
  getValue: (row: T) => string | number | boolean | null | undefined;
}

export interface CsvExportOptions<T> {
  columns: CsvColumn<T>[];
  filename: string;
}

/**
 * Escapes a cell value for CSV format (RFC 4180)
 */
function escapeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Wrap in quotes if contains comma, newline, or double-quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of objects to CSV string with UTF-8 BOM
 * (BOM ensures Hebrew characters display correctly in Excel)
 */
export function toCsvString<T>(rows: T[], options: CsvExportOptions<T>): string {
  const { columns } = options;

  const header = columns.map(col => escapeCell(col.header)).join(',');
  const dataRows = rows.map(row =>
    columns.map(col => escapeCell(col.getValue(row))).join(',')
  );

  return [header, ...dataRows].join('\r\n');
}

/**
 * Triggers a CSV file download in the browser
 */
export function downloadCsv<T>(rows: T[], options: CsvExportOptions<T>): void {
  const csvString = toCsvString(rows, options);
  // UTF-8 BOM (\uFEFF) for correct Hebrew display in Excel
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = options.filename.endsWith('.csv') ? options.filename : `${options.filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Filters rows by date range (inclusive).
 * dateField should return an ISO date string.
 */
export function filterByDateRange<T>(
  rows: T[],
  getDate: (row: T) => string | null | undefined,
  from: Date | null,
  to: Date | null
): T[] {
  return rows.filter(row => {
    const raw = getDate(row);
    if (!raw) return true;
    const date = new Date(raw);
    if (isNaN(date.getTime())) return true;
    if (from && date < from) return false;
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      if (date > toEnd) return false;
    }
    return true;
  });
}

/**
 * Computes summary statistics for an array of events.
 */
export interface EventSummary {
  total: number;
  byStatus: Record<string, number>;
  recent: unknown[];
}

export function computeEventSummary<T extends { status?: string; created_at?: string }>(
  events: T[],
  recentCount = 5
): EventSummary {
  const byStatus: Record<string, number> = {};

  for (const event of events) {
    const status = event.status ?? 'unknown';
    byStatus[status] = (byStatus[status] ?? 0) + 1;
  }

  const sorted = [...events].sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const db = b.created_at ? new Date(b.created_at).getTime() : 0;
    return db - da;
  });

  return {
    total: events.length,
    byStatus,
    recent: sorted.slice(0, recentCount),
  };
}
