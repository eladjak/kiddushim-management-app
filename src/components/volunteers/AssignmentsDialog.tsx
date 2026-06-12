/**
 * דיאלוג צפייה בשיבוצים של מתנדב/ת — נתונים אמיתיים מ-event_assignments.
 * כולל מצבי טעינה / ריק / שגיאה.
 */

import { CalendarDays, MapPin, AlertCircle, ClipboardList } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  useVolunteerAssignments,
  type VolunteerAssignment,
} from '@/hooks/volunteers/useVolunteerAssignments';

interface AssignmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  name: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  youth_volunteer: 'מתנדב/ת צעיר/ה',
  service_girl: 'בת שירות',
  coordinator: 'רכז/ת',
  admin: 'מנהל/ת',
  content_provider: 'ספק/ית תוכן',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'ממתין לאישור',
  confirmed: 'אושר',
  declined: 'נדחה',
  completed: 'הושלם',
};

function statusVariant(
  status: string | null,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'default';
    case 'declined':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatEventDate(dateStr: string, time: string | null): string {
  try {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!time) return datePart;
    const t = new Date(time);
    const timePart = Number.isNaN(t.getTime())
      ? time
      : t.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} · ${timePart}`;
  } catch {
    return dateStr;
  }
}

function AssignmentRow({ assignment }: { assignment: VolunteerAssignment }) {
  const { event } = assignment;
  return (
    <li className="rounded-lg border bg-card p-3 text-start">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">
          {event?.title ?? 'אירוע שאינו קיים עוד'}
        </span>
        <Badge variant={statusVariant(assignment.status)}>
          {assignment.status ? STATUS_LABELS[assignment.status] ?? assignment.status : 'לא ידוע'}
        </Badge>
      </div>

      {event && (
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>{formatEventDate(event.date, event.main_time)}</span>
          </div>
          {event.location_name && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{event.location_name}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-2">
        <Badge variant="outline" className="text-xs">
          {ROLE_LABELS[assignment.role] ?? assignment.role}
        </Badge>
      </div>
    </li>
  );
}

export function AssignmentsDialog({
  open,
  onOpenChange,
  userId,
  name,
}: AssignmentsDialogProps) {
  const { data, isLoading, isError, refetch } = useVolunteerAssignments(
    userId,
    open,
  );

  const displayName = name?.trim() || 'מתנדב/ת';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-start">
            <ClipboardList className="h-5 w-5 text-primary" />
            השיבוצים של {displayName}
          </DialogTitle>
          <DialogDescription className="text-start">
            רשימת האירועים שאליהם המתנדב/ת שובץ/ה.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="mt-3 text-sm">טוען שיבוצים...</span>
            </div>
          ) : isError ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-10 text-center"
              role="alert"
            >
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">
                שגיאה בטעינת השיבוצים.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                נסה/י שוב
              </button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                אין שיבוצים למתנדב/ת זה/זו עדיין.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.map((assignment) => (
                <AssignmentRow key={assignment.id} assignment={assignment} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AssignmentsDialog;
