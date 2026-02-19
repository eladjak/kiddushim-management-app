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
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";

interface EventDetailsSectionProps {
  upcomingEvents: UpcomingEvent[] | undefined;
  eventsLoading: boolean;
}

export const EventDetailsSection = ({
  upcomingEvents,
  eventsLoading,
}: EventDetailsSectionProps) => {
  const sectionRef = useAnimateOnScroll<HTMLElement>();

  const handleAddToCalendar = () => {
    if (!upcomingEvents || upcomingEvents.length === 0) return;

    const event = upcomingEvents[0];
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&location=${encodeURIComponent(event.location_address || event.location_name)}&details=${encodeURIComponent(`קידושישי מגדל העמק - ${event.title}`)}`;
    window.open(calendarUrl, '_blank');
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50/50 animate-on-scroll">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              איך נראה אירוע קידושישי?
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mb-8" />

            <div className="space-y-6">
              <div className="flex items-start gap-4 group animate-on-scroll stagger-1">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors duration-200">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">משך האירוע</h3>
                  <p className="text-gray-600 leading-relaxed">כשעתיים של חוויה מלאה - מקבלת שבת ועד פעילויות משותפות</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group animate-on-scroll stagger-2">
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors duration-200">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">מיקומים מרכזיים</h3>
                  <p className="text-gray-600 leading-relaxed">פארקים ציבוריים ומרכזים קהילתיים נגישים במגדל העמק</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group animate-on-scroll stagger-3">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors duration-200">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">תוכן מגוון</h3>
                  <p className="text-gray-600 leading-relaxed">שירה, לימוד, פעילויות יצירה לילדים ושיח קהילתי</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Decorative glow behind the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-orange-500/20 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-orange-500 p-8 rounded-2xl text-white shadow-2xl ring-1 ring-white/10">
              <h3 className="text-2xl font-bold mb-6">
                {eventsLoading ? "טוען אירוע..." :
                  upcomingEvents && upcomingEvents.length > 0 ?
                    "האירוע הבא" : "האירוע הבא בתכנון"}
              </h3>

              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-200" />
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
                    <MapPin className="h-5 w-5 text-blue-200" />
                    <span>{upcomingEvents[0].location_name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-200" />
                    <span>מתאים לכל המשפחה</span>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Badge className="bg-white/95 text-blue-700 px-4 py-2 shadow-sm">
                      השתתפות ללא עלות
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/40 text-white hover:bg-white/20 hover:border-white/60 transition-all duration-200"
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
                    <Calendar className="h-5 w-5 text-blue-200" />
                    <span>האירוע הבא יפורסם בקרוב</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-200" />
                    <span>מגדל העמק</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-200" />
                    <span>מתאים לכל המשפחה</span>
                  </div>

                  <Badge className="mt-6 bg-white/95 text-blue-700 px-4 py-2 shadow-sm">
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
