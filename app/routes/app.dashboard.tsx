import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import styles from "./_index/styles.module.css";
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
    <div className={styles.dashboardWrapper} dir="rtl">
      <div className={styles.dashboardContainer}>
        <header className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>שלום, משתמש יקר</h1>
            <p className={styles.dashboardSubtitle}>
              ברוך הבא לדשבורד האופטימיזציה לחנות שלך
            </p>
          </div>
          <div className={styles.dashboardActions}>
            <button className={styles.actionButton}>רענן נתונים</button>
            <button className={styles.actionButtonPrimary}>ניהול מוצרים</button>
            <button className={styles.actionButton}>דף הנחיתה</button>
          </div>
        </header>

        {/* סטטיסטיקות */}
        <section className={styles.statsGrid}>
          {demoStats.map((stat) => (
            <div key={stat.title} className={styles.statsCard}>
              <div className={styles.statsCardHeader}>
                <span className={styles.statsCardIcon}>{stat.icon}</span>
                <span className={styles.statsCardTitle}>{stat.title}</span>
              </div>
              <div className={styles.statsCardValue}>{stat.value}</div>
              <div className={styles.statsCardTrend}>
                <span>{stat.trendLabel}:</span>
                <span className={styles[`trendValue_${stat.color}`]}>
                  {stat.trendValue}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* חבילה שנתית לאוטומציה */}
        <section className={styles.automationCard}>
          <div className={styles.automationCardContent}>
            <div className={styles.automationCardText}>
              <div className={styles.automationCardTitleRow}>
                <span className={styles.automationCardIcon}>⚡</span>
                <h3 className={styles.automationCardTitle}>
                  סוכן AI אוטומטי - פתרון מתקדם
                </h3>
                <span className={styles.automationCardBadge}>
                  מומלץ לחנויות גדולות
                </span>
              </div>
              <ul className={styles.automationCardFeatures}>
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
              <div className={styles.automationCardPriceRow}>
                <span className={styles.automationCardPrice}>₪297</span>
                <span className={styles.automationCardPriceUnit}>/חודש</span>
                <span className={styles.automationCardPriceExtra}>
                  + ₪0.5 לכל עדכון מוצר
                  <br />
                  <span className={styles.automationCardPriceNote}>
                    (חיסכון של 75% מעדכון ידני)
                  </span>
                </span>
              </div>
            </div>
            <div className={styles.automationCardActions}>
              <button className={styles.automationCardButton}>
                הפעל סוכן AI
              </button>
              <p className={styles.automationCardNote}>
                ניתן לבטל בכל עת • ללא התחייבות • אחריות 30 יום
              </p>
            </div>
          </div>
        </section>

        {/* הוספת מוצר */}
        <section className={styles.addProductCard}>
          <div className={styles.addProductContent}>
            <div>
              <h3 className={styles.addProductTitle}>הוסף מוצר חדש לסריקה</h3>
              <p className={styles.addProductSubtitle}>
                הדבק קישור למוצר מהחנות שלך והמערכת תוסיף אותו לסריקה
              </p>
            </div>
            <div className={styles.addProductForm}>
              <input
                className={styles.addProductInput}
                placeholder="הכנס כתובת URL של מוצר..."
              />
              <button className={styles.addProductButton}>הוסף</button>
            </div>
          </div>
        </section>

        {/* מוצרים אחרונים */}
        <section className={styles.recentProductsSection}>
          <div className={styles.recentProductsHeader}>
            <h2 className={styles.recentProductsTitle}>מוצרים אחרונים</h2>
            <button className={styles.recentProductsLink}>
              צפה בכל המוצרים
            </button>
          </div>
          <div className={styles.recentProductsGrid}>
            {products.length > 0 ? (
              products.slice(0, 4).map((product: any) => (
                <div key={product.id} className={styles.productCard}>
                  <img
                    src={
                      product.featuredImage?.url ||
                      "https://placehold.co/400x300?text=No+Image"
                    }
                    alt={product.title}
                    className={styles.productImage}
                  />
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{product.title}</div>
                    <div className={styles.productDescription}>
                      {product.description}
                    </div>
                    <div className={styles.productPrice}>
                      {product.priceRangeV2?.minVariantPrice?.amount}{" "}
                      {product.priceRangeV2?.minVariantPrice?.currencyCode}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "#888",
                  padding: "2rem 0",
                }}
              >
                אין מוצרים להצגה
              </div>
            )}
          </div>
        </section>

        {/* סטטוס אופטימיזציה */}
        <section className={styles.optimizationStatusSection}>
          <h2 className={styles.optimizationStatusTitle}>סטטוס אופטימיזציה</h2>
          <div className={styles.optimizationStatusCard}>
            <div className={styles.optimizationStatusHeader}>
              <span className={styles.optimizationStatusCardTitle}>
                מצב האופטימיזציה בחנות שלך
              </span>
              <span className={styles.optimizationStatusCardDesc}>
                סטטיסטיקות בזמן אמת על מצב המוצרים בחנות
              </span>
            </div>
            <div className={styles.optimizationStatusContent}>
              <div className={styles.optimizationStatusRow}>
                <span>נראות כללית בצ'אטים</span>
                <span className={styles.optimizationStatusPercent}>
                  50% מהמוצרים אופטימלים
                </span>
                <div className={styles.optimizationStatusBar}>
                  <div
                    className={styles.optimizationStatusBarFill}
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
              <div className={styles.optimizationStatusRow}>
                <span>מוצרים הדורשים שיפור</span>
                <span className={styles.optimizationStatusWithIssues}>
                  0 מוצרים
                </span>
                <div className={styles.optimizationStatusBar}>
                  <div
                    className={styles.optimizationStatusBarFillAmber}
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
              <div className={styles.optimizationStatusRow}>
                <span>מוצרים שעברו אופטימיזציה</span>
                <span className={styles.optimizationStatusImproved}>
                  0 מוצרים
                </span>
                <div className={styles.optimizationStatusBar}>
                  <div
                    className={styles.optimizationStatusBarFillGreen}
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
