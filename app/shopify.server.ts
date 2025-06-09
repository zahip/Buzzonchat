import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  BillingInterval,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { USAGE_PLAN, MONTHLY_PLAN, AI_PLAN } from "./constants/plans";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  billing: {
    [USAGE_PLAN]: {
      lineItems: [
        {
          amount: 2,
          currencyCode: "ILS",
          interval: BillingInterval.Usage,
          terms: "לכל מוצר משופר",
        },
      ],
    },
    [MONTHLY_PLAN]: {
      lineItems: [
        {
          amount: 1,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
      trialDays: 0,
    },
    [AI_PLAN]: {
      lineItems: [
        {
          amount: 297,
          currencyCode: "ILS",
          interval: BillingInterval.Every30Days,
        },
        {
          amount: 0.5,
          currencyCode: "ILS",
          interval: BillingInterval.Usage,
          terms: "לכל עדכון",
        },
      ],
      trialDays: 0,
    },
  },
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
