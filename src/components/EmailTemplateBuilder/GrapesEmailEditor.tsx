import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import type { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import grapesjsPresetNewsletter from "grapesjs-preset-newsletter";
import QRCode from "qrcode";

type GrapesEmailEditorProps = {
  initialHtml?: string;
  mergeTags?: Array<{ name: string; value: string }>;
  onChange: (html: string) => void;
};

function extractBodyAndStyles(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const bodyHtml = doc.body?.innerHTML || html;
    const styleTag = doc.querySelector("style");
    const css = styleTag?.innerHTML || "";
    return { bodyHtml, css };
  } catch {
    return { bodyHtml: html, css: "" };
  }
}

function normalizeBodyToTableRows(bodyInnerHtml: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<body>${bodyInnerHtml}</body>`,
      "text/html",
    );
    const body = doc.body;
    const nodes = Array.from(body.childNodes).filter((n) => {
      if (n.nodeType === Node.TEXT_NODE) return Boolean(n.textContent?.trim());
      return true;
    });

    if (!nodes.length) {
      return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td></td></tr></table>';
    }

    const rows = nodes
      .map((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          const el = n as Element;
          return `<tr><td style="padding:0;">${el.outerHTML}</td></tr>`;
        }
        const text = (n.textContent || "").trim();
        return `<tr><td style="padding:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.6;color:#111827;">${text}</td></tr>`;
      })
      .join("");

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
  } catch {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0;">${bodyInnerHtml}</td></tr></table>`;
  }
}

function mergeTagToHtml(token: string) {
  const safe = String(token || "");
  // Email-safe inline chip; prevents accidental overwrites while typing.
  // Note: contenteditable is stripped during export.
  return (
    `<span data-eventy-merge="${safe}" contenteditable="false" ` +
    `style="display:inline-block;padding:2px 6px;margin:0 1px;border-radius:6px;` +
    `background:#eef2ff;color:#3730a3;font-family:Arial, Helvetica, sans-serif;` +
    `font-size:13px;line-height:1.4;">${safe}</span>`
  );
}

function ensureQrTokenAttributes(bodyInnerHtml: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<body>${bodyInnerHtml}</body>`,
      "text/html",
    );

    // Strip editor-only attributes that can confuse email clients.
    Array.from(doc.querySelectorAll<HTMLElement>("[contenteditable]")).forEach(
      (el) => {
        el.removeAttribute("contenteditable");
      },
    );

    const images = Array.from(
      doc.querySelectorAll<HTMLImageElement>(
        "img[data-eventy-qr], img[data-eventy-qr-value], img[data-gjs-type='eventy-qr']",
      ),
    );
    images.forEach((img) => {
      const token =
        img.getAttribute("data-eventy-qr") ||
        img.getAttribute("data-eventy-qr-value") ||
        img.getAttribute("data-eventy-qr-token") ||
        DEFAULT_QR_TOKEN;

      img.setAttribute("data-eventy-qr", token);
      img.setAttribute("data-eventy-qr-value", token);
      // Backend can use this attribute to set the final src.
      img.setAttribute("data-eventy-qr-src", token);
      img.setAttribute("data-gjs-type", "eventy-qr");
    });
    return doc.body.innerHTML;
  } catch {
    return bodyInnerHtml;
  }
}

function buildFullHtml(editor: Editor) {
  const html = editor.getHtml();
  const css = editor.getCss();
  // Keep a valid src for previews, but always embed the token for backend replacement.
  const exportHtml = ensureQrTokenAttributes(html);
  const wrappedBody = normalizeBodyToTableRows(exportHtml);
  // Outlook-safe outer wrapper using tables.
  const emailBody = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;margin:0;padding:0;width:100%;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;">
            <tr>
              <td style="padding:24px;">
                ${wrappedBody}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>${css}</style></head><body style="margin:0;padding:0;">${emailBody}</body></html>`;
}

const DEFAULT_QR_TOKEN = "{{user.qrcode}}";

const QR_BLOCK_ICON =
  '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
  '<path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10 0h2v2h-2v-2zm4 0h2v6h-2v-6zm-4 4h2v2h-2v-2zm0-8h6v2h-6v-2z"/>' +
  "</svg>";

const SOCIAL_BLOCK_ICON =
  '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
  '<path fill="currentColor" d="M18 16a3 3 0 0 0-2.39 1.2L8.91 13.7a3.2 3.2 0 0 0 0-3.4l6.7-3.5A3 3 0 1 0 15 5a3 3 0 0 0 .06.6l-6.7 3.5A3 3 0 1 0 9 15a3 3 0 0 0-.06-.6l6.7 3.5A3 3 0 1 0 18 16z"/>' +
  "</svg>";

function createSocialBlockHtml() {
  const linkStyle =
    "display:block;width:32px;height:32px;line-height:32px;text-align:center;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;";

  // Use table cells w/ bgcolor for better Outlook support (backgrounds on <a> are unreliable there).
  return `
    <table data-eventy-social="1" data-gjs-type="eventy-social" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:10px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td bgcolor="#1877f2" style="border-radius:16px; overflow:hidden;">
                <a data-eventy-social-link="facebook" href="https://facebook.com" title="Facebook" style="${linkStyle}">f</a>
              </td>
              <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
              <td bgcolor="#111827" style="border-radius:16px; overflow:hidden;">
                <a data-eventy-social-link="twitter" href="https://twitter.com" title="Twitter" style="${linkStyle}">x</a>
              </td>
              <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
              <td bgcolor="#e1306c" style="border-radius:16px; overflow:hidden;">
                <a data-eventy-social-link="instagram" href="https://instagram.com" title="Instagram" style="${linkStyle}">i</a>
              </td>
              <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
              <td bgcolor="#0a66c2" style="border-radius:16px; overflow:hidden;">
                <a data-eventy-social-link="linkedin" href="https://linkedin.com" title="LinkedIn" style="${linkStyle}">in</a>
              </td>
              <td width="12" style="font-size:0;line-height:0;">&nbsp;</td>
              <td bgcolor="#ff0000" style="border-radius:16px; overflow:hidden;">
                <a data-eventy-social-link="youtube" href="https://youtube.com" title="YouTube" style="${linkStyle}">yt</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

async function createQrBlockHtml(tokenValue: string) {
  // Create a dummy QR image that encodes the merge token (backend can replace later).
  // Keep the raw token in HTML attributes so backend can find/replace reliably.
  const dataUrl = await QRCode.toDataURL(tokenValue, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
  });

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:10px 0;">
          <img
            alt="QR Code"
            src="${dataUrl}"
            data-eventy-qr="${tokenValue}"
            data-eventy-qr-value="${tokenValue}"
            data-eventy-qr-src="${tokenValue}"
            data-gjs-type="eventy-qr"
            width="180"
            style="display:block; border:0; outline:none; text-decoration:none; width:180px; height:auto; max-width:180px;"
          />
        </td>
      </tr>
    </table>
  `;
}

function createQrBlockPlaceholderHtml(tokenValue: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:10px 0;">
          <img
            alt="QR Code"
            src=""
            data-eventy-qr="${tokenValue}"
            data-eventy-qr-value="${tokenValue}"
            data-eventy-qr-src="${tokenValue}"
            data-gjs-type="eventy-qr"
            width="180"
            style="display:block; border:0; outline:none; text-decoration:none; width:180px; height:auto; max-width:180px; background:#f3f4f6; border:1px dashed #d1d5db; border-radius:12px;"
          />
        </td>
      </tr>
    </table>
  `;
}

export function GrapesEmailEditor({
  initialHtml,
  mergeTags,
  onChange,
}: GrapesEmailEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const initializedRef = useRef(false);
  const instanceIdRef = useRef(`gjs_${Math.random().toString(36).slice(2, 8)}`);
  const updateTimerRef = useRef<number | null>(null);
  const qrPreviewCacheRef = useRef<Map<string, string>>(new Map());
  const initialHtmlRef = useRef<string | undefined>(initialHtml);
  const onChangeRef = useRef(onChange);
  const mergeTagsRef = useRef(mergeTags);
  const rteEnhancedRef = useRef(false);
  const [rightTab, setRightTab] = useState<
    "styles" | "traits" | "layers" | "blocks"
  >("blocks");

  useEffect(() => {
    initialHtmlRef.current = initialHtml;
  }, [initialHtml]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    mergeTagsRef.current = mergeTags;
  }, [mergeTags]);

  const insertIntoEditor = (value: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    const safeValue = value ?? "";
    const payload =
      safeValue.includes("{{") && safeValue.includes("}}")
        ? mergeTagToHtml(safeValue)
        : safeValue;
    const selected = editor.getSelected();

    if (!selected) {
      editor.addComponents(`<p>${payload}</p>`);
      return;
    }

    const currentContent = selected.get("content");
    if (typeof currentContent === "string") {
      selected.set("content", `${currentContent}${payload}`);
      return;
    }

    try {
      // Works for most components by appending a text node.
      selected.append(payload);
    } catch {
      editor.addComponents(`<p>${payload}</p>`);
    }
  };

  const hydrateQrImagesForEditor = async () => {
    const editor = editorRef.current;
    if (!editor) return;

    const wrapper: any = (editor as any).getWrapper?.();
    if (!wrapper?.find) return;

    const imgComponents: any[] = wrapper.find("img") || [];
    const updates = imgComponents.map(async (comp) => {
      const attrs: any = comp?.getAttributes?.() || {};
      const token = attrs["data-eventy-qr"] || attrs["data-eventy-qr-value"];
      if (!token) return;

      const currentSrc = String(attrs.src || "");
      const looksLikeMerge =
        currentSrc.includes("{{") && currentSrc.includes("}}");
      const needsPreview =
        !currentSrc || currentSrc === token || looksLikeMerge;
      if (!needsPreview) return;

      const cached = qrPreviewCacheRef.current.get(token);
      if (cached) {
        comp.addAttributes({ src: cached });
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(token, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 220,
        });
        qrPreviewCacheRef.current.set(token, dataUrl);
        comp.addAttributes({ src: dataUrl });
      } catch {
        // ignore; keep as-is
      }
    });

    await Promise.all(updates);
  };

  const viewsPanelId = `${instanceIdRef.current}_views_panel`;
  const blocksId = `${instanceIdRef.current}_blocks`;
  const layersId = `${instanceIdRef.current}_layers`;
  const traitsId = `${instanceIdRef.current}_traits`;
  const stylesId = `${instanceIdRef.current}_styles`;

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    // Define icons as string constants for config
    const ICON_BLOCKS =
      '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    const ICON_STYLE =
      '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19.34 2.62c-.93-.89-2.39-.89-3.3 0l-12.4 11.9c-.2.19-.28.46-.22.73l1.8 7.3c.09.36.41.62.78.62.06 0 .13 0 .19-.01l7.6-1.74c.26-.06.5-.27.64-.51l7.31-14.7c.92-.9 1.1-2.4.6-3.59zm-13.8 17.5l-1.3-5.2 3.6 3.6-2.3 1.6zM15 4.3l3.7 3.7-9.5 9.5-3.7-3.7L15 4.3z"/></svg>';
    const ICON_SETTINGS =
      '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
    const ICON_LAYERS =
      '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/></svg>';

    const editor = grapesjs.init({
      container: containerRef.current,
      height: "100%",
      fromElement: false,
      storageManager: false,
      plugins: [grapesjsPresetNewsletter],
      pluginsOpts: {
        "grapesjs-preset-newsletter": {
          modalTitleImport: "Import HTML",
          modalTitleExport: "Export HTML",
          showStylesOnChange: true,
        },
      } as any,
      blockManager: {
        appendTo: `#${blocksId}`,
      },
      layerManager: {
        appendTo: `#${layersId}`,
      },
      styleManager: {
        appendTo: `#${stylesId}`,
      },
      traitManager: {
        appendTo: `#${traitsId}`,
      },
      panels: {
        defaults: [
          {
            id: "views",
            el: `#${viewsPanelId}`,
            buttons: [
              {
                id: "open-blocks",
                command: "open-blocks",
                className: "gjs-pn-btn",
                label: ICON_BLOCKS,
                context: "views",
                attributes: { title: "Blocks" },
                active: true,
              },
              {
                id: "open-sm",
                command: "open-sm",
                className: "gjs-pn-btn",
                label: ICON_STYLE,
                context: "views",
                attributes: { title: "Styles" },
              },
              {
                id: "open-tm",
                command: "open-tm",
                className: "gjs-pn-btn",
                label: ICON_SETTINGS,
                context: "views",
                attributes: { title: "Settings" },
              },
              {
                id: "open-layers",
                command: "open-layers",
                className: "gjs-pn-btn",
                label: ICON_LAYERS,
                context: "views",
                attributes: { title: "Layers" },
              },
            ],
          },
        ],
      },
    } as any);

    editorRef.current = editor;

    // Ensure the inline RTE toolbar stays visible (not clipped/hidden behind overlays).
    const injectRteToolbarCss = () => {
      // Ensure the inline RTE toolbar stays visible (not clipped/hidden behind overlays).
      // Also force high contrast colors so icons are visible in dark/light modes.
      const css = `
        .gjs-rte-toolbar { 
          z-index: 2147483647 !important; 
          min-width: 300px !important; /* Ensure enough width for all icons */
          background-color: #2a2a2a !important;
          border: 1px solid #444 !important;
          border-radius: 4px !important;
        }
        .gjs-rte-toolbar, .gjs-rte-toolbar * { pointer-events: auto !important; }
        .gjs-rte-action { 
          color: #e5e7eb !important; 
          fill: #e5e7eb !important; 
          min-width: 24px !important;
          font-size: 14px !important;
        }
        .gjs-rte-action:hover { 
          background-color: #444 !important;
          color: #fff !important; 
        }
      `;

      const addToDoc = (doc: Document | null | undefined) => {
        if (!doc?.head) return;
        const id = "eventy-grapes-rte-toolbar-fix";
        if (doc.getElementById(id)) return;
        const style = doc.createElement("style");
        style.id = id;
        style.textContent = css;
        doc.head.appendChild(style);
      };

      addToDoc(document);
      try {
        addToDoc(editor.Canvas?.getDocument?.());
      } catch {
        // ignore
      }
    };

    injectRteToolbarCss();
    editor.on("load", injectRteToolbarCss);

    // --- Wire GrapesJS commands to toggle visibility of our detached containers. ---
    try {
      const getEl = (id: string) => document.getElementById(id);
      const show = (id: string) => {
        const el = getEl(id);
        if (el) el.style.display = "block";
      };
      const hideOtherViews = (exceptId: string) => {
        [blocksId, stylesId, traitsId, layersId].forEach((id) => {
          if (id !== exceptId) {
            const el = getEl(id);
            if (el) el.style.display = "none";
          }
        });
      };

      const cmdSm = editor.Commands.get("open-sm");
      const cmdTm = editor.Commands.get("open-tm");
      const cmdLayers = editor.Commands.get("open-layers");

      editor.Commands.add("open-sm", {
        run: (...args: any[]) => {
          cmdSm?.run?.(...args);
          hideOtherViews(stylesId);
          show(stylesId);
        },
        stop: (...args: any[]) => cmdSm?.stop?.(...args),
      });
      editor.Commands.add("open-tm", {
        run: (...args: any[]) => {
          cmdTm?.run?.(...args);
          hideOtherViews(traitsId);
          show(traitsId);
        },
        stop: (...args: any[]) => cmdTm?.stop?.(...args),
      });
      editor.Commands.add("open-layers", {
        run: (...args: any[]) => {
          cmdLayers?.run?.(...args);
          hideOtherViews(layersId);
          show(layersId);
        },
        stop: (...args: any[]) => cmdLayers?.stop?.(...args),
      });
      editor.Commands.add("open-blocks", {
        run: () => {
          hideOtherViews(blocksId);
          show(blocksId);
        },
      });

      // Force open blocks initially to ensure visibility sync
      setTimeout(() => editor.runCommand("open-blocks"), 0);
    } catch {
      // ignore
    }

    // --- RTE Configuration & Toolbar Extension ---
    try {
      const rteApi: any = (editor as any).RichTextEditor;

      const safeAdd = (id: string, opts: any) => {
        try {
          if (rteApi && rteApi.add) {
            rteApi.add(id, opts);
          }
        } catch {
          // ignore
        }
      };

      // Exec command wrapper
      const execCmd = (rte: any, cmd: string, value?: any) => {
        try {
          rte.execCommand(cmd, value);
        } catch {
          try {
            document.execCommand(cmd, false, value);
          } catch {
            // ignore
          }
        }
      };

      const normalizeToolbarIds = (value: any): string[] => {
        if (!Array.isArray(value)) return [];
        return value
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object") {
              const id =
                (item as any).id ?? (item as any).name ?? (item as any).command;
              return id ? String(id) : "";
            }
            return "";
          })
          .filter(Boolean);
      };

      const appendUnique = (baseIds: string[], extraIds: string[]) => {
        const seen = new Set(baseIds);
        const out = [...baseIds];
        extraIds.forEach((id) => {
          if (!seen.has(id)) {
            seen.add(id);
            out.push(id);
          }
        });
        return out;
      };

      const extraRteButtonIds = [
        "eventy-bold",
        "eventy-italic",
        "eventy-ul",
        "eventy-ol",
        "eventy-underline",
        "eventy-strike",
        "eventy-align-left",
        "eventy-align-center",
        "eventy-align-right",
        "eventy-align-justify",
        "eventy-link",
        "eventy-unlink",
        "eventy-personalize",
      ];

      // Add actions to global RTE
      safeAdd("eventy-bold", {
        icon: "<b>B</b>",
        attributes: { title: "Bold" },
        result: (rte: any) => execCmd(rte, "bold"),
      });
      safeAdd("eventy-italic", {
        icon: "<i>I</i>",
        attributes: { title: "Italic" },
        result: (rte: any) => execCmd(rte, "italic"),
      });
      safeAdd("eventy-ul", {
        icon: "•",
        attributes: { title: "Bulleted list" },
        result: (rte: any) => execCmd(rte, "insertUnorderedList"),
      });
      safeAdd("eventy-ol", {
        icon: "1.",
        attributes: { title: "Numbered list" },
        result: (rte: any) => execCmd(rte, "insertOrderedList"),
      });
      safeAdd("eventy-underline", {
        icon: "<u>U</u>",
        attributes: { title: "Underline" },
        result: (rte: any) => execCmd(rte, "underline"),
      });
      safeAdd("eventy-strike", {
        icon: "<s>S</s>",
        attributes: { title: "Strikethrough" },
        result: (rte: any) => execCmd(rte, "strikeThrough"),
      });
      safeAdd("eventy-align-left", {
        icon: "⟸",
        attributes: { title: "Align left" },
        result: (rte: any) => execCmd(rte, "justifyLeft"),
      });
      safeAdd("eventy-align-center", {
        icon: "≡",
        attributes: { title: "Align center" },
        result: (rte: any) => execCmd(rte, "justifyCenter"),
      });
      safeAdd("eventy-align-right", {
        icon: "⟹",
        attributes: { title: "Align right" },
        result: (rte: any) => execCmd(rte, "justifyRight"),
      });
      safeAdd("eventy-align-justify", {
        icon: "⟺",
        attributes: { title: "Justify" },
        result: (rte: any) => execCmd(rte, "justifyFull"),
      });
      safeAdd("eventy-personalize", {
        icon: "{}",
        attributes: { title: "Personalize (merge tags)" },
        result: (rte: any) => openPersonalize(rte),
      });
      safeAdd("eventy-link", {
        icon: "🔗",
        attributes: { title: "Insert Link" },
        result: (rte: any) => openLinkModal(rte),
      });
      safeAdd("eventy-unlink", {
        icon: "⛓",
        attributes: { title: "Remove Link" },
        result: (rte: any) => execCmd(rte, "unlink"),
      });

      // Aggressively extend all component types that might have text
      const extendAllTextToolbars = () => {
        const allTypes = editor.DomComponents.getTypes();
        allTypes.forEach((typeObj: any) => {
          if (!typeObj.model || !typeObj.model.prototype) return;
          const proto = typeObj.model.prototype;
          // Check if it has defaults
          const defaults = proto.defaults || {};

          // If it has rteToolbar or is a text-like component
          // Note: 'text' component has 'text' trait often, or contentEditable
          if (
            defaults.rteToolbar ||
            typeObj.id === "text" ||
            typeObj.id === "default" ||
            typeObj.id === "textnode"
          ) {
            const current = defaults.rteToolbar || [
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "link",
            ];
            const baseIds = normalizeToolbarIds(current);
            // We append our IDs.
            // Note: duplicating standard IDs (like 'bold' vs 'eventy-bold') is annoying but safe.
            // Ideally we replace them, but appending ensures availability.
            const newToolbar = appendUnique(baseIds, extraRteButtonIds);

            // Update the prototype
            proto.defaults = { ...defaults, rteToolbar: newToolbar };
          }
        });
      };

      extendAllTextToolbars();

      // Also listen for component creation to patch instances if needed
      const applyExtra = (comp: any) => {
        if (!comp || !comp.get) return;
        const toolbar = comp.get("rteToolbar");
        if (toolbar) {
          const base = normalizeToolbarIds(toolbar);
          comp.set("rteToolbar", appendUnique(base, extraRteButtonIds));
        }
      };

      editor.on("component:selected", (comp: any) => {
        applyExtra(comp);
      });
    } catch (err) {
      console.error("RTE Setup error", err);
    }

    // Register custom components/traits for Eventy blocks.
    try {
      const defaultType = editor.DomComponents.getType("default");
      editor.DomComponents.addType("eventy-social", {
        isComponent: (el: any) =>
          el?.tagName === "TABLE" &&
          (el.getAttribute("data-eventy-social") === "1" ||
            el.getAttribute("data-gjs-type") === "eventy-social"),
        model: defaultType.model.extend(
          {
            defaults: {
              ...defaultType.model.prototype.defaults,
              traits: [
                { type: "text", name: "facebookUrl", label: "Facebook URL" },
                { type: "text", name: "twitterUrl", label: "Twitter/X URL" },
                { type: "text", name: "instagramUrl", label: "Instagram URL" },
                { type: "text", name: "linkedinUrl", label: "LinkedIn URL" },
                { type: "text", name: "youtubeUrl", label: "YouTube URL" },
              ],
              facebookUrl: "https://facebook.com",
              twitterUrl: "https://twitter.com",
              instagramUrl: "https://instagram.com",
              linkedinUrl: "https://linkedin.com",
              youtubeUrl: "https://youtube.com",
            },

            init() {
              (defaultType.model.prototype.init || (() => {})).apply(
                this,
                arguments as any,
              );
              const update = () => {
                const map: Record<string, string> = {
                  facebook: this.get("facebookUrl"),
                  twitter: this.get("twitterUrl"),
                  instagram: this.get("instagramUrl"),
                  linkedin: this.get("linkedinUrl"),
                  youtube: this.get("youtubeUrl"),
                };
                Object.entries(map).forEach(([key, url]) => {
                  if (!url) return;
                  const links: any[] =
                    (this as any).find?.(
                      `[data-eventy-social-link="${key}"]`,
                    ) || [];
                  links.forEach((c) => c?.addAttributes?.({ href: url }));
                });
              };
              this.on(
                "change:facebookUrl change:twitterUrl change:instagramUrl change:linkedinUrl change:youtubeUrl",
                update,
              );
              update();
            },
          },
          {
            isComponent: (el: any) =>
              el?.tagName === "TABLE" &&
              (el.getAttribute("data-eventy-social") === "1" ||
                el.getAttribute("data-gjs-type") === "eventy-social"),
          },
        ),
      });
    } catch {
      // ignore
    }

    // Make standard hyperlinks editable via the right-side Traits panel.
    // IMPORTANT: override the built-in "link" type (your screenshot shows Selected: Link ...).
    try {
      const linkType =
        (editor.DomComponents.getType("link") as any) ||
        (editor.DomComponents.getType("default") as any);
      const isComponent =
        linkType?.isComponent || ((el: any) => el?.tagName === "A");

      editor.DomComponents.addType("link", {
        isComponent,
        model: linkType.model.extend(
          {
            defaults: {
              ...linkType.model.prototype.defaults,
              selectable: true,
              highlightable: true,
              hoverable: true,
              stylable: true,
              traits: [
                { type: "text", name: "href", label: "Link URL" },
                {
                  type: "select",
                  name: "target",
                  label: "Target",
                  options: [
                    { id: "", name: "Same tab" },
                    { id: "_blank", name: "New tab" },
                  ],
                },
                { type: "text", name: "title", label: "Title" },
                { type: "text", name: "rel", label: "Rel" },
                { type: "text", name: "linkText", label: "Link text" },
              ],
              href: "#",
              target: "_blank",
              rel: "noopener noreferrer",
              title: "",
              linkText: "",
            },

            init() {
              (linkType.model.prototype.init || (() => {})).apply(
                this,
                arguments as any,
              );

              const syncTextFromDom = () => {
                try {
                  const el = (this as any).getEl?.();
                  const text = (el?.textContent || "").trim();
                  if (!this.get("linkText") && text) this.set("linkText", text);
                } catch {
                  // ignore
                }
              };

              const applyText = () => {
                const txt = String(this.get("linkText") || "");
                if (!txt) return;
                try {
                  (this as any).components(txt);
                } catch {
                  // ignore
                }
              };

              this.on(
                "change:href change:target change:title change:rel",
                () => {
                  const attrs: Record<string, string> = {};
                  const href = this.get("href");
                  if (href) attrs.href = href;
                  const target = this.get("target");
                  if (target) attrs.target = target;
                  const title = this.get("title");
                  if (title) attrs.title = title;
                  const rel = this.get("rel");
                  if (rel) attrs.rel = rel;
                  (this as any).addAttributes(attrs);
                },
              );
              this.on("change:linkText", applyText);

              syncTextFromDom();
              this.trigger("change:href");
            },
          },
          { isComponent },
        ),
      });
    } catch {
      // ignore
    }

    try {
      const imageType = editor.DomComponents.getType("image");
      editor.DomComponents.addType("eventy-qr", {
        isComponent: (el: any) =>
          el?.tagName === "IMG" &&
          (el.getAttribute("data-eventy-qr") ||
            el.getAttribute("data-eventy-qr-value") ||
            el.getAttribute("data-gjs-type") === "eventy-qr"),
        model: imageType.model.extend(
          {
            defaults: {
              ...imageType.model.prototype.defaults,
              traits: [
                ...(imageType.model.prototype.defaults?.traits || []),
                { type: "text", name: "eventyQrToken", label: "QR Token" },
              ],
              eventyQrToken: DEFAULT_QR_TOKEN,
            },
            init() {
              (imageType.model.prototype.init || (() => {})).apply(
                this,
                arguments as any,
              );

              const sync = () => {
                const token = this.get("eventyQrToken") || DEFAULT_QR_TOKEN;
                this.addAttributes({
                  "data-eventy-qr": token,
                  "data-eventy-qr-value": token,
                  "data-gjs-type": "eventy-qr",
                });

                const cached = qrPreviewCacheRef.current.get(token);
                if (cached) {
                  this.addAttributes({ src: cached });
                  return;
                }

                void QRCode.toDataURL(token, {
                  errorCorrectionLevel: "M",
                  margin: 1,
                  width: 220,
                })
                  .then((dataUrl) => {
                    qrPreviewCacheRef.current.set(token, dataUrl);
                    this.addAttributes({ src: dataUrl });
                  })
                  .catch(() => {
                    // ignore
                  });
              };

              this.on("change:eventyQrToken", sync);
              sync();
            },
          },
          {
            isComponent: (el: any) =>
              el?.tagName === "IMG" &&
              (el.getAttribute("data-eventy-qr") ||
                el.getAttribute("data-eventy-qr-value") ||
                el.getAttribute("data-gjs-type") === "eventy-qr"),
          },
        ),
      });
    } catch {
      // ignore
    }

    // Extend the black inline text toolbar (RTE) with common actions + Personalize.
    if (!rteEnhancedRef.current) {
      rteEnhancedRef.current = true;

      const rteApi: any = (editor as any).RichTextEditor;
      const modalApi: any = (editor as any).Modal;

      const execCmd = (rte: any, cmd: string, value?: string) => {
        try {
          if (rte?.exec) return rte.exec(cmd, value);
        } catch {
          // fall back
        }
        try {
          // execCommand still used by GrapesJS RTE in many browsers/contexts
          document.execCommand(cmd, false, value);
        } catch {
          // ignore
        }
      };

      const sanitizeHref = (raw: string) => {
        const href = String(raw || "").trim();
        if (!href) return "";
        const lower = href.toLowerCase();
        // Block dangerous schemes.
        if (lower.startsWith("javascript:") || lower.startsWith("data:"))
          return "";
        // Allow common email-safe schemes and relative/hash links.
        if (
          lower.startsWith("http://") ||
          lower.startsWith("https://") ||
          lower.startsWith("mailto:") ||
          lower.startsWith("tel:") ||
          lower.startsWith("#")
        ) {
          return href;
        }
        // Allow merge tags (backend can resolve).
        if (href.includes("{{") && href.includes("}}")) return href;
        // Default: treat as https.
        return `https://${href}`;
      };

      const insertTextAtCursor = (rte: any, value: string) => {
        try {
          if (typeof rte?.insertHTML === "function") {
            rte.insertHTML(value);
            return;
          }
        } catch {
          // fall back
        }
        // Try insertText first, then insertHTML.
        try {
          if (!document.execCommand("insertText", false, value)) {
            document.execCommand("insertHTML", false, value);
          }
        } catch {
          // ignore
        }
      };

      const openLinkModal = (rte: any) => {
        const selectionText = (() => {
          try {
            return window.getSelection?.()?.toString?.() || "";
          } catch {
            return "";
          }
        })();

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "10px";

        const urlInput = document.createElement("input");
        urlInput.type = "text";
        urlInput.placeholder = "https://example.com";
        urlInput.style.width = "100%";
        urlInput.style.padding = "10px";
        urlInput.style.borderRadius = "8px";
        urlInput.style.border = "1px solid #d1d5db";
        urlInput.style.fontSize = "14px";

        const textInput = document.createElement("input");
        textInput.type = "text";
        textInput.placeholder = selectionText
          ? "(uses selected text)"
          : "Link text";
        textInput.value = selectionText;
        textInput.style.width = "100%";
        textInput.style.padding = "10px";
        textInput.style.borderRadius = "8px";
        textInput.style.border = "1px solid #d1d5db";
        textInput.style.fontSize = "14px";

        const newTabRow = document.createElement("label");
        newTabRow.style.display = "flex";
        newTabRow.style.alignItems = "center";
        newTabRow.style.gap = "8px";
        newTabRow.style.fontSize = "13px";
        newTabRow.style.color = "#374151";

        const newTab = document.createElement("input");
        newTab.type = "checkbox";
        newTab.checked = true;
        const newTabText = document.createElement("span");
        newTabText.textContent = "Open in new tab";
        newTabRow.appendChild(newTab);
        newTabRow.appendChild(newTabText);

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.justifyContent = "flex-end";
        actions.style.gap = "8px";

        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.padding = "8px 12px";
        cancelBtn.style.borderRadius = "8px";
        cancelBtn.style.border = "1px solid #d1d5db";
        cancelBtn.style.background = "#fff";
        cancelBtn.onclick = () => modalApi?.close?.();

        const insertBtn = document.createElement("button");
        insertBtn.type = "button";
        insertBtn.textContent = "Apply";
        insertBtn.style.padding = "8px 12px";
        insertBtn.style.borderRadius = "8px";
        insertBtn.style.border = "1px solid #2563eb";
        insertBtn.style.background = "#2563eb";
        insertBtn.style.color = "#fff";
        insertBtn.onclick = () => {
          const href = sanitizeHref(urlInput.value);
          if (!href) return;

          // If there is a selection, create a link around it.
          try {
            const sel = window.getSelection?.();
            const hasSelection = Boolean(
              sel && sel.rangeCount && !sel.isCollapsed,
            );
            if (hasSelection) {
              execCmd(rte, "createLink", href);
            } else {
              const text = (textInput.value || href).trim();
              const target = newTab.checked
                ? ' target="_blank" rel="noopener noreferrer"'
                : "";
              insertTextAtCursor(rte, `<a href="${href}"${target}>${text}</a>`);
            }
          } catch {
            const text = (textInput.value || href).trim();
            const target = newTab.checked
              ? ' target="_blank" rel="noopener noreferrer"'
              : "";
            insertTextAtCursor(rte, `<a href="${href}"${target}>${text}</a>`);
          }

          // Best-effort: if link was created via createLink, set target.
          if (newTab.checked) {
            try {
              const sel = window.getSelection?.();
              const node: any = sel?.anchorNode?.parentElement;
              if (node?.tagName === "A") {
                node.setAttribute("target", "_blank");
                node.setAttribute("rel", "noopener noreferrer");
              }
            } catch {
              // ignore
            }
          }

          modalApi?.close?.();
        };

        actions.appendChild(cancelBtn);
        actions.appendChild(insertBtn);

        wrapper.appendChild(urlInput);
        wrapper.appendChild(textInput);
        wrapper.appendChild(newTabRow);
        wrapper.appendChild(actions);

        modalApi?.open?.({
          title: "Insert Link",
          content: wrapper,
        });
      };

      const openPersonalize = (rte: any) => {
        const tags = mergeTagsRef.current || [];
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.gap = "12px";

        const select = document.createElement("select");
        select.style.width = "100%";
        select.style.padding = "10px";
        select.style.borderRadius = "8px";
        select.style.border = "1px solid #d1d5db";
        select.style.fontSize = "14px";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Select a merge tag…";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        tags.forEach((t) => {
          const opt = document.createElement("option");
          opt.value = t.value;
          opt.textContent = t.name;
          select.appendChild(opt);
        });

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.justifyContent = "flex-end";
        actions.style.gap = "8px";

        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.padding = "8px 12px";
        cancelBtn.style.borderRadius = "8px";
        cancelBtn.style.border = "1px solid #d1d5db";
        cancelBtn.style.background = "#fff";
        cancelBtn.onclick = () => modalApi?.close?.();

        const insertBtn = document.createElement("button");
        insertBtn.type = "button";
        insertBtn.textContent = "Insert";
        insertBtn.style.padding = "8px 12px";
        insertBtn.style.borderRadius = "8px";
        insertBtn.style.border = "1px solid #ec4899";
        insertBtn.style.background = "#ec4899";
        insertBtn.style.color = "#fff";
        insertBtn.onclick = () => {
          const v = select.value;
          if (!v) return;
          const payload =
            v.includes("{{") && v.includes("}}") ? mergeTagToHtml(v) : v;
          insertTextAtCursor(rte, payload);
          modalApi?.close?.();
        };

        actions.appendChild(cancelBtn);
        actions.appendChild(insertBtn);

        wrapper.appendChild(select);
        wrapper.appendChild(actions);

        modalApi?.open?.({
          title: "Personalize",
          content: wrapper,
        });
      };

      const safeAdd = (id: string, opts: any) => {
        try {
          rteApi?.add?.(id, opts);
        } catch {
          // ignore
        }
      };

      const normalizeToolbarIds = (value: any): string[] => {
        if (!Array.isArray(value)) return [];
        return value
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object") {
              const id =
                (item as any).id ?? (item as any).name ?? (item as any).command;
              return id ? String(id) : "";
            }
            return "";
          })
          .filter(Boolean);
      };

      const appendUnique = (baseIds: string[], extraIds: string[]) => {
        const seen = new Set(baseIds);
        const out = [...baseIds];
        extraIds.forEach((id) => {
          if (!seen.has(id)) {
            seen.add(id);
            out.push(id);
          }
        });
        return out;
      };

      const extraRteButtonIds = [
        "eventy-bold",
        "eventy-italic",
        "eventy-ul",
        "eventy-ol",
        "eventy-underline",
        "eventy-strike",
        "eventy-indent",
        "eventy-outdent",
        "eventy-align-left",
        "eventy-align-center",
        "eventy-align-right",
        "eventy-align-justify",
        "eventy-clear",
        "eventy-personalize",
        "eventy-link",
        "eventy-unlink",
      ];

      // Ordered / unordered lists, indent/outdent, clear formatting.
      safeAdd("eventy-bold", {
        icon: "B",
        attributes: { title: "Bold" },
        result: (rte: any) => execCmd(rte, "bold"),
      });
      safeAdd("eventy-italic", {
        icon: "I",
        attributes: { title: "Italic" },
        result: (rte: any) => execCmd(rte, "italic"),
      });
      safeAdd("eventy-ul", {
        icon: "•",
        attributes: { title: "Bulleted list" },
        result: (rte: any) => execCmd(rte, "insertUnorderedList"),
      });
      safeAdd("eventy-ol", {
        icon: "1.",
        attributes: { title: "Numbered list" },
        result: (rte: any) => execCmd(rte, "insertOrderedList"),
      });
      safeAdd("eventy-underline", {
        icon: "U",
        attributes: { title: "Underline" },
        result: (rte: any) => execCmd(rte, "underline"),
      });
      safeAdd("eventy-strike", {
        icon: "S",
        attributes: { title: "Strikethrough" },
        result: (rte: any) => execCmd(rte, "strikeThrough"),
      });
      safeAdd("eventy-indent", {
        icon: "⇥",
        attributes: { title: "Indent" },
        result: (rte: any) => execCmd(rte, "indent"),
      });
      safeAdd("eventy-outdent", {
        icon: "⇤",
        attributes: { title: "Outdent" },
        result: (rte: any) => execCmd(rte, "outdent"),
      });
      safeAdd("eventy-align-left", {
        icon: "⟸",
        attributes: { title: "Align left" },
        result: (rte: any) => execCmd(rte, "justifyLeft"),
      });
      safeAdd("eventy-align-center", {
        icon: "≡",
        attributes: { title: "Align center" },
        result: (rte: any) => execCmd(rte, "justifyCenter"),
      });
      safeAdd("eventy-align-right", {
        icon: "⟹",
        attributes: { title: "Align right" },
        result: (rte: any) => execCmd(rte, "justifyRight"),
      });
      safeAdd("eventy-align-justify", {
        icon: "⟺",
        attributes: { title: "Justify" },
        result: (rte: any) => execCmd(rte, "justifyFull"),
      });
      safeAdd("eventy-clear", {
        icon: "Tx",
        attributes: { title: "Clear formatting" },
        result: (rte: any) => execCmd(rte, "removeFormat"),
      });
      safeAdd("eventy-personalize", {
        icon: "{}",
        attributes: { title: "Personalize (merge tags)" },
        result: (rte: any) => openPersonalize(rte),
      });

      safeAdd("eventy-link", {
        icon: "🔗",
        attributes: { title: "Insert/Edit link" },
        result: (rte: any) => openLinkModal(rte),
      });

      safeAdd("eventy-unlink", {
        icon: "⛓",
        attributes: { title: "Remove link" },
        result: (rte: any) => execCmd(rte, "unlink"),
      });

      const extendToolbarForType = (typeName: string) => {
        try {
          const type = editor.DomComponents.getType(typeName) as any;
          if (!type?.model?.prototype?.defaults) return;
          const defaults = type.model.prototype.defaults;
          const baseIds = normalizeToolbarIds(defaults.rteToolbar);
          defaults.rteToolbar = appendUnique(baseIds, extraRteButtonIds);
        } catch {
          // ignore
        }
      };

      const applyExtraToolbar = (comp: any) => {
        try {
          if (!comp?.get) return;
          const baseIds = normalizeToolbarIds(comp.get("rteToolbar"));
          comp.set("rteToolbar", appendUnique(baseIds, extraRteButtonIds));
        } catch {
          // ignore
        }
      };

      const applyExtraToolbarUpTree = (comp: any) => {
        try {
          let current = comp;
          // Some selections are on nested types (eg, link inside text). Apply up the tree.
          for (let i = 0; i < 6 && current; i += 1) {
            applyExtraToolbar(current);
            current =
              typeof current.parent === "function" ? current.parent() : null;
          }
        } catch {
          // ignore
        }
      };

      // Newsletter preset uses multiple component types (text, link, etc). Extend a broad set.
      [
        "default",
        "text",
        "textnode",
        "link",
        "link-block",
        "paragraph",
        "heading",
      ].forEach((t) => extendToolbarForType(t));

      editor.on("rte:enable", (_rte: any, maybeViewOrComp: any) => {
        const comp =
          maybeViewOrComp?.model || maybeViewOrComp?.get?.("type")
            ? maybeViewOrComp
            : editor.getSelected?.();
        applyExtraToolbarUpTree(comp);
      });

      editor.on("component:add", (comp: any) => applyExtraToolbarUpTree(comp));
      editor.on("component:selected", (comp: any) =>
        applyExtraToolbarUpTree(comp),
      );

      editor.on("load", () => {
        try {
          const wrapper: any = (editor as any).getWrapper?.();
          const walk = (node: any) => {
            if (!node) return;
            applyExtraToolbar(node);
            const children = node.components?.();
            if (children?.length) children.forEach((c: any) => walk(c));
          };
          walk(wrapper);
        } catch {
          // ignore
        }
      });
    }

    // Custom blocks
    editor.BlockManager.add("eventy-social", {
      label: "Social Icons",
      category: "Eventy",
      media: SOCIAL_BLOCK_ICON,
      content: createSocialBlockHtml(),
    });

    // Start with a placeholder, then replace with a generated QR image.
    editor.BlockManager.add("eventy-qr", {
      label: "QR Code",
      category: "Eventy",
      media: QR_BLOCK_ICON,
      content: createQrBlockPlaceholderHtml(DEFAULT_QR_TOKEN),
    });

    void createQrBlockHtml(DEFAULT_QR_TOKEN)
      .then((html) => {
        const block = editor.BlockManager.get("eventy-qr");
        if (block) block.set("content", html);
      })
      .catch(() => {
        // Keep placeholder if QR generation fails.
      });

    editor.on("load", () => {
      if (initializedRef.current) return;
      const htmlToLoad = initialHtmlRef.current;
      if (htmlToLoad) {
        const { bodyHtml, css } = extractBodyAndStyles(htmlToLoad);
        editor.setComponents(bodyHtml || "<table></table>");
        if (css) editor.setStyle(css);
      }
      initializedRef.current = true;
      void hydrateQrImagesForEditor();
      onChangeRef.current(buildFullHtml(editor));
    });

    const scheduleUpdate = () => {
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }
      updateTimerRef.current = window.setTimeout(() => {
        if (!editorRef.current) return;
        onChangeRef.current(buildFullHtml(editorRef.current));
      }, 250);
    };

    editor.on("update", scheduleUpdate);
    editor.on("component:add", scheduleUpdate);
    editor.on("component:remove", scheduleUpdate);
    editor.on("styleManager:change", scheduleUpdate);

    return () => {
      editor.off("update", scheduleUpdate);
      editor.off("component:add", scheduleUpdate);
      editor.off("component:remove", scheduleUpdate);
      editor.off("styleManager:change", scheduleUpdate);
      editor.destroy();
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      editorRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  const tagOptions = mergeTagsRef.current || [];

  return (
    <div className="flex h-full w-full min-h-0 bg-white">
      <div className="flex-1 min-w-0">
        <div ref={containerRef} className="h-full w-full" />
      </div>

      <div className="w-[300px] border-l border-gray-700 bg-[#444] flex flex-col transition-all duration-300 text-gray-200">
        <div
          id={viewsPanelId}
          className="flex items-center justify-around border-b border-gray-600 bg-[#3b3b3b] px-1 py-1 min-h-[44px]"
        />

        <div className="flex-1 overflow-auto p-0 gjs-one-bg gjs-two-color">
          <div id={stylesId} style={{ display: "none" }} />
          <div id={traitsId} style={{ display: "none" }} />
          <div id={layersId} style={{ display: "none" }} />
          <div
            id={blocksId}
            className="gjs-blocks"
            style={{ display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
