import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
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

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/template">Template</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
