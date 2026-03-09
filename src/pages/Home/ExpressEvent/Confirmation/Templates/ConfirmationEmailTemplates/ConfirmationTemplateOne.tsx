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

function ConfirmationTemplateOne({
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
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box", padding: "30px 16px" }}>
        <tbody style={{ boxSizing: "border-box" }}>
          <tr style={{ boxSizing: "border-box" }}>
            <td align="center" style={{ boxSizing: "border-box" }}>
              <table
                width={640}
                cellPadding={0}
                cellSpacing={0}
                style={{
                  boxSizing: "border-box",
                  background: "#ffffff",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
                }}
              >
                {/* HEADER */}
                <tbody style={{ boxSizing: "border-box" }}>
                  <tr style={{ boxSizing: "border-box" }}>
                    <td
                      style={{
                        boxSizing: "border-box",
                        background: "#0b1220",
                        padding: "18px 24px",
                      }}
                    >
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box" }}>
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td align="left" valign="middle" style={{ boxSizing: "border-box" }}>
                              {isValidLogoUrl && !logoError ? (
                                <img
                                  src={logoUrl!}
                                  alt="Logo"
                                  style={{ maxHeight: 60, maxWidth: 200 }}
                                  onError={() => setLogoError(true)}
                                  onLoad={() => setLogoError(false)}
                                />
                              ) : (
                                <>
                                  <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 16, letterSpacing: 0.3 }}>
                                    [Your Brand / Logo]
                                  </div>
                                  <div style={{ color: "#cbd5e1", fontSize: 12, marginTop: 3 }}>
                                    Official Confirmation Email
                                  </div>
                                </>
                              )}
                            </td>
                            <td align="right" valign="middle" style={{ boxSizing: "border-box" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  background: "#0f766e",
                                  color: "#ffffff",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  padding: "8px 12px",
                                  borderRadius: 9999,
                                }}
                              >
                                ✅ Confirmed
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  {/* HERO */}
                  <tr style={{ boxSizing: "border-box" }}>
                    <td
                      style={{
                        boxSizing: "border-box",
                        padding: "26px 24px 16px 24px",
                        background: "linear-gradient(135deg,#eff6ff,#ffffff)",
                      }}
                    >
                      <h1
                        style={{
                          boxSizing: "border-box",
                          margin: 0,
                          fontSize: 28,
                          color: "#0b1220",
                          fontWeight: 800,
                          lineHeight: 1.2,
                        }}
                      >
                        Thank You — Your Registration is Confirmed
                      </h1>
                      <p
                        style={{
                          boxSizing: "border-box",
                          margin: "10px 0 0",
                          fontSize: 14,
                          color: "#334155",
                          lineHeight: 1.7,
                        }}
                      >
                        Hi <strong style={{ boxSizing: "border-box" }}>[Guest&apos;s Name]</strong>, thanks for your
                        interest. Your registration request has been reviewed, approved, and confirmed. We look forward
                        to seeing you!
                      </p>
                    </td>
                  </tr>
                  {/* CONTENT */}
                  <tr style={{ boxSizing: "border-box" }}>
                    <td style={{ boxSizing: "border-box", padding: "18px 24px 0 24px" }}>
                      {/* Key Info Strip */}
                      <table
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{
                          boxSizing: "border-box",
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          overflow: "hidden",
                        }}
                      >
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              style={{
                                boxSizing: "border-box",
                                padding: 14,
                                background: "#ffffff",
                              }}
                            >
                              <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box" }}>
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        fontSize: 13,
                                        color: "#334155",
                                        lineHeight: 1.7,
                                      }}
                                    >
                                      <strong>Registration ID:</strong> [REG-000123] • <strong>Ticket:</strong> [General
                                      / VIP] • <strong>Status:</strong> Approved ✅
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {/* Event Details Title */}
                      <h3
                        style={{
                          boxSizing: "border-box",
                          margin: "18px 0 10px 0",
                          fontSize: 15,
                          color: "#0b1220",
                          fontWeight: 800,
                        }}
                      >
                        Event Details
                      </h3>
                      {/* Event Details Card */}
                      <table
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{
                          boxSizing: "border-box",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                        }}
                      >
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td style={{ boxSizing: "border-box", padding: 16 }}>
                              <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box" }}>
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        padding: "6px 0",
                                        fontSize: 13,
                                        color: "#475569",
                                      }}
                                    >
                                      <strong style={{ color: "#0b1220" }}>Event Name:</strong> {eventName}
                                    </td>
                                  </tr>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        padding: "6px 0",
                                        fontSize: 13,
                                        color: "#475569",
                                      }}
                                    >
                                      <strong style={{ color: "#0b1220" }}>Date:</strong> {formattedDateFrom || "[Start Date]"} →{" "}
                                      {formattedDateTo || "[End Date]"}
                                    </td>
                                  </tr>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        padding: "6px 0",
                                        fontSize: 13,
                                        color: "#475569",
                                      }}
                                    >
                                      <strong style={{ color: "#0b1220" }}>Time:</strong> {formattedTimeFrom || "[Start Time]"} –{" "}
                                      {formattedTimeTo || "[End Time]"}
                                    </td>
                                  </tr>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        padding: "6px 0",
                                        fontSize: 13,
                                        color: "#475569",
                                      }}
                                    >
                                      <strong style={{ color: "#0b1220" }}>Location:</strong> {location || "[Venue / City]"}
                                    </td>
                                  </tr>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        padding: "10px 0 0",
                                        fontSize: 13,
                                      }}
                                    >
                                      <a
                                        href="[MAP_LINK]"
                                        style={{
                                          boxSizing: "border-box",
                                          color: "#2563eb",
                                          textDecoration: "none",
                                          fontWeight: 700,
                                        }}
                                      >
                                        View Location on Map →
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
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
                          marginTop: 14,
                          background: "#ecfeff",
                          border: "1px solid #a5f3fc",
                          borderRadius: 14,
                        }}
                      >
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              style={{
                                boxSizing: "border-box",
                                padding: 14,
                                fontSize: 13,
                                color: "#0f172a",
                                lineHeight: 1.7,
                              }}
                            >
                              <strong>What to do next:</strong>
                              <br />
                              • Please arrive 15–30 minutes early.
                              <br />
                              • Keep this email for quick access to your ticket.
                              <br />
                              • Badge pickup will be available at the registration desk.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {/* Buttons */}
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box", marginTop: 18 }}>
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td align="center" style={{ boxSizing: "border-box", padding: "6px 0 0 0" }}>
                              <a
                                href="[VIEW_TICKET_LINK]"
                                style={{
                                  boxSizing: "border-box",
                                  background: "#2563eb",
                                  color: "#ffffff",
                                  textDecoration: "none",
                                  padding: "12px 22px",
                                  borderRadius: 12,
                                  fontSize: 14,
                                  fontWeight: 800,
                                  display: "inline-block",
                                  marginRight: 10,
                                }}
                              >
                                View Badge
                              </a>
                              <a
                                href="[ADD_TO_CALENDAR_LINK]"
                                style={{
                                  boxSizing: "border-box",
                                  background: "#ffffff",
                                  color: "#2563eb",
                                  textDecoration: "none",
                                  padding: "12px 18px",
                                  borderRadius: 12,
                                  fontSize: 14,
                                  fontWeight: 800,
                                  display: "inline-block",
                                  border: "1px solid #bfdbfe",
                                }}
                              >
                                Add to Calendar
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div style={{ boxSizing: "border-box", height: 22 }} />
                    </td>
                  </tr>
                  {/* FOOTER */}
                  <tr style={{ boxSizing: "border-box" }}>
                    <td
                      style={{
                        boxSizing: "border-box",
                        background: "#0b1220",
                        padding: "18px 24px",
                        color: "#cbd5e1",
                      }}
                    >
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box" }}>
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              align="left"
                              style={{ boxSizing: "border-box", fontSize: 12, lineHeight: 1.7 }}
                            >
                              Need help? Contact us at{" "}
                              <a
                                href="mailto:[support@email.com]"
                                style={{
                                  boxSizing: "border-box",
                                  color: "#93c5fd",
                                  textDecoration: "none",
                                  fontWeight: 700,
                                }}
                              >
                                [support@email.com]
                              </a>
                              <br />
                              © 2026 [Your Organization]. All rights reserved.
                            </td>
                            <td
                              align="right"
                              style={{ boxSizing: "border-box", fontSize: 12, lineHeight: 1.7 }}
                            >
                              <a
                                href="[WEBSITE_LINK]"
                                style={{
                                  boxSizing: "border-box",
                                  color: "#93c5fd",
                                  textDecoration: "none",
                                  fontWeight: 700,
                                }}
                              >
                                Website
                              </a>{" "}
                              •{" "}
                              <a
                                href="[PRIVACY_LINK]"
                                style={{
                                  boxSizing: "border-box",
                                  color: "#93c5fd",
                                  textDecoration: "none",
                                  fontWeight: 700,
                                }}
                              >
                                Privacy
                              </a>{" "}
                              •{" "}
                              <a
                                href="[TERMS_LINK]"
                                style={{
                                  boxSizing: "border-box",
                                  color: "#93c5fd",
                                  textDecoration: "none",
                                  fontWeight: 700,
                                }}
                              >
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

export default ConfirmationTemplateOne;
