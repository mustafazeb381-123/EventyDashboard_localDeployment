import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import {
  updateAgendaPoll,
  type Poll,
} from "@/apis/pollsService";

interface QuestionsTabProps {
  poll: Poll;
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
    setAnswers([{ text: "" }, { text: "" }]);
    setIsAddingNew(true);
    setIsEditing(false);
  };

  const startEdit = () => {
    setQuestion(poll.question || "");
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
    } catch (error: any) {
      console.error("Error updating poll:", error);
      toast.error(error?.response?.data?.message || "Failed to update poll");
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
            <button
              onClick={handleSave}
              disabled={isSaving || !question.trim()}
              className="px-6 py-2 bg-[#1E2A4A] text-white rounded-lg hover:bg-[#2a3a5a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {isSaving ? "Saving..." : isEditing ? "Save" : "Add Question"}
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
      {!isEditing && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Question */}
              <p className="text-gray-800 mb-4">
                <span className="text-gray-400 mr-2">01.</span>
                {poll.question}
              </p>

              {/* Answer Options */}
              <div className="space-y-3">
                {(poll.poll_options || []).map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      disabled
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-gray-700">
                      {option.option_text || `Answer ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this poll?")) {
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
