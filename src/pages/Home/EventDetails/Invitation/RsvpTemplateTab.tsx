import { Check, X } from "lucide-react";
import { RSVP_TEMPLATE_DATA } from "./rsvpTemplateData";

type RsvpTemplateTabProps = {
  rsvpEmailSubject: string;
  setRsvpEmailSubject: (value: string) => void;
};

export function RsvpTemplateTab({
  rsvpEmailSubject,
  setRsvpEmailSubject,
}: RsvpTemplateTabProps) {
  const { event, invitation, rsvp } = RSVP_TEMPLATE_DATA;

  return (
    <div className="space-y-10">
      {/* RSVP email subject */}
      <div className="max-w-xl">
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          RSVP email subject
        </label>
        <input
          type="text"
          placeholder="e.g., Please confirm your attendance"
          value={rsvpEmailSubject}
          onChange={(e) => setRsvpEmailSubject(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-shadow"
        />
      </div>

      {/* RSVP email preview */}
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          RSVP email preview
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          Invitees receive this email with a unique RSVP link. They can confirm
          attendance or add an optional note.
        </p>
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden ring-1 ring-slate-900/5">
          {/* Event header */}
          <div className="px-6 py-6 bg-gradient-to-br from-slate-800 to-slate-700 text-white">
            <h4 className="text-lg font-bold uppercase tracking-wider text-white/95">
              {event.eventName}
            </h4>
            <p className="text-sm text-slate-300 mt-2 flex items-center gap-1.5">
              <span>{event.eventDate}</span>
            </p>
            <p className="text-sm text-slate-300 mt-0.5">{event.eventLocation}</p>
            <p className="text-xs text-slate-400 mt-3">
              Powered by {event.poweredBy}
            </p>
          </div>

          {/* Invitation body */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <p className="text-sm font-semibold text-slate-900">
              {invitation.recipientName}
            </p>
            <p className="text-sm text-slate-700 mt-3 leading-relaxed">
              {invitation.mainMessage}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <span>
                <span className="font-medium text-slate-700">Date:</span>{" "}
                {invitation.date}
              </span>
              <span>
                <span className="font-medium text-slate-700">Location:</span>{" "}
                {invitation.location}
              </span>
            </div>
          </div>

          {/* RSVP actions – matches invitee flow (Yes / No + optional note) */}
          <div className="px-6 py-6 bg-white">
            <p className="text-sm font-medium text-slate-800">{rsvp.instruction}</p>
            <p className="text-sm text-slate-600 mt-1">{rsvp.noteAfterConfirm}</p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <div className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm shadow-sm ring-2 ring-emerald-600/20">
                <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                <span>{rsvp.acceptButtonText}</span>
              </div>
              <div className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm shadow-sm ring-2 ring-red-600/20">
                <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                <span>{rsvp.declineButtonText}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm">
                Optional note here…
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-4">{rsvp.closingMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
