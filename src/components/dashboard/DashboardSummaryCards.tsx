import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { computeEventSummary } from "@/utils/csvExport";

interface SummaryEvent {
  id: string;
  title: string;
  status?: string;
  created_at?: string;
  main_time?: string;
  date?: string;
}

interface DashboardSummaryCardsProps {
  events: SummaryEvent[];
  isLoading: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  planned: "מתוכנן",
  ongoing: "מתרחש",
  completed: "הושלם",
  canceled: "בוטל",
  draft: "טיוטה",
  published: "פורסם",
  pending: "ממתין",
  unknown: "לא ידוע",
};

const STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ongoing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  unknown: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const CardSkeleton = () => (
  <Card className="border-s-4 border-gray-200 dark:border-gray-700">
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-24" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-12 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

export const DashboardSummaryCards = ({ events, isLoading }: DashboardSummaryCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const summary = computeEventSummary(events, 5);
  const completedCount = summary.byStatus['completed'] ?? summary.byStatus['published'] ?? 0;
  const activeCount = (summary.byStatus['planned'] ?? 0) + (summary.byStatus['ongoing'] ?? 0);
  const pendingCount = summary.byStatus['draft'] ?? summary.byStatus['pending'] ?? 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <Card className="border-s-4 border-blue-500 hover:shadow-lg transition-all duration-200 animate-fade-in-up stagger-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">סך הכל אירועים</CardTitle>
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-2">
              <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">בסיס הנתונים</p>
          </CardContent>
        </Card>

        {/* Active */}
        <Card className="border-s-4 border-green-500 hover:shadow-lg transition-all duration-200 animate-fade-in-up stagger-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">אירועים פעילים</CardTitle>
            <div className="rounded-full bg-green-50 dark:bg-green-900/30 p-2">
              <Clock className="h-4 w-4 text-green-500 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">מתוכנן + מתרחש</p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-s-4 border-purple-500 hover:shadow-lg transition-all duration-200 animate-fade-in-up stagger-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">הושלמו</CardTitle>
            <div className="rounded-full bg-purple-50 dark:bg-purple-900/30 p-2">
              <CheckCircle className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">אירועים שהסתיימו</p>
          </CardContent>
        </Card>

        {/* Draft / Pending */}
        <Card className="border-s-4 border-amber-500 hover:shadow-lg transition-all duration-200 animate-fade-in-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ממתינים</CardTitle>
            <div className="rounded-full bg-amber-50 dark:bg-amber-900/30 p-2">
              <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">טיוטות וממתינים</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      {summary.recent.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">פעילות אחרונה</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(summary.recent as SummaryEvent[]).map(event => (
                <li key={event.id} className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[60%] font-medium">{event.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {event.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[event.status] ?? STATUS_COLORS['unknown']}`}>
                        {STATUS_LABELS[event.status] ?? event.status}
                      </span>
                    )}
                    {(event.main_time ?? event.date) && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.main_time ?? event.date ?? ''), "d/M/yy", { locale: he })}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Status breakdown badges */}
            {Object.keys(summary.byStatus).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
                {Object.entries(summary.byStatus).map(([status, count]) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className={`text-xs ${STATUS_COLORS[status] ?? STATUS_COLORS['unknown']}`}
                  >
                    {STATUS_LABELS[status] ?? status}: {count}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
