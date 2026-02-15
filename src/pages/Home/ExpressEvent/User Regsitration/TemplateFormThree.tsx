import { useMemo } from "react";
import Assets from "@/utils/Assets";
import RegistrationFormPreview from "./components/RegistrationFormPreview";

const TemplateFormThree = ({
  eventData,
  formFields,
  userTypeFromUrl,
}: {
  eventData: any;
  formFields: any[];
  userTypeFromUrl?: string | null;
}) => {
  console.log("Event Attributes:", eventData?.attributes);
  console.log("Event Form Data Attributes (RAW):", formFields);

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

    // ✅ Preserve the order property - fields are already sorted by order in UserRegistration.tsx
    // Sort by order to ensure correct display order
    return mapped.sort((a: any, b: any) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
  }, [formFields]);

  console.log("Mapped Form Fields:", mappedFormFields);

  return (
    <div className="w-full p-2">
      {/* No Banner Section for Template 3 */}

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
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Please fill name and contact information of attendees.
        </h3>

        <RegistrationFormPreview
          formFields={mappedFormFields}
          eventId={eventData?.id}
          tenantUuid={tenantUuid || undefined}
          userTypeFromUrl={userTypeFromUrl}
          submitButtonText="Register Now"
        />
      </div>
    </div>
  );
};

export default TemplateFormThree;
