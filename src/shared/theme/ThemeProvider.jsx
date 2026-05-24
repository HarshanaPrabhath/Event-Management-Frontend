import { useEffect, useMemo, useState } from "react";

import { ThemeContext } from "./themeContext";

const STORAGE_KEY = "eventflow-theme";

const getInitialTheme = () => {
  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  } catch {
    return "dark";
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors; the current session theme still applies.
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === "light",
      toggleTheme: () => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
