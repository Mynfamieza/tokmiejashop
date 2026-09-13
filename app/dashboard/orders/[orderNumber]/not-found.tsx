import Link from "next/link";
import { DashboardMessage } from "@/components/dashboard/dashboard-message";
import { buttonVariants } from "@/components/ui/button";

export default function DashboardOrderNotFound() {
  return (
    <DashboardMessage
      title="Order not found"
      description="We could not find an order with that number."
      action={
        <Link
          href="/dashboard/orders"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Back to orders
        </Link>
      }
    />
  );
}
