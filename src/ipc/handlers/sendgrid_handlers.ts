import log from "electron-log";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("sendgrid_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerSendGridHandlers() {
  testOnlyHandle("sendgrid:fake-connect", async (event) => {
    logger.info("Simulating SendGrid OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "sendgrid-oauth-return",
      url: "https://oauth.scalix.world/api/integrations/sendgrid/login",
    });
    logger.info("Sent fake sendgrid deep-link-received event during testing.");
  });
}
