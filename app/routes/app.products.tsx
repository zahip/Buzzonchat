import React, { useState } from "react";
import styles from "./app.products.module.css";

// Demo products data (copied from the provided code)
const demoProducts = [
  {
    id: "demo-1",
    name: "חולצת טי אורגנית לגברים",
    description:
      "חולצת טי אורגנית 100% כותנה, נוחה ללבישה, ידידותית לסביבה ומתאימה לכל אירוע.",
    image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: 79.9,
    currency: "₪",
    category: "בגדים",
    product_url: "https://orgeniz.com/products/organic-t-shirt-men",
    status: "needs_improvement",
    improvement_score: 42,
    tags: ["חולצה", "כותנה", "אורגני", "גברים"],
    variants_count: 3,
    issues: [
      {
        type: "title",
        severity: "medium",
        description: "כותרת המוצר חסרה מילות מפתח חשובות",
      },
      {
        type: "description",
        severity: "high",
        description: "תיאור המוצר קצר מדי וחסר פרטים טכניים",
      },
    ],
  },
  {
    id: "demo-2",
    name: "שעון חכם ספורטיבי X200 Pro - עמיד במים עם מעקב דופק ושינה",
    description:
      "שעון חכם ספורטיבי X200 Pro עם מסך מגע HD בגודל 1.4 אינץ' ורזולוציה גבוהה. מציע מעקב אחר פעילות גופנית, דופק 24/7, איכות שינה וצריכת קלוריות. עמיד במים עד 50 מטר (IP68), מושלם לשחייה וספורט ימי.",
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: 199.99,
    currency: "₪",
    category: "טכנולוגיה",
    product_url: "https://orgeniz.com/products/smart-watch-x200-pro",
    status: "improved",
    improvement_score: 92,
    tags: ["שעון חכם", "ספורט", "עמיד במים", "מעקב דופק"],
    variants_count: 2,
    issues: [],
  },
  {
    id: "demo-3",
    name: "תיק גב למחשב נייד",
    description:
      "תיק גב למחשב נייד, מתאים למחשבים בגודל עד 15.6 אינץ'. תא ריפוד למחשב, כיסים נוספים לאביזרים.",
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    price: 149.9,
    currency: "₪",
    category: "אביזרים",
    product_url: "https://orgeniz.com/products/laptop-backpack-156",
    status: "needs_improvement",
    improvement_score: 51,
    tags: ["תיק", "מחשב נייד", "תיק גב"],
    variants_count: 4,
    issues: [
      {
        type: "description",
        severity: "medium",
        description: "תיאור המוצר חסר פרטים טכניים",
      },
    ],
  },
];

export default function ProductsPage() {
  // Minimal state for UI demo
  const [products] = useState(demoProducts);

  // UI only, no logic for now
  return (
    <div className={styles.productsWrapper} dir="rtl">
      <div className={styles.productsContainer}>
        <header className={styles.productsHeader}>
          <div>
            <h1 className={styles.productsTitle}>מוצרים</h1>
            <p className={styles.productsSubtitle}>
              ניהול ואופטימיזציה של המוצרים שלך
            </p>
          </div>
          <div className={styles.productsActions}>
            <button className={styles.actionButtonPrimary}>הוסף מוצר</button>
            <button className={styles.actionButton}>אמן מוצרים</button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <div className={styles.statsCardHeader}>
              <span className={styles.statsCardIcon}>📦</span>
              <span className={styles.statsCardTitle}>סה"כ מוצרים</span>
            </div>
            <div className={styles.statsCardValue}>{products.length}</div>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statsCardHeader}>
              <span className={styles.statsCardIcon}>⚠️</span>
              <span className={styles.statsCardTitle}>דורשים שיפור</span>
            </div>
            <div className={styles.statsCardValue}>
              {products.filter((p) => p.status === "needs_improvement").length}
            </div>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statsCardHeader}>
              <span className={styles.statsCardIcon}>✅</span>
              <span className={styles.statsCardTitle}>שופרו</span>
            </div>
            <div className={styles.statsCardValue}>
              {products.filter((p) => p.status === "improved").length}
            </div>
          </div>
          <div className={styles.statsCard}>
            <div className={styles.statsCardHeader}>
              <span className={styles.statsCardIcon}>⭐</span>
              <span className={styles.statsCardTitle}>ציון ממוצע</span>
            </div>
            <div className={styles.statsCardValue}>
              {Math.round(
                products.reduce((sum, p) => sum + p.improvement_score, 0) /
                  products.length,
              )}
            </div>
          </div>
        </section>

        {/* Products Table */}
        <section className={styles.productsTableSection}>
          <table className={styles.productsTable}>
            <thead>
              <tr>
                <th></th>
                <th>שם המוצר</th>
                <th>קטגוריה</th>
                <th>סטטוס</th>
                <th>ציון</th>
                <th>מחיר</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={styles.productRow}>
                  <td>
                    <div className={styles.productImageCell}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className={styles.productImage}
                        />
                      ) : (
                        <span className={styles.productImagePlaceholder}>
                          📦
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productTags}>
                      {product.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className={styles.productTag}>
                          {tag}
                        </span>
                      ))}
                      {product.tags?.length > 3 && (
                        <span className={styles.productTag}>
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    {product.status === "needs_improvement" && (
                      <span className={styles.statusNeedsImprovement}>
                        דורש שיפור
                      </span>
                    )}
                    {product.status === "improved" && (
                      <span className={styles.statusImproved}>שופר</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.productScoreBarWrapper}>
                      <div className={styles.productScoreBar}>
                        <div
                          className={
                            product.improvement_score < 50
                              ? styles.scoreBarRed
                              : product.improvement_score < 80
                                ? styles.scoreBarAmber
                                : styles.scoreBarGreen
                          }
                          style={{ width: `${product.improvement_score}%` }}
                        />
                      </div>
                      <span className={styles.productScoreValue}>
                        {product.improvement_score}
                      </span>
                    </div>
                  </td>
                  <td>
                    {product.price} {product.currency}
                  </td>
                  <td>
                    <button className={styles.actionButton}>אמן</button>
                    <button className={styles.actionButton}>פרטים</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
