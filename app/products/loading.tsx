import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-10 sm:py-14">
        <header className="flex flex-col gap-2">
          <div className="h-3 w-28 animate-pulse rounded bg-cream-200" />
          <div className="h-8 w-56 max-w-full animate-pulse rounded bg-cream-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-cream-200" />
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="h-9 w-20 animate-pulse rounded-full bg-cream-200"
            />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-cocoa-900/10 bg-white"
            >
              <div className="aspect-square animate-pulse bg-cream-200" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-cream-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-cream-200" />
                <div className="mt-2 h-5 w-20 animate-pulse rounded bg-cream-200" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
