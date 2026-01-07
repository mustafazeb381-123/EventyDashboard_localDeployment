// import React, { useState, useRef } from "react";
// import {
//   DndContext,
//   DragOverlay,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import {
//   Save,
//   Eye,
//   EyeOff,
//   Palette as PaletteIcon,
//   Image as ImageIcon,
//   X,
//   FileJson,
//   Upload,
//   Download,
//   Code,
// } from "lucide-react";

// // Import extracted components
// import { FieldConfigPanel } from "./CustomFormBuilder/components/FieldConfigPanel";
// import { SortableFieldItem } from "./CustomFormBuilder/components/SortableFieldItem";
// import { FieldPalette } from "./CustomFormBuilder/components/FieldPalette";
// import { ThemeConfigPanel } from "./CustomFormBuilder/components/ThemeConfigPanel";
// import { FormPreview } from "./CustomFormBuilder/components/FormPreview";
// import { DroppableContainer } from "./CustomFormBuilder/components/DroppableContainer";
// import { MainDropZone } from "./CustomFormBuilder/components/MainDropZone";

// // Import types
// import type { CustomFormField, FormTheme } from "./CustomFormBuilder/types";

// interface CustomFormBuilderProps {
//   initialFields?: CustomFormField[];
//   initialBannerImage?: File | string | null;
//   initialTheme?: Partial<FormTheme>;
//   onSave: (
//     fields: CustomFormField[],
//     bannerImage?: File | string,
//     theme?: FormTheme
//   ) => void;
//   onClose: () => void;
// }

// const DEFAULT_FORM_FIELDS: CustomFormField[] = [];

// const CustomFormBuilder: React.FC<CustomFormBuilderProps> = ({
//   initialFields = [],
//   initialBannerImage = null,
//   initialTheme,
//   onSave,
//   onClose,
// }) => {
//   const [fields, setFields] = useState<CustomFormField[]>(
//     initialFields.length > 0 ? initialFields : DEFAULT_FORM_FIELDS
//   );
//   const [editingField, setEditingField] = useState<CustomFormField | null>(
//     null
//   );
//   const [showPreview, setShowPreview] = useState(false);
//   const [showThemePanel, setShowThemePanel] = useState(false);
//   const [showJsonEditor, setShowJsonEditor] = useState(false);
//   const [jsonEditorContent, setJsonEditorContent] = useState("");
//   const [showJsonMenu, setShowJsonMenu] = useState(false);
//   const [deleteCandidate, setDeleteCandidate] =
//     useState<CustomFormField | null>(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [bannerImage, setBannerImage] = useState<File | string | null>(
//     initialBannerImage
//   );
//   const [bannerPreview, setBannerPreview] = useState<string | null>(
//     typeof initialBannerImage === "string" ? initialBannerImage : null
//   );
//   const bannerInputRef = useRef<HTMLInputElement>(null);

//   // Logo states
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);
//   const logoInputRef = useRef<HTMLInputElement>(null);

//   const [theme, setTheme] = useState<FormTheme>({
//     formBackgroundColor: "#ffffff",
//     formPadding: "24px",
//     formBorderRadius: "8px",
//     formBorderColor: "#e5e7eb",
//     formBorderWidth: "1px",
//     headingColor: "#111827",
//     headingFontSize: "24px",
//     headingFontWeight: "bold",
//     labelColor: "#374151",
//     labelFontSize: "14px",
//     labelFontWeight: "600",
//     textColor: "#111827",
//     textFontSize: "16px",
//     descriptionColor: "#6b7280",
//     descriptionFontSize: "12px",
//     inputBackgroundColor: "#ffffff",
//     inputBorderColor: "#d1d5db",
//     inputBorderWidth: "1px",
//     inputBorderRadius: "6px",
//     inputTextColor: "#111827",
//     inputPlaceholderColor: "#9ca3af",
//     inputFocusBorderColor: "#3b82f6",
//     inputFocusBackgroundColor: "#ffffff",
//     inputPadding: "10px 16px",
//     buttonBackgroundColor: "#3b82f6",
//     buttonTextColor: "#ffffff",
//     buttonBorderColor: "#3b82f6",
//     buttonBorderRadius: "6px",
//     buttonPadding: "12px 24px",
//     buttonHoverBackgroundColor: "#2563eb",
//     buttonHoverTextColor: "#ffffff",
//     footerEnabled: false,
//     footerText: "",
//     footerTextColor: "#6b7280",
//     footerBackgroundColor: "#f9fafb",
//     footerPadding: "16px",
//     footerFontSize: "14px",
//     footerAlignment: "center",
//     requiredIndicatorColor: "#ef4444",
//     errorTextColor: "#ef4444",
//     errorBorderColor: "#ef4444",
//     ...initialTheme,
//   });

//   // Load banner preview if initial banner is a file
//   React.useEffect(() => {
//     if (initialBannerImage instanceof File) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBannerPreview(reader.result as string);
//       };
//       reader.readAsDataURL(initialBannerImage);
//     }
//   }, [initialBannerImage]);

//   // Load logo preview from initial theme (string/logo data URL)
//   React.useEffect(() => {
//     if (typeof theme.logo === "string") {
//       setLogoPreview(theme.logo);
//     } else if (!theme.logo) {
//       setLogoPreview(null);
//     }
//   }, [theme.logo]);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   const [activeId, setActiveId] = useState<string | null>(null);
//   const [draggedPreset, setDraggedPreset] = useState<any>(null);

//   const handleDragStart = (event: { active: any }) => {
//     setActiveId(event.active.id);
//     if (event.active.data?.current?.type === "palette-item") {
//       setDraggedPreset(event.active.data.current.preset);
//     }
//     document.body.style.cursor = "grabbing";
//   };

//   const handleDragEnd = (event: { active: any; over: any }) => {
//     const { active, over } = event;
//     setActiveId(null);
//     setDraggedPreset(null);

//     document.body.style.cursor = "";
//     document.querySelectorAll("[data-field-id]").forEach((el) => {
//       el.classList.remove("ring-2", "ring-blue-400");
//     });
//     document.querySelectorAll("[data-container-id]").forEach((el) => {
//       el.classList.remove("ring-2", "ring-purple-400", "bg-purple-100");
//     });
//     document.querySelectorAll("[data-drop-zone]").forEach((el) => {
//       el.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
//     });

//     if (!over) {
//       if (active.data?.current?.type === "palette-item") {
//         const newField = active.data.current.createField();
//         setFields([...fields, newField]);
//       }
//       return;
//     }

//     const overId: string = over.id;
//     const getContainerIdFromOverId = (id: string) =>
//       id.startsWith("container:") ? id.replace("container:", "") : null;

//     const findParentContainerId = (
//       fieldId: string,
//       inFields: CustomFormField[]
//     ) => inFields.find((f) => f.children?.includes(fieldId))?.id || null;

//     const isDescendant = (
//       ancestorId: string,
//       possibleDescendantId: string,
//       inFields: CustomFormField[]
//     ) => {
//       const ancestor = inFields.find((f) => f.id === ancestorId);
//       if (!ancestor?.children?.length) return false;
//       const queue = [...ancestor.children];
//       const visited = new Set<string>();
//       while (queue.length) {
//         const current = queue.shift()!;
//         if (current === possibleDescendantId) return true;
//         if (visited.has(current)) continue;
//         visited.add(current);
//         const node = inFields.find((f) => f.id === current);
//         if (node?.children?.length) queue.push(...node.children);
//       }
//       return false;
//     };

//     if (active.data?.current?.type === "palette-item") {
//       const newField = active.data.current.createField();

//       if (overId === "main-drop-zone") {
//         setFields([...fields, newField]);
//         return;
//       }

//       const containerTargetId = getContainerIdFromOverId(overId);
//       if (containerTargetId) {
//         setFields((prevFields) => {
//           const updated = prevFields.map((f) =>
//             f.id === containerTargetId
//               ? { ...f, children: [...(f.children || []), newField.id] }
//               : f
//           );
//           return [...updated, newField];
//         });
//         return;
//       }

//       const overField = fields.find((f) => f.id === overId);
//       if (overField?.containerType) {
//         setFields((prevFields) => {
//           const updated = prevFields.map((f) =>
//             f.id === overId
//               ? { ...f, children: [...(f.children || []), newField.id] }
//               : f
//           );
//           return [...updated, newField];
//         });
//         return;
//       }

//       const overIndex = fields.findIndex((f) => f.id === overId);

//       if (overIndex !== -1) {
//         const updatedFields = [...fields];
//         updatedFields.splice(overIndex + 1, 0, newField);
//         setFields(updatedFields);
//       } else {
//         setFields([...fields, newField]);
//       }
//       return;
//     }

//     // Existing field drag
//     if (active.id !== overId) {
//       const activeIdStr: string = active.id;
//       const containerTargetId = getContainerIdFromOverId(overId);

//       const sourceParentId = findParentContainerId(activeIdStr, fields);

//       // Dropped into a container drop-zone
//       if (containerTargetId) {
//         // Prevent cycles (can't drop a container into itself or its descendants)
//         const activeField = fields.find((f) => f.id === activeIdStr);
//         if (activeField?.containerType) {
//           if (containerTargetId === activeIdStr) return;
//           if (isDescendant(activeIdStr, containerTargetId, fields)) return;
//         }

//         setFields((prevFields) => {
//           // Remove from previous parent if needed
//           let next = prevFields.map((f) =>
//             f.children?.includes(activeIdStr)
//               ? {
//                   ...f,
//                   children: f.children.filter((id) => id !== activeIdStr),
//                 }
//               : f
//           );

//           // Add to target container
//           next = next.map((f) =>
//             f.id === containerTargetId
//               ? {
//                   ...f,
//                   children: [...(f.children || []), activeIdStr],
//                 }
//               : f
//           );
//           return next;
//         });
//         return;
//       }

//       // Dropped on main drop zone: detach from parent (move to root)
//       if (overId === "main-drop-zone") {
//         if (!sourceParentId) return;
//         setFields((prevFields) =>
//           prevFields.map((f) =>
//             f.id === sourceParentId
//               ? {
//                   ...f,
//                   children: (f.children || []).filter(
//                     (id) => id !== activeIdStr
//                   ),
//                 }
//               : f
//           )
//         );
//         return;
//       }

//       // Dropped over another field: reorder within the same container if both are siblings
//       const overFieldId = overId;
//       const targetParentId = findParentContainerId(overFieldId, fields);

//       // If dropped over a child inside a container, move into that container (or reorder inside it)
//       if (targetParentId) {
//         const activeField = fields.find((f) => f.id === activeIdStr);
//         if (activeField?.containerType) {
//           if (targetParentId === activeIdStr) return;
//           if (isDescendant(activeIdStr, targetParentId, fields)) return;
//         }

//         setFields((prevFields) => {
//           let next = prevFields;

//           // If moving across containers/root, detach from source parent first
//           next = next.map((f) =>
//             f.children?.includes(activeIdStr)
//               ? {
//                   ...f,
//                   children: f.children.filter((id) => id !== activeIdStr),
//                 }
//               : f
//           );

//           // Insert into target parent's children near the over item
//           next = next.map((f) => {
//             if (f.id !== targetParentId) return f;
//             const children = [...(f.children || [])];
//             const overIndex = children.indexOf(overFieldId);
//             const insertIndex =
//               overIndex === -1 ? children.length : overIndex + 1;

//             if (children.includes(activeIdStr)) {
//               // Reorder within same parent
//               const oldIndex = children.indexOf(activeIdStr);
//               return {
//                 ...f,
//                 children: arrayMove(
//                   children,
//                   oldIndex,
//                   insertIndex > oldIndex ? insertIndex - 1 : insertIndex
//                 ),
//               };
//             }

//             children.splice(insertIndex, 0, activeIdStr);
//             return { ...f, children };
//           });

//           return next;
//         });
//         return;
//       }

//       // Root-level reorder (both are root items)
//       const oldIndex = fields.findIndex((f) => f.id === activeIdStr);
//       const newIndex = fields.findIndex((f) => f.id === overFieldId);
//       if (oldIndex !== -1 && newIndex !== -1) {
//         setFields(arrayMove(fields, oldIndex, newIndex));
//       }
//     }
//   };

//   const handleAddField = (field: CustomFormField) => {
//     setFields([...fields, field]);
//   };

//   const handleEditField = (field: CustomFormField) => {
//     setEditingField(field);
//   };

//   const handleUpdateField = (updatedField: CustomFormField) => {
//     setFields(fields.map((f) => (f.id === updatedField.id ? updatedField : f)));
//     setEditingField(null);
//   };

//   const handleDeleteField = (id: string) => {
//     const fieldToDelete = fields.find((f) => f.id === id) || null;
//     setDeleteCandidate(fieldToDelete);
//     setShowDeleteModal(true);
//   };

//   const confirmDeleteField = () => {
//     if (!deleteCandidate) {
//       setShowDeleteModal(false);
//       return;
//     }

//     const id = deleteCandidate.id;

//     setFields((prevFields) => {
//       const newFields = prevFields.filter((f) => f.id !== id);
//       return newFields.map((f) =>
//         f.children
//           ? { ...f, children: f.children.filter((cId) => cId !== id) }
//           : f
//       );
//     });

//     if (editingField?.id === id) {
//       setEditingField(null);
//     }

//     setShowDeleteModal(false);
//     setDeleteCandidate(null);
//   };

//   const cancelDeleteField = () => {
//     setShowDeleteModal(false);
//     setDeleteCandidate(null);
//   };

//   React.useEffect(() => {
//     if (!showDeleteModal) return;
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         cancelDeleteField();
//       }
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [showDeleteModal]);

//   const handleExportJson = () => {
//     const dataStr = JSON.stringify(
//       {
//         fields,
//         bannerImage: typeof bannerImage === "string" ? bannerImage : null,
//         theme,
//       },
//       null,
//       2
//     );
//     const dataBlob = new Blob([dataStr], { type: "application/json" });
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "form-config.json";
//     link.click();
//     URL.revokeObjectURL(url);
//     setShowJsonMenu(false);
//   };

//   const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         try {
//           const json = JSON.parse(event.target?.result as string);
//           if (json.fields) setFields(json.fields);
//           if (json.bannerImage) {
//             setBannerImage(json.bannerImage);
//             setBannerPreview(json.bannerImage);
//           }
//           if (json.theme) setTheme({ ...theme, ...json.theme });
//           alert("Configuration imported successfully!");
//         } catch (error) {
//           alert("Invalid JSON file");
//         }
//       };
//       reader.readAsText(file);
//     }
//     setShowJsonMenu(false);
//   };

//   const handleViewJson = () => {
//     const jsonData = JSON.stringify(
//       {
//         fields,
//         bannerImage: typeof bannerImage === "string" ? bannerImage : null,
//         theme,
//       },
//       null,
//       2
//     );
//     setJsonEditorContent(jsonData);
//     setShowJsonEditor(true);
//     setShowJsonMenu(false);
//   };

//   const handleApplyJson = () => {
//     try {
//       const json = JSON.parse(jsonEditorContent);
//       if (json.fields) setFields(json.fields);
//       if (json.bannerImage) {
//         setBannerImage(json.bannerImage);
//         setBannerPreview(json.bannerImage);
//       }
//       if (json.theme) setTheme({ ...theme, ...json.theme });
//       setShowJsonEditor(false);
//       alert("JSON applied successfully!");
//     } catch (error) {
//       alert("Invalid JSON format");
//     }
//   };

//   const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         alert("Please select an image file");
//         return;
//       }
//       setBannerImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBannerPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleRemoveBanner = () => {
//     setBannerImage(null);
//     setBannerPreview(null);
//     if (bannerInputRef.current) {
//       bannerInputRef.current.value = "";
//     }
//   };

//   const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         alert("Please select an image file");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setLogoPreview(reader.result as string);
//         setTheme((prev) => ({
//           ...prev,
//           logo: reader.result as string,
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleRemoveLogo = () => {
//     setLogoPreview(null);
//     if (logoInputRef.current) {
//       logoInputRef.current.value = "";
//     }
//     setTheme((prev) => ({
//       ...prev,
//       logo: null,
//     }));
//   };

//   const handleSave = () => {
//     if (fields.length === 0) {
//       alert("Please add at least one field before saving.");
//       return;
//     }
//     onSave(fields, bannerImage || undefined, theme);
//   };

//   React.useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         showJsonMenu &&
//         !(event.target as HTMLElement).closest(".json-menu-container")
//       ) {
//         setShowJsonMenu(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [showJsonMenu]);

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//       onDragOver={(event) => {
//         const rawOverId = event.over?.id as string | undefined;
//         const overId = rawOverId?.startsWith("container:")
//           ? rawOverId.replace("container:", "")
//           : rawOverId;
//         if (overId) {
//           document.querySelectorAll("[data-drop-zone]").forEach((el) => {
//             el.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
//           });
//           document.querySelectorAll("[data-container-id]").forEach((el) => {
//             el.classList.remove("ring-2", "ring-purple-400", "bg-purple-100");
//           });

//           const dropZone = document.querySelector(
//             `[data-drop-zone="${overId}"]`
//           );
//           const container = document.querySelector(
//             `[data-container-id="${overId}"]`
//           );

//           if (dropZone) {
//             (dropZone as HTMLElement).classList.add(
//               "ring-2",
//               "ring-blue-400",
//               "bg-blue-50"
//             );
//           }
//           if (container) {
//             (container as HTMLElement).classList.add(
//               "ring-2",
//               "ring-purple-400",
//               "bg-purple-100"
//             );
//           }
//         }
//       }}
//     >
//       <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-2xl w-full h-[95vh] flex flex-col overflow-hidden">
//           {/* Header */}
//           <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
//             <div>
//               <h2 className="text-2xl font-bold">Custom Form Builder</h2>
//               <p className="text-blue-100 text-sm mt-0.5">
//                 Design your perfect form
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               {/* JSON Menu */}
//               <div className="relative json-menu-container">
//                 <button
//                   onClick={() => setShowJsonMenu(!showJsonMenu)}
//                   className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
//                   title="JSON Options"
//                 >
//                   <FileJson size={20} />
//                 </button>
//                 {showJsonMenu && (
//                   <div className="absolute right-0 top-12 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden z-50 w-48">
//                     <button
//                       onClick={handleViewJson}
//                       className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
//                     >
//                       <Code size={16} />
//                       <span className="text-sm font-medium">View JSON</span>
//                     </button>
//                     <button
//                       onClick={handleExportJson}
//                       className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors border-t border-gray-100"
//                     >
//                       <Download size={16} />
//                       <span className="text-sm font-medium">Export JSON</span>
//                     </button>
//                     <label className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors border-t border-gray-100 cursor-pointer">
//                       <Upload size={16} />
//                       <span className="text-sm font-medium">Import JSON</span>
//                       <input
//                         type="file"
//                         accept=".json"
//                         onChange={handleImportJson}
//                         className="hidden"
//                       />
//                     </label>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={() => setShowPreview(!showPreview)}
//                 className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
//                 title={showPreview ? "Hide Preview" : "Show Preview"}
//               >
//                 {showPreview ? (
//                   <>
//                     <EyeOff size={18} />
//                     <span className="text-sm font-medium">Hide Preview</span>
//                   </>
//                 ) : (
//                   <>
//                     <Eye size={18} />
//                     <span className="text-sm font-medium">Preview</span>
//                   </>
//                 )}
//               </button>
//               <button
//                 onClick={() => setShowThemePanel(!showThemePanel)}
//                 className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
//                 title="Theme Settings"
//               >
//                 <PaletteIcon size={20} />
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
//               >
//                 <Save size={18} />
//                 Save Form
//               </button>
//               <button
//                 onClick={onClose}
//                 className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
//                 title="Close Builder"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex-1 flex overflow-hidden">
//             {/* Left Sidebar - Field Palette */}
//             <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
//               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <PaletteIcon size={18} className="text-blue-600" />
//                 Form Elements
//               </h3>
//               <FieldPalette onAddField={handleAddField} />
//             </div>

//             {/* Main Canvas */}
//             <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-gray-50 to-white">
//               {!showPreview ? (
//                 <div className="max-w-4xl mx-auto space-y-6">
//                   {/* Banner Image Section */}
//                   <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
//                     <div className="p-4 bg-linear-to-r from-purple-50 to-pink-50 border-b border-gray-200">
//                       <div className="flex items-center justify-between">
//                         <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                           <ImageIcon size={18} className="text-purple-600" />
//                           Banner Image
//                         </h3>
//                         {bannerPreview && (
//                           <button
//                             onClick={handleRemoveBanner}
//                             className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
//                           >
//                             Remove
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                     {bannerPreview ? (
//                       <div className="relative w-full h-64 bg-gray-100">
//                         <img
//                           src={bannerPreview}
//                           alt="Banner preview"
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     ) : (
//                       <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
//                         <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
//                         <span className="text-sm font-medium text-gray-600">
//                           Click to upload banner image
//                         </span>
//                         <span className="text-xs text-gray-500 mt-1">
//                           Recommended: 1200x400px
//                         </span>
//                         <input
//                           ref={bannerInputRef}
//                           type="file"
//                           accept="image/*"
//                           onChange={handleBannerImageChange}
//                           className="hidden"
//                         />
//                       </label>
//                     )}
//                   </div>

//                   {/* Logo Section */}
//                   <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
//                     <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
//                       <div className="flex items-center justify-between">
//                         <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                           <ImageIcon size={18} className="text-blue-600" />
//                           Logo
//                         </h3>
//                         {logoPreview && (
//                           <button
//                             onClick={handleRemoveLogo}
//                             className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
//                           >
//                             Remove
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                     <div className="p-4">
//                       {logoPreview ? (
//                         <div className="flex items-start gap-4">
//                           <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
//                             <img
//                               src={logoPreview}
//                               alt="Logo preview"
//                               className="max-w-full max-h-full object-contain"
//                             />
//                           </div>
//                           <div className="flex-1 space-y-3">
//                             <div>
//                               <label className="block text-sm font-medium mb-1">
//                                 Position
//                               </label>
//                               <select
//                                 value={theme.logoPosition || "center"}
//                                 onChange={(e) =>
//                                   setTheme({
//                                     ...theme,
//                                     logoPosition: e.target.value as
//                                       | "left"
//                                       | "center"
//                                       | "right",
//                                   })
//                                 }
//                                 className="w-full px-3 py-2 border rounded-lg"
//                               >
//                                 <option value="left">Left</option>
//                                 <option value="center">Center</option>
//                                 <option value="right">Right</option>
//                               </select>
//                             </div>
//                             <div className="grid grid-cols-2 gap-3">
//                               <div>
//                                 <label className="block text-sm font-medium mb-1">
//                                   Width
//                                 </label>
//                                 <input
//                                   type="text"
//                                   value={theme.logoWidth || "100px"}
//                                   onChange={(e) =>
//                                     setTheme({
//                                       ...theme,
//                                       logoWidth: e.target.value,
//                                     })
//                                   }
//                                   className="w-full px-3 py-2 border rounded-lg"
//                                   placeholder="100px"
//                                 />
//                               </div>
//                               <div>
//                                 <label className="block text-sm font-medium mb-1">
//                                   Height
//                                 </label>
//                                 <input
//                                   type="text"
//                                   value={theme.logoHeight || "auto"}
//                                   onChange={(e) =>
//                                     setTheme({
//                                       ...theme,
//                                       logoHeight: e.target.value,
//                                     })
//                                   }
//                                   className="w-full px-3 py-2 border rounded-lg"
//                                   placeholder="auto"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all rounded-lg">
//                           <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
//                           <span className="text-sm font-medium text-gray-600">
//                             Click to upload logo
//                           </span>
//                           <span className="text-xs text-gray-500 mt-1">
//                             PNG, SVG, or JPG
//                           </span>
//                           <input
//                             ref={logoInputRef}
//                             type="file"
//                             accept="image/*"
//                             onChange={handleLogoImageChange}
//                             className="hidden"
//                           />
//                         </label>
//                       )}
//                     </div>
//                   </div>

//                   {/* Form Fields */}
//                   <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
//                     <h3 className="font-semibold text-gray-800 mb-4">
//                       Form Fields
//                     </h3>
//                     <MainDropZone isEmpty={fields.length === 0}>
//                       {(() => {
//                         const childIds = new Set(
//                           fields
//                             .filter((f) => f.children?.length)
//                             .flatMap((f) => f.children || [])
//                         );
//                         const rootFields = fields.filter(
//                           (f) => !childIds.has(f.id)
//                         );

//                         return (
//                           <SortableContext
//                             items={rootFields.map((f) => f.id)}
//                             strategy={verticalListSortingStrategy}
//                           >
//                             <div className="space-y-3">
//                               {rootFields.map((field) => {
//                                 if (field.containerType) {
//                                   const childFields = field.children
//                                     ? (field.children
//                                         .map((id) =>
//                                           fields.find((f) => f.id === id)
//                                         )
//                                         .filter(Boolean) as CustomFormField[])
//                                     : [];

//                                   return (
//                                     <DroppableContainer
//                                       key={field.id}
//                                       field={field}
//                                       childFields={childFields}
//                                       allFields={fields}
//                                       onEdit={handleEditField}
//                                       onDelete={handleDeleteField}
//                                       onEditChild={handleEditField}
//                                       onDeleteChild={handleDeleteField}
//                                     />
//                                   );
//                                 }

//                                 return (
//                                   <SortableFieldItem
//                                     key={field.id}
//                                     field={field}
//                                     onEdit={handleEditField}
//                                     onDelete={handleDeleteField}
//                                   />
//                                 );
//                               })}
//                             </div>
//                           </SortableContext>
//                         );
//                       })()}
//                     </MainDropZone>
//                   </div>
//                 </div>
//               ) : (
//                 <FormPreview
//                   fields={fields}
//                   bannerImage={bannerPreview}
//                   theme={theme}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Drag Overlay */}
//       <DragOverlay>
//         {activeId && draggedPreset ? (
//           <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-2xl opacity-90">
//             <div className="flex items-center gap-2">
//               {draggedPreset.icon}
//               <span className="font-medium">{draggedPreset.label}</span>
//             </div>
//           </div>
//         ) : null}
//       </DragOverlay>

//       {/* Field Config Panel */}
//       {editingField && (
//         <FieldConfigPanel
//           field={editingField}
//           allFields={fields}
//           onUpdate={handleUpdateField}
//           onClose={() => setEditingField(null)}
//         />
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4"
//           onMouseDown={(e) => {
//             if (e.target === e.currentTarget) cancelDeleteField();
//           }}
//         >
//           <div
//             className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <div className="p-4 border-b flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Delete {deleteCandidate?.containerType ? "Container" : "Field"}
//               </h3>
//               <button
//                 onClick={cancelDeleteField}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//                 aria-label="Close"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="p-4">
//               <p className="text-sm text-gray-700">
//                 Are you sure you want to delete{" "}
//                 <span className="font-semibold">
//                   {deleteCandidate?.label ||
//                     deleteCandidate?.name ||
//                     "this item"}
//                 </span>
//                 ?
//               </p>
//               <p className="text-xs text-gray-500 mt-2">
//                 This action can’t be undone.
//               </p>
//             </div>

//             <div className="p-4 border-t flex items-center justify-end gap-3 bg-white">
//               <button
//                 onClick={cancelDeleteField}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDeleteField}
//                 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Theme Panel */}
//       {showThemePanel && (
//         <ThemeConfigPanel
//           theme={theme}
//           onUpdate={setTheme}
//           onClose={() => setShowThemePanel(false)}
//         />
//       )}

//       {/* JSON Editor Modal */}
//       {showJsonEditor && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
//             <div className="p-4 border-b flex items-center justify-between">
//               <h3 className="text-lg font-semibold">JSON Editor</h3>
//               <button
//                 onClick={() => setShowJsonEditor(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//             <div className="flex-1 overflow-auto p-4">
//               <textarea
//                 value={jsonEditorContent}
//                 onChange={(e) => setJsonEditorContent(e.target.value)}
//                 className="w-full h-full min-h-[400px] p-4 border rounded-lg font-mono text-sm"
//                 spellCheck={false}
//               />
//             </div>
//             <div className="p-4 border-t flex gap-3 justify-end">
//               <button
//                 onClick={() => setShowJsonEditor(false)}
//                 className="px-4 py-2 border rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleApplyJson}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Apply Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </DndContext>
//   );
// };

// export default CustomFormBuilder;













