import { redirect } from "next/navigation";

export default function ForHerPage() {
  redirect("/search?recipient=For%20Her");
}