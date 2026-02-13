
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Report } from "./ReportsList";
import { Card } from "@/components/ui/card";

interface ReportDetailProps {
  report: Report;
  formatReportType: (type: string) => string;
}

export const ReportDetail = ({ report, formatReportType }: ReportDetailProps) => {
  // Format report status in Hebrew
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">חדש</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">בטיפול</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">טופל</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">סגור</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format severity in Hebrew
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">נמוכה</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">בינונית</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">גבוהה</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">קריטית</Badge>;
      default:
        return null;
    }
  };

  // Function to format rating as stars
  const formatRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className="text-sm font-medium">{rating}/10</span>
        <div className="ms-2 w-24 bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${(rating / 10) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-xl">{report.content.title}</DialogTitle>
        <DialogDescription className="flex flex-wrap gap-2 items-center">
          <span>{formatReportType(report.type)}</span>
          <span className="text-gray-400 mx-1">•</span>
          <span>{new Date(report.created_at).toLocaleDateString('he-IL')}</span>
          <span className="text-gray-400 mx-1">•</span>
          {getStatusBadge(report.content.status)}
          {report.content.severity && (
            <>
              <span className="text-gray-400 mx-1">•</span>
              {getSeverityBadge(report.content.severity)}
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">מדווח על ידי</h3>
          <p>{report.content.reporter_name}</p>
        </div>

        {report.events && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">אירוע קשור</h3>
            <p>{report.events.title} ({new Date(report.events.date).toLocaleDateString('he-IL')})</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">תיאור</h3>
          <p className="whitespace-pre-wrap">{report.content.description}</p>
        </div>

        {report.content.ratings && (
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">דירוגים</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">כללי:</span>
                {formatRating(report.content.ratings.overall)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">חווית הקהל:</span>
                {formatRating(report.content.ratings.audience)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">רמת הארגון:</span>
                {formatRating(report.content.ratings.organization)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">לוגיסטיקה:</span>
                {formatRating(report.content.ratings.logistics)}
              </div>
            </div>
          </Card>
        )}

        {report.content.feedback && (
          <>
            {report.content.feedback.positive && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">מה היה טוב</h3>
                <p className="whitespace-pre-wrap">{report.content.feedback.positive}</p>
              </div>
            )}
            
            {report.content.feedback.improvement && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">מה אפשר לשפר</h3>
                <p className="whitespace-pre-wrap">{report.content.feedback.improvement}</p>
              </div>
            )}
          </>
        )}

        {report.content.images && report.content.images.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">תמונות וסרטונים</h3>
            <div className="grid grid-cols-2 gap-2">
              {report.content.images.map((image, index) => (
                <div key={index} className="rounded-md overflow-hidden border">
                  {image.toLowerCase().endsWith('.mp4') ? (
                    <video 
                      src={image} 
                      controls 
                      className="w-full h-auto"
                    />
                  ) : (
                    <a href={image} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={image} 
                        alt={`תמונה ${index + 1}`}
                        className="w-full h-auto" 
                      />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" type="button">
          סגור
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
