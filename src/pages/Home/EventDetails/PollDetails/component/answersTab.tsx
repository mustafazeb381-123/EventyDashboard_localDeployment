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
        <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium mt-1">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{question.text}</h3>
              </div>
            </div>
          </div>

          {/* Answers with Percentages */}
          <div className="space-y-3">
            {question.answers.map((answer) => (
              <div key={answer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{answer.text}</span>
                    <span className="text-sm font-semibold text-gray-900">{answer.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getPercentageBarColor(answer.percentage)}`}
                      style={{ width: `${answer.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  );
};

export default AnswersTab;