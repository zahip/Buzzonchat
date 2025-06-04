import React from "react";
import { Product } from "./types";
import StatsCards from "./StatsCards";
import ProductsTable from "./ProductsTable";

export default function Products({ products }: { products: Product[] }) {
  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full max-w-6xl bg-white rounded-lg shadow p-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">מוצרים</h1>
            <p className="text-gray-600">ניהול ואופטימיזציה של המוצרים שלך</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              הוסף מוצר
            </button>
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              אמן מוצרים
            </button>
          </div>
        </header>
        <StatsCards products={products} />
        <ProductsTable products={products} />
      </div>
    </div>
  );
}
