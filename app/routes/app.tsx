import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  let tokens: number | null = null;
  if (session?.shop) {
    const user = await prisma.user.findUnique({
      where: { shop: session.shop },
    });
    tokens = user?.tokens ?? null;
  }
  return { apiKey: process.env.SHOPIFY_API_KEY || "", tokens };
};

export default function App() {
  const { apiKey, tokens } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <div style={{ position: "fixed", top: 10, left: 10, zIndex: 1000 }}>
        {tokens !== null && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 8,
              padding: "6px 16px",
              boxShadow: "0 2px 8px #0001",
              fontWeight: 600,
            }}
          >
            טוקנים זמינים: {tokens}
          </div>
        )}
      </div>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
        <Link to="/app/dashboard">Dashboard</Link>
        <Link to="/app/products">Products</Link>
        <Link to="/app/billing">בחירת מסלול תשלום</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
