import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Static invoice data for now (total, invoice date, due date) — format: "Mon DD, YYYY, HH:MM AM/PM"
const STATIC_INVOICES = [
  {
    id: "3581646",
    total: "$13.95",
    status: "Paid",
    invoiceDate: "Dec 22, 2023, 09:15 AM",
    dueDate: "Jan 21, 2024, 11:30 AM",
  },
  {
    id: "3176518",
    total: "$29.99",
    status: "Paid",
    invoiceDate: "Jan 07, 2022, 02:45 PM",
    dueDate: "Jan 21, 2022, 10:00 AM",
  },
  {
    id: "2987341",
    total: "$49.00",
    status: "Paid",
    invoiceDate: "Dec 22, 2021, 11:07 AM",
    dueDate: "Jan 21, 2022, 11:07 AM",
  },
  {
    id: "2845129",
    total: "$13.95",
    status: "Paid",
    invoiceDate: "Nov 18, 2021, 08:20 AM",
    dueDate: "Dec 18, 2021, 03:00 PM",
  },
  {
    id: "2703456",
    total: "$99.00",
    status: "Paid",
    invoiceDate: "Oct 15, 2021, 11:07 AM",
    dueDate: "Nov 15, 2021, 11:07 AM",
  },
];

export default function SettingsBilling() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const settingsPath = params.id ? `/home/${params.id}/settings` : "/settings";
  const [invoices] = useState(STATIC_INVOICES);

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

        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Billing
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              View invoices and payment history.
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100/80 border-y border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-900">
                    <span className="inline-flex items-center gap-0.5">
                      Invoice #
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-900">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-900">
                    Invoice Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-900">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-900">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, index) => (
                  <tr
                    key={inv.id}
                    className={`border-b border-gray-100 ${
                      index % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-green-600">
                        #{inv.id}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-900">{inv.total}</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-gray-900">{inv.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-gray-900">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-2.5 px-4 text-gray-900">
                      {inv.dueDate}
                    </td>
                    <td className="py-2.5 px-4">
                      <Button
                        size="sm"
                        className="h-7 bg-blue-600 px-2.5 text-xs text-white hover:bg-blue-700"
                        onClick={() => {
                          // TODO: open invoice details
                        }}
                      >
                        View Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
