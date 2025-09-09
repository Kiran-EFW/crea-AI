import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import { IpcClient } from "@/ipc/ipc_client";
import { useGitHubConnection } from "@/hooks/useGitHubConnection";

export function GitHubIntegration() {
  const { globalConnection, startOAuthFlow, disconnect } = useGitHubConnection();

  const handleConnectToGithub = async () => {
    await startOAuthFlow();
  };

  if (globalConnection.isConnected) {
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
            {globalConnection.userEmail && (
              <span className="block mt-1 font-medium">{globalConnection.userEmail}</span>
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnect}
            disabled={globalConnection.isConnecting}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            {globalConnection.isConnecting ? "Disconnecting..." : "Disconnect"}
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
          onClick={handleConnectToGithub}
          disabled={globalConnection.isConnecting}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-github-button"
        >
          {globalConnection.isConnecting ? "Connecting..." : "Connect to GitHub"}
        </Button>
        {globalConnection.error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {globalConnection.error}
          </p>
        )}
        {globalConnection.statusMessage && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {globalConnection.statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}

