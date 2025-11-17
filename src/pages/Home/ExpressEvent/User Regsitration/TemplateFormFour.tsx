import { useMemo } from "react";
import Assets from "@/utils/Assets";
import RegistrationFormPreview from "./components/RegistrationFormPreview";

const TemplateFormFour = ({
  eventData,
  formFields,
}: {
  eventData: any;
  formFields: any[];
}) => {
  console.log("Event Attributes (Template 4):", eventData?.attributes);
  console.log("Event Form Data Attributes (RAW Template 4):", formFields);

  // ✅ Get tenant_uuid from localStorage
  const tenantUuid = localStorage.getItem("tenant_uuid");
  console.log("TENANT TEMP:", tenantUuid);

  // ✅ Fix the type for image fields and move them to the end
  const mappedFormFields = useMemo(() => {
    if (!Array.isArray(formFields) || formFields.length === 0) return [];

    const mapped = formFields.map((field: any) => {
      // ✅ Only rename if it's specifically the "company" field
      const isCompanyField = field.name === "company";
      const fieldName = isCompanyField ? "organization" : field.name;

      const isImageField = fieldName === "image";

      return {
        ...field,
        name: fieldName, // only changed for company → organization
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

    // ✅ Create user_type field from event data
    const userTypeField = {
      id: 999, // Unique ID
      name: "user_type",
      type: "select",
      label: "User Type",
      placeholder: "Select User Type",
      required: true,
      active: true,
      fullWidth: false,
      options: eventData?.attributes?.user_types?.map((type: string) => ({
        value: type,
        label: type,
      })) || [],
    };

    // ✅ Find the index of the name field
    const nameFieldIndex = mapped.findIndex((f: any) => f.name === "name");

    // ✅ Insert user_type right after name field
    const fieldsWithUserType = [...mapped];
    if (nameFieldIndex !== -1 && userTypeField.options.length > 0) {
      fieldsWithUserType.splice(nameFieldIndex + 1, 0, userTypeField);
    }

    // ✅ Move image fields to the end
    const nonImageFields = fieldsWithUserType.filter(f => f.name !== "image");
    const imageFields = fieldsWithUserType.filter(f => f.name === "image");

    return [...nonImageFields, ...imageFields];
  }, [formFields, eventData?.attributes?.user_types]);

  console.log("Mapped Form Fields (Template 4):", mappedFormFields);

  return (
    <div
      style={{
        backgroundImage: `url(${Assets.images.background4})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
      className="min-h-screen w-full p-4"
    >
      {/* Content Container */}
      <div className="w-full mx-auto">
        {/* Event Information Display */}
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
              <img
                src={Assets.icons.clock}
                style={{ height: 20, width: 20 }}
                alt=""
              />
              <p className="text-neutral-600 font-poppins font-normal text-xs">
                {eventData?.attributes?.event_date_from} -{" "}
                {eventData?.attributes?.event_date_to}
              </p>
            </div>

            <div className="flex flex-row items-center gap-3">
              <img
                src={Assets.icons.location}
                style={{ height: 20, width: 20 }}
                alt=""
              />
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

        <div style={{ marginTop: 24 }} />

        {/* Registration Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Please fill name and contact information of attendees.
          </h3>

          <RegistrationFormPreview
            formFields={mappedFormFields}
            eventId={eventData?.attributes?.uuid}
            tenantUuid={tenantUuid || undefined}
            submitButtonText="Register Now"
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateFormFour;
