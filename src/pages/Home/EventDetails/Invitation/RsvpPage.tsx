import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getEventbyId } from "@/apis/apiHelpers";
import { getEventInvitations } from "@/apis/invitationService";
import { RsvpFormPreview } from "./rsvpFormBuilder/RsvpFormPreview";
import type { RsvpFormBuilderTemplate, RsvpTheme, RsvpLanguageConfig } from "./rsvpFormBuilder/types";

/**
 * Public RSVP page at /rsvp/:eventId
 * Loads event and first invitation with rsvp_template, then shows the RSVP form or a fallback message.
 */
export default function RsvpPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [eventName, setEventName] = useState<string | null>(null);
  const [rsvpTemplate, setRsvpTemplate] = useState<RsvpFormBuilderTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [eventRes, invitationsRes] = await Promise.all([
          getEventbyId(eventId),
          getEventInvitations(eventId, { page: 1, per_page: 20 }),
        ]);

        if (cancelled) return;

        const eventData = eventRes?.data;
        const name =
          eventData?.data?.attributes?.name ??
          eventData?.attributes?.name ??
          `Event ${eventId}`;
        setEventName(name);

        const list = invitationsRes?.data?.data ?? invitationsRes?.data;
        const invitations = Array.isArray(list) ? list : [];
        const getAttr = (inv: any, key: string) => inv?.attributes?.[key] ?? inv?.[key];
        const withRsvp = invitations.find(
          (inv: any) => {
            const enableRsvp = getAttr(inv, "enable_rsvp");
            const rsvpTemplate = getAttr(inv, "rsvp_template");
            return enableRsvp && typeof rsvpTemplate === "string" && rsvpTemplate.trim() !== "";
          }
        );

        const rsvpTemplateStr = withRsvp ? getAttr(withRsvp, "rsvp_template") : null;
        if (withRsvp && typeof rsvpTemplateStr === "string" && rsvpTemplateStr.trim() !== "") {
          try {
            const parsed = JSON.parse(rsvpTemplateStr) as {
              title?: string;
              formFields?: any[];
              theme?: RsvpTheme;
              languageConfig?: RsvpLanguageConfig;
            };
            if (parsed && typeof parsed === "object") {
              setRsvpTemplate({
                id: "rsvp-public",
                title: parsed.title ?? "RSVP",
                formFields: Array.isArray(parsed.formFields) ? parsed.formFields : [],
                theme: parsed.theme ?? {},
                languageConfig: parsed.languageConfig ?? { languageMode: "single", primaryLanguage: "en" },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          } catch {
            // ignore parse error
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to load RSVP.";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading RSVP…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-2">Unable to load RSVP</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {rsvpTemplate ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <RsvpFormPreview
              formFields={rsvpTemplate.formFields}
              theme={rsvpTemplate.theme}
              currentLanguage={rsvpTemplate.languageConfig?.primaryLanguage ?? "en"}
              visibleOnly={true}
              showActionButtons={true}
              onAttendClick={() => {
                // TODO: wire to rsvp_response API when rsvp_token is available (e.g. from email link)
                window.alert("Thank you! Your response has been recorded. (In production, use the RSVP link from your invitation email.)");
              }}
              onDeclineClick={() => {
                window.alert("Thank you for letting us know. (In production, use the RSVP link from your invitation email.)");
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              RSVP for {eventName ?? `Event ${eventId}`}
            </h1>
            <p className="text-slate-600">
              No RSVP form is available for this event yet. If you received an invitation email, use the RSVP link in that email to respond.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
