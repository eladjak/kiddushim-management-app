import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-8 px-4 bg-gray-800 text-gray-300 text-center">
      <div className="max-w-4xl mx-auto">
        <p className="mb-4">
          &copy; 2025 קידושישי מגדל העמק - פרויקט של ארגון צהר והגרעין התורני מגדל העמק
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Button
            variant="link"
            className="text-gray-300 hover:text-white p-0"
            onClick={() => navigate("/auth")}
          >
            כניסה לצוות ניהול
          </Button>
          <p className="text-sm text-gray-400 mx-4 hidden md:block">|</p>
          <p className="text-sm text-gray-400 text-center max-w-md">
            מערכת ניהול מתקדמת לרכזים ומתנדבים - לתכנון אירועים, ניהול דוחות ותיאום צוות
          </p>
          <p className="text-sm text-gray-400 mx-4 hidden md:block">|</p>
          <Button
            variant="link"
            className="text-gray-300 hover:text-white p-0"
            onClick={() => navigate("/documentation")}
          >
            תיעוד הפרויקט
          </Button>
        </div>
      </div>
    </footer>
  );
};
