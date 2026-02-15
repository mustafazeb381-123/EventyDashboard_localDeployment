/**
 * Resolve invitation email link placeholders so recipients get clickable links.
 * Registration link uses the same URL as "Copy Registration Link" in Home Summary.
 */

export const REGISTRATION_LINK_VIP_TOKEN = "{{registration_link_vip}}";
export const RSVP_LINK_TOKEN = "{{rsvp_link}}";

/** Same format as Home Summary "Copy Registration Link" + ?user_type=vip */
export function getRegistrationUrlVip(eventId: string | null): string {
  if (!eventId) return "";
  return `${window.location.origin}/register/${eventId}?user_type=vip`;
}

/** Same format as Home Summary "Copy Registration Link" (plain registration) */
export function getRegistrationUrl(eventId: string | null): string {
  if (!eventId) return "";
  return `${window.location.origin}/register/${eventId}`;
}

/**
 * Replaces merge tokens in invitation email HTML with real URLs so links are clickable.
 * - {{registration_link_vip}} → registration URL with ?user_type=vip (same base as Copy Registration Link).
 * - {{rsvp_link}} → when forPreview, use a placeholder so the link is visible/clickable in preview;
 *   when saving, leave as token so backend can replace per-invitee when sending.
 */
export function resolveInvitationEmailLinks(
  html: string,
  eventId: string | null,
  options?: { forPreview?: boolean }
): string {
  if (!html) return html;
  const forPreview = options?.forPreview ?? false;

  const registrationUrlVip = getRegistrationUrlVip(eventId);
  let out = html.replace(
    new RegExp(REGISTRATION_LINK_VIP_TOKEN.replace(/[{}]/g, "\\$&"), "g"),
    registrationUrlVip
  );

  if (forPreview) {
    // Preview: make RSVP link clickable (placeholder; backend replaces per-invitee when sending).
    const rsvpPlaceholder =
      eventId ? `${window.location.origin}/rsvp` : "#";
    out = out.replace(
      new RegExp(RSVP_LINK_TOKEN.replace(/[{}]/g, "\\$&"), "g"),
      rsvpPlaceholder
    );
  }

  return out;
}
