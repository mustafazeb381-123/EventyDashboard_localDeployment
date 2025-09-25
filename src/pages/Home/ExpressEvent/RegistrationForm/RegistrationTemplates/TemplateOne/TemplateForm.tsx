// Updated TemplateForm.jsx
import React, { useRef, useState } from "react";
import { Upload, Info, XCircle } from "lucide-react";
import Assets from "@/utils/Assets";
import ReusableRegistrationForm from "../../components/ReusableRegistrationForm";
// import ReusableRegistrationForm from "";

function TemplateFormOne({ data }) {
  console.log("props in the template form one", data);
  const [formData, setFormData] = useState({
    eventLogo: null,
  });
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoError("");
      if (file.size > 2 * 1024 * 1024) {
        setLogoError("File size exceeds the 2MB limit.");
        return;
      }
      const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setLogoError("Invalid file type. Please upload SVG, PNG, or JPG.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        eventLogo: file,
      }));
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      eventLogo: null,
    }));
    setLogoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Define form fields configuration
  const formFields = [
    {
      name: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      required: true,
      validation: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || "Please enter a valid email address";
      },
    },
    {
      name: "phoneNumber",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      required: true,
    },
    {
      name: "idNumber",
      type: "text",
      label: "ID Number",
      placeholder: "Enter your ID number",
      required: true,
    },
    {
      name: "position",
      type: "text",
      label: "Position (Title)",
      placeholder: "Enter your position/title",
      required: true,
    },
    {
      name: "company",
      type: "text",
      label: "Company",
      placeholder: "Enter your company name",
      required: false,
    },
    {
      name: "profilePic",
      type: "file",
      label: "Upload Profile Picture",
      accept: ".png,.jpg,.jpeg",
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ["image/png", "image/jpeg"],
      hint: "PNG or JPG (max. 2MB)",
      required: false,
    },
  ];

  const handleFormSubmit = (formData) => {
    console.log("Form submitted:", formData);
    // Handle form submission here
    alert("Registration submitted successfully!");
  };

  return (
    <div className="w-full p-4">
      {/* Event Cover Image Upload */}
      <div
        style={{
          width: "100%",
          backgroundImage: `url(${
            formData.eventLogo
              ? URL.createObjectURL(formData.eventLogo)
              : Assets.images.uploadBackground
          })`,
        }}
        className="w-full h-[300px] flex items-center justify-center border rounded-2xl border-gray-200 p-4 sm:p-5 bg-cover bg-center bg-no-repeat relative cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {!formData.eventLogo ? (
          <button className="btn flex flex-row items-center gap-2 bg-indigo-950 py-3 px-5 rounded-xl cursor-pointer ">
            <img src={Assets.icons.upload} style={{ height: 20, width: 20 }} />
            <span className="text-white">upload</span>
          </button>
        ) : null}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".svg,.png,.jpg,.jpeg"
        />

        {!formData.eventLogo ? (
          <></>
        ) : (
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-3 right-3 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700 transition-colors"
          >
            <XCircle size={20} />
          </button>
        )}
      </div>

      {logoError && (
        <p className="mt-2 flex items-center text-xs text-red-600">
          <Info size={14} className="mr-1 flex-shrink-0" />
          {logoError}
        </p>
      )}

      <div style={{ marginTop: 16 }} />

      {/* Event Information Display */}
      <div className="gap-3 flex flex-row items-center">
        <div style={{ padding: 32 }} className=" bg-neutral-50 rounded-2xl">
          <img
            src={Assets.images.sccLogo}
            style={{ height: 67.12, width: 72 }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-slate-800 text-md font-poppins font-medium">
            SCC Summit
          </p>

          <div className="flex flex-row items-center gap-3 ">
            <img
              src={Assets.icons.clock}
              style={{ height: 20, width: 20 }}
              alt=""
            />
            <p className="text-neutral-600 font-poppins font-normal text-xs">
              {" "}
              june 07, 2025 - june 09 2025
            </p>
          </div>

          <div className="flex flex-row items-center gap-3 ">
            <img
              src={Assets.icons.location}
              style={{ height: 20, width: 20 }}
              alt=""
            />
            <p className=" text-neutral-600 font-poppins font-normal text-xs">
              Riyadh
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }} />

      <p className="text-slate-800 text-xs font-poppins font-medium">
        About{" "}
        <span className="text-neutral-600 text-xs font-normal">
          (Description)
        </span>
      </p>
      <p className="text-slate-800 text-xs font-poppins font-medium">
        Lorem ipsum dolor sit amet consectetur. Penatibus sit nisl mattis non
        odio vestibulum euismod eget id. Ac quam vulputate sed eget montes
        tincidunt. Imperdiet sagittis eu imperdiet facilisi leo aliquet amet
        neque in. Ultrices lacus condimentum vel augue elit sodales iaculis.
      </p>

      <div style={{ marginTop: 24 }} />

      {/* Registration Form */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Please fill name and contact information of attendees.
        </h3>

        <ReusableRegistrationForm
          formFields={formFields}
          onSubmit={handleFormSubmit}
          submitButtonText="Register"
        />
      </div>
    </div>
  );
}

export default TemplateFormOne;
