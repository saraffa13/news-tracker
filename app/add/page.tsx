"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JsonInput from "@/components/JsonInput";
import FileUpload from "@/components/FileUpload";
import TabNav from "@/components/TabNav";
import { useToast } from "@/components/Toast";

const tabs = [
  { id: "paste", label: "Paste JSON" },
  { id: "upload", label: "Upload .json" },
];

export default function AddNewsPage() {
  const [activeTab, setActiveTab] = useState("paste");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (jsonStr: string) => {
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      showToast("Invalid JSON — check for syntax errors", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();

      if (res.status === 409) {
        const replace = window.confirm(
          "Data for this date already exists. Replace it?"
        );
        if (replace) {
          const putRes = await fetch(`/api/news/${parsed.date}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed),
          });
          if (putRes.ok) {
            showToast("News updated successfully!", "success");
            router.push(`/day/${parsed.date}`);
          } else {
            showToast("Failed to update news", "error");
          }
        }
      } else if (res.ok) {
        showToast("News saved successfully!", "success");
        router.push(`/day/${data.date}`);
      } else {
        showToast(data.error || "Failed to save news", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error — check your connection", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Add News</h1>
      <p className="text-[var(--text-secondary)] text-sm mb-6">
        Paste or upload your daily news JSON to save it.
      </p>

      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "paste" ? (
          <JsonInput onSubmit={handleSubmit} loading={loading} />
        ) : (
          <FileUpload onSubmit={handleSubmit} loading={loading} />
        )}
      </div>
    </div>
  );
}
