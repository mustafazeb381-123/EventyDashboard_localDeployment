import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { updateDirection } from "@/utils/i18n";
import "../styles/rtl.css";

/**
 * RTL Wrapper Component
 * 
 * Scopes RTL support to Custom Advance Registration module only.
 * This component applies RTL direction to its container, not globally.
 * 
 * For global extension: Remove this wrapper and apply RTL at app root level.
 */
interface RTLWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const RTLWrapper: React.FC<RTLWrapperProps> = ({
  children,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Apply RTL direction only to this container
      updateDirection(i18n.language, containerRef.current);
    }
  }, [i18n.language]);

  // Update direction when language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (containerRef.current) {
        updateDirection(lng, containerRef.current);
      }
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  return (
    <div
      ref={containerRef}
      className={`custom-advance-registration-module ${className}`}
    >
      {children}
    </div>
  );
};
