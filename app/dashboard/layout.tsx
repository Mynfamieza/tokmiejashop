import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { signOutOwner } from "@/app/dashboard/actions";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getOwnerContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | TokMieja Owner" },
  description: "Papan pemuka pemilik TokMieja.",
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { configured, user, isOwner } = await getOwnerContext();

  if (!configured) {
    return (
      <main className="container-page flex min-h-full items-center justify-center py-20">
        <DashboardMessage
          title="Store not connected"
          description="Connect Supabase and run supabase/schema.sql, supabase/phase3_order_creation.sql and supabase/phase4_owner_management.sql before using the owner dashboard."
        />
      </main>
    );
  }

  if (!user) {
    redirect("/login");
  }

  if (!isOwner) {
    return (
      <main className="container-page flex min-h-full items-center justify-center py-20">
        <DashboardMessage
          title="Access denied"
          description="This account is signed in but is not registered as an owner. Ask the store owner to grant access."
          action={
            <form action={signOutOwner}>
              <Button type="submit" variant="outline" size="lg">
                Sign out
              </Button>
            </form>
          }
        />
      </main>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
