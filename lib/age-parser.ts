/**
 * Age Parser Utility
 * Converts numeric strings, English number words, and Hindi number words into normalized integer ages.
 * Validates human age bounds (0 to 120). Returns `null` if unable to confidently parse.
 */

const ENGLISH_ONES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

const ENGLISH_TEENS: Record<string, number> = {
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const ENGLISH_TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fourty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const HINDI_NUMBER_MAP: Record<string, number> = {
  शून्य: 0,
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पांच: 5,
  पाँच: 5,
  छह: 6,
  छः: 6,
  सात: 7,
  आठ: 8,
  नौ: 9,
  दस: 10,
  ग्यारह: 11,
  बारह: 12,
  तेरह: 13,
  चौदह: 14,
  पंद्रह: 15,
  पन्द्रह: 15,
  सोलह: 16,
  सत्रह: 17,
  अठारह: 18,
  उन्नीस: 19,
  बीस: 20,
  इक्कीस: 21,
  बाईस: 22,
  तेईस: 23,
  चौबीस: 24,
  पच्चीस: 25,
  छब्बीस: 26,
  सत्ताईस: 27,
  अट्ठाईस: 28,
  उनतीस: 29,
  तीस: 30,
  इकतीस: 31,
  बत्तीस: 32,
  तैंतीस: 33,
  चौंतीस: 34,
  पैंतीस: 35,
  छत्तीस: 36,
  सैंतीस: 37,
  अड़तीस: 38,
  उनतालीस: 39,
  चालीस: 40,
  इकतालीस: 41,
  बयालीस: 42,
  तैंतालीस: 43,
  चवालिस: 44,
  पैंतालीस: 45,
  छियालीस: 46,
  सैंतालीस: 47,
  अड़तालीस: 48,
  उनचास: 49,
  पचास: 50,
  इक्कावन: 51,
  बावन: 52,
  तिर्पन: 53,
  चौवन: 54,
  पचपन: 55,
  छप्पन: 56,
  सत्तावन: 57,
  अट्टावन: 58,
  उनसठ: 59,
  साठ: 60,
  एकसठ: 61,
  बासठ: 62,
  तिरसठ: 63,
  चौंसठ: 64,
  पैंसठ: 65,
  छियासठ: 66,
  सरसठ: 67,
  अड़सठ: 68,
  उनहत्तर: 69,
  सत्तर: 70,
  इकहत्तर: 71,
  बहत्तर: 72,
  तिहत्तर: 73,
  चौहत्तर: 74,
  पचहत्तर: 75,
  छिहत्तर: 76,
  सतहत्तर: 77,
  अठहत्तर: 78,
  उनासी: 79,
  अस्सी: 80,
  इक्कासी: 81,
  बयासी: 82,
  तिरासी: 83,
  चौरासी: 84,
  पचासी: 85,
  छियासी: 86,
  सत्तासी: 87,
  अट्ठासी: 88,
  नवासी: 89,
  नब्बे: 90,
  इकानवे: 91,
  बानवे: 92,
  तिरानवे: 93,
  चौरानवे: 94,
  पचानवे: 95,
  छियानवे: 96,
  संतानवे: 97,
  अट्ठानवे: 98,
  निन्यानवे: 99,
  सौ: 100,
};

/**
 * Normalizes input (string or number) into a valid integer age (0 to 120).
 * Returns null if input cannot be confidently parsed as an age.
 */
export function parseAge(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;

  if (typeof input === "number") {
    if (Number.isInteger(input) && input >= 0 && input <= 120) {
      return input;
    }
    return null;
  }

  const raw = String(input).trim();
  if (!raw) return null;

  // 1. Direct regex match for numbers (e.g. "15", "forty 40", "I am 35 years old", "35 yrs")
  const digitMatch = raw.match(/\b(\d{1,3})\b/);
  if (digitMatch) {
    const val = parseInt(digitMatch[1], 10);
    if (val >= 0 && val <= 120) {
      return val;
    }
    return null; // Out of bounds
  }

  const normalized = raw.toLowerCase().replace(/[-]/g, " ");

  // 2. Check Hindi Number Words
  for (const [hindiWord, val] of Object.entries(HINDI_NUMBER_MAP)) {
    if (raw.includes(hindiWord)) {
      if (val >= 0 && val <= 120) {
        return val;
      }
    }
  }

  // 3. Check English Number Words
  const words = normalized
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  // Filter out filler words commonly spoken during intake
  const numberTokens = words.filter(
    (w) =>
      ENGLISH_ONES[w] !== undefined ||
      ENGLISH_TEENS[w] !== undefined ||
      ENGLISH_TENS[w] !== undefined ||
      w === "hundred" ||
      w === "and"
  );

  if (numberTokens.length === 0) {
    return null;
  }

  let total = 0;
  let current = 0;
  let matchedAnyNumberWord = false;

  for (const token of numberTokens) {
    if (token === "and") continue;

    if (ENGLISH_ONES[token] !== undefined) {
      current += ENGLISH_ONES[token];
      matchedAnyNumberWord = true;
    } else if (ENGLISH_TEENS[token] !== undefined) {
      current += ENGLISH_TEENS[token];
      matchedAnyNumberWord = true;
    } else if (ENGLISH_TENS[token] !== undefined) {
      current += ENGLISH_TENS[token];
      matchedAnyNumberWord = true;
    } else if (token === "hundred") {
      current = (current || 1) * 100;
      matchedAnyNumberWord = true;
    }
  }

  total += current;

  if (matchedAnyNumberWord && total >= 0 && total <= 120) {
    return total;
  }

  return null;
}
