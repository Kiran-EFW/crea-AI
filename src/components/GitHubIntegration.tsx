import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { showSuccess, showError } from "@/lib/toast";
import { IpcClient } from "@/ipc/ipc_client";
import { useDeepLink } from "@/contexts/DeepLinkContext";

export function GitHubIntegration() {
  const { settings, updateSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "github-oauth-return") {
        await updateSettings({});
        showSuccess("Successfully connected to GitHub!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  const handleDisconnectFromGithub = async () => {
    setIsDisconnecting(true);
    try {
      const result = await updateSettings({
        githubAccessToken: undefined,
      });
      if (result) {
        showSuccess("Successfully disconnected from GitHub");
      } else {
        showError("Failed to disconnect from GitHub");
      }
    } catch (err: any) {
      showError(
        err.message || "An error occurred while disconnecting from GitHub",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = !!settings?.githubAccessToken;

  if (isConnected) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1 flex items-center gap-2">
              <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              GitHub
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://github.com/",
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
            You are connected to GitHub for version control and collaboration.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnectFromGithub}
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
          <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          GitHub
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Connect to GitHub for version control, collaboration, and repository management.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleGithubConnect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.crea.sh/api/integrations/github/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-github-button"
        >
          Connect to GitHub
        </Button>
      </div>
    </div>
  );
}

