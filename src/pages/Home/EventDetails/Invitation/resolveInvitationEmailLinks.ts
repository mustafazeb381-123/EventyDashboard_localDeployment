/**
 * Resolve invitation email link placeholders so recipients get clickable links.
 *
 * REGISTRATION: /register/{event_uuid}?tenant_uuid=...&event_id=...
 *
 * RSVP LINK FLOW (for backend):
 * 1. Email template has: href="{{rsvp_link}}" (e.g. <a href="{{rsvp_link}}">RSVP Now</a>)
 * 2. Frontend replaces {{rsvp_link}} with /rsvp/ URL + placeholders, e.g.:
 *    https://origin.com/rsvp/167/25?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}}
 * 3. Backend when sending each email: replace {{tenant_uuid}} and {{rsvp_token}} with real values.
 * See BACKEND_RSVP_LINK.md in this folder for full backend guide.
 */

export const REGISTRATION_LINK_VIP_TOKEN = "{{registration_link_vip}}";
export const RSVP_LINK_TOKEN = "{{rsvp_link}}";
/** Backend replaces with tenant UUID when sending emails. */
export const TENANT_UUID_PLACEHOLDER = "{{tenant_uuid}}";
/** Backend replaces with per-invitee token when sending emails. */
export const RSVP_TOKEN_PLACEHOLDER = "{{rsvp_token}}";

/**
 * Origin for registration and RSVP links (used in emails and "Copy link").
 * In production, set VITE_APP_PUBLIC_URL to your deployed frontend URL so links in emails are never localhost.
 * (Vite inlines this at build time – set it in Vercel/hosting env vars and redeploy.)
 */
function getPublicOrigin(): string {
  const envUrl = typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_APP_PUBLIC_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin;
    // In production build, avoid embedding localhost in saved invitation body (links in emails would be wrong)
    const isLocalhost =
      origin === "http://localhost:5173" ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1");
    if (typeof import.meta !== "undefined" && (import.meta as any).env?.PROD && isLocalhost) {
      console.warn(
        "[EventyDashboard] Registration/RSVP links will use localhost. Set VITE_APP_PUBLIC_URL to your deployed URL (e.g. in Vercel env) and redeploy so email links are correct."
      );
    }
    return origin;
  }
  return "";
}

/** Build registration URL: /register/{event_uuid}?tenant_uuid=...&event_id=... (path = event UUID only; event_id in query for template/fields APIs). */
function buildRegistrationUrl(
  eventUuid: string | null,
  tenantUuid: string | null,
  eventId: string | number | null,
  addUserTypeVip?: boolean
): string {
  if (!eventUuid || !tenantUuid) return "";
  const params = new URLSearchParams({ tenant_uuid: tenantUuid });
  if (eventId != null) params.set("event_id", String(eventId));
  if (addUserTypeVip) params.set("user_type", "vip");
  return `${getPublicOrigin()}/register/${eventUuid}?${params.toString()}`;
}

/** Same format as Home Summary "Copy Registration Link" + user_type=vip */
export function getRegistrationUrlVip(
  eventUuid: string | null,
  tenantUuid: string | null,
  eventId?: string | number | null
): string {
  return buildRegistrationUrl(eventUuid, tenantUuid, eventId ?? null, true);
}

/** Same format as Home Summary "Copy Registration Link" (plain registration) */
export function getRegistrationUrl(
  eventUuid: string | null,
  tenantUuid: string | null,
  eventId?: string | number | null
): string {
  return buildRegistrationUrl(eventUuid, tenantUuid, eventId ?? null);
}

/**
 * Build RSVP URL for the /rsvp page (dashboard "Share RSVP link").
 * When includeTokenPlaceholder is true, uses placeholders: ?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}}
 * so the backend can replace both when sending each email.
 */
export function getRsvpUrl(
  eventId: string | number | null,
  invitationId: string | number | null,
  tenantUuid: string | null,
  includeTokenPlaceholder?: boolean
): string {
  const origin = getPublicOrigin();
  let path = "";
  if (includeTokenPlaceholder && eventId) {
    // For email template: use placeholders so backend can inject tenant_uuid and rsvp_token per invitee
    const base = invitationId
      ? `${origin}/rsvp/${eventId}/${invitationId}`
      : `${origin}/rsvp/${eventId}`;
    path = `${base}?tenant_uuid=${TENANT_UUID_PLACEHOLDER}&rsvp_token=${RSVP_TOKEN_PLACEHOLDER}`;
  } else {
    if (!eventId) {
      path = `${origin}/rsvp`;
    } else if (invitationId && tenantUuid) {
      path = `${origin}/rsvp/${eventId}/${invitationId}?tenant_uuid=${encodeURIComponent(tenantUuid)}`;
    } else if (tenantUuid) {
      path = `${origin}/rsvp/${eventId}?tenant_uuid=${encodeURIComponent(tenantUuid)}`;
    } else {
      path = `${origin}/rsvp/${eventId}`;
    }
    if (includeTokenPlaceholder && path) {
      const sep = path.includes("?") ? "&" : "?";
      path += `${sep}rsvp_token=${RSVP_TOKEN_PLACEHOLDER}`;
    }
  }
  return path;
}

/**
 * Replaces merge tokens in invitation email HTML with real URLs so links are clickable.
 * - {{registration_link}} / {{registration_link_vip}} → full registration URL (always replaced so link works in sent emails).
 * - {{rsvp_link}} → full RSVP URL (always replaced so link is clickable in preview and in received emails).
 */
export function resolveInvitationEmailLinks(
  html: string,
  eventUuid: string | null,
  options?: {
    forPreview?: boolean;
    tenantUuid?: string | null;
    eventId?: string | number | null;
    invitationId?: string | number | null;
  }
): string {
  if (!html) return html;
  const tenantUuid = options?.tenantUuid ?? null;
  const eventId = options?.eventId ?? null;
  const invitationId = options?.invitationId ?? null;

  const registrationUrl = getRegistrationUrl(eventUuid, tenantUuid, eventId);
  const registrationUrlVip = getRegistrationUrlVip(eventUuid, tenantUuid, eventId);
  // RSVP link in email: /rsvp/{eventId}/{invitationId}?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}} (backend replaces both per invitee)
  const rsvpUrl = getRsvpUrl(eventId, invitationId, tenantUuid, true);

  let out = html.replace(
    new RegExp(REGISTRATION_LINK_VIP_TOKEN.replace(/[{}]/g, "\\$&"), "g"),
    registrationUrlVip
  );
  out = out.replace(
    new RegExp("{{registration_link}}".replace(/[{}]/g, "\\$&"), "g"),
    registrationUrl
  );
  out = out.replace(
    new RegExp(RSVP_LINK_TOKEN.replace(/[{}]/g, "\\$&"), "g"),
    rsvpUrl
  );

  return out;
}
