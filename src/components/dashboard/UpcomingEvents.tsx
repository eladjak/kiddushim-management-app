
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  main_time: string;
  location_name: string;
}

interface UpcomingEventsProps {
  events: Event[] | null;
  isLoading: boolean;
}

export const UpcomingEvents = ({ events, isLoading }: UpcomingEventsProps) => {
  if (isLoading) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-right">אירועים קרובים</h2>
        <div className="text-center py-8">טוען אירועים...</div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-6 text-right">אירועים קרובים</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events?.map((event) => (
          <div key={event.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in">
            <div className="text-right">
              <div className="text-sm text-accent font-medium mb-2">
                {format(new Date(event.main_time), "EEEE, d בMMMM", { locale: he })}
              </div>
              <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{event.location_name}</p>
              <div className="flex justify-end space-x-4">
                <button className="px-4 py-2 text-sm rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                  פרטים נוספים
                </button>
                <button className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/80 transition-colors">
                  הרשמה לאירוע
                </button>
              </div>
            </div>
          </div>
        ))}
        {events?.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            לא נמצאו אירועים קרובים
          </div>
        )}
      </div>
    </section>
  );
};
