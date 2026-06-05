import axios from "axios";

interface ProblemLike {
  detail?: string;
  title?: string;
  message?: string;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong.") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ProblemLike | string | undefined;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (data && typeof data === "object" && "detail" in data && data.detail) {
      return data.detail;
    }
    if (data && typeof data === "object" && "message" in data && data.message) {
      return data.message;
    }
    if (data && typeof data === "object" && "title" in data && data.title) {
      return data.title;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
