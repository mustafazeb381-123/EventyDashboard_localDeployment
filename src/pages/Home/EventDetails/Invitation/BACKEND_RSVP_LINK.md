# RSVP Link & Token – Backend Developer Guide

## What the email template contains

In the invitation email HTML (from the template builder), the RSVP link looks like:

```html
<a data-eventy-rsvp-link="1" href="{{rsvp_link}}" title="RSVP" id="i3uaw" style="...">RSVP Now</a>
```

So the `href` is the placeholder **`{{rsvp_link}}`**. You do **not** put `{{rsvp_token}}` or `{{tenant_uuid}}` in the template – the frontend puts them inside the URL when it replaces `{{rsvp_link}}`.

---

## What the frontend sends to the API

Before saving/sending the invitation, the **frontend** replaces `{{rsvp_link}}` with the **RSVP URL + placeholders**:

- **Before (in template):** `href="{{rsvp_link}}"`
- **After (in `invitation_email_body` sent to API):**  
  `href="https://yoursite.com/rsvp/167/25?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}}"`

So the body you receive from the frontend already has:

- A real base URL: `https://yoursite.com/rsvp/{event_id}/{invitation_id}?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}}`
- Two remaining placeholders in the query: **`{{tenant_uuid}}`** and **`{{rsvp_token}}`**

---

## Where are `{{tenant_uuid}}` and `{{rsvp_token}}` in the code?

- **In the email template:** You only see `href="{{rsvp_link}}"`. There are no separate placeholders in the template.
- **After frontend replacement:** The whole `{{rsvp_link}}` is replaced by a string that **contains** `{{tenant_uuid}}` and `{{rsvp_token}}` inside the URL. So the final `href` is:  
  `https://.../rsvp/167/25?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}}`  
  Frontend code: **`resolveInvitationEmailLinks.ts`** → **`getRsvpUrl(..., true)`**.

---

## How does the backend “replace” the link? (The link is already from the frontend)

**The full link is already in the HTML that the frontend sends to the API.** The backend does **not** build or replace the whole link. It only replaces **two placeholders** inside that link.

- **What the backend receives** (in `invitation_email_body`):  
  The HTML already contains the full URL with placeholders, for example:  
  `href="https://yoursite.com/rsvp/167/25?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}}"`

- **What the backend does when sending each email:**  
  Do **string replaces** in the email body:
  1. Replace **`{{tenant_uuid}}`** with your tenant’s UUID (e.g. from session or config).
  2. Replace **`{{rsvp_token}}`** with **that invitee’s actual token** (e.g. from your DB).

**Example (pseudo-code):**

```text
// You have: invitation_email_body (HTML string from API)
// You have: tenant_uuid (e.g. "4b0b2af8-3cb1-4c3c-ae73-1468462ecb96")
// You have: invitee.rsvp_token (e.g. "abc123def456")

email_body_for_this_invitee = invitation_email_body
  .replace("{{tenant_uuid}}", tenant_uuid)
  .replace("{{rsvp_token}}", invitee.rsvp_token);

// Then send email_body_for_this_invitee to this invitee.
```

So: **frontend puts the full link in the HTML; backend replaces `{{tenant_uuid}}` and `{{rsvp_token}}` when sending each email.**

---

## Summary

| Placeholder       | Who replaces it | When        | With what                          |
|-------------------|-----------------|------------|------------------------------------|
| `{{rsvp_link}}`   | **Frontend**    | Before API | `https://.../rsvp/{event_id}/{invitation_id}?tenant_uuid={{tenant_uuid}}&rsvp_token={{rsvp_token}}` |
| `{{tenant_uuid}}` | **Backend**     | When sending each email | Your tenant's UUID |
| `{{rsvp_token}}`  | **Backend**     | When sending each email | That invitee’s real `rsvp_token` |

So in the code you receive, the link is already the full **/rsvp/** URL with both placeholders; you replace **`{{tenant_uuid}}`** and **`{{rsvp_token}}`** with the correct values for each recipient.

---

## In one sentence

**Frontend sends the full link in the HTML with `{{tenant_uuid}}` and `{{rsvp_token}}`; backend replaces both with real values when sending each email.**

---

## RSVP page and APIs (tenant_uuid and rsvp_token from backend)

The RSVP page reads **only from the URL**: `tenant_uuid` and `rsvp_token` (no dashboard login or localStorage). So whatever you put in the link when sending the email is what the frontend uses for:

- **GET** `/events/{event_id}/event_invitations/{id}/rsvp_template?tenant_uuid=...` – to load the RSVP form
- **POST** `/event_invitations/rsvp_response?tenant_uuid=...&rsvp_token=...&rsvp_response=accepted|declined` – when the user clicks Accept/Decline

You control both values by replacing `{{tenant_uuid}}` and `{{rsvp_token}}` in the link when sending each email.

---

## RSVP response API (when the user clicks Accept / Decline)

When someone opens the RSVP link and clicks **Accept** or **Decline**, the frontend calls:

- **Method:** `POST`
- **Path (relative to dashboard API base):** `/event_invitations/rsvp_response`
- **Full URL example:** `https://yoursite.com/en/api_dashboard/v1/event_invitations/rsvp_response`
- **Query parameters:** `tenant_uuid` (required), `rsvp_token` (required), `rsvp_response` (`"accepted"` or `"declined"`)

The frontend uses the same axios instance as the rest of the dashboard (same base URL). If the backend uses a different path (e.g. singular `/event_invitation/rsvp_response`) or a different base for public APIs, the frontend path in `invitationService.ts` → `rsvpResponse()` must be updated to match, or the backend must expose the endpoint at `/event_invitations/rsvp_response`. A 404 here usually means either the route is missing/wrong or the `rsvp_token` is invalid/expired.
