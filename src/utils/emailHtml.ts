function parseStyleString(style: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!style || typeof style !== "string") return out;
  style.split(";").forEach((decl) => {
    const idx = decl.indexOf(":");
    if (idx > 0) {
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const value = decl.slice(idx + 1).trim();
      if (prop && value) out[prop] = value;
    }
  });
  return out;
}

function styleObjectToString(obj: Record<string, string>): string {
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

/** Convert CSS class selector to HTML class name (e.g. .p-\\[40px\\] -> p-[40px]) */
function selectorToClassName(selector: string): string {
  const s = selector.trim().replace(/^\./, "");
  return s.replace(/\\\[/g, "[").replace(/\\\]/g, "]").replace(/\\#/g, "#");
}

/**
 * Parse CSS text into a map: HTML class name -> declarations string.
 * Handles .class { prop: value; } and .class1, .class2 { ... }.
 * Skips @media and non-class selectors.
 */
function parseCssToClassMap(css: string): Record<string, string> {
  const map: Record<string, string> = {};
  // Remove comments and @media blocks so we only parse simple class rules
  let cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  cleaned = cleaned.replace(/@media[^{]*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, "");
  const ruleRe = /\.([^{]+)\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(cleaned)) !== null) {
    const selectors = m[1].split(",").map((s) => s.trim());
    const declarations = m[2].trim();
    if (!declarations) continue;
    selectors.forEach((sel) => {
      if (sel.startsWith(".")) {
        const className = selectorToClassName(sel);
        if (className) map[className] = declarations;
      }
    });
  }
  return map;
}

/**
 * Converts class-based styles to inline styles by parsing the document's
 * <style> block (dynamic — any classes in the stylesheet are inlined).
 * Call AFTER wrapHtmlAsFullEmailDocument so the doc has a <style> block.
 * Removes <style> nodes after inlining so viewers that ignore <style> still show correct styling.
 */
export function inlineEmailStyles(html: string): string {
  if (!html || typeof html !== "string") return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const classToDecl: Record<string, string> = {};

    // Collect CSS from all <style> elements
    doc.querySelectorAll("style").forEach((styleEl) => {
      const css = styleEl.textContent || "";
      const map = parseCssToClassMap(css);
      Object.assign(classToDecl, map);
    });

    const walk = (node: Node) => {
      if (node.nodeType !== 1) return;
      const el = node as Element;
      const classAttr = el.getAttribute("class");
      if (classAttr && Object.keys(classToDecl).length > 0) {
        const classes = classAttr.split(/\s+/).filter(Boolean);
        const merged: Record<string, string> = {};
        classes.forEach((cls) => {
          const declarations = classToDecl[cls];
          if (declarations) {
            declarations.split(";").forEach((decl) => {
              const idx = decl.indexOf(":");
              if (idx > 0) {
                const prop = decl.slice(0, idx).trim().toLowerCase();
                const value = decl.slice(idx + 1).trim();
                if (prop && value) merged[prop] = value;
              }
            });
          }
        });
        if (Object.keys(merged).length > 0) {
          const existing = parseStyleString(el.getAttribute("style") || "");
          const combined = { ...merged, ...existing };
          el.setAttribute("style", styleObjectToString(combined));
        }
      }
      el.childNodes.forEach(walk);
    };
    if (doc.body) walk(doc.body);

    // Remove <style> nodes so we don't rely on viewer applying them
    doc.querySelectorAll("style").forEach((styleEl) => styleEl.remove());

    const htmlEl = doc.documentElement;
    if (!htmlEl) return html;
    const doctype = doc.doctype
      ? `<!DOCTYPE ${doc.doctype.name}${doc.doctype.publicId ? ` PUBLIC "${doc.doctype.publicId}"` : ""}${doc.doctype.systemId ? ` "${doc.doctype.systemId}"` : ""}>`
      : "<!DOCTYPE html>";
    return doctype + "\n" + htmlEl.outerHTML;
  } catch (e) {
    console.warn("inlineEmailStyles failed, returning original HTML:", e);
    return html;
  }
}

/**
 * Wraps HTML body content in a full email document (html, head, body)
 * with styling included so the backend GET API returns a complete,
 * email-ready HTML that displays with background, logo, and layout.
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

/* Template layout & background (so GET returns styled email with background and logo) */
.w-full { width: 100%; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-\\[\\#F1F5F9\\] { background-color: #F1F5F9; }
.p-10 { padding: 2.5rem; }
.p-\\[40px\\] { padding: 40px; }
.p-\\[17px\\] { padding: 17px; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.mt-\\[24px\\] { margin-top: 24px; }
.mt-\\[8px\\] { margin-top: 8px; }
.mt-\\[40px\\] { margin-top: 40px; }
.mt-\\[64px\\] { margin-top: 64px; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-normal { font-weight: 400; }
.text-\\[20px\\] { font-size: 20px; }
.text-\\[16px\\] { font-size: 16px; }
.text-\\[\\#121A26\\] { color: #121A26; }
.text-\\[\\#384860\\] { color: #384860; }
.text-black { color: #000000; }
.inline-block { display: inline-block; }
.mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }

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
