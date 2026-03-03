import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Sender {
  id: string;
  name: string;
  email: string;
  isDefault?: boolean;
}

const mockSenders: Sender[] = [
  { id: "1", name: "Eventy", email: "noreply@eventy.com", isDefault: true },
];

export default function SettingsSenderManagement() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const settingsPath = params.id ? `/home/${params.id}/settings` : "/settings";
  const [senders, setSenders] = useState<Sender[]>(mockSenders);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSenders((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: formData.name,
          email: formData.email,
          isDefault: prev.length === 0,
        },
      ]);
      setFormData({ name: "", email: "" });
      setShowForm(false);
    }
  };

  const handleRemove = (id: string) => {
    setSenders((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] p-6">
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="-ml-2 mb-4 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => navigate(settingsPath)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Sender Management
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Add and manage senders for your emails.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add sender
            </Button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAdd}
              className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="senderName">Name</Label>
                  <Input
                    id="senderName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Sender name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">Email</Label>
                  <Input
                    id="senderEmail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sender@example.com"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save sender
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", email: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-700">Your senders</h2>
            <ul className="mt-3 divide-y divide-gray-200">
              {senders.map((sender) => (
                <li
                  key={sender.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sender.name}</p>
                      <p className="text-sm text-gray-500">{sender.email}</p>
                      {sender.isDefault && (
                        <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleRemove(sender.id)}
                    disabled={sender.isDefault}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
