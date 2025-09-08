import log from "electron-log";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("resend_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerResendHandlers() {
  testOnlyHandle("resend:fake-connect", async (event) => {
    logger.info("Simulating Resend OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "resend-oauth-return",
      url: "https://oauth.crea.ai/api/integrations/resend/login",
    });
    logger.info("Sent fake resend deep-link-received event during testing.");
  });
}
