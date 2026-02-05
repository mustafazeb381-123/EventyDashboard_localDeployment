# Email Template API – POST Request & Response (Logo + Styling)

This document describes **our flow**, what we **put in the POST API** (text, logo, styling), and how the API should **return** the same so the email displays correctly in [HTML Online Viewer](https://html.onlineviewer.net/) and in real emails.

**Summary:** We put in the POST API one JSON body: `{ "email_template": { "name", "template_type", "body" } }`. The **`body`** field is the **full email HTML** that already contains the **logo** (absolute image URL) and **styling** (inline background colors for outer area, white card, Due Date and Notes boxes). So logo and styling are **inside the text we send**. The backend must store and return this same `body` unchanged; then when you use that HTML (e.g. paste in html.onlineviewer.net or send as email), logo and styling both show.

**What we put in POST (exact keys):**

```
POST /events/:event_id/email_templates
Content-Type: application/json

{
  "email_template": {
    "name": "Thank You Template 1",     // text
    "template_type": "thank_you",       // text: thank_you | rejection
    "body": "<!DOCTYPE html>..."        // full HTML string with logo + styling inside
  }
}
```

---

## Our flow (what we send in POST)

1. **User** selects a template (e.g. “Thank You Template 1”) or creates/edits one in the email confirmation step.
2. **We build HTML**:
   - **Ready-made template**: We render the React component to HTML (`componentToHtml`). The component already has:
     - **Logo**: Event logo (absolute URL from `logoUrl`) or fallback image (`fallbackLogoUrl`).
     - **Text**: Greeting, event details, Due Date, Notes, footer (all visible text).
     - **Styling**: Inline styles only (e.g. `backgroundColor: '#F1F5F9'` for Due Date/Notes boxes, `backgroundColor: '#f9fafb'` for outer area, `#ffffff` for white card) so email clients and the viewer show backgrounds.
   - **Custom template**: We use the HTML from the email builder (same idea: we keep inline styles and absolute URLs).
3. **We rewrite URLs**: `rewriteHtmlUrlsToAbsolute(html, EMAIL_HTML_BASE_URL)` so every `src` and `href` is absolute (e.g. `https://scceventy.dev/...`). That way the **logo and all images** load in the viewer and in emails.
4. **We wrap as full document**: `wrapHtmlAsFullEmailDocument(html, templateName)` adds `<!DOCTYPE html>`, `<head>` (meta, title, `<style>` for email resets), and `<body style="... background-color: #f6f6f6;">` around the content. So the **styling** (grey background, white card, Due Date/Notes background) is part of the document we send.
5. **We call POST** with that full HTML in the `body` field. So **what we put in the POST API = full HTML that already contains logo and styling.**

The backend must **store this `body` unchanged** and **return the same string** in GET/POST response. Then when you paste `body` into html.onlineviewer.net (or send it as the email body), **logo and styling show** because they are inside that HTML.

---

## Requirement (what must be in `body`)

When you test the API response on https://html.onlineviewer.net/, the **body** field must be a **complete HTML document** that renders correctly:

- **Full document**: `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>`.
- **Background and layout**: Inline styles for background (e.g. `background-color: #f6f6f6` on `<body>`, `background-color: #F1F5F9` on Due Date/Notes boxes) so the grey outer area, white content block, and highlighted sections show.
- **Styling**: `<style type="text/css">` in `<head>` for email-safe resets; layout/colors via **inline styles** on elements.
- **Logo and images**: All `src`/`href` are **absolute URLs** so the logo and icons load.

We already send this format in the POST. The backend must **store and return the same string** in the `body` attribute without stripping or altering the HTML.

---

## POST – Create email template (what we put in)

**Request**

- **URL**: `POST /events/:event_id/email_templates`
- **Body** (JSON) – this is exactly what we send:

```json
{
  "email_template": {
    "name": "Thank You Template 1",
    "template_type": "thank_you",
    "body": "<!DOCTYPE html>\\n<html lang=\\"en\\" style=\\"margin: 0; padding: 0;\\">\\n<head>\\n<meta charset=\\"utf-8\\">\\n<title>Thank You Template 1</title>\\n<style type=\\"text/css\\">body, table, td, p, a, li { -webkit-text-size-adjust: 100%; } body { margin: 0 !important; padding: 0 !important; }</style>\\n</head>\\n<body style=\\"margin: 0; padding: 0; width: 100%; background-color: #f6f6f6;\\">\\n<div style=\\"width: 100%; background-color: #f9fafb; padding: 40px;\\">\\n<img src=\\"https://scceventy.dev/vite.svg\\" alt=\\"Event Logo\\" style=\\"max-height: 60px; max-width: 200px;\\" />\\n<div style=\\"padding: 40px; background-color: #ffffff;\\">\\n... (all email text) ...\\n<div style=\\"margin-top: 8px; background-color: #F1F5F9; padding: 17px; border-radius: 16px;\\">Due Date : ...</div>\\n</div>\\n</div>\\n</body>\\n</html>"
  }
}
```

- **`name`**: Template name (text) – e.g. `"Thank You Template 1"`.
- **`template_type`**: `"thank_you"` or `"rejection"` (text).
- **`body`**: The **full HTML document** we put in the POST. It already includes:
  - **Logo**: An `<img>` with `src` set to the event logo URL (absolute) or fallback (e.g. `https://scceventy.dev/vite.svg`). So the logo is in the HTML we send.
  - **Text**: All visible text (greeting, event details, “Due Date”, “Notes”, footer).
  - **Styling**: Inline styles on every section – e.g. `background-color: #f6f6f6` on `<body>`, `background-color: #f9fafb` on outer div, `background-color: #ffffff` on the white card, `background-color: #F1F5F9` on Due Date and Notes boxes. So when the API returns this same `body`, logo and styling both show in the viewer and in the actual email.

**Response (recommended)**

Return the created resource in JSON:API-style so the client (and any tester) can use the same `body` in the viewer:

```json
{
  "data": {
    "id": "100",
    "type": "email_templates",
    "attributes": {
      "name": "Thank You Template 1",
      "template_type": "thank_you",
      "body": "<!DOCTYPE html>\n<html lang=\"en\" style=\"margin: 0; padding: 0;\">\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>Thank You Template 1</title>\n  <style type=\"text/css\">\n    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }\n    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }\n    ...\n  </style>\n</head>\n<body style=\"margin: 0; padding: 0; width: 100%; background-color: #f6f6f6;\">\n  ...\n</body>\n</html>"
    }
  }
}
```

- **Critical**: The `attributes.body` value must be the **exact same** complete HTML string that was sent in the request (or equivalent: full document, same styles, absolute URLs). Do not return only a fragment or strip `<head>`/`<body>`.

---

## GET – Show / List email templates

- **List**: `GET /events/:event_id/email_templates?template_type=thank_you`
- **Show**: `GET /events/:event_id/email_templates/:id`

For both, the `body` in each template resource must be the same **complete HTML document** as stored (same requirements as above). That way, copying `response.data.data.attributes.body` (or `response.data.data[0].attributes.body` for list) into html.onlineviewer.net will show the email with proper background, styling, and layout.

---

## How to test in HTML Online Viewer

1. Call your POST (or GET) API and get the JSON response.
2. Copy the **full string** in `data.attributes.body` (or `data[0].attributes.body` for a list).
3. Open https://html.onlineviewer.net/.
4. Paste the copied HTML into the editor (or into the “HTML” / code area if the site expects raw HTML).
5. The preview should show the complete email: grey background, white content block, logo, text, and footer—matching the in-app preview.

If the preview is broken or unstyled, the API is likely returning a fragment (e.g. only inner content) or relative image URLs. Ensure the backend returns the full document and that the frontend (or backend) rewrites image/link URLs to absolute before saving.

---

## Frontend helpers (reference)

- **`wrapHtmlAsFullEmailDocument(bodyContent, title)`** (`src/utils/emailHtml.ts`): Wraps body HTML in a full document with DOCTYPE, `<head>` (meta, title, email-safe styles), and `<body style="... background-color: #f6f6f6;">`. Used when saving so the API stores a full document.
- **`rewriteHtmlUrlsToAbsolute(html, baseUrl)`**: Converts relative `src`/`href` to absolute using `EMAIL_HTML_BASE_URL` so images and links work in the viewer and in emails.

The app also has a **“Copy HTML”** button in the template preview modal; it copies this same full-document HTML so you can paste it into html.onlineviewer.net without calling the API.
