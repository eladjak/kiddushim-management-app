
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Plus } from "lucide-react";

interface EmptyEventsStateProps {
  canCreateEvents: boolean;
  onCreateEvent: () => void;
}

export const EmptyEventsState = ({ canCreateEvents, onCreateEvent }: EmptyEventsStateProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
      <div className="flex flex-col items-center py-10">
        <Image
          src="/lovable-uploads/a0a5beb0-b56a-44ad-900e-7dccede43ce0.png"
          alt="קידושישי"
          className="h-24 w-auto mb-8"
          fallback="/placeholder.svg"
        />
        <h2 className="text-xl font-semibold mb-4">עדיין אין אירועים</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          {canCreateEvents 
            ? "כרגע אין אירועים במערכת. התחל ליצור אירועים חדשים בלחיצה על כפתור 'אירוע חדש'" 
            : "כרגע אין אירועים במערכת. אירועים חדשים יופיעו כאן כאשר יתווספו על ידי מנהל או רכז"}
        </p>
        
        {canCreateEvents && (
          <Button onClick={onCreateEvent} size="lg" className="px-6">
            <Plus className="h-5 w-5 ml-2" />
            צור אירוע ראשון
          </Button>
        )}
      </div>
    </div>
  );
};
