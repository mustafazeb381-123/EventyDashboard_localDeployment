import type { FieldType, FormField } from "../types";

export const makeFieldNameFromLabel = (label: string): string => {
    const base = label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

    return base || "field";
};

export const makeAutoPlaceholderFromLabel = (
    type: FieldType,
    label: string
): string => {
    const clean = label.trim();
    if (!clean) return "";

    switch (type) {
        case "select":
        case "date":
            return `Select ${clean}`;
        case "file":
        case "image":
            return `Upload ${clean}`;
        default:
            return `Enter ${clean}`;
    }
};

export const ensureUniqueFieldName = (
    desiredName: string,
    currentId: string,
    allFields?: FormField[]
): string => {
    if (!allFields?.length) return desiredName;

    const taken = new Set(
        allFields
            .filter((f) => f.id !== currentId)
            .map((f) => (f.name || "").toLowerCase())
            .filter(Boolean)
    );

    if (!taken.has(desiredName.toLowerCase())) return desiredName;

    let i = 2;
    while (taken.has(`${desiredName}_${i}`.toLowerCase())) i += 1;
    return `${desiredName}_${i}`;
};

export const updateFieldLabelWithAutoProps = (
    field: FormField,
    newLabel: string,
    allFields?: FormField[]
): FormField => {
    const oldLabel = field.label;
    const oldSlug = makeFieldNameFromLabel(oldLabel);
    const newSlug = makeFieldNameFromLabel(newLabel);

    const oldAutoPlaceholder = makeAutoPlaceholderFromLabel(field.type, oldLabel);
    const newAutoPlaceholder = makeAutoPlaceholderFromLabel(field.type, newLabel);

    // Update name only if it looks auto-generated from the old label.
    const shouldUpdateName =
        field.name === oldSlug || field.name.startsWith(`${oldSlug}_`);

    const nextName = shouldUpdateName
        ? ensureUniqueFieldName(
            `${newSlug}${field.name.slice(oldSlug.length)}`,
            field.id,
            allFields
        )
        : field.name;

    // Update placeholder only if it was empty or auto-generated.
    const shouldUpdatePlaceholder =
        !field.placeholder || field.placeholder === oldAutoPlaceholder;

    return {
        ...field,
        label: newLabel,
        name: nextName,
        placeholder: shouldUpdatePlaceholder ? newAutoPlaceholder : field.placeholder,
    };
};
