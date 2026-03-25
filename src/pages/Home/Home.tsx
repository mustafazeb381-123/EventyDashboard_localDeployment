import Assets from "@/utils/Assets";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Recents from "./components/Recents/Recents";
import AllEvents from "./components/AllEvents/AllEvents";
import PricingModal from "@/components/PricingModal/PricingModal";

const Home = () => {
  const { t } = useTranslation("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  console.log("selected plan", selectedPlan);

  const handleExpressEventClick = () => {
    setSelectedPlan("express");
    console.log("express event");
    setIsModalOpen(true);
  };

  const handleCreateEventClick = () => {
    setSelectedPlan("advanced");
    console.log("create event");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlan("");
  };
  return (
    <div className="w-full bg-[#F7FAFF] min-h-screen p-4 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex flex-wrap gap-4">
        {/* Express Event Card */}


        {/* Create Event Card */}
        <div
          onClick={handleCreateEventClick}
          style={{
            backgroundImage: `url(${Assets.images.settingBack})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "contain",
          }}
          className="
            cursor-pointer w-full md:w-[100%] rounded-3xl bg-sky-100 flex justify-between items-center p-4
            border border-sky-200/80
            shadow-md hover:shadow-xl hover:shadow-sky-200/40
            transition-all duration-300 ease-out
            hover:scale-[1.02] hover:-translate-y-0.5 hover:border-sky-400
            active:scale-[0.99] active:translate-y-0
            group
            dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500 dark:hover:shadow-slate-950/40
          "
        >
          <div className="flex items-center gap-4">
            <div className="bg-sky-50 p-6 rounded-2xl shadow-sm transition-all duration-300 group-hover:bg-white group-hover:shadow-md group-hover:scale-105 dark:bg-slate-800 dark:group-hover:bg-slate-700">
              <img
                src={Assets.icons.setting}
                alt="Setting Icon"
                className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12"
              />
            </div>
            <div>
              <p className="text-lg font-semibold text-sky-800 group-hover:text-sky-900 transition-colors duration-300 dark:text-slate-100 dark:group-hover:text-white">
                {t("home.createEvent")}
              </p>
              <p className="font-poppins font-normal text-xs text-sky-950/90 dark:text-slate-300">
                {t("home.startSettingUp")}
              </p>
            </div>
          </div>
          <div className="pr-4 md:pr-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110">
            <img src={Assets.icons.plusBlue} alt="plus" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recents and all events */}
      <div style={{ marginTop: 24 }} className="w-full">
        <Recents />
      </div>

      {/* all events */}

      <div className="w-full flex flex-row flex-wrap mt-5">
        <AllEvents />
      </div>
      <PricingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default Home;
