import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const { productId, title, description, tags } = await request.json();

  const { admin } = await authenticate.admin(request);

  // קריאה ל-Shopify Admin API לעדכון המוצר
  const response = await admin.graphql(
    `#graphql
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
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
        input: {
          id: productId,
          title,
          descriptionHtml: description,
          tags,
        },
      },
    },
  );
  const data = await response.json();
  if (data.errors || data.data.productUpdate.userErrors.length > 0) {
    return json(
      { error: data.errors || data.data.productUpdate.userErrors },
      { status: 400 },
    );
  }
  return json({ success: true, product: data.data.productUpdate.product });
};
