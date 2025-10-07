import Assets from "@/utils/Assets";
import RegistrationFormPreview from "./components/RegistrationFormPreview";

// Template Two - Matches registration template structure
const TemplateFormTwo = ({
  eventData,
  formFields,
}: {
  eventData: any;
  formFields: any[];
}) => {
  return (
    <div className="w-full p-2">
      {/* Event Cover Image - Full width banner */}
      <div
        style={{
          width: "100%",
          backgroundImage: eventData?.attributes?.registration_page_banner
            ? `url(${eventData.attributes.registration_page_banner})`
            : `url(${Assets.images.uploadBackground2})`,
        }}
        className="w-full h-[400px] flex items-center justify-center border rounded-3xl bg-gradient-to-t from-white/50 to-transparent border-gray-200 sm:p-5 bg-cover bg-center bg-no-repeat relative"
      >
        {!eventData?.attributes?.registration_page_banner && (
          <div className="text-white text-center">
            <h1 className="text-3xl font-bold">Event Banner</h1>
            <p className="mt-2 text-lg opacity-90">Template Two Design</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }} />

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
          formFields={formFields || []}
          submitButtonText="Register"
        />
      </div>
    </div>
  );
};

export default TemplateFormTwo;
