import { siteConfig } from "@/lib/site";

export function ShopIntro() {
  return (
    <section className="container-page pt-10 pb-6 sm:pt-14 sm:pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
        {siteConfig.brand} Shop
      </p>
      <h1 className="mt-3 max-w-2xl text-balance font-display text-2xl font-semibold leading-tight text-cocoa-900 sm:text-3xl">
        {siteConfig.tagline}
      </h1>
      <p className="mt-3 max-w-xl text-cocoa-500">{siteConfig.intro}</p>
    </section>
  );
}
