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

function RejectionTemplateTwo({
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
        background: "#f5f7fb",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#1f2937",
      }}
    >
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ padding: "40px 16px" }}>
        <tbody>
          <tr>
            <td align="center">
              <table
                width={620}
                cellPadding={0}
                cellSpacing={0}
                style={{
                  background: "#ffffff",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                <tbody>
                  {/* Header */}
                  <tr>
                    <td
                      style={{
                        padding: "24px 28px",
                        background: "#fef2f2",
                        borderBottom: "1px solid #fee2e2",
                      }}
                    >
                      <h1
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#b91c1c",
                        }}
                      >
                        Registration Update
                      </h1>
                    </td>
                  </tr>
                  {/* Message */}
                  <tr>
                    <td style={{ padding: 28 }}>
                      <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.8 }}>
                        Dear <strong>[Guest&apos;s Name]</strong>,
                      </p>
                      <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.8 }}>
                        Thank you for your interest in attending <strong>{eventName}</strong>. We truly appreciate the
                        time you took to register.
                      </p>
                      <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.8 }}>
                        After careful review, we regret to inform you that your registration could not be approved for
                        this event.
                      </p>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#4b5563" }}>
                        Please note that due to capacity limitations or specific selection criteria, we were unable to
                        accommodate all requests.
                      </p>
                    </td>
                  </tr>
                  {/* Event Info */}
                  <tr>
                    <td style={{ padding: "0 28px 20px 28px" }}>
                      <table
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                        }}
                      >
                        <tbody>
                          <tr>
                            <td style={{ padding: 14, fontSize: 13, lineHeight: 1.7 }}>
                              <strong>Event:</strong> {eventName}
                              <br />
                              <strong>Date:</strong> {formattedDateFrom || "[Start Date]"} –{" "}
                              {formattedDateTo || "[End Date]"}
                              <br />
                              <strong>Time:</strong> {formattedTimeFrom || "[Start Time]"} –{" "}
                              {formattedTimeTo || "[End Time]"}
                              <br />
                              <strong>Location:</strong> {location || "[City / Venue]"}
                              <br />
                              <strong>Status:</strong>{" "}
                              <span style={{ color: "#b91c1c", fontWeight: 700 }}>Rejected</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  {/* Footer */}
                  <tr>
                    <td
                      style={{
                        padding: "20px 28px",
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: "#6b7280",
                        background: "#fafafa",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      If you have any questions, please contact us at{" "}
                      <a
                        href="mailto:[support@email.com]"
                        style={{ color: "#2563eb", textDecoration: "none" }}
                      >
                        [support@email.com]
                      </a>
                      <br />
                      <br />
                      © 2026 [Your Organization]. All rights reserved.
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

export default RejectionTemplateTwo;
