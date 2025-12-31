import React, { useState } from "react";
import {
  Info,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const ReusableRegistrationForm = ({
  formFields = [],
  onSubmit,
  onToggleField,
  toggleLoading = {},
  submitButtonText = "Register",
  submitButtonClassName = "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors",
  onReorderField,
  reorderLoading = {},
  showReorder = false,
  eventId,
  isUserRegistration = false,
  onDeleteField,
  deleteLoading = {},
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    fieldId: string | number | null;
    fieldLabel: string;
  }>({
    isOpen: false,
    fieldId: null,
    fieldLabel: "",
  });
  const [filePreviewUrls, setFilePreviewUrls] = useState({});
  const [activeId, setActiveId] = useState(null);

  // Use field.active for visibility (from parent/API)
  const isFieldVisible = (field) => field.active !== false;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderField && over) {
      const targetField = formFields.find((f) => f.id === over.id);
      if (targetField) {
        onReorderField(active.id, targetField.id);
      }
    }

    setActiveId(null);
  };

  // Sortable field item component
  const SortableFieldItem = ({
    field,
    children,
  }: {
    field: any;
    children: (listeners: any) => React.ReactNode;
  }) => {
    if (!showReorder) {
      return <div>{children({})}</div>;
    }

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: field.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        {children(listeners)}
      </div>
    );
  };

  const handleInputChange = (fieldName, value, file = null) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: file || value,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    formFields.forEach((field) => {
      if (!isFieldVisible(field)) return;

      if (
        field.required &&
        (!formData[field.name] || formData[field.name] === "")
      ) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.validation && formData[field.name]) {
        const validationResult = field.validation(formData[field.name]);
        if (validationResult !== true) {
          newErrors[field.name] = validationResult;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSubmit = Object.keys(formData).reduce((acc, key) => {
        const field = formFields.find((f) => f.name === key);
        if (field && isFieldVisible(field)) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});
      onSubmit(dataToSubmit);
    }
  };

  const renderField = (field) => {
    const isVisible = isFieldVisible(field);

    const commonInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
      errors[field.name] ? "border-red-300" : "border-gray-300"
    } ${
      !isVisible ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"
    }`;

    // In edit mode (showReorder), make all fields read-only/display-only
    const isEditMode = showReorder && !isUserRegistration;

    const inputProps = {
      disabled: !isVisible || isEditMode,
      readOnly: isEditMode,
      className: `${commonInputClasses} ${
        isEditMode ? "bg-gray-50 cursor-not-allowed" : ""
      }`,
    };

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <input
            type={field.type}
            placeholder={
              isEditMode
                ? "Preview only"
                : isVisible
                ? field.placeholder
                : "Field is disabled"
            }
            value={isEditMode ? "" : formData[field.name] || ""}
            onChange={(e) =>
              !isEditMode && handleInputChange(field.name, e.target.value)
            }
            {...inputProps}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={
              isEditMode
                ? "Preview only"
                : isVisible
                ? field.placeholder
                : "Field is disabled"
            }
            value={isEditMode ? "" : formData[field.name] || ""}
            onChange={(e) =>
              !isEditMode && handleInputChange(field.name, e.target.value)
            }
            rows={field.rows || 3}
            {...inputProps}
          />
        );

      case "select":
        return (
          <select
            value={isEditMode ? "" : formData[field.name] || ""}
            onChange={(e) =>
              !isEditMode && handleInputChange(field.name, e.target.value)
            }
            {...inputProps}
          >
            <option value="">
              {isEditMode
                ? "Preview only"
                : isVisible
                ? field.placeholder || `Select ${field.label}`
                : "Field is disabled"}
            </option>
            {!isEditMode &&
              isVisible &&
              field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        );

      case "file":
        // In edit mode, show a disabled/read-only file input
        if (isEditMode) {
          return (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed">
              File upload field (disabled in edit mode)
            </div>
          );
        }
        return (
          <div>
            <div className="relative">
              <input
                type="file"
                accept={field.accept}
                disabled={!isVisible}
                onChange={(e) => {
                  if (!isVisible) return;

                  const file = e.target.files[0];
                  if (file) {
                    let hasError = false;

                    // File size validation first
                    if (field.maxSize && file.size > field.maxSize) {
                      setErrors((prev) => ({
                        ...prev,
                        [field.name]: `File size exceeds ${(
                          field.maxSize /
                          (1024 * 1024)
                        ).toFixed(1)}MB limit`,
                      }));
                      hasError = true;
                    }

                    // File type validation
                    if (
                      field.allowedTypes &&
                      !field.allowedTypes.includes(file.type)
                    ) {
                      setErrors((prev) => ({
                        ...prev,
                        [field.name]: `Invalid file type. Allowed: ${field.allowedTypes.join(
                          ", "
                        )}`,
                      }));
                      hasError = true;
                    }

                    // If there's an error, clear the form data for this field
                    if (hasError) {
                      setFormData((prev) => ({
                        ...prev,
                        [field.name]: "",
                      }));
                      e.target.value = "";
                    } else {
                      handleInputChange(field.name, file.name, file);

                      // Create preview URL for image files
                      if (file.type.startsWith("image/")) {
                        const previewUrl = URL.createObjectURL(file);
                        setFilePreviewUrls((prev) => ({
                          ...prev,
                          [field.name]: previewUrl,
                        }));
                      }
                    }
                  } else {
                    handleInputChange(field.name, "");

                    // Clean up preview URL
                    if (filePreviewUrls[field.name]) {
                      URL.revokeObjectURL(filePreviewUrls[field.name]);
                      setFilePreviewUrls((prev) => {
                        const newUrls = { ...prev };
                        delete newUrls[field.name];
                        return newUrls;
                      });
                    }
                  }
                }}
                className={`w-full text-sm border rounded-lg py-2 px-3 pr-20 transition-colors ${
                  errors[field.name] ? "border-red-300" : "border-gray-300"
                } ${
                  isVisible
                    ? "text-gray-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    : "text-gray-400 bg-gray-100 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-200 file:text-gray-400 cursor-not-allowed"
                }`}
              />
              {field.accept && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  {field.accept
                    .replace(/image\//g, "")
                    .replace(/,/g, ", ")
                    .toUpperCase()}
                </div>
              )}
            </div>

            {isVisible &&
              formData[field.name] &&
              typeof formData[field.name] === "string" &&
              formData[field.name].trim() !== "" && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600 truncate">
                    Selected file: <strong>{formData[field.name]}</strong>
                  </p>
                  {filePreviewUrls[field.name] && (
                    <div className="flex items-center gap-3">
                      <img
                        src={filePreviewUrls[field.name]}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="text-xs text-gray-500">
                        <p>Preview</p>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(filePreviewUrls[field.name], "_blank")
                          }
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          View full size
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {field.hint && (
              <p
                className={`mt-2 text-xs ${
                  isVisible ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {isVisible ? field.hint : "Field is disabled"}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              disabled={!isVisible || isEditMode}
              checked={isEditMode ? false : formData[field.name] || false}
              onChange={(e) =>
                !isEditMode && handleInputChange(field.name, e.target.checked)
              }
              className={`rounded border-gray-300 ${
                isEditMode || !isVisible
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-blue-600 focus:ring-blue-500"
              }`}
            />
            <label
              className={`text-sm ${
                isEditMode || !isVisible ? "text-gray-400" : "text-gray-700"
              }`}
            >
              {field.checkboxLabel}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate all child field IDs from all containers to avoid duplicate rendering
  const allChildIds = new Set(
    formFields
      .filter((f) => f.containerType && f.children)
      .flatMap((f) => f.children || [])
  );

  // Wrap form in DndContext if reordering is enabled
  const formContent = (
    <div className="space-y-6">
      {formFields.map((field) => {
        // Skip rendering if this field is a child of a container (it will be rendered inside its parent)
        if (allChildIds.has(field.id)) {
          return null;
        }

        // Render containers with their children
        if (field.containerType) {
          const isRowLayout = field.containerType === "row";
          const containerStyle = {
            display: "flex",
            flexDirection: isRowLayout ? "row" : "column",
            justifyContent: field.layoutProps?.justifyContent || "flex-start",
            alignItems:
              field.layoutProps?.alignItems ||
              (isRowLayout ? "flex-start" : "stretch"),
            gap: field.layoutProps?.gap || "16px",
            padding: field.layoutProps?.padding || (isRowLayout ? "0" : "16px"),
            margin: field.layoutProps?.margin || "0",
            backgroundColor:
              field.layoutProps?.backgroundColor || "transparent",
            borderRadius: field.layoutProps?.borderRadius || "0px",
            flexWrap:
              field.layoutProps?.flexWrap || (isRowLayout ? "wrap" : "nowrap"),
            width: "100%",
          };

          const childFields = field.children
            ? formFields.filter((f) => field.children?.includes(f.id))
            : [];

          // For column containers, use Bootstrap grid if Bootstrap classes are set
          const isColumnContainer = field.containerType === "column";
          const hasBootstrapClasses = childFields.some((f) => f.bootstrapClass);
          const containerClassName =
            isColumnContainer && hasBootstrapClasses ? "row" : "";

          // Always apply containerStyle for row containers, or if no Bootstrap classes
          const shouldApplyContainerStyle = isRowLayout || !hasBootstrapClasses;

          return (
            <div
              key={field.id}
              className={`w-full ${containerClassName}`}
              style={shouldApplyContainerStyle ? containerStyle : undefined}
            >
              {childFields.length > 0 ? (
                childFields.map((childField) => {
                  // Determine wrapper style/class based on container type and Bootstrap class
                  let fieldWrapperClassName = "";
                  let fieldWrapperStyle = {};

                  if (isColumnContainer && childField.bootstrapClass) {
                    // Use Bootstrap class
                    fieldWrapperClassName = childField.bootstrapClass;
                    fieldWrapperStyle = {
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    };
                  } else if (isRowLayout) {
                    // For row layouts without Bootstrap, use flex equal width
                    fieldWrapperStyle = {
                      flex: "1 1 0%",
                      minWidth: "0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    };
                  } else {
                    // Default column layout
                    fieldWrapperStyle = {
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    };
                  }

                  const childFieldIndex = childFields.findIndex(
                    (f) => f.id === childField.id
                  );
                  const isFirstChild = childFieldIndex === 0;
                  const isLastChild =
                    childFieldIndex === childFields.length - 1;

                  return (
                    <SortableFieldItem key={childField.id} field={childField}>
                      {(listeners) => (
                        <div
                          className={`${fieldWrapperClassName} relative group border rounded-lg p-3 bg-gray-50`}
                          style={fieldWrapperStyle}
                        >
                          {childField.type !== "checkbox" && (
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {childField.label}
                              {childField.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                          )}

                          <div className="flex items-center gap-3">
                            {/* Drag Handle for child fields */}
                            {showReorder && onReorderField && (
                              <div
                                className="cursor-grab active:cursor-grabbing"
                                {...listeners}
                              >
                                <GripVertical
                                  size={20}
                                  className="text-gray-400"
                                />
                              </div>
                            )}

                            <div className="flex-1">
                              {renderField(childField)}
                            </div>

                            {/* Action Buttons for child fields - Toggle and Delete */}
                            {showReorder && (
                              <div className="flex items-center gap-2">
                                {/* Toggle Field Button */}
                                {onToggleField && (
                                  <button
                                    type="button"
                                    onClick={() => onToggleField(childField.id)}
                                    className="flex items-center justify-center transition-colors shrink-0 hover:bg-gray-200 p-2 rounded"
                                    title={
                                      isFieldVisible(childField)
                                        ? "Disable field"
                                        : "Enable field"
                                    }
                                    disabled={!!toggleLoading[childField.id]}
                                  >
                                    {isFieldVisible(childField) ? (
                                      <Eye size={20} className="text-red-500" />
                                    ) : (
                                      <EyeOff
                                        size={20}
                                        className="text-gray-400"
                                      />
                                    )}
                                    {toggleLoading[childField.id] && (
                                      <span className="ml-1 text-xs text-gray-400">
                                        ...
                                      </span>
                                    )}
                                  </button>
                                )}

                                {/* Delete Field Button - Available for all fields */}
                                {onDeleteField && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteConfirmModal({
                                        isOpen: true,
                                        fieldId: childField.id,
                                        fieldLabel:
                                          childField.label || "this field",
                                      });
                                    }}
                                    className="flex items-center justify-center transition-colors shrink-0 hover:bg-red-100 p-2 rounded"
                                    title="Delete field"
                                    disabled={!!deleteLoading[childField.id]}
                                  >
                                    {deleteLoading[childField.id] ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                    ) : (
                                      <Trash2
                                        size={18}
                                        className="text-red-500"
                                      />
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {errors[childField.name] && (
                            <p className="mt-1 flex items-center text-xs text-red-600">
                              <Info size={14} className="mr-1 flex-shrink-0" />
                              {errors[childField.name]}
                            </p>
                          )}
                        </div>
                      )}
                    </SortableFieldItem>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm italic w-full">
                  No fields in container
                </div>
              )}
            </div>
          );
        }

        // Render regular fields
        return (
          <SortableFieldItem key={field.id || field.name} field={field}>
            {(listeners) => (
              <div className="relative group border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                {field.type !== "checkbox" && (
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                )}

                <div className="flex items-center gap-3">
                  {/* Drag Handle - Always visible in edit mode */}
                  {showReorder && onReorderField && (
                    <div
                      className="cursor-grab active:cursor-grabbing"
                      {...listeners}
                    >
                      <GripVertical size={20} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">{renderField(field)}</div>

                  {/* Action Buttons - Toggle and Delete */}
                  {showReorder && (
                    <div className="flex items-center gap-2">
                      {/* Toggle Field Button - Enable/Disable */}
                      {onToggleField && (
                        <button
                          type="button"
                          onClick={() => onToggleField(field.id)}
                          className="flex items-center justify-center transition-colors shrink-0 hover:bg-gray-200 p-2 rounded"
                          title={
                            isFieldVisible(field)
                              ? "Disable field"
                              : "Enable field"
                          }
                          disabled={!!toggleLoading[field.id]}
                        >
                          {isFieldVisible(field) ? (
                            <Eye size={20} className="text-red-500" />
                          ) : (
                            <EyeOff size={20} className="text-gray-400" />
                          )}
                          {toggleLoading[field.id] && (
                            <span className="ml-1 text-xs text-gray-400">
                              ...
                            </span>
                          )}
                        </button>
                      )}

                      {/* Delete Field Button - Available for all fields */}
                      {onDeleteField && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirmModal({
                              isOpen: true,
                              fieldId: field.id,
                              fieldLabel: field.label || "this field",
                            });
                          }}
                          className="flex items-center justify-center transition-colors shrink-0 hover:bg-red-100 p-2 rounded"
                          title="Delete field"
                          disabled={!!deleteLoading[field.id]}
                        >
                          {deleteLoading[field.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 size={18} className="text-red-500" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {errors[field.name] && (
                  <p className="mt-1 flex items-center text-xs text-red-600">
                    <Info size={14} className="mr-1 flex-shrink-0" />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            )}
          </SortableFieldItem>
        );
      })}
    </div>
  );

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (deleteConfirmModal.fieldId && onDeleteField) {
      onDeleteField(deleteConfirmModal.fieldId);
      setDeleteConfirmModal({ isOpen: false, fieldId: null, fieldLabel: "" });
    }
  };

  // Wrap in DndContext if reordering is enabled
  if (showReorder && onReorderField) {
    return (
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(event.active.id)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={formFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {formContent}
            </form>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="border rounded-lg p-4 bg-white shadow-lg opacity-90">
                <p className="text-sm font-medium text-gray-700">
                  {formFields.find((f) => f.id === activeId)?.label || "Field"}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Delete Confirmation Modal */}
        {deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Field
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirmModal({
                      isOpen: false,
                      fieldId: null,
                      fieldLabel: "",
                    })
                  }
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-900">
                    "{deleteConfirmModal.fieldLabel}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirmModal({
                      isOpen: false,
                      fieldId: null,
                      fieldLabel: "",
                    })
                  }
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={
                    deleteConfirmModal.fieldId &&
                    deleteLoading[deleteConfirmModal.fieldId]
                  }
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleteConfirmModal.fieldId &&
                  deleteLoading[deleteConfirmModal.fieldId] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Regular form without drag and drop
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formContent}
      </form>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Field
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmModal({
                    isOpen: false,
                    fieldId: null,
                    fieldLabel: "",
                  })
                }
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteConfirmModal.fieldLabel}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmModal({
                    isOpen: false,
                    fieldId: null,
                    fieldLabel: "",
                  })
                }
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={
                  deleteConfirmModal.fieldId &&
                  deleteLoading[deleteConfirmModal.fieldId]
                }
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteConfirmModal.fieldId &&
                deleteLoading[deleteConfirmModal.fieldId] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReusableRegistrationForm;
