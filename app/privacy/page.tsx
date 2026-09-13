import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How TokMieja collects, uses and protects the personal information you share when you shop with us.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Notice",
    description:
      "How TokMieja collects, uses and protects the personal information you share when you shop with us.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-12 sm:py-16">
        <article className="mx-auto flex max-w-2xl flex-col gap-9">
          <header className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              TokMieja Shop
            </p>
            <h1 className="font-display text-3xl font-semibold text-cocoa-900">
              Privacy Notice
            </h1>
            <p className="text-cocoa-600">
              This notice explains how TokMieja handles the personal information
              you share when you shop with us.
            </p>
          </header>

          <Section title="Information we collect">
            <p>
              When you place an order, we ask for your <strong>name</strong>,{" "}
              <strong>phone number</strong> and{" "}
              <strong>delivery address</strong>. You may also provide an{" "}
              <strong>email address</strong> and an optional{" "}
              <strong>location pin</strong> (a map link) to help with delivery.
            </p>
            <p>
              We also keep the details of your <strong>order</strong>, such as
              the items and quantities, prices, delivery choice and payment
              method.
            </p>
          </Section>

          <Section title="Why we need it">
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>To create and process your order.</li>
              <li>To arrange delivery to your address.</li>
              <li>To contact you about your order when needed.</li>
              <li>
                To let you track your order using your order number and phone
                number.
              </li>
              <li>To keep records of orders for our own bookkeeping.</li>
            </ul>
          </Section>

          <Section title="How we protect it">
            <p>
              Your information is stored in our own database and only TokMieja
              can access it. Online payments are handled by our payment
              provider, so we do not store your card or bank details ourselves.
            </p>
          </Section>

          <Section title="When it may be shared">
            <p>
              To run the shop, your information may be shared with the service
              providers that help us operate it, such as:
            </p>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              <li>our payment provider, to process online payments;</li>
              <li>our hosting and database provider, which stores the data;</li>
              <li>
                a delivery service, where one is used to send your order, in
                which case only the name, phone number and address needed to
                deliver it would be shared.
              </li>
            </ul>
            <p>We do not sell your personal information.</p>
          </Section>

          <Section title="How long we keep it">
            <p>
              We keep order information for as long as it is needed to run the
              shop and to keep our business records consistent. Records are kept
              only while they serve that purpose.
            </p>
          </Section>

          <Section title="Contacting us about your information">
            <p>
              If you have a question about your personal information, please
              contact TokMieja using the phone number you used when placing your
              order. You can also review your order details on the{" "}
              <Link
                href="/track-order"
                className="font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                order tracking
              </Link>{" "}
              page.
            </p>
            <p>
              We may update this notice from time to time, and the latest
              version will always be available on this page.
            </p>
          </Section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold text-cocoa-900">
        {title}
      </h2>
      <div className="flex flex-col gap-3 leading-relaxed text-cocoa-700">
        {children}
      </div>
    </section>
  );
}
