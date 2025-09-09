import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useGitHubConnection } from "@/hooks/useGitHubConnection";

export function GitHubConnectButton() {
  const { globalConnection, startOAuthFlow } = useGitHubConnection();

  const handleConnect = async () => {
    await startOAuthFlow();
  };

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleConnect}
      disabled={globalConnection.isConnected || globalConnection.isConnecting}
      className="flex items-center gap-2 px-6 py-3 h-auto w-full bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900 border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-800 dark:hover:to-slate-800"
    >
      <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      <span className="font-medium">
        {globalConnection.isConnected
          ? "GitHub Connected"
          : globalConnection.isConnecting
          ? "Connecting..."
          : "Connect GitHub Repo"}
      </span>
    </Button>
  );
}
