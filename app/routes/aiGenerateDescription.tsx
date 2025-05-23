import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    await authenticate.admin(request);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
        success: true,
        errorCode: null,
        errorMessage: null,
        data: {
            description: "This is a description",
        },
    };
}; 
