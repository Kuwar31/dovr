/**
 * Agency Admin Panel — /app/admin
 *
 * Allows DOVR staff to configure the dashboard data for any installed store.
 * Protected by a simple secret key check (ADMIN_SECRET env var).
 *
 * Usage: Navigate to /app/admin?shop=storename.myshopify.com
 * Then enter the ADMIN_SECRET to unlock.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useSearchParams,
} from "@remix-run/react";
import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  BlockStack,
  Text,
  Banner,
  Divider,
  Checkbox,
  Box,
  InlineStack,
  DatePicker,
  Popover,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getOrCreateStoreAccount, upsertStoreAccount } from "../models/storeAccount.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";

  if (!shop) return json({ account: null, shop: "" });

  const account = await getOrCreateStoreAccount(shop);
  return json({
    shop,
    account: {
      ...account,
      planStartDate: account.planStartDate?.toISOString() ?? null,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  const formData = await request.formData();

  // Verify admin secret
  const secret = String(formData.get("adminSecret") || "");
  if (secret !== (process.env.ADMIN_SECRET || "dovr-admin")) {
    return json({ success: false, error: "Invalid admin secret." }, { status: 403 });
  }

  const shop = String(formData.get("shop") || "").trim();
  if (!shop) return json({ success: false, error: "Shop is required." }, { status: 400 });

  const planStartRaw = formData.get("planStartDate");
  const planStartDate = planStartRaw ? new Date(String(planStartRaw)) : null;

  await upsertStoreAccount({
    shop,
    planName: String(formData.get("planName") || ""),
    planStartDate,
    managerName: String(formData.get("managerName") || ""),
    managerEmail: String(formData.get("managerEmail") || ""),
    managerPhone: String(formData.get("managerPhone") || ""),
    portalUrl: String(formData.get("portalUrl") || ""),
    serviceWebsite: formData.get("serviceWebsite") === "true",
    serviceSEO: formData.get("serviceSEO") === "true",
    serviceAdvertising: formData.get("serviceAdvertising") === "true",
    serviceGEO: formData.get("serviceGEO") === "true",
  });

  return json({ success: true, error: null });
};

export default function AdminPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();

  const isSubmitting = navigation.state === "submitting";
  const acc = loaderData.account;

  const [adminSecret, setAdminSecret] = useState("");
  const [shopInput, setShopInput] = useState(loaderData.shop || "");
  const [planName, setPlanName] = useState(acc?.planName || "");
  const [planStartDate, setPlanStartDate] = useState(acc?.planStartDate || "");
  const [managerName, setManagerName] = useState(acc?.managerName || "");
  const [managerEmail, setManagerEmail] = useState(acc?.managerEmail || "");
  const [managerPhone, setManagerPhone] = useState(acc?.managerPhone || "");
  const [portalUrl, setPortalUrl] = useState(acc?.portalUrl || "");
  const [serviceWebsite, setServiceWebsite] = useState(acc?.serviceWebsite || false);
  const [serviceSEO, setServiceSEO] = useState(acc?.serviceSEO || false);
  const [serviceAdvertising, setServiceAdvertising] = useState(acc?.serviceAdvertising || false);
  const [serviceGEO, setServiceGEO] = useState(acc?.serviceGEO || false);

  const handleSubmit = useCallback(() => {
    const formData = new FormData();
    formData.append("adminSecret", adminSecret);
    formData.append("shop", shopInput);
    formData.append("planName", planName);
    formData.append("planStartDate", planStartDate);
    formData.append("managerName", managerName);
    formData.append("managerEmail", managerEmail);
    formData.append("managerPhone", managerPhone);
    formData.append("portalUrl", portalUrl);
    formData.append("serviceWebsite", String(serviceWebsite));
    formData.append("serviceSEO", String(serviceSEO));
    formData.append("serviceAdvertising", String(serviceAdvertising));
    formData.append("serviceGEO", String(serviceGEO));
    submit(formData, { method: "post" });
  }, [
    adminSecret, shopInput, planName, planStartDate,
    managerName, managerEmail, managerPhone, portalUrl,
    serviceWebsite, serviceSEO, serviceAdvertising, serviceGEO, submit,
  ]);

  const handleLoadShop = useCallback(() => {
    window.location.href = `/app/admin?shop=${encodeURIComponent(shopInput)}`;
  }, [shopInput]);

  return (
    <Page
      title="DOVR Admin Panel"
      subtitle="Configure store account data"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {actionData?.success && (
              <Banner title="Account updated successfully" tone="success" />
            )}
            {actionData?.error && (
              <Banner title={actionData.error} tone="critical" />
            )}

            {/* Shop Selector */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Select Store</Text>
                <Divider />
                <InlineStack gap="300" blockAlign="end">
                  <Box minWidth="300px">
                    <TextField
                      label="Store domain"
                      value={shopInput}
                      onChange={setShopInput}
                      placeholder="retailer.myshopify.com"
                      autoComplete="off"
                    />
                  </Box>
                  <Button onClick={handleLoadShop}>Load Store</Button>
                </InlineStack>
              </BlockStack>
            </Card>

            {loaderData.shop && (
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Edit: {loaderData.shop}
                  </Text>
                  <Divider />
                  <FormLayout>
                    <TextField
                      label="Admin Secret"
                      type="password"
                      value={adminSecret}
                      onChange={setAdminSecret}
                      autoComplete="off"
                      helpText="Required to save changes. Set via ADMIN_SECRET env var."
                    />

                    <FormLayout.Group title="Account Details">
                      <TextField
                        label="Plan Name"
                        value={planName}
                        onChange={setPlanName}
                        placeholder="e.g. Premium Growth"
                        autoComplete="off"
                      />
                      <TextField
                        label="Plan Start Date"
                        type="date"
                        value={planStartDate ? planStartDate.substring(0, 10) : ""}
                        onChange={setPlanStartDate}
                        autoComplete="off"
                      />
                    </FormLayout.Group>

                    <FormLayout.Group title="Account Manager">
                      <TextField
                        label="Manager Name"
                        value={managerName}
                        onChange={setManagerName}
                        autoComplete="name"
                      />
                      <TextField
                        label="Manager Email"
                        type="email"
                        value={managerEmail}
                        onChange={setManagerEmail}
                        autoComplete="email"
                      />
                      <TextField
                        label="Manager Phone"
                        type="tel"
                        value={managerPhone}
                        onChange={setManagerPhone}
                        autoComplete="tel"
                      />
                    </FormLayout.Group>

                    <TextField
                      label="Client Portal URL"
                      type="url"
                      value={portalUrl}
                      onChange={setPortalUrl}
                      placeholder="https://portal.dovr.com/..."
                      autoComplete="off"
                    />

                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">Active Services</Text>
                      <Checkbox
                        label="Website Management"
                        checked={serviceWebsite}
                        onChange={setServiceWebsite}
                      />
                      <Checkbox
                        label="SEO Optimization"
                        checked={serviceSEO}
                        onChange={setServiceSEO}
                      />
                      <Checkbox
                        label="Advertising (Paid Media)"
                        checked={serviceAdvertising}
                        onChange={setServiceAdvertising}
                      />
                      <Checkbox
                        label="GEO Targeting"
                        checked={serviceGEO}
                        onChange={setServiceGEO}
                      />
                    </BlockStack>

                    <Box paddingBlockStart="200">
                      <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={!adminSecret}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </FormLayout>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
