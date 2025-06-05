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
        collections(first: $first, after: $endCursor, query: $query) {
          edges {
            node {
              id
              title
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
    console.log(responseJson.data.collections.edges[0].node);
    return {
        success: true,
        errorCode: null,
        errorMessage: null,
        response: {
            data: responseJson!.data!.collections!.edges.map((edge: any) => ({
                id: edge.node.id,
                title: edge.node.title,
                image: "",
            })),
            hasNextPage: responseJson!.data!.collections!.pageInfo.hasNextPage,
            endCursor: responseJson!.data!.collections!.pageInfo.endCursor,
        },
    };
};