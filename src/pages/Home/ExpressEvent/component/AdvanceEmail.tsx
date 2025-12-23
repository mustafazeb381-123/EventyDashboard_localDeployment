import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronLeft,
  X,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-75">
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    removeToast,
    success: (message) => addToast(message, "success"),
    error: (message) => addToast(message, "error"),
    warning: (message) => addToast(message, "warning"),
    info: (message) => addToast(message, "info"),
  };
};

const CustomEmailEditor = ({ initialContent, onClose, onSave }) => {
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const editorRef = useRef(null);

  const applyHtmlToEditor = (html) => {
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  };

  useEffect(() => {
    if (initialContent) {
      setSubject(initialContent.subject || "");
      const incomingBody =
        initialContent.body || initialContent.bodyHtml || "<p></p>";
      setBodyHtml(incomingBody);
      applyHtmlToEditor(incomingBody);
    } else {
      setSubject("");
      setBodyHtml("<p></p>");
      applyHtmlToEditor("<p></p>");
    }
  }, [initialContent]);

  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setBodyHtml(editorRef.current.innerHTML);
  };

  const isInList = () => {
    if (!editorRef.current) return false;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        if (el.tagName === "UL" || el.tagName === "OL") return true;
      }
      // @ts-ignore: traverse up
      node = node.parentNode;
    }
    return false;
  };

  const setListStyle = (style) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node = selection.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        if (el.tagName === "UL" || el.tagName === "OL") {
          el.style.listStyleType = style;
          return;
        }
      }
      // @ts-ignore: traverse up to parent
      node = node.parentNode;
    }
  };

  const insertTokenLink = (label, token) => {
    const linkHtml = `<a href="${token}" data-token="${token}" style="color:#2563eb;text-decoration:underline;">${label}</a>`;
    execCommand("insertHTML", linkHtml);
  };

  const handleBodyInput = (e) => {
    setBodyHtml(e.currentTarget.innerHTML);
  };

  const convertPlainTextToHtml = (text) => {
    if (!text) return "<p></p>";
    const paragraphs = text.split(/\n\s*\n/).map((block) => {
      const lines = block.split("\n").join("<br>");
      return `<p>${lines}</p>`;
    });
    return paragraphs.join("");
  };

  const suggestions = [
    {
      id: 1,
      text: "We hope you're doing well! 😊\n\nThank you for registering for our upcoming event from 2025-05-10 to 2025-05-30 at 14:13:00 - 17:11:00. We are thrilled to have you join us and look forward to seeing you there.\n\nYou will receive a confirmation email shortly with all the details you need.\n\nSee you soon!",
    },
    {
      id: 2,
      text: "We hope this message finds you well! 😊\n\nThank you for signing up for our upcoming event scheduled from May 10 to May 30, 2025, between 2:13 PM and 5:11 PM. We're excited to have you with us and can't wait to see you there.",
    },
    {
      id: 3,
      text: "We hope this message finds you well! 😊\n\nThank you for signing up for our upcoming event scheduled from May 10 to May 30, 2025, between 2:13 PM and 5:11 PM. We're excited to have you with us and can't wait to see you there.\n\nA confirmation email will be sent to you soon, containing all the necessary information.\n\nLooking forward to your participation!",
    },
    {
      id: 4,
      text: "We hope you're doing great! 😊\n\nThanks for signing up for our exciting event happening from May 10 to May 30, 2025, between 2:13 PM and 5:11 PM. We can't wait to see you there!",
    },
  ];

  const handleSuggestionClick = (suggestion) => {
    const htmlBody = convertPlainTextToHtml(suggestion.text);
    setBodyHtml(htmlBody);
    setSelectedSuggestion(suggestion.id);
    applyHtmlToEditor(htmlBody);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleSave = () => {
    const safeBody = bodyHtml || "<p></p>";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background:#f7f7f7; }
    .email-container { max-width: 620px; margin: 0 auto; background:#ffffff; padding:24px; border-radius:12px; box-shadow:0 12px 35px rgba(0,0,0,0.05); }
    h2 { color: #1f2937; margin:0 0 12px; font-size:20px; }
    p { color: #4b5563; line-height: 1.6; }
    a { color:#2563eb; }
  </style>
</head>
<body>
  <div class="email-container">
    <h2>${subject}</h2>
    <div>${safeBody}</div>
  </div>
</body>
</html>
    `.trim();

    const design = { subject, body: safeBody };
    onSave(design, html);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b bg-white">
        <h1 className="text-3xl font-bold text-gray-900">Create thanks email</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Editor */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl">
            {/* Email Subject */}
            <div className="mb-6">
              <label className="block text-base font-normal text-gray-900 mb-3">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="text here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-base font-normal text-gray-900 mb-3">
                Email Body
              </label>
              <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden bg-white">
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 text-sm text-gray-700">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => execCommand("bold")}
                      className="px-2 py-1 rounded hover:bg-gray-200 font-semibold"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("italic")}
                      className="px-2 py-1 rounded hover:bg-gray-200 italic"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("underline")}
                      className="px-2 py-1 rounded hover:bg-gray-200 underline"
                      title="Underline"
                    >
                      U
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("removeFormat")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Clear formatting"
                    >
                      Tx
                    </button>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => execCommand("undo")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Undo"
                    >
                      ↶
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("redo")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Redo"
                    >
                      ↷
                    </button>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => execCommand("justifyLeft")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Align left"
                    >
                      ⬅
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("justifyCenter")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Align center"
                    >
                      ⬍
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("justifyRight")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Align right"
                    >
                      ➡
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("justifyFull")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Justify"
                    >
                      ☰
                    </button>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => execCommand("insertUnorderedList")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Bullet list"
                    >
                      ••
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("insertOrderedList")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Numbered list"
                    >
                      1.
                    </button>
                    <button
                      type="button"
                      onClick={() => setListStyle("disc")}
                      className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
                      title="Bullet: Disc"
                    >
                      •
                    </button>
                    <button
                      type="button"
                      onClick={() => setListStyle("circle")}
                      className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
                      title="Bullet: Circle"
                    >
                      ○
                    </button>
                    <button
                      type="button"
                      onClick={() => setListStyle("square")}
                      className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
                      title="Bullet: Square"
                    >
                      ◼
                    </button>
                    <button
                      type="button"
                      onClick={() => setListStyle("decimal")}
                      className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
                      title="Numbered: 1,2,3"
                    >
                      1⋯
                    </button>
                    <button
                      type="button"
                      onClick={() => setListStyle("lower-alpha")}
                      className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
                      title="Numbered: a,b,c"
                    >
                      a⋯
                    </button>
                    <button
                      type="button"
                      onClick={() => setListStyle("lower-roman")}
                      className="px-2 py-1 rounded hover:bg-gray-200 text-xs"
                      title="Numbered: i, ii, iii"
                    >
                      i⋯
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("outdent")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Outdent"
                    >
                      ⇤
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("indent")}
                      className="px-2 py-1 rounded hover:bg-gray-200"
                      title="Indent"
                    >
                      ⇥
                    </button>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => insertTokenLink("Insert Unique Link", "{{unique_link}}")}
                      className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-medium"
                    >
                      Insert Unique Link
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertTokenLink(
                          "Insert Confirm Attendance Link",
                          "{{confirm_attendance_link}}"
                        )
                      }
                      className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-medium"
                    >
                      Insert Confirm Attendance Link
                    </button>
                  </div>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleBodyInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && isInList()) {
                      e.preventDefault();
                      execCommand("insertHTML", "<li><br></li>");
                    }
                  }}
                  className="w-full min-h-[320px] px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="max-w-4xl mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus size={20} />
              Add Email
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Add & Use Email
              <span className="ml-2">→</span>
            </button>
          </div>
        </div>

        {/* Right Side - Suggestions */}
        <div className="w-96 bg-gray-50 border-l overflow-y-auto p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-purple-500">✨</div>
            <h2 className="text-base font-medium text-gray-900">
              Suggestion Body text
            </h2>
          </div>

          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedSuggestion === suggestion.id
                    ? "bg-white border-2 border-pink-500"
                    : "bg-white border border-gray-200 hover:border-pink-300"
                }`}
              >
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {suggestion.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const apiService = {
  templates: {},

  async getTemplates(eventId, flowType) {
    console.log("Mock API: Fetching templates for", flowType);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const storageKey = `${eventId}_${flowType}`;
    return this.templates[storageKey] || [];
  },

  async saveTemplate(eventId, flowType, html, design) {
    console.log("Mock API: Saving template for", flowType);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const storageKey = `${eventId}_${flowType}`;
    const existingTemplates = this.templates[storageKey] || [];

    const newTemplate = {
      id: Date.now(),
      attributes: {
        content: html,
        design: JSON.stringify(design),
        type: this.getTypeParam(flowType),
        default: false,
        created_at: new Date().toISOString(),
      },
    };

    this.templates[storageKey] = [...existingTemplates, newTemplate];

    return {
      data: newTemplate,
      message: "Template saved successfully!",
    };
  },

  async updateTemplate(eventId, templateId, flowType, html, design) {
    console.log("Mock API: Updating template for", flowType);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const storageKey = `${eventId}_${flowType}`;
    const existingTemplates = this.templates[storageKey] || [];

    const updatedTemplates = existingTemplates.map((template) =>
      template.id.toString() === templateId.toString()
        ? {
            ...template,
            attributes: {
              ...template.attributes,
              content: html,
              design: JSON.stringify(design),
              updated_at: new Date().toISOString(),
            },
          }
        : template
    );

    this.templates[storageKey] = updatedTemplates;

    const updatedTemplate = updatedTemplates.find(
      (t) => t.id.toString() === templateId.toString()
    );
    return {
      data: updatedTemplate,
      message: "Template updated successfully!",
    };
  },

  async deleteTemplate(eventId, templateId, flowType) {
    console.log("Mock API: Deleting template from", flowType);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const storageKey = `${eventId}_${flowType}`;
    const existingTemplates = this.templates[storageKey] || [];

    this.templates[storageKey] = existingTemplates.filter(
      (template) => template.id.toString() !== templateId.toString()
    );

    return {
      success: true,
      message: "Template deleted successfully",
    };
  },

  getTypeParam(flowType) {
    const typeMap = {
      thanks: "ConfirmationThanksTemplate",
      confirmation: "ConfirmationRegisterTemplate",
      reminder: "ConfirmationReminderTemplate",
      rejection: "ConfirmationRejectionTemplate",
    };
    return typeMap[flowType] || "ConfirmationThanksTemplate";
  },

  convertApiTemplates(apiTemplates, flowType) {
    return apiTemplates.map((template, index) => {
      let designData = { blocks: [] };
      try {
        if (template.attributes?.design) {
          designData = JSON.parse(template.attributes.design);
        }
      } catch (error) {
        console.error("Error parsing design data:", error);
      }

      return {
        id: `api-${template.id}`,
        title: `${
          flowType.charAt(0).toUpperCase() + flowType.slice(1)
        } Template ${index + 1}`,
        design: designData,
        html: template.attributes?.content || "",
        apiId: template.id,
        type: template.attributes?.type || flowType,
      };
    });
  },
};

const TemplateModal = ({ template, onClose, onSelect, onEdit, onDelete }) => {
  if (!template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">{template.title}</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(template)}
              className="flex items-center gap-2 bg-pink-500 text-white px-3 py-1.5 rounded-lg hover:bg-pink-600 transition shadow-sm"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(template)}
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition shadow-sm"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="border rounded-lg p-4 bg-gray-50">
            {template.html ? (
              <div dangerouslySetInnerHTML={{ __html: template.html }} />
            ) : (
              <div className="text-gray-400 text-center py-8">
                No preview available
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onSelect(template.id)}
          className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors font-medium"
        >
          Choose this template
        </button>
      </div>
    </div>
  );
};

const AdvanceEmail = ({ onNext, onPrevious, eventId }) => {
  const effectiveEventId = eventId || "demo-event-123";
  const toast = useToast();

  const [flows, setFlows] = useState([
    { id: "thanks", label: "Thanks Email", templates: [] },
    { id: "confirmation", label: "Confirmation Email", templates: [] },
    { id: "reminder", label: "Reminder Email", templates: [] },
    { id: "rejection", label: "Rejection Email", templates: [] },
  ]);

  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);
  const [selectedTemplates, setSelectedTemplates] = useState({});
  const [modalTemplate, setModalTemplate] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
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

      setFlows((prevFlows) =>
        prevFlows.map((flow) =>
          flow.id === currentFlow.id
            ? { ...flow, templates: convertedTemplates }
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

  const handleOpenModal = (template) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates({
      ...selectedTemplates,
      [currentFlow.id]: templateId,
    });
    setModalTemplate(null);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setModalTemplate(null);
    setIsEditorOpen(true);
  };

  const handleCreateNewTemplate = () => {
    setIsCreatingNew(true);
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = async (template) => {
    if (!effectiveEventId || !template.apiId) {
      console.error(
        "Cannot delete template: Missing eventId or template API ID"
      );
      toast.error("Cannot delete template: Missing required data.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${template.title}"?`
    );
    if (!confirmed) return;

    proceedWithDelete(template);
  };

  const proceedWithDelete = async (template) => {
    setIsLoading(true);
    try {
      await apiService.deleteTemplate(
        effectiveEventId,
        template.apiId,
        currentFlow.id
      );

      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.filter((tpl) => tpl.id !== template.id),
        }))
      );

      if (selectedTemplates[currentFlow.id] === template.id) {
        setSelectedTemplates((prev) => {
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

  const handleSaveNewTemplate = async (design, html) => {
    if (!isCreatingNew || !effectiveEventId) return;

    setIsLoading(true);
    try {
      const apiResponse = await apiService.saveTemplate(
        effectiveEventId,
        currentFlow.id,
        html,
        design
      );

      const newTemplate = {
        id: `custom-${Date.now()}`,
        title: `Custom ${currentFlow.label} Template`,
        design,
        html,
        apiId: apiResponse.data?.id,
        type: currentFlow.id,
      };

      setFlows((prevFlows) =>
        prevFlows.map((flow) =>
          flow.id === currentFlow.id
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

  const handleUpdateTemplate = async (design, html) => {
    if (!editingTemplate || !effectiveEventId || !editingTemplate.apiId) {
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
        design
      );

      setFlows((prevFlows) =>
        prevFlows.map((flow) => ({
          ...flow,
          templates: flow.templates.map((tpl) =>
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

  const handleSaveFromEditor = async (design, html) => {
    if (isCreatingNew) {
      await handleSaveNewTemplate(design, html);
    } else {
      await handleUpdateTemplate(design, html);
    }
  };

  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) {
      toast.warning("Please select a template before proceeding");
      return;
    }

    if (currentFlowIndex < flows.length - 1) {
      setCurrentFlowIndex(currentFlowIndex + 1);
    } else if (onNext) {
      if (effectiveEventId) {
        onNext(effectiveEventId);
      } else {
        onNext();
      }
      toast.success("All email templates configured successfully!");
    }
  };

  const handleBack = () => {
    if (currentFlowIndex > 0) {
      setCurrentFlowIndex(currentFlowIndex - 1);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleStepClick = (index) => {
    const isCompleted = selectedTemplates[flows[index].id];
    const isCurrentOrPrevious = index <= currentFlowIndex;

    if (isCompleted || isCurrentOrPrevious) {
      setCurrentFlowIndex(index);
    }
  };

  const allStepsCompleted = flows.every((flow) => selectedTemplates[flow.id]);

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm relative">
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            {currentFlow.label}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {flows.map((flow, index) => {
            const isCompleted = Boolean(selectedTemplates[flow.id]);
            const isActive = index === currentFlowIndex;
            const isAccessible = index <= currentFlowIndex || isCompleted;

            return (
              <div key={flow.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? "bg-pink-500 border-pink-500 cursor-pointer"
                      : isActive
                      ? "border-pink-500 bg-white cursor-pointer"
                      : "border-gray-300 bg-white cursor-not-allowed"
                  } ${isAccessible ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-pink-500" : "text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                </button>

                {index !== flows.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      selectedTemplates[flow.id] ? "bg-pink-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            onClick={handleCreateNewTemplate}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="text-pink-500" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 text-center text-pink-500">
              Create New Template
            </h3>
            <p className="text-sm text-gray-500 text-center">
              Design a custom email template
            </p>
          </div>

          {currentFlow.templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => handleOpenModal(tpl)}
              className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md aspect-square flex flex-col relative group ${
                selectedTemplates[currentFlow.id] === tpl.id
                  ? "border-pink-500 bg-pink-50 shadow-md"
                  : "border-gray-200 hover:border-pink-300"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTemplate(tpl);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                title="Delete template"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                {tpl.html ? (
                  <div className="w-full h-full transform origin-top-left">
                    <div dangerouslySetInnerHTML={{ __html: tpl.html }} />
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No preview</div>
                )}
              </div>
              <div className="mt-3">
                <h3 className="font-medium text-gray-900 text-center">
                  {tpl.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalTemplate && (
        <TemplateModal
          template={modalTemplate}
          onClose={handleCloseModal}
          onSelect={handleSelectTemplate}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
        />
      )}

      {isEditorOpen && (
        <CustomEmailEditor
          initialContent={editingTemplate?.design || null}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingTemplate(null);
            setIsCreatingNew(false);
          }}
          onSave={handleSaveFromEditor}
        />
      )}

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          disabled={currentFlowIndex === 0 && !onPrevious}
          className={`cursor-pointer px-6 py-2 border rounded-lg transition-colors ${
            currentFlowIndex === 0 && !onPrevious
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentFlowIndex + 1} of {flows.length}
          {allStepsCompleted && " - All steps completed!"}
        </span>

        <button
          onClick={handleNext}
          disabled={!selectedTemplates[currentFlow.id] || isLoading}
          className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
            selectedTemplates[currentFlow.id] && !isLoading
              ? "bg-slate-800 hover:bg-slate-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {currentFlowIndex === flows.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
};

export default AdvanceEmail;