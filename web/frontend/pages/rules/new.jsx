import { TitleBar } from "@shopify/app-bridge-react";
import { Page } from "@shopify/polaris";
import { RuleForm } from "../../components";

export default function ManageCode() {
  const breadcrumbs = [{ content: "Rules", url: "/" }];

  return (
    <Page>
      <TitleBar
        title="Create new rule"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <RuleForm />
    </Page>
  );
}
