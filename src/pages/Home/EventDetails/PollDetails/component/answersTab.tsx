import React from "react";

const AnswersTab = ({ poll }) => {
  const getPercentageBarColor = (percentage) => {
    if (percentage >= 60) return "bg-emerald-500";
    if (percentage >= 30) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div className="space-y-6">
      {poll.questions.map((question, index) => (
        <div
          key={question.id}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium mt-1">
                {index + 1}
              </div>
              <p className="text-lg font-normal text-gray-500">
                {question.text}
              </p>
            </div>
            <p className="text-sm font-medium text-[#737373]">
              10 participants
            </p>
          </div>

          {/* Answers with Percentages */}
          <div className="space-y-3">
            {question.answers.map((answer) => (
              <div
                key={answer.id}
                className="flex items-center justify-start p-3 gap-3"
              >
                {/* <div className="flex-1"> */}
                {/* <div className="flex items-center justify-between mb-2"> */}
                <p className="text-sm font-medium text-gray-700">
                  {answer.text}
                </p>
                {/* </div> */}
                <div className="w-100 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 bg-black ${getPercentageBarColor(
                      answer.percentage
                    )}`}
                    style={{ width: `${answer.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {answer.percentage}%
                </p>
              </div>
              // </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswersTab;
