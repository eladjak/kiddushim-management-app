
import {
  Card,
  CardContent
} from "@/components/ui/card";

export const ReportsEmptyState = () => {
  return (
    <Card className="border border-muted">
      <CardContent className="text-center py-12">
        <p className="text-lg text-muted-foreground">לא נמצאו דיווחים מסוג זה</p>
      </CardContent>
    </Card>
  );
};
