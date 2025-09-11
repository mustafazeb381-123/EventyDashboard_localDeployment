import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  X,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  DollarSign,
} from "lucide-react";

function Agenda() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "25/07/2025",
    timeFrom: "09:00 AM",
    timeTo: "05:00 PM",
    location: "",
    speakers: [],
    display: true,
    requiredEnrollment: true,
    paid: true,
    price: "",
    onlinePayment: true,
    cashPayment: false,
  });

  const [sessions] = useState([
    {
      id: 1,
      title: "Title One",
      startTime: "2025-06-22 18:49:00 +0300",
      endTime: "2025-06-22 18:49:00 +0300",
      location: "Location here",
      type: "Type 01",
      speakers: [
        {
          id: 1,
          name: "John Doe",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 2,
          name: "Jane Smith",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b9f70ce5?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 3,
          name: "Mike Johnson",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 4,
          name: "Sarah Wilson",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 5,
          name: "Tom Brown",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
        },
      ],
      additionalSpeakers: 5,
    },
    {
      id: 2,
      title: "Title Two",
      startTime: "2025-06-22 18:49:00 +0300",
      endTime: "2025-06-22 18:49:00 +0300",
      location: "Location here",
      type: "Type 01",
      speakers: [
        {
          id: 1,
          name: "John Doe",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 2,
          name: "Jane Smith",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b9f70ce5?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 3,
          name: "Mike Johnson",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 4,
          name: "Sarah Wilson",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 5,
          name: "Tom Brown",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
        },
      ],
      additionalSpeakers: 5,
    },
    {
      id: 3,
      title: "Title Three",
      startTime: "2025-06-22 18:49:00 +0300",
      endTime: "2025-06-22 18:49:00 +0300",
      location: "Location here",
      type: "Type 01",
      speakers: [
        {
          id: 1,
          name: "John Doe",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 2,
          name: "Jane Smith",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b9f70ce5?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 3,
          name: "Mike Johnson",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 4,
          name: "Sarah Wilson",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
        },
        {
          id: 5,
          name: "Tom Brown",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
        },
      ],
      additionalSpeakers: 5,
    },
    {
      id: 4,
      title: "Title Four",
      startTime: "2025-06-22 18:49:00 +0300",
      endTime: "2025-06-22 18:49:00 +0300",
      location: "Location here",
      type: "Type 01",
      speakers: [
        {
          id: 1,
          name: "Liam Anderson",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        },
      ],
      speakerName: "Liam Anderson",
    },
    {
      id: 5,
      title: "Title Five",
      startTime: "2025-06-22 18:49:00 +0300",
      endTime: "2025-06-22 18:49:00 +0300",
      location: "Location here",
      type: "Type 01",
      speakers: [{ id: 1, name: "Ethan Carter", avatar: null }],
      speakerName: "Ethan Carter",
    },
  ]);

  const availableSpeakers = [
    {
      id: 1,
      name: "Liam Anderson",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Luca Thompson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Jane Doe",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b9f70ce5?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const [selectedSpeakers, setSelectedSpeakers] = useState([1, 2]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSessions(sessions.map((session) => session.id));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleSpeakerToggle = (speakerId) => {
    setSelectedSpeakers((prev) =>
      prev.includes(speakerId)
        ? prev.filter((id) => id !== speakerId)
        : [...prev, speakerId]
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    setIsModalOpen(false);
  };

  const SpeakerAvatar = ({ speaker, size = "w-8 h-8" }) => {
    if (speaker.avatar) {
      return (
        <img
          src={speaker.avatar}
          alt={speaker.name}
          className={`${size} rounded-full object-cover`}
        />
      );
    }

    return (
      <div
        className={`${size} rounded-full bg-blue-100 flex items-center justify-center`}
      >
        <svg
          className="w-4 h-4 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  };

  const SpeakersDisplay = ({ session }) => {
    if (session.speakers.length > 5) {
      const visibleSpeakers = session.speakers.slice(0, 5);
      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {visibleSpeakers.map((speaker, index) => (
              <SpeakerAvatar key={index} speaker={speaker} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            +{session.additionalSpeakers}
          </span>
        </div>
      );
    } else if (session.speakerName) {
      return (
        <div className="flex items-center gap-3">
          <SpeakerAvatar speaker={session.speakers[0]} size="w-10 h-10" />
          <span className="text-sm font-medium text-gray-900">
            {session.speakerName}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {session.speakers.map((speaker, index) => (
              <SpeakerAvatar key={index} speaker={speaker} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            +{session.additionalSpeakers}
          </span>
        </div>
      );
    }
  };

  return (
    <>
      <div className="bg-white min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">Sessions</h1>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                {sessions.length} Sessions
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Sessions
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      onChange={handleSelectAll}
                      checked={selectedSessions.length === sessions.length}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speakers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session, index) => (
                  <tr
                    key={session.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectedSessions.includes(session.id)}
                        onChange={() => handleSelectSession(session.id)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {session.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>2025-06-22</div>
                      <div>18:49:00 +0300</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>2025-06-22</div>
                      <div>18:49:00 +0300</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {session.location}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {session.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <SpeakersDisplay session={session} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Add Sessions
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="text here"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time From
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.timeFrom}
                          onChange={(e) =>
                            handleInputChange("timeFrom", e.target.value)
                          }
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.timeTo}
                          onChange={(e) =>
                            handleInputChange("timeTo", e.target.value)
                          }
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="location here"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Speakers */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Speakers
                      </label>
                      <span className="text-sm text-gray-500">
                        {selectedSpeakers.length} Added
                      </span>
                    </div>
                    <div className="space-y-3">
                      {availableSpeakers.map((speaker) => (
                        <div
                          key={speaker.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSpeakers.includes(speaker.id)}
                            onChange={() => handleSpeakerToggle(speaker.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <SpeakerAvatar speaker={speaker} size="w-10 h-10" />
                          <span className="text-sm font-medium text-gray-900">
                            {speaker.name}
                          </span>
                        </div>
                      ))}
                      <button className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Toggle Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Display
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.display}
                          onChange={(e) =>
                            handleInputChange("display", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Required Enrollment
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.requiredEnrollment}
                          onChange={(e) =>
                            handleInputChange(
                              "requiredEnrollment",
                              e.target.checked
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Paid
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.paid}
                          onChange={(e) =>
                            handleInputChange("paid", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="text"
                      placeholder="Price here"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.onlinePayment}
                        onChange={(e) =>
                          handleInputChange("onlinePayment", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Online payment
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.cashPayment}
                        onChange={(e) =>
                          handleInputChange("cashPayment", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Cash payment
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Agenda;
