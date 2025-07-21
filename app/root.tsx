import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./style.css";
import { createHead } from "remix-island";

export default function App() {
  return (
    <>
      <Head />
      <Outlet />
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="shopify-debug" content="web-vitals" />
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
    <link rel="preconnect" href="https://cdn.shopify.com/" />
    <link
      rel="stylesheet"
      href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
    />
    <Meta />
    <Links />
  </>
));
