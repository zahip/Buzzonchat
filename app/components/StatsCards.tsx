import React from "react";
import { Product } from "./types";

export default function StatsCards({ products }: { products: Product[] }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📦</span>
          <span className="font-semibold text-blue-900">סה"כ מוצרים</span>
        </div>
        <div className="text-3xl font-bold text-blue-700 mb-1">
          {products.length}
        </div>
      </div>
      <div className="bg-amber-50 rounded-lg p-4 flex flex-col items-center shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⚠️</span>
          <span className="font-semibold text-amber-900">דורשים שיפור</span>
        </div>
        <div className="text-3xl font-bold text-amber-700 mb-1">0</div>
      </div>
      <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">✅</span>
          <span className="font-semibold text-green-900">שופרו</span>
        </div>
        <div className="text-3xl font-bold text-green-700 mb-1">
          {products.length}
        </div>
      </div>
      <div className="bg-indigo-50 rounded-lg p-4 flex flex-col items-center shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⭐</span>
          <span className="font-semibold text-indigo-900">ציון ממוצע</span>
        </div>
        <div className="text-3xl font-bold text-indigo-700 mb-1">100</div>
      </div>
    </section>
  );
}
