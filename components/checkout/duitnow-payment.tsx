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
      lang="ms"
      className="rounded-panel border border-brand-200 bg-cream-100 p-5 sm:p-6"
    >
      <h2 id="duitnow-heading" className="font-display text-xl font-semibold text-brand-800">
        Bayaran DuitNow QR
      </h2>
      <p role="status" className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800">
        Menunggu Pengesahan Bayaran
      </p>
      <p className="mt-3 text-sm leading-relaxed text-cocoa-700">
        Pesanan anda telah diterima. Bayaran belum disahkan. TokMieja akan
        menyemak bayaran anda secara manual.
      </p>

      <dl className="mt-5 grid gap-4 rounded-xl border border-cocoa-900/10 bg-white p-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-cocoa-500">Jumlah perlu dibayar (MYR)</dt>
          <dd className="mt-1 font-display text-3xl font-semibold text-brand-700">
            {formatPrice(total)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-cocoa-500">Rujukan pesanan</dt>
          <dd className="mt-1 break-words font-semibold text-cocoa-900">{orderNumber}</dd>
        </div>
      </dl>

      <Image
        src="/duitnow-qr.jpg"
        alt="DuitNow QR TokMieja — penerima SYARMIN BINTI MUHAMAD FA"
        width={591}
        height={796}
        unoptimized
        className="mx-auto mt-5 h-auto w-full max-w-xs rounded-xl"
      />

      <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-cocoa-700">
        <li>Buka aplikasi bank atau e-dompet anda dan pilih DuitNow QR.</li>
        <li>
          Imbas kod QR di atas. Jika menggunakan telefon yang sama, tekan
          <strong> Download QR / Muat turun QR</strong>, kemudian pilih gambar
          tersebut daripada galeri dalam aplikasi bank yang menyokongnya.
        </li>
        <li>
          Semak nama penerima: <strong>SYARMIN BINTI MUHAMAD FA</strong>.
        </li>
        <li>
          Masukkan sendiri jumlah tepat <strong>{formatPrice(total)}</strong>.
          Jumlah tidak diisi secara automatik. Masukkan <strong className="break-words">{orderNumber}</strong>
          {" "}sebagai rujukan jika ruangan rujukan tersedia.
        </li>
        <li>
          Sahkan bayaran dan simpan resit untuk rujukan. Status kekal belum
          dibayar sehingga TokMieja menyemak dan mengesahkannya.
        </li>
      </ol>

      <a
        href="/duitnow-qr.jpg"
        download="TokMieja-DuitNow-QR.jpg"
        className={`${buttonVariants({ size: "lg" })} mt-5 w-full sm:w-auto`}
      >
        Download QR / Muat turun QR
      </a>
    </section>
  );
}
