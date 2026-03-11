import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { InvitationForm, InvitationType } from "./newInvitationTypes";

type InvitationDetailsTabProps = {
  invitationForm: InvitationForm;
  setInvitationForm: React.Dispatch<React.SetStateAction<InvitationForm>>;
  enableRsvp: boolean;
  setEnableRsvp: (value: boolean) => void;
  eventData: any;
  eventId: string | null;
};

export function InvitationDetailsTab({
  invitationForm,
  setInvitationForm,
  enableRsvp,
  setEnableRsvp,
  eventData,
  eventId,
}: InvitationDetailsTabProps) {
  const { t } = useTranslation("dashboard");
  return (
    <>
      <h3 className="text-base font-semibold text-slate-800 mb-6">
        {t("invitation.details.basicInformation")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("invitation.details.invitationName")}
            </label>
            <input
              type="text"
              placeholder={t("invitation.details.invitationNamePlaceholder")}
              value={invitationForm.invitationName}
              onChange={(e) =>
                setInvitationForm({
                  ...invitationForm,
                  invitationName: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("invitation.details.communicationType")}
            </label>
            <select
              value={invitationForm.communicationType}
              onChange={(e) =>
                setInvitationForm({
                  ...invitationForm,
                  communicationType: e.target.value as InvitationType,
                })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-slate-900"
            >
              <option value="email">{t("invitation.details.emailOption")}</option>
              <option value="sms">{t("invitation.details.smsOption")}</option>
              <option value="whatsapp">{t("invitation.details.whatsappOption")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("invitation.details.scheduleSendAt")}{" "}
              <span className="text-slate-400 font-normal">({t("invitation.details.optional")})</span>
            </label>
            <input
              type="datetime-local"
              value={invitationForm.scheduleSendAt}
              onChange={(e) =>
                setInvitationForm({
                  ...invitationForm,
                  scheduleSendAt: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              {t("invitation.details.leaveEmptyToSendImmediately")}
            </p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("invitation.details.event")}
            </label>
            <input
              type="text"
              readOnly
              value={
                eventData?.data?.attributes?.name ??
                (eventId ? `Event (ID: ${eventId})` : "—")
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 text-slate-700 cursor-not-allowed"
              tabIndex={-1}
              aria-readonly="true"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("invitation.details.invitationLanguage")}
            </label>
            <select
              value={invitationForm.language}
              onChange={(e) =>
                setInvitationForm({
                  ...invitationForm,
                  language: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-slate-900"
            >
              <option value="en">{t("invitation.details.english")}</option>
              <option value="ar">Arabic (العربية)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1.5">
              {t("invitation.details.languageDescription")}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("invitation.details.emailSender")}
            </label>
            <input
              type="email"
              placeholder={t("invitation.details.emailSenderPlaceholder")}
              value={invitationForm.emailSender}
              onChange={(e) =>
                setInvitationForm({
                  ...invitationForm,
                  emailSender: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              {t("invitation.details.emailSenderDescription")}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">{t("invitation.details.enableRsvp")}</span>
        <button
          type="button"
          className="p-0.5 rounded-full text-slate-400 hover:text-slate-600"
          title={t("invitation.details.rsvpTooltip")}
          aria-label="Info about RSVP"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={enableRsvp}
          onClick={() => setEnableRsvp(!enableRsvp)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            enableRsvp ? "bg-indigo-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
              enableRsvp ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-xs text-slate-500">
          {t("invitation.details.letInviteesRespond")}
        </span>
      </div>
    </>
  );
}
