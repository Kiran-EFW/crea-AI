import log from "electron-log";
import { ipcMain } from "electron";
import { createTestOnlyLoggedHandler } from "./safe_handle";

export const logger = log.scope("mixpanel_handlers");
const testOnlyHandle = createTestOnlyLoggedHandler(logger);

export function registerMixpanelHandlers() {
  testOnlyHandle("mixpanel:fake-connect", async (event) => {
    logger.info("Simulating Mixpanel OAuth connection for testing");
    event.sender.send("deep-link-received", {
      type: "mixpanel-oauth-return",
      url: "https://oauth.crea.ai/api/integrations/mixpanel/login",
    });
    logger.info("Sent fake mixpanel deep-link-received event during testing.");
  });
}
