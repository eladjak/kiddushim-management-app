
import { useState, useMemo, lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/layout/Footer";
import { CalendarInfoAccordion } from "@/components/events/CalendarInfoAccordion";
import { EmptyEventsState } from "@/components/events/EmptyEventsState";
import { EventsPageHeader } from "@/components/events/EventsPageHeader";
import { EventsLoadingState } from "@/components/events/EventsLoadingState";
import { EventsList } from "@/components/events/EventsList";
import { EventExportButton } from "@/components/events/EventExportButton";
import { EventDateRangeFilter } from "@/components/events/EventDateRangeFilter";
import { useEvents } from "@/services/query/hooks/useEvents";
import { filterByDateRange } from "@/utils/csvExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarRange, MapPin } from "lucide-react";

const EventLocationMap = lazy(() =>
  import("@/components/events/EventLocationMap").then((m) => ({ default: m.EventLocationMap }))
);

const Events = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const { profile } = useAuth();

  const isAdmin = profile?.role === "admin";
  const isCoordinator = profile?.role === "coordinator";
  const canCreateEvents = isAdmin || isCoordinator;

  // Fetch events using our updated hook
  const { data: events = [], isLoading } = useEvents();

  // Apply date range filter
  const filteredEvents = useMemo(() => {
    const from = filterFromDate ? new Date(filterFromDate) : null;
    const to = filterToDate ? new Date(filterToDate) : null;
    return filterByDateRange(events, e => e.date, from, to);
  }, [events, filterFromDate, filterToDate]);

  const hasEvents = events.length > 0;
  const toggleCreateForm = () => setShowCreateForm(!showCreateForm);

  const clearDateFilter = () => {
    setFilterFromDate("");
    setFilterToDate("");
  };

  const handleSelectEventOnMap = (eventId: string) => {
    // Scroll to the event in the list view or navigate to event details
    setActiveTab("list");
    setTimeout(() => {
      const element = document.getElementById(`event-${eventId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-event');
        setTimeout(() => element.classList.remove('highlight-event'), 3000);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col" dir="rtl">
      <Navigation />
      <main id="main-content" className="container mx-auto px-4 py-20 flex-grow">
        <div className="max-w-5xl mx-auto">
          <EventsPageHeader
            canCreateEvents={canCreateEvents}
            showCreateForm={showCreateForm}
            onToggleCreateForm={toggleCreateForm}
          />

          <div className="space-y-6">
            {showCreateForm ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <CreateEventForm />
              </div>
            ) : isLoading ? (
              <EventsLoadingState />
            ) : !hasEvents ? (
              <EmptyEventsState
                canCreateEvents={canCreateEvents}
                onCreateEvent={() => setShowCreateForm(true)}
              />
            ) : (
              <>
                <CalendarInfoAccordion />

                {/* Date range filter + CSV export */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  <div className="flex-1 w-full">
                    <EventDateRangeFilter
                      fromDate={filterFromDate}
                      toDate={filterToDate}
                      onFromDateChange={setFilterFromDate}
                      onToDateChange={setFilterToDate}
                      onClear={clearDateFilter}
                      totalCount={events.length}
                      filteredCount={filteredEvents.length}
                    />
                  </div>
                  <EventExportButton events={filteredEvents} />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                  <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" />
                      <span>רשימת אירועים</span>
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>מפת אירועים</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="list" className="mt-4">
                    <EventsList events={filteredEvents} />
                  </TabsContent>

                  <TabsContent value="map" className="mt-4">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-xl font-semibold mb-4 pb-2 border-b">מפת אירועים</h2>
                      <Suspense fallback={
                        <div className="h-[400px] flex items-center justify-center" role="status" aria-live="polite">
                          <p className="text-gray-500">טוען מפה...</p>
                        </div>
                      }>
                        <EventLocationMap
                          events={filteredEvents}
                          onSelectEvent={handleSelectEventOnMap}
                        />
                      </Suspense>
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        לחץ על סמן כדי לראות פרטים נוספים על האירוע
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
