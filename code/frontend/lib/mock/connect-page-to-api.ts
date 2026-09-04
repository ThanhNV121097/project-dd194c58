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

type GuestBookState = {
  entries: GuestBookEntry[];
  nextId: number;
};

const store: GuestBookState = {
  entries: [
    {
      id: "2",
      name: "Mina",
      note: "Lovely little shop. The front desk feels like a handwritten postcard.",
      created_at: "2026-09-04T14:14:00Z",
    },
    {
      id: "1",
      name: "Jon",
      note: "Stopped for a coffee and stayed for the quiet. Nice place to pause.",
      created_at: "2026-09-04T13:02:00Z",
    },
  ],
  nextId: 3,
};

function normalize(value: string) {
  return value.trim();
}

export async function fetchEntries() {
  return [...store.entries];
}

export async function fetchEntryCount(): Promise<CountResponse> {
  return { count: store.entries.length };
}

export async function createEntry(input: NewEntry) {
  const name = normalize(input.name);
  const note = normalize(input.note);

  if (!name || !note || name.length > 60 || note.length > 280) {
    throw new Error("Validation error");
  }

  const entry: GuestBookEntry = {
    id: String(store.nextId),
    name,
    note,
    created_at: new Date().toISOString(),
  };

  store.nextId += 1;
  store.entries = [entry, ...store.entries];
  return entry;
}
