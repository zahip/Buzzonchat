import { authenticate } from "../shopify.server";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Fetch up to 8 products for the dashboard
  const response = await admin.graphql(`
    {
      products(first: 8) {
        nodes {
          id
          title
          description
          featuredImage {
            url
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `);

  const { data } = await response.json();
  return { products: data.products.nodes };
};

export default function Dashboard() {
  const { products } = useLoaderData<typeof loader>();

  // Demo stats for now (can be made dynamic)
  const demoStats = [
    {
      title: "מוצרים נסרקו",
      value: products.length,
      icon: "📊",
      trendLabel: "במנוי הנוכחי שלך",
      trendValue: "מוגבל",
      color: "blue",
    },
    {
      title: "דורשים שיפור",
      value: 0,
      icon: "⚠️",
      trendLabel: "משפיע על נראות",
      trendValue: "נמוכה",
      color: "amber",
    },
    {
      title: "שופרו",
      value: 0,
      icon: "📈",
      trendLabel: "העלאה בנראות",
      trendValue: "+80%",
      color: "green",
    },
    {
      title: "מוצרים בחנות",
      value: products.length,
      icon: "🛒",
      trendLabel: "אחוז שנסרק",
      trendValue: "100%",
      color: "indigo",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center"
      dir="rtl"
    >
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">שלום, משתמש יקר</h1>
            <p className="text-gray-600">
              ברוך הבא לדשבורד האופטימיזציה לחנות שלך
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              רענן נתונים
            </button>
            <Link
              to="/app/products"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              ניהול מוצרים
            </Link>
            <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              דף הנחיתה
            </button>
          </div>
        </header>
        {/* סטטיסטיקות */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {demoStats.map((stat) => (
            <div
              key={stat.title}
              className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="font-semibold text-blue-900">
                  {stat.title}
                </span>
              </div>
              <div className="text-3xl font-bold text-blue-700 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                <span>{stat.trendLabel}:</span>
                <span
                  className={
                    stat.color === "blue"
                      ? "text-blue-600 font-bold ml-1"
                      : stat.color === "amber"
                        ? "text-amber-500 font-bold ml-1"
                        : stat.color === "green"
                          ? "text-green-600 font-bold ml-1"
                          : stat.color === "indigo"
                            ? "text-indigo-600 font-bold ml-1"
                            : "ml-1 font-bold"
                  }
                >
                  {stat.trendValue}
                </span>
              </div>
            </div>
          ))}
        </section>
        {/* חבילה שנתית לאוטומציה */}
        <section className="bg-yellow-50 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between mb-8 gap-6 shadow">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg font-bold">
                סוכן AI אוטומטי - פתרון מתקדם
              </h3>
              <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">
                מומלץ לחנויות גדולות
              </span>
            </div>
            <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-700">
              <li>
                🤖 <b>סוכן AI חכם</b> שעוקב אחר השינויים באלגוריתמים
              </li>
              <li>
                🔄 <b>עדכון אוטומטי</b> של מוצרים שכבר שופרו כשיש צורך
              </li>
              <li>
                📈 <b>ניטור ביצועים</b> ושיפור רציף של הנראות
              </li>
              <li>
                📊 <b>דוחות שבועיים מפורטים</b> על שיפורים ותוצאות
              </li>
              <li>
                ⚡ <b>עדכון מיידי</b> כשמוצרים חדשים נוספים לחנות
              </li>
            </ul>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-yellow-700">₪297</span>
              <span className="text-sm text-gray-700">/חודש</span>
              <span className="text-xs text-gray-500">
                + ₪0.5 לכל עדכון מוצר
                <br />
                <span className="text-gray-400">
                  (חיסכון של 75% מעדכון ידני)
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button className="px-6 py-2 rounded bg-yellow-400 text-yellow-900 font-bold hover:bg-yellow-500">
              הפעל סוכן AI
            </button>
            <p className="text-xs text-gray-500">
              ניתן לבטל בכל עת • ללא התחייבות • אחריות 30 יום
            </p>
          </div>
        </section>
        {/* הוספת מוצר */}
        <section className="bg-white rounded-lg p-6 mb-8 shadow flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">הוסף מוצר חדש לסריקה</h3>
            <p className="text-gray-600 mb-2">
              הדבק קישור למוצר מהחנות שלך והמערכת תוסיף אותו לסריקה
            </p>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input
              className="border rounded px-3 py-2 w-full md:w-64"
              placeholder="הכנס כתובת URL של מוצר..."
            />
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              הוסף
            </button>
          </form>
        </section>
        {/* מוצרים אחרונים */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">מוצרים אחרונים</h2>
            <button className="text-blue-600 hover:underline">
              צפה בכל המוצרים
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {products.length > 0 ? (
              products.slice(0, 4).map((product: any) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
                >
                  <img
                    src={
                      product.featuredImage?.url ||
                      "https://placehold.co/400x300?text=No+Image"
                    }
                    alt={product.title}
                    className="w-32 h-32 object-cover rounded mb-2 border"
                  />
                  <div className="w-full text-center">
                    <div className="font-semibold text-gray-800">
                      {product.title}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {product.description}
                    </div>
                    <div className="text-sm font-bold text-blue-700">
                      {product.priceRangeV2?.minVariantPrice?.amount}{" "}
                      {product.priceRangeV2?.minVariantPrice?.currencyCode}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                אין מוצרים להצגה
              </div>
            )}
          </div>
        </section>
        {/* סטטוס אופטימיזציה */}
        <section className="bg-green-50 rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">סטטוס אופטימיזציה</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold">נראות כללית בצ'אטים</span>
              <span className="text-green-700 font-bold">
                50% מהמוצרים אופטימלים
              </span>
              <div className="flex-1 h-3 bg-green-100 rounded overflow-hidden">
                <div className="bg-green-500 h-3" style={{ width: "50%" }} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">מוצרים הדורשים שיפור</span>
              <span className="text-amber-600 font-bold">0 מוצרים</span>
              <div className="flex-1 h-3 bg-amber-100 rounded overflow-hidden">
                <div className="bg-amber-400 h-3" style={{ width: "0%" }} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">מוצרים שעברו אופטימיזציה</span>
              <span className="text-blue-700 font-bold">0 מוצרים</span>
              <div className="flex-1 h-3 bg-blue-100 rounded overflow-hidden">
                <div className="bg-blue-500 h-3" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
