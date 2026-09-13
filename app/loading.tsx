import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="container-page pt-10 pb-6 sm:pt-14 sm:pb-8">
          <div className="h-3 w-24 animate-pulse rounded bg-cream-200" />
          <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-cream-200" />
          <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-cream-200" />
        </section>

        <div className="container-page flex flex-wrap gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-9 w-20 animate-pulse rounded-full bg-cream-200"
            />
          ))}
        </div>

        <section className="container-page pt-8 sm:pt-10">
          <div className="grid overflow-hidden rounded-panel border border-cocoa-900/10 bg-white md:grid-cols-2">
            <div className="aspect-square animate-pulse bg-cream-200 md:min-h-[26rem]" />
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-9">
              <div className="h-5 w-20 animate-pulse rounded-full bg-cream-200" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-cream-200" />
              <div className="h-4 w-full animate-pulse rounded bg-cream-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-cream-200" />
              <div className="h-10 w-40 animate-pulse rounded-full bg-cream-200" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
