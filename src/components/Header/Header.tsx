import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, User } from "lucide-react";
import { Button } from "../ui/button";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

function Header({ isExpanded }: { isExpanded: boolean }) {
  const [isRTL, setIsRTL] = useState(false);
  const { t } = useTranslation("dashboard");

  // Detect RTL direction and listen for changes
  useEffect(() => {
    const checkRTL = () => {
      const dir =
        document.documentElement.dir ||
        document.documentElement.getAttribute("dir");
      setIsRTL(dir === "rtl");
    };

    // Check initially
    checkRTL();

    // Create observer to watch for direction changes
    const observer = new MutationObserver(() => {
      checkRTL();
    });

    // Watch for changes to the dir attribute
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-slate-900"
      style={{
        paddingLeft: isRTL ? "16px" : isExpanded ? "296px" : "88px",
        paddingRight: isRTL ? (isExpanded ? "296px" : "88px") : "16px",
      }}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
          {t("header.dashboard")}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageToggle />
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-slate-700">
            <User className="h-4 w-4" />
          </div>
          <span>{t("header.myAccount")}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
