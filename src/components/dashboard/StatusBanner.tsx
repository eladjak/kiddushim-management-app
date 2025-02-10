
import { CheckCircle } from "lucide-react";

interface StatusBannerProps {
  isAllDataLoaded: boolean;
}

export const StatusBanner = ({ isAllDataLoaded }: StatusBannerProps) => {
  if (!isAllDataLoaded) return null;

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-right">
      <div className="flex items-center justify-end gap-2">
        <span>כל המערכות פועלות כראוי</span>
        <CheckCircle className="h-5 w-5" />
      </div>
    </div>
  );
};
