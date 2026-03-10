import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsSecurity() {
  const navigateTo = useWorkspaceNavigate();
  const params = useParams<{ id?: string }>();
  const settingsPath = params.id ? `home/${params.id}/settings` : "settings";
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return; // TODO: show validation message
    }
    // TODO: wire to API
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] p-6">
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="-ml-2 mb-4 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => navigateTo(settingsPath)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Security
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Change your account password.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-gray-700">
                Current password
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5 border-gray-200 bg-gray-100 focus:bg-gray-100 focus:ring-blue-500"
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-gray-700">
                New password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5 border-gray-200 bg-gray-100 focus:bg-gray-100 focus:ring-blue-500"
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5 border-gray-200 bg-gray-100 focus:bg-gray-100 focus:ring-blue-500"
                autoComplete="new-password"
              />
            </div>
            <div className="pt-4">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Update password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
