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

function RejectionTemplateTwo() {
  return (
    <>
      <div className="w-full bg-gray-50 p-10">
        <p>Our Logo</p>
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
            <p>Thanks for registering to "event name"</p>
          </div>
          <div className="mt-[24px]">
            <p className="font-medium text-[16px] text-[#121A26]">
              Dear [Guest’s Name],
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              Thanks so much for registering for [Event Name] – we’re honored by
              your interest! <br /> <br />
              Due to overwhelming response and limited space, we’re sorry to let
              you know that we’re unable to accommodate your registration for
              this particular event. <br /> <br /> However, we’d love to stay in
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
