"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <div className="flex gap-1 bg-[var(--card)] border border-[var(--border-color)] rounded-lg p-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            active === tab.id
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
