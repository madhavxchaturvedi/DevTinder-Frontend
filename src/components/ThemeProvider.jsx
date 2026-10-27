import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { useTheme };

export function ThemeToggle() { return null; }

export default ThemeProvider;
