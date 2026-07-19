export default function Pagination({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;

  const nums: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-1 py-4 text-sm">
      <p className="text-muted">
        Page {page} of {pages} &middot; {total} total
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-md border border-border px-2.5 py-1.5 text-ink transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        {start > 1 && <span className="px-1 text-muted">&hellip;</span>}
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
              n === page ? 'bg-primary text-primary-foreground' : 'text-ink hover:bg-bg'
            }`}
          >
            {n}
          </button>
        ))}
        {end < pages && <span className="px-1 text-muted">&hellip;</span>}
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          className="rounded-md border border-border px-2.5 py-1.5 text-ink transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
