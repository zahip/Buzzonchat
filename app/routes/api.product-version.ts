import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  if (!productId) return json({ error: "Missing productId" }, { status: 400 });

  const versions = await prisma.productVersion.findMany({
    where: { productId },
    orderBy: { createdAt: "asc" },
  });

  return json({ versions });
};

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  const data = await request.json();

  // שמור את הגרסה
  const version = await prisma.productVersion.create({
    data: {
      productId: data.productId,
      title: data.title,
      description: data.description,
      tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags,
      score: data.score,
      status: data.status,
      // createdAt יתווסף אוטומטית
    },
  });

  return json({ success: true, version });
};
