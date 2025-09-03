import React from "react";
import Assets from "../../../../utils/Assets";
import { Edit } from "lucide-react";

function HomeSummary() {
  return (
    <>
      <div className="w-full p-[24px] bg-[#F7FAFF]">
        {/* edit event details */}
        <div className="p-[24px] bg-[white] rounded-2xl flex items-center justify-between ">
          {/* logo and event name */}
          <div className="gap-3 flex items-center">
            <div className=" relative h-[200px] w-[200px] bg-neutral-50 items-center justify-center flex rounded-2xl">
              <div className="h-[44px] w-[44px] flex items-center justify-center absolute top-2 right-2 rounded-xl bg-white cursor-pointer ">
                <Edit />
              </div>
              <img
                src={Assets.images.sccLogo}
                className="h-[120px] w-[111.8px]"
              />
            </div>
          </div>

          {/* edit button  */}
          <div></div>
        </div>
      </div>
    </>
  );
}

export default HomeSummary;
