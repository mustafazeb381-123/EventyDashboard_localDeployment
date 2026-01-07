import Assets from "@/utils/Assets";
import React from "react";
import {
  Calendar,
  Calendar as CalendarIcon,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

interface EventDataProps {
  eventName?: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  timeFrom?: string;
  timeTo?: string;
  location?: string;
  logoUrl?: string | null;
}

// Helper function to format date
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

// Helper function to format time for display (convert 24h to 12h if needed)
const formatTimeDisplay = (time: string | undefined): string => {
  if (!time) return "";
  // If time is in HH:MM format, try to convert to 12h format
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
  logoUrl
}: EventDataProps) {
  const formattedDateFrom = formatDate(dateFrom);
  const formattedDateTo = formatDate(dateTo);
  const formattedTimeFrom = formatTimeDisplay(timeFrom);
  const formattedTimeTo = formatTimeDisplay(timeTo);

  // Format date range for text
  const dateRangeText = formattedDateFrom && formattedDateTo 
    ? `from ${formattedDateFrom} to ${formattedDateTo}`
    : formattedDateFrom 
    ? `on ${formattedDateFrom}`
    : "soon";

  const timeRangeText = formattedTimeFrom && formattedTimeTo
    ? `between ${formattedTimeFrom} and ${formattedTimeTo}`
    : formattedTimeFrom
    ? `at ${formattedTimeFrom}`
    : "";

  return (
    <>
      <div className="w-full bg-gray-50 p-10">
        {logoUrl ? (
          <div className="flex items-center justify-center">
            <img src={logoUrl} alt="Event Logo" style={{ maxHeight: 60, maxWidth: 200 }} />
          </div>
        ) : (
          <p>Our Logo</p>
        )}
        <div style={{ marginTop: 40 }} />

        <div className="p-[40px] bg-white">
          <div className="flex items-center justify-center">
            <img
              src={Assets.icons.thanksEmailOne}
              style={{ height: 80, width: 80 }}
            />
          </div>
          <div style={{ marginTop: 64 }} />
          <div className="flex justify-center items-center  font-bold text-[20px]">
            <p>You're Registered 🎉</p>
          </div>
          <div className="mt-[24px]">
            <p className="font-medium text-[16px] text-[#121A26]">
              Dear [Guest's Name],{" "}
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              Hello!
            </p>
            <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
              Hello! Thank you for signing up for our upcoming event, taking
              place {dateRangeText}{timeRangeText && `, ${timeRangeText}`}.
              We're excited to have you with us and can't wait to connect during
              this special occasion. <br /> <br /> You'll soon receive a
              confirmation email containing all the event details, including
              schedule and access information. <br /> <br /> If you have any
              questions or need further assistance, feel free to contact us
              anytime — we're here to support you. <br /> <br /> Thanks once
              again for registering. We're looking forward to welcoming you!{" "}
              <br /> <br />
              Warm regards, <br /> [Your Name or Organization]
            </p>
          </div>
          <p className="mt-[24px] text-[16px] text-[#121A26] font-medium">
            {" "}
            Details:
          </p>
          <div className="mt-[8px] bg-[#F1F5F9] p-[17px] rounded-2xl items-center flex justify-between ">
            <div className=" items-center flex gap-2">
              <Calendar color="blue" />
              <p className="font-normal text-[16px] ">Due Date :</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-semibold text-[16px] text-black">
                {formattedDateFrom || "24,Mar 2025"}
              </p>
              {formattedDateTo && (
                <>
                  <p className="font-semibold text-[16px] text-black">:</p>
                  <p className="font-semibold text-[16px] text-black">
                    {formattedDateTo}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="mt-[40px] flex items-center justify-between">
          <p>
            This email was sent by scc@mail.com <br />© 2025 scc
          </p>
          <div className="flex items-center gap-3">
            <Twitter />
            <Facebook />
            <Instagram />
          </div>
        </div>
      </div>
    </>
  );
}

export default ThanksTemplateOne;
