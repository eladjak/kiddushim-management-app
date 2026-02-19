import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

interface ThemeToggleProps {
  /** Render as a compact icon-only button (default) or as a menu item with text */
  variant?: "icon" | "menu-item";
}

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (variant === "menu-item") {
    return (
      <button
        onClick={toggleTheme}
        className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label={isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      >
        {isDark ? (
          <Sun className="me-2 h-4 w-4" />
        ) : (
          <Moon className="me-2 h-4 w-4" />
        )}
        <span>{isDark ? "מצב בהיר" : "מצב כהה"}</span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
      className="h-9 w-9 rounded-full"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform" />
      ) : (
        <Moon className="h-4 w-4 transition-transform" />
      )}
    </Button>
  );
}
