import GuestBookPage from "../components/GuestBookPage";
import { guestBookPageData } from "../lib/mock/build-guest-book-page";

export default async function Home() {
  return <GuestBookPage data={guestBookPageData} />;
}
