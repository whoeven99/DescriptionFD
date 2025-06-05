import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

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
        success: true,
        errorCode: null,
        errorMessage: null,
        response: {
            data: responseJson!.data!.products!.edges.map((edge: any) => ({
                id: edge.node.id,
                title: edge.node.title,
                image: edge.node.media.edges[0]?.node?.preview?.image?.url || "",
            })),
            hasNextPage: responseJson!.data!.products!.pageInfo.hasNextPage,
            endCursor: responseJson!.data!.products!.pageInfo.endCursor,
        },
    };
};