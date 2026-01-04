import axiosInstance from "./axiosInstance";

// List all galleries for an event
export const getGalleriesApi = (eventId: string | number, params?: any) => {
    return axiosInstance.get(`/events/${eventId}/galleries`, { params });
};

// Create a new gallery
export const createGalleryApi = (eventId: string | number, data: any) => {
    return axiosInstance.post(`/events/${eventId}/galleries`, data);
};

// Get a specific gallery
export const getGalleryApi = (eventId: string | number, id: string | number) => {
    return axiosInstance.get(`/events/${eventId}/galleries/${id}`);
};

// Update a gallery
export const updateGalleryApi = (
    eventId: string | number,
    id: string | number,
    data: any
) => {
    return axiosInstance.put(`/events/${eventId}/galleries/${id}`, data);
};

// Delete a gallery
export const deleteGalleryApi = (
    eventId: string | number,
    id: string | number
) => {
    return axiosInstance.delete(`/events/${eventId}/galleries/${id}`);
};

// Upload images to a gallery
export const uploadGalleryImagesApi = (
    eventId: string | number,
    galleryId: string | number,
    formData: FormData
) => {
    return axiosInstance.post(
        `/events/${eventId}/galleries/${galleryId}/upload_images`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

// Delete a specific image from a gallery
export const deleteGalleryImageApi = (
    eventId: string | number,
    galleryId: string | number,
    imageId: string | number
) => {
    return axiosInstance.delete(
        `/events/${eventId}/galleries/${galleryId}/delete_image/${imageId}`
    );
};
