import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { Card, Layout, Page, SkeletonBodyText } from "@shopify/polaris";
import { useParams } from "react-router-dom";
import { RuleForm } from "../../components";
import { useAppQuery } from "../../hooks";

export default function RuleEdit() {
  const breadcrumbs = [{ content: "QR codes", url: "/" }];
  const { id } = useParams();

  /*
  Fetch the QR code.
  useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
  The backend supplements app data with data queried from the Shopify GraphQL Admin API.
*/
  const {
    data: rule,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/rules/${id}`,
    reactQueryOptions: {
      /* Disable refetching because the RuleForm component ignores changes to its props */
      refetchOnReconnect: false,
    },
  });

  /* Loading action and markup that uses App Bridge and Polaris components */
  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Edit rule"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card sectioned title="Title">
              <SkeletonBodyText />
            </Card>
            <Card title="Product">
              <Card.Section>
                <SkeletonBodyText lines={1} />
              </Card.Section>
              <Card.Section>
                <SkeletonBodyText lines={3} />
              </Card.Section>
            </Card>
            <Card sectioned title="Discount">
              <SkeletonBodyText lines={2} />
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned title="QR code" />
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar
        title="Edit rule"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <RuleForm rule={rule} />
    </Page>
  );
}
