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

const formatTimeDisplay = (time: string | undefined): string => {
  if (!time) return "";
  if (time.includes(":")) {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  return time;
};

function ThanksTemplateThree({
  eventName = "event name",
  dateFrom,
  dateTo,
  timeFrom,
  timeTo,
  location,
  logoUrl,
}: EventDataProps) {
  const [logoError, setLogoError] = React.useState(false);
  const formattedDateFrom = formatDate(dateFrom);
  const formattedDateTo = formatDate(dateTo);
  const formattedTimeFrom = formatTimeDisplay(timeFrom);
  const formattedTimeTo = formatTimeDisplay(timeTo);

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
        style={{ boxSizing: "border-box" }}
      >
        <tbody style={{ boxSizing: "border-box" }}>
          <tr style={{ boxSizing: "border-box" }}>
            <td align="center" style={{ boxSizing: "border-box" }}>
              <table
                role="presentation"
                width={600}
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{ boxSizing: "border-box" }}
              >
                <tbody style={{ boxSizing: "border-box" }}>
                  <tr style={{ boxSizing: "border-box" }}>
                    <td style={{ boxSizing: "border-box", padding: "30px 16px" }}>
                      <table
                        width={640}
                        cellPadding={0}
                        cellSpacing={0}
                        style={{
                          boxSizing: "border-box",
                          background: "#ffffff",
                          borderRadius: 16,
                          overflow: "hidden",
                          boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
                        }}
                      >
                        {/* Top accent bar */}
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              style={{
                                boxSizing: "border-box",
                                height: 5,
                                background: "linear-gradient(90deg, #2563eb, #0ea5e9)",
                              }}
                            />
                          </tr>
                          {/* Header - compact */}
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              style={{
                                boxSizing: "border-box",
                                padding: "24px 28px 16px",
                                background: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                              }}
                            >
                              {isValidLogoUrl && !logoError ? (
                                <img
                                  src={logoUrl!}
                                  alt="Logo"
                                  style={{ maxHeight: 36, marginBottom: 10 }}
                                  onError={() => setLogoError(true)}
                                  onLoad={() => setLogoError(false)}
                                />
                              ) : (
                                <div
                                  style={{
                                    fontSize: 12,
                                    letterSpacing: 0.5,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Event Registration
                                </div>
                              )}
                              <h1
                                style={{
                                  boxSizing: "border-box",
                                  margin: "8px 0 4px 0",
                                  fontSize: 24,
                                  fontWeight: 700,
                                  color: "#0f172a",
                                }}
                              >
                                Thank You for Registering 🎉
                              </h1>
                              <p
                                style={{
                                  boxSizing: "border-box",
                                  margin: 0,
                                  fontSize: 14,
                                  color: "#475569",
                                  lineHeight: 1.5,
                                }}
                              >
                                Your registration has been successfully confirmed.
                              </p>
                            </td>
                          </tr>
                          {/* Content */}
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              style={{
                                boxSizing: "border-box",
                                padding: "24px 28px",
                                color: "#1e293b",
                              }}
                            >
                              <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.7 }}>
                                Hi <strong>[Guest&apos;s Name]</strong>, 👋
                                <br />
                                Thanks for being part of our event — we&apos;re glad to have you with us.
                              </p>
                              {/* Single event block */}
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  boxSizing: "border-box",
                                  marginTop: 16,
                                  background: "#f1f5f9",
                                  borderRadius: 12,
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td style={{ boxSizing: "border-box", padding: 16 }}>
                                      <div
                                        style={{
                                          fontSize: 11,
                                          color: "#64748b",
                                          letterSpacing: 0.5,
                                          textTransform: "uppercase",
                                          marginBottom: 6,
                                        }}
                                      >
                                        Event overview
                                      </div>
                                      <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                                        {eventName}
                                      </div>
                                      <div
                                        style={{
                                          marginTop: 10,
                                          fontSize: 13,
                                          lineHeight: 1.7,
                                          color: "#475569",
                                        }}
                                      >
                                        📅 {formattedDateFrom || "[Start Date]"} → {formattedDateTo || "[End Date]"}
                                        <br />
                                        🕒 {formattedTimeFrom || "[Start Time]"} – {formattedTimeTo || "[End Time]"}
                                        <br />
                                        📍 {location || "[City / Location]"}
                                      </div>
                                      <div style={{ marginTop: 10, fontSize: 13 }}>
                                        <strong>ID:</strong> [REG-000123] • <strong>Ticket:</strong> [General / VIP] •
                                        <strong> Status:</strong> Confirmed ✅
                                      </div>
                                      <div style={{ marginTop: 10 }}>
                                        <a
                                          href="[MAP_LINK]"
                                          style={{
                                            color: "#2563eb",
                                            fontSize: 13,
                                            fontWeight: 600,
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
                              {/* Notes */}
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  boxSizing: "border-box",
                                  marginTop: 16,
                                  background: "#fffbeb",
                                  border: "1px solid #fde68a",
                                  borderRadius: 12,
                                }}
                              >
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        padding: 14,
                                        fontSize: 13,
                                        lineHeight: 1.7,
                                        color: "#92400e",
                                      }}
                                    >
                                      ℹ️ <strong>Important:</strong> Please arrive 15–30 minutes early. Badge pickup
                                      at the registration desk.
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              {/* CTA */}
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{ boxSizing: "border-box", marginTop: 20 }}
                              >
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td align="center" style={{ boxSizing: "border-box" }}>
                                      <a
                                        href="[VIEW_REGISTRATION_LINK]"
                                        style={{
                                          background: "#2563eb",
                                          color: "#ffffff",
                                          textDecoration: "none",
                                          padding: "12px 24px",
                                          borderRadius: 8,
                                          fontSize: 14,
                                          fontWeight: 700,
                                          display: "inline-block",
                                          marginRight: 8,
                                        }}
                                      >
                                        View Registration
                                      </a>
                                      <a
                                        href="[ADD_TO_CALENDAR_LINK]"
                                        style={{
                                          background: "#ffffff",
                                          color: "#2563eb",
                                          textDecoration: "none",
                                          padding: "12px 20px",
                                          borderRadius: 8,
                                          fontSize: 14,
                                          fontWeight: 700,
                                          display: "inline-block",
                                          border: "1px solid #93c5fd",
                                        }}
                                      >
                                        Add to Calendar
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p style={{ marginTop: 20, marginBottom: 0, fontSize: 14, lineHeight: 1.6 }}>
                                Best regards,
                                <br />
                                <strong>[Your Organization]</strong>
                              </p>
                            </td>
                          </tr>
                          {/* Footer */}
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              align="center"
                              style={{
                                boxSizing: "border-box",
                                background: "#f1f5f9",
                                padding: 16,
                                color: "#64748b",
                                fontSize: 12,
                                lineHeight: 1.5,
                                borderTop: "1px solid #e2e8f0",
                              }}
                            >
                              © 2026 [Your Organization]. All rights reserved.
                              <br />
                              This email was sent automatically.
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

export default ThanksTemplateThree;
