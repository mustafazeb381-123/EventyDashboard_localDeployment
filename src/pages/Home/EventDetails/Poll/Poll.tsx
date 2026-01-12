import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Plus, Trash2, Pencil, BarChart3, Power } from "lucide-react";

import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { getAgendaApi } from "@/apis/apiHelpers";
import {
  activateAgendaPoll,
  createAgendaPoll,
  deactivateAgendaPoll,
  deleteAgendaPoll,
  listAgendaPolls,
  updateAgendaPoll,
  type Poll,
  type PollType,
} from "@/apis/pollsService";

type AgendaLite = { id: number; title: string };

type PollFormState = {
  question: string;
  poll_type: PollType;
  active: boolean;
  options: Array<{ id?: number; option_text: string }>;
};

const emptyForm: PollFormState = {
  question: "",
  poll_type: "single_answer",
  active: true,
  options: [{ option_text: "" }, { option_text: "" }],
};

// Helper to normalize poll data from JSON:API format
const normalizePoll = (poll: any): Poll => {
  if (poll.attributes) {
    // JSON:API format
    return {
      id: Number(poll.id),
      agenda_id: poll.attributes.agenda_id || poll.relationships?.agenda?.data?.id || 0,
      question: poll.attributes.question || "",
      poll_type: poll.attributes.poll_type || "single_answer",
      active: poll.attributes.active ?? false,
      total_votes: poll.attributes.total_votes || 0,
      poll_options: poll.attributes.poll_options?.data?.map((opt: any) => ({
        id: Number(opt.id || opt.attributes?.id),
        poll_id: Number(poll.id),
        option_text: opt.attributes?.option_text || opt.option_text || "",
        votes_count: opt.attributes?.votes_count || opt.votes_count || 0,
        percentage: opt.attributes?.percentage || opt.percentage || 0,
      })) || poll.attributes.poll_options || [],
      created_at: poll.attributes.created_at || "",
      updated_at: poll.attributes.updated_at || "",
    };
  }
  // Already normalized
  return {
    ...poll,
    id: Number(poll.id),
    active: poll.active ?? false,
  };
};

const PollPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [agendas, setAgendas] = useState<AgendaLite[]>([]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<number | null>(null);

  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoadingAgendas, setIsLoadingAgendas] = useState(false);
  const [isLoadingPolls, setIsLoadingPolls] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [form, setForm] = useState<PollFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch agendas when eventId changes
  useEffect(() => {
    const fetchAgendas = async () => {
      if (!eventId) {
        setAgendas([]);
        setSelectedAgendaId(null);
        return;
      }

      setIsLoadingAgendas(true);
      try {
        const response = await getAgendaApi(eventId);
        console.log('response of get agenda api-------', response.data.data);
        const data = response.data?.data || response.data || [];
        const agendaList: AgendaLite[] = Array.isArray(data)
          ? data.map((item: any) => ({
              id: Number(item.id),
              title:
                item.attributes?.title || item.title || `Session ${item.id}`,
            }))
          : [];

        setAgendas(agendaList);

        // Auto-select first agenda if available
        if (agendaList.length > 0) {
          setSelectedAgendaId(agendaList[0].id);
        } else {
          setSelectedAgendaId(null);
        }
      } catch (error) {
        console.error("Error fetching agendas:", error);
        toast.error("Failed to load sessions");
        setAgendas([]);
        setSelectedAgendaId(null);
      } finally {
        setIsLoadingAgendas(false);
      }
    };

    fetchAgendas();
  }, [eventId]);

  // Fetch polls function
  const fetchPolls = useCallback(async () => {
    if (!eventId) {
      setPolls([]);
      setTotalCount(0);
      setTotalPages(1);
      return;
    }

    // If "All Sessions" is selected (selectedAgendaId is null), fetch from all agendas
    if (!selectedAgendaId) {
      setIsLoadingPolls(true);
      try {
        const allPolls: Poll[] = [];
        for (const agenda of agendas) {
          try {
            const response = await listAgendaPolls(eventId, agenda.id, {
              page: 1,
              per_page: 100, // Get all polls from each session
            });
            const responseData = response.data;
            const pollsData = responseData?.data || responseData || [];
            if (Array.isArray(pollsData)) {
              const normalizedPolls = pollsData.map(normalizePoll);
              allPolls.push(...normalizedPolls);
            }
          } catch (error) {
            // Continue with other agendas if one fails
            console.error(
              `Error fetching polls for agenda ${agenda.id}:`,
              error
            );
          }
        }
        setPolls(allPolls);
        setTotalCount(allPolls.length);
        setTotalPages(1);
      } catch (error: any) {
        console.error("Error fetching all polls:", error);
        setPolls([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsLoadingPolls(false);
      }
      return;
    }

    setIsLoadingPolls(true);
    try {
      const response = await listAgendaPolls(eventId, selectedAgendaId, {
        page,
        per_page: perPage,
      });

      // Handle different response structures
      const responseData = response.data;
      const pollsData = responseData?.data || responseData || [];
      const normalizedPolls = Array.isArray(pollsData) 
        ? pollsData.map(normalizePoll)
        : [];
      setPolls(normalizedPolls);

      // Handle pagination
      const pagination = responseData?.meta?.pagination;
      if (pagination) {
        setTotalPages(pagination.total_pages || 1);
        setTotalCount(pagination.total_count || pollsData.length || 0);
      } else {
        setTotalPages(1);
        setTotalCount(Array.isArray(pollsData) ? pollsData.length : 0);
      }
    } catch (error: any) {
      console.error("Error fetching polls:", error);
      // Don't show error toast for 404 (no polls yet)
      if (error?.response?.status !== 404) {
        toast.error("Failed to load polls");
      }
      setPolls([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoadingPolls(false);
    }
  }, [eventId, selectedAgendaId, page, perPage, agendas]);

  // Fetch polls when agenda changes or page changes
  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const openCreateModal = () => {
    setEditingPoll(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (poll: Poll) => {
    setEditingPoll(poll);
    setForm({
      question: poll.question,
      poll_type: poll.poll_type,
      active: poll.active,
      options:
        poll.poll_options?.length > 0
          ? poll.poll_options.map((o) => ({
              id: o.id,
              option_text: o.option_text,
            }))
          : [{ option_text: "" }, { option_text: "" }],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPoll(null);
    setForm(emptyForm);
  };

  const submitForm = async () => {
    if (!eventId || !selectedAgendaId) {
      toast.error("Missing event/agenda context");
      return;
    }

    const trimmedOptions = form.options
      .map((o) => ({ ...o, option_text: o.option_text.trim() }))
      .filter((o) => o.option_text.length > 0);

    if (!form.question.trim()) {
      toast.error("Question is required");
      return;
    }
    if (trimmedOptions.length < 2) {
      toast.error("Please add at least 2 options");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        poll: {
          question: form.question.trim(),
          poll_type: form.poll_type,
          active: form.active,
          poll_options_attributes: trimmedOptions,
        },
      };

      if (editingPoll) {
        await updateAgendaPoll(
          eventId,
          selectedAgendaId,
          editingPoll.id,
          payload
        );
        toast.success("Poll updated");
      } else {
        await createAgendaPoll(eventId, selectedAgendaId, payload);
        toast.success("Poll created");
      }

      closeModal();
      await fetchPolls();
    } catch (error: any) {
      console.error("Poll submit error:", error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to save poll";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleActive = async (poll: Poll) => {
    console.log('poll-------', poll);
    if (!eventId || !selectedAgendaId) return;
    try {
      if (poll.active) {
        await deactivateAgendaPoll(eventId, selectedAgendaId, poll.id);
        toast.success("Poll deactivated");
      } else {
        await activateAgendaPoll(eventId, selectedAgendaId, poll.id);
        toast.success("Poll activated");
      }
      await fetchPolls();
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Failed to update poll status");
    }
  };

  const onDelete = async (poll: Poll) => {
    if (!eventId || !selectedAgendaId) return;
    if (!window.confirm("Delete this poll?")) return;

    try {
      await deleteAgendaPoll(eventId, selectedAgendaId, poll.id);
      toast.success("Poll deleted");
      await fetchPolls();
    } catch (error) {
      console.error("Delete poll error:", error);
      toast.error("Failed to delete poll");
    }
  };

  const goToDetails = (pollId: number) => {
    if (!eventId || !selectedAgendaId) return;
    navigate(
      `/communication/poll/${pollId}?eventId=${eventId}&agendaId=${selectedAgendaId}`
    );
  };

  return (
    <div className="bg-[#F9FAFB] p-6 min-h-screen">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Polls</h1>

      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div></div>
        <div className="flex items-center gap-3">
          <select
            value={selectedAgendaId ?? ""}
            onChange={(e) => {
              const next = Number(e.target.value);
              setSelectedAgendaId(
                Number.isFinite(next) && next > 0 ? next : null
              );
              setPage(1);
            }}
            disabled={isLoadingAgendas || agendas.length === 0}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
          >
            <option value="">All Sessions</option>
            {(agendas || []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>

          <Button
            onClick={openCreateModal}
            disabled={!eventId || !selectedAgendaId}
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-4 py-2.5 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Poll
          </Button>
        </div>
      </div>

      {!eventId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <strong>Note:</strong> Missing{" "}
          <span className="font-semibold">eventId</span> in URL. Please open
          Polls from the sidebar menu.
        </div>
      )}

      {eventId && agendas.length === 0 && !isLoadingAgendas && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <strong>No sessions found.</strong> Create an agenda/session first
          before adding polls.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {isLoadingPolls && (
          <div className="col-span-full flex items-center justify-center gap-2 text-gray-600 py-8">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading polls…
          </div>
        )}

        {!isLoadingPolls &&
          polls.length === 0 &&
          eventId &&
          selectedAgendaId && (
            <div className="col-span-full bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="text-gray-500 mb-2">
                No polls for this session yet.
              </div>
              <Button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create First Poll
              </Button>
            </div>
          )}

        {(polls || []).map((poll) => {
          const sessionName =
            agendas.find((a) => a.id === poll.agenda_id)?.title || "Session Name";
          const questionCount = poll.poll_options?.length || 0;

          return (
            <div
              key={poll.id}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => goToDetails(poll.id)}
            >
              {/* Top row: Poll Name and question count */}
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-base font-semibold text-gray-900">
                  {poll.question || "Poll Name"}
                </h3>
                <span className="text-sm text-gray-400 shrink-0 ml-2">
                  {questionCount} {questionCount === 1 ? "question" : "questions"}
                </span>
              </div>

              {/* Session Name */}
              <p className="text-sm text-teal-500 font-medium mb-6">
                {sessionName}
              </p>

              {/* Publish toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Publish :</span>
                <button
                  className="text-gray-400 hover:text-gray-500"
                  onClick={(e) => e.stopPropagation()}
                  title="Info"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                <div
                  className="relative inline-flex items-center cursor-pointer ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(poll);
                  }}
                >
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      poll.active ? "bg-[#1E2A4A]" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                        poll.active ? "translate-x-[26px]" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-6"
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingPoll ? "Edit Poll" : "Create Poll"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  value={form.question}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, question: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Type the poll question"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poll Type
                  </label>
                  <select
                    value={form.poll_type}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        poll_type: e.target.value as PollType,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="single_answer">Single answer</option>
                    <option value="multiple_answer">Multiple answers</option>
                  </select>
                </div>

                <div className="flex items-center self-center mt-7">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, active: e.target.checked }))
                      }
                    />
                    Active
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <button
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        options: [...p.options, { option_text: "" }],
                      }))
                    }
                    className="text-sm text-blue-600 hover:text-blue-700"
                    type="button"
                  >
                    + Add option
                  </button>
                </div>

                <div className="space-y-2">
                  {(form.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={opt.option_text}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            options: p.options.map((o, i) =>
                              i === idx
                                ? { ...o, option_text: e.target.value }
                                : o
                            ),
                          }))
                        }
                        className="flex-1 px-3 py-2 border rounded-md"
                        placeholder={`Option ${idx + 1}`}
                      />
                      {form.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              options: p.options.filter((_, i) => i !== idx),
                            }))
                          }
                          className="px-2 py-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={submitForm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                  </span>
                ) : editingPoll ? (
                  "Save Changes"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollPage;
