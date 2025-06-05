import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import ProductMainCard from "../components/ProductMainCard";
import ProductVersionHistory from "../components/ProductVersionHistory";
import ProductDescriptionCard from "../components/ProductDescriptionCard";
import ProductIssuesCard from "../components/ProductIssuesCard";

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

  // טען את המוצר
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
  const product = responseJson.data.product;

  // טען את היסטוריית הגרסאות מה-DB
  // (השתמש ב-fetch פנימי ל-API או ישירות ל-Prisma אם אפשר)
  const url = new URL(request.url);
  url.pathname = "/api/product-version";
  url.search = `?productId=${product.id}`;
  const historyRes = await fetch(url.toString(), {
    headers: { Cookie: request.headers.get("Cookie") || "" },
  });
  const historyData = await historyRes.json();
  let versionHistory = [];
  if (historyData.versions) {
    versionHistory = historyData.versions.map((v: any) => ({
      ...v,
      tags: v.tags.split(","),
      date: v.createdAt ? new Date(v.createdAt).toLocaleString("he-IL") : "",
    }));
  }
  return { product, versionHistory };
};

export default function ProductDetailsPage() {
  const { product: initialProduct, versionHistory: initialVersionHistory } =
    useLoaderData<typeof loader>();
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
  // --- Product State for Editing ---
  const [product, setProduct] = useState(initialProduct);
  // --- Version History State ---
  const [versionHistory, setVersionHistory] = useState<ProductVersion[]>(
    initialVersionHistory,
  );
  // --- Score State ---
  const [score, setScore] = useState(
    initialVersionHistory.length > 0
      ? initialVersionHistory[initialVersionHistory.length - 1].score
      : 42,
  );
  // --- Loading State ---
  if (!product || !versionHistory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="animate-spin text-4xl">⏳</span>
      </div>
    );
  }

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
    prompt += `5. ציון מספרי (0-100) לשיפור שביצעת (רק את המספר)\n`;
    prompt += `תחזיר לי תשובה בעברית בלבד\n`;
    return prompt;
  };

  // --- Parse AI Result ---
  function parseOptimizationResult(result: string): {
    title: string;
    description: string;
    tags: string[];
    score: number;
  } {
    let title = "";
    let description = "";
    let tags: string[] = [];
    let score: number | null = null;
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
      // ציון
      if (line.startsWith("5.") || line.includes("ציון")) {
        // מצא את כל המספרים בשורה, קח את הגבוה ביותר (או האחרון)
        const matches = line.match(/([0-9]{1,3})/g);
        if (matches && matches.length > 0) {
          score = Math.max(...matches.map(Number));
        }
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
      score: score ?? 0,
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
    setScore(parsed.score); // עדכן את ציון הנראות
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
        score: Number(parsed.score),
        status: "מוצעת",
      }),
    });
    // עדכן גם את המוצר בשופיפיי
    const cleanTags = Array.isArray(parsed.tags)
      ? parsed.tags.map((t: string) => t.trim()).filter(Boolean)
      : typeof parsed.tags === "string"
        ? (parsed.tags as string)
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];
    const shopifyRes = await fetch("/api/update-shopify-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        title: parsed.title,
        description: parsed.description,
        tags: cleanTags,
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
      // עדכן את ציון הנראות לפי הגרסה האחרונה
      if (data.versions.length > 0) {
        setScore(data.versions[data.versions.length - 1].score);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded shadow"
            onClick={() => setShowOptimizationDialog(true)}
          >
            <span className="text-xl">⚡</span>
            אמן מוצר
          </button>
        </div>

        {/* Product Main Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ProductMainCard
              product={product}
              score={score}
              optimizationResult={optimizationResult}
              onApproveOptimization={handleApproveOptimization}
            />
            <ProductDescriptionCard description={product.description} />
            <ProductIssuesCard issues={product.issues} />
          </div>
          {/* Sidebar: היסטוריית גרסאות */}
          <div className="space-y-6">
            <ProductVersionHistory versionHistory={versionHistory} />
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
