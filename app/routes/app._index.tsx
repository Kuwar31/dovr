import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Divider,
  Box,
  Icon,
  Banner,
  DataTable,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  XCircleIcon,
  PersonIcon,
  EmailIcon,
  PhoneIcon,
  ExternalIcon,
  StoreManagedIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { getOrCreateStoreAccount } from "../models/storeAccount.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const account = await getOrCreateStoreAccount(session.shop);

  return json({
    shop: session.shop,
    account: {
      ...account,
      planStartDate: account.planStartDate?.toISOString() ?? null,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    },
  });
};

// Helper: format date nicely
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Service item component
function ServiceItem({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <InlineStack gap="200" align="start" blockAlign="center">
      <Icon
        source={active ? CheckCircleIcon : XCircleIcon}
        tone={active ? "success" : "subdued"}
      />
      <Text as="span" variant="bodyMd" tone={active ? undefined : "subdued"}>
        {label}
      </Text>
      {active && <Badge tone="success">Active</Badge>}
    </InlineStack>
  );
}

export default function Dashboard() {
  const { shop, account } = useLoaderData<typeof loader>();

  const hasAccount = account.planName !== "";
  const activeServicesCount = [
    account.serviceWebsite,
    account.serviceSEO,
    account.serviceAdvertising,
    account.serviceGEO,
  ].filter(Boolean).length;

  return (
    <Page
      title="DOVR Agency Dashboard"
      subtitle={shop}
      titleMetadata={
        hasAccount ? (
          <Badge tone="success">Active Client</Badge>
        ) : (
          <Badge tone="attention">Setup Pending</Badge>
        )
      }
    >
      <BlockStack gap="500">
        {!hasAccount && (
          <Banner
            title="Account setup in progress"
            tone="warning"
          >
            <Text as="p" variant="bodyMd">
              Your DOVR account is being configured. Please contact your Account
              Manager if you have questions.
            </Text>
          </Banner>
        )}

        <Layout>
          {/* ── Left column ── */}
          <Layout.Section>
            <BlockStack gap="400">

              {/* Account Status Card */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Account Status
                    </Text>
                    <Icon source={StoreManagedIcon} tone="base" />
                  </InlineStack>
                  <Divider />
                  <DataTable
                    columnContentTypes={["text", "text"]}
                    headings={[]}
                    rows={[
                      [
                        <Text as="span" variant="bodyMd" tone="subdued">Plan</Text>,
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          {account.planName || "—"}
                        </Text>,
                      ],
                      [
                        <Text as="span" variant="bodyMd" tone="subdued">Start Date</Text>,
                        <Text as="span" variant="bodyMd">
                          {formatDate(account.planStartDate)}
                        </Text>,
                      ],
                    ]}
                    hideScrollIndicator
                    increasedTableDensity
                  />
                </BlockStack>
              </Card>

              {/* Active Services Card */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Active Services
                    </Text>
                    <Badge>
                      {activeServicesCount} / 4 active
                    </Badge>
                  </InlineStack>
                  <Divider />
                  <BlockStack gap="300">
                    <ServiceItem
                      label="Website Management"
                      active={account.serviceWebsite}
                    />
                    <ServiceItem
                      label="SEO Optimization"
                      active={account.serviceSEO}
                    />
                    <ServiceItem
                      label="Advertising (Paid Media)"
                      active={account.serviceAdvertising}
                    />
                    <ServiceItem
                      label="GEO Targeting"
                      active={account.serviceGEO}
                    />
                  </BlockStack>
                </BlockStack>
              </Card>

            </BlockStack>
          </Layout.Section>

          {/* ── Right column ── */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">

              {/* Account Manager Card */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Your Account Manager
                  </Text>
                  <Divider />
                  {account.managerName ? (
                    <BlockStack gap="300">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={PersonIcon} tone="base" />
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          {account.managerName}
                        </Text>
                      </InlineStack>
                      {account.managerEmail && (
                        <InlineStack gap="200" blockAlign="center">
                          <Icon source={EmailIcon} tone="subdued" />
                          <Text as="span" variant="bodyMd">
                            {account.managerEmail}
                          </Text>
                        </InlineStack>
                      )}
                      {account.managerPhone && (
                        <InlineStack gap="200" blockAlign="center">
                          <Icon source={PhoneIcon} tone="subdued" />
                          <Text as="span" variant="bodyMd">
                            {account.managerPhone}
                          </Text>
                        </InlineStack>
                      )}
                    </BlockStack>
                  ) : (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Account Manager not yet assigned.
                    </Text>
                  )}
                </BlockStack>
              </Card>

              {/* Client Portal Card */}
              {account.portalUrl && (
                <Card>
                  <BlockStack gap="300">
                    <Text as="h2" variant="headingMd">
                      Client Portal
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Access your full reports, invoices, and campaign data.
                    </Text>
                    <Button
                      url={account.portalUrl}
                      target="_blank"
                      icon={ExternalIcon}
                      variant="primary"
                      fullWidth
                    >
                      Open Client Portal
                    </Button>
                  </BlockStack>
                </Card>
              )}

              {/* Support shortcut */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Need Help?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Send a message to your DOVR team directly from this app.
                  </Text>
                  <Button url="/app/support" variant="secondary" fullWidth>
                    Contact Support
                  </Button>
                </BlockStack>
              </Card>

            </BlockStack>
          </Layout.Section>
        </Layout>

        {/* Footer */}
        <Box paddingBlockEnd="400">
          <Text as="p" variant="bodySm" tone="subdued" alignment="center">
            Powered by DOVR Agency · {shop}
          </Text>
        </Box>

      </BlockStack>
    </Page>
  );
}
