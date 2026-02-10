import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  Plus
} from "lucide-react";
import { getAllEvents } from "@/apis/apiHelpers";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  event: string;
}

interface EventOption {
  id: string;
  name: string;
}

export default function Management() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "#182",
      name: "Mohammed",
      email: "merom8703@gmail.com",
      role: "Author",
      event: "scc",
    },
    {
      id: "#182",
      name: "Mohammed",
      email: "merom8703@gmail.com",
      role: "Author",
      event: "scc",
    },
    {
      id: "#182",
      name: "Mohammed",
      email: "merom8703@gmail.com",
      role: "Author",
      event: "scc",
    },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    event: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set());
  const itemsPerPage = 10;

  // Events for dropdown (from API)
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Fetch all events for the Event dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        let allEvents: EventOption[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await getAllEvents({
            page,
            per_page: 100,
          });

          if (response.data?.data && Array.isArray(response.data.data)) {
            const items = response.data.data.map((item: { id: string | number; name?: string; attributes?: { name?: string } }) => ({
              id: String(item.id),
              name: item.name ?? item.attributes?.name ?? "",
            }));
            allEvents = [...allEvents, ...items];

            const pagination = response.data?.meta?.pagination;
            if (items.length === 0) {
              hasMore = false;
            } else if (pagination?.next_page != null) {
              page = pagination.next_page;
            } else if (pagination?.current_page != null && pagination?.total_pages != null && pagination.current_page < pagination.total_pages) {
              page = pagination.current_page + 1;
            } else if (pagination?.total_pages != null && page < pagination.total_pages) {
              page += 1;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        setEventsList(allEvents);
      } catch (error) {
        console.error("Management - Error fetching events:", error);
        setEventsList([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.role) {
      const newMember: TeamMember = {
        id: `#${Math.floor(Math.random() * 1000)}`,
        ...formData,
      };
      setTeamMembers((prev) => [...prev, newMember]);
      setFormData({ name: "", email: "", role: "", event: "" });
    }
  };

  const handleDeleteMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSelectMember = (index: number) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedMembers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === teamMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(teamMembers.map((_, i) => i)));
    }
  };

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="mx-auto space-y-6">
        {/* Add Management Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add Management</h2>
          </div>

          <form onSubmit={handleAddMember}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Type Member Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Role
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-600 bg-white"
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Author">Author</option>
                    <option value="Usher">Usher</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Event */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Event
                </label>
                <div className="relative">
                  <select
                    name="event"
                    value={formData.event}
                    onChange={handleInputChange}
                    disabled={eventsLoading}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-gray-600 bg-white disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {eventsLoading ? "Loading events..." : "Select Event"}
                    </option>
                    {!eventsLoading &&
                      eventsList.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.name || `Event #${ev.id}`}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </Button>
            </div>
          </form>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Members List</h2>
              <div className="flex items-center gap-4">
                {/* Show in page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show in page</span>
                  <div className="relative">
                    <select className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm appearance-none bg-white">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1E3A5F] text-white">
                  <th className="px-6 py-3.5 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMembers.size === teamMembers.length && teamMembers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-white/30"
                    />
                  </th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold">Event</th>
                  <th className="px-6 py-3.5 text-left text-sm font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(index)}
                        onChange={() => toggleSelectMember(index)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {member.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {member.event}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(index)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button className="px-4 py-2 text-sm text-gray-400 flex items-center gap-2">
              <span>←</span> Previous
            </button>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-medium">
                1
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700">
                2
              </button>
              <button className="w-8 h-8 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700">
                3
              </button>
            </div>
            <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              Next <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}