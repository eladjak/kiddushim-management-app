
export const useReportTypes = () => {
  const getReportTypeName = (reportType: string) => {
    switch (reportType) {
      case "event_report": return "דיווח אירוע לצהר";
      case "feedback": return "משוב";
      case "issue": return "תקלה";
      default: return "דיווח";
    }
  };

  return { getReportTypeName };
};
