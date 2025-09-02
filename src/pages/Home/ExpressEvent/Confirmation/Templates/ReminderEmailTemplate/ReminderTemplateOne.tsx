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

function ReminderTemplateOne() {
  return (
    <>
      <div className="w-full bg-gray-50 p-10">
        <p>Our Logo</p>
        <div style={{ marginTop: 40 }} />

        <div className="p-[40px] bg-white">
          <div className="flex items-center justify-center">
            <img
              src={Assets.icons.reminderEmailOne}
              style={{
                height: 180,
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
              Hi [First Name],{" "}
            </p>
            <p className="mt-[8px] font-normal text-[16px] text-[#384860]">
              We’re excited to remind you that you’re registered for our
              upcoming event happening from May 10 to May 30, 2025, between 2:13
              PM and 5:11 PM.{" "}
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
              <p className="font-semibold text-[16px] text-black">Event Name</p>
            </div>
          </div>

          <div className="mt-[8px] bg-[#F1F5F9] p-[17px] rounded-2xl items-center flex justify-between ">
            <div className=" items-center flex gap-2">
              <CalendarDays color="#2B7FFF" />
              <p className="font-normal text-[16px] ">Event time :</p>
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
              <Clock color="#2B7FFF" />
              <p className="font-normal text-[16px] ">Due Date :</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-semibold text-[16px] text-black">14:13:00</p>
              <p className="font-semibold text-[16px] text-black">:</p>
              <p className="font-semibold text-[16px] text-black">17:11:00</p>
            </div>
          </div>
          <div className="mt-[8px] bg-[#F1F5F9] p-[17px] rounded-2xl items-center flex justify-between ">
            <div className=" items-center flex gap-2">
              <MapPin color="#2B7FFF" />

              <p className="font-normal text-[16px] ">Event Location :</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-semibold text-[16px] text-black">
                Event Location
              </p>
            </div>
          </div>
          <p className="mt-[24px] font-normal text-[16px] text-[#384860]">
            We're looking forward to having you with us — it's going to be a
            great experience! <br /> If you have any questions or need
            assistance, feel free to get in touch. <br /> <br />
            Thanks again for registering, and we’ll see you soon <br />
            Warm regards, <br />
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

export default ReminderTemplateOne;
