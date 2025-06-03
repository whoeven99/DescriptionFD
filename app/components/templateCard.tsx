import { Box, Button, ButtonGroup, InlineStack, Text } from "@shopify/polaris";
import styles from "./styles.module.css";

interface TemplateCardProps {
    title: string;
    description: string;
    content: string;
    onClick: () => void;
}

const TemplateCard = ({ title, description, content, onClick }: TemplateCardProps) => {
    return (
        <Box borderColor="border" borderRadius="200" borderWidth="050" minHeight="360px" borderStyle="solid">
            <div className={styles.Ciwi_template_card_content}>
                <div className={styles.Ciwi_template_card_content_markdown}>
                    <Text as="p" variant="bodyMd">{content}</Text>
                </div>
                <div className={styles.Ciwi_template_card_content_name}>
                    <Text as="h2" variant="headingMd">{title}</Text>
                    <Text as="span" variant="bodySm">{description}</Text>
                    <Box width="100%">
                        <InlineStack align="space-between" wrap={false} direction="row">
                            <ButtonGroup>
                                <Button onClick={onClick} >Preview</Button>
                            </ButtonGroup>
                        </InlineStack>
                    </Box>
                </div>
            </div>
        </Box>
    );
};

export default TemplateCard;


