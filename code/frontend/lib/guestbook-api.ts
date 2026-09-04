export type GuestBookEntry = {
  id: string;
  name: string;
  note: string;
  created_at: string;
};

type NewEntry = {
  name: string;
  note: string;
};

type CountResponse = {
  count: number;
};

type EntriesResponse = {
  data: GuestBookEntry[];
};

type HealthResponse = {
  status: "ok";
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const versionedBase = `${apiBase}/v1`;

function buildUrl(path: string) {
  return `${versionedBase}${path}`;
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBase}/health`);
  return readJson<HealthResponse>(response);
}

export async function fetchEntries(): Promise<GuestBookEntry[]> {
  const response = await fetch(buildUrl("/entries"));
  const body = await readJson<EntriesResponse>(response);
  return body.data;
}

export async function fetchEntryCount(): Promise<CountResponse> {
  const response = await fetch(buildUrl("/entries/count"));
  return readJson<CountResponse>(response);
}

export async function createEntry(input: NewEntry): Promise<GuestBookEntry> {
  const response = await fetch(buildUrl("/entries"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return readJson<GuestBookEntry>(response);
}
