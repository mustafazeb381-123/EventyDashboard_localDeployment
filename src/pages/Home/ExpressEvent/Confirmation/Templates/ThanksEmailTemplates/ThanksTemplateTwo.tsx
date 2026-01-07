import Assets from "@/utils/Assets";
import React from "react";
import {
  Calendar,
  Calendar as CalendarIcon,
  Facebook,
  Instagram,
  Notebook,
  NotebookIcon,
  NotepadText,
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

// Helper function to format time
const formatTime = (time: string | undefined): string => {
  if (!time) return "";
  return time;
};

function ThanksTemplateTwo({ 
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
  const formattedTimeFrom = formatTime(timeFrom);
  const formattedTimeTo = formatTime(timeTo);

  // Format date range for text
  const dateRangeText = formattedDateFrom && formattedDateTo 
    ? `from ${formattedDateFrom} to ${formattedDateTo}`
    : formattedDateFrom 
    ? `on ${formattedDateFrom}`
    : "soon";

  const timeRangeText = formattedTimeFrom && formattedTimeTo
    ? `at ${formattedTimeFrom} - ${formattedTimeTo}`
    : formattedTimeFrom
    ? `at ${formattedTimeFrom}`
    : "";

  return (
    <>
      <div className="w-full bg-gray-50 p-10">
        {logoUrl ? (
          <div className="flex items-center">
            <img src={logoUrl} alt="Event Logo" style={{ maxHeight: 60, maxWidth: 200 }} />
          </div>
        ) : (
          <p>Our Logo</p>
        )}
        <div style={{ marginTop: 40 }} />

        <div className="p-[40px] bg-white">
          <div className="flex items-center justify-center">
            <img
              src={Assets.icons.thanksEmailTwo}
              style={{ height: 80, width: 80 }}
            />
          </div>
          <div style={{ marginTop: 64 }} />
          <div className="flex justify-center items-center  font-bold text-[20px]">
            <p>Thanks for applying to "{eventName}"</p>
          </div>
          <div className="mt-[24px]">
            <p className="font-medium text-[16px] text-[#121A26]">
              Dear [Guest's Name],{" "}
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              We hope you're doing well! 😊
            </p>
            <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
              Thank you for registering for our upcoming event {dateRangeText}{timeRangeText && ` ${timeRangeText}`}. We are thrilled to have you
              join us and look forward to seeing you there. <br />
              <br /> You will receive a confirmation email shortly with all the
              details you need to know. <br /> <br /> If you have any questions
              or concerns, please don't hesitate to reach out to us. We're happy
              to help. <br /> <br /> Thank you again for your registration and
              we can't wait to see you at the event! <br /> <br /> Best regards,{" "}
              <br />
              [Please add Your Name or Organization]
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

          <div className="mt-[8px] bg-[#F1F5F9] p-[17px] rounded-2xl items-center flex justify-between ">
            <div className=" items-center flex gap-2">
              <NotepadText color="blue" />
              <p className="font-normal text-[16px] ">Notes</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-semibold text-[16px] text-black">
                Any additional details or support
              </p>
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

export default ThanksTemplateTwo;
