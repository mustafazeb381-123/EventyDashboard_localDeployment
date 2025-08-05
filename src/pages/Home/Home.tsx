import { Button } from "@/components/ui/button";
import Assets from "@/utils/Assets";
import React, { useState } from "react";
import Recents from "./components/Recents/Recents";
import Draft from "./components/Drafts/Draft";
import AllEvents from "./components/AllEvents/AllEvents";
import PricingModal from "@/components/PricingModal/PricingModal";

const Home = () => {

   const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('express');

  const handleExpressEventClick = () => {
    setSelectedPlan('express');
    console.log("express event")
    setIsModalOpen(true);
  };

  const handleCreateEventClick = () => {
    setSelectedPlan('advanced');
    console.log("create event")
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="w-full bg-[#F7FAFF] min-h-screen p-4">
     <div className="flex flex-wrap gap-4">
  {/* Express Event Card */}
        <div
          onClick={()=> {handleExpressEventClick()}}
    style={{
      backgroundImage: `url(${Assets.images.expressTabBack})`,
      backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            backgroundSize: 'contain',
            transition: 'all 0.3s ease, background-position 0.3s ease'
    }}
          //  onMouseEnter={(e) => {
          //   e.target.style.backgroundPosition = 'right 10px center';
          // }}
          // onMouseLeave={(e) => {
          //   e.target.style.backgroundPosition = 'right center';
          // }}
    className="cursor-pointer border border-transparent hover:border-emerald-700 transition-all duration-300 ease-in-out w-full md:w-[49%] rounded-3xl bg-emerald-100 flex justify-between items-center p-4 shadow-md"
  >
    <div className="flex items-center gap-4">
      <div className="bg-emerald-50 p-6 rounded">
        <img src={Assets.icons.star} className="w-10 h-10" />
            </div>
            <div>

      <p className="text-lg font-semibold text-emerald-800">
        Express Event
              </p>
              <p className="font-poppins font-normal text-xs text-emerald-950">
                Quick and super empowering to use!
              </p>
            </div>
    </div>
    <div className="pr-4 md:pr-10">
      <img src={Assets.icons.plus} alt="plus" className="w-6 h-6" />
    </div>
  </div>

  {/* Create Event Card */}
  <div
    onClick={() => {handleCreateEventClick()}}
    style={{
      backgroundImage: `url(${Assets.images.settingBack})`,
      backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right center',
            backgroundSize: 'contain',
            transition: 'all 0.3s ease, background-position 0.3s ease'
    }}
          //  onMouseEnter={(e) => {
          //   e.target.style.backgroundPosition = 'right 10px center';
          // }}
          // onMouseLeave={(e) => {
          //   e.target.style.backgroundPosition = 'right center';
          // }}
    className="cursor-pointer border border-transparent hover:border-sky-700 transition-all duration-300 ease-in-out w-full md:w-[49%] rounded-3xl bg-sky-100 flex justify-between items-center p-4 shadow-md"
  >
    <div className="flex items-center gap-4">
      <div className="bg-sky-50 p-6 rounded">
        <img src={Assets.icons.setting} alt="Setting Icon" className="w-10 h-10" />
            </div>
            <div>

      <p className="text-lg font-semibold text-sky-800">
        Create Event
              </p>
                <p className="font-poppins font-normal text-xs text-sky-950">
Advanced and more details.
              </p>
            </div>
            
    </div>
    <div className="pr-4 md:pr-10">
      <img src={Assets.icons.plusBlue} alt="plus" className="w-6 h-6" />
    </div>
  </div>
</div>

      {/* Recents and Drafts and all events */}
     <div style={{ marginTop: 24 }} className="flex flex-col md:flex-row justify-between w-full items-center gap-4">
  {/* Recents */}
  <div className="w-full md:w-[49%]">
    <Recents />
  </div>

  {/* Drafts */}
  <div className="w-full md:w-[49%]">
    <Draft />
  </div>
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
