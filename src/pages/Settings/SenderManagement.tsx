import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkspaceNavigate } from "@/hooks/useWorkspaceNavigate";
import { ArrowLeft, Plus, Mail, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from "react-hot-toast";
import { getEventInvitations } from "@/apis/invitationService";
import {
  requestSenderEmailVerification,
  authorizeSenderEmail,
} from "@/apis/invitationService";

interface Sender {
  id: string;
  name: string;
  email: string;
  isDefault?: boolean;
}

const mockSenders: Sender[] = [
  { id: "1", name: "Eventy", email: "noreply@eventy.com", isDefault: true },
];

const RESEND_COOLDOWN_SEC = 60;

export default function SettingsSenderManagement() {
  const { t } = useTranslation("settings");
  const navigateTo = useWorkspaceNavigate();
  const params = useParams<{ id?: string }>();
  const eventId = params.id;
  const settingsPath = eventId ? `home/${eventId}/settings` : "settings";
  const [senders, setSenders] = useState<Sender[]>(mockSenders);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const [firstInvitationId, setFirstInvitationId] = useState<number | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationName, setVerificationName] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRequestedVerificationForCurrentModal = useRef(false);

  // Parse invitation list: support both { data: [{ id }] } and JSON:API { data: [{ id, attributes }] }
  useEffect(() => {
    if (!eventId) return;
    getEventInvitations(eventId, { page: 1, per_page: 1 })
      .then((res) => {
        const body = res.data as unknown;
        const data = Array.isArray((body as { data?: unknown }).data)
          ? (body as { data: Array<{ id?: number; attributes?: { id?: number } }> }).data
          : [];
        const first = data[0];
        const rawId = first?.id ?? (first as { attributes?: { id?: number } })?.attributes?.id;
        const numId = rawId != null ? Number(rawId) : NaN;
        if (!Number.isNaN(numId)) setFirstInvitationId(numId);
      })
      .catch(() => setFirstInvitationId(null));
  }, [eventId]);

  // When modal is open and we have invitation id, send verification (once per modal open)
  useEffect(() => {
    if (
      verificationOpen &&
      verificationEmail &&
      eventId &&
      firstInvitationId != null &&
      !hasRequestedVerificationForCurrentModal.current
    ) {
      hasRequestedVerificationForCurrentModal.current = true;
      requestVerification(verificationEmail);
    }
  }, [verificationOpen, verificationEmail, eventId, firstInvitationId]);

  useEffect(() => {
    if (resendCooldown <= 0 && resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
  }, [resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const requestVerification = async (email: string) => {
    if (!eventId || firstInvitationId == null) return;
    setRequestLoading(true);
    setError(null);
    try {
      await requestSenderEmailVerification(eventId, firstInvitationId, email);
      toast.success("Verification code sent!");
      setResendCooldown(RESEND_COOLDOWN_SEC);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((c) => (c <= 1 ? 0 : c - 1));
      }, 1000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("senderManagement.failedToSendCode"))
          : t("senderManagement.failedToSendCode");
      setError(msg);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    if (eventId) {
      // Always show verification modal when we have eventId; verification request runs in useEffect when firstInvitationId is available
      hasRequestedVerificationForCurrentModal.current = false;
      setVerificationEmail(formData.email);
      setVerificationName(formData.name);
      setCodeDigits(["", "", "", "", "", ""]);
      setError(null);
      setVerificationOpen(true);
    } else {
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

  const handleVerify = async () => {
    const code = codeDigits.join("").trim();
    if (code.length !== 6 || !eventId || firstInvitationId == null) return;
    setVerifyLoading(true);
    setError(null);
    try {
      await authorizeSenderEmail(eventId, firstInvitationId, {
        sender_email: verificationEmail,
        verification_code: code,
      });
      toast.success("Sender verified successfully!");
      setSenders((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: verificationName,
          email: verificationEmail,
          isDefault: prev.length === 0,
        },
      ]);
      setFormData({ name: "", email: "" });
      setVerificationOpen(false);
      setShowForm(false);
      hasRequestedVerificationForCurrentModal.current = false;
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? t("senderManagement.invalidCode"))
          : t("senderManagement.invalidCode");
      setError(msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDoLater = () => {
    setVerificationOpen(false);
    hasRequestedVerificationForCurrentModal.current = false;
    setResendCooldown(0);
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...codeDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d;
      });
      setCodeDigits(next);
      const focusIdx = Math.min(index + digits.length, 5);
      codeInputRefs.current[focusIdx]?.focus();
      return;
    }
    const next = [...codeDigits];
    next[index] = value.replace(/\D/g, "").slice(-1);
    setCodeDigits(next);
    if (value && index < 5) codeInputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleRemove = (id: string) => {
    setSenders((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] p-6">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="-ml-2 mb-4 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => navigateTo(settingsPath)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("senderManagement.backToSettings")}
        </Button>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {t("senderManagement.title")}
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                {t("senderManagement.description")}
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("senderManagement.addSender")}
            </Button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmitForm}
              className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="senderName">{t("senderManagement.name")}</Label>
                  <Input
                    id="senderName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("senderManagement.senderName")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="senderEmail">{t("senderManagement.email")}</Label>
                  <Input
                    id="senderEmail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("senderManagement.senderEmailPlaceholder")}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {t("senderManagement.saveSender")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: "", email: "" });
                  }}
                >
                  {t("senderManagement.cancel")}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-700">{t("senderManagement.yourSenders")}</h2>
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
                          {t("senderManagement.default")}
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

      {/* Verification modal */}
      {verificationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleDoLater()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="verification-title"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="verification-title" className="text-lg font-semibold text-gray-900">
              {t("senderManagement.verifySender")}
            </h2>
            {firstInvitationId == null ? (
              <p className="mt-1 text-sm text-amber-600">
                {t("senderManagement.loadingInvitation")}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                {t("senderManagement.verificationCodeSent", { email: verificationEmail })}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              {codeDigits.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => { codeInputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="h-12 w-12 text-center text-lg font-medium"
                />
              ))}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={handleVerify}
                disabled={
                  codeDigits.join("").length !== 6 ||
                  verifyLoading ||
                  firstInvitationId == null
                }
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {verifyLoading ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  t("senderManagement.verifySender")
                )}
              </Button>
              <button
                type="button"
                onClick={() => requestVerification(verificationEmail)}
                disabled={
                  resendCooldown > 0 ||
                  requestLoading ||
                  firstInvitationId == null
                }
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              >
                {resendCooldown > 0
                  ? t("senderManagement.resendVerificationCodeTimer", { seconds: resendCooldown })
                  : t("senderManagement.resendVerificationCode")}
              </button>
              <Button
                type="button"
                variant="ghost"
                className="text-gray-600 hover:bg-gray-100"
                onClick={handleDoLater}
              >
                {t("senderManagement.doThisLater")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
