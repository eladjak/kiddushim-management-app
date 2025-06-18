
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportFormHeaderProps {
  reportType: string;
}

export const ReportFormHeader = ({ reportType }: ReportFormHeaderProps) => {
  const getReportTypeTitle = () => {
    switch (reportType) {
      case "event_report": return "דיווח אירוע לצהר";
      case "feedback": return "משוב על אירוע";
      case "issue": return "דיווח תקלה";
      default: return "דיווח חדש";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getReportTypeTitle()}</CardTitle>
        <CardDescription>
          מלא את הפרטים הנדרשים לשליחת הדיווח
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
