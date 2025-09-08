import log from "electron-log";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("stripe_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerStripeHandlers() {
  testOnlyHandle("stripe:fake-connect", async (event) => {
    // Simulate OAuth return with fake data
    logger.info("Simulating Stripe OAuth connection for testing");

    // Simulate the deep link event
    event.sender.send("deep-link-received", {
      type: "stripe-oauth-return",
      url: "https://oauth.crea.ai/api/integrations/stripe/login",
    });
    logger.info("Sent fake stripe deep-link-received event during testing.");
  });
}
