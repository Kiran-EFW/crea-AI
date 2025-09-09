import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderOpen, Plus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IpcClient } from "@/ipc/ipc_client";
import { showError } from "@/lib/toast";
import { generateCuteAppName } from "@/lib/utils";

interface ScalixAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAppCreated: (appId: number, chatId: string) => void;
}

export function ScalixAppDialog({ isOpen, onClose, onAppCreated }: ScalixAppDialogProps) {
  const [appName, setAppName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectFolder = async () => {
    try {
      const result = await IpcClient.getInstance().selectAppFolder();
      if (result.path) {
        setSelectedFolder(result.path);
        // Auto-generate app name from folder name if not already set
        if (!appName) {
          const folderName = result.path.split(/[/\\]/).pop() || "";
          setAppName(folderName || generateCuteAppName());
        }
      }
    } catch (error) {
      console.error("Failed to select folder:", error);
      showError("Failed to select folder. Please try again.");
    }
  };

  const handleCreateApp = async () => {
    const finalAppName = appName.trim() || generateCuteAppName();

    if (!selectedFolder) {
      showError("Please select a folder to save your app.");
      return;
    }

    try {
      setIsCreating(true);

      // Create the app
      const result = await IpcClient.getInstance().createApp({
        name: finalAppName,
        path: selectedFolder,
      });

      onAppCreated(result.app.id, result.chatId.toString());
      onClose();

      // Reset form
      setAppName("");
      setSelectedFolder("");

    } catch (error) {
      console.error("Failed to create app:", error);
      showError("Failed to create app. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateName = () => {
    setAppName(generateCuteAppName());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New App
          </DialogTitle>
          <DialogDescription>
            Set up a new project and choose where to save it on your local machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* App Name Input */}
          <div className="space-y-2">
            <Label htmlFor="app-name">App Name</Label>
            <div className="flex gap-2">
              <Input
                id="app-name"
                placeholder="Enter app name..."
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateName}
                className="px-3"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <Label>Project Location</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Select a folder..."
                value={selectedFolder}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectFolder}
                className="px-3"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
            {selectedFolder && (
              <p className="text-xs text-muted-foreground">
                Files will be saved to: {selectedFolder}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateApp}
            className="flex-1"
            disabled={isCreating || !selectedFolder}
          >
            {isCreating ? "Creating..." : "Create App"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}