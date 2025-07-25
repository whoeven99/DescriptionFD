import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    const formData = await request.formData();

    const id = formData.get("id");
    const pageType = formData.get("pageType");
    const contentType = formData.get("contentType");
    const description = formData.get("description");

    console.log("descriptionPublish: ", {
        id,
        pageType,
        contentType,
        description,
    });

    if (pageType === "product" && contentType === "description") {
        const response = await admin.graphql(
            `#graphql
            mutation UpdateProduct($product: ProductUpdateInput!) {
                productUpdate(product: $product) {
                    product {
                        id
                        descriptionHtml
                    }
                    userErrors {    
                        field
                        message
                    }
                }
            }
            `,
            {
                variables: {
                    "product": {
                        "id": id,
                        "descriptionHtml": description
                    }
                },
            },
        );

        const data = await response.json();
        if (data.data?.productUpdate?.product?.descriptionHtml) {
            console.log("data: ", data.data?.productUpdate?.product?.descriptionHtml);
            return {
                success: true,
                errorCode: null,
                errorMessage: null,
                data: data.data?.productUpdate?.product?.descriptionHtml,
            };
        } else {
            console.log("data: ", data.data?.productUpdate?.userErrors[0]);
            return {
                success: false,
                errorCode: data.data?.productUpdate?.userErrors[0].code,
                errorMessage: data.data?.productUpdate?.userErrors[0].message,
                data: null,
            };
        }
    } else if (pageType === "product" && contentType === "seo") {
        const response = await admin.graphql(
            `#graphql
            mutation UpdateProduct($product: ProductUpdateInput!) {
                productUpdate(product: $product) {
                    product {
                        id
                        seo {
                            description
                        }
                    }
                    userErrors {    
                        field
                        message
                    }
                }
            }
            `,
            {
                variables: {
                    "product": {
                        "id": id,
                        "seo": {
                            "description": description
                        }
                    }
                },
            },
        );

        const data = await response.json();
        if (data.data?.productUpdate?.product?.seo?.description) {
            console.log("data: ", data.data?.productUpdate?.product?.seo?.description);
            return {
                success: true,
                errorCode: null,
                errorMessage: null,
                data: data.data?.productUpdate?.product?.seo?.description,
            };
        } else {
            console.log("data: ", data.data?.productUpdate?.userErrors[0]);
            return {
                success: false,
                errorCode: data.data?.productUpdate?.userErrors[0].code,
                errorMessage: data.data?.productUpdate?.userErrors[0].message,
                data: null,
            };
        }
    } else if (pageType === "collection" && contentType === "description") {
        const response = await admin.graphql(
            `#graphql
            mutation UpdateCollection($input: CollectionInput!) {
                collectionUpdate(input: $input) {
                    collection {
                        id
                        descriptionHtml
                    }
                    userErrors {    
                        field
                        message
                    }
                }       
            }
            `,
            {
                variables: {
                    "input": {
                        "id": id,
                        "descriptionHtml": description
                    }
                },
            },
        );

        const data = await response.json();
        if (data.data?.collectionUpdate?.collection?.descriptionHtml) {
            console.log("data: ", data.data?.collectionUpdate?.collection?.descriptionHtml);
            return {
                success: true,
                errorCode: null,
                errorMessage: null,
                data: data.data?.collectionUpdate?.collection?.descriptionHtml,
            };
        } else {
            console.log("data: ", data.data?.collectionUpdate?.userErrors[0]);
            return {
                success: false,
                errorCode: data.data?.collectionUpdate?.userErrors[0].code,
                errorMessage: data.data?.collectionUpdate?.userErrors[0].message,
                data: null,
            };
        }
    } else if (pageType === "collection" && contentType === "seo") {
        const response = await admin.graphql(
            `#graphql
            mutation UpdateCollection($input: CollectionInput!) {
                collectionUpdate(input: $input) {
                    collection {
                        id
                        seo {
                            description
                        }
                    }
                    userErrors {    
                        field
                        message
                    }
                }
            }
            `,
            {
                variables: {
                    "input": {
                        "id": id,
                        "seo": {
                            "description": description
                        }
                    }
                },
            },
        );

        const data = await response.json();
        if (data.data?.collectionUpdate?.collection?.seo?.description) {
            console.log("data: ", data.data?.collectionUpdate?.collection?.seo?.description);
            return {
                success: true,
                errorCode: null,
                errorMessage: null,
                data: data.data?.collectionUpdate?.collection?.seo?.description,
            };
        } else {
            console.log("data: ", data.data?.collectionUpdate?.userErrors[0]);
            return {
                success: false,
                errorCode: data.data?.collectionUpdate?.userErrors[0].code,
                errorMessage: data.data?.collectionUpdate?.userErrors[0].message,
                data: null,
            };
        }
    }
};

