import Assets from "@/utils/Assets";
import RegistrationFormPreview from "./components/RegistrationFormPreview";

// Template Four - Matches the registration template structure
const TemplateFormFour = ({
  eventData,
  formFields,
}: {
  eventData: any;
  formFields: any[];
}) => {
  console.log("Event Data in TemplateFormFour:", eventData);
  console.log("Form Fields in TemplateFormFour:", formFields);

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
        <div style={{ marginTop: 16 }} />

        {/* Event Information Display - Horizontal Layout */}
        <div className="gap-3 flex flex-row items-center">
          <div style={{ padding: 32 }} className="bg-neutral-100 rounded-2xl">
            <img
              src={eventData?.attributes?.logo_url || "/api/placeholder/72/67"}
              alt="Event Logo"
              style={{ height: 67.12, width: 72 }}
              className="object-cover rounded-lg"
              onError={(e) => {
                // Fallback to default on error
                e.currentTarget.src = "/api/placeholder/72/67";
              }}
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
        <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 border border-white/30">
          <h3 className="text-lg font-semibold text-white mb-6 drop-shadow-lg">
            Please fill name and contact information of attendees.
          </h3>

          {formFields && formFields.length > 0 ? (
            <RegistrationFormPreview
              formFields={formFields || []}
              submitButtonText="Register"
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-white">No form fields available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateFormFour;
