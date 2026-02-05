import { Plus, Check, Pencil, Trash2, FileText } from "lucide-react";
import type { InvitationEmailTemplate } from "./newInvitationTypes";

type RsvpTemplateTabProps = {
  rsvpEmailSubject: string;
  setRsvpEmailSubject: (value: string) => void;
  rsvpTemplates: InvitationEmailTemplate[];
  selectedRsvpTemplateId: string | null;
  setSelectedRsvpTemplateId: (id: string | null) => void;
  onCreateNewTemplate: () => void;
  onEditTemplate: (template: InvitationEmailTemplate) => void;
  onDeleteTemplate: (template: InvitationEmailTemplate) => void;
  onPreviewTemplate: (template: InvitationEmailTemplate) => void;
};

export function RsvpTemplateTab({
  rsvpEmailSubject,
  setRsvpEmailSubject,
  rsvpTemplates,
  selectedRsvpTemplateId,
  setSelectedRsvpTemplateId,
  onCreateNewTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onPreviewTemplate,
}: RsvpTemplateTabProps) {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          RSVP email subject
        </label>
        <input
          type="text"
          placeholder="e.g., Please confirm your attendance"
          value={rsvpEmailSubject}
          onChange={(e) => setRsvpEmailSubject(e.target.value)}
          className="w-full max-w-xl px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-2">
          RSVP email template
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Design the email invitees receive to respond (Accept / Decline). Use
          the builder to add text, images, and insert{" "}
          <strong>RSVP Accept Link</strong> or{" "}
          <strong>RSVP Decline Link</strong> as buttons or links so invitees can
          respond.
        </p>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          RSVP templates
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={onCreateNewTemplate}
            className="border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 min-h-[280px]"
          >
            <div className="text-center">
              <Plus className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium text-slate-600">
                Create new
              </span>
            </div>
          </div>
          {rsvpTemplates.map((template) => {
            const isSelected = selectedRsvpTemplateId === template.id;
            return (
              <div
                key={template.id}
                onClick={() =>
                  setSelectedRsvpTemplateId(
                    selectedRsvpTemplateId === template.id ? null : template.id,
                  )
                }
                className={`group cursor-pointer rounded-2xl border-2 p-4 transition-colors flex flex-col min-h-[280px] overflow-hidden ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                    : "border-slate-200 hover:border-indigo-400 bg-white hover:shadow-sm"
                }`}
              >
                <div className="flex-1 min-h-0 overflow-hidden rounded-lg relative bg-slate-100">
                  {template.html ? (
                    <iframe
                      title={template.title}
                      srcDoc={template.html}
                      className="w-full h-full min-h-[180px] pointer-events-none border-0 scale-[0.35] origin-top-left"
                      style={{
                        width: "285%",
                        height: "285%",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      No preview
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <div className="flex gap-2 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewTemplate(template);
                        }}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                        aria-label="Preview template"
                      >
                        <FileText className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTemplate(template);
                        }}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-indigo-400 transition-colors cursor-pointer"
                        aria-label="Edit template"
                      >
                        <Pencil className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTemplate(template);
                        }}
                        className="w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center border border-gray-200 hover:border-red-400 transition-colors cursor-pointer"
                        aria-label="Delete template"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-slate-900 truncate pr-2">
                      {template.title}
                    </span>
                    {isSelected && (
                      <div className="flex items-center shrink-0">
                        <Check size={16} className="text-indigo-500 mr-1" />
                        <span className="text-sm text-indigo-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
