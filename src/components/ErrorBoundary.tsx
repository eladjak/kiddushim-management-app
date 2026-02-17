import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/utils/logger";

const log = logger.createLogger({ component: "ErrorBoundary" });

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch runtime errors in the React tree.
 * Shows a friendly Hebrew fallback UI and logs errors for debugging.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    log.error("Uncaught error in React tree", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          dir="rtl"
          className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-red-50 to-background p-6"
        >
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-red-600">
                אופס! משהו השתבש
              </h1>
              <p className="text-muted-foreground text-lg">
                אירעה שגיאה בלתי צפויה. אנחנו מצטערים על אי הנוחות.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 text-right">
                <p className="font-medium mb-1">פרטי השגיאה:</p>
                <p className="font-mono text-xs break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                נסה שוב
              </button>
              <button
                onClick={this.handleReload}
                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                חזור לדף הראשי
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              אם הבעיה חוזרת, אנא פנה לצוות התמיכה
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
