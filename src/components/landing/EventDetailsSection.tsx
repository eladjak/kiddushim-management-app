import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  BookOpen,
  Download,
} from "lucide-react";
import type { UpcomingEvent } from "./types";

interface EventDetailsSectionProps {
  upcomingEvents: UpcomingEvent[] | undefined;
  eventsLoading: boolean;
}

export const EventDetailsSection = ({
  upcomingEvents,
  eventsLoading,
}: EventDetailsSectionProps) => {
  const handleAddToCalendar = () => {
    if (!upcomingEvents || upcomingEvents.length === 0) return;

    const event = upcomingEvents[0];
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&location=${encodeURIComponent(event.location_address || event.location_name)}&details=${encodeURIComponent(`קידושישי מגדל העמק - ${event.title}`)}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              איך נראה אירוע קידושישי?
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">משך האירוע</h3>
                  <p className="text-gray-600">כשעתיים של חוויה מלאה - מקבלת שבת ועד פעילויות משותפות</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">מיקומים מרכזיים</h3>
                  <p className="text-gray-600">פארקים ציבוריים ומרכזים קהילתיים נגישים במגדל העמק</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">תוכן מגוון</h3>
                  <p className="text-gray-600">שירה, לימוד, פעילויות יצירה לילדים ושיח קהילתי</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-8 rounded-2xl text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">
                {eventsLoading ? "טוען אירוע..." :
                  upcomingEvents && upcomingEvents.length > 0 ?
                    "האירוע הבא" : "האירוע הבא בתכנון"}
              </h3>

              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(upcomingEvents[0].date).toLocaleDateString('he-IL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    <span>{upcomingEvents[0].location_name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span>מתאים לכל המשפחה</span>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Badge className="bg-white text-blue-700 px-4 py-2">
                      השתתפות ללא עלות
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-blue-700"
                      onClick={handleAddToCalendar}
                    >
                      <Download className="h-4 w-4 me-1" />
                      הוסף ליומן
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <span>האירוע הבא יפורסם בקרוב</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5" />
                    <span>מגדל העמק</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span>מתאים לכל המשפחה</span>
                  </div>

                  <Badge className="mt-6 bg-white text-blue-700 px-4 py-2">
                    השתתפות ללא עלות
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
