import { useNavigate } from "@shopify/app-bridge-react";
import {
  Card,
  IndexTable,
  Stack,
  TextStyle,
  UnstyledLink,
} from "@shopify/polaris";

/* useMedia is used to support multiple screen sizes */
import { useMedia } from "@shopify/react-hooks";

/* dayjs is used to capture and format the date a QR code was created or modified */
import dayjs from "dayjs";

/* Markup for small screen sizes (mobile) */
function SmallScreenCard({ id, title, trigger, createdAt, navigate }) {
  return (
    <UnstyledLink onClick={() => navigate(`/rules/${id}`)}>
      <div
        style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}
      >
        <Stack>
          <Stack.Item fill>
            <Stack vertical={true}>
              <Stack.Item>
                <p>
                  <TextStyle variation="strong">
                    {truncate(title, 35)}
                  </TextStyle>
                </p>
                <p>{truncate(trigger, 35)}</p>
                <p>{dayjs(createdAt).format("MMMM D, YYYY")}</p>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
      </div>
    </UnstyledLink>
  );
}

export function RuleIndex({ rules, loading }) {
  const navigate = useNavigate();

  /* Check if screen is small */
  const isSmallScreen = useMedia("(max-width: 640px)");

  /* Map over Rules for small screen */
  const smallScreenMarkup = rules.map((rule) => (
    <SmallScreenCard key={rule.id} navigate={navigate} {...rule} />
  ));

  const resourceName = {
    singular: "QR code",
    plural: "QR codes",
  };

  const rowMarkup = rules.map(({ id, title, trigger, createdAt }, index) => {
    /* The form layout, created using Polaris components. Includes the QR code data set above. */
    return (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        onClick={() => {
          navigate(`/rules/${id}`);
        }}
      >
        <IndexTable.Cell>
          <UnstyledLink data-primary-link url={`/rules/${id}`}>
            {truncate(title, 25)}
          </UnstyledLink>
        </IndexTable.Cell>
        <IndexTable.Cell>{truncate(trigger, 25)}</IndexTable.Cell>
        <IndexTable.Cell>
          {dayjs(createdAt).format("MMMM D, YYYY")}
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  /* A layout for small screens, built using Polaris components */
  return (
    <Card>
      {isSmallScreen ? (
        smallScreenMarkup
      ) : (
        <IndexTable
          resourceName={resourceName}
          itemCount={rules.length}
          headings={[
            { title: "Title" },
            { title: "Triggers On" },
            { title: "Date created" },
          ]}
          selectable={false}
          loading={loading}
        >
          {rowMarkup}
        </IndexTable>
      )}
    </Card>
  );
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}
