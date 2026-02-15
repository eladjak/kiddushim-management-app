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
      className="relative py-20 px-4 text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.8)), url(${kidushishiGathering})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative max-w-4xl mx-auto">
        <div className="mb-8">
          <img
            src={kidushishiOfficialLogo}
            alt="קידושישי מגדל העמק"
            className="h-24 mx-auto mb-4 drop-shadow-lg"
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          קידושישי מגדל העמק
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
          חוויית קבלת שבת קהילתית ומאחדת <br />
          למשפחות, ילדים ומבוגרים
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
            onClick={onRegisterClick}
          >
            הרשמה לאירוע הבא
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-700 shadow-lg"
            onClick={() => navigate("/events")}
          >
            לוח אירועים
          </Button>
        </div>
      </div>
    </section>
  );
};
