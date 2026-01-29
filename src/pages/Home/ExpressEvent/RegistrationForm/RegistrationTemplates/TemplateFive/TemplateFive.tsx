import { Skeleton } from "@/components/ui/skeleton";
import TemplateForm from "./TemplateForm";

const TemplateFive = ({
  onUseTemplate,
  data,
  isLoading,
  eventId,
}: {
  onUseTemplate?: any;
  data: any;
  isLoading?: boolean;
  eventId?: string;
}) => {
  console.log(
    "onUse template TemplateFive-----+++++------",
    onUseTemplate,
    eventId,
    data
  );

  console.log("form data in template five ::::", data);

  // Handle the use template click
  const handleUseTemplate = () => {
    console.log("TemplateFive handleUseTemplate");
    if (onUseTemplate && !isLoading) {
      // Call the parent function with template data
      onUseTemplate("template-five", {
        name: "Event Registration Form Template Five",
        description:
          "A modern registration form template with vibrant design elements for dynamic events.",
        templateComponent: TemplateForm,
        fields: data || [], // Pass the form data as fields
      });
    }
  };
  return (
    <div className="flex flex-col md:flex-row gap-8 mt-4 max-h-[80vh]">
      {/* Left side (scrollable TemplateForm) */}
      <div className="w-full md:w-[70%] overflow-y-auto pr-2">
        {isLoading || !data || data.length === 0 ? (
          <div className="space-y-6 py-8 border border-gray-200 rounded-lg bg-gray-50 p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-12 w-1/3" />
            </div>
          </div>
        ) : (
          <TemplateForm data={data} eventId={eventId} />
        )}
      </div>

      {/* Right side (fixed, always visible) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between sticky top-0">
        {/* Top section */}
        <div>
          <h2 className="text-xl font-poppins font-semibold mb-2">Temp 5</h2>
          <p className="text-sm text-gray-500 mb-6">
            A new guest's registration form is a form designed to streamline the
            process of collecting personal and contact information from new
            guests.
          </p>
        </div>

        {/* Bottom button */}
        <button
          onClick={handleUseTemplate}
          disabled={isLoading}
          className={`cursor-pointer p-3 rounded-lg text-sm font-poppins font-medium transition-colors flex items-center justify-center ${
            isLoading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-slate-800 text-white hover:bg-slate-900"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ) : (
            "Use Template →"
          )}
        </button>
      </div>
    </div>
  );
};

export default TemplateFive;
