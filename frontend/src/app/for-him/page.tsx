import { redirect } from "next/navigation";

export default function ForHimPage() {
  redirect("/search?recipient=For%20Him");
}