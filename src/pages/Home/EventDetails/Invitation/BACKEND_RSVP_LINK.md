# RSVP Link & Token – Backend Developer Guide

## What the email template contains

In the invitation email HTML (from the template builder), the RSVP link looks like:

```html
<a data-eventy-rsvp-link="1" href="{{rsvp_link}}" title="RSVP" id="i3uaw" style="...">RSVP Now</a>
```

So the `href` is the placeholder **`{{rsvp_link}}`**. You do **not** put `{{rsvp_token}}` in the template – the frontend puts it inside the URL when it replaces `{{rsvp_link}}`.

---

## What the frontend sends to the API

Before saving/sending the invitation, the **frontend** replaces `{{rsvp_link}}` with the **RSVP URL + token placeholder**:

- **Before (in template):** `href="{{rsvp_link}}"`
- **After (in `invitation_email_body` sent to API):**  
  `href="https://yoursite.com/rsvp/167/25?tenant_uuid=4b0b2af8-...&rsvp_token={{rsvp_token}}"`

So the body you receive from the frontend already has:

- A real base URL: `https://yoursite.com/rsvp/{event_id}/{invitation_id}?tenant_uuid=...`
- One remaining placeholder in the query: **`{{rsvp_token}}`** (use `&` not `?` before `rsvp_token`)

---

## Where is `{{rsvp_token}}` in the code?

- **In the email template:** You only see `href="{{rsvp_link}}"`. There is no separate `{{rsvp_token}}` in the template.
- **After frontend replacement:** The whole `{{rsvp_link}}` is replaced by a string that **contains** `{{rsvp_token}}` inside the URL. So the final `href` is:  
  `https://.../rsvp/167/25?tenant_uuid=xxx&rsvp_token={{rsvp_token}}`  
  The `{{rsvp_token}}` is part of that URL string. Frontend code: **`resolveInvitationEmailLinks.ts`** → **`getRsvpUrl(..., true)`**.

---

## How does the backend “replace” the link? (The link is already from the frontend)

**The full link is already in the HTML that the frontend sends to the API.** The backend does **not** build or replace the whole link. It only replaces **one small piece of text** inside that link.

- **What the backend receives** (in `invitation_email_body`):  
  The HTML already contains the full URL, with a placeholder **inside** it, for example:  
  `href="https://yoursite.com/rsvp/167/25?tenant_uuid=4b0b2af8-...&rsvp_token={{rsvp_token}}"`

- **What the backend does when sending each email:**  
  Do a **string replace** in the email body: replace the literal text **`{{rsvp_token}}`** with **that invitee’s actual token** (e.g. from your DB). Nothing else in the link changes.

**Example (pseudo-code):**

```text
// You have: invitation_email_body (HTML string from API)
// You have: invitee.rsvp_token (e.g. "abc123def456")

email_body_for_this_invitee = invitation_email_body.replace("{{rsvp_token}}", invitee.rsvp_token);

// Then send email_body_for_this_invitee to this invitee.
```

So: **frontend puts the full link in the HTML; backend only replaces the substring `{{rsvp_token}}` with the real token per invitee.**

---

## Summary

| Placeholder       | Who replaces it | When        | With what                          |
|-------------------|-----------------|------------|------------------------------------|
| `{{rsvp_link}}`   | **Frontend**    | Before API | `https://.../rsvp/{event_id}/{invitation_id}?tenant_uuid=...&rsvp_token={{rsvp_token}}` |
| `{{rsvp_token}}`  | **Backend**     | When sending each email | That invitee’s real `rsvp_token` |

So in the code you receive, the link is already the full **/rsvp/** URL with a token placeholder; you only need to replace **`{{rsvp_token}}`** with the correct token for each recipient.

---

## In one sentence

**Frontend sends the full link in the HTML; backend only does a string replace of `{{rsvp_token}}` with that invitee’s token when sending each email.**

---

## RSVP response API (when the user clicks Accept / Decline)

When someone opens the RSVP link and clicks **Accept** or **Decline**, the frontend calls:

- **Method:** `POST`
- **Path (relative to dashboard API base):** `/event_invitations/rsvp_response`
- **Full URL example:** `https://yoursite.com/en/api_dashboard/v1/event_invitations/rsvp_response`
- **Query parameters:** `tenant_uuid` (required), `rsvp_token` (required), `rsvp_response` (`"accepted"` or `"declined"`)

The frontend uses the same axios instance as the rest of the dashboard (same base URL). If the backend uses a different path (e.g. singular `/event_invitation/rsvp_response`) or a different base for public APIs, the frontend path in `invitationService.ts` → `rsvpResponse()` must be updated to match, or the backend must expose the endpoint at `/event_invitations/rsvp_response`. A 404 here usually means either the route is missing/wrong or the `rsvp_token` is invalid/expired.
