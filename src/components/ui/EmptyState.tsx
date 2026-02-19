import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type IllustrationType = "events" | "reports" | "users" | "search" | "general";

interface EmptyStateProps {
  /** Which inline SVG illustration to render. */
  illustration?: IllustrationType;
  /** Main title displayed below the illustration. */
  title: string;
  /** Secondary description text. */
  description?: string;
  /** Optional call-to-action button label. */
  actionLabel?: string;
  /** Handler for the CTA button click. */
  onAction?: () => void;
  /** Optional extra content rendered below the description. */
  children?: ReactNode;
}

/* ---------- inline SVG illustrations ---------- */

const EventsIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="mx-auto"
  >
    {/* Calendar body */}
    <rect x="20" y="30" width="80" height="70" rx="8" fill="#EBF5FF" stroke="#93C5FD" strokeWidth="2" />
    {/* Calendar header */}
    <rect x="20" y="30" width="80" height="22" rx="8" fill="#93C5FD" />
    {/* Calendar rings */}
    <rect x="40" y="24" width="4" height="14" rx="2" fill="#60A5FA" />
    <rect x="76" y="24" width="4" height="14" rx="2" fill="#60A5FA" />
    {/* Grid lines */}
    <line x1="20" y1="68" x2="100" y2="68" stroke="#BFDBFE" strokeWidth="1" />
    <line x1="20" y1="82" x2="100" y2="82" stroke="#BFDBFE" strokeWidth="1" />
    <line x1="46" y1="52" x2="46" y2="100" stroke="#BFDBFE" strokeWidth="1" />
    <line x1="73" y1="52" x2="73" y2="100" stroke="#BFDBFE" strokeWidth="1" />
    {/* Star */}
    <path
      d="M60 58l2.5 5 5.5.8-4 3.9.9 5.3-5-2.6-4.9 2.6.9-5.3-4-3.9 5.5-.8z"
      fill="#FBBF24"
      stroke="#F59E0B"
      strokeWidth="0.5"
    />
  </svg>
);

const ReportsIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="mx-auto"
  >
    {/* Clipboard */}
    <rect x="30" y="20" width="60" height="80" rx="6" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="2" />
    {/* Clipboard clip */}
    <rect x="45" y="14" width="30" height="14" rx="4" fill="#86EFAC" />
    {/* Lines */}
    <rect x="42" y="45" width="36" height="3" rx="1.5" fill="#BBF7D0" />
    <rect x="42" y="55" width="28" height="3" rx="1.5" fill="#BBF7D0" />
    <rect x="42" y="65" width="32" height="3" rx="1.5" fill="#BBF7D0" />
    {/* Checkmark circle */}
    <circle cx="75" cy="82" r="14" fill="#22C55E" />
    <path d="M69 82l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="mx-auto"
  >
    {/* Center person */}
    <circle cx="60" cy="42" r="14" fill="#E0E7FF" stroke="#A5B4FC" strokeWidth="2" />
    <path d="M36 90c0-13.3 10.7-24 24-24s24 10.7 24 24" stroke="#A5B4FC" strokeWidth="2" fill="#EEF2FF" />
    {/* Left person (smaller) */}
    <circle cx="32" cy="52" r="10" fill="#F3E8FF" stroke="#C4B5FD" strokeWidth="1.5" />
    <path d="M16 84c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#C4B5FD" strokeWidth="1.5" fill="#F5F3FF" />
    {/* Right person (smaller) */}
    <circle cx="88" cy="52" r="10" fill="#F3E8FF" stroke="#C4B5FD" strokeWidth="1.5" />
    <path d="M72 84c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="#C4B5FD" strokeWidth="1.5" fill="#F5F3FF" />
  </svg>
);

const SearchIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="mx-auto"
  >
    {/* Magnifying glass circle */}
    <circle cx="52" cy="52" r="26" fill="#FEF3C7" stroke="#FBBF24" strokeWidth="2.5" />
    {/* Handle */}
    <line x1="72" y1="72" x2="96" y2="96" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
    {/* Question mark */}
    <path
      d="M47 44c0-4.4 3.6-8 8-8s8 3.6 8 8c0 3-1.7 5.5-4 6.7v3.3"
      stroke="#F59E0B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="55" cy="60" r="1.5" fill="#F59E0B" />
  </svg>
);

const GeneralIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="mx-auto"
  >
    {/* Box body */}
    <rect x="25" y="45" width="70" height="50" rx="4" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
    {/* Box flaps */}
    <path d="M25 45l35-18 35 18" stroke="#D1D5DB" strokeWidth="2" fill="#F9FAFB" />
    {/* Inner shadow line */}
    <path d="M35 50h50" stroke="#E5E7EB" strokeWidth="1" />
    {/* Dashed circle inside box */}
    <circle cx="60" cy="72" r="12" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
  </svg>
);

const ILLUSTRATIONS: Record<IllustrationType, () => JSX.Element> = {
  events: EventsIllustration,
  reports: ReportsIllustration,
  users: UsersIllustration,
  search: SearchIllustration,
  general: GeneralIllustration,
};

/**
 * Reusable empty-state component with inline SVG illustrations.
 * All text is expected in Hebrew.
 */
export const EmptyState = ({
  illustration = "general",
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) => {
  const Illustration = ILLUSTRATIONS[illustration];

  return (
    <div className="flex flex-col items-center py-12 px-4" role="status" aria-label={title}>
      <Illustration />
      <h2 className="text-xl font-semibold mt-6 mb-2 text-center">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="mb-4">
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
};
