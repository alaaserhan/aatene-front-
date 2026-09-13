// src/lib/phone.ts

/** Default dial code, matching PhoneNumberInput's own default. */
export const DEFAULT_COUNTRY_CODE = "+972";

/**
 * Dial codes we can recognize at the front of a stored number. Matched
 * longest-first so "+972" wins over a shorter code that is a prefix of it.
 */
const KNOWN_COUNTRY_CODES = ["+972", "+970", "+966", "+20", "+1"].sort(
  (a, b) => b.length - a.length
);

export interface SplitPhone {
  countryCode: string;
  nationalNumber: string;
}

/**
 * Split a stored phone ("+972599123456") into the dial code and the part the
 * admin actually edits ("599123456"). PhoneNumberInput renders the dial code in
 * its own badge, so the text field must not repeat it.
 *
 * Falls back to `fallbackCountryCode` when the number carries no recognizable
 * code. Only the country code is stripped — the rest is left untouched.
 */
export function splitPhoneCountryCode(
  phone: string | null | undefined,
  fallbackCountryCode: string = DEFAULT_COUNTRY_CODE
): SplitPhone {
  const compact = (phone ?? "").replace(/[\s()\-.]/g, "");
  if (!compact) {
    return { countryCode: fallbackCountryCode, nationalNumber: "" };
  }

  // "00972..." is the same thing as "+972...".
  const normalized = compact.startsWith("00")
    ? `+${compact.slice(2)}`
    : compact;

  for (const code of KNOWN_COUNTRY_CODES) {
    if (normalized.startsWith(code)) {
      return { countryCode: code, nationalNumber: normalized.slice(code.length) };
    }
  }

  return {
    countryCode: fallbackCountryCode,
    nationalNumber: normalized.replace(/^\+/, ""),
  };
}

/**
 * Rebuild the stored phone from the badge's dial code and the field value.
 * Tolerates an admin pasting a full international number into the field: any
 * country code already there is stripped before prefixing, so the result never
 * ends up with a doubled "+972+972".
 *
 * The national trunk "0" is dropped, matching how the signup form formats a
 * number the visitor typed as "0599...".
 */
export function joinPhoneCountryCode(
  countryCode: string,
  nationalNumber: string | null | undefined
): string {
  const { nationalNumber: local } = splitPhoneCountryCode(
    nationalNumber,
    countryCode
  );
  const withoutTrunkPrefix = local.replace(/^0+/, "");
  return withoutTrunkPrefix ? `${countryCode}${withoutTrunkPrefix}` : "";
}
