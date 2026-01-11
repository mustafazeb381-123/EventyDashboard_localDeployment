import React from "react";
import { type Poll } from "@/apis/pollsService";

interface AnswersTabProps {
  poll: Poll;
  totalVotes: number;
}

const AnswersTab: React.FC<AnswersTabProps> = ({ poll, totalVotes }) => {
  return (
    <div className="space-y-4">
      {/* Question Card with Results */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-6">
          <p className="text-gray-800">
            <span className="text-gray-400 mr-2">01.</span>
            {poll.question}
          </p>
          <span className="text-sm text-gray-500 shrink-0 ml-4">
            {totalVotes} {totalVotes === 1 ? "Participant" : "Participants"}
          </span>
        </div>

        {/* Answer Results with Progress Bars */}
        <div className="space-y-4">
          {(poll.poll_options || []).map((option, index) => {
            const percentage = Number(option.percentage || 0);
            return (
              <div key={option.id} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 min-w-[80px]">
                  Answer {index + 1} :
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-lg">
                  <div
                    className="h-2 rounded-full bg-[#1E2A4A] transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 min-w-[45px] text-right">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnswersTab;
