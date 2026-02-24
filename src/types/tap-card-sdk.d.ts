/**
 * Tap Web Card SDK v2 - global types (script: https://tap-sdks.b-cdn.net/card/1.0.2/index.js)
 */
declare global {
  interface Window {
    CardSDK?: {
      renderTapCard: (
        containerId: string,
        config: TapCardConfig
      ) => { unmount: () => void };
      tokenize: () => void;
      resetCardInputs: () => void;
      saveCard: () => void;
      updateCardConfiguration: (config: Partial<TapCardConfig>) => void;
      updateTheme: (theme: "dark" | "light") => void;
      loadSavedCard: (cardId: string) => void;
      Theme: { LIGHT: string; DARK: string };
      Currencies: Record<string, string>;
      Direction: { LTR: string; RTL: string };
      Edges: { CURVED: string; SQUARE: string };
      Locale: { EN: string; AR: string };
    };
  }
}

export interface TapCardConfig {
  publicKey: string;
  merchant?: { id: string };
  transaction: { amount: number; currency: string };
  customer?: {
    id?: string;
    name?: Array<{ lang: string; first: string; last: string; middle?: string }>;
    nameOnCard?: string;
    editable?: boolean;
    contact?: {
      email?: string;
      phone?: { countryCode: string; number: string };
    };
  };
  acceptance?: {
    supportedBrands?: string[];
    supportedCards?: "ALL" | "DEBIT" | "CREDIT" | string[];
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

export interface TapTokenResponse {
  id: string;
  status: string;
  object: string;
  live_mode: boolean;
  type: string;
  card?: {
    id: string;
    brand: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
  };
}

export {};
