import RegistrationFormPreview from "./components/RegistrationFormPreview";

// Template One
const TemplateFormOne = ({ eventData, formFields }) => {
  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Banner Section */}
      <div
        className="w-full h-[300px] flex items-center justify-center border rounded-2xl border-gray-200 bg-cover bg-center bg-no-repeat relative mb-6"
        style={{
          backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold">Event Banner</h1>
        </div>
      </div>

      {/* Event Info Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex gap-4 items-start">
          <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎪</span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {eventData?.name || "Event Name"}
            </h2>

            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Clock size={18} />
              <span className="text-sm">
                {eventData?.dateFrom || "Jan 1, 2025"} -{" "}
                {eventData?.dateTo || "Jan 5, 2025"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span className="text-sm">
                {eventData?.location || "Event Location"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-1">About</p>
          <p className="text-sm text-gray-600">
            {eventData?.about || "Join us for an amazing event experience!"}
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Please fill name and contact information of attendees.
        </h3>
        <RegistrationFormPreview
          formFields={formFields}
          submitButtonText="Register"
        />
      </div>
    </div>
  );
};
