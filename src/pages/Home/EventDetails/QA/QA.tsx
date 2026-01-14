import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Check, X, User2, ThumbsUp } from "lucide-react";
import {
  getAgendaApi,
  getEventUserQuestionsApi,
  getEventUserQuestionByIdApi,
  updateEventUserQuestionStatusApi,
  bulkUpdateEventUserQuestionStatusApi,
} from "@/apis/apiHelpers";

interface Agenda {
  id: number;
  title: string;
}

interface Question {
  id: string | number;
  agenda_id: number;
  question: string;
  question_status: "pending" | "accepted" | "rejected";
  likes_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    image?: string;
  };
  display_name: boolean;
  privacy_status: string;
  users_likes_ids: number[];
}

const Qa: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const agendaIdFromQuery = searchParams.get("agendaId");

  const [activeTab, setActiveTab] = useState<"questions" | "requests">("questions");
  const [lockAsks, setLockAsks] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingAgendas, setIsLoadingAgendas] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isAcceptingQuestion, setIsAcceptingQuestion] = useState<string | number | null>(null);
  const [isRejectingQuestion, setIsRejectingQuestion] = useState<string | number | null>(null);
  const [isAcceptingAll, setIsAcceptingAll] = useState(false);

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
        const data = response.data?.data || response.data || [];
        const agendaList: Agenda[] = Array.isArray(data)
          ? data.map((item: any) => ({
              id: Number(item.id),
              title:
                item.attributes?.title || item.title || `Session ${item.id}`,
            }))
          : [];

        setAgendas(agendaList);

        // Set selected agenda from query param only, otherwise default to "All Sessions" (null)
        if (agendaIdFromQuery) {
          const agendaIdNum = Number(agendaIdFromQuery);
          if (agendaList.some((a) => a.id === agendaIdNum)) {
            setSelectedAgendaId(agendaIdNum);
          } else {
            setSelectedAgendaId(null); // Default to "All Sessions"
          }
        } else {
          setSelectedAgendaId(null); // Default to "All Sessions"
        }
      } catch (error) {
        console.error("Error fetching agendas:", error);
        showNotification("Failed to load sessions", "error");
        setAgendas([]);
        setSelectedAgendaId(null);
      } finally {
        setIsLoadingAgendas(false);
      }
    };

    fetchAgendas();
  }, [eventId, agendaIdFromQuery]);

  // Helper function to normalize question data
  const normalizeQuestion = (item: any, agendaId?: number): Question => {
    const userData = item.attributes?.user || item.user || {};
    return {
      id: item.id,
      agenda_id:
        agendaId ||
        item.attributes?.agenda_id ||
        item.relationships?.agenda?.data?.id ||
        Number(item.agenda_id) ||
        0,
      question: item.attributes?.question || item.question || "",
      question_status:
        item.attributes?.question_status || item.question_status || "pending",
      likes_count: item.attributes?.likes_count || item.likes_count || 0,
      created_at: item.attributes?.created_at || item.created_at || "",
      updated_at: item.attributes?.updated_at || item.updated_at || "",
      user: {
        id: userData.id || 0,
        name: (userData.name || "").trim(),
        email: userData.email || "",
        image: userData.image || "",
      },
      display_name: item.attributes?.display_name ?? item.display_name ?? true,
      privacy_status: item.attributes?.privacy_status || item.privacy_status || "public_question",
      users_likes_ids: item.attributes?.users_likes_ids || item.users_likes_ids || [],
    };
  };

  // Fetch questions based on active tab and selected agenda
  const fetchQuestions = useCallback(async () => {
    if (!eventId) {
      setQuestions([]);
      setPendingCount(0);
      return;
    }

    setIsLoadingQuestions(true);
    try {
      // If "All Sessions" is selected (selectedAgendaId is null), fetch from all agendas
      if (!selectedAgendaId) {
        const allQuestions: Question[] = [];
        for (const agenda of agendas) {
          try {
            const response = await getEventUserQuestionsApi(eventId, agenda.id, {
              status: "all",
              page: 1,
              per_page: 100, // Get all questions from each session
            });
            const responseData = response.data;
            const questionsData = responseData?.data || responseData || [];
            if (Array.isArray(questionsData)) {
              const normalizedQuestions = questionsData.map((item: any) =>
                normalizeQuestion(item, agenda.id)
              );
              allQuestions.push(...normalizedQuestions);
            }
          } catch (error) {
            // Continue with other agendas if one fails
            console.error(
              `Error fetching questions for agenda ${agenda.id}:`,
              error
            );
          }
        }

        // Filter questions based on active tab
        let filteredQuestions = allQuestions;
        if (activeTab === "requests") {
          // Requests tab: show only pending questions
          filteredQuestions = allQuestions.filter(
            (q) => q.question_status === "pending"
          );
        }

        // Sort questions: Questions tab by created_at (newest first), Requests tab by created_at (oldest first)
        // filteredQuestions.sort((a, b) => {
        //   const dateA = new Date(a.created_at).getTime();
        //   const dateB = new Date(b.created_at).getTime();
        //   return activeTab === "questions" ? dateB - dateA : dateA - dateB;
        // });

        setQuestions(filteredQuestions);

        // Count pending questions for badge (always show pending count from all questions)
        const pending = allQuestions.filter(
          (q) => q.question_status === "pending"
        ).length;
        setPendingCount(pending);
        return;
      }

      // Fetch questions for a specific agenda
      const response = await getEventUserQuestionsApi(eventId, selectedAgendaId, {
        status: "all",
        page: 1,
        per_page: 100, // Get all questions
      });

      const responseData = response.data;
      const questionsData = responseData?.data || responseData || [];
      
      const normalizedQuestions: Question[] = Array.isArray(questionsData)
        ? questionsData.map((item: any) => normalizeQuestion(item, selectedAgendaId))
        : [];

      // Filter questions based on active tab
      let filteredQuestions = normalizedQuestions;
      if (activeTab === "requests") {
        // Requests tab: show only pending questions
        filteredQuestions = normalizedQuestions.filter(
          (q) => q.question_status === "pending"
        );
      }

      // Sort questions: Questions tab by created_at (newest first), Requests tab by created_at (oldest first)
      // filteredQuestions.sort((a, b) => {
      //   const dateA = new Date(a.created_at).getTime();
      //   const dateB = new Date(b.created_at).getTime();
      //   return activeTab === "questions" ? dateB - dateA : dateA - dateB;
      // });

      setQuestions(filteredQuestions);

      // Count pending questions for badge (always show pending count from all questions)
      const pending = normalizedQuestions.filter(
        (q) => q.question_status === "pending"
      ).length;
      setPendingCount(pending);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      if (error?.response?.status !== 404) {
        showNotification("Failed to load questions", "error");
      }
      setQuestions([]);
      setPendingCount(0);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [eventId, selectedAgendaId, activeTab, agendas]);

  // Fetch a single question by ID and update it in state
  const fetchSingleQuestion = useCallback(
    async (questionId: string | number, agendaId: number) => {
      if (!eventId || !questionId || !agendaId) return;

      try {
        const response = await getEventUserQuestionByIdApi(
          eventId,
          agendaId,
          questionId
        );
        const responseData = response.data;
        const questionData = responseData?.data || responseData;

        if (questionData) {
          const normalizedQuestion = normalizeQuestion(questionData, agendaId);

          // Update the question in the questions array and pending count
          setQuestions((prevQuestions) => {
            const oldQuestion = prevQuestions.find((q) => q.id === questionId);
            const wasPending = oldQuestion?.question_status === "pending";
            const isPending = normalizedQuestion.question_status === "pending";

            // Update pending count if status changed
            if (wasPending && !isPending) {
              setPendingCount((prev) => Math.max(0, prev - 1));
            } else if (!wasPending && isPending) {
              setPendingCount((prev) => prev + 1);
            }

            // Update the question in the array
            return prevQuestions.map((q) =>
              q.id === questionId ? normalizedQuestion : q
            );
          });
        }
      } catch (error) {
        console.error("Error fetching single question:", error);
      }
    },
    [eventId]
  );

  // Notification handler
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch questions when dependencies change
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle accept question
  const handleAcceptQuestion = async (question: Question) => {
    if (!eventId) return;

    // Use question's agenda_id if "All Sessions" is selected, otherwise use selectedAgendaId
    const agendaId = selectedAgendaId || question.agenda_id;
    if (!agendaId) {
      showNotification("Unable to determine session for this question", "error");
      return;
    }

    setIsAcceptingQuestion(question.id);
    try {
      await updateEventUserQuestionStatusApi(
        eventId,
        agendaId,
        question.id,
        "accepted"
      );
      showNotification("Question has been accepted", "success");
      fetchQuestions();
    } catch (error: any) {
      console.error("Error accepting question:", error);
      showNotification(
        error?.response?.data?.message || "Failed to accept question",
        "error"
      );
    } finally {
      setIsAcceptingQuestion(null);
    }
  };

  // Handle reject question
  const handleRejectQuestion = async (question: Question) => {
    if (!eventId) return;

    // Use question's agenda_id if "All Sessions" is selected, otherwise use selectedAgendaId
    const agendaId = selectedAgendaId || question.agenda_id;
    if (!agendaId) {
      showNotification("Unable to determine session for this question", "error");
      return;
    }

    setIsRejectingQuestion(question.id);
    try {
      await updateEventUserQuestionStatusApi(
        eventId,
        agendaId,
        question.id,
        "rejected"
      );
      showNotification("Question has been rejected", "error");
      fetchQuestions();
    } catch (error: any) {
      console.error("Error rejecting question:", error);
      showNotification(
        error?.response?.data?.message || "Failed to reject question",
        "error"
      );
    } finally {
      setIsRejectingQuestion(null);
    }
  };

  // Handle accept all questions
  const handleAcceptAll = async () => {
    if (!eventId) return;

    setIsAcceptingAll(true);
    try {
      let allPendingQuestions: Question[] = [];

      // If "All Sessions" is selected, get pending questions from all agendas
      if (!selectedAgendaId) {
        for (const agenda of agendas) {
          try {
            const response = await getEventUserQuestionsApi(eventId, agenda.id, {
              status: "all",
              page: 1,
              per_page: 100,
            });
            const responseData = response.data;
            const questionsData = responseData?.data || responseData || [];
            if (Array.isArray(questionsData)) {
              const normalizedQuestions = questionsData.map((item: any) =>
                normalizeQuestion(item, agenda.id)
              );
              const pending = normalizedQuestions.filter(
                (q) => q.question_status === "pending"
              );
              allPendingQuestions.push(...pending);
            }
          } catch (error) {
            // Continue with other agendas if one fails
            console.error(
              `Error fetching questions for agenda ${agenda.id}:`,
              error
            );
          }
        }
      } else {
        // Fetch pending questions from selected agenda
        const response = await getEventUserQuestionsApi(eventId, selectedAgendaId, {
          status: "all",
          page: 1,
          per_page: 100,
        });

        const responseData = response.data;
        const questionsData = responseData?.data || responseData || [];
        
        const allQuestions: Question[] = Array.isArray(questionsData)
          ? questionsData.map((item: any) => normalizeQuestion(item, selectedAgendaId))
          : [];

        allPendingQuestions = allQuestions.filter(
          (q) => q.question_status === "pending"
        );
      }

      if (allPendingQuestions.length === 0) {
        showNotification("No pending questions to accept", "error");
        setIsAcceptingAll(false);
        return;
      }

      // If specific agenda is selected, use bulk update for that agenda
      if (selectedAgendaId) {
        const questionIds = allPendingQuestions.map((q) => q.id);
        await bulkUpdateEventUserQuestionStatusApi(
          eventId,
          selectedAgendaId,
          questionIds,
          "accepted"
        );
        showNotification(`${allPendingQuestions.length} question(s) has been accepted`, "success");
      } else {
        // For "All Sessions", accept pending questions from each agenda
        let totalAccepted = 0;
        for (const agenda of agendas) {
          try {
            const response = await getEventUserQuestionsApi(eventId, agenda.id, {
              status: "pending",
              page: 1,
              per_page: 100,
            });
            const responseData = response.data;
            const questionsData = responseData?.data || responseData || [];
            if (Array.isArray(questionsData) && questionsData.length > 0) {
              const questionIds = questionsData.map((item: any) => item.id);
              await bulkUpdateEventUserQuestionStatusApi(
                eventId,
                agenda.id,
                questionIds,
                "accepted"
              );
              totalAccepted += questionIds.length;
            }
          } catch (error) {
            // Continue with other agendas if one fails
            console.error(`Error accepting questions for agenda ${agenda.id}:`, error);
          }
        }
        if (totalAccepted > 0) {
          showNotification(`${totalAccepted} question(s) has been accepted`, "success");
        } else {
          showNotification("No pending questions to accept", "error");
        }
      }

      fetchQuestions();
    } catch (error: any) {
      console.error("Error accepting all questions:", error);
      showNotification(
        error?.response?.data?.message || "Failed to accept all questions",
        "error"
      );
    } finally {
      setIsAcceptingAll(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    return `${Math.floor(diffInSeconds / 86400)} day ago`;
  };

  // Get display name for question
  const getDisplayName = (question: Question) => {
    if (!question.display_name) return "Anonymous";
    // Check if name exists and has content (not just whitespace)
    const userName = question.user?.name?.trim();
    if (userName && userName.length > 0) {
      return userName;
    }
    // Only fall back to email if name is not available or is just whitespace
    return question.user?.email || "Anonymous";
  };

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Communication</h2>

        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <select
            value={selectedAgendaId ?? ""}
            onChange={(e) => {
              const next = Number(e.target.value);
              setSelectedAgendaId(
                Number.isFinite(next) && next > 0 ? next : null
              );
            }}
            disabled={isLoadingAgendas || agendas.length === 0}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingAgendas ? (
              <option value="">Loading sessions...</option>
            ) : (
              <>
                <option value="">All Sessions</option>
                {(agendas || []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </>
            )}
          </select>

          {/* Lock Asks Toggle */}
          <label className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm cursor-pointer transition bg-blue-50">
            <Lock className="w-4 h-4 text-blue-700" />
            <span className="text-gray-700">Lock Asks</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={lockAsks}
                onChange={() => setLockAsks(!lockAsks)}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors ${
                  lockAsks ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    lockAsks ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </label>

          {/* Auto Accept + Accept All only for Requests tab */}
          {activeTab === "requests" && (
            <>
              {/* <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition bg-blue-50">
                <span className="text-gray-700">Auto Accept</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={autoAccept}
                    onChange={() => setAutoAccept(!autoAccept)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      autoAccept ? "bg-teal-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        autoAccept ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </label> */}

              <Button
                onClick={handleAcceptAll}
                disabled={isLoadingQuestions || isAcceptingAll}
                className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAcceptingAll ? "Accepting..." : "Accept All Questions"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-4">
        <button
          className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "questions"
              ? "text-gray-800 bg-blue-100"
              : "text-gray-500 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </button>
        <button
          className={`px-6 py-2 text-sm font-medium flex items-center gap-1 rounded-md transition-colors ${
            activeTab === "requests"
              ? "text-gray-800 bg-blue-100"
              : "text-gray-500 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Requests
          {pendingCount > 0 && (
          <span className="ml-1 bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingCount}
          </span>
          )}
        </button>
      </div>

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {isLoadingQuestions ? (
            <>
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {!eventId
                ? "Please select an event"
                : !selectedAgendaId
                ? "No questions found across all sessions"
                : "No questions found"}
            </div>
          ) : (
            questions.map((q) => {
              const sessionName =
                agendas.find((a) => a.id === q.agenda_id)?.title ||
                "Session Name";
              
              return (
              <div
                key={q.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-3"
              >
                  <div className="flex items-start gap-3 flex-1">
                  {/* User Icon */}
                  <div className="bg-gray-100 rounded-full p-2">
                    <User2 className="w-5 h-5 text-gray-600" />
                  </div>

                    <div className="flex-1">
                      <div className="items-center gap-2 text-sm text-gray-600 mb-2">
                        <p className="font-medium text-gray-800">{getDisplayName(q)}</p>
                        <p className="text-gray-400 text-xs">{formatTimeAgo(q.created_at)}</p>
                    </div>
                    <p className="text-gray-700 mt-1 text-sm">{q.question}</p>
                    {/* {!selectedAgendaId && (
                      <p className="text-sm text-teal-500 font-medium mt-2">{sessionName}</p>
                    )} */}
                  </div>
                </div>

              {/* Like button + Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <ThumbsUp className="w-4 h-4" />
                    <p>{q.likes_count}</p>
                  </div>

                  {q.question_status === "pending" ? (
                    <span className="text-xs bg-blue-50 font-medium text-blue-700 px-4 py-2 rounded-full flex items-center gap-1">
                    <Check className="w-4 h-4" /> Check Answered
                  </span>
                  ) : q.question_status === "accepted" ? (
                    <span className="text-green-600 text-xs font-medium px-3 py-1 rounded-full bg-green-50">
                      Accepted
                  </span>
                ) : (
                    <span className="text-red-600 text-xs font-medium px-3 py-1 rounded-full bg-red-50">
                      Rejected
                  </span>
                )}
                 </div>
              </div>
              );
            })
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          {isLoadingQuestions ? (
            <>
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {!eventId
                ? "Please select an event"
                : !selectedAgendaId
                ? "No pending questions across all sessions"
                : "No pending questions"}
            </div>
          ) : (
            questions.map((r) => {
              const sessionName =
                agendas.find((a) => a.id === r.agenda_id)?.title ||
                "Session Name";
              
              return (
              <div
                key={r.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                  <div className="flex items-start gap-3 flex-1">
                  {/* User Icon only */}
                  <div className="bg-gray-100 rounded-full p-2">
                    <User2 className="w-5 h-5 text-gray-600" />
                  </div>

                    <div className="flex-1">
                    <div className="items-center gap-2 text-sm text-gray-600 mb-4">
                        <p className="font-medium text-gray-800">{getDisplayName(r)}</p>
                        <p className="text-gray-400 text-xs">{formatTimeAgo(r.created_at)}</p>
                    </div>
                    <p className="text-gray-700 mt-1 text-sm">{r.question}</p>
                    {/* {!selectedAgendaId && (
                      <p className="text-sm text-teal-500 font-medium mt-2">{sessionName}</p>
                    )} */}
                  </div>
                </div>

              <div className="flex gap-2">
                <Button
                    onClick={() => handleRejectQuestion(r)}
                    disabled={isRejectingQuestion === r.id || isAcceptingQuestion === r.id}
                  variant="destructive"
                    className="text-sm px-4 py-2 text-red-600 border border-red-200 hover:bg-red-100 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isRejectingQuestion === r.id ? (
                      "Rejecting..."
                    ) : (
                      <>
                  <X className="w-4 h-4" /> Reject
                      </>
                    )}
                </Button>
                  <Button
                    onClick={() => handleAcceptQuestion(r)}
                    disabled={isAcceptingQuestion === r.id || isRejectingQuestion === r.id}
                    className="hover:bg-green-100 text-green-600 border border-green-200 text-sm px-4 py-2 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAcceptingQuestion === r.id ? (
                      "Accepting..."
                    ) : (
                      <>
                  <Check className="w-4 h-4" /> Accept
                      </>
                    )}
                </Button>
              </div>
            </div>
            );
          })
          )}
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Qa;
