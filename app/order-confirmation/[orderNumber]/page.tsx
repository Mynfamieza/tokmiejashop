import type { Metadata } from "next";
import { OrderConfirmationView } from "@/components/checkout/order-confirmation-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Pengesahan pesanan TokMieja.",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-8 sm:py-12">
        <OrderConfirmationView orderNumber={orderNumber} />
      </main>

      <SiteFooter />
    </div>
  );
}
