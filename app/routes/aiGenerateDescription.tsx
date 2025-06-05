import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const id = formData.get("id");
    const pageType = formData.get("pageType");
    const contentType = formData.get("contentType");

    console.log(pageType, contentType);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
        success: true,
        errorCode: null,
        errorMessage: null,
        data: {
            id: id,
            pageType: pageType,
            contentType: contentType,
            description: `This is a ${pageType} ${contentType} description`,
        },
    };
}; 
