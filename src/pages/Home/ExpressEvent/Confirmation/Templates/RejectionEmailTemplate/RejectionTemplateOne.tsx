import Assets from "@/utils/Assets";
import React from "react";
import {
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

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

function RejectionTemplateOne({
  eventName = "event name",
  dateFrom,
  dateTo,
  logoUrl,
}: EventDataProps) {
  const formattedDateFrom = formatDate(dateFrom);
  const formattedDateTo = formatDate(dateTo);
  const dateRangeText =
    formattedDateFrom && formattedDateTo
      ? `from ${formattedDateFrom} to ${formattedDateTo}`
      : formattedDateFrom
        ? `on ${formattedDateFrom}`
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
              src={Assets.icons.rejectionEmailOne}
              style={{
                height: 190,
                width: 168,
              }}
            />
          </div>
          <div />
          <div className="flex justify-center items-center  font-bold text-[20px]">
            <p>Thanks for registering to &quot;{eventName}&quot;</p>
          </div>
          <div className="mt-[24px]">
            <p className="font-medium text-[16px] text-[#121A26]">
              Dear [Guest&apos;s Name],
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              Thank you for your interest in attending {eventName}
              {dateRangeText ? `, scheduled ${dateRangeText}.` : "."}{" "}
              <br /> <br /> We appreciate your
              enthusiasm, but unfortunately, we are unable to confirm your
              registration at this time due to limited capacity and high demand.{" "}
              <br /> <br />
              We truly value your interest and encourage you to stay connected
              with us for future events and opportunities.
            </p>
          </div>

          <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
            Thank you again for your understanding <br />
            [Your Name] <br /> [title]
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

export default RejectionTemplateOne;
