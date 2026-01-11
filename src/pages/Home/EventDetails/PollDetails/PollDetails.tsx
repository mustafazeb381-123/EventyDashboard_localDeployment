import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BarChart3,
  ChevronLeft,
  Loader2,
  Power,
  Trash2,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  activateAgendaPoll,
  deactivateAgendaPoll,
  deleteAgendaPoll,
  getAgendaPollResults,
  updateAgendaPoll,
  createAgendaPoll,
  voteAgendaPoll,
  type Poll,
  type PollType,
} from "@/apis/pollsService";
import QuestionsTab from "./component/questionsTab";
import AnswersTab from "./component/answersTab";
import { Plus } from "lucide-react";

const PollDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const eventId = searchParams.get("eventId");
  const agendaId = searchParams.get("agendaId");

  const [poll, setPoll] = useState<Poll | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"questions" | "answers">(
    "questions"
  );
  const [triggerAddQuestion, setTriggerAddQuestion] = useState(0);

  const [eventUserId, setEventUserId] = useState<string>("");
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [isVoting, setIsVoting] = useState(false);

  const canLoad = useMemo(
    () => Boolean(id) && Boolean(eventId) && Boolean(agendaId),
    [id, eventId, agendaId]
  );

  const refresh = async () => {
    if (!canLoad) return;

    setIsLoading(true);
    try {
      const response = await getAgendaPollResults(eventId!, agendaId!, id!);
      // Handle flexible response structure
      const responseData = response.data;
      const pollData =
        responseData?.poll || responseData?.data?.poll || responseData;

      if (pollData && typeof pollData === "object" && "id" in pollData) {
        setPoll(pollData as Poll);
        setTotalVotes(
          responseData?.total_votes ??
            responseData?.data?.total_votes ??
            pollData.total_votes ??
            0
        );
      } else {
        console.error("Invalid poll response structure:", responseData);
        toast.error("Invalid poll data received");
      }
    } catch (error: any) {
      console.error("Error fetching poll details:", error);
      if (error?.response?.status === 404) {
        toast.error("Poll not found");
        handleBack();
      } else {
        toast.error("Failed to load poll");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const handleBack = () => {
    navigate(
      eventId ? `/communication/poll?eventId=${eventId}` : "/communication/poll"
    );
  };

  const onToggleActive = async () => {
    if (!poll || !eventId || !agendaId || !id) return;
    try {
      if (poll.active) {
        await deactivateAgendaPoll(eventId, agendaId, id);
        toast.success("Poll deactivated");
      } else {
        await activateAgendaPoll(eventId, agendaId, id);
        toast.success("Poll activated");
      }
      await refresh();
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Failed to update status");
    }
  };

  const onDelete = async () => {
    if (!poll || !eventId || !agendaId || !id) return;
    if (!window.confirm("Delete this poll?")) return;

    try {
      await deleteAgendaPoll(eventId, agendaId, id);
      toast.success("Poll deleted");
      handleBack();
    } catch (error) {
      console.error("Delete poll error:", error);
      toast.error("Failed to delete poll");
    }
  };

  const onSelectOption = (optionId: number) => {
    if (!poll) return;
    if (poll.poll_type === "single_answer") {
      setSelectedOptionIds([optionId]);
      return;
    }
    setSelectedOptionIds((prev) =>
      prev.includes(optionId)
        ? prev.filter((x) => x !== optionId)
        : [...prev, optionId]
    );
  };

  const submitVote = async () => {
    if (!poll || !eventId || !agendaId || !id) return;

    const numericEventUserId = Number(eventUserId);
    if (!Number.isFinite(numericEventUserId) || numericEventUserId <= 0) {
      toast.error("event_user_id must be a valid number");
      return;
    }
    if (selectedOptionIds.length === 0) {
      toast.error("Select at least one option");
      return;
    }
    if (poll.poll_type === "single_answer" && selectedOptionIds.length !== 1) {
      toast.error("Single answer poll requires exactly one selection");
      return;
    }

    setIsVoting(true);
    try {
      await voteAgendaPoll(eventId, agendaId, id, {
        event_user_id: numericEventUserId,
        poll_option_ids:
          poll.poll_type === "single_answer"
            ? selectedOptionIds[0]
            : selectedOptionIds,
      });
      toast.success("Vote recorded successfully");
      await refresh();
    } catch (error: any) {
      console.error("Vote error:", error);
      const message = error?.response?.data?.error || "Failed to vote";
      toast.error(message);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header with back button and breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {poll?.question || "Poll Name"}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 ml-8">
          <span>Polls</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-700">
            {poll?.question || "Poll Name"}
          </span>
        </div>
      </div>

      {!canLoad && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
          Missing context (need poll id + eventId + agendaId). Go back and open
          a poll from the list.
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}

      {poll && (
        <div className="bg-white rounded-xl p-6">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "questions"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Poll Questions
              </button>
              <button
                onClick={() => setActiveTab("answers")}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "answers"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Answers
              </button>
            </div>
            {activeTab === "questions" && (
              <Button
                onClick={() => setTriggerAddQuestion((prev) => prev + 1)}
                className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-4 py-2 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Question
              </Button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "questions" && (
            <QuestionsTab
              poll={poll}
              eventId={eventId!}
              agendaId={agendaId!}
              onRefresh={refresh}
              triggerAddQuestion={triggerAddQuestion}
            />
          )}
          {activeTab === "answers" && (
            <AnswersTab poll={poll} totalVotes={totalVotes} />
          )}
        </div>
      )}

      {/* Done Button */}
      {poll && (
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleBack}
            className="bg-[#1E2A4A] hover:bg-[#2a3a5a] text-white px-6 py-2.5 font-medium"
          >
            Done
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PollDetails;
