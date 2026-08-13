export function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
