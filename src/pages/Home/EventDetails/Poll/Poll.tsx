import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const pollsData = new Array(6).fill(0).map((_, index) => ({
  id: index + 1,
  name: `Poll Name ${index + 1}`,
  session: `Session Name ${index + 1}`,
  questions: 2,
  published: false,
}));

const Poll = () => {
  const [polls, setPolls] = useState(pollsData);
  const navigate = useNavigate();

  const togglePublish = (id) => {
    setPolls((prev) =>
      prev.map((poll) =>
        poll.id === id ? { ...poll, published: !poll.published } : poll
      )
    );
  };

  const handlePollClick = (pollId) => {
    navigate(`/communication/Poll/${pollId}`);
  };

  return (
    <div className="bg-[#F9FAFB] p-8"> {/* Remove min-h-screen */}
      <div className="mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 style={{ fontSize: 20 }} className="text-2xl font-regular text-gray-800">
            Polls
          </h1>
          <div className="flex items-center">
            <div className="mb-0">
              <select className="px-1 py-2 border rounded-md shadow-sm text-sm text-gray-700 me-8 w-72">
                <option>All Sessions</option>
                <option>Session 1</option>
                <option>Session 2</option>
              </select>
            </div>
            <button className="bg-blue-100 text-black px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              + Create New Poll
            </button>
          </div>
        </div>

        {/* Grid of Polls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <div
              key={poll.id}
              onClick={() => handlePollClick(poll.id)}
              className="rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              style={{
                background: "#F5F5F5",
                borderWidth: 0.5,
                borderColor: "#D1D5DB",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-medium text-gray-900 mb-1">
                    {poll.name}
                  </div>
                  <div className="text-medium text-gray-500 mb-4 text-violet-800">
                    {poll.session}
                  </div>
                </div>
                <div className="bg-gray-100">
                  <div className="text-sm text-neutral-500 bg-white px-4 py-2 rounded-3xl shadow">
                    {poll.questions} questions
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8">
                <span className="text-sm font-medium text-gray-700">
                  Publish:
                </span>

                <label
                  className="relative inline-flex items-center cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={poll.published}
                    onChange={() => togglePublish(poll.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      poll.published ? "bg-teal-500" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        poll.published ? "translate-x-5" : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Poll;