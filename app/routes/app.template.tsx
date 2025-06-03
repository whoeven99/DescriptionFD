import { LoaderFunctionArgs } from "@remix-run/node";
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Grid,
  InlineStack,
  Page,
  Popover,
  Tabs,
} from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import { useCallback, useMemo, useState } from "react";
import TemplateCard from "app/components/templateCard";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { useNavigate } from "@remix-run/react";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const Index = () => {
  const [mainSelected, setMainSelected] = useState(0);
  const [secondarySelected, setSecondarySelected] = useState(0);
  const [descriptionSelected, setDescriptionSelected] = useState<"Description" | "SEODescription">("Description");
  const [previewModal, setPreviewModal] = useState<any>(null);
  const [active, setActive] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any>({
    0: {
      Description: [
        {
          id: 0,
          title: "Template 1",
          description: "Template 1 description",
          content: "Template 1 content",
          type: "product",
        },
        {
          id: 1,
          title: "Template 2",
          description: "Template 2 description",
          content: "Template 2 content",
          type: "collection",
        }
      ],
      SEODescription: [
        {
          id: 2,
          title: "Template 1",
          description: "Template 1 description",
          content: "Template 1 content",
          type: "product",
        }
      ]
    },
    1: {
      Description: [
        {
          id: 3,
          title: "Template 1",
          description: "Template 1 description",
          content: "Template 1 content",
          type: "product",
        },
        {
          id: 4,
          title: "Template 2",
          description: "Template 2 description",
          content: "Template 2 content",
          type: "collection",
        }
      ],
      SEODescription: [
        {
          id: 5,
          title: "Template 1",
          description: "Template 1 description",
          content: "Template 1 content",
          type: "product",
        }
      ]
    },
  });

  const filterTemplates = useMemo(() => {
    return templates[mainSelected][descriptionSelected].filter((template: any) => {
      if (secondarySelected === 0) return true; // "All" 标签
      if (secondarySelected === 1) return template.type === "product"; // "Product" 标签
      if (secondarySelected === 2) return template.type === "collection"; // "Collection" 标签
      return true;
    });
  }, [mainSelected, descriptionSelected, secondarySelected]);  

  const navigate = useNavigate();
  const toggleActive = (id: string) => () => {
    setActive((activeId) => (activeId !== id ? id : null));
  };

  const handleDescriptionChange = (value: "Description" | "SEODescription") => {
    setDescriptionSelected(value);
    setActive(null);
  };

  const handleMainTabChange = useCallback(
    (selectedTabIndex: number) => setMainSelected(selectedTabIndex),
    [],
  );

  const handleSecondaryTabChange = useCallback(
    (selectedTabIndex: number) => setSecondarySelected(selectedTabIndex),
    [],
  );

  const handlePreview = (template: any) => {
    setPreviewModal(template);
    shopify.modal.show('preview-modal');
  };

  const handleClosePreview = () => {
    setPreviewModal(null);
    shopify.modal.hide('preview-modal');
  };

  const mainTabs = [
    {
      id: 'system-templates',
      content: 'System',
      accessibilityLabel: 'System',
      panelID: 'system-templates',
    },
    {
      id: 'custom-templates',
      content: 'Custom',
      panelID: 'custom-templates',
    },
  ];

  const secondaryTabs = [
    {
      id: 'all-templates',
      content: 'All',
      accessibilityLabel: 'All',
      panelID: 'all-templates',
    },
    {
      id: 'product-templates',
      content: 'Product',
      panelID: 'product-templates',
    },
    {
      id: 'collection-templates',
      content: 'Collection',
      panelID: 'collection-templates',
    },
  ];

  return (
    <Page
      title="Template"
      subtitle="Customize and organize your content generation templates"
      compactTitle
      primaryAction={{
        content: "Create template",
        onAction: () => {
          navigate("/app/template/create");
        },
      }}
    >
      <Card
        background="bg-surface"
        padding={"200"}
      >
        <Box>
          <Tabs tabs={mainTabs} selected={mainSelected} onSelect={handleMainTabChange} />
        </Box>
        <InlineStack align="space-between" wrap={false} direction="row">
          <Tabs tabs={secondaryTabs} selected={secondarySelected} onSelect={handleSecondaryTabChange} />
          <Box paddingInlineEnd={{ xs: "200" }}>
            <ButtonGroup variant="segmented">
              <Popover
                active={active === 'popover1'}
                preferredAlignment="right"
                activator={
                  <Button
                    variant="tertiary"
                    onClick={toggleActive('popover1')}
                    disclosure
                  >
                    {descriptionSelected == "SEODescription" ? "SEO Description" : "Description"}
                  </Button>
                }
                autofocusTarget="first-node"
                onClose={toggleActive('popover1')}
              >
                <ActionList
                  actionRole="menuitem"
                  items={[
                    { content: 'Description', onAction: () => handleDescriptionChange('Description') },
                    { content: 'SEO Description', onAction: () => handleDescriptionChange('SEODescription') }
                  ]}
                />
              </Popover>
            </ButtonGroup>
          </Box>
        </InlineStack>
        <Box
          padding={"200"}
        >
          {filterTemplates?.length > 0 ?
            <Grid>
              {filterTemplates.map((template: any) => (
                <Grid.Cell
                  key={template.id}
                  columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}
                >
                  <TemplateCard
                    title={template.title}
                    description={template.description}
                    content={template.content}
                    onClick={() => handlePreview(template)}
                  />
                </Grid.Cell>
              ))}
            </Grid>
            : (
              <Box paddingBlockStart={"2000"} paddingBlockEnd={"2000"}>
                <InlineStack align="center" direction="row" wrap={true}>
                  <BlockStack gap="200" align="center" inlineAlign="center" reverseOrder>
                    <p>No templates found</p>
                  </BlockStack>
                </InlineStack>
              </Box>
            )}
        </Box>
      </Card>
      <Modal id="preview-modal">
        <Box padding="400">
          <p>{previewModal?.content}</p>
        </Box>
        <TitleBar title="Title">
          <button onClick={handleClosePreview}>Close</button>
        </TitleBar>
      </Modal>
    </Page>
  );
}

export default Index;
