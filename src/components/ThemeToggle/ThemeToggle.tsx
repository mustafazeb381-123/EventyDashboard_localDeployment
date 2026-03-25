import { MoonStar, SunMedium } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "../ui/button";
import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { t } = useTranslation("dashboard");
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";
  const Icon = isDark ? SunMedium : MoonStar;
  const label = isDark ? t("header.darkMode") : t("header.lightMode");
  const title = isDark ? t("header.switchToLight") : t("header.switchToDark");

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={toggleTheme}
      title={title}
      aria-label={title}
      className="h-10 rounded-md border border-gray-200 bg-white px-3 text-gray-700 shadow-sm hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

export default ThemeToggle;
