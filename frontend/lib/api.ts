import { ProcessResponse, SchemaResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

function resolveApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function extractErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { detail?: string };
    return payload.detail || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function fetchSchema(): Promise<SchemaResponse> {
  const response = await fetch(resolveApiUrl("/api/v1/schema"), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as SchemaResponse;
}

export async function processCsvUpload(
  file: File,
  chunkSize: number,
): Promise<ProcessResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("chunk_size", String(chunkSize));

  const response = await fetch(resolveApiUrl("/api/v1/jobs/process"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as ProcessResponse;
}
