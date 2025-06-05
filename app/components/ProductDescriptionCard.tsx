import React from "react";

export default function ProductDescriptionCard({
  description,
}: {
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">תיאור המוצר</h2>
      </div>
      <div className="p-6">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {description || "אין תיאור"}
        </p>
      </div>
    </div>
  );
}
