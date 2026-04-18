import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
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
  Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { sendSupportEmail } from "../models/mail.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const fromName = String(formData.get("fromName") || "").trim();
  const fromEmail = String(formData.get("fromEmail") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  // Validation
  if (!fromName || !fromEmail || !subject || !message) {
    return json(
      { success: false, error: "All fields are required." },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(fromEmail)) {
    return json(
      { success: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    await sendSupportEmail({
      fromName,
      fromEmail,
      shop: session.shop,
      subject,
      message,
    });
    return json({ success: true, error: null });
  } catch (err) {
    console.error("Failed to send support email:", err);
    return json(
      {
        success: false,
        error:
          "Failed to send your message. Please try again or contact your Account Manager directly.",
      },
      { status: 500 }
    );
  }
};

export default function SupportPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";

  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = useCallback(() => {
    const formData = new FormData();
    formData.append("fromName", fromName);
    formData.append("fromEmail", fromEmail);
    formData.append("subject", subject);
    formData.append("message", message);
    submit(formData, { method: "post" });
  }, [fromName, fromEmail, subject, message, submit]);

  // Reset form on success
  if (actionData?.success && fromName) {
    setFromName("");
    setFromEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <Page
      title="Contact Support"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {actionData?.success && (
              <Banner title="Message sent!" tone="success">
                <Text as="p" variant="bodyMd">
                  Your message has been sent to the DOVR team. We'll get back to
                  you as soon as possible.
                </Text>
              </Banner>
            )}
            {actionData?.error && (
              <Banner title="Something went wrong" tone="critical">
                <Text as="p" variant="bodyMd">{actionData.error}</Text>
              </Banner>
            )}

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Send a Message
                </Text>
                <Divider />
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="Your Name"
                      value={fromName}
                      onChange={setFromName}
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                    <TextField
                      label="Your Email"
                      type="email"
                      value={fromEmail}
                      onChange={setFromEmail}
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </FormLayout.Group>
                  <TextField
                    label="Subject"
                    value={subject}
                    onChange={setSubject}
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                  <TextField
                    label="Message"
                    value={message}
                    onChange={setMessage}
                    multiline={5}
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                  <Box paddingBlockStart="200">
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      loading={isSubmitting}
                      disabled={!fromName || !fromEmail || !subject || !message}
                    >
                      Send Message
                    </Button>
                  </Box>
                </FormLayout>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Other Ways to Reach Us
              </Text>
              <Divider />
              <Text as="p" variant="bodyMd" tone="subdued">
                For urgent matters, contact your Account Manager directly via
                email or phone — their details are on the main dashboard.
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Support requests sent here are monitored Monday–Friday,
                9 AM–6 PM.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
