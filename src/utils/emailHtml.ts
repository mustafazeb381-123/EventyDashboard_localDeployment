/**
 * Wraps HTML body content in a full email document (html, head, body)
 * so the backend GET API returns a complete, email-ready HTML format.
 * Use when saving email templates to the API.
 */
export function wrapHtmlAsFullEmailDocument(
  bodyContent: string,
  title: string = "Eventy Email",
): string {
  if (!bodyContent || typeof bodyContent !== "string") {
    return bodyContent;
  }
  const trimmed = bodyContent.trim();
  // Already a full document — don't double-wrap
  if (
    trimmed.toLowerCase().startsWith("<!doctype") ||
    trimmed.toLowerCase().startsWith("<html")
  ) {
    return bodyContent;
  }

  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0;">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>${safeTitle}</title>
<style type="text/css">
/* Email-safe reset */
body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
@media only screen and (max-width: 640px) {
  .container { width: 100% !important; max-width: 100% !important; padding: 8px !important; }
}
</style>
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f6f6f6;">
${trimmed}
</body>
</html>`;
}
