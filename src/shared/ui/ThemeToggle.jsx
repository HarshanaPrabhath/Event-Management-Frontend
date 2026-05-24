import { Moon, Sun } from "lucide-react";

import { useTheme } from "../theme/useTheme";

function ThemeToggle({ className = "" }) {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`h-10 w-10 shrink-0 rounded-xl border theme-border theme-bg-surface-muted theme-text transition-colors theme-hover-bg theme-hover-text ${className}`}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      <span className="flex h-full w-full items-center justify-center">
        {isLight ? <Moon size={17} /> : <Sun size={17} />}
      </span>
    </button>
  );
}

export default ThemeToggle;
