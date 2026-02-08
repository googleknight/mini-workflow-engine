"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.css";
import { LABELS } from "@/lib/constants";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={LABELS.TOGGLE_THEME}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
