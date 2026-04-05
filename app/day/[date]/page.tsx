"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import TabNav from "@/components/TabNav";
import ArticleCard from "@/components/ArticleCard";
import WordCard from "@/components/WordCard";
import { CardSkeleton } from "@/components/Skeleton";
import type { DailyNewsInput, Article, DifficultWord } from "@/types";

const tabs = [
  { id: "all", label: "All News" },
  { id: "original", label: "Original Articles" },
  { id: "explained", label: "Explained" },
  { id: "vocabulary", label: "Vocabulary" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DayViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const date = params.date as string;
  const highlightArticle = searchParams.get("article") || undefined;

  const [data, setData] = useState<DailyNewsInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetch(`/api/news/${date}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    if (highlightArticle && data) {
      setTimeout(() => {
        document
          .getElementById(`article-${highlightArticle}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }, [highlightArticle, data]);

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">No data for {date}</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          This date doesn&apos;t have any news entries yet.
        </p>
        <Link
          href="/add"
          className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm"
        >
          Add News
        </Link>
      </div>
    );
  }

  const allWords: { word: DifficultWord; article: Article }[] = [];
  for (const article of data.articles) {
    for (const w of article.difficult_words) {
      allWords.push({ word: w, article });
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{formatDate(date)}</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          {data.newspaper} &middot; {data.articles.length} articles &middot;{" "}
          {allWords.length} words
        </p>
      </div>

      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-6">
        {activeTab === "all" &&
          data.articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              highlightId={highlightArticle}
            />
          ))}

        {activeTab === "original" &&
          data.articles.map((article) => (
            <div
              key={article.id}
              className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <h2 className="text-xl font-bold flex-1">{article.title}</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent)] bg-opacity-15 text-[var(--accent)] font-medium">
                  {article.category}
                </span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {article.original_text}
              </div>
            </div>
          ))}

        {activeTab === "explained" &&
          data.articles.map((article) => (
            <div
              key={article.id}
              className="rounded-xl bg-[var(--card)] border border-[var(--border-color)] p-5 sm:p-6"
            >
              <h2 className="text-xl font-bold mb-2">{article.title}</h2>
              <p className="text-sm italic text-[var(--text-secondary)] mb-4">
                {article.one_line_summary}
              </p>
              <div className="rounded-lg bg-[var(--bg)] p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {article.explanation}
              </div>
            </div>
          ))}

        {activeTab === "vocabulary" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {allWords.map(({ word, article }, idx) => (
              <WordCard
                key={`${word.word}-${idx}`}
                word={word}
                articleTitle={article.title}
                articleId={article.id}
                onArticleClick={() => {
                  setActiveTab("all");
                  setTimeout(() => {
                    document
                      .getElementById(`article-${article.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 100);
                }}
              />
            ))}
            {allWords.length === 0 && (
              <p className="text-[var(--text-secondary)] col-span-2 text-center py-8">
                No vocabulary words for this day.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
