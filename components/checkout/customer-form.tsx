"use client";

import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import type {
  CustomerFormErrors,
  CustomerFormValues,
} from "@/lib/checkout";

type Field = keyof CustomerFormValues;

export function CustomerForm({
  values,
  errors,
  onChange,
  disabled,
}: {
  values: CustomerFormValues;
  errors: CustomerFormErrors;
  onChange: (field: Field, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout-name">
          Full name <span className="text-brand-700">*</span>
        </Label>
        <Input
          id="checkout-name"
          name="name"
          autoComplete="name"
          required
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "checkout-name-error" : undefined}
          placeholder="Nama penuh"
        />
        <FieldError id="checkout-name-error">{errors.name}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout-phone">
          Phone number <span className="text-brand-700">*</span>
        </Label>
        <Input
          id="checkout-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={values.phone}
          onChange={(event) => onChange("phone", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
          placeholder="cth. 012-3456789"
        />
        <FieldError id="checkout-phone-error">{errors.phone}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout-email">
          Email <span className="font-normal text-cocoa-400">(optional)</span>
        </Label>
        <Input
          id="checkout-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "checkout-email-error" : undefined}
          placeholder="nama@email.com"
        />
        <FieldError id="checkout-email-error">{errors.email}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout-address">
          Delivery address <span className="text-brand-700">*</span>
        </Label>
        <Textarea
          id="checkout-address"
          name="address"
          autoComplete="street-address"
          required
          value={values.address}
          onChange={(event) => onChange("address", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.address)}
          aria-describedby={
            errors.address ? "checkout-address-error" : undefined
          }
          placeholder="Alamat penghantaran penuh"
        />
        <FieldError id="checkout-address-error">{errors.address}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout-location-pin">
          Location pin{" "}
          <span className="font-normal text-cocoa-400">(optional)</span>
        </Label>
        <Input
          id="checkout-location-pin"
          name="locationPin"
          type="url"
          inputMode="url"
          value={values.locationPin}
          onChange={(event) => onChange("locationPin", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors.locationPin)}
          aria-describedby={
            errors.locationPin ? "checkout-location-pin-error" : undefined
          }
          placeholder="https://maps.app.goo.gl/..."
        />
        <FieldError id="checkout-location-pin-error">
          {errors.locationPin}
        </FieldError>
        <p className="text-xs text-cocoa-400">
          Optional Google Maps link to help with delivery.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="checkout-notes">
          Notes <span className="font-normal text-cocoa-400">(optional)</span>
        </Label>
        <Textarea
          id="checkout-notes"
          name="notes"
          value={values.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          disabled={disabled}
          maxLength={500}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? "checkout-notes-error" : undefined}
          placeholder="cth. arahan penghantaran"
        />
        <FieldError id="checkout-notes-error">{errors.notes}</FieldError>
      </div>
    </div>
  );
}
