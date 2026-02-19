import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import kidushishiGathering from "@/assets/kidushishi-gathering.jpg";
import kidushishiOfficialLogo from "/lovable-uploads/c53fe31c-08ad-433e-83bb-0046039b3fb9.png";

interface HeroSectionProps {
  onRegisterClick: () => void;
}

export const HeroSection = ({ onRegisterClick }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section
      className="relative py-24 md:py-32 px-4 text-center text-white overflow-hidden"
      style={{
        backgroundImage: `url(${kidushishiGathering})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Rich gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/70 to-purple-900/60" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Content card with glass effect */}
      <div className="relative max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 ring-1 ring-white/20 animate-scale-in">
          <div className="mb-8 animate-fade-in-down">
            <img
              src={kidushishiOfficialLogo}
              alt="קידושישי מגדל העמק"
              className="h-24 md:h-28 mx-auto mb-4 drop-shadow-2xl"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight animate-fade-in-up">
            קידושישי מגדל העמק
          </h1>

          <p className="text-xl md:text-2xl mb-10 text-blue-100/90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
            חוויית קבלת שבת קהילתית ומאחדת <br />
            למשפחות, ילדים ומבוגרים
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up stagger-4">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
              onClick={onRegisterClick}
            >
              הרשמה לאירוע הבא
              <span className="inline-block bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full ms-2 shadow-sm shadow-green-500/30">
                ללא עלות
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-white/40 text-white hover:bg-white/20 hover:border-white/60 backdrop-blur-sm shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => navigate("/events")}
            >
              לוח אירועים
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
