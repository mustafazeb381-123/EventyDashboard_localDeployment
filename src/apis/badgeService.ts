import axiosInstance from "./axiosInstance";

// Types for Badge API - Flat structure from API
export interface BadgeFlat {
    id: number;
    event_id: number;
    name: string;
    default: boolean;
    created_at: string;
    updated_at: string;
}

// JSON:API format structure (if API returns this format)
export interface Badge {
    id: string | number;
    type: string;
    attributes: {
        name: string;
        default: boolean;
        event_id?: number;
        created_at?: string;
        updated_at?: string;
    };
}

export interface PaginationMeta {
    pagination: {
        current_page: number;
        next_page: number | null;
        prev_page: number | null;
        total_pages: number;
        total_count: number;
        per_page: number;
    };
}

export interface ListBadgesResponse {
    data: Badge[] | BadgeFlat[];
    meta: PaginationMeta;
}

export interface CreateBadgePayload {
    badge: {
        name: string;
        event_id: number;
        default?: boolean;
    };
}

export interface UpdateBadgePayload {
    badge: {
        name?: string;
        event_id?: number;
        default?: boolean;
    };
}

/**
 * List all badges for an event with pagination
 * GET /api_dashboard/v1/events/{event_id}/badges
 */
export const listBadges = (
    eventId: string | number,
    page: number = 1,
    perPage: number = 10
): Promise<{ data: ListBadgesResponse }> => {
    return axiosInstance.get(`/events/${eventId}/badges`, {
        params: {
            page,
            per_page: perPage,
        },
    });
};

/**
 * Get all badges without pagination (fetch all pages)
 * Useful when you need all badges at once
 */
export const getAllBadges = async (
    eventId: string | number
): Promise<Badge[]> => {
    try {
        const firstPage = await listBadges(eventId, 1, 100);
        return firstPage.data.data as Badge[];
    } catch (error) {
        console.error("Error fetching all badges:", error);
        throw error;
    };
}

/**
 * Create a new badge
 * POST /api_dashboard/v1/events/{event_id}/badges
 */
export const createBadge = (
    eventId: string | number,
    payload: CreateBadgePayload
): Promise<{ data: Badge | BadgeFlat }> => {
    return axiosInstance.post(`/events/${eventId}/badges`, payload);
};

/**
 * Get a specific badge
 * GET /api_dashboard/v1/events/{event_id}/badges/{id}
 */
export const getBadge = (
    eventId: string | number,
    badgeId: string | number
): Promise<{ data: Badge | BadgeFlat }> => {
    return axiosInstance.get(`/events/${eventId}/badges/${badgeId}`);
};

/**
 * Update a badge
 * PUT /api_dashboard/v1/events/{event_id}/badges/{id}
 */
export const updateBadge = (
    eventId: string | number,
    badgeId: string | number,
    payload: UpdateBadgePayload
): Promise<{ data: Badge | BadgeFlat }> => {
    return axiosInstance.put(`/events/${eventId}/badges/${badgeId}`, payload);
};

/**
 * Delete a badge
 * DELETE /api_dashboard/v1/events/{event_id}/badges/{id}
 */
export const deleteBadge = (
    eventId: string | number,
    badgeId: string | number
): Promise<void> => {
    return axiosInstance.delete(`/events/${eventId}/badges/${badgeId}`);
};

/**
 * Set a badge as default (and unset all others)
 * This will update the badge to set default: true
 * You should also ensure other badges have default: false
 */
export const setDefaultBadge = async (
    eventId: string | number,
    badgeId: string | number
): Promise<Badge | BadgeFlat> => {
    try {
        // Update the selected badge to be default
        const response = await updateBadge(eventId, badgeId, {
            badge: {
                default: true,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error setting default badge:", error);
        throw error;
    }
};

/**
 * Unset a badge as default
 */
export const unsetDefaultBadge = async (
    eventId: string | number,
    badgeId: string | number
): Promise<Badge | BadgeFlat> => {
    try {
        const response = await updateBadge(eventId, badgeId, {
            badge: {
                default: false,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error unsetting default badge:", error);
        throw error;
    }
};

/**
 * Helper function to create a badge with specific name
 * Simplified version of createBadge
 */
export const createBadgeSimple = (
    eventId: string | number,
    name: string,
    isDefault: boolean = false
): Promise<{ data: Badge | BadgeFlat }> => {
    return createBadge(eventId, {
        badge: {
            name,
            event_id: Number(eventId),
            default: isDefault,
        },
    });
};
