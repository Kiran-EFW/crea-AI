import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { showSuccess, showError } from "@/lib/toast";
import { IpcClient } from "@/ipc/ipc_client";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { useEffect } from "react";

export function VercelIntegration() {
  const { settings, updateSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "vercel-oauth-return") {
        await updateSettings({}); // Refresh settings
        showSuccess("Successfully connected to Vercel!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  const handleDisconnectFromVercel = async () => {
    setIsDisconnecting(true);
    try {
      const result = await updateSettings({
        vercelAccessToken: undefined,
      });
      if (result) {
        showSuccess("Successfully disconnected from Vercel");
      } else {
        showError("Failed to disconnect from Vercel");
      }
    } catch (err: any) {
      showError(
        err.message || "An error occurred while disconnecting from Vercel",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = !!settings?.vercelAccessToken;

  if (isConnected) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1 flex items-center gap-2">
              <svg className="h-5 w-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 22.525H0l12-21.05 12 21.05z" />
              </svg>
              Vercel
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://vercel.com/dashboard",
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
            You are connected to Vercel for deployment and hosting.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnectFromVercel}
            disabled={isDisconnecting}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
      <div className="flex flex-col items-start justify-between">
        <h2 className="text-lg font-medium pb-1 flex items-center gap-2">
          <svg className="h-5 w-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 22.525H0l12-21.05 12 21.05z" />
          </svg>
          Vercel
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Connect to Vercel for fast, reliable deployments and hosting with global CDN.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleVercelConnect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.scalix.world/api/integrations/vercel/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-vercel-button"
        >
          Connect to Vercel
        </Button>
      </div>
    </div>
  );
}

