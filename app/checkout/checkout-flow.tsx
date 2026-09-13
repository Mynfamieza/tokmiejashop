"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { computeItemCount } from "@/lib/cart";
import { useCart } from "@/components/cart/cart-provider";
import { CustomerForm } from "@/components/checkout/customer-form";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentMethodSelect } from "@/components/checkout/payment-method-select";
import { ReviewOrder } from "@/components/checkout/review-order";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  calculateDeliveryFee,
  isKulimAddress,
  type PaymentMethod,
} from "@/lib/delivery";
import {
  cartItemsToSummaryItems,
  EMPTY_CUSTOMER_FORM,
  hasErrors,
  saveOrderConfirmation,
  validateCustomer,
  type CustomerFormErrors,
  type CustomerFormValues,
} from "@/lib/checkout";
import { useIsClient } from "@/lib/use-is-client";
import { cn } from "@/lib/utils";
import { createOrder } from "./actions";

type Step = "details" | "review";

export function CheckoutFlow() {
  const router = useRouter();
  const isClient = useIsClient();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<Step>("details");
  const [values, setValues] = useState<CustomerFormValues>(EMPTY_CUSTOMER_FORM);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay_now");
  const idempotencyKeyRef = useRef<string | null>(null);

  const summaryItems = cartItemsToSummaryItems(items);
  const totalItems = computeItemCount(items);

  // COD is Kulim-only. If the address stops qualifying, fall back to Pay Now.
  const codAvailable = isKulimAddress(values.address);
  const effectivePaymentMethod: PaymentMethod =
    paymentMethod === "cod" && !codAvailable ? "pay_now" : paymentMethod;

  const deliveryFee = calculateDeliveryFee(totalItems, effectivePaymentMethod);
  const total = subtotal + deliveryFee;

  function getKey(): string {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `key-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    return idempotencyKeyRef.current;
  }

  function handleChange(field: keyof CustomerFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleContinue() {
    const nextErrors = validateCustomer(values);
    if (
      effectivePaymentMethod === "pay_now" &&
      values.email.trim().length === 0
    ) {
      nextErrors.email = "Email is required for online payment.";
    }
    setErrors(nextErrors);
    setSubmitError(null);
    if (hasErrors(nextErrors)) return;

    setStep("review");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleConfirm() {
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createOrder({
        customer: values,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        idempotencyKey: getKey(),
        paymentMethod: effectivePaymentMethod,
        locationPin: values.locationPin,
      });

      if (!result.ok) {
        setSubmitError(result.message);
        return;
      }

      // Clear the cart only AFTER a successful order.
      saveOrderConfirmation(result.order);
      clearCart();

      if (result.paymentUrl) {
        // Pay Now: hand off to ToyyibPay (FPX / DuitNow QR).
        window.location.assign(result.paymentUrl);
        return;
      }

      router.push(
        `/order-confirmation/${encodeURIComponent(result.order.orderNumber)}`,
      );
    } catch {
      setSubmitError("Sorry, something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isClient) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add a product to your cart before checking out."
        action={
          <Link href="/products" className={buttonVariants({ size: "lg" })}>
            Browse the shop
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="flex flex-col gap-6">
        <StepIndicator step={step} />

        {step === "details" ? (
          <>
            <CustomerForm
              values={values}
              errors={errors}
              onChange={handleChange}
              disabled={submitting}
            />
            <PaymentMethodSelect
              value={effectivePaymentMethod}
              onChange={setPaymentMethod}
              codAvailable={codAvailable}
              disabled={submitting}
            />
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button
                type="button"
                size="lg"
                onClick={handleContinue}
                className="w-full sm:w-auto"
              >
                Continue to review
              </Button>
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full sm:w-auto",
                )}
              >
                Continue shopping
              </Link>
            </div>
          </>
        ) : (
          <ReviewOrder
            values={values}
            items={summaryItems}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            paymentMethod={effectivePaymentMethod}
            onBack={() => setStep("details")}
            onConfirm={handleConfirm}
            submitting={submitting}
            error={submitError}
          />
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary
          items={summaryItems}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
        />
      </aside>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "review", label: "Review" },
  ];

  return (
    <ol className="flex items-center gap-3 text-sm">
      {steps.map((item, index) => {
        const active = step === item.id;
        return (
          <li key={item.id} className="flex items-center gap-3">
            {index > 0 ? (
              <span aria-hidden className="h-px w-6 bg-cocoa-900/15" />
            ) : null}
            <span
              className={cn(
                "flex items-center gap-2",
                active ? "font-medium text-cocoa-900" : "text-cocoa-400",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
                  active
                    ? "bg-brand-700 text-cream-50"
                    : "bg-cream-200 text-cocoa-500",
                )}
              >
                {index + 1}
              </span>
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="flex flex-col gap-5">
        <div className="h-6 w-40 animate-pulse rounded bg-cream-100" />
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="h-4 w-28 animate-pulse rounded bg-cream-100" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-cream-100" />
          </div>
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-panel bg-cream-100" />
    </div>
  );
}
