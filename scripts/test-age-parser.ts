import { parseAge } from "../lib/age-parser";

interface TestCase {
  input: any;
  expected: number | null;
  label: string;
}

const testCases: TestCase[] = [
  { input: 15, expected: 15, label: "Numeric literal 15" },
  { input: "15", expected: 15, label: "String '15'" },
  { input: "fifteen", expected: 15, label: "English word 'fifteen'" },
  { input: "twenty", expected: 20, label: "English word 'twenty'" },
  { input: "twenty five", expected: 25, label: "English phrase 'twenty five'" },
  { input: "twenty-five", expected: 25, label: "Hyphenated 'twenty-five'" },
  { input: "thirty two", expected: 32, label: "English phrase 'thirty two'" },
  { input: "forty years old", expected: 40, label: "Full sentence 'forty years old'" },
  { input: "I am fifteen years old", expected: 15, label: "Full sentence 'I am fifteen years old'" },
  { input: "पंद्रह", expected: 15, label: "Hindi word 'पंद्रह'" },
  { input: "बीस", expected: 20, label: "Hindi word 'बीस'" },
  { input: "पच्चीस", expected: 25, label: "Hindi word 'पच्चीस'" },
  { input: "मेरी उम्र चालीस साल है", expected: 40, label: "Full Hindi sentence 'मेरी उम्र चालीस साल है'" },
  { input: "invalid age response", expected: null, label: "Unrelated text 'invalid age response'" },
  { input: 121, expected: null, label: "Out of bounds 121" },
  { input: -5, expected: null, label: "Out of bounds -5" },
  { input: "", expected: null, label: "Empty string" },
];

function runAgeParserTests() {
  console.log("=== Testing Age Parser Utility (lib/age-parser.ts) ===\n");

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const result = parseAge(tc.input);
    const success = result === tc.expected;

    if (success) {
      console.log(`✅ Passed: [${tc.label}] -> parseAge(${JSON.stringify(tc.input)}) = ${result}`);
      passed++;
    } else {
      console.error(`❌ Failed: [${tc.label}] -> Expected ${tc.expected}, got ${result}`);
      failed++;
    }
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);

  if (failed > 0) {
    throw new Error(`Age Parser Tests Failed: ${failed} failures`);
  }
}

runAgeParserTests();
