import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeft, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getAgendaPollResults,
  getAgendaPoll,
  type Poll,
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

  const canLoad = useMemo(
    () => Boolean(id) && Boolean(eventId) && Boolean(agendaId),
    [id, eventId, agendaId]
  );

  const refresh = async () => {
    if (!canLoad) return;

    setIsLoading(true);
    try {
      // Try getting the poll directly first (better for getting options)
      let response;
      try {
        response = await getAgendaPoll(eventId!, agendaId!, id!);
      } catch (error) {
        // Fallback to results endpoint if direct poll endpoint fails
        console.log("Direct poll endpoint failed, trying results endpoint");
        response = await getAgendaPollResults(eventId!, agendaId!, id!);
      }

      // Handle flexible response structure including JSON:API format
      const responseData = response.data as any;

      console.log("Poll response data:", JSON.stringify(responseData, null, 2));

      // Handle JSON:API format: response.data.data.attributes or response.data.attributes
      let pollData: any = null;
      let pollOptions: any[] = [];

      if (responseData?.data?.attributes) {
        // JSON:API format - nested structure
        const attributes = responseData.data.attributes;
        pollData = {
          id: Number(responseData.data.id) || Number(attributes.id),
          agenda_id: attributes.agenda_id,
          question: attributes.question,
          poll_type: attributes.poll_type,
          active: attributes.active,
          total_votes: attributes.total_votes || 0,
          created_at: attributes.created_at,
          updated_at: attributes.updated_at,
        };

        console.log("Poll options from attributes:", attributes.poll_options);

        // Handle poll_options in JSON:API format - multiple possible structures
        if (
          attributes.poll_options?.data &&
          Array.isArray(attributes.poll_options.data)
        ) {
          // Structure: poll_options.data[].attributes.option_text
          pollOptions = attributes.poll_options.data.map((opt: any) => ({
            id: Number(opt.id),
            poll_id: pollData.id,
            option_text: opt.attributes?.option_text || opt.option_text || "",
            votes_count: opt.attributes?.votes_count ?? opt.votes_count ?? 0,
            percentage: opt.attributes?.percentage ?? opt.percentage ?? 0,
          }));
        } else if (
          attributes.poll_options &&
          Array.isArray(attributes.poll_options)
        ) {
          // Structure: poll_options[] with direct properties
          pollOptions = attributes.poll_options.map((opt: any) => ({
            id: Number(opt.id || opt.attributes?.id),
            poll_id: pollData.id,
            option_text: opt.option_text || opt.attributes?.option_text || "",
            votes_count: opt.votes_count ?? opt.attributes?.votes_count ?? 0,
            percentage: opt.percentage ?? opt.attributes?.percentage ?? 0,
          }));
        } else if (
          attributes.poll_options &&
          typeof attributes.poll_options === "object"
        ) {
          // Handle case where poll_options is an object but not an array
          console.warn(
            "poll_options is an object but not an array:",
            attributes.poll_options
          );
        }

        pollData.poll_options = pollOptions;
      } else if (responseData?.poll) {
        // Standard format with poll object
        pollData = responseData.poll;
        // Ensure poll_options is an array
        if (pollData.poll_options && !Array.isArray(pollData.poll_options)) {
          pollData.poll_options = [];
        }
      } else if (responseData?.data && responseData.data.id) {
        // Check if data is already a poll object (not nested attributes)
        if (responseData.data.question || responseData.data.poll_type) {
          pollData = responseData.data;
          // Ensure poll_options is an array
          if (pollData.poll_options && !Array.isArray(pollData.poll_options)) {
            pollData.poll_options = [];
          }
        }
      } else if (responseData?.data) {
        // Direct data object - might also be JSON:API
        if (responseData.data.attributes) {
          const attributes = responseData.data.attributes;
          pollData = {
            id: Number(responseData.data.id) || Number(attributes.id),
            agenda_id: attributes.agenda_id,
            question: attributes.question,
            poll_type: attributes.poll_type,
            active: attributes.active,
            total_votes: attributes.total_votes || 0,
            created_at: attributes.created_at,
            updated_at: attributes.updated_at,
          };

          if (
            attributes.poll_options?.data &&
            Array.isArray(attributes.poll_options.data)
          ) {
            pollOptions = attributes.poll_options.data.map((opt: any) => ({
              id: Number(opt.id),
              poll_id: pollData.id,
              option_text: opt.attributes?.option_text || opt.option_text || "",
              votes_count: opt.attributes?.votes_count ?? opt.votes_count ?? 0,
              percentage: opt.attributes?.percentage ?? opt.percentage ?? 0,
            }));
          } else if (
            attributes.poll_options &&
            Array.isArray(attributes.poll_options)
          ) {
            pollOptions = attributes.poll_options.map((opt: any) => ({
              id: Number(opt.id || opt.attributes?.id),
              poll_id: pollData.id,
              option_text: opt.option_text || opt.attributes?.option_text || "",
              votes_count: opt.votes_count ?? opt.attributes?.votes_count ?? 0,
              percentage: opt.percentage ?? opt.attributes?.percentage ?? 0,
            }));
          }
          pollData.poll_options = pollOptions;
        } else {
          pollData = responseData.data;
        }
      } else {
        pollData = responseData;
      }

      // Ensure poll_options is always an array
      if (pollData) {
        if (!pollData.poll_options || !Array.isArray(pollData.poll_options)) {
          pollData.poll_options = pollOptions.length > 0 ? pollOptions : [];
        }
      }

      console.log("Parsed poll data:", pollData);
      console.log("Poll options count:", pollData?.poll_options?.length || 0);

      if (
        pollData &&
        typeof pollData === "object" &&
        ("id" in pollData || pollData.id)
      ) {
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
          <span className="text-gray-700">{poll?.question || "Poll Name"}</span>
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
