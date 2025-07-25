import { PassThrough } from "stream";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import {
  createReadableStreamFromReadable,
  type EntryContext,
} from "@remix-run/node";
import { isbot } from "isbot";
import { addDocumentResponseHeaders } from "./shopify.server";
import { renderHeadToString } from 'remix-island';
import { Head } from './root'

export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? '')
    ? "onAllReady"
    : "onShellReady";

  function MainApp() {
    return (
      <RemixServer
        context={remixContext}
        url={request.url}
      />
    );
  }

  let markup = renderToString(<MainApp />);

  let head = renderHeadToString({ request, remixContext, Head })

  const html = `<!DOCTYPE html>${head}<body><div id="root">${markup}</div></body></html>`;

  responseHeaders.set("Content-Type", "text/html");

  return new Response(html, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
