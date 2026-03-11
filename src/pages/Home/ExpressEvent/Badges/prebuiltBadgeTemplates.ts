/**
 * Pre-built badge templates
 *
 * Each template uses the full BadgeTemplate interface from the badge builder:
 * dimensions (inches), background, personal photo, name / company / title text
 * with position, size, colour & alignment, and QR code.
 *
 * All positions are relative to a 400 px-wide canvas.
 * Height is scaled proportionally from the width/height ratio.
 *
 * Compatible with the `badge_templates` API (`template_data` JSONB field).
 */

/* -------------------------------------------------------------------------- */
/*  Interface                                                                 */
/* -------------------------------------------------------------------------- */

export interface BadgeTemplate {
  id: string;
  name: string;
  type: "existing" | "custom";
  width: number;   // inches
  height: number;  // inches
  hasBackground: boolean;
  bgColor: string;
  bgImage: string | null;
  hasPersonalPhoto: boolean;
  photoSize: { width: number; height: number };
  photoAlignment: "left" | "center" | "right";
  photoPosition: { x: number; y: number };
  hasName: boolean;
  nameText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasCompany: boolean;
  companyText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasTitle: boolean;
  titleText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasQrCode: boolean;
  qrCodeSize: { width: number; height: number };
  qrCodePosition: { x: number; y: number };
  qrCodeAlignment?: "left" | "center" | "right";
}

/* -------------------------------------------------------------------------- */
/*  Extended metadata for the template gallery card                           */
/* -------------------------------------------------------------------------- */

export interface PrebuiltBadgeTemplate {
  /** Unique key (slug) – never changes */
  key: string;
  /** Display name translation key (dashboard » expressEvent namespace) */
  nameKey: string;
  /** Short description translation key */
  descriptionKey: string;
  /** Accent colour shown on the card badge */
  accentColor: string;
  /** CSS linear-gradient for the card thumbnail background */
  previewGradient: string;
  /** lucide-react icon name */
  icon: string;
  /** Category tag */
  category:
    | "corporate"
    | "minimal"
    | "creative"
    | "elegant"
    | "conference"
    | "vip"
    | "tech"
    | "networking";
  /** The actual BadgeTemplate data */
  template: BadgeTemplate;
}

/* ========================================================================== */
/*  1 – CORPORATE CLASSIC                                                     */
/*  Navy background · centred photo · centred name / company / title · QR     */
/* ========================================================================== */

const corporateClassic: PrebuiltBadgeTemplate = {
  key: "corporate-classic",
  nameKey: "expressEvent.badgeTemplates.corporateClassic.name",
  descriptionKey: "expressEvent.badgeTemplates.corporateClassic.description",
  accentColor: "#1e3a5f",
  previewGradient: "linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)",
  icon: "Briefcase",
  category: "corporate",
  template: {
    id: "prebuilt-corporate-classic",
    name: "Corporate Classic",
    type: "existing",
    width: 3.5,
    height: 5.5,
    hasBackground: true,
    bgColor: "#1e3a5f",
    bgImage: null,
    hasPersonalPhoto: true,
    photoSize: { width: 140, height: 140 },
    photoAlignment: "center",
    photoPosition: { x: 130, y: 60 },
    hasName: true,
    nameText: {
      size: 22,
      color: "#ffffff",
      alignment: "center",
      position: { x: 200, y: 230 },
    },
    hasCompany: true,
    companyText: {
      size: 14,
      color: "#93c5fd",
      alignment: "center",
      position: { x: 200, y: 265 },
    },
    hasTitle: true,
    titleText: {
      size: 12,
      color: "#cbd5e1",
      alignment: "center",
      position: { x: 200, y: 295 },
    },
    hasQrCode: true,
    qrCodeSize: { width: 100, height: 100 },
    qrCodePosition: { x: 150, y: 360 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  2 – MINIMALIST WHITE                                                      */
/*  White bg · small centred photo · clean stacked text · no QR              */
/* ========================================================================== */

const minimalistWhite: PrebuiltBadgeTemplate = {
  key: "minimalist-white",
  nameKey: "expressEvent.badgeTemplates.minimalistWhite.name",
  descriptionKey: "expressEvent.badgeTemplates.minimalistWhite.description",
  accentColor: "#f8fafc",
  previewGradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  icon: "Minus",
  category: "minimal",
  template: {
    id: "prebuilt-minimalist-white",
    name: "Minimalist White",
    type: "existing",
    width: 3.5,
    height: 4,
    hasBackground: true,
    bgColor: "#ffffff",
    bgImage: null,
    hasPersonalPhoto: true,
    photoSize: { width: 100, height: 100 },
    photoAlignment: "center",
    photoPosition: { x: 150, y: 40 },
    hasName: true,
    nameText: {
      size: 24,
      color: "#0f172a",
      alignment: "center",
      position: { x: 200, y: 175 },
    },
    hasCompany: true,
    companyText: {
      size: 14,
      color: "#64748b",
      alignment: "center",
      position: { x: 200, y: 215 },
    },
    hasTitle: true,
    titleText: {
      size: 12,
      color: "#94a3b8",
      alignment: "center",
      position: { x: 200, y: 245 },
    },
    hasQrCode: false,
    qrCodeSize: { width: 80, height: 80 },
    qrCodePosition: { x: 160, y: 300 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  3 – CREATIVE GRADIENT                                                     */
/*  Purple-to-pink bg · large centred photo · bold white text · QR bottom     */
/* ========================================================================== */

const creativeGradient: PrebuiltBadgeTemplate = {
  key: "creative-gradient",
  nameKey: "expressEvent.badgeTemplates.creativeGradient.name",
  descriptionKey: "expressEvent.badgeTemplates.creativeGradient.description",
  accentColor: "#7c3aed",
  previewGradient: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
  icon: "Palette",
  category: "creative",
  template: {
    id: "prebuilt-creative-gradient",
    name: "Creative Gradient",
    type: "existing",
    width: 3.5,
    height: 5.5,
    hasBackground: true,
    bgColor: "#7c3aed",
    bgImage: null,
    hasPersonalPhoto: true,
    photoSize: { width: 160, height: 160 },
    photoAlignment: "center",
    photoPosition: { x: 120, y: 50 },
    hasName: true,
    nameText: {
      size: 26,
      color: "#ffffff",
      alignment: "center",
      position: { x: 200, y: 245 },
    },
    hasCompany: true,
    companyText: {
      size: 15,
      color: "#e9d5ff",
      alignment: "center",
      position: { x: 200, y: 285 },
    },
    hasTitle: true,
    titleText: {
      size: 13,
      color: "#c4b5fd",
      alignment: "center",
      position: { x: 200, y: 315 },
    },
    hasQrCode: true,
    qrCodeSize: { width: 90, height: 90 },
    qrCodePosition: { x: 155, y: 380 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  4 – ELEGANT DARK                                                          */
/*  Near-black bg · gold accent text · centred layout · QR code bottom        */
/* ========================================================================== */

const elegantDark: PrebuiltBadgeTemplate = {
  key: "elegant-dark",
  nameKey: "expressEvent.badgeTemplates.elegantDark.name",
  descriptionKey: "expressEvent.badgeTemplates.elegantDark.description",
  accentColor: "#1a1a2e",
  previewGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  icon: "Crown",
  category: "elegant",
  template: {
    id: "prebuilt-elegant-dark",
    name: "Elegant Dark",
    type: "existing",
    width: 3.5,
    height: 5.5,
    hasBackground: true,
    bgColor: "#1a1a2e",
    bgImage: null,
    hasPersonalPhoto: true,
    photoSize: { width: 130, height: 130 },
    photoAlignment: "center",
    photoPosition: { x: 135, y: 70 },
    hasName: true,
    nameText: {
      size: 22,
      color: "#d4af37",
      alignment: "center",
      position: { x: 200, y: 235 },
    },
    hasCompany: true,
    companyText: {
      size: 14,
      color: "#e2e8f0",
      alignment: "center",
      position: { x: 200, y: 270 },
    },
    hasTitle: true,
    titleText: {
      size: 12,
      color: "#94a3b8",
      alignment: "center",
      position: { x: 200, y: 300 },
    },
    hasQrCode: true,
    qrCodeSize: { width: 100, height: 100 },
    qrCodePosition: { x: 150, y: 365 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  5 – CONFERENCE PRO                                                        */
/*  Teal bg · large name top · company centred · QR prominent bottom-right    */
/*  No personal photo (text-forward style for large conferences)              */
/* ========================================================================== */

const conferencePro: PrebuiltBadgeTemplate = {
  key: "conference-pro",
  nameKey: "expressEvent.badgeTemplates.conferencePro.name",
  descriptionKey: "expressEvent.badgeTemplates.conferencePro.description",
  accentColor: "#0d9488",
  previewGradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
  icon: "Mic",
  category: "conference",
  template: {
    id: "prebuilt-conference-pro",
    name: "Conference Pro",
    type: "existing",
    width: 4,
    height: 6,
    hasBackground: true,
    bgColor: "#0d9488",
    bgImage: null,
    hasPersonalPhoto: false,
    photoSize: { width: 100, height: 100 },
    photoAlignment: "center",
    photoPosition: { x: 200, y: 60 },
    hasName: true,
    nameText: {
      size: 32,
      color: "#ffffff",
      alignment: "center",
      position: { x: 200, y: 100 },
    },
    hasCompany: true,
    companyText: {
      size: 18,
      color: "#ccfbf1",
      alignment: "center",
      position: { x: 200, y: 155 },
    },
    hasTitle: true,
    titleText: {
      size: 15,
      color: "#5eead4",
      alignment: "center",
      position: { x: 200, y: 195 },
    },
    hasQrCode: true,
    qrCodeSize: { width: 150, height: 150 },
    qrCodePosition: { x: 125, y: 300 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  6 – VIP GOLD                                                              */
/*  Black + gold · right-aligned text · photo left side · small QR top-right  */
/* ========================================================================== */

const vipGold: PrebuiltBadgeTemplate = {
  key: "vip-gold",
  nameKey: "expressEvent.badgeTemplates.vipGold.name",
  descriptionKey: "expressEvent.badgeTemplates.vipGold.description",
  accentColor: "#b8860b",
  previewGradient: "linear-gradient(135deg, #111111 0%, #2d2d2d 50%, #b8860b 100%)",
  icon: "Star",
  category: "vip",
  template: {
    id: "prebuilt-vip-gold",
    name: "VIP Gold",
    type: "existing",
    width: 3.5,
    height: 5.5,
    hasBackground: true,
    bgColor: "#111111",
    bgImage: null,
    hasPersonalPhoto: true,
    photoSize: { width: 150, height: 150 },
    photoAlignment: "center",
    photoPosition: { x: 125, y: 40 },
    hasName: true,
    nameText: {
      size: 24,
      color: "#d4af37",
      alignment: "center",
      position: { x: 200, y: 225 },
    },
    hasCompany: true,
    companyText: {
      size: 14,
      color: "#f5f5f5",
      alignment: "center",
      position: { x: 200, y: 265 },
    },
    hasTitle: true,
    titleText: {
      size: 12,
      color: "#b8860b",
      alignment: "center",
      position: { x: 200, y: 295 },
    },
    hasQrCode: true,
    qrCodeSize: { width: 90, height: 90 },
    qrCodePosition: { x: 155, y: 365 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  7 – TECH NEON                                                             */
/*  Dark charcoal bg · cyan/electric-blue accent text · centred photo         */
/*  No company field – streamlined for hackathons / dev events                */
/* ========================================================================== */

const techNeon: PrebuiltBadgeTemplate = {
  key: "tech-neon",
  nameKey: "expressEvent.badgeTemplates.techNeon.name",
  descriptionKey: "expressEvent.badgeTemplates.techNeon.description",
  accentColor: "#06b6d4",
  previewGradient: "linear-gradient(135deg, #0f172a 0%, #164e63 100%)",
  icon: "Cpu",
  category: "tech",
  template: {
    id: "prebuilt-tech-neon",
    name: "Tech Neon",
    type: "existing",
    width: 3.5,
    height: 5.5,
    hasBackground: true,
    bgColor: "#0f172a",
    bgImage: null,
    hasPersonalPhoto: true,
    photoSize: { width: 120, height: 120 },
    photoAlignment: "center",
    photoPosition: { x: 140, y: 60 },
    hasName: true,
    nameText: {
      size: 24,
      color: "#06b6d4",
      alignment: "center",
      position: { x: 200, y: 215 },
    },
    hasCompany: false,
    companyText: {
      size: 14,
      color: "#67e8f9",
      alignment: "center",
      position: { x: 200, y: 260 },
    },
    hasTitle: true,
    titleText: {
      size: 14,
      color: "#22d3ee",
      alignment: "center",
      position: { x: 200, y: 255 },
    },
    hasQrCode: true,
    qrCodeSize: { width: 130, height: 130 },
    qrCodePosition: { x: 135, y: 330 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  8 – NETWORKING CARD                                                       */
/*  Coral bg · centred photo · white text · QR at bottom                      */
/*  Vibrant, approachable design for networking events                        */
/* ========================================================================== */

const networkingCard: PrebuiltBadgeTemplate = {
  key: "networking-card",
  nameKey: "expressEvent.badgeTemplates.networkingCard.name",
  descriptionKey: "expressEvent.badgeTemplates.networkingCard.description",
  accentColor: "#e11d48",
  previewGradient: "linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)",
  icon: "Users",
  category: "networking",
  template: {
    id: "prebuilt-networking-card",
    name: "Networking Card",
    type: "existing",
    width: 3.5,
    height: 4.5,
    hasBackground: true,
    bgColor: "#e11d48",
    bgImage: null,
    hasPersonalPhoto: true,
    photoSize: { width: 130, height: 130 },
    photoAlignment: "center",
    photoPosition: { x: 135, y: 30 },
    hasName: true,
    nameText: {
      size: 22,
      color: "#ffffff",
      alignment: "center",
      position: { x: 200, y: 190 },
    },
    hasCompany: true,
    companyText: {
      size: 14,
      color: "#fecdd3",
      alignment: "center",
      position: { x: 200, y: 225 },
    },
    hasTitle: true,
    titleText: {
      size: 12,
      color: "#fda4af",
      alignment: "center",
      position: { x: 200, y: 255 },
    },
    hasQrCode: true,
    qrCodeSize: { width: 100, height: 100 },
    qrCodePosition: { x: 150, y: 320 },
    qrCodeAlignment: "center",
  },
};

/* ========================================================================== */
/*  Exported list                                                             */
/* ========================================================================== */

export const prebuiltBadgeTemplates: PrebuiltBadgeTemplate[] = [
  corporateClassic,
  minimalistWhite,
  creativeGradient,
  elegantDark,
  conferencePro,
  vipGold,
  techNeon,
  networkingCard,
];
