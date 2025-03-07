
import { Button } from "@/components/ui/button";

interface ReportsErrorProps {
  onRetry: () => void;
}

export const ReportsError = ({ onRetry }: ReportsErrorProps) => {
  return (
    <div className="text-center py-12 bg-white rounded-md shadow">
      <p className="text-lg text-red-500">שגיאה בטעינת הדיווחים</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onRetry}
      >
        נסה שוב
      </Button>
    </div>
  );
};
