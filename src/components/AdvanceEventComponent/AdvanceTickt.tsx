import React, { useState } from "react";
import { Check, ChevronLeft, Plus, X } from "lucide-react";

// Ticket interface
interface Ticket {
  id: string;
  type: string;
  description: string;
  limit: string;
  currency: string;
}

interface AdvanceTicketProps {
  onNext: (eventId?: string | number) => void;
  onPrevious?: () => void;
  eventId?: string | number;
  currentStep: number;
  totalSteps: number;
}

const AdvanceTicket: React.FC<AdvanceTicketProps> = ({
  onNext,
  onPrevious,
  eventId,
  currentStep,
  totalSteps,
}) => {
  const effectiveEventId = eventId || 100;

  // Flow tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    null
  );

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [type, setType] = useState("All users Types");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState("");
  const [currency, setCurrency] = useState("email");

  // Open modal for new ticket
  const handleOpenModal = () => {
    setEditingTicket(null);
    setType("All users Types");
    setDescription("");
    setLimit("");
    setCurrency("email");
    setShowModal(true);
  };

  // Save ticket (new or edit)
  const handleSaveTicket = () => {
    if (!description || !limit) return alert("Please fill required fields.");
    setIsLoading(true);
    setTimeout(() => {
      if (editingTicket) {
        // Edit existing ticket
        setTickets(
          tickets.map((t) =>
            t.id === editingTicket.id
              ? { ...t, type, description, limit, currency }
              : t
          )
        );
      } else {
        // Create new ticket
        const newTicket: Ticket = {
          id: Date.now().toString(),
          type,
          description,
          limit,
          currency,
        };
        setTickets([...tickets, newTicket]);
      }

      resetModal();
      setIsLoading(false);
    }, 500);
  };

  // Delete ticket
  const handleDeleteTicket = () => {
    if (!editingTicket) return;
    setTickets(tickets.filter((t) => t.id !== editingTicket.id));
    resetModal();
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
  };

  const handleEditTicketModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setType(ticket.type);
    setDescription(ticket.description);
    setLimit(ticket.limit);
    setCurrency(ticket.currency);
    setShowModal(true);
  };

  const resetModal = () => {
    setEditingTicket(null);
    setType("All users Types");
    setDescription("");
    setLimit("");
    setCurrency("email");
    setShowModal(false);
  };

  const handleNext = () => {
    if (!selectedTicketId) return alert("Please select a ticket first.");
    localStorage.setItem(
      `selectedTicket_${effectiveEventId}`,
      JSON.stringify(selectedTicketId)
    );
    onNext(effectiveEventId);
  };

  const handleBack = () => {
    if (onPrevious) onPrevious();
  };

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm relative">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <ChevronLeft className="text-gray-500" size={20} />
          <h2 className="text-xl font-semibold text-gray-900">
            Advance Ticket
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === currentStep
                    ? "border-pink-500 bg-white text-pink-500"
                    : step < currentStep
                    ? "bg-pink-500 border-pink-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step < currentStep ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step + 1}</span>
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    step < currentStep ? "bg-pink-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div
          onClick={handleOpenModal}
          className="border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-pink-400 hover:bg-pink-50 flex flex-col items-center justify-center aspect-square"
        >
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
            <Plus className="text-pink-500" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1 text-center text-pink-500">
            Create New Ticket
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Add a custom ticket
          </p>
        </div>

        {tickets.map((t) => (
          <div
            key={t.id}
            onClick={() => handleSelectTicket(t)}
            className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 aspect-square flex flex-col relative ${
              selectedTicketId === t.id
                ? "border-pink-500 bg-pink-50 shadow-md"
                : "border-gray-200 hover:border-pink-300"
            }`}
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{t.type}</h3>
              <p className="text-gray-600 mb-1 line-clamp-3">{t.description}</p>
              <p className="text-gray-500 text-sm">
                Limit: {t.limit}, Currency: {t.currency}
              </p>
            </div>

            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTicketModal(t);
                }}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTickets(tickets.filter((tk) => tk.id !== t.id));
                  if (selectedTicketId === t.id) setSelectedTicketId(null);
                }}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTicket ? "Edit Ticket" : "New Ticket"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-900 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Ticket Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white mb-3"
                >
                  <option>All users Types</option>
                  <option>Type 1</option>
                  <option>Type 2</option>
                  <option>Type 3</option>
                </select>

                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter Your Description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none mb-3"
                />

                <label className="block text-sm font-semibold text-gray-700">
                  Ticket Limit
                </label>
                <input
                  type="text"
                  placeholder="Enter limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors mb-3"
                />

                <label className="block text-sm font-semibold text-gray-700">
                  Currency
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {["email", "sms"].map((c) => (
                    <label
                      key={c}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        currency === c
                          ? "border-blue-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="currency"
                        value={c}
                        checked={currency === c}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="font-medium text-gray-900 capitalize">
                        {c}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-gray-200/60">
              <button
                onClick={handleSaveTicket}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all ${
                  isLoading ? "animate-pulse" : ""
                }`}
              >
                <Plus size={18} />
                {editingTicket ? "Update Ticket" : "Add Ticket"}
              </button>
              {editingTicket && (
                <button
                  onClick={handleDeleteTicket}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="cursor-pointer px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </span>

        <button
          onClick={handleNext}
          disabled={!selectedTicketId}
          className={`cursor-pointer px-6 py-2 rounded-lg text-white transition-colors font-medium ${
            selectedTicketId
              ? "bg-slate-800 hover:bg-slate-900"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default AdvanceTicket;
