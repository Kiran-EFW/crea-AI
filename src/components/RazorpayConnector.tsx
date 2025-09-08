import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IpcClient } from "@/ipc/ipc_client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { useDeepLink } from "@/contexts/DeepLinkContext";
import { ExternalLink } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function RazorpayConnector() {
  const { settings, refreshSettings } = useSettings();
  const { lastDeepLink } = useDeepLink();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleDeepLink = async () => {
      if (lastDeepLink?.type === "razorpay-oauth-return") {
        await refreshSettings();
        toast.success("Successfully connected to Razorpay!");
      }
    };
    handleDeepLink();
  }, [lastDeepLink]);

  if (settings?.razorpay?.accessToken) {
    return (
      <div className="flex flex-col space-y-4 p-4 border bg-white dark:bg-gray-800 max-w-100 rounded-md">
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-medium pb-1">Razorpay</h2>
            <Button
              variant="outline"
              onClick={() => {
                IpcClient.getInstance().openExternalUrl(
                  "https://dashboard.razorpay.com/",
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
            You are connected to Razorpay for payment processing
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              // TODO: Implement disconnect functionality
              await refreshSettings();
              toast.success("Disconnected from Razorpay");
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
        <h2 className="text-lg font-medium pb-1">Razorpay</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 pb-3">
          Razorpay provides payment solutions for India with support for cards, UPI, net banking, and wallets.
        </p>
        <Button
          onClick={async () => {
            if (settings?.isTestMode) {
              await IpcClient.getInstance().fakeHandleRazorpayConnect();
            } else {
              await IpcClient.getInstance().openExternalUrl(
                "https://oauth.crea.sh/api/integrations/razorpay/login",
              );
            }
          }}
          className="w-auto h-10 cursor-pointer flex items-center justify-center px-4 py-2 rounded-md border-2 transition-colors font-medium text-sm dark:bg-gray-900 dark:border-gray-700"
          data-testid="connect-razorpay-button"
        >
          <span className="mr-2">Connect to</span>
          <RazorpaySvg isDarkMode={isDarkMode} />
        </Button>
      </div>
    </div>
  );
}

function RazorpaySvg({
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
      width="80"
      height="18"
      fill="none"
      viewBox="0 0 120 28"
      className={className}
    >
      <rect width="18" height="18" x="0" y="5" fill="#3395ff" rx="2"/>
      <circle cx="9" cy="14" r="6" fill="#fff"/>
      <circle cx="9" cy="14" r="3" fill="#3395ff"/>
      <text
        x="24"
        y="18"
        fontSize="14"
        fontFamily="Arial, sans-serif"
        fontWeight="600"
        fill={textColor}
      >
        Razorpay
      </text>
    </svg>
  );
}
