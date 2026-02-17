
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";

// Define the logger type to match what's provided by the logger utility
export type LogContext = {
  component?: string;
  user?: string;
  action?: string;
  [key: string]: unknown;
};

export type LoggerType = {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  createLogger: (options: { component: string }) => LoggerType;
};

// AuthContext state interface - updated to include setter methods
export interface AuthContextState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser?: (user: User | null) => void;
  setSession?: (session: Session | null) => void;
  setProfile?: (profile: Profile | null) => void;
  setIsLoading?: (loading: boolean) => void;
}

// Debug panel props type - updated to use proper type
export interface DebugPanelProps {
  directSessionInfo: {
    hasSession: boolean;
    userId: string | null;
    loading: boolean;
    error: Error | null;
  };
  onSignOut: () => void;
  onExitDebugMode: () => void;
}
