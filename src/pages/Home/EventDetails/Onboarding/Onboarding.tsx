import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GateOnboarding from "./GateOnboarding";
import { Plus, X, Copy, ArrowRight, Trash2 } from "lucide-react";
import { getSessionAreaApi, createGate, getGates } from "@/apis/apiHelpers";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deleteGate } from "@/apis/apiHelpers";

function Onboarding() {

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("event");
  const [showGateOnboarding, setShowGateOnboarding] = useState(false);
  const [selectedGate, setSelectedGate] = useState(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [areasData, setAreasData] = useState<any[]>([]);
  const [gatesData, setGatesData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [eventId, setEventId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("eventId");
    if (id) setEventId(id);
  }, [location]);

  // Fetch Areas
  useEffect(() => {
    const fetchAreas = async () => {
      if (!eventId) return;
      try {
        const response = await getSessionAreaApi(eventId);
        setAreasData(response.data.data);
        const areaNames = response.data.data.map((area: { attributes: { name: string } }) => area.attributes.name);
        setAreas(areaNames);
      } catch (err) {
        console.error("Error fetching areas:", err);
      }
    };
    fetchAreas();
  }, [eventId]);


  // Fetch Gates
  const fetchGates = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const response = await getGates(eventId);

      // ✅ Log to see structure
      console.log("Full response:", response);
      console.log("Response data:", response.data);

      // ✅ Safely handle nested structure
      setGatesData(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error("Error fetching gates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGates();
  }, [eventId]);

  const getAreaIdByName = (name: string) => {
    const areaObj = areasData.find(a => a.attributes.name === name);
    return areaObj ? areaObj.id : null;
  };

  const handleCreateGate = async () => {
    if (!eventId) return alert("Event ID is required");
    setIsLoading(true);

    try {
      const body: any = {
        check_in_and_out_gate: {
          event_id: Number(eventId),
          session_area_id: activeTab === "area" ? getAreaIdByName(title) : null,
          agenda_id: null,
        },
      };
      console.log("Sending:", body);

      await createGate(body);
      toast.success("Gate created successfully!");
      setShowModal(false);
      setTitle("");
      fetchGates(); // refresh after creation
    } catch (err: any) {
      console.error("Error creating gate:", err);
      toast.error("Failed to create gate.");
    } finally {
      setIsLoading(false);
    }
  };

  const itemsPerPage = 10;
  const filteredgates = gatesData.filter((gate) =>
    gate.id.toString().includes(searchTerm) ||
    gate.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedgates = filteredgates.slice(startIndex, endIndex);

  const handleCopy = (url: string) => navigator.clipboard.writeText(url);

  const handleDelete = async (gateId: number) => {
    if (!eventId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this gate?");
    if (!confirmDelete) return; // ❌ user clicked "No"

    console.log(`Deleting gate: ${gateId}`);

    try {
      await deleteGate(gateId, eventId);
      toast.success("Gate deleted successfully!");
      fetchGates(); // refresh
    } catch (err) {
      console.error("Error deleting gate:", err);
      console.log("Failed to delete gate:", (err as any)?.response?.data?.message || (err as any)?.message || "Unknown error");
      toast.error("Failed to delete gate.");
    }
  };

  const handleOpenGateOnboarding = (gateId: number) => {
    const gate = gatesData.find(g => g.id === gateId);
    if (!gate) {
      console.error("Gate not found for ID:", gateId);
      toast.error("Gate not found");
      return;
    }

    console.log("Selected gate details:", gate); // ✅ log the full gate object here

    setSelectedGate(gate);
    setShowGateOnboarding(true);
  };

  if (showGateOnboarding) {
    return selectedGate ? <GateOnboarding gate={selectedGate} onBack={() => setShowGateOnboarding(false)} /> : null;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                On Boarding
              </h1>
              <p className="text-gray-600 mt-1">
                Gates {gatesData.length}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
               text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/25 
               hover:shadow-xl hover:shadow-blue-600/30 transition-all
                duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus size={18} />
              New Gate
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading Gates...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b border-gray-200/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">URL</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60">
                    {paginatedgates.map((gate) => (
                      <tr key={gate.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{gate.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{gate.title}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 capitalize">{gate?.attributes?.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{gate.url}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenGateOnboarding(gate.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <ArrowRight size={16} />
                            </button>

                            <button onClick={() => handleCopy(gate.url)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition">
                              <Copy size={16} />
                            </button>
                            <button onClick={() => handleDelete(gate.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            )}

          </div>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
              <h2 className="text-2xl font-bold text-gray-900">New Gate</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Gate type</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gateType" value="event" checked={activeTab === "event"} onChange={(e) => setActiveTab(e.target.value)} className="form-radio text-blue-500" />
                    <span className={activeTab === "event" ? "text-blue-700 font-medium" : "text-gray-900 font-medium"}>Event {eventId}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gateType" value="area" checked={activeTab === "area"} onChange={(e) => setActiveTab(e.target.value)} className="form-radio text-blue-500" />
                    <span className={activeTab === "area" ? "text-blue-700 font-medium" : "text-gray-900 font-medium"}>Area</span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Select area..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${activeTab === "area" ? "" : "bg-gray-100 cursor-not-allowed"}`}
                  list="areas-list"
                  disabled={activeTab !== "area"}
                />
                <datalist id="areas-list">
                  {areas.map((area) => <option key={area} value={area} />)}
                </datalist>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200/60">
              <button
                onClick={handleCreateGate}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all duration-200 ${isLoading ? "animate-pulse" : ""}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Add Gate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </>

  );

}

export default Onboarding;
