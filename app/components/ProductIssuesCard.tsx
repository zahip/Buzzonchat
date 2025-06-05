import React from "react";

export default function ProductIssuesCard({ issues }: { issues: any[] }) {
  if (!issues || issues.length === 0) return null;
  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-amber-500">⚠️</span> בעיות שזוהו
        </h2>
      </div>
      <div className="p-6 space-y-3">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
          >
            <span
              className={`h-4 w-4 mt-0.5 ${
                issue.severity === "high"
                  ? "text-red-500"
                  : issue.severity === "medium"
                    ? "text-amber-500"
                    : "text-blue-500"
              }`}
            >
              ⚠️
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs">
                  {issue.type === "title"
                    ? "כותרת"
                    : issue.type === "description"
                      ? "תיאור"
                      : "תגיות"}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    issue.severity === "high"
                      ? "bg-red-100 text-red-800"
                      : issue.severity === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {issue.severity === "high"
                    ? "גבוהה"
                    : issue.severity === "medium"
                      ? "בינונית"
                      : "נמוכה"}
                </span>
              </div>
              <p className="text-sm text-gray-700">{issue.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
