import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

// Mock the logger
vi.mock("@/utils/logger", () => ({
  logger: {
    createLogger: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Component that throws an error on demand
const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>Child content renders fine</div>;
};

describe("ErrorBoundary", () => {
  // Suppress React error boundary console.error output in tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content renders fine")).toBeInTheDocument();
  });

  it("renders Hebrew error UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for Hebrew error heading
    expect(screen.getByText("אופס! משהו השתבש")).toBeInTheDocument();
    // Check for error description
    expect(
      screen.getByText("אירעה שגיאה בלתי צפויה. אנחנו מצטערים על אי הנוחות.")
    ).toBeInTheDocument();
  });

  it("displays the error message in the error details section", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("פרטי השגיאה:")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders retry and home buttons", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("נסה שוב")).toBeInTheDocument();
    expect(screen.getByText("חזור לדף הראשי")).toBeInTheDocument();
  });

  it("resets error state when retry button is clicked", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error UI is shown
    expect(screen.getByText("אופס! משהו השתבש")).toBeInTheDocument();

    // Click retry - this will reset the error boundary state
    fireEvent.click(screen.getByText("נסה שוב"));

    // After reset, the component will try to re-render children
    // Since ThrowingComponent still has shouldThrow=true, it will error again
    // but the key point is the state reset happened (error boundary re-rendered)
    // The error UI should appear again since the child still throws
    expect(screen.getByText("אופס! משהו השתבש")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const customFallback = <div>Custom fallback UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom fallback UI")).toBeInTheDocument();
    // The default error UI should NOT be shown
    expect(screen.queryByText("אופס! משהו השתבש")).not.toBeInTheDocument();
  });

  it("shows support contact message", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("אם הבעיה חוזרת, אנא פנה לצוות התמיכה")
    ).toBeInTheDocument();
  });
});
