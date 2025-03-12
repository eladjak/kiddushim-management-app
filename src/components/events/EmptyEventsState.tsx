
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Plus } from "lucide-react";

interface EmptyEventsStateProps {
  canCreateEvents: boolean;
  onCreateEvent: () => void;
}

export const EmptyEventsState = ({ canCreateEvents, onCreateEvent }: EmptyEventsStateProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col items-center py-10">
        <Image
          src="/lovable-uploads/a0a5beb0-b56a-44ad-900e-7dccede43ce0.png"
          alt="קידושישי"
          className="h-20 w-auto mb-6"
          fallback="/placeholder.svg"
        />
        <h2 className="text-xl font-semibold mb-3">עדיין אין אירועים</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          {canCreateEvents 
            ? "כרגע אין אירועים במערכת. התחל ליצור אירועים חדשים בלחיצה על כפתור 'אירוע חדש'" 
            : "כרגע אין אירועים במערכת. אירועים חדשים יופיעו כאן כאשר יתווספו על ידי מנהל או רכז"}
        </p>
        
        {canCreateEvents && (
          <Button onClick={onCreateEvent} className="px-4">
            <Plus className="h-4 w-4 ml-2" />
            צור אירוע ראשון
          </Button>
        )}
      </div>
    </div>
  );
};
