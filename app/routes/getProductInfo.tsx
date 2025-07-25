import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const pageSize = formData.get("pageSize");
  const startCursor = formData.get("startCursor");
  const endCursor = formData.get("endCursor");
  const query = formData.get("query");
  switch (true) {
    case !!startCursor:
      console.log(`${shop} getProductInfo firstCursor`);
      console.log("data: ", startCursor, query, pageSize);
      try {
        const response = await admin.graphql(
          `#graphql
          query products($last: Int!, $startCursor: String, $query: String) {
            products(last: $last, before: $startCursor, query: $query) {
              edges {
                node {
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
              }
              pageInfo {
                hasPreviousPage
                startCursor
                hasNextPage
                endCursor
              }
            }
          }`,
          {
            variables: {
              last: Number(pageSize) || 50,
              startCursor: startCursor,
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
              status: edge.node.status,
            })),
            hasPreviousPage:
              responseJson!.data!.products!.pageInfo.hasPreviousPage,
            startCursor: responseJson!.data!.products!.pageInfo.startCursor,
            hasNextPage: responseJson!.data!.products!.pageInfo.hasNextPage,
            endCursor: responseJson!.data!.products!.pageInfo.endCursor,
          },
        };
      } catch (error: any) {
        console.error(`${shop} getProductInfo firstCursor error`);
        console.error("error: ", error);
        return {
          success: false,
          errorCode: "INTERNAL_SERVER_ERROR",
          errorMessage: "Internal server error",
          response: {
            data: [],
            hasPreviousPage: false,
            startCursor: null,
            hasNextPage: false,
            endCursor: null,
          },
        };
      }
    case !!endCursor:
      console.log(`${shop} getProductInfo endCursor`);
      console.log("data: ", endCursor, endCursor, query);
      try {
        const response = await admin.graphql(
          `#graphql
              query products($first: Int!, $endCursor: String, $query: String) {
                products(first: $first, after: $endCursor, query: $query) {
                  edges {
                    node {
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
                  }
                  pageInfo {
                    hasPreviousPage
                    startCursor
                    hasNextPage
                    endCursor
                  }
                }
              }`,
          {
            variables: {
              first: Number(pageSize) || 50,
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
              status: edge.node.status,
            })),
            hasPreviousPage:
              responseJson!.data!.products!.pageInfo.hasPreviousPage,
            startCursor: responseJson!.data!.products!.pageInfo.startCursor,
            hasNextPage: responseJson!.data!.products!.pageInfo.hasNextPage,
            endCursor: responseJson!.data!.products!.pageInfo.endCursor,
          },
        };
      } catch (error: any) {
        console.error(`${shop} getProductInfo endCursor error`);
        console.error("error: ", error);
        return {
          success: false,
          errorCode: "INTERNAL_SERVER_ERROR",
          errorMessage: "Internal server error",
          response: {
            data: [],
            hasPreviousPage: false,
            startCursor: null,
            hasNextPage: false,
            endCursor: null,
          },
        };
      }
    default:
      console.log(`${shop} getProductInfo default`);
      console.log("data: ", query, pageSize);
      try {
        const response = await admin.graphql(
          `#graphql
                query products($first: Int!, $endCursor: String, $query: String) {
                    products(first: $first, after: $endCursor, query: $query) {
                        edges {
                            node {
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
                        }
                        pageInfo {
                            hasPreviousPage
                            startCursor
                            hasNextPage
                            endCursor
                        }
                    }
                }`,
          {
            variables: {
              first: Number(pageSize) || 20,
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
              status: edge.node.status,
            })),
            hasPreviousPage:
              responseJson!.data!.products!.pageInfo.hasPreviousPage,
            startCursor: responseJson!.data!.products!.pageInfo.startCursor,
            hasNextPage: responseJson!.data!.products!.pageInfo.hasNextPage,
            endCursor: responseJson!.data!.products!.pageInfo.endCursor,
          },
        };
      } catch (error: any) {
        console.error(`${shop} getProductInfo default error`);
        console.error("error: ", error);
        return {
          success: false,
          errorCode: "INTERNAL_SERVER_ERROR",
          errorMessage: "Internal server error",
          response: {
            data: [],
            hasPreviousPage: false,
            startCursor: null,
            hasNextPage: false,
            endCursor: null,
          },
        };
      }
  }
};
