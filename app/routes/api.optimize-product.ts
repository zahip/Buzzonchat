import { json } from "@remix-run/node";
import { callGroq } from "../groq.server";

export const action = async ({ request }: { request: Request }) => {
  const { prompt } = await request.json();
  const result = await callGroq(prompt);
  console.log("result", result);
  return json({ result });
};
