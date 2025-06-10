import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
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
    Spinner,
} from "@shopify/polaris";
import {
    SearchIcon,
    MagicIcon,
    ClockIcon,
    WandIcon,
    DeleteIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    ClipboardIcon
} from '@shopify/polaris-icons';
import dynamic from "next/dist/shared/lib/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import styles from "../styles/styles.module.css"
import { authenticate } from "app/shopify.server";
import axios from "axios";
import { filterAndMapTemplates } from "../app.template";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const adminAuthResult = await authenticate.admin(request);
    const { session, admin } = adminAuthResult;
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
        shop: session?.shop,
        server: process.env.SERVER_URL,
        shopOwnerName: data.data.shop.shopOwnerName,
    };
};

const Index = () => {
    const { shopOwnerName, server, shop } = useLoaderData<typeof loader>();
    const [userCost, setUserCost] = useState<any>(async () => {
        const response = await axios.post(`${server}/apg/userCounter/getUserCounter?shopName=${shop}`);
        if (response.data.success) {
            setUserCost({
                allCounter: response.data.response?.allCounter || 10,
                productCounter: response.data.response?.productCounter || 1,
                productSeoCounter: response.data.response?.productSeoCounter || 0,
                collectionCounter: response.data.response?.collectionCounter || 0,
                collectionSeoCounter: response.data.response?.collectionSeoCounter || 0,
                extraCounter: response.data.response?.extraCounter || 0,
            });
        } else {
            setUserCost({
                allCounter: 10,
                productCounter: 1,
                productSeoCounter: 0,
                collectionCounter: 0,
                collectionSeoCounter: 0,
                extraCounter: 0,
            })
        }
    });
    const [pageType, setPageType] = useState<string>("product");
    const [contentType, setContentType] = useState<"Description" | "SEODescription">("Description");
    const [textValue, setTextValue] = useState<string>("");
    const [template, setTemplate] = useState<string>("");
    const [seoKeyword, setSeoKeyword] = useState<string>("");
    const [additionalInformation, setAdditionalInformation] = useState<string>("");
    const [language, setLanguage] = useState<string>("English");
    const [model, setModel] = useState<string>("GPT-4.1 Mini");
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
    const [isEdit, setIsEdit] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [modelPopoverActive, setModelPopoverActive] = useState(false);
    const [seoKeywordError, setSeoKeywordError] = useState("");
    const [productError, setProductError] = useState("");
    const [originalData, setOriginalData] = useState<any>(null);
    const [editedData, setEditedData] = useState<any>(null);
    const [templates, setTemplates] = useState<any>(null);

    const isFirstLoad = useRef(true);

    const filterTemplates = useMemo(() => {
        if (!templates) return [];
        const allTemplates = Object.values(templates).reduce((acc: any[], curr: any) => {
            // 2. 获取当前 contentType 的模板
            const templatesByContentType = curr[contentType] || [];
            // 3. 筛选出 type 匹配 pageType 的模板
            const filteredTemplates = templatesByContentType.filter(
                (template: any) => template.type === pageType
            );
            // 4. 合并到结果数组
            return [...acc, ...filteredTemplates];
        }, [] as any[]);

        return allTemplates;
    }, [pageType, contentType, templates]);

    const fetcher = useFetcher<any>();
    const publishFetcher = useFetcher<any>();

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

    useEffect(() => {
        if (pageType === "product") {
            setOptions([]);
            setLoading(true);
            if (isFirstLoad.current) {
                fetcher.submit({ query: textValue }, { method: "POST", action: "/getProductInfo" });
                isFirstLoad.current = false;
            }
        } else {
            setOptions([]);
            setLoading(true);
            if (isFirstLoad.current) {
                fetcher.submit({ query: textValue }, { method: "POST", action: "/getCollectionInfo" });
                isFirstLoad.current = false;
            }
        }
    }, [pageType, textValue]);

    useEffect(() => {
        if (!templates) return;
        console.log(templates);
        const templateId = templates?.[0]?.[contentType]?.find(
            (template: any) => template.type === pageType
        )?.id;
        setTemplate(templateId);
    }, [pageType, contentType, templates]);

    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.success) {
                setLoading(false);
                setOptions((prev) => [...prev, ...fetcher.data!.response.data.map((item: any) => ({ id: item.id, label: item.title, value: item.id, media: <Thumbnail source={item.image} alt={item.title} /> }))]);
                setWillLoadMoreResults(fetcher.data!.response.hasNextPage);
                setEndCursor(fetcher.data!.response.endCursor);
            }
        }
    }, [fetcher.data]);

    useEffect(() => {
        if (publishFetcher.data) {
            shopify.toast.show("Description published successfully");
        }
    }, [publishFetcher.data]);

    const updateSelection = useCallback(
        (selected: string[]) => {
            setSelectedOptions(selected);
            if (selected.length === 0) {
                setProductError(`${pageType === "product" ? "Product" : "Collection"} is required`);
            } else {
                setProductError("");
            }
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
            if (pageType === "product") {
                setTimeout(() => {
                    fetcher.submit({ endCursor: endCursor, query: textValue }, { method: "POST", action: "/getProductInfo" });
                }, 1000);
            } else {
                setTimeout(() => {
                    fetcher.submit({ endCursor: endCursor, query: textValue }, { method: "POST", action: "/getCollectionInfo" });
                }, 1000);
            }
        }
    }, [willLoadMoreResults, endCursor, options.length]);

    const handleModelChange = useCallback((value: string) => {
        setModel(value);
        setModelPopoverActive(false);
    }, []);

    const handlePublish = useCallback(() => {
        publishFetcher.submit({
            id: selectedOptions[0],
            pageType: editedData.pageType,
            contentType: editedData.contentType,
            description: editedData.description,
        }, { method: "POST", action: "/descriptionPublish" });
    }, [selectedOptions, editedData]);

    const handleEdit = useCallback(() => {
        setIsEdit(true);
    }, []);

    const handleConfirm = useCallback(() => {
        setIsEdit(false);
    }, []);

    const handleCancel = useCallback(() => {
        setEditedData(originalData);
        setIsEdit(false);
    }, []);

    const handleGenerate = useCallback(async () => {
        setIsEdit(false);
        setEditedData(null);
        setOriginalData(null);
        let errors = false;
        if (seoKeyword.length === 0) {
            setSeoKeywordError("SEOKeyword is required");
            errors = true;
        } else {
            setSeoKeywordError("");
        }
        if (selectedOptions.length === 0) {
            setProductError(`${pageType === "product" ? "Product" : "Collection"} is required`);
            errors = true;
        } else {
            setProductError("");
        }
        if (errors) {
            return;
        }
        setIsGenerating(true);

        const response = await axios.post(`${server}/apg/descriptionGeneration/generateDescription?shopName=${shop}`, {
            pageType: pageType,
            contentType: contentType,
            id: selectedOptions[0],
            seoKeyword: seoKeyword,
            templateId: template || 1,
            additionalInformation: additionalInformation,
            language: language,
            test: false,
            model: "gpt-4o-mini",
        });
        if (response.data.success) {
            setIsGenerating(false);
            setEditedData({
                ...response.data.response,
                description: response.data.response.description.replace(/\n/g, "<br/>")
            });
            setOriginalData({
                ...response.data.response,
                description: response.data.response.description.replace(/\n/g, "<br/>")
            });
            if (response.data.response.pageType === "product" && contentType === "Description") {
                setUserCost({
                    ...userCost,
                    productCounter: userCost.productCounter + 1,
                });
            } else if (response.data.response.pageType === "product" && contentType === "SEODescription") {
                setUserCost({
                    ...userCost,
                    productSeoCounter: userCost.productSeoCounter + 1,
                });
            } else if (response.data.response.pageType === "collection" && contentType === "Description") {
                setUserCost({
                    ...userCost,
                    collectionCounter: userCost.collectionCounter + 1,
                });
            } else if (response.data.response.pageType === "collection" && contentType === "SEODescription") {
                setUserCost({
                    ...userCost,
                    collectionSeoCounter: userCost.collectionSeoCounter + 1,
                });
            }
        } else {
            setIsGenerating(false);
            shopify.toast.show("Failed to generate description");
        }
    }, [selectedOptions, pageType, contentType, seoKeyword, additionalInformation, language, template]);

    return (
        userCost && "productCounter" in userCost ?
            (<Page
                title={`Hi ${shopOwnerName}!`}
                subtitle="Welcome to our app! If you have any questions, feel free to email us at support@ciwi.ai, and we will respond as soon as possible."
                compactTitle
            >
                <BlockStack gap="500">
                    <Layout>
                        <Layout.Section>
                            <div>
                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 8 }}>
                                        <Card>
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
                                                                    {userCost.productCounter}
                                                                </Text>
                                                            </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                            <div className={styles.Ciwi_Analytics_Metric + " " + styles.Ciwi_Analytics_Metrics_RightTop}>
                                                                <Text as="p" variant="bodyMd">
                                                                    Product SEO description
                                                                </Text>
                                                                <Text as="p" variant="headingXl">
                                                                    {userCost.productSeoCounter}
                                                                </Text>
                                                            </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                            <div className={styles.Ciwi_Analytics_Metric + " " + styles.Ciwi_Analytics_Metrics_LeftDown}>
                                                                <Text as="p" variant="bodyMd">
                                                                    Collection description
                                                                </Text>
                                                                <Text as="p" variant="headingXl">
                                                                    {userCost.collectionCounter}
                                                                </Text>
                                                            </div>
                                                        </Grid.Cell>
                                                        <Grid.Cell columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
                                                            <div className={styles.Ciwi_Analytics_Metric + " " + styles.Ciwi_Analytics_Metrics_RightDown}>
                                                                <Text as="p" variant="bodyMd">
                                                                    Collection SEO description
                                                                </Text>
                                                                <Text as="p" variant="headingXl">
                                                                    {userCost.collectionSeoCounter}
                                                                </Text>
                                                            </div>
                                                        </Grid.Cell>
                                                    </Grid>
                                                </div>
                                            </BlockStack>
                                        </Card>
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4 }}>
                                        <Card background="bg-surface" padding="400">
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
                                                            {(userCost.productCounter + userCost.collectionCounter) * 0.5 + (userCost.productSeoCounter + userCost.collectionSeoCounter) * 0.3}
                                                        </Text>
                                                        <Text as="p" variant="bodyMd">
                                                            hours
                                                        </Text>
                                                    </InlineStack>
                                                </div>
                                            </BlockStack>
                                        </Card>
                                    </Grid.Cell>
                                </Grid>
                            </div>
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
                                                    onChange={(value) => {
                                                        setPageType(value);
                                                        setSelectedOptions([]);
                                                        setTextValue("");
                                                        isFirstLoad.current = true;
                                                    }}
                                                />
                                                <Select
                                                    label="Content type"
                                                    options={[
                                                        { label: "Description", value: "Description" },
                                                        { label: "SEO description", value: "SEODescription" },
                                                    ]}
                                                    value={contentType}
                                                    onChange={(value) => setContentType(value as "Description" | "SEODescription")}
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
                                                                label={pageType === "product" ? "Product" : "Collection"}
                                                                prefix={<Icon source={SearchIcon} tone="base" />}
                                                                placeholder={pageType === "product" ? "Search Product" : "Search Collection"}
                                                                autoComplete="off"
                                                                error={productError}
                                                                value={textValue}
                                                                onChange={(value) => {
                                                                    setTextValue(value);
                                                                    isFirstLoad.current = true;
                                                                }}
                                                            />
                                                        }
                                                    />
                                                }
                                                <TextField
                                                    label="SEO keyword"
                                                    value={seoKeyword}
                                                    placeholder="Keyword"
                                                    error={seoKeywordError}
                                                    onChange={(value) => {
                                                        setSeoKeyword(value);
                                                        if (value.length !== 0) {
                                                            setSeoKeywordError("");
                                                        }
                                                    }}
                                                    autoComplete="off"
                                                />
                                                <Select
                                                    label="Template"
                                                    options={filterTemplates.map((template: any) => ({ label: template.title, value: template.id }))}
                                                    value={template}
                                                    onChange={(value) => setTemplate(value)}
                                                />
                                                <TextField
                                                    label="Additional information"
                                                    value={additionalInformation}
                                                    placeholder="Add unique product details, specifications, key selling points, etc"
                                                    onChange={(value) => setAdditionalInformation(value)}
                                                    multiline={4}
                                                    autoComplete="off"
                                                />
                                                <Select
                                                    label="Language"
                                                    options={[
                                                        { label: "English", value: "English" },
                                                        { label: "French", value: "French" },
                                                        { label: "Spanish", value: "Spanish" },
                                                        { label: "German", value: "German" },
                                                        { label: "Italian", value: "Italian" },
                                                        { label: "Portuguese", value: "Portuguese" },
                                                        { label: "Dutch", value: "Dutch" },
                                                        { label: "Japanese", value: "Japanese" },
                                                        { label: "Chinese", value: "Chinese" },
                                                        { label: "Russian", value: "Russian" },
                                                        { label: "Serbian", value: "Serbian" },
                                                        { label: "Turkish", value: "Turkish" },
                                                        { label: "Tiếng Việt", value: "Tiếng Việt" },
                                                    ]}
                                                    value={language}
                                                    onChange={(value) => setLanguage(value)}
                                                />
                                                <InlineStack gap="200" wrap={false}>
                                                    <div style={{ minWidth: "115px" }}>
                                                        <ButtonGroup variant="segmented">
                                                            <Popover
                                                                active={modelPopoverActive}
                                                                preferredAlignment="right"
                                                                activator={
                                                                    <Button
                                                                        variant="tertiary"
                                                                        onClick={() => setModelPopoverActive(!modelPopoverActive)}
                                                                        disclosure
                                                                    >
                                                                        {model}
                                                                    </Button>
                                                                }
                                                                autofocusTarget="first-node"
                                                                onClose={() => setModelPopoverActive(false)}
                                                            >
                                                                <ActionList
                                                                    actionRole="menuitem"
                                                                    items={[{ content: 'GPT-4.1 Mini', onAction: () => handleModelChange("GPT-4.1 Mini") }]}
                                                                />
                                                            </Popover>
                                                        </ButtonGroup>
                                                    </div>

                                                    <Button
                                                        fullWidth
                                                        variant="primary"
                                                        icon={MagicIcon}
                                                        onClick={handleGenerate}
                                                        loading={isGenerating}
                                                    >
                                                        Generate
                                                    </Button>
                                                </InlineStack>
                                            </BlockStack>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8 }}>
                                            <div className={styles.Ciwi_QuickGenerator_Result + " " + (editedData && !isEdit ? styles.hasResult : "") + " " + (isEdit ? styles.isEdit : "")}>
                                                {!editedData && !isGenerating ? <div className={styles.Ciwi_QuickGenerator_Result_Empty}>
                                                    <Text as="p" variant="bodyMd">
                                                        Generated content will appear here
                                                    </Text>
                                                </div> : null}
                                                {isGenerating ? <div className={styles.Ciwi_QuickGenerator_Result_Loading}>
                                                    <SkeletonBodyText lines={10} />
                                                </div> : null}
                                                {editedData && !isGenerating ? <div className={styles.Ciwi_QuickGenerator_Result_Content}>
                                                    {isEdit ?
                                                        <div className={styles.Ciwi_QuickGenerator_Result_Editor}>
                                                            <ReactQuill value={editedData.description} onChange={(value) => setEditedData({ ...editedData, description: value })} style={{ height: "590px" }} />
                                                        </div>
                                                        :
                                                        <div className={styles.Ciwi_QuickGenerator_Result_Markdown}>
                                                            <div dangerouslySetInnerHTML={{ __html: editedData.description }} />
                                                        </div>
                                                    }
                                                    <div className={styles.Ciwi_QuickGenerator_Result_Feedback + " " + (isEdit ? styles.Edit_Button : "")}>
                                                        {isEdit ?
                                                            <ButtonGroup>
                                                                <Button onClick={handleConfirm}>Confirm</Button>
                                                                <Button onClick={handleCancel}>Cancel</Button>
                                                            </ButtonGroup>
                                                            :
                                                            <>
                                                                <ButtonGroup>
                                                                    <Button onClick={handlePublish} loading={publishFetcher.state === "submitting"}>Publish</Button>
                                                                    <Button onClick={handleEdit}>Edit</Button>
                                                                </ButtonGroup>
                                                                <InlineStack gap="100">
                                                                    <Button icon={ClipboardIcon} variant="tertiary" />
                                                                    <Button icon={ThumbsUpIcon} variant="tertiary" />
                                                                    <Button icon={ThumbsDownIcon} variant="tertiary" />
                                                                </InlineStack>
                                                            </>
                                                        }
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
            </Page >)
            :
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh"
                }}
            >
                <Spinner />
            </div>
    )
}

export default Index;
