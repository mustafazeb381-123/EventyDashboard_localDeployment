import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, User, Folder, Trash2, MoreVertical, Signal, Wifi, Battery } from "lucide-react";

export interface EmailSenderStepProps {
  useExistingSender: boolean;
  onUseExistingSenderChange: (value: boolean) => void;
  senderFromName: string;
  onSenderFromNameChange: (value: string) => void;
  senderFromEmail: string;
  onSenderFromEmailChange: (value: string) => void;
  onCancel: () => void;
  onAddSender: () => void;
}

/**
 * First step of the email confirmation flow: configure email sender with form (left)
 * and mobile inbox preview (right) matching the design screenshot.
 */
export function EmailSenderStep({
  useExistingSender,
  onUseExistingSenderChange,
  senderFromName,
  onSenderFromNameChange,
  senderFromEmail,
  onSenderFromEmailChange,
  onCancel,
  onAddSender,
}: EmailSenderStepProps) {
  const { t } = useTranslation("dashboard");
  const displayName = senderFromName.trim() || "John Doe";
  const displayEmail = senderFromEmail.trim() || "john.doe@email.com";

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Sender form */}
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="senderType"
                checked={useExistingSender}
                onChange={() => onUseExistingSenderChange(true)}
                className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
              />
              <span className="text-gray-700 font-medium">{t("expressEvent.useExistingSender")}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="senderType"
                checked={!useExistingSender}
                onChange={() => onUseExistingSenderChange(false)}
                className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
              />
              <span className="text-gray-700 font-medium">{t("expressEvent.createNewSender")}</span>
            </label>
          </div>
          {!useExistingSender && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("expressEvent.fromName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={senderFromName}
                  onChange={(e) => onSenderFromNameChange(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                />
                <p className="mt-1.5 text-sm text-gray-500">
                  {t("expressEvent.fromNameHelp")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("expressEvent.fromEmail")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={senderFromEmail}
                  onChange={(e) => onSenderFromEmailChange(e.target.value)}
                  placeholder="john.doe@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                />
                <p className="mt-1.5 text-sm text-gray-500">
                  {t("expressEvent.fromEmailHelp")}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right: Mobile inbox preview (matches screenshot) */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-[280px] flex-shrink-0 rounded-[2.75rem] border-[10px] border-gray-800 bg-gray-800 overflow-hidden shadow-2xl">
            {/* Dynamic Island notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-[100px] h-7 bg-black rounded-full" />
            {/* Screen content */}
            <div className="relative w-full min-h-[420px] bg-white rounded-[2rem] overflow-hidden">
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 pt-3 pb-1">
                <span className="text-[13px] font-medium text-black">9:41</span>
                <div className="flex items-center gap-1">
                  <Signal size={12} className="text-black" strokeWidth={2.5} />
                  <Wifi size={12} className="text-black" strokeWidth={2.5} />
                  <Battery size={14} className="text-black" strokeWidth={2} />
                </div>
              </div>
              {/* Navigation / action bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <button type="button" className="p-1.5 -ml-1.5 text-gray-700" aria-label="Back">
                  <ChevronLeft size={22} strokeWidth={2} />
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" className="p-1.5 text-gray-600" aria-label="Folder">
                    <Folder size={20} strokeWidth={2} />
                  </button>
                  <button type="button" className="p-1.5 text-gray-600" aria-label="Trash">
                    <Trash2 size={20} strokeWidth={2} />
                  </button>
                  <button type="button" className="p-1.5 text-gray-600" aria-label="More">
                    <MoreVertical size={20} strokeWidth={2} />
                  </button>
                </div>
              </div>
              {/* Inbox content */}
              <div className="px-4 py-4">
                <p className="text-base font-semibold text-gray-900 mb-0.5">{t("expressEvent.oInbox")}</p>
                <p className="text-xs text-gray-500 mb-4">10 June 2021, 19:45</p>
                <p className="text-xs text-gray-600 mb-2">From:</p>
                <div className="inline-flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-gray-100 border border-gray-200 shadow-sm min-w-0 max-w-full">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0 flex-shrink-0">
                    <User size={14} className="text-gray-500" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate leading-tight">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
        >
          {t("expressEvent.cancel")}
        </button>
        <button
          type="button"
          onClick={onAddSender}
          className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98]"
        >
          {t("expressEvent.addSender")}
        </button>
      </div>
    </>
  );
}
