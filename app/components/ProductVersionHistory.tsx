import React from "react";
import { getStatusByScore } from "../utils/productStatus";

export default function ProductVersionHistory({
  versionHistory,
}: {
  versionHistory: any[];
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="text-xl">⏲️</span> היסטוריית גרסאות
      </h2>
      <div className="space-y-3">
        {versionHistory.map((ver) => {
          const { statusLabel, statusColor } = getStatusByScore(ver.score);
          return (
            <div
              key={ver.id}
              className={`p-4 rounded-lg border flex flex-col gap-2 ${ver.score >= 80 ? "border-green-300 bg-green-50" : ver.score >= 60 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor}`}
                >
                  {statusLabel}
                </span>
                {ver.status === "מקורית" && (
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                    מקורית
                  </span>
                )}
                {ver.status === "נוכחית" && (
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">
                    נוכחית
                  </span>
                )}
                {ver.status === "מוצעת" && (
                  <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-bold">
                    מוצעת
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {ver.date}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`flex items-center justify-center rounded-full font-bold text-lg w-12 h-12 border-4 ${ver.score >= 80 ? "border-green-400 bg-green-50 text-green-700" : ver.score >= 60 ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-red-400 bg-red-50 text-red-700"}`}
                  title="ציון שיפור"
                >
                  {ver.score}
                </span>
                <span className="truncate max-w-xs text-gray-600">
                  {ver.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
