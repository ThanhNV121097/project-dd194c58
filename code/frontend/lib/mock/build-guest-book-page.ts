export const guestBookPageData = {
  count: 3,
  apiUnavailableMessage: "Could not reach API. Try again in a moment.",
  entries: [
    {
      id: 3,
      name: "Mina",
      note: "Lovely little shop. The front desk feels like a handwritten postcard.",
      created_at: "2025-08-14T14:14:00.000Z",
    },
    {
      id: 2,
      name: "Jon",
      note: "Stopped for a coffee and stayed for the quiet. Nice place to pause.",
      created_at: "2025-08-14T13:02:00.000Z",
    },
    {
      id: 1,
      name: "Priya",
      note: "Warm, calm, and welcoming. The guest book matches the room.",
      created_at: "2025-08-13T18:40:00.000Z",
    },
  ],
} as const;
