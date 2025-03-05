
import { 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportDetailProps {
  report: any;
  formatReportType: (type: string) => string;
}

export const ReportDetail = ({ report, formatReportType }: ReportDetailProps) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{formatReportType(report.type)}</DialogTitle>
        <DialogDescription>
          {report.events?.title ? (
            <span>אירוע: {report.events.title}</span>
          ) : null}
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 text-right">
        <div className="mb-4">
          <strong>מדווח על ידי:</strong> {report.reporter_name}
        </div>
        <div className="mb-4">
          <strong>תאריך:</strong> {new Date(report.created_at).toLocaleDateString('he-IL')}
        </div>
        <div className="mb-4">
          <strong>תוכן:</strong>
          <div className="mt-2 p-3 bg-muted rounded-md">
            {JSON.stringify(report.content, null, 2)}
          </div>
        </div>
      </div>
    </DialogContent>
  );
};
