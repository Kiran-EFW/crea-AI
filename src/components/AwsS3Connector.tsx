import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { ExternalLink, Cloud } from "lucide-react";

export function AwsS3Connector() {
  const { settings, refreshSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "aws-s3-oauth-return") {
        await refreshSettings();
        toast.success("Successfully connected to AWS S3!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  if (settings?.aws?.accessKeyId) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1">AWS S3</h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://console.aws.amazon.com/s3/",
                );
              }}
              className="ml-2 px-2 py-1 h-8 mb-2"
              style={{ display: "inline-flex", alignItems: "center" }}
              asChild
            >
              <div className="flex items-center gap-1">
                Console
                <ExternalLink className="h-3 w-3" />
              </div>
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
            You are connected to AWS S3 for cloud storage
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await refreshSettings();
              toast.success("Disconnected from AWS S3");
            }}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
      <div className="flex flex-col items-start justify-between">
        <h2 className="text-lg font-medium pb-1 flex items-center gap-2">
          <Cloud className="h-5 w-5 text-orange-500" />
          AWS S3
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Amazon S3 provides scalable object storage with high durability and availability.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleAwsS3Connect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.scalix.world/api/integrations/aws-s3/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-aws-s3-button"
        >
          Connect to AWS S3
        </Button>
      </div>
    </div>
  );
}
