import { allCountries } from "country-telephone-data";

export type Country = { name: string; code: string; dialCode: string };

type RawCountry = {
    name: string;
    iso2: string;
    dialCode: string;
};

const normalizeCountryName = (raw: string): string => {
    // country-telephone-data includes local-script names in parentheses
    return raw.split(" (")[0].trim();
};

const normalizeDialCode = (dialCode: string): string => {
    const digits = String(dialCode).trim().replace(/^\+/, "");
    return digits ? `+${digits}` : "";
};

const rawCountries = allCountries as unknown as RawCountry[];

// Unique countries by ISO2
const countriesByIso2 = new Map<string, { name: string; code: string }>();
for (const c of rawCountries) {
    const code = String(c.iso2 || "").toUpperCase();
    if (!code) continue;
    if (!countriesByIso2.has(code)) {
        countriesByIso2.set(code, { name: normalizeCountryName(c.name), code });
    }
}

export const COUNTRIES: Array<{ name: string; code: string }> = Array.from(
    countriesByIso2.values()
).sort((a, b) => a.name.localeCompare(b.name));

export const COUNTRY_DIAL_CODES: Country[] = rawCountries
    .map((c) => {
        const code = String(c.iso2 || "").toUpperCase();
        return {
            name: normalizeCountryName(c.name),
            code,
            dialCode: normalizeDialCode(c.dialCode),
        };
    })
    .filter((c) => Boolean(c.code) && Boolean(c.dialCode))
    .sort((a, b) => a.name.localeCompare(b.name));
