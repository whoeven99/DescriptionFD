import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { admin } = await authenticate.admin(request);

    const formData = await request.formData();

    const productId = formData.get("productId");
    const description = formData.get("description");

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
                    "id": productId,
                    "descriptionHtml": description
                }
            },
        },
    );

    const data = await response.json();
    console.log(data);

    return {
        success: true,
        errorCode: null,
        errorMessage: null,
        data: data.data?.productUpdate?.product?.descriptionHtml,
    };
}; 
