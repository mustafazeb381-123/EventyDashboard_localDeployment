import { getEventbyId, getRegistrationTemplateData } from "@/apis/apiHelpers";
import React, { useEffect } from "react";

function UserRegistration() {
  const getTemplateData = async () => {
    const editEventId = await localStorage.getItem("edit_eventId");
    console.log("edit event id ", editEventId);
    try {
      const response = await getRegistrationTemplateData(editEventId);
      console.log("response of get template api ", response);
    } catch (error) {
      console.log("error geting in get template api", error);
    }
  };

  const getEventDataById = async () => {
    const editEventId = await localStorage.getItem("edit_eventId");
    try {
      const response = await getEventbyId(editEventId);
      console.log(
        "reponse event data by id in user resgitration form ",
        response
      );
    } catch (error) {
      console.log("error in event data by id in registration form ", error);
    }
  };
  useEffect(() => {
    getTemplateData();
    getEventDataById();
  }, []);

  return (
    <div>
      <div>hell thius is user registration page</div>
    </div>
  );
}

export default UserRegistration;
