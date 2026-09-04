export const guestBookPageData = {
  count: 3,
  entries: [
    {
      id: "3",
      name: "Mina",
      note: "Lovely little shop. The front desk feels like a handwritten postcard.",
      created_at: "2026-09-04T14:14:00Z",
    },
    {
      id: "2",
      name: "Jon",
      note: "Stopped for a coffee and stayed for the quiet. Nice place to pause.",
      created_at: "2026-09-04T13:02:00Z",
    },
    {
      id: "1",
      name: "Priya",
      note: "Warm, calm, and welcoming. The guest book matches the room.",
      created_at: "2026-09-03T18:40:00Z",
    },
  ],
  apiUnavailableMessage: "Could not reach guest book API. Try again in a moment.",
  showApiUnavailable: false,
} as const;
