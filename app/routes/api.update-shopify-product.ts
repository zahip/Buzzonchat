import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const { productId, title, description, tags } = await request.json();

  // --- הורדת טוקן מהמשתמש ---
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return json({ error: "No shop in session" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { shop: session.shop } });
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }
  if (user.tokens <= 0) {
    return json(
      { error: "אין לך מספיק טוקנים לביצוע הפעולה" },
      { status: 402 },
    );
  }
  await prisma.user.update({
    where: { shop: session.shop },
    data: { tokens: { decrement: 1 } },
  });
  // --- סוף הורדת טוקן ---

  console.log("tags1111", tags);

  // קריאה ל-Shopify Admin API לעדכון המוצר
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      mutation productUpdate($product: ProductUpdateInput!) {
        productUpdate(product: $product) {
          product {
            id
            title
            descriptionHtml
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        product: {
          id: productId,
          title,
          descriptionHtml: description,
          tags: Array.isArray(tags)
            ? tags.map((t: string) => t.trim()).filter(Boolean)
            : typeof tags === "string"
              ? (tags as string)
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : [],
        },
      },
    },
  );
  const data = await response.json();
  if (data.data.productUpdate.userErrors.length > 0) {
    return json({ error: data.data.productUpdate.userErrors }, { status: 400 });
  }
  return json({ success: true, product: data.data.productUpdate.product });
};
