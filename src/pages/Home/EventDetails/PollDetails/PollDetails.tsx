import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import QuestionsTab from "./component/questionsTab";
import AnswersTab from "./component/answersTab";

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("questions");

  // Sample poll data
  const [poll, setPoll] = useState({
    id: id,
    name: `Poll Name ${id}`,
    questions: [
      {
        id: 1,
        text: "Do participants need an account to join?",
        answers: [
          { id: 1, text: "Ans 1 :", percentage: 60 },
          { id: 2, text: "Ans 2 :", percentage: 30 },
          { id: 3, text: "Ans 3 :", percentage: 10 }
        ]
      }
    ]
  });

  const handleBack = () => {
    navigate("/communication/poll");
  };

  // Function to add new question
  const addNewQuestion = (questionData) => {
    const question = {
      id: Date.now(),
      text: questionData.question,
      answers: questionData.answers.filter(answer => answer.trim() !== "").map((answer, index) => ({
        id: index + 1,
        text: answer,
        percentage: 0
      }))
    };

    setPoll(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));
  };

  // Function to remove question
  const removeQuestion = (questionId) => {
    setPoll(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">{poll.name}</h1>
        </div>
        <div className="flex items-center gap-2 mb-8 ms-8">
            <p>Polls</p>
            <ChevronRight className="w-4 h-4" />
            <p>{poll.name}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
  {/* Tabs */}
  <div className="flex space-x-4">
    {["questions", "answers"].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`px-8 py-2 rounded-md font-medium text-sm transition-colors capitalize ${
          activeTab === tab
            ? "bg-blue-100 text-pri-color-800"
            : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>

  {/* Add Question Button */}
  <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-100 text-pri-color-800 font-medium text-sm hover:bg-blue-200 transition-colors">
  <Plus className="w-4 h-4" />
    Add New Question
  </button>
</div>


        {/* Render Active Tab */}
        {activeTab === "questions" && (
          <QuestionsTab
            poll={poll}
            onAddQuestion={addNewQuestion}
            onRemoveQuestion={removeQuestion}
          />
        )}

        {activeTab === "answers" && (
          <AnswersTab poll={poll} />
        )}
      </div>
    </div>
  );
};

export default PollDetails;