import { useState, useRef } from "react";
import { createEventUser } from "@/apis/apiHelpers";
import { toast, ToastContainer } from "react-toastify";

// Image compression utility
const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create blob from canvas"));
              return;
            }

            // Get file extension from original file
            const extension = file.name.split(".").pop() || "jpg";
            const compressedFile = new File(
              [blob],
              `${file.name.split(".")[0]}_compressed.${extension}`,
              {
                type: file.type,
                lastModified: Date.now(),
              }
            );

            console.log(
              `📸 Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(
                compressedFile.size / 1024
              ).toFixed(2)}KB`
            );
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => {
        reject(new Error("Could not load image"));
      };
      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };

    reader.readAsDataURL(file);
  });
};

interface FormField {
  id: number;
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  active?: boolean;
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string }>;
  accept?: string;
  hint?: string;
  rows?: number;
  checkboxLabel?: string;
}

interface RegistrationFormPreviewProps {
  formFields?: FormField[];
  submitButtonText?: string;
  eventId: string;
  tenantUuid?: string;
}

const RegistrationFormPreview = ({
  formFields = [],
  submitButtonText = "Register",
  eventId,
  tenantUuid,
}: RegistrationFormPreviewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Refs for file inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  const handleSubmit = async () => {
    try {
      // ✅ VALIDATION: Check required fields
      const requiredFields = formFields.filter((field) => field.required);
      const missingFields = requiredFields.filter(
        (field) => !formData[field.name]
      );

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((f) => f.label).join(", ");
        toast.error(`Please fill in required fields: ${fieldNames}`);
        return;
      }

      setLoading(true);

      console.log("📤 Sending data:", { eventId, tenantUuid, formData });

      const formDataToSend = new FormData();
      console.log("formData", formData);

      // Append tenant_uuid if provided
      if (tenantUuid) formDataToSend.append("tenant_uuid", tenantUuid);

      // Append user data
      formDataToSend.append("event_user[name]", formData.name);

      // user_type field removed - no longer needed

      formDataToSend.append("event_user[phone_number]", formData.phone_number);
      formDataToSend.append("event_user[email]", formData.email);
      if (formData.position)
        formDataToSend.append("event_user[position]", formData.position);
      if (formData.organization)
        formDataToSend.append(
          "event_user[organization]",
          formData.organization
        );

      // Append image if provided
      if (formData.image)
        formDataToSend.append("event_user[image]", formData.image);

      const response = await createEventUser(eventId, formDataToSend);

      toast.success("Registration successfull");
      console.log("✅ User created:", response);

      // Reset form data
      setFormData({});

      // Clear all file inputs
      Object.values(fileInputRefs.current).forEach((input) => {
        if (input) input.value = "";
      });
    } catch (error: any) {
      console.error("❌ Error creating event user:", error?.response);
      console.log("error", error?.response);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderField = (field: FormField) => {
    const commonInputClasses =
      "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white";

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={commonInputClasses}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={field.rows || 3}
            className={commonInputClasses}
          />
        );

      case "select":
        return (
          <select
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={commonInputClasses}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "file":
        return (
          <div>
            <input
              type="file"
              accept={field.accept}
              ref={(el) => {
                if (el) fileInputRefs.current[field.name] = el;
              }}
              onChange={async (e) => {
                const files = e.target.files;
                if (files && files[0]) {
                  const file = files[0];

                  // Check if it's an image file
                  if (file.type.startsWith("image/")) {
                    try {
                      toast.info("Compressing image...");
                      const compressedFile = await compressImage(file);
                      handleInputChange(field.name, compressedFile);
                      toast.success(`Image compressed and ready to upload`);
                    } catch (error) {
                      console.error("Error compressing image:", error);
                      toast.warning(
                        "Could not compress image, uploading original"
                      );
                      // Fallback to original file if compression fails
                      handleInputChange(field.name, file);
                    }
                  } else {
                    // Non-image file, use as is
                    handleInputChange(field.name, file);
                  }
                }
              }}
              className="w-full text-sm border border-gray-300 rounded-lg py-2 px-3 transition-colors text-gray-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {field.hint && (
              <p className="mt-2 text-xs text-gray-500">{field.hint}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">
              {field.checkboxLabel}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {formFields.map((field) => (
        <div key={field.name} className={field.fullWidth ? "w-full" : ""}>
          {field.type !== "checkbox" && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
        </div>
      ))}

      <button
        type="button"
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : submitButtonText}
      </button>
      <ToastContainer />
    </div>
  );
};

export default RegistrationFormPreview;
