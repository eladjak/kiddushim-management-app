import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "../ThemeProvider";

// Mock the logger
vi.mock("@/utils/logger", () => ({
  logger: {
    createLogger: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────

let addEventListenerSpy: ReturnType<typeof vi.fn>;
let removeEventListenerSpy: ReturnType<typeof vi.fn>;
let matchMediaMatches: boolean;

function setupMatchMedia(prefersDark = false) {
  matchMediaMatches = prefersDark;
  addEventListenerSpy = vi.fn();
  removeEventListenerSpy = vi.fn();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchMediaMatches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      dispatchEvent: vi.fn(),
    })),
  });
}

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function wrapperWithDefault(defaultTheme: "light" | "dark" | "system") {
  return ({ children }: { children: ReactNode }) => (
    <ThemeProvider defaultTheme={defaultTheme}>{children}</ThemeProvider>
  );
}

// ─── Test Consumer ────────────────────────────────────────────────

function ThemeConsumer() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("system")}>Set System</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

// ─── Tests ────────────────────────────────────────────────────────

describe("ThemeProvider", () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    };
  })();

  beforeEach(() => {
    setupMatchMedia(false); // default: prefers light
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ──────────── Initial state ────────────

  it("defaults to 'system' theme when no localStorage value exists", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme").textContent).toBe("system");
  });

  it("resolves system theme to 'light' when system prefers light", () => {
    setupMatchMedia(false);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });

  it("resolves system theme to 'dark' when system prefers dark", () => {
    setupMatchMedia(true);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  // ──────────── localStorage persistence ────────────

  it("reads theme from localStorage on mount", () => {
    localStorageMock.setItem("kidushishi-theme", "dark");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("saves theme to localStorage when setTheme is called", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("Set Dark"));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("kidushishi-theme", "dark");
  });

  it("ignores invalid localStorage values and falls back to default", () => {
    localStorageMock.setItem("kidushishi-theme", "invalid-value");
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    // Should fall back to default "system"
    expect(screen.getByTestId("theme").textContent).toBe("system");
  });

  // ──────────── Theme switching ────────────

  it("switches to dark theme via setTheme", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("Set Dark"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("applies dark class to document.documentElement", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("Set Dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("toggles from light to dark and back", () => {
    setupMatchMedia(false);
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("resolved").textContent).toBe("light");

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("resolved").textContent).toBe("dark");

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });

  // ──────────── useTheme outside provider ────────────

  it("throws an error when useTheme is used outside ThemeProvider", () => {
    // Suppress console.error from React for expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");

    spy.mockRestore();
  });

  // ──────────── defaultTheme prop ────────────

  it("uses defaultTheme prop when localStorage is empty", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });
});
