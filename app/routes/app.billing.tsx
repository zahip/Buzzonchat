import { Form } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { USAGE_PLAN, MONTHLY_PLAN, AI_PLAN } from "../constants/plans";
import prismaPkg from "@prisma/client";
const { Plan } = prismaPkg;

// במקום Plan כ-type, נגדיר טיפוס מתאים:
type PlanType = (typeof Plan)[keyof typeof Plan];

// מיפוי בין PlanType לערך בעברית:
const planTypeToLabel = {
  [Plan.USAGE]: "שלם לפי שימוש",
  [Plan.MONTHLY]: "חבילת קרדיטים חודשית",
  [Plan.AI]: "אוטומטי AI סוכן",
} as const;

export const action = async ({ request }: ActionFunctionArgs) => {
  const { authenticate } = await import("../shopify.server");
  const form = await request.formData();
  const plan = form.get("plan");
  if (!plan || typeof plan !== "string") {
    return redirect("/app/billing?error=missing_plan");
  }
  let validPlan: PlanType | null = null;
  if (plan === USAGE_PLAN) validPlan = Plan.USAGE;
  else if (plan === MONTHLY_PLAN) validPlan = Plan.MONTHLY;
  else if (plan === AI_PLAN) validPlan = Plan.AI;
  if (!validPlan) {
    return redirect("/app/billing?error=invalid_plan");
  }
  console.log("validPlan", validPlan);
  const { billing } = await authenticate.admin(request);
  console.log("billing", billing);
  await billing.require({
    plans: [
      planTypeToLabel[validPlan] as
        | "שלם לפי שימוש"
        | "חבילת קרדיטים חודשית"
        | "אוטומטי AI סוכן",
    ],
    isTest: true,
    onFailure: async (err) => {
      console.error("Billing error:", err);
      return billing.request({
        plan: planTypeToLabel[validPlan] as
          | "שלם לפי שימוש"
          | "חבילת קרדיטים חודשית"
          | "אוטומטי AI סוכן",
        isTest: true,
        returnUrl: `https://admin.shopify.com/store/tomer-the-king/apps/buzzonchat-3/app/dashboard`,
      });
    },
  });

  // --- User/plan/tokens logic ---
  const { session } = await authenticate.admin(request);
  console.log("session", session);
  const shop = session?.shop;
  console.log("shop", shop);
  if (shop) {
    const prisma = (await import("../db.server")).default;
    const planToTokens: Record<PlanType, number> = {
      [Plan.USAGE]: 0,
      [Plan.MONTHLY]: 500,
      [Plan.AI]: 0,
    };
    const tokens = planToTokens[validPlan] ?? 0;
    await prisma.user.upsert({
      where: { shop },
      update: { plan: validPlan, tokens },
      create: {
        shop,
        plan: validPlan,
        tokens,
      },
    });
  }
  // --- End user logic ---

  return redirect("/app");
};

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-2">
        תוכניות גמישות לכל עסק
      </h1>
      <p className="text-center mb-8 text-gray-500">
        משלם רק על מה שאתה משתמש - מערכת קרדיטים גמישה
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* שלם לפי שימוש */}
        <div className="border rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">{USAGE_PLAN}</h2>
          <div className="text-3xl font-bold mb-2">₪2</div>
          <div className="mb-4 text-gray-500">לכל מוצר משופר</div>
          <ul className="mb-6 text-right space-y-2">
            <li>✔️ בלי מנוי חודשי</li>
            <li>✔️ שלם רק על מוצרים שמשתפרים</li>
            <li>✔️ ללא התחייבות</li>
            <li>✔️ מושלם לחנויות קטנות</li>
          </ul>
          <Form method="post" className="w-full">
            <button
              name="plan"
              value={USAGE_PLAN}
              className="w-full bg-gray-200 hover:bg-gray-300 text-black font-bold px-4 py-2 rounded shadow"
            >
              התחל עכשיו
            </button>
          </Form>
        </div>
        {/* חבילת קרדיטים חודשית */}
        <div className="border-2 border-blue-600 rounded-xl p-6 flex flex-col items-center bg-blue-50 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs">
            הפופולרי ביותר
          </div>
          <h2 className="text-xl font-bold mb-2">{MONTHLY_PLAN}</h2>
          <div className="text-3xl font-bold mb-2">₪79</div>
          <div className="mb-4 text-gray-500">50 קרדיטים חודשיים</div>
          <ul className="mb-6 text-right space-y-2">
            <li>✔️ ₪1.58 לכל מוצר (חיסכון 21%)</li>
            <li>✔️ קרדיטים לא מנוצלים עוברים לחודש הבא</li>
            <li>✔️ דוחות מתקדמים</li>
            <li>✔️ תמיכה מעודפת</li>
          </ul>
          <Form method="post" className="w-full">
            <button
              name="plan"
              value={MONTHLY_PLAN}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded shadow"
            >
              בחר תוכנית
            </button>
          </Form>
        </div>
        {/* אוטומטי AI סוכן */}
        <div className="border rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">{AI_PLAN}</h2>
          <div className="text-3xl font-bold mb-2">₪297</div>
          <div className="mb-4 text-gray-500">חודשי + ₪0.5 לכל עדכון</div>
          <ul className="mb-6 text-right space-y-2">
            <li>✔️ עדכון אוטומטי של כל המוצרים</li>
            <li>✔️ ניטור שינויים באלגוריתמי AI</li>
            <li>✔️ עדכון אוטומטי כשיש שיפורים</li>
            <li>✔️ דוחות שבועיים מפורטים</li>
            <li>✔️ תמיכת VIP 24/7</li>
          </ul>
          <Form method="post" className="w-full">
            <button
              name="plan"
              value={AI_PLAN}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded shadow"
            >
              צור קשר
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
