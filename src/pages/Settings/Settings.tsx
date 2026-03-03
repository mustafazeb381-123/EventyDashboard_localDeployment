import { useNavigate, useParams } from "react-router-dom";
import { User, CreditCard, Shield, Send } from "lucide-react";

const sectionKeys = [
  { id: "profile", title: "Profile Information", description: "View and edit your user profile details.", icon: User, slug: "profile" },
  { id: "billing", title: "Billing", description: "View invoices and payment history.", icon: CreditCard, slug: "billing" },
  { id: "security", title: "Security", description: "Change your account password.", icon: Shield, slug: "security" },
  { id: "senders", title: "Sender Management", description: "Add and manage senders.", icon: Send, slug: "senders" },
] as const;

export default function Settings() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const eventId = params.id;
  const settingsBase = eventId ? `/home/${eventId}/settings` : "/settings";

  return (
    <div className="min-h-screen bg-[#F7FAFF] p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account and preferences.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {sectionKeys.map((section) => {
            const Icon = section.icon;
            const sectionPath = `${settingsBase}/${section.slug}`;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => navigate(sectionPath)}
                className="group relative flex items-start gap-5 rounded-2xl border border-gray-200/80 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-blue-300/60 hover:shadow-lg hover:shadow-blue-500/5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-inner transition-all group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:scale-105">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h2 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-lg">
                    {section.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                    {section.description}
                  </p>
                </div>
                <span className="shrink-0 text-xl font-medium text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-500">
                  →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
