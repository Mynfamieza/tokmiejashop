"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertIcon, CheckIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "error" | "success";
type FieldErrors = { email?: string; password?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) errors.email = "Sila masukkan emel.";
    else if (!EMAIL_PATTERN.test(trimmedEmail))
      errors.email = "Format emel tidak sah.";

    if (!password) errors.password = "Sila masukkan kata laluan.";
    else if (password.length < 6)
      errors.password = "Kata laluan sekurang-kurangnya 6 aksara.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("idle");
      setMessage(null);
      return;
    }

    if (!configured) {
      setStatus("error");
      setMessage(
        "Supabase belum dikonfigurasi. Tetapkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY dalam .env.local.",
      );
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setStatus("error");
        setMessage(`Log masuk gagal: ${error.message}`);
        return;
      }

      setStatus("success");
      setMessage("Log masuk berjaya. Membuka papan pemuka...");
      setPassword("");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Ralat tidak dijangka semasa log masuk.",
      );
    }
  }

  const isLoading = status === "loading";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-card border border-cocoa-900/10 bg-white p-6 shadow-soft sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Emel</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="pemilik@tokmieja.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          disabled={isLoading}
        />
        <FieldError>{fieldErrors.email}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Kata laluan</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Masukkan kata laluan"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            disabled={isLoading}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"
            }
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-cocoa-500 transition hover:text-cocoa-800"
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <FieldError>{fieldErrors.password}</FieldError>
      </div>

      {status === "error" && message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      ) : null}

      {status === "success" && message ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Memproses...
          </>
        ) : (
          "Log masuk"
        )}
      </Button>

      <p className="text-center text-xs text-cocoa-500">
        Untuk pemilik kedai sahaja. Akaun pelanggan tidak disokong lagi.
      </p>
    </form>
  );
}
