import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Shop | Post Mart" };

export default async function ProfilePage() {
  redirect("/shoes");
}
