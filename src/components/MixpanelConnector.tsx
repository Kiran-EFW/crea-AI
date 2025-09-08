import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { ExternalLink, BarChart3 } from "lucide-react";

export function MixpanelConnector() {
  const { settings, refreshSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "mixpanel-oauth-return") {
        await refreshSettings();
        toast.success("Successfully connected to Mixpanel!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  if (settings?.mixpanel?.projectToken) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1">Mixpanel</h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://mixpanel.com/",
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
            You are connected to Mixpanel for analytics
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await refreshSettings();
              toast.success("Disconnected from Mixpanel");
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
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Mixpanel
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Mixpanel provides powerful product analytics to understand user behavior and engagement.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleMixpanelConnect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.crea.sh/api/integrations/mixpanel/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-mixpanel-button"
        >
          Connect to Mixpanel
        </Button>
      </div>
    </div>
  );
}
