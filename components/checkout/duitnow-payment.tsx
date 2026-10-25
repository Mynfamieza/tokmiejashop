import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export function DuitNowPayment({
  orderNumber,
  total,
}: {
  orderNumber: string;
  total: number;
}) {
  return (
    <section
      aria-labelledby="duitnow-heading"
      lang="en"
      className="rounded-panel border border-brand-200 bg-cream-100 p-5 sm:p-6"
    >
      <h2 id="duitnow-heading" className="font-display text-xl font-semibold text-brand-800">
        DuitNow QR Payment
      </h2>
      <p role="status" className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
        Awaiting payment verification
      </p>
      <p className="mt-3 text-sm leading-relaxed text-cocoa-700">
        Thanks for your order! TokMieja will verify your payment manually.
      </p>

      <dl className="mt-5 grid gap-4 rounded-xl border border-cocoa-900/10 bg-white p-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-cocoa-500">Amount (MYR)</dt>
          <dd className="mt-1 font-display text-3xl font-semibold text-brand-700">
            {formatPrice(total)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-cocoa-500">Order reference</dt>
          <dd className="mt-1 break-words font-semibold text-cocoa-900">{orderNumber}</dd>
        </div>
      </dl>

      <Image
        src="/duitnow-qr.jpg"
        alt="TokMieja DuitNow QR — recipient SYARMIN BINTI MUHAMAD FA"
        width={591}
        height={796}
        unoptimized
        className="mx-auto mt-5 h-auto w-full max-w-xs rounded-xl"
      />

      <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-cocoa-700">
        <li>
          Scan with your bank or e-wallet app. Using the same phone?
          <strong> Download QR</strong> and select it from your gallery if supported.
        </li>
        <li>
          Check the recipient: <strong>SYARMIN BINTI MUHAMAD FA</strong>.
        </li>
        <li>
          Pay exactly <strong>{formatPrice(total)}</strong>. Enter this amount
          manually. Reference: <strong className="break-words">{orderNumber}</strong>
          {" "}(if available).
        </li>
        <li>
          Save your receipt.
        </li>
      </ol>

      <a
        href="/duitnow-qr.jpg"
        download="TokMieja-DuitNow-QR.jpg"
        className={`${buttonVariants({ size: "lg" })} mt-5 w-full sm:w-auto`}
      >
        Download QR
      </a>
    </section>
  );
}
