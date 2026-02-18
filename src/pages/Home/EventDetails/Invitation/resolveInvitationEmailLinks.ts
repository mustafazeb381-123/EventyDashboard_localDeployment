/**
 * Resolve invitation email link placeholders so recipients get clickable links.
 * Registration link uses the same URL as "Copy Registration Link" in Home Summary.
 * Format: /register/{event_uuid}?tenant_uuid=...&event_id=... (e.g. /register/3a48dbae-...?tenant_uuid=4b0b2af8-...&event_id=171)
 */

export const REGISTRATION_LINK_VIP_TOKEN = "{{registration_link_vip}}";
export const RSVP_LINK_TOKEN = "{{rsvp_link}}";

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
  return `${typeof window !== "undefined" ? window.location.origin : ""}/register/${eventUuid}?${params.toString()}`;
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
 * Replaces merge tokens in invitation email HTML with real URLs so links are clickable.
 * - {{registration_link_vip}} → registration URL with tenant_uuid and user_type=vip.
 * - {{rsvp_link}} → when forPreview, use a placeholder so the link is visible/clickable in preview;
 *   when saving, leave as token so backend can replace per-invitee when sending.
 */
export function resolveInvitationEmailLinks(
  html: string,
  eventUuid: string | null,
  options?: { forPreview?: boolean; tenantUuid?: string | null; eventId?: string | number | null }
): string {
  if (!html) return html;
  const forPreview = options?.forPreview ?? false;
  const tenantUuid = options?.tenantUuid ?? null;
  const eventId = options?.eventId ?? null;

  const registrationUrl = getRegistrationUrl(eventUuid, tenantUuid, eventId);
  const registrationUrlVip = getRegistrationUrlVip(eventUuid, tenantUuid, eventId);

  let out = html.replace(
    new RegExp(REGISTRATION_LINK_VIP_TOKEN.replace(/[{}]/g, "\\$&"), "g"),
    registrationUrlVip
  );
  out = out.replace(
    new RegExp("{{registration_link}}".replace(/[{}]/g, "\\$&"), "g"),
    registrationUrl
  );

  if (forPreview) {
    const rsvpPlaceholder =
      eventUuid ? `${typeof window !== "undefined" ? window.location.origin : ""}/rsvp` : "#";
    out = out.replace(
      new RegExp(RSVP_LINK_TOKEN.replace(/[{}]/g, "\\$&"), "g"),
      rsvpPlaceholder
    );
  }

  return out;
}
