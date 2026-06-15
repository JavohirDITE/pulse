import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/app/app-shell";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AppShell
      user={{
        id: session.userId,
        name: session.name,
        email: session.email,
      }}
    >
      {children}
    </AppShell>
  );
}
