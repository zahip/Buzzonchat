import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return {};
};

export default function App() {
  useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white rounded-lg shadow p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">
          A short heading about [your app]
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          A tagline about [your app] that describes your value proposition.
        </p>
        <ul className="space-y-3 w-full">
          <li className="bg-gray-100 rounded px-4 py-2">
            <strong className="font-semibold">Product feature</strong>. Some
            detail about your feature and its benefit to your customer.
          </li>
          <li className="bg-gray-100 rounded px-4 py-2">
            <strong className="font-semibold">Product feature</strong>. Some
            detail about your feature and its benefit to your customer.
          </li>
          <li className="bg-gray-100 rounded px-4 py-2">
            <strong className="font-semibold">Product feature</strong>. Some
            detail about your feature and its benefit to your customer.
          </li>
        </ul>
      </div>
    </div>
  );
}
