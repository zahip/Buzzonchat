import React from "react";

export default function ProductScoreBar({
  score,
  big,
}: {
  score: number;
  big?: boolean;
}) {
  if (big) {
    return (
      <span
        className={`flex items-center justify-center rounded-full font-bold text-lg w-12 h-12 border-4 ${
          score >= 80
            ? "border-green-400 bg-green-50 text-green-700"
            : score >= 60
              ? "border-yellow-400 bg-yellow-50 text-yellow-700"
              : "border-red-400 bg-red-50 text-red-700"
        }`}
        title="ציון שיפור"
      >
        {score}
      </span>
    );
  }
  return (
    <div className="w-full text-center mt-2">
      <div className="font-bold text-lg mb-1">ציון נראות</div>
      <div className="flex items-center justify-center gap-2">
        <span
          className={`font-bold text-xl ${
            score >= 80
              ? "text-green-700"
              : score >= 60
                ? "text-yellow-700"
                : "text-red-600"
          }`}
        >
          {score}
        </span>
        <span className="text-gray-700">/100</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded mt-2 mb-1">
        <div
          className={`h-2 rounded ${
            score >= 80
              ? "bg-green-500"
              : score >= 60
                ? "bg-yellow-400"
                : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
