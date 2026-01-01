import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Pencil,
} from "lucide-react";
import {
  getGalleriesApi,
  createGalleryApi,
  deleteGalleryApi,
  updateGalleryApi,
} from "@/apis/galleryService";
import { toast } from "react-toastify";

// Types
interface GalleryImage {
  id: number;
  filename: string;
  url: string;
  content_type: string;
  byte_size: number;
  created_at: string;
}

interface Gallery {
  id: number;
  event_id: number;
  title: string;
  description: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  images_count?: number;
  images?: GalleryImage[];
}

interface Pagination {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  total_count: number;
  per_page: number;
}

export default function GalleriesList() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    public: true,
  });

  const fetchGalleries = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const output = await getGalleriesApi(eventId, {
        page,
        per_page: 12,
        // search: searchTerm, // Add if API supports search
      });
      console.log("Galleries API Response:", output);

      // Handle nested JSON:API structure: response.data.data or response.data
      const responseData = output.data?.data || output.data;
      const galleriesArray = Array.isArray(responseData) ? responseData : [];

      const mappedGalleries = galleriesArray.map((item: any) => {
        // Handle JSON:API format with attributes
        const attributes = item.attributes || item;
        return {
          id: item.id || attributes.id,
          event_id: attributes.event_id,
          title: attributes.title,
          description: attributes.description,
          public: attributes.public,
          created_at: attributes.created_at,
          updated_at: attributes.updated_at,
          images: attributes.images || [],
          images_count:
            attributes.images_count || attributes.images?.length || 0,
        };
      });

      console.log("Mapped Galleries:", mappedGalleries);
      setGalleries(mappedGalleries);
      setPagination(
        output.data?.meta?.pagination || output.data.meta?.pagination
      );
    } catch (error) {
      console.error("Error fetching galleries:", error);
      toast.error("Failed to load galleries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, [eventId, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    try {
      setIsSubmitting(true);
      await createGalleryApi(eventId, {
        gallery: { ...formData, event_id: eventId },
      });
      toast.success("Gallery created successfully");
      setIsCreateModalOpen(false);
      setFormData({ title: "", description: "", public: true });
      fetchGalleries();
    } catch (error) {
      console.error("Error creating gallery:", error);
      toast.error("Failed to create gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !selectedGallery) return;

    try {
      setIsSubmitting(true);
      await updateGalleryApi(eventId, selectedGallery.id, {
        gallery: formData,
      });
      toast.success("Gallery updated successfully");
      setIsEditModalOpen(false);
      setSelectedGallery(null);
      setFormData({ title: "", description: "", public: true });
      fetchGalleries();
    } catch (error) {
      console.error("Error updating gallery:", error);
      toast.error("Failed to update gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setFormData({
      title: gallery.title || "",
      description: gallery.description || "",
      public: gallery.public ?? true,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!eventId || !selectedGallery) return;

    try {
      setIsSubmitting(true);
      await deleteGalleryApi(eventId, selectedGallery.id);
      toast.success("Gallery deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedGallery(null);
      fetchGalleries();
    } catch (error) {
      console.error("Error deleting gallery:", error);
      toast.error("Failed to delete gallery");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter galleries client-side if API doesn't support search
  const filteredGalleries = galleries.filter((gallery) =>
    (gallery.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 mx-auto bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Galleries</h1>
          <p className="text-gray-500 mt-1">
            Manage your event photo galleries
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Gallery
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search galleries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all text-gray-700"
          />
        </div>
        {galleries.length > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            <ImageIcon className="w-4 h-4" />
            {galleries.length}{" "}
            {galleries.length === 1 ? "Gallery" : "Galleries"}
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredGalleries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No galleries found
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first gallery to start adding photos
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Gallery
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGalleries.map((gallery) => {
            const coverImage = gallery.images?.[0];
            const imageCount =
              gallery.images_count || gallery.images?.length || 0;

            return (
              <div
                key={gallery.id}
                onClick={() =>
                  navigate(`/home/${eventId}/galleries/${gallery.id}`)
                }
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
              >
                {/* Cover Image */}
                <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                  {coverImage ? (
                    <img
                      src={coverImage.url}
                      alt={gallery.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-2" />
                        <span className="text-xs text-gray-300">
                          No images yet
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(gallery);
                      }}
                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGallery(gallery);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                        gallery.public
                          ? "bg-green-500/90 text-white"
                          : "bg-gray-800/70 text-white"
                      }`}
                    >
                      {gallery.public ? "Public" : "Private"}
                    </span>
                  </div>

                  {/* Image count badge */}
                  {imageCount > 0 && (
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-black/60 text-white rounded-full backdrop-blur-sm flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {imageCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1.5 truncate text-lg group-hover:text-blue-600 transition-colors">
                    {gallery.title || "Untitled Gallery"}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {gallery.description || "No description provided"}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(gallery.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <span className="text-blue-500 font-medium text-xs group-hover:text-blue-600">
                      View Gallery →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center mt-8 gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.total_pages, page + 1))}
            disabled={page === pagination.total_pages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Gallery
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Conference Highlights"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, public: !formData.public })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.public ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.public ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Public Gallery
                </span>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedGallery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Gallery
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedGallery(null);
                  setFormData({ title: "", description: "", public: true });
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Conference Highlights"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, public: !formData.public })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.public ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.public ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Public Gallery
                </span>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedGallery(null);
                    setFormData({ title: "", description: "", public: true });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedGallery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Gallery?
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete "{selectedGallery.title}"? This
                action cannot be undone and all images will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
