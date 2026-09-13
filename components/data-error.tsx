export function DataError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
      We could not load data from Supabase: {message}
    </div>
  );
}
