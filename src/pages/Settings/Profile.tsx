import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsProfile() {
  const { t } = useTranslation("settings");
  const navigateTo = useWorkspaceNavigate();
  const params = useParams<{ id?: string }>();
  const settingsPath = params.id ? `home/${params.id}/settings` : "settings";
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          {t("profile.backToSettings")}
        </Button>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {t("profile.title")}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {t("profile.description")}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-700">
                {t("profile.fullName")}
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t("profile.fullNamePlaceholder")}
                className="mt-1.5 border-gray-200 bg-gray-100 focus:bg-gray-100 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700">
                {t("profile.email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("profile.emailPlaceholder")}
                className="mt-1.5 border-gray-200 bg-gray-100 focus:bg-gray-100 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-700">
                {t("profile.phone")}
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("profile.phonePlaceholder")}
                className="mt-1.5 border-gray-200 bg-gray-100 focus:bg-gray-100 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="company" className="text-gray-700">
                {t("profile.company")}
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder={t("profile.companyPlaceholder")}
                className="mt-1.5 border-gray-200 bg-gray-100 focus:bg-gray-100 focus:ring-blue-500"
              />
            </div>
            <div className="pt-4">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {t("profile.saveChanges")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
