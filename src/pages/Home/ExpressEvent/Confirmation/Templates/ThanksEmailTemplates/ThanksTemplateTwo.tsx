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

function ThanksTemplateTwo() {
  return (
    <>
      <div className="w-full bg-gray-50 p-10">
        <p>Our Logo</p>
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
            <p>Thanks for applying to “event name”</p>
          </div>
          <div className="mt-[24px]">
            <p className="font-medium text-[16px] text-[#121A26]">
              Dear [Guest’s Name],{" "}
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              We hope you're doing well! 😊
            </p>
            <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
              Thank you for registering for our upcoming event from 2025-05-10
              to 2025-05-30 at 14:13:00 - 17:11:00. We are thrilled to have you
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
                24,Mar 2025
              </p>
              <p className="font-semibold text-[16px] text-black">:</p>
              <p className="font-semibold text-[16px] text-black">
                30,Mar 2025
              </p>
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
