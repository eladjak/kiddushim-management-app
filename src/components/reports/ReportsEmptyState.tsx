
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";

export const ReportsEmptyState = () => {
  return (
    <Card className="border border-muted">
      <CardContent className="py-4">
        <EmptyState
          illustration="reports"
          title="לא נמצאו דיווחים מסוג זה"
          description="דיווחים חדשים יופיעו כאן לאחר יצירתם. נסה לבחור סוג דיווח אחר."
        />
      </CardContent>
    </Card>
  );
};
