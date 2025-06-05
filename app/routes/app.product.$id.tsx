import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState, useEffect } from "react";

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

type ProductVersion = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  score: number;
  status: "מקורית" | "מוצעת" | "נוכחית";
  date: string; // תאריך יצירה
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
  const { product: initialProduct } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  // --- Optimization Dialog State ---
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState({
    tone: "professional",
    target_audience: "",
    detail_level: "medium",
    additional_keywords: "",
    focus_areas: ["title", "description", "tags"],
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [optimizationResult, setOptimizationResult] = useState("");
  // --- New: Product State for Editing ---
  const [product, setProduct] = useState(initialProduct);

  // --- Version History State ---
  const [versionHistory, setVersionHistory] = useState<ProductVersion[]>([]);

  // --- Load version history from DB ---
  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(`/api/product-version?productId=${product.id}`);
      const data = await res.json();
      if (data.versions) {
        setVersionHistory(
          data.versions.map((v: any) => ({
            ...v,
            tags: v.tags.split(","),
            date: v.createdAt
              ? new Date(v.createdAt).toLocaleString("he-IL")
              : "",
          })),
        );
      }
    };
    fetchHistory();
  }, [product.id]);

  // --- Prompt Generation ---
  const generateOptimizationPrompt = () => {
    let prompt = `אתה מומחה באופטימיזציה של מוצרים עבור חיפושים בבינה מלאכותית ומנועי חיפוש.\n\n`;
    prompt += `הגדרות האופטימיזציה:\n`;
    prompt += `- גוון קול: ${optimizationSettings.tone === "professional" ? "מקצועי" : optimizationSettings.tone === "friendly" ? "ידידותי" : optimizationSettings.tone === "marketing" ? "שיווקי" : "טכני"}\n`;
    prompt += `- קהל יעד: ${optimizationSettings.target_audience || "כללי"}\n`;
    prompt += `- רמת פירוט: ${optimizationSettings.detail_level === "short" ? "קצר" : optimizationSettings.detail_level === "medium" ? "בינוני" : "מפורט"}\n`;
    if (optimizationSettings.additional_keywords) {
      prompt += `- מילות מפתח נוספות לשילוב: ${optimizationSettings.additional_keywords}\n`;
    }
    prompt += `- שטחי מיקוד: ${optimizationSettings.focus_areas.join(", ")}\n\n`;
    prompt += `מוצר לשיפור:\n`;
    prompt += `שם נוכחי: ${product.title}\n`;
    prompt += `תיאור נוכחי: ${product.description}\n`;
    prompt += `תגיות נוכחיות: ${product.tags.join(", ")}\n`;
    prompt += `מחיר: ${product.priceRangeV2?.minVariantPrice?.amount} ${product.priceRangeV2?.minVariantPrice?.currencyCode}\n`;
    prompt += `קטגוריה: ${product.productType}\n\n`;
    prompt += `אנא ספק:\n`;
    if (optimizationSettings.focus_areas.includes("title")) {
      prompt += `1. כותרת משופרת\n`;
    }
    if (optimizationSettings.focus_areas.includes("description")) {
      prompt += `2. תיאור משופר\n`;
    }
    if (optimizationSettings.focus_areas.includes("tags")) {
      prompt += `3. תגיות משופרות\n`;
    }
    prompt += `4. הסבר קצר מה שופר ולמה\n`;
    prompt += `תחזיר לי תשובה בעברית בלבד\n`;
    return prompt;
  };

  // --- Parse AI Result ---
  function parseOptimizationResult(result: string): {
    title: string;
    description: string;
    tags: string[];
  } {
    let title = "";
    let description = "";
    let tags: string[] = [];
    let currentField: "title" | "description" | "tags" | null = null;

    const lines = result.split(/\r?\n/);

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith("1.") || line.includes("כותרת משופרת")) {
        currentField = "title";
        title = line.replace(/1\.\s*כותרת משופרת[:：]?\s*/, "").trim();
        continue;
      }
      if (line.startsWith("2.") || line.includes("תיאור משופר")) {
        currentField = "description";
        description = line.replace(/2\.\s*תיאור משופר[:：]?\s*/, "").trim();
        continue;
      }
      if (line.startsWith("3.") || line.includes("תגיות משופרות")) {
        currentField = "tags";
        const tagsLine = line
          .replace(/3\.\s*תגיות משופרות[:：]?\s*/, "")
          .trim();
        tags = tagsLine
          .split(/,|，/)
          .map((t) => t.trim())
          .filter(Boolean);
        continue;
      }
      // עצור תגיות אם מתחיל שדה חדש (4. או "הסבר")
      if (
        currentField === "tags" &&
        (line.startsWith("4.") ||
          line.startsWith("**4.") ||
          line.includes("הסבר"))
      ) {
        currentField = null;
        continue;
      }
      // המשך שורה קודמת
      if (currentField === "title") {
        title += " " + line;
      } else if (currentField === "description") {
        description += " " + line;
      } else if (currentField === "tags") {
        tags = tags.concat(
          line
            .split(/,|，/)
            .map((t) => t.trim())
            .filter(Boolean),
        );
      }
    }

    return {
      title: title || "",
      description: description || "",
      tags: tags.length ? tags : [],
    };
  }

  // --- Run Optimization ---
  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationResult("");
    try {
      const prompt = generateOptimizationPrompt();
      const res = await fetch("/api/optimize-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          productId: product.id,
          settings: optimizationSettings,
        }),
      });
      const data = await res.json();
      setOptimizationResult(data.result);
      setShowOptimizationDialog(false);
    } catch (e) {
      alert("שגיאה באופטימיזציה");
    } finally {
      setIsOptimizing(false);
    }
  };

  // --- Approve Optimization ---
  const handleApproveOptimization = async () => {
    if (!optimizationResult) return;
    const parsed = parseOptimizationResult(optimizationResult);
    setProduct({
      ...product,
      title: parsed.title,
      description: parsed.description,
      tags: parsed.tags,
    });
    setOptimizationResult("");
    // שמור את הגרסה ב-DB
    await fetch("/api/product-version", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        title: parsed.title,
        description: parsed.description,
        tags: parsed.tags,
        score: 95, // דמו
        status: "מוצעת",
      }),
    });
    // עדכן גם את המוצר בשופיפיי
    const shopifyRes = await fetch("/api/update-shopify-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        title: parsed.title,
        description: parsed.description,
        tags: Array.isArray(parsed.tags)
          ? parsed.tags
          : typeof parsed.tags === "string"
            ? (parsed.tags as string)
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [],
      }),
    });
    if (!shopifyRes.ok) {
      const err = await shopifyRes.json();
      alert(
        "שגיאה בעדכון המוצר בשופיפיי: " +
          (err.error ? JSON.stringify(err.error) : shopifyRes.status),
      );
    }
    // טען מחדש את ההיסטוריה
    const res = await fetch(`/api/product-version?productId=${product.id}`);
    const data = await res.json();
    if (data.versions) {
      setVersionHistory(
        data.versions.map((v: any) => ({
          ...v,
          tags: v.tags.split(","),
          date: v.createdAt
            ? new Date(v.createdAt).toLocaleString("he-IL")
            : "",
        })),
      );
    }
  };

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
            {/* היסטוריית גרסאות */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-xl">⏲️</span> היסטוריית גרסאות
              </h2>
              <div className="space-y-3">
                {versionHistory.map((ver) => (
                  <div
                    key={ver.id}
                    className={`p-4 rounded-lg border flex flex-col gap-2 ${ver.status === "נוכחית" ? "border-green-300 bg-green-50" : ver.status === "מקורית" ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">גרסה {ver.id}</span>
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
                      <span className="text-gray-700">
                        ציון: <b>{ver.score}</b>
                      </span>
                      <span className="truncate max-w-xs text-gray-600">
                        {ver.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
              {/* --- Optimization Result OUTSIDE dialog --- */}
              {optimizationResult && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-right whitespace-pre-wrap text-sm text-gray-800">
                  <b>תוצאה מה-AI:</b>
                  <div>{optimizationResult}</div>
                  <button
                    className="mt-4 bg-green-600 text-white rounded px-4 py-2 font-bold"
                    onClick={handleApproveOptimization}
                  >
                    אשר שיפורים
                  </button>
                </div>
              )}
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
              <button
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded font-bold flex items-center justify-center gap-2"
                onClick={() => setShowOptimizationDialog(true)}
              >
                <span>⚡</span>
                אמן מוצר
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* דיאלוג אופטימיזציה */}
      {showOptimizationDialog && (
        <dialog
          open
          className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg border shadow-lg p-6 bg-white z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <form method="dialog" className="space-y-6">
            <div className="flex items-center gap-2 text-xl font-bold mb-2">
              <span>⚙️</span>
              הגדרות אופטימיזציה
            </div>
            <div className="text-gray-500 mb-4">
              התאם את הגדרות האופטימיזציה עבור המוצר "{product.title}"
            </div>
            {/* גוון קול */}
            <div className="space-y-2">
              <label>גוון קול</label>
              <select
                value={optimizationSettings.tone}
                onChange={(e) =>
                  setOptimizationSettings({
                    ...optimizationSettings,
                    tone: e.target.value,
                  })
                }
                className="w-full border rounded p-2"
              >
                <option value="professional">מקצועי ועניני</option>
                <option value="friendly">ידידותי ונגיש</option>
                <option value="marketing">שיווקי ומושך</option>
                <option value="technical">טכני ומפורט</option>
              </select>
            </div>
            {/* קהל יעד */}
            <div className="space-y-2">
              <label>קהל יעד</label>
              <input
                type="text"
                placeholder="למשל: צעירים, מקצועיות, משפחות וכו'"
                value={optimizationSettings.target_audience}
                onChange={(e) =>
                  setOptimizationSettings({
                    ...optimizationSettings,
                    target_audience: e.target.value,
                  })
                }
                className="w-full border rounded p-2"
              />
            </div>
            {/* רמת פירוט */}
            <div className="space-y-2">
              <label>רמת פירוט</label>
              <select
                value={optimizationSettings.detail_level}
                onChange={(e) =>
                  setOptimizationSettings({
                    ...optimizationSettings,
                    detail_level: e.target.value,
                  })
                }
                className="w-full border rounded p-2"
              >
                <option value="short">קצר וחד</option>
                <option value="medium">בינוני ומאוזן</option>
                <option value="detailed">מפורט ועשיר</option>
              </select>
            </div>
            {/* מילות מפתח נוספות */}
            <div className="space-y-2">
              <label>מילות מפתח נוספות לשילוב</label>
              <textarea
                placeholder="הכנס מילות מפתח שתרצה שה-AI יכלול (מופרדות בפסיקים)"
                value={optimizationSettings.additional_keywords}
                onChange={(e) =>
                  setOptimizationSettings({
                    ...optimizationSettings,
                    additional_keywords: e.target.value,
                  })
                }
                rows={3}
                className="w-full border rounded p-2"
              />
            </div>
            {/* שטחי מיקוד */}
            <div className="space-y-2">
              <label>מה לשפר?</label>
              <div className="space-y-2">
                {[
                  { id: "title", label: "כותרת המוצר" },
                  { id: "description", label: "תיאור המוצר" },
                  { id: "tags", label: "תגיות המוצר" },
                ].map((area) => (
                  <div key={area.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={area.id}
                      checked={optimizationSettings.focus_areas.includes(
                        area.id,
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptimizationSettings({
                            ...optimizationSettings,
                            focus_areas: [
                              ...optimizationSettings.focus_areas,
                              area.id,
                            ],
                          });
                        } else {
                          setOptimizationSettings({
                            ...optimizationSettings,
                            focus_areas:
                              optimizationSettings.focus_areas.filter(
                                (id) => id !== area.id,
                              ),
                          });
                        }
                      }}
                    />
                    <label htmlFor={area.id}>{area.label}</label>
                  </div>
                ))}
              </div>
            </div>
            {/* הצגת פרומפט */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label>צפה בפרומפט שיישלח ל-AI</label>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-sm"
                  onClick={() => {
                    setGeneratedPrompt(generateOptimizationPrompt());
                    setShowPrompt(!showPrompt);
                  }}
                >
                  📋 {showPrompt ? "הסתר פרומפט" : "הצג פרומפט"}
                </button>
              </div>
              {showPrompt && (
                <div className="bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap text-gray-700">
                    {generatedPrompt}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button
                type="button"
                className="border rounded px-4 py-2"
                onClick={() => setShowOptimizationDialog(false)}
                disabled={isOptimizing}
              >
                ביטול
              </button>
              <button
                type="button"
                className="bg-green-600 text-white rounded px-4 py-2 flex items-center gap-2"
                onClick={handleRunOptimization}
                disabled={
                  isOptimizing || optimizationSettings.focus_areas.length === 0
                }
              >
                {isOptimizing ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <span>⚡</span>
                )}
                הפעל אופטימיזציה
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}
