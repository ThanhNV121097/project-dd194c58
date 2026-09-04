import GuestBookPage from "../components/GuestBookPage";

const apiBase = process.env.API_ORIGIN ?? "http://backend:8080";

export default async function Home() {
  const [entriesResponse, countResponse] = await Promise.all([
    fetch(`${apiBase}/v1/entries`, { cache: "no-store" }),
    fetch(`${apiBase}/v1/entries/count`, { cache: "no-store" }),
  ]);
  const entriesBody = entriesResponse.ok ? await entriesResponse.json() : { data: [] };
  const countBody = countResponse.ok ? await countResponse.json() : { count: 0 };
  return <GuestBookPage data={{ count: countBody.count, entries: entriesBody.data, apiUnavailableMessage: "Could not reach guest book API. Try again in a moment.", showApiUnavailable: !(entriesResponse.ok && countResponse.ok) }} />;
}
