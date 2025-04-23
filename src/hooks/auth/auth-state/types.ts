
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/auth";

// Define the logger type to match what's provided by the logger utility
export type LogContext = {
  component?: string;
  user?: string;
  action?: string;
  [key: string]: any;
};

export type LoggerType = {
  debug: (message: string, context?: LogContext) => any;
  info: (message: string, context?: LogContext) => any;
  warn: (message: string, context?: LogContext) => any;
  error: (message: string, context?: LogContext) => any;
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
    error: any | null;
  };
  onSignOut: () => void;
  onExitDebugMode: () => void;
}
