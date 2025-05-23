import { useCallback, useEffect, useMemo, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
    Page,
    Layout,
    Text,
    Card,
    Button,
    BlockStack,
    InlineStack,
    Grid,
    Select,
    Autocomplete,
    Icon,
    TextField,
    ButtonGroup,
    Popover,
    ActionList,
    Box,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";
import {
    SearchIcon,
    MagicIcon,
    ChevronDownIcon,
    ClockIcon,
    WandIcon
} from '@shopify/polaris-icons';
import styles from "./styles.module.css"

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin } = await authenticate.admin(request);
    const response = await admin.graphql(
        `#graphql
    query {
      shop {
        shopOwnerName
      }
    }`,
    );

    const data = await response.json();
    console.log(data.data.shop.shopOwnerName);

    return {
        shopOwnerName: data.data.shop.shopOwnerName,
    };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);
    const color = ["Red", "Orange", "Yellow", "Green"][
        Math.floor(Math.random() * 4)
    ];
    const response = await admin.graphql(
        `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
        {
            variables: {
                product: {
                    title: `${color} Snowboard`,
                },
            },
        },
    );
    const responseJson = await response.json();

    const product = responseJson.data!.productCreate!.product!;
    const variantId = product.variants.edges[0]!.node!.id!;

    const variantResponse = await admin.graphql(
        `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
        {
            variables: {
                productId: product.id,
                variants: [{ id: variantId, price: "100.00" }],
            },
        },
    );

    const variantResponseJson = await variantResponse.json();

    return {
        product: responseJson!.data!.productCreate!.product,
        variant:
            variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
    };
};

export default function Index() {
    const { shopOwnerName } = useLoaderData<typeof loader>();


    const deselectedOptions = useMemo(
        () => [
            { value: 'rustic', label: 'Rustic' },
            { value: 'antique', label: 'Antique' },
            { value: 'vinyl', label: 'Vinyl' },
            { value: 'vintage', label: 'Vintage' },
            { value: 'refurbished', label: 'Refurbished' },
        ],
        [],
    );
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    // const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(deselectedOptions);
    const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetcher = useFetcher<typeof action>();

    const updateText = useCallback(
        (value: string) => {
            if (!loading) {
                setLoading(true);
            }

            setTimeout(() => {
                if (value === '') {
                    setOptions(deselectedOptions);
                    setLoading(false);
                    return;
                }
                const filterRegex = new RegExp(value, 'i');
                const resultOptions = deselectedOptions.filter((option: { label: string; value: string }) =>
                    option.label.match(filterRegex),
                );
                setOptions(resultOptions);
                setLoading(false);
            }, 300);
        },
        [deselectedOptions, loading],
    );

    const updateSelection = useCallback(
        (selected: string[]) => {
            const selectedText = selected.map((selectedItem) => {
                const matchedOption = options.find((option: { label: string; value: string }) => {
                    return option.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });
            setSelectedOptions(selected);
        },
        [options],
    );

    const handleLoadMoreResults = useCallback(() => {
        if (willLoadMoreResults) {
            console.log("load more");
            setLoading(true);
            fetcher.submit({}, { method: "POST" });
            console.log(fetcher.data);
            setLoading(false);
        }
    }, [willLoadMoreResults, options.length]);

    return (
        <Page
            title={`Hi ${shopOwnerName}!`}
            subtitle="Welcome to the app"
            compactTitle
        >
            <BlockStack gap="500">
                <Layout>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="500">
                                <BlockStack gap="200">
                                    <InlineStack gap="100">
                                        <Box>
                                            <Icon source={WandIcon} tone="base" />
                                        </Box>
                                        <Text as="h2" variant="headingMd">
                                            Generated content
                                        </Text>
                                    </InlineStack>
                                    <div className={styles.Ciwi_Analytics_Metrics}>
                                        <Grid columns={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }} gap={{ xs: "0", sm: "0", md: "0", lg: "0", xl: "0" }}>
                                            <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                <div className={styles.Ciwi_Analytics_Metric + " " + styles.Ciwi_Analytics_Metrics_LeftTop}>
                                                    <Text as="p" variant="bodyMd">
                                                        Product description
                                                    </Text>
                                                    <Text as="p" variant="headingXl">
                                                        13
                                                    </Text>
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                <div className={styles.Ciwi_Analytics_Metric + " " + styles.Ciwi_Analytics_Metrics_RightTop}>
                                                    <Text as="p" variant="bodyMd">
                                                        Product SEO description
                                                    </Text>
                                                    <Text as="p" variant="headingXl">
                                                        1
                                                    </Text>
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                <div className={styles.Ciwi_Analytics_Metric + " " + styles.Ciwi_Analytics_Metrics_LeftDown}>
                                                    <Text as="p" variant="bodyMd">
                                                        Collection description
                                                    </Text>
                                                    <Text as="p" variant="headingXl">
                                                        0
                                                    </Text>
                                                </div>
                                            </Grid.Cell>
                                            <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                <div className={styles.Ciwi_Analytics_Metric + " " + styles.Ciwi_Analytics_Metrics_RightDown}>
                                                    <Text as="p" variant="bodyMd">
                                                        Collection SEO description
                                                    </Text>
                                                    <Text as="p" variant="headingXl">
                                                        0
                                                    </Text>
                                                </div>
                                            </Grid.Cell>
                                        </Grid>
                                    </div>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section variant="oneThird">
                        <BlockStack gap="500">
                            <Card>
                                <BlockStack gap="200">
                                    <InlineStack gap="100">
                                        <Box>
                                            <Icon source={ClockIcon} tone="base" />
                                        </Box>
                                        <Text as="h2" variant="headingMd">
                                            Time saved
                                        </Text>
                                    </InlineStack>
                                    <div className={styles.Ciwi_Analytics_TimeSaved}>
                                        <InlineStack gap="050" blockAlign="end" direction="row" align="center">
                                            <Text as="p" variant="heading3xl">
                                                10
                                            </Text>
                                            <Text as="p" variant="bodyMd">
                                                hours
                                            </Text>
                                        </InlineStack>
                                    </div>
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>
                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4 }}>
                                        <BlockStack gap="400">
                                            <InlineStack gap="100">
                                                <Box>
                                                    <Icon
                                                        source={MagicIcon}
                                                        tone="base"
                                                    />
                                                </Box>
                                                <Text as="h2" variant="headingMd">
                                                    Quick generator
                                                </Text>
                                            </InlineStack>
                                            <Select
                                                label="Page type"
                                                options={[
                                                    { label: "Product", value: "product" },
                                                    { label: "Collection", value: "collection" },
                                                ]}
                                            />
                                            <Select
                                                label="Content type"
                                                options={[
                                                    { label: "Description", value: "description" },
                                                    { label: "SEO description", value: "seo_description" },
                                                ]}
                                            />
                                            <Autocomplete
                                                options={options}
                                                selected={selectedOptions}
                                                onSelect={updateSelection}
                                                loading={loading}
                                                onLoadMoreResults={handleLoadMoreResults}
                                                willLoadMoreResults={willLoadMoreResults}
                                                textField={
                                                    <Autocomplete.TextField
                                                        onChange={updateText}
                                                        label="Product"
                                                        prefix={<Icon source={SearchIcon} tone="base" />}
                                                        placeholder="Search Product"
                                                        autoComplete="off"
                                                    />
                                                }
                                            />
                                            <TextField
                                                label="SEO keyword"
                                                value={""}
                                                placeholder="Keyword"
                                                onChange={() => { }}
                                                autoComplete="off"
                                            />
                                            <Select
                                                label="Template"
                                                options={[
                                                    { label: "Product 1", value: "product1" },
                                                    { label: "Product 2", value: "product2" },
                                                ]}
                                            />
                                            <TextField
                                                label="Shipping address"
                                                value={""}
                                                placeholder="Add unique product details, specifications, key selling points, etc"
                                                onChange={() => { }}
                                                multiline={4}
                                                autoComplete="off"
                                            />
                                            <Select
                                                label="Language"
                                                options={[
                                                    { label: "English", value: "en" },
                                                    { label: "French", value: "fr" },
                                                ]}
                                            />
                                            <InlineStack gap="200" wrap={false}>
                                                <div style={{ minWidth: "115px" }}>
                                                    <ButtonGroup variant="segmented">
                                                        <Popover
                                                            active={false}
                                                            preferredAlignment="right"
                                                            activator={
                                                                <Button variant="tertiary" icon={ChevronDownIcon}>
                                                                    GPT-4.1 Mini
                                                                </Button>
                                                            }
                                                            autofocusTarget="first-node"
                                                            onClose={() => { }}
                                                        >
                                                            <ActionList
                                                                actionRole="menuitem"
                                                                items={[{ content: 'Save as draft' }]}
                                                            />
                                                        </Popover>
                                                    </ButtonGroup>
                                                </div>

                                                <Button fullWidth variant="primary" icon={MagicIcon}>Generate</Button>
                                            </InlineStack>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8 }}>
                                        <div className={styles.Ciwi_QuickGenerator_Result}>
                                            <div className={styles.Ciwi_QuickGenerator_Result_Empty}>
                                                <Text as="p" variant="bodyMd">
                                                    Generated content will appear here
                                                </Text>
                                            </div>
                                        </div>
                                    </Grid.Cell>
                                </Grid>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page >
    );
}
