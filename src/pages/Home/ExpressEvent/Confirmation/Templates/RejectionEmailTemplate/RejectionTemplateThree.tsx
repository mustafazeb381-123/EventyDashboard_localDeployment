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

function RejectionTemplateThree({
  eventName = "event name",
  dateFrom,
  dateTo,
  timeFrom,
  timeTo,
  location,
}: EventDataProps) {
  const formattedDateFrom = formatDate(dateFrom);
  const formattedDateTo = formatDate(dateTo);
  const formattedTimeFrom = formatTime(timeFrom);
  const formattedTimeTo = formatTime(timeTo);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        background: "#eef2ff",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#111827",
      }}
    >
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: "48px 16px" }}>
        <tbody>
          <tr>
            <td align="center">
              <table
                width={600}
                cellPadding={0}
                cellSpacing={0}
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 20px 40px rgba(15,23,42,0.15)",
                }}
              >
                {/* Top Accent */}
                <tbody>
                  <tr>
                    <td
                      style={{
                        height: 6,
                        background: "linear-gradient(90deg, #6366f1, #ec4899)",
                      }}
                    />
                  </tr>
                  {/* Header */}
                  <tr>
                    <td style={{ padding: "28px 32px" }}>
                      <h1
                        style={{
                          margin: "0 0 8px",
                          fontSize: 24,
                          fontWeight: 800,
                          color: "#111827",
                        }}
                      >
                        Registration Update
                      </h1>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          color: "#6b7280",
                          lineHeight: 1.6,
                        }}
                      >
                        Important information regarding your event registration
                      </p>
                    </td>
                  </tr>
                  {/* Status Badge */}
                  <tr>
                    <td style={{ padding: "0 32px 10px 32px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "6px 12px",
                          borderRadius: 9999,
                        }}
                      >
                        ❌ Registration Not Approved
                      </span>
                    </td>
                  </tr>
                  {/* Message */}
                  <tr>
                    <td style={{ padding: "20px 32px" }}>
                      <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.8 }}>
                        Hello <strong>[Guest&apos;s Name]</strong>,
                      </p>
                      <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.8 }}>
                        Thank you for your interest in attending <strong>{eventName}</strong>.
                      </p>
                      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8 }}>
                        After reviewing all registrations, we regret to inform you that your request could not be
                        approved at this time.
                      </p>
                    </td>
                  </tr>
                  {/* Info Cards - two columns */}
                  <tr>
                    <td style={{ padding: "0 32px 24px 32px" }}>
                      <table width="100%" cellPadding={0} cellSpacing={0}>
                        <tbody>
                          <tr>
                            <td width="50%" style={{ paddingRight: 8, verticalAlign: "top" }}>
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  background: "#f8fafc",
                                  borderRadius: 12,
                                  border: "1px solid #e5e7eb",
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td style={{ padding: 14, fontSize: 13, lineHeight: 1.7 }}>
                                      <strong>Event</strong>
                                      <br />
                                      <span style={{ color: "#6b7280" }}>{eventName}</span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td width="50%" style={{ paddingLeft: 8, verticalAlign: "top" }}>
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  background: "#f8fafc",
                                  borderRadius: 12,
                                  border: "1px solid #e5e7eb",
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td style={{ padding: 14, fontSize: 13, lineHeight: 1.7 }}>
                                      <strong>Date</strong>
                                      <br />
                                      <span style={{ color: "#6b7280" }}>
                                        {formattedDateFrom || "[Start Date]"} – {formattedDateTo || "[End Date]"}
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ paddingTop: 8, paddingRight: 8, verticalAlign: "top" }}>
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  background: "#f8fafc",
                                  borderRadius: 12,
                                  border: "1px solid #e5e7eb",
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td style={{ padding: 14, fontSize: 13, lineHeight: 1.7 }}>
                                      <strong>Time</strong>
                                      <br />
                                      <span style={{ color: "#6b7280" }}>
                                        {formattedTimeFrom || "[Start Time]"} – {formattedTimeTo || "[End Time]"}
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td style={{ paddingTop: 8, paddingLeft: 8, verticalAlign: "top" }}>
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  background: "#f8fafc",
                                  borderRadius: 12,
                                  border: "1px solid #e5e7eb",
                                }}
                              >
                                <tbody>
                                  <tr>
                                    <td style={{ padding: 14, fontSize: 13, lineHeight: 1.7 }}>
                                      <strong>Location</strong>
                                      <br />
                                      <span style={{ color: "#6b7280" }}>{location || "[Venue / City]"}</span>
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
                  {/* Optional Note */}
                  <tr>
                    <td style={{ padding: "0 32px 24px 32px" }}>
                      <div
                        style={{
                          background: "#fefce8",
                          border: "1px dashed #fde68a",
                          borderRadius: 12,
                          padding: 14,
                          fontSize: 13,
                          color: "#92400e",
                          lineHeight: 1.7,
                        }}
                      >
                        💡 <strong>Note:</strong> This decision may be due to capacity limits or event-specific
                        selection criteria.
                      </div>
                    </td>
                  </tr>
                  {/* CTA */}
                  <tr>
                    <td align="center" style={{ padding: "8px 32px 28px 32px" }}>
                      <a
                        href="mailto:[support@email.com]"
                        style={{
                          background: "#111827",
                          color: "#ffffff",
                          textDecoration: "none",
                          padding: "12px 28px",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 700,
                          display: "inline-block",
                        }}
                      >
                        Contact Support
                      </a>
                    </td>
                  </tr>
                  {/* Footer */}
                  <tr>
                    <td
                      style={{
                        padding: "20px 32px",
                        background: "#f9fafb",
                        borderTop: "1px solid #e5e7eb",
                        fontSize: 12,
                        color: "#6b7280",
                        lineHeight: 1.6,
                      }}
                    >
                      If you have questions, reach us at{" "}
                      <a
                        href="mailto:[support@email.com]"
                        style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}
                      >
                        [support@email.com]
                      </a>
                      <br />© 2026 [Your Organization]
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

export default RejectionTemplateThree;
