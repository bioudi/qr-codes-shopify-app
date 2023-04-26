import { ContextualSaveBar, useNavigate } from "@shopify/app-bridge-react";
import {
  Button,
  Card,
  Form,
  FormLayout,
  Layout,
  Select,
  Stack,
  TextField,
} from "@shopify/polaris";
import { useCallback, useState } from "react";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch } from "../hooks";

/* Import custom hooks for forms */
import { notEmptyString, useField, useForm } from "@shopify/react-form";

export function RuleForm({ rule: InitialRule }) {
  const [rule, setRule] = useState(InitialRule);
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();

  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        const ruleId = rule?.id;
        /* construct the appropriate URL to send the API request to based on whether the QR code is new or being updated */
        const url = ruleId ? `/api/rules/${ruleId}` : "/api/rules";
        /* a condition to select the appropriate HTTP method: PATCH to update a QR code or POST to create a new QR code */
        const method = ruleId ? "PATCH" : "POST";
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          makeClean();
          const rule = await response.json();
          /* if this is a new QR code, then save the QR code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
          if (!ruleId) {
            navigate(`/rules/${rule.id}`);
            /* if this is a QR code update, update the QR code state in this component */
          } else {
            setRule(rule);
          }
        }
      })();
      return { status: "success" };
    },
    [rule, setRule]
  );

  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields: { title, trigger },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      title: useField({
        value: rule?.title || "",
        validates: [notEmptyString("Please name your rule")],
      }),
      trigger: useField(rule?.trigger || "order/created"),
    },
    onSubmit,
  });

  const triggerOptions = [
    { label: "Order Created", value: "order/created" },
    { label: "Product Created", value: "product/created" },
  ];

  const handleSelectChange = useCallback(
    (value) => trigger.onChange(value),
    []
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteRule = useCallback(async () => {
    reset();
    /* The isDeleting state disables the download button and the delete QR code button to show the merchant that an action is in progress */
    setIsDeleting(true);
    const response = await fetch(`/api/rules/${rule.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate(`/`);
    }
  }, [rule]);

  /* The form layout, created using Polaris and App Bridge components. */
  return (
    <Stack vertical>
      <Layout>
        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: "Discard",
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <Card title="Rule">
                <Card.Section>
                  <TextField
                    {...title}
                    label="Title"
                    helpText="Only store staff can see this title"
                  />
                </Card.Section>
                <Card.Section>
                  <Select
                    label="Triggers when"
                    options={triggerOptions}
                    value={trigger.value}
                    onChange={handleSelectChange}
                  />
                </Card.Section>
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section>
          {rule?.id && (
            <Button
              outline
              destructive
              onClick={deleteRule}
              loading={isDeleting}
            >
              Delete rule
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Stack>
  );
}
