
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackSectionProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export const FeedbackSection = ({ images, onImagesChange }: FeedbackSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>משוב נוסף</CardTitle>
        <CardDescription>הערות נוספות לגבי האירוע</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="additional_feedback">הערות כלליות</Label>
          <Textarea
            id="additional_feedback"
            placeholder="הוסף כאן הערות נוספות לגבי האירוע..."
            rows={4}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
