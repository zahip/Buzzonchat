import React from "react";
import ProductScoreBar from "./ProductScoreBar";
import ProductTags from "./ProductTags";
import { getStatusByScore } from "../utils/productStatus";

export default function ProductMainCard({
  product,
  score,
  optimizationResult,
  onApproveOptimization,
}: {
  product: any;
  score: number;
  optimizationResult: string;
  onApproveOptimization: () => void;
}) {
  const { statusLabel, statusColor } = getStatusByScore(score);
  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden w-48 h-48 flex items-center justify-center">
            {product.featuredImage?.url ? (
              <img
                src={product.featuredImage.url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-5xl text-gray-300">📦</span>
            )}
          </div>
          <div className="mt-4 w-full text-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
          <ProductScoreBar score={score} />
        </div>
        {/* Product Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500">מחיר:</span>
              <span className="text-2xl font-bold text-gray-900">
                {product.priceRangeV2?.minVariantPrice?.amount}{" "}
                {product.priceRangeV2?.minVariantPrice?.currencyCode}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">תגיות:</h3>
            <ProductTags tags={product.tags} />
          </div>
          <div className="mt-4">
            <h3 className="font-medium mb-1">תיאור:</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description || "אין תיאור"}
            </p>
          </div>
        </div>
      </div>
      {/* --- Optimization Result OUTSIDE dialog --- */}
      {optimizationResult && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-right whitespace-pre-wrap text-sm text-gray-800">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-bold">ציון שיפור מה-AI:</span>
            <ProductScoreBar score={score} big />
          </div>
          <b>תוצאה מה-AI:</b>
          <div>{optimizationResult}</div>
          <button
            className="mt-4 bg-green-600 text-white rounded px-4 py-2 font-bold"
            onClick={onApproveOptimization}
          >
            אשר שיפורים
          </button>
        </div>
      )}
    </div>
  );
}
