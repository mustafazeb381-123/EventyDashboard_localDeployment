import { Button } from "@/components/ui/button";
import Assets from "@/utils/Assets";
import React from "react";
import Recents from "./components/Recents/Recents";

const Home = () => {
  return (
    <div className="w-full bg-[#F7FAFF] min-h-screen p-4">
      <div className="flex flex-row justify-between flex-wrap">
        {/* Express Event Card */}
        <div  style={{
    backgroundImage: `url(${Assets.images.expressTabBack})`, // your image path
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right center',
    backgroundSize: 'contain',
  }} className="w-full md:w-[49%] rounded-3xl bg-emerald-100 flex flex-row justify-between items-center gap-4 p-4  shadow-md ">
          <div className="bg-emerald-100 flex flex-row items-center gap-4 rounded-2xl">
            <div className="rounded bg-emerald-50 p-6">
              <img
                src={Assets.icons.star}
                // alt="Express Icon"
                className="w-10 h-10"
              />
            </div>
            <span className="text-lg font-semibold text-emerald-800">
              Express Event
            </span>
          </div>
          <div className="pr-10">
            <img src={Assets.icons.plus} alt="plus" className="w-6 h-6" />
          </div>
        </div>

        {/* Create Event Card Placeholder */}
        <span
          onClick={() => { }}
          style={{
    backgroundImage: `url(${Assets.images.settingBack})`, // your image path
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right center',
    backgroundSize: 'contain',
  }}
          className="bg-sky-100 flex flex-row items-center justify-between gap-4 p-4   shadow-md w-full md:w-[48%] rounded-3xl "
        >
          <div className="bg-sky-100  rounded-2xl flex flex-row items-center gap-4  ">
            <div className="rounded bg-sky-50 p-6">
              <img
                src={Assets.icons.setting}
                alt="Express Icon"
                className="w-10 h-10"
              />
            </div>
            <span className="text-lg font-semibold text-sky-800">
              Create Event
            </span>
          </div>
          <div className="pr-10">
            <img src={Assets.icons.plusBlue} alt="plus" className="w-6 h-6" />
          </div>
        </span>
      </div>
      {/* Recents and Drafts and all events */}
      <div style={{ marginTop: 24 }} className="flex flex-row justify-between w-full items-center ">
        {/* recents */}
        <div className="w-[49%]">
          <Recents />

        </div>

        {/* drafts */}

        <div>

        </div>
      </div>

      {/* all events */}

      <div>

      </div>


    </div>
  );
};

export default Home;
