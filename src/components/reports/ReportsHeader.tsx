
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ReportsHeader = () => {
  const { toast } = useToast();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-3xl font-bold mb-4 md:mb-0 text-right">דיווחים</h1>
      
      <Button
        onClick={() => {
          toast({
            description: "פונקציונליות הוספת דיווח עדיין לא מיושמת",
          });
        }}
      >
        דיווח חדש
      </Button>
    </div>
  );
};
