import Assets from "@/utils/Assets";
import React from "react";
import {
  Calendar,
  Calendar as CalendarIcon,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

function ThanksTemplateOne() {
  return (
    <>
      <div className="w-full bg-gray-50 p-10">
        <p>Our Logo</p>
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
              Dear [Guest’s Name],{" "}
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              Hello!
            </p>
            <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
              Hello! Thank you for signing up for our upcoming event, taking
              place from May 10 to May 30, 2025, between 2:13 PM and 5:11 PM.
              We're excited to have you with us and can’t wait to connect during
              this special occasion. <br /> <br /> You’ll soon receive a
              confirmation email containing all the event details, including
              schedule and access information. <br /> <br /> If you have any
              questions or need further assistance, feel free to contact us
              anytime — we’re here to support you. <br /> <br /> Thanks once
              again for registering. We’re looking forward to welcoming you!{" "}
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
                24,Mar 2025
              </p>
              <p className="font-semibold text-[16px] text-black">:</p>
              <p className="font-semibold text-[16px] text-black">
                30,Mar 2025
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

export default ThanksTemplateOne;
