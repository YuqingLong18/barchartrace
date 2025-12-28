// Basic mapping of common country names to ISO 3166-1 alpha-2 codes.
// This is not exhaustive but covers major economies and common chart entities.
// We can expand this list or use a library if needed, but keeping it lightweight for now.

const COUNTRY_MAP: Record<string, string> = {
    "United States": "us", "USA": "us", "US": "us", "United States of America": "us",
    "China": "cn", "People's Republic of China": "cn",
    "Japan": "jp",
    "Germany": "de",
    "India": "in",
    "United Kingdom": "gb", "UK": "gb", "Great Britain": "gb",
    "France": "fr",
    "Italy": "it",
    "Brazil": "br",
    "Canada": "ca",
    "Russia": "ru", "Russian Federation": "ru",
    "South Korea": "kr", "Korea, Rep.": "kr", "Korea": "kr",
    "Australia": "au",
    "Spain": "es",
    "Mexico": "mx",
    "Indonesia": "id",
    "Turkey": "tr", "Turkiye": "tr",
    "Netherlands": "nl",
    "Saudi Arabia": "sa",
    "Switzerland": "ch",
    "Argentina": "ar",
    "Sweden": "se",
    "Poland": "pl",
    "Belgium": "be",
    "Thailand": "th",
    "Iran": "ir",
    "Austria": "at",
    "Norway": "no",
    "United Arab Emirates": "ae", "UAE": "ae",
    "Nigeria": "ng",
    "Israel": "il",
    "South Africa": "za",
    "Hong Kong": "hk",
    "Ireland": "ie",
    "Denmark": "dk",
    "Singapore": "sg",
    "Malaysia": "my",
    "Philippines": "ph",
    "Colombia": "co",
    "Pakistan": "pk",
    "Chile": "cl",
    "Finland": "fi",
    "Bangladesh": "bd",
    "Egypt": "eg",
    "Vietnam": "vn",
    "Portugal": "pt",
    "Czech Republic": "cz", "Czechia": "cz",
    "Romania": "ro",
    "Peru": "pe",
    "New Zealand": "nz",
    "Greece": "gr",
    "Hungary": "hu",
    "Kazakhstan": "kz",
    "Qatar": "qa",
    "Ukraine": "ua",
    "Algeria": "dz",
    "Kuwait": "kw",
    "Morocco": "ma",
    "Slovakia": "sk",
    "Ecuador": "ec",
    "Ethiopia": "et",
    "Kenya": "ke",
    "Dominican Republic": "do",
    "Guatemala": "gt",
    "Oman": "om",
    "Panama": "pa",
    "Costa Rica": "cr",
    "Luxembourg": "lu",
    "Croatia": "hr",
    "Ivory Coast": "ci", "Cote d'Ivoire": "ci",
    "Lithuania": "lt",
    "Uruguay": "uy",
    "Uzbekistan": "uz",
    "Serbia": "rs",
    "Slovenia": "si",
    "Bulgaria": "bg",
    "Belarus": "by",
    "Azerbaijan": "az",
    "Tanzania": "tz",
    "Sri Lanka": "lk",
    "Ghana": "gh",
    "Democratic Republic of the Congo": "cd", "DR Congo": "cd",
    "Myanmar": "mm",
    "Uganda": "ug",
    "Tunisia": "tn",
    "Cameroon": "cm",
    "Bolivia": "bo",
    "Paraguay": "py",
    "Jordan": "jo",
    "Bahrain": "bh",
    "Latvia": "lv",
    "Estonia": "ee",
    "Cyprus": "cy",
    "Iceland": "is"
};

/**
 * Tries to find a 2-letter ISO code for a given country name (case-insensitive).
 */
export function getCountryCode(name: string): string | null {
    const normalized = name.trim();
    // Direct match
    if (COUNTRY_MAP[normalized]) return COUNTRY_MAP[normalized];

    // Case insensitive match
    const lower = normalized.toLowerCase();
    for (const [key, val] of Object.entries(COUNTRY_MAP)) {
        if (key.toLowerCase() === lower) return val;
    }

    return null;
}

/**
 * Returns a flag image URL (using flagcdn) if coverage exists.
 */
export function getFlagUrl(name: string): string | null {
    const code = getCountryCode(name);
    if (!code) return null;
    return `https://flagcdn.com/w40/${code}.png`;
}
