// import React, { useState, useEffect } from "react";
// import {
//   ChevronLeft,
//   Check,
//   Plus,
//   Edit2,
//   Trash2,
//   X,
//   Upload,
//   AlignLeft,
//   AlignCenter,
//   AlignRight,
//   Eye,
//   QrCode,
// } from "lucide-react";
// import Assets from "@/utils/Assets";
// import { toast, ToastContainer } from "react-toastify";
// import { getEventbyId, postBadgesApi } from "@/apis/apiHelpers";

// // SVG Components for existing badges
// const CardHeader = ({ color = "#4D4D4D" }) => (
//   <svg
//     width="100%"
//     height="100%"
//     viewBox="0 0 204 90"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     className="w-full h-full rounded-t-xl"
//     preserveAspectRatio="none"
//   >
//     <path
//       d="M111.273 56.0935C64.6585 45.6916 29.5725 53.1215 0 66V0H204V47.6729C172.322 62.3346 125.307 59.2252 111.273 56.0935Z"
//       fill={color}
//     />
//     <path
//       d="M106 64.6191C56.4 55.4191 14.6667 74.7858 0 85.6191V89.6191C40 63.6191 87.3333 62.1191 106 64.6191Z"
//       fill={color}
//     />
//     <path
//       d="M107 61.6188C60.5 51.1189 17.3333 65.9522 0 74.6188V80.1187C39.5 55.1189 89.5 58.7806 107 61.6188Z"
//       fill={color}
//     />
//     <path
//       d="M119.5 62.5C165.5 68 189 60.5 204 54.5V58.5C170.5 68.5 133.5 66 119.5 62.5Z"
//       fill={color}
//     />
//     <path
//       d="M119 65.5C157 73.5 191.5 67.5 204 62.5V67.5C164 76 130 68.5 119 65.5Z"
//       fill={color}
//     />
//   </svg>
// );

// const CardHeader2 = ({ color = "#4D4D4D" }) => (
//   <svg
//     width="100%"
//     height="100%"
//     viewBox="0 0 204 106"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     preserveAspectRatio="none"
//   >
//     <path d="M204 26V13L154.5 38.5L162.5 46L204 26Z" fill={color} />
//     <path d="M0 106V0H204L0 106Z" fill={color} />
//   </svg>
// );

// const CardFooter = ({ color = "#4D4D4D" }) => (
//   <svg
//     width="100%"
//     height="100%"
//     viewBox="0 0 204 41"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     className="w-full h-full rounded-b-xl"
//     preserveAspectRatio="none"
//   >
//     <path
//       d="M129 22.6273C166.5 23.0083 194.5 8.33636 204 0V8.33636C166.5 27.5 150.5 25.5 129 22.6273Z"
//       fill={color}
//     />
//     <path
//       d="M0 20.4307V28C51.5 4.56204 91.5 17.1777 98 18.4392C57.6 1.28214 16 14.6544 0 20.4307Z"
//       fill={color}
//     />
//     <path
//       d="M0 33.6364V41H204V14C172.078 29.7091 147.138 29.953 126.688 26.2717C59.8521 14.2401 35.912 15.2273 0 33.6364Z"
//       fill={color}
//     />
//   </svg>
// );

// const CardFooter2 = ({ color = "#4D4D4D" }) => (
//   <svg
//     width="100%"
//     height="100%"
//     viewBox="0 0 204 54"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     preserveAspectRatio="none"
//   >
//     <path d="M89.4059 9L0 54H54.5792L105 28.7802L89.4059 9Z" fill={color} />
//     <path d="M204 0L106 54H204V0Z" fill={color} />
//   </svg>
// );

// // -------------------- TYPES --------------------
// interface BadgeTemplate {
//   id: string;
//   name: string;
//   type: "existing" | "custom";
//   width: number;
//   height: number;
//   hasBackground: boolean;
//   bgColor: string;
//   bgImage: string | null;
//   hasPersonalPhoto: boolean;
//   photoSize: { width: number; height: number };
//   photoAlignment: "left" | "center" | "right";
//   photoPosition: { x: number; y: number };
//   hasName: boolean;
//   nameText: {
//     size: number;
//     color: string;
//     alignment: "left" | "center" | "right";
//     position: { x: number; y: number };
//   };
//   hasCompany: boolean;
//   companyText: {
//     size: number;
//     color: string;
//     alignment: "left" | "center" | "right";
//     position: { x: number; y: number };
//   };
//   hasTitle: boolean;
//   titleText: {
//     size: number;
//     color: string;
//     alignment: "left" | "center" | "right";
//     position: { x: number; y: number };
//   };
//   hasQrCode: boolean;
//   qrCodeSize: { width: number; height: number };
//   qrCodePosition: { x: number; y: number };
// }

// interface Badge {
//   id: number;
//   name: string;
//   frontImg: string;
//   backImg: string;
//   userImg?: string;
//   squareUserImg?: string;
//   qrImg: string;
//   cardHeader: string;
//   cardFooter: string;
// }

// interface BadgesProps {
//   onNext: (eventId?: string | number, plan?: string) => void;
//   onPrevious: () => void;
//   currentStep?: number;
//   totalSteps?: number;
//   eventId?: string;
//   plan?: string;
// }

// // -------------------- CUSTOM BADGE BUILDER MODAL --------------------
// interface CustomBadgeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (template: BadgeTemplate) => void;
//   template?: BadgeTemplate | null;
//   isEditMode?: boolean;
// }

// const CustomBadgeModal: React.FC<CustomBadgeModalProps> = ({
//   isOpen,
//   onClose,
//   onSave,
//   template,
//   isEditMode = false,
// }) => {
//   const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(
//     null
//   );

//   const defaultTemplate: BadgeTemplate = {
//     id: "",
//     name: "New Custom Badge",
//     type: "custom",
//     width: 3.5,
//     height: 5.5,
//     hasBackground: true,
//     bgColor: "#1a1a1a",
//     bgImage: null,
//     hasPersonalPhoto: false,
//     photoSize: { width: 200, height: 200 },
//     photoAlignment: "center",
//     photoPosition: { x: 200, y: 60 },
//     hasName: true,
//     nameText: {
//       size: 24,
//       color: "#ffffff",
//       alignment: "center",
//       position: { x: 200, y: 280 },
//     },
//     hasCompany: false,
//     companyText: {
//       size: 18,
//       color: "#cccccc",
//       alignment: "center",
//       position: { x: 200, y: 315 },
//     },
//     hasTitle: true,
//     titleText: {
//       size: 16,
//       color: "#999999",
//       alignment: "center",
//       position: { x: 200, y: 350 },
//     },
//     hasQrCode: false,
//     qrCodeSize: { width: 120, height: 120 },
//     qrCodePosition: { x: 200, y: 400 },
//   };

//   // Initialize form data when template changes
//   useEffect(() => {
//     if (template) {
//       setEditingTemplate({ ...template });
//     } else {
//       setEditingTemplate({
//         ...defaultTemplate,
//         id: `custom-badge-${Date.now()}`,
//       });
//     }
//   }, [template]);

//   const handleSaveTemplate = () => {
//     if (!editingTemplate) return;

//     if (editingTemplate.name.trim() === "") {
//       toast.warning("Please enter a template name");
//       return;
//     }

//     onSave(editingTemplate);
//     onClose();
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file && editingTemplate) {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setEditingTemplate({
//           ...editingTemplate,
//           bgImage: event.target?.result as string,
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const renderCustomBadgePreview = (template: BadgeTemplate) => {
//     return (
//       <div className="flex flex-col items-center justify-center p-4">
//         <div
//           className="relative rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
//           style={{
//             width: `${template.width * 40}px`,
//             height: `${template.height * 40}px`,
//             backgroundColor: template.hasBackground
//               ? template.bgColor
//               : "transparent",
//             backgroundImage:
//               template.hasBackground && template.bgImage
//                 ? `url(${template.bgImage})`
//                 : "none",
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//           }}
//         >
//           {template.hasPersonalPhoto && template.photoSize && (
//             <div
//               className="absolute rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
//               style={{
//                 width: `${(template.photoSize.width || 200) * 0.2}px`,
//                 height: `${(template.photoSize.height || 200) * 0.2}px`,
//                 left:
//                   template.photoAlignment === "left"
//                     ? "10px"
//                     : template.photoAlignment === "right"
//                     ? "auto"
//                     : "50%",
//                 right: template.photoAlignment === "right" ? "10px" : "auto",
//                 transform:
//                   template.photoAlignment === "center"
//                     ? "translateX(-50%)"
//                     : "none",
//                 top: `${(template.photoPosition?.y || 60) * 0.2}px`,
//               }}
//             >
//               <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-400" />
//             </div>
//           )}

//           {template.hasName && template.nameText && (
//             <div
//               className="absolute left-0 right-0"
//               style={{
//                 top: `${(template.nameText.position?.y || 280) * 0.2}px`,
//                 textAlign: template.nameText.alignment || "center",
//               }}
//             >
//               <div
//                 className="font-bold px-2"
//                 style={{
//                   fontSize: `${(template.nameText.size || 24) * 0.2}px`,
//                   color: template.nameText.color || "#ffffff",
//                 }}
//               >
//                 Name
//               </div>
//             </div>
//           )}

//           {template.hasCompany && template.companyText && (
//             <div
//               className="absolute left-0 right-0"
//               style={{
//                 top: `${(template.companyText.position?.y || 315) * 0.2}px`,
//                 textAlign: template.companyText.alignment || "center",
//               }}
//             >
//               <div
//                 className="px-2"
//                 style={{
//                   fontSize: `${(template.companyText.size || 18) * 0.2}px`,
//                   color: template.companyText.color || "#cccccc",
//                 }}
//               >
//                 Company
//               </div>
//             </div>
//           )}

//           {template.hasTitle && template.titleText && (
//             <div
//               className="absolute left-0 right-0"
//               style={{
//                 top: `${(template.titleText.position?.y || 350) * 0.2}px`,
//                 textAlign: template.titleText.alignment || "center",
//               }}
//             >
//               <div
//                 className="px-2"
//                 style={{
//                   fontSize: `${(template.titleText.size || 16) * 0.2}px`,
//                   color: template.titleText.color || "#999999",
//                 }}
//               >
//                 Title
//               </div>
//             </div>
//           )}

//           {template.hasQrCode && template.qrCodeSize && (
//             <div
//               className="absolute bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden"
//               style={{
//                 width: `${(template.qrCodeSize.width || 120) * 0.2}px`,
//                 height: `${(template.qrCodeSize.height || 120) * 0.2}px`,
//                 left: `${(template.qrCodePosition?.x || 200) * 0.2}px`,
//                 top: `${(template.qrCodePosition?.y || 400) * 0.2}px`,
//               }}
//             >
//               <QrCode
//                 size={(template.qrCodeSize.width || 120) * 0.1}
//                 className="text-gray-400"
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const ToggleSwitch = ({
//     checked,
//     onChange,
//     label,
//   }: {
//     checked: boolean;
//     onChange: (checked: boolean) => void;
//     label: string;
//   }) => (
//     <div className="flex items-center justify-between mb-3">
//       <label className="text-sm font-medium text-gray-700">{label}</label>
//       <label className="relative inline-flex items-center cursor-pointer">
//         <input
//           type="checkbox"
//           checked={checked}
//           onChange={(e) => onChange(e.target.checked)}
//           className="sr-only peer"
//         />
//         <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
//       </label>
//     </div>
//   );

//   if (!isOpen || !editingTemplate) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
//       <div className="bg-white w-full max-w-6xl rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
//         <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
//           <div className="flex items-center gap-4">
//             <h3 className="text-lg font-semibold text-gray-800">
//               {isEditMode
//                 ? "Edit Custom Badge"
//                 : "Create Custom Badge Template"}
//             </h3>
//             <input
//               type="text"
//               value={editingTemplate.name}
//               onChange={(e) =>
//                 setEditingTemplate({
//                   ...editingTemplate,
//                   name: e.target.value,
//                 })
//               }
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
//               placeholder="Template name"
//             />
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-gray-200"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="flex flex-1 overflow-hidden">
//           <div className="flex-1 overflow-auto p-6">
//             <h4 className="font-semibold text-gray-800 mb-4">
//               Badge Configuration
//             </h4>

//             <div className="space-y-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Width (inches)
//                   </label>
//                   <input
//                     type="number"
//                     step="0.1"
//                     value={editingTemplate.width}
//                     onChange={(e) =>
//                       setEditingTemplate({
//                         ...editingTemplate,
//                         width: parseFloat(e.target.value) || 3.5,
//                       })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Height (inches)
//                   </label>
//                   <input
//                     type="number"
//                     step="0.1"
//                     value={editingTemplate.height}
//                     onChange={(e) =>
//                       setEditingTemplate({
//                         ...editingTemplate,
//                         height: parseFloat(e.target.value) || 5.5,
//                       })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                   />
//                 </div>
//               </div>

//               <ToggleSwitch
//                 checked={editingTemplate.hasBackground}
//                 onChange={(checked) =>
//                   setEditingTemplate({
//                     ...editingTemplate,
//                     hasBackground: checked,
//                   })
//                 }
//                 label="Badge Background"
//               />

//               {editingTemplate.hasBackground && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Background Color
//                     </label>
//                     <div className="flex gap-3">
//                       <input
//                         type="color"
//                         value={editingTemplate.bgColor}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             bgColor: e.target.value,
//                           })
//                         }
//                         className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
//                       />
//                       <input
//                         type="text"
//                         value={editingTemplate.bgColor}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             bgColor: e.target.value,
//                           })
//                         }
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Background Image
//                     </label>
//                     <div className="flex items-center gap-3">
//                       <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer inline-flex items-center gap-2">
//                         <Upload size={16} />
//                         Upload Image
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleImageUpload}
//                           className="hidden"
//                         />
//                       </label>
//                       {editingTemplate.bgImage && (
//                         <button
//                           onClick={() =>
//                             setEditingTemplate({
//                               ...editingTemplate,
//                               bgImage: null,
//                             })
//                           }
//                           className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </>
//               )}

//               <ToggleSwitch
//                 checked={editingTemplate.hasPersonalPhoto}
//                 onChange={(checked) =>
//                   setEditingTemplate({
//                     ...editingTemplate,
//                     hasPersonalPhoto: checked,
//                   })
//                 }
//                 label="Personal Photo"
//               />

//               {editingTemplate.hasPersonalPhoto && (
//                 <div className="space-y-4 ml-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         Width (px)
//                       </label>
//                       <input
//                         type="number"
//                         value={editingTemplate.photoSize?.width || 200}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             photoSize: {
//                               ...editingTemplate.photoSize,
//                               width: parseInt(e.target.value) || 200,
//                             },
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         Height (px)
//                       </label>
//                       <input
//                         type="number"
//                         value={editingTemplate.photoSize?.height || 200}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             photoSize: {
//                               ...editingTemplate.photoSize,
//                               height: parseInt(e.target.value) || 200,
//                             },
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-600 mb-2">
//                       Alignment
//                     </label>
//                     <div className="flex gap-2">
//                       {["left", "center", "right"].map((align) => (
//                         <button
//                           key={align}
//                           onClick={() =>
//                             setEditingTemplate({
//                               ...editingTemplate,
//                               photoAlignment: align as
//                                 | "left"
//                                 | "center"
//                                 | "right",
//                             })
//                           }
//                           className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
//                             editingTemplate.photoAlignment === align
//                               ? "border-pink-500 bg-pink-50"
//                               : "border-gray-300 hover:border-gray-400"
//                           }`}
//                         >
//                           {align === "left" && (
//                             <AlignLeft size={16} className="mx-auto" />
//                           )}
//                           {align === "center" && (
//                             <AlignCenter size={16} className="mx-auto" />
//                           )}
//                           {align === "right" && (
//                             <AlignRight size={16} className="mx-auto" />
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-600 mb-1">
//                       Y Position (px)
//                     </label>
//                     <input
//                       type="number"
//                       value={editingTemplate.photoPosition?.y || 60}
//                       onChange={(e) =>
//                         setEditingTemplate({
//                           ...editingTemplate,
//                           photoPosition: {
//                             ...editingTemplate.photoPosition,
//                             y: parseInt(e.target.value) || 60,
//                           },
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                     />
//                   </div>
//                 </div>
//               )}

//               <ToggleSwitch
//                 checked={editingTemplate.hasName}
//                 onChange={(checked) =>
//                   setEditingTemplate({
//                     ...editingTemplate,
//                     hasName: checked,
//                   })
//                 }
//                 label="Name Text"
//               />

//               {editingTemplate.hasName && (
//                 <div className="space-y-3 ml-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         Size (px)
//                       </label>
//                       <input
//                         type="number"
//                         value={editingTemplate.nameText?.size || 24}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             nameText: {
//                               ...editingTemplate.nameText,
//                               size: parseInt(e.target.value) || 24,
//                             },
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         Color
//                       </label>
//                       <input
//                         type="color"
//                         value={editingTemplate.nameText?.color || "#ffffff"}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             nameText: {
//                               ...editingTemplate.nameText,
//                               color: e.target.value,
//                             },
//                           })
//                         }
//                         className="w-full h-10 rounded border border-gray-300 cursor-pointer"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-600 mb-2">
//                       Alignment
//                     </label>
//                     <div className="flex gap-2">
//                       {["left", "center", "right"].map((align) => (
//                         <button
//                           key={align}
//                           onClick={() =>
//                             setEditingTemplate({
//                               ...editingTemplate,
//                               nameText: {
//                                 ...editingTemplate.nameText,
//                                 alignment: align as "left" | "center" | "right",
//                               },
//                             })
//                           }
//                           className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
//                             editingTemplate.nameText?.alignment === align
//                               ? "border-pink-500 bg-pink-50"
//                               : "border-gray-300 hover:border-gray-400"
//                           }`}
//                         >
//                           {align === "left" && (
//                             <AlignLeft size={16} className="mx-auto" />
//                           )}
//                           {align === "center" && (
//                             <AlignCenter size={16} className="mx-auto" />
//                           )}
//                           {align === "right" && (
//                             <AlignRight size={16} className="mx-auto" />
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-600 mb-1">
//                       Y Position (px)
//                     </label>
//                     <input
//                       type="number"
//                       value={editingTemplate.nameText?.position?.y || 280}
//                       onChange={(e) =>
//                         setEditingTemplate({
//                           ...editingTemplate,
//                           nameText: {
//                             ...editingTemplate.nameText,
//                             position: {
//                               ...editingTemplate.nameText?.position,
//                               y: parseInt(e.target.value) || 280,
//                             },
//                           },
//                         })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                     />
//                   </div>
//                 </div>
//               )}

//               <ToggleSwitch
//                 checked={editingTemplate.hasCompany}
//                 onChange={(checked) =>
//                   setEditingTemplate({
//                     ...editingTemplate,
//                     hasCompany: checked,
//                   })
//                 }
//                 label="Company Text"
//               />

//               {editingTemplate.hasCompany && (
//                 <div className="space-y-3 ml-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         Size (px)
//                       </label>
//                       <input
//                         type="number"
//                         value={editingTemplate.companyText?.size || 18}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             companyText: {
//                               ...editingTemplate.companyText,
//                               size: parseInt(e.target.value) || 18,
//                             },
//                           })
//                         }
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">
//                         Color
//                       </label>
//                       <input
//                         type="color"
//                         value={editingTemplate.companyText?.color || "#cccccc"}
//                         onChange={(e) =>
//                           setEditingTemplate({
//                             ...editingTemplate,
//                             companyText: {
//                               ...editingTemplate.companyText,
//                               color: e.target.value,
//                             },
//                           })
//                         }
//                         className="w-full h-10 rounded border border-gray-300 cursor-pointer"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <ToggleSwitch
//                 checked={editingTemplate.hasTitle}
//                 onChange={(checked) =>
//                   setEditingTemplate({
//                     ...editingTemplate,
//                     hasTitle: checked,
//                   })
//                 }
//                 label="Title Text"
//               />

//               <ToggleSwitch
//                 checked={editingTemplate.hasQrCode}
//                 onChange={(checked) =>
//                   setEditingTemplate({
//                     ...editingTemplate,
//                     hasQrCode: checked,
//                   })
//                 }
//                 label="QR Code"
//               />
//             </div>
//           </div>

//           <div className="w-96 border-l border-gray-200 p-6 overflow-auto bg-gray-50">
//             <h4 className="font-semibold text-gray-800 mb-4 text-center">
//               Badge Preview
//             </h4>
//             {renderCustomBadgePreview(editingTemplate)}
//           </div>
//         </div>

//         <div className="p-4 border-t flex justify-end gap-3 bg-gray-100">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSaveTemplate}
//             className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
//           >
//             Save Template
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // -------------------- MAIN BADGES COMPONENT --------------------
// const AdvanceBadge: React.FC<BadgesProps> = ({
//   onNext,
//   onPrevious,
//   currentStep = 0,
//   eventId,
//   plan,
// }) => {
//   const effectiveEventId = eventId || localStorage.getItem("create_eventId");

//   // State for custom templates
//   const [customTemplates, setCustomTemplates] = useState<BadgeTemplate[]>([]);
//   const [selectedTemplate, setSelectedTemplate] =
//     useState<BadgeTemplate | null>(null);
//   const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
//   const [editingCustomTemplate, setEditingCustomTemplate] =
//     useState<BadgeTemplate | null>(null);
//   const [isEditCustomMode, setIsEditCustomMode] = useState(false);
//   const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
//   const [reviewingTemplate, setReviewingTemplate] =
//     useState<BadgeTemplate | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [event, setEvent] = useState<any>(null);

//   // Existing badge templates (Badge1-4)
//   const existingBadges: BadgeTemplate[] = [
//     {
//       id: "existing-1",
//       name: "Badge 1",
//       type: "existing",
//       width: 3.5,
//       height: 5.5,
//       hasBackground: true,
//       bgColor: "#2563eb",
//       bgImage: null,
//       hasPersonalPhoto: true,
//       photoSize: { width: 120, height: 120 },
//       photoAlignment: "center",
//       photoPosition: { x: 200, y: 100 },
//       hasName: true,
//       nameText: {
//         size: 18,
//         color: "#000000",
//         alignment: "center",
//         position: { x: 200, y: 240 },
//       },
//       hasCompany: true,
//       companyText: {
//         size: 14,
//         color: "#666666",
//         alignment: "center",
//         position: { x: 200, y: 270 },
//       },
//       hasTitle: true,
//       titleText: {
//         size: 12,
//         color: "#999999",
//         alignment: "center",
//         position: { x: 200, y: 295 },
//       },
//       hasQrCode: false,
//       qrCodeSize: { width: 100, height: 100 },
//       qrCodePosition: { x: 150, y: 350 },
//     },
//     {
//       id: "existing-2",
//       name: "Badge 2",
//       type: "existing",
//       width: 3.5,
//       height: 5.5,
//       hasBackground: true,
//       bgColor: "#000000",
//       bgImage: null,
//       hasPersonalPhoto: false,
//       photoSize: { width: 0, height: 0 },
//       photoAlignment: "center",
//       photoPosition: { x: 0, y: 0 },
//       hasName: true,
//       nameText: {
//         size: 20,
//         color: "#FFFFFF",
//         alignment: "center",
//         position: { x: 200, y: 180 },
//       },
//       hasCompany: true,
//       companyText: {
//         size: 16,
//         color: "#CCCCCC",
//         alignment: "center",
//         position: { x: 200, y: 220 },
//       },
//       hasTitle: true,
//       titleText: {
//         size: 14,
//         color: "#999999",
//         alignment: "center",
//         position: { x: 200, y: 250 },
//       },
//       hasQrCode: false,
//       qrCodeSize: { width: 100, height: 100 },
//       qrCodePosition: { x: 150, y: 320 },
//     },
//     {
//       id: "existing-3",
//       name: "Badge 3",
//       type: "existing",
//       width: 3.5,
//       height: 5.5,
//       hasBackground: true,
//       bgColor: "#FFFFFF",
//       bgImage: null,
//       hasPersonalPhoto: true,
//       photoSize: { width: 100, height: 100 },
//       photoAlignment: "center",
//       photoPosition: { x: 200, y: 120 },
//       hasName: true,
//       nameText: {
//         size: 18,
//         color: "#000000",
//         alignment: "center",
//         position: { x: 200, y: 240 },
//       },
//       hasCompany: false,
//       companyText: {
//         size: 14,
//         color: "#666666",
//         alignment: "center",
//         position: { x: 200, y: 270 },
//       },
//       hasTitle: true,
//       titleText: {
//         size: 12,
//         color: "#666666",
//         alignment: "center",
//         position: { x: 200, y: 270 },
//       },
//       hasQrCode: false,
//       qrCodeSize: { width: 100, height: 100 },
//       qrCodePosition: { x: 150, y: 330 },
//     },
//     {
//       id: "existing-4",
//       name: "Badge 4",
//       type: "existing",
//       width: 3.5,
//       height: 5.5,
//       hasBackground: true,
//       bgColor: "#000000",
//       bgImage: null,
//       hasPersonalPhoto: false,
//       photoSize: { width: 0, height: 0 },
//       photoAlignment: "center",
//       photoPosition: { x: 0, y: 0 },
//       hasName: true,
//       nameText: {
//         size: 18,
//         color: "#FFFFFF",
//         alignment: "center",
//         position: { x: 200, y: 170 },
//       },
//       hasCompany: true,
//       companyText: {
//         size: 14,
//         color: "#CCCCCC",
//         alignment: "center",
//         position: { x: 200, y: 210 },
//       },
//       hasTitle: true,
//       titleText: {
//         size: 12,
//         color: "#999999",
//         alignment: "center",
//         position: { x: 200, y: 240 },
//       },
//       hasQrCode: false,
//       qrCodeSize: { width: 100, height: 100 },
//       qrCodePosition: { x: 150, y: 300 },
//     },
//   ];

//   // Load custom templates from localStorage
//   useEffect(() => {
//     const saved = localStorage.getItem("customBadgeTemplates");
//     if (saved) {
//       try {
//         setCustomTemplates(JSON.parse(saved));
//       } catch (error) {
//         console.error("Error loading templates:", error);
//       }
//     }

//     // Load event data
//     if (effectiveEventId) {
//       getEventbyId(effectiveEventId)
//         .then((response) => {
//           const eventData = response?.data?.data;
//           setEvent(eventData);
//         })
//         .catch((error) => {
//           console.error("Failed to fetch event data:", error);
//         });
//     }
//   }, [effectiveEventId]);

//   // Save templates to localStorage
//   const saveTemplates = (newTemplates: BadgeTemplate[]) => {
//     localStorage.setItem("customBadgeTemplates", JSON.stringify(newTemplates));
//     setCustomTemplates(newTemplates);
//   };

//   // -------------------- CUSTOM TEMPLATE FUNCTIONS --------------------
//   const handleCreateNewTemplate = () => {
//     setEditingCustomTemplate(null);
//     setIsEditCustomMode(false);
//     setIsCustomModalOpen(true);
//   };

//   const handleEditCustomTemplate = (template: BadgeTemplate) => {
//     setEditingCustomTemplate(template);
//     setIsEditCustomMode(true);
//     setIsCustomModalOpen(true);
//     setIsReviewModalOpen(false);
//   };

//   const handleSaveCustomTemplate = (template: BadgeTemplate) => {
//     let updatedTemplates: BadgeTemplate[];

//     if (isEditCustomMode && editingCustomTemplate) {
//       // Update existing template
//       updatedTemplates = customTemplates.map((t) =>
//         t.id === editingCustomTemplate.id
//           ? { ...template, updatedAt: new Date().toISOString() }
//           : t
//       );
//     } else {
//       // Create new template
//       updatedTemplates = [...customTemplates, template];
//       setSelectedTemplate(template);
//     }

//     saveTemplates(updatedTemplates);
//     toast.success(
//       `Template ${isEditCustomMode ? "updated" : "created"} successfully!`
//     );
//   };

//   const [deleteCustomTemplateCandidate, setDeleteCustomTemplateCandidate] =
//     useState<BadgeTemplate | null>(null);
//   const [isDeleteCustomTemplateModalOpen, setIsDeleteCustomTemplateModalOpen] =
//     useState(false);

//   const handleDeleteCustomTemplate = (templateId: string) => {
//     const template = customTemplates.find((t) => t.id === templateId) || null;
//     setDeleteCustomTemplateCandidate(template);
//     setIsDeleteCustomTemplateModalOpen(true);
//   };

//   const cancelDeleteCustomTemplate = () => {
//     setIsDeleteCustomTemplateModalOpen(false);
//     setDeleteCustomTemplateCandidate(null);
//   };

//   const confirmDeleteCustomTemplate = () => {
//     if (!deleteCustomTemplateCandidate) {
//       cancelDeleteCustomTemplate();
//       return;
//     }

//     const templateId = deleteCustomTemplateCandidate.id;
//     const updatedTemplates = customTemplates.filter(
//       (template) => template.id !== templateId
//     );
//     saveTemplates(updatedTemplates);

//     if (selectedTemplate?.id === templateId) {
//       setSelectedTemplate(null);
//     }

//     setIsReviewModalOpen(false);
//     toast.success("Template deleted successfully!");
//     cancelDeleteCustomTemplate();
//   };

//   React.useEffect(() => {
//     if (!isDeleteCustomTemplateModalOpen) return;
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") cancelDeleteCustomTemplate();
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [isDeleteCustomTemplateModalOpen]);

//   const handleSelectTemplate = (template: BadgeTemplate) => {
//     setSelectedTemplate(template);
//     setIsReviewModalOpen(false);
//     toast.success("Template selected!");
//   };

//   const handleReviewTemplate = (template: BadgeTemplate) => {
//     setReviewingTemplate(template);
//     setIsReviewModalOpen(true);
//   };

//   // -------------------- EXISTING BADGE RENDER FUNCTIONS --------------------
//   const renderExistingBadgePreview = (template: BadgeTemplate) => {
//     const badgeId = template.id.split("-")[1];
//     const primaryColor = event?.attributes?.primary_color || "#2563eb";
//     const secondaryColor = event?.attributes?.secondary_color || "#ffffff";
//     const logoUrl = event?.attributes?.logo_url;

//     return (
//       <div
//         className="flex flex-col h-full w-full rounded-xl border overflow-hidden"
//         style={{ backgroundColor: secondaryColor }}
//       >
//         {/* Header Section */}
//         <div
//           className="relative w-full rounded-t-xl overflow-hidden"
//           style={{ height: "33%" }}
//         >
//           <div className="absolute inset-0">
//             {badgeId === "1" || badgeId === "3" ? (
//               <CardHeader color={primaryColor} />
//             ) : (
//               <CardHeader2 color={primaryColor} />
//             )}
//           </div>

//           {/* Header content for different badges */}
//           {badgeId === "1" && (
//             <div className="relative z-10 flex items-center justify-center gap-2 h-full">
//               {logoUrl && <img src={logoUrl} alt="Logo" className="w-4 h-4" />}
//               <h6 className="font-semibold text-white text-xs">Company Name</h6>
//             </div>
//           )}
//           {badgeId === "3" && (
//             <div className="relative z-10 flex items-center justify-center h-full">
//               <h6 className="font-semibold text-white text-xs">
//                 Conference 2024
//               </h6>
//             </div>
//           )}
//         </div>

//         {/* Content Section */}
//         <div className="flex flex-1 flex-col justify-center items-center p-4">
//           {/* Photo - only for badges that have it enabled */}
//           {template.hasPersonalPhoto && badgeId !== "4" && (
//             <div className="w-12 h-12 rounded-full bg-gray-300 mb-2 flex items-center justify-center">
//               <span className="text-gray-500 text-xs">Photo</span>
//             </div>
//           )}

//           {/* Name - always show for all badges */}
//           <h2
//             className={`text-xs font-bold ${
//               badgeId === "2" || badgeId === "4"
//                 ? "text-white"
//                 : "text-gray-900"
//             } mb-1`}
//           >
//             John Doe
//           </h2>

//           {/* Title */}
//           {template.hasTitle && (
//             <p
//               className={`text-xs ${
//                 badgeId === "2" || badgeId === "4"
//                   ? "text-gray-300"
//                   : "text-gray-600"
//               }`}
//             >
//               Software Engineer
//             </p>
//           )}

//           {/* Company with logo - for badges 2 and 4 */}
//           {(badgeId === "2" || badgeId === "4") && template.hasCompany && (
//             <div className="flex items-center gap-1 mt-2">
//               {logoUrl && <img src={logoUrl} alt="Logo" className="w-3 h-3" />}
//               <span
//                 className={`text-xs font-medium ${
//                   badgeId === "2" || badgeId === "4"
//                     ? "text-white"
//                     : "text-black"
//                 }`}
//               >
//                 Tech Corp
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Footer Section */}
//         <div
//           className="relative w-full rounded-b-xl overflow-hidden"
//           style={{ height: 70 }}
//         >
//           <div className="absolute inset-0">
//             {badgeId === "1" || badgeId === "3" ? (
//               <CardFooter color={primaryColor} />
//             ) : (
//               <CardFooter2 color={primaryColor} />
//             )}
//           </div>

//           {/* Footer content */}
//           {badgeId === "2" && (
//             <div className="relative z-10 flex items-center justify-center h-full">
//               <span className="text-white text-xs">#Event2024</span>
//             </div>
//           )}
//           {badgeId === "4" && (
//             <div className="relative z-10 flex items-center justify-center h-full">
//               <span className="text-white text-xs">VIP</span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const renderCustomBadgePreview = (template: BadgeTemplate) => {
//     return (
//       <div className="flex flex-col items-center justify-center p-4">
//         <div
//           className="relative rounded-lg shadow-md overflow-hidden border-2 border-gray-200"
//           style={{
//             width: `${template.width * 40}px`,
//             height: `${template.height * 40}px`,
//             backgroundColor: template.hasBackground
//               ? template.bgColor
//               : "transparent",
//             backgroundImage:
//               template.hasBackground && template.bgImage
//                 ? `url(${template.bgImage})`
//                 : "none",
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//           }}
//         >
//           {template.hasPersonalPhoto && template.photoSize && (
//             <div
//               className="absolute rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
//               style={{
//                 width: `${(template.photoSize.width || 200) * 0.2}px`,
//                 height: `${(template.photoSize.height || 200) * 0.2}px`,
//                 left:
//                   template.photoAlignment === "left"
//                     ? "10px"
//                     : template.photoAlignment === "right"
//                     ? "auto"
//                     : "50%",
//                 right: template.photoAlignment === "right" ? "10px" : "auto",
//                 transform:
//                   template.photoAlignment === "center"
//                     ? "translateX(-50%)"
//                     : "none",
//                 top: `${(template.photoPosition?.y || 60) * 0.2}px`,
//               }}
//             >
//               <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-400" />
//             </div>
//           )}

//           {template.hasName && template.nameText && (
//             <div
//               className="absolute left-0 right-0"
//               style={{
//                 top: `${(template.nameText.position?.y || 280) * 0.2}px`,
//                 textAlign: template.nameText.alignment || "center",
//               }}
//             >
//               <div
//                 className="font-bold px-2"
//                 style={{
//                   fontSize: `${(template.nameText.size || 24) * 0.2}px`,
//                   color: template.nameText.color || "#ffffff",
//                 }}
//               >
//                 Name
//               </div>
//             </div>
//           )}

//           {template.hasCompany && template.companyText && (
//             <div
//               className="absolute left-0 right-0"
//               style={{
//                 top: `${(template.companyText.position?.y || 315) * 0.2}px`,
//                 textAlign: template.companyText.alignment || "center",
//               }}
//             >
//               <div
//                 className="px-2"
//                 style={{
//                   fontSize: `${(template.companyText.size || 18) * 0.2}px`,
//                   color: template.companyText.color || "#cccccc",
//                 }}
//               >
//                 Company
//               </div>
//             </div>
//           )}

//           {template.hasTitle && template.titleText && (
//             <div
//               className="absolute left-0 right-0"
//               style={{
//                 top: `${(template.titleText.position?.y || 350) * 0.2}px`,
//                 textAlign: template.titleText.alignment || "center",
//               }}
//             >
//               <div
//                 className="px-2"
//                 style={{
//                   fontSize: `${(template.titleText.size || 16) * 0.2}px`,
//                   color: template.titleText.color || "#999999",
//                 }}
//               >
//                 Title
//               </div>
//             </div>
//           )}

//           {template.hasQrCode && template.qrCodeSize && (
//             <div
//               className="absolute bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden"
//               style={{
//                 width: `${(template.qrCodeSize.width || 120) * 0.2}px`,
//                 height: `${(template.qrCodeSize.height || 120) * 0.2}px`,
//                 left: `${(template.qrCodePosition?.x || 200) * 0.2}px`,
//                 top: `${(template.qrCodePosition?.y || 400) * 0.2}px`,
//               }}
//             >
//               <QrCode
//                 size={(template.qrCodeSize.width || 120) * 0.1}
//                 className="text-gray-400"
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // -------------------- API INTEGRATION --------------------
//   const handleBadgeApiSelection = async (template: BadgeTemplate) => {
//     if (!effectiveEventId) {
//       throw new Error("Event ID not found");
//     }

//     const data = {
//       badge_template: {
//         name: template.name,
//         event_id: effectiveEventId,
//         default: true,
//         template_data: template, // Include the full template data
//       },
//     };

//     const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
//     return response;
//   };

//   const selectBadgeAndContinue = async () => {
//     if (!selectedTemplate) {
//       toast.error("Please select a badge template first!");
//       return;
//     }

//     setLoading(true);
//     try {
//       await handleBadgeApiSelection(selectedTemplate);
//       toast.success("Badge template selected successfully!");

//       // Save template data for PrintBadges
//       localStorage.setItem(
//         "active_badge_template",
//         JSON.stringify(selectedTemplate)
//       );
//       localStorage.setItem("active_badge_id", selectedTemplate.id);

//       setTimeout(() => {
//         if (effectiveEventId && onNext) {
//           onNext(effectiveEventId, plan);
//         } else {
//           onNext();
//         }
//       }, 1000);
//     } catch (error) {
//       toast.error("Failed to select badge template.");
//       console.error("Badge selection error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const allTemplates = [...customTemplates, ...existingBadges];

//   return (
//     <div className="w-full mx-5 bg-white p-5 rounded-2xl">
//       {/* Header */}
//       <div className="flex flex-row justify-between items-center">
//         <div className="flex flex-row gap-2 items-center">
//           <ChevronLeft />
//           <p className="text-neutral-900 text-md font-poppins font-normal">
//             Choose a Badge Template
//           </p>
//         </div>
//       </div>

//       {/* Badge Templates Grid */}
//       <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {/* Custom Badge Creation Card (First Position) */}
//         <div
//           onClick={handleCreateNewTemplate}
//           className="border-2 border-dashed border-gray-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
//         >
//           <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
//             <Plus className="text-pink-500" size={32} />
//           </div>
//           <h3 className="text-lg font-medium text-gray-900 mb-2 text-center text-pink-500">
//             Create Custom Badge
//           </h3>
//           <p className="text-sm text-gray-500 text-center">
//             Design a custom badge template from scratch
//           </p>
//         </div>

//         {/* Custom Templates */}
//         {customTemplates.map((template) => {
//           const isSelected = selectedTemplate?.id === template.id;
//           return (
//             <div
//               key={template.id}
//               onClick={() => handleReviewTemplate(template)}
//               className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col ${
//                 isSelected
//                   ? "border-pink-500 bg-pink-50"
//                   : "border-gray-200 hover:border-pink-500"
//               }`}
//             >
//               <div className="flex-1 h-48">
//                 {renderCustomBadgePreview(template)}
//               </div>

//               <div className="mt-3 pt-3 border-t border-gray-100">
//                 <div className="flex justify-between items-center">
//                   <span className="font-medium text-sm text-gray-900">
//                     {template.name}
//                   </span>
//                   {isSelected && (
//                     <div className="flex items-center">
//                       <Check size={16} className="text-pink-500 mr-1" />
//                       <span className="text-sm text-pink-500 font-medium">
//                         Selected
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-1 mt-2">
//                   {template.hasPersonalPhoto && (
//                     <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
//                       Photo
//                     </span>
//                   )}
//                   {template.hasQrCode && (
//                     <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
//                       QR
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {/* Default Templates */}
//         {existingBadges.map((template) => {
//           const isSelected = selectedTemplate?.id === template.id;
//           return (
//             <div
//               key={template.id}
//               onClick={() => handleReviewTemplate(template)}
//               className={`border-2 rounded-3xl p-4 cursor-pointer transition-colors aspect-square flex flex-col ${
//                 isSelected
//                   ? "border-pink-500 bg-pink-50"
//                   : "border-gray-200 hover:border-pink-500"
//               }`}
//             >
//               <div className="flex-1 h-48">
//                 {renderExistingBadgePreview(template)}
//               </div>

//               <div className="mt-3 pt-3 border-t border-gray-100">
//                 <div className="flex justify-between items-center">
//                   <span className="font-medium text-sm text-gray-900">
//                     {template.name}
//                   </span>
//                   {isSelected && (
//                     <div className="flex items-center">
//                       <Check size={16} className="text-pink-500 mr-1" />
//                       <span className="text-sm text-pink-500 font-medium">
//                         Selected
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-1 mt-2">
//                   {template.hasPersonalPhoto && (
//                     <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">
//                       Photo
//                     </span>
//                   )}
//                   {template.hasQrCode && (
//                     <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs">
//                       QR
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Custom Badge Builder Modal */}
//       <CustomBadgeModal
//         isOpen={isCustomModalOpen}
//         onClose={() => setIsCustomModalOpen(false)}
//         onSave={handleSaveCustomTemplate}
//         template={editingCustomTemplate}
//         isEditMode={isEditCustomMode}
//       />

//       {/* Review Template Modal */}
//       {isReviewModalOpen && reviewingTemplate && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[80vh]">
//             <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
//               <div className="flex items-center gap-4">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   Review: {reviewingTemplate.name}
//                 </h3>
//                 <span className="text-sm text-gray-500">
//                   {reviewingTemplate.type === "custom"
//                     ? "Custom Template"
//                     : "Default Template"}
//                 </span>
//               </div>
//               <button
//                 onClick={() => setIsReviewModalOpen(false)}
//                 className="p-2 rounded-full hover:bg-gray-200"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="flex-1 overflow-auto p-6">
//               <div className="max-w-2xl mx-auto">
//                 {reviewingTemplate.type === "existing"
//                   ? renderExistingBadgePreview(reviewingTemplate)
//                   : renderCustomBadgePreview(reviewingTemplate)}
//               </div>
//             </div>

//             <div className="p-4 border-t flex justify-between items-center bg-gray-100">
//               <div className="flex gap-3">
//                 {reviewingTemplate.type === "custom" && (
//                   <>
//                     <button
//                       onClick={() =>
//                         handleDeleteCustomTemplate(reviewingTemplate.id)
//                       }
//                       className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
//                     >
//                       <Trash2 size={16} />
//                       Delete
//                     </button>
//                     <button
//                       onClick={() =>
//                         handleEditCustomTemplate(reviewingTemplate)
//                       }
//                       className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
//                     >
//                       <Edit2 size={16} />
//                       Edit
//                     </button>
//                   </>
//                 )}
//               </div>
//               <button
//                 onClick={() => handleSelectTemplate(reviewingTemplate)}
//                 className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
//               >
//                 Choose Template
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Custom Template Modal */}
//       {isDeleteCustomTemplateModalOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//           onMouseDown={(e) => {
//             if (e.target === e.currentTarget) cancelDeleteCustomTemplate();
//           }}
//         >
//           <div
//             className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <div className="p-4 border-b flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 Delete Template
//               </h3>
//               <button
//                 onClick={cancelDeleteCustomTemplate}
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
//                   {deleteCustomTemplateCandidate?.name || "this template"}
//                 </span>
//                 ?
//               </p>
//               <p className="text-xs text-gray-500 mt-2">
//                 This action can’t be undone.
//               </p>
//             </div>

//             <div className="p-4 border-t flex items-center justify-end gap-3">
//               <button
//                 onClick={cancelDeleteCustomTemplate}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDeleteCustomTemplate}
//                 className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Navigation Buttons */}
//       <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
//         <button
//           onClick={onPrevious}
//           className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium border text-slate-800 border-gray-300 hover:bg-gray-50"
//         >
//           ← Previous
//         </button>

//         <button
//           onClick={selectBadgeAndContinue}
//           disabled={!selectedTemplate || loading}
//           className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${
//             !selectedTemplate || loading
//               ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//               : "bg-slate-800 hover:bg-slate-900 text-white"
//           }`}
//         >
//           {loading ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               Loading...
//             </>
//           ) : (
//             "Next →"
//           )}
//         </button>
//       </div>

//       <ToastContainer />
//     </div>
//   );
// };

// export default AdvanceBadge;




import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Check,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  QrCode,
} from "lucide-react";
import Assets from "@/utils/Assets";
import { toast, ToastContainer } from "react-toastify";
import { getEventbyId, postBadgesApi, getBadgesApi, deleteBadgeTemplateApi, updateBadgeTemplateApi, updateEventById } from "@/apis/apiHelpers";
import type { ToggleStates } from "@/pages/Home/ExpressEvent/ExpressEvent";
import AdvanceCustomBadgeModal from "@/pages/Home/ExpressEvent/component/AdvanceCustomBadgeModal";

// -------------------- TYPES --------------------
interface BadgeTemplate {
  id: string;
  name: string;
  type: "existing" | "custom";
  width: number;
  height: number;
  hasBackground: boolean;
  bgColor: string;
  bgImage: string | null;
  hasPersonalPhoto: boolean;
  photoSize: { width: number; height: number };
  photoAlignment: "left" | "center" | "right";
  photoPosition: { x: number; y: number };
  hasName: boolean;
  nameText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasCompany: boolean;
  companyText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasTitle: boolean;
  titleText: {
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
    position: { x: number; y: number };
  };
  hasQrCode: boolean;
  qrCodeSize: { width: number; height: number };
  qrCodePosition: { x: number; y: number };
  qrCodeAlignment?: "left" | "center" | "right";
}

interface Badge {
  id: number;
  name: string;
  frontImg: string;
  backImg: string;
  userImg?: string;
  squareUserImg?: string;
  qrImg: string;
  cardHeader: string;
  cardFooter: string;
}

interface BadgesProps {
  toggleStates: ToggleStates;
  onNext: (eventId?: string | number, plan?: string) => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps?: number;
  eventId?: string;
  plan?: string;
}

// -------------------- SVG COMPONENTS --------------------
export const CardHeader: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M111.273 56.0935C64.6585 45.6916 29.5725 53.1215 0 66V0H204V47.6729C172.322 62.3346 125.307 59.2252 111.273 56.0935Z"
      fill={color}
    />
    <path
      d="M106 64.6191C56.4 55.4191 14.6667 74.7858 0 85.6191V89.6191C40 63.6191 87.3333 62.1191 106 64.6191Z"
      fill={color}
    />
    <path
      d="M107 61.6188C60.5 51.1189 17.3333 65.9522 0 74.6188V80.1187C39.5 55.1189 89.5 58.7806 107 61.6188Z"
      fill={color}
    />
    <path
      d="M119.5 62.5C165.5 68 189 60.5 204 54.5V58.5C170.5 68.5 133.5 66 119.5 62.5Z"
      fill={color}
    />
    <path
      d="M119 65.5C157 73.5 191.5 67.5 204 62.5V67.5C164 76 130 68.5 119 65.5Z"
      fill={color}
    />
  </svg>
);

export const CardHeader2: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 106"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path d="M204 26V13L154.5 38.5L162.5 46L204 26Z" fill={color} />
    <path d="M0 106V0H204L0 106Z" fill={color} />
  </svg>
);

export const CardFooter: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 41"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M129 22.6273C166.5 23.0083 194.5 8.33636 204 0V8.33636C166.5 27.5 150.5 25.5 129 22.6273Z"
      fill={color}
    />
    <path
      d="M0 20.4307V28C51.5 4.56204 91.5 17.1777 98 18.4392C57.6 1.28214 16 14.6544 0 20.4307Z"
      fill={color}
    />
    <path
      d="M0 33.6364V41H204V14C172.078 29.7091 147.138 29.953 126.688 26.2717C59.8521 14.2401 35.912 15.2273 0 33.6364Z"
      fill={color}
    />
  </svg>
);

export const CardFooter2: React.FC<{ color?: string }> = ({
  color = "#4D4D4D",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 204 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path d="M89.4059 9L0 54H54.5792L105 28.7802L89.4059 9Z" fill={color} />
    <path d="M204 0L106 54H204V0Z" fill={color} />
  </svg>
);

// -------------------- PREVIEW MODAL COMPONENTS --------------------
interface BadgePreviewProps {
  badge: Badge;
  event: any;
  CardHeader: React.FC<{ color?: string }>;
  CardFooter: React.FC<{ color?: string }>;
}

const Template1Preview: React.FC<BadgePreviewProps> = ({
  badge,
  event,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";
  const logoUrl = event?.attributes?.logo_url;

  return (
    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center">
          <div
            className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden shadow-lg"
            style={{
              backgroundColor: secondaryColor,
              maxWidth: "350px",
            }}
          >
            {/* Header Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "90px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardHeader color={primaryColor} />
              </div>
              {/* <div className="relative z-10 flex items-center gap-2">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-8 h-8 mb-3 rounded-full bg-white p-1"
                  />
                )}
                <h6 className="font-semibold mb-3 text-white text-lg">
                  Company Name
                </h6>
              </div> */}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col justify-center items-center p-6">
              <img
                src={badge.userImg}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                alt="User"
              />
              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                John Doe
              </h2>
              <p className="text-gray-600 text-lg mt-1">
                Software Engineer
              </p>
              
              {/* QR Code on front side */}
              <div className="mt-6 bg-white p-3 rounded-lg shadow-md">
                <img
                  src={badge.qrImg}
                  alt="QR Code"
                  className="w-24 h-24"
                />
                {/* <p className="text-center text-gray-500 text-xs mt-2">
                  Scan for details
                </p> */}
              </div>
            </div>

            {/* Footer Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "41px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardFooter color={primaryColor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Template2Preview: React.FC<BadgePreviewProps> = ({
  badge,
  event,
  CardHeader,
  CardFooter,
}) => {
  const primaryColor = event?.attributes?.primary_color || "#4D4D4D";
  const secondaryColor = event?.attributes?.secondary_color || "white";

  return (
    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center">
          <div
            className="flex flex-col h-[500px] w-full rounded-xl border-4 border-gray-300 overflow-hidden shadow-lg"
            style={{
              backgroundColor: secondaryColor,
              maxWidth: "350px",
            }}
          >
            {/* Header Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "106px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardHeader color={primaryColor} />
              </div>
              {/* <div className="relative z-10">
                <h6 className="font-semibold text-white text-xl">
                  Conference 2024
                </h6>
              </div> */}
            </div>

            <div className="flex flex-1 flex-col justify-center items-center p-6">
              <img
                src={badge.squareUserImg}
                className="w-24 h-24 object-cover rounded-lg border-4 border-white shadow-lg"
                alt="User"
              />
              <h2 className="text-2xl font-bold text-gray-900 mt-4">
                John Doe
              </h2>
              <p className="text-gray-600 text-lg mt-1">
                Software Engineer
              </p>
              
              {/* QR Code on front side */}
              <div className="mt-6 bg-white p-3 rounded-lg shadow-md">
                <img
                  src={badge.qrImg}
                  alt="QR Code"
                  className="w-24 h-24"
                />
                {/* <p className="text-center text-gray-500 text-xs mt-2">
                  Scan for details
                </p> */}
              </div>
            </div>

            {/* Footer Section - Fixed height container */}
            <div
              className="relative flex justify-center items-center gap-2 w-full overflow-hidden"
              style={{ height: "54px" }}
            >
              <div className="absolute inset-0 h-full w-full">
                <CardFooter color={primaryColor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Badge Preview Modal
interface CustomBadgePreviewProps {
  template: BadgeTemplate;
}

const CustomBadgePreview: React.FC<CustomBadgePreviewProps> = ({
  template,
}) => {
  // Convert pixels to inches if needed (if width > 50, assume it's in pixels)
  const widthInInches = template.width > 50 ? template.width / 96 : template.width;
  const heightInInches = template.height > 50 ? template.height / 96 : template.height;
  
  const previewWidth = widthInInches * 100;
  const previewHeight = heightInInches * 100;

  // Scaling ratio for positioning elements (100px per inch vs base units if any)
  const multiplier = 0.5;

  // Use the fixRedBackground function (defined in parent component)
  // For preview modal, we'll define it here too
  const getValidBgColor = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#ffffff";
    const color = bgColor.toLowerCase().trim();
    if (
      color === "#ff0000" ||
      color === "#f00" ||
      color === "red" ||
      color === "rgb(255, 0, 0)" ||
      color === "rgba(255, 0, 0, 1)" ||
      (color.startsWith("#ff") && (color.includes("0000") || color === "#ff0000" || color === "#ff00"))
    ) {
      return "#ffffff";
    }
    return bgColor;
  };

  const validBgColor = getValidBgColor(template.bgColor);

  return (
    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
      <div className="p-8">
        <div className="flex justify-center">
          <div className="flex justify-center">
            <div
              className="relative rounded-2xl shadow-xl overflow-hidden border-4 border-gray-300"
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                maxWidth: "100%",
                maxHeight: "100%",
                backgroundColor: template.hasBackground
                  ? validBgColor
                  : "#ffffff",
                backgroundImage:
                  template.hasBackground && template.bgImage
                    ? `url(${template.bgImage})`
                    : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {template.hasPersonalPhoto && template.photoSize && (
                <div
                  className="absolute rounded-full bg-gray-300 border-4 border-white flex items-center justify-center overflow-hidden"
                  style={{
                    width: `${(template.photoSize.width || 200) * multiplier}px`,
                    height: `${(template.photoSize.height || 200) * multiplier}px`,
                    left:
                      template.photoAlignment === "left"
                        ? `${(template.photoPosition?.x || 200) * multiplier}px`
                        : template.photoAlignment === "right"
                          ? "auto"
                          : "50%",
                    right:
                      template.photoAlignment === "right"
                        ? `${(template.photoPosition?.x || 200) * multiplier}px`
                        : "auto",
                    transform:
                      template.photoAlignment === "center"
                        ? "translateX(-50%)"
                        : "none",
                    top: `${(template.photoPosition?.y || 60) * multiplier}px`,
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500">Photo</span>
                  </div>
                </div>
              )}

              {template.hasName && template.nameText && (
                <div
                  className="absolute"
                  style={{
                    top: `${(template.nameText.position?.y || 280) * multiplier}px`,
                    left: "0",
                    width: "100%",
                    transform: "none",
                    textAlign: template.nameText.alignment || "center",
                  }}
                >
                  <div
                    className="font-bold px-4 whitespace-nowrap"
                    style={{
                      fontSize: `${(template.nameText.size || 24) * multiplier}px`,
                      color: template.nameText.color || "#ffffff",
                    }}
                  >
                    John Doe
                  </div>
                </div>
              )}

              {template.hasCompany && template.companyText && (
                <div
                  className="absolute"
                  style={{
                    top: `${(template.companyText.position?.y || 315) * multiplier
                      }px`,
                    left: "0",
                    width: "100%",
                    transform: "none",
                    textAlign: template.companyText.alignment || "center",
                  }}
                >
                  <div
                    className="px-4 whitespace-nowrap"
                    style={{
                      fontSize: `${(template.companyText.size || 18) * multiplier}px`,
                      color: template.companyText.color || "#cccccc",
                    }}
                  >
                    Tech Company
                  </div>
                </div>
              )}

              {template.hasTitle && template.titleText && (
                <div
                  className="absolute"
                  style={{
                    top: `${(template.titleText.position?.y || 350) * multiplier}px`,
                    left: "0",
                    width: "100%",
                    transform: "none",
                    textAlign: template.titleText.alignment || "center",
                  }}
                >
                  <div
                    className="px-4 whitespace-nowrap"
                    style={{
                      fontSize: `${(template.titleText.size || 16) * multiplier}px`,
                      color: template.titleText.color || "#999999",
                    }}
                  >
                    Software Engineer
                  </div>
                </div>
              )}

              {template.hasQrCode && template.qrCodeSize && (
                <div
                  className="absolute bg-white border-4 border-gray-400 flex items-center justify-center overflow-hidden rounded-lg"
                  style={{
                    width: `${(template.qrCodeSize.width || 120) * multiplier}px`,
                    height: `${(template.qrCodeSize.height || 120) * multiplier
                      }px`,
                    left:
                      template.qrCodeAlignment === "left"
                        ? `${(template.qrCodePosition?.x || 200) * multiplier}px`
                        : template.qrCodeAlignment === "right"
                          ? "auto"
                          : "50%",
                    right:
                      template.qrCodeAlignment === "right"
                        ? `${(template.qrCodePosition?.x || 200) * multiplier}px`
                        : "auto",
                    transform:
                      template.qrCodeAlignment === "center"
                        ? "translateX(-50%)"
                        : "none",
                    top: `${(template.qrCodePosition?.y || 400) * multiplier}px`,
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
                    <QrCode
                      size={(template.qrCodeSize.width || 120) * (multiplier * 0.5)}
                      className="text-gray-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- MAIN BADGES COMPONENT --------------------
const AdvanceBadge: React.FC<BadgesProps> = ({
  toggleStates,
  onNext,
  onPrevious,
  currentStep,
  eventId,
  plan,
}) => {
  console.log(plan, currentStep, eventId);

  // State for custom templates
  const [customTemplates, setCustomTemplates] = useState<BadgeTemplate[]>([]);
  const [allTemplatesFromApi, setAllTemplatesFromApi] = useState<any[]>([]); // Store all templates including Template 1 and 2
  const [selectedTemplate, setSelectedTemplate] =
    useState<BadgeTemplate | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] =
    useState<BadgeTemplate | null>(null);
  const [isEditCustomMode, setIsEditCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<any>(null);

  // Preview state
  const [previewBadge, setPreviewBadge] = useState<Badge | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BadgeTemplate | null>(
    null
  );

  // Original badge state
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [activeBadgeId, setActiveBadgeId] = useState<number | null>(null);

  const effectiveEventId = eventId || localStorage.getItem("create_eventId");

  console.log("Badges - Received eventId:", eventId);
  console.log("Badges - Effective eventId:", effectiveEventId);

  // Updated badges array with only Template 1 and Template 2 (with profile photos)
  const badges: Badge[] = [
    {
      id: 1,
      name: "Template 1",
      frontImg: Assets.images.b1_front,
      backImg: Assets.images.b1_back,
      userImg: Assets.images.user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header,
      cardFooter: Assets.images.card_footer,
    },
    {
      id: 3,
      name: "Template 2",
      frontImg: Assets.images.b3_front,
      backImg: Assets.images.b3_back,
      squareUserImg: Assets.images.square_user_img,
      qrImg: Assets.images.qr_img,
      cardHeader: Assets.images.card_header2,
      cardFooter: Assets.images.card_footer2,
    },
  ];

  // -------------------- API TRANSFORMATION HELPERS --------------------
  // Transform BadgeTemplate to API format
  const transformTemplateToApi = (template: BadgeTemplate) => {
    // Keep width/height in inches (API expects inches, not pixels)
    const width = template.width || 3.5;
    const height = template.height || 5.5;

    // Send full template_data structure with id field (API accepts it)
    const templateData: any = {
      id: template.id, // Include id field as API accepts it
      name: template.name || "Untitled",
      type: template.type || "custom",
      width: width,
      height: height,
      hasBackground: template.hasBackground ?? true,
      bgColor: template.bgColor || "#ffffff",
      hasPersonalPhoto: template.hasPersonalPhoto ?? false,
      photoSize: template.photoSize || { width: 200, height: 200 },
      photoAlignment: template.photoAlignment || "center",
      photoPosition: template.photoPosition || { x: 200, y: 60 },
      hasName: template.hasName ?? true,
      nameText: template.nameText || {
        size: 24,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 280 },
      },
      hasCompany: template.hasCompany ?? false,
      companyText: template.companyText || {
        size: 18,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 315 },
      },
      hasTitle: template.hasTitle ?? true,
      titleText: template.titleText || {
        size: 16,
        color: "#999999",
        alignment: "center",
        position: { x: 200, y: 350 },
      },
      hasQrCode: template.hasQrCode ?? false,
      qrCodeSize: template.qrCodeSize || { width: 120, height: 120 },
      qrCodePosition: template.qrCodePosition || { x: 200, y: 400 },
      qrCodeAlignment: template.qrCodeAlignment || "center",
    };

    // Only include bgImage if it's base64 (data:image/...), not a URL
    // If bgImage is a URL, the API stores it in attributes.background_image automatically
    // and we should NOT include it in template_data.bgImage (API expects base64 there)
    if (template.bgImage !== null && template.bgImage !== undefined && template.bgImage !== '') {
      // Check if it's base64 (starts with "data:image") or a URL (starts with "http")
      if (template.bgImage.startsWith('data:image')) {
        // It's base64 - include it in template_data
        templateData.bgImage = template.bgImage;
      } else if (template.bgImage.startsWith('http://') || template.bgImage.startsWith('https://')) {
        // It's a URL - DON'T include it in template_data.bgImage
        // The API will preserve it in attributes.background_image automatically
        console.log("bgImage is a URL, not including in template_data (API will preserve in attributes.background_image)");
      } else {
        // Unknown format - include it anyway (might be base64 without data: prefix)
        templateData.bgImage = template.bgImage;
      }
    }

    return {
      name: template.name || "Untitled",
      default: false,
      template_data: templateData,
    };
  };

  // Helper to fix red background colors
  const fixRedBackground = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#ffffff";
    const color = bgColor.toLowerCase().trim();
    // Check for various red color formats
    if (
      color === "#ff0000" ||
      color === "#f00" ||
      color === "red" ||
      color === "rgb(255, 0, 0)" ||
      color === "rgba(255, 0, 0, 1)" ||
      (color.startsWith("#ff") && (color.includes("0000") || color === "#ff0000" || color === "#ff00"))
    ) {
      return "#ffffff"; // Replace red with white
    }
    return bgColor;
  };

  // Transform API response to BadgeTemplate
  const transformApiToTemplate = (apiData: any): BadgeTemplate => {
    const templateData = apiData.attributes?.template_data || {};
    
    // Convert pixels to inches if needed (API might return pixels like 400x600)
    let width = templateData.width || 3.5;
    let height = templateData.height || 5.5;
    
    // If width/height are > 50, assume they're in pixels and convert to inches
    // Standard DPI is 96 pixels per inch
    if (width > 50) {
      width = width / 96;
    }
    if (height > 50) {
      height = height / 96;
    }
    
    return {
      id: apiData.id || `custom-${apiData.id}`,
      name: apiData.attributes?.name || templateData.name || "Untitled",
      type: "custom",
      width: width,
      height: height,
      hasBackground: templateData.hasBackground ?? true,
      bgColor: fixRedBackground(templateData.bgColor || "#ffffff"),
      bgImage: apiData.attributes?.background_image || templateData.bgImage || null,
      hasPersonalPhoto: templateData.hasPersonalPhoto ?? false,
      photoSize: templateData.photoSize || { width: 200, height: 200 },
      photoAlignment: templateData.photoAlignment || "center",
      photoPosition: templateData.photoPosition || { x: 200, y: 60 },
      hasName: templateData.hasName ?? true,
      nameText: templateData.nameText || {
        size: 24,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 280 },
      },
      hasCompany: templateData.hasCompany ?? false,
      companyText: templateData.companyText || {
        size: 18,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 315 },
      },
      hasTitle: templateData.hasTitle ?? true,
      titleText: templateData.titleText || {
        size: 16,
        color: "#999999",
        alignment: "center",
        position: { x: 200, y: 350 },
      },
      hasQrCode: templateData.hasQrCode ?? false,
      qrCodeSize: templateData.qrCodeSize || { width: 120, height: 120 },
      qrCodePosition: templateData.qrCodePosition || { x: 200, y: 400 },
      qrCodeAlignment: templateData.qrCodeAlignment || "center",
    };
  };

  // Existing badge templates (Only Template 1 and 2 as BadgeTemplate objects)
  const existingBadges: BadgeTemplate[] = [
    {
      id: "existing-1",
      name: "Template 1",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#2563eb",
      bgImage: null,
      hasPersonalPhoto: true,
      photoSize: { width: 120, height: 120 },
      photoAlignment: "center",
      photoPosition: { x: 200, y: 100 },
      hasName: true,
      nameText: {
        size: 18,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 240 },
      },
      hasCompany: true,
      companyText: {
        size: 14,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasTitle: true,
      titleText: {
        size: 12,
        color: "#999999",
        alignment: "center",
        position: { x: 200, y: 295 },
      },
      hasQrCode: true,
      qrCodeSize: { width: 120, height: 120 },
      qrCodePosition: { x: 200, y: 380 },
    },
    {
      id: "existing-3",
      name: "Template 2",
      type: "existing",
      width: 3.5,
      height: 5.5,
      hasBackground: true,
      bgColor: "#FFFFFF",
      bgImage: null,
      hasPersonalPhoto: true,
      photoSize: { width: 100, height: 100 },
      photoAlignment: "center",
      photoPosition: { x: 200, y: 120 },
      hasName: true,
      nameText: {
        size: 18,
        color: "#000000",
        alignment: "center",
        position: { x: 200, y: 240 },
      },
      hasCompany: false,
      companyText: {
        size: 14,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasTitle: true,
      titleText: {
        size: 12,
        color: "#666666",
        alignment: "center",
        position: { x: 200, y: 270 },
      },
      hasQrCode: true,
      qrCodeSize: { width: 120, height: 120 },
      qrCodePosition: { x: 200, y: 380 },
    },
  ];

  // Load custom templates from API only (API is the source of truth)
  useEffect(() => {
    // Load event data and custom templates from API
    if (effectiveEventId) {
      // Load event data and custom templates in parallel
      Promise.all([
        getEventbyId(effectiveEventId),
        getBadgesApi(parseInt(effectiveEventId, 10))
      ])
        .then(([eventResponse, templatesResponse]) => {
          const eventData = eventResponse?.data?.data;
          console.log("response of get event api", eventData);
          setEvent(eventData);

          const templatesData = templatesResponse?.data?.data || [];
          console.log("Custom badge templates from API:", templatesData);

          // Store all templates (including Template 1 and Template 2) for checking if they exist
          setAllTemplatesFromApi(templatesData);

          // Filter only custom templates (not default templates like "Template 1", "Template 2")
          const customTemplatesFromApi = templatesData
            .filter((item: any) => {
              const name = item.attributes?.name || "";
              // Exclude default templates
              return !["Template 1", "Template 2", "Badge 1", "Badge 2", "Badge 3", "Badge 4"].includes(name);
            })
            .map((item: any) => {
              const template = transformApiToTemplate(item) as BadgeTemplate;
              // Fix any red backgrounds in loaded templates
              template.bgColor = fixRedBackground(template.bgColor);
              return template;
            });

          // Always set templates from API (even if empty array) - API is the source of truth
          setCustomTemplates(customTemplatesFromApi);

          // Now that we have both event data and templates, set the active badge selection
          // Priority: 1. active_badge_id from event API, 2. default: true template, 3. localStorage (fallback only)
          let activeBadgeId = eventData?.attributes?.active_badge_id;
          
          // If no active_badge_id in event, check for default template
          if (!activeBadgeId && templatesData.length > 0) {
            const defaultTemplate = templatesData.find((item: any) => 
              item.attributes?.default === true
            );
            if (defaultTemplate) {
              const templateId = typeof defaultTemplate.id === 'string' 
                ? parseInt(defaultTemplate.id, 10) 
                : defaultTemplate.id;
              activeBadgeId = templateId;
              console.log("Found default template with ID:", activeBadgeId);
            }
          }
          
          // Last resort: check localStorage (only for backward compatibility, not for incognito)
          if (!activeBadgeId) {
            const localStorageId = parseInt(localStorage.getItem("active_badge_id") || "0", 10);
            if (localStorageId && localStorageId > 0) {
              // Only use if it's a valid badge ID (1 or 3) - not a template ID
              if (localStorageId === 1 || localStorageId === 3) {
                activeBadgeId = localStorageId;
                console.log("Using localStorage badge ID:", activeBadgeId);
              }
            }
          }

          if (activeBadgeId) {
            setActiveBadgeId(activeBadgeId);
            
            // First, check if active_badge_id matches a template ID in the API
            // This could be either an existing badge template (Template 1, Template 2) or a custom template
            const apiTemplate = templatesData.find((item: any) => {
              const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
              return itemId === activeBadgeId;
            });
            
            if (apiTemplate) {
              const templateName = apiTemplate.attributes?.name || "";
              
              // Check if it's an existing badge template (Template 1 or Template 2)
              if (templateName === "Template 1" || templateName === "Template 2") {
                // Find the corresponding badge by name
                const foundBadge = badges.find((b) => b.name === templateName);
                if (foundBadge) {
                  setSelectedBadge(foundBadge);
                  setSelectedTemplate(null); // Ensure custom template is not selected
                  console.log("Selected existing badge:", foundBadge.name);
                }
              } else {
                // It's a custom template
                const transformedTemplate = transformApiToTemplate(apiTemplate) as BadgeTemplate;
                transformedTemplate.bgColor = fixRedBackground(transformedTemplate.bgColor);
                setSelectedTemplate(transformedTemplate);
                setSelectedBadge(null); // Ensure existing badge is not selected
                console.log("Selected custom template:", transformedTemplate.name);
              }
            } else {
              // active_badge_id doesn't match any template ID, might be a legacy badge ID (1 or 3)
              // Try to find if it's an existing badge ID
              const foundBadge = badges.find((b) => b.id === activeBadgeId);
              if (foundBadge) {
                setSelectedBadge(foundBadge);
                setSelectedTemplate(null);
                console.log("Selected existing badge by ID:", foundBadge.name);
              } else {
                // Try to find in custom templates by ID format
                const foundTemplate = customTemplatesFromApi.find(
                  (t: BadgeTemplate) => {
                    const tId = typeof t.id === 'string' ? parseInt(t.id, 10) : t.id;
                    return tId === activeBadgeId || 
                           t.id === activeBadgeId.toString() || 
                           t.id === `custom-${activeBadgeId}`;
                  }
                );
                if (foundTemplate) {
                  setSelectedTemplate(foundTemplate);
                  setSelectedBadge(null);
                  console.log("Selected custom template by ID:", foundTemplate.name);
                }
              }
            }
          } else {
            console.log("No active badge found in API or localStorage");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch event data or templates:", error);
        });
    } else {
      // No event ID, clear templates
      setCustomTemplates([]);
    }
  }, [effectiveEventId]);

  // Reload custom templates and event data from API
  const reloadCustomTemplates = async () => {
    if (!effectiveEventId) return;
    
    try {
      // Reload both event data and templates to get latest selection state
      const [eventResponse, templatesResponse] = await Promise.all([
        getEventbyId(effectiveEventId),
        getBadgesApi(parseInt(effectiveEventId, 10))
      ]);
      
      const eventData = eventResponse?.data?.data;
      const templatesData = templatesResponse?.data?.data || [];
      
      // Update event data
      setEvent(eventData);
      
      // Store all templates (including Template 1 and Template 2) for checking if they exist
      setAllTemplatesFromApi(templatesData);
      
      const customTemplatesFromApi = templatesData
        .filter((item: any) => {
          const name = item.attributes?.name || "";
          return !["Template 1", "Template 2", "Badge 1", "Badge 2", "Badge 3", "Badge 4"].includes(name);
        })
        .map((item: any) => {
          const template = transformApiToTemplate(item) as BadgeTemplate;
          template.bgColor = fixRedBackground(template.bgColor);
          return template;
        });
      
      setCustomTemplates(customTemplatesFromApi);
      
      // Update selection state based on latest API data
      let activeBadgeId = eventData?.attributes?.active_badge_id;
      
      // If no active_badge_id in event, check for default template
      if (!activeBadgeId && templatesData.length > 0) {
        const defaultTemplate = templatesData.find((item: any) => 
          item.attributes?.default === true
        );
        if (defaultTemplate) {
          const templateId = typeof defaultTemplate.id === 'string' 
            ? parseInt(defaultTemplate.id, 10) 
            : defaultTemplate.id;
          activeBadgeId = templateId;
        }
      }
      
      if (activeBadgeId) {
        setActiveBadgeId(activeBadgeId);
        
        const apiTemplate = templatesData.find((item: any) => {
          const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;
          return itemId === activeBadgeId;
        });
        
        if (apiTemplate) {
          const templateName = apiTemplate.attributes?.name || "";
          
          if (templateName === "Template 1" || templateName === "Template 2") {
            const foundBadge = badges.find((b) => b.name === templateName);
            if (foundBadge) {
              setSelectedBadge(foundBadge);
              setSelectedTemplate(null);
            }
          } else {
            const transformedTemplate = transformApiToTemplate(apiTemplate) as BadgeTemplate;
            transformedTemplate.bgColor = fixRedBackground(transformedTemplate.bgColor);
            setSelectedTemplate(transformedTemplate);
            setSelectedBadge(null);
          }
        } else {
          const foundBadge = badges.find((b) => b.id === activeBadgeId);
          if (foundBadge) {
            setSelectedBadge(foundBadge);
            setSelectedTemplate(null);
          }
        }
      }
    } catch (error) {
      console.error("Failed to reload custom badge templates:", error);
    }
  };

  // -------------------- CUSTOM TEMPLATE FUNCTIONS --------------------
  const handleCreateNewTemplate = () => {
    setEditingCustomTemplate(null);
    setIsEditCustomMode(false);
    setIsCustomModalOpen(true);
  };

  const handleEditCustomTemplate = (template: BadgeTemplate) => {
    setEditingCustomTemplate(template);
    setIsEditCustomMode(true);
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomTemplate = async (template: BadgeTemplate) => {
    if (!effectiveEventId) {
      toast.error("Event ID not found. Cannot save template.");
      return;
    }

    setLoading(true);
    try {
      // Transform template to API format
      const apiData = transformTemplateToApi(template);
      const requestData = {
        badge_template: apiData,
      };

      console.log("Saving badge template to API:", JSON.stringify(requestData, null, 2));

      let response;
      
      if (isEditCustomMode && editingCustomTemplate) {
        // Extract numeric ID from template ID for PUT request
        let numericId: number | null = null;
        const templateId = editingCustomTemplate.id;
        
        // Try direct parse (for API IDs like "58")
        const directParse = parseInt(templateId, 10);
        if (!isNaN(directParse) && directParse > 0) {
          numericId = directParse;
        } else if (templateId.startsWith("custom-")) {
          // Extract from formats like "custom-badge-123" or "custom-123"
          const parts = templateId.split("-");
          const lastPart = parts[parts.length - 1];
          const parsed = parseInt(lastPart, 10);
          if (!isNaN(parsed) && parsed > 0) {
            numericId = parsed;
          }
        }

        if (!numericId || numericId === 0) {
          toast.error("Invalid template ID. Cannot update template.");
          setLoading(false);
          return;
        }

        // Preserve bgImage from existing template if the new template doesn't have one
        // Find the existing template from API to preserve background_image and bgImage
        const existingTemplateFromApi = allTemplatesFromApi.find(
          (t: any) => {
            const tId = typeof t.id === 'string' ? parseInt(t.id, 10) : t.id;
            return tId === numericId;
          }
        );

        // Preserve bgImage if it exists in the existing template but not in the new template
        if (existingTemplateFromApi && !template.bgImage) {
          const existingBgImage = existingTemplateFromApi?.attributes?.template_data?.bgImage;
          const existingBackgroundImageUrl = existingTemplateFromApi?.attributes?.background_image;
          
          if (existingBgImage) {
            apiData.template_data.bgImage = existingBgImage;
          } else if (existingBackgroundImageUrl) {
            apiData.template_data.bgImage = existingBackgroundImageUrl;
          }
          
          // Update requestData with the preserved bgImage
          requestData.badge_template = apiData;
        }

        // Call PUT API for update
        console.log(`Updating badge template ${numericId} for event ${effectiveEventId}`);
        response = await updateBadgeTemplateApi(
          parseInt(effectiveEventId, 10),
          numericId,
          requestData
        );
      } else {
        // Call POST API for create
        response = await postBadgesApi(
          requestData,
          parseInt(effectiveEventId, 10)
        );
      }

      console.log("Badge template saved successfully:", response.data);

      toast.success(
        `Template ${isEditCustomMode ? "updated" : "created"} successfully!`
      );
      
      // Close modal after successful save
      setIsCustomModalOpen(false);
      
      // Reload templates from API to get the latest data
      await reloadCustomTemplates();
    } catch (error: any) {
      console.error("Failed to save badge template:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
      
      // Show detailed validation errors if available
      let errorMessage = `Failed to ${isEditCustomMode ? "update" : "create"} template.`;
      
      if (error?.response?.data?.errors) {
        // Handle validation errors object
        const errors = error.response.data.errors;
        console.error("Full validation errors object:", JSON.stringify(errors, null, 2));
        
        // Check if errors.errors is an array of error objects
        if (Array.isArray(errors.errors)) {
          // Extract messages from error objects
          const messages = errors.errors.map((err: any) => {
            if (typeof err === "string") {
              return err;
            } else if (err?.message) {
              return err.message;
            } else if (err?.field && err?.code) {
              return `${err.field}: ${err.message || err.code}`;
            }
            return JSON.stringify(err);
          });
          errorMessage = messages.length > 0 ? messages.join(", ") : "Validation failed";
        } else if (errors.errors && typeof errors.errors === "object") {
          // Handle errors.errors as an object
          const errorMessages = Object.entries(errors.errors)
            .map(([field, messages]: [string, any]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(", ")}`;
            })
            .join(", ");
          errorMessage = errorMessages || "Validation failed";
        } else {
          // Fallback: try to stringify the errors
          errorMessage = errors.message || "Validation failed";
        }
        console.error("Validation errors:", errors);
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    if (!effectiveEventId) {
      toast.error("Event ID not found. Cannot delete template.");
      return;
    }

    // Extract numeric ID from template ID
    // Template ID formats:
    // - From API: "58", "50" (numeric string)
    // - Locally generated: "custom-badge-1767063894117" (timestamp-based)
    // - Legacy: "custom-58" (if any)
    let numericId: number | null = null;
    
    // First, try direct parse (for API IDs like "58")
    const directParse = parseInt(templateId, 10);
    if (!isNaN(directParse) && directParse > 0) {
      numericId = directParse;
    } else if (templateId.startsWith("custom-")) {
      // Extract from formats like "custom-badge-123" or "custom-123"
      const parts = templateId.split("-");
      const lastPart = parts[parts.length - 1];
      const parsed = parseInt(lastPart, 10);
      if (!isNaN(parsed) && parsed > 0) {
        numericId = parsed;
      }
    }

    // If we still don't have a valid numeric ID, we can't delete from API
    if (!numericId || numericId === 0) {
      toast.error("Invalid template ID. Cannot delete from server.");
      return;
    }

    setLoading(true);
    try {
      console.log(`Deleting badge template ${numericId} from event ${effectiveEventId}`);
      
      // Call DELETE API
      await deleteBadgeTemplateApi(
        parseInt(effectiveEventId, 10),
        numericId
      );

      // Clear selection if deleted template was selected
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }

      toast.success("Template deleted successfully!");
      
      // Reload templates from API to get the latest data
      await reloadCustomTemplates();
    } catch (error: any) {
      console.error("Failed to delete badge template:", error);
      toast.error(
        error?.response?.data?.error || "Failed to delete template."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: BadgeTemplate) => {
    // If clicking the same template that's already selected, deselect it
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
      toast.success("Template deselected!");
    } else {
      // Select new template and deselect any existing badge
      setSelectedTemplate(template);
      setSelectedBadge(null);
      toast.success("Template selected!");
    }
  };

  const handlePreviewBadge = (badge: Badge) => {
    setPreviewBadge(badge);
    setPreviewTemplate(null);
  };

  const handlePreviewTemplate = (template: BadgeTemplate) => {
    setPreviewTemplate(template);
    setPreviewBadge(null);
  };

  const closePreview = () => {
    setPreviewBadge(null);
    setPreviewTemplate(null);
  };

  // -------------------- EXISTING BADGE FUNCTIONS --------------------
  const handleSelectExistingBadge = (badge: Badge) => {
    // If clicking the same badge that's already selected, deselect it
    if (selectedBadge?.id === badge.id) {
      setSelectedBadge(null);
    } else {
      // Select new badge and deselect any custom template
      setSelectedBadge(badge);
      setSelectedTemplate(null);
    }
  };

  // -------------------- RENDER FUNCTIONS --------------------
  const renderExistingBadgePreview = (badge: Badge) => {
    const primaryColor = event?.attributes?.primary_color || "#2563eb";
    const secondaryColor = event?.attributes?.secondary_color || "white";
    const logoUrl = event?.attributes?.logo_url;

    return (
      <div
        className="flex flex-col h-full w-48 rounded-xl border overflow-hidden"
        style={{ backgroundColor: secondaryColor }}
      >
        {/* Header Section */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "90px" }}
        >
          <div className="absolute inset-0 h-full w-full">
            {badge.id === 1 ? (
              <CardHeader color={primaryColor} />
            ) : (
              <CardHeader2 color={primaryColor} />
            )}
          </div>

          {/* Header content for different badges */}
          {/* {badge.id === 1 && (
            <div className="relative z-10 flex items-center justify-center gap-2 h-full">
              {logoUrl && <img src={logoUrl} alt="Logo" className="w-4 h-4" />}
              <h6 className="font-semibold text-white text-xs">Company Name</h6>
            </div>
          )}
          {badge.id === 3 && (
            <div className="relative z-10 flex items-center justify-center h-full">
              <h6 className="font-semibold text-white text-xs">
                Conference 2024
              </h6>
            </div>
          )} */}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-center items-center p-4">
          {/* Photo - both badges have profile photos */}
          <div
            className={`${
              badge.id === 3 ? "w-12 h-12 rounded-full" : "w-12 h-12 rounded-full"
            } bg-gray-300 mb-2 flex items-center justify-center overflow-hidden`}
          >
            {badge.id === 1 ? (
              <img
                src={badge.userImg}
                className="w-full h-full object-cover"
                alt="User"
              />
            ) : (
              <img
                src={badge.squareUserImg}
                className="w-full h-full object-cover"
                alt="User"
              />
            )}
          </div>

          {/* Name */}
          <h2
            className={`text-xs font-bold ${
              badge.id === 3 ? "text-gray-900" : "text-gray-900"
            } mb-1`}
          >
            John Doe
          </h2>

          {/* Title */}
          <p className="text-xs text-gray-600 mb-2">
            Software Engineer
          </p>

          {/* QR Code on front side */}
          <div className="w-10 h-10 bg-white rounded border border-gray-300 flex items-center justify-center">
            <QrCode size={20} className="text-gray-600" />
          </div>
        </div>

        {/* Footer Section */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: badge.id === 1 ? "41px" : "54px" }}
        >
          <div className="absolute inset-0 h-full w-full">
            {badge.id === 1 ? (
              <CardFooter color={primaryColor} />
            ) : (
              <CardFooter2 color={primaryColor} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to validate and fix background color
  const getValidBackgroundColor = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#ffffff";
    const color = bgColor.toLowerCase().trim();
    // Check if it's a red color (common red hex codes)
    if (
      color === "#ff0000" ||
      color === "#f00" ||
      color === "red" ||
      color.startsWith("#ff") && (color.includes("0000") || color === "#ff0000" || color === "#ff00")
    ) {
      return "#ffffff"; // Replace red with white
    }
    return bgColor;
  };

  const renderCustomBadgePreview = (template: BadgeTemplate) => {
    const previewScale = 55;
    const internalScale = 0.275;
    
    // Convert pixels to inches if needed (if width > 50, assume it's in pixels)
    // 1 inch = 96 pixels (standard DPI), so divide by 96 to convert
    const widthInInches = template.width > 50 ? template.width / 96 : template.width;
    const heightInInches = template.height > 50 ? template.height / 96 : template.height;
    
    const previewWidth = widthInInches * previewScale;
    const previewHeight = heightInInches * previewScale;
    const validBgColor = getValidBackgroundColor(template.bgColor);

    return (
      <div className="flex flex-col items-center justify-center p-4 overflow-hidden">
        <div
          className="relative rounded-xl shadow-md overflow-hidden border border-gray-200"
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            maxWidth: "100%",
            maxHeight: "100%",
            backgroundColor: template.hasBackground
              ? validBgColor
              : "#ffffff",
            backgroundImage:
              template.hasBackground && template.bgImage
                ? `url(${template.bgImage})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {template.hasPersonalPhoto && template.photoSize && (
            <div
              className="absolute rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden"
              style={{
                width: `${(template.photoSize.width || 200) * internalScale}px`,
                height: `${(template.photoSize.height || 200) * internalScale}px`,
                left:
                  template.photoAlignment === "left"
                    ? `${(template.photoPosition?.x || 200) * internalScale}px`
                    : template.photoAlignment === "right"
                      ? "auto"
                      : "50%",
                right:
                  template.photoAlignment === "right"
                    ? `${(template.photoPosition?.x || 200) * internalScale}px`
                    : "auto",
                transform:
                  template.photoAlignment === "center"
                    ? "translateX(-50%)"
                    : "none",
                top: `${(template.photoPosition?.y || 60) * internalScale}px`,
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            </div>
          )}

          {template.hasName && template.nameText && (
            <div
              className="absolute"
              style={{
                top: `${(template.nameText.position?.y || 280) * internalScale}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.nameText.alignment || "center",
              }}
            >
              <div
                className="font-bold px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.nameText.size || 24) * internalScale}px`,
                  color: template.nameText.color || "#ffffff",
                }}
              >
                Name
              </div>
            </div>
          )}

          {template.hasCompany && template.companyText && (
            <div
              className="absolute"
              style={{
                top: `${(template.companyText.position?.y || 315) * internalScale}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.companyText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.companyText.size || 18) * internalScale}px`,
                  color: template.companyText.color || "#cccccc",
                }}
              >
                Company
              </div>
            </div>
          )}

          {template.hasTitle && template.titleText && (
            <div
              className="absolute"
              style={{
                top: `${(template.titleText.position?.y || 350) * internalScale}px`,
                left: "0",
                width: "100%",
                transform: "none",
                textAlign: template.titleText.alignment || "center",
              }}
            >
              <div
                className="px-2 whitespace-nowrap"
                style={{
                  fontSize: `${(template.titleText.size || 16) * internalScale}px`,
                  color: template.titleText.color || "#999999",
                }}
              >
                Title
              </div>
            </div>
          )}

          {template.hasQrCode && template.qrCodeSize && (
            <div
              className="absolute bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden"
              style={{
                width: `${(template.qrCodeSize.width || 120) * internalScale}px`,
                height: `${(template.qrCodeSize.height || 120) * internalScale}px`,
                left:
                  template.qrCodeAlignment === "left"
                    ? `${(template.qrCodePosition?.x || 200) * internalScale}px`
                    : template.qrCodeAlignment === "right"
                      ? "auto"
                      : "50%",
                right:
                  template.qrCodeAlignment === "right"
                    ? `${(template.qrCodePosition?.x || 200) * internalScale}px`
                    : "auto",
                transform:
                  template.qrCodeAlignment === "center"
                    ? "translateX(-50%)"
                    : "none",
                top: `${(template.qrCodePosition?.y || 400) * internalScale}px`,
              }}
            >
              <QrCode
                size={(template.qrCodeSize.width || 120) * internalScale * 0.5}
                className="text-gray-400"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // -------------------- API INTEGRATION --------------------
  const handleBadgeApiSelection = async (
    badgeId: number,
    badgeName: string
  ) => {
    if (!effectiveEventId) {
      throw new Error("Event ID not found");
    }

    // Find the template data from existingBadges array
    const templateData = existingBadges.find(
      (badge) => badge.id === `existing-${badgeId}` || badge.name === badgeName
    );

    // Construct full template_data for API
    // For ready-made templates, ensure we use the correct default bgColor
    const defaultBgColor = templateData?.bgColor || (badgeName === "Template 1" ? "#2563eb" : badgeName === "Template 2" ? "#FFFFFF" : "#ffffff");
    
    const fullTemplateData = templateData
      ? {
          name: templateData.name,
          type: templateData.type || "existing",
          width: templateData.width || 3.5,
          height: templateData.height || 5.5,
          hasBackground: templateData.hasBackground ?? true,
          bgColor: templateData.bgColor || defaultBgColor,
          hasPersonalPhoto: templateData.hasPersonalPhoto ?? false,
          photoSize: templateData.photoSize || { width: 200, height: 200 },
          photoAlignment: templateData.photoAlignment || "center",
          photoPosition: templateData.photoPosition || { x: 200, y: 60 },
          hasName: templateData.hasName ?? true,
          nameText: templateData.nameText || {
            size: 24,
            color: "#000000",
            alignment: "center",
            position: { x: 200, y: 280 },
          },
          hasCompany: templateData.hasCompany ?? false,
          companyText: templateData.companyText || {
            size: 18,
            color: "#666666",
            alignment: "center",
            position: { x: 200, y: 315 },
          },
          hasTitle: templateData.hasTitle ?? true,
          titleText: templateData.titleText || {
            size: 16,
            color: "#999999",
            alignment: "center",
            position: { x: 200, y: 350 },
          },
          hasQrCode: templateData.hasQrCode ?? false,
          qrCodeSize: templateData.qrCodeSize || { width: 120, height: 120 },
          qrCodePosition: templateData.qrCodePosition || { x: 200, y: 400 },
          qrCodeAlignment: templateData.qrCodeAlignment || "center",
        }
      : {
          name: badgeName,
          type: "existing",
          width: 3.5,
          height: 5.5,
          hasBackground: true,
          bgColor: defaultBgColor,
          hasPersonalPhoto: true,
          photoSize: { width: 200, height: 200 },
          photoAlignment: "center",
          photoPosition: { x: 200, y: 60 },
          hasName: true,
          nameText: {
            size: 24,
            color: "#000000",
            alignment: "center",
            position: { x: 200, y: 280 },
          },
          hasCompany: false,
          companyText: {
            size: 18,
            color: "#666666",
            alignment: "center",
            position: { x: 200, y: 315 },
          },
          hasTitle: true,
          titleText: {
            size: 16,
            color: "#999999",
            alignment: "center",
            position: { x: 200, y: 350 },
          },
          hasQrCode: true,
          qrCodeSize: { width: 120, height: 120 },
          qrCodePosition: { x: 200, y: 400 },
          qrCodeAlignment: "center",
        };

    const data = {
      badge_template: {
        name: badgeName,
        default: true,
        template_data: fullTemplateData,
      },
    };

    const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
    console.log("Response of post badge api:", response.data);
    return response;
  };

  const handleCustomBadgeApiSelection = async (template: BadgeTemplate) => {
    if (!effectiveEventId) {
      throw new Error("Event ID not found");
    }

    // Transform template to API format
    const apiData = transformTemplateToApi(template);
    const data = {
      badge_template: {
        ...apiData,
        default: true, // Set as default when selecting
      },
    };

    const response = await postBadgesApi(data, parseInt(effectiveEventId, 10));
    return response;
  };

  const selectBadgeAndContinue = async () => {
    if (!selectedBadge && !selectedTemplate) {
      toast.error("Please select a badge template first!");
      return;
    }

    setLoading(true);
    try {
      if (selectedBadge) {
        // Check if Template 1 or Template 2 already exists in API
        const existingTemplate = allTemplatesFromApi.find(
          (item: any) => item.attributes?.name === selectedBadge.name
        );

        if (existingTemplate) {
          // Template already exists, update it to set default: true via PUT API
          const templateId = existingTemplate.id;
          const numericId = typeof templateId === 'string' ? parseInt(templateId, 10) : templateId;
          
          if (!isNaN(numericId) && numericId > 0 && effectiveEventId) {
            // Get existing template data from API (preserve what's already there)
            const existingTemplateData = existingTemplate.attributes?.template_data || {};
            
            // Get the full template data from existingBadges (for defaults)
            const templateData = existingBadges.find(
              (badge) => badge.id === `existing-${selectedBadge.id}` || badge.name === selectedBadge.name
            );

            // Merge: Use API data first, then fallback to local templateData, then defaults
            // This ensures bgColor from API is preserved, but if API doesn't have one, use template default
            // For ready-made templates, always ensure bgColor is set from template defaults if missing
            // Get the correct default bgColor for this template
            const templateDefaultBgColor = templateData?.bgColor || (selectedBadge.id === 1 ? "#2563eb" : selectedBadge.id === 3 ? "#FFFFFF" : "#ffffff");
            const apiBgColor = existingTemplateData.bgColor;
            // Use API bgColor if it exists and is not empty, otherwise use template default
            const finalBgColor = (apiBgColor && apiBgColor.trim() !== "" && apiBgColor.trim() !== "null") ? apiBgColor : templateDefaultBgColor;
            
            const fullTemplateData = {
              name: existingTemplateData.name || templateData?.name || selectedBadge.name,
              type: existingTemplateData.type || templateData?.type || "existing",
              width: existingTemplateData.width || templateData?.width || 3.5,
              height: existingTemplateData.height || templateData?.height || 5.5,
              hasBackground: existingTemplateData.hasBackground ?? templateData?.hasBackground ?? true,
              bgColor: finalBgColor, // Use API bgColor if available, otherwise use template default
              hasPersonalPhoto: existingTemplateData.hasPersonalPhoto ?? templateData?.hasPersonalPhoto ?? false,
              photoSize: existingTemplateData.photoSize || templateData?.photoSize || { width: 200, height: 200 },
              photoAlignment: existingTemplateData.photoAlignment || templateData?.photoAlignment || "center",
              photoPosition: existingTemplateData.photoPosition || templateData?.photoPosition || { x: 200, y: 60 },
              hasName: existingTemplateData.hasName ?? templateData?.hasName ?? true,
              nameText: existingTemplateData.nameText || templateData?.nameText || {
                size: 24,
                color: "#000000",
                alignment: "center",
                position: { x: 200, y: 280 },
              },
              hasCompany: existingTemplateData.hasCompany ?? templateData?.hasCompany ?? false,
              companyText: existingTemplateData.companyText || templateData?.companyText || {
                size: 18,
                color: "#666666",
                alignment: "center",
                position: { x: 200, y: 315 },
              },
              hasTitle: existingTemplateData.hasTitle ?? templateData?.hasTitle ?? true,
              titleText: existingTemplateData.titleText || templateData?.titleText || {
                size: 16,
                color: "#999999",
                alignment: "center",
                position: { x: 200, y: 350 },
              },
              hasQrCode: existingTemplateData.hasQrCode ?? templateData?.hasQrCode ?? false,
              qrCodeSize: existingTemplateData.qrCodeSize || templateData?.qrCodeSize || { width: 120, height: 120 },
              qrCodePosition: existingTemplateData.qrCodePosition || templateData?.qrCodePosition || { x: 200, y: 400 },
              qrCodeAlignment: existingTemplateData.qrCodeAlignment || templateData?.qrCodeAlignment || "center",
            };

            const updateData = {
              badge_template: {
                name: selectedBadge.name,
                default: true, // Set as default
                template_data: fullTemplateData,
              },
            };

            await updateBadgeTemplateApi(
              parseInt(effectiveEventId, 10),
              numericId,
              updateData
            );
            console.log(`Updated ready-made badge template ${numericId} to default`);
            console.log("Template bgColor:", fullTemplateData.bgColor);
          }
          toast.success("Template selected!");
          setActiveBadgeId(selectedBadge.id);
          
          // Update event's active_badge_id in API for cross-device visibility
          if (effectiveEventId) {
            const fd = new FormData();
            fd.append("event[active_badge_id]", numericId.toString());
            try {
              await updateEventById(effectiveEventId, fd);
              console.log(`Updated event active_badge_id to ${numericId} for cross-device visibility`);
            } catch (error) {
              console.error("Failed to update event active_badge_id:", error);
            }
          }
        } else {
          // Template doesn't exist, create it via POST API
          const response = await handleBadgeApiSelection(
            selectedBadge.id,
            selectedBadge.name
          );
          toast.success("Template selected!");
          setActiveBadgeId(selectedBadge.id);
          
          // Update event's active_badge_id in API for cross-device visibility
          // The response should contain the created template ID
          if (effectiveEventId && response?.data?.data?.id) {
            const createdTemplateId = response.data.data.id;
            const fd = new FormData();
            fd.append("event[active_badge_id]", createdTemplateId.toString());
            try {
              await updateEventById(effectiveEventId, fd);
              console.log(`Updated event active_badge_id to ${createdTemplateId} for cross-device visibility`);
            } catch (error) {
              console.error("Failed to update event active_badge_id:", error);
            }
          }
        }

        // Save only required data for PrintBadges
        // For ready-made templates, ALWAYS use event colors from main data
        // This ensures consistency between badge screen and print badge
        localStorage.setItem("active_badge_id", selectedBadge.id.toString());
        localStorage.setItem("badge_qr_image", selectedBadge.qrImg);
        localStorage.setItem(
          "badge_header_color",
          event?.attributes?.primary_color || "#4D4D4D"
        );
        localStorage.setItem(
          "badge_footer_color",
          event?.attributes?.primary_color || "#4D4D4D"
        );
        localStorage.setItem(
          "badge_background_color",
          event?.attributes?.secondary_color || "white" // Use event's secondary_color from main data
        );
      } else if (selectedTemplate) {
        // Custom template selected - update it to set as default
        // Extract numeric ID from template ID for PUT request
        let numericId: number | null = null;
        const templateId = selectedTemplate.id;
        
        // Try direct parse (for API IDs like "58")
        const directParse = parseInt(templateId, 10);
        if (!isNaN(directParse) && directParse > 0) {
          numericId = directParse;
        } else if (templateId.startsWith("custom-")) {
          // Extract from formats like "custom-badge-123" or "custom-123"
          const parts = templateId.split("-");
          const lastPart = parts[parts.length - 1];
          const parsed = parseInt(lastPart, 10);
          if (!isNaN(parsed) && parsed > 0) {
            numericId = parsed;
          }
        }

        if (numericId && numericId > 0 && effectiveEventId) {
          // Find the existing template from API to preserve background_image and bgImage
          const existingTemplateFromApi = allTemplatesFromApi.find(
            (t: any) => {
              const tId = typeof t.id === 'string' ? parseInt(t.id, 10) : t.id;
              return tId === numericId;
            }
          );

          // CRITICAL: Preserve bgImage from existing template
          // The API stores base64 in template_data.bgImage OR URL in attributes.background_image
          // We need to preserve it correctly based on where it's stored
          const existingBgImage = existingTemplateFromApi?.attributes?.template_data?.bgImage;
          const existingBackgroundImageUrl = existingTemplateFromApi?.attributes?.background_image;
          
          // Create a copy of selectedTemplate with preserved bgImage if it exists in the API
          const templateWithPreservedBgImage = { ...selectedTemplate };
          
          // Priority: 
          // 1. If template_data.bgImage exists (base64), use it
          // 2. If attributes.background_image exists (URL), use it (transformTemplateToApi will handle it correctly)
          // 3. Otherwise use selectedTemplate.bgImage
          if (existingBgImage) {
            // Preserve existing bgImage (base64) from API template_data
            templateWithPreservedBgImage.bgImage = existingBgImage;
            console.log("Preserving bgImage (base64) from existing template:", existingBgImage.substring(0, 50) + "...");
          } else if (existingBackgroundImageUrl) {
            // Preserve existing background_image (URL) from API attributes
            // transformTemplateToApi will detect it's a URL and NOT include it in template_data.bgImage
            // The API will preserve attributes.background_image automatically
            templateWithPreservedBgImage.bgImage = existingBackgroundImageUrl;
            console.log("Preserving background_image (URL) from existing template:", existingBackgroundImageUrl);
          } else if (selectedTemplate.bgImage) {
            // Use selectedTemplate's bgImage if it exists
            console.log("Using selectedTemplate.bgImage:", selectedTemplate.bgImage.substring(0, 50) + "...");
          } else {
            console.log("No bgImage found anywhere");
          }

          // Update the template to set it as default
          // transformTemplateToApi will automatically exclude URLs from template_data.bgImage
          const apiData = transformTemplateToApi(templateWithPreservedBgImage);
          
          console.log("Final bgImage in apiData.template_data:", apiData.template_data.bgImage ? "exists (base64)" : "not included (URL will be preserved in attributes.background_image)");

          const updateData = {
            badge_template: {
              ...apiData,
              default: true, // Set as default
            },
          };

          await updateBadgeTemplateApi(
            parseInt(effectiveEventId, 10),
            numericId,
            updateData
          );
          console.log(`Updated custom badge template ${numericId} to default`);
          console.log("Background image (bgImage):", updateData.badge_template.template_data?.bgImage);
          console.log("Background image URL:", existingTemplateFromApi?.attributes?.background_image);
          
          // Update event's active_badge_id in API for cross-device visibility
          if (effectiveEventId) {
            const fd = new FormData();
            fd.append("event[active_badge_id]", numericId.toString());
            try {
              await updateEventById(effectiveEventId, fd);
              console.log(`Updated event active_badge_id to ${numericId} for cross-device visibility`);
            } catch (error) {
              console.error("Failed to update event active_badge_id:", error);
            }
          }
        }

        toast.success("Custom template selected!");
      }

      setTimeout(() => {
        if (effectiveEventId && onNext) {
          onNext(effectiveEventId, plan);
        } else {
          onNext();
        }
      }, 1000);
    } catch (error) {
      toast.error("Failed to select template.");
      console.error("Template selection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-5 bg-white p-5 rounded-2xl">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <ChevronLeft />
          <p className="text-neutral-900 text-md font-poppins font-normal">
            Choose a Badge Template
          </p>
        </div>
      </div>

      {/* Badge Templates Grid */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Custom Badge Creation Card (First Position) */}
        <div
          onClick={handleCreateNewTemplate}
          className="border-2 border-dashed border-gray-300 rounded-3xl p-6 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center min-h-[350px]"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-pink-500" size={32} />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center text-pink-500">
            Create Custom Badge
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Design a custom badge template from scratch
          </p>
        </div>

        {/* Custom Templates */}
        {customTemplates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div
              key={template.id}
              className={`border-2 rounded-3xl p-4 transition-colors flex flex-col min-h-[350px] overflow-hidden ${isSelected
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-pink-500 bg-white"
                }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handlePreviewTemplate(template)}
              >
                <div className="flex items-center justify-center">
                  {renderCustomBadgePreview(template)}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {template.name}
                  </span>
                  <div className="flex gap-2">
                    {isSelected && (
                      <div className="flex items-center">
                        <Check size={16} className="text-pink-500 mr-1" />
                        <span className="text-sm text-pink-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Default Templates (Only Template 1 and Template 2) */}
        {badges.map((badge) => {
          const isActive = selectedBadge?.id === badge.id;

          return (
            <div
              key={badge.id}
              className={`relative border-2 rounded-3xl p-4 transition-colors cursor-pointer flex flex-col min-h-[350px] ${isActive
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-pink-500"
                }`}
              onClick={() => handlePreviewBadge(badge)}
            >
              <div className="flex-1 h-48 flex items-center justify-center">
                {renderExistingBadgePreview(badge)}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-900">
                    {badge.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <div className="flex items-center">
                        <Check size={16} className="text-pink-500 mr-1" />
                        <span className="text-sm text-pink-500 font-medium">
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Badge Builder Modal */}
      <AdvanceCustomBadgeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleSaveCustomTemplate}
        template={editingCustomTemplate}
        isEditMode={isEditCustomMode}
      />

      {/* Preview Modals */}
      {previewBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            {/* Modal Header with close button */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {previewBadge.name} Preview
              </h2>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Badge Preview Content */}
            {previewBadge.id === 1 ? (
              <Template1Preview
                badge={previewBadge}
                event={event}
                CardHeader={CardHeader}
                CardFooter={CardFooter}
              />
            ) : (
              <Template2Preview
                badge={previewBadge}
                event={event}
                CardHeader={CardHeader2}
                CardFooter={CardFooter2}
              />
            )}

            {/* Modal Footer with Select button */}
            <div className="p-6 border-t flex justify-between items-center">
              <button
                onClick={() => {
                  handleSelectExistingBadge(previewBadge);
                  closePreview();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white hover:bg-pink-600 rounded-lg transition-colors"
              >
                <Check size={16} />
                Select
              </button>
              <button
                onClick={closePreview}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
            {/* Modal Header with close button */}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {previewTemplate.name} Preview
              </h2>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Custom Badge Preview Content */}
            <CustomBadgePreview template={previewTemplate} />

            {/* Modal Footer with Select, Edit and Delete buttons */}
            <div className="p-6 border-t flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate);
                    closePreview();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white hover:bg-pink-600 rounded-lg transition-colors"
                >
                  <Check size={16} />
                  Select
                </button>
                <button
                  onClick={() => {
                    closePreview();
                    handleEditCustomTemplate(previewTemplate);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    closePreview();
                    handleDeleteCustomTemplate(previewTemplate.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
              <button
                onClick={closePreview}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg border text-slate-800 hover:bg-gray-50"
        >
          ← Previous
        </button>

        <button
          onClick={selectBadgeAndContinue}
          disabled={(!selectedBadge && !selectedTemplate) || loading}
          className={`cursor-pointer w-full sm:w-auto px-6 py-2.5 rounded-lg flex items-center justify-center ${
            (selectedBadge || selectedTemplate) && !loading
              ? "bg-slate-800 hover:bg-slate-900 text-white"
              : "bg-gray-400 cursor-not-allowed text-white"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </span>
          ) : (
            "Use Template →"
          )}
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AdvanceBadge;
