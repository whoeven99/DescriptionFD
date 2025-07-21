import axios from "axios";

export const getProductsByListId = async ({
  server,
  shop,
  listId,
}: {
  server: string;
  shop: string;
  listId: string[];
}) => {
  try {
    const response = await axios.post(
      `${server}/apg/product/getProductsByListId?shopName=${shop}`,
      listId,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error getProductsByListId",
    };
  }
};

export const saveOrUpdateProduct = async ({
  server,
  shop,
  productId,
}: {
  server: string;
  shop: string;
  productId: string;
}) => {
  try {
    const response = await axios.post(
      `${server}/apg/product/saveOrUpdateProduct?shopName=${shop}`,
      {
        productId: productId,
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error saveOrUpdateProduct",
    };
  }
};

export const GenerateDescription = async ({
  server,
  shop,
  pageType,
  contentType,
  productId,
  languageStyle,
  brandStyle,
  templateId,
  templateType,
  model,
  language,
  seoKeywords,
  brandWord,
  brandSlogan,
}: {
  server: string;
  shop: string;
  pageType: string;
  contentType: string;
  productId: string;
  languageStyle: string;
  brandStyle?: string;
  templateId: number;
  templateType: boolean;
  model: string;
  language: string;
  seoKeywords?: string;
  brandWord?: string;
  brandSlogan?: string;
}) => {
  try {
    console.log({
      server,
      shop,
      pageType,
      contentType,
      productId,
      languageStyle,
      brandStyle,
      templateId,
      templateType,
      model,
      language,
      seoKeywords,
      brandWord,
      brandSlogan,
    });

    const response = await axios.post(
      `${server}/apg/descriptionGeneration/generateDescription?shopName=${shop}`,
      {
        productId: productId,
        textTone: languageStyle,
        brandTone: brandStyle,
        templateId: templateId,
        templateType: templateType,
        model: model,
        language: language,
        seoKeywords: seoKeywords,
        brandWord: brandWord,
        brandSlogan: brandSlogan,
      },
    );
    if (response.data?.success) {
      return {
        ...response.data,
        response: {
          description: response.data.response.replace(/\n/g, "<br/>"),
          pageType: pageType,
          contentType: contentType,
        },
      };
    }
    return response.data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error GenerateDescription",
    };
  }
};

export const GetTemplateByShopName = async ({
  server,
  shop,
  pageType,
  contentType,
}: {
  server: string;
  shop: string;
  pageType: string;
  contentType: string;
}) => {
  try {
    const response = await axios.post(
      `${server}/apg/template/getTemplateByShopName?shopName=${shop}`,
      {
        templateModel: pageType,
        templateSubtype: contentType,
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error GenerateDescription",
    };
  }
};
