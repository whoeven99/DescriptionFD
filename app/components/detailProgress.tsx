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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
interface DetailProgressProps {
  total: number;
  unfinished: number;
  moduleName: string;
  status: number;
  progress: number;
  handleStop: () => void;
  loading: boolean;
}

const DetailProgress: React.FC<DetailProgressProps> = ({
  total,
  unfinished,
  moduleName,
  status,
  progress,
  handleStop,
  loading,
}) => {
  const navigate = useNavigate();

  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0);

  const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tipTexts = useMemo(
    () => [
      `Creating ${moduleName} module: `,
      "Each product takes about 10-20 seconds to create...",
      "Syncing outline to AI model",
      "AI big models are returning content",
    ],
    [],
  );

  useEffect(() => {
    return () => {
      if (tipIntervalRef.current) {
        clearInterval(tipIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status === 2) {
      startTipTimer();
    } else {
      stopTipTimer();
    }
  }, [status]);

  const startTipTimer = useCallback(() => {
    setCurrentTipIndex(0);
    tipIntervalRef.current = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tipTexts.length);
    }, 2000);
  }, [tipTexts.length]);

  const stopTipTimer = useCallback(() => {
    if (tipIntervalRef.current) {
      clearInterval(tipIntervalRef.current);
      tipIntervalRef.current = null;
    }
    setCurrentTipIndex(0);
  }, []);

  const pendingDoc = (
    <div>
      <Text as="h2">{tipTexts[currentTipIndex]}</Text>
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
                  <Button onClick={handleStop} loading={loading}>
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
