import { Button } from "@/components/ui/button";
import { Phone, BookOpen, MessageCircle } from "lucide-react";

interface ContactSectionProps {
  onRegisterClick: () => void;
}

export const ContactSection = ({ onRegisterClick }: ContactSectionProps) => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">
          נשמח לענות על שאלות ולקבל אותכם
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
          <div className="flex flex-col items-center gap-3 p-4 bg-white/10 rounded-lg">
            <Phone className="h-8 w-8" />
            <div>
              <p className="font-semibold">אלעד - רכז קידושישי</p>
              <a href="tel:+972525427474" className="text-lg hover:text-blue-200 transition-colors">
                052-542-7474
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-white/10 rounded-lg">
            <BookOpen className="h-8 w-8" />
            <div>
              <p className="font-semibold">עדכונים</p>
              <a
                href="https://kidushishi.tzohar.org.il/lp-groups/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg hover:text-blue-200 transition-colors"
              >
                קישור לעדכונים
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-white/10 rounded-lg">
            <MessageCircle className="h-8 w-8" />
            <div>
              <p className="font-semibold">קבוצת וואטסאפ</p>
              <a
                href="https://chat.whatsapp.com/CHgXiEZ3KdC7ovX7WYIt2s"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg hover:text-blue-200 transition-colors"
              >
                הצטרפות לקבוצה
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-gray-100 shadow-lg px-8 py-4"
            onClick={onRegisterClick}
          >
            הרשמה לאירוע הבא
          </Button>
        </div>
      </div>
    </section>
  );
};
