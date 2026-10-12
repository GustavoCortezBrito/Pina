"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative overflow-hidden rounded-full"
      aria-label="Alternar tema claro/escuro"
      title="Alternar tema claro/escuro"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="size-5 rotate-0 scale-100 text-primary-ink transition-all duration-500 dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute size-5 rotate-90 scale-0 text-primary-ink transition-all duration-500 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
