/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        SHOPIFY_API_KEY: string;
        SHOPIFY_API_SECRET: string;
        SHOPIFY_APP_URL: string;
        SCOPES: string;
        DATABASE_URL: string;
        SMTP_HOST?: string;
        SMTP_PORT?: string;
        SMTP_USER?: string;
        SMTP_PASS?: string;
        SUPPORT_EMAIL?: string;
        ADMIN_SECRET?: string;
        SHOP_CUSTOM_DOMAIN?: string;
        NODE_ENV: "development" | "production" | "test";
      }
    }
  }
}
