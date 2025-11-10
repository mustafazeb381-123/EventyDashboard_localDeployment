import { useMemo } from "react";
import Assets from "@/utils/Assets";
import RegistrationFormPreview from "./components/RegistrationFormPreview";

const TemplateFormSix = ({
  eventData,
  formFields,
}: {
  eventData: any;
  formFields: any[];
}) => {
  // ✅ Get tenant_uuid from localStorage
  const tenantUuid = localStorage.getItem("tenant_uuid");
  console.log("TENANT TEMP SIX:", tenantUuid);

  // ✅ Fix image fields and move them to the end
  const mappedFormFields = useMemo(() => {
    if (!Array.isArray(formFields) || formFields.length === 0) return [];

    const mapped = formFields.map((field: any) => {
      const isCompanyField = field.name === "company";
      const fieldName = isCompanyField ? "organization" : field.name;
      const isImageField = fieldName === "image";

      return {
        ...field,
        name: fieldName,
        type: isImageField ? "file" : field.type,
        placeholder: isImageField ? "" : field.placeholder,
        ...(isImageField && {
          accept: "image/jpeg,image/png,image/jpg",
          maxSize: 2 * 1024 * 1024, // 2MB
          allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
          hint: "Upload JPG, PNG (Max 2MB)",
        }),
      };
    });

    const nonImageFields = mapped.filter((f) => f.name !== "image");
    const imageFields = mapped.filter((f) => f.name === "image");

    return [...nonImageFields, ...imageFields];
  }, [formFields]);

  return (
    <div className="w-full flex flex-row p-4">
      {/* Left Banner / Info */}
      <div className="w-[40%] mr-3 flex flex-col items-center">
        <div
          style={{
            width: "100%",
            backgroundImage: eventData?.attributes?.registration_page_banner
              ? `url(${eventData.attributes.registration_page_banner})`
              : `url(${Assets.images.uploadBackground3})`,
          }}
          className="w-full h-[300px] flex items-center justify-center border rounded-2xl border-gray-200 p-4 sm:p-5 bg-cover bg-center bg-no-repeat relative"
        >
          {!eventData?.attributes?.registration_page_banner && <div className="text-white text-center" />}
        </div>

        <div style={{ marginTop: 16 }} />

        <div className="w-full">
          {/* Event Info */}
          <div className="gap-3 flex flex-row items-center">
            <div style={{ padding: 32 }} className="bg-neutral-100 rounded-2xl">
              <img
                src={eventData?.attributes?.logo_url || Assets.images.sccLogo}
                style={{ height: 67.12, width: 72 }}
                alt="Event Logo"
              />
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-slate-800 text-md font-poppins font-medium">
                {eventData?.attributes?.name || "Event Name"}
              </p>

              <div className="flex flex-row items-center gap-3">
                <img src={Assets.icons.clock} style={{ height: 20, width: 20 }} alt="" />
                <p className="text-neutral-600 font-poppins font-normal text-xs">
                  {eventData?.attributes?.event_date_from} - {eventData?.attributes?.event_date_to}
                </p>
              </div>

              <div className="flex flex-row items-center gap-3">
                <img src={Assets.icons.location} style={{ height: 20, width: 20 }} alt="" />
                <p className="text-neutral-600 font-poppins font-normal text-xs">
                  {eventData?.attributes?.location || "Location"}
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }} />

          <p className="text-slate-800 text-xs font-poppins font-medium">
            About{" "}
            <span className="text-neutral-600 text-xs font-normal">
              {eventData?.attributes?.about || "Event description"}
            </span>
          </p>
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="w-[60%] bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Please fill name and contact information of attendees.
        </h3>

        <RegistrationFormPreview
          formFields={mappedFormFields}
          eventId={eventData?.attributes?.uuid}
          tenantUuid={tenantUuid || undefined}
          submitButtonText="Register"
        />
      </div>
    </div>
  );
};

export default TemplateFormSix;
