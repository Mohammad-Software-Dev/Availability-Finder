import type {
  ApiError,
  AvailabilityRequest,
  AvailabilityResponse,
  PersonWithEvents,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function safeParseJSON(res: Response) {
  try {
    return await res.json();
  } catch {
    throw { message: "Invalid server response" } satisfies ApiError;
  }
}

async function handleResponse(res: Response) {
  const data = await safeParseJSON(res);

  if (!res.ok) {
    throw {
      message: data?.message ?? "Request failed",
    } satisfies ApiError;
  }

  return data;
}

type RequestOptions = {
  signal?: AbortSignal;
};

export async function fetchPeople(
  options: RequestOptions = {},
): Promise<PersonWithEvents[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/people`, {
      signal: options.signal,
    });

    const data = await handleResponse(res);

    return data;
  } catch (err) {
    if (typeof err === "object" && err !== null && "message" in err) {
      throw err as ApiError;
    }

    throw { message: "Network error. Please try again." } satisfies ApiError;
  }
}

export async function fetchAvailability(
  payload: AvailabilityRequest,
  options: RequestOptions = {},
): Promise<AvailabilityResponse> {
  try {
    const res = await fetch(`${BASE_URL}/api/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    const data = await handleResponse(res);

    return data;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw { message: "Request cancelled" } satisfies ApiError;
    }

    if (typeof err === "object" && err !== null && "message" in err) {
      throw err as ApiError;
    }

    throw { message: "Network error. Please try again." } satisfies ApiError;
  }
}
