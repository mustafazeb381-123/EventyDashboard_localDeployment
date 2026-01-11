import Assets from "@/utils/Assets";
import React from "react";
import {
  Calendar,
  CalendarDays,
  Clock,
  Facebook,
  Instagram,
  Locate,
  LocateIcon,
  MapPin,
  MoveRight,
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
  // If time is in HH:MM format, return it as is
  if (time.includes(":")) {
    return time;
  }
  return time;
};

function ConfirmationTemplateOne({ 
  eventName = "event name",
  dateFrom,
  dateTo,
  timeFrom,
  timeTo,
  location = "awd",
  logoUrl
}: EventDataProps) {
  const formattedDateFrom = formatDate(dateFrom);
  const formattedDateTo = formatDate(dateTo);
  const formattedTimeFrom = formatTime(timeFrom);
  const formattedTimeTo = formatTime(timeTo);

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
              src={Assets.icons.confirmationEmailOne}
              style={{ height: 80, width: 80 }}
            />
          </div>
          <div style={{ marginTop: 64 }} />
          <div className="flex justify-center items-center  font-bold text-[20px]">
            <p>Thanks for registering to "{eventName}"</p>
          </div>
          <div className="mt-[24px]">
            <p className="font-medium text-[16px] text-[#121A26]">
              Dear [Guest's Name],{" "}
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              We hope you're doing well! 😊
            </p>
            <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
              Thank you for registering for our upcoming event. We are excited
              to have you join us on {formattedDateFrom || "2025-05-10"}{" "}
              {formattedDateTo && (
                <>
                  <MoveRight className="inline-block mx-1" />
                  {formattedDateTo}
                </>
              )}{" "}
              {formattedTimeFrom && formattedTimeTo && (
                <>at {formattedTimeFrom} - {formattedTimeTo}</>
              )} at {location}.
            </p>
          </div>
          <p className="mt-[24px] text-[16px] text-[#121A26] font-medium">
            {" "}
            Event Details:
          </p>
          <div className="mt-[8px] bg-[#F1F5F9] p-[17px] rounded-2xl items-center flex justify-between ">
            <div className=" items-center flex gap-2">
              <img src={Assets.icons.label} style={{ height: 22, width: 22 }} />
              <p className="font-normal text-[16px] ">Event Name :</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-semibold text-[16px] text-black">{eventName}</p>
            </div>
          </div>

          <div className="mt-[8px] bg-[#F1F5F9] p-[17px] rounded-2xl items-center flex justify-between ">
            <div className=" items-center flex gap-2">
              <CalendarDays color="#2B7FFF" />
              <p className="font-normal text-[16px] ">Event time :</p>
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
              <Clock color="#2B7FFF" />
              <p className="font-normal text-[16px] ">Due Date :</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-semibold text-[16px] text-black">{formattedTimeFrom || "14:13:00"}</p>
              {formattedTimeTo && (
                <>
                  <p className="font-semibold text-[16px] text-black">:</p>
                  <p className="font-semibold text-[16px] text-black">{formattedTimeTo}</p>
                </>
              )}
            </div>
          </div>
          <div className="mt-[8px] bg-[#F1F5F9] p-[17px] rounded-2xl items-center flex justify-between ">
            <div className=" items-center flex gap-2">
              <MapPin color="#2B7FFF" />

              <p className="font-normal text-[16px] ">Event Location :</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-semibold text-[16px] text-black">
                {location}
              </p>
            </div>
          </div>
          <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
            If you have any questions or concerns, please don't hesitate to
            reach out to us. We're happy to help. <br /> <br />
            Best regards, <br />
            [Please add Your Name or Organization]
          </p>
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

export default ConfirmationTemplateOne;
