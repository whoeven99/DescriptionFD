import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const productId = formData.get("productId");
  try {
    const response = await admin.graphql(
      `#graphql
          query product($id: ID!) {
            product(id: $id) {
                id
                title
                status
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
          }`,
      {
        variables: {
          id: productId,
        },
      },
    );
    const responseJson = await response.json();
    return {
      success: true,
      errorCode: null,
      errorMessage: null,
      response: responseJson!.data!.product,
    };
  } catch (error: any) {
    console.error(`${shop} getProductInfo firstCursor error`);
    console.error("error: ", error);
    return {
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      errorMessage: "Internal server error",
      response: null,
    };
  }
};
