import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import React from "react";
import Products from "../components/Products";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  // Fetch up to 50 products
  const response = await admin.graphql(`
    {
      products(first: 50) {
        nodes {
          id
          title
          description
          productType
          tags
          featuredImage { url }
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
          }
        }
      }
    }
  `);
  const { data } = await response.json();
  // Map Shopify data to UI structure
  const products = data.products.nodes.map((p: any) => ({
    id: p.id,
    name: p.title,
    description: p.description,
    image_url: p.featuredImage?.url || "",
    price: p.priceRangeV2?.minVariantPrice?.amount || "",
    currency: p.priceRangeV2?.minVariantPrice?.currencyCode || "",
    category: p.productType || "",
    tags: p.tags || [],
    status: "improved", // אפשר להחליף ללוגיקה אמיתית
    improvement_score: 100, // אפשר להחליף ללוגיקה אמיתית
  }));
  return { products };
};

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();
  return <Products products={products} />;
}
