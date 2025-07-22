import { Card, Text } from "@shopify/polaris";

interface DetailProgressProps {
  status: number;
  progress: number;
}

const DetailProgress: React.FC<DetailProgressProps> = ({
  status,
  progress,
}) => {
  return (
    <Card>
      <Text as="h2">DetailProgress</Text>
    </Card>
  );
};

export default DetailProgress;
