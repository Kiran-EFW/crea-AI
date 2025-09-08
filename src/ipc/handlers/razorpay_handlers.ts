import log from "electron-log";
import { ipcMain } from "electron";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("razorpay_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerRazorpayHandlers() {
  testOnlyHandle("razorpay:fake-connect", async (event) => {
    // Simulate OAuth return with fake data
    logger.info("Simulating Razorpay OAuth connection for testing");

    // Simulate the deep link event
    event.sender.send("deep-link-received", {
      type: "razorpay-oauth-return",
      url: "https://oauth.crea.ai/api/integrations/razorpay/login",
    });
    logger.info("Sent fake razorpay deep-link-received event during testing.");
  });
}
