import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import Assets from "@/utils/Assets";
import ReusableRegistrationForm from "../../components/ReusableRegistrationForm";
import {
  getEventbyId,
  updateRegistrationFieldToggleApi,
  getRegistrationFieldApi,
  reorderRegistrationFieldApi,
  createRegistrationFieldApi,
  deleteRegistrationFieldApi,
} from "@/apis/apiHelpers";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";

function TemplateFormFour({
  data,
  eventId: propEventId,
  isUserRegistration = false,
  eventData: propEventData,
}: {
  data?: any;
  eventId?: string;
  isUserRegistration?: boolean;
  eventData?: any;
} = {}) {
  // Log field attributes
  useMemo(() => {
    if (Array.isArray(data)) {
      console.log(`Template Four received ${data.length} fields:`, data);
    }
  }, [data]);

  // States
  const [toggleLoading, setToggleLoading] = useState({});
  const [reorderLoading, setReorderLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [deleteLoading, setDeleteLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [eventData, setEventData] = useState<any>(null);
  const [apiFormData, setApiFormData] = useState<any[]>([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [newFieldData, setNewFieldData] = useState({
    name: "",
    field: "",
    validation_type: "none",
    required: false,
    full_width: true,
  });

  // Get event ID
  const { id: routeId } = useParams();
  const effectiveEventId =
    (propEventId as string | undefined) ||
    (routeId as string | undefined) ||
    localStorage.getItem("create_eventId") ||
    undefined;

  // Default form fields
  const defaultFormFields = [
    {
      id: 1,
      name: "fullName",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      active: true,
    },
    {
      id: 2,
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "Enter your email",
      required: true,
      active: true,
    },
    {
      id: 3,
      name: "phoneNumber",
      type: "tel",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      required: true,
      active: true,
    },
    {
      id: 4,
      name: "company",
      type: "text",
      label: "Company",
      placeholder: "Enter your company name",
      required: false,
      active: true,
    },
  ];

  // Fetch form fields
  useEffect(() => {
    const fetchApiFormData = async () => {
      if (!effectiveEventId) return;
      if (data && Array.isArray(data) && data.length > 0) return;

      setIsLoadingApiData(true);
      try {
        const response = await getRegistrationFieldApi(effectiveEventId);
        console.log(
          "TemplateFour - getRegistrationFieldApi response:",
          response.data
        );
        setApiFormData(response.data.data || []);
      } catch (error) {
        console.error(
          "TemplateFour - Failed to get registration field:",
          error
        );
        setApiFormData([]);
      } finally {
        setIsLoadingApiData(false);
      }
    };
    fetchApiFormData();
  }, [effectiveEventId, data]);

  const formFields = useMemo((): any[] => {
    let sourceData = data;
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      sourceData = apiFormData;
    }
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      return defaultFormFields;
    }

    return sourceData.map((field: any) => {
      const attr = field.attributes || {};
      return {
        id: field.id,
        name: attr.field || attr.name || "field_" + field.id,
        type:
          attr.field === "image"
            ? "file"
            : attr.validation_type === "email"
            ? "email"
            : attr.validation_type === "alphabetic"
            ? "text"
            : "text",
        label: attr.name || "Field",
        placeholder:
          attr.field === "image" ? "" : `Enter ${attr.name || "value"}`,
        required: !!attr.required,
        fullWidth: !!attr.full_width,
        active: attr.active,
        custom: attr.custom ?? field.custom ?? false, // Preserve custom property
        ...(attr.field === "image" && {
          accept: "image/jpeg,image/png,image/jpg",
          maxSize: 2 * 1024 * 1024,
          allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
          hint: "Upload JPG, PNG (Max 2MB)",
        }),
      };
    });
  }, [data, apiFormData]);

  const [fieldActiveStates, setFieldActiveStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Sync field active states
  useEffect(() => {
    const newActiveStates = formFields.reduce((acc: any, field: any) => {
      acc[field.id] = field.active !== false;
      return acc;
    }, {});
    setFieldActiveStates(newActiveStates);
  }, [formFields]);

  const handleToggleField = async (fieldId: any, setLoading: any) => {
    if (!effectiveEventId) return;
    setLoading((prev: any) => ({ ...prev, [fieldId]: true }));
    const newActive = !fieldActiveStates[fieldId];
    try {
      await updateRegistrationFieldToggleApi(
        { active: newActive },
        effectiveEventId,
        fieldId
      );
      setFieldActiveStates((prev: any) => ({
        ...prev,
        [fieldId]: newActive,
      }));
      toast.success(`Field ${newActive ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Failed to toggle field:", error);
      toast.error("Failed to toggle field");
    }
    setLoading((prev: any) => ({ ...prev, [fieldId]: false }));
  };

  const handleReorderField = async (fieldId: any, targetFieldId: any) => {
    if (!effectiveEventId) return;

    const fieldIdNum =
      typeof fieldId === "string" ? parseInt(fieldId, 10) : fieldId;
    const targetFieldIdNum =
      typeof targetFieldId === "string"
        ? parseInt(targetFieldId, 10)
        : targetFieldId;

    if (isNaN(fieldIdNum) || isNaN(targetFieldIdNum)) {
      toast.error("Invalid field IDs");
      return;
    }

    setReorderLoading((prev: any) => ({ ...prev, [fieldId]: true }));
    try {
      await reorderRegistrationFieldApi(
        effectiveEventId,
        fieldIdNum,
        targetFieldIdNum
      );

      const response = await getRegistrationFieldApi(effectiveEventId);
      let refreshedFields = response.data.data || [];

      const sortedFields = [...refreshedFields].sort((a: any, b: any) => {
        const orderA = a.attributes?.order ?? a.order ?? 999;
        const orderB = b.attributes?.order ?? b.order ?? 999;
        return orderA - orderB;
      });

      setApiFormData([...sortedFields]);
      toast.success("Field order updated successfully");
    } catch (error: any) {
      console.error("Failed to reorder field:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to reorder field";
      toast.error(errorMessage);
    } finally {
      setReorderLoading((prev: any) => ({ ...prev, [fieldId]: false }));
    }
  };

  // Calculate next order number
  const getNextOrder = () => {
    if (apiFormData.length === 0) return 1;
    const orders = apiFormData.map((f: any) => {
      const order = f.attributes?.order ?? f.order ?? 0;
      return typeof order === "number" ? order : 0;
    });
    if (orders.length === 0) return 1;
    const maxOrder = Math.max(...orders);
    return maxOrder + 1;
  };

  // Handle create custom field
  const handleCreateField = async () => {
    if (!effectiveEventId) {
      toast.error("Event ID not found");
      return;
    }

    if (!newFieldData.name.trim()) {
      toast.error("Field name is required");
      return;
    }

    const fieldName =
      newFieldData.field ||
      newFieldData.name.toLowerCase().replace(/\s+/g, "_");

    setIsCreatingField(true);
    try {
      const fieldPayload = {
        field: fieldName,
        name: newFieldData.name,
        order: getNextOrder(),
        active: true,
        custom: true,
        required: newFieldData.required,
        full_width: newFieldData.full_width,
        validation_type: newFieldData.validation_type,
        field_options: null,
      };

      await createRegistrationFieldApi(effectiveEventId, fieldPayload);

      const response = await getRegistrationFieldApi(effectiveEventId);
      let refreshedFields = response.data.data || [];

      const sortedFields = [...refreshedFields].sort((a: any, b: any) => {
        const orderA = a.attributes?.order ?? a.order ?? 999;
        const orderB = b.attributes?.order ?? b.order ?? 999;
        return orderA - orderB;
      });

      setApiFormData([...sortedFields]);
      toast.success("Custom field created successfully");

      setNewFieldData({
        name: "",
        field: "",
        validation_type: "none",
        required: false,
        full_width: true,
      });
      setShowAddFieldModal(false);
    } catch (error: any) {
      console.error("Failed to create field:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create field";
      toast.error(errorMessage);
    } finally {
      setIsCreatingField(false);
    }
  };

  // Handle delete field
  const handleDeleteField = async (fieldId: any) => {
    if (!effectiveEventId) {
      toast.error("Event ID not found");
      return;
    }

    const fieldIdNum =
      typeof fieldId === "string" ? parseInt(fieldId, 10) : fieldId;

    if (isNaN(fieldIdNum)) {
      toast.error("Invalid field ID");
      return;
    }

    setDeleteLoading((prev: any) => ({ ...prev, [fieldId]: true }));
    try {
      await deleteRegistrationFieldApi(effectiveEventId, fieldIdNum);

      const response = await getRegistrationFieldApi(effectiveEventId);
      let refreshedFields = response.data.data || [];

      const sortedFields = [...refreshedFields].sort((a: any, b: any) => {
        const orderA = a.attributes?.order ?? a.order ?? 999;
        const orderB = b.attributes?.order ?? b.order ?? 999;
        return orderA - orderB;
      });

      setApiFormData([...sortedFields]);
      toast.success("Field deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete field:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete field";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading((prev: any) => ({ ...prev, [fieldId]: false }));
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      if (!effectiveEventId) return;

      // Use event data from prop if available - skip API call
      if (propEventData) {
        setEventData(propEventData);
        return;
      }

      const cacheKey = `event_meta_${effectiveEventId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setEventData(parsed);
          return;
        } catch (err) {
          console.warn("TemplateFour - failed to parse cached event", err);
        }
      }

      try {
        const response = await getEventbyId(effectiveEventId);
        console.log("Event data fetched:", response.data.data);
        setEventData(response.data.data);
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data.data));
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      }
    };
    fetchEventData();
  }, [effectiveEventId, propEventData]);

  const handleFormSubmit = (formValues: any) => {
    console.log("Form submitted:", formValues);
    alert("Registration submitted successfully!");
  };

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
      {/* Content */}
      <div className="w-full mx-auto">
        {/* Event Info */}
        <div className="gap-3 flex flex-row items-center">
          <div style={{ padding: 32 }} className="bg-neutral-50 rounded-2xl">
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Please fill name and contact information of attendees.
            </h3>
            {!isUserRegistration && (
              <button
                type="button"
                onClick={() => setShowAddFieldModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus size={18} />
                Add Custom Field
              </button>
            )}
          </div>

          {isLoadingApiData ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Loading form fields...</p>
              </div>
            </div>
          ) : formFields.length > 0 ? (
            <ReusableRegistrationForm
              // @ts-ignore
              formFields={formFields.map((field) => ({
                ...field,
                active: fieldActiveStates[field.id] !== false,
              }))}
              onToggleField={(fieldId: any) =>
                handleToggleField(fieldId, setToggleLoading)
              }
              toggleLoading={toggleLoading}
              onSubmit={handleFormSubmit}
              submitButtonText="Register"
              isUserRegistration={isUserRegistration}
              onReorderField={
                !isUserRegistration ? handleReorderField : undefined
              }
              reorderLoading={reorderLoading}
              showReorder={!isUserRegistration}
              eventId={effectiveEventId}
              onDeleteField={
                !isUserRegistration ? handleDeleteField : undefined
              }
              deleteLoading={deleteLoading}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No form fields available</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Custom Field
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFieldModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newFieldData.name}
                  onChange={(e) =>
                    setNewFieldData({ ...newFieldData, name: e.target.value })
                  }
                  placeholder="e.g., Company Name, Job Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name (optional)
                </label>
                <input
                  type="text"
                  value={newFieldData.field}
                  onChange={(e) =>
                    setNewFieldData({ ...newFieldData, field: e.target.value })
                  }
                  placeholder="Auto-generated from label if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used internally (lowercase, underscores)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validation Type
                </label>
                <select
                  value={newFieldData.validation_type}
                  onChange={(e) =>
                    setNewFieldData({
                      ...newFieldData,
                      validation_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="none">None</option>
                  <option value="email">Email</option>
                  <option value="numeric">Numeric</option>
                  <option value="alphabetic">Alphabetic</option>
                  <option value="alphanumeric">Alphanumeric</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newFieldData.required}
                    onChange={(e) =>
                      setNewFieldData({
                        ...newFieldData,
                        required: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newFieldData.full_width}
                    onChange={(e) =>
                      setNewFieldData({
                        ...newFieldData,
                        full_width: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Full Width</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFieldModal(false);
                    setNewFieldData({
                      name: "",
                      field: "",
                      validation_type: "none",
                      required: false,
                      full_width: true,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isCreatingField}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateField}
                  disabled={isCreatingField || !newFieldData.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingField ? "Creating..." : "Create Field"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateFormFour;
