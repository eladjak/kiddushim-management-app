import { Button } from "@/components/ui/button";
import { Phone, BookOpen, MessageCircle } from "lucide-react";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";

interface ContactSectionProps {
  onRegisterClick: () => void;
}

export const ContactSection = ({ onRegisterClick }: ContactSectionProps) => {
  const sectionRef = useAnimateOnScroll<HTMLElement>();

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden animate-on-scroll">
      {/* Decorative background elements */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">
          נשמח לענות על שאלות ולקבל אותכם
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-white/60 to-orange-300/60 rounded-full mx-auto mb-10" />

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
          <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm rounded-xl ring-1 ring-white/10 hover:bg-white/15 transition-all duration-200 animate-on-scroll stagger-1">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Phone className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold mb-1">אלעד - רכז קידושישי</p>
              <a
                href="tel:+972525427474"
                className="text-lg hover:text-orange-200 transition-colors duration-200"
                aria-label="התקשרו לאלעד 052-542-7474"
              >
                052-542-7474
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 bg-white/10 backdrop-blur-sm rounded-xl ring-1 ring-white/10 hover:bg-white/15 transition-all duration-200 animate-on-scroll stagger-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold mb-1">עדכונים</p>
              <a
                href="https://kidushishi.tzohar.org.il/lp-groups/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg hover:text-orange-200 transition-colors duration-200"
                aria-label="קישור לעמוד עדכונים - אתר חיצוני"
              >
                קישור לעדכונים
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 bg-green-500/15 backdrop-blur-sm rounded-xl ring-1 ring-green-400/20 hover:bg-green-500/20 transition-all duration-200 animate-on-scroll stagger-3">
            <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold mb-1">קבוצת וואטסאפ</p>
              <a
                href="https://chat.whatsapp.com/CHgXiEZ3KdC7ovX7WYIt2s"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg hover:text-green-200 transition-colors duration-200"
                aria-label="הצטרפות לקבוצת וואטסאפ - אתר חיצוני"
              >
                הצטרפות לקבוצה
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-gray-50 shadow-lg shadow-black/10 px-8 py-4 text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            onClick={onRegisterClick}
          >
            הרשמה לאירוע הבא
          </Button>
        </div>
      </div>
    </section>
  );
};
