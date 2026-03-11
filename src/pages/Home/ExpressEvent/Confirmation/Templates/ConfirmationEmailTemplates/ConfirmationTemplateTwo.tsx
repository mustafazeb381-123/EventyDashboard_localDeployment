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
 * Confirmation Template Two — "Elegant Emerald"
 *
 * Key visual differences from Template One:
 * - Emerald-green accent colour palette (#047857)
 * - Left-aligned header with event name prominent
 * - Two-column event details (date/time left, location right)
 * - Rounded green "Confirmed" pill in hero
 * - Teal info strip for next-steps
 * - Single centred CTA button
 * - All table-based for email-client compatibility
 */
function ConfirmationTemplateTwo({
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
        style={{ boxSizing: "border-box", padding: "30px 16px", backgroundColor: "#f0fdf4" }}
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
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #d1fae5",
                }}
              >
                <tbody>
                  {/* ─── HEADER ─── */}
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#047857",
                        padding: "20px 28px",
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
                                  style={{ maxHeight: 50, maxWidth: 180 }}
                                  onError={() => setLogoError(true)}
                                  onLoad={() => setLogoError(false)}
                                />
                              ) : (
                                <span
                                  style={{
                                    color: "#ffffff",
                                    fontSize: 18,
                                    fontWeight: 700,
                                    fontFamily: "Arial, Helvetica, sans-serif",
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
                                  backgroundColor: "#ecfdf5",
                                  color: "#047857",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  padding: "6px 14px",
                                  borderRadius: 20,
                                  letterSpacing: 0.5,
                                  textTransform: "uppercase" as const,
                                }}
                              >
                                ✓ Confirmed
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── HERO ─── */}
                  <tr>
                    <td style={{ padding: "30px 28px 10px 28px" }}>
                      <h1
                        style={{
                          margin: 0,
                          fontSize: 26,
                          fontWeight: 800,
                          fontFamily: "Arial, Helvetica, sans-serif",
                          color: "#064e3b",
                          lineHeight: 1.3,
                        }}
                      >
                        You&apos;re All Set, [Guest&apos;s Name]!
                      </h1>
                      <p
                        style={{
                          margin: "12px 0 0",
                          fontSize: 15,
                          fontFamily: "Arial, Helvetica, sans-serif",
                          color: "#374151",
                          lineHeight: 1.7,
                        }}
                      >
                        Your registration for <strong>{eventName}</strong> has been confirmed.
                        We&apos;re excited to have you join us — here are your event details.
                      </p>
                    </td>
                  </tr>

                  {/* ─── EVENT DETAILS — Two-column ─── */}
                  <tr>
                    <td style={{ padding: "18px 28px 0 28px" }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          backgroundColor: "#f0fdf4",
                          borderRadius: 10,
                          border: "1px solid #d1fae5",
                        }}
                      >
                        <tbody>
                          <tr>
                            {/* Left column — date & time */}
                            <td
                              width="50%"
                              valign="top"
                              style={{
                                padding: "18px 16px 18px 20px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#047857",
                                  textTransform: "uppercase" as const,
                                  letterSpacing: 0.8,
                                  marginBottom: 6,
                                }}
                              >
                                📅 Date &amp; Time
                              </div>
                              <div style={{ fontSize: 14, color: "#1f2937", lineHeight: 1.6 }}>
                                {formattedDateFrom || "[Start Date]"} — {formattedDateTo || "[End Date]"}
                              </div>
                              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                                {formattedTimeFrom || "[Start Time]"} – {formattedTimeTo || "[End Time]"}
                              </div>
                            </td>
                            {/* Right column — location */}
                            <td
                              width="50%"
                              valign="top"
                              style={{
                                padding: "18px 20px 18px 16px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                borderLeft: "1px solid #d1fae5",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#047857",
                                  textTransform: "uppercase" as const,
                                  letterSpacing: 0.8,
                                  marginBottom: 6,
                                }}
                              >
                                📍 Location
                              </div>
                              <div style={{ fontSize: 14, color: "#1f2937", lineHeight: 1.6 }}>
                                {location || "[Venue Name]"}
                              </div>
                              <div style={{ marginTop: 6 }}>
                                <a
                                  href="[MAP_LINK]"
                                  style={{
                                    fontSize: 12,
                                    color: "#047857",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                  }}
                                >
                                  View on Map →
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── REGISTRATION INFO STRIP ─── */}
                  <tr>
                    <td style={{ padding: "14px 28px 0 28px" }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                padding: "14px 20px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 13,
                                color: "#374151",
                                lineHeight: 1.6,
                              }}
                            >
                              <strong style={{ color: "#064e3b" }}>Registration ID:</strong> [REG-000123]
                              &nbsp;&nbsp;•&nbsp;&nbsp;
                              <strong style={{ color: "#064e3b" }}>Ticket Type:</strong> [General / VIP]
                              &nbsp;&nbsp;•&nbsp;&nbsp;
                              <strong style={{ color: "#064e3b" }}>Status:</strong>{" "}
                              <span style={{ color: "#047857", fontWeight: 700 }}>Confirmed ✓</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── NEXT STEPS ─── */}
                  <tr>
                    <td style={{ padding: "14px 28px 0 28px" }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          backgroundColor: "#ecfdf5",
                          borderRadius: 10,
                          borderLeft: "4px solid #047857",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                padding: "16px 20px",
                                fontFamily: "Arial, Helvetica, sans-serif",
                                fontSize: 13,
                                color: "#065f46",
                                lineHeight: 1.8,
                              }}
                            >
                              <strong style={{ fontSize: 14 }}>Before the event:</strong>
                              <br />
                              • Arrive 15 – 30 minutes early for registration
                              <br />
                              • Bring a valid ID and this confirmation email
                              <br />
                              • Badge pickup is at the main entrance
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ─── CTA ─── */}
                  <tr>
                    <td align="center" style={{ padding: "24px 28px 10px 28px" }}>
                      <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              style={{
                                backgroundColor: "#047857",
                                borderRadius: 10,
                              }}
                            >
                              <a
                                href="[VIEW_TICKET_LINK]"
                                style={{
                                  display: "inline-block",
                                  padding: "14px 36px",
                                  fontFamily: "Arial, Helvetica, sans-serif",
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: "#ffffff",
                                  textDecoration: "none",
                                }}
                              >
                                View My Badge
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ height: 20 }} />
                  </tr>

                  {/* ─── FOOTER ─── */}
                  <tr>
                    <td
                      style={{
                        backgroundColor: "#064e3b",
                        padding: "18px 28px",
                        fontFamily: "Arial, Helvetica, sans-serif",
                      }}
                    >
                      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td
                              align="left"
                              style={{ fontSize: 12, color: "#a7f3d0", lineHeight: 1.7 }}
                            >
                              Need help?{" "}
                              <a
                                href="mailto:[support@email.com]"
                                style={{ color: "#6ee7b7", textDecoration: "none", fontWeight: 700 }}
                              >
                                [support@email.com]
                              </a>
                              <br />
                              © 2026 [Your Organization]. All rights reserved.
                            </td>
                            <td
                              align="right"
                              style={{ fontSize: 12, color: "#a7f3d0", lineHeight: 1.7 }}
                            >
                              <a href="[WEBSITE_LINK]" style={{ color: "#6ee7b7", textDecoration: "none", fontWeight: 700 }}>
                                Website
                              </a>{" "}
                              •{" "}
                              <a href="[PRIVACY_LINK]" style={{ color: "#6ee7b7", textDecoration: "none", fontWeight: 700 }}>
                                Privacy
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

export default ConfirmationTemplateTwo;
