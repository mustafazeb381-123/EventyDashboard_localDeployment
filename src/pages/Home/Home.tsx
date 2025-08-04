import React from "react";

const Home = () => {
  return (
    <div className="w-full bg-[#F7FAFF] min-h-screen p-4">
      <div className="flex flex-row justify-between flex-wrap">

        {/* Express Event Card */}
        <div className="w-full md:w-1/2 rounded-3xl ">
          <div className="bg-emerald-100 flex flex-row items-center gap-4 p-4 rounded-2xl shadow-md">
            <div className="rounded bg-emerald-50 p-6">
              <img
                src="https://via.placeholder.com/40"
                alt="Express Icon"
                className="w-10 h-10"
              />
            </div>
            <span className="text-lg font-semibold text-emerald-800">
              Express Event
            </span>
          </div>
        </div>

        {/* Create Event Card Placeholder */}
        <div className="w-full md:w-1/2 rounded-3xl ">
          <div className="bg-sky-100 flex flex-row items-center gap-4 p-4 rounded-2xl shadow-md">
            <div className="rounded bg-sky-50 p-6">
              <img
                src="https://via.placeholder.com/40"
                alt="Express Icon"
                className="w-10 h-10"
              />
            </div>
            <span className="text-lg font-semibold text-emerald-800">
              Create Event
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
