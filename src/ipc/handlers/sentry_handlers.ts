import log from "electron-log";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("sentry_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerSentryHandlers() {
  testOnlyHandle("sentry:fake-connect", async (event) => {
    logger.info("Simulating Sentry OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "sentry-oauth-return",
      url: "https://oauth.scalix.world/api/integrations/sentry/login",
    });
    logger.info("Sent fake sentry deep-link-received event during testing.");
  });
}
