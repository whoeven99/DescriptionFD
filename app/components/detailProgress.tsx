import {
  BlockStack,
  Box,
  Button,
  Card,
  Grid,
  ProgressBar,
  Text,
} from "@shopify/polaris";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
interface DetailProgressProps {
  total: number;
  unfinished: number;
  moduleName: string;
  status: number;
  progress: number;
}

const DetailProgress: React.FC<DetailProgressProps> = ({
  total,
  unfinished,
  moduleName,
  status,
  progress,
}) => {
  const navigate = useNavigate();

  const stopFetcher = useFetcher<any>();

  useEffect(() => {
    if (stopFetcher.data?.success) {
      navigate("/app/resultManage");
    }
  }, [stopFetcher.data]);

  const handleStop = () => {
    stopFetcher.submit(
      {},
      {
        method: "POST",
        action: "/stopBatchGenerateDescription",
      },
    );
  };

  const pendingDoc = (
    <div>
      <Text as="h2">Creating {moduleName} module: </Text>
      <Text as="h2">
        Completed: {total - unfinished < 0 ? 0 : total - unfinished}, pending:{" "}
        {unfinished}
      </Text>
    </div>
  );

  const finishedDoc = (
    <div>
      <Text as="h2">{moduleName} creation task has been completed</Text>
      <Text as="h2">
        Completed: {total - unfinished < 0 ? 0 : total - unfinished}, pending:{" "}
        {unfinished}
      </Text>
    </div>
  );

  const failedDoc = (
    <div>
      <Text as="h2">Abnormal error, stopped creating {moduleName} module</Text>
      <Text as="h2">
        Completed: {total - unfinished < 0 ? 0 : total - unfinished}, pending:{" "}
        {unfinished}
      </Text>
    </div>
  );

  const tokenExhaustedDoc = (
    <div>
      <Text as="h2">
        Insufficient credit, stopped creating {moduleName} module
      </Text>
      <Text as="h2">
        Completed: {total - unfinished < 0 ? 0 : total - unfinished}, pending:{" "}
        {unfinished}
      </Text>
    </div>
  );

  return (
    !!status && (
      <Card>
        <Box
          paddingBlockStart={"400"}
          paddingBlockEnd={"400"}
          paddingInlineStart={"200"}
          paddingInlineEnd={"200"}
        >
          <Grid columns={{ sm: 3 }}>
            <Grid.Cell columnSpan={{ xs: 4, sm: 2, md: 2, lg: 10, xl: 10 }}>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Task Progress
                </Text>
                {status === 1 && finishedDoc}
                {status === 2 && pendingDoc}
                {status === 3 && tokenExhaustedDoc}
                {status === 4 && failedDoc}
                <Text as="h2">{""}</Text>
                <div style={{ width: "100%" }}>
                  <ProgressBar
                    progress={progress < 0 ? 0 : progress}
                    tone="primary"
                    size="small"
                  />
                </div>
              </BlockStack>
            </Grid.Cell>
            <Grid.Cell
              columnSpan={{
                xs: 2,
                sm: 1,
                md: 1,
                lg: 2,
                xl: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "end",
                  height: "100%",
                }}
              >
                {status === 1 && (
                  <Button
                    onClick={() => {
                      navigate("/app/resultManage");
                    }}
                  >
                    Check content
                  </Button>
                )}
                {status === 2 && (
                  <Button
                    onClick={handleStop}
                    loading={
                      stopFetcher.state === "submitting" ? true : undefined
                    }
                  >
                    Stop
                  </Button>
                )}
                {/* {status === 3 && (
                <BlockStack gap="200">
                  <Button
                    variant="primary"
                    onClick={() => {
                    }}
                  >
                    Purchase amount
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                    }}
                  >
                    Continue to create
                  </Button>
                </BlockStack>
              )} */}
                {(status === 4 || status === 3) && (
                  <Button onClick={handleContactSupport}>
                    Contact the Team
                  </Button>
                )}
              </div>
            </Grid.Cell>
          </Grid>
        </Box>
      </Card>
    )
  );
};

export const handleContactSupport = () => {
  // 声明 tidioChatApi 类型
  interface Window {
    tidioChatApi?: {
      open: () => void;
    };
  }

  if ((window as Window)?.tidioChatApi) {
    (window as Window).tidioChatApi?.open();
  } else {
    console.warn("Tidio Chat API not loaded");
  }
};

export default DetailProgress;
