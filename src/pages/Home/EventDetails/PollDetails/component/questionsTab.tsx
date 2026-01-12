import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import {
  updateAgendaPoll,
  createAgendaPoll,
  type Poll,
  type PollType,
} from "@/apis/pollsService";

interface QuestionsTabProps {
  poll: Poll | null;
  eventId: string;
  agendaId: string;
  onRefresh: () => void;
  triggerAddQuestion?: number;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({
  poll,
  eventId,
  agendaId,
  onRefresh,
  triggerAddQuestion,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [question, setQuestion] = useState("");
  const [pollType, setPollType] = useState<PollType>("single_answer");
  const [answers, setAnswers] = useState<Array<{ id?: number; text: string }>>([
    { text: "" },
    { text: "" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Listen for external "Add New Question" button clicks
  useEffect(() => {
    if (triggerAddQuestion && triggerAddQuestion > 0) {
      startAddNew();
    }
  }, [triggerAddQuestion]);

  const startAddNew = () => {
    setQuestion("");
    setPollType("single_answer");
    setAnswers([{ text: "" }, { text: "" }]);
    setIsAddingNew(true);
    setIsEditing(false);
  };

  const startEdit = () => {
    if (!poll) return;
    setQuestion(poll.question || "");
    setPollType(poll.poll_type || "single_answer");
    setAnswers(
      poll.poll_options?.length > 0
        ? poll.poll_options.map((opt) => ({
            id: opt.id,
            text: opt.option_text,
          }))
        : [{ text: "" }, { text: "" }]
    );
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const cancelEdit = () => {
    setIsAddingNew(false);
    setIsEditing(false);
    setQuestion("");
    setAnswers([{ text: "" }, { text: "" }]);
  };

  const addAnswerField = () => {
    setAnswers((prev) => [...prev, { text: "" }]);
  };

  const updateAnswer = (index: number, value: string) => {
    setAnswers((prev) =>
      prev.map((answer, i) =>
        i === index ? { ...answer, text: value } : answer
      )
    );
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!question.trim()) {
      toast.error("Question is required");
      return;
    }

    const trimmedAnswers = answers
      .map((a) => ({ ...a, text: a.text.trim() }))
      .filter((a) => a.text.length > 0);

    if (trimmedAnswers.length < 2) {
      toast.error("Please add at least 2 answers");
      return;
    }

    setIsSaving(true);
    try {
      if (isAddingNew) {
        // Create new poll
        const response = await createAgendaPoll(eventId, agendaId, {
          poll: {
            question: question.trim(),
            poll_type: pollType,
            active: true,
            poll_options_attributes: trimmedAnswers.map((a) => ({
              option_text: a.text,
            })),
          },
        });

        console.log("Create poll response:", response.data);

        toast.success("Poll created successfully");
        setIsAddingNew(false);
        setIsEditing(false);

        // Refresh to get the updated poll data
        // Note: After creating, you might need to navigate to the new poll's page
        // For now, we'll refresh which should work if we're viewing that poll
        onRefresh();
      } else if (isEditing && poll) {
        // Update existing poll
        await updateAgendaPoll(eventId, agendaId, poll.id, {
          poll: {
            question: question.trim(),
            poll_type: poll.poll_type,
            active: poll.active,
            poll_options_attributes: trimmedAnswers.map((a) => ({
              id: a.id,
              option_text: a.text,
            })),
          },
        });
        toast.success("Poll updated successfully");
        setIsAddingNew(false);
        setIsEditing(false);
        onRefresh();
      }
    } catch (error: any) {
      console.error("Error saving poll:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save poll";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Question Form - Inline */}
      {(isAddingNew || isEditing) && (
        <div className="bg-[#F8F9FF] rounded-xl p-6 border-2 border-dashed border-[#7C3AED]">
          {/* Question Input Row */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-400 text-sm font-medium">01.</span>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type question here"
              className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
            {isAddingNew && (
              <select
                value={pollType}
                onChange={(e) => setPollType(e.target.value as PollType)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm"
              >
                <option value="single_answer">Single Answer</option>
                <option value="multiple_answer">Multiple Answer</option>
              </select>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !question.trim()}
              className="px-6 py-2 bg-[#1E2A4A] text-white rounded-lg hover:bg-[#2a3a5a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {isSaving ? "Saving..." : isEditing ? "Save" : "Add Question"}
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-[#7C3AED] my-4" />

          {/* Answer Fields */}
          <div className="space-y-3">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  disabled
                  className="w-5 h-5 rounded border-gray-300 text-blue-600"
                />
                <input
                  type="text"
                  value={answer.text}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  placeholder="Type answer here"
                  className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400"
                />
                {answers.length > 2 && (
                  <button
                    onClick={() => removeAnswer(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Answer Button */}
          <button
            onClick={addAnswerField}
            className="flex items-center gap-2 mt-4 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add answer
          </button>
        </div>
      )}

      {/* Existing Question Display */}
      {!isEditing && poll && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Question */}
              <p className="text-gray-800 mb-4 font-medium">
                <span className="text-gray-400 mr-2">01.</span>
                {poll.question}
              </p>

              {/* Poll Type Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {poll.poll_type === "single_answer"
                    ? "Single Answer"
                    : "Multiple Answer"}
                </span>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2 font-medium">
                  Options:
                </p>
                {(poll.poll_options || []).map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <input
                      type={
                        poll.poll_type === "single_answer"
                          ? "radio"
                          : "checkbox"
                      }
                      disabled
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-gray-700">
                      {option.option_text || `Answer ${index + 1}`}
                    </span>
                    {option.votes_count !== undefined && (
                      <span className="text-xs text-gray-500 ml-auto">
                        ({option.votes_count} votes)
                      </span>
                    )}
                  </div>
                ))}
                {(!poll.poll_options || poll.poll_options.length === 0) && (
                  <p className="text-sm text-gray-400 italic">
                    No options available
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this poll?")
                  ) {
                    toast.info("Delete functionality handled by parent");
                  }
                }}
                className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={startEdit}
                className="p-2.5 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;
