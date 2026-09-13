"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createExpense } from "@/app/dashboard/finance/actions";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  dayKeyKL,
  hasExpenseErrors,
  validateExpenseInput,
  type ExpenseFieldErrors,
} from "@/lib/finance";

export function ExpenseForm() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("ingredients");
  const [expenseDate, setExpenseDate] = useState(dayKeyKL());
  const [fieldErrors, setFieldErrors] = useState<ExpenseFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const check = validateExpenseInput({
      amount,
      description,
      category,
      expenseDate,
    });
    setFieldErrors(check.errors);
    setMessage(null);
    if (hasExpenseErrors(check.errors)) return;

    setSubmitting(true);
    try {
      const result = await createExpense({
        amount,
        description,
        category,
        expenseDate,
      });
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setMessage(result.message);
        return;
      }
      setAmount("");
      setDescription("");
      router.refresh();
    } catch {
      setMessage("Could not save the expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-panel border border-cocoa-900/10 bg-white p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="expense-amount">
            Amount (RM) <span className="text-brand-700">*</span>
          </Label>
          <Input
            id="expense-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.amount)}
            aria-describedby={
              fieldErrors.amount ? "expense-amount-error" : undefined
            }
            placeholder="0.00"
          />
          <FieldError id="expense-amount-error">{fieldErrors.amount}</FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="expense-date">
            Date <span className="text-brand-700">*</span>
          </Label>
          <Input
            id="expense-date"
            type="date"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.expenseDate)}
            aria-describedby={
              fieldErrors.expenseDate ? "expense-date-error" : undefined
            }
          />
          <FieldError id="expense-date-error">
            {fieldErrors.expenseDate}
          </FieldError>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="expense-category">
            Category <span className="text-brand-700">*</span>
          </Label>
          <select
            id="expense-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(fieldErrors.category)}
            aria-describedby={
              fieldErrors.category ? "expense-category-error" : undefined
            }
            className="h-12 w-full rounded-xl border border-cocoa-900/15 bg-white px-4 text-base text-cocoa-900 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10 disabled:opacity-60"
          >
            {EXPENSE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {EXPENSE_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
          <FieldError id="expense-category-error">
            {fieldErrors.category}
          </FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="expense-description">
            Description <span className="text-brand-700">*</span>
          </Label>
          <Input
            id="expense-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={submitting}
            maxLength={200}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description ? "expense-description-error" : undefined
            }
            placeholder="cth. Chili, sugar, gas refill"
          />
          <FieldError id="expense-description-error">
            {fieldErrors.description}
          </FieldError>
        </div>
      </div>

      {message ? (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-5">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Saving..." : "Add expense"}
        </Button>
      </div>
    </form>
  );
}
