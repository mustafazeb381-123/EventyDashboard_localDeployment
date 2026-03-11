import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const CARD_SDK_SCRIPT_URL = "https://tap-sdks.b-cdn.net/card/1.0.2/index.js";

declare global {
  interface Window {
    CardSDK?: {
      renderTapCard: (
        containerId: string,
        config: TapCardSdkConfig,
      ) => { unmount: () => void };
      tokenize: () => void;
      Theme?: { LIGHT: string; DARK: string };
      Currencies?: Record<string, string>;
      Direction?: { LTR: string; RTL: string };
      Edges?: { CURVED: string; FLAT: string };
      Locale?: Record<string, string>;
    };
  }
}

interface TapCardSdkConfig {
  publicKey: string;
  merchant?: { id: string };
  transaction: { amount: number; currency: string };
  customer?: {
    id?: string;
    name?: Array<{
      lang: string;
      first: string;
      last: string;
      middle?: string;
    }>;
    nameOnCard?: string;
    editable?: boolean;
    contact?: {
      email?: string;
      phone?: { countryCode: string; number: string };
    };
  };
  acceptance?: {
    supportedBrands?: string[];
    supportedCards?: string | string[];
  };
  fields?: { cardHolder?: boolean };
  addons?: {
    loader?: boolean;
    saveCard?: boolean;
    displayPaymentBrands?: boolean;
  };
  interface?: {
    locale?: string;
    theme?: string;
    edges?: string;
    direction?: string;
  };
  onReady?: () => void;
  onFocus?: () => void;
  onBinIdentification?: (data: unknown) => void;
  onValidInput?: (data: unknown) => void;
  onInvalidInput?: (data: unknown) => void;
  onError?: (data: unknown) => void;
  onSuccess?: (data: TapTokenResponse) => void;
  onChangeSaveCardLater?: (isSaveCardSelected: boolean) => void;
}

interface TapTokenResponse {
  id: string;
  status?: string;
  card?: { last_four?: string; brand?: string };
  [key: string]: unknown;
}

export interface TapPaymentProps {
  amount: string;
  currency: string;
  eventId?: string | number;
  orderId?: string;
  transactionId?: string;
  customer?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    phone?: { countryCode: string; number: string };
  };
  metadata?: {
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  };
  locale?: "en" | "ar";
  edges?: "curved" | "straight";
  debug?: boolean;
  onReady?: () => void;
  onClick?: () => void;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
  onSuccess?: (data: TapTokenResponse) => void | Promise<void>;
}

/**
 * TapPayment – Web Card SDK v2
 * Renders Tap Card SDK (card form) and submits via tokenize(); token is returned in onSuccess.
 * Backend should use the token id in create charge API (source.id).
 * @see https://developers.tap.company/docs/card-sdk-web-v2
 */
const TapPayment: React.FC<TapPaymentProps> = ({
  amount,
  currency,
  eventId,
  customer,
  locale = "en",
  edges = "curved",
  onReady,
  onError,
  onSuccess,
}) => {
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{
    publicKey: string;
    merchantId: string;
  } | null>(null);
  const unmountRef = useRef<(() => void) | null>(null);
  const cardContainerId = useId().replace(/:/g, "-") || "tap-card-sdk";

  // Fetch payment config (publicKey, merchantId) from backend
  useEffect(() => {
    const fetchConfig = async () => {
      if (!eventId) return;
      try {
        // TODO: Replace with your backend – e.g. initiateTapPayment(eventId, { amount, currency, orderId, ... })
        setPaymentConfig({
          publicKey: "pk_test_xxxx",
          merchantId: "merchant_xxxx",
        });
      } catch (err) {
        onError?.(err);
      }
    };
    fetchConfig();
  }, [eventId, amount, currency, onError]);

  // Load Card SDK script and render card when config is ready
  useEffect(() => {
    if (!paymentConfig) return;

    const initCard = () => {
      const CardSDK = window.CardSDK;
      if (!CardSDK?.renderTapCard) return;

      const Theme = CardSDK.Theme ?? { LIGHT: "light", DARK: "dark" };
      const Edges = CardSDK.Edges ?? { CURVED: "curved", FLAT: "flat" };
      const Locale = CardSDK.Locale ?? { EN: "en", AR: "ar" };
      const Direction = CardSDK.Direction ?? { LTR: "ltr", RTL: "rtl" };

      const cardConfig: TapCardSdkConfig = {
        publicKey: paymentConfig.publicKey,
        merchant: { id: paymentConfig.merchantId },
        transaction: {
          amount: parseFloat(amount) || 0,
          currency,
        },
        customer: customer
          ? {
              name: [
                {
                  lang: locale === "ar" ? Locale.AR : Locale.EN,
                  first: customer.firstName,
                  last: customer.lastName,
                  ...(customer.middleName ? { middle: customer.middleName } : {}),
                },
              ],
              nameOnCard: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
              editable: true,
              ...(customer.email
                ? {
                    contact: {
                      email: customer.email,
                      ...(customer.phone
                        ? {
                            phone: {
                              countryCode:
                                (customer.phone.countryCode || "").replace(/\D/g, "").slice(0, 4) || "20",
                              number: customer.phone.number || "",
                            },
                          }
                        : {}),
                    },
                  }
                : {}),
            }
          : undefined,
        acceptance: {
          supportedBrands: ["AMERICAN_EXPRESS", "VISA", "MASTERCARD", "MADA"],
          supportedCards: "ALL",
        },
        fields: { cardHolder: true },
        addons: {
          displayPaymentBrands: true,
          loader: true,
          saveCard: true,
        },
        interface: {
          locale: locale === "ar" ? Locale.AR : Locale.EN,
          theme: Theme.LIGHT,
          edges: edges === "straight" ? Edges.FLAT : Edges.CURVED,
          direction: locale === "ar" ? Direction.RTL : Direction.LTR,
        },
        onReady: () => {
          setSdkReady(true);
          onReady?.();
        },
        onError: (data) => onError?.(data),
        onSuccess: async (data: TapTokenResponse) => {
          try {
            setIsLoading(true);
            await onSuccess?.(data);
          } catch (err) {
            onError?.(err);
          } finally {
            setIsLoading(false);
          }
        },
      };

      const { unmount } = CardSDK.renderTapCard(cardContainerId, cardConfig);

      unmountRef.current = unmount;
    };

    if (window.CardSDK?.renderTapCard) {
      initCard();
      return () => {
        unmountRef.current?.();
        unmountRef.current = null;
      };
    }

    const script = document.createElement("script");
    script.src = CARD_SDK_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      initCard();
    };
    script.onerror = () => onError?.(new Error(t("tapFailedToLoad")));
    document.head.appendChild(script);

    return () => {
      unmountRef.current?.();
      unmountRef.current = null;
      script.remove();
    };
  }, [
    paymentConfig,
    amount,
    currency,
    customer,
    locale,
    edges,
    cardContainerId,
    onReady,
    onError,
    onSuccess,
  ]);

  const handleTokenize = useCallback(() => {
    if (!window.CardSDK?.tokenize) {
      onError?.(new Error(t("tapCardNotReady")));
      return;
    }
    setIsLoading(true);
    window.CardSDK.tokenize();
  }, [onError]);

  if (!paymentConfig) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading payment...</div>
      </div>
    );
  }

  return (
    <div className="tap-payment-wrapper space-y-4">
      <div id={cardContainerId} />
      <button
        type="button"
        disabled={!sdkReady || isLoading}
        onClick={handleTokenize}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? t("tapProcessing") : t("tapPay")}
      </button>
    </div>
  );
};

export default TapPayment;
