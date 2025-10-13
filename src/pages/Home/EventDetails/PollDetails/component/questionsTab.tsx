import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

const QuestionsTab = ({ poll, onAddQuestion, onRemoveQuestion }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswers, setNewAnswers] = useState([""]);

  const addAnswerField = () => {
    setNewAnswers(prev => [...prev, ""]);
  };

  const updateAnswer = (index, value) => {
    setNewAnswers(prev => prev.map((answer, i) => i === index ? value : answer));
  };

  const removeAnswer = (index) => {
    setNewAnswers(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() === "") return;
    
    onAddQuestion({
      question: newQuestion,
      answers: newAnswers
    });

    // Reset form and close modal
    setNewQuestion("");
    setNewAnswers([""]);
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewQuestion("");
    setNewAnswers([""]);
  };

  return (
    <div className="space-y-8">
      {/* Add Question Button */}
      <div className="flex justify-end">
        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
      </div>

      {/* Existing Questions List */}
      <div className="space-y-6">
        {poll.questions.map((question) => (
          <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.text}</h3>
                
                {/* Answers with Checkboxes */}
                <div className="space-y-3">
                  {question.answers.map((answer) => (
                    <div key={answer.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-gray-700">{answer.text}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Delete button */}
              <button 
                onClick={() => onRemoveQuestion(question.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Question</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Question
                </label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Answers Input */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Answers
                  </label>
                  <span className="text-sm text-gray-500">{newAnswers.length} answers</span>
                </div>
                
                <div className="space-y-3">
                  {newAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"></div>
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => updateAnswer(index, e.target.value)}
                        placeholder="Type answer here"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                      {newAnswers.length > 1 && (
                        <button
                          onClick={() => removeAnswer(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add another answer
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestion.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;