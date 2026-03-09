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

function ThanksTemplateOne({
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
                          borderRadius: 18,
                          overflow: "hidden",
                          boxShadow: "rgba(0, 0, 0, 0.08) 0px 20px 40px",
                        }}
                      >
                        {/* Header */}
                        <tbody style={{ boxSizing: "border-box" }}>
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              style={{
                                boxSizing: "border-box",
                                background: "linear-gradient(135deg, rgb(15, 23, 42), rgb(30, 41, 59))",
                                padding: "32px 28px",
                                color: "#ffffff",
                              }}
                            >
                              {isValidLogoUrl && !logoError ? (
                                <img
                                  src={logoUrl!}
                                  alt="Logo"
                                  style={{ maxHeight: 40, marginBottom: 12 }}
                                  onError={() => setLogoError(true)}
                                  onLoad={() => setLogoError(false)}
                                />
                              ) : (
                                <div
                                  style={{
                                    fontSize: 13,
                                    letterSpacing: 1,
                                    opacity: 0.85,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Event Registration
                                </div>
                              )}
                              <h1
                                style={{
                                  boxSizing: "border-box",
                                  margin: "10px 0 6px 0",
                                  fontSize: 30,
                                  fontWeight: 700,
                                }}
                              >
                                Thank You for Registering 🎉
                              </h1>
                              <p
                                style={{
                                  boxSizing: "border-box",
                                  margin: 0,
                                  fontSize: 15,
                                  opacity: 0.9,
                                  lineHeight: 1.6,
                                }}
                              >
                                We truly appreciate your interest — your registration has been successfully confirmed.
                              </p>
                            </td>
                          </tr>
                          {/* Content */}
                          <tr style={{ boxSizing: "border-box" }}>
                            <td
                              style={{
                                boxSizing: "border-box",
                                padding: "28px",
                                color: "rgb(17, 24, 39)",
                              }}
                            >
                              <p style={{ margin: "0 0 0 0", fontSize: 15, lineHeight: 1.8 }}>
                                Hi <strong>[Guest&apos;s Name]</strong>, 👋
                                <br />
                                Thanks for being part of our event — we&apos;re glad to have you with us.
                              </p>
                              {/* Event Overview */}
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  boxSizing: "border-box",
                                  marginTop: 22,
                                  background: "rgb(249, 250, 251)",
                                  borderRadius: 14,
                                  border: "1px solid rgb(229, 231, 235)",
                                }}
                              >
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td style={{ boxSizing: "border-box", padding: 18 }}>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "rgb(107, 114, 128)",
                                          letterSpacing: 0.5,
                                        }}
                                      >
                                        EVENT OVERVIEW
                                      </div>
                                      <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>{eventName}</div>
                                      <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.8, color: "rgb(55, 65, 81)" }}>
                                        📅 <strong>{formattedDateFrom || "[Start Date]"}</strong> →{" "}
                                        <strong>{formattedDateTo || "[End Date]"}</strong>
                                        <br />
                                        🕒 <strong>{formattedTimeFrom || "[Start Time]"}</strong> –{" "}
                                        <strong>{formattedTimeTo || "[End Time]"}</strong>
                                        <br />
                                        📍 <strong>{location || "[City / Location]"}</strong>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              {/* Info Grid */}
                              <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box", marginTop: 18 }}>
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      width="50%"
                                      style={{ boxSizing: "border-box", paddingRight: 8, verticalAlign: "top" }}
                                    >
                                      <table
                                        width="100%"
                                        cellPadding={0}
                                        cellSpacing={0}
                                        style={{
                                          boxSizing: "border-box",
                                          background: "#ffffff",
                                          borderRadius: 14,
                                          border: "1px solid rgb(229, 231, 235)",
                                        }}
                                      >
                                        <tbody style={{ boxSizing: "border-box" }}>
                                          <tr style={{ boxSizing: "border-box" }}>
                                            <td style={{ boxSizing: "border-box", padding: 16 }}>
                                              <div style={{ fontSize: 13, fontWeight: 700 }}>🎟 Registration Details</div>
                                              <div
                                                style={{
                                                  marginTop: 8,
                                                  fontSize: 13,
                                                  lineHeight: 1.7,
                                                  color: "rgb(55, 65, 81)",
                                                }}
                                              >
                                                <strong>ID:</strong> [REG-000123]
                                                <br />
                                                <strong>Ticket Type:</strong> [General / VIP]
                                                <br />
                                                <strong>Status:</strong> Confirmed ✅
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                    <td
                                      width="50%"
                                      style={{ boxSizing: "border-box", paddingLeft: 8, verticalAlign: "top" }}
                                    >
                                      <table
                                        width="100%"
                                        cellPadding={0}
                                        cellSpacing={0}
                                        style={{
                                          boxSizing: "border-box",
                                          background: "#ffffff",
                                          borderRadius: 14,
                                          border: "1px solid rgb(229, 231, 235)",
                                        }}
                                      >
                                        <tbody style={{ boxSizing: "border-box" }}>
                                          <tr style={{ boxSizing: "border-box" }}>
                                            <td style={{ boxSizing: "border-box", padding: 16 }}>
                                              <div style={{ fontSize: 13, fontWeight: 700 }}>📌 Venue</div>
                                              <div
                                                style={{
                                                  marginTop: 8,
                                                  fontSize: 13,
                                                  lineHeight: 1.7,
                                                  color: "rgb(55, 65, 81)",
                                                }}
                                              >
                                                <strong>{location || "[Venue Name]"}</strong>
                                                <br />
                                                [Venue Address]
                                              </div>
                                              <div style={{ marginTop: 10 }}>
                                                <a
                                                  href="[MAP_LINK]"
                                                  style={{
                                                    color: "rgb(37, 99, 235)",
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
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              {/* Important Notes */}
                              <table
                                width="100%"
                                cellPadding={0}
                                cellSpacing={0}
                                style={{
                                  boxSizing: "border-box",
                                  marginTop: 20,
                                  background: "rgb(255, 247, 237)",
                                  border: "1px solid rgb(254, 215, 170)",
                                  borderRadius: 14,
                                }}
                              >
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td
                                      style={{
                                        boxSizing: "border-box",
                                        padding: 16,
                                        fontSize: 13,
                                        lineHeight: 1.8,
                                        color: "rgb(124, 45, 18)",
                                      }}
                                    >
                                      ℹ️ <strong>Important Notes</strong>
                                      <br />
                                      • Please arrive 15–30 minutes early.
                                      <br />
                                      • Bring a valid ID if required.
                                      <br />
                                      • Badge pickup will be available at the registration desk.
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              {/* CTA */}
                              <table width="100%" cellPadding={0} cellSpacing={0} style={{ boxSizing: "border-box", marginTop: 22 }}>
                                <tbody style={{ boxSizing: "border-box" }}>
                                  <tr style={{ boxSizing: "border-box" }}>
                                    <td align="center" style={{ boxSizing: "border-box" }}>
                                      <a
                                        href="[VIEW_REGISTRATION_LINK]"
                                        style={{
                                          background: "linear-gradient(135deg, rgb(37, 99, 235), rgb(30, 64, 175))",
                                          color: "#ffffff",
                                          textDecoration: "none",
                                          padding: "14px 28px",
                                          borderRadius: 9999,
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
                                          color: "rgb(30, 64, 175)",
                                          textDecoration: "none",
                                          padding: "14px 24px",
                                          borderRadius: 9999,
                                          fontSize: 14,
                                          fontWeight: 700,
                                          display: "inline-block",
                                          border: "1px solid rgb(199, 210, 254)",
                                        }}
                                      >
                                        Add to Calendar
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <p style={{ marginTop: 24, margin: "24px 0 0 0", fontSize: 14, lineHeight: 1.8 }}>
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
                                background: "rgb(15, 23, 42)",
                                padding: 18,
                                color: "rgb(156, 163, 175)",
                                fontSize: 12,
                                lineHeight: 1.6,
                              }}
                            >
                              © 2026 [Your Organization]. All rights reserved.
                              <br />
                              This email was sent automatically — please do not share your registration details.
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

export default ThanksTemplateOne;
