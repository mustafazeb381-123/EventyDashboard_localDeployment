/// <reference types="vite/client" />

declare module "country-telephone-data" {
    export interface CountryTelephoneDataCountry {
        name: string;
        iso2: string;
        dialCode: string;
        priority?: number;
        format?: string;
    }

    export const allCountries: CountryTelephoneDataCountry[];
    export const allCountryCodes: string[];
    export const iso2Lookup: Record<string, CountryTelephoneDataCountry>;

    const _default: unknown;
    export default _default;
}
