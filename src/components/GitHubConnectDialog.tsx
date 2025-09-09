import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Plus, Link } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IpcClient } from "@/ipc/ipc_client";
import { showError } from "@/lib/toast";

interface GitHubConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitHubConnectDialog({ isOpen, onClose }: GitHubConnectDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectExisting = async () => {
    try {
      setIsConnecting(true);
      // TODO: Implement GitHub OAuth flow for connecting existing repo
      // This would typically involve:
      // 1. GitHub OAuth authorization
      // 2. Repository selection dialog
      // 3. Cloning/importing the repo into Scalix

      await IpcClient.getInstance().openExternalUrl("https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=repo");
      showError("GitHub OAuth integration coming soon! This will allow you to connect existing repositories.");
    } catch (error) {
      console.error("Failed to connect to GitHub:", error);
      showError("Failed to connect to GitHub. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      setIsConnecting(true);
      // TODO: Implement GitHub OAuth flow for creating new repo
      // This would typically involve:
      // 1. GitHub OAuth authorization
      // 2. Repository creation dialog (name, description, visibility)
      // 3. Initializing the repo with Scalix template

      await IpcClient.getInstance().openExternalUrl("https://github.com/new");
      showError("GitHub repository creation integration coming soon! This will help you create new repositories.");
    } catch (error) {
      console.error("Failed to create GitHub repo:", error);
      showError("Failed to create GitHub repository. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Connect GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to work with GitHub repositories in Scalix.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            onClick={handleConnectExisting}
            disabled={isConnecting}
            variant="outline"
            className="w-full h-auto p-4 flex items-start gap-3 hover:bg-blue-50 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800"
          >
            <Link className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium text-sm leading-tight">Connect Existing Repo</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Import your existing GitHub projects
              </div>
            </div>
          </Button>

          <Button
            onClick={handleCreateNew}
            disabled={isConnecting}
            variant="outline"
            className="w-full h-auto p-4 flex items-start gap-3 hover:bg-green-50 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800"
          >
            <Plus className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-left min-w-0 flex-1">
              <div className="font-medium text-sm leading-tight">Create New Repository</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Start fresh with a new GitHub project
              </div>
            </div>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          GitHub integration requires OAuth setup. Coming soon! 🚀
        </div>
      </DialogContent>
    </Dialog>
  );
}
