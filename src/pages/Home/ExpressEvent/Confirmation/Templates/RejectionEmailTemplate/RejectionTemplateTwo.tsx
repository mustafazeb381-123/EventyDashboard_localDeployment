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

function RejectionTemplateTwo({
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
              src={Assets.icons.rejectionEmailTwo}
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
              Thanks so much for registering for {eventName}
              {dateRangeText ? ` ${dateRangeText}` : ""} – we&apos;re honored by
              your interest! <br /> <br />
              Due to overwhelming response and limited space, we&apos;re sorry to let
              you know that we&apos;re unable to accommodate your registration for
              this particular event. <br /> <br /> However, we&apos;d love to stay in
              touch and notify you about future events that may interest you.{" "}
              <br /> <br /> We truly appreciate your interest and hope to
              connect again soon!
            </p>
          </div>

          <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
            Warm Regards <br />
            [Your Name or Organization]
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

export default RejectionTemplateTwo;
