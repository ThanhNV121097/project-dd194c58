export type GuestBookEntry = {
  id: string;
  name: string;
  note: string;
  created_at: string;
};

const entries: GuestBookEntry[] = [
  { id: "3", name: "Mina", note: "Lovely little shop. The front desk feels like a handwritten postcard.", created_at: "Today · 2:14 PM" },
  { id: "2", name: "Jon", note: "Stopped for a coffee and stayed for the quiet. Nice place to pause.", created_at: "Today · 1:02 PM" },
  { id: "1", name: "Priya", note: "Warm, calm, and welcoming. The guest book matches the room.", created_at: "Yesterday · 6:40 PM" },
];

function trimOrEmpty(value: string) {
  return value.trim();
}

function validate(value: string, max: number, label: string) {
  const trimmed = trimOrEmpty(value);
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length > max) return `${label} is too long.`;
  return trimmed;
}

export const mockGuestBook = {
  count: entries.length,
  entries,
  createEntry(name: string, note: string) {
    const cleanName = validate(name, 60, "Name");
    if (cleanName.includes("required") || cleanName.includes("too long")) return cleanName;
    const cleanNote = validate(note, 280, "Note");
    if (cleanNote.includes("required") || cleanNote.includes("too long")) return cleanNote;
    return {
      id: String(entries.length + 1),
      name: cleanName,
      note: cleanNote,
      created_at: "Today · just now",
    } satisfies GuestBookEntry;
  },
};
