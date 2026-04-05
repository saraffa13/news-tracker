import Link from "next/link";
import type { DailyNewsSummary } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DateCard({ data }: { data: DailyNewsSummary }) {
  return (
    <Link href={`/day/${data.date}`}>
      <div className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5 hover:border-[var(--accent)] transition-colors cursor-pointer group">
        <h3 className="text-lg font-semibold group-hover:text-[var(--accent)] transition-colors">
          {formatDate(data.date)}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {data.newspaper}
        </p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-[var(--accent)] font-medium">
            {data.articleCount} article{data.articleCount !== 1 ? "s" : ""}
          </span>
          <span className="text-[var(--text-secondary)]">
            {data.wordCount} word{data.wordCount !== 1 ? "s" : ""} learned
          </span>
        </div>
      </div>
    </Link>
  );
}
