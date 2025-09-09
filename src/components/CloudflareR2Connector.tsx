import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { ExternalLink, Cloud } from "lucide-react";

export function CloudflareR2Connector() {
  const { settings, refreshSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "cloudflare-r2-oauth-return") {
        await refreshSettings();
        toast.success("Successfully connected to Cloudflare R2!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  if (settings?.cloudflare?.accessKeyId) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1 flex items-center gap-2">
              <Cloud className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-900 dark:text-white">Cloudflare R2</span>
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://dash.cloudflare.com/",
                );
              }}
              className="ml-2 px-2 py-1 h-8 mb-2"
              style={{ display: "inline-flex", alignItems: "center" }}
              asChild
            >
              <div className="flex items-center gap-1">
                Dashboard
                <ExternalLink className="h-3 w-3" />
              </div>
            </Button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
            You are connected to Cloudflare R2 for cloud storage
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await refreshSettings();
              toast.success("Disconnected from Cloudflare R2");
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
          <Cloud className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <span className="text-gray-900 dark:text-white">Cloudflare R2</span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Cloudflare R2 offers S3-compatible object storage with global distribution and generous free tier.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleCloudflareR2Connect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.scalix.world/api/integrations/cloudflare-r2/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-cloudflare-r2-button"
        >
          Connect to Cloudflare R2
        </Button>
      </div>
    </div>
  );
}
