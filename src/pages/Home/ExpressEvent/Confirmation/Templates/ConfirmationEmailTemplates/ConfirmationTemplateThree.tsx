import React from "react";

interface EventDataProps {
  eventName?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  timeFrom?: string;
  timeTo?: string;
  location?: string;
  logoUrl?: string | null;
}

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

const formatTime = (time: string | undefined): string => {
  if (!time) return "";
  return time;
};

/**
 * Confirmation Template Three — "Royal Indigo"
 *
 * Key visual differences:
 * - Deep indigo / violet palette (#4f46e5)
 * - Centred-aligned hero with large event name
 * - Icon-row event details (date · time · location in a single strip)
 * - Highlighted "Confirmed" badge with gradient background
 * - QR code placeholder section
 * - Dual CTA buttons (View Badge + Add to Calendar)
 * - All table-based for email-client compatibility
 */
function ConfirmationTemplateThree({
  eventName = "event name",
  dateFrom,
  dateTo,
  timeFrom,
  timeTo,
  location = "",
  logoUrl,
}: EventDataProps) {
  const [logoError, setLogoError] = React.useState(false);
  const formattedDateFrom = formatDate(dateFrom);
  const formattedDateTo = formatDate(dateTo);
  const formattedTimeFrom = formatTime(timeFrom);
  const formattedTimeTo = formatTime(timeTo);

  const isValidLogoUrl =
    logoUrl &&
    typeof logoUrl === "string" &&
    logoUrl.trim() !== "" &&
    (logoUrl.startsWith("http://") ||
      logoUrl.startsWith("https://") ||
      logoUrl.startsWith("data:") ||
      logoUrl.startsWith("/"));

  return (
    <div style={{ boxSizing: "border-box", margin: 0 }}>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        style={{ boxSizing: "border-box", padding: "30px 16px", backgroundColor: "#eef2ff" }}
      >
        <tbody>
          <tr>
            <td align="center">
              <table
                role="presentation"
                width={600}
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(79,70,229,0.10)",
                }}
              >
                <tbody>
                  {/* ─── HEADER ─── */}
                  <tr>
                    <td
                      style={{
                        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        padding: "22px 28px",
                      }}
                    >
                      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td align="left" valign="middle">
                              {isValidLogoUrl && !logoError ? (
                                <img
                                  src={logoUrl!}
                                  alt="Logo"
                                  style={{ maxHeight: 48, maxWidth: 180 }}
                                  onError={() => setLogoError(true)}
                                  onLoad={() => setLogoError(false)}
                                />
                              ) : (
                                <span
                                  style={{
                                    color: "#ffffff",
                                    fontSize: 17,
                                    fontWeight: 700,
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                    letterSpacing: 0.3,
                                  }}
                                >
                                  [Your Brand / Logo]
                                </span>
                              )}
                            </td>
                            <td align="right" valign="middle">
                              <span
                                style={{
                                  display: "inline-block",
                                  background: "rgba(255,255,255,0.20)",
                                  color: "#ffffff",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  padding: "6px 14px",
                                  borderRadius: 20,
                                  letterSpacing: 0.5,
                                }}
                              >
                                ✉ Confirmation
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── HERO — centred ─── */}
                  <tr>
                    <td align="center" style={{ padding: "32px 28px 8px 28px" }}>
                      {/* Confirmed badge */}
                      <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              style={{
                                backgroundColor: "#eef2ff",
                                borderRadius: 24,
                                padding: "8px 20px",
                                marginBottom: 16,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#4f46e5",
                                }}
                              >
                                ✅ Registration Confirmed
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <h1
                        style={{
                          margin: "18px 0 0",
                          fontSize: 28,
                          fontWeight: 800,
                          fontFamily: "Arial, Helvetica, sans-serif",
                          color: "#1e1b4b",
                          lineHeight: 1.3,
                        }}
                      >
                        Welcome to {eventName}
                      </h1>
                      <p
                        style={{
                          margin: "12px 0 0",
                          fontSize: 15,
                          fontFamily: "Arial, Helvetica, sans-serif",
                          color: "#4b5563",
                          lineHeight: 1.7,
                          maxWidth: 480,
                        }}
                      >
                        Hi <strong>[Guest&apos;s Name]</strong>, your spot is secured!
                        We can&apos;t wait to see you. Here&apos;s everything you need to know.
                      </p>
                    </td>
                  </tr>

                  {/* ─── EVENT DETAILS — icon row ─── */}
                  <tr>
                    <td style={{ padding: "22px 28px 0 28px" }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          backgroundColor: "#f5f3ff",
                          borderRadius: 12,
                          border: "1px solid #e0e7ff",
                        }}
                      >
                        <tbody>
                          {/* Date row */}
                          <tr>
                            <td
                              width="40"
                              valign="top"
                              style={{
                                padding: "16px 0 8px 18px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 18,
                              }}
                            >
                              📅
                            </td>
                            <td
                              valign="top"
                              style={{
                                padding: "16px 18px 8px 8px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" as const, letterSpacing: 0.8 }}>
                                Date
                              </div>
                              <div style={{ fontSize: 14, color: "#1f2937", marginTop: 2, lineHeight: 1.5 }}>
                                {formattedDateFrom || "[Start Date]"} — {formattedDateTo || "[End Date]"}
                              </div>
                            </td>
                          </tr>
                          {/* Time row */}
                          <tr>
                            <td
                              width="40"
                              valign="top"
                              style={{
                                padding: "8px 0 8px 18px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 18,
                              }}
                            >
                              ⏰
                            </td>
                            <td
                              valign="top"
                              style={{
                                padding: "8px 18px 8px 8px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" as const, letterSpacing: 0.8 }}>
                                Time
                              </div>
                              <div style={{ fontSize: 14, color: "#1f2937", marginTop: 2, lineHeight: 1.5 }}>
                                {formattedTimeFrom || "[Start Time]"} – {formattedTimeTo || "[End Time]"}
                              </div>
                            </td>
                          </tr>
                          {/* Location row */}
                          <tr>
                            <td
                              width="40"
                              valign="top"
                              style={{
                                padding: "8px 0 16px 18px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 18,
                              }}
                            >
                              📍
                            </td>
                            <td
                              valign="top"
                              style={{
                                padding: "8px 18px 16px 8px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                              }}
                            >
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", textTransform: "uppercase" as const, letterSpacing: 0.8 }}>
                                Location
                              </div>
                              <div style={{ fontSize: 14, color: "#1f2937", marginTop: 2, lineHeight: 1.5 }}>
                                {location || "[Venue / City]"}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── REGISTRATION DETAILS ─── */}
                  <tr>
                    <td style={{ padding: "14px 28px 0 28px" }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              width="50%"
                              style={{
                                padding: "14px 18px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 13,
                                color: "#374151",
                                borderRight: "1px solid #e5e7eb",
                              }}
                            >
                              <span style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                                Registration ID
                              </span>
                              <br />
                              <strong style={{ color: "#1e1b4b" }}>[REG-000123]</strong>
                            </td>
                            <td
                              width="50%"
                              style={{
                                padding: "14px 18px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 13,
                                color: "#374151",
                              }}
                            >
                              <span style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>
                                Ticket Type
                              </span>
                              <br />
                              <strong style={{ color: "#1e1b4b" }}>[General / VIP]</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── WHAT TO BRING ─── */}
                  <tr>
                    <td style={{ padding: "14px 28px 0 28px" }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          backgroundColor: "#faf5ff",
                          borderRadius: 10,
                          borderLeft: "4px solid #7c3aed",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                padding: "16px 20px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 13,
                                color: "#4c1d95",
                                lineHeight: 1.8,
                              }}
                            >
                              <strong style={{ fontSize: 14 }}>What to bring:</strong>
                              <br />
                              • This confirmation email or your QR code
                              <br />
                              • A valid photo ID for badge pickup
                              <br />
                              • Arrive at least 15 minutes before start time
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── CTA BUTTONS ─── */}
                  <tr>
                    <td align="center" style={{ padding: "26px 28px 10px 28px" }}>
                      <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              style={{
                                backgroundColor: "#4f46e5",
                                borderRadius: 10,
                              }}
                            >
                              <a
                                href="[VIEW_TICKET_LINK]"
                                style={{
                                  display: "inline-block",
                                  padding: "14px 30px",
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: "#ffffff",
                                  textDecoration: "none",
                                }}
                              >
                                View My Badge
                              </a>
                            </td>
                            <td style={{ width: 12 }} />
                            <td
                              align="center"
                              style={{
                                borderRadius: 10,
                                border: "2px solid #c7d2fe",
                              }}
                            >
                              <a
                                href="[ADD_TO_CALENDAR_LINK]"
                                style={{
                                  display: "inline-block",
                                  padding: "12px 24px",
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: "#4f46e5",
                                  textDecoration: "none",
                                }}
                              >
                                Add to Calendar
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ height: 22 }} />
                  </tr>

                  {/* ─── FOOTER ─── */}
                  <tr>
                    <td
                      style={{
                        background: "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)",
                        padding: "18px 28px",
                        fontFamily: "Arial, Helvetica, sans-serif",
                      }}
                    >
                      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td
                              align="left"
                              style={{ fontSize: 12, color: "#c4b5fd", lineHeight: 1.7 }}
                            >
                              Need help?{" "}
                              <a
                                href="mailto:[support@email.com]"
                                style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 700 }}
                              >
                                [support@email.com]
                              </a>
                              <br />
                              © 2026 [Your Organization]. All rights reserved.
                            </td>
                            <td
                              align="right"
                              style={{ fontSize: 12, color: "#c4b5fd", lineHeight: 1.7 }}
                            >
                              <a href="[WEBSITE_LINK]" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 700 }}>
                                Website
                              </a>{" "}
                              •{" "}
                              <a href="[PRIVACY_LINK]" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 700 }}>
                                Privacy
                              </a>{" "}
                              •{" "}
                              <a href="[TERMS_LINK]" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 700 }}>
                                Terms
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ConfirmationTemplateThree;
