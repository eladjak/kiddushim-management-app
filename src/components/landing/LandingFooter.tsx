import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-10 px-4 bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 text-center">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <p className="mb-4 text-gray-400">
          &copy; {new Date().getFullYear()} קידושישי מגדל העמק - פרויקט של ארגון צהר והגרעין התורני מגדל העמק
        </p>
        <div className="flex justify-center gap-6 flex-wrap items-center">
          <Button
            variant="link"
            className="text-gray-400 hover:text-blue-400 p-0 transition-colors duration-200"
            onClick={() => navigate("/auth")}
          >
            כניסה לצוות ניהול
          </Button>
          <span className="text-gray-700 hidden md:inline" aria-hidden="true">|</span>
          <p className="text-sm text-gray-500 text-center max-w-md">
            מערכת ניהול מתקדמת לרכזים ומתנדבים - לתכנון אירועים, ניהול דוחות ותיאום צוות
          </p>
          <span className="text-gray-700 hidden md:inline" aria-hidden="true">|</span>
          <Button
            variant="link"
            className="text-gray-400 hover:text-blue-400 p-0 transition-colors duration-200"
            onClick={() => navigate("/documentation")}
          >
            תיעוד הפרויקט
          </Button>
        </div>
      </div>
    </footer>
  );
};
