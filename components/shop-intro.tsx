import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export function ShopIntro() {
  return (
    <div className="container-page pt-3 pb-6 sm:pb-8 md:pt-8 md:pb-12">
      <section aria-labelledby="homepage-hero-heading" className="relative isolate grid w-full place-items-center overflow-hidden rounded-3xl bg-brand-950 text-center text-cream-100 md:h-[310px] md:min-h-0">
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 aspect-[1983/793] -translate-y-1/2 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] md:inset-0 md:aspect-auto md:translate-y-0 md:[mask-image:none]">
          <Image
            src="/tokmieja-hero-bg.png"
            alt=""
            fill
            sizes="(min-width: 1152px) 1088px, 100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-center"
          />
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(53,12,11,0.92)_0%,rgba(53,12,11,0.85)_48%,transparent_80%)] md:hidden" />

        <div className="relative flex w-full flex-col items-center px-5 py-4 md:w-auto md:px-8 md:py-7">
          <h1 id="homepage-hero-heading" className="whitespace-nowrap font-display text-[clamp(2rem,9.2vw,2.75rem)] font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-cream-50">TokMieja</span>{" "}
            <span className="text-mango-100">Shop</span>
          </h1>
          <p className="mt-2 text-base text-cream-200 md:mt-3 md:text-lg">
            Small Jar. Big Flavour.
          </p>
          <Link
            href="/products/sambal-garing-bilis-pucuk-ubi"
            className="mt-4 inline-flex min-h-12 w-full max-w-52 items-center justify-center gap-4 rounded-full bg-mango-100 px-8 py-3 text-base font-bold text-brand-950 transition-colors hover:bg-cream-50 focus-visible:outline-cream-100 focus-visible:outline-offset-4 md:mt-6 md:w-auto md:max-w-none md:text-sm"
          >
            Buy Now
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
