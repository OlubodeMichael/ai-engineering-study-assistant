const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

const STREAM_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  "X-Accel-Buffering": "no",
} as const;

function backendAskUrl(): string {
  const baseUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
  return `${baseUrl.replace(/\/+$/, "")}/ask`;
}

function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function backendRejectionMessage(status: number): string {
  if (status === 422) return "The question must be between 1 and 4,000 characters.";
  return "The backend rejected the request.";
}

async function readQuestion(request: Request): Promise<{ question: unknown } | null> {
  try {
    const body: unknown = await request.json();
    const question = typeof body === "object" && body !== null && "question" in body
      ? body.question
      : undefined;
    return { question };
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const payload = await readQuestion(request);
  if (payload === null) return errorResponse("The request body must be valid JSON.", 400);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendAskUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: request.signal,
    });
  } catch (error) {
    if (request.signal.aborted) return errorResponse("The request was cancelled.", 499);
    console.error("Unable to reach the backend", error);
    return errorResponse("Unable to connect to the backend.", 502);
  }

  if (!backendResponse.ok) {
    return errorResponse(backendRejectionMessage(backendResponse.status), backendResponse.status);
  }
  if (!backendResponse.body) {
    return errorResponse("The backend returned an empty stream.", 502);
  }

  return new Response(backendResponse.body, { headers: STREAM_HEADERS });
}
