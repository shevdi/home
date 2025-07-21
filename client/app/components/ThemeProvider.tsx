import React from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

const theme = {
  colors: {
    primary: "#2563eb",
    secondary: "#6b7280",
    success: "#059669",
    text: "#1f2937",
    textSecondary: "#6b7280",
    background: "#ffffff",
    border: "#e5e7eb",
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
};

export { theme };
