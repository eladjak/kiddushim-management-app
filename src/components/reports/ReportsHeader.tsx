
export const ReportsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-3xl font-bold mb-4 md:mb-0 text-right">דיווחים</h1>
      {/* הסרתי את הכפתור הישן "דיווח חדש" - כעת הכפתורים נמצאים ב-ReportsTabs */}
    </div>
  );
};
