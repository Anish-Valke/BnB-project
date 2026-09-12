import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.FAST2SMS_API_KEY;

if (!apiKey) {
  console.log("FAST2SMS_API_KEY_STATUS: MISSING");
} else if (apiKey.trim() === "" || apiKey === "your_fast2sms_api_key") {
  console.log("FAST2SMS_API_KEY_STATUS: DUMMY_OR_EMPTY");
} else {
  console.log("FAST2SMS_API_KEY_STATUS: CONFIGURED (Length: " + apiKey.trim().length + ")");
}
