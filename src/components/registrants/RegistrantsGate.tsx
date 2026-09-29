import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { canViewRegistrants } from "@/lib/registrants";

/**
 * Renders children ONLY for admin/coordinator. Fails closed: while loading, when signed out,
 * or when the role is missing, nothing sensitive is mounted (so no registrant query is fired).
 * RLS on event_registrations is the real wall; this is the UI/behaviour gate on top of it.
 */
export const RegistrantsGate = ({ children }: { children: ReactNode }) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="p-8 text-center">
        טוען...
      </div>
    );
  }

  if (!canViewRegistrants(profile?.role)) {
    return (
      <div role="alert" dir="rtl" className="p-8 text-center">
        אין לך הרשאה לצפות ברשימת הנרשמים.
      </div>
    );
  }

  return <>{children}</>;
};
