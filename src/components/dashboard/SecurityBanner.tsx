
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Security Banner component to highlight security guidelines
 * This is displayed on the dashboard to promote security awareness
 */
export const SecurityBanner = () => {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("securityBannerDismissed") === "true"
  );

  const handleDismiss = () => {
    localStorage.setItem("securityBannerDismissed", "true");
    setDismissed(true);
  };

  if (dismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-5 w-5 text-orange-500" />
      <AlertTitle className="text-orange-700 font-medium text-lg">
        הנחיות אבטחה חדשות
      </AlertTitle>
      <AlertDescription className="text-orange-700 mt-2 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          מדריך אבטחה חדש זמין עבור צוות הפיתוח והמנהלים. אנא קראו את ההנחיות כדי להבטיח אבטחה מיטבית.
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <Button 
            variant="outline" 
            className="border-orange-300 text-orange-700 hover:bg-orange-100" 
            onClick={handleDismiss}
          >
            סגור
          </Button>
          <Button 
            variant="default"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            asChild
          >
            <Link to="/documentation?section=security">
              למדריך האבטחה
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
