import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getRsvpTemplate, rsvpResponse } from "@/apis/invitationService";
import { RsvpFormPreview } from "./rsvpFormBuilder/RsvpFormPreview";
import type {
  RsvpFormBuilderTemplate,
  RsvpFormField,
  RsvpTheme,
  RsvpLanguageConfig,
} from "./rsvpFormBuilder/types";

/**
 * Normalize API rsvp_template (object or string) to RsvpFormBuilderTemplate.
 * Backend returns { rsvp_template: {} }; if empty (e.g. {}), do not show template.
 */
function normalizeRsvpTemplate(raw: unknown): RsvpFormBuilderTemplate | null {
  if (raw == null) return null;
  let parsed: {
    title?: string;
    formFields?: unknown[];
    theme?: RsvpTheme;
    languageConfig?: RsvpLanguageConfig;
  };
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return null;
    }
  } else if (typeof raw === "object" && raw !== null) {
    parsed = raw as typeof parsed;
  } else {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  // Do not show template if empty (e.g. {} or no meaningful content)
  if (Object.keys(parsed).length === 0) return null;
  return {
    id: "rsvp-public",
    title: parsed.title ?? "RSVP",
    formFields: (Array.isArray(parsed.formFields)
      ? parsed.formFields
      : []) as RsvpFormField[],
    theme: parsed.theme ?? {},
    languageConfig: parsed.languageConfig ?? {
      languageMode: "single",
      primaryLanguage: "en",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Public RSVP page at /rsvp/:eventId/:invitationId?tenant_uuid=...&rsvp_token=...
 * or /rsvp/:eventId?invitation_id=...&tenant_uuid=...&rsvp_token=...
 * tenant_uuid and rsvp_token come from the backend (in the link sent in the invitation email).
 * invitationId can be in the path or in the query as invitation_id (so links work the first time from email).
 * We use only these URL params for APIs – no localStorage. GET rsvp_template and POST rsvp_response both use them.
 */
export default function RsvpPage() {
  const { t } = useTranslation("dashboard");
  const params = useParams<{
    eventId?: string;
    invitationId?: string;
    id?: string;
  }>();
  const [searchParams] = useSearchParams();
  const eventId = params.eventId ?? params.id ?? undefined;
  /** Invitation ID from path (e.g. /rsvp/171/25) or query (e.g. ?invitation_id=25) so both link formats work. */
  const invitationIdParam = params.invitationId ?? searchParams.get("invitation_id") ?? undefined;

  /** From backend via link – we accept and use only these, no localStorage fallback. */
  const tenantUuid = searchParams.get("tenant_uuid");
  const rsvpTokenFromUrl = searchParams.get("rsvp_token");

  const [rsvpTemplate, setRsvpTemplate] =
    useState<RsvpFormBuilderTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"accepted" | "declined" | null>(
    null,
  );
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    console.log("[RSVP] URL params:", {
      eventId,
      invitationIdParam,
      tenantUuid: tenantUuid ? `${tenantUuid.slice(0, 8)}...` : null,
      rsvpTokenFromUrl: rsvpTokenFromUrl ? `${rsvpTokenFromUrl.slice(0, 8)}...` : null,
      fullUrl: typeof window !== "undefined" ? window.location.href : "",
    });

    if (!eventId) {
      setError(
        "Event ID is missing. Please use the full RSVP link from your invitation email.",
      );
      setLoading(false);
      return;
    }
    if (!invitationIdParam) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
      setError(
        `Invitation ID is missing. Your link is "${currentPath}" but it must include the invitation ID after the event ID, e.g. /rsvp/167/25?tenant_uuid=...&rsvp_token=... (the "25" is the invitation ID). The sender needs to re-save the invitation and send again so emails contain the full link.`,
      );
      setLoading(false);
      return;
    }
    if (!tenantUuid) {
      setError(
        "Tenant is missing. Please use the full RSVP link from your invitation email.",
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    const invitationId = invitationIdParam;

    const load = async () => {
      try {
        console.log("[RSVP] Requesting template:", { eventId, invitationId, hasTenantUuid: !!tenantUuid });
        const templateRes = await getRsvpTemplate(
          eventId,
          invitationId,
          tenantUuid,
        );
        if (cancelled) return;
        console.log("[RSVP] Template response:", { hasData: !!templateRes?.data, hasRsvpTemplate: !!templateRes?.data?.rsvp_template });

        const raw = templateRes?.data?.rsvp_template;
        const template = normalizeRsvpTemplate(raw);
        setRsvpTemplate(template ?? null);
      } catch (err: unknown) {
        if (!cancelled) {
          const ax = err as {
            response?: {
              status?: number;
              statusText?: string;
              data?: { error?: string; message?: string };
              config?: { url?: string; baseURL?: string };
            };
          };
          const status = ax?.response?.status;
          const data = ax?.response?.data;
          console.log("[RSVP] Error:", {
            status,
            statusText: ax?.response?.statusText,
            data,
            requestUrl: ax?.response?.config?.baseURL && ax?.response?.config?.url ? `${ax.response.config.baseURL}${ax.response.config.url}` : null,
          });
          const msg =
            data?.error ??
            data?.message ??
            (err && typeof err === "object" && "message" in err
              ? String((err as Error).message)
              : "Failed to load RSVP.");
          setError(
            status === 404
              ? "This RSVP link may be invalid or expired. Please use the link from your invitation email."
              : msg,
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId, invitationIdParam, tenantUuid]);

  const handleRsvpResponse = useCallback(
    async (response: "accepted" | "declined") => {
      if (!rsvpTokenFromUrl || !rsvpTokenFromUrl.trim()) {
        setSubmitMessage({
          type: "error",
          text: "RSVP link is invalid. Please use the link from your invitation email.",
        });
        return;
      }
      if (!tenantUuid) {
        setSubmitMessage({
          type: "error",
          text: "Missing tenant. Please use the full link from your invitation email.",
        });
        return;
      }
      setSubmitting(response);
      setSubmitMessage(null);
      console.log("[RSVP] Attend/Decline API – request:", {
        response: response,
        rsvp_token: rsvpTokenFromUrl ? `${rsvpTokenFromUrl.slice(0, 8)}...` : null,
        tenant_uuid: tenantUuid ? `${tenantUuid.slice(0, 8)}...` : null,
      });
      try {
        const res = await rsvpResponse(rsvpTokenFromUrl, response, tenantUuid);
        console.log("[RSVP] Attend/Decline API – success:", res?.data);
        setSubmitMessage({
          type: "success",
          text:
            response === "accepted"
              ? "Thank you! Your attendance has been recorded."
              : "Thank you for letting us know. Your response has been recorded.",
        });
      } catch (err: unknown) {
        const errResp = err && typeof err === "object" && "response" in err ? (err as { response?: { data?: unknown; status?: number } }).response : undefined;
        console.log("[RSVP] Attend/Decline API – error:", {
          status: errResp?.status,
          data: errResp?.data,
          fullError: err,
        });
        const status =
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status;
        const dataError =
          err &&
          typeof err === "object" &&
          "response" in err &&
          (
            err as {
              response?: { data?: { error?: string; message?: string } };
            }
          ).response?.data?.error;
        const dataMessage =
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message;
        let msg: string;
        if (status === 404) {
          msg =
            "This RSVP link may be invalid or expired. Please use the link from your invitation email.";
        } else if (dataError) {
          msg = String(dataError);
        } else if (dataMessage) {
          msg = String(dataMessage);
        } else if (err && typeof err === "object" && "message" in err) {
          msg = String((err as Error).message);
        } else {
          msg =
            "Failed to record your response. Please try again or use the link from your invitation email.";
        }
        setSubmitMessage({ type: "error", text: msg });
      } finally {
        setSubmitting(null);
      }
    },
    [rsvpTokenFromUrl, tenantUuid],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">{t("invitation.rsvpPage.loadingRsvp")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-2">{t("invitation.rsvpPage.unableToLoadRsvp")}</p>
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
            {submitMessage && submitMessage.type !== "success" && (
              <div className="mx-4 mt-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-800">
                {submitMessage.text}
              </div>
            )}
            <RsvpFormPreview
              formFields={rsvpTemplate.formFields}
              theme={rsvpTemplate.theme}
              currentLanguage={
                rsvpTemplate.languageConfig?.primaryLanguage ?? "en"
              }
              visibleOnly={true}
              showActionButtons={submitMessage?.type !== "success"}
              responseSubmitted={submitMessage?.type === "success"}
              onAttendClick={() => handleRsvpResponse("accepted")}
              onDeclineClick={() => handleRsvpResponse("declined")}
              attendButtonDisabled={submitting !== null}
              declineButtonDisabled={submitting !== null}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              RSVP for Event {eventId}
            </h1>
            <p className="text-slate-600">
              No RSVP form is available for this event yet. If you received an
              invitation email, use the RSVP link in that email to respond.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
