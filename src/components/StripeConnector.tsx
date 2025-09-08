import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { ExternalLink } from "lucide-react";

export function StripeConnector() {
  const { settings, refreshSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "stripe-oauth-return") {
        await refreshSettings();
        toast.success("Successfully connected to Stripe!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  if (settings?.stripe?.accessToken) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1">Stripe</h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://dashboard.stripe.com/",
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
            You are connected to Stripe for payment processing
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              // TODO: Implement disconnect functionality
              await refreshSettings();
              toast.success("Disconnected from Stripe");
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
        <h2 className="text-lg font-medium pb-1">Stripe</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Stripe offers a complete payments platform with support for cards, digital wallets, and more.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleStripeConnect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.crea.sh/api/integrations/stripe/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-stripe-button"
        >
          <span className="mr-2">Connect to</span>
          <StripeSvg isDarkMode={false} />
        </Button>
      </div>
    </div>
  );
}

function StripeSvg({
  isDarkMode,
  className,
}: {
  isDarkMode?: boolean;
  className?: string;
}) {
  const textColor = isDarkMode ? "#fff" : "#000";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="18"
      fill="none"
      viewBox="0 0 90 28"
      className={className}
    >
      <path
        fill="#635bff"
        d="M14.4 0C6.48 0 0 6.48 0 14.4s6.48 14.4 14.4 14.4 14.4-6.48 14.4-14.4S22.32 0 14.4 0zm-.96 21.6c-1.92 0-3.36-1.44-3.36-3.36s1.44-3.36 3.36-3.36 3.36 1.44 3.36 3.36-1.44 3.36-3.36 3.36zm0-9.6c-1.92 0-3.36-1.44-3.36-3.36s1.44-3.36 3.36-3.36 3.36 1.44 3.36 3.36-1.44 3.36-3.36 3.36z"
      />
      <text
        x="32"
        y="18"
        fontSize="14"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fill={textColor}
      >
        Stripe
      </text>
    </svg>
  );
}
