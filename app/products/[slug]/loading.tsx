import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="container-page flex-1 py-8 sm:py-12">
        <div className="h-4 w-32 animate-pulse rounded bg-cocoa-900/10" />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="aspect-square animate-pulse rounded-panel bg-cream-100" />

          <div className="flex flex-col gap-5">
            <div className="h-5 w-20 animate-pulse rounded-full bg-cream-100" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-cream-100" />
            <div className="h-7 w-24 animate-pulse rounded bg-cream-100" />
            <div className="h-4 w-full animate-pulse rounded bg-cream-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-cream-100" />
            <div className="h-12 w-44 animate-pulse rounded-full bg-cream-100" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
