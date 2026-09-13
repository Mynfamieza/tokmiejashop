import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { OrderDetail } from "@/components/dashboard/order-detail";
import { getOrderByNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function DashboardOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const { order, error } = await getOrderByNumber(orderNumber);

  if (error) {
    return (
      <DashboardMessage title="Could not load order" description={error} />
    );
  }

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} />;
}
