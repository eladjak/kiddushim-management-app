
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
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`${iconBgColor} p-3 rounded-full shrink-0`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
