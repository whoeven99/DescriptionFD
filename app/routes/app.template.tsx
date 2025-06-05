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
import { useCallback, useEffect, useMemo, useState } from "react";
import TemplateCard from "app/components/templateCard";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import axios from "axios";


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const adminAuthResult = await authenticate.admin(request);
  const { session } = adminAuthResult;
  return {
    shop: session.shop,
    server: process.env.SERVER_URL,
  };
};

const Index = () => {
  const { shop, server } = useLoaderData<typeof loader>();
  const [mainSelected, setMainSelected] = useState(0);
  const [secondarySelected, setSecondarySelected] = useState(0);
  const [descriptionSelected, setDescriptionSelected] = useState<"Description" | "SEODescription">("Description");
  const [previewModal, setPreviewModal] = useState<any>(null);
  const [active, setActive] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any>(null);

  const filterTemplates = useMemo(() => {
    if (!templates) return [];
    const list = templates[mainSelected]?.[descriptionSelected] || [];
    return list.filter((template: any) => {
      if (secondarySelected === 0) return true; // "All" 标签
      if (secondarySelected === 1) return template.type === "product"; // "Product" 标签
      if (secondarySelected === 2) return template.type === "collection"; // "Collection" 标签
      return true;
    });
  }, [templates, mainSelected, descriptionSelected, secondarySelected]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTemplates() {
      const response = await axios.post(`${server}/apg/template/getAllTemplateData?shopName=${shop}`);
      if (response.data.success) {
        const data = response.data.response;
        setTemplates({
          0: {
            Description: filterAndMapTemplates(data, "system", 0),
            SEODescription: filterAndMapTemplates(data, "system", 1),
          },
          1: {
            Description: filterAndMapTemplates(data, "custom", 0),
            SEODescription: filterAndMapTemplates(data, "custom", 1),
          },
        });
      } else {
        setTemplates(null);
      }
    }
    fetchTemplates();
  }, []);

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
    // primaryAction={{
    //   content: "Create template",
    //   onAction: () => {
    //     navigate("/app/template/create");
    //   },
    // }}
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
          <div dangerouslySetInnerHTML={{ __html: previewModal?.content.replace(/\n/g, "<br/>") }} />
        </Box>
        <TitleBar title={previewModal?.title}>
          <button onClick={handleClosePreview}>Close</button>
        </TitleBar>
      </Modal>
    </Page>
  );
}

export function filterAndMapTemplates(data: any[], shopName: string, seo: number) {
  return data
    .filter(item => (shopName === "system" ? item.shopName === "system" : item.shopName !== "system") && item.templateSeo === seo)
    .map(item => ({
      id: item.id,
      title: item.templateTitle,
      description: item.templateDescription,
      content: item.templateData,
      type: item.templateType ? "collection" : "product",
    }));
}

export default Index;
