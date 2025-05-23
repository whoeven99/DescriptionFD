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
    IconProps,
    ThumbnailProps,
    AvatarProps,
    Thumbnail,
    SkeletonBodyText,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";
import {
    SearchIcon,
    MagicIcon,
    ChevronDownIcon,
    ClockIcon,
    WandIcon,
    DeleteIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    ClipboardIcon
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

    return {
        shopOwnerName: data.data.shop.shopOwnerName,
    };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const endCursor = formData.get("endCursor");
    const query = formData.get("query");
    const response = await admin.graphql(
        `#graphql
      query products($first: Int!, $endCursor: String, $query: String) {
        products(first: $first, after: $endCursor, query: $query) {
          edges {
            node {
              id
              title
              media(first: 1) {
                    edges {
                        node {
                                preview {
                                image {
                                    id
                                    url
                                }
                            }
                        }
                    }
                }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
        {
            variables: {
                first: 50,
                endCursor: endCursor,
                query: query || "",
            },
        },
    );
    const responseJson = await response.json();
    return {
        product: responseJson!.data!.products!.edges.map((edge: any) => ({
            id: edge.node.id,
            title: edge.node.title,
            image: edge.node.media.edges[0]?.node?.preview?.image?.url || "",
        })),
        hasNextPage: responseJson!.data!.products!.pageInfo.hasNextPage,
        endCursor: responseJson!.data!.products!.pageInfo.endCursor,
    };
};

export default function Index() {
    const { shopOwnerName } = useLoaderData<typeof loader>();
    const [pageType, setPageType] = useState<string>("product");
    const [contentType, setContentType] = useState<string>("description");
    const [seoKeyword, setSeoKeyword] = useState<string>("");
    const [template, setTemplate] = useState<string>("product1");
    const [shippingAddress, setShippingAddress] = useState<string>("");
    const [language, setLanguage] = useState<string>("en");
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [options, setOptions] = useState<{
        id: string,
        label: string,
        value: string,
        media?: React.ReactElement<IconProps | ThumbnailProps | AvatarProps>
    }[]>([]);
    const [willLoadMoreResults, setWillLoadMoreResults] = useState(true);
    const [endCursor, setEndCursor] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetcher = useFetcher<typeof action>();
    const generateFetcher = useFetcher<any>();

    useEffect(() => {
        fetcher.submit({}, { method: "POST" });
    }, []);

    useEffect(() => {
        if (fetcher.data) {
            setLoading(false);
            setOptions((prev) => [...prev, ...fetcher.data!.product.map((product: any) => ({ id: product.id, label: product.title, value: product.id, media: <Thumbnail source={product.image} alt={product.title} /> }))]);
            setWillLoadMoreResults(fetcher.data!.hasNextPage);
            setEndCursor(fetcher.data!.endCursor);
        }
    }, [fetcher.data]);

    useEffect(() => {
        console.log(generateFetcher.data);
    }, [generateFetcher.data]);

    const updateSelection = useCallback(
        (selected: string[]) => {
            setSelectedOptions(selected);
        },
        [options],
    );

    const selectedProductItem = useMemo(() => {
        const selectedProduct = options.find((option: { id: string; label: string; value: string; media?: React.ReactElement<IconProps | ThumbnailProps | AvatarProps> }) => {
            return selectedOptions.includes(option.value);
        });
        return (
            selectedProduct ? <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                <InlineStack gap="400" align="space-between" blockAlign="center" direction="row" wrap={false}>
                    <InlineStack gap="400" align="center" blockAlign="center" direction="row" wrap={false}>
                        {/* <Icon source={SearchIcon} tone="base" /> */}
                        {selectedProduct?.media}
                        <Text as="p" variant="bodyMd">
                            {selectedProduct?.label}
                        </Text>
                    </InlineStack>
                    <Button icon={DeleteIcon} variant="tertiary" onClick={() => {
                        setSelectedOptions([]);
                    }} />
                </InlineStack>
            </Box> : null
        )
    }, [options, selectedOptions]);

    const handleLoadMoreResults = useCallback(() => {
        if (willLoadMoreResults && endCursor) {
            setLoading(true);
            setTimeout(() => {
                fetcher.submit({ endCursor }, { method: "POST" });
                console.log(fetcher.data);
            }, 1000);
        }
    }, [willLoadMoreResults, endCursor, options.length]);

    return (
        <Page
            title={`Hi ${shopOwnerName}!`}
            subtitle="Welcome to the app"
            compactTitle
        >
            <BlockStack gap="500">
                <Layout>
                    <Layout.Section>
                        <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 8 }}>
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
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4 }}>
                                <Box background="bg-surface" borderRadius="200" minHeight="100%" padding="400" overflowX="clip" overflowY="clip" borderColor="border">
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
                                                <Text as="p" variant="heading2xl">
                                                    10
                                                </Text>
                                                <Text as="p" variant="bodyMd">
                                                    hours
                                                </Text>
                                            </InlineStack>
                                        </div>
                                    </BlockStack>
                                </Box>
                            </Grid.Cell>
                        </Grid>
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
                                                value={pageType}
                                                onChange={(value) => setPageType(value)}
                                            />
                                            <Select
                                                label="Content type"
                                                options={[
                                                    { label: "Description", value: "description" },
                                                    { label: "SEO description", value: "seo_description" },
                                                ]}
                                                value={contentType}
                                                onChange={(value) => setContentType(value)}
                                            />
                                            {selectedProductItem ? selectedProductItem :
                                                <Autocomplete
                                                    options={options}
                                                    selected={selectedOptions}
                                                    onSelect={updateSelection}
                                                    loading={loading}
                                                    onLoadMoreResults={handleLoadMoreResults}
                                                    willLoadMoreResults={willLoadMoreResults}
                                                    textField={
                                                        <Autocomplete.TextField
                                                            label="Product"
                                                            prefix={<Icon source={SearchIcon} tone="base" />}
                                                            placeholder="Search Product"
                                                            autoComplete="off"
                                                        />
                                                    }
                                                />
                                            }
                                            <TextField
                                                label="SEO keyword"
                                                value={seoKeyword}
                                                placeholder="Keyword"
                                                onChange={(value) => setSeoKeyword(value)}
                                                autoComplete="off"
                                            />
                                            <Select
                                                label="Template"
                                                options={[
                                                    { label: "Product 1", value: "product1" },
                                                    { label: "Product 2", value: "product2" },
                                                ]}
                                                value={template}
                                                onChange={(value) => setTemplate(value)}
                                            />
                                            <TextField
                                                label="Shipping address"
                                                value={shippingAddress}
                                                placeholder="Add unique product details, specifications, key selling points, etc"
                                                onChange={(value) => setShippingAddress(value)}
                                                multiline={4}
                                                autoComplete="off"
                                            />
                                            <Select
                                                label="Language"
                                                options={[
                                                    { label: "English", value: "en" },
                                                    { label: "French", value: "fr" },
                                                ]}
                                                value={language}
                                                onChange={(value) => setLanguage(value)}
                                            />
                                            <InlineStack gap="200" wrap={false}>
                                                <div style={{ minWidth: "115px" }}>
                                                    <ButtonGroup variant="segmented">
                                                        <Popover
                                                            active={false}
                                                            preferredAlignment="right"
                                                            activator={
                                                                <Button
                                                                    variant="tertiary"
                                                                    icon={ChevronDownIcon}
                                                                >
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

                                                <Button
                                                    fullWidth
                                                    variant="primary"
                                                    icon={MagicIcon}
                                                    onClick={() => {
                                                        generateFetcher.submit({
                                                            pageType,
                                                            contentType,
                                                            seoKeyword,
                                                            template,
                                                            shippingAddress,
                                                            language,
                                                        }, { method: "POST", action: "/aiGenerateDescription" });
                                                    }}
                                                    loading={generateFetcher.state === "submitting"}
                                                >
                                                    Generate
                                                </Button>
                                            </InlineStack>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8 }}>
                                        <div className={styles.Ciwi_QuickGenerator_Result + " " + (generateFetcher.data ? styles.hasResult : "")}>
                                            {!generateFetcher.data && generateFetcher.state !== "submitting" ? <div className={styles.Ciwi_QuickGenerator_Result_Empty}>
                                                <Text as="p" variant="bodyMd">
                                                    Generated content will appear here
                                                </Text>
                                            </div> : null}
                                            {generateFetcher.state === "submitting" ? <div className={styles.Ciwi_QuickGenerator_Result_Loading}>
                                                <SkeletonBodyText lines={10} />
                                            </div> : null}
                                            {generateFetcher.data && generateFetcher.state !== "submitting" ? <div className={styles.Ciwi_QuickGenerator_Result_Content}>
                                                <div className={styles.Ciwi_QuickGenerator_Result_Markdown}>
                                                    <Text as="p" variant="bodyMd">
                                                        {generateFetcher.data.data.description}
                                                    </Text>
                                                </div>
                                                <div className={styles.Ciwi_QuickGenerator_Result_Feedback}>
                                                    <ButtonGroup>
                                                        <Button >Publish</Button>
                                                        <Button >Edit</Button>
                                                    </ButtonGroup>
                                                    <InlineStack gap="100">
                                                        <Button icon={ClipboardIcon} variant="tertiary" />
                                                        <Button icon={ThumbsUpIcon} variant="tertiary" />
                                                        <Button icon={ThumbsDownIcon} variant="tertiary" />
                                                    </InlineStack>
                                                </div>
                                            </div> : null}
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
