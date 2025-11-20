import React, { useState, useEffect } from "react";
import {
  Check,
  ChevronLeft,
  X,
  Pencil,
  Plus,
  Trash2,
  Type,
  AlignLeft,
  Square,
  Layout,
  Code,
  Image,
  QrCode,
} from "lucide-react";
import QRCode from "react-qr-code";

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
  const [blocks, setBlocks] = useState(initialContent || []);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [showCodeView, setShowCodeView] = useState(false);

  const blockTypes = [
    { type: "text", icon: Type, label: "Text" },
    { type: "heading", icon: AlignLeft, label: "Heading" },
    { type: "image", icon: Image, label: "Image" },
    { type: "button", icon: Square, label: "Button" },
    { type: "divider", icon: Layout, label: "Divider" },
    { type: "spacer", icon: Layout, label: "Spacer" },
    { type: "qrCode", icon: QrCode, label: "QR Code" },
  ];

  const createBlock = (type) => {
    const baseBlock = {
      id: Date.now().toString(),
      type,
    };

    switch (type) {
      case "text":
        return {
          ...baseBlock,
          content: "Enter your text here...",
          fontSize: 16,
          color: "#000000",
          align: "left",
        };
      case "heading":
        return {
          ...baseBlock,
          content: "Heading Text",
          fontSize: 24,
          color: "#000000",
          align: "left",
          fontWeight: "bold",
        };
      case "image":
        return {
          ...baseBlock,
          src: "",
          alt: "Image",
          width: "100%",
          align: "center",
        };
      case "button":
        return {
          ...baseBlock,
          text: "Click Here",
          link: "#",
          bgColor: "#ec4899",
          textColor: "#ffffff",
          align: "center",
          borderRadius: 8,
        };
      case "divider":
        return { ...baseBlock, color: "#e5e7eb", height: 1 };
      case "spacer":
        return { ...baseBlock, height: 20 };
      case "qrCode":
        return {
          ...baseBlock,
          qrValue: "https://example.com",
          size: 128,
          align: "center",
          bgColor: "#FFFFFF",
          fgColor: "#000000",
          includeMargin: false,
        };
      default:
        return baseBlock;
    }
  };

  const addBlock = (type) => {
    const newBlock = createBlock(type);
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id, updates) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (id) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  const moveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    setBlocks(newBlocks);
  };

  const handleDragStart = (e, index) => {
    setDraggedBlock(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedBlock === null || draggedBlock === index) return;
    moveBlock(draggedBlock, index);
    setDraggedBlock(index);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  const generateHTML = () => {
    let html =
      '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style>\n    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }\n    .email-container { max-width: 600px; margin: 0 auto; paddingHorizontal: 20px; }\n  </style>\n</head>\n<body>\n  <div class="email-container">\n';

    blocks.forEach((block) => {
      switch (block.type) {
        case "text":
          html += `    <p style="font-size: ${block.fontSize}px; color: ${block.color}; text-align: ${block.align}; margin: 10px 0;">${block.content}</p>\n`;
          break;
        case "heading":
          html += `    <h2 style="font-size: ${block.fontSize}px; color: ${block.color}; text-align: ${block.align}; font-weight: ${block.fontWeight}; margin: 15px 0;">${block.content}</h2>\n`;
          break;
        case "image":
          if (block.src) {
            html += `    <div style="text-align: ${block.align}; margin: 15px 0;"><img src="${block.src}" alt="${block.alt}" style="max-width: ${block.width}; height: auto;" /></div>\n`;
          }
          break;
        case "button":
          html += `    <div style="text-align: ${block.align}; margin: 20px 0;"><a href="${block.link}" style="display: inline-block; padding: 12px 24px; background-color: ${block.bgColor}; color: ${block.textColor}; text-decoration: none; border-radius: ${block.borderRadius}px;">${block.text}</a></div>\n`;
          break;
        case "divider":
          html += `    <hr style="border: none; border-top: ${block.height}px solid ${block.color}; margin: 20px 0;" />\n`;
          break;
        case "spacer":
          html += `    <div style="height: ${block.height}px;"></div>\n`;
          break;
        case "qrCode":
          // Generate QR code as SVG and embed directly in HTML
          const qrSvg = `
            <svg width="${block.size}" height="${block.size}" viewBox="0 0 256 256" fill="${block.fgColor}">
              <!-- QR Code would be generated here - this is a placeholder -->
              <rect width="256" height="256" fill="${block.bgColor}"/>
              <text x="128" y="128" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="${block.fgColor}">QR Code</text>
              <text x="128" y="150" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="8" fill="${block.fgColor}">${block.qrValue}</text>
            </svg>
          `.replace(/\n\s*/g, " "); // Remove extra whitespace

          html += `    <div style="text-align: ${block.align}; margin: 20px 0;">${qrSvg}</div>\n`;
          break;
      }
    });

    html += "  </div>\n</body>\n</html>";
    return html;
  };

  const handleSave = () => {
    const html = generateHTML();
    const design = { blocks };
    onSave(design, html);
  };

  const renderBlock = (block, index) => {
    const isSelected = selectedBlock === block.id;

    return (
      <div
        key={block.id}
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        onClick={() => setSelectedBlock(block.id)}
        className={`relative p-4 mb-2 rounded-lg cursor-move transition-all ${
          isSelected ? "bg-pink-50" : "border-gray-20"
        }`}
      >
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteBlock(block.id);
            }}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {block.type === "text" && (
          <div>
            <textarea
              value={block.content}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              className="w-full p-2 rounded resize-none"
              rows={3}
              style={{
                fontSize: `${block.fontSize}px`,
                color: block.color,
                textAlign: block.align,
              }}
            />
          </div>
        )}

        {block.type === "heading" && (
          <div>
            <input
              type="text"
              value={block.content}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              className="w-full p-2 rounded"
              style={{
                fontSize: `${block.fontSize}px`,
                color: block.color,
                textAlign: block.align,
                fontWeight: block.fontWeight,
              }}
            />
          </div>
        )}

        {block.type === "image" && (
          <div className="space-y-2">
            <input
              type="text"
              value={block.src}
              onChange={(e) => updateBlock(block.id, { src: e.target.value })}
              placeholder="Image URL"
              className="w-full p-2 rounded text-sm"
            />
            {block.src && (
              <div style={{ textAlign: block.align }}>
                <img
                  src={block.src}
                  alt={block.alt}
                  style={{ maxWidth: block.width, height: "auto" }}
                />
              </div>
            )}
          </div>
        )}

        {block.type === "button" && (
          <div className="space-y-2">
            <input
              type="text"
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              placeholder="Button Text"
              className="w-full p-2 rounded text-sm"
            />
            <input
              type="text"
              value={block.link}
              onChange={(e) => updateBlock(block.id, { link: e.target.value })}
              placeholder="Button Link"
              className="w-full p-2 rounded text-sm"
            />
            <div style={{ textAlign: block.align }}>
              <a
                href={block.link}
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: block.bgColor,
                  color: block.textColor,
                  textDecoration: "none",
                  borderRadius: `${block.borderRadius}px`,
                }}
              >
                {block.text}
              </a>
            </div>
          </div>
        )}

        {block.type === "divider" && (
          <hr
            style={{
              border: "none",
              borderTop: `${block.height}px solid ${block.color}`,
              margin: "10px 0",
            }}
          />
        )}

        {block.type === "spacer" && (
          <div
            style={{ height: `${block.height}px`, backgroundColor: "#f3f4f6" }}
          />
        )}

        {block.type === "qrCode" && (
          <div className="space-y-2">
            <input
              type="text"
              value={block.qrValue}
              onChange={(e) =>
                updateBlock(block.id, { qrValue: e.target.value })
              }
              placeholder="QR Code Content (URL, text, etc.)"
              className="w-full p-2 rounded text-sm"
            />
            <div style={{ textAlign: block.align }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "10px",
                  backgroundColor: block.bgColor,
                  borderRadius: "8px",
                }}
              >
                <QRCode
                  value={block.qrValue}
                  size={block.size}
                  bgColor={block.bgColor}
                  fgColor={block.fgColor}
                  level="Q"
                  includeMargin={block.includeMargin}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPropertyPanel = () => {
    const block = blocks.find((b) => b.id === selectedBlock);
    if (!block) return null;

    return (
      <div className="bg-white p-4 border-l h-full overflow-y-auto">
        <h3 className="font-semibold mb-4 text-gray-800">Properties</h3>

        {(block.type === "text" || block.type === "heading") && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={block.fontSize}
                onChange={(e) =>
                  updateBlock(block.id, { fontSize: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                value={block.color}
                onChange={(e) =>
                  updateBlock(block.id, { color: e.target.value })
                }
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Alignment
              </label>
              <select
                value={block.align}
                onChange={(e) =>
                  updateBlock(block.id, { align: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        )}

        {block.type === "image" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <input
                type="text"
                value={block.width}
                onChange={(e) =>
                  updateBlock(block.id, { width: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="e.g., 100%, 300px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alt Text</label>
              <input
                type="text"
                value={block.alt}
                onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Alignment
              </label>
              <select
                value={block.align}
                onChange={(e) =>
                  updateBlock(block.id, { align: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        )}

        {block.type === "button" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={block.bgColor}
                onChange={(e) =>
                  updateBlock(block.id, { bgColor: e.target.value })
                }
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={block.textColor}
                onChange={(e) =>
                  updateBlock(block.id, { textColor: e.target.value })
                }
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Border Radius
              </label>
              <input
                type="number"
                value={block.borderRadius}
                onChange={(e) =>
                  updateBlock(block.id, {
                    borderRadius: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Alignment
              </label>
              <select
                value={block.align}
                onChange={(e) =>
                  updateBlock(block.id, { align: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        )}

        {block.type === "divider" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                value={block.color}
                onChange={(e) =>
                  updateBlock(block.id, { color: e.target.value })
                }
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                type="number"
                value={block.height}
                onChange={(e) =>
                  updateBlock(block.id, { height: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}

        {block.type === "spacer" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                type="number"
                value={block.height}
                onChange={(e) =>
                  updateBlock(block.id, { height: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}

        {block.type === "qrCode" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                QR Code Content
              </label>
              <input
                type="text"
                value={block.qrValue}
                onChange={(e) =>
                  updateBlock(block.id, { qrValue: e.target.value })
                }
                className="w-full p-2 border rounded text-sm"
                placeholder="Enter URL, text, or data for QR code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <input
                type="number"
                value={block.size}
                onChange={(e) =>
                  updateBlock(block.id, { size: parseInt(e.target.value) })
                }
                className="w-full p-2 border rounded"
                min="64"
                max="256"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={block.bgColor}
                onChange={(e) =>
                  updateBlock(block.id, { bgColor: e.target.value })
                }
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Foreground Color
              </label>
              <input
                type="color"
                value={block.fgColor}
                onChange={(e) =>
                  updateBlock(block.id, { fgColor: e.target.value })
                }
                className="w-full h-10 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Alignment
              </label>
              <select
                value={block.align}
                onChange={(e) =>
                  updateBlock(block.id, { align: e.target.value })
                }
                className="w-full p-2 border rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeMargin"
                checked={block.includeMargin}
                onChange={(e) =>
                  updateBlock(block.id, { includeMargin: e.target.checked })
                }
                className="mr-2"
              />
              <label htmlFor="includeMargin" className="text-sm font-medium">
                Include Margin
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl rounded-2xl shadow-lg overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Edit Email Template
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCodeView(!showCodeView)}
              className={`p-2 rounded-lg flex items-center gap-2 ${
                showCodeView ? "bg-pink-100 text-pink-600" : "hover:bg-gray-200"
              }`}
            >
              <Code size={20} />
              <span className="text-sm">
                {showCodeView ? "Editor" : "Code"}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {!showCodeView ? (
            <>
              <div className="w-48 bg-gray-50 p-4 overflow-y-auto border-r">
                <h3 className="font-semibold mb-4 text-gray-800">Blocks</h3>
                <div className="space-y-2">
                  {blockTypes.map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      className="w-full flex items-center gap-2 p-3 bg-white border rounded-lg hover:bg-pink-50 hover:border-pink-300 transition-colors"
                    >
                      <Icon size={18} className="text-gray-600" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                  {blocks.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Layout size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Add blocks from the left panel</p>
                    </div>
                  ) : (
                    blocks.map((block, index) => renderBlock(block, index))
                  )}
                </div>
              </div>

              <div className="w-64">
                {selectedBlock ? (
                  renderPropertyPanel()
                ) : (
                  <div className="p-4 text-gray-400 text-sm">
                    Select a block to edit properties
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 p-4 overflow-auto">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-auto h-full">
                <code>{generateHTML()}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="p-3 border-t flex justify-end gap-2 bg-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

// Updated apiService without static templates
const apiService = {
  getAuthToken() {
    return "mock-token-for-development";
  },

  async getTemplates(eventId, flowType) {
    console.log("Mock API: Fetching templates for", flowType);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get templates from localStorage for this specific flow type
    const storageKey = `templates_${eventId}_${flowType}`;
    const storedTemplates = localStorage.getItem(storageKey);

    if (storedTemplates) {
      return JSON.parse(storedTemplates);
    }

    // Return empty array - no static templates
    return [];
  },

  async saveTemplate(eventId, flowType, html, design) {
    console.log("Mock API: Saving template for", flowType);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Get existing templates for this specific flow type
    const storageKey = `templates_${eventId}_${flowType}`;
    const existingTemplates = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

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

    // Save back to localStorage for this specific flow type
    const updatedTemplates = [...existingTemplates, newTemplate];
    localStorage.setItem(storageKey, JSON.stringify(updatedTemplates));

    return {
      data: newTemplate,
      message: "Template saved successfully!",
    };
  },

  async updateTemplate(eventId, templateId, flowType, html, design) {
    console.log("Mock API: Updating template for", flowType);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Get templates for this specific flow type
    const storageKey = `templates_${eventId}_${flowType}`;
    const existingTemplates = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

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

    localStorage.setItem(storageKey, JSON.stringify(updatedTemplates));

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

    // Get templates for this specific flow type
    const storageKey = `templates_${eventId}_${flowType}`;
    const existingTemplates = JSON.parse(
      localStorage.getItem(storageKey) || "[]"
    );

    const filteredTemplates = existingTemplates.filter(
      (template) => template.id.toString() !== templateId.toString()
    );

    localStorage.setItem(storageKey, JSON.stringify(filteredTemplates));

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

const EmailConfirmation = ({ onNext, onPrevious, eventId }) => {
  const localStorageEventId = localStorage.getItem("create_eventId");
  const effectiveEventId = eventId || localStorageEventId;
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
    // toast.success("Template selected successfully!");
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

  const initialDesign = editingTemplate?.design?.blocks || null;

  const handleNext = () => {
    if (!selectedTemplates[currentFlow.id]) {
      toast.warning("Please select a template before proceeding");
      return;
    }

    if (currentFlowIndex < flows.length - 1) {
      setCurrentFlowIndex(currentFlowIndex + 1);
      // toast.success(`Moving to ${flows[currentFlowIndex + 1].label}`);
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
      // toast.info(`Returning to ${flows[currentFlowIndex - 1].label}`);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleStepClick = (index) => {
    // Allow clicking on any step that has been completed or is the current one
    const isCompleted = selectedTemplates[flows[index].id];
    const isCurrentOrPrevious = index <= currentFlowIndex;

    if (isCompleted || isCurrentOrPrevious) {
      setCurrentFlowIndex(index);
    }
  };

  // Check if all steps are completed
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
          initialContent={initialDesign}
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

export default EmailConfirmation;
