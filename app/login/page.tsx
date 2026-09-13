import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { LockIcon } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log masuk",
  description: "Log masuk pemilik TokMieja Shop.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-col">
      <div className="container-page flex flex-1 items-center justify-center py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <BrandMark />
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-700/15 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              <LockIcon className="h-3.5 w-3.5" strokeWidth={2} />
              Akses pemilik
            </span>
            <h1 className="font-display text-2xl font-semibold text-cocoa-900 sm:text-3xl">
              Log masuk pemilik
            </h1>
            <p className="text-cocoa-500">
              Halaman ini khas untuk pemilik kedai. Akaun pelanggan akan
              datang dalam fasa seterusnya.
            </p>
          </div>

          <LoginForm configured={isSupabaseConfigured} />

          <p className="mt-8 text-center text-sm text-cocoa-500">
            <Link
              href="/"
              className="font-bold text-brand-700 hover:underline"
            >
              Kembali ke kedai
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
