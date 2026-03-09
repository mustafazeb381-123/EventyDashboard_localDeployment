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

function RejectionTemplateOne({
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
    <div
      style={{
        margin: 0,
        padding: 0,
        background: "#f1f5f9",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#0f172a",
      }}
    >
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: "48px 16px" }}>
        <tbody>
          <tr>
            <td align="center">
              <table
                width={680}
                cellPadding={0}
                cellSpacing={0}
                style={{
                  maxWidth: 680,
                  background: "#ffffff",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 20px 45px rgba(2,6,23,0.12)",
                }}
              >
                <tbody>
                  <tr>
                    {/* Left Panel */}
                    <td
                      width={220}
                      valign="top"
                      style={{
                        background: "linear-gradient(180deg,#0ea5e9,#0284c7)",
                        padding: "28px 22px",
                        color: "#ffffff",
                      }}
                    >
                      {isValidLogoUrl && !logoError ? (
                        <img
                          src={logoUrl!}
                          alt="Logo"
                          style={{ maxHeight: 44, marginBottom: 16 }}
                          onError={() => setLogoError(true)}
                          onLoad={() => setLogoError(false)}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.18)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            fontWeight: 700,
                          }}
                        >
                          !
                        </div>
                      )}
                      <h2 style={{ margin: "16px 0 10px", fontSize: 18, lineHeight: 1.3 }}>
                        Registration Status
                      </h2>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, opacity: 0.95 }}>
                        This message contains an update about your registration request.
                      </p>
                      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>
                        <strong>Ref:</strong> [REG-000123]
                        <br />
                        <strong>Date:</strong> [Today Date]
                      </div>
                    </td>
                    {/* Right Content */}
                    <td valign="top" style={{ padding: "30px 30px 26px 30px" }}>
                      <h1
                        style={{
                          margin: "0 0 8px",
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        We&apos;re sorry — your registration was not approved
                      </h1>
                      <p
                        style={{
                          margin: "0 0 18px",
                          fontSize: 14,
                          color: "#475569",
                          lineHeight: 1.8,
                        }}
                      >
                        Dear <strong>[Guest&apos;s Name]</strong>,
                        <br />
                        Thank you for registering for <strong>{eventName}</strong>. After review, we&apos;re unable to
                        confirm your registration at this time.
                      </p>
                      {/* Highlight Box */}
                      <table
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          margin: "18px 0 18px",
                        }}
                      >
                        <tbody>
                          <tr>
                            <td
                              style={{
                                padding: 14,
                                fontSize: 13,
                                color: "#0f172a",
                                lineHeight: 1.7,
                              }}
                            >
                              <strong style={{ display: "block", marginBottom: 6 }}>Event Details</strong>
                              <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: "6px 0", width: "30%", color: "#64748b" }}>
                                      <strong>Event</strong>
                                    </td>
                                    <td style={{ padding: "6px 0", color: "#0f172a" }}>{eventName}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "6px 0", color: "#64748b" }}>
                                      <strong>Date</strong>
                                    </td>
                                    <td style={{ padding: "6px 0", color: "#0f172a" }}>
                                      {formattedDateFrom || "[Start Date]"} – {formattedDateTo || "[End Date]"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "6px 0", color: "#64748b" }}>
                                      <strong>Time</strong>
                                    </td>
                                    <td style={{ padding: "6px 0", color: "#0f172a" }}>
                                      {formattedTimeFrom || "[Start Time]"} – {formattedTimeTo || "[End Time]"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "6px 0", color: "#64748b" }}>
                                      <strong>Location</strong>
                                    </td>
                                    <td style={{ padding: "6px 0", color: "#0f172a" }}>
                                      {location || "[Venue / City]"}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "6px 0", color: "#64748b" }}>
                                      <strong>Status</strong>
                                    </td>
                                    <td style={{ padding: "6px 0" }}>
                                      <span
                                        style={{
                                          display: "inline-block",
                                          background: "#fee2e2",
                                          color: "#991b1b",
                                          border: "1px solid #fecaca",
                                          padding: "4px 10px",
                                          borderRadius: 9999,
                                          fontSize: 12,
                                          fontWeight: 700,
                                        }}
                                      >
                                        Rejected
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p
                        style={{
                          margin: "0 0 18px",
                          fontSize: 13,
                          color: "#475569",
                          lineHeight: 1.8,
                        }}
                      >
                        This outcome may be due to limited capacity or event-specific criteria. If you believe this
                        decision was made in error, you may contact the organizers for clarification.
                      </p>
                      {/* Buttons Row */}
                      <table cellPadding={0} cellSpacing={0} border={0}>
                        <tbody>
                          <tr>
                            <td style={{ paddingRight: 10 }}>
                              <a
                                href="mailto:[support@email.com]"
                                style={{
                                  display: "inline-block",
                                  background: "#0f172a",
                                  color: "#ffffff",
                                  textDecoration: "none",
                                  padding: "11px 16px",
                                  borderRadius: 10,
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                Contact Support
                              </a>
                            </td>
                            <td>
                              <a
                                href="[EVENT_PAGE_LINK]"
                                style={{
                                  display: "inline-block",
                                  background: "#ffffff",
                                  color: "#0ea5e9",
                                  textDecoration: "none",
                                  padding: "11px 16px",
                                  borderRadius: 10,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  border: "1px solid #bae6fd",
                                }}
                              >
                                View Event Page
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {/* Footer */}
                      <div
                        style={{
                          marginTop: 22,
                          paddingTop: 14,
                          borderTop: "1px solid #e2e8f0",
                          fontSize: 12,
                          color: "#64748b",
                          lineHeight: 1.6,
                        }}
                      >
                        This email was sent by <strong>[sender@email.com]</strong>
                        <br />
                        © 2026 [Your Organization]. All rights reserved.
                      </div>
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

export default RejectionTemplateOne;
