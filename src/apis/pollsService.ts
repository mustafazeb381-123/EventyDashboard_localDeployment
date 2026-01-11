import axiosInstance from "./axiosInstance";

export type PollType = "single_answer" | "multiple_answer";

export interface PollOption {
    id: number;
    poll_id: number;
    option_text: string;
    votes_count: number;
    percentage: number;
}

export interface Poll {
    id: number;
    agenda_id: number;
    question: string;
    poll_type: PollType;
    active: boolean;
    total_votes: number;
    poll_options: PollOption[];
    created_at: string;
    updated_at: string;
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

export interface ListPollsResponse {
    data: Poll[];
    meta: PaginationMeta;
}

export interface CreateOrUpdatePollPayload {
    poll: {
        question: string;
        poll_type: PollType;
        active?: boolean;
        poll_options_attributes: Array<{
            id?: number;
            option_text: string;
        }>;
    };
}

export interface PollResultsResponse {
    poll: Poll;
    total_votes: number;
    options: Array<{
        id: number;
        option_text: string;
        votes_count: number;
        percentage: number;
    }>;
}

export interface VotePollPayload {
    event_user_id: number;
    poll_option_ids: number | number[];
}

export const listAgendaPolls = (
    eventId: string | number,
    agendaId: string | number,
    params?: { page?: number; per_page?: number }
) => {
    return axiosInstance.get<ListPollsResponse>(
        `/events/${eventId}/agendas/${agendaId}/polls`,
        { params }
    );
};

export const createAgendaPoll = (
    eventId: string | number,
    agendaId: string | number,
    payload: CreateOrUpdatePollPayload
) => {
    return axiosInstance.post<Poll>(
        `/events/${eventId}/agendas/${agendaId}/polls`,
        payload
    );
};

export const getAgendaPoll = (
    eventId: string | number,
    agendaId: string | number,
    pollId: string | number
) => {
    return axiosInstance.get<Poll>(
        `/events/${eventId}/agendas/${agendaId}/polls/${pollId}`
    );
};

export const updateAgendaPoll = (
    eventId: string | number,
    agendaId: string | number,
    pollId: string | number,
    payload: CreateOrUpdatePollPayload
) => {
    return axiosInstance.put<Poll>(
        `/events/${eventId}/agendas/${agendaId}/polls/${pollId}`
        ,
        payload
    );
};

export const deleteAgendaPoll = (
    eventId: string | number,
    agendaId: string | number,
    pollId: string | number
) => {
    return axiosInstance.delete(
        `/events/${eventId}/agendas/${agendaId}/polls/${pollId}`
    );
};

export const activateAgendaPoll = (
    eventId: string | number,
    agendaId: string | number,
    pollId: string | number
) => {
    return axiosInstance.patch<Poll>(
        `/events/${eventId}/agendas/${agendaId}/polls/${pollId}/activate`
    );
};

export const deactivateAgendaPoll = (
    eventId: string | number,
    agendaId: string | number,
    pollId: string | number
) => {
    return axiosInstance.patch<Poll>(
        `/events/${eventId}/agendas/${agendaId}/polls/${pollId}/deactivate`
    );
};

export const getAgendaPollResults = (
    eventId: string | number,
    agendaId: string | number,
    pollId: string | number
) => {
    return axiosInstance.get<PollResultsResponse>(
        `/events/${eventId}/agendas/${agendaId}/polls/${pollId}/results`
    );
};

export const voteAgendaPoll = (
    eventId: string | number,
    agendaId: string | number,
    pollId: string | number,
    payload: VotePollPayload
) => {
    return axiosInstance.post(
        `/events/${eventId}/agendas/${agendaId}/polls/${pollId}/vote`,
        payload
    );
};
