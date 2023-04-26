import { Loading, TitleBar, useNavigate } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import { QRCodeIndex } from "../components";
import { useAppQuery } from "../hooks";

export default function HomePage() {
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate();

  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: rules,
    isLoading,

    /*
    react-query provides stale-while-revalidate caching.
    By passing isRefetching to Index Tables we can show stale data and a loading state.
    Once the query refetches, IndexTable updates and the loading state is removed.
    This ensures a performant UX.
  */
    isRefetching,
  } = useAppQuery({
    url: "/api/rules",
  });

  /* Set the QR codes to use in the list */
  const qrCodesMarkup = rules?.length ? (
    <QRCodeIndex rules={rules} loading={isRefetching} />
  ) : null;

  /* loadingMarkup uses the loading component from AppBridge and components from Polaris  */
  const loadingMarkup = isLoading ? (
    <Card sectioned>
      <Loading />
      <SkeletonBodyText />
    </Card>
  ) : null;

  /* Use Polaris Card and EmptyState components to define the contents of the empty state */
  const emptyStateMarkup =
    !isLoading && !rules?.length ? (
      <Card sectioned>
        <EmptyState
          heading="Create rules your way to stay updated"
          action={{
            content: "Create rule",
            onAction: () => navigate("/rules/new"),
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>
            Allow your self/team to stay updated about what's going on on your
            store
          </p>
        </EmptyState>
      </Card>
    ) : null;

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include the empty state contents set above.
  */
  return (
    <Page fullWidth={!!qrCodesMarkup}>
      <TitleBar
        title="Slackify for Shopify"
        primaryAction={{
          content: "Create a new rule",
          onAction: () => navigate("/rules/new"),
        }}
      />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {qrCodesMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
