import React from "react";
import { Product } from "./types";

export default function ProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="py-2 px-4 text-right"> </th>
            <th className="py-2 px-4 text-right">שם המוצר</th>
            <th className="py-2 px-4 text-right">קטגוריה</th>
            <th className="py-2 px-4 text-right">סטטוס</th>
            <th className="py-2 px-4 text-right">ציון</th>
            <th className="py-2 px-4 text-right">מחיר</th>
            <th className="py-2 px-4 text-right">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <tr
              key={product.id}
              className="border-b last:border-none hover:bg-gray-50"
            >
              <td className="py-2 px-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
              </td>
              <td className="py-2 px-4">
                <div className="font-semibold text-gray-800">
                  {product.name}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.tags?.slice(0, 3).map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {product.tags?.length > 3 && (
                    <span className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs">
                      +{product.tags.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-2 px-4">{product.category}</td>
              <td className="py-2 px-4">
                <span className="bg-green-100 text-green-700 rounded px-2 py-0.5 text-xs font-bold">
                  שופר
                </span>
              </td>
              <td className="py-2 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="bg-green-500"
                      style={{ width: `100%`, height: "100%" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">100</span>
                </div>
              </td>
              <td className="py-2 px-4">
                {product.price} {product.currency}
              </td>
              <td className="py-2 px-4">
                <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 mr-1">
                  אמן
                </button>
                <button className="px-3 py-1 rounded bg-gray-200 text-xs hover:bg-gray-300">
                  פרטים
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
