import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistrantsGate } from "@/components/registrants/RegistrantsGate";
import { RegistrantsTable } from "@/components/registrants/RegistrantsTable";
import { csvFileName, registrantsToCsv, type RegistrantRow } from "@/lib/registrants";

interface EventOption {
  id: string;
  title: string;
  date: string;
}

export const RegistrantsContent = () => {
  const [params, setParams] = useSearchParams();
  const [eventId, setEventId] = useState<string>(params.get("event") ?? "");

  const events = useQuery({
    queryKey: ["registrants-events"],
    queryFn: async (): Promise<EventOption[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date")
        .order("date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!eventId && events.data?.length) setEventId(events.data[0].id);
  }, [events.data, eventId]);

  const registrants = useQuery({
    queryKey: ["registrants", eventId],
    enabled: !!eventId,
    queryFn: async (): Promise<RegistrantRow[]> => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("id, name, phone, status, consent_at, registration_date")
        .eq("event_id", eventId)
        .order("registration_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RegistrantRow[];
    },
  });

  const selected = events.data?.find((e) => e.id === eventId);
  const rows = registrants.data ?? [];

  const onSelect = (id: string) => {
    setEventId(id);
    setParams({ event: id }, { replace: true });
  };

  const exportCsv = () => {
    const blob = new Blob([registrantsToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFileName(selected?.title ?? "event");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-right">נרשמים לאירועים</h1>
        <Button onClick={exportCsv} disabled={rows.length === 0} className="w-full md:w-auto">
          <Download className="ml-2 h-4 w-4" aria-hidden="true" />
          ייצוא ל-CSV
        </Button>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium mb-1 text-right">אירוע</label>
        <Select value={eventId} onValueChange={onSelect} dir="rtl">
          <SelectTrigger aria-label="בחירת אירוע">
            <SelectValue placeholder="בחר/י אירוע" />
          </SelectTrigger>
          <SelectContent>
            {(events.data ?? []).map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {events.isError || registrants.isError ? (
        <div role="alert" className="text-destructive">שגיאה בטעינת הנתונים. נסו לרענן.</div>
      ) : registrants.isLoading || events.isLoading ? (
        <div role="status" aria-live="polite" className="py-6 text-center">טוען נרשמים...</div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">אין עדיין נרשמים לאירוע הזה.</div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground text-right">{rows.length} נרשמים</p>
          <RegistrantsTable rows={rows} />
        </>
      )}
    </div>
  );
};

const Registrants = () => (
  <div className="min-h-screen bg-secondary/30">
    <Navigation />
    <main className="container mx-auto px-4 pt-24 pb-12">
      <RegistrantsGate>
        <RegistrantsContent />
      </RegistrantsGate>
    </main>
  </div>
);

export default Registrants;
