import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

// דמו לבעיות, סטטוס, ציון
const DEMO = {
  status: "needs_improvement",
  statusLabel: "דורש שיפור",
  statusColor: "bg-red-100 text-red-600",
  score: 42,
  issues: [
    {
      type: "כותרת",
      severity: "בינונית",
      description: "כותרת המוצר חסרה מילות מפתח מחופשות חשובות.",
      color: "bg-amber-100 text-amber-800",
    },
    {
      type: "תיאור",
      severity: "גבוהה",
      description: "תיאור המוצר קצר מדי ולא מסביר את יתרונות המוצר.",
      color: "bg-red-100 text-red-800",
    },
  ],
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const id = params.id;

  const response = await admin.graphql(
    `#graphql
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          featuredImage { url }
          tags
          productType
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
          }
          onlineStoreUrl
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/Product/${id}`,
      },
    },
  );
  const responseJson = await response.json();
  return { product: responseJson.data.product };
};

export default function ProductDetailsPage() {
  const { product } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-lg">⬅️</span>
              חזרה למוצרים
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">פרטי מוצר</h1>
              <p className="text-gray-500">צפייה ועריכת פרטי המוצר</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* טאב גרסה נוכחית/השוואה */}
            <div className="flex border-b mb-6">
              <button className="px-6 py-2 font-bold border-b-2 border-black bg-white">
                גרסה נוכחית
              </button>
              <button className="px-6 py-2 text-gray-500 hover:text-black">
                השוואה
              </button>
            </div>

            {/* כרטיס פרטי מוצר */}
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-xl font-bold mb-6">פרטי המוצר</h2>
              <div className="mb-4">
                <div className="font-bold text-gray-800 mb-1">שם המוצר</div>
                <div className="mb-4">{product.title}</div>
                <div className="font-bold text-gray-800 mb-1">תיאור המוצר</div>
                <div className="mb-4">{product.description || "אין תיאור"}</div>
                <div className="flex gap-8 mb-4">
                  <div>
                    <div className="font-bold text-gray-800 mb-1">מחיר</div>
                    <div>
                      {product.priceRangeV2?.minVariantPrice?.amount}{" "}
                      {product.priceRangeV2?.minVariantPrice?.currencyCode}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 mb-1">קטגוריה</div>
                    <div>{product.productType || "-"}</div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-800 mb-1">תגיות</div>
                  <div className="flex flex-wrap gap-2">
                    {product.tags?.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 rounded px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* בעיות שזוהו */}
            <div className="bg-white rounded-xl shadow p-8">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-amber-500 text-xl">⚠️</span>
                בעיות שזוהו
              </h2>
              <div className="space-y-3">
                {DEMO.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${issue.color} border-amber-200`}
                  >
                    <span className="font-bold">{issue.type}</span>
                    <span className="bg-yellow-200 text-yellow-800 rounded px-2 py-0.5 text-xs font-bold">
                      {issue.severity}
                    </span>
                    <span className="text-gray-700">{issue.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-lg overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
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
              <div className="w-full text-center mb-4">
                <div className="font-bold text-lg mb-1">סטטוס מוצר</div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${DEMO.statusColor}`}
                >
                  {DEMO.statusLabel}
                </span>
              </div>
              <div className="w-full text-center mb-4">
                <div className="font-bold text-lg mb-1">ציון נראות</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-red-600 font-bold text-xl">
                    {DEMO.score}
                  </span>
                  <span className="text-gray-700">/100</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-2 mb-1">
                  <div
                    className="h-2 rounded bg-red-500"
                    style={{ width: `${DEMO.score}%` }}
                  />
                </div>
              </div>
              <button className="w-full mt-2 px-4 py-2 bg-black text-white rounded font-bold flex items-center justify-center gap-2">
                <span>✏️</span>
                ערוך פרטים
              </button>
              <button className="w-full mt-2 px-4 py-2 border border-gray-300 rounded font-bold flex items-center justify-center gap-2">
                <span>⚡</span>
                אמן מוצר
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
