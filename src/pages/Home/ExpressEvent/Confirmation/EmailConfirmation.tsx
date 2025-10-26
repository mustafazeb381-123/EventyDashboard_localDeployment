import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  ChevronLeft,
  X,
  Pencil,
  Plus,
  Trash2,
  Download,
  Mail,
  Settings,
  Palette,
  Image as ImageIcon,
  Code,
  Layout,
  Type,
} from "lucide-react";
import EmailEditor from "react-email-editor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "react-qr-code";
import ThanksTemplateOne from "./Templates/ThanksEmailTemplates/ThanksTemplateOne";
import ThanksTemplateTwo from "./Templates/ThanksEmailTemplates/ThanksTemplateTwo";
import ConfirmationTemplateOne from "./Templates/ConfirmationEmailTemplates/ConfirmationTemplateOne";
import ReminderTemplateOne from "./Templates/ReminderEmailTemplate/ReminderTemplateOne";
import ReminderTemplateTwo from "./Templates/ReminderEmailTemplate/ReminderTemplateTwo";
import RejectionTemplateOne from "./Templates/RejectionEmailTemplate/RejectionTemplateOne";
import RejectionTemplateTwo from "./Templates/RejectionEmailTemplate/RejectionTemplateTwo";

// QR Code Modal Component
const QRCodeModal = ({ open, onClose, onInsert, eventId }: any) => {
  const [qrValue, setQrValue] = useState(
    `https://yourevent.com/events/${eventId}/confirm`
  );
  const [qrSize, setQrSize] = useState(200);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleInsert = () => {
    if (qrRef.current) {
      // Get the SVG element and convert to data URL
      const svgElement = qrRef.current.querySelector("svg");
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const dataUrl =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgString)));

        onInsert(dataUrl, qrValue, qrSize);
        onClose();
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Add QR Code
              </h3>
              <p className="text-sm text-gray-600">
                Insert scannable code for your event
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Content
            </label>
            <input
              type="text"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter URL or text for QR code"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Size
              </label>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {qrSize}px
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="300"
              value={qrSize}
              onChange={(e) => setQrSize(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-lg"
            />
          </div>

          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
            <div className="text-sm font-medium text-gray-600 mb-3">
              Preview
            </div>
            <div ref={qrRef} className="p-4 bg-white rounded-xl shadow-sm">
              <QRCode
                value={qrValue}
                size={qrSize}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 ${qrSize} ${qrSize}`}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="p-1 bg-yellow-100 rounded-lg">
              <Settings size={16} className="text-yellow-600" />
            </div>
            <p className="text-sm text-yellow-700">
              The QR code will be inserted as an image in your email template
              and can be resized or moved.
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-white transition-all font-medium shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all font-medium shadow-lg shadow-blue-500/25"
          >
            Insert QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

const EmailEditorModal = ({
  open,
  initialDesign,
  onClose,
  onSave,
  effectiveEventId,
}: any) => {
  const emailEditorRef = useRef<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("design");

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      if (emailEditorRef.current?.editor && initialDesign) {
        try {
          emailEditorRef.current.editor.loadDesign(initialDesign);
        } catch (err) {
          console.warn("Failed to load design into editor:", err);
        }
      } else if (emailEditorRef.current?.editor && !initialDesign) {
        // Initialize empty editor
      }
    }, 300);

    return () => clearTimeout(t);
  }, [open, initialDesign]);

  // Function to insert QR code into email editor
  const insertQRCode = (qrDataUrl: string, qrValue: string, qrSize: number) => {
    if (!emailEditorRef.current?.editor) return;

    const editor = emailEditorRef.current.editor;

    const qrCodeBlock = {
      type: "image",
      src: qrDataUrl,
      alt: `QR Code: ${qrValue}`,
      width: `${qrSize}px`,
      style: {
        border: "none",
        display: "block",
        margin: "10px auto",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
      },
      attributes: {
        "data-qr-code": "true",
        "data-qr-value": qrValue,
      },
    };

    editor.blocks.add("image", qrCodeBlock);
    toast.success("QR code inserted successfully!");
  };

  const handleExport = () => {
    emailEditorRef.current?.editor?.exportHtml((data: any) => {
      const { design, html } = data;

      console.log("=== SAVING TEMPLATE DATA ===");
      console.log("Design JSON:", JSON.stringify(design, null, 2));
      console.log("HTML Content:", html);
      console.log("Design object structure:", {
        counters: design?.counters,
        body: design?.body
          ? `Present (${Object.keys(design.body).length} properties)`
          : "Missing",
        head: design?.head
          ? `Present (${Object.keys(design.head).length} properties)`
          : "Missing",
      });
      console.log("============================");

      onSave(design, html);
      onClose();
    });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[95vh] border border-gray-200">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-gray-900 to-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Mail className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Email Template Designer
                </h3>
                <p className="text-sm text-gray-300">
                  Drag and drop elements from the right panel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Tool Selector */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setActiveTool("design")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTool === "design"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Design
                </button>
                <button
                  onClick={() => setActiveTool("code")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTool === "code"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Code
                </button>
              </div>

              {/* QR Code Button */}
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/25"
              >
                <Code size={16} />
                Add QR Code
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex">
            {/* Sidebar Tools */}
            <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
              <ToolButton icon={<Layout size={20} />} tool="Layout" active />
              <ToolButton icon={<Type size={20} />} tool="Text" />
              <ToolButton icon={<ImageIcon size={20} />} tool="Images" />
              <ToolButton icon={<Palette size={20} />} tool="Styles" />
              <ToolButton icon={<Settings size={20} />} tool="Settings" />
            </div>

            {/* Main Editor */}
            <div className="flex-1">
              <EmailEditor
                ref={emailEditorRef}
                minHeight="100%"
                appearance={{ theme: "dark" }}
                options={{
                  customCSS: [
                    `
                    .unlayer-toolbar-button[data-tool="qrCode"] {
                      background: transparent;
                      border: none;
                      padding: 8px;
                      cursor: pointer;
                    }
                    `,
                  ],
                }}
              />
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Auto-saved to drafts
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-xl hover:bg-white transition-all font-medium shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl font-medium shadow-lg shadow-pink-500/25 transition-all flex items-center gap-2"
              >
                <Check size={18} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        open={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onInsert={insertQRCode}
        eventId={effectiveEventId}
      />
    </>
  );
};

// Tool Button Component for Sidebar
const ToolButton = ({ icon, tool, active = false }: any) => (
  <button
    className={`p-3 rounded-xl transition-all ${
      active
        ? "bg-white shadow-md border border-gray-200 text-blue-600"
        : "text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-700"
    }`}
    title={tool}
  >
    {icon}
  </button>
);

const TemplateModal = ({
  template,
  onClose,
  onSelect,
  onEdit,
  onDelete,
  onAddQRCode,
}: any) => {
  if (!template) return null;

  const content = template.html ? (
    <div
      className="w-full"
      dangerouslySetInnerHTML={{ __html: template.html }}
    />
  ) : (
    <div className="w-full">{template.component}</div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {template.title}
              </h3>
              <p className="text-sm text-gray-500">
                Preview your email template
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* QR Code Button */}
            <button
              onClick={() => onAddQRCode(template)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              <Code size={16} />
              Add QR Code
            </button>
            <button
              onClick={() => onEdit(template)}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg shadow-pink-500/25"
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              onClick={() => onDelete(template)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-orange-700 transition-all shadow-lg shadow-red-500/25"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Template content with enhanced styling */}
        <div className="mb-6 border-2 border-gray-200 rounded-2xl overflow-hidden shadow-inner bg-gray-50">
          {content}
        </div>

        <button
          onClick={() => onSelect(template.id)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-green-500/25 text-lg"
        >
          Choose this template
        </button>
      </div>
    </div>
  );
};

/**
 * TemplateThumbnail - Enhanced component to display template preview in grid
 */
const TemplateThumbnail = ({ template, selected = false }: any) => {
  return (
    <div
      className={`w-full rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden border-2 ${
        selected
          ? "border-blue-500 shadow-lg shadow-blue-500/20"
          : "border-gray-200"
      } transition-all duration-300`}
    >
      {template.html ? (
        // For edited templates: Show scaled preview of the actual HTML
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "scale(0.3)", transformOrigin: "top left" }}
        >
          <div
            className="w-full h-full shadow-lg"
            dangerouslySetInnerHTML={{ __html: template.html }}
          />
        </div>
      ) : (
        // For static templates: Show the React component properly scaled
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: "scale(0.3)", transformOrigin: "top left" }}
        >
          {template.component}
        </div>
      )}

      {/* Overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

// Template Card Component
const TemplateCard = ({
  template,
  onPreview,
  onEdit,
  onDelete,
  onAddQRCode,
  selected = false,
  onSelect,
}: any) => {
  return (
    <div
      className={`group relative bg-white rounded-2xl p-4 aspect-square flex flex-col transition-all duration-300 hover:shadow-xl border-2 ${
        selected
          ? "border-blue-500 shadow-lg shadow-blue-500/20"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
            <Check size={14} />
          </div>
        </div>
      )}

      {/* Template Preview (click to open modal) */}
      <div onClick={onPreview} className="flex-1 cursor-pointer mb-3">
        <TemplateThumbnail template={template} selected={selected} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {template.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {template.html ? "Custom Template" : "Pre-built Template"}
          </p>
        </div>

        {/* Select Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template.id);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selected
              ? "bg-blue-500 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>

      {/* ACTION BUTTONS - Enhanced */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
        {/* QR CODE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddQRCode(template);
          }}
          className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 z-10"
          title="Add QR Code to Template"
        >
          <Code size={14} />
        </button>

        {/* EDIT BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(template);
          }}
          className="p-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg shadow-pink-500/25 z-10"
          title="Edit template"
        >
          <Pencil size={14} />
        </button>

        {/* DELETE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template);
          }}
          className="p-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-600 hover:to-orange-700 transition-all shadow-lg shadow-red-500/25 z-10"
          title="Delete template"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// API Service (unchanged, included for completeness)
const apiService = {
  getAuthToken() {
    const token = localStorage.getItem("token");
    console.log("token-------+++++++++++000000000000000", token);
    return token;
  },

  async getTemplates(eventId: string | number, flowType: string) {
    try {
      const endpoint = this.getEndpoint();
      const typeParam = this.getTypeParam(flowType);

      const url = `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}?type=${typeParam}`;

      console.log(`=== FETCHING TEMPLATES ===`);
      console.log("URL:", url);
      console.log("Flow Type:", flowType);
      console.log("Type Param:", typeParam);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        `=== GET ${flowType.toUpperCase()} TEMPLATES RESPONSE ===`,
        data
      );

      return data.data || [];
    } catch (error) {
      console.error(`Error fetching ${flowType} templates:`, error);
      throw error;
    }
  },

  async saveTemplate(
    eventId: string | number,
    flowType: string,
    html: string,
    title: string = "Custom Template"
  ) {
    try {
      const endpoint = this.getEndpoint();
      const payload = this.getPayload(flowType, html, title);

      console.log(`=== SAVING NEW ${flowType.toUpperCase()} TEMPLATE ===`);
      console.log("Event ID:", eventId);
      console.log("Endpoint:", endpoint);
      console.log("Payload:", payload);

      const response = await fetch(
        `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(
          `Failed to save template: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log(`=== ${flowType.toUpperCase()} TEMPLATE SAVED ===`, data);

      return data;
    } catch (error) {
      console.error(`Error saving ${flowType} template:`, error);
      throw error;
    }
  },

  async updateTemplate(
    eventId: string | number,
    templateId: string | number,
    flowType: string,
    html: string,
    title: string = "Updated Template"
  ) {
    try {
      const endpoint = this.getEndpoint();
      const typeParam = this.getTypeParam(flowType);
      const url = `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}/${templateId}?type=${typeParam}`;

      const payload = this.getUpdatePayload(flowType, html, title);

      console.log(`=== UPDATING ${flowType.toUpperCase()} TEMPLATE ===`);
      console.log("URL:", url);
      console.log("Template ID:", templateId);
      console.log("Payload:", payload);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(
          `Failed to update template: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log(`=== ${flowType.toUpperCase()} TEMPLATE UPDATED ===`, data);

      return data;
    } catch (error) {
      console.error(`Error updating ${flowType} template:`, error);
      throw error;
    }
  },

  async deleteTemplate(
    eventId: string | number,
    templateId: string | number,
    flowType: string
  ) {
    try {
      const endpoint = this.getEndpoint();
      const typeParam = this.getTypeParam(flowType);
      const url = `https://scceventy.dev/en/api_dashboard/v1/events/${eventId}/${endpoint}/${templateId}?type=${typeParam}`;

      console.log(`=== DELETING TEMPLATE ===`);
      console.log("URL:", url);
      console.log("Template ID:", templateId);
      console.log("Flow Type:", flowType);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status);
      console.log("Delete response ok:", response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          // Ignore text parsing errors
        }
        throw new Error(`Failed to delete template: ${errorMessage}`);
      }

      const contentLength = response.headers.get("content-length");
      const contentType = response.headers.get("content-type");

      console.log("Response content-length:", contentLength);
      console.log("Response content-type:", contentType);

      if (
        contentLength === "0" ||
        !contentType ||
        !contentType.includes("application/json")
      ) {
        console.log("=== TEMPLATE DELETED SUCCESSFULLY (empty response) ===");
        return { success: true, message: "Template deleted successfully" };
      }

      try {
        const data = await response.json();
        console.log("=== TEMPLATE DELETED SUCCESSFULLY ===", data);
        return data;
      } catch (jsonError) {
        console.log("JSON parse error, but considering deletion successful");
        return { success: true, message: "Template deleted successfully" };
      }
    } catch (error) {
      console.error(`Error in deleteTemplate:`, error);
      throw error;
    }
  },

  getEndpoint() {
    return "confirmation_templates";
  },

  getTypeParam(flowType: string) {
    const typeMap: { [key: string]: string } = {
      thanks: "ConfirmationThanksTemplate",
      confirmation: "ConfirmationRegisterTemplate",
      reminder: "ConfirmationReminderTemplate",
      rejection: "ConfirmationRejectionTemplate",
    };

    return typeMap[flowType] || "ConfirmationThanksTemplate";
  },

  getPayload(flowType: string, html: string, title: string) {
    const type = this.getTypeParam(flowType);

    return {
      confirmation_template: {
        content: html,
        default: false,
        type: type,
      },
    };
  },

  getUpdatePayload(flowType: string, html: string, title: string) {
    const type = this.getTypeParam(flowType);

    return {
      confirmation_template: {
        content: html,
        type: type,
      },
    };
  },

  convertApiTemplates(apiTemplates: any[], flowType: string) {
    return apiTemplates.map((template: any, index: number) => ({
      id: `api-${template.id}`,
      title: `${
        flowType.charAt(0).toUpperCase() + flowType.slice(1)
      } Template ${index + 1}`,
      component: null,
      design: null,
      html: template.attributes?.content || "",
      apiId: template.id,
      type: template.attributes?.type || flowType,
    }));
  },
};

// -------- Main Component --------
interface EmailConfirmationProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  onNext,
  onPrevious,
  eventId,
}) => {
  console.log("EmailConfirmation - Received eventId:", eventId);
  const localStorageEventId = localStorage.getItem("create_eventId");
  console.log("EmailConfirmation - localStorage eventId:", localStorageEventId);
  const effectiveEventId = eventId || localStorageEventId;
  console.log("EmailConfirmation - Effective eventId:", effectiveEventId);

  const [flows, setFlows] = useState<any[]>([
    {
      id: "thanks",
      label: "Thanks Email",
      templates: [],
      icon: "🙏",
      description: "Thank attendees after registration",
    },
    {
      id: "confirmation",
      label: "Confirmation Email",
      templates: [],
      icon: "✅",
      description: "Confirm event registration",
    },
    {
      id: "reminder",
      label: "Reminder Email",
      templates: [],
      icon: "⏰",
      description: "Send event reminders",
    },
    {
      id: "rejection",
      label: "Rejection Email",
      templates: [],
      icon: "❌",
      description: "Notify if registration is declined",
    },
  ]);

  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState<any>({});
  const [modalTemplate, setModalTemplate] = useState<any | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentFlow = flows[currentFlowIndex];

  useEffect(() => {
    if (effectiveEventId) {
      loadTemplatesFromAPI();
    }
  }, [effectiveEventId, currentFlowIndex]);

  const loadTemplatesFromAPI = async () => {
    if (!effectiveEventId) return;

    setIsLoading(true);
    try {
      const apiTemplates = await apiService.getTemplates(
        effectiveEventId,
        currentFlow.id
      );
      const convertedTemplates = apiService.convertApiTemplates(
        apiTemplates,
        currentFlow.id
      );

      console.log(
        `=== LOADED ${currentFlow.id.toUpperCase()} TEMPLATES FROM API ===`,
        convertedTemplates
      );

      setFlows((prevFlows) =>
        prevFlows.map((flow) =>
          flow.id === currentFlow.id
            ? { ...flow, templates: [...convertedTemplates] }
            : flow
        )
      );
    } catch (error) {
      console.error("Error loading templates from API:", error);
      toast.error("Failed to load templates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (template: any) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates({
      ...selectedTemplates,
      [currentFlow.id]: templateId,
    });
    setModalTemplate(null);
    toast.success("Template selected successfully!");
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setModalTemplate(null);
    setIsEditorOpen(true);
  };

  const handleCreateNewTemplate = () => {
    setIsCreatingNew(true);
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleModalAddQRCode = (template: any) => {
    setModalTemplate(null);
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleAddQRCodeToTemplate = (template: any) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = async (template: any) => {
    if (!effectiveEventId || !template.apiId) {
      console.error(
        "Cannot delete template: Missing eventId or template API ID"
      );
      toast.error("Cannot delete template: Missing required data.");
      return;
    }

    toast.info(
      <div>
        <p>Are you sure you want to delete "{template.title}"?</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss();
              proceedWithDelete(template);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
      }
    );
  };

  const proceedWithDelete = async (template: any) => {
    setIsLoading(true);
    try {
      await apiService.deleteTemplate(
        effectiveEventId,
        template.apiId,
        currentFlow.id
      );

      console.log("=== DELETING TEMPLATE ===");
      console.log("Template ID:", template.id);
      console.log("API ID:", template.apiId);
      console.log("Current Flow:", currentFlow.label);
      console.log("=========================");

      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.filter(
            (tpl: any) => tpl.id !== template.id
          ),
        }))
      );

      if (selectedTemplates[currentFlow.id] === template.id) {
        setSelectedTemplates((prev: any) => {
          const newSelected = { ...prev };
          delete newSelected[currentFlow.id];
          return newSelected;
        });
      }

      setModalTemplate(null);
      toast.success("Template deleted successfully!");
    } catch (error) {
      console.error("Error deleting template from API:", error);
      toast.error("Failed to delete template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewTemplate = async (design: any, html: string) => {
    if (!isCreatingNew || !effectiveEventId) return;

    setIsLoading(true);
    try {
      const apiResponse = await apiService.saveTemplate(
        effectiveEventId,
        currentFlow.id,
        html,
        `Custom ${currentFlow.label} Template`
      );

      const newTemplate = {
        id: `custom-${Date.now()}`,
        title: `Custom ${currentFlow.label} Template`,
        component: null,
        design,
        html,
        apiId: apiResponse.data?.id,
        type: currentFlow.id,
      };

      console.log("=== CREATING NEW TEMPLATE ===");
      console.log("New Template Data:", newTemplate);
      console.log("API Response:", apiResponse);
      console.log("Current Flow:", currentFlow.label);
      console.log("============================");

      setFlows((prevFlows) =>
        prevFlows.map((flow, index) =>
          index === currentFlowIndex
            ? { ...flow, templates: [...flow.templates, newTemplate] }
            : flow
        )
      );

      setSelectedTemplates({
        ...selectedTemplates,
        [currentFlow.id]: newTemplate.id,
      });

      setIsCreatingNew(false);
      setIsEditorOpen(false);

      toast.success("Template created successfully!");
    } catch (error) {
      console.error("Error saving template to API:", error);
      toast.error("Failed to save template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (design: any, html: string) => {
    console.log("=== UPDATE TEMPLATE CALLBACK ===");
    console.log("Is Creating New:", isCreatingNew);
    console.log("Editing Template:", editingTemplate);
    console.log(
      "Design received:",
      design ? `Present (${Object.keys(design).length} properties)` : "Missing"
    );
    console.log(
      "HTML received:",
      html ? `Present (${html.length} characters)` : "Missing"
    );
    console.log("Event ID:", effectiveEventId);
    console.log("=============================");

    if (!editingTemplate || !effectiveEventId || !editingTemplate.apiId) {
      console.warn("Missing required data for updating template:", {
        editingTemplate: !!editingTemplate,
        eventId: !!effectiveEventId,
        apiId: editingTemplate?.apiId,
      });
      toast.error("Missing required data for updating template.");
      return;
    }

    setIsLoading(true);
    try {
      await apiService.updateTemplate(
        effectiveEventId,
        editingTemplate.apiId,
        currentFlow.id,
        html,
        editingTemplate.title
      );

      console.log("=== UPDATING EXISTING TEMPLATE ===");
      console.log("Template ID:", editingTemplate.id);
      console.log("API ID:", editingTemplate.apiId);
      console.log(
        "Previous Design:",
        editingTemplate.design ? `Present` : "Missing"
      );
      console.log("New Design:", design ? `Present` : "Missing");
      console.log("================================");

      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.map((tpl: any) =>
            tpl.id === editingTemplate.id ? { ...tpl, design, html } : tpl
          ),
        }))
      );

      setEditingTemplate(null);
      setIsEditorOpen(false);

      toast.success("Template updated successfully!");
    } catch (error) {
      console.error("Error updating template in API:", error);
      toast.error("Failed to update template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFromEditor = async (design: any, html: string) => {
    if (isCreatingNew) {
      await handleSaveNewTemplate(design, html);
    } else {
      await handleUpdateTemplate(design, html);
    }
  };

  const initialDesign = editingTemplate?.design ?? null;

  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) {
      toast.warning("Please select a template before proceeding");
      return;
    }

    console.log(
      "EmailConfirmation - Proceeding to next step with eventId:",
      effectiveEventId
    );

    if (currentFlowIndex < flows.length - 1) {
      setCurrentFlowIndex(currentFlowIndex + 1);
      toast.success(`Moving to ${flows[currentFlowIndex + 1].label}`);
    } else if (onNext) {
      console.log("=== FINAL STATE BEFORE PROCEEDING ===");
      console.log("All Flows:", flows);
      console.log("All Selected Templates:", selectedTemplates);
      console.log("Event ID:", effectiveEventId);
      console.log("====================================");

      if (effectiveEventId) {
        console.log(
          "EmailConfirmation - Sending eventId to next component:",
          effectiveEventId
        );
        onNext(effectiveEventId);
      } else {
        console.log(
          "EmailConfirmation - No eventId available, calling onNext without parameter"
        );
        onNext();
      }

      toast.success("All email templates configured successfully!");
    }
  };

  const handleBack = () => {
    if (currentFlowIndex > 0) {
      setCurrentFlowIndex(currentFlowIndex - 1);
      toast.info(`Returning to ${flows[currentFlowIndex - 1].label}`);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleStepClick = (index: number) => {
    if (index <= currentFlowIndex || selectedTemplates[flows[index].id]) {
      setCurrentFlowIndex(index);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-white to-gray-50/30 p-6 rounded-2xl shadow-sm relative border border-gray-200/50">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Enhanced Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="text-gray-500" size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentFlow.icon} {currentFlow.label}
            </h2>
            <p className="text-gray-500 mt-1">{currentFlow.description}</p>
          </div>
        </div>

        {/* Enhanced Progress Stepper */}
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-gray-200/50">
          {flows.map((flow, index) => {
            const isCompleted = Boolean(selectedTemplates[flow.id]);
            const isActive = index === currentFlowIndex;
            const canClick = index <= currentFlowIndex || isCompleted;

            return (
              <div key={flow.id} className="flex items-center">
                <button
                  onClick={() => canClick && handleStepClick(index)}
                  disabled={!canClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : isCompleted
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  } ${
                    canClick && !isActive && !isCompleted
                      ? "hover:bg-gray-200 text-gray-700"
                      : ""
                  }`}
                >
                  <span className="text-sm font-medium">{flow.icon}</span>
                  <span className="text-sm font-medium hidden sm:block">
                    {flow.label}
                  </span>
                  {isCompleted && <Check size={16} className="text-white" />}
                </button>

                {index !== flows.length - 1 && (
                  <div
                    className={`w-4 h-0.5 mx-2 ${
                      isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="text-gray-600 font-medium">
              Loading templates...
            </span>
          </div>
        </div>
      )}

      {/* Enhanced Template Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Create New Template Card - Enhanced */}
          <div
            onClick={handleCreateNewTemplate}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center aspect-square group"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
              <Plus className="text-white" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              Create New Template
            </h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              Design a custom email template with drag & drop editor
            </p>
            <div className="mt-4 px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
              Recommended
            </div>
          </div>

          {/* Existing Templates with Enhanced Cards */}
          {currentFlow.templates.map((tpl: any) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              selected={selectedTemplates[currentFlow.id] === tpl.id}
              onPreview={() => handleOpenModal(tpl)}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onAddQRCode={handleAddQRCodeToTemplate}
              onSelect={handleSelectTemplate}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modalTemplate && (
        <TemplateModal
          template={modalTemplate}
          onClose={handleCloseModal}
          onSelect={handleSelectTemplate}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onAddQRCode={handleModalAddQRCode}
        />
      )}

      <EmailEditorModal
        open={isEditorOpen}
        initialDesign={initialDesign}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingTemplate(null);
          setIsCreatingNew(false);
        }}
        onSave={(design: any, html: string) => {
          handleSaveFromEditor(design, html);
        }}
        effectiveEventId={effectiveEventId}
      />

      {/* Enhanced Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200/50">
        <button
          onClick={handleBack}
          disabled={currentFlowIndex === 0 && !onPrevious}
          className={`px-8 py-3 border rounded-xl transition-all font-medium ${
            currentFlowIndex === 0 && !onPrevious
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-white hover:shadow-sm hover:border-gray-400"
          }`}
        >
          ← Previous
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-medium">
            Step {currentFlowIndex + 1} of {flows.length}
          </span>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                selectedTemplates[currentFlow.id]
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            ></div>
            <span
              className={
                selectedTemplates[currentFlow.id]
                  ? "text-green-600"
                  : "text-yellow-600"
              }
            >
              {selectedTemplates[currentFlow.id]
                ? "Template selected"
                : "Template required"}
            </span>
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={!selectedTemplates[currentFlow.id] || isLoading}
          className={`px-8 py-3 rounded-xl text-white transition-all font-medium ${
            selectedTemplates[currentFlow.id] && !isLoading
              ? "bg-gradient-to-r from-slate-800 to-gray-900 hover:from-slate-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {currentFlowIndex === flows.length - 1 ? (
            <span className="flex items-center gap-2">
              Finish Setup
              <Check size={18} />
            </span>
          ) : (
            `Next: ${flows[currentFlowIndex + 1]?.label} →`
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;
