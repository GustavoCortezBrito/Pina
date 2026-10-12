import { requireAccessPage } from "@/lib/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAccessPage("despesas");
  return children;
}
