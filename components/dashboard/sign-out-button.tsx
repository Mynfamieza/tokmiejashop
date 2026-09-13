"use client";

import { useTransition } from "react";
import { signOutOwner } from "@/app/dashboard/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutOwner();
        })
      }
      className="rounded-full border border-cocoa-900/15 px-4 py-2 text-sm font-medium text-cocoa-700 transition hover:border-brand-700/40 hover:text-brand-700 disabled:opacity-60"
    >
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
