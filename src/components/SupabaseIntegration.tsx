import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DatabaseZap, ExternalLink } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { showSuccess, showError } from "@/lib/toast";
import { IpcClient } from "@/ipc/ipc_client";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { useEffect } from "react";

export function SupabaseIntegration() {
  const { settings, updateSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "supabase-oauth-return") {
        await updateSettings({}); // Refresh settings
        showSuccess("Successfully connected to Supabase!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  const handleDisconnectFromSupabase = async () => {
    setIsDisconnecting(true);
    try {
      // Clear the entire supabase object in settings
      const result = await updateSettings({
        supabase: undefined,
        // Also disable the migration setting on disconnect
        enableSupabaseWriteSqlMigration: false,
      });
      if (result) {
        showSuccess("Successfully disconnected from Supabase");
      } else {
        showError("Failed to disconnect from Supabase");
      }
    } catch (err: any) {
      showError(
        err.message || "An error occurred while disconnecting from Supabase",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleMigrationSettingChange = async (enabled: boolean) => {
    try {
      await updateSettings({
        enableSupabaseWriteSqlMigration: enabled,
      });
      showSuccess("Setting updated");
    } catch (err: any) {
      showError(err.message || "Failed to update setting");
    }
  };

  // Check if there's any Supabase accessToken to determine connection status
  const isConnected = !!settings?.supabase?.accessToken;

  if (isConnected) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1 flex items-center gap-2">
              <DatabaseZap className="h-5 w-5 text-green-500" />
              Supabase
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://supabase.com/dashboard",
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
            You are connected to Supabase for database management and real-time features.
          </p>
          <div className="w-full space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnectFromSupabase}
              disabled={isDisconnecting}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
            <div className="flex items-center space-x-3 pt-2 border-t">
              <Switch
                id="supabase-migrations"
                checked={!!settings?.enableSupabaseWriteSqlMigration}
                onCheckedChange={handleMigrationSettingChange}
              />
              <div className="space-y-1">
                <Label
                  htmlFor="supabase-migrations"
                  className="text-sm font-medium"
                >
                  Write SQL migration files
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Generate SQL migration files when modifying your schema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
      <div className="flex flex-col items-start justify-between">
        <h2 className="text-lg font-medium pb-1 flex items-center gap-2">
          <DatabaseZap className="h-5 w-5 text-green-500" />
          Supabase
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Connect to Supabase for PostgreSQL database, real-time subscriptions, and backend features.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleSupabaseConnect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.crea.sh/api/integrations/supabase/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-supabase-button"
        >
          Connect to Supabase
        </Button>
      </div>
    </div>
  );
}

