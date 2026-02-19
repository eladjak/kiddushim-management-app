
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

export const QuickActionCard = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
}: QuickActionCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-4 rtl:flex-row-reverse">
        <div className={`${iconBgColor} p-3 rounded-full shrink-0`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-1 text-right">{title}</h3>
          <p className="text-sm text-gray-600 text-right">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
