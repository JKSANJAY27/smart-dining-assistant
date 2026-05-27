import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root to a demo table
  redirect("/table/T1");
}
