import { Button } from "@/components/ui/button";

// Add the import for useNavigate
import { useNavigate } from 'react-router-dom';
import { Calendar, Download } from "lucide-react";

export function EventsPageHeader() {
  // Add the navigate function
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold text-right">אירועי קידושישי</h1>
      <p className="text-gray-500 text-right">צפיה, ניהול וארגון אירועי קידושישי הקרובים</p>
      
      {/* הוסף כפתור למעבר לדף הייצוא ל-PDF */}
      <div className="flex justify-end mt-2">
        <Button 
          onClick={() => navigate('/timeline-pdf')} 
          variant="outline" 
          className="flex items-center gap-2 text-sm"
        >
          <Calendar className="h-4 w-4" />
          <span>צפה בלוח השנה להדפסה</span>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
