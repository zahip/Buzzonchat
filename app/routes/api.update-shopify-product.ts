import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const { productId, title, description, tags } = await request.json();

  console.log("tags1111", tags);

  const { admin } = await authenticate.admin(request);

  // קריאה ל-Shopify Admin API לעדכון המוצר
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
