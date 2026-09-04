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

type GuestBookState = {
  entries: GuestBookEntry[];
  nextId: number;
};

const store: GuestBookState = {
  entries: [],
  nextId: 1,
};

function normalize(value: string) {
  return value.trim();
}

export async function fetchEntries() {
  return [...store.entries].sort((a, b) => b.id - a.id);
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
    id: store.nextId,
    name,
    note,
    created_at: new Date().toISOString(),
  };

  store.nextId += 1;
  store.entries.unshift(entry);
  return entry;
}
