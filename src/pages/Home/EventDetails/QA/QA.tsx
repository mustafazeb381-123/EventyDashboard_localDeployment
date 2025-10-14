import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Check, X, User2, ThumbsUp } from "lucide-react";

const Qa: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"questions" | "requests">("questions");
  const [lockAsks, setLockAsks] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  const questionsData = [
    {
      id: 1,
      name: "FeedbackUser",
      time: "1 min ago",
      question: "What happens if I leave the session early?",
      status: "Check Answered",
      likes: 18,
    },
    {
      id: 2,
      name: "Anonymous",
      time: "2 mins ago",
      question: "Do participants need an account to join?",
      status: "Check Answered",
      likes: 24,
    },
    {
      id: 3,
      name: "User123",
      time: "12 mins ago",
      question: "Can I join from my mobile device?",
      status: "Answered",
      likes: 10,
    },
    {
      id: 4,
      name: "TechGuru",
      time: "18 mins ago",
      question: "What if I forget my password?",
      status: "Answered",
      likes: 5,
    },
  ];

  const requestsData = [
    {
      id: 1,
      name: "Anonymous",
      time: "2 mins ago",
      question: "Do participants need an account to join?",
    },
    {
      id: 2,
      name: "TechGuy",
      time: "3 mins ago",
      question: "Are there any restrictions on content shared during the session?",
    },
    {
      id: 3,
      name: "JohnDoe#8",
      time: "5 mins ago",
      question: "Can participants join anonymously?",
    },
    {
      id: 4,
      name: "SaraLee",
      time: "8 mins ago",
      question: "What happens if someone leaves the session early?",
    },
    {
      id: 5,
      name: "Marko_Smith",
      time: "9 mins ago",
      question: "Is there a limit to the number of participants?",
    },
  ];

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Communication</h2>

        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <select className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none">
            <option>All Sessions</option>
            <option>Session 1</option>
            <option>Session 2</option>
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
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition bg-blue-50">
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
              </label>

              <Button className="text-sm bg-green-500 hover:bg-green-600 text-white px-3">
                Accept All Questions
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
          <span className="ml-1 bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            1
          </span>
        </button>
      </div>

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {questionsData.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                {/* User Icon */}
                <div className="bg-gray-100 rounded-full p-2">
                  <User2 className="w-5 h-5 text-gray-600" />
                </div>

                <div>
                  <div className="items-center gap-2 text-sm text-gray-600 mb-5">
                    <p className="font-medium text-gray-800">{q.name}</p>
                    <p className="text-gray-400 text-xs">{q.time}</p>
                  </div>
                  <p className="text-gray-700 mt-1 text-sm">{q.question}</p>
                </div>
              </div>

              {/* Like button + Status */}
              <div className="items-center gap-3">
               

                {q.status !== "Answered" ? (
                  <span className="text-xs bg-blue-50 font-medium bg-green-50 px-4 py-2 rounded-full flex items-center gap-1">
                    <Check className="w-4 h-4" /> Check Answered
                  </span>
                ) : (
                  <span className="text-green-600 text-xs font-medium px-3 py-1 rounded-full">
                    {q.status}
                  </span>
                )}
                 <div style={{right:60}} className="bg-red absolute">
                 <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition text-sm">
                  <ThumbsUp className="w-4 h-4" />
                  <p>{q.likes}</p>
                </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          {requestsData.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                {/* User Icon only */}
                <div className="bg-gray-100 rounded-full p-2">
                  <User2 className="w-5 h-5 text-gray-600" />
                </div>

                <div>
                  <div className="items-center gap-2 text-sm text-gray-600 mb-4">
                    <p className="font-medium text-gray-800">{r.name}</p>
                    <p className="text-gray-400 text-xs">{r.time}</p>
                  </div>
                  <p className="text-gray-700 mt-1 text-sm">{r.question}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="text-sm px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Reject
                </Button>
                <Button className="bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 text-sm px-4 py-2 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Qa;
