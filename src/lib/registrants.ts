import type { AppRole } from "@/types/auth";

export interface RegistrantRow {
  id: string;
  name: string;
  phone: string;
  status: string | null;
  consent_at: string | null;
  registration_date?: string | null;
}

/** Only coordinators and admins may see registrants (names + phones of the public). Fail closed. */
export const STAFF_ROLES: readonly AppRole[] = ["admin", "coordinator"];

export const canViewRegistrants = (role: AppRole | null | undefined): boolean =>
  !!role && STAFF_ROLES.includes(role);

export const STATUS_LABELS: Record<string, string> = {
  pending: "ממתין לאישור",
  confirmed: "אושר",
  cancelled: "בוטל",
  waitlist: "ברשימת המתנה",
};

export const statusLabel = (status: string | null | undefined): string =>
  (status && STATUS_LABELS[status]) || status || "לא ידוע";

export const formatConsent = (iso: string | null | undefined): string => {
  if (!iso) return "לא נרשמה הסכמה";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "לא נרשמה הסכמה";
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
};

/** Neutralise spreadsheet formula injection (=, +, -, @, tab, CR) and quote per RFC 4180. */
export const csvCell = (value: string | number | null | undefined): string => {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export const CSV_HEADERS = ["שם", "טלפון", "מועד הסכמה", "סטטוס"] as const;

/** UTF-8 BOM so Excel opens Hebrew correctly; CRLF line endings. */
export const registrantsToCsv = (rows: RegistrantRow[]): string => {
  const lines = [CSV_HEADERS.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [r.name, r.phone, formatConsent(r.consent_at), statusLabel(r.status)].map(csvCell).join(",")
    );
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
};

export const csvFileName = (eventTitle: string): string => {
  const safe = eventTitle.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "event";
  return `registrants-${safe}.csv`;
};
