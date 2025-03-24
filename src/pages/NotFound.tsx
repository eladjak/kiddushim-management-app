
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const log = logger.createLogger({ component: 'NotFound' });

  useEffect(() => {
    log.error(
      "404 Error: User attempted to access non-existent route",
      { path: location.pathname }
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/5">
      <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-gray-700 mb-6">הדף המבוקש לא נמצא</p>
        <p className="text-gray-600 mb-8">
          לא הצלחנו למצוא את העמוד שחיפשת. ייתכן שהכתובת שהזנת שגויה או שהעמוד הוסר.
        </p>
        <Button 
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => {
            // Use window.location to ensure a full page reload
            window.location.href = "/";
          }}
        >
          חזרה לדף הבית
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
