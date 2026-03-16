import type { ClickLog } from "@/actions/coinActions";

interface ClickHistoryProps {
  history: ClickLog[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClickHistory({ history }: ClickHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-md mt-6">
      <h2 className="text-lg font-bold text-gray-600 mb-2 text-center">📋 がまんのきろく</h2>
      <div className="bg-white/70 rounded-2xl overflow-hidden shadow-inner divide-y divide-yellow-100">
        {history.slice(0, 20).map((log, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2 text-sm">
            <span className="text-gray-700">{formatDate(log.clickedAt)}</span>
            {log.type === "spent" ? (
              <span className="text-pink-500 text-xs font-bold ml-2">つかった</span>
            ) : (
              <span className="text-gray-500 text-xs ml-2 truncate max-w-[140px]">
                {log.location ?? "場所不明"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
