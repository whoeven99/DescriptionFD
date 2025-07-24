import { Box, Button, ButtonGroup, InlineStack, Text } from "@shopify/polaris";
import styles from "./styles.module.css";
import { useState } from "react";

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  content: string;
  loading: boolean;
  added: boolean;
  onClick: () => void;
  handleAdd: () => void;
  handleDelete: () => void;
}

const TemplateCard = ({
  id,
  title,
  description,
  content,
  loading,
  added,
  onClick,
  handleAdd,
  handleDelete,
}: TemplateCardProps) => {
  return (
    <Box
      borderColor="border"
      borderRadius="200"
      borderWidth="050"
      minHeight="360px"
      borderStyle="solid"
    >
      <div className={styles.Ciwi_template_card_content}>
        <div className={styles.Ciwi_template_card_content_markdown}>
          <Text as="p" variant="bodyMd">
            {content}
          </Text>
        </div>
        <div className={styles.Ciwi_template_card_content_name}>
          <Text as="h2" variant="headingMd">
            {title}
          </Text>
          <Text as="span" variant="bodySm">
            {description}
          </Text>
          <Box width="100%">
            <InlineStack align="space-between" wrap={false} direction="row">
              {/* <ButtonGroup> */}
              <Button onClick={onClick}>Preview</Button>
              {!added && (
                <Button onClick={handleAdd} loading={loading}>
                  Add
                </Button>
              )}
              {added && (
                <Button variant="primary" tone="critical" onClick={handleDelete} loading={loading}>
                  Delete
                </Button>
              )}
              {/* </ButtonGroup> */}
            </InlineStack>
          </Box>
        </div>
      </div>
    </Box>
  );
};

export default TemplateCard;
