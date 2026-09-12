import { NextRequest, NextResponse } from "next/server";

/**
 * Groq Whisper Voice Transcription API Endpoint.
 * Accepts actual audio file payload via multipart/form-data from MediaRecorder,
 * validates audio data, and calls Groq Whisper API (whisper-large-v3-turbo model).
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Support JSON text input fallback if genuine text input is passed
    if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      const textInput = body.text || "";
      const language = body.language || "en";

      if (!textInput.trim()) {
        return NextResponse.json(
          { success: false, error: "Text payload is empty" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        transcription: textInput,
        language,
        engine: "text-pass-through",
      });
    }

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Request content-type must be multipart/form-data or application/json" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob | File | null;
    const language = (formData.get("language") as string) || "en";

    // 2. Validate audio file exists
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "Missing required 'audio' file in form data" },
        { status: 400 }
      );
    }

    // 3. Validate audio file size is non-zero
    if (audioFile.size === 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded audio file is empty (0 bytes)" },
        { status: 400 }
      );
    }

    // 4. Validate reasonable file size limit (Groq max is 25MB)
    const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
    if (audioFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Audio file exceeds maximum allowed size of 25MB" },
        { status: 400 }
      );
    }

    // 5. Validate audio format / mime type
    const mimeType = audioFile.type || "";
    const isSupportedFormat =
      mimeType.includes("audio") ||
      mimeType.includes("video") ||
      mimeType.includes("octet-stream") ||
      mimeType === "";

    if (!isSupportedFormat) {
      return NextResponse.json(
        { success: false, error: `Unsupported audio format: ${mimeType}` },
        { status: 400 }
      );
    }

    // 6. Server-Side API Key resolution (GROQ_API_KEY strictly used)
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey || groqApiKey.trim() === "") {
      return NextResponse.json(
        { success: false, error: "GROQ_API_KEY environment variable is not configured on the server" },
        { status: 500 }
      );
    }

    const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";
    const GROQ_MODEL = "whisper-large-v3-turbo";

    // 7. Construct FormData for Groq Whisper API request
    const groqFormData = new FormData();

    let filename = "speech.webm";
    if (audioFile instanceof File && audioFile.name) {
      filename = audioFile.name;
    } else if (mimeType.includes("mp4") || mimeType.includes("m4a")) {
      filename = "speech.m4a";
    } else if (mimeType.includes("wav")) {
      filename = "speech.wav";
    } else if (mimeType.includes("mp3") || mimeType.includes("mpeg")) {
      filename = "speech.mp3";
    } else if (mimeType.includes("ogg")) {
      filename = "speech.ogg";
    }

    // Crucial: Groq expects the uploaded audio under the field name "file"
    groqFormData.append("file", audioFile, filename);
    groqFormData.append("model", GROQ_MODEL);
    groqFormData.append("response_format", "json");
    groqFormData.append("temperature", "0");

    const cleanLang = (language || "").toLowerCase().slice(0, 2);
    if (cleanLang === "en" || cleanLang === "hi") {
      groqFormData.append("language", cleanLang);
    }

    // 8. Call Groq Whisper API server-side
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey.trim()}`,
      },
      body: groqFormData,
    });

    if (!groqResponse.ok) {
      const errorJson = await groqResponse.json().catch(() => ({}));
      const errorMsg =
        errorJson?.error?.message ||
        `Groq API error status ${groqResponse.status}`;

      return NextResponse.json(
        { success: false, error: `Groq Whisper transcription failed: ${errorMsg}` },
        { status: groqResponse.status >= 400 && groqResponse.status < 600 ? groqResponse.status : 500 }
      );
    }

    const groqResult = await groqResponse.json();
    const transcribedText = (groqResult.text || "").trim();

    if (!transcribedText) {
      return NextResponse.json(
        { success: false, error: "Speech could not be recognized clearly. Please try speaking again." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      transcription: transcribedText,
      language: cleanLang || "en",
      engine: GROQ_MODEL,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Groq audio transcription failed" },
      { status: 500 }
    );
  }
}


