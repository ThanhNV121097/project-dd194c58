export type GuestBookEntry = {
  id: string;
  name: string;
  note: string;
  created_at: string;
};

type CountResponse = { count: number };
type EntriesResponse = { data: GuestBookEntry[] };

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "/api").replace(/\/$/, "");

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchEntries(): Promise<GuestBookEntry[]> {
  const response = await requestJson<EntriesResponse>("/v1/entries");
  return response.data;
}

export async function fetchEntryCount(): Promise<number> {
  const response = await requestJson<CountResponse>("/v1/entries/count");
  return response.count;
}

export async function createEntry(input: { name: string; note: string }): Promise<GuestBookEntry> {
  return requestJson<GuestBookEntry>("/v1/entries", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
