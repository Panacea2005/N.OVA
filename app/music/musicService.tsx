import axios from "axios";

interface MusicGenerationParams {
  prompt: string;
  style?: string;
  title?: string;
  instrumental: boolean;
  customMode: boolean;
  negativeTags?: string;
  model: "V3_5" | "V4";
  callBackUrl?: string;
}

interface MusicGenerationResponse {
  id: string;
  status: string;
  audio_url?: string;
  error?: string;
}

interface MusicRecordInfoResponse {
  id: string;
  status: string;
  audio_url?: string;
  error?: string;
  errorMessage?: string;
  errorCode?: number;
}

// Move environment variables to a function to avoid accessing them during SSR
const getApiConfig = () => {
  const MUSIC_AI_API_URL = process.env.NEXT_PUBLIC_MUSIC_AI_API_URL || "https://apibox.erweima.ai/api/v1";
  const API_KEY = process.env.NEXT_PUBLIC_MUSIC_API_KEY || "f798ac38211e1576dd1b0486dc504a39";

  if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_MUSIC_API_KEY is not defined in environment variables");
  }

  return {
    baseURL: MUSIC_AI_API_URL,
    apiKey: API_KEY
  };
};

// Create API client only when needed, not during module initialization
const getApiClient = () => {
  const { baseURL, apiKey } = getApiConfig();
  return axios.create({
    baseURL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
};

// Helper function to find audio URL, task ID, and status in API response
function findResponseFields(obj: any, path = ""): { id?: string; status?: string; audioUrl?: string; error?: string } {
  const result: { id?: string; status?: string; audioUrl?: string; error?: string } = {};

  if (!obj || typeof obj !== "object") return result;

  const idFields = ["id", "taskId", "task_id", "taskID", "jobId", "job_id"];
  const statusFields = ["status", "state", "taskStatus", "jobStatus"];
  const audioFields = [
    "audio_url",
    "audioUrl",
    "url",
    "fileUrl",
    "mp3_url",
    "audio",
    "music_url",
    "result_url",
    "output_url",
    "download_url",
    "file",
    "mp3",
    "wav",
    "result",
    "stream_audio_url",
    "source_audio_url",
  ];
  const errorFields = ["error", "error_message", "errorMessage", "message", "msg"];
  const blacklistedFields = ["param", "parameters", "callBackUrl", "callback_url", "webhook"];

  // Search for ID
  for (const field of idFields) {
    if (obj[field] && typeof obj[field] === "string") {
      result.id = obj[field];
      break;
    }
  }

  // Search for status
  for (const field of statusFields) {
    if (obj[field] && typeof obj[field] === "string") {
      result.status = obj[field].toUpperCase();
      break;
    }
  }

  // Search for audio URL
  for (const field of audioFields) {
    if (obj[field] && typeof obj[field] === "string" && obj[field].includes("http")) {
      const url = obj[field].toLowerCase();
      if (blacklistedFields.some((blacklisted) => url.includes(blacklisted))) continue;

      const isAudioUrl =
        url.endsWith(".mp3") ||
        url.endsWith(".wav") ||
        url.endsWith(".ogg") ||
        url.endsWith(".m4a") ||
        url.endsWith(".aat") ||
        url.includes("/audio/") ||
        url.includes("/music/") ||
        url.includes("/stream/");
      if (isAudioUrl) {
        result.audioUrl = obj[field];
        break;
      }
    }
  }

  // Search for error
  for (const field of errorFields) {
    if (obj[field] && typeof obj[field] === "string") {
      result.error = obj[field];
      break;
    }
  }

  // Recursively search nested objects
  for (const key in obj) {
    if (blacklistedFields.includes(key)) continue;
    if (obj[key] && typeof obj[key] === "object" && obj[key] !== null) {
      const nested = findResponseFields(obj[key], `${path}.${key}`);
      result.id = result.id || nested.id;
      result.status = result.status || nested.status;
      result.audioUrl = result.audioUrl || nested.audioUrl;
      result.error = result.error || nested.error;
      if (result.id && result.status) break;
    }
  }

  // Parse stringified JSON in common fields
  for (const key of ["payload", "data", "result", "response"]) {
    if (obj[key] && typeof obj[key] === "string" && (obj[key].includes("{") || obj[key].includes("["))) {
      try {
        const parsed = JSON.parse(obj[key]);
        const nested = findResponseFields(parsed, `${path}.${key}(parsed)`);
        result.id = result.id || nested.id;
        result.status = result.status || nested.status;
        result.audioUrl = result.audioUrl || nested.audioUrl;
        result.error = result.error || nested.error;
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }

  return result;
}

export async function generateMusic(params: MusicGenerationParams): Promise<MusicGenerationResponse> {
  const apiClient = getApiClient();
  const { baseURL } = getApiConfig();
  
  const payload: any = {
    prompt: params.prompt,
    instrumental: params.instrumental,
    custom_mode: params.customMode,
    model: params.model,
    // Use provided callBackUrl or fallback to a local webhook endpoint for development
    callBackUrl: params.callBackUrl || "http://localhost:3000/api/webhook",
  };

  if (params.customMode) {
    payload.tags = params.style;
    payload.title = params.title || (params.prompt.length > 30 ? params.prompt.substring(0, 30) + "..." : params.prompt);
    payload.negative_tags = params.negativeTags;
  }

  try {
    // Input validation
    if (params.customMode) {
      if (params.style && params.style.length > 200) {
        throw new Error("Style must not exceed 200 characters");
      }
      if (params.title && params.title.length > 80) {
        throw new Error("Title must not exceed 80 characters");
      }
      if (!params.instrumental && params.prompt && params.prompt.length > 3000) {
        throw new Error("Prompt must not exceed 3000 characters");
      }
      if (params.negativeTags && params.negativeTags.length > 200) {
        throw new Error("Negative tags must not exceed 200 characters");
      }
      if (!params.style || !params.title) {
        throw new Error("Style and title are required in Custom Mode");
      }
      if (!params.instrumental && !params.prompt) {
        throw new Error("Prompt is required when instrumental is false in Custom Mode");
      }
    } else {
      if (params.prompt.length > 400) {
        throw new Error("Prompt must not exceed 400 characters in Non-custom Mode");
      }
      if (!params.prompt) {
        throw new Error("Prompt is required in Non-custom Mode");
      }
    }

    console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post("/generate", payload);
    const data = response.data;
    console.log("Raw API response from generateMusic:", JSON.stringify(data, null, 2));

    if (!data) {
      throw new Error("Empty response received from API");
    }

    const fields = findResponseFields(data);
    const taskId = fields.id;
    const status = fields.status || "PENDING";
    const audio_url = fields.audioUrl;
    const error = fields.error;

    if (!taskId) {
      console.error("No task ID found in response:", JSON.stringify(data, null, 2));
      throw new Error((data as any).msg || "Task ID not found in API response");
    }

    return {
      id: taskId,
      status,
      audio_url,
      error,
    };
  } catch (error: any) {
    console.error("Error generating music:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      payload: JSON.stringify(payload, null, 2),
      response: error.response?.data,
    });
    if (error.response) {
      const message = error.response.data?.msg || error.response.data?.message || error.response.statusText || "Unknown error";
      throw new Error(`API Error (${error.response.status}): ${message}`);
    } else if (error.request) {
      throw new Error("No response received from music API. Please check your network connection.");
    }
    throw new Error(error.message || "Failed to generate music");
  }
}

export async function getMusicGenerationDetails(taskId: string): Promise<MusicRecordInfoResponse> {
  const apiClient = getApiClient();
  const { baseURL } = getApiConfig();
  
  try {
    if (!taskId) {
      throw new Error("taskId is required");
    }

    console.log(`Fetching details for music generation task: ${taskId}`);

    const response = await apiClient.get("/generate/record-info", {
      params: { taskId },
    });
    const data = response.data;
    console.log("Raw API response from getMusicGenerationDetails:", JSON.stringify(data, null, 2));

    if (!data) {
      throw new Error("Empty response received from API");
    }

    const fields = findResponseFields(data);
    const status = fields.status || "PENDING";
    const normalizedStatus = status.includes("FAILED") || status === "failed" ? "failed" : status;

    const result: MusicRecordInfoResponse = {
      id: fields.id || taskId,
      status: normalizedStatus,
      audio_url: fields.audioUrl,
      error: fields.error,
      errorMessage: fields.error,
      errorCode: fields.error ? 1 : 0,
    };

    if ((result.status === "SUCCESS" || result.status === "completed") && !result.audio_url) {
      console.log("⚠️ Status is SUCCESS but no audio_url found. Raw data:", JSON.stringify(data, null, 2));
      const possibleUrls = [
        `${baseURL}/download/${taskId}`,
        `${baseURL}/files/${taskId}.mp3`,
        `${baseURL}/output/${taskId}`,
        `${baseURL}/stream/${taskId}`,
      ];
      result.audio_url = possibleUrls[0];
    }

    console.log("Processed music generation details:", result);
    return result;
  } catch (error: any) {
    console.error("Error fetching music generation details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      taskId,
    });
    if (error.response) {
      throw new Error(`API Error (${error.response.status}): ${error.response.data?.message || error.response.statusText || "Unknown error"}`);
    } else if (error.request) {
      throw new Error("No response received from music details API. Please check your network connection.");
    }
    throw new Error(error.message || "Failed to fetch music generation details");
  }
}