export type GuestBookEntry = {
  id: number;
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

const store: GuestBookEntry[] = [
  { id: 3, name: "Mina", note: "Lovely little shop. The front desk feels like a handwritten postcard.", created_at: "2025-08-14T14:14:00Z" },
  { id: 2, name: "Jon", note: "Stopped for a coffee and stayed for the quiet. Nice place to pause.", created_at: "2025-08-14T13:02:00Z" },
  { id: 1, name: "Priya", note: "Warm, calm, and welcoming. The guest book matches the room.", created_at: "2025-08-13T18:40:00Z" },
];

function normalize(value: string) {
  return value.trim();
}

export async function fetchEntries() {
  return [...store].sort((a, b) => b.id - a.id);
}

export async function fetchEntryCount(): Promise<CountResponse> {
  return { count: store.length };
}

export async function createEntry(input: NewEntry) {
  const name = normalize(input.name);
  const note = normalize(input.note);

  if (!name || !note || name.length > 60 || note.length > 280) {
    throw new Error("Validation error");
  }

  const entry: GuestBookEntry = {
    id: store.length ? Math.max(...store.map((item) => item.id)) + 1 : 1,
    name,
    note,
    created_at: new Date().toISOString(),
  };

  store.unshift(entry);
  return entry;
}
